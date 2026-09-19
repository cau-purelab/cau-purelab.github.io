import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import publicationsData from '../data/publications.json';
import SEO from '../components/SEO';
import {
  PUBLICATIONS_UPDATED_AT, PI_NAME_VARIANTS,
  FUNDING_LEGEND, METRICS_DISCLAIMER, scholarProfileUrl,
} from '../constants';
import { parseBibtex, splitAuthors, isPiName } from '../lib/bibtex';
import type { BibInfo } from '../lib/bibtex';
import { copyText } from '../lib/clipboard';
import {
  ExternalLink, Calendar, BookOpen, Search, Quote, Award,
  BarChart3, XCircle, RefreshCw, TrendingUp, AlertTriangle
} from 'lucide-react';

interface ScholarPub {
  title: string;
  url?: string;
  bibtex?: string;
  author?: string;
  journal?: string;
  year?: string;
  funding_tags?: string[];
  citations?: number;
  jcr?: string;
  jcr_source?: string;
  status?: string;
  is_progress?: boolean;
  retracted?: boolean;
}

// 화면 표시용으로 한 번만 계산해 두는 파생 값(파싱 결과·식별자·검색 색인).
interface DecoratedPub extends ScholarPub {
  bib: BibInfo;
  pubId: string;
  displayTitle: string;
  displayYear: string;
  sortYear: string;
  searchText: string;
}

const loadedPublications = publicationsData as Record<string, ScholarPub[]>;

const PAGE_SIZE = 50;
const SORT_KEYS = ['year', 'title', 'funding'] as const;
type SortKey = (typeof SORT_KEYS)[number];

// 정렬 라벨은 실제 동작과 같은 말을 해야 한다.
// 'funding'은 첫 번째 펀딩 태그의 알파벳순이지 금액·중요도순이 아니다.
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'year', label: 'Newest first' },
  { key: 'title', label: 'Title (A–Z)' },
  { key: 'funding', label: 'Funding code (A–Z)' },
];

// 게재/미게재는 사용자가 고르는 '범위'다. 예전처럼 목록 맨 위에 미게재를 고정하지 않는다.
const SCOPE_KEYS = ['published', 'progress', 'all'] as const;
type ScopeKey = (typeof SCOPE_KEYS)[number];
const DEFAULT_SCOPE: ScopeKey = 'published';
const SCOPE_OPTIONS: { key: ScopeKey; label: string }[] = [
  { key: 'published', label: 'Published' },
  { key: 'progress', label: 'In progress' },
  { key: 'all', label: 'All' },
];

// 범위 필터는 목록과 펀딩 집계가 똑같이 쓴다 — 한 곳에 두어 두 경로가 갈라지지 않게 한다.
const applyScope = (list: DecoratedPub[], scope: ScopeKey) =>
  scope === 'all' ? list : list.filter(p => (scope === 'progress' ? Boolean(p.is_progress) : !p.is_progress));

// 펀딩 패널 분모에 붙는 명사. 분모가 어떤 집합인지 숫자 옆에서 바로 읽히게 한다.
const SCOPE_NOUN: Record<ScopeKey, string> = {
  published: 'published papers',
  progress: 'in-progress papers',
  all: 'papers',
};

const UNKNOWN_YEAR = 'unknown';
// 'Prof. *' 태그는 연구비가 아니라 협력 교수 라벨이다 — 펀딩 집계·필터에서 제외한다.
const COLLABORATOR_TAG_RE = /^Prof\./i;
// 철회 논문 제목의 접두 표기. 배지로 따로 보여주므로 제목에서는 덜어낸다.
const RETRACTED_PREFIX_RE = /^(\[retracted\]|retracted article:|retracted:)\s*/i;

// BibTeX 엔트리 유형 → 표시용 라벨
const getTypeLabel = (type?: string) => {
  switch (type) {
    case 'article': return 'Journal';
    case 'inproceedings':
    case 'conference': return 'Conference';
    case 'book':
    case 'incollection':
    case 'inbook': return 'Book';
    case 'phdthesis':
    case 'mastersthesis': return 'Thesis';
    default: return 'Paper';
  }
};

// 라벨은 데이터(=Google Sites 원문)의 표기를 그대로 쓴다. 'Under Review'를 'In Review'로
// 바꿔 적으면 화면과 기준 소스가 어긋난다.
// 검사 순서는 진행 단계가 늦은 쪽부터다('Accepted after revision'은 In Press가 맞다).
// 'submitted'는 어느 단계 문구에나 섞여 들어올 수 있어('Revision submitted', 'Under review,
// resubmitted' 등) 맨 뒤의 기본값으로만 둔다.
const getProgressLabel = (status?: string) => {
  if (!status) return 'In Progress';
  const s = status.toLowerCase();
  if (s.includes('press') || s.includes('accepted')) return 'In Press';
  if (s.includes('revision')) return 'In Revision';
  if (s.includes('review')) return 'Under Review';
  if (s.includes('submitted')) return 'Submitted';
  return 'In Progress';
};

// 상단 상태 배지가 이미 단계(Submitted/In Revision)를 말한다.
// 하단 칩까지 같은 말을 반복하지 않도록 시점만 남긴다: 'Submitted, June 2026' -> 'June 2026'.
// 덧붙일 시점 정보가 없으면(쉼표 없음) 칩 자체를 내지 않는다.
const getStatusDetail = (status?: string) => {
  if (!status) return null;
  const comma = status.indexOf(',');
  if (comma === -1) return null;
  return status.slice(comma + 1).trim() || null;
};

// 펀딩 태그 정렬: 말미 2자리(-26)를 연도로 보고 내림차순, 연도 없는 태그는 건수 내림차순으로 뒤에 둔다.
const compareFundingTags = (a: [string, number], b: [string, number]) => {
  const yearA = a[0].match(/-(\d{2})$/);
  const yearB = b[0].match(/-(\d{2})$/);
  if (yearA && yearB) {
    const diff = parseInt(yearB[1], 10) - parseInt(yearA[1], 10);
    return diff !== 0 ? diff : a[0].localeCompare(b[0]);
  }
  if (yearA) return -1;
  if (yearB) return 1;
  if (a[1] !== b[1]) return b[1] - a[1];
  return a[0].localeCompare(b[0]);
};

const ScholarPublications = () => {
  const professors = useMemo(() => Object.keys(loadedPublications), []);
  const [searchParams, setSearchParams] = useSearchParams();

  // --- [뷰 상태는 URL 쿼리에 둔다] ---
  // 필터를 건 화면을 그대로 공유·북마크할 수 있고, 뒤로가기가 사이트를 떠나는 대신 이전 필터로 돌아간다.
  const tabParam = searchParams.get('tab');
  const activeTab = tabParam && professors.includes(tabParam) ? tabParam : professors[0];
  const selectedFunding = searchParams.get('fund');
  const selectedYear = searchParams.get('year') || 'all';
  const sortParam = searchParams.get('sort') as SortKey | null;
  const sortBy: SortKey = sortParam && SORT_KEYS.includes(sortParam) ? sortParam : 'year';
  const scopeParam = searchParams.get('show') as ScopeKey | null;
  const scope: ScopeKey = scopeParam && SCOPE_KEYS.includes(scopeParam) ? scopeParam : DEFAULT_SCOPE;
  const urlQuery = searchParams.get('q') || '';

  // 검색어만 로컬 state다. 입력 1글자마다 라우트를 이동시키면 페이지가 다시 마운트되면서
  // 입력창이 포커스를 잃는다. 타이핑은 즉시 반영하고, 다른 필터를 바꾸거나 Enter를 누를 때 URL에 함께 기록한다.
  const [searchTerm, setSearchTerm] = useState(urlQuery);
  useEffect(() => { setSearchTerm(urlQuery); }, [urlQuery]);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeBibtex, setActiveBibtex] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<{ id: string; ok: boolean } | null>(null);

  // 쿼리 갱신 헬퍼. 값이 비었거나 기본값이면 파라미터를 지워 URL을 짧게 유지한다.
  const updateView = (patch: Record<string, string | null>, options?: { replace?: boolean }) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      // 입력 중이던 검색어도 함께 보존한다(다른 필터를 바꿔도 검색이 풀리지 않게).
      next.delete('q');
      if (searchTerm) next.set('q', searchTerm);
      Object.entries(patch).forEach(([key, value]) => {
        if (value === null || value === '') next.delete(key);
        else next.set(key, value);
      });
      return next;
    }, { replace: options?.replace ?? false });
  };

  const handleTabChange = (name: string) =>
    updateView({ tab: name === professors[0] ? null : name, fund: null, year: null, show: null });
  const handleYearChange = (year: string) => updateView({ year: year === 'all' ? null : year });
  const handleFundingToggle = (tag: string | null) => updateView({ fund: tag });
  const handleSortChange = (key: SortKey) => updateView({ sort: key === 'year' ? null : key });
  const handleScopeChange = (key: ScopeKey) => updateView({ show: key === DEFAULT_SCOPE ? null : key });
  const handleResetFilters = () => {
    setSearchTerm('');
    updateView({ q: null, fund: null, year: null, sort: null });
  };

  // --- [탭별 파생 데이터: BibTeX 파싱을 여기서 한 번만 한다] ---
  // 예전에는 정렬 비교 함수와 렌더가 각각 parseBibtex를 호출해 키 입력 1회당 수천 번 파싱했다.
  const tabPubs = useMemo<DecoratedPub[]>(() => {
    const usedIds = new Set<string>();
    return (loadedPublications[activeTab] || []).map((pub) => {
      const bib = parseBibtex(pub.bibtex || '');
      const rawYear = pub.is_progress ? (pub.year || '') : bib.year;
      const displayYear = /^\d{4}$/.test(rawYear) ? rawYear : UNKNOWN_YEAR;

      // 식별자는 배열 위치가 아니라 논문 고유값으로 만든다.
      // 인덱스를 쓰면 정렬·필터·Load More 뒤에 BibTeX 패널이 엉뚱한 논문에 붙는다.
      const base = (pub.url || pub.title || 'untitled').toLowerCase().replace(/\s+/g, ' ').trim();
      let pubId = `${activeTab}::${base}`;
      let dup = 2;
      while (usedIds.has(pubId)) pubId = `${activeTab}::${base}#${dup++}`;
      usedIds.add(pubId);

      // 검색 색인: 제목뿐 아니라 저자·학술지·연도·펀딩 태그까지 한 문자열에 모아 둔다.
      // BibTeX 원문('Rho, Seungmin')과 표시 형식('Seungmin Rho')을 모두 넣어 어느 쪽으로 쳐도 걸리게 한다.
      const searchText = [
        pub.title,
        pub.bibtex,
        splitAuthors(bib.author, true).names.join(' '),
        bib.venue,
        pub.author,
        pub.journal,
        pub.year,
        pub.jcr,
        ...(pub.funding_tags || []),
      ].filter(Boolean).join(' ').toLowerCase();

      return {
        ...pub,
        bib,
        pubId,
        displayTitle: pub.title.replace(RETRACTED_PREFIX_RE, ''),
        displayYear,
        sortYear: displayYear === UNKNOWN_YEAR ? '0000' : displayYear,
        searchText,
      };
    });
  }, [activeTab]);

  // --- [연구 지표: 이 아카이브에 담긴 논문 기준] ---
  // 철회 논문은 집계에서 뺀다(인용수·h-index가 부풀지 않도록).
  const scholarStats = useMemo(() => {
    const published = tabPubs.filter(p => !p.is_progress && !p.retracted);
    const totalCitations = published.reduce((sum, p) => sum + (p.citations || 0), 0);
    const sorted = published.map(p => p.citations || 0).sort((a, b) => b - a);
    let hIndex = 0;
    while (hIndex < sorted.length && sorted[hIndex] >= hIndex + 1) hIndex += 1;
    return {
      papers: published.length,
      inProgress: tabPubs.filter(p => p.is_progress).length,
      retracted: tabPubs.filter(p => p.retracted).length,
      // 'X of {papers}'로 표시되므로 분모(papers)와 같은 집합에서 센다 — 철회 논문 제외.
      jcrLabelled: tabPubs.filter(p => p.jcr && !p.is_progress && !p.retracted).length,
      totalCitations,
      hIndex,
    };
  }, [tabPubs]);

  // --- [연도 필터 옵션: 해당 탭에 존재하는 연도 내림차순 + 연도 미상] ---
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    let hasUnknown = false;
    tabPubs.forEach(p => {
      if (p.displayYear === UNKNOWN_YEAR) hasUnknown = true;
      else years.add(p.displayYear);
    });
    return { years: [...years].sort((a, b) => b.localeCompare(a)), hasUnknown };
  }, [tabPubs]);

  // 연도 → 검색 → (펀딩 | 범위) 순으로 집합을 좁힌다.
  // 펀딩 필터와 범위 선택은 서로 독립이라 마지막 단계에서 갈라 놓는다.
  const yearScopedPubs = useMemo(
    () => (selectedYear === 'all' ? tabPubs : tabPubs.filter(p => p.displayYear === selectedYear)),
    [tabPubs, selectedYear],
  );

  const searchedPubs = useMemo(() => {
    const low = searchTerm.trim().toLowerCase();
    return low ? yearScopedPubs.filter(p => p.searchText.includes(low)) : yearScopedPubs;
  }, [yearScopedPubs, searchTerm]);

  // 펀딩 집계의 기준 집합: 펀딩 필터만 빼고 나머지(연도·검색·범위)를 모두 건 상태다.
  // 목록도 같은 집합에 펀딩 필터만 더해 만들므로 '태그에 적힌 수 = 눌렀을 때 뜨는 수'가 성립한다.
  const fundingScopedPubs = useMemo(() => applyScope(searchedPubs, scope), [searchedPubs, scope]);

  // --- [펀딩 통계: 협력 교수 라벨 제외, 연도 내림차순] ---
  const fundingStats = useMemo(() => {
    const counts: Record<string, number> = {};
    fundingScopedPubs.forEach(p => {
      p.funding_tags?.forEach(tag => {
        if (COLLABORATOR_TAG_RE.test(tag)) return;
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    // 선택 중인 태그는 이 범위·연도에 0건이어도 해제할 수 있도록 남겨 둔다.
    // 집계에서 빠지는 협력 교수 라벨(Prof.*)이 URL로 직접 지정된 경우도 여기로 오는데,
    // 0으로 박으면 칩은 0인데 카드는 나오는 모순이 생긴다 — 실제 건수를 세어 넣는다.
    if (selectedFunding && !(selectedFunding in counts)) {
      counts[selectedFunding] = fundingScopedPubs.filter(p => p.funding_tags?.includes(selectedFunding)).length;
    }
    return Object.entries(counts).sort(compareFundingTags);
  }, [fundingScopedPubs, selectedFunding]);

  const taggedCount = useMemo(
    () => fundingScopedPubs.filter(p => p.funding_tags?.some(tag => !COLLABORATOR_TAG_RE.test(tag))).length,
    [fundingScopedPubs],
  );

  // --- [필터] ---
  // 게재/미게재로 나누기 전 단계까지만 여기서 처리한다.
  // 같은 필터 결과에서 두 범위의 건수를 함께 셀 수 있어야 세그먼트에 실제 건수를 적고,
  // 0건일 때 '다른 범위에는 N건 있다'고 안내할 수 있다.
  const filteredPubs = useMemo(
    () => (selectedFunding ? searchedPubs.filter(p => p.funding_tags?.includes(selectedFunding)) : searchedPubs),
    [searchedPubs, selectedFunding],
  );

  const scopeCounts = useMemo(() => {
    const progress = filteredPubs.filter(p => p.is_progress).length;
    return { all: filteredPubs.length, progress, published: filteredPubs.length - progress };
  }, [filteredPubs]);

  // --- [범위 적용 및 정렬] ---
  // 예전에는 비교 함수 맨 앞에서 미게재 논문을 무조건 위로 올려, 사용자가 고른 정렬이 무력화됐다
  // (제목순·펀딩순을 눌러도 상단 10건이 그대로 남아 컨트롤이 고장 난 것처럼 보였다).
  // 이제 게재/미게재는 위의 범위 선택으로만 나뉘고, 정렬은 고른 대로만 동작한다.
  const processedPubs = useMemo(() => {
    const sorted = [...applyScope(filteredPubs, scope)];
    sorted.sort((a, b) => {
      if (sortBy === 'year') {
        // 미리 계산해 둔 연도로 비교(연도 미상은 '0000'이라 뒤로 간다)
        if (a.sortYear !== b.sortYear) return b.sortYear.localeCompare(a.sortYear);
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      // 'Funding code' 정렬 = 첫 번째 펀딩 태그의 알파벳순(태그 없는 논문은 뒤로)
      return (a.funding_tags?.[0] || "zzz").localeCompare(b.funding_tags?.[0] || "zzz");
    });
    return sorted;
  }, [filteredPubs, scope, sortBy]);

  // 필터/탭/범위 변경 시 페이지네이션 초기화
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTab, searchTerm, selectedFunding, selectedYear, sortBy, scope]);

  const visiblePubs = processedPubs.slice(0, visibleCount);
  const profileUrl = scholarProfileUrl(activeTab);
  const hasActiveFilters = Boolean(searchTerm || selectedFunding || selectedYear !== 'all');

  const handleCopyBibtex = async (pub: DecoratedPub) => {
    const ok = await copyText(pub.bibtex || '');
    setCopyState({ id: pub.pubId, ok });
    setTimeout(() => setCopyState(null), ok ? 2000 : 4000);
  };

  const renderAuthors = (raw: string, isBibtexFormat: boolean, isSmall: boolean = false) => {
    const { names, etAl } = splitAuthors(raw, isBibtexFormat);
    if (names.length === 0) return null;
    const size = isSmall ? "text-xs" : "text-sm";
    return (
      <>
        {names.map((name, i) => (
          <span key={`${name}-${i}`} className={`${isPiName(name, PI_NAME_VARIANTS) ? "font-bold text-blue-700 underline decoration-blue-200 underline-offset-2" : ""} ${size}`}>
            {name}{i < names.length - 1 ? ", " : ""}
          </span>
        ))}
        {/* BibTeX의 'and others'는 사람 이름이 아니다 — et al.로 표기한다 */}
        {etAl && <span className={`${size} italic text-slate-500`}>, et al.</span>}
      </>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO title="Publication Archive" description="Full publication archive with BibTeX entries, citation counts, and funding records." />

      <div className="mb-10 text-center">
        <h1 className="font-playfair text-4xl font-extrabold text-slate-900 mb-2">Publication Archive</h1>
        <p className="text-slate-500 text-sm font-light">Academic contributions & project funding records.</p>
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[11px] text-slate-500">
          <Calendar size={12} />
          <span>Data last updated: {PUBLICATIONS_UPDATED_AT}</span>
        </div>
      </div>

      {/* --- [교수 선택] ---
          아래 지표가 누구의 수치인지 먼저 밝혀야 하므로 지표 카드보다 위에 둔다.
          (예전에는 컨트롤 바 안에 있어 지표보다 250px 아래였다) */}
      <div className="mb-4 flex justify-center">
        <div role="group" aria-label="Select researcher" className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          {professors.map(name => (
            <button key={name} type="button" onClick={() => handleTabChange(name)} aria-pressed={activeTab === name}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-bold text-xs transition-all ${activeTab === name ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{name}</button>
          ))}
        </div>
      </div>

      {/* --- [연구 지표 카드] ---
          라벨에 '이 아카이브 기준'임을 명시한다. Google Scholar 프로필 전체와 수치가 다를 수 있다. */}
      <p className="mb-2 text-center text-[11px] font-black uppercase tracking-widest text-slate-500">
        Archive figures for {activeTab}
      </p>
      {/* 지표는 철회 논문을 빼고 세는데 아래 목록·세그먼트는 철회 논문까지 센다(목록에 실제로 나오니까).
          두 숫자(415/418)가 한 화면에 나란히 보이므로, 왜 다른지를 회색 박스 한 문장에 맡기지 않고
          카드 안에서 '418 listed · 3 retracted excluded'로 두 수를 직접 잇는다. */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        {[
          {
            label: 'Publications', value: scholarStats.papers, icon: BookOpen,
            note: scholarStats.retracted > 0
              ? `${(scholarStats.papers + scholarStats.retracted).toLocaleString()} listed · ${scholarStats.retracted} retracted excluded`
              : null,
          },
          { label: 'In Progress', value: scholarStats.inProgress, icon: RefreshCw, note: null },
          {
            label: 'Citations (archived)', value: scholarStats.totalCitations.toLocaleString(), icon: Quote,
            note: scholarStats.retracted > 0 ? 'excludes retracted' : null,
          },
          { label: 'h-index (archived)', value: scholarStats.hIndex, icon: TrendingUp, note: null },
        ].map(({ label, value, icon: Icon, note }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Icon size={16} /></div>
            <div>
              <p className="text-lg font-black text-slate-900 leading-tight">{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
              {note && <p className="mt-0.5 text-[10px] font-medium text-slate-400">{note}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* --- [지표 출처 고지] --- */}
      <div className="mb-10 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600">
        <p>
          Source:{' '}
          {profileUrl ? (
            <a href={profileUrl} target="_blank" rel="noreferrer" className="font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900">
              Google Scholar profile of {activeTab}
            </a>
          ) : (
            <span className="font-semibold">Google Scholar profile of {activeTab}</span>
          )}
          {' '}— career-wide totals that include work published before the lab was established.
        </p>
        <p className="mt-1">
          Computed from the {scholarStats.papers.toLocaleString()} papers archived on this page as of {PUBLICATIONS_UPDATED_AT}.
          This archive may not mirror every record on the profile, so the citation total and h-index can differ from the profile's own figures.
          {scholarStats.retracted > 0 && ` ${scholarStats.retracted} retracted paper${scholarStats.retracted > 1 ? 's are' : ' is'} listed below but excluded from these totals.`}
        </p>
        <p className="mt-1">
          {METRICS_DISCLAIMER} JCR labels appear on {scholarStats.jcrLabelled} of {scholarStats.papers} archived papers — a missing label does not mean a lower ranking.
        </p>
      </div>

      {/* --- [슬림형 컨트롤 바] ---
          결과 수와 활성 필터를 이 안에 함께 둔다. 목록을 스크롤해도
          '왜 목록이 줄었는지'와 '어떻게 되돌리는지'가 화면에서 사라지지 않게 하기 위함이다. */}
      <div className="sticky top-nav z-30 bg-white/95 backdrop-blur-md py-3 md:py-4 mb-8 border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          {/* 게재/미게재 범위 선택. 미게재 논문을 목록 맨 위에 고정하는 대신 사용자가 고른다. */}
          {scholarStats.inProgress > 0 && (
            <div role="group" aria-label="Filter by publication status" className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
              {SCOPE_OPTIONS.map(({ key, label }) => (
                <button key={key} type="button" onClick={() => handleScopeChange(key)} aria-pressed={scope === key}
                  className={`flex-1 md:flex-none px-3 sm:px-4 py-1.5 rounded-lg font-bold text-xs transition-all ${scope === key ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {label} <span className="font-black tabular-nums">{scopeCounts[key].toLocaleString()}</span>
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:ml-auto">
            {/* 셀렉트는 라벨을 눈에 보이게 둔다 — 아이콘만으로는 무엇을 고르는 컨트롤인지 읽을 수 없다 */}
            <label className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-600">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Year</span>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                aria-label="Filter by year"
                className="bg-transparent text-xs font-bold text-slate-700 cursor-pointer"
              >
                <option value="all">All years</option>
                {availableYears.years.map(y => <option key={y} value={y}>{y}</option>)}
                {/* 연도를 알 수 없는 항목도 필터로 도달할 수 있어야 한다 */}
                {availableYears.hasUnknown && <option value={UNKNOWN_YEAR}>Year unknown</option>}
              </select>
            </label>
            <label className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-600">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Sort</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortKey)}
                aria-label="Sort by"
                className="bg-transparent text-xs font-bold text-slate-700 cursor-pointer"
              >
                {SORT_OPTIONS.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
            {/* Enter를 누르면 현재 검색어가 URL에 기록돼 그대로 공유할 수 있다 */}
            <form
              role="search"
              onSubmit={(e) => { e.preventDefault(); updateView({ q: searchTerm || null }, { replace: true }); }}
              className="relative min-w-0 flex-grow basis-full md:basis-auto md:w-64"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="search" size={1} placeholder="Search title, author, venue, year..." aria-label="Search publications" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full min-w-0 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600" />
            </form>
          </div>
        </div>

        {/* 결과 수와 활성 필터 요약. 필터를 건 곳(펀딩 패널·카드의 태그)에서 멀리 떨어져 있어도
            여기서 개별 해제·전체 해제가 된다. */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p role="status" className="text-xs font-bold text-slate-600">
            {processedPubs.length.toLocaleString()} of {tabPubs.length.toLocaleString()} papers
          </p>
          {selectedYear !== 'all' && (
            <button type="button" onClick={() => handleYearChange('all')}
              aria-label={`Clear year filter: ${selectedYear === UNKNOWN_YEAR ? 'year unknown' : selectedYear}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-600 hover:border-red-300 hover:text-red-600">
              <XCircle size={11} /> {selectedYear === UNKNOWN_YEAR ? 'Year unknown' : selectedYear}
            </button>
          )}
          {selectedFunding && (
            <button type="button" onClick={() => handleFundingToggle(null)}
              aria-label={`Clear funding filter: ${selectedFunding}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-600 hover:border-red-300 hover:text-red-600">
              <XCircle size={11} /> {selectedFunding}
            </button>
          )}
          {searchTerm && (
            <button type="button" onClick={() => { setSearchTerm(''); updateView({ q: null }, { replace: true }); }}
              aria-label={`Clear search term: ${searchTerm}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-600 hover:border-red-300 hover:text-red-600">
              <XCircle size={11} /> “{searchTerm}”
            </button>
          )}
          {hasActiveFilters && (
            <button type="button" onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-300 bg-slate-900 text-[11px] font-bold text-white hover:bg-blue-700">
              <RefreshCw size={11} /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* --- [펀딩 대시보드] ---
          태그가 붙은 논문이 아카이브의 일부뿐이라 전폭 패널 대신 접이식으로 둔다.
          집계는 목록과 같은 집합(연도·검색·범위 적용, 펀딩만 미적용)을 세므로
          '태그에 숫자가 보이는데 눌러 보면 0건'인 조합이 생기지 않는다.
          그 범위에 0건인 태그는 아예 나오지 않는다(선택 중인 태그만 해제용으로 남는다). */}
      <details className="bg-slate-50 rounded-3xl mb-8 border border-slate-100 shadow-sm">
        <summary className="cursor-pointer list-none px-6 py-4 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-600" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-700">Funding Portfolio</span>
          </span>
          <span className="text-[11px] font-bold text-slate-600">
            {taggedCount} of {fundingScopedPubs.length.toLocaleString()} {SCOPE_NOUN[scope]} tagged
            {selectedYear !== 'all' && ` (${selectedYear === UNKNOWN_YEAR ? 'year unknown' : selectedYear})`}
            {selectedFunding && ` · filtering by ${selectedFunding}`}
          </span>
        </summary>
        <div className="px-6 pb-6">
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
            {fundingStats.length === 0 && (
              <p className="text-[11px] text-slate-600">No funding tags on the papers in this view.</p>
            )}
            {fundingStats.map(([tag, count]) => (
              <button key={tag} onClick={() => handleFundingToggle(tag === selectedFunding ? null : tag)}
                title={FUNDING_LEGEND[tag] ?? tag}
                aria-pressed={selectedFunding === tag}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] transition-all duration-200 ${
                  selectedFunding === tag ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                }`}>
                <span className="font-bold">{tag}</span>
                <span className={`px-1.5 py-0.5 rounded-lg font-black ${selectedFunding === tag ? 'bg-blue-400' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
            Funding tags are transcribed from the lab's public pages and only cover recent papers, so this is not a complete record of the lab's grants.
            {/* TODO(lab): 과제 코드별 정식 과제명·과제번호·수행기간 확인 필요 (src/constants.tsx의 FUNDING_LEGEND). */}
          </p>
        </div>
      </details>

      {/* --- [콤팩트 논문 리스트] --- */}
      <div className="space-y-4">
        {visiblePubs.map((pub) => {
          const { bib, pubId } = pub;
          const isProg = pub.is_progress;
          const hasBibtex = !isProg && Boolean(pub.bibtex);
          const statusDetail = getStatusDetail(pub.status);
          const venue = (isProg ? pub.journal : bib.venue) || '';
          // 'Prof. *'는 연구비가 아니라 공동연구 교수 라벨이다 — 펀딩 칩과 섞지 않는다.
          const fundingTags = (pub.funding_tags || []).filter(tag => !COLLABORATOR_TAG_RE.test(tag));
          const collaboratorTags = (pub.funding_tags || []).filter(tag => COLLABORATOR_TAG_RE.test(tag));

          return (
            <div key={pubId} className={`group bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isProg ? 'border-slate-200 border-dashed' : 'border-slate-100 shadow-sm hover:shadow-md'}`}>
              <div className={`p-5 ${isProg ? 'py-4' : ''}`}>
                <div className="flex flex-col gap-3">
                  {/* 배지 라인 */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* 색의 무게가 사실의 무게를 따라가게 한다:
                        게재 논문은 진한 솔리드, 미게재 투고본은 약한 아웃라인. (예전에는 반대였다) */}
                    {isProg ? (
                      <span className="px-2 py-0.5 bg-white text-slate-600 border border-slate-300 rounded text-[10px] font-black uppercase flex items-center gap-1"><RefreshCw size={9} className="animate-spin-slow"/> {getProgressLabel(pub.status)}</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-blue-900 text-white rounded text-[10px] font-black uppercase">{getTypeLabel(bib.type)}</span>
                    )}
                    {/* 철회 논문임을 눈에 띄게 알린다 (지표 집계에서도 빠져 있다) */}
                    {pub.retracted && (
                      <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-black uppercase flex items-center gap-1">
                        <AlertTriangle size={9} /> Retracted
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-black border border-slate-200">{pub.displayYear === UNKNOWN_YEAR ? 'Year unknown' : pub.displayYear}</span>
                    {/* 인용 0은 성과가 아니다 — 0과 '집계 없음'을 초록 배지로 똑같이 광고하지 않는다.
                        철회 논문의 인용은 위 합계에서 빠져 있다. 성과색(초록)으로 칠하지 않고
                        제외됐음을 배지에 적는다 — 그래야 배지를 더한 값과 헤드라인이 어긋나 보이지 않는다. */}
                    {typeof pub.citations === 'number' && pub.citations > 0 && (
                      pub.retracted ? (
                        <span title="Citations of a retracted paper — not included in the archive totals above"
                          className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-black border border-slate-200 flex items-center gap-1">
                          <Quote size={9} /> Cited {pub.citations} · excluded
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-black border border-emerald-100 flex items-center gap-1">
                          <Quote size={9} /> Cited {pub.citations}
                        </span>
                      )
                    )}
                    {/* 미게재 논문의 라벨은 '투고 대상 저널'의 등급이지 게재 성과가 아니다 */}
                    {pub.jcr && (
                      pub.jcr_source ? (
                        <a href={pub.jcr_source} target="_blank" rel="noreferrer"
                          title="JCR label transcribed from the lab's public page"
                          className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded text-[10px] font-black border border-violet-100 flex items-center gap-1 hover:bg-violet-100">
                          <Award size={9} /> {isProg ? `Target: ${pub.jcr}` : pub.jcr}
                        </a>
                      ) : (
                        <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded text-[10px] font-black border border-violet-100 flex items-center gap-1">
                          <Award size={9} /> {isProg ? `Target: ${pub.jcr}` : pub.jcr}
                        </span>
                      )
                    )}
                    {/* 유일하게 누를 수 있는 배지라 혼자 알약 모양(rounded-full)을 쓴다 */}
                    {fundingTags.map(tag => (
                      <button key={tag} type="button" onClick={() => handleFundingToggle(tag)}
                        title={`${FUNDING_LEGEND[tag] ?? tag} — show only papers with this tag`}
                        aria-label={`Show only papers tagged ${tag}`}
                        className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full text-[10px] font-black border border-amber-200 hover:bg-amber-100 transition-colors">{tag}</button>
                    ))}
                    {collaboratorTags.map(tag => (
                      <span key={tag} title={FUNDING_LEGEND[tag] ?? 'Collaborating professor'}
                        className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-bold border border-slate-200">{tag}</span>
                    ))}
                  </div>

                  {/* 제목 & 저자 */}
                  <div className="space-y-1">
                    <h3 className={`font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug ${isProg ? 'text-base italic' : 'text-lg'}`}>{pub.displayTitle}</h3>
                    <div className="text-slate-600 leading-normal">{renderAuthors(isProg ? (pub.author || "") : bib.author, !isProg, isProg)}</div>
                  </div>

                  {/* 정보 & 액션 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <BookOpen size={14} className="text-blue-400"/>
                      {/* 게재처 필드가 하나도 없는 항목이 있다(현재 5건). 없는 게재처를 지어내지 않고,
                          연도 미상의 'Year unknown'과 같은 어조로 비어 있음을 밝힌다.
                          예전에는 빈 문자열을 그대로 출력해 아이콘 옆이 빈 칸으로 남았다. */}
                      {venue
                        ? <span className="font-semibold text-slate-700">{venue}</span>
                        : <span className="italic text-slate-500">Venue unknown</span>}
                      {/* 상단 배지가 이미 단계를 말한다 — 여기서는 시점만 덧붙인다 */}
                      {statusDetail && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-bold text-[10px]">{statusDetail}</span>}
                      {!isProg && bib.volume && <span className="text-slate-500 text-[11px]">Vol.{bib.volume}</span>}
                    </div>

                    <div className="flex gap-2">
                      {pub.url && <a href={pub.url} target="_blank" rel="noreferrer" aria-label={`Open "${pub.displayTitle}" in a new tab`} className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-900 hover:text-white transition-all shadow-sm"><ExternalLink size={14}/></a>}
                      {/* BibTeX가 없는 항목(진행 중 논문)은 빈 패널이 열리지 않도록 버튼 자체를 내지 않는다 */}
                      {hasBibtex && (
                        <button onClick={() => setActiveBibtex(activeBibtex === pubId ? null : pubId)}
                          aria-expanded={activeBibtex === pubId}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${activeBibtex === pubId ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                          <Quote size={12}/> {activeBibtex === pubId ? 'Hide' : 'Cite'}
                        </button>
                      )}
                    </div>
                  </div>

                  {hasBibtex && activeBibtex === pubId && (
                    <div className="mt-2 bg-slate-900 rounded-xl p-4 relative border border-slate-800 animate-fade-in-up shadow-inner">
                      <button onClick={() => handleCopyBibtex(pub)}
                        className={`absolute top-3 right-3 text-[10px] font-bold uppercase ${copyState?.id === pubId && !copyState.ok ? 'text-red-300' : 'text-blue-300 hover:text-white'}`}>
                        {copyState?.id === pubId ? (copyState.ok ? 'Copied' : 'Copy failed — select the text below') : 'Copy'}
                      </button>
                      <pre className="text-[11px] text-blue-100/80 font-mono whitespace-pre-wrap select-all">{pub.bibtex}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- [빈 상태] --- */}
      {processedPubs.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <Search className="mx-auto mb-3 text-slate-400" size={28} />
          <p className="text-sm font-bold text-slate-700">No publications match the current filters.</p>
          <p className="mt-1 text-xs text-slate-600">The archive is still here — try another search term, or clear the filters below.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {/* 범위(Published/In progress) 때문에 0건인 경우가 있다 — 다른 범위에 결과가 있으면 그리로 가는 길을 준다 */}
            {scope !== 'all' && scopeCounts.all > 0 && (
              <button type="button" onClick={() => handleScopeChange('all')} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:border-blue-400 hover:text-blue-700 transition-colors">
                Show all {scopeCounts.all.toLocaleString()} matching papers
              </button>
            )}
            {hasActiveFilters && (
              <button type="button" onClick={handleResetFilters} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors">
                <RefreshCw size={12} /> Reset all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- [Load More 페이지네이션] --- */}
      {processedPubs.length > visibleCount && (
        <div className="text-center mt-10">
          <button
            onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
            className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg"
          >
            Load More ({processedPubs.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default ScholarPublications;
