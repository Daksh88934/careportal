'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertOctagon,
  ArrowLeft,
  PhoneCall,
  ShieldAlert,
  Radio,
  Clock,
  CheckCircle2,
  Building2,
  Truck,
  MapPin,
  Flame,
} from 'lucide-react';
import { useLanguage } from '../../../context/language-context';
import { LanguageSwitcher } from '../../../components/ui/language-switcher';
import { EmergencyButton } from '../../../components/emergency/emergency-button';

export default function WorkerEmergencyPage() {
  const { t } = useLanguage();

  const [recentDispatches, setRecentDispatches] = useState([
    {
      id: 'em-101',
      patient: 'Sunita Devi (3rd Trimester Obstetric Emergency)',
      location: 'Kalyanpura Ward 4 (ASHA Center)',
      triggeredAt: '20 minutes ago',
      status: 'DISPATCHED',
      ambulanceUnit: '108-RJ-14-9921',
      eta: '8 mins to Sub-Centre',
      destination: 'Bassi Community Health Centre (CHC)',
    },
    {
      id: 'em-100',
      patient: 'Ram Lal (Acute Chest Pain & Dyspnea)',
      location: 'Rampura Village',
      triggeredAt: '3 hours ago',
      status: 'RESOLVED',
      ambulanceUnit: '108-RJ-14-1102',
      eta: 'Reached Jaipur District Hospital',
      destination: 'Jaipur District Hospital (ICU Ward)',
    },
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/worker"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Frontline Dashboard</span>
          </Link>
          <LanguageSwitcher />
        </div>

        {/* Emergency SOS Header */}
        <div className="bg-gradient-to-r from-rose-900 via-red-900 to-rose-950 p-6 rounded-3xl border border-rose-700 text-white shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-rose-700 flex items-center justify-center font-bold shadow-lg">
              <AlertOctagon className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wide uppercase">
                {t.emergencySOS} Control Center
              </h1>
              <p className="text-xs text-rose-200">
                Direct Frontline Priority Escalation to State 108 Ambulance Fleet & CHC/District Hospital
              </p>
            </div>
          </div>
        </div>

        {/* Big One-Tap SOS Button */}
        <EmergencyButton
          patientName="Emergency Field Patient"
          vitalsSnapshot={{
            location: 'Kalyanpura Sub-Centre',
            emergencyType: 'Acute Clinical Escalation',
          }}
          onSuccess={(alert) => {
            setRecentDispatches([
              {
                id: alert.id || `em-${Date.now().toString().slice(-3)}`,
                patient: 'Emergency Patient (Live Trigger)',
                location: 'Kalyanpura Sub-Centre',
                triggeredAt: 'Just now',
                status: 'DISPATCHED',
                ambulanceUnit: '108 Dispatch Unit Assigned',
                eta: 'En Route',
                destination: 'Bassi CHC / Jaipur DH',
              },
              ...recentDispatches,
            ]);
          }}
        />

        {/* Direct Toll-Free Helplines */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <a
            href="tel:108"
            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-rose-500 transition-all flex flex-col items-center text-center gap-1.5"
          >
            <PhoneCall className="w-6 h-6 text-rose-600" />
            <span className="text-sm font-black text-slate-900 dark:text-white">Dial 108</span>
            <span className="text-[10px] text-slate-500 font-semibold">Emergency Ambulance</span>
          </a>

          <a
            href="tel:104"
            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-blue-500 transition-all flex flex-col items-center text-center gap-1.5"
          >
            <PhoneCall className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-black text-slate-900 dark:text-white">Dial 104</span>
            <span className="text-[10px] text-slate-500 font-semibold">Medical Helpline</span>
          </a>

          <a
            href="tel:102"
            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-purple-500 transition-all flex flex-col items-center text-center gap-1.5 col-span-2 sm:col-span-1"
          >
            <PhoneCall className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-black text-slate-900 dark:text-white">Dial 102</span>
            <span className="text-[10px] text-slate-500 font-semibold">Janani Shishu (Maternal)</span>
          </a>
        </div>

        {/* Live Emergency Dispatch Feeds */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>Live Emergency Escalation Logs</span>
            </h3>
            <span className="text-xs text-slate-500">Auto-refreshing</span>
          </div>

          <div className="space-y-3">
            {recentDispatches.map((dispatch) => (
              <div
                key={dispatch.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {dispatch.patient}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {dispatch.location}
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    dispatch.status === 'DISPATCHED'
                      ? 'bg-rose-100 text-rose-800 animate-pulse'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {dispatch.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">AMBULANCE FLEET:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{dispatch.ambulanceUnit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">DESTINATION:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{dispatch.destination}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
