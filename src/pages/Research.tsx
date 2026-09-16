import React from 'react';
import { Link } from 'react-router-dom';
import { RESEARCH_AREAS } from '../constants';
import { ArrowUpRight } from 'lucide-react';
import SEO from '../components/SEO';

const Research = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SEO title="Research" description="Privacy-preserving AI, machine unlearning, and robust AI engineering research." />

      <div className="mb-24 text-center">
        {/* eyebrow는 제목이 아니라 라벨이다 — h1보다 먼저 나오는 h2를 없앤다 */}
        <p className="text-xs font-bold text-blue-900 uppercase tracking-[0.4em] mb-4">Core Competencies</p>
        <h1 className="font-playfair text-5xl font-bold text-gray-900 mb-6 tracking-tight">Research Areas</h1>
        <div className="w-16 h-1 bg-blue-900 mx-auto mb-8"></div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
          We focus on building reliable systems that reason about <span className="text-blue-900 font-medium">privacy, unlearning, and robustness</span>. Our research promotes transparent and responsible AI development.
        </p>
      </div>

      <div className="space-y-32">
        {RESEARCH_AREAS.map((area, index) => (
          <div key={area.id} className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>

            {/* Image Section */}
            <div className="flex-1 w-full relative">
              {/* Decorative Number */}
              <div className={`absolute -top-12 ${index % 2 !== 0 ? '-right-4 text-right' : '-left-4 text-left'} text-[120px] font-playfair font-bold text-gray-100 -z-10 leading-none select-none`}>
                0{index + 1}
              </div>

              <div className="relative group perspective-1000">
                <div className="absolute inset-0 bg-blue-900/5 rounded-2xl transform translate-x-3 translate-y-3 transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
                <div className="relative overflow-hidden rounded-2xl shadow-xl aspect-video border border-gray-100 bg-white">
                  <img
                    src={area.image}
                    alt=""
                    width={1600}
                    height={873}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Overlay for hover effect */}
                  <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/10 transition-colors duration-500"></div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap gap-2">
                {area.tags?.map(tag => (
                  <span key={tag} className="text-xs font-bold uppercase tracking-widest text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    {tag}
                  </span>
                ))}
              </div>

              <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-gray-900 leading-tight">
                {area.title}
              </h2>

              <p className="text-gray-600 leading-relaxed text-base lg:text-lg font-light">
                {area.description}
              </p>

              {/* TODO(lab): 분야별 대표 논문 2~3편을 지정해 주면 여기에 제목과 링크를 붙인다.
                            임의로 논문을 분야에 배정하지 않기 위해 지금은 목록 전체로만 연결한다. */}
              <div className="flex flex-wrap gap-4 pt-6">
                <Link
                  to="/publications"
                  className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-blue-900 transition-colors group px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-blue-900 hover:shadow-sm"
                >
                  <span>Selected publications</span>
                  <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Research;
