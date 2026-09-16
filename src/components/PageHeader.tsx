import React from 'react';

interface PageHeaderProps {
  /** h1 위의 작은 라벨. 제목이 아니므로 <p>로 렌더한다(문서 아웃라인을 어지럽히지 않는다). */
  eyebrow?: string;
  /** 페이지 h1. 라우트당 하나만 존재해야 한다. */
  title: string;
  /** 한 문단 분량의 설명. 강조 span 등이 필요해 ReactNode로 받는다. */
  description?: React.ReactNode;
  /** 제목 오른쪽(모바일에서는 아래)에 놓이는 1차 행동. 링크나 버튼 하나를 기대한다. */
  action?: React.ReactNode;
}

/**
 * 하위 페이지가 공유하는 제목 블록.
 *
 * 페이지마다 정렬(중앙/좌측)·크기(36/48/60px)·색(gray-900/slate-900/blue-900)·웨이트와
 * eyebrow·구분선 유무가 제각각이라 라우트를 옮길 때마다 제목이 다른 자리에 다른 모습으로
 * 나타나던 것을 한 곳으로 모은다.
 *
 * 규칙: 좌측 정렬, eyebrow는 12px·tracking-[0.25em]·blue-700, h1은 Playfair 48px(모바일 36px),
 * 구분선은 쓰거나 안 쓰거나 둘 중 하나여야 하므로 항상 렌더한다.
 *
 * Home은 히어로가 이 역할을 대신하므로 쓰지 않는다.
 */
const PageHeader = ({ eyebrow, title, description, action }: PageHeaderProps) => (
  <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="text-xs font-bold text-blue-700 uppercase tracking-[0.25em] mb-3">
          {eyebrow}
        </p>
      )}
      <h1 className="font-playfair text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
        {title}
      </h1>
      {/* 장식 규칙(rule) — 전 페이지에 있거나 전 페이지에 없거나여야 한다 */}
      <div className="w-16 h-1 bg-blue-800 mt-5" aria-hidden="true" />
      {description && (
        <p className="mt-5 text-lg text-slate-600 leading-relaxed font-light">
          {description}
        </p>
      )}
    </div>

    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export default PageHeader;
