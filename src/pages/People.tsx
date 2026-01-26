import React from 'react';
import { MEMBERS } from '../constants';
import { Mail, Globe, Github } from 'lucide-react';
import { Member } from '../types';

const People = () => {
  const getMembersByRole = (role: string) => MEMBERS.filter(m => m.role === role && !m.isAlumni);
  const getAlumni = () => MEMBERS.filter(m => m.isAlumni);

  const sections = [
    { title: "Principal Investigator", members: getMembersByRole("Principal Investigator") },
    { title: "Post-Doctoral Researchers", members: getMembersByRole("PostDoc") },
    { title: "Ph.D. Students", members: getMembersByRole("Ph.D. Student") },
    { title: "Master Students", members: getMembersByRole("Master Student") },
    { title: "Undergraduate Interns", members: getMembersByRole("Undergraduate Intern") },
  ];

  const MemberCard = ({ member }: { member: Member }) => (
    // [수정됨] w-64(약 250px)로 고정, padding 줄임, 폰트 사이즈 축소
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 w-56">
      <div className="aspect-square overflow-hidden bg-gray-100">
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
      <div className="p-4 text-center">
        <h3 className="font-playfair text-lg font-bold text-blue-900 mb-0.5">{member.name}</h3>
        <p className="text-xs font-medium text-blue-600 mb-2 line-clamp-2 min-h-[2.5em]">{member.specialization}</p>

        {member.currentAffiliation && (
          <p className="text-[10px] text-gray-500 font-semibold mb-2 uppercase tracking-wide border-t border-gray-100 pt-2">
            {member.currentAffiliation}
          </p>
        )}

        <div className="flex flex-col items-center gap-1.5">
          <a href={`mailto:${member.email}`} className="flex items-center text-xs text-gray-500 hover:text-blue-900 transition-colors">
            <Mail className="h-3 w-3 mr-1.5" />
            Contact
          </a>
          <div className="flex items-center gap-3 mt-1">
            {member.website && (
              <a href={member.website} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-900 transition-colors">
                <Globe className="h-3.5 w-3.5" />
              </a>
            )}
            {member.github && (
              <a href={member.github} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-900 transition-colors">
                <Github className="h-3.5 w-3.5" />
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

      <div className="space-y-16">
        {sections.map((section) => (
          section.members.length > 0 && (
            <div key={section.title} className="flex flex-col items-center animate-fade-in-up">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-blue-200 w-8 hidden md:block"></div>
                <h2 className="font-playfair text-xl font-bold text-blue-900 uppercase tracking-wide text-center">
                  {section.title}
                </h2>
                <div className="h-px bg-blue-200 w-8 hidden md:block"></div>
              </div>

              <div className="flex flex-wrap justify-center gap-6 w-full">
                {section.members.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          )
        ))}

        {getAlumni().length > 0 && (
          <div className="flex flex-col items-center pt-8 border-t border-gray-100 mt-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-gray-300 w-8 hidden md:block"></div>
              <h2 className="font-playfair text-xl font-bold text-gray-500 uppercase tracking-wide text-center">
                Alumni
              </h2>
              <div className="h-px bg-gray-300 w-8 hidden md:block"></div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 w-full">
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