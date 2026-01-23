
import React, { createContext, useContext, ReactNode } from 'react';

interface LanguageContextType {
  language: 'en';
  setLanguage: (lang: 'en') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const uiStrings: Record<string, string> = {
    'nav.research': 'Research',
    'nav.people': 'People',
    'nav.publications': 'Publications',
    'nav.news': 'News',
    'hero.title': 'Securing Visual Intelligence through Trustworthy AI.',
    'hero.explore': 'Explore Research',
    'hero.team': 'Meet the Team',
    'stats.pubs': 'Publications',
    'stats.members': 'Researchers',
    'section.research': 'Research Focus',
    'section.news': 'Latest News',
    'assistant.title': 'SVIL Assistant',
    'assistant.placeholder': 'How can I help you?',
    'assistant.loading': 'Thinking...',
    'footer.description': 'Pioneering security in the age of generative intelligence.',
    'footer.nav': 'Navigation',
    'footer.location': 'Location',
  };

  const t = (key: string) => uiStrings[key] || key;

  return (
    <LanguageContext.Provider value={{ language: 'en', setLanguage: () => {}, t }}>
      <div lang="en">
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
