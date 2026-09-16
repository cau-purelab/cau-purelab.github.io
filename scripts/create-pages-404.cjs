/**
 * create-pages-404.cjs — GitHub Pages용 정적 산출물 생성 (vite build 이후 실행).
 *
 *  1. 라우트별 정적 HTML: dist/research.html, dist/people.html … (scripts/site.cjs의 ROUTES)
 *     GitHub Pages는 확장자 없는 경로를 <name>.html로 200 서빙하므로, 딥링크가 404 대신 200이 된다.
 *     각 파일은 dist/index.html(SPA 셸)을 그대로 복사한 뒤 title, description, og 태그, canonical만 치환한다.
 *     → 런타임 동작 변경 없음. JS를 실행하지 않는 크롤러·링크 미리보기 스크래퍼가 페이지별 메타를 본다.
 *  2. dist/404.html: 미지 경로 전용 폴백. canonical을 빼고 noindex를 붙여 soft-404를 막는다.
 *  3. dist/sitemap.xml, dist/robots.txt: 같은 ROUTES와 SITE_URL에서 생성 (도메인 하드코딩 제거).
 */
const fs = require('node:fs');
const path = require('node:path');
const {
  SITE_URL,
  ROUTES,
  NOT_FOUND,
  OG_IMAGE_PATH,
  absoluteUrl,
  resolveLastmod,
  checkConstantsInSync,
} = require('./site.cjs');

const distDir = path.resolve(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  throw new Error('dist/index.html was not found. Run vite build before creating the Pages fallback.');
}

// site.cjs ↔ constants.tsx 도메인 정합성 (배포 전 게이트)
checkConstantsInSync();

const template = fs.readFileSync(indexPath, 'utf8');

// 제3자 도메인 허용 목록 — 이 외의 절대 origin이 index.html에 남아 있으면 도메인 전환 누락으로 본다.
const ALLOWED_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://schema.org',
  'https://scholar.google.com',
  'https://sites.google.com',
  'https://github.com',
  'https://www.w3.org',
];

function assertNoStaleOrigin(html) {
  const stale = [...new Set([...html.matchAll(/https?:\/\/[A-Za-z0-9.-]+/g)].map(m => m[0]))].filter(
    origin => origin !== SITE_URL && !ALLOWED_ORIGINS.includes(origin)
  );
  if (stale.length) {
    throw new Error(
      `index.html에 SITE_URL(${SITE_URL})과 다른 절대 origin이 남아 있음: ${stale.join(', ')}. ` +
        '도메인을 바꿨다면 index.html · scripts/site.cjs · src/constants.tsx를 함께 고칠 것. ' +
        '의도적으로 추가한 제3자 도메인이면 이 파일의 ALLOWED_ORIGINS에 넣을 것.'
    );
  }
}

assertNoStaleOrigin(template);

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * 패턴에 정확히 한 번 매칭되는 태그를 교체한다.
 * index.html이 바뀌어 매칭이 깨지면 조용히 넘어가지 않고 빌드를 세운다.
 */
function replaceOnce(html, pattern, replacement, label) {
  const matches = [...html.matchAll(pattern)];
  if (matches.length !== 1) {
    throw new Error(
      `dist/index.html에서 ${label} 태그를 정확히 1개 찾지 못함(${matches.length}개). ` +
        'index.html을 수정했다면 scripts/create-pages-404.cjs의 치환 패턴도 함께 고칠 것.'
    );
  }
  const match = matches[0];
  return html.slice(0, match.index) + replacement + html.slice(match.index + match[0].length);
}

/** 라우트 메타를 주입한 HTML 문자열을 만든다. canonicalUrl이 null이면 canonical 자리를 noindex로 바꾼다. */
function renderPage({ title, description, canonicalUrl }) {
  const safeTitle = escapeAttr(title);
  const safeDescription = escapeAttr(description);
  const ogImage = `${SITE_URL}${OG_IMAGE_PATH}`;

  let html = template;
  html = replaceOnce(html, /<title>[\s\S]*?<\/title>/g, `<title>${safeTitle}</title>`, '<title>');
  html = replaceOnce(
    html,
    /<meta[^>]*name="description"[\s\S]*?\/?>/g,
    `<meta data-rh="true" name="description" content="${safeDescription}" />`,
    'meta[name=description]'
  );
  html = replaceOnce(
    html,
    /<link[^>]*rel="canonical"[\s\S]*?\/?>/g,
    canonicalUrl
      ? `<link data-rh="true" rel="canonical" href="${escapeAttr(canonicalUrl)}" />`
      : `<meta name="robots" content="noindex" />`,
    'link[rel=canonical]'
  );
  html = replaceOnce(
    html,
    /<meta[^>]*property="og:title"[\s\S]*?\/?>/g,
    `<meta data-rh="true" property="og:title" content="${safeTitle}" />`,
    'meta[property=og:title]'
  );
  html = replaceOnce(
    html,
    /<meta[^>]*property="og:description"[\s\S]*?\/?>/g,
    `<meta data-rh="true" property="og:description" content="${safeDescription}" />`,
    'meta[property=og:description]'
  );
  html = replaceOnce(
    html,
    /<meta[^>]*property="og:url"[\s\S]*?\/?>/g,
    `<meta data-rh="true" property="og:url" content="${escapeAttr(canonicalUrl || absoluteUrl('/'))}" />`,
    'meta[property=og:url]'
  );
  html = replaceOnce(
    html,
    /<meta[^>]*property="og:image"\s+content="[^"]*"[\s\S]*?\/?>/g,
    `<meta data-rh="true" property="og:image" content="${ogImage}" />`,
    'meta[property=og:image]'
  );
  html = replaceOnce(
    html,
    /<meta[^>]*name="twitter:title"[\s\S]*?\/?>/g,
    `<meta data-rh="true" name="twitter:title" content="${safeTitle}" />`,
    'meta[name=twitter:title]'
  );
  html = replaceOnce(
    html,
    /<meta[^>]*name="twitter:description"[\s\S]*?\/?>/g,
    `<meta data-rh="true" name="twitter:description" content="${safeDescription}" />`,
    'meta[name=twitter:description]'
  );
  html = replaceOnce(
    html,
    /<meta[^>]*name="twitter:image"[\s\S]*?\/?>/g,
    `<meta data-rh="true" name="twitter:image" content="${ogImage}" />`,
    'meta[name=twitter:image]'
  );

  return html;
}

// 1) 라우트별 HTML
for (const route of ROUTES) {
  const html = renderPage({
    title: route.title,
    description: route.description,
    canonicalUrl: absoluteUrl(route.path),
  });
  fs.writeFileSync(path.join(distDir, route.file), html, 'utf8');
}
console.log(`라우트 HTML ${ROUTES.length}개 생성: ${ROUTES.map(r => r.file).join(', ')}`);

// 2) 404 폴백 (canonical 없음 + noindex)
fs.writeFileSync(
  path.join(distDir, NOT_FOUND.file),
  renderPage({ title: NOT_FOUND.title, description: NOT_FOUND.description, canonicalUrl: null }),
  'utf8'
);
console.log('Created dist/404.html for GitHub Pages SPA fallback.');

// 3) sitemap.xml
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(
  route => `  <url>
    <loc>${absoluteUrl(route.path)}</loc>
    <lastmod>${resolveLastmod(route.lastmod)}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8');
console.log(`dist/sitemap.xml 생성 완료 (${ROUTES.length}건)`);

// 4) robots.txt
const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
fs.writeFileSync(path.join(distDir, 'robots.txt'), robots, 'utf8');
console.log('dist/robots.txt 생성 완료');
