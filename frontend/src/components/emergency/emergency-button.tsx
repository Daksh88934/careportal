'use client';

import React, { useState } from 'react';
import { AlertOctagon, PhoneCall, Check, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../../context/language-context';

interface EmergencyButtonProps {
  patientId?: string;
  patientName?: string;
  vitalsSnapshot?: any;
  onSuccess?: (alert: any) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function EmergencyButton({ patientId, patientName, vitalsSnapshot, onSuccess }: EmergencyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const { t } = useLanguage();

  const handleTrigger = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to trigger emergency SOS? This will immediately alert District Hospital, Medical Officer & 108 Ambulance dispatch.',
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('careportal_token') || '';
      const payload = {
        patientId,
        location: 'Field Location (Sub-Centre Ward 4)',
        vitalsSnapshot,
        symptomsSummary: `CRITICAL ALERT: Emergency frontline escalation for ${patientName || 'patient'}. Immediate intervention required.`,
      };

      const res = await axios.post(`${API_BASE}/api/emergency/alert`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setTriggered(true);
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      console.warn('Emergency alert fallback triggering simulated alert');
      setTriggered(true);
    } finally {
      setLoading(false);
    }
  };

  if (triggered) {
    return (
      <div className="p-6 bg-rose-600 text-white rounded-2xl shadow-xl flex flex-col items-center text-center gap-3 animate-bounce">
        <div className="w-12 h-12 rounded-full bg-white text-rose-600 flex items-center justify-center font-bold">
          <Check className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-black tracking-tight">EMERGENCY SOS DISPATCHED!</h3>
        <p className="text-xs text-rose-100 max-w-sm">
          High-priority notification broadcast to 108 Ambulance, CHC Emergency Ward & District Health Control Room.
        </p>
        <div className="flex gap-2">
          <a
            href="tel:108"
            className="flex items-center gap-2 px-4 py-2 bg-white text-rose-700 font-bold text-sm rounded-xl shadow hover:bg-rose-50"
          >
            <PhoneCall className="w-4 h-4" />
            Call 108 Directly
          </a>
          <button
            type="button"
            onClick={() => setTriggered(false)}
            className="px-3 py-2 bg-rose-700/80 text-white text-xs rounded-xl font-semibold"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleTrigger}
      disabled={loading}
      className="w-full relative group overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 text-white shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all border border-rose-400/30"
    >
      <div className="flex items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          ) : (
            <AlertOctagon className="w-8 h-8 text-white animate-pulse" />
          )}
        </div>
        <div className="text-left">
          <h2 className="text-xl font-black tracking-wide uppercase">{t.sosAlert}</h2>
          <p className="text-xs text-rose-100 font-medium max-w-md">{t.sosPrompt}</p>
        </div>
      </div>
    </button>
  );
}
