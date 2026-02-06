import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../lib/languages';

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
  compact?: boolean;
}

export default function LanguageSelector({ value, onChange, compact }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 transition-colors rounded-lg ${
          compact
            ? 'p-2 hover:bg-slate-100'
            : 'px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        {compact ? (
          <span className="text-lg">{current?.flag}</span>
        ) : (
          <>
            <Globe className="w-4 h-4" />
            <span>{current?.flag} {current?.nativeName}</span>
          </>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onChange(lang.code);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2.5 transition-colors ${
                value === lang.code
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="flex-1">{lang.nativeName}</span>
              {value === lang.code && <Check className="w-4 h-4 text-teal-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
