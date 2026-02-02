import React, { createContext, useContext, useState, useCallback } from 'react';
import { translateText, translateObject, translateQuestion } from '../services/translation';

// Create the Language Context
const LanguageContext = createContext();

// Available languages
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

// Language Provider Component
export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translationCache, setTranslationCache] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Get cached translation or translate
  const translate = useCallback(async (text, sourceLocale) => {
    if (sourceLocale === currentLanguage) return text;
    
    const cacheKey = `${text}_${sourceLocale}_${currentLanguage}`;
    
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }
    
    setIsTranslating(true);
    try {
      const translated = await translateText(text, sourceLocale, currentLanguage);
      setTranslationCache(prev => ({
        ...prev,
        [cacheKey]: translated,
      }));
      return translated;
    } finally {
      setIsTranslating(false);
    }
  }, [currentLanguage, translationCache]);

  // Translate a question object
  const translateQuestionContent = useCallback(async (question) => {
    if (question.originalLanguage === currentLanguage) return null;
    
    const cacheKey = `question_${question.id}_${currentLanguage}`;
    
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }
    
    setIsTranslating(true);
    try {
      const translated = await translateQuestion(question, currentLanguage);
      if (translated) {
        setTranslationCache(prev => ({
          ...prev,
          [cacheKey]: translated,
        }));
      }
      return translated;
    } finally {
      setIsTranslating(false);
    }
  }, [currentLanguage, translationCache]);

  // Change language
  const changeLanguage = useCallback((langCode) => {
    setCurrentLanguage(langCode);
    // Optionally clear cache when language changes to force re-translation
    // setTranslationCache({});
  }, []);

  const value = {
    currentLanguage,
    changeLanguage,
    translate,
    translateQuestionContent,
    isTranslating,
    languages: LANGUAGES,
    getCurrentLanguageInfo: () => LANGUAGES.find(l => l.code === currentLanguage),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
