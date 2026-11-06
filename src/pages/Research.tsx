import React from 'react';
import { Link } from 'react-router-dom';
import { RESEARCH_AREAS } from '../constants';
import { ArrowUpRight } from 'lucide-react';
import SEO from '../components/SEO';
import PageHeader from '../components/PageHeader';
import ProjectCard from '../components/ProjectCard';
import { ACTIVE_PROJECTS } from '../data/projects';

const Research = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SEO />

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
              <div className="relative z-10 group perspective-1000">
                <div className="absolute inset-0 bg-blue-900/5 rounded-2xl transform translate-x-3 translate-y-3 transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
                <div className="relative overflow-hidden rounded-2xl shadow-xl aspect-video border border-slate-100 bg-white">
                  <img
                    src={area.image}
                    alt=""
                    width={1600}
                    height={900}
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

      {/* 연구를 지원하는 정부 과제. id는 홈 하이라이트가 가리키는 앵커다(/research#projects).
          데이터·출처는 src/data/projects.ts — 종료일이 지난 과제는 빌드 때 저절로 빠진다. */}
      {ACTIVE_PROJECTS.length > 0 && (
        <section id="projects" aria-labelledby="projects-heading" className="scroll-mt-24 mt-32">
          <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-700 mb-3">Funding</p>
              <h2 id="projects-heading" className="text-3xl lg:text-4xl font-playfair font-bold text-slate-900">
                Funded Research Projects
              </h2>
              <p className="text-slate-600 font-light mt-3 max-w-2xl">
                National R&amp;D and education programs that currently support our research.
              </p>
            </div>
            <p className="text-5xl font-playfair font-bold text-blue-900/20 tabular-nums" aria-hidden="true">
              {String(ACTIVE_PROJECTS.length).padStart(2, '0')}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {ACTIVE_PROJECTS.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Research;
