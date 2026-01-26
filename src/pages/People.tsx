import React from 'react';
import { MEMBERS } from '../constants';
import { Mail, Globe, Github } from 'lucide-react';
import { Member } from '../types';

const People = () => {
  // 섹션별로 멤버 필터링 함수
  const getMembersByRole = (role: string) => MEMBERS.filter(m => m.role === role && !m.isAlumni);
  const getAlumni = () => MEMBERS.filter(m => m.isAlumni);

  // 카테고리 정의
  const sections = [
    { title: "Principal Investigator", members: getMembersByRole("Principal Investigator") },
    { title: "Post-Doctoral Researchers", members: getMembersByRole("PostDoc") },
    { title: "Ph.D. Students", members: getMembersByRole("Ph.D. Student") },
    { title: "Master Students", members: getMembersByRole("Master Student") },
    { title: "Undergraduate Interns", members: getMembersByRole("Undergraduate Intern") },
  ];

  // 멤버 카드 컴포넌트 (재사용)
  const MemberCard = ({ member }: { member: Member }) => (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 max-w-sm w-full">
      <div className="aspect-square overflow-hidden bg-gray-100">
        {member.image ? (
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
            No Image
          </div>
        )}
      </div>
      <div className="p-6 text-center">
        <h3 className="font-playfair text-xl font-bold text-blue-900 mb-1">{member.name}</h3>
        <p className="text-sm font-medium text-blue-600 mb-3">{member.specialization}</p>

        {member.currentAffiliation && (
          <p className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wide">
            Current: {member.currentAffiliation}
          </p>
        )}

        <div className="flex flex-col items-center gap-2">
          <a href={`mailto:${member.email}`} className="flex items-center text-sm text-gray-600 hover:text-blue-900 transition-colors">
            <Mail className="h-4 w-4 mr-2" />
            {member.email || "N/A"}
          </a>
          <div className="flex items-center gap-4 mt-2">
            {member.website && (
              <a href={member.website} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-900 transition-colors" title="Website">
                <Globe className="h-4 w-4" />
              </a>
            )}
            {member.github && (
              <a href={member.github} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-900 transition-colors" title="GitHub">
                <Github className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="font-playfair text-4xl font-bold text-blue-900 mb-4">Our Team</h1>
        <p className="text-gray-600">Meet the researchers behind our innovations</p>
      </div>

      <div className="space-y-20">
        {/* 각 섹션 렌더링 */}
        {sections.map((section) => (
          section.members.length > 0 && (
            <div key={section.title} className="flex flex-col items-center animate-fade-in-up">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-blue-200 w-12 hidden md:block"></div>
                <h2 className="font-playfair text-2xl font-bold text-blue-900 uppercase tracking-wide text-center">
                  {section.title}
                </h2>
                <div className="h-px bg-blue-200 w-12 hidden md:block"></div>
              </div>

              <div className="flex flex-wrap justify-center gap-8 w-full">
                {section.members.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          )
        ))}

        {/* 졸업생 섹션 */}
        {getAlumni().length > 0 && (
          <div className="flex flex-col items-center pt-10 border-t border-gray-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-gray-300 w-12 hidden md:block"></div>
              <h2 className="font-playfair text-2xl font-bold text-gray-700 uppercase tracking-wide text-center">
                Alumni
              </h2>
              <div className="h-px bg-gray-300 w-12 hidden md:block"></div>
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