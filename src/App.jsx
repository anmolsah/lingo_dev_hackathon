import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AskQuestion from './pages/AskQuestion';
import QuestionDetails from './pages/QuestionDetails';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </LanguageProvider>
  );
}

function AppContent() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ask" element={<AskQuestion />} />
        <Route path="/question/:id" element={<QuestionDetails />} />
      </Routes>
    </Layout>
  );
}

export default App;