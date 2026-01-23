
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LAB_NAME } from '../constants';
import { useLanguage } from '../context/LanguageContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const navLinks = [
    { name: t('nav.research'), path: '/research' },
    { name: t('nav.people'), path: '/people' },
    { name: t('nav.publications'), path: '/publications' },
    { name: t('nav.news'), path: '/news' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-cauLightGray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold tracking-tighter text-cauBlue hover:opacity-80 transition-opacity">
              {LAB_NAME}
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path 
                    ? 'text-cauBlue' 
                    : 'text-cauGray hover:text-cauBlue'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="md:hidden flex items-center">
            <button className="text-cauGray">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
