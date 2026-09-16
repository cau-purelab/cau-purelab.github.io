import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';

// 라우트 코드 스플리팅: 무거운 publications.json을 쓰는 People/Scholar가 초기 번들에서 분리됨
const Research = lazy(() => import('./pages/Research'));
const People = lazy(() => import('./pages/People'));
const Publications = lazy(() => import('./pages/Publications'));       // 주요 논문 페이지
const News = lazy(() => import('./pages/News'));
const ScholarPublications = lazy(() => import('./pages/ScholarPublications')); // 전체 논문 페이지
const NotFound = lazy(() => import('./pages/NotFound'));

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

const PageLoader = () => (
  <div className="flex items-center justify-center py-32">
    <div
      className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"
      role="status"
      aria-label="Loading page"
    />
  </div>
);

/**
 * 앵커(/news#n1 등)로 들어온 경우 해당 요소로 스크롤한다.
 * 라우트가 lazy 청크라 첫 프레임에는 대상이 아직 없을 수 있어 몇 프레임만 재시도한다.
 */
const scrollToHash = (hash: string) => {
  const id = decodeURIComponent(hash.slice(1));
  if (!id) return;
  let tries = 0;
  const tick = () => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView();
      return;
    }
    tries += 1;
    if (tries < 20) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

/**
 * 라우트 전환 시 스크롤 위치 초기화.
 * - location.key를 의존성으로 써서 같은 경로로의 replace 이동(로고 클릭 등)도 잡는다.
 * - 뒤로/앞으로(POP)는 브라우저의 스크롤 복원을 방해하지 않도록 건너뛴다.
 */
const ScrollToTop = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // 앵커 이동이 먼저다. 첫 로드의 navigationType은 'POP'이라, 이 검사를 뒤에 두면
    // RSS에서 들어온 /news#n1 같은 주소가 아무 데도 가지 못한다.
    if (location.hash) {
      scrollToHash(location.hash);
      return;
    }
    if (navigationType === 'POP') return;
    window.scrollTo(0, 0);
    // location.key는 같은 경로로 다시 이동해도 매번 새로 발급된다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, location.hash, navigationType]);

  return null;
};

// 배포 직후에는 열어 둔 탭이 참조하던 구 청크가 404가 되어 lazy 라우트가 빈 화면이 된다.
// 실패를 한 번은 자동 새로고침으로 복구하되, 같은 실패가 반복되면 안내 화면으로 멈춘다.
const RELOAD_STAMP_KEY = 'pure:chunk-reload-at';
const RELOAD_COOLDOWN_MS = 10_000;

const isChunkLoadError = (error: unknown): boolean => {
  const message = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return /chunk|dynamically imported module|module script failed|Failed to fetch/i.test(message);
};

interface BoundaryState {
  hasError: boolean;
}

class RouteErrorBoundary extends React.Component<{ children: React.ReactNode }, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (!isChunkLoadError(error)) return;
    let lastReloadAt = 0;
    try {
      lastReloadAt = Number(sessionStorage.getItem(RELOAD_STAMP_KEY)) || 0;
      sessionStorage.setItem(RELOAD_STAMP_KEY, String(Date.now()));
    } catch {
      // 프라이빗 모드 등으로 sessionStorage가 막히면 자동 복구를 포기하고 안내만 보여준다
      return;
    }
    if (Date.now() - lastReloadAt > RELOAD_COOLDOWN_MS) window.location.reload();
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <h1 className="font-playfair text-3xl font-bold text-slate-900 mb-3">This page didn&apos;t load</h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          The site was likely updated while this tab was open, so part of it is no longer available. Reloading
          usually fixes it.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg"
        >
          Reload page
        </button>
      </div>
    );
  }
}

// 라우트가 바뀌면 경계 상태도 초기화되도록 location.key를 key로 준다.
const RoutedContent = () => {
  const location = useLocation();

  return (
    <RouteErrorBoundary key={location.key}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/research" element={<Research />} />
          <Route path="/people" element={<People />} />
          <Route path="/publications" element={<Publications />} /> {/* 하이라이트 */}
          <Route path="/news" element={<News />} />
          <Route path="/scholar" element={<ScholarPublications />} /> {/* 전체 목록 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </RouteErrorBoundary>
  );
};

function App() {
  return (
    <Router basename={routerBasename}>
      <ScrollToTop />
      <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
        <Navbar />
        {/* pt-nav = 고정 Navbar 높이(src/index.css의 --nav-h). 값을 바꾸면 그 변수만 고칠 것 */}
        <main id="main" className="flex-grow pt-nav">
          <RoutedContent />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
