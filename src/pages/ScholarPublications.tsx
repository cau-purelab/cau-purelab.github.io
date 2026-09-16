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
  BarChart3, SortAsc, Clock, Tags, XCircle, RefreshCw, TrendingUp, AlertTriangle
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

const getProgressLabel = (status?: string) => {
  if (!status) return 'In Progress';
  const s = status.toLowerCase();
  if (s.includes('submitted')) return 'Submitted';
  if (s.includes('revision')) return 'In Revision';
  if (s.includes('press') || s.includes('accepted')) return 'In Press';
  if (s.includes('review')) return 'In Review';
  return 'In Progress';
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
    updateView({ tab: name === professors[0] ? null : name, fund: null, year: null });
  const handleYearChange = (year: string) => updateView({ year: year === 'all' ? null : year });
  const handleFundingToggle = (tag: string | null) => updateView({ fund: tag });
  const handleSortChange = (key: SortKey) => updateView({ sort: key === 'year' ? null : key });
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
      jcrLabelled: tabPubs.filter(p => p.jcr && !p.is_progress).length,
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

  // 연도 필터를 먼저 적용한 집합. 펀딩 대시보드도 이 집합을 세어
  // '태그는 보이는데 결과가 0건'인 조합이 생기지 않게 한다.
  const yearScopedPubs = useMemo(
    () => (selectedYear === 'all' ? tabPubs : tabPubs.filter(p => p.displayYear === selectedYear)),
    [tabPubs, selectedYear],
  );

  // --- [펀딩 통계: 협력 교수 라벨 제외, 연도 내림차순] ---
  const fundingStats = useMemo(() => {
    const counts: Record<string, number> = {};
    yearScopedPubs.forEach(p => {
      p.funding_tags?.forEach(tag => {
        if (COLLABORATOR_TAG_RE.test(tag)) return;
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    // 선택 중인 태그가 이 연도에 0건이어도 해제할 수 있도록 남겨 둔다.
    if (selectedFunding && !(selectedFunding in counts)) counts[selectedFunding] = 0;
    return Object.entries(counts).sort(compareFundingTags);
  }, [yearScopedPubs, selectedFunding]);

  const taggedCount = useMemo(
    () => yearScopedPubs.filter(p => p.funding_tags?.some(tag => !COLLABORATOR_TAG_RE.test(tag))).length,
    [yearScopedPubs],
  );

  // --- [필터 및 정렬] ---
  const processedPubs = useMemo(() => {
    let result = yearScopedPubs;
    if (selectedFunding) result = result.filter(p => p.funding_tags?.includes(selectedFunding));
    const low = searchTerm.trim().toLowerCase();
    if (low) result = result.filter(p => p.searchText.includes(low));

    const sorted = [...result];
    sorted.sort((a, b) => {
      if (a.is_progress && !b.is_progress) return -1;
      if (!a.is_progress && b.is_progress) return 1;
      if (sortBy === 'year') {
        // is_progress 우선 정렬은 위에서 이미 처리됨 — 미리 계산해 둔 연도로 비교
        if (a.sortYear !== b.sortYear) return b.sortYear.localeCompare(a.sortYear);
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return (a.funding_tags?.[0] || "zzz").localeCompare(b.funding_tags?.[0] || "zzz");
    });
    return sorted;
  }, [yearScopedPubs, searchTerm, selectedFunding, sortBy]);

  // 필터/탭 변경 시 페이지네이션 초기화
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTab, searchTerm, selectedFunding, selectedYear, sortBy]);

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

      {/* --- [연구 지표 카드] ---
          라벨에 '이 아카이브 기준'임을 명시한다. Google Scholar 프로필 전체와 수치가 다를 수 있다. */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        {[
          { label: 'Publications', value: scholarStats.papers, icon: BookOpen },
          { label: 'In Progress', value: scholarStats.inProgress, icon: RefreshCw },
          { label: 'Citations (archived)', value: scholarStats.totalCitations.toLocaleString(), icon: Quote },
          { label: 'h-index (archived)', value: scholarStats.hIndex, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Icon size={16} /></div>
            <div>
              <p className="text-lg font-black text-slate-900 leading-tight">{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
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

      {/* --- [슬림형 컨트롤 바] --- */}
      <div className="sticky top-nav z-30 bg-white/95 backdrop-blur-md py-4 mb-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          {professors.map(name => (
            <button key={name} onClick={() => handleTabChange(name)}
              className={`flex-1 md:flex-none px-6 py-1.5 rounded-lg font-bold text-xs transition-all ${activeTab === name ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>{name}</button>
          ))}
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
            aria-label="Filter by year"
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="all">All Years</option>
            {availableYears.years.map(y => <option key={y} value={y}>{y}</option>)}
            {/* 연도를 알 수 없는 항목도 필터로 도달할 수 있어야 한다 */}
            {availableYears.hasUnknown && <option value={UNKNOWN_YEAR}>Year unknown</option>}
          </select>
          <div className="flex bg-slate-100 p-1 rounded-xl items-center shadow-inner scale-90">
            <div className="flex bg-white rounded-lg p-0.5 gap-0.5">
              <button onClick={() => handleSortChange('year')} aria-label="Sort by year" title="Sort by year" className={`p-1.5 rounded-md ${sortBy === 'year' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}><Clock size={14}/></button>
              <button onClick={() => handleSortChange('title')} aria-label="Sort by title" title="Sort by title" className={`p-1.5 rounded-md ${sortBy === 'title' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}><SortAsc size={14}/></button>
              <button onClick={() => handleSortChange('funding')} aria-label="Sort by funding" title="Sort by funding" className={`p-1.5 rounded-md ${sortBy === 'funding' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}><Tags size={14}/></button>
            </div>
          </div>
          {/* Enter를 누르면 현재 검색어가 URL에 기록돼 그대로 공유할 수 있다 */}
          <form
            role="search"
            onSubmit={(e) => { e.preventDefault(); updateView({ q: searchTerm || null }, { replace: true }); }}
            className="relative flex-grow md:w-64"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="search" placeholder="Search title, author, venue, year..." aria-label="Search publications" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600" />
          </form>
        </div>
      </div>

      {/* --- [펀딩 대시보드] ---
          태그가 붙은 논문이 아카이브의 일부뿐이라 전폭 패널 대신 접이식으로 둔다.
          집계는 연도 필터가 적용된 집합 기준이라 '태그는 보이는데 0건'인 조합이 생기지 않는다. */}
      <details className="bg-slate-50 rounded-3xl mb-8 border border-slate-100 shadow-sm">
        <summary className="cursor-pointer list-none px-6 py-4 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-600" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-700">Funding Portfolio</span>
          </span>
          <span className="text-[11px] font-bold text-slate-600">
            {taggedCount} of {yearScopedPubs.length} papers tagged
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
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <p role="status" className="text-xs text-slate-600 font-bold">
          {processedPubs.length.toLocaleString()} {processedPubs.length === 1 ? 'result' : 'results'}
        </p>
        {selectedYear !== 'all' && (
          <button onClick={() => handleYearChange('all')} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-600 hover:border-red-300 hover:text-red-600">
            <XCircle size={11} /> {selectedYear === UNKNOWN_YEAR ? 'Year unknown' : selectedYear}
          </button>
        )}
        {selectedFunding && (
          <button onClick={() => handleFundingToggle(null)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-600 hover:border-red-300 hover:text-red-600">
            <XCircle size={11} /> {selectedFunding}
          </button>
        )}
        {searchTerm && (
          <button onClick={() => { setSearchTerm(''); updateView({ q: null }, { replace: true }); }} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-600 hover:border-red-300 hover:text-red-600">
            <XCircle size={11} /> “{searchTerm}”
          </button>
        )}
      </div>
      <div className="space-y-4">
        {visiblePubs.map((pub) => {
          const { bib, pubId } = pub;
          const isProg = pub.is_progress;
          const hasBibtex = !isProg && Boolean(pub.bibtex);

          return (
            <div key={pubId} className={`group bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isProg ? 'border-blue-200 bg-blue-50/10 border-dashed' : 'border-slate-100 shadow-sm hover:shadow-md'}`}>
              <div className={`p-5 ${isProg ? 'py-4' : ''}`}>
                <div className="flex flex-col gap-3">
                  {/* 배지 라인 */}
                  <div className="flex flex-wrap items-center gap-2">
                    {isProg ? (
                      <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-black uppercase flex items-center gap-1"><RefreshCw size={9} className="animate-spin-slow"/> {getProgressLabel(pub.status)}</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-700 text-white rounded text-[10px] font-black uppercase">{getTypeLabel(bib.type)}</span>
                    )}
                    {/* 철회 논문임을 눈에 띄게 알린다 (지표 집계에서도 빠져 있다) */}
                    {pub.retracted && (
                      <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-black uppercase flex items-center gap-1">
                        <AlertTriangle size={9} /> Retracted
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-black border border-blue-100">{pub.displayYear === UNKNOWN_YEAR ? 'Year unknown' : pub.displayYear}</span>
                    {typeof pub.citations === 'number' && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-black border border-emerald-100 flex items-center gap-1">
                        <Quote size={9} /> Cited {pub.citations}
                      </span>
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
                    {pub.funding_tags?.map(tag => (
                      <button key={tag} onClick={() => handleFundingToggle(tag)} title={FUNDING_LEGEND[tag] ?? tag}
                        className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-black border border-amber-100 hover:bg-amber-100 transition-colors">{tag}</button>
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
                      <span className="font-semibold text-slate-700">{isProg ? pub.journal : bib.venue}</span>
                      {pub.status && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-bold text-[10px] uppercase">{pub.status}</span>}
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
          {hasActiveFilters && (
            <button onClick={handleResetFilters} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors">
              <RefreshCw size={12} /> Reset all filters
            </button>
          )}
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
