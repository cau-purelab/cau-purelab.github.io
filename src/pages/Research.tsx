import React from 'react';
import { RESEARCH_AREAS } from '../constants';

const Research = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="font-playfair text-4xl font-bold text-blue-900 mb-4">Research Areas</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our lab focuses on critical challenges in modern AI, ranging from security to interpretability.
        </p>
      </div>

      <div className="grid gap-12">
        {RESEARCH_AREAS.map((area, idx) => (
          <div key={area.id} className={`flex flex-col md:flex-row gap-8 items-center ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
            <div className="w-full md:w-1/2">
              <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video group">
                <img
                  src={area.image}
                  alt={area.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors duration-300" />
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              <h2 className="font-playfair text-3xl font-bold text-blue-900">{area.title}</h2>
              <p className="text-gray-600 leading-relaxed text-lg">{area.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Research;