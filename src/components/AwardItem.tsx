import React from 'react';
import { Award as AwardIcon, Calendar } from 'lucide-react';
import { MEMBERS } from '../constants';
import type { Award, AwardTier } from '../types';

// 등급별 색 — 의미 있는 색만 쓴다(최우수=금, 우수논문=연구실 파랑, 우수=남색, 장려=회색).
const TIER_STYLE: Record<AwardTier, { pill: string; icon: string }> = {
  grand: { pill: 'bg-amber-50 text-amber-900 border-amber-200', icon: 'text-amber-500' },
  'best-paper': { pill: 'bg-blue-50 text-blue-900 border-blue-200', icon: 'text-blue-600' },
  excellence: { pill: 'bg-indigo-50 text-indigo-900 border-indigo-200', icon: 'text-indigo-500' },
  encouragement: { pill: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'text-slate-400' },
};

const PEOPLE_LABEL: Record<Award['peopleKind'], string> = {
  authors: 'Authors',
  team: 'Team',
  recipient: 'Recipient',
};

const LAB_MEMBER_NAMES = new Set(MEMBERS.map(m => m.name));

/** 연구실 멤버 이름만 굵게 — 외부 공동 저자·팀원과 구분한다 */
function PeopleList({ people }: { people: string[] }) {
  return (
    <>
      {people.map((name, i) => (
        <React.Fragment key={name}>
          {i > 0 && ', '}
          {LAB_MEMBER_NAMES.has(name) ? <strong className="font-semibold text-slate-900">{name}</strong> : name}
        </React.Fragment>
      ))}
    </>
  );
}

function AwardBadge({ award }: { award: Award }) {
  const style = TIER_STYLE[award.tier];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-bold ${style.pill}`}>
      <AwardIcon className={`h-3.5 w-3.5 ${style.icon}`} aria-hidden="true" />
      {award.award}
    </span>
  );
}

interface AwardItemProps {
  award: Award;
  /** compact: 홈 하이라이트용 요약형. 제목·소속 기관을 생략한다 */
  variant?: 'full' | 'compact';
}

export default function AwardItem({ award, variant = 'full' }: AwardItemProps) {
  if (variant === 'compact') {
    return (
      <div className="flex gap-4 items-start">
        <span className="text-xs font-bold text-blue-700 tabular-nums pt-1 w-14 shrink-0">{award.date}</span>
        <div className="min-w-0 space-y-1.5">
          <AwardBadge award={award} />
          <p className="text-sm font-medium text-slate-800 leading-snug">{award.event}</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            <PeopleList people={award.people} />
          </p>
        </div>
      </div>
    );
  }

  const { work } = award;
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex items-center md:items-start text-blue-700 font-bold min-w-[140px] text-sm shrink-0 md:pt-1">
        <Calendar className="h-4 w-4 mr-2 md:mt-0.5" aria-hidden="true" />
        <span className="tabular-nums">{award.date}</span>
      </div>
      <div className="flex-grow min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <AwardBadge award={award} />
          {award.awardKo && <span className="text-xs text-slate-500">{award.awardKo}</span>}
        </div>
        <h3 className="text-slate-900 font-semibold text-lg leading-snug">{award.event}</h3>
        <p className="text-xs text-slate-500">{award.organizer}</p>
        {work && (work.title || work.titleKo) && (
          <p className="text-sm text-slate-700 leading-relaxed border-l-2 border-slate-200 pl-3">
            {work.title && <span className="block font-medium">{work.title}</span>}
            {/* 국문 원제. 공식 영문 제목이 없는 작품은 원제만 보인다 */}
            {work.titleKo && (
              <span lang="ko" className={`block ${work.title ? 'text-slate-500 text-xs mt-0.5' : 'font-medium'}`}>
                {work.titleKo}
              </span>
            )}
          </p>
        )}
        <p className="text-sm text-slate-600">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">{PEOPLE_LABEL[award.peopleKind]}</span>
          <PeopleList people={award.people} />
        </p>
      </div>
    </div>
  );
}
