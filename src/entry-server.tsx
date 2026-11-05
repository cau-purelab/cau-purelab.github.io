/**
 * 빌드 시 프리렌더 진입점 — 브라우저 번들에는 들어가지 않는다.
 * `vite build --ssr src/entry-server.tsx`로 dist-ssr/에 번들되고, scripts/prerender.cjs가
 * 라우트마다 render()를 불러 본문 HTML을 dist/<route>.html의 #root에 채운다.
 *
 * 트리는 main.tsx와 같아야 한다(라우터만 StaticRouter로 바뀜). 달라지면 하이드레이션이 어긋나
 * React가 서버 HTML을 버리고 처음부터 다시 그린다.
 */
import React from 'react';
import { prerender } from 'react-dom/static';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';
import { StaticRouter } from 'react-router-dom';
import App, { routerBasename } from './App';

export interface RenderResult {
  html: string;
  title: string;
  description: string;
}

/** Helmet이 만든 <meta name="description">에서 content만 뽑는다 */
function readDescription(helmet: HelmetServerState): string {
  const match = helmet.meta.toString().match(/name="description"[^>]*content="([^"]*)"/);
  return match ? match[1] : '';
}

/** Helmet 출력은 HTML 이스케이프돼 있다 — 원문과 비교할 수 있도록 되돌린다 */
function unescapeHtml(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

export async function render(url: string): Promise<RenderResult> {
  const helmetContext: { helmet?: HelmetServerState } = {};
  // prerender는 lazy 라우트 청크와 Suspense가 모두 풀릴 때까지 기다린 뒤 완성된 HTML을 준다
  const { prelude } = await prerender(
    <React.StrictMode>
      <HelmetProvider context={helmetContext}>
        <StaticRouter basename={routerBasename} location={url}>
          <App />
        </StaticRouter>
      </HelmetProvider>
    </React.StrictMode>,
    // 큰 Suspense 경계는 기본적으로 숨긴 조각(<div hidden>) + 인라인 스크립트로 '나중에 끼워 넣는' 형태로
    // 출력된다. JS를 실행하지 않는 크롤러에는 본문이 숨김으로 보이므로 경계를 쪼개지 않고 제자리에 넣게 한다.
    { progressiveChunkSize: Number.POSITIVE_INFINITY }
  );
  const html = await new Response(prelude).text();
  const helmet = helmetContext.helmet;
  if (!helmet) throw new Error(`${url}: Helmet 상태를 받지 못함 — 페이지에 <SEO />가 있는지 확인`);

  return {
    html,
    title: unescapeHtml(helmet.title.toString().replace(/<[^>]+>/g, '')),
    description: unescapeHtml(readDescription(helmet)),
  };
}
