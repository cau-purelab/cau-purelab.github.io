import React from 'react';
import { ArrowRight, Calendar, Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LAB_NAME, LAB_DESCRIPTION, RESEARCH_AREAS, NEWS, PUBLICATIONS, MEMBERS } from '../constants';
import SEO from '../components/SEO';

const Home = () => {
  const pubCount = PUBLICATIONS.length;
  const memberCount = MEMBERS.filter(m => !m.isAlumni).length;

  return (
    <div className="pb-20 overflow-hidden">
      <SEO title="Home" description="Security Visual Intelligence Lab at Chung-Ang University." />

      {/* 1. Hero Section [수정됨: 높이 축소 600px -> 450px] */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 to-black/80 z-10" />
        <img
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000"
          alt="Lab Background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="relative z-20 max-w-5xl mx-auto px-4 text-center text-white space-y-5">
          <div className="inline-block px-3 py-1 bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-2 rounded shadow-lg backdrop-blur-sm">
            Established 2024
          </div>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold tracking-tight animate-fade-in-up leading-tight">
            {LAB_NAME}
          </h1>
          <p className="text-lg md:text-xl font-light max-w-2xl mx-auto opacity-90 animate-fade-in-up delay-100 text-gray-200">
            {LAB_DESCRIPTION}
          </p>
          <div className="pt-6 animate-fade-in-up delay-200 flex justify-center gap-4">
            <Link
              to="/research"
              className="inline-flex items-center px-6 py-2.5 border border-white/30 text-sm font-medium rounded-full text-white hover:bg-white hover:text-blue-900 transition-all duration-300 backdrop-blur-sm"
            >
              Explore Research
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="py-12 border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-12 text-center">
            <div className="group cursor-default">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-900/50" />
                <p className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 group-hover:text-blue-900 transition-colors duration-500">
                  {pubCount}
                </p>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold group-hover:text-blue-900 transition-colors">
                Publications
              </p>
            </div>
            <div className="group cursor-default">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-900/50" />
                <p className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 group-hover:text-blue-900 transition-colors duration-500">
                  {memberCount}
                </p>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold group-hover:text-blue-900 transition-colors">
                Researchers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Research Intro Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50/50 rounded-3xl my-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-playfair text-3xl font-bold text-blue-900 leading-tight">
              Pursuing Excellence in <br />Secure Visual Intelligence
            </h2>
            <p className="text-gray-600 leading-relaxed text-base font-light">
              We focus on fundamental and applied research in computer vision, machine learning security, and trustworthy AI. Our goal is to build visual intelligence systems that are not only high-performing but also secure, private, and explainable.
            </p>
            <Link to="/research" className="inline-flex items-center text-blue-900 font-bold uppercase tracking-widest text-xs hover:underline underline-offset-4 mt-2">
              View Research Areas <ArrowRight className="ml-2 h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {RESEARCH_AREAS.slice(0, 3).map((area, idx) => (
              <Link key={idx} to="/research" className="group bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-blue-900 font-bold font-playfair text-base mb-1">{area.title}</div>
                  <div className="flex gap-2">
                    {area.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[9px] uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded text-gray-600">{tag}</span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-900 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Join Us Section [수정됨: 크기 대폭 축소 및 디자인 심플화] */}
      <section className="py-12 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-4 text-blue-200">Opportunities</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-playfair font-bold mb-2">Join Our Mission</h3>
              <p className="text-sm text-blue-100 font-light max-w-md">
                Recruiting motivated undergraduate interns, master's students, and Ph.D. candidates.
              </p>
            </div>
            <a href="mailto:smrho@cau.ac.kr" className="flex-shrink-0 bg-white text-blue-900 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-50 transition-all shadow-lg border border-transparent hover:border-blue-200">
              Apply Now
            </a>
          </div>
        </div>
      </section>

      {/* 5. News Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center gap-4 mb-10">
          <h2 className="font-playfair text-2xl font-bold text-blue-900">Latest News</h2>
          <div className="h-px bg-gray-200 flex-grow"></div>
          <Link to="/news" className="text-xs font-semibold text-gray-500 hover:text-blue-900 flex items-center gap-1 uppercase tracking-wider">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {NEWS.slice(0, 4).map((item) => (
            <div key={item.id} className="group flex flex-col md:flex-row md:items-center gap-4 p-5 bg-white rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all">
              <div className="flex items-center text-blue-600 font-bold min-w-[120px] tracking-wide text-xs">
                <Calendar className="h-3.5 w-3.5 mr-2" />
                <span>{item.date}</span>
              </div>
              <div className="text-gray-800 font-medium text-base group-hover:text-blue-900 transition-colors">
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