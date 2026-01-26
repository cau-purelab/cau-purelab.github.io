import React, { useState } from 'react';
import { PUBLICATIONS } from '../constants';
import { FileText, Calendar, Tag, Quote, Check } from 'lucide-react';

const Publications = () => {
  // 필터 상태 (All vs Selected)
  const [filter, setFilter] = useState<'all' | 'selected'>('all');
  // BibTeX 열림 상태
  const [activeBibtex, setActiveBibtex] = useState<string | null>(null);
  // 복사 완료 표시 상태
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 연도별 정렬
  const years = Array.from(new Set(PUBLICATIONS.map(p => p.year))).sort((a, b) => b - a);

  // 필터링 적용
  const filteredPubs = filter === 'selected'
    ? PUBLICATIONS.filter(p => p.isSelected)
    : PUBLICATIONS;

  const handleCopyBibtex = (bib: string, id: string) => {
    navigator.clipboard.writeText(bib);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="font-playfair text-4xl font-bold text-blue-900 mb-2">Publications</h1>
          <p className="text-gray-600">Selected research papers and conference proceedings</p>
        </div>

        {/* 필터 버튼 */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'all' ? 'bg-white shadow-sm text-blue-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            All Papers
          </button>
          <button
            onClick={() => setFilter('selected')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'selected' ? 'bg-white shadow-sm text-blue-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Selected
          </button>
        </div>
      </div>

      <div className="space-y-12">
        {years.map(year => {
          const yearPubs = filteredPubs.filter(p => p.year === year);
          if (yearPubs.length === 0) return null;

          return (
            <div key={year} className="flex flex-col md:flex-row gap-8 animate-fade-in-up">
              <div className="md:w-24 flex-shrink-0">
                <span className="text-3xl font-playfair font-bold text-blue-900/20 sticky top-20">{year}</span>
              </div>

              <div className="flex-grow space-y-6">
                {yearPubs.map((pub) => (
                  <div key={pub.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-2 group-hover:text-blue-900 transition-colors">
                      {pub.title}
                    </h3>
                    <div className="text-gray-600 text-sm mb-3">
                      {pub.authors.map((author, i) => (
                        <span key={i} className={author.includes("Seungmin Rho") ? "font-bold text-gray-800" : ""}>
                          {author}{i < pub.authors.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center text-blue-900 font-medium">
                        <FileText className="h-3.5 w-3.5 mr-1" />
                        {pub.venue}
                      </div>

                      {pub.tags && (
                        <div className="flex gap-2">
                          {pub.tags.map(tag => (
                            <span key={tag} className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-4 pt-4 border-t border-gray-50">
                      {pub.bibtex && (
                        <button
                          onClick={() => setActiveBibtex(activeBibtex === pub.id ? null : pub.id)}
                          className="flex items-center text-xs font-bold text-gray-400 hover:text-blue-900 transition-colors uppercase tracking-wider"
                        >
                          <Quote className="h-3 w-3 mr-1" />
                          {activeBibtex === pub.id ? 'Close BibTeX' : 'BibTeX'}
                        </button>
                      )}
                      {/* PDF 등의 링크가 있다면 여기에 추가 */}
                    </div>

                    {/* BibTeX Viewer */}
                    {activeBibtex === pub.id && pub.bibtex && (
                      <div className="mt-4 relative bg-slate-900 rounded-lg p-4">
                        <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto">
                          {pub.bibtex}
                        </pre>
                        <button
                          onClick={() => handleCopyBibtex(pub.bibtex!, pub.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedId === pub.id ? <Check className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Publications;