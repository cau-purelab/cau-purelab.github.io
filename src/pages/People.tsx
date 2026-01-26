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
    { title: "Post-Doctoral Researchers", members: getMembersByRole("PostDoc") },
    { title: "Ph.D. Students", members: getMembersByRole("Ph.D. Student") },
    { title: "Master Students", members: getMembersByRole("Master Student") },
    { title: "Undergraduate Interns", members: getMembersByRole("Undergraduate Intern") },
  ];

  const MemberCard = ({ member }: { member: Member }) => (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 w-56 flex flex-col h-full">
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

      <div className="p-4 text-center flex flex-col flex-grow">
        <h3 className="font-playfair text-lg font-bold text-blue-900 mb-0.5">{member.name}</h3>
        <p className="text-xs font-medium text-blue-600 mb-3 min-h-[1.5rem]">
          {member.specialization || " "}
        </p>

        {member.currentAffiliation && member.currentAffiliation !== "N/A" && (
          <div className="mb-3 pt-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Current</p>
            <p className="text-xs text-gray-600 font-medium leading-tight">{member.currentAffiliation}</p>
          </div>
        )}

        <div className="mt-auto space-y-1.5 pt-2 border-t border-gray-50 w-full">
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-blue-900 transition-colors py-0.5 group/link"
            >
              <Mail className="w-3 h-3 flex-shrink-0 group-hover/link:scale-110 transition-transform" />
              <span className="truncate max-w-[160px]">{member.email}</span>
            </a>
          )}

          {member.website && (
            <a
              href={member.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-blue-900 transition-colors py-0.5 group/link"
            >
              <Globe className="w-3 h-3 flex-shrink-0 group-hover/link:scale-110 transition-transform" />
              <span>Personal Website</span>
            </a>
          )}

          {member.github && (
            <a
              href={member.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-blue-900 transition-colors py-0.5 group/link"
            >
              <Github className="w-3 h-3 flex-shrink-0 group-hover/link:scale-110 transition-transform" />
              <span>GitHub Profile</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO title="People" description="Meet the researchers at SVIL: PI, PostDocs, and Students." />

      <div className="text-center mb-16">
        <h1 className="font-playfair text-4xl font-bold text-blue-900 mb-4">Our Team</h1>
        <p className="text-gray-600">Meet the researchers behind our innovations</p>
      </div>

      <div className="space-y-20">
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

              <div className="flex flex-wrap justify-center gap-x-6 gap-y-10 w-full">
                {section.members.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          )
        ))}

        {getAlumni().length > 0 && (
          <div className="flex flex-col items-center pt-12 border-t border-gray-100 mt-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-gray-300 w-8 hidden md:block"></div>
              <h2 className="font-playfair text-xl font-bold text-gray-500 uppercase tracking-wide text-center">
                Alumni
              </h2>
              <div className="h-px bg-gray-300 w-8 hidden md:block"></div>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-10 w-full">
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