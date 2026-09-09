'use client';

import React from 'react';
import { CheckCircle, Clock, WifiOff } from 'lucide-react';
import { useLanguage } from '../../context/language-context';

interface SyncStatusBadgeProps {
  status: 'SYNCED' | 'PENDING_SYNC' | 'OFFLINE';
  className?: string;
}

export function SyncStatusBadge({ status, className = '' }: SyncStatusBadgeProps) {
  const { t } = useLanguage();

  if (status === 'SYNCED') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 ${className}`}>
        <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        {t.synced}
      </span>
    );
  }

  if (status === 'PENDING_SYNC') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 ${className}`}>
        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-spin" />
        {t.pendingSync}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 ${className}`}>
      <WifiOff className="w-3 h-3 text-slate-500" />
      {t.offline}
    </span>
  );
}
