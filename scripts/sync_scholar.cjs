/**
 * sync_scholar.cjs — 논문 데이터 통합 동기화 스크립트
 *
 * 기준 소스 2곳을 publications.json과 대조한다:
 *   1. Google Sites (in Press/Review 섹션) → 진행 중 논문의 상태/학술지 변경 감지
 *   2. Google Scholar 프로필              → 신규 출판 논문 수집, 진행 중 → 출판 전환
 * 추가로 constants.tsx의 PUBLICATIONS(주요 논문)와 json의 정합성을 검사한다(보고만).
 *
 * 사용법:
 *   node scripts/sync_scholar.cjs           # 보고서만 출력 (파일 변경 없음)
 *   node scripts/sync_scholar.cjs --apply   # publications.json + PUBLICATIONS_UPDATED_AT 반영
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
  fetchText,
  compactTextFromHtml,
  sleep,
} = require('./lib.cjs');

const JSON_PATH = path.join(__dirname, '..', 'src', 'data', 'publications.json');
const CONSTANTS_PATH = path.join(__dirname, '..', 'src', 'constants.tsx');
const SITES_PROFESSOR = 'Seungmin Rho'; // Google Sites in-review 섹션은 Rho 교수 논문만 다룸
const AUTO_ADD_PROFILES = ['Seungmin Rho']; // 신규 논문 자동 추가 대상 (그 외 교수는 보고만 — 동명이인 혼입 방지)
const MAX_DETAIL_FETCHES = 20; // 런당 Scholar 상세 페이지 요청 상한 (차단 방지)
// 논문이 아닌 Scholar 레코드(환영사/위원회 명단 등)는 수집 제외
const JUNK_TITLE = /^welcome to|welcome message|program committee|organizing committee|^message from|reviewers?$|committees?(\s*\(|$)/i;

const APPLY = process.argv.includes('--apply');

// ──────────────────────────────────────────────
// Step A. Google Sites — in Press/Review 섹션 파싱
// ──────────────────────────────────────────────
const JCR_BRACKET = /(?:S?SCIE|SSCI)[^\]]*\d+(?:\.\d+)?%/i;
const STATUS_LINE = /^(.+?)\s*\(([^()]*20\d{2})\)$/; // "Journal Name (Submitted, June 2026)"
const STATUS_WORDS = /submit|revision|review|press|proofing|accept/i;

async function fetchSitesInProgress() {
  const html = await fetchText(SITES_URL);
  let text = compactTextFromHtml(html).replace(/[“”]/g, '"'); // 굽은따옴표 정규화

  // in-review 섹션만 잘라내기: 섹션 제목부터 다음 "Publication..." 계열 제목 전까지
  const start = text.search(/in Press,?\s*Proofing,?\s*(?:or\s*)?in Review/i);
  if (start === -1) throw new Error('Google Sites에서 in-review 섹션을 찾지 못함');
  const rest = text.slice(start);
  const endMatch = rest.slice(10).search(/Published\s*&?\s*Accepted|International Journal|Domestic Journal|Conference Papers/i);
  const section = endMatch === -1 ? rest : rest.slice(0, endMatch + 10);

  // 항목 구조 (3줄): "[JCR]? 제목 [펀딩태그]*" / "저자" / "학술지 (상태, 월 연도)"
  // 상태 줄을 앵커로 역방향 파싱한다.
  const lines = section.split('\n').map(l => l.trim()).filter(Boolean);
  const entries = [];

  for (let i = 2; i < lines.length; i++) {
    const statusMatch = lines[i].match(STATUS_LINE);
    if (!statusMatch || !STATUS_WORDS.test(statusMatch[2])) continue;

    const author = lines[i - 1];
    let titleLine = lines[i - 2];
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

// ──────────────────────────────────────────────
// Step B. Google Scholar — 프로필 행 + 상세 페이지
// ──────────────────────────────────────────────
async function fetchScholarRows(userId) {
  const rows = [];
  for (let cstart = 0; cstart < 1000; cstart += 100) {
    const url = `https://scholar.google.com/citations?user=${userId}&hl=en&cstart=${cstart}&pagesize=100&sortby=pubdate`;
    const html = await fetchText(url);
    const matches = [...html.matchAll(/<tr[^>]*class="gsc_a_tr"[\s\S]*?<\/tr>/g)].map(m => m[0]);
    if (matches.length === 0) break;

    for (const row of matches) {
      const anchor = (row.match(/<a[^>]*class="gsc_a_at"[^>]*>/) || [''])[0];
      const href = (anchor.match(/href="([^"]+)"/) || [])[1];
      const title = decodeHtml(stripTags((row.match(/class="gsc_a_at">([\s\S]*?)<\/a>/) || [])[1] || '')).trim();
      const year = (row.match(/class="gsc_a_y"[^>]*>[\s\S]*?(\d{4})/) || [])[1] || '';
      if (title) rows.push({ title, year, href: href ? decodeHtml(href) : null });
    }
    await sleep(400);
  }
  return rows;
}

async function fetchScholarDetail(href) {
  const html = await fetchText('https://scholar.google.com' + href);
  const fields = {};
  for (const m of html.matchAll(/<div class="gsc_oci_field">([^<]+)<\/div><div class="gsc_oci_value"[^>]*>([\s\S]*?)<\/div>/g)) {
    fields[m[1].trim()] = decodeHtml(stripTags(m[2])).trim();
  }
  return fields;
}

function buildBibtex(title, fields) {
  const authors = (fields['Authors'] || '').split(',').map(a => a.trim()).filter(Boolean);
  const year = ((fields['Publication date'] || '').match(/20\d{2}|19\d{2}/) || [''])[0];
  const venueKey = ['Journal', 'Conference', 'Book', 'Source'].find(k => fields[k]);
  const venue = venueKey ? fields[venueKey] : '';
  const isConf = venueKey === 'Conference';

  const firstAuthorLast = (authors[0] || 'unknown').split(' ').pop().toLowerCase().replace(/[^a-z]/g, '') || 'unknown';
  const firstWord = (title.match(/[A-Za-z]{3,}/) || ['paper'])[0].toLowerCase();
  const key = `${firstAuthorLast}${year || ''}${firstWord}`;

  const lines = [
    `@${isConf ? 'inproceedings' : 'article'}{${key},`,
    `  title={${title}},`,
    `  author={${authors.join(' and ')}},`,
  ];
  if (venue) lines.push(`  ${isConf ? 'booktitle' : 'journal'}={${venue}},`);
  if (fields['Volume']) lines.push(`  volume={${fields['Volume']}},`);
  if (fields['Issue']) lines.push(`  number={${fields['Issue']}},`);
  if (fields['Pages']) lines.push(`  pages={${fields['Pages'].replace(/-/g, '--')}},`);
  if (fields['Publisher']) lines.push(`  publisher={${fields['Publisher']}},`);
  if (year) lines.push(`  year={${year}}`);
  let bib = lines.join('\n');
  if (bib.endsWith(',')) bib = bib.slice(0, -1);
  return bib + '\n}';
}

// ──────────────────────────────────────────────
// Step C-3. constants.tsx 정합성 검사 (보고만)
// ──────────────────────────────────────────────
function checkConstants(constantsSrc, data) {
  const issues = [];
  const block = (constantsSrc.match(/export const PUBLICATIONS[\s\S]*?\n\];/) || [''])[0];
  const entryRe = /id:\s*'(p\d+)'[\s\S]*?title:\s*"([^"]+)"[\s\S]*?venue:\s*"([^"]+)"/g;

  const allPubs = Object.values(data).flat();
  for (const m of block.matchAll(entryRe)) {
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
  const report = { updates: [], authorDiffs: [], conversions: [], additionsProgress: [], additionsPublished: [], warnings: [], constants: [] };
  let changed = false;

  // ── A. Sites in-review ↔ json is_progress 대조
  console.log('1/3 Google Sites in-review 섹션 수집...');
  const sites = await fetchSitesInProgress();
  console.log(`   → ${sites.length}건 파싱됨`);
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
    if (diffs.length) {
      report.updates.push({ title: jp.title, diffs });
      if (APPLY) {
        for (const f of AUTO_FIELDS) if (s[f]) jp[f] = s[f];
        if (s.funding_tags.length) jp.funding_tags = s.funding_tags;
        changed = true;
      }
    }
  }

  // Sites에만 있는 신규 투고 → is_progress 추가
  sites.forEach((s, i) => {
    if (matchedSiteIdx.has(i)) return;
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

  // ── B. Scholar 프로필 대조
  console.log('2/3 Google Scholar 프로필 수집...');
  let detailBudget = MAX_DETAIL_FETCHES;
  for (const [name, userId] of Object.entries(PROFILES)) {
    const scholarRows = await fetchScholarRows(userId);
    console.log(`   → ${name}: ${scholarRows.length}행`);
    const pubs = data[name] || [];
    const existingNorms = pubs.map(p => normalize(p.title));

    // 진행 중 논문이 Scholar에 등장 → 출판 전환
    if (name === SITES_PROFESSOR) {
      for (const jp of pubs.filter(p => p.is_progress && p.__missing)) {
        const row = scholarRows.find(r => titlesMatch(normalize(r.title), normalize(jp.title)));
        if (!row) {
          report.warnings.push(`진행 중 논문이 Sites에서 사라졌으나 Scholar에도 없음 (수동 확인): "${jp.title.slice(0, 60)}"`);
          continue;
        }
        report.conversions.push(`"${jp.title.slice(0, 60)}" → 출판 (Scholar: ${row.year})`);
        if (APPLY && row.href && detailBudget > 0) {
          detailBudget -= 1;
          await sleep(600);
          const fields = await fetchScholarDetail(row.href);
          const idx = pubs.indexOf(jp);
          pubs[idx] = {
            title: row.title,
            url: 'https://scholar.google.com' + row.href,
            bibtex: buildBibtex(row.title, fields),
            funding_tags: jp.funding_tags || [],
          };
          changed = true;
        }
      }
      pubs.forEach(p => delete p.__missing);
    }

    // Scholar에만 있는 신규 논문 → published 추가 (AUTO_ADD_PROFILES만; 그 외는 보고만)
    const autoAdd = AUTO_ADD_PROFILES.includes(name);
    const newRows = scholarRows.filter(r => {
      const rn = normalize(r.title);
      return rn.length >= 15 && !JUNK_TITLE.test(r.title.trim()) && !existingNorms.some(en => titlesMatch(en, rn));
    });
    for (const row of newRows) {
      report.additionsPublished.push(`[${name}${autoAdd ? '' : ' — 보고만'}] ${row.title.slice(0, 70)} (${row.year || '?'})`);
      if (APPLY && autoAdd && row.href && detailBudget > 0) {
        detailBudget -= 1;
        await sleep(600);
        const fields = await fetchScholarDetail(row.href);
        const insertAt = pubs.findIndex(p => !p.is_progress);
        pubs.splice(insertAt === -1 ? pubs.length : insertAt, 0, {
          title: row.title,
          url: 'https://scholar.google.com' + row.href,
          bibtex: buildBibtex(row.title, fields),
          funding_tags: [],
        });
        changed = true;
      }
    }
  }

  // ── C. constants.tsx 정합성 검사 (보고만)
  console.log('3/3 constants.tsx 정합성 검사...');
  report.constants = checkConstants(constantsSrc, data);

  // ── 보고서 출력
  const MAX_LIST = 15;
  const section = (label, items, fmt = x => x) => {
    console.log(`\n■ ${label}: ${items.length}건`);
    items.slice(0, MAX_LIST).forEach(x => console.log('  -', fmt(x)));
    if (items.length > MAX_LIST) console.log(`  ... 외 ${items.length - MAX_LIST}건`);
  };
  section('진행 중 논문 필드 변경', report.updates, u => `${u.title.slice(0, 55)}\n      ${u.diffs.join('\n      ')}`);
  section('저자 표기 차이 (자동 반영 안 함 — 필요 시 수동 확인)', report.authorDiffs);
  section('신규 투고 (is_progress 추가)', report.additionsProgress);
  section('출판 전환 (is_progress → published)', report.conversions);
  section('신규 출판 논문 추가', report.additionsPublished);
  section('경고', report.warnings);
  section('constants.tsx 불일치 (수동 반영 필요)', report.constants);

  // ── 반영
  if (!APPLY) {
    console.log('\n(보고 모드 — 반영하려면 --apply 를 붙여 실행)');
    return;
  }
  if (!changed) {
    console.log('\n반영할 변경 없음.');
    return;
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
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
