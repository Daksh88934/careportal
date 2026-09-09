'use client';

import React from 'react';
import { useLanguage } from '../../context/language-context';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-sm text-xs font-semibold">
      <div className="p-1.5 text-slate-500">
        <Languages className="w-3.5 h-3.5" />
      </div>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-full transition-all ${
          language === 'en'
            ? 'bg-emerald-600 text-white shadow-sm font-bold'
            : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`px-2.5 py-1 rounded-full transition-all ${
          language === 'hi'
            ? 'bg-emerald-600 text-white shadow-sm font-bold'
            : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
        }`}
      >
        हिंदी
      </button>
    </div>
  );
}
