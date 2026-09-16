import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MEMBERS, PI_NAME_VARIANTS, METRICS_DISCLAIMER, scholarProfileUrl } from '../constants';
import { Mail, Globe, Github, Linkedin, BookOpen, X, ExternalLink, Copy, Check, FileText, Award, Quote, AlertTriangle } from 'lucide-react';
import { Member } from '../types';
import SEO from '../components/SEO';
import publicationsData from '../data/publications.json';
// BibTeX 파싱은 Scholar 페이지와 같은 모듈을 쓴다(예전에는 두 페이지에 각각 복사돼 있었다).
import { parseBibtex, splitAuthors, isPiName } from '../lib/bibtex';
import type { BibInfo } from '../lib/bibtex';
import { copyText } from '../lib/clipboard';

interface MemberPub {
  title: string;
  url?: string;
  bibtex?: string;
  author?: string;
  journal?: string;
  year?: string;
  citations?: number;
  jcr?: string;
  jcr_source?: string;
  status?: string;
  is_progress?: boolean;
  retracted?: boolean;
}

interface DecoratedPub {
  pub: MemberPub;
  bib: BibInfo;
  sortYear: string;
}

const loadedPublications = publicationsData as Record<string, MemberPub[]>;

// 모달에는 최신 논문만 보여주고 전체 목록은 아카이브 페이지로 넘긴다.
// (예전에는 470건을 한 번에 렌더해 키보드 사용자가 1,400개 가까운 탭 스톱을 지나야 했다.)
const MODAL_PUB_LIMIT = 20;
// 철회 논문 제목의 접두 표기. 배지로 따로 보여주므로 제목에서는 덜어낸다.
const RETRACTED_PREFIX_RE = /^(\[retracted\]|retracted article:|retracted:)\s*/i;

const renderAuthors = (raw: string, isBibtexFormat: boolean) => {
  const { names, etAl } = splitAuthors(raw, isBibtexFormat);
  if (names.length === 0) return "Authors not available";
  return (
    <>
      {names.map((name, i) => (
        <span key={`${name}-${i}`} className={isPiName(name, PI_NAME_VARIANTS) ? "font-bold text-blue-700" : ""}>
          {name}{i < names.length - 1 ? ", " : ""}
        </span>
      ))}
      {/* BibTeX의 'and others'는 사람 이름이 아니다 — et al.로 표기한다 */}
      {etAl && <span className="italic text-gray-500">, et al.</span>}
    </>
  );
};

// ----------------------------------------------------------------------
// [컴포넌트] 논문 아이템 (개별 카드)
// ----------------------------------------------------------------------
const PublicationItem = ({ pub, bib }: DecoratedPub) => {
  // null = 아직 누르지 않음, true = 복사 성공, false = 복사 실패(비보안 오리진 등)
  const [copied, setCopied] = useState<boolean | null>(null);
  const [showBib, setShowBib] = useState(false);

  // JSON에 직접 연도/저자가 없으므로 BibTeX에서 파싱해서 사용
  const displayYear = pub.is_progress ? pub.year : bib.year;
  const displayVenue = pub.is_progress ? pub.journal : bib.venue;
  const displayTitle = (pub.title || "Untitled Paper").replace(RETRACTED_PREFIX_RE, '');

  const handleCopyBibtex = async () => {
    const ok = await copyText(pub.bibtex || "");
    setCopied(ok);
    setTimeout(() => setCopied(null), ok ? 2000 : 4000);
  };

  return (
    <div className={`bg-white p-5 rounded-xl border transition-all group ${pub.is_progress ? 'border-blue-200 bg-blue-50/10' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start gap-4">
          <h4 className="font-bold text-lg text-gray-800 leading-snug group-hover:text-blue-700 transition-colors">
            {displayTitle}
          </h4>
          <div className="flex gap-2 flex-shrink-0">
            {pub.url && (
              <a href={pub.url} target="_blank" rel="noreferrer" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Paper">
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 font-medium">
          {renderAuthors(pub.is_progress ? (pub.author || "") : bib.author, !pub.is_progress)}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
            {pub.is_progress ? 'Working' : (displayYear || 'Year unknown')}
          </span>
          {/* 철회 논문임을 눈에 띄게 알린다 */}
          {pub.retracted && (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-600 text-white px-2 py-1 rounded uppercase">
              <AlertTriangle className="w-3 h-3" /> Retracted
            </span>
          )}
          {typeof pub.citations === 'number' && (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100">
              <Quote className="w-3 h-3" /> Cited {pub.citations}
            </span>
          )}
          {/* 미게재 논문의 라벨은 '투고 대상 저널'의 등급이지 게재 성과가 아니다 */}
          {pub.jcr && (
            pub.jcr_source ? (
              <a href={pub.jcr_source} target="_blank" rel="noreferrer" title="JCR label transcribed from the lab's public page"
                className="inline-flex items-center gap-1 text-xs font-bold bg-violet-50 text-violet-700 px-2 py-1 rounded border border-violet-100 hover:bg-violet-100">
                <Award className="w-3 h-3" /> {pub.is_progress ? `Target: ${pub.jcr}` : pub.jcr}
              </a>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold bg-violet-50 text-violet-700 px-2 py-1 rounded border border-violet-100">
                <Award className="w-3 h-3" /> {pub.is_progress ? `Target: ${pub.jcr}` : pub.jcr}
              </span>
            )
          )}
          <span className="text-xs text-gray-600 font-serif italic px-1">
            {displayVenue || "Publication details unavailable"}
            {pub.status && <span className="ml-2 font-sans not-italic font-bold text-blue-600">[{pub.status}]</span>}
          </span>
        </div>

        {!pub.is_progress && pub.bibtex && (
          <div className="mt-3 pt-3 border-t border-gray-50 flex flex-col gap-2">
            <div className="flex gap-2">
              <button onClick={() => setShowBib(!showBib)} aria-expanded={showBib} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-gray-100">
                <FileText className="w-3.5 h-3.5" /> {showBib ? "Hide BibTeX" : "Show BibTeX"}
              </button>
              <button onClick={handleCopyBibtex} className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded transition-colors ${
                copied === true ? "text-green-700 bg-green-50" : copied === false ? "text-red-700 bg-red-50" : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
              }`}>
                {copied === true ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === true ? "Copied!" : copied === false ? "Copy failed — use Show BibTeX" : "Copy BibTeX"}
              </button>
            </div>

            {showBib && (
              <pre className="text-[11px] text-gray-700 bg-gray-50 p-3 rounded-lg overflow-x-auto font-mono border border-gray-200 mt-1 whitespace-pre-wrap break-all select-all">
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
const PublicationsModal = ({ isOpen, onClose, member, publications }: { isOpen: boolean; onClose: () => void; member: Member | null; publications: MemberPub[] }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // 네이티브 <dialog>의 showModal()이 포커스 트랩·Escape·배경 inert·닫을 때 초점 복귀를
  // 모두 브라우저에 맡긴다(예전 div 모달에는 Escape 리스너 하나뿐이었다).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  // 모달이 열려 있는 동안 배경 페이지 스크롤을 잠근다.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  // 연도 내림차순(진행 중 논문 먼저)으로 정렬해 최신 논문이 위로 오게 한다.
  const sortedPublications = useMemo<DecoratedPub[]>(() => {
    const decorated = (publications || []).map((pub) => {
      const bib = parseBibtex(pub.bibtex || "");
      const rawYear = pub.is_progress ? (pub.year || "") : bib.year;
      return { pub, bib, sortYear: /^\d{4}$/.test(rawYear) ? rawYear : '0000' };
    });
    return decorated.sort((a, b) => {
      if (a.pub.is_progress && !b.pub.is_progress) return -1;
      if (!a.pub.is_progress && b.pub.is_progress) return 1;
      if (a.sortYear !== b.sortYear) return b.sortYear.localeCompare(a.sortYear);
      return a.pub.title.localeCompare(b.pub.title);
    });
  }, [publications]);

  const visiblePublications = sortedPublications.slice(0, MODAL_PUB_LIMIT);
  const profileUrl = member ? scholarProfileUrl(member.name) : null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // 배경(::backdrop) 클릭 시 닫기 — 내용 영역 클릭은 자식이 받는다.
      onClick={(e) => { if (e.target === dialogRef.current) onClose(); }}
      aria-label={member ? `Publications by ${member.name}` : 'Publications'}
      className="w-full max-w-3xl max-h-[85vh] bg-transparent backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      {member && (
        <div className="bg-white rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in-up">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
            <div>
              <h3 className="text-xl font-bold text-blue-900 font-playfair">Google Scholar Publications</h3>
              <p className="text-sm text-gray-600">
                by {member.name}
                {sortedPublications.length > MODAL_PUB_LIMIT && ` · showing the ${MODAL_PUB_LIMIT} most recent of ${sortedPublications.length}`}
              </p>
            </div>
            <button onClick={onClose} aria-label="Close publications dialog" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="overflow-y-auto p-6 space-y-4 bg-gray-50/50 custom-scrollbar">
            {visiblePublications.length > 0 ? (
              <>
                {visiblePublications.map(({ pub, bib, sortYear }) => (
                  <PublicationItem key={pub.url || pub.title} pub={pub} bib={bib} sortYear={sortYear} />
                ))}
                <div className="pt-2 text-center">
                  <Link
                    to={`/scholar?tab=${encodeURIComponent(member.name)}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" /> View all {sortedPublications.length} publications
                  </Link>
                </div>
                <p className="pt-2 text-[11px] leading-relaxed text-gray-600">
                  {METRICS_DISCLAIMER}
                  {profileUrl && (
                    <>
                      {' '}
                      <a href={profileUrl} target="_blank" rel="noreferrer" className="font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900">
                        Open the Google Scholar profile
                      </a>
                      {' '}for the authoritative list.
                    </>
                  )}
                </p>
              </>
            ) : (
              <div className="text-center py-12 text-gray-600">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No publications found for this profile.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
};

// ----------------------------------------------------------------------
// [컴포넌트] 구성원 카드
// ----------------------------------------------------------------------
// MemberCard와 섹션 정의는 모듈 스코프에 둔다. People 본문 안에 있으면 모달을 여닫을 때마다
// 컴포넌트 정체가 바뀌어 카드 6개가 전부 언마운트/재마운트된다.
const getMembersByRole = (role: string) => MEMBERS.filter(m => m.role === role && !m.isAlumni);

const SECTIONS = [
  { title: "Principal Investigator", members: getMembersByRole("Principal Investigator") },
  { title: "Co-Principal Investigator", members: getMembersByRole("Co-Principal Investigator") },
  { title: "Post-Doctoral Researchers", members: getMembersByRole("PostDoc") },
  { title: "Ph.D. Students", members: getMembersByRole("Ph.D. Student") },
  { title: "Master Students", members: getMembersByRole("Master Student") },
  { title: "Undergraduate Interns", members: getMembersByRole("Undergraduate Intern") },
];

const MemberCard = ({ member, isPI = false, onOpenPublications }: { member: Member; isPI?: boolean; onOpenPublications: (member: Member) => void }) => {
    const tags = member.specialization ? member.specialization.split('#').filter(tag => tag.trim() !== '') :[];

    if (isPI) {
      return (
        <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 w-full max-w-5xl flex flex-col md:flex-row">
          <div className="w-full md:w-56 lg:w-64 flex-shrink-0 overflow-hidden bg-gray-100 relative min-h-[250px] md:min-h-0">
            {member.image ? (
              <img src={member.image} alt={member.name} loading="lazy" className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
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
              <button onClick={() => onOpenPublications(member)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md z-10 relative">
                <BookOpen className="w-4 h-4" /> <span>Publications</span>
              </button>
              <div className="w-px h-6 bg-gray-200 mx-2 hidden md:block"></div>
              {member.email && <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-900 transition-colors"><div className="p-1.5 rounded-full bg-gray-50"><Mail className="w-3.5 h-3.5 text-gray-600" /></div><span className="hidden sm:inline font-medium">Email</span></a>}
              {member.website && <a href={member.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-900 transition-colors"><div className="p-1.5 rounded-full bg-gray-50"><Globe className="w-3.5 h-3.5 text-gray-600" /></div><span className="hidden sm:inline font-medium">Website</span></a>}
              {member.github && <a href={member.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-900 transition-colors"><div className="p-1.5 rounded-full bg-gray-50"><Github className="w-3.5 h-3.5 text-gray-600" /></div><span className="hidden sm:inline font-medium">GitHub</span></a>}
              {member.linkedin && <a href={member.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-900 transition-colors"><div className="p-1.5 rounded-full bg-gray-50"><Linkedin className="w-3.5 h-3.5 text-gray-600" /></div><span className="hidden sm:inline font-medium">LinkedIn</span></a>}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 w-64 flex flex-col h-full">
        <div className="aspect-square overflow-hidden bg-gray-100 relative">
          {member.image ? <img src={member.image} alt={member.name} loading="lazy" className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 text-xs">No Image</div>}
        </div>
        <div className="p-5 text-center flex flex-col flex-grow">
          <h3 className="font-playfair text-xl font-bold text-blue-900 mb-2">{member.name}</h3>
          {/* 태그·연락처가 없는 구성원은 빈 블록을 만들지 않는다(반쯤 빈 카드 방지) */}
          {tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mb-4 content-start">
              {tags.map((tag, idx) => <span key={idx} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 font-medium">{tag.trim()}</span>)}
            </div>
          )}
          {(member.email || member.website || member.github || member.linkedin) && (
            <div className="mt-auto space-y-2 pt-3 border-t border-gray-50 w-full">
              {member.email && <a href={`mailto:${member.email}`} className="flex items-center justify-center gap-2 text-xs text-gray-600 hover:text-blue-900 py-0.5"><Mail className="w-3.5 h-3.5" /><span className="truncate">{member.email}</span></a>}
              {member.website && <a href={member.website} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-xs text-gray-600 hover:text-blue-900 py-0.5"><Globe className="w-3.5 h-3.5" /><span>Personal Website</span></a>}
              {member.github && <a href={member.github} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-xs text-gray-600 hover:text-blue-900 py-0.5"><Github className="w-3.5 h-3.5" /><span>GitHub Profile</span></a>}
              {member.linkedin && <a href={member.linkedin} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-xs text-gray-600 hover:text-blue-900 py-0.5"><Linkedin className="w-3.5 h-3.5" /><span>LinkedIn</span></a>}
            </div>
          )}
        </div>
      </div>
    );
};

// ----------------------------------------------------------------------
// [메인] People 페이지
// ----------------------------------------------------------------------
const People = () => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPubs, setModalPubs] = useState<MemberPub[]>([]);

  const handleOpenPublications = (member: Member) => {
    const pubs = loadedPublications[member.name];
    setSelectedMember(member);
    setModalPubs(pubs || []);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO title="People" description="Meet the researchers at PURE." />
      <div className="text-center mb-20">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold text-blue-900 mb-6">Our Team</h1>
        <p className="text-lg text-gray-600 font-light">Meet the researchers behind our innovations</p>
      </div>
      <div className="space-y-24">
        {SECTIONS.map((section) => (
          section.members.length > 0 && (
            <div key={section.title} className="flex flex-col items-center animate-fade-in-up">
              <div className="flex items-center gap-6 mb-12 w-full max-w-4xl">
                <div className="h-px bg-gray-200 flex-grow"></div>
                <h2 className="font-playfair text-2xl font-bold text-blue-900 uppercase tracking-wider text-center px-4">{section.title}</h2>
                <div className="h-px bg-gray-200 flex-grow"></div>
              </div>
              <div className="flex flex-wrap justify-center gap-8 w-full">
                {section.members.map((member) => <MemberCard key={member.id} member={member} isPI={section.title.toLowerCase().includes("principal investigator")} onOpenPublications={handleOpenPublications} />)}
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
