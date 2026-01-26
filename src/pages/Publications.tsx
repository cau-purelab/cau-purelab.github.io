import React, { useState } from 'react';
import { PUBLICATIONS } from '../constants';
import { FileText, Quote, Check } from 'lucide-react';
import SEO from '../components/SEO';

const Publications = () => {
  const [currentFilter, setCurrentFilter] = useState<'all' | number>('all');
  const [activeBibtex, setActiveBibtex] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allYears = Array.from(new Set(PUBLICATIONS.map(p => p.year))).sort((a, b) => b - a);
  const yearsToShow = currentFilter === 'all' ? allYears : [currentFilter];

  const handleCopyBibtex = (bib: string, id: string) => {
    navigator.clipboard.writeText(bib);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO title="Publications" description="List of publications and conference proceedings by SVIL." />

      <div className="mb-10">
        <h1 className="font-playfair text-4xl font-bold text-blue-900 mb-2">Publications</h1>
        <p className="text-gray-600">Research papers and conference proceedings</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-12">
        <button
          onClick={() => setCurrentFilter('all')}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${currentFilter === 'all'
              ? 'bg-blue-900 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
        >
          All Papers
        </button>

        {allYears.map((year) => (
          <button
            key={year}
            onClick={() => setCurrentFilter(year)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${currentFilter === year
                ? 'bg-blue-900 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
          >
            {year}
          </button>
        ))}
      </div>

      <div className="space-y-16">
        {yearsToShow.map(year => {
          const yearPubs = PUBLICATIONS.filter(p => p.year === year);
          if (yearPubs.length === 0) return null;

          return (
            <div key={year} className="flex flex-col md:flex-row gap-8 animate-fade-in-up">
              <div className="md:w-24 flex-shrink-0">
                <span className="text-3xl font-playfair font-bold text-blue-900/20 sticky top-24">
                  {year}
                </span>
              </div>

              <div className="flex-grow space-y-8">
                {yearPubs.map((pub) => (
                  <div key={pub.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                    <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2 group-hover:text-blue-900 transition-colors">
                      {pub.title}
                    </h3>

                    <div className="text-gray-600 text-sm mb-3 leading-relaxed">
                      {pub.authors.map((author, i) => (
                        <span key={i} className={author.includes("Seungmin Rho") ? "font-bold text-gray-900" : ""}>
                          {author}{i < pub.authors.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center text-blue-900 font-bold bg-blue-50 px-2 py-1 rounded">
                        <FileText className="h-3.5 w-3.5 mr-1.5" />
                        {pub.venue}
                      </div>

                      {pub.tags && (
                        <div className="flex gap-2">
                          {pub.tags.map(tag => (
                            <span key={tag} className="text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                      {pub.bibtex && (
                        <button
                          onClick={() => setActiveBibtex(activeBibtex === pub.id ? null : pub.id)}
                          className={`flex items-center text-xs font-bold transition-colors uppercase tracking-wider ${activeBibtex === pub.id ? 'text-blue-900' : 'text-gray-400 hover:text-blue-900'
                            }`}
                        >
                          <Quote className="h-3 w-3 mr-1" />
                          {activeBibtex === pub.id ? 'Hide BibTeX' : 'Cite'}
                        </button>
                      )}
                    </div>

                    {activeBibtex === pub.id && pub.bibtex && (
                      <div className="mt-4 relative bg-slate-800 rounded-xl p-5 shadow-inner animate-fade-in-up">
                        <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
                          {pub.bibtex}
                        </pre>
                        <button
                          onClick={() => handleCopyBibtex(pub.bibtex!, pub.id)}
                          className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
                          title="Copy to clipboard"
                        >
                          {copiedId === pub.id ? <Check className="h-3.5 w-3.5 text-green-400" /> : <FileText className="h-3.5 w-3.5" />}
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