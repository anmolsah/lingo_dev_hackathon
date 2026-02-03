import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, ChevronDown, Globe, Loader2 } from 'lucide-react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const { currentLanguage, changeLanguage, isTranslating } = useLanguage();
  const { user } = useAuth();

  const selectedLang = LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];
  
  const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-10">
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions, tags, or communities..."
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-6">
        {/* Translation Indicator */}
        {isTranslating && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Translating...</span>
          </div>
        )}

        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Globe className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{selectedLang.flag} {selectedLang.name}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isLangDropdownOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsLangDropdownOpen(false)} 
              />
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-400 uppercase">Select Language</p>
                </div>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                      currentLanguage === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.name}</span>
                    {currentLanguage === lang.code && (
                      <span className="ml-auto text-blue-500">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Profile */}
        <Link 
          to="/profile"
          className="flex items-center gap-3 pl-3 pr-4 py-2 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-[#137fec] to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {initials}
          </div>
          <span className="text-sm font-medium text-gray-700">{displayName}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </Link>
      </div>
    </header>
  );
};

export default Header;

