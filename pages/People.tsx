
import React from 'react';
import { CONTENT } from '../constants';
import { useLanguage } from '../context/LanguageContext';

const People: React.FC = () => {
  const { t } = useLanguage();
  const content = CONTENT;
  const categories = ['PI', 'PostDoc', 'PhD', 'Master', 'Undergraduate'];

  const categoryLabels: Record<string, string> = {
    'PI': 'Principal Investigator',
    'PostDoc': 'Post-doctoral Fellows',
    'PhD': 'Ph.D. Students',
    'Master': "Master's Students",
    'Undergraduate': 'Interns & Undergraduates'
  };

  const alumni = content.members.filter(m => m.isAlumni);
  const currentMembers = content.members.filter(m => !m.isAlumni);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="mb-24">
        <h1 className="text-6xl md:text-8xl font-serif font-bold text-slate-900 mb-8 tracking-tighter">
          <span className="text-cauBlue">SVIL</span>.
        </h1>
        <p className="text-xl text-cauGray max-w-2xl leading-relaxed border-l-2 border-cauBlue/10 pl-8">
          A diverse group of researchers committed to pushing the boundaries of 
          <span className="text-cauBlue font-semibold italic mx-1">AI Security</span> and 
          <span className="text-cauBlue font-semibold italic mx-1">Visual Intelligence</span>.
        </p>
      </div>

      <div className="space-y-40">
        {categories.map((cat) => {
          const catMembers = currentMembers.filter(m => m.role === cat);
          if (catMembers.length === 0) return null;

          return (
            <div key={cat} className="animate-in fade-in slide-in-from-bottom-10 duration-700 delay-150">
              <div className="flex items-center gap-6 mb-16">
                <h2 className="text-sm font-bold text-cauGray/40 uppercase tracking-[0.4em] whitespace-nowrap">
                  {categoryLabels[cat]}
                </h2>
                <div className="h-px bg-cauLightGray w-full"></div>
                <span className="text-cauBlue font-serif italic text-xl">{catMembers.length}</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                {catMembers.map((member) => (
                  <div key={member.id} className="group">
                    <div className="relative mb-6 overflow-hidden rounded-2xl aspect-[3/4] bg-slate-50 shadow-sm border border-cauLightGray">
                      <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-cauBlue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-serif font-bold text-slate-900">{member.name}</h3>
                      <p className="text-xs text-cauBlue font-bold uppercase tracking-widest">{member.specialization}</p>
                      
                      <div className="flex gap-4 pt-4 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                        {member.links.web && (
                          <a href={member.id === 'pi' ? `mailto:${member.links.web}` : member.links.web} className="hover:text-cauBlue transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                          </a>
                        )}
                        {member.links.github && (
                          <a href={member.links.github} className="hover:text-cauBlue transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                          </a>
                        )}
                        {member.links.scholar && (
                          <a href={member.links.scholar} className="hover:text-cauBlue transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Alumni Section */}
        {alumni.length > 0 && (
          <div className="pt-20 border-t border-cauLightGray">
             <div className="flex items-center gap-6 mb-16">
                <h2 className="text-sm font-bold text-cauGray/40 uppercase tracking-[0.4em] whitespace-nowrap">
                  Alumni & Legacy
                </h2>
                <div className="h-px bg-cauLightGray/50 w-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {alumni.map((member) => (
                  <div key={member.id} className="flex gap-6 items-center p-6 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-cauLightGray transition-all group border border-transparent hover:border-cauLightGray">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-20 h-20 rounded-full object-cover transition-all"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900">{member.name}</h4>
                      <p className="text-xs text-cauBlue font-medium mb-1">{member.role} Alumni</p>
                      <p className="text-[10px] text-cauGray font-bold uppercase tracking-widest">{member.destination}</p>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default People;
