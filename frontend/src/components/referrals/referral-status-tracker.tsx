'use client';

import React from 'react';
import { Send, Truck, Building2, Stethoscope, CheckCircle2, Clock } from 'lucide-react';

export type ReferralStatus = 'REFERRED' | 'IN_TRANSIT' | 'REACHED' | 'SEEN' | 'OUTCOME_RECORDED';

interface ReferralStatusTrackerProps {
  currentStatus: ReferralStatus;
  isStale?: boolean;
}

const steps: Array<{ status: ReferralStatus; label: string; icon: any }> = [
  { status: 'REFERRED', label: 'Initiated', icon: Send },
  { status: 'IN_TRANSIT', label: 'In Transit', icon: Truck },
  { status: 'REACHED', label: 'Reached Facility', icon: Building2 },
  { status: 'SEEN', label: 'Doctor Seen', icon: Stethoscope },
  { status: 'OUTCOME_RECORDED', label: 'Closed / Outcome', icon: CheckCircle2 },
];

export function ReferralStatusTracker({ currentStatus, isStale }: ReferralStatusTrackerProps) {
  const currentIndex = steps.findIndex((s) => s.status === currentStatus);

  return (
    <div className="w-full py-4">
      {isStale && (
        <div className="mb-3 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-1.5 animate-pulse">
          <Clock className="w-4 h-4 text-rose-600" />
          <span>STALE REFERRAL ALERT: Inactive for &gt;48 hours at {currentStatus}. Frontline escalation suggested.</span>
        </div>
      )}

      <div className="relative flex items-center justify-between">
        {/* Progress Bar background */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-slate-200 dark:bg-slate-700 -z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-500 -z-0"
          style={{ width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isPassed = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.status} className="flex flex-col items-center gap-1.5 z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950 scale-110 shadow-md font-bold'
                    : isPassed
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[11px] font-semibold text-center max-w-[70px] ${
                  isCurrent
                    ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                    : isPassed
                    ? 'text-slate-700 dark:text-slate-200'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
