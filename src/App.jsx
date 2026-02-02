import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AskQuestion from './pages/AskQuestion';
import QuestionDetails from './pages/QuestionDetails';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page - no layout wrapper */}
          <Route path="/" element={<LandingPage />} />
          
          {/* App pages with sidebar layout */}
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/ask" element={<Layout><AskQuestion /></Layout>} />
          <Route path="/question/:id" element={<Layout><QuestionDetails /></Layout>} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;