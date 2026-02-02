import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const { currentLanguage, changeLanguage } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header 
        onLanguageChange={changeLanguage} 
        currentLanguage={currentLanguage} 
      />
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
