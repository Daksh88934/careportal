'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  getPendingRegistrations,
  markRegistrationSynced,
  getOfflineRegistrations,
} from '../lib/offline-store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const checkPending = useCallback(async () => {
    try {
      const pending = await getPendingRegistrations();
      setPendingCount(pending.length);
    } catch {
      // Ignored in SSR
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    try {
      const pending = await getPendingRegistrations();
      if (pending.length > 0) {
        const token = localStorage.getItem('careportal_token') || '';
        const payload = {
          items: pending.map((p) => ({
            fullName: p.fullName,
            age: p.age,
            gender: p.gender,
            abhaId: p.abhaId,
            village: p.village,
            phone: p.phone,
            languagePreference: p.languagePreference,
            localId: p.localId,
          })),
        };

        const res = await axios.post(`${API_BASE}/api/patient-registration/bulk-sync`, payload, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.data?.items) {
          for (const item of res.data.items) {
            if (item.status === 'SUCCESS' && item.localId) {
              await markRegistrationSynced(item.localId, item.abhaId);
            }
          }
        }
      }
      setLastSyncedAt(new Date());
      await checkPending();
    } catch (err) {
      console.warn('Auto-sync encounter error, will retry on next cycle:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, checkPending]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkPending();
    const interval = setInterval(() => {
      if (navigator.onLine) {
        syncNow();
      }
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [syncNow, checkPending]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncedAt,
    syncNow,
    refreshPending: checkPending,
  };
}
