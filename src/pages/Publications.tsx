import React from 'react';
import { Link } from 'react-router-dom';
import { PUBLICATIONS, MEMBERS } from '../constants';
import { Award, BookOpen, Library } from 'lucide-react';
import SEO from '../components/SEO';

const Publications = () => {
  // 연구실 멤버 강조용 이름 리스트
  const memberNames = MEMBERS.map(m => m.name.trim());
  const additionalPINames = ["S. Rho", "M. Y. Lee", "M. Lee", "S. Rho"];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SEO title="Selected Publications" description="Major research contributions of PURE." />

      {/* 1. 상단 헤더 */}
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-[0.5em] mb-3">Research Highlights</h2>
          <h1 className="font-playfair text-5xl font-extrabold text-slate-900 mb-4">Major Publications</h1>
          <p className="text-slate-500 leading-relaxed">
            A curated list of our most impactful research in privacy-preserving AI, machine unlearning, and robust AI engineering.
          </p>
        </div>
        
        {/* 전체 아카이브로 유도하는 상단 버튼 */}
        <Link 
          to="/scholar" 
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg hover:scale-105 shrink-0"
        >
          <Library size={18} />
          Full Research Archive
        </Link>
      </div>

      {/* 2. 주요 논문 리스트 */}
      <div className="space-y-8">
        {PUBLICATIONS.sort((a, b) => b.year - a.year).map((pub) => (
          <div key={pub.id} className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="space-y-4">
              {/* 태그 영역 */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black border border-blue-100 uppercase">
                  {pub.year}
                </span>
                {pub.tags?.map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold border border-slate-100 uppercase">
                    #{tag}
                  </span>
                ))}
                {pub.isSelected && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black border border-amber-100">
                    <Award size={10} /> Highlighted
                  </span>
                )}
              </div>

              {/* 제목 */}
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                {pub.title}
              </h3>

              {/* 저자 */}
              <div className="text-slate-600 text-sm md:text-base leading-relaxed">
                {pub.authors.map((author, i) => {
                  const isMember = memberNames.some(m => author.includes(m)) || 
                                   additionalPINames.some(pi => author.includes(pi));
                  return (
                    <span key={i} className={isMember ? "font-bold text-slate-900 underline decoration-blue-200 underline-offset-4" : ""}>
                      {author}{i < pub.authors.length - 1 ? ", " : ""}
                    </span>
                  );
                })}
              </div>

              {/* 학술지 정보 */}
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <BookOpen size={16} className="text-blue-400" />
                <span className="text-slate-800 font-bold">{pub.venue}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Publications;
