// src/lib/bibtex.ts
// BibTeX 파싱·저자 표기 유틸 — People.tsx와 ScholarPublications.tsx가 공유한다.
// (두 페이지에 각각 복사돼 있던 parseBibtex를 하나로 합친 것.)
//
// 정규식은 모듈 스코프에서 한 번만 만든다. 예전에는 파싱할 때마다 new RegExp를 9개씩
// 생성해 정렬 비교 함수 안에서 호출될 때 키 입력 1회당 수만 개가 만들어졌다.

export interface BibInfo {
  type?: string;
  year: string;
  author: string;
  venue: string;
  journal?: string;
  booktitle?: string;
  volume?: string;
  number?: string;
  pages?: string;
  publisher?: string;
  school?: string;
  doi?: string;
}

const TYPE_RE = /^\s*@(\w+)\s*\{/;

// 학술지 자리는 journal → booktitle → howpublished → school → publisher 순으로 찾는다.
// (프리프린트·학술지 미상 항목은 sync_scholar.cjs가 @misc + howpublished로 저장한다.)
const FIELDS = [
  'journal', 'booktitle', 'howpublished',
  'volume', 'number', 'pages', 'publisher', 'school', 'doi', 'author', 'year',
] as const;

type BibField = (typeof FIELDS)[number];

const FIELD_RES: ReadonlyArray<readonly [BibField, RegExp]> = FIELDS.map(
  (field) => [field, new RegExp(`\\b${field}\\s*=\\s*[{"]([\\s\\S]*?)[}"]`, 'i')] as const,
);

const ET_AL_RE = /^(others|et\.?\s*al\.?)$/i;

/**
 * LaTeX 이스케이프를 화면 표기로 되돌린다.
 * 예) `CMC-Computers, Materials \& Continua` → `CMC-Computers, Materials & Continua`
 * sync_scholar.cjs가 저장 시 `& % _ # $`를 백슬래시로 이스케이프하므로 그 역연산이다.
 */
export function unescapeLatex(value: string): string {
  return value
    .replace(/\\([&%_#$])/g, '$1')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** BibTeX 문자열에서 표시에 필요한 필드만 뽑는다. 값이 없으면 빈 문자열이다. */
export function parseBibtex(bib: string): BibInfo {
  const info: BibInfo = { year: '', author: '', venue: '' };
  if (!bib || !bib.includes('{')) return info;

  const typeMatch = bib.match(TYPE_RE);
  if (typeMatch) info.type = typeMatch[1].toLowerCase();

  let howpublished = '';
  for (const [field, regex] of FIELD_RES) {
    const match = bib.match(regex);
    if (!match) continue;
    const value = unescapeLatex(match[1]);
    if (!value) continue;
    if (field === 'howpublished') howpublished = value;
    else info[field] = value;
  }

  // school이 publisher보다 앞이다. school은 @phdthesis/@mastersthesis에만 쓰이는 필드이고
  // 학위논문에서는 수여 대학이 곧 게재처라 확실하다. publisher는 게재처가 아니라 발행사여서
  // 학술지명의 대체물로는 약하지만, journal/booktitle/howpublished가 전부 없는 항목
  // (@book publisher={Elsevier}, 프리프린트 publisher={Preprints} 등)에서는 남은 유일한
  // 출처 단서이므로 빈칸으로 두는 것보다 낫다. 마지막 폴백으로만 쓴다.
  info.venue = info.journal || info.booktitle || howpublished || info.school || info.publisher || '';
  return info;
}

// BibTeX는 저자를 'Last, First' 순서로 저장한다 — 화면에는 'First Last'로 되돌린다.
const reverseLastFirst = (name: string): string => {
  const comma = name.indexOf(',');
  if (comma < 0) return name;
  const last = name.slice(0, comma).trim();
  const first = name.slice(comma + 1).trim();
  return first ? `${first} ${last}` : last;
};

/**
 * 저자 문자열을 이름 배열로 나눈다.
 * @param raw 원본 문자열
 * @param isBibtexFormat BibTeX 값이면 true(구분자 ' and ', 'Last, First' 순서).
 *        수동 입력 항목(is_progress)은 false — 쉼표로 나누고 순서를 그대로 둔다.
 *        형식을 문자열로 추측하면 단독 저자 `author={Rho, Seungmin}`이 두 사람으로 쪼개진다.
 * @returns names 사람 이름만, etAl 'and others'가 있었는지 여부('et al.'로 따로 표기)
 */
export function splitAuthors(raw: string, isBibtexFormat: boolean): { names: string[]; etAl: boolean } {
  const cleaned = unescapeLatex(raw || '');
  if (!cleaned) return { names: [], etAl: false };

  const tokens = isBibtexFormat ? cleaned.split(/\s+and\s+/i) : cleaned.split(',');
  const names: string[] = [];
  let etAl = false;

  for (const token of tokens) {
    const name = token.trim();
    if (!name) continue;
    // BibTeX의 'and others'는 사람 이름이 아니라 et al. 표기다.
    if (ET_AL_RE.test(name)) {
      etAl = true;
      continue;
    }
    names.push(isBibtexFormat ? reverseLastFirst(name) : name);
  }

  return { names, etAl };
}

// 비교용 정규화: 소문자 + 알파벳만 남긴다.
// 'Seung-Min Rho' / 'SeungMin Rho' / 'S. Rho'가 모두 같은 형태가 된다.
const normalizeName = (value: string): string => value.toLowerCase().replace(/[^a-z]/g, '');

/** 저자 이름이 연구실 PI(교수) 표기 변형 중 하나인지 판정한다. */
export function isPiName(name: string, variants: string[]): boolean {
  const normalized = normalizeName(name);
  if (!normalized) return false;
  return variants.some((variant) => {
    const target = normalizeName(variant);
    // 너무 짧은 변형은 남의 이름에 우연히 포함될 수 있어 제외한다.
    return target.length >= 4 && normalized.includes(target);
  });
}
