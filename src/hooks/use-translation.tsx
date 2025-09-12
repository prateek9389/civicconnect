
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

const translations = {
  en: {
    explore: 'Explore',
    report_issue: 'Report Issue',
    leaderboard: 'Leaderboard',
    about: 'About',
    admin: 'Admin',
  },
  hi: {
    explore: 'अन्वेषण करें',
    report_issue: 'समस्या की रिपोर्ट करें',
    leaderboard: 'लीडरबोर्ड',
    about: 'हमारे बारे में',
    admin: 'एडमिन',
  },
};

type Language = keyof typeof translations;

interface TranslationContextType {
  language: Language;
  setLanguage: (language: Language | string) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const handleSetLanguage = (lang: Language | string) => {
    if (lang === 'en' || lang === 'hi') {
      setLanguage(lang);
    } else {
      setLanguage('en');
    }
  };

  const t = useCallback((key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  }, [language]);

  return (
    <TranslationContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);
