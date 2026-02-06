import { useState } from 'react';
import { X, Loader2, Hash, Globe, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../lib/i18n';
import type { LanguageCode } from '../lib/languages';

interface CreateRoomModalProps {
  onClose: () => void;
  onCreated: (roomId: string) => void;
  locale: LanguageCode;
}

export default function CreateRoomModal({ onClose, onCreated, locale }: CreateRoomModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    setLoading(true);
    setError('');

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        name: name.trim(),
        description: description.trim(),
        created_by: user.id,
        is_public: isPublic,
      })
      .select('id')
      .single();

    if (roomError) {
      setError(roomError.message);
      setLoading(false);
      return;
    }

    await supabase.from('room_members').insert({
      room_id: room.id,
      user_id: user.id,
    });

    setLoading(false);
    onCreated(room.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md animate-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            {t('room.newRoom', locale)}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t('room.name', locale)}
            </label>
            <div className="relative">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                placeholder="e.g. Design Team"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t('room.description', locale)}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all resize-none"
              placeholder="What's this room about?"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('room.visibility', locale)}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                  isPublic
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Globe className={`w-4 h-4 ${isPublic ? 'text-teal-500' : 'text-slate-400'}`} />
                <span className="text-sm font-medium">{t('room.public', locale)}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                  !isPublic
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Lock className={`w-4 h-4 ${!isPublic ? 'text-teal-500' : 'text-slate-400'}`} />
                <span className="text-sm font-medium">{t('room.private', locale)}</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 ml-1">
              {isPublic ? t('room.publicDesc', locale) : t('room.privateDesc', locale)}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {t('room.cancel', locale)}
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('room.create', locale)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
