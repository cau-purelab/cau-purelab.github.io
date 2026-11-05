/**
 * prerender.cjs — 라우트별 본문 HTML 채우기 (create-pages-404.cjs 다음에 실행).
 *
 * create-pages-404.cjs가 만든 dist/<route>.html은 메타 태그만 라우트별이고 본문은 빈 <div id="root"></div>다.
 * JS를 거의 실행하지 않는 크롤러(네이버 Yeti 등)에는 빈 페이지로 보이므로, 빌드 시 React로 각 라우트를
 * 렌더해 #root 안에 넣는다. 브라우저에서는 main.tsx가 이 DOM을 hydrate해 그대로 이어 쓴다.
 *
 * 렌더 결과의 <title>·description이 seo-routes.json(= 정적 메타)과 다르면 빌드를 멈춘다 —
 * JS를 실행하는 크롤러(구글)가 보는 값과 실행하지 않는 크롤러가 보는 값이 갈라지지 않게 하기 위해서다.
 *
 * 404.html은 채우지 않는다: 모든 미지 경로에 같은 파일이 나가므로 본문을 미리 정할 수 없다(빈 셸 → createRoot).
 *
 * 선행 조건: `vite build --ssr src/entry-server.tsx --outDir dist-ssr` (npm run build:pages가 실행한다)
 */
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { ROUTES } = require('./site.cjs');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const serverEntry = path.join(rootDir, 'dist-ssr', 'entry-server.js');
const EMPTY_ROOT = '<div id="root"></div>';
// 본문이 이보다 짧으면 렌더가 사실상 실패한 것으로 본다(셸·로더만 나온 경우 등)
const MIN_BODY_CHARS = 2000;

function fail(message) {
  throw new Error(`[prerender] ${message}`);
}

async function main() {
  if (!fs.existsSync(serverEntry)) {
    fail(`${path.relative(rootDir, serverEntry)}가 없음 — vite build --ssr를 먼저 실행할 것`);
  }
  const { render } = await import(pathToFileURL(serverEntry).href);

  for (const route of ROUTES) {
    const file = path.join(distDir, route.file);
    const shell = fs.readFileSync(file, 'utf8');
    const slots = shell.split(EMPTY_ROOT).length - 1;
    if (slots !== 1) fail(`${route.file}에서 ${EMPTY_ROOT}를 정확히 1개 찾지 못함(${slots}개)`);

    const { html, title, description } = await render(route.path);

    if (title !== route.title) fail(`${route.path} title 불일치: 렌더 '${title}' vs seo-routes '${route.title}'`);
    if (description !== route.description) {
      fail(`${route.path} description 불일치: 렌더 '${description}' vs seo-routes '${route.description}'`);
    }
    if (html.length < MIN_BODY_CHARS || !/<h1[\s>]/.test(html)) {
      fail(`${route.path} 본문이 비정상(${html.length}자, h1 ${/<h1[\s>]/.test(html) ? '있음' : '없음'})`);
    }
    if (/aria-label="Loading page"/.test(html)) fail(`${route.path} 본문에 로딩 스피너가 남음 — lazy 청크가 풀리지 않았다`);

    fs.writeFileSync(file, shell.replace(EMPTY_ROOT, `<div id="root">${html}</div>`), 'utf8');
    console.log(`프리렌더 ${route.file.padEnd(18)} ${(html.length / 1024).toFixed(1)} KB`);
  }
}

main().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
