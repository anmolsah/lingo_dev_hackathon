import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import ChatLayout from './components/ChatLayout';
import { Loader2 } from 'lucide-react';

type View = 'landing' | 'auth';

function AppContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>('landing');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          <p className="text-sm text-slate-500">Loading BabelChat...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <ChatLayout />;
  }

  if (view === 'auth') {
    return <AuthPage onBack={() => setView('landing')} />;
  }

  return <LandingPage onGetStarted={() => setView('auth')} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
