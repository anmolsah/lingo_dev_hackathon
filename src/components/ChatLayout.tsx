import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../lib/i18n';
import type { LanguageCode } from '../lib/languages';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';

export default function ChatLayout() {
  const { profile } = useAuth();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const locale = (profile?.preferred_language || 'en') as LanguageCode;

  return (
    <div className="h-screen flex bg-slate-50">
      <Sidebar
        selectedRoomId={selectedRoomId}
        onSelectRoom={setSelectedRoomId}
        locale={locale}
      />

      {selectedRoomId ? (
        <ChatArea roomId={selectedRoomId} locale={locale} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm">{t('chat.selectRoom', locale)}</p>
        </div>
      )}
    </div>
  );
}
