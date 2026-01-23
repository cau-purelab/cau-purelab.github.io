
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Research from './pages/Research';
import People from './pages/People';
import Publications from './pages/Publications';
import LabAssistant from './components/LabAssistant';
import { LAB_NAME, CONTENT } from './constants';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const content = CONTENT;

  return (
    <footer className="bg-slate-900 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 border-b border-white/10 pb-12 mb-12">
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-cauBlue">{LAB_NAME}</span>
            </h2>
            <p className="text-slate-400 max-w-sm mb-6">
              {content.fullName}.<br />
              {t('footer.description')}
            </p>
            <div className="flex gap-4">
              <a href="mailto:smrho@cau.ac.kr" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-cauBlue cursor-pointer transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </a>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-cauBlue cursor-pointer transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-6">{t('footer.nav')}</h3>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><a href="#/research" className="hover:text-cauBlue transition-colors">{t('nav.research')}</a></li>
                <li><a href="#/people" className="hover:text-cauBlue transition-colors">{t('nav.people')}</a></li>
                <li><a href="#/publications" className="hover:text-cauBlue transition-colors">{t('nav.publications')}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-6">{t('footer.location')}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Room B105-1, Bldg. 310<br />
                Chung-Ang University<br />
                84 Heukseok-ro, Dongjak-gu<br />
                Seoul, 06974, Rep. of Korea
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2024 {content.fullName}. All rights reserved.</p>
          <p className="flex items-center gap-2">Built for <span className="text-cauBlue font-bold">CAU SVIL</span></p>
        </div>
      </div>
    </footer>
  );
};

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/research" element={<Research />} />
          <Route path="/people" element={<People />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/news" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <LabAssistant />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
};

export default App;
