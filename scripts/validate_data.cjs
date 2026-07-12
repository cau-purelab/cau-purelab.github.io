/**
 * validate_data.cjs — publications.json 무결성 검증 (배포 전 CI 게이트)
 *
 * 검사 항목: JSON 유효성, 교수별 항목 수, 정규화 제목/bibtex 중복,
 * 출판 항목의 bibtex 존재, 진행 중 항목의 필수 필드.
 * 실패 시 exit 1 → deploy.yml에서 빌드를 중단시킨다.
 */
const fs = require('fs');
const path = require('path');
const { normalize } = require('./lib.cjs');

const JSON_PATH = path.join(__dirname, '..', 'src', 'data', 'publications.json');

const errors = [];
let data;

try {
  data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
} catch (e) {
  console.error(`publications.json 파싱 실패: ${e.message}`);
  process.exit(1);
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

    if (p.is_progress) {
      for (const f of ['journal', 'status', 'year']) {
        if (!p[f]) errors.push(`${where} — 진행 중 항목에 ${f} 없음`);
      }
    } else {
      if (!p.bibtex || !p.bibtex.includes('{')) errors.push(`${where} — 출판 항목에 bibtex 없음/손상`);
      else {
        const bn = p.bibtex.replace(/\s+/g, ' ');
        if (seenBibtex.has(bn)) errors.push(`${where} — 중복 bibtex`);
        seenBibtex.add(bn);
      }
    }
  });

  console.log(`[${name}] ${pubs.length}건 검사 완료`);
}

if (errors.length) {
  console.error(`\n검증 실패 ${errors.length}건:`);
  errors.forEach(e => console.error('  -', e));
  process.exit(1);
}
console.log('\n검증 통과: publications.json 무결성 이상 없음');
