/**
 * Google Analytics 4 (gtag.js).
 *
 * - 정식 도메인(LAB_URL의 호스트)에서만 켠다. 개발 서버·로컬 미리보기 접속은 집계하지 않는다.
 * - 자동 page_view는 끈다(send_page_view: false). SPA라 GA의 "브라우저 기록 이벤트" 감지는 주소가 바뀌는
 *   순간 기록해서, 탭 제목이 아직 이전 페이지 것으로 찍힌다. 대신 App의 PageViewTracker가 경로가 바뀔 때
 *   seo-routes.json의 제목으로 직접 보낸다. ⚠ 그래서 GA 관리 화면에서 향상된 측정의
 *   "브라우저 기록 이벤트 기반 페이지 변경"을 꺼 둬야 한다 — 켜면 이중 집계된다.
 * - 빌드 시 프리렌더(entry-server.tsx)에서는 initAnalytics를 부르지 않고 effect도 돌지 않는다.
 */
import { GA_MEASUREMENT_ID, LAB_URL } from '../constants';

type GtagArgs = [command: string, ...params: unknown[]];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: GtagArgs) => void;
  }
}

const PRODUCTION_HOST = new URL(LAB_URL).hostname;

function isProductionHost(): boolean {
  return typeof window !== 'undefined' && window.location.hostname === PRODUCTION_HOST;
}

/** gtag.js를 불러오고 설정한다. 정식 도메인이 아니면 아무것도 하지 않는다. */
export function initAnalytics(): void {
  if (!isProductionHost() || window.gtag) return;

  window.dataLayer = window.dataLayer || [];
  // gtag.js는 arguments 객체 자체를 dataLayer에서 읽는다 — 배열로 바꿔 넣으면 무시된다
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);
}

/** 페이지 조회 1건을 보낸다. GA가 꺼져 있으면(정식 도메인 아님) 무시한다. */
export function trackPageView(title: string): void {
  if (!window.gtag) return;
  const { origin, pathname, search } = window.location;
  window.gtag('event', 'page_view', {
    page_title: title,
    page_location: `${origin}${pathname}${search}`,
  });
}
