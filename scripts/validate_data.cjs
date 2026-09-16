/**
 * validate_data.cjs — publications.json 무결성 검증 (배포 전 CI 게이트)
 *
 * 검사 항목: JSON 유효성, 교수별 항목 수, 정규화 제목/bibtex 중복,
 * 출판 항목의 bibtex 존재, 진행 중 항목의 필수 필드,
 * 논문이 아닌 레코드(위원회 명단·특집호 서문)와 철회 논문 표기,
 * 'and others' 저자 잔존, url 형식, funding_tags 타입,
 * 연도/학술지 파싱 가능 여부, 교수 간 중복 항목의 필드 일관성.
 *
 * 오류(errors)는 exit 1 → deploy.yml에서 빌드를 중단시킨다.
 * 경고(warnings)는 기존 데이터에 이미 위반이 있는 항목이라 보고만 하고 빌드를 막지 않는다.
 * front matter / 'and others'는 신규 유입을 오류로 막되, 2026-09 정리에서 연구실 확인 대기로
 * 남긴 기존 항목(아래 REVIEW_PENDING_*)만 경고로 낮춰 배포가 막히지 않게 한다.
 */
const fs = require('fs');
const path = require('path');
const { normalize, FRONT_MATTER_TITLE, RETRACTED_TITLE } = require('./lib.cjs');

const JSON_PATH = path.join(__dirname, '..', 'src', 'data', 'publications.json');

const YEAR_IN_BIBTEX = /year\s*=\s*\{?\s*((?:19|20)\d{2})/i;
const VENUE_IN_BIBTEX = /(?:journal|booktitle|howpublished)\s*=\s*\{\s*[^}\s]/i;
const AND_OTHERS = /\band\s+others\b/i;
const HTTP_URL = /^https?:\/\//i;
const YEAR_VALUE = /^(?:19|20)\d{2}$/;

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
  if (!VENUE_IN_BIBTEX.test(bibtex)) warnings.push(`${where} — bibtex에 journal/booktitle 없음`);
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
    if ((prev.pub.url || '') !== (p.url || '')) warnings.push(`${where} — url 불일치`);
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

const MAX_LIST = 30;
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
