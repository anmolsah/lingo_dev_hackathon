import { useState } from 'react';
import { X, Loader2, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { t } from '../lib/i18n';
import type { LanguageCode } from '../lib/languages';

interface JoinByCodeModalProps {
  onClose: () => void;
  onJoined: (roomId: string) => void;
  locale: LanguageCode;
}

export default function JoinByCodeModal({ onClose, onJoined, locale }: JoinByCodeModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');

    const { data, error: rpcError } = await supabase.rpc('join_room_by_invite_code', {
      code: code.trim(),
    });

    if (rpcError) {
      setError(
        rpcError.message.includes('Invalid invite code')
          ? 'Invalid invite code. Please check and try again.'
          : rpcError.message
      );
      setLoading(false);
      return;
    }

    setLoading(false);
    onJoined(data as string);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md animate-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-teal-500" />
            <h2 className="text-lg font-semibold text-slate-900">
              {t('invite.title', locale)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-slate-500">
            {t('invite.subtitle', locale)}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl text-sm font-mono tracking-wider focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                placeholder={t('invite.placeholder', locale)}
                autoFocus
              />
            </div>
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
              disabled={loading || !code.trim()}
              className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('invite.join', locale)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
