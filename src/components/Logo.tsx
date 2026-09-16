import React from 'react';

/**
 * 브랜드 마크와 락업.
 *
 * 이전에는 내비가 1800×440 3줄 PNG(`logo-full.png`)를 40px 높이로 줄여 써서
 * 부제 두 줄이 3~4px 회색 번짐이 됐고, 푸터는 아예 다른 원형 마크(`favicon.png`)를
 * 썼다. 같은 페이지 안에 서로 다른 락업이 둘 있었던 셈이다.
 *
 * 인라인 SVG로 두면 두 자리가 같은 마크를 쓰고, 페이지 폰트(Inter)를 그대로 상속하며,
 * 어느 크기에서도 선명하다. 부제는 이미지가 아니라 텍스트라 크기를 따로 제어할 수 있다.
 */

let gradientSeq = 0;

export const LogoMark: React.FC<{ size?: number; className?: string }> = ({ size = 40, className }) => {
  // 한 페이지에 마크가 여러 번 놓여도 그라데이션 id가 충돌하지 않게 한다
  const id = React.useMemo(() => `pure-mark-${++gradientSeq}`, []);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-label="PURE Lab"
      focusable="false"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1E3A8A" />
          <stop offset="0.58" stopColor="#3730A3" />
          <stop offset="1" stopColor="#5B21B6" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="9.4" fill={`url(#${id})`} />
      <text
        x="20"
        y="22.6"
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        letterSpacing="0.48"
        fill="#FFFFFF"
      >
        PURE
      </text>
      <rect x="12.2" y="25.8" width="15.6" height="1.8" rx="0.9" fill="#60A5FA" />
      <text
        x="20"
        y="32.6"
        textAnchor="middle"
        fontSize="5"
        fontWeight="700"
        letterSpacing="1.4"
        fill="#FFFFFF"
        opacity="0.9"
      >
        LAB
      </text>
    </svg>
  );
};

/**
 * 내비게이션용 가로 락업. 정식 명칭 전체 대신 대학명을 두 번째 줄에 둔다 —
 * 40px 높이에서 "Privacy, Unlearning, and Robust Engineering Lab"은 읽을 수 없는
 * 크기가 되고, 그 이름은 페이지 제목과 푸터가 이미 전달한다.
 */
export const LogoLockup: React.FC<{ className?: string }> = ({ className }) => (
  <span className={`flex items-center gap-2.5 ${className ?? ''}`}>
    <LogoMark size={40} />
    <span className="flex flex-col leading-none">
      <span className="text-[19px] font-extrabold tracking-tight text-blue-900">PURE</span>
      <span className="mt-[3px] text-[8.5px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        Chung-Ang University
      </span>
    </span>
  </span>
);

export default LogoMark;
