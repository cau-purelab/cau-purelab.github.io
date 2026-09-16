import React from 'react';
import { ArrowRight, Calendar, Users, FileText, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LAB_DESCRIPTION, LAB_EMAIL, LAB_ESTABLISHED_YEAR, LAB_FULL_NAME, LAB_SHORT_NAME, RESEARCH_AREAS, NEWS, PUBLICATIONS, MEMBERS } from '../constants';
import SEO from '../components/SEO';

const Home = () => {
  // 'Publications'가 무엇을 센 숫자인지 드러나도록: 수동 선별 목록 중 '게재된' 논문만 센다.
  // (투고 중 항목은 status가 있어 제외되고, 전체 아카이브 건수는 /scholar에 따로 있다)
  const selectedPubCount = PUBLICATIONS.filter(p => !p.status).length;
  const memberCount = MEMBERS.filter(m => !m.isAlumni).length;
  // 삽입 순서에 기대지 않고 항상 최신순으로 자른다 (감사 20번)
  const latestNews = [...NEWS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  return (
    <div className="pb-20 overflow-hidden">
      <SEO title="Home" description="PURE lab at Chung-Ang University." />

      {/* 1. Hero Section — 소형 뷰포트에서 텍스트가 잘리지 않도록 고정 높이 대신 최소 높이를 쓴다 */}
      <section className="relative min-h-[450px] py-20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 to-black/80 z-10" />
        {/* LCP 이미지 — lazy 금지. 배경 장식이라 alt는 빈 문자열로 둔다 */}
        <img
          src="/assets/hero.webp"
          alt=""
          width={1600}
          height={1068}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="relative z-20 max-w-5xl mx-auto px-4 text-center text-white space-y-5">
          <p className="inline-block px-3 py-1 bg-red-600/90 text-white text-xs font-bold uppercase tracking-[0.3em] mb-2 rounded shadow-lg backdrop-blur-sm">
            Established {LAB_ESTABLISHED_YEAR}
          </p>
          <h1 className="font-playfair font-bold tracking-tight animate-fade-in-up leading-tight">
            <span className="block text-6xl md:text-8xl">{LAB_SHORT_NAME}</span>
            <span className="block text-lg md:text-2xl font-normal tracking-wide mt-3 text-blue-100">{LAB_FULL_NAME}</span>
          </h1>
          <p className="text-lg md:text-xl font-light max-w-2xl mx-auto opacity-90 animate-fade-in-up text-gray-200">
            {LAB_DESCRIPTION}
          </p>
          <div className="pt-6 animate-fade-in-up flex justify-center gap-4">
            <Link
              to="/people"
              className="inline-flex items-center px-6 py-2.5 border border-white/30 text-sm font-medium rounded-full text-white hover:bg-white hover:text-blue-900 transition-all duration-300 backdrop-blur-sm"
            >
              Meet Our Team
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="py-12 border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-12 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-900/60" />
                <p className="text-4xl md:text-5xl font-playfair font-bold text-gray-900">
                  {selectedPubCount}
                </p>
              </div>
              <p className="text-xs text-gray-600 uppercase tracking-[0.2em] font-bold">
                Selected Publications
              </p>
              {/* 이 숫자는 수동 선별 목록이다 — 전체 아카이브 건수와 다르다는 점을 링크로 드러낸다 */}
              <Link to="/scholar" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 underline underline-offset-4">
                See the full archive <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-900/60" />
                <p className="text-4xl md:text-5xl font-playfair font-bold text-gray-900">
                  {memberCount}
                </p>
              </div>
              <p className="text-xs text-gray-600 uppercase tracking-[0.2em] font-bold">
                Researchers
              </p>
              <Link to="/people" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 underline underline-offset-4">
                Meet the team <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Research Intro Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50/50 rounded-3xl my-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-playfair text-3xl font-bold text-blue-900 leading-tight">
              Pursuing Excellence in <br />Privacy, Unlearning, and Robust Engineering
            </h2>
            <p className="text-gray-600 leading-relaxed text-base font-light">
              We focus on fundamental and applied research in privacy-preserving AI, machine unlearning, and robust engineering. Our goal is to build AI systems that are high-performing, private, reliable, and explainable.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {RESEARCH_AREAS.slice(0, 3).map((area, idx) => (
              <Link key={idx} to="/research" className="group bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-blue-900 font-bold font-playfair text-base mb-1">{area.title}</div>
                  <div className="flex gap-2">
                    {area.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded text-gray-700">{tag}</span>
                    ))}
                  </div>
                </div>
                {/* 실제 링크이므로 화살표를 또렷하게 — 링크가 아닌 뉴스 카드와 시각 언어를 분리한다 */}
                <ArrowRight className="h-4 w-4 text-blue-600 group-hover:text-blue-900 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Join Us Section (수정됨) */}
      <section className="py-12 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* eyebrow는 제목이 아니라 라벨이다 — 아웃라인을 어지럽히지 않도록 <p>로 둔다 */}
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4 text-blue-200">Opportunities</p>
          <div className="flex flex-col items-center justify-center gap-5">
            <h2 className="text-2xl md:text-3xl font-playfair font-bold mb-1">Join Our Mission</h2>
            <p className="text-sm text-blue-100 font-light max-w-lg mx-auto">
              Recruiting motivated undergraduate interns, master's students, and Ph.D. candidates. If you are interested in joining our lab, please feel free to contact us.
            </p>
            {/* TODO(lab): 모집 대상별 요건, 보낼 자료(CV·성적표 등), 메일 제목 형식을 연구실에서 확인해 여기에 추가할 것.
                          확인 전에는 없는 규정을 지어내지 않는다. */}
            <div className="mt-2 inline-flex items-center gap-3 px-6 py-3 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm">
              <Mail className="w-4 h-4 text-blue-200" />
              <span className="text-sm text-blue-100">Contact us at:</span>
              <a 
                href={`mailto:${LAB_EMAIL}`}
                className="text-sm font-bold text-white hover:text-blue-200 transition-colors underline decoration-blue-400/50 underline-offset-4"
              >
                {LAB_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. News Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center gap-4 mb-10">
          <h2 className="font-playfair text-2xl font-bold text-blue-900">Latest News</h2>
          <div className="h-px bg-gray-200 flex-grow"></div>
          <Link to="/news" className="text-xs font-semibold text-gray-600 hover:text-blue-900 flex items-center gap-1 uppercase tracking-wider py-1">
            View All <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>

        {/* 뉴스 항목은 링크가 아니다 — hover 색 변화·그림자 같은 가짜 어포던스를 두지 않는다 */}
        <ul className="space-y-3">
          {latestNews.map((item) => (
            <li key={item.id} className="flex flex-col md:flex-row md:items-center gap-4 p-5 bg-white rounded-xl border border-gray-100">
              <div className="flex items-center text-blue-700 font-bold min-w-[120px] tracking-wide text-xs">
                <Calendar className="h-3.5 w-3.5 mr-2" aria-hidden="true" />
                <span>{item.date}</span>
              </div>
              <div className="text-gray-800 font-medium text-base">
                {item.title}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Home;
