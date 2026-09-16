import React from 'react';
import { Link } from 'react-router-dom';
import { RESEARCH_AREAS } from '../constants';
import { ArrowUpRight } from 'lucide-react';
import SEO from '../components/SEO';
import PageHeader from '../components/PageHeader';

const Research = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SEO title="Research" description="Privacy-preserving AI, machine unlearning, and robust AI engineering research." />

      <PageHeader
        eyebrow="Core Competencies"
        title="Research Areas"
        description={
          <>
            We focus on building reliable systems that reason about{' '}
            <span className="text-blue-800 font-medium">privacy, unlearning, and robustness</span>. Our research
            promotes transparent and responsible AI development.
          </>
        }
      />

      <div className="space-y-32">
        {RESEARCH_AREAS.map((area, index) => (
          // id는 홈의 연구 카드가 가리키는 앵커다(/research#machine-unlearning).
          // scroll-mt로 고정 Navbar와 아래 장식 숫자(-top-12)가 가려지지 않을 만큼 여백을 둔다.
          <div
            key={area.id}
            id={area.id}
            className={`scroll-mt-24 flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
          >

            {/* Image Section */}
            <div className="flex-1 w-full relative">
              {/* 장식 번호 — 예전에는 -z-10이 걸려 있어 App 루트의 bg-white 뒤로 내려가 한 번도 보인 적이
                  없었다. 이제는 이미지 래퍼에 z-10을 줘서 그 아래에 깔리게만 하고, 색도 흰 배경에서
                  실제로 읽히는 단계까지 올린다. 내용이 아니므로 스크린리더에서는 감춘다. */}
              <div
                aria-hidden="true"
                className={`absolute -top-12 ${index % 2 !== 0 ? '-right-4 text-right' : '-left-4 text-left'} text-[120px] font-playfair font-bold text-slate-300 leading-none select-none`}
              >
                0{index + 1}
              </div>

              <div className="relative z-10 group perspective-1000">
                <div className="absolute inset-0 bg-blue-900/5 rounded-2xl transform translate-x-3 translate-y-3 transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
                <div className="relative overflow-hidden rounded-2xl shadow-xl aspect-video border border-slate-100 bg-white">
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

              <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-slate-900 leading-tight">
                {area.title}
              </h2>

              <p className="text-slate-600 leading-relaxed text-base lg:text-lg font-light">
                {area.description}
              </p>

              {/* TODO(lab): 분야별 대표 논문 2~3편을 지정해 주면 여기에 제목과 링크를 붙인다.
                            임의로 논문을 분야에 배정하지 않기 위해 지금은 목록 전체로만 연결한다. */}
              <div className="flex flex-wrap gap-4 pt-6">
                <Link
                  to="/publications"
                  className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-900 transition-colors group px-4 py-2 bg-white border border-slate-200 rounded-full hover:border-blue-900 hover:shadow-sm"
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
