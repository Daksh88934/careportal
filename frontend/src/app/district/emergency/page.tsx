'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertOctagon,
  ArrowLeft,
  PhoneCall,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  Radio,
  Building2,
  Activity,
} from 'lucide-react';
import { LanguageSwitcher } from '../../../components/ui/language-switcher';

interface AlertItem {
  id: string;
  workerName: string;
  workerPhone: string;
  subCentre: string;
  location: string;
  patientName: string;
  patientAbha: string;
  vitals: { bp: string; spO2: number; hr: number; temp: number };
  status: 'TRIGGERED' | 'ACKNOWLEDGED' | 'DISPATCHED' | 'RESOLVED';
  timeAgo: string;
  ambulanceUnit?: string;
  eta?: string;
}

export default function DistrictEmergencyCommandPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'em-201',
      workerName: 'ASHA Sunita Sharma',
      workerPhone: '+91 98290 12345',
      subCentre: 'Kalyanpura Sub-Centre (HWC)',
      location: 'Kalyanpura Village Ward 4 (ASHA Center)',
      patientName: 'Sunita Devi (3rd Trimester Obstetric Emergency)',
      patientAbha: '91-4821-3940-1920',
      vitals: { bp: '165/105', spO2: 95, hr: 118, temp: 101.2 },
      status: 'TRIGGERED',
      timeAgo: '4 mins ago',
      ambulanceUnit: '108 Fleet Unit #14',
      eta: '6 mins away',
    },
    {
      id: 'em-202',
      workerName: 'ASHA Meena Kumari',
      workerPhone: '+91 98290 54321',
      subCentre: 'Rampura Sub-Centre',
      location: 'Rampura Main Road',
      patientName: 'Ram Lal (Acute Chest Pain / Suspected STEMI)',
      patientAbha: '91-8841-2910-4491',
      vitals: { bp: '85/55', spO2: 91, hr: 132, temp: 98.6 },
      status: 'DISPATCHED',
      timeAgo: '22 mins ago',
      ambulanceUnit: '108 Fleet Unit #08 (Advanced Life Support)',
      eta: 'Arrived at Site',
    },
  ]);

  const handleUpdateStatus = (id: string, newStatus: AlertItem['status']) => {
    setAlerts(
      alerts.map((a) => (a.id === id ? { ...a, status: newStatus } : a)),
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/district/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to District Health Intelligence</span>
          </Link>
          <LanguageSwitcher />
        </div>

        {/* Command Center Banner */}
        <div className="bg-gradient-to-r from-rose-950 via-red-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-rose-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>State Emergency Response Fleet Dispatch</span>
            </div>
            <h1 className="text-2xl font-black">District Hospital Emergency Command</h1>
            <p className="text-xs text-rose-200">
              Live Priority Alerts Broadcast from Frontline ASHA/ANM Workers in Jaipur Rural
            </p>
          </div>

          <a
            href="tel:108"
            className="px-5 py-3 bg-white text-rose-800 hover:bg-rose-50 font-black text-xs rounded-2xl shadow-lg flex items-center gap-2 self-start sm:self-auto"
          >
            <PhoneCall className="w-4 h-4 text-rose-600" />
            <span>Call 108 Central Dispatch</span>
          </a>
        </div>

        {/* Live Alerts List */}
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-3xl p-6 border shadow-lg space-y-4 transition-all ${
                alert.status === 'TRIGGERED'
                  ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/20 animate-pulse'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Alert Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-slate-900 dark:text-white">
                      {alert.patientName}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                      alert.status === 'TRIGGERED'
                        ? 'bg-rose-600 text-white animate-bounce'
                        : 'bg-amber-500 text-white'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{alert.location} ({alert.subCentre})</span>
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {alert.timeAgo}
                </span>
              </div>

              {/* Vitals Snapshot */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Emergency Vitals at Frontline Trigger
                </span>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border">
                    <span className="text-[10px] text-slate-400 block">BP</span>
                    <span className="font-bold text-rose-600">{alert.vitals.bp}</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border">
                    <span className="text-[10px] text-slate-400 block">SpO2</span>
                    <span className={`font-bold ${alert.vitals.spO2 < 92 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {alert.vitals.spO2}%
                    </span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border">
                    <span className="text-[10px] text-slate-400 block">Heart Rate</span>
                    <span className="font-bold text-slate-900 dark:text-white">{alert.vitals.hr} bpm</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border">
                    <span className="text-[10px] text-slate-400 block">Temp</span>
                    <span className="font-bold text-slate-900 dark:text-white">{alert.vitals.temp}°F</span>
                  </div>
                </div>
              </div>

              {/* Worker Contact & Dispatch Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border">
                <div>
                  <span className="text-slate-400 block text-[10px]">REPORTING WORKER:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {alert.workerName} ({alert.workerPhone})
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">108 DISPATCH FLEET:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {alert.ambulanceUnit} • ETA: {alert.eta}
                  </span>
                </div>

                {/* Status Action Buttons */}
                <div className="flex gap-2">
                  {alert.status === 'TRIGGERED' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(alert.id, 'DISPATCHED')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow"
                    >
                      Acknowledge & Dispatch 108
                    </button>
                  )}
                  {alert.status === 'DISPATCHED' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(alert.id, 'RESOLVED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow"
                    >
                      Mark Admitted & Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
