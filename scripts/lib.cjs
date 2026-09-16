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

// 정규화 제목끼리 동일하거나, 40자 이상일 때 한쪽이 다른 쪽을 포함하면 같은 논문으로 간주
function titlesMatch(normA, normB) {
  if (!normA || !normB) return false;
  if (normA === normB) return true;
  const minLength = Math.min(normA.length, normB.length);
  return minLength >= 40 && (normA.includes(normB) || normB.includes(normA));
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
  PI_NAME_VARIANTS,
  FRONT_MATTER_TITLE,
  RETRACTED_TITLE,
  PREPRINT_VENUE,
  decodeHtml,
  stripTags,
  normalize,
  titlesMatch,
  isJunkTitle,
  hasPiAuthor,
  venuesMatch,
  scholarCitationUrl,
  compactTextFromHtml,
  fetchText,
  sleep,
};
