import React from 'react';
import { RESEARCH_AREAS } from '../constants';
import { Github, Database } from 'lucide-react';
import SEO from '../components/SEO';

const Research = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <SEO title="Research" description="Machine Unlearning, Secure Computer Vision, and Trustworthy AI research." />

      <div className="mb-20">
        <h2 className="text-xs font-bold text-blue-900 uppercase tracking-[0.5em] mb-4">Core Competencies</h2>
        <h1 className="font-playfair text-5xl font-bold text-gray-900 mb-8 tracking-tight">Research Areas</h1>
        <p className="text-xl text-gray-600 max-w-3xl leading-relaxed border-l-4 border-blue-900/10 pl-8 font-light">
          We focus on building reliable systems that reason about <span className="text-blue-900 font-medium">safety and privacy</span>. Our research is open-sourced to promote transparency in AI development.
        </p>
      </div>

      <div className="space-y-32">
        {RESEARCH_AREAS.map((area, index) => (
          <div key={area.id} className={`flex flex-col lg:flex-row gap-16 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
            {/* Image Section */}
            <div className="flex-1 w-full">
              <div className="relative group">
                <div className="absolute -inset-4 bg-blue-900/5 rounded-[2rem] -z-10 rotate-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="overflow-hidden rounded-2xl shadow-xl aspect-video border border-gray-100">
                  <img
                    src={area.image}
                    alt={area.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap gap-2">
                {area.tags?.map(tag => (
                  <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-blue-900 bg-blue-50 px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <h2 className="text-4xl font-playfair font-bold text-gray-900 leading-tight">{area.title}</h2>
              <p className="text-gray-600 leading-relaxed text-lg font-light">
                {area.description}
              </p>

              <div className="flex flex-wrap gap-6 pt-6">
                {area.github && (
                  <a href={area.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-bold text-gray-900 hover:text-blue-900 transition-colors group">
                    <span className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-blue-900 transition-colors bg-white">
                      <Github className="h-5 w-5" />
                    </span>
                    Code Repository
                  </a>
                )}
                {area.dataset && (
                  <a href={area.dataset} className="flex items-center gap-3 text-sm font-bold text-gray-900 hover:text-blue-900 transition-colors group">
                    <span className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-blue-900 transition-colors bg-white">
                      <Database className="h-5 w-5" />
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