
import React from 'react';
import { CONTENT } from '../constants';
import { useLanguage } from '../context/LanguageContext';

const Research: React.FC = () => {
  const { t } = useLanguage();
  const content = CONTENT;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="mb-24">
        <h2 className="text-xs font-bold text-cauBlue uppercase tracking-[0.5em] mb-4">Core Competencies</h2>
        <h1 className="text-6xl font-serif font-bold text-slate-900 mb-8 tracking-tighter">{t('nav.research')}</h1>
        <p className="text-xl text-cauGray max-w-3xl leading-relaxed border-l-2 border-cauLightGray pl-8 font-light">
          We focus on building reliable systems that reason about <span className="text-cauBlue font-medium">safety and privacy</span>. Our research is open-sourced to promote transparency in AI development.
        </p>
      </div>

      <div className="space-y-48">
        {content.research.map((area, index) => (
          <div key={area.id} className={`flex flex-col lg:flex-row gap-20 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
            <div className="flex-1 w-full">
              <div className="relative group">
                <div className="absolute -inset-4 bg-cauBlue/5 rounded-[2rem] -z-10 rotate-2 opacity-50 group-hover:rotate-0 transition-transform duration-700"></div>
                <div className="overflow-hidden rounded-2xl shadow-2xl aspect-video border border-cauLightGray/50">
                  <img 
                    src={area.image} 
                    alt={area.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-8">
              <div className="flex flex-wrap gap-2">
                {area.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-cauBlue bg-cauBlue/5 px-4 py-1.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-4xl font-serif font-bold text-slate-900 leading-tight">{area.title}</h2>
              <p className="text-cauGray leading-relaxed text-lg font-light">
                {area.description}
              </p>
              
              <div className="flex flex-wrap gap-8 pt-6">
                {area.links?.github && (
                  <a href={area.links.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-bold text-slate-900 hover:text-cauBlue transition-colors group">
                    <span className="w-10 h-10 rounded-full border border-cauLightGray flex items-center justify-center group-hover:border-cauBlue transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                    </span>
                    Code Repository
                  </a>
                )}
                {area.links?.dataset && (
                  <a href={area.links.dataset} className="flex items-center gap-3 text-sm font-bold text-slate-900 hover:text-cauBlue transition-colors group">
                    <span className="w-10 h-10 rounded-full border border-cauLightGray flex items-center justify-center group-hover:border-cauBlue transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </span>
                    Dataset Mirror
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Research;
