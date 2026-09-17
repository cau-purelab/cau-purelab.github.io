/**
 * validate_data.cjs — publications.json 무결성 검증 (배포 전 CI 게이트)
 *
 * 검사 항목: JSON 유효성, 교수별 항목 수, 정규화 제목/bibtex 중복,
 * 출판 항목의 bibtex 존재, 진행 중 항목의 필수 필드,
 * 논문이 아닌 레코드(위원회 명단·특집호 서문)와 철회 논문 표기,
 * 'and others' 저자 잔존, url 형식, funding_tags 타입,
 * 연도/학술지 파싱 가능 여부, 같은 논문의 투고 중/출판 동시 등재,
 * 교수 간 중복 항목의 필드 일관성.
 *
 * 오류(errors)는 exit 1 → deploy.yml에서 빌드를 중단시킨다.
 * 경고(warnings)는 기존 데이터에 이미 위반이 있는 항목이라 보고만 하고 빌드를 막지 않는다.
 * front matter / 'and others'는 신규 유입을 오류로 막되, 2026-09 정리에서 연구실 확인 대기로
 * 남긴 기존 항목(아래 REVIEW_PENDING_*)만 경고로 낮춰 배포가 막히지 않게 한다.
 */
const fs = require('fs');
const path = require('path');
const { normalize, venuesMatch, FRONT_MATTER_TITLE, RETRACTED_TITLE } = require('./lib.cjs');

const JSON_PATH = path.join(__dirname, '..', 'src', 'data', 'publications.json');

const YEAR_IN_BIBTEX = /year\s*=\s*\{?\s*((?:19|20)\d{2})/i;
// 화면에 쓰이는 학술지명은 src/lib/bibtex.ts의 parseBibtex가
// journal → booktitle → howpublished → school → publisher 순으로 고른다.
// 같은 순서를 봐야 "화면에서 학술지 자리가 빈칸으로 나오는 항목"만 걸러진다.
const VENUE_IN_BIBTEX = /(?:journal|booktitle|howpublished|school|publisher)\s*=\s*\{\s*[^}\s]/i;
const AND_OTHERS = /\band\s+others\b/i;
// 저자 토큰 하나가 사람 이름이 아니라 et al. 표기인 경우
const ET_AL_NAME = /^(?:others|et\.?\s*al\.?)$/i;
const HTTP_URL = /^https?:\/\//i;
const YEAR_VALUE = /^(?:19|20)\d{2}$/;

// 같은 논문의 '투고 중 / 출판' 동시 등재 판정 기준.
// 같은 저자들이 같은 학술지에 같은 해 다른 논문을 내는 일은 흔하다. 저자·학술지·연도만으로는
// 그 경우와 '제목이 바뀐 동일 논문'을 구별할 수 없어, 확신도에 따라 두 단계로 나눈다.
//  - 오류: 저자가 거의 같고(STRONG) 제목까지 닮은(TITLE_MIN) 경우. 2026-09 Glow 건이 여기다.
//  - 경고: 저자만 겹치고 제목이 다른 경우. 오탐 가능성이 커서 빌드를 막지 않고 사람이 본다.
// 2026-09 데이터 전체에 돌렸을 때 오류로 걸린 것은 실제 사고였던 Glow 건 1쌍뿐이었다.
const DUP_AUTHOR_STRONG = 0.8;
const DUP_AUTHOR_WEAK = 0.5;
const DUP_TITLE_MIN = 0.25;
const DUP_YEAR_SLACK = 1; // 투고 연도와 게재 연도가 한 해 어긋나는 것은 정상이다
// 제목 유사도에서 뺄 기능어. 남겨 두면 짧은 제목끼리 우연히 닮아 보인다.
const TITLE_STOPWORDS = new Set([
  'a', 'an', 'the', 'of', 'for', 'and', 'with', 'in', 'on', 'to', 'via',
  'using', 'based', 'toward', 'towards', 'through', 'from', 'by', 'at', 'as', 'its',
]);

const errors = [];
const warnings = [];
let data;

// 2026-09 아카이브 정리에서 연구실 확인 대기로 남긴 기존 항목(docs/archive-cleanup-2026-09.md "보류" 절).
// 아래 제목은 경고로만 보고해 배포를 막지 않는다. 목록에 없는 신규 위반은 오류로 빌드를 중단시킨다.
// 연구실이 항목을 정리·삭제하면 여기서 해당 줄도 함께 지운다.
const REVIEW_PENDING_FRONT_MATTER = [
  'Enabling wireless communication and networking technologies for the internet of things [Guest editorial]',
  'Guest editorial: cybertwin-driven 6g for internet of everything: architectures, challenges, and industrial applications',
  'Introduction to the special issue on advances in multimedia and educational technology',
  'IEEE access special section editorial: Information security solutions for telemedicine applications',
  'Special Issue on Artificial Intelligence Empowered Big Data Analytical Patterns for Medical Applications',
  'Guest Editorial: Challenges of Embedded Systems as They Evolve into M2M, Internet of Things',
  'Special Issue on Software-Defined Wireless Networks',
  'GUEST EDITORIAL special issue on real-time perceptual-inspired imaging systems with computational science and aesthetics',
  'Introduction to the special issue on advances in the convergence of multimedia, communications, and social web technology',
].map(normalize);

// 저자 목록이 'and others'로 잘려 PI 참여 여부를 확정할 수 없는 기존 항목. 임의 편집 대신 보류했다.
const REVIEW_PENDING_AND_OTHERS = [
  'Key factors affecting user experience of mobile recommendation systems',
  'A Smart Heart Disease Diagnostic System Using Deep Vanilla LSTM.',
  'Finding Temporal Influential Users in Social Media Using Association Rule Learning.',
  'Cognitive sensors based on ridge phase-smoothing localization and multiregional histograms of oriented gradients',
  'A Triplet-Branch Convolutional Neural Network for Part-Based Gait Recognition.',
  'Enabling interoperability across heterogeneous semantic web services with OWL-S based mediation',
  'Predictive modeling for ubiquitin proteins through advanced machine learning technique',
  'The Moderating Effects of Internet Shopping Experience on the Relationship between Appearance Management in Elder People and Psychological Adaptation and Social Connectedness …',
  'Smart Transportation Decision Making through Big Graphs and IoT.',
  'Batteries state of health estimation via efficient neural networks with multiple channel charging profiles',
].map(normalize);

const reviewPending = new Map([
  ['front-matter', new Set(REVIEW_PENDING_FRONT_MATTER)],
  ['and-others', new Set(REVIEW_PENDING_AND_OTHERS)],
]);
const reviewPendingHit = new Set();

// 확인 대기 목록에 있으면 경고, 아니면 오류. 신규 유입만 빌드를 막는다.
function reportViolation(kind, title, message) {
  const key = normalize(title);
  if (reviewPending.get(kind).has(key)) {
    reviewPendingHit.add(`${kind}:${key}`);
    warnings.push(`${message} (확인 대기 — docs/archive-cleanup-2026-09.md)`);
    return;
  }
  errors.push(message);
}

try {
  data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
} catch (e) {
  console.error(`publications.json 파싱 실패: ${e.message}`);
  process.exit(1);
}

// 논문이 아닌 레코드 / 철회 논문 표기 검사
function checkTitleQuality(p, where) {
  const title = String(p.title || '').trim();
  if (FRONT_MATTER_TITLE.test(title)) {
    reportViolation('front-matter', title, `${where} — 논문이 아닌 레코드(위원회 명단·서문·특집호 편집자 등)`);
  }
  // 철회 논문은 삭제하거나 retracted: true로 표시해 지표 집계에서 빼야 한다
  if (RETRACTED_TITLE.test(title) && p.retracted !== true) {
    errors.push(`${where} — 철회 논문인데 retracted: true 표시가 없음`);
  }
}

// 진행 중 항목: 필수 필드 + 연도 파싱
function checkProgressEntry(p, where) {
  for (const f of ['journal', 'status', 'year']) {
    if (!p[f]) errors.push(`${where} — 진행 중 항목에 ${f} 없음`);
  }
  if (p.year && !YEAR_VALUE.test(String(p.year).trim())) {
    errors.push(`${where} — year 형식 오류: "${p.year}"`);
  }
}

// 출판 항목: bibtex 존재 + 연도/학술지 파싱 + 저자 표기
function checkPublishedEntry(p, where, seenBibtex) {
  const bibtex = p.bibtex || '';
  if (!bibtex.includes('{')) {
    errors.push(`${where} — 출판 항목에 bibtex 없음/손상`);
    return;
  }

  const normalizedBibtex = bibtex.replace(/\s+/g, ' ');
  if (seenBibtex.has(normalizedBibtex)) errors.push(`${where} — 중복 bibtex`);
  seenBibtex.add(normalizedBibtex);

  // Scholar 수집 잔재. 'others'가 가짜 공저자로 렌더링되므로 신규 유입을 막는다
  if (AND_OTHERS.test(bibtex)) {
    reportViolation('and-others', p.title || '', `${where} — bibtex 저자에 'and others' 잔존`);
  }

  // 기존 위반이 남아 있어 우선 경고로 둔다 (연도 없으면 연도 필터로 도달 불가)
  if (!YEAR_IN_BIBTEX.test(bibtex)) warnings.push(`${where} — bibtex에서 연도를 파싱할 수 없음`);
  if (!VENUE_IN_BIBTEX.test(bibtex)) {
    warnings.push(`${where} — 화면에 표시할 학술지명 없음 (journal/booktitle/howpublished/school/publisher 모두 없음)`);
  }
}

// 공통 필드: url 형식, funding_tags 타입
function checkCommonFields(p, where) {
  if (p.url !== undefined) {
    const url = typeof p.url === 'string' ? p.url.trim() : '';
    // 빈 문자열은 '아직 없음'으로 보고 sync가 보강한다. javascript:/data: 같은 값만 차단한다.
    if (!url) warnings.push(`${where} — url이 비어 있음 (sync 보강 대상)`);
    else if (!HTTP_URL.test(url)) {
      errors.push(`${where} — url이 http(s) 형식이 아님: "${String(p.url).slice(0, 40)}"`);
    }
  }
  if (p.funding_tags !== undefined) {
    const valid = Array.isArray(p.funding_tags) && p.funding_tags.every(t => typeof t === 'string');
    if (!valid) errors.push(`${where} — funding_tags는 문자열 배열이어야 함`);
  }
}

// bibtex 필드 하나를 꺼낸다 (src/lib/bibtex.ts의 parseBibtex와 같은 패턴).
function bibField(bibtex, field) {
  const match = String(bibtex || '').match(new RegExp(`\\b${field}\\s*=\\s*[{"]([\\s\\S]*?)[}"]`, 'i'));
  return match ? match[1].replace(/[{}\\]/g, '').replace(/\s+/g, ' ').trim() : '';
}

// 저자 문자열에서 성씨만 모은다. 표기가 'S Rho' / 'Rho, Seungmin' / 'Seungmin Rho'로 제각각이라
// 이름(given name)은 비교에 쓸 수 없고 성씨만 안정적이다.
function lastNameSet(raw, isBibtexFormat) {
  const tokens = isBibtexFormat ? String(raw || '').split(/\s+and\s+/i) : String(raw || '').split(',');
  const names = new Set();
  for (const token of tokens) {
    const name = token.trim();
    if (!name || ET_AL_NAME.test(name)) continue;
    // BibTeX의 'Last, First'는 쉼표 앞이 성씨, 나머지 표기는 마지막 토큰이 성씨다.
    const last = isBibtexFormat && name.includes(',')
      ? name.slice(0, name.indexOf(','))
      : name.split(/\s+/).pop();
    const key = last.toLowerCase().replace(/[^a-z]/g, '');
    if (key.length >= 2) names.add(key);
  }
  return names;
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const value of a) if (b.has(value)) shared += 1;
  return shared / (a.size + b.size - shared);
}

// 제목을 내용어 집합으로 바꾼다. 3자 미만·기능어는 뺀다.
function titleWords(title) {
  const words = String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/);
  return new Set(words.filter(w => w.length >= 3 && !TITLE_STOPWORDS.has(w)));
}

/**
 * 같은 논문이 '투고 중'(is_progress)과 '출판'으로 동시에 등재된 것을 찾는다.
 *
 * 주간 sync가 출판본을 추가하면서 옛 is_progress 항목을 지우지 않으면 사이트가 같은 논문을
 * Submitted 배지와 출판 항목으로 동시에 보여준다(2026-09 Glow 건). sync의 제목 비교는
 * 완전일치·부분문자열만 보기 때문에 투고와 게재 사이에 제목이 바뀌면 놓친다.
 * 그래서 제목 대신 저자 성씨 집합·학술지·연도를 함께 본다.
 *
 * 한 교수의 배열 안에서만 비교한다. 동시 등재는 sync가 같은 배열에 덧붙이면서 생기고,
 * 화면(People 모달 / Scholar 탭)도 교수별로 나뉘어 있어 교차 비교는 의미가 없다.
 */
function checkProgressPublishedDuplicates(name, pubs) {
  const progress = [];
  const published = [];
  pubs.forEach((p, i) => {
    if (p.is_progress) progress.push({ p, i });
    else if (String(p.bibtex || '').includes('{')) published.push({ p, i });
  });

  for (const { p, i } of progress) {
    const pAuthors = lastNameSet(p.author, false);
    const pYear = parseInt(String(p.year || ''), 10);
    // 학술지·저자·연도 중 하나라도 비면 판정 근거가 부족하다 — 추측하지 않고 넘어간다.
    if (!p.journal || !pAuthors.size || !Number.isFinite(pYear)) continue;

    for (const { p: q, i: j } of published) {
      const bibtex = q.bibtex;
      const venue = bibField(bibtex, 'journal') || bibField(bibtex, 'booktitle') || bibField(bibtex, 'howpublished');
      if (!venue || !venuesMatch(p.journal, venue)) continue;

      const yearMatch = bibtex.match(YEAR_IN_BIBTEX);
      const qYear = yearMatch ? parseInt(yearMatch[1], 10) : NaN;
      if (!Number.isFinite(qYear) || Math.abs(pYear - qYear) > DUP_YEAR_SLACK) continue;

      const authorScore = jaccard(pAuthors, lastNameSet(bibField(bibtex, 'author'), true));
      const titleScore = jaccard(titleWords(p.title), titleWords(q.title));
      const sameWork = authorScore >= DUP_AUTHOR_STRONG && titleScore >= DUP_TITLE_MIN;
      const maybeSameWork = !sameWork && (
        authorScore >= DUP_AUTHOR_STRONG || (authorScore >= DUP_AUTHOR_WEAK && titleScore >= DUP_TITLE_MIN)
      );
      if (!sameWork && !maybeSameWork) continue;

      const detail = `(저자 일치 ${authorScore.toFixed(2)} · 제목 유사 ${titleScore.toFixed(2)} · 학술지 "${venue}")`
        + `\n      [${i}] 투고 중: ${String(p.title || '').slice(0, 70)}`
        + `\n      [${j}] 출판:    ${String(q.title || '').slice(0, 70)}`;

      if (sameWork) {
        errors.push(`[${name}] 같은 논문이 투고 중·출판으로 동시 등재됨 ${detail}`
          + `\n      → is_progress 항목을 지울 것. 사이트가 같은 논문을 Submitted 배지와 출판 항목으로 동시에 보여준다.`);
      } else {
        warnings.push(`[${name}] 투고 중·출판 동시 등재 의심 ${detail}`
          + `\n      → 제목이 달라 자동 판정이 불가능하다. 같은 논문이면 is_progress 항목을 지우고, 다른 논문이면 그대로 두면 된다.`);
      }
    }
  }
}

for (const [name, pubs] of Object.entries(data)) {
  if (!Array.isArray(pubs) || pubs.length === 0) {
    errors.push(`[${name}] 논문 배열이 비어 있음`);
    continue;
  }

  const seenTitles = new Set();
  const seenBibtex = new Set();

  pubs.forEach((p, i) => {
    const where = `[${name}][${i}] ${String(p.title || '').slice(0, 50)}`;

    if (!p.title || !String(p.title).trim()) errors.push(`${where} — title 없음`);

    const tn = normalize(p.title || '');
    if (seenTitles.has(tn)) errors.push(`${where} — 중복 제목`);
    seenTitles.add(tn);

    checkTitleQuality(p, where);
    checkCommonFields(p, where);

    if (p.is_progress) checkProgressEntry(p, where);
    else checkPublishedEntry(p, where, seenBibtex);
  });

  checkProgressPublishedDuplicates(name, pubs);

  console.log(`[${name}] ${pubs.length}건 검사 완료`);
}

// 교수 간 중복 등재 항목은 탭마다 다르게 보이지 않도록 필드가 일치해야 한다
const byTitle = new Map();
for (const [name, pubs] of Object.entries(data)) {
  if (!Array.isArray(pubs)) continue;
  pubs.forEach((p, i) => {
    const key = normalize(p.title || '');
    if (!key) return;
    const prev = byTitle.get(key);
    if (!prev) {
      byTitle.set(key, { name, index: i, pub: p });
      return;
    }
    const where = `["${String(p.title || '').slice(0, 45)}"] ${prev.name}[${prev.index}] vs ${name}[${i}]`;
    const tagsOf = pub => JSON.stringify([...(pub.funding_tags || [])].sort());
    if (tagsOf(prev.pub) !== tagsOf(p)) warnings.push(`${where} — funding_tags 불일치`);
    if ((prev.pub.bibtex || '') !== (p.bibtex || '')) warnings.push(`${where} — bibtex 불일치`);
    // url은 비교하지 않는다. 같은 논문이라도 교수마다 자기 Scholar 인용 페이지를 가리키므로
    // 값이 다른 것이 정상이다 — docs/archive-cleanup-2026-09.md 5절이 "통일하지 않았다"고 결정한 사항이다.
    // 설계상 달라야 하는 값을 매번 경고로 올리는 바람에 12건이 쌓여 실제 조치가 필요한
    // bibtex 불일치 경고가 출력 잘림(MAX_LIST) 뒤로 밀려 보이지 않았다.
  });
}

// 데이터가 정리돼 더 이상 위반하지 않는 예외 항목은 목록에서 지울 수 있다고 알린다.
for (const [kind, keys] of reviewPending) {
  for (const key of keys) {
    if (!reviewPendingHit.has(`${kind}:${key}`)) {
      warnings.push(`확인 대기 목록(${kind})에 더 이상 위반하지 않는 항목이 있음 — validate_data.cjs에서 제거 가능: "${key.slice(0, 50)}"`);
    }
  }
}

// 경고를 잘라내면 목록 끝에 오는 교수 간 불일치 경고부터 숨는다.
// 30이던 시절 실제로 그랬다("... 외 13건"). 전부 보이도록 넉넉히 잡는다.
const MAX_LIST = 60;
if (warnings.length) {
  console.warn(`\n경고 ${warnings.length}건 (빌드는 계속 진행):`);
  warnings.slice(0, MAX_LIST).forEach(w => console.warn('  -', w));
  if (warnings.length > MAX_LIST) console.warn(`  ... 외 ${warnings.length - MAX_LIST}건`);
}

if (errors.length) {
  console.error(`\n검증 실패 ${errors.length}건:`);
  errors.forEach(e => console.error('  -', e));
  process.exit(1);
}
console.log('\n검증 통과: publications.json 무결성 이상 없음');
