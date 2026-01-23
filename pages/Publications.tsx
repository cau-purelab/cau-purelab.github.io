
import React, { useState } from 'react';
import { PUBLICATIONS } from '../constants';

const Publications: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'selected'>('all');
  const [activeBibtex, setActiveBibtex] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  const years = Array.from(new Set(PUBLICATIONS.map(p => p.year))).sort((a, b) => b - a);
  const filteredPubs = filter === 'selected' 
    ? PUBLICATIONS.filter(p => p.isSelected) 
    : PUBLICATIONS;

  const handleCopyBibtex = (bib: string) => {
    navigator.clipboard.writeText(bib);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-5xl font-serif font-bold text-slate-900 mb-6">Publications</h1>
          <p className="text-xl text-cauGray max-w-3xl leading-relaxed">
            Our scholarly contributions to the fields of AI Security and Trustworthy Visual Intelligence.
          </p>
        </div>
        
        <div className="flex bg-cauLightGray p-1 rounded-full w-fit">
          <button 
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${filter === 'all' ? 'bg-white shadow-sm text-cauBlue' : 'text-cauGray hover:text-slate-700'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('selected')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${filter === 'selected' ? 'bg-white shadow-sm text-cauBlue' : 'text-cauGray hover:text-slate-700'}`}
          >
            Selected
          </button>
        </div>
      </div>

      <div className="space-y-16">
        {years.map(year => {
          const yearPubs = filteredPubs.filter(p => p.year === year);
          if (yearPubs.length === 0) return null;

          return (
            <div key={year} className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-8">
              <h2 className="text-4xl font-serif text-cauLightGray font-bold sticky top-28 h-fit tracking-tighter">{year}</h2>
              <div className="space-y-12">
                {yearPubs.map(pub => (
                  <div key={pub.id} className="group relative">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-cauBlue transition-colors mb-3 leading-tight">
                      {pub.title}
                    </h3>
                    <p className="text-cauGray text-sm mb-2">
                      {pub.authors.map((author, i) => (
                        <span key={author} className={author === 'Seungmin Rho' ? 'font-bold underline decoration-cauBlue/30 underline-offset-4' : ''}>
                          {author}{i < pub.authors.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </p>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-cauBlue text-sm font-serif italic">{pub.venue}</span>
                      <span className="w-1 h-1 rounded-full bg-cauLightGray"></span>
                      <span className="text-xs font-bold text-cauGray/40 tracking-widest uppercase">{pub.year}</span>
                    </div>
                    
                    <div className="flex gap-6 text-xs font-bold uppercase tracking-widest text-cauGray/40">
                      {pub.links.pdf && <a href={pub.links.pdf} className="hover:text-cauBlue transition-colors border-b border-transparent hover:border-cauBlue pb-0.5">PDF</a>}
                      {pub.links.code && <a href={pub.links.code} className="hover:text-cauBlue transition-colors border-b border-transparent hover:border-cauBlue pb-0.5">Code</a>}
                      {pub.bibtex && (
                        <button 
                          onClick={() => setActiveBibtex(activeBibtex === pub.id ? null : pub.id)}
                          className="hover:text-cauBlue transition-colors border-b border-transparent hover:border-cauBlue pb-0.5"
                        >
                          {activeBibtex === pub.id ? 'Close' : 'Cite'}
                        </button>
                      )}
                    </div>

                    {activeBibtex === pub.id && (
                      <div className="mt-6 bg-slate-900 rounded-xl p-6 text-[10px] text-slate-300 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                        <pre className="font-mono whitespace-pre-wrap leading-relaxed">
                          {pub.bibtex}
                        </pre>
                        <button 
                          onClick={() => pub.bibtex && handleCopyBibtex(pub.bibtex)}
                          className="absolute top-4 right-4 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                        >
                          {copyFeedback ? 'Copied!' : 'Copy'}
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
