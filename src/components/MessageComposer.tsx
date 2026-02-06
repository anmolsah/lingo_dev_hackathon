import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { t } from '../lib/i18n';
import type { LanguageCode } from '../lib/languages';

interface MessageComposerProps {
  onSend: (content: string) => void;
  onTyping: () => void;
  disabled: boolean;
  locale: LanguageCode;
}

export default function MessageComposer({
  onSend,
  onTyping,
  disabled,
  locale,
}: MessageComposerProps) {
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || disabled) return;
    onSend(content.trim());
    setContent('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    onTyping();
    typingTimeoutRef.current = setTimeout(() => {}, 3000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-6 py-4 border-t border-slate-100 bg-white"
    >
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.typeMessage', locale)}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white outline-none transition-all disabled:opacity-50 max-h-32"
            style={{ minHeight: '44px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = '44px';
              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
            }}
          />
        </div>
        <button
          type="submit"
          disabled={!content.trim() || disabled}
          className="flex-shrink-0 w-11 h-11 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl flex items-center justify-center hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </div>
    </form>
  );
}
