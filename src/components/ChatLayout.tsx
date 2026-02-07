import { useState } from 'react';
import { MessageSquare, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../lib/i18n';
import type { LanguageCode } from '../lib/languages';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';

export default function ChatLayout() {
  const { profile } = useAuth();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const locale = (profile?.preferred_language || 'en') as LanguageCode;

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setSidebarOpen(false); // Close sidebar on mobile when room is selected
  };

  return (
    <div className="h-screen flex bg-slate-50">
      {/* Mobile menu button - only visible on small screens */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-3 left-3 z-30 p-2 bg-white rounded-xl shadow-lg border border-slate-200 sm:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-slate-600" />
      </button>

      {/* Mobile overlay - only on small screens when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - different behavior on mobile vs desktop */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-72
          transform transition-transform duration-300 ease-in-out
          sm:relative sm:translate-x-0 sm:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
        `}
      >
        <Sidebar
          selectedRoomId={selectedRoomId}
          onSelectRoom={handleSelectRoom}
          locale={locale}
          onClose={() => setSidebarOpen(false)}
          isMobile={sidebarOpen}
        />
      </div>

      {/* Main content area */}
      {selectedRoomId ? (
        <ChatArea roomId={selectedRoomId} locale={locale} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 px-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm text-center">{t('chat.selectRoom', locale)}</p>
        </div>
      )}
    </div>
  );
}
