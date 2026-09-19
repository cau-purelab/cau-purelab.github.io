// scripts 공용 유틸 — sync_scholar.cjs / update_scholar_metrics.cjs에서 사용
const PROFILES = {
  'Seungmin Rho': 'k5aAQxUAAAAJ',
  'Mi Young Lee': 'bxWgGnoAAAAJ',
};

const SITES_URL = 'https://sites.google.com/view/seungminrho/home';

// PI 이름 표기 변형 — Scholar 상세의 Authors 필드에 하나도 없으면 타인/동명이인 논문으로 본다.
// (src/constants.tsx의 PI_NAME_VARIANTS와 같은 목적. 스크립트에서 tsx를 import할 수 없어 여기 둔다.
//  'M. Lee'처럼 과도하게 일반적인 표기는 오탐이 많아 제외한다.)
const PI_NAME_VARIANTS = {
  'Seungmin Rho': ['Seungmin Rho', 'Rho, Seungmin', 'S Rho', 'S. Rho', 'SM Rho', 'S.M. Rho'],
  'Mi Young Lee': ['Mi Young Lee', 'Lee, Mi Young', 'Mi-Young Lee', 'Miyoung Lee', 'MY Lee', 'M.Y. Lee', 'M. Y. Lee'],
};

// 논문이 아닌 Scholar 레코드(환영사·위원회 명단·특집호 서문 등) 제목 패턴
// 주의: 2026-09-17 실행에서 'CUTE 2010 Organization'·'Future Information Technology (24 Papers)' 계열이
// 통과해 PR에 섞였다. 학회 조직 명단과 논문집 묶음 레코드를 추가로 막는다.
const FRONT_MATTER_TITLE =
  /^welcome to|welcome message|program committee|organizing committee|^message from|reviewers?$|committees?(\s*\(|$)|guest editorial|special (issue|section)|^preface|^foreword|\borganization$|\(\d+\s*papers?\)|^(front|back)\s*matter|table of contents|author index|^proceedings of/i;

// 철회 논문 제목 패턴 (Scholar가 'RETRACTED ARTICLE:' 접두를 붙인다)
const RETRACTED_TITLE = /^\[?\s*retracted/i;

// 프리프린트·국내 학술발표 등 정식 출판물로 볼 수 없는 레코드
const PREPRINT_VENUE = /arxiv|preprint|학술발표|학술대회/i;

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

// 정규화 제목끼리 동일하거나, 40자 이상일 때 한쪽이 다른 쪽을 포함하면 같은 논문으로 간주.
// 이 판정만 자동 반영(출판 전환·URL 보강·중복 제외)에 쓰이므로 느슨하게 만들지 않는다.
// 제목이 손질된 경우는 아래 renameCandidate가 따로 보고만 한다.
function titlesMatch(normA, normB) {
  if (!normA || !normB) return false;
  if (normA === normB) return true;
  const minLength = Math.min(normA.length, normB.length);
  return minLength >= 40 && (normA.includes(normB) || normB.includes(normA));
}

// ──────────────────────────────────────────────
// 제목 변경 탐지 — 투고 제목이 손질된 채 출판된 논문 찾기
// ──────────────────────────────────────────────
// 예: "MSTCA Framework: Advancing Medical Deepfake Detection with Multiscale Spatial Transformers
//      and Convolutional Attention" (Scientific Reports, Submitted)
//   → "Medical Deepfake Detection with Multiscale Spatial Transformers and Cross-Attention"
//      (CMC, Accepted)
// titlesMatch로는 잡히지 않아 "Sites에서 사라졌으나 Scholar에도 없음" 경고만 반복됐다.

// 복수형 s를 떼어 "transformers/transformer"를 같은 토큰으로 본다.
const stemToken = token =>
  token.length >= 4 && token.endsWith('s') && !token.endsWith('ss') ? token.slice(0, -1) : token;

// 어느 논문 제목에나 흔해 식별에 도움이 안 되는 단어 — 겹쳐도 같은 논문이라는 근거가 못 된다.
// 목록도 stemToken을 거쳐 저장한다. 그러지 않으면 'analysis'가 'analysi'로 잘려 불용어를 빠져나간다.
const TITLE_STOPWORDS = new Set(
  [
    'a', 'an', 'the', 'and', 'or', 'of', 'for', 'in', 'on', 'with', 'to', 'via', 'using', 'by',
    'from', 'into', 'at', 'as', 'is', 'are', 'be', 'it', 'its', 'their', 'this', 'that', 'through',
    'toward', 'over', 'under', 'between', 'across', 'against', 'novel', 'new', 'approach',
    'framework', 'method', 'methods', 'model', 'models', 'study', 'studies', 'analysis', 'based',
    'use', 'system', 'systems',
  ].map(stemToken)
);

// 제목을 내용어 집합으로 자른다.
function titleTokens(value) {
  const tokens = decodeHtml(stripTags(value || ''))
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map(stemToken)
    .filter(token => token.length >= 2 && !TITLE_STOPWORDS.has(token));
  return [...new Set(tokens)];
}

// dice = 전체 겹침 정도, containment = 짧은 제목이 긴 제목에 얼마나 들어 있는지.
// 제목이 줄어드는 방향의 수정(부제 삭제 등)은 dice가 낮아도 containment가 높게 나온다.
function titleSimilarity(a, b) {
  const tokensA = titleTokens(a);
  const tokensB = titleTokens(b);
  const min = Math.min(tokensA.length, tokensB.length);
  if (!min) return { shared: 0, min: 0, dice: 0, containment: 0 };
  const setB = new Set(tokensB);
  const shared = tokensA.filter(token => setB.has(token)).length;
  return {
    shared,
    min,
    dice: (2 * shared) / (tokensA.length + tokensB.length),
    containment: shared / min,
  };
}

// "Fizza Bukhari" / "F Bukhari" / "M.Y. Lee" → "bukhari|f" 처럼 성+이름 첫 글자로 맞춘다.
// Scholar는 이름을 축약하므로 전체 표기로는 절대 안 맞고, 성만 보면 동명 저자가 뭉친다.
function authorKeys(value) {
  const keys = String(value || '')
    .split(/[,;，；]|\band\b/i)
    .map(part => part.replace(/[^\p{L}\s.'-]/gu, ' ').trim())
    .filter(Boolean)
    .map(part => {
      const words = part.split(/[\s.]+/).filter(Boolean);
      if (!words.length) return null;
      const surname = normalize(words[words.length - 1]);
      const initial = normalize(words[0]).slice(0, 1);
      return surname.length >= 2 && initial ? `${surname}|${initial}` : null;
    })
    .filter(Boolean);
  return [...new Set(keys)];
}

// 저자 집합이 얼마나 겹치는지. 한쪽 저자를 모르면 신호 없음(null)이다 — 불일치로 단정하지 않는다.
function authorSimilarity(a, b) {
  const keysA = authorKeys(a);
  const keysB = authorKeys(b);
  if (!keysA.length || !keysB.length) return null;
  const setB = new Set(keysB);
  const shared = keysA.filter(key => setB.has(key)).length;
  return { shared, ratio: shared / Math.min(keysA.length, keysB.length) };
}

// 후보 문턱. 주의: 이 값들만으로는 오탐이 걸러지지 않는다 — 아카이브 전수 쌍에 문턱만 적용하면
// 같은 팀의 확장판·후속 논문(예: "… part I" ↔ "… part II")이 high로 올라온다.
// 실제 안전장치는 호출부의 세 겹 필터다: ① Sites in-review에서 사라진 항목만 대상으로 삼고
// ② 이미 json에 별도 논문으로 등재된 제목은 후보에서 빼며 ③ 결과를 자동 반영하지 않고 보고만 한다.
// 문턱은 사람이 훑을 후보 수를 줄이는 역할이지 정확성의 근거가 아니다.
const RENAME_MIN_TOKENS = 4; // 양쪽 모두 내용어 4개 이상일 때만 비교한다
const RENAME_MIN_SHARED = 4; // 겹치는 내용어가 4개 미만이면 우연일 수 있다
const RENAME_MIN_CONTAINMENT = 0.7; // 짧은 쪽 제목의 70% 이상이 긴 쪽에 들어 있을 것
const RENAME_MIN_DICE = 0.55; // 한쪽이 통째로 들어가도 나머지가 너무 다르면 다른 논문이다

/**
 * 두 항목이 "제목만 바뀐 같은 논문"일 가능성을 판정한다. titlesMatch가 실패한 쌍만 넘긴다.
 * 인자: { title, author?, year? }
 * 반환: 후보가 아니면 null, 맞으면 { title, authors, yearClose, confidence }.
 * confidence가 high여도 자동 반영하지 않는다 — 호출부는 보고만 하고 사람이 제목을 맞춘다.
 */
function renameCandidate(a, b) {
  const title = titleSimilarity(a.title, b.title);
  if (title.min < RENAME_MIN_TOKENS || title.shared < RENAME_MIN_SHARED) return null;
  if (title.containment < RENAME_MIN_CONTAINMENT || title.dice < RENAME_MIN_DICE) return null;

  const authors = authorSimilarity(a.author, b.author);
  const yearA = Number((String(a.year || '').match(/(?:19|20)\d{2}/) || [])[0]);
  const yearB = Number((String(b.year || '').match(/(?:19|20)\d{2}/) || [])[0]);
  const yearClose = yearA && yearB ? Math.abs(yearA - yearB) <= 1 : null;

  // 저자가 실제로 겹치는지가 가장 강한 신호다. 제목만 비슷하면 낮은 확신으로 남긴다.
  const strongAuthors = Boolean(authors && authors.shared >= 2 && authors.ratio >= 0.6);
  const confidence =
    strongAuthors && yearClose !== false && title.dice >= 0.7
      ? 'high'
      : strongAuthors || title.dice >= 0.85
        ? 'medium'
        : 'low';
  return { title, authors, yearClose, confidence };
}

// 논문이 아닌 레코드(front matter) 또는 철회 논문이면 true — sync 자동 추가에서 제외한다
function isJunkTitle(title) {
  const value = String(title || '').trim();
  if (!value) return true;
  return FRONT_MATTER_TITLE.test(value) || RETRACTED_TITLE.test(value);
}

// Scholar 상세의 Authors 필드에 해당 교수의 이름 변형이 있는지 검사 (타인 논문 자동 유입 차단)
function hasPiAuthor(authorsText, piName) {
  const variants = PI_NAME_VARIANTS[piName];
  if (!variants) return true; // 등록되지 않은 프로필에는 게이트를 적용하지 않음
  const haystack = normalize(authorsText || '');
  if (!haystack) return false; // Authors 부재 → 검증 불가이므로 추가하지 않음
  return variants.some(variant => haystack.includes(normalize(variant)));
}

// 학술지명 비교 — 표기 차이(권/호/구두점)를 무시하고 한쪽이 다른 쪽을 포함하면 같은 학술지로 본다
function venuesMatch(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return true; // 한쪽을 모르면 불일치로 단정하지 않음
  if (na === nb) return true;
  // 짧은 약칭이 우연히 포함되는 것을 막되, "Array" 같은 5자 학술지명은 비교 가능하게 둔다
  const minLength = Math.min(na.length, nb.length);
  return minLength >= 5 && (na.includes(nb) || nb.includes(na));
}

// Scholar 상세 링크에서 user / citation_for_view 만 남겨 재조립한다.
// (프로필 페이지 href에는 cstart·pagesize 같은 페이징 파라미터가 섞여 들어온다)
function scholarCitationUrl(href) {
  if (!href) return null;
  const raw = String(href);
  const citation = (raw.match(/[?&]citation_for_view=([^&]+)/) || [])[1];
  if (!citation) return `https://scholar.google.com${raw}`;
  const user = (raw.match(/[?&]user=([^&]+)/) || [])[1];
  const params = ['view_op=view_citation'];
  if (user) params.push(`user=${decodeURIComponent(user)}`);
  params.push(`citation_for_view=${decodeURIComponent(citation)}`);
  return `https://scholar.google.com/citations?${params.join('&')}`;
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ──────────────────────────────────────────────
// 네트워크 — 재시도/백오프
// ──────────────────────────────────────────────
// Google Scholar는 요청 IP에 따라 403(봇 차단)을 돌려준다. 주간 예약 실행 10회 중 6회가 403으로
// 죽었고 같은 커밋을 1분 뒤 다시 돌리면 성공했다 — 러너 IP 운이므로 재시도할 가치가 있는 실패다.
// 404처럼 다시 눌러도 결과가 같은 실패는 재시도하지 않는다.
const RETRYABLE_STATUS = new Set([403, 408, 425, 429, 500, 502, 503, 504]);
const FETCH_ATTEMPTS = 5; // 최초 1회 + 재시도 4회
const FETCH_BASE_DELAY_MS = 1500; // 1.5s → 3s → 6s → 12s (지터 ±25%)
const FETCH_MAX_DELAY_MS = 15000;
const FETCH_WAIT_BUDGET_MS = 60000; // URL 하나에 쓰는 총 대기 상한 — 워크플로를 끌지 않게
const FETCH_TIMEOUT_MS = 30000; // 응답 없는 연결에 매달리지 않는다

class FetchError extends Error {
  constructor(message, { url, status = null, attempts = 1 }) {
    super(message);
    this.name = 'FetchError';
    this.url = url;
    this.status = status; // HTTP 상태. 네트워크 오류·타임아웃이면 null
    this.attempts = attempts;
  }
}

// Retry-After는 초 단위 정수 또는 HTTP-date로 온다. 해석되지 않으면 null.
function parseRetryAfter(value) {
  if (!value) return null;
  const seconds = Number(String(value).trim());
  if (Number.isFinite(seconds) && seconds >= 0) return Math.round(seconds * 1000);
  const at = Date.parse(value);
  if (Number.isFinite(at)) return Math.max(0, at - Date.now());
  return null;
}

// 지수 백오프 + 지터. 지터가 없으면 재시도가 같은 간격으로 몰려 차단이 그대로 재현된다.
function backoffDelay(attempt) {
  const base = Math.min(FETCH_BASE_DELAY_MS * 2 ** (attempt - 1), FETCH_MAX_DELAY_MS);
  return Math.round(base * (0.75 + Math.random() * 0.5));
}

/**
 * 재시도·백오프가 붙은 GET. 기존 호출부는 `fetchText(url)` 그대로 쓰면 된다.
 * 재시도 로그는 stderr로 나가므로 워크플로 로그에서 실패 원인이 보인다.
 * 끝내 실패하면 status를 담은 FetchError를 던진다(호출부가 치명/비치명을 구분할 수 있게).
 */
async function fetchText(url, { attempts = FETCH_ATTEMPTS, label = url } = {}) {
  const maxAttempts = Math.max(1, attempts); // 0 이하가 들어와 한 번도 시도하지 않는 일은 막는다
  let waited = 0;
  let failure = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let retryAfterMs = null;

    try {
      const response = await fetch(url, {
        headers: { 'user-agent': USER_AGENT },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (response.ok) return await response.text();
      failure = new FetchError(`HTTP ${response.status} — ${label}`, {
        url,
        status: response.status,
        attempts: attempt,
      });
      retryAfterMs = parseRetryAfter(response.headers.get('retry-after'));
    } catch (error) {
      failure = new FetchError(`네트워크 오류 (${error.message}) — ${label}`, { url, status: null, attempts: attempt });
    }

    const retryable = failure.status === null || RETRYABLE_STATUS.has(failure.status);
    if (!retryable || attempt === maxAttempts) break;

    const backoff = backoffDelay(attempt);
    const delay = Math.max(retryAfterMs ?? 0, backoff);
    if (waited + delay > FETCH_WAIT_BUDGET_MS) {
      console.warn(`  ↻ 재시도 중단 — 대기 예산 ${Math.round(FETCH_WAIT_BUDGET_MS / 1000)}s 초과: ${failure.message}`);
      break;
    }
    waited += delay;
    // 둘 중 큰 값이 실제 대기다 — 서버가 준 값이 백오프보다 짧으면 백오프가 이긴다.
    const via = retryAfterMs !== null && retryAfterMs > backoff ? 'Retry-After' : '백오프';
    console.warn(
      `  ↻ 재시도 ${attempt}/${maxAttempts - 1} — ${failure.message} · ${(delay / 1000).toFixed(1)}s 대기(${via})`
    );
    await sleep(delay);
  }

  throw failure;
}

module.exports = {
  PROFILES,
  SITES_URL,
  USER_AGENT,
  PI_NAME_VARIANTS,
  FRONT_MATTER_TITLE,
  RETRACTED_TITLE,
  PREPRINT_VENUE,
  decodeHtml,
  stripTags,
  normalize,
  titlesMatch,
  titleTokens,
  titleSimilarity,
  authorKeys,
  authorSimilarity,
  renameCandidate,
  isJunkTitle,
  hasPiAuthor,
  venuesMatch,
  scholarCitationUrl,
  compactTextFromHtml,
  FetchError,
  fetchText,
  sleep,
};
