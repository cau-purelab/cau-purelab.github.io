import React from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LAB_NAME, LAB_DESCRIPTION, RESEARCH_AREAS, NEWS } from '../constants';

const Home = () => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-black/80 z-10" />
        <img
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000"
          alt="Lab Background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="relative z-20 max-w-5xl mx-auto px-4 text-center text-white space-y-6">
          <h1 className="font-playfair text-5xl md:text-7xl font-bold tracking-tight animate-fade-in-up">
            {LAB_NAME}
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto opacity-90 animate-fade-in-up delay-100">
            {LAB_DESCRIPTION}
          </p>
          <div className="pt-8 animate-fade-in-up delay-200">
            <Link
              to="/research"
              className="inline-flex items-center px-8 py-3 border border-white/30 text-base font-medium rounded-full text-white hover:bg-white hover:text-blue-900 transition-all duration-300 backdrop-blur-sm"
            >
              Explore Research
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-playfair text-3xl font-bold text-blue-900">
              Pursuing Excellence in <br />Secure Visual Intelligence
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              We focus on fundamental and applied research in computer vision, machine learning security, and trustworthy AI. Our goal is to build visual intelligence systems that are not only high-performing but also secure, private, and explainable.
            </p>
            <div className="h-1 w-20 bg-blue-900" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {RESEARCH_AREAS.slice(0, 4).map((area, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="text-blue-900 font-semibold mb-2">{area.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section (새로 추가됨) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50 rounded-3xl p-8 md:p-12">
        <div className="flex items-center gap-4 mb-10 justify-center md:justify-start">
          <h2 className="font-playfair text-3xl font-bold text-blue-900">Latest News</h2>
          <div className="h-px bg-gray-300 flex-grow max-w-xs hidden md:block"></div>
        </div>

        <div className="space-y-6">
          {NEWS.slice(0, 5).map((item) => (
            <div key={item.id} className="group flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center text-blue-600 font-semibold min-w-[120px]">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm">{item.date}</span>
              </div>
              <div className="text-gray-800 font-medium group-hover:text-blue-900 transition-colors">
                {item.title}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;