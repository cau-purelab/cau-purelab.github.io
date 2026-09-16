import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { LAB_BRAND_NAME } from '../constants';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Research', path: '/research' },
    { name: 'People', path: '/people' },
    { name: 'Publications', path: '/publications' },
    { name: 'Archive', path: '/scholar' }, // 전체 논문 아카이브 (페이지 제목: Publication Archive)
    { name: 'News', path: '/news' },
  ];

  return (
    // 높이는 src/index.css의 --nav-h(= h-20 + border-b 1px)와 맞물려 있다.
    // top-0 inset-x-0을 명시해 마크업 순서에 의존하지 않게 한다.
    <nav className="fixed top-0 inset-x-0 bg-white/95 backdrop-blur-sm z-50 border-b border-slate-100 shadow-sm">
      {/* 키보드·스크린리더 사용자가 내비게이션을 건너뛰고 본문으로 갈 수 있게 한다 */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-blue-900 focus:text-white focus:text-sm focus:font-bold"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center" aria-label={`${LAB_BRAND_NAME} — home`}>
              <img
                src="/assets/logo-full.png"
                alt={`${LAB_BRAND_NAME} logo`}
                width={164}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>

          {/* 데스크톱 메뉴 전환점은 lg(1024px)다. 항목이 6개라 md(768px)에서는 로고와의 여유가
              한 자릿수 px밖에 남지 않았고, 폰트가 늦게 로드되는 첫 페인트에서는 그마저 넘쳤다.
              768~1023px 구간은 아래 햄버거를 그대로 쓴다. */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`${isActive
                    ? 'text-blue-900 font-bold border-b-2 border-blue-900'
                    : 'text-slate-600 hover:text-blue-900 transition-colors'
                    } px-2 py-2.5 text-sm uppercase tracking-wide font-medium`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 -mr-2 rounded-md text-slate-600 hover:text-blue-900 hover:bg-slate-50 transition-colors"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div id="mobile-nav" className="lg:hidden bg-white border-b border-slate-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`${isActive
                    ? 'bg-blue-50 text-blue-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
                    } block px-3 py-3 rounded-md text-base font-medium`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
