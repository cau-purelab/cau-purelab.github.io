// scripts 공용 유틸 — sync_scholar.cjs / update_scholar_metrics.cjs에서 사용
const PROFILES = {
  'Seungmin Rho': 'k5aAQxUAAAAJ',
  'Mi Young Lee': 'bxWgGnoAAAAJ',
};

const SITES_URL = 'https://sites.google.com/view/seungminrho/home';

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

// 정규화 제목끼리 동일하거나, 40자 이상일 때 한쪽이 다른 쪽을 포함하면 같은 논문으로 간주
function titlesMatch(normA, normB) {
  if (!normA || !normB) return false;
  if (normA === normB) return true;
  const minLength = Math.min(normA.length, normB.length);
  return minLength >= 40 && (normA.includes(normB) || normB.includes(normA));
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  PROFILES,
  SITES_URL,
  USER_AGENT,
  decodeHtml,
  stripTags,
  normalize,
  titlesMatch,
  compactTextFromHtml,
  fetchText,
  sleep,
};
