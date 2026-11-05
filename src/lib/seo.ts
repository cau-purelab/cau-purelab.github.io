// 라우트별 title·description 조회. SEO 컴포넌트(Helmet)와 GA page_view가 같은 값을 쓴다.
// 원본은 src/data/seo-routes.json — scripts/site.cjs도 같은 파일로 정적 HTML·sitemap을 만든다.
import seoMeta from '../data/seo-routes.json';

export interface RouteMeta {
  title: string;
  description: string;
}

const ROUTE_META: Record<string, RouteMeta> = seoMeta.routes;
export const NOT_FOUND_META: RouteMeta = seoMeta.notFound;

/** "/people/"처럼 끝 슬래시가 붙어 들어와도 같은 라우트로 본다 */
export function normalizePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

/** 경로의 메타. 등록되지 않은 경로(= NotFound가 그리는 경로)는 404 메타를 돌려준다. */
export function metaForPath(pathname: string): RouteMeta {
  return ROUTE_META[normalizePath(pathname)] ?? NOT_FOUND_META;
}
