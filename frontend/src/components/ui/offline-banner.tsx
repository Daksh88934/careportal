'use client';

import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { useOfflineSync } from '../../hooks/use-offline-sync';
import { useLanguage } from '../../context/language-context';

export function OfflineBanner() {
  const { isOnline, isSyncing, pendingCount, syncNow } = useOfflineSync();
  const { t } = useLanguage();

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <div
      className={`w-full px-4 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
        !isOnline
          ? 'bg-amber-500/90 text-white'
          : pendingCount > 0
          ? 'bg-emerald-600/90 text-white'
          : 'bg-slate-700 text-white'
      }`}
    >
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span>{t.offline} — Registrations are stored securely in local browser storage.</span>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4 text-emerald-200" />
            <span>{pendingCount} offline records ready to sync to state server.</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isOnline && pendingCount > 0 && (
          <button
            type="button"
            onClick={syncNow}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white text-emerald-800 rounded-md shadow hover:bg-emerald-50 transition-all text-xs font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        )}
      </div>
    </div>
  );
}
