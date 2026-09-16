import React from 'react';

/**
 * 브랜드 마크와 락업.
 *
 * ## 마크: 노치가 난 방패 (notched shield)
 *
 * 이전 마크는 둥근 사각형 안에 "PURE + 밑줄 + LAB" 세 요소를 쌓은 것이었다.
 * 40px에서 이미 비좁았고 16px에서는 밑줄과 LAB이 뭉개져 파비콘용 단순화 버전을
 * 따로 만들어야 했다 — 마크가 작은 크기를 못 견딘다는 뜻이다.
 *
 * 지금 마크에는 글자가 없다. 덩어리 셋뿐이다.
 *
 *   방패(흰색)   경계를 지킨다           → Privacy, Robustness
 *   노치(사각형) 한 조각을 도려냈다      → Unlearning
 *   코어(하늘색) 남은 것은 그대로다      → 보존된 모델
 *
 * 16px와 1200px이 **같은 도형**이다. 32px 이하에서는 깊이 표현(광택·그림자·코어
 * 그라데이션)만 끄고 실루엣은 건드리지 않는다.
 *
 * 512 그리드 기준 최소 크기 계산 (16px에서 1px = 32 units):
 *   방패 286 wide → 8.9px · 노치 86×83 → 2.7×2.6px · 코어 103 dia → 3.2px
 *
 * 워드마크는 마크에서 빼고 락업으로 옮겼다. 부제는 8.5px에서 10px로 올렸다 —
 * 40px 락업 높이에서 Inter 대문자가 힌팅을 견디는 하한이다.
 *
 * 이 파일의 도형은 `art/BRAND/gen.cjs`와 같은 좌표를 쓴다. 파비콘과 OG 이미지는
 * 그 스크립트가 만든다. 둘 중 하나만 고치면 어긋난다.
 */

/** 512 그리드 위의 마크 좌표. gen.cjs의 `G`와 동일하다. */
const SHIELD_PATH =
  'M140 108 H372 A36 36 0 0 1 408 144 V266 C408 346 344 402 256 428 C168 402 104 346 104 266 V144 A36 36 0 0 1 140 108 Z';

/** 배지 중심 기준 축소 후 광학 보정 이동. 노치가 오른쪽 위 질량을 덜어낸 만큼 되민다. */
const SHIELD_TRANSFORM = 'translate(7 -4) translate(256 256) scale(0.94) translate(-256 -256)';

/** 위 변환을 적용한 코어 위치 — 방패와 함께 움직이도록 미리 계산해 둔다. */
const CORE = { cx: 259.24, cy: 282.08, r: 51.7 };

const BADGE_RADIUS = 120;

interface LogoMarkProps {
  /** 렌더 크기(px). 32px 이하에서는 깊이 표현을 끄고 실루엣만 남긴다. */
  size?: number;
  className?: string;
}

let markSeq = 0;

export const LogoMark: React.FC<LogoMarkProps> = ({ size = 40, className }) => {
  // 한 페이지에 마크가 여러 번 놓여도 gradient/mask id가 충돌하지 않게 한다
  const id = React.useMemo(() => `pure-mark-${++markSeq}`, []);
  const ref = (name: string) => `${id}-${name}`;

  // 32px 이하에서 그림자·광택은 서브픽셀로 뭉개져 덩어리만 흐린다
  const detail = size > 32;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label="PURE Lab"
      focusable="false"
    >
      <defs>
        <linearGradient id={ref('bg')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1E3A8A" />
          <stop offset="0.58" stopColor="#3730A3" />
          <stop offset="1" stopColor="#5B21B6" />
        </linearGradient>

        <mask id={ref('cut')} maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">
          <g transform={SHIELD_TRANSFORM}>
            <path d={SHIELD_PATH} fill="#fff" />
            {/* 방패 바깥까지 넉넉히 덮어 잘린 조각이 남지 않게 한다 */}
            <rect x="316" y="70" width="170" height="126" fill="#000" />
          </g>
        </mask>

        {detail && (
          <>
            <linearGradient id={ref('sheen')} x1="0.08" y1="0" x2="0.7" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.17" />
              <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <radialGradient id={ref('core')} cx="0.34" cy="0.28" r="0.85">
              <stop offset="0" stopColor="#93C5FD" />
              <stop offset="1" stopColor="#60A5FA" />
            </radialGradient>
            <filter id={ref('cast')} x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="7" stdDeviation="8" floodColor="#0B1220" floodOpacity="0.22" />
            </filter>
          </>
        )}
      </defs>

      <rect width="512" height="512" rx={BADGE_RADIUS} fill={`url(#${ref('bg')})`} />
      {detail && <rect width="512" height="512" rx={BADGE_RADIUS} fill={`url(#${ref('sheen')})`} />}

      <g filter={detail ? `url(#${ref('cast')})` : undefined}>
        <rect width="512" height="512" fill="#FFFFFF" mask={`url(#${ref('cut')})`} />
        <circle
          cx={CORE.cx}
          cy={CORE.cy}
          r={CORE.r}
          fill={detail ? `url(#${ref('core')})` : '#60A5FA'}
        />
      </g>

      {/* 흰 배경에서 배지 가장자리가 녹지 않도록 하는 림 라이트 */}
      {detail && (
        <rect
          x="1.5"
          y="1.5"
          width="509"
          height="509"
          rx={BADGE_RADIUS - 1.5}
          fill="none"
          stroke="#fff"
          strokeOpacity="0.16"
          strokeWidth="3"
        />
      )}
    </svg>
  );
};

interface LogoLockupProps {
  /** 마크 높이(px). 락업 전체 높이가 이 값이 되고, 글자 크기도 여기에 맞춰 따라간다. */
  size?: number;
  className?: string;
}

/**
 * 내비게이션용 가로 락업: 마크 + 워드마크 + 부제 한 줄.
 *
 * 글자는 SVG가 아니라 HTML이다. 페이지의 Inter를 그대로 상속하고 브라우저 힌팅을
 * 받기 때문에 같은 크기에서 SVG 텍스트보다 선명하다. 대신 크기는 마크 높이에
 * 비례해 계산한다 — `art/BRAND/lockup.svg`의 120 그리드를 40px로 환산한 값과 같다
 * (워드마크 61/120, 부제 30/120).
 *
 * 정식 명칭 전체가 아니라 대학명을 부제로 둔다. 40px 높이에서
 * "Privacy, Unlearning, and Robust Engineering Lab"은 읽을 수 없는 크기가 되고,
 * 그 이름은 페이지 제목과 푸터가 이미 전달한다.
 */
export const LogoLockup: React.FC<LogoLockupProps> = ({ size = 40, className }) => {
  const word = size * (61 / 120);
  const sub = size * (30 / 120);
  const gap = size * (28 / 120);

  return (
    <span className={`inline-flex items-center ${className ?? ''}`} style={{ gap: `${gap}px` }}>
      <LogoMark size={size} />
      <span className="flex flex-col leading-none">
        <span
          className="font-extrabold text-blue-900"
          style={{ fontSize: `${word}px`, letterSpacing: '-0.023em' }}
        >
          PURE
        </span>
        <span
          className="font-semibold uppercase text-slate-500"
          style={{ fontSize: `${sub}px`, letterSpacing: '0.09em', marginTop: `${size * 0.075}px` }}
        >
          Chung-Ang University
        </span>
      </span>
    </span>
  );
};

export default LogoMark;
