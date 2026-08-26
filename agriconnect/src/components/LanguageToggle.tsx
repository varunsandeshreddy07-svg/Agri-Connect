import React, { useState, useRef, useEffect } from 'react';
import { Languages, ChevronDown } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { LANGUAGE_LABELS, LANGUAGE_FLAGS, Language } from '../i18n/translations';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-800/60 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/80 transition cursor-pointer"
        title={t('nav.language')}
      >
        <Languages className="w-3.5 h-3.5 text-amber-300" />
        <span className="hidden sm:inline">{LANGUAGE_FLAGS[language]} {LANGUAGE_LABELS[language]}</span>
        <span className="sm:hidden">{LANGUAGE_FLAGS[language]}</span>
        <ChevronDown className={`w-3 h-3 text-emerald-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('nav.language')}</p>
          </div>
          {(['en', 'hi', 'te'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition cursor-pointer ${
                language === lang ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700'
              }`}
            >
              <span className="text-base">{LANGUAGE_FLAGS[lang]}</span>
              <span className="text-xs">{LANGUAGE_LABELS[lang]}</span>
              {language === lang && (
                <span className="ml-auto text-emerald-600 text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
