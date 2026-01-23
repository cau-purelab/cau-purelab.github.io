
import React from 'react';
import { Link } from 'react-router-dom';
import { CONTENT, PUBLICATIONS } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { NewsItem } from '../types';

const Home: React.FC = () => {
  const { t } = useLanguage();
  const content = CONTENT;

  // Group news by year
  const newsByYear = content.news.reduce((acc, item) => {
    const year = item.date.split('.')[0];
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {} as Record<string, NewsItem[]>);

  const sortedYears = Object.keys(newsByYear).sort((a, b) => b.localeCompare(a));

  // Dynamic Stats
  const publicationCount = PUBLICATIONS.length;
  // Count only Researchers: PostDoc, PhD, Master, Undergraduate (Interns)
  const researcherCount = CONTENT.members.filter(m => 
    !m.isAlumni && 
    ['PostDoc', 'PhD', 'Master', 'Undergraduate'].includes(m.role)
  ).length;

  return (
    <div className="pb-20 overflow-hidden">
      {/* Hero Section */}
      <header className="relative min-h-[90vh] flex items-center pt-20">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 -z-20 hidden lg:block"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cauBlue/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-cauRed text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-8 rounded shadow-lg shadow-cauRed/20">
                Established 2024
              </div>
              <h1 className="text-6xl md:text-8xl font-serif tracking-tighter leading-[0.9] text-slate-900 mb-10">
                <span className="text-cauBlue">Security</span><br />
                <span className="text-cauBlue">Visual</span><br />
                <span className="text-cauBlue">Intelligence</span><br />
                <span className="text-cauBlue">Lab</span><br />
              </h1>
              <p className="text-xl text-cauGray max-w-lg leading-relaxed mb-12 font-light">
                {content.fullName} (SVIL) pioneers research in <span className="text-slate-900 font-medium">Machine Unlearning</span> and <span className="text-slate-900 font-medium">Trustworthy AI</span> systems.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/research" className="group flex items-center gap-4 bg-slate-900 text-white px-8 py-5 rounded-full hover:bg-cauBlue transition-all duration-500 shadow-2xl shadow-slate-200">
                  <span className="font-medium tracking-tight">{t('hero.explore')}</span>
                  <span className="group-hover:translate-x-2 transition-transform duration-500 text-xl">→</span>
                </Link>
                <Link to="/people" className="flex items-center gap-4 border border-cauLightGray text-slate-800 px-8 py-5 rounded-full hover:bg-slate-50 transition-all font-medium">
                  {t('hero.team')}
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="aspect-[4/5] bg-white rounded-3xl shadow-[0_100px_100px_-50px_rgba(0,0,0,0.1)] overflow-hidden border border-cauLightGray rotate-2">
                <img 
                  src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1000" 
                  className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000" 
                  alt="Visual Intelligence"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-2xl shadow-xl border border-slate-50 max-w-xs -rotate-3">
                <p className="text-sm font-serif italic text-cauGray leading-relaxed">
                  "Advancing the safety and privacy of generative models in a connected world."
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cauBlue/10 border border-cauBlue/20"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cauGray/60">SVIL Initiative</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-24 border-y border-cauLightGray bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-12 text-center md:text-left">
            {[
              { label: t('stats.pubs'), value: publicationCount },
              { label: t('stats.members'), value: researcherCount },
            ].map((stat) => (
              <div key={stat.label} className="group">
                <p className="text-5xl md:text-6xl font-serif font-bold text-slate-900 group-hover:text-cauBlue transition-colors duration-500">{stat.value}</p>
                <p className="text-[10px] text-cauGray mt-4 uppercase tracking-[0.4em] font-bold group-hover:text-cauBlue transition-colors">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Grid */}
      <section className="py-40 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
            <div className="max-w-xl">
              <h2 className="text-xs font-bold text-cauBlue uppercase tracking-[0.5em] mb-4">Focus</h2>
              <h3 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
                Pioneering <span className="italic font-normal">Next-Gen</span> Security.
              </h3>
            </div>
            <Link to="/research" className="text-slate-900 font-bold text-sm tracking-widest uppercase flex items-center gap-3 hover:text-cauBlue transition-all">
              <span>Discover More</span>
              <span className="w-10 h-10 rounded-full border border-cauLightGray flex items-center justify-center">→</span>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16">
            {content.research.map((area) => (
              <div key={area.id} className="group">
                <div className="relative overflow-hidden rounded-3xl aspect-[16/9] mb-8 bg-white shadow-sm transition-all duration-700 hover:shadow-2xl hover:shadow-cauBlue/10 hover:-translate-y-2 border border-cauLightGray/50">
                  <img 
                    src={area.image} 
                    alt={area.title} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                  />
                  <div className="absolute top-6 left-6 flex gap-2">
                    {area.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[9px] font-bold uppercase tracking-widest text-cauBlue rounded-full shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <h4 className="text-2xl font-serif font-bold text-slate-900 mb-4 group-hover:text-cauBlue transition-colors">{area.title}</h4>
                <p className="text-cauGray text-sm leading-relaxed mb-6 max-w-md">{area.description}</p>
                <div className="h-px bg-cauLightGray w-12 group-hover:w-full transition-all duration-700"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-40 bg-cauBlue text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-xs font-bold uppercase tracking-[0.5em] mb-8 text-white/50">Opportunities</h2>
          <h3 className="text-4xl md:text-6xl font-serif font-bold mb-10 tracking-tight">Join Our Mission</h3>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            We are always looking for motivated undergraduate interns, master's students, and Ph.D. candidates to secure the future of AI.
          </p>
          <a href="mailto:smrho@cau.ac.kr" className="inline-block bg-white text-cauBlue px-10 py-5 rounded-full font-bold hover:bg-slate-100 transition-all shadow-xl shadow-cauBlue/20">
            Apply to SVIL
          </a>
        </div>
      </section>

      {/* News Feed grouped by Year */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 mb-24">
            <h2 className="text-xs font-bold text-cauGray/40 uppercase tracking-[0.5em] whitespace-nowrap">{t('section.news')}</h2>
            <div className="h-px bg-cauLightGray w-full"></div>
          </div>

          <div className="space-y-24">
            {sortedYears.map((year) => (
              <div key={year} className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-8">
                <h3 className="text-4xl font-serif text-cauLightGray font-bold sticky top-28 h-fit tracking-tighter group-hover:text-cauBlue transition-colors">{year}</h3>
                <div className="divide-y divide-cauLightGray border-t border-cauLightGray">
                  {newsByYear[year].map((news) => (
                    <div key={news.id} className="group relative flex flex-col md:flex-row md:items-center gap-8 py-10 hover:bg-slate-50 transition-all duration-500 px-8 -mx-8 rounded-3xl cursor-default">
                      <div className="flex-shrink-0 md:w-32">
                        <p className="text-xs font-bold text-cauGray/40 tracking-widest group-hover:text-cauBlue transition-colors uppercase">{news.date}</p>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-xl md:text-2xl font-serif font-medium text-slate-700 group-hover:text-slate-900 transition-colors leading-tight">
                          {news.title}
                        </h5>
                      </div>
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                        <div className="w-12 h-12 rounded-full border border-cauBlue/20 flex items-center justify-center text-cauBlue">
                          →
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
