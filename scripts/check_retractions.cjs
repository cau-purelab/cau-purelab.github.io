/**
 * check_retractions.cjs — 아카이브에 철회 논문이 섞였는지 Crossref로 전수 확인한다 (보고만, 파일 변경 없음)
 *
 * 철회 논문은 아카이브에 싣지 않는다(2026-10-01부터). sync는 Scholar 제목의 철회 표기만 보는데,
 * Scholar는 철회를 제목에 반영하지 않는 경우가 많다 — 2026-10 전수 확인 때 프로필에 남은 철회 논문 2편 중
 * 접두가 붙은 것은 1편뿐이었다. Crossref의 updated-by에는 출판사 공지와 Retraction Watch 데이터베이스가 함께 실려
 * 있어 이쪽이 근거가 된다.
 *
 * 게재 항목마다 제목으로 Crossref를 검색하고, 상위 후보 가운데 '같은 논문'인 레코드가
 *   ① updated-by에 retraction / withdrawal / removal을 갖고 있거나
 *   ② 철회 공지 자체('Retracted: <같은 제목>', 'Retraction Note: <같은 제목>' 등 — lib.cjs RETRACTED_TITLE)인 경우를 보고한다.
 * 같은 논문인지는 titlesMatch(정규화 제목이 같거나, 40자 이상에서 한쪽이 다른 쪽을 포함)로 판정한다. 제목이 닮았을
 * 뿐인 별개의 철회 논문이 검색에 함께 걸리기 때문이다(2026-10 실측: 4건 — 모두 별개 논문이었다).
 *
 * 사용법: node scripts/check_retractions.cjs        # 게재 항목 460건 기준 약 12분 (한 번에 한 요청)
 * 종료 코드: 0 = 의심 없음 · 1 = 철회 의심이 있거나 조회 실패가 남음(보고서를 볼 것)
 * 의심 항목은 출판사 공지를 직접 확인한 뒤 publications.json에서 지우고, 그 논문의 Scholar 레코드 ID를
 * lib.cjs의 RETRACTED_REMOVED_RECORDS에 적는다(그래야 sync가 다시 넣지 않는다). 포함 판정이 별개 논문을 엮을 수
 * 있으니 근거의 DOI가 정말 그 논문인지 본다 — 'Smart health monitoring and management system'(2024년 챕터)은
 * 앞부분이 같은 철회 FGCS 논문과 엮일 수 있는 알려진 경우다.
 */
const fs = require('fs');
const path = require('path');
const { normalize, titlesMatch, fetchText, sleep, RETRACTED_TITLE, RETRACTED_PREFIX } = require('./lib.cjs');

const JSON_PATH = path.join(__dirname, '..', 'src', 'data', 'publications.json');
const CROSSREF_ROWS = 10; // 원 논문과 철회 공지가 따로 걸리므로 1건만 보면 공지를 놓친다
// 한 번에 한 요청만 보낸다. 3개를 동시에 보냈을 때 459건 중 206번이 429로 되돌아왔고 2건은 재시도 예산을 넘겨 실패했다.
const REQUEST_GAP_MS = 300;

const RETRACTION_UPDATE = /retraction|withdrawal|removal/i;

function crossrefUrl(title) {
  const params = new URLSearchParams({
    'query.bibliographic': title,
    rows: String(CROSSREF_ROWS),
    select: 'DOI,title,updated-by,container-title',
  });
  return `https://api.crossref.org/works?${params}`;
}

// 한 항목의 Crossref 후보 중 철회 근거를 모은다. 근거가 없으면 빈 배열.
function retractionEvidence(entryTitle, items) {
  const want = normalize(entryTitle);
  const evidence = [];
  for (const item of items) {
    const title = (item.title || [''])[0] || '';
    // 공지 레코드는 철회 머리를 떼어 낸 나머지가 원 논문 제목이다
    const isNotice = RETRACTED_TITLE.test(title);
    if (!titlesMatch(normalize(title.replace(RETRACTED_PREFIX, '')), want)) continue;
    const updates = (item['updated-by'] || []).filter(u => RETRACTION_UPDATE.test(u.type || ''));
    for (const u of updates) {
      const date = ((u.updated || {})['date-time'] || '').slice(0, 10);
      evidence.push(`${item.DOI} — ${u.type} (${u.source || '출처 미상'}${date ? `, ${date}` : ''}) 공지 ${u.DOI}`);
    }
    if (isNotice) evidence.push(`${item.DOI} — 철회 공지 레코드: "${title.slice(0, 90)}"`);
  }
  return [...new Set(evidence)];
}

async function main() {
  const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  const entries = Object.entries(data).flatMap(([name, pubs]) =>
    pubs.filter(p => !p.is_progress).map(p => ({ name, title: p.title }))
  );
  const suspects = [];
  const failures = [];

  console.log(`Crossref 조회: 게재 항목 ${entries.length}건`);
  for (const [i, entry] of entries.entries()) {
    try {
      const body = JSON.parse(await fetchText(crossrefUrl(entry.title), { label: `Crossref "${entry.title.slice(0, 40)}"` }));
      const evidence = retractionEvidence(entry.title, body.message.items || []);
      if (evidence.length) suspects.push({ ...entry, evidence });
    } catch (error) {
      failures.push(`[${entry.name}] ${entry.title.slice(0, 70)} — ${error.message}`);
    }
    if ((i + 1) % 50 === 0) console.log(`  ${i + 1}/${entries.length}`);
    await sleep(REQUEST_GAP_MS);
  }

  console.log(`\n■ 철회 의심: ${suspects.length}건`);
  for (const s of suspects) console.log(`  - [${s.name}] ${s.title.slice(0, 80)}\n      ${s.evidence.join('\n      ')}`);
  console.log(`\n■ 조회 실패: ${failures.length}건`);
  failures.forEach(f => console.log(`  - ${f}`));
  return suspects.length || failures.length ? 1 : 0;
}

if (require.main === module) {
  main()
    .then(code => process.exit(code))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { retractionEvidence };
