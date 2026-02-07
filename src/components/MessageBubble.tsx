import { useState } from 'react';
import { Languages, Eye } from 'lucide-react';
import { getLanguageFlag } from '../lib/languages';
import type { LanguageCode } from '../lib/languages';
import { t } from '../lib/i18n';
import type { MessageWithSender } from '../types';

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwn: boolean;
  userLanguage: LanguageCode;
  isTranslating: boolean;
}

export default function MessageBubble({
  message,
  isOwn,
  userLanguage,
  isTranslating,
}: MessageBubbleProps) {
  const [showOriginal, setShowOriginal] = useState(false);
  const needsTranslation = message.source_language !== userLanguage;
  const hasTranslation = !!message.translation;
  const displayText =
    !needsTranslation || showOriginal
      ? message.content
      : message.translation || message.content;

  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group animate-message-in`}
    >
      <div className={`max-w-[85%] sm:max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && message.sender && (
          <div className="flex items-center gap-2 mb-1 ml-1">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] sm:text-[10px] font-bold text-white">
                {message.sender.display_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-600 truncate max-w-[120px] sm:max-w-none">
              {message.sender.display_name}
            </span>
            <span className="text-xs text-slate-400">
              {getLanguageFlag(message.source_language)}
            </span>
          </div>
        )}

        <div
          className={`relative px-3 sm:px-4 py-2.5 sm:py-3 ${
            isOwn
              ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-2xl rounded-br-md shadow-sm'
              : 'bg-white text-slate-900 rounded-2xl rounded-bl-md shadow-sm border border-slate-100'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {displayText}
          </p>

          {isTranslating && needsTranslation && !hasTranslation && (
            <div
              className={`flex items-center gap-1.5 mt-2 text-xs ${
                isOwn ? 'text-teal-100' : 'text-slate-400'
              }`}
            >
              <Languages className="w-3 h-3 animate-pulse" />
              {t('chat.translating', userLanguage)}
            </div>
          )}

          {needsTranslation && hasTranslation && (
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className={`flex items-center gap-1 mt-2 text-xs transition-colors ${
                isOwn
                  ? 'text-teal-100 hover:text-white'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Eye className="w-3 h-3" />
              {showOriginal
                ? t('chat.showTranslation', userLanguage)
                : t('chat.showOriginal', userLanguage)}
            </button>
          )}

          {needsTranslation && hasTranslation && showOriginal && (
            <p
              className={`text-xs mt-1.5 italic ${
                isOwn ? 'text-teal-100' : 'text-slate-400'
              }`}
            >
              {message.translation}
            </p>
          )}
        </div>

        <div
          className={`flex items-center gap-2 mt-1 ${
            isOwn ? 'justify-end mr-1' : 'ml-1'
          }`}
        >
          <span className="text-[10px] sm:text-[11px] text-slate-400">{time}</span>
          {needsTranslation && hasTranslation && (
            <span className="text-[10px] sm:text-[11px] text-teal-500 flex items-center gap-0.5">
              <Languages className="w-3 h-3" />
              <span className="hidden sm:inline">Translated</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
