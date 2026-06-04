const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'publications.json');
const PROFILES = {
  'Seungmin Rho': 'k5aAQxUAAAAJ',
  'Mi Young Lee': 'bxWgGnoAAAAJ',
};

const JCR_SOURCES = [
  'https://sites.google.com/view/seungminrho/home',
];

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

function decodeHtml(value) {
  return String(value || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\u00a0/g, ' ');
}

function stripTags(value) {
  return String(value || '').replace(/<[^>]*>/g, '');
}

function normalize(value) {
  return decodeHtml(stripTags(value))
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '')
    .trim();
}

function compactTextFromHtml(html) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<br\s*\/?\s*>/gi, '\n')
      .replace(/<\/p>|<\/li>|<\/h\d>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\s+\n/g, '\n');
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'user-agent': USER_AGENT } });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

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

    await new Promise(resolve => setTimeout(resolve, 250));
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

    for (const line of lines) {
      const match = line.match(regex);
      if (!match) continue;

      const title = line
        .slice(match.index + match[0].length)
        .replace(/\[[^\]]+\]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (title) {
        labels.push({
          label: match[0].replace(/^\[|\]$/g, '').replace(/\s+/g, ' ').trim(),
          titleKey: normalize(title),
          source,
        });
      }
    }
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

    for (const pub of data[name] || []) {
      const key = normalize(pub.title);
      if (!pub.is_progress && citationsByTitle.has(key)) {
        pub.citations = citationsByTitle.get(key);
        citationsUpdated += 1;
      } else if (Object.prototype.hasOwnProperty.call(pub, 'citations')) {
        delete pub.citations;
      }

      const jcr = findJcrForTitle(pub.title, jcrLabels);
      if (jcr) {
        pub.jcr = jcr.label;
        pub.jcr_source = jcr.source;
        jcrUpdated += 1;
      } else if (Object.prototype.hasOwnProperty.call(pub, 'jcr')) {
        delete pub.jcr;
        delete pub.jcr_source;
      }
    }

    summary[name] = {
      scholarRows: citationRows.length,
      publications: (data[name] || []).length,
      citationsUpdated,
      jcrUpdated,
    };
  }

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(summary, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
