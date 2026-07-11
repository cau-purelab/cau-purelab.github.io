import React, { useState, useMemo } from 'react';
import publicationsData from '../data/publications.json';
import SEO from '../components/SEO';
import { PUBLICATIONS_UPDATED_AT, PI_NAME_VARIANTS } from '../constants';
import { 
  ExternalLink, GraduationCap, Calendar, BookOpen, Search, 
  Quote, Check, FileText, ChevronDown, ChevronUp, Layers, Bookmark, Award,
  BarChart3, SortAsc, Clock, Tags, XCircle, RefreshCw
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
}

const loadedPublications = publicationsData as Record<string, ScholarPub[]>;

const ScholarPublications = () => {
  const professors = Object.keys(loadedPublications);
  const [activeTab, setActiveTab] = useState(professors[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFunding, setSelectedFunding] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'year' | 'title' | 'funding'>('year');
  const [activeBibtex, setActiveBibtex] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- [BibTeX 파싱] ---
  const parseBibtex = (bib: string) => {
    const info: Record<string, string> = { year: '0', author: 'N/A', venue: 'N/A' };
    if (!bib || !bib.includes('{')) return info;
    // 엔트리 유형 추출 (@article, @inproceedings 등)
    const typeMatch = bib.match(/^\s*@(\w+)\s*\{/);
    if (typeMatch) info.type = typeMatch[1].toLowerCase();
    const fields = ["journal", "booktitle", "volume", "number", "pages", "publisher", "doi", "author", "year"];
    fields.forEach(field => {
      const regex = new RegExp(`${field}\\s*=\\s*[\\{"]([\\s\\S]*?)[\\}"]`, "i");
      const match = bib.match(regex);
      if (match) info[field] = match[1].trim().replace(/\n/g, " ");
    });
    return info;
  };

  // --- [통계 계산: 연도순 정렬 포함] ---
  const fundingStats = useMemo(() => {
    const counts: Record<string, number> = {};
    (loadedPublications[activeTab] || []).forEach(p => {
      p.funding_tags?.forEach(tag => { counts[tag] = (counts[tag] || 0) + 1; });
    });

    // 태그에서 연도 숫자 추출하여 정렬 (예: ITRC-26 -> 26)
    return Object.entries(counts).sort((a, b) => {
      const yearA = parseInt(a[0].match(/\d+/)?.[0] || "0");
      const yearB = parseInt(b[0].match(/\d+/)?.[0] || "0");
      if (yearA !== yearB) return yearB - yearA; // 연도 내림차순
      return a[0].localeCompare(b[0]); // 연도 같으면 이름순
    });
  }, [activeTab]);

  // --- [필터 및 정렬] ---
  const processedPubs = useMemo(() => {
    let result = [...(loadedPublications[activeTab] || [])];
    if (selectedFunding) result = result.filter(p => p.funding_tags?.includes(selectedFunding));
    if (searchTerm) {
      const low = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(low) || 
        p.funding_tags?.some(t => t.toLowerCase().includes(low)) ||
        p.jcr?.toLowerCase().includes(low) ||
        String(p.citations ?? '').includes(low)
      );
    }

    result.sort((a, b) => {
      if (a.is_progress && !b.is_progress) return -1;
      if (!a.is_progress && b.is_progress) return 1;
      if (sortBy === 'year') {
        // is_progress 우선 정렬은 위에서 이미 처리됨 — 실제 연도로 비교
        const yearA = a.is_progress ? (a.year || "0") : parseBibtex(a.bibtex || "").year;
        const yearB = b.is_progress ? (b.year || "0") : parseBibtex(b.bibtex || "").year;
        return yearB.localeCompare(yearA);
      }
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return (a.funding_tags?.[0] || "zzz").localeCompare(b.funding_tags?.[0] || "zzz");
    });
    return result;
  }, [activeTab, searchTerm, selectedFunding, sortBy]);

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

  const renderAuthors = (authorStr: string, isSmall: boolean = false) => {
    if (!authorStr) return null;
    // BibTeX uses " and " as separator; manual/abbreviated entries use ","
    const isBibtex = /\s+and\s+/i.test(authorStr);
    const authors = isBibtex ? authorStr.split(/\s+and\s+/i) : authorStr.split(',');
    return authors.map((author, i) => {
      let name = author.trim();
      if (!name) return null;
      // Reverse "Last, First" only for BibTeX-format strings
      if (isBibtex && name.includes(',')) {
        const [last, first] = name.split(',').map(s => s.trim());
        name = first ? `${first} ${last}` : last;
      }
      const isPI = PI_NAME_VARIANTS.some(pi => name.toLowerCase().includes(pi.toLowerCase()));
      return (
        <span key={i} className={`${isPI ? "font-bold text-blue-700 underline decoration-blue-200 underline-offset-2" : ""} ${isSmall ? "text-xs" : "text-sm"}`}>
          {name}{i < authors.length - 1 ? ", " : ""}
        </span>
      );
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO title="Scholar Archives" description="Compact academic publication list." />
      
      <div className="mb-10 text-center">
        <h1 className="font-playfair text-4xl font-extrabold text-slate-900 mb-2">Research Archives</h1>
        <p className="text-slate-500 text-sm font-light">Academic contributions & project funding records.</p>
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[11px] text-slate-500">
          <Calendar size={12} />
          <span>Data last updated: {PUBLICATIONS_UPDATED_AT}</span>
        </div>
      </div>

      {/* --- [펀딩 대시보드: 연도순 정렬됨] --- */}
      <div className="bg-slate-50 rounded-3xl p-6 mb-10 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-600" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">Funding Portfolio (Sorted by Year)</h3>
          </div>
          {selectedFunding && (
            <button onClick={() => setSelectedFunding(null)} className="text-[10px] font-bold text-red-500 flex items-center gap-1 hover:underline">
              <XCircle size={12} /> Clear Filter
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
          {fundingStats.map(([tag, count]) => (
            <button key={tag} onClick={() => setSelectedFunding(tag === selectedFunding ? null : tag)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] transition-all duration-200 ${
                selectedFunding === tag ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
              }`}>
              <span className="font-bold">{tag}</span>
              <span className={`px-1.5 py-0.5 rounded-lg font-black ${selectedFunding === tag ? 'bg-blue-400' : 'bg-slate-100 text-slate-400'}`}>{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* --- [슬림형 컨트롤 바] --- */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md py-4 mb-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          {professors.map(name => (
            <button key={name} onClick={() => { setActiveTab(name); setSelectedFunding(null); }}
              className={`flex-1 md:flex-none px-6 py-1.5 rounded-lg font-bold text-xs transition-all ${activeTab === name ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>{name}</button>
          ))}
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl items-center shadow-inner scale-90">
            <div className="flex bg-white rounded-lg p-0.5 gap-0.5">
              <button onClick={() => setSortBy('year')} className={`p-1.5 rounded-md ${sortBy === 'year' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><Clock size={14}/></button>
              <button onClick={() => setSortBy('title')} className={`p-1.5 rounded-md ${sortBy === 'title' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><SortAsc size={14}/></button>
              <button onClick={() => setSortBy('funding')} className={`p-1.5 rounded-md ${sortBy === 'funding' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><Tags size={14}/></button>
            </div>
          </div>
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
            <input type="text" placeholder="Search archives..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-50 outline-none" />
          </div>
        </div>
      </div>

      {/* --- [콤팩트 논문 리스트] --- */}
      <div className="space-y-4">
        {processedPubs.map((pub, idx) => {
          const bib = parseBibtex(pub.bibtex || "");
          const pubId = `${activeTab}-${idx}`;
          const isProg = pub.is_progress;

          return (
            <div key={pubId} className={`group bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isProg ? 'border-blue-200 bg-blue-50/10 border-dashed' : 'border-slate-100 shadow-sm hover:shadow-md'}`}>
              <div className={`p-5 ${isProg ? 'py-4' : ''}`}>
                <div className="flex flex-col gap-3">
                  {/* 배지 라인 */}
                  <div className="flex flex-wrap items-center gap-2">
                    {isProg ? (
                      <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[8px] font-black uppercase flex items-center gap-1"><RefreshCw size={8} className="animate-spin-slow"/> {getProgressLabel(pub.status)}</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-700 text-white rounded text-[8px] font-black uppercase">{getTypeLabel(bib.type)}</span>
                    )}
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[8px] font-black border border-blue-100">{isProg ? pub.year : bib.year}</span>
                    {typeof pub.citations === 'number' && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[8px] font-black border border-emerald-100 flex items-center gap-1">
                        <Quote size={9} /> Cited {pub.citations}
                      </span>
                    )}
                    {pub.jcr && (
                      <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded text-[8px] font-black border border-violet-100 flex items-center gap-1">
                        <Award size={9} /> {pub.jcr}
                      </span>
                    )}
                    {pub.funding_tags?.map(tag => (
                      <button key={tag} onClick={() => setSelectedFunding(tag)} className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[8px] font-black border border-amber-100 hover:bg-amber-100 transition-colors">{tag}</button>
                    ))}
                  </div>

                  {/* 제목 & 저자 */}
                  <div className="space-y-1">
                    <h3 className={`font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug ${isProg ? 'text-base italic' : 'text-lg'}`}>{pub.title}</h3>
                    <div className="text-slate-500 leading-normal">{renderAuthors(isProg ? (pub.author || "") : bib.author, isProg)}</div>
                  </div>

                  {/* 정보 & 액션 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <BookOpen size={14} className="text-blue-400"/>
                      <span className="font-semibold text-slate-700">{isProg ? pub.journal : (bib.journal || bib.booktitle)}</span>
                      {pub.status && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-bold text-[9px] uppercase">{pub.status}</span>}
                      {!isProg && bib.volume && <span className="opacity-60 text-[10px]">Vol.{bib.volume}</span>}
                    </div>
                    
                    <div className="flex gap-2">
                      {pub.url && <a href={pub.url} target="_blank" rel="noreferrer" className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-900 hover:text-white transition-all shadow-sm"><ExternalLink size={14}/></a>}
                      {!isProg && (
                        <button onClick={() => setActiveBibtex(activeBibtex === pubId ? null : pubId)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${activeBibtex === pubId ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                          <Quote size={12}/> {activeBibtex === pubId ? 'Hide' : 'Cite'}
                        </button>
                      )}
                    </div>
                  </div>

                  {activeBibtex === pubId && (
                    <div className="mt-2 bg-slate-900 rounded-xl p-4 relative border border-slate-800 animate-fade-in-up shadow-inner">
                      <button onClick={() => { navigator.clipboard.writeText(pub.bibtex || ''); setCopiedId(pubId); setTimeout(()=>setCopiedId(null), 2000); }}
                        className="absolute top-3 right-3 text-[9px] font-bold text-blue-400 hover:text-white uppercase">
                        {copiedId === pubId ? 'Done' : 'Copy'}
                      </button>
                      <pre className="text-[10px] text-blue-100/60 font-mono whitespace-pre-wrap">{pub.bibtex}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScholarPublications;
