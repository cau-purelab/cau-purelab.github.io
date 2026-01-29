import React from 'react';
import { MEMBERS } from '../constants';
import { Mail, Globe, Github } from 'lucide-react';
import { Member } from '../types';
import SEO from '../components/SEO';

const People = () => {
  const getMembersByRole = (role: string) => MEMBERS.filter(m => m.role === role && !m.isAlumni);
  const getAlumni = () => MEMBERS.filter(m => m.isAlumni);

  const sections = [
    { title: "Principal Investigator", members: getMembersByRole("Principal Investigator") },
    { title: "Co-Principal Investigator", members: getMembersByRole("Co-Principal Investigator") }, // [추가됨]
    { title: "Post-Doctoral Researchers", members: getMembersByRole("PostDoc") },
    { title: "Ph.D. Students", members: getMembersByRole("Ph.D. Student") },
    { title: "Master Students", members: getMembersByRole("Master Student") },
    { title: "Undergraduate Interns", members: getMembersByRole("Undergraduate Intern") },
  ];

  const MemberCard = ({ member }: { member: Member }) => {
    // 해시태그 파싱 함수: "#Tag1 #Tag2" 문자열을 배열로 변환
    const tags = member.specialization
      ? member.specialization.split('#').filter(tag => tag.trim() !== '')
      : [];

    return (
      <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 w-64 flex flex-col h-full">
        {/* 이미지 영역 */}
        <div className="aspect-square overflow-hidden bg-gray-100 relative">
          {member.image ? (
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 text-xs">
              No Image
            </div>
          )}
        </div>

        {/* 정보 영역 */}
        <div className="p-5 text-center flex flex-col flex-grow">
          <h3 className="font-playfair text-xl font-bold text-blue-900 mb-2">{member.name}</h3>

          {/* [수정됨] 연구 태그 뱃지 형태로 표시 */}
          <div className="flex flex-wrap justify-center gap-1.5 mb-4 min-h-[1.5rem] content-start">
            {tags.length > 0 ? (
              tags.map((tag, idx) => (
                <span key={idx} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 font-medium leading-tight">
                  {tag.trim()}
                </span>
              ))
            ) : (
              <span className="h-4"></span> // 공간 유지용
            )}
          </div>

          {member.currentAffiliation && member.currentAffiliation !== "N/A" && (
            <div className="mb-3 pt-3 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Current</p>
              <p className="text-xs text-gray-600 font-medium leading-tight">{member.currentAffiliation}</p>
            </div>
          )}

          {/* 링크 영역 (하단 고정) */}
          <div className="mt-auto space-y-2 pt-3 border-t border-gray-50 w-full">
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-blue-900 transition-colors py-0.5 group/link"
              >
                <Mail className="w-3.5 h-3.5 flex-shrink-0 group-hover/link:scale-110 transition-transform" />
                <span className="truncate max-w-[180px]">{member.email}</span>
              </a>
            )}

            {member.website && (
              <a
                href={member.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-blue-900 transition-colors py-0.5 group/link"
              >
                <Globe className="w-3.5 h-3.5 flex-shrink-0 group-hover/link:scale-110 transition-transform" />
                <span>Personal Website</span>
              </a>
            )}

            {member.github && (
              <a
                href={member.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-blue-900 transition-colors py-0.5 group/link"
              >
                <Github className="w-3.5 h-3.5 flex-shrink-0 group-hover/link:scale-110 transition-transform" />
                <span>GitHub Profile</span>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO title="People" description="Meet the researchers at SVIL: PI, Co-PI, PostDocs, and Students." />

      <div className="text-center mb-20">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold text-blue-900 mb-6">Our Team</h1>
        <p className="text-lg text-gray-600 font-light">Meet the researchers behind our innovations</p>
      </div>

      <div className="space-y-24">
        {sections.map((section) => (
          section.members.length > 0 && (
            <div key={section.title} className="flex flex-col items-center animate-fade-in-up">
              <div className="flex items-center gap-6 mb-12 w-full max-w-4xl">
                <div className="h-px bg-gray-200 flex-grow"></div>
                <h2 className="font-playfair text-2xl font-bold text-blue-900 uppercase tracking-wider text-center px-4">
                  {section.title}
                </h2>
                <div className="h-px bg-gray-200 flex-grow"></div>
              </div>

              <div className="flex flex-wrap justify-center gap-8 w-full">
                {section.members.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          )
        ))}

        {getAlumni().length > 0 && (
          <div className="flex flex-col items-center pt-16 border-t border-gray-100 mt-16">
            <div className="flex items-center gap-6 mb-12 w-full max-w-4xl">
              <div className="h-px bg-gray-200 flex-grow"></div>
              <h2 className="font-playfair text-2xl font-bold text-gray-500 uppercase tracking-wider text-center px-4">
                Alumni
              </h2>
              <div className="h-px bg-gray-200 flex-grow"></div>
            </div>
            <div className="flex flex-wrap justify-center gap-8 w-full">
              {getAlumni().map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default People;