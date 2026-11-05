/**
 * site.cjs — 사이트 전역 설정(정본 URL·라우트 목록)의 단일 출처 + constants.tsx 파싱 유틸.
 *
 * create-pages-404.cjs(라우트별 HTML·sitemap.xml·robots.txt 생성)와
 * create-rss.cjs(feed.xml 생성)가 이 파일을 공유한다.
 *
 * ⚠ SITE_URL은 src/constants.tsx의 LAB_URL과 항상 같은 값이어야 한다.
 *   `node scripts/site.cjs`(deploy.yml의 "Validate site configuration" 스텝)가 불일치를 배포 전에 잡는다.
 *   커스텀 도메인(public/CNAME = pure.cau.ac.kr)은 2026-09-17에 전환을 마쳤다 — 인증서 발급(2026-09-16) +
 *   Enforce HTTPS 적용. 전환 당시 바꾼 곳과 확인 절차는 README.md의 "도메인 전환 이력 (2026-09-17 완료)" 절 참고.
 */
const fs = require('node:fs');
const path = require('node:path');

// 현재 정본 URL. 도메인 전환 시 이 줄 + src/constants.tsx의 LAB_URL + package.json의 homepage를 함께 바꾼다.
const SITE_URL = 'https://pure.cau.ac.kr';

// GitHub Pages 설정에 등록된 커스텀 도메인 (public/CNAME과 같은 값).
// 2026-09-17에 SITE_URL로 승격했으므로 지금은 SITE_URL의 호스트와 같은 값이다.
// 검증 로그에서 CNAME·Pages 설정과 대조할 수 있도록 별도 상수로 남겨 둔다.
const CUSTOM_DOMAIN = 'pure.cau.ac.kr';

const OG_IMAGE_PATH = '/assets/og-image.png'; // 1200x630 PNG
const OG_IMAGE_SIZE = { width: 1200, height: 630, type: 'image/png' };

// 라우트별 <title>·description의 단일 출처. 프런트엔드 SEO 컴포넌트(src/components/SEO.tsx)도
// 같은 파일을 읽으므로, 정적 HTML(크롤러)과 Helmet(브라우저·JS 렌더링 크롤러)이 같은 값을 낸다.
// 문구를 바꿀 때는 이 JSON만 고칠 것. scripts/prerender.cjs가 렌더 결과와 대조해 어긋나면 빌드를 멈춘다.
const SEO_ROUTES_PATH = path.join(__dirname, '..', 'src', 'data', 'seo-routes.json');
const SEO_META = JSON.parse(fs.readFileSync(SEO_ROUTES_PATH, 'utf8'));

function seoMeta(routePath) {
  const meta = SEO_META.routes[routePath];
  if (!meta || !meta.title || !meta.description) {
    throw new Error(`src/data/seo-routes.json에 '${routePath}'의 title/description이 없음`);
  }
  return meta;
}

/**
 * 정적 HTML을 만들 라우트 목록. src/App.tsx의 <Route path=...>와 1:1로 유지할 것.
 * - file     : dist에 생성할 파일명. GitHub Pages는 확장자 없는 경로를 <name>.html로 200 서빙한다
 *              (디렉터리 방식은 301 리다이렉트가 붙으므로 파일 방식을 쓴다).
 * - lastmod  : sitemap의 <lastmod> 출처. 'publications' | 'news' | 'latest' | 'build'
 * - title/description은 seo-routes.json에서 채운다.
 */
const ROUTES = [
  { path: '/', file: 'index.html', changefreq: 'weekly', priority: '1.0', lastmod: 'latest' },
  { path: '/research', file: 'research.html', changefreq: 'monthly', priority: '0.8', lastmod: 'build' },
  { path: '/people', file: 'people.html', changefreq: 'monthly', priority: '0.8', lastmod: 'build' },
  { path: '/publications', file: 'publications.html', changefreq: 'monthly', priority: '0.9', lastmod: 'publications' },
  { path: '/scholar', file: 'scholar.html', changefreq: 'monthly', priority: '0.7', lastmod: 'publications' },
  { path: '/news', file: 'news.html', changefreq: 'monthly', priority: '0.6', lastmod: 'news' },
].map(route => ({ ...route, ...seoMeta(route.path) }));

const extraRoutes = Object.keys(SEO_META.routes).filter(p => !ROUTES.some(r => r.path === p));
if (extraRoutes.length) {
  throw new Error(`seo-routes.json에만 있고 ROUTES에 없는 경로: ${extraRoutes.join(', ')}`);
}

// GitHub Pages가 미지 경로에 돌려주는 404.html용 메타. sitemap에는 넣지 않는다.
const NOT_FOUND = { file: '404.html', ...SEO_META.notFound };

const CONSTANTS_PATH = path.join(__dirname, '..', 'src', 'constants.tsx');

let constantsCache = null;
function readConstants() {
  if (constantsCache === null) constantsCache = fs.readFileSync(CONSTANTS_PATH, 'utf8');
  return constantsCache;
}

/** src/constants.tsx의 LAB_URL 값 (없으면 null) */
function readLabUrl() {
  const m = readConstants().match(/export\s+const\s+LAB_URL\s*=\s*["']([^"']+)["']/);
  return m ? m[1] : null;
}

/** src/constants.tsx의 PUBLICATIONS_UPDATED_AT 값 (YYYY-MM-DD, 없으면 null) */
function readPublicationsUpdatedAt() {
  const m = readConstants().match(/export\s+const\s+PUBLICATIONS_UPDATED_AT\s*=\s*["'](\d{4}-\d{2}-\d{2})["']/);
  return m ? m[1] : null;
}

/**
 * src/constants.tsx의 NEWS 배열을 파싱해 최신순으로 돌려준다.
 * 키 순서가 바뀌어도 깨지지 않도록 항목 블록을 먼저 잘라낸 뒤 키별로 뽑는다.
 */
function readNewsItems() {
  const src = readConstants();
  const start = src.search(/export\s+const\s+NEWS\s*(?::[^=]+)?=\s*\[/);
  if (start === -1) {
    throw new Error('constants.tsx에서 NEWS 배열 선언을 찾지 못함 — 이름이 바뀌었는지 확인 필요');
  }
  const arrayStart = src.indexOf('[', start);
  const arrayEnd = src.indexOf('];', arrayStart);
  const block = src.slice(arrayStart, arrayEnd === -1 ? undefined : arrayEnd);

  // 작은따옴표와 큰따옴표를 모두 읽는다. 한쪽만 읽던 때, 큰따옴표로 적은 항목이
  // 조용히 사라져 feed.xml에서 한 건이 빠진 적이 있다.
  const quoted = key =>
    new RegExp("\\b" + key + ":\\s*(?:'((?:[^'\\\\]|\\\\.)*)'|\"((?:[^\"\\\\]|\\\\.)*)\")");

  const items = [...block.matchAll(/\{[^{}]*\}/g)]
    .map(m => m[0])
    .map(entry => {
      const pick = key => {
        const m = entry.match(quoted(key));
        return m ? (m[1] !== undefined ? m[1] : m[2]) : null;
      };
      const id = pick("id");
      const rawDate = pick("date");
      const title = pick("title");
      const date = rawDate && rawDate.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);
      // NEWS 배열 안의 중괄호 블록은 전부 뉴스 항목이다. 못 읽었다면 형식이 어긋난 것이므로
      // 버리지 말고 멈춘다 — 조용히 빠지면 피드와 사이트맵만 틀린 채 배포된다.
      if (!id || !date || !title) {
        throw new Error(`constants.tsx의 NEWS 항목을 해석하지 못함: ${entry.trim()}`);
      }
      return {
        id,
        date: new Date(Date.UTC(Number(date[1]), Number(date[2]) - 1, Number(date[3]))),
        title: title.replace(/\\(["'])/g, "$1"),
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (items.length === 0) {
    throw new Error('constants.tsx에서 NEWS 항목을 하나도 파싱하지 못함 — 배열 형식이 바뀌었는지 확인 필요');
  }
  return items;
}

/** YYYY-MM-DD */
function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

/** 라우트의 lastmod 값을 실제 날짜 문자열로 변환 */
function resolveLastmod(kind) {
  const buildDate = isoDate(new Date());
  const pubs = readPublicationsUpdatedAt();
  let news = null;
  try {
    news = isoDate(readNewsItems()[0].date);
  } catch {
    news = null;
  }

  switch (kind) {
    case 'publications':
      return pubs || buildDate;
    case 'news':
      return news || buildDate;
    case 'latest': {
      const candidates = [pubs, news].filter(Boolean);
      return candidates.length ? candidates.sort().pop() : buildDate;
    }
    default:
      return buildDate;
  }
}

function absoluteUrl(routePath) {
  return routePath === '/' ? `${SITE_URL}/` : `${SITE_URL}${routePath}`;
}

/**
 * SITE_URL과 src/constants.tsx의 LAB_URL이 어긋나면 throw.
 * 도메인을 한쪽만 바꾼 채 배포되는 사고(canonical/og:url/sitemap 불일치)를 막는 게이트다.
 */
function checkConstantsInSync() {
  const labUrl = readLabUrl();
  if (!labUrl) {
    throw new Error('src/constants.tsx에서 LAB_URL을 찾지 못함 — scripts/site.cjs의 파싱 규칙을 확인할 것');
  }
  if (labUrl.replace(/\/$/, '') !== SITE_URL.replace(/\/$/, '')) {
    throw new Error(
      `도메인 불일치: scripts/site.cjs SITE_URL='${SITE_URL}' vs src/constants.tsx LAB_URL='${labUrl}'. ` +
        '두 값과 package.json의 homepage를 같은 도메인으로 맞출 것 (README "도메인 전환 이력" 절의 교체 대상 목록 참고).'
    );
  }
  return labUrl;
}

module.exports = {
  SITE_URL,
  CUSTOM_DOMAIN,
  OG_IMAGE_PATH,
  OG_IMAGE_SIZE,
  ROUTES,
  NOT_FOUND,
  readLabUrl,
  readPublicationsUpdatedAt,
  readNewsItems,
  resolveLastmod,
  absoluteUrl,
  checkConstantsInSync,
  isoDate,
};

// `node scripts/site.cjs`로 직접 실행하면 설정 정합성만 검사한다 (CI 게이트용).
if (require.main === module) {
  checkConstantsInSync();
  console.log(`설정 검증 통과: SITE_URL=${SITE_URL}, 라우트 ${ROUTES.length}개, 커스텀 도메인=${CUSTOM_DOMAIN}`);
}
