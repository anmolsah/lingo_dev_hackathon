import { useState, useEffect } from 'react';
import { Globe, MessageSquare, Zap, Users, ArrowRight, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '../lib/languages';
import { t } from '../lib/i18n';

interface LandingPageProps {
  onGetStarted: () => void;
}

const ROTATING_WORDS = [
  { text: 'Hello', lang: 'en' },
  { text: 'Hola', lang: 'es' },
  { text: 'Bonjour', lang: 'fr' },
  { text: 'Hallo', lang: 'de' },
  { text: 'こんにちは', lang: 'ja' },
  { text: 'नमस्ते', lang: 'hi' },
];

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewLang, setPreviewLang] = useState<LanguageCode>('en');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Typewriter effect
  useEffect(() => {
    const currentWord = ROTATING_WORDS[currentWordIndex].text;
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (displayedText.length < currentWord.length) {
          setDisplayedText(currentWord.slice(0, displayedText.length + 1));
        } else {
          // Pause before deleting
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        // Deleting
        if (displayedText.length > 0) {
          setDisplayedText(displayedText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        }
      }
    }, isDeleting ? 50 : 100); // Faster deletion, slower typing

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentWordIndex]);

  const features = [
    {
      icon: Zap,
      title: t('landing.feature1.title', previewLang),
      desc: t('landing.feature1.desc', previewLang),
    },
    {
      icon: Globe,
      title: t('landing.feature2.title', previewLang),
      desc: t('landing.feature2.desc', previewLang),
    },
    {
      icon: Users,
      title: t('landing.feature3.title', previewLang),
      desc: t('landing.feature3.desc', previewLang),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              {t('app.name', previewLang)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <button className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100">
                <Globe className="w-4 h-4" />
                <span>{SUPPORTED_LANGUAGES.find((l) => l.code === previewLang)?.nativeName}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setPreviewLang(lang.code)}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2.5 transition-colors ${
                      previewLang === lang.code
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={onGetStarted}
              className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              {t('landing.getStarted', previewLang)}
            </button>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div
          className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <Zap className="w-3.5 h-3.5" />
            Powered by Lingo.dev AI
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1] mb-6">
            {t('app.tagline', previewLang).split('.')[0]}.
            <br />
            <span className="relative inline-block mt-2">
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent min-w-[200px] inline-block">
                {displayedText}
                <span className="inline-block w-[3px] h-[0.9em] bg-teal-600 ml-1 animate-pulse align-middle" />
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full" />
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('app.description', previewLang)}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="group bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-xl hover:shadow-teal-500/25 transition-all duration-300 flex items-center gap-2"
            >
              {t('landing.getStarted', previewLang)}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <div
                key={lang.code}
                className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full text-sm text-slate-700 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-200"
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`group p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${(i + 1) * 200}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-slate-900 px-6 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-slate-400 text-sm ml-3">
                BabelChat - General Room
              </span>
            </div>
            <div className="p-6 space-y-4">
              <ChatPreviewMessage
                name="Maria"
                flag="🇪🇸"
                original="Hola a todos! Como estan?"
                translated="Hello everyone! How are you?"
                isOwn={false}
              />
              <ChatPreviewMessage
                name="Yuki"
                flag="🇯🇵"
                original="元気ですよ！新しいプロジェクトが楽しいです。"
                translated="I'm doing great! The new project is fun."
                isOwn={false}
              />
              <ChatPreviewMessage
                name="You"
                flag="🇺🇸"
                original="That's awesome! Let's discuss it in detail."
                translated=""
                isOwn={true}
              />
              <ChatPreviewMessage
                name="Raj"
                flag="🇮🇳"
                original="मैं भी शामिल होना चाहता हूँ!"
                translated="I want to join too!"
                isOwn={false}
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-900">BabelChat</span>
          </div>
          <p className="text-sm text-slate-500">
            Built with Lingo.dev SDK &middot; Supabase &middot; React
          </p>
        </div>
      </footer>
    </div>
  );
}

function ChatPreviewMessage({
  name,
  flag,
  original,
  translated,
  isOwn,
}: {
  name: string;
  flag: string;
  original: string;
  translated: string;
  isOwn: boolean;
}) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] ${
          isOwn
            ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-2xl rounded-br-md'
            : 'bg-slate-100 text-slate-900 rounded-2xl rounded-bl-md'
        } px-5 py-3`}
      >
        {!isOwn && (
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm">{flag}</span>
            <span className={`text-xs font-semibold ${isOwn ? 'text-teal-100' : 'text-teal-600'}`}>
              {name}
            </span>
          </div>
        )}
        <p className="text-sm leading-relaxed">{isOwn ? original : translated || original}</p>
        {!isOwn && translated && (
          <p className="text-xs mt-1 opacity-60 italic">{original}</p>
        )}
      </div>
    </div>
  );
}
