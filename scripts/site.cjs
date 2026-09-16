/**
 * site.cjs — 사이트 전역 설정(정본 URL·라우트 목록)의 단일 출처 + constants.tsx 파싱 유틸.
 *
 * create-pages-404.cjs(라우트별 HTML·sitemap.xml·robots.txt 생성)와
 * create-rss.cjs(feed.xml 생성)가 이 파일을 공유한다.
 *
 * ⚠ SITE_URL은 src/constants.tsx의 LAB_URL과 항상 같은 값이어야 한다.
 *   `node scripts/site.cjs`(deploy.yml의 "Validate site configuration" 스텝)가 불일치를 배포 전에 잡는다.
 *   커스텀 도메인(public/CNAME = pure.cau.ac.kr)의 TLS 인증서가 발급된 뒤에만 도메인을 전환할 것.
 *   전환 절차는 README.md의 "도메인 전환 절차" 절 참고.
 */
const fs = require('node:fs');
const path = require('node:path');

// 현재 정본 URL. 도메인 전환 시 이 줄 + src/constants.tsx의 LAB_URL + package.json의 homepage를 함께 바꾼다.
const SITE_URL = 'https://pure.cau.ac.kr';

// GitHub Pages 설정에 등록된 커스텀 도메인 (public/CNAME과 같은 값).
// 인증서 미발급 상태라 아직 SITE_URL로 승격하지 않았다.
const CUSTOM_DOMAIN = 'pure.cau.ac.kr';

const TITLE_SUFFIX = 'PURE Lab, Chung-Ang University';
const OG_IMAGE_PATH = '/assets/og-image.png'; // 1200x630 PNG
const OG_IMAGE_SIZE = { width: 1200, height: 630, type: 'image/png' };

/**
 * 정적 HTML을 만들 라우트 목록. src/App.tsx의 <Route path=...>와 1:1로 유지할 것.
 * - file     : dist에 생성할 파일명. GitHub Pages는 확장자 없는 경로를 <name>.html로 200 서빙한다
 *              (디렉터리 방식은 301 리다이렉트가 붙으므로 파일 방식을 쓴다).
 * - lastmod  : sitemap의 <lastmod> 출처. 'publications' | 'news' | 'latest' | 'build'
 */
const ROUTES = [
  {
    path: '/',
    file: 'index.html',
    title: 'PURE Lab, Chung-Ang University — Privacy-Preserving AI Research',
    description:
      'PURE Lab at Chung-Ang University, led by Prof. Seungmin Rho, researches privacy-preserving AI, machine unlearning, and robust AI engineering.',
    changefreq: 'weekly',
    priority: '1.0',
    lastmod: 'latest',
  },
  {
    path: '/research',
    file: 'research.html',
    title: `Research | ${TITLE_SUFFIX}`,
    description:
      'Research areas of PURE Lab, Chung-Ang University: privacy-preserving AI, machine unlearning, and robust AI engineering for trustworthy systems.',
    changefreq: 'monthly',
    priority: '0.8',
    lastmod: 'build',
  },
  {
    path: '/people',
    file: 'people.html',
    title: `People | ${TITLE_SUFFIX}`,
    description:
      'Members of PURE Lab at Chung-Ang University — Prof. Seungmin Rho (PI), Prof. Mi Young Lee (Co-PI), Ph.D. students, and master students.',
    changefreq: 'monthly',
    priority: '0.8',
    lastmod: 'build',
  },
  {
    path: '/publications',
    file: 'publications.html',
    title: `Selected Publications | ${TITLE_SUFFIX}`,
    description:
      'Selected publications of PURE Lab, Chung-Ang University on privacy-preserving AI, machine unlearning, and robust AI engineering.',
    changefreq: 'monthly',
    priority: '0.9',
    lastmod: 'publications',
  },
  {
    path: '/scholar',
    file: 'scholar.html',
    title: `Publication Archive | ${TITLE_SUFFIX}`,
    description:
      'Full publication archive of PURE Lab, Chung-Ang University, with BibTeX entries, citation counts, and research funding records per project.',
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: 'publications',
  },
  {
    path: '/news',
    file: 'news.html',
    title: `News | ${TITLE_SUFFIX}`,
    description:
      'News from PURE Lab at Chung-Ang University — conference participation, lab activities, and announcements since the lab was founded in 2024.',
    changefreq: 'monthly',
    priority: '0.6',
    lastmod: 'news',
  },
];

// GitHub Pages가 미지 경로에 돌려주는 404.html용 메타. sitemap에는 넣지 않는다.
const NOT_FOUND = {
  file: '404.html',
  title: `Page Not Found | ${TITLE_SUFFIX}`,
  description: 'The requested page was not found on the PURE Lab website at Chung-Ang University.',
};

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

  const items = [...block.matchAll(/\{[^{}]*\}/g)]
    .map(m => m[0])
    .map(entry => {
      const id = entry.match(/\bid:\s*'((?:[^'\\]|\\.)*)'/);
      const date = entry.match(/\bdate:\s*'(\d{4})\.(\d{2})\.(\d{2})'/);
      const title = entry.match(/\btitle:\s*'((?:[^'\\]|\\.)*)'/);
      if (!id || !date || !title) return null;
      return {
        id: id[1],
        date: new Date(Date.UTC(Number(date[1]), Number(date[2]) - 1, Number(date[3]))),
        title: title[1].replace(/\\'/g, "'"),
      };
    })
    .filter(Boolean)
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
        '두 값과 package.json의 homepage를 같은 도메인으로 맞출 것 (README "도메인 전환 절차" 참고).'
    );
  }
  return labUrl;
}

module.exports = {
  SITE_URL,
  CUSTOM_DOMAIN,
  TITLE_SUFFIX,
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
