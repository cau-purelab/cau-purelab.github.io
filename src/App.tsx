import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';

// 라우트 코드 스플리팅: 무거운 publications.json을 쓰는 People/Scholar가 초기 번들에서 분리됨
const Research = lazy(() => import('./pages/Research'));
const People = lazy(() => import('./pages/People'));
const Publications = lazy(() => import('./pages/Publications'));       // 주요 논문 페이지
const News = lazy(() => import('./pages/News'));
const ScholarPublications = lazy(() => import('./pages/ScholarPublications')); // 전체 논문 페이지

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

const PageLoader = () => (
  <div className="flex items-center justify-center py-32">
    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" aria-label="Loading page" />
  </div>
);

function App() {
  return (
    <Router basename={routerBasename}>
      <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
        <Navbar />
        <main className="flex-grow pt-16">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/research" element={<Research />} />
              <Route path="/people" element={<People />} />
              <Route path="/publications" element={<Publications />} /> {/* 하이라이트 */}
              <Route path="/news" element={<News />} />
              <Route path="/scholar" element={<ScholarPublications />} /> {/* 전체 목록 */}
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
