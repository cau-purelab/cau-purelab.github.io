import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { FundedProject } from '../types';
import { elapsedRatio, monthOf } from '../data/projects';

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

/** 'Year 3 of 8' — 빌드 날짜 기준. 사람이 읽는 진행 정도이지 사업 연차(공식 차수)가 아니다 */
function yearLabel(project: FundedProject): string {
  const start = Date.parse(project.start.replace(/\./g, '-'));
  const end = Date.parse(project.end.replace(/\./g, '-'));
  const total = Math.max(1, Math.ceil((end - start) / MS_PER_YEAR));
  const current = Math.min(total, Math.floor((Date.parse(__BUILD_DATE__) - start) / MS_PER_YEAR) + 1);
  return `Year ${current} of ${total}`;
}

interface ProjectCardProps {
  project: FundedProject;
  /** compact: 홈 하이라이트용 — 배지, 제목, 기간만 */
  variant?: 'full' | 'compact';
  /** compact 전용: 어두운 패널 위에 놓일 때 'dark' */
  tone?: 'light' | 'dark';
}

export default function ProjectCard({ project, variant = 'full', tone = 'light' }: ProjectCardProps) {
  const isDark = tone === 'dark';
  const ratio = elapsedRatio(project);
  const period = `${monthOf(project.start)} – ${monthOf(project.end)}`;

  const programChip = (
    <span
      className={`inline-block text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
        isDark ? 'text-blue-100 bg-white/10 border-white/10' : 'text-blue-900 bg-blue-50 border-blue-100'
      }`}
    >
      {project.program}
    </span>
  );

  if (variant === 'compact') {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          {programChip}
          <span className={`text-xs tabular-nums ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{period}</span>
        </div>
        <p className={`text-sm font-medium leading-snug ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{project.title}</p>
      </div>
    );
  }

  return (
    <article className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-7 flex flex-col gap-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {programChip}
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          Ongoing
        </span>
      </div>

      <div>
        <h3 className="font-playfair text-xl font-bold text-slate-900 leading-snug">{project.title}</h3>
        {project.titleKo && <p lang="ko" className="text-sm text-slate-500 mt-1">{project.titleKo}</p>}
      </div>

      {/* 수행기간 진행 막대 — 빌드 날짜 기준이라 빌드마다 갱신된다 */}
      <div>
        <div className="flex justify-between text-xs text-slate-600 mb-1.5 tabular-nums">
          <span>{period}</span>
          <span className="font-semibold">{yearLabel(project)}</span>
        </div>
        <div
          className="h-1.5 rounded-full bg-slate-100 overflow-hidden"
          role="img"
          aria-label={`${Math.round(ratio * 100)}% of the project period elapsed`}
        >
          <div className="h-full rounded-full bg-blue-800" style={{ width: `${(ratio * 100).toFixed(1)}%` }} />
        </div>
      </div>

      <dl className="text-sm text-slate-600 space-y-1.5">
        <div>
          <dt className="inline text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">Funding</dt>
          <dd className="inline">{project.funders.join(' · ')}</dd>
        </div>
        {project.partners && (
          <div>
            <dt className="sr-only">Partners</dt>
            <dd className="text-xs text-slate-500 leading-relaxed">{project.partners}</dd>
          </div>
        )}
      </dl>

      {/* 이 과제를 사사한 논문 — Scholar 아카이브의 펀딩 필터로 바로 연다(태그별 링크).
          show=all: 아카이브 기본 범위는 '게재'라, 투고 중 논문에만 붙은 태그(ITRC-26 4편 전부 투고 중)는 빈 목록이 된다 */}
      {project.fundingTags && project.fundingTags.length > 0 && (
        <div className="mt-auto pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500">Acknowledged in publications:</span>
          {project.fundingTags.map(tag => (
            <Link
              key={tag}
              to={`/scholar?fund=${encodeURIComponent(tag)}&show=all`}
              className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 underline underline-offset-4"
            >
              {tag}
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
