import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <Header 
        onLanguageChange={changeLanguage} 
        currentLanguage={currentLanguage}
        onMenuToggle={toggleSidebar}
      />
      {/* Responsive main content - full width on mobile, offset on desktop */}
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
