import React from 'react';
import { Link } from 'react-router-dom';
import { PUBLICATIONS, MEMBERS, PI_NAME_VARIANTS } from '../constants';
import { BookOpen, ExternalLink, Library } from 'lucide-react';
import SEO from '../components/SEO';
import PageHeader from '../components/PageHeader';
import { isPiName } from '../lib/bibtex';

const Publications = () => {
  // 연구실 멤버 강조용 이름 리스트
  const memberNames = MEMBERS.map(m => m.name.trim());

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SEO title="Selected Publications" description="Major research contributions of PURE." />

      {/* 1. 상단 헤더 — 정렬·크기·색은 PageHeader가 전 페이지 공통으로 정한다.
             제목 문구는 scripts/site.cjs의 /publications 라우트 title·SEO title과 같게 유지할 것 */}
      <PageHeader
        eyebrow="Research Highlights"
        title="Selected Publications"
        description="A curated list of our most impactful research in privacy-preserving AI, machine unlearning, and robust AI engineering."
        action={
          /* 전체 아카이브로 유도하는 상단 버튼 */
          <Link
            to="/scholar"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg hover:scale-105"
          >
            <Library size={18} aria-hidden="true" />
            Publication Archive
          </Link>
        }
      />

      {/* 2. 주요 논문 리스트
           투고 중(status) 논문은 연도가 앞서더라도 목록 하단에 둔다 — 게재된 성과를 먼저 보여주기 위함 */}
      <ul className="space-y-8">
        {[...PUBLICATIONS]
          .sort((a, b) => (a.status ? 1 : 0) - (b.status ? 1 : 0) || b.year - a.year)
          .map((pub) => (
          <li key={pub.id} className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="space-y-4">
              {/* 태그 영역 — 'Highlighted' 배지는 페이지 제목이 이미 선별 목록임을 말하므로 두지 않는다 */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black border border-blue-100 uppercase">
                  {pub.year}
                </span>
                {pub.tags?.map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-100 uppercase">
                    #{tag}
                  </span>
                ))}
                {pub.status && (
                  <span className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-black border border-orange-200 border-dashed uppercase">
                    {pub.status}
                  </span>
                )}
              </div>

              {/* 제목 — 링크가 있을 때만 링크가 된다.
                  예전에는 카드 어디에 커서를 올려도 제목이 링크색으로 변했지만 제목은 <h3>일 뿐이라
                  눌러도 아무 일이 없었다. 호버 색 변화는 실제로 누를 수 있는 경우에만 남긴다. */}
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                {pub.link ? (
                  <a
                    href={pub.link}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${pub.title} (opens in a new tab)`}
                    className="hover:text-blue-700 hover:underline decoration-blue-300 underline-offset-4 transition-colors"
                  >
                    {pub.title}
                  </a>
                ) : (
                  pub.title
                )}
              </h3>

              {/* 저자 */}
              <div className="text-slate-600 text-sm md:text-base leading-relaxed">
                {pub.authors.map((author, i) => {
                  // PI 판정은 People·Scholar와 같은 isPiName()을 쓴다 — 표기 변형('S. Rho', 'MY Lee')을
                  // 정규화해 비교하므로 단순 문자열 포함 검사보다 누락이 적다.
                  const isMember = memberNames.some(m => author.includes(m)) ||
                                   isPiName(author, PI_NAME_VARIANTS);
                  return (
                    <span key={i} className={isMember ? "font-bold text-slate-900 underline decoration-blue-200 underline-offset-4" : ""}>
                      {author}{i < pub.authors.length - 1 ? ", " : ""}
                    </span>
                  );
                })}
              </div>

              {/* 학술지 정보 */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 font-medium">
                <BookOpen size={16} className="text-blue-500" aria-hidden="true" />
                <span className="text-slate-800 font-bold">{pub.venue}</span>
                {pub.link && (
                  <a
                    href={pub.link}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open "${pub.title}" in a new tab`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100 hover:bg-blue-700 hover:text-white transition-colors"
                  >
                    <ExternalLink size={12} aria-hidden="true" /> {pub.link.includes('doi.org') ? 'DOI' : 'Google Scholar'}
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Publications;
