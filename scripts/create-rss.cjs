/**
 * create-rss.cjs — 빌드 시 src/constants.tsx의 NEWS 배열에서 dist/feed.xml(RSS 2.0)을 생성.
 * build:pages 스크립트에서 vite build 후에 실행된다.
 */
const fs = require('fs');
const path = require('path');

const CONSTANTS_PATH = path.join(__dirname, '..', 'src', 'constants.tsx');
const OUT_PATH = path.join(__dirname, '..', 'dist', 'feed.xml');
const SITE_URL = 'https://cau-purelab.github.io';

const src = fs.readFileSync(CONSTANTS_PATH, 'utf8');

// NEWS 항목 파싱: { id: 'nX', date: 'YYYY.MM.DD', title: '...' }
const items = [...src.matchAll(/\{\s*id:\s*'(n\d+)',\s*date:\s*'(\d{4})\.(\d{2})\.(\d{2})',\s*title:\s*'((?:[^'\\]|\\.)*)'\s*\}/g)]
  .map(m => ({
    id: m[1],
    date: new Date(Date.UTC(Number(m[2]), Number(m[3]) - 1, Number(m[4]))),
    title: m[5].replace(/\\'/g, "'"),
  }))
  .sort((a, b) => b.date.getTime() - a.date.getTime());

if (items.length === 0) {
  throw new Error('constants.tsx에서 NEWS 항목을 하나도 파싱하지 못함 — 배열 형식이 바뀌었는지 확인 필요');
}

const escapeXml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const rssItems = items.map(item => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${SITE_URL}/news</link>
      <guid isPermaLink="false">${item.id}</guid>
      <pubDate>${item.date.toUTCString()}</pubDate>
    </item>`).join('\n');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PURE Lab News</title>
    <link>${SITE_URL}/news</link>
    <description>News from PURE(Privacy, Unlearning, and Robust Engineering Lab) at Chung-Ang University</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${rssItems}
  </channel>
</rss>
`;

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, rss, 'utf8');
console.log(`dist/feed.xml 생성 완료 (${items.length}건)`);
