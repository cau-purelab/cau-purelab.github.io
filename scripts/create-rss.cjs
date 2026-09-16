/**
 * create-rss.cjs — 빌드 시 src/constants.tsx의 NEWS 배열에서 dist/feed.xml(RSS 2.0)을 생성.
 * build:pages 스크립트에서 vite build 후에 실행된다.
 *
 * SITE_URL과 NEWS 파싱은 scripts/site.cjs가 단일 출처로 관리한다(도메인 하드코딩 금지).
 */
const fs = require('fs');
const path = require('path');
const { SITE_URL, readNewsItems } = require('./site.cjs');

const OUT_PATH = path.join(__dirname, '..', 'dist', 'feed.xml');

// 최신순 NEWS 항목 (파싱 실패 시 site.cjs가 throw → 빌드 중단)
const items = readNewsItems();

const escapeXml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 항목 link에 #id 앵커를 붙여 항목마다 고유 URL이 되게 한다.
// (News 페이지의 각 항목에 같은 id를 붙이면 해당 뉴스로 바로 스크롤된다. 없어도 /news로 정상 이동)
const rssItems = items.map(item => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${SITE_URL}/news#${item.id}</link>
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
