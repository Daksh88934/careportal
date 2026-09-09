'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/language-context';

interface TriageResultBadgeProps {
  classification: 'URGENT' | 'NEEDS_CONSULT' | 'ROUTINE';
  size?: 'sm' | 'md' | 'lg';
}

export function TriageResultBadge({ classification, size = 'md' }: TriageResultBadgeProps) {
  const { t } = useLanguage();

  if (classification === 'URGENT') {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-xl font-bold bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800 ${
        size === 'lg' ? 'px-4 py-2 text-base' : size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-sm'
      }`}>
        <AlertCircle className={`${size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} text-rose-600 animate-pulse`} />
        <span>🔴 {t.urgent}</span>
      </div>
    );
  }

  if (classification === 'NEEDS_CONSULT') {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-xl font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800 ${
        size === 'lg' ? 'px-4 py-2 text-base' : size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-sm'
      }`}>
        <AlertTriangle className={`${size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} text-amber-600`} />
        <span>🟡 {t.needsConsult}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-xl font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800 ${
      size === 'lg' ? 'px-4 py-2 text-base' : size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-sm'
    }`}>
      <CheckCircle2 className={`${size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} text-emerald-600`} />
      <span>🟢 {t.routine}</span>
    </div>
  );
}
