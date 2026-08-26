import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { LANGUAGE_LABELS, LANGUAGE_FLAGS, Language } from '../i18n/translations';
import { Globe, ArrowRight, Sprout, ShieldCheck, Bot, TrendingUp } from 'lucide-react';

interface WelcomeScreenProps {
  onEnter: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: Language; name: string; native: string; flag: string }[] = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-amber-400/20 rounded-full animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md mx-3 sm:mx-4 animate-fade-in-up">
        {/* Logo & Brand */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-20 h-20 bg-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-400/30 rotate-3 hover:rotate-0 transition-transform">
            <span className="text-4xl">🌾</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            {t('welcome.title')}
          </h1>
          <p className="text-emerald-200/80 text-sm">
            {t('welcome.subtitle')}
          </p>
        </div>

        {/* Language Selection Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-amber-300" />
            <h2 className="text-white font-bold text-lg">{t('welcome.chooseLang')}</h2>
          </div>

          <p className="text-emerald-100/70 text-xs mb-5">
            {t('welcome.startDesc')}
          </p>

          <div className="space-y-2 mb-5 sm:mb-6">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl transition-all cursor-pointer ${
                  language === lang.code
                    ? 'bg-white text-emerald-900 shadow-lg shadow-emerald-900/30 scale-[1.02]'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="text-left flex-1">
                  <p className={`text-sm font-bold ${language === lang.code ? 'text-emerald-900' : 'text-white'}`}>
                    {lang.name}
                  </p>
                  <p className={`text-xs ${language === lang.code ? 'text-emerald-600' : 'text-emerald-200/60'}`}>
                    {lang.native}
                  </p>
                </div>
                {language === lang.code && (
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
              <Sprout className="w-4 h-4 text-emerald-300" />
              <span className="text-[11px] text-emerald-100 font-medium">Direct Trade</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span className="text-[11px] text-emerald-100 font-medium">KYC Verified</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
              <Bot className="w-4 h-4 text-blue-300" />
              <span className="text-[11px] text-emerald-100 font-medium">AI Assistant</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
              <TrendingUp className="w-4 h-4 text-emerald-300" />
              <span className="text-[11px] text-emerald-100 font-medium">Live Prices</span>
            </div>
          </div>

          {/* Enter Button */}
          <button
            onClick={onEnter}
            className="w-full py-3 sm:py-3.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-sm sm:text-base rounded-xl shadow-lg shadow-amber-400/30 transition-all hover:shadow-xl hover:shadow-amber-400/40 hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <span>{t('welcome.enter')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Footer text */}
        <p className="text-center text-emerald-300/40 text-[11px] mt-5">
          © 2026 AgriConnect • Empowering Indian Agriculture
        </p>
      </div>
    </div>
  );
};
