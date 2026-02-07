import { useState, useEffect } from 'react';
import { X, Loader2, Hash, Users, Search, Check, LogIn, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../lib/i18n';
import type { LanguageCode } from '../lib/languages';
import type { PublicRoomWithCount } from '../types';

interface BrowseRoomsModalProps {
  onClose: () => void;
  onJoined: (roomId: string) => void;
  locale: LanguageCode;
}

export default function BrowseRoomsModal({ onClose, onJoined, locale }: BrowseRoomsModalProps) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<PublicRoomWithCount[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    if (!user) return;

    const [roomsRes, membershipsRes] = await Promise.all([
      supabase.rpc('get_public_rooms_with_counts'),
      supabase.from('room_members').select('room_id').eq('user_id', user.id),
    ]);

    setRooms((roomsRes.data as PublicRoomWithCount[]) ?? []);
    setJoinedIds(new Set(membershipsRes.data?.map((m) => m.room_id) ?? []));
    setLoading(false);
  };

  const handleJoin = async (roomId: string) => {
    if (!user) return;
    setJoiningId(roomId);

    const { error } = await supabase
      .from('room_members')
      .insert({ room_id: roomId, user_id: user.id });

    if (!error) {
      setJoinedIds((prev) => new Set(prev).add(roomId));
      setJoiningId(null);
      onJoined(roomId);
    } else {
      setJoiningId(null);
    }
  };

  const filtered = rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 w-full sm:max-w-lg animate-in flex flex-col max-h-[85vh] sm:max-h-[80vh]">
        <div className="sticky top-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-teal-500" />
            <h2 className="text-lg font-semibold text-slate-900">
              {t('browse.title', locale)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-3 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white outline-none transition-all"
              placeholder={t('browse.search', locale)}
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Hash className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">{t('browse.noRooms', locale)}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((room) => {
                const isJoined = joinedIds.has(room.id);
                const isJoining = joiningId === room.id;

                return (
                  <div
                    key={room.id}
                    className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all duration-150"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                      <Hash className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">
                        {room.name}
                      </h3>
                      {room.description && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {room.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                        <Users className="w-3 h-3" />
                        <span>
                          {room.member_count} {t('browse.members', locale)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {isJoined ? (
                        <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-teal-50 text-teal-600 text-xs font-medium">
                          <Check className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{t('browse.joined', locale)}</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleJoin(room.id)}
                          disabled={isJoining}
                          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs font-semibold hover:shadow-md hover:shadow-teal-500/20 transition-all duration-200 disabled:opacity-60"
                        >
                          {isJoining ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <LogIn className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">{t('browse.join', locale)}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
