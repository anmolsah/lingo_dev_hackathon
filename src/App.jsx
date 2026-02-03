import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AskQuestion from './pages/AskQuestion';
import QuestionDetails from './pages/QuestionDetails';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            {/* Public pages - no auth required */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected pages - require authentication */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/ask" element={
              <ProtectedRoute>
                <Layout><AskQuestion /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/question/:id" element={
              <ProtectedRoute>
                <Layout><QuestionDetails /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout><Profile /></Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;