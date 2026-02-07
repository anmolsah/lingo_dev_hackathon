import { useState, useEffect } from 'react';
import { Hash, Plus, LogOut, Settings, Loader2, Compass, KeyRound, Globe, Lock, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../lib/i18n';
import { getLanguageFlag } from '../lib/languages';
import type { LanguageCode } from '../lib/languages';
import type { Room } from '../types';
import LanguageSelector from './LanguageSelector';
import CreateRoomModal from './CreateRoomModal';
import BrowseRoomsModal from './BrowseRoomsModal';
import JoinByCodeModal from './JoinByCodeModal';

interface SidebarProps {
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  locale: LanguageCode;
  onClose?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ selectedRoomId, onSelectRoom, locale, onClose, isMobile }: SidebarProps) {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [user?.id]);

  const fetchRooms = async () => {
    if (!user) return;

    const { data: memberships } = await supabase
      .from('room_members')
      .select('room_id')
      .eq('user_id', user.id);

    const roomIds = memberships?.map((m) => m.room_id) ?? [];

    if (roomIds.length === 0) {
      setRooms([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('rooms')
      .select('*')
      .in('id', roomIds)
      .order('created_at', { ascending: true });

    setRooms(data ?? []);
    setLoading(false);

    if (data && data.length > 0 && !selectedRoomId) {
      onSelectRoom(data[0].id);
    }
  };

  const handleLanguageChange = async (code: string) => {
    await updateProfile({ preferred_language: code });
  };

  const handleRoomCreated = (roomId: string) => {
    setShowCreateModal(false);
    fetchRooms();
    onSelectRoom(roomId);
  };

  const handleRoomJoined = (roomId: string) => {
    setShowBrowseModal(false);
    setShowJoinModal(false);
    fetchRooms();
    onSelectRoom(roomId);
  };

  return (
    <>
      <div className="w-full sm:w-72 bg-white border-r border-slate-200 flex flex-col h-full">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                <Hash className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">BabelChat</span>
            </div>
            {/* Close button for mobile */}
            {isMobile && onClose && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors sm:hidden"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            )}
          </div>
        </div>

        <div className="px-3 py-3 border-b border-slate-100">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('chat.rooms', locale)}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setShowBrowseModal(true)}
                className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                title={t('chat.browseRooms', locale)}
              >
                <Compass className="w-4 h-4 text-slate-500" />
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                title={t('chat.joinByCode', locale)}
              >
                <KeyRound className="w-4 h-4 text-slate-500" />
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                title={t('chat.createRoom', locale)}
              >
                <Plus className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            </div>
          ) : (
            <div className="space-y-0.5 max-h-[40vh] sm:max-h-none overflow-y-auto">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-150 ${
                    selectedRoomId === room.id
                      ? 'bg-teal-50 text-teal-700 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Hash
                    className={`w-4 h-4 flex-shrink-0 ${
                      selectedRoomId === room.id ? 'text-teal-500' : 'text-slate-400'
                    }`}
                  />
                  <span className="text-sm truncate flex-1">{room.name}</span>
                  {room.is_public ? (
                    <Globe className="w-3 h-3 text-slate-300 flex-shrink-0" />
                  ) : (
                    <Lock className="w-3 h-3 text-slate-300 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />

        {showSettings && profile && (
          <div className="px-3 py-3 border-t border-slate-100 bg-slate-50">
            <div className="px-2 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  {t('auth.displayName', locale)}
                </label>
                <input
                  type="text"
                  defaultValue={profile.display_name}
                  onBlur={(e) => {
                    if (e.target.value !== profile.display_name) {
                      updateProfile({ display_name: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  {t('auth.language', locale)}
                </label>
                <LanguageSelector
                  value={profile.preferred_language}
                  onChange={handleLanguageChange}
                />
              </div>
            </div>
          </div>
        )}

        <div className="px-3 py-3 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-white">
                {profile?.display_name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {profile?.display_name || 'User'}
              </p>
              <p className="text-xs text-slate-500">
                {getLanguageFlag(profile?.preferred_language || 'en')}{' '}
                {profile?.preferred_language?.toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${
                  showSettings ? 'bg-teal-50 text-teal-600' : 'hover:bg-slate-100 text-slate-500'
                }`}
                title={t('chat.settings', locale)}
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={signOut}
                className="p-2 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-colors"
                title={t('chat.signOut', locale)}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleRoomCreated}
          locale={locale}
        />
      )}

      {showBrowseModal && (
        <BrowseRoomsModal
          onClose={() => setShowBrowseModal(false)}
          onJoined={handleRoomJoined}
          locale={locale}
        />
      )}

      {showJoinModal && (
        <JoinByCodeModal
          onClose={() => setShowJoinModal(false)}
          onJoined={handleRoomJoined}
          locale={locale}
        />
      )}
    </>
  );
}
