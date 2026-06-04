import React, { useState } from 'react';
import { MEMBERS } from '../constants';
import { Mail, Globe, Github, BookOpen, X, ExternalLink, Copy, Check, FileText, Award, Quote } from 'lucide-react';
import { Member } from '../types';
import SEO from '../components/SEO';
import publicationsData from '../data/publications.json';

const loadedPublications: Record<string, any[]> = publicationsData as Record<string, any[]>;

// --- [추가된 BibTeX 파싱 함수] ---
const parseBibtex = (bib: string) => {
  const info: Record<string, string> = { year: 'N/A', author: 'N/A', venue: 'N/A' };
  if (!bib || !bib.includes('{')) return info;
  const fields =["journal", "booktitle", "volume", "number", "pages", "publisher", "doi", "author", "year"];
  fields.forEach(field => {
    const regex = new RegExp(`${field}\\s*=\\s*[\\{"]([\\s\\S]*?)[\\}"]`, "i");
    const match = bib.match(regex);
    if (match) {
      let value = match[1].trim().replace(/\n/g, " ");
      if (field === "year") info.year = value;
      else if (field === "author") info.author = value.replace(/ and /g, ", ");
      else if (field === "journal" || field === "booktitle") info.venue = value;
      else info[field] = value;
    }
  });
  return info;
};

// ----------------------------------------------------------------------
// [컴포넌트] 논문 아이템 (개별 카드)
// ----------------------------------------------------------------------
const PublicationItem = ({ pub }: { pub: any }) => {
  const[copied, setCopied] = useState(false);
  const [showBib, setShowBib] = useState(false);
  
  // JSON에 직접 연도/저자가 없으므로 BibTeX에서 파싱해서 사용
  const bibInfo = parseBibtex(pub.bibtex || "");
  const displayYear = pub.is_progress ? pub.year : bibInfo.year;
  const displayAuthor = pub.is_progress ? pub.author : bibInfo.author;
  const displayVenue = pub.is_progress ? pub.journal : bibInfo.venue;

  const handleCopyBibtex = () => {
    if (pub.bibtex) {
      navigator.clipboard.writeText(pub.bibtex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`bg-white p-5 rounded-xl border transition-all group ${pub.is_progress ? 'border-blue-200 bg-blue-50/10' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start gap-4">
          <h4 className="font-bold text-lg text-gray-800 leading-snug group-hover:text-blue-700 transition-colors">
            {pub.title || "Untitled Paper"}
          </h4>
          <div className="flex gap-2 flex-shrink-0">
            {pub.url && (
              <a href={pub.url} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Paper">
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 font-medium">
          {displayAuthor !== 'N/A' ? displayAuthor : "Authors not available"}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
            {pub.is_progress ? 'Working' : displayYear}
          </span>
          {typeof pub.citations === 'number' && (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100">
              <Quote className="w-3 h-3" /> Cited {pub.citations}
            </span>
          )}
          {pub.jcr && (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-violet-50 text-violet-700 px-2 py-1 rounded border border-violet-100">
              <Award className="w-3 h-3" /> {pub.jcr}
            </span>
          )}
          <span className="text-xs text-gray-600 font-serif italic px-1">
            {displayVenue !== 'N/A' ? displayVenue : "Publication details unavailable"}
            {pub.status && <span className="ml-2 font-sans not-italic font-bold text-blue-600">[{pub.status}]</span>}
          </span>
        </div>

        {!pub.is_progress && pub.bibtex && (
          <div className="mt-3 pt-3 border-t border-gray-50 flex flex-col gap-2">
            <div className="flex gap-2">
              <button onClick={() => setShowBib(!showBib)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-gray-100">
                <FileText className="w-3.5 h-3.5" /> {showBib ? "Hide BibTeX" : "Show BibTeX"}
              </button>
              <button onClick={handleCopyBibtex} className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded transition-colors ${copied ? "text-green-600 bg-green-50" : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"}`}>
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy BibTeX"}
              </button>
            </div>
            
            {showBib && (
              <pre className="text-[10px] text-gray-600 bg-gray-50 p-3 rounded-lg overflow-x-auto font-mono border border-gray-200 mt-1 whitespace-pre-wrap break-all">
                {pub.bibtex}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
//[컴포넌트] 논문 목록 모달
// ----------------------------------------------------------------------
const PublicationsModal = ({ isOpen, onClose, member, publications }: { isOpen: boolean; onClose: () => void; member: Member | null; publications: any[] }) => {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in-up z-10">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
          <div>
            <h3 className="text-xl font-bold text-blue-900 font-playfair">Selected Publications</h3>
            <p className="text-sm text-gray-500">by {member.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 space-y-4 bg-gray-50/50">
          {publications && publications.length > 0 ? (
            publications.map((pub, idx) => (
              <PublicationItem key={idx} pub={pub} />
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No publications found for this profile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// [메인] People 페이지
// ----------------------------------------------------------------------
const People = () => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const[isModalOpen, setIsModalOpen] = useState(false);
  const[modalPubs, setModalPubs] = useState<any[]>([]);

  const getMembersByRole = (role: string) => MEMBERS.filter(m => m.role === role && !m.isAlumni);
  const getAlumni = () => MEMBERS.filter(m => m.isAlumni);

  const handleOpenPublications = (member: Member) => {
    const pubs = loadedPublications[member.name];
    setSelectedMember(member);
    setModalPubs(pubs || []);
    setIsModalOpen(true);
  };

  const sections =[
    { title: "Principal Investigator", members: getMembersByRole("Principal Investigator") },
    { title: "Co-Principal Investigator", members: getMembersByRole("Co-Principal Investigator") },
    { title: "Post-Doctoral Researchers", members: getMembersByRole("PostDoc") },
    { title: "Ph.D. Students", members: getMembersByRole("Ph.D. Student") },
    { title: "Master Students", members: getMembersByRole("Master Student") },
    { title: "Undergraduate Interns", members: getMembersByRole("Undergraduate Intern") },
  ];

  const MemberCard = ({ member, isPI = false }: { member: Member; isPI?: boolean }) => {
    const tags = member.specialization ? member.specialization.split('#').filter(tag => tag.trim() !== '') :[];

    if (isPI) {
      return (
        <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 w-full max-w-5xl flex flex-col md:flex-row">
          <div className="w-full md:w-56 lg:w-64 flex-shrink-0 overflow-hidden bg-gray-100 relative min-h-[250px] md:min-h-0">
            {member.image ? (
              <img src={member.image} alt={member.name} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 text-xs">No Image</div>
            )}
          </div>
          <div className="p-6 md:p-8 flex flex-col justify-center flex-grow text-center md:text-left">
            <div className="mb-4">
              <span className="text-blue-600 font-bold text-xs uppercase tracking-widest inline-block mb-1">{member.role}</span>
              <h3 className="font-playfair text-2xl md:text-3xl font-bold text-blue-900 mb-2">{member.name}</h3>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-5">
              {tags.map((tag, idx) => (
                <span key={idx} className="text-[11px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-100 font-semibold">#{tag.trim()}</span>
              ))}
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-auto items-center">
              <button onClick={() => handleOpenPublications(member)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md z-10 relative">
                <BookOpen className="w-4 h-4" /> <span>Publications</span>
              </button>
              <div className="w-px h-6 bg-gray-200 mx-2 hidden md:block"></div>
              {member.email && <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-900 transition-colors"><div className="p-1.5 rounded-full bg-gray-50"><Mail className="w-3.5 h-3.5 text-gray-600" /></div><span className="hidden sm:inline font-medium">Email</span></a>}
              {member.website && <a href={member.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-900 transition-colors"><div className="p-1.5 rounded-full bg-gray-50"><Globe className="w-3.5 h-3.5 text-gray-600" /></div><span className="hidden sm:inline font-medium">Website</span></a>}
              {member.github && <a href={member.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-900 transition-colors"><div className="p-1.5 rounded-full bg-gray-50"><Github className="w-3.5 h-3.5 text-gray-600" /></div><span className="hidden sm:inline font-medium">GitHub</span></a>}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 w-64 flex flex-col h-full">
        <div className="aspect-square overflow-hidden bg-gray-100 relative">
          {member.image ? <img src={member.image} alt={member.name} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 text-xs">No Image</div>}
        </div>
        <div className="p-5 text-center flex flex-col flex-grow">
          <h3 className="font-playfair text-xl font-bold text-blue-900 mb-2">{member.name}</h3>
          <div className="flex flex-wrap justify-center gap-1.5 mb-4 min-h-[1.5rem] content-start">
            {tags.map((tag, idx) => <span key={idx} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 font-medium">{tag.trim()}</span>)}
          </div>
          <div className="mt-auto space-y-2 pt-3 border-t border-gray-50 w-full">
            {member.email && <a href={`mailto:${member.email}`} className="flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-blue-900 py-0.5"><Mail className="w-3.5 h-3.5" /><span className="truncate">{member.email}</span></a>}
            {member.website && <a href={member.website} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-blue-900 py-0.5"><Globe className="w-3.5 h-3.5" /><span>Personal Website</span></a>}
            {member.github && <a href={member.github} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-blue-900 py-0.5"><Github className="w-3.5 h-3.5" /><span>GitHub Profile</span></a>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO title="People" description="Meet the researchers at SVIL." />
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
                <h2 className="font-playfair text-2xl font-bold text-blue-900 uppercase tracking-wider text-center px-4">{section.title}</h2>
                <div className="h-px bg-gray-200 flex-grow"></div>
              </div>
              <div className="flex flex-wrap justify-center gap-8 w-full">
                {section.members.map((member) => <MemberCard key={member.id} member={member} isPI={section.title.toLowerCase().includes("principal investigator")} />)}
              </div>
            </div>
          )
        ))}
      </div>
      <PublicationsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} member={selectedMember} publications={modalPubs} />
    </div>
  );
};

export default People;
