/**
 * sync_scholar.cjs — 논문 데이터 통합 동기화 스크립트
 *
 * 기준 소스 2곳을 publications.json과 대조한다:
 *   1. Google Sites (in Press/Review 섹션 + 게재 섹션) → 진행 중 논문의 상태/학술지 변경 감지,
 *      제목이 바뀐 채 출판된 논문 탐지
 *   2. Google Scholar 프로필                          → 신규 출판 논문 수집, 진행 중 → 출판 전환
 * 추가로 constants.tsx의 PUBLICATIONS(주요 논문)와 json의 정합성을 검사한다(보고만).
 *
 * 사용법:
 *   node scripts/sync_scholar.cjs           # 보고서만 출력 (파일 변경 없음)
 *   node scripts/sync_scholar.cjs --apply   # publications.json + PUBLICATIONS_UPDATED_AT 반영
 *
 * 종료 코드 규약 (워크플로가 이 값으로 분기한다):
 *   0 — 정상. 두 소스 모두 수집 성공.
 *   2 — 부분 성공. Google Sites 기반 작업은 끝냈으나 Scholar 수집이 실패해 일부 작업을 건너뜀.
 *       --apply였다면 publications.json은 이미 저장된 상태이므로 커밋·PR을 계속 진행해야 한다.
 *   1 — 치명적 실패. Sites 수집/파싱 실패나 저장 후 검증 실패 등 반영할 근거가 없는 경우. 반영 없음.
 */
const fs = require('fs');
const path = require('path');
const {
  PROFILES,
  SITES_URL,
  decodeHtml,
  stripTags,
  normalize,
  titlesMatch,
  renameCandidate,
  isJunkTitle,
  hasPiAuthor,
  venuesMatch,
  scholarCitationUrl,
  PREPRINT_VENUE,
  FetchError,
  fetchText,
  compactTextFromHtml,
  sleep,
} = require('./lib.cjs');

const JSON_PATH = path.join(__dirname, '..', 'src', 'data', 'publications.json');
const CONSTANTS_PATH = path.join(__dirname, '..', 'src', 'constants.tsx');
const SITES_PROFESSOR = 'Seungmin Rho'; // Google Sites in-review 섹션은 Rho 교수 논문만 다룸
const AUTO_ADD_PROFILES = ['Seungmin Rho']; // 신규 논문 자동 추가 대상 (그 외 교수는 보고만 — 동명이인 혼입 방지)
const MAX_DETAIL_FETCHES = 20; // 런당 Scholar 상세 페이지 요청 상한 (차단 방지)
const MIN_AUTO_ADD_YEAR = 2023; // 이보다 오래된 Scholar 행은 신규가 아니라 누락/오염으로 보고 자동 추가하지 않음
const MAX_RENAME_CANDIDATES = 3; // 제목 변경 후보는 상위 몇 건만 보고 (사람이 고를 수 있는 분량)
// 연도 미상은 '너무 오래된 논문'과 사유가 다르다 — 200건 넘는 제외 목록에 섞이면 아무도 못 본다.
// 실제로 게재된 ECCV-26 워크숍 논문 1건이 그 목록에 묻혀 있었다. 보고서에서 버킷을 나눈다.
const UNKNOWN_YEAR_REASON = '연도 미상 (Scholar에 출판연도 없음)';
// 논문이 아닌 레코드(환영사/위원회 명단/특집호 서문)·철회 논문 판별은 lib.cjs의 isJunkTitle 사용

const EXIT_OK = 0;
const EXIT_FATAL = 1;
const EXIT_PARTIAL = 2;

const APPLY = process.argv.includes('--apply');

// ──────────────────────────────────────────────
// Step A. Google Sites — in Press/Review 섹션 파싱
// ──────────────────────────────────────────────
const JCR_BRACKET = /(?:S?SCIE|SSCI)[^\]]*\d+(?:\.\d+)?%/i;
const STATUS_LINE = /^(.+?)\s*\(([^()]*20\d{2})\)$/; // "Journal Name (Submitted, June 2026)"
const STATUS_WORDS = /submit|revision|review|press|proofing|accept/i;
// Google Sites의 실제 섹션 헤딩 — 예: "[Journal] Publications (in Google Scholar)"
const SECTION_HEADING = /\[(?:Journal|Conference|Domestic)\]\s*Publications(?:\s*\([^)\n]*\))?/i;
// 게재 완료 학술지 섹션 헤딩 — in-review 섹션 바로 다음에 온다.
const PUBLISHED_HEADING = /\[Journal\]\s*Publications\s*\(\s*in Google Scholar\s*\)/i;

// 항목 구조 (3줄): "[JCR]? 제목 [펀딩태그]*" / "저자" / "학술지 (상태·권호, 월 연도)"
// 마지막 줄을 앵커로 역방향 파싱한다. in-review 구역과 게재 구역이 같은 구조라 둘 다 이 함수로 읽는다.
function parseSiteEntries(section, { requireStatusWords }) {
  const lines = section.split('\n').map(l => l.trim()).filter(Boolean);
  const entries = [];

  for (let i = 2; i < lines.length; i++) {
    const statusMatch = lines[i].match(STATUS_LINE);
    if (!statusMatch) continue;
    if (requireStatusWords && !STATUS_WORDS.test(statusMatch[2])) continue;

    const author = lines[i - 1];
    const titleLine = lines[i - 2];
    const brackets = [...titleLine.matchAll(/\[([^\]]+)\]/g)].map(m => m[1].trim());
    const title = titleLine.replace(/\[[^\]]*\]/g, ' ').replace(/^\d+\.\s*/, '').replace(/\s+/g, ' ').trim();
    if (title.length < 15) continue;

    entries.push({
      title,
      author,
      journal: statusMatch[1].trim(),
      status: statusMatch[2].trim(),
      year: (statusMatch[2].match(/20\d{2}/) || [null])[0],
      funding_tags: brackets.filter(b => !JCR_BRACKET.test(b)),
      jcrLabel: brackets.find(b => JCR_BRACKET.test(b)) || null,
    });
  }
  return entries;
}

/**
 * Google Sites 한 번 읽어 두 구역을 모두 돌려준다.
 *  - inProgress: in Press/Proofing/in Review 구역 (필수 — 실패하면 대조할 근거가 없으므로 throw)
 *  - published : 게재 구역 (제목 변경 탐지용 보조 자료 — 실패해도 publishedError로만 알리고 진행)
 */
async function fetchSites() {
  const text = compactTextFromHtml(await fetchText(SITES_URL, { label: 'Google Sites' })).replace(/[“”]/g, '"'); // 굽은따옴표 정규화

  // in-review 섹션만 잘라내기: 섹션 제목부터 다음 섹션 헤딩 전까지.
  // 종료 경계는 반드시 실제 헤딩("[Journal] Publications (in Google Scholar)" 형태)이어야 한다.
  // 예전처럼 'International Journal' 같은 본문 문자열을 경계로 쓰면 학술지명에 걸려
  // 출판 구역의 'Accepted' 항목까지 진행 중으로 잘못 파싱된다(관찰된 오탐 2건).
  const start = text.search(/in Press,?\s*Proofing,?\s*(?:or\s*)?in Review/i);
  if (start === -1) throw new Error('Google Sites에서 in-review 섹션을 찾지 못함');
  const rest = text.slice(start);
  const endMatch = rest.slice(10).search(SECTION_HEADING);
  if (endMatch === -1) {
    // 경계를 못 찾으면 문서 끝까지가 in-review로 잡혀 출판 논문 전체가 오염된다 — 파싱을 중단한다.
    throw new Error('Google Sites에서 in-review 섹션의 종료 헤딩을 찾지 못함 (페이지 구조 변경 확인 필요)');
  }
  const inProgress = parseSiteEntries(rest.slice(0, endMatch + 10), { requireStatusWords: true });

  // 게재 구역은 헤딩부터 문서 끝까지. 상태 단어가 없는 줄("ICT Express. 12(1), 13-19 (Feb. 2026)")도 받아야
  // 하므로 requireStatusWords를 끈다.
  let published = [];
  let publishedError = null;
  const publishedStart = text.search(PUBLISHED_HEADING);
  if (publishedStart === -1) {
    publishedError = '게재 섹션 헤딩을 찾지 못함 (페이지 구조 변경 확인 필요)';
  } else {
    published = parseSiteEntries(text.slice(publishedStart), { requireStatusWords: false });
    // 헤딩은 찾았는데 0건이면 줄 구조가 바뀐 것이다 — 조용히 빈 결과로 넘기지 않는다.
    if (!published.length) publishedError = '게재 섹션에서 항목을 하나도 파싱하지 못함 (줄 구조 변경 확인 필요)';
  }

  return { inProgress, published, publishedError };
}

// ──────────────────────────────────────────────
// Step B. Google Scholar — 프로필 행 + 상세 페이지
// ──────────────────────────────────────────────
async function fetchScholarRows(userId, name) {
  const rows = [];
  for (let cstart = 0; cstart < 1000; cstart += 100) {
    const url = `https://scholar.google.com/citations?user=${userId}&hl=en&cstart=${cstart}&pagesize=100&sortby=pubdate`;
    const html = await fetchText(url, { label: `Scholar ${name} (cstart=${cstart})` });
    const matches = [...html.matchAll(/<tr[^>]*class="gsc_a_tr"[\s\S]*?<\/tr>/g)].map(m => m[0]);
    if (matches.length === 0) {
      // 첫 페이지가 0행이면 프로필이 빈 게 아니라 차단 페이지(HTTP 200 + 캡차)나 HTML 구조 변경이다.
      // 여기서 그냥 break하면 "Scholar에 아무것도 없음"이 정상처럼 보여 조용한 성공이 된다.
      if (cstart === 0) throw new Error(`Scholar 프로필에서 행을 하나도 파싱하지 못함 (차단 페이지 또는 HTML 구조 변경): ${name}`);
      break; // 2페이지 이후의 0행은 목록 끝
    }

    for (const row of matches) {
      const anchor = (row.match(/<a[^>]*class="gsc_a_at"[^>]*>/) || [''])[0];
      const href = (anchor.match(/href="([^"]+)"/) || [])[1];
      const title = decodeHtml(stripTags((row.match(/class="gsc_a_at">([\s\S]*?)<\/a>/) || [])[1] || '')).trim();
      const year = (row.match(/class="gsc_a_y"[^>]*>[\s\S]*?(\d{4})/) || [])[1] || '';
      // 행의 첫 gs_gray는 저자 목록(축약형) — 제목 변경 후보 판정의 저자 신호로 쓴다.
      const author = decodeHtml(stripTags((row.match(/class="gs_gray">([\s\S]*?)<\/div>/) || [])[1] || '')).trim();
      if (title) rows.push({ title, year, author, href: href ? decodeHtml(href) : null });
    }
    await sleep(400);
  }
  // 행은 찾았는데 제목을 하나도 못 뽑았다면 앵커 구조가 바뀐 것이다. 여기서 빈 배열을 돌려주면
  // "신규 논문 0건"이 정상처럼 보인다 — 위의 0행 가드와 같은 이유로 실패로 처리한다.
  if (!rows.length) throw new Error(`Scholar 행에서 제목을 하나도 뽑지 못함 (앵커 HTML 구조 변경 확인 필요): ${name}`);
  return rows;
}

async function fetchScholarDetail(href) {
  const html = await fetchText('https://scholar.google.com' + href, { label: 'Scholar 상세' });
  const fields = {};
  for (const m of html.matchAll(/<div class="gsc_oci_field">([^<]+)<\/div><div class="gsc_oci_value"[^>]*>([\s\S]*?)<\/div>/g)) {
    fields[m[1].trim()] = decodeHtml(stripTags(m[2])).trim();
  }
  return fields;
}

// BibTeX 값에서 특수문자를 이스케이프한다 (`&`가 그대로 들어가면 LaTeX에서 깨진다)
function escapeBib(value) {
  return String(value || '').replace(/([&%$#_])/g, '\\$1');
}

// 이미 쓰인 bibtex 키를 모아 두고 충돌 시 a, b, c… 접미사를 붙인다
function uniqueBibKey(key, usedKeys) {
  if (!usedKeys.has(key)) {
    usedKeys.add(key);
    return key;
  }
  for (let i = 0; i < 26; i++) {
    const candidate = `${key}${String.fromCharCode(97 + i)}`;
    if (!usedKeys.has(candidate)) {
      usedKeys.add(candidate);
      return candidate;
    }
  }
  const fallback = `${key}${usedKeys.size}`;
  usedKeys.add(fallback);
  return fallback;
}

// Scholar 상세 필드 → BibTeX. Authors가 없으면 저자 없는 항목이 만들어지므로 null을 반환한다.
function buildBibtex(title, fields, usedKeys) {
  // Scholar는 저자를 반각/전각 쉼표와 세미콜론이 섞인 형태로 준다
  const authors = (fields['Authors'] || '').split(/[,，;；]/).map(a => a.trim()).filter(Boolean);
  if (!authors.length) return null;

  const year = ((fields['Publication date'] || '').match(/20\d{2}|19\d{2}/) || [''])[0];
  const venueKey = ['Journal', 'Conference', 'Book', 'Source'].find(k => fields[k]);
  const venue = venueKey ? fields[venueKey] : '';
  // 학회는 @inproceedings, 학술지/책이 아니거나 프리프린트면 @misc
  const isConf = venueKey === 'Conference';
  const isMisc = !venue || PREPRINT_VENUE.test(venue);
  const entryType = isMisc ? 'misc' : isConf ? 'inproceedings' : 'article';

  const firstAuthorLast = (authors[0] || 'unknown').split(' ').pop().toLowerCase().replace(/[^a-z]/g, '') || 'unknown';
  const firstWord = (title.match(/[A-Za-z]{3,}/) || ['paper'])[0].toLowerCase();
  const key = uniqueBibKey(`${firstAuthorLast}${year || ''}${firstWord}`, usedKeys);

  const lines = [
    `@${entryType}{${key},`,
    `  title={${escapeBib(title)}},`,
    `  author={${authors.map(escapeBib).join(' and ')}},`,
  ];
  if (venue) {
    const venueField = isMisc ? 'howpublished' : isConf ? 'booktitle' : 'journal';
    lines.push(`  ${venueField}={${escapeBib(venue)}},`);
  }
  if (fields['Volume']) lines.push(`  volume={${escapeBib(fields['Volume'])}},`);
  if (fields['Issue']) lines.push(`  number={${escapeBib(fields['Issue'])}},`);
  if (fields['Pages']) lines.push(`  pages={${escapeBib(fields['Pages']).replace(/-/g, '--')}},`);
  if (fields['Publisher']) lines.push(`  publisher={${escapeBib(fields['Publisher'])}},`);
  if (year) lines.push(`  year={${year}}`);
  let bib = lines.join('\n');
  if (bib.endsWith(',')) bib = bib.slice(0, -1);
  return bib + '\n}';
}

// json에 이미 있는 bibtex 키를 모아 신규 생성분과의 충돌을 막는다
function collectBibKeys(data) {
  const keys = new Set();
  for (const pubs of Object.values(data)) {
    for (const pub of pubs) {
      const key = ((pub.bibtex || '').match(/^@\w+\{([^,]+),/m) || [])[1];
      if (key) keys.add(key.trim());
    }
  }
  return keys;
}

// ──────────────────────────────────────────────
// Step C-2. 제목 변경 탐지 — 투고 제목이 손질된 채 출판된 논문 찾기
// ──────────────────────────────────────────────
/**
 * Sites in-review 목록에서 사라졌고 Scholar에서도 엄격 매칭이 안 된 진행 중 논문 하나를 받아,
 * 후보 풀(Sites 게재 항목 + Scholar 행)에서 "제목만 바뀐 같은 논문"을 찾는다.
 *
 * 자동 반영하지 않고 보고만 한다 — 서로 다른 논문을 합치면 데이터가 되돌릴 수 없이 깨진다.
 * knownNorms(json에 이미 있는 제목들)를 받는 이유: 학회 논문의 저널 확장본처럼 제목·저자가
 * 매우 비슷하지만 별개로 등재된 논문을 후보에서 빼기 위함이다. 이미 json에 독립 항목으로 있는
 * 논문은 정의상 "이름이 바뀐 그 논문"일 수 없다.
 */
function findRenameCandidates(paper, pool, knownNorms) {
  const selfNorm = normalize(paper.title);
  const hits = [];

  for (const candidate of pool) {
    const candidateNorm = normalize(candidate.title);
    if (!candidateNorm || titlesMatch(selfNorm, candidateNorm)) continue;
    if (isJunkTitle(candidate.title)) continue;
    if (knownNorms.some(known => known !== selfNorm && titlesMatch(known, candidateNorm))) continue;

    const verdict = renameCandidate(paper, candidate);
    // low는 제목만 어렴풋이 비슷하고 저자 근거가 없는 수준이라 사람이 판단할 재료가 못 된다.
    if (!verdict || verdict.confidence === 'low') continue;
    hits.push({ candidate, verdict });
  }

  return hits.sort((a, b) => b.verdict.title.dice - a.verdict.title.dice).slice(0, MAX_RENAME_CANDIDATES);
}

// ──────────────────────────────────────────────
// Step C-3. constants.tsx 정합성 검사 (보고만)
// ──────────────────────────────────────────────
function checkConstants(constantsSrc, data) {
  const issues = [];
  // `export const PUBLICATIONS_UPDATED_AT`이 파일 앞쪽에 있어 접두사만으로 찾으면 그쪽에 먼저 걸린다.
  // 배열 선언 형태까지 명시해야 실제 PUBLICATIONS 배열을 잡는다.
  const block = (constantsSrc.match(/export const PUBLICATIONS\b(?!_)[^=\n]*=\s*\[[\s\S]*?\n\];/) || [''])[0];
  if (!block) throw new Error('constants.tsx에서 PUBLICATIONS 배열을 찾지 못함 (정합성 검사 불가)');
  const entryRe = /id:\s*'(p\d+)'[\s\S]*?title:\s*"([^"]+)"[\s\S]*?venue:\s*"([^"]+)"/g;

  const allPubs = Object.values(data).flat();
  let matchedEntries = 0;
  for (const m of block.matchAll(entryRe)) {
    matchedEntries += 1;
    const [, id, title, venue] = m;
    const entryBlock = block.slice(m.index, m.index + 900);
    const status = (entryBlock.match(/status:\s*"([^"]+)"/) || [])[1] || null;
    const norm = normalize(title);
    const found = allPubs.find(p => titlesMatch(normalize(p.title), norm));

    if (!found) {
      issues.push(`[${id}] json에 없음: "${title.slice(0, 60)}"`);
      continue;
    }
    if (status && !found.is_progress) {
      issues.push(`[${id}] constants는 "${status}"인데 json은 출판 상태: "${title.slice(0, 50)}"`);
    }
    if (!status && found.is_progress) {
      issues.push(`[${id}] constants는 출판 표시인데 json은 진행 중(${found.status}): "${title.slice(0, 50)}"`);
    }
    const jsonJournal = found.is_progress
      ? found.journal
      : ((found.bibtex || '').match(/(?:journal|booktitle)\s*=\s*\{([^}]*)\}/i) || [])[1];
    if (jsonJournal && !normalize(venue).includes(normalize(jsonJournal).slice(0, 25)) && !normalize(jsonJournal).includes(normalize(venue).slice(0, 25))) {
      issues.push(`[${id}] venue 불일치: constants "${venue}" vs json "${jsonJournal}"`);
    }
  }

  // 매칭 0건이면 '불일치 없음'이 아니라 검사 자체가 동작하지 않은 것이다 — 조용히 통과시키지 않는다.
  if (matchedEntries === 0) {
    throw new Error('constants.tsx의 PUBLICATIONS 항목을 하나도 파싱하지 못함 (엔트리 형식 변경 확인 필요)');
  }

  // MEMBERS 이름 ↔ json 키 (People 모달 규칙)
  const memberNames = [...constantsSrc.matchAll(/name:\s*"([^"]+)"/g)].map(m => m[1]);
  for (const key of Object.keys(data)) {
    if (!memberNames.includes(key)) {
      issues.push(`json 키 "${key}"와 정확히 일치하는 MEMBERS.name 없음 (People 모달 미동작)`);
    }
  }
  return issues;
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
async function main() {
  const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  const constantsSrc = fs.readFileSync(CONSTANTS_PATH, 'utf8');
  const report = {
    updates: [], authorDiffs: [], conversions: [], additionsProgress: [], titleChanges: [],
    renames: [], additionsPublished: [], unknownYear: [], skipped: [], urlBackfills: [], warnings: [],
    degraded: [], constants: [],
  };
  const bibKeys = collectBibKeys(data); // 신규 생성 bibtex 키 충돌 방지
  let changed = false;

  // ── A. Sites in-review ↔ json is_progress 대조
  // Sites 수집 실패는 치명적이다(대조 근거 자체가 없다) — 여기서 throw되면 종료 코드 1.
  console.log('1/3 Google Sites 수집...');
  const { inProgress: sites, published: sitesPublished, publishedError } = await fetchSites();
  console.log(`   → in-review ${sites.length}건, 게재 ${sitesPublished.length}건 파싱됨`);
  if (publishedError) {
    report.degraded.push(`Sites 게재 섹션 파싱 실패 — 제목 변경 탐지의 근거 절반이 빠짐 (${publishedError})`);
  }
  const rhoPubs = data[SITES_PROFESSOR] || [];
  const progress = rhoPubs.filter(p => p.is_progress);

  const matchedSiteIdx = new Set();
  for (const jp of progress) {
    const jpNorm = normalize(jp.title);
    const siteIdx = sites.findIndex((s, i) => !matchedSiteIdx.has(i) && titlesMatch(normalize(s.title), jpNorm));
    if (siteIdx === -1) { jp.__missing = true; continue; }
    matchedSiteIdx.add(siteIdx);
    const s = sites[siteIdx];
    // author는 Sites 쪽 오타가 잦아 자동 반영하지 않고 보고만 함
    const AUTO_FIELDS = ['title', 'journal', 'status', 'year'];
    const diffs = [];
    for (const f of AUTO_FIELDS) {
      if (s[f] && s[f] !== jp[f]) diffs.push(`${f}: "${jp[f]}" → "${s[f]}"`);
    }
    const tagsA = JSON.stringify([...(jp.funding_tags || [])].sort());
    const tagsB = JSON.stringify([...s.funding_tags].sort());
    if (s.funding_tags.length && tagsA !== tagsB) diffs.push(`funding_tags: ${tagsA} → ${tagsB}`);
    if (s.author && s.author !== jp.author) {
      report.authorDiffs.push(`${jp.title.slice(0, 50)}: json "${jp.author}" vs Sites "${s.author}"`);
    }
    // 투고처가 바뀌면 기존 JCR 배지는 예전 학술지 기준이므로 함께 무효화한다.
    const journalChanged = Boolean(s.journal) && Boolean(jp.journal) && !venuesMatch(s.journal, jp.journal);
    if (journalChanged && jp.jcr) {
      diffs.push(`jcr: "${jp.jcr}" → (학술지 변경으로 무효화)`);
    }
    if (diffs.length) {
      report.updates.push({ title: jp.title, diffs });
      if (APPLY) {
        if (journalChanged) {
          delete jp.jcr;
          delete jp.jcr_source;
        }
        for (const f of AUTO_FIELDS) if (s[f]) jp[f] = s[f];
        if (s.funding_tags.length) jp.funding_tags = s.funding_tags;
        changed = true;
      }
    }
  }

  // Sites에만 있는 신규 투고 → is_progress 추가
  // 단, 같은 실행에서 json에만 남은 진행 중 논문(__missing)과 Sites에만 있는 항목이 동시에 존재하면
  // 제목이 바뀐 한 편이 '사라짐 + 신규 투고' 두 건으로 갈라졌을 가능성이 높다.
  // 자동 매칭보다 사람이 제목 한 줄을 고치는 편이 안전하므로 자동 추가를 건너뛰고 보고만 한다.
  const missingProgress = progress.filter(p => p.__missing);
  const unmatchedSites = sites.filter((_, i) => !matchedSiteIdx.has(i));
  const titleChangeSuspected = missingProgress.length > 0 && unmatchedSites.length > 0;

  if (titleChangeSuspected) {
    report.titleChanges.push(
      `Sites에만 있음(${unmatchedSites.length}건): ${unmatchedSites.map(s => `"${s.title.slice(0, 60)}"`).join(' / ')}`,
      `json에만 있음(${missingProgress.length}건): ${missingProgress.map(p => `"${p.title.slice(0, 60)}"`).join(' / ')}`,
      '→ 제목 변경 가능성이 있어 신규 투고 자동 추가를 건너뜀. json 제목을 직접 맞춘 뒤 다시 실행할 것.'
    );
  } else {
    unmatchedSites.forEach(s => {
      report.additionsProgress.push(s.title);
      if (APPLY) {
        rhoPubs.unshift({
          title: s.title, author: s.author, journal: s.journal, status: s.status,
          funding_tags: s.funding_tags, year: s.year, is_progress: true,
          ...(s.jcrLabel ? { jcr: s.jcrLabel.replace(/\s+/g, ' '), jcr_source: SITES_URL } : {}),
        });
        changed = true;
      }
    });
  }

  // ── B. Scholar 프로필 수집
  // Scholar는 요청 IP에 따라 403으로 막힌다. 예전에는 여기서 죽으면 A에서 이미 파싱한 결과까지
  // 통째로 버려졌다. 실패를 프로필 단위로 가두고, Scholar가 필요한 작업만 건너뛴다.
  console.log('2/3 Google Scholar 프로필 수집...');
  const scholarByName = new Map();
  for (const [name, userId] of Object.entries(PROFILES)) {
    try {
      const rows = await fetchScholarRows(userId, name);
      scholarByName.set(name, rows);
      console.log(`   → ${name}: ${rows.length}행`);
    } catch (error) {
      scholarByName.set(name, null); // null = 수집 실패. 빈 배열(정상적으로 0행)과 구분한다.
      console.warn(`   ✗ ${name}: 수집 실패 — ${error.message}`);
      report.degraded.push(`Scholar 수집 실패 [${name}] — ${error.message}`);
    }
  }

  // 상세 요청 하나가 실패했을 때 그 항목만의 문제인지, 프로필 전체가 막힌 것인지 가른다.
  // 404/410은 그 citation만 사라진 것이므로 다음 항목은 계속 시도한다.
  const isBlockingFailure = error =>
    !(error instanceof FetchError) ||
    error.status === null || // 네트워크 오류·타임아웃
    error.status === 403 ||
    error.status === 429 ||
    error.status >= 500;

  let detailBudget = MAX_DETAIL_FETCHES;
  let detailsBlocked = false;
  const fetchDetailSafely = async (href, label) => {
    if (detailsBlocked || detailBudget <= 0) return null;
    detailBudget -= 1;
    await sleep(600);
    try {
      return await fetchScholarDetail(href);
    } catch (error) {
      // 차단성 실패면 이 런에서는 상세 수집을 접는다 — 남은 항목마다 재시도 대기를 반복하면
      // 워크플로가 몇 분씩 늘어지고, 어차피 전부 같은 이유로 실패한다.
      const blocking = isBlockingFailure(error);
      if (blocking) detailsBlocked = true;
      report.degraded.push(
        `Scholar 상세 수집 실패${blocking ? ' — 이후 상세 수집 중단' : ''} ("${label.slice(0, 45)}": ${error.message})`
      );
      return null;
    }
  };

  // ── C. 대조 및 반영
  const unresolvedMissing = []; // Sites in-review에서 사라졌는데 Scholar 엄격 매칭도 안 된 논문
  for (const name of Object.keys(PROFILES)) {
    const scholarRows = scholarByName.get(name);
    const pubs = data[name] || [];
    const existingNorms = pubs.map(p => normalize(p.title));

    // 진행 중 논문이 Scholar에 등장 → 출판 전환
    if (name === SITES_PROFESSOR) {
      for (const jp of pubs.filter(p => p.is_progress && p.__missing)) {
        const row = scholarRows && scholarRows.find(r => titlesMatch(normalize(r.title), normalize(jp.title)));
        if (!row) {
          unresolvedMissing.push(jp); // 제목 변경 후보 탐색(Step D)으로 넘긴다
          continue;
        }
        // 전환하려면 상세의 Authors로 bibtex를 만들 수 있어야 한다. 이 확인을 --apply에서만 하면
        // 보고서는 "전환 1건"인데 실제로는 아무것도 안 바뀐 실행이 나온다 — 보고 모드에서도 똑같이 본다.
        if (!row.href) {
          report.warnings.push(`출판 전환 보류 — Scholar 상세 링크 없음: "${row.title.slice(0, 60)}"`);
          continue;
        }
        const fields = await fetchDetailSafely(row.href, row.title);
        if (!fields) {
          report.warnings.push(`출판 전환 보류 — Scholar 상세를 가져오지 못함(상한 초과 또는 수집 실패): "${row.title.slice(0, 60)}"`);
          continue;
        }
        const bibtex = buildBibtex(row.title, fields, bibKeys);
        if (!bibtex) {
          report.warnings.push(`출판 전환 보류 — Scholar 상세에 Authors 없음: "${row.title.slice(0, 60)}"`);
          continue;
        }
        report.conversions.push(`"${jp.title.slice(0, 60)}" → 출판 (Scholar: ${row.year})`);
        if (APPLY) {
          pubs[pubs.indexOf(jp)] = {
            title: row.title,
            url: scholarCitationUrl(row.href),
            bibtex,
            funding_tags: jp.funding_tags || [],
          };
          changed = true;
        }
      }
      pubs.forEach(p => delete p.__missing);
    }

    // 이 프로필의 Scholar 수집이 실패했다면 아래 작업은 근거가 없다 — 건너뛰고 보고에 남긴다.
    if (!scholarRows) {
      report.degraded.push(`[${name}] 건너뜀 — 빈 URL 보강, 신규 출판 논문 추가 (Scholar 미수집)`);
      continue;
    }

    // url이 비어 있는 기존 출판 항목 → Scholar 링크로 보강 (모든 교수 대상)
    for (const pub of pubs) {
      if (pub.is_progress || (pub.url && pub.url.trim())) continue;
      const row = scholarRows.find(r => r.href && titlesMatch(normalize(r.title), normalize(pub.title)));
      if (!row) continue;
      report.urlBackfills.push(`[${name}] ${pub.title.slice(0, 65)}`);
      if (APPLY) {
        pub.url = scholarCitationUrl(row.href);
        changed = true;
      }
    }

    // Scholar에만 있는 신규 논문 → published 추가 (AUTO_ADD_PROFILES만; 그 외는 보고만)
    const autoAdd = AUTO_ADD_PROFILES.includes(name);
    const newRows = scholarRows.filter(r => {
      const rn = normalize(r.title);
      return rn.length >= 15 && !existingNorms.some(en => titlesMatch(en, rn));
    });
    for (const row of newRows) {
      // 자동 추가 제외 사유 (한 줄이라도 걸리면 보고만 하고 넘어간다)
      const rowTitle = row.title.trim();
      const skipReason = isJunkTitle(rowTitle)
        ? '논문이 아님/철회 논문'
        : /[가-힣]/.test(rowTitle)
          ? '한글 제목 (국문 중복 등재 가능성)'
          : PREPRINT_VENUE.test(rowTitle)
            ? '프리프린트/학술발표'
            : !/^\d{4}$/.test(String(row.year || ''))
              ? UNKNOWN_YEAR_REASON
              : Number(row.year) < MIN_AUTO_ADD_YEAR
                ? `${MIN_AUTO_ADD_YEAR}년 이전 (${row.year})`
                : null;

      // 연도 미상은 '오래돼서 뺀 것'이 아니라 '판단할 재료가 없어서 뺀 것'이다 — 따로 모은다.
      if (skipReason === UNKNOWN_YEAR_REASON) {
        report.unknownYear.push(`[${name}] ${rowTitle.slice(0, 70)}`);
        continue;
      }
      if (skipReason) {
        report.skipped.push(`[${name}] ${rowTitle.slice(0, 60)} — ${skipReason}`);
        continue;
      }
      if (!autoAdd) {
        report.additionsPublished.push(`[${name} — 보고만] ${rowTitle.slice(0, 70)} (${row.year || '?'})`);
        continue;
      }
      if (!row.href) {
        report.skipped.push(`[${name}] ${rowTitle.slice(0, 60)} — Scholar 상세 링크 없음`);
        continue;
      }

      // 남은 게이트(저자·학술지·bibtex)는 Scholar 상세를 봐야 판정된다. 이 확인을 --apply에서만 하면
      // 보고서는 "추가 1건"인데 반영하면 프리프린트로 걸러져 아무것도 안 늘어나는 일이 생긴다
      // (실제 사례: arXiv preprint 1건). 보고 모드에서도 상세를 받아 같은 판정을 거친다.
      const fields = await fetchDetailSafely(row.href, rowTitle);
      if (!fields) {
        report.skipped.push(`[${name}] ${rowTitle.slice(0, 60)} — Scholar 상세를 가져오지 못함(상한 초과 또는 수집 실패)`);
        continue;
      }

      // 저자 게이트 — Authors에 해당 교수 이름 변형이 없으면 타인/동명이인 논문이므로 추가하지 않는다
      if (!hasPiAuthor(fields['Authors'], name)) {
        report.skipped.push(`[${name}] ${rowTitle.slice(0, 60)} — 저자에 PI 없음 (${(fields['Authors'] || '없음').slice(0, 60)})`);
        continue;
      }
      const venue = ['Journal', 'Conference', 'Book', 'Source'].map(k => fields[k]).find(Boolean) || '';
      if (PREPRINT_VENUE.test(venue)) {
        report.skipped.push(`[${name}] ${rowTitle.slice(0, 60)} — 프리프린트 (${venue.slice(0, 40)})`);
        continue;
      }
      const bibtex = buildBibtex(rowTitle, fields, bibKeys);
      if (!bibtex) {
        report.skipped.push(`[${name}] ${rowTitle.slice(0, 60)} — Scholar 상세에 Authors 없음`);
        continue;
      }

      report.additionsPublished.push(`[${name}] ${rowTitle.slice(0, 70)} (${row.year || '?'})`);
      if (APPLY) {
        const insertAt = pubs.findIndex(p => !p.is_progress);
        pubs.splice(insertAt === -1 ? pubs.length : insertAt, 0, {
          title: rowTitle,
          url: scholarCitationUrl(row.href),
          bibtex,
          funding_tags: [],
        });
        changed = true;
      }
    }
  }

  // ── D. 제목 변경 후보 탐색 (보고만)
  // Sites in-review에서 사라졌는데 Scholar 엄격 매칭도 안 된 논문은, 제목이 손질된 채 출판됐을 수 있다.
  // 후보 풀은 Sites 게재 항목 + Scholar 행. Scholar가 막혀도 Sites만으로 탐지가 동작한다.
  if (unresolvedMissing.length) {
    const rhoScholar = scholarByName.get(SITES_PROFESSOR) || [];
    const pool = [
      ...sitesPublished.map(s => ({ ...s, source: `Sites 게재 · ${s.journal} (${s.status})` })),
      ...rhoScholar.map(r => ({ ...r, source: `Scholar (${r.year || '연도 미상'})` })),
    ];
    const knownNorms = rhoPubs.map(p => normalize(p.title));

    for (const jp of unresolvedMissing) {
      const hits = findRenameCandidates(jp, pool, knownNorms);
      if (!hits.length) {
        report.warnings.push(`진행 중 논문이 Sites에서 사라졌으나 Scholar에도 없음 (수동 확인): "${jp.title.slice(0, 60)}"`);
        continue;
      }
      report.renames.push({
        title: jp.title,
        from: `${jp.journal} (${jp.status})`,
        hits: hits.map(({ candidate, verdict }) => {
          const authors = verdict.authors ? `저자 ${verdict.authors.shared}명 일치(${(verdict.authors.ratio * 100).toFixed(0)}%)` : '저자 비교 불가';
          return `[${verdict.confidence}] ${candidate.title.slice(0, 80)}\n        ${candidate.source} · 제목 겹침 ${(verdict.title.dice * 100).toFixed(0)}% · ${authors}`;
        }),
      });
    }
  }

  // ── E. constants.tsx 정합성 검사 (보고만)
  console.log('3/3 constants.tsx 정합성 검사...');
  report.constants = checkConstants(constantsSrc, data);

  // ── 보고서 출력
  const MAX_LIST = 15;
  const section = (label, items, fmt = x => x, limit = MAX_LIST) => {
    console.log(`\n■ ${label}: ${items.length}건`);
    items.slice(0, limit).forEach(x => console.log('  -', fmt(x)));
    if (items.length > limit) console.log(`  ... 외 ${items.length - limit}건`);
  };
  section('진행 중 논문 필드 변경', report.updates, u => `${u.title.slice(0, 55)}\n      ${u.diffs.join('\n      ')}`);
  section('저자 표기 차이 (자동 반영 안 함 — 필요 시 수동 확인)', report.authorDiffs);
  section('신규 투고 (is_progress 추가)', report.additionsProgress);
  section('신규 투고 자동 추가 보류 (in-review 목록에 제목 변경 의심)', report.titleChanges);
  section(
    '출판 전환 후보 — 제목이 바뀐 것으로 보임 (자동 반영 안 함, 수동 확인 필요)',
    report.renames,
    r => `"${r.title.slice(0, 70)}"\n      json 현재: ${r.from}\n      → ${r.hits.join('\n      → ')}`
  );
  section('출판 전환 (is_progress → published)', report.conversions);
  section('신규 출판 논문 추가', report.additionsPublished);
  // 연도 미상은 사람이 봐야 처리되는 목록이다. 잘라내면 확인할 사람이 없으므로 전부 출력한다.
  section('연도 미상으로 보류 (자동 추가 안 함 — 수동 확인 필요)', report.unknownYear, x => x, Infinity);
  section('자동 추가 제외 (필터/저자 게이트)', report.skipped);
  section('빈 URL 보강 (Scholar 링크)', report.urlBackfills);
  section('경고', report.warnings);
  section('수집 실패로 건너뛴 작업', report.degraded);
  section('constants.tsx 불일치 (수동 반영 필요)', report.constants);

  // Scholar 수집이 한 프로필이라도 실패했으면 부분 성공이다. Sites 기반 결과는 그대로 반영하되,
  // 종료 코드로 "일부를 건너뛰었다"를 분명히 알린다(조용한 성공을 만들지 않는다).
  const scholarFailed = [...scholarByName.values()].some(rows => rows === null);
  const exitCode = scholarFailed ? EXIT_PARTIAL : EXIT_OK;
  const announce = () => {
    if (exitCode !== EXIT_PARTIAL) return;
    console.log(
      '\n⚠ 종료 코드 2 — Scholar 수집 실패로 일부 작업을 건너뜀 (Sites 기반 결과는 유효).' +
        '\n  규약: 0=정상, 2=부분 성공(커밋·PR은 계속할 것), 1=치명적 실패(반영 없음).'
    );
  };

  // ── 반영
  if (!APPLY) {
    console.log('\n(보고 모드 — 반영하려면 --apply 를 붙여 실행)');
    announce();
    return exitCode;
  }
  if (!changed) {
    console.log('\n반영할 변경 없음.');
    announce();
    return exitCode;
  }

  fs.writeFileSync(JSON_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

  // 사후 검증: JSON 유효성 + 중복 검사 (작업 규칙 4)
  const reparsed = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  for (const [name, pubs] of Object.entries(reparsed)) {
    const seenT = new Set(); const seenB = new Set();
    for (const p of pubs) {
      const tn = normalize(p.title);
      if (seenT.has(tn)) throw new Error(`중복 제목 발생: [${name}] ${p.title}`);
      seenT.add(tn);
      if (p.bibtex) {
        const bn = p.bibtex.replace(/\s+/g, ' ');
        if (seenB.has(bn)) throw new Error(`중복 bibtex 발생: [${name}] ${p.title}`);
        seenB.add(bn);
      }
    }
    console.log(`검증 OK: ${name} ${pubs.length}건, 중복 없음`);
  }

  // PUBLICATIONS_UPDATED_AT 자동 갱신 (로컬 날짜 기준)
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const updatedConstants = constantsSrc.replace(
    /export const PUBLICATIONS_UPDATED_AT = "\d{4}-\d{2}-\d{2}"/,
    `export const PUBLICATIONS_UPDATED_AT = "${today}"`
  );
  if (updatedConstants !== constantsSrc) {
    fs.writeFileSync(CONSTANTS_PATH, updatedConstants, 'utf8');
    console.log(`PUBLICATIONS_UPDATED_AT → ${today}`);
  }
  console.log('\n반영 완료.');
  announce();
  return exitCode;
}

// 직접 실행할 때만 동작 — require 시에는 순수 함수만 노출해 오프라인 테스트가 가능하다
if (require.main === module) {
  main()
    .then(code => process.exit(code ?? EXIT_OK))
    .catch(error => {
      console.error(error);
      process.exit(EXIT_FATAL);
    });
}

module.exports = { buildBibtex, escapeBib, uniqueBibKey, collectBibKeys, checkConstants, findRenameCandidates };
