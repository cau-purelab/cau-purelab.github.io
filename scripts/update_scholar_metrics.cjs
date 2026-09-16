/**
 * update_scholar_metrics.cjs — 성과 지표(citation 수, 공개 JCR 라벨) 갱신
 *
 * 원칙: 이 스크립트는 값을 **추가/갱신만** 한다. 제목 매칭에 실패해도 기존 citations/jcr을
 * 삭제하지 않는다(매주 수백 줄 diff와 배지 소실의 원인이었다). 미매칭은 건수로만 보고한다.
 * JCR 라벨은 Clarivate 원자료가 아니라 연구실 공개 Google Sites에 표시된 라벨이다.
 */
const fs = require('fs');
const path = require('path');
const {
  PROFILES,
  SITES_URL,
  decodeHtml,
  stripTags,
  normalize,
  venuesMatch,
  compactTextFromHtml,
  fetchText,
  sleep,
} = require('./lib.cjs');

const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'publications.json');

const JCR_SOURCES = [SITES_URL];

// "Array (Submitted, August 2026)" / "Scientific Reports. Vol. 16, 1-23 (Feb. 2026)" → 괄호 앞 학술지명
const VENUE_LINE = /^(.+?)\s*\([^()]*20\d{2}\)$/;

async function fetchScholarRows(userId) {
  const rows = [];

  for (let cstart = 0; cstart < 1000; cstart += 100) {
    const url = `https://scholar.google.com/citations?user=${userId}&hl=en&cstart=${cstart}&pagesize=100&sortby=pubdate`;
    const html = await fetchText(url);
    const matches = [...html.matchAll(/<tr[^>]*class="gsc_a_tr"[\s\S]*?<\/tr>/g)].map(match => match[0]);
    if (matches.length === 0) break;

    for (const row of matches) {
      const titleMatch = row.match(/class="gsc_a_at">([\s\S]*?)<\/a>/);
      const citeMatch = row.match(/<td class="gsc_a_c">([\s\S]*?)<\/td>/);
      const citationText = decodeHtml(stripTags(citeMatch?.[1] || '')).trim().replace(/,/g, '');
      const citations = citationText ? Number(citationText) : 0;
      const title = decodeHtml(stripTags(titleMatch?.[1] || '')).trim();

      if (title) {
        rows.push({ title, citations: Number.isFinite(citations) ? citations : 0 });
      }
    }

    await sleep(250);
  }

  return rows;
}

async function fetchJcrLabels() {
  const labels = [];

  for (const source of JCR_SOURCES) {
    const html = await fetchText(source);
    const text = compactTextFromHtml(html);
    const regex = /\[(?:S?SCIE|SSCI)[^\]\n]{0,60}?(?:Top\s*)?\d+(?:\.\d+)?%\]/i;
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

    lines.forEach((line, index) => {
      const match = line.match(regex);
      if (!match) return;

      const title = line
        .slice(match.index + match[0].length)
        .replace(/\[[^\]]+\]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!title) return;

      // 항목 구조(3줄): "[JCR] 제목 [태그]" / "저자" / "학술지 (상태, 월 연도)"
      // 라벨이 어느 학술지를 기준으로 붙은 것인지 알아야 투고처 변경을 감지할 수 있다.
      const venueLine = lines.slice(index + 1, index + 4).find(l => VENUE_LINE.test(l));
      const venue = venueLine ? (venueLine.match(VENUE_LINE) || [])[1].trim() : '';

      labels.push({
        label: match[0].replace(/^\[|\]$/g, '').replace(/\s+/g, ' ').trim(),
        titleKey: normalize(title),
        venue,
        source,
      });
    });
  }

  return labels;
}

function findJcrForTitle(title, labels) {
  const normalized = normalize(title);
  if (!normalized) return null;

  return (
    labels.find(label => {
      if (label.titleKey === normalized) return true;
      const minLength = Math.min(label.titleKey.length, normalized.length);
      return minLength >= 40 && (label.titleKey.includes(normalized) || normalized.includes(label.titleKey));
    }) || null
  );
}

async function main() {
  const data = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
  const jcrLabels = await fetchJcrLabels();
  const summary = {};

  for (const [name, userId] of Object.entries(PROFILES)) {
    const citationRows = await fetchScholarRows(userId);
    const citationsByTitle = new Map(citationRows.map(row => [normalize(row.title), row.citations]));

    let citationsUpdated = 0;
    let jcrUpdated = 0;
    let citationsUnmatched = 0;
    let jcrUnmatched = 0;
    let jcrJournalMismatch = 0;

    for (const pub of data[name] || []) {
      const key = normalize(pub.title);
      if (!pub.is_progress && citationsByTitle.has(key)) {
        pub.citations = citationsByTitle.get(key);
        citationsUpdated += 1;
      } else if (!pub.is_progress) {
        // 제목 표기 차이만으로도 매칭이 실패한다. 예전처럼 여기서 지우면 매주 수백 줄 churn과
        // 배지 소실이 반복되므로 기존 값은 그대로 두고 건수만 기록한다.
        citationsUnmatched += 1;
      }

      const jcr = findJcrForTitle(pub.title, jcrLabels);
      if (!jcr) {
        if (Object.prototype.hasOwnProperty.call(pub, 'jcr')) jcrUnmatched += 1;
        continue;
      }
      // 진행 중 논문은 투고처가 바뀌면 예전 학술지 기준 라벨이 되므로 붙이지 않는다.
      if (pub.is_progress && pub.journal && jcr.venue && !venuesMatch(jcr.venue, pub.journal)) {
        jcrJournalMismatch += 1;
        continue;
      }
      pub.jcr = jcr.label;
      pub.jcr_source = jcr.source;
      jcrUpdated += 1;
    }

    summary[name] = {
      scholarRows: citationRows.length,
      publications: (data[name] || []).length,
      citationsUpdated,
      citationsUnmatched, // Scholar에서 제목을 못 찾은 출판 항목 수 (값은 보존됨)
      jcrUpdated,
      jcrUnmatched, // 기존 jcr이 있으나 Sites 라벨을 못 찾은 항목 수 (값은 보존됨)
      jcrJournalMismatch, // 투고처가 달라 라벨을 반영하지 않은 진행 중 항목 수
    };
  }

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

  for (const [name, stat] of Object.entries(summary)) {
    if (stat.citationsUnmatched || stat.jcrUnmatched || stat.jcrJournalMismatch) {
      console.warn(
        `[${name}] 미매칭 — citations ${stat.citationsUnmatched}건, jcr ${stat.jcrUnmatched}건, ` +
          `투고처 불일치 ${stat.jcrJournalMismatch}건 (기존 값은 보존함)`
      );
    }
  }
  console.log(JSON.stringify(summary, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
