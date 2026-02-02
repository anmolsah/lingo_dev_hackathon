import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AskQuestion from './pages/AskQuestion';

function App() {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const handleLanguageChange = (langCode) => {
    setCurrentLanguage(langCode);
    // TODO: Trigger Lingo.dev translations
    console.log('Language changed to:', langCode);
  };

  return (
    <BrowserRouter>
      <Layout 
        currentLanguage={currentLanguage} 
        onLanguageChange={handleLanguageChange}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ask" element={<AskQuestion />} />
          {/* More routes will be added */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;