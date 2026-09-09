'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  ArrowLeft,
  Users,
  Activity,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  Calendar,
  Stethoscope,
  TrendingUp,
} from 'lucide-react';
import { LanguageSwitcher } from '../../../components/ui/language-switcher';

export default function FacilityDashboardPage() {
  const [stats, setStats] = useState({
    facilityName: 'Bassi Primary Health Centre (PHC - Tier 2)',
    district: 'Jaipur Rural',
    todayConsultations: 38,
    referralCompletionRate: '88%',
    activeIncomingReferrals: 6,
    activeOutgoingReferrals: 2,
    inventoryAlerts: 3,
    followUpCompliance: '92%',
  });

  const incomingReferrals = [
    { id: '1', patient: 'Sunita Devi', from: 'Kalyanpura Sub-Centre', reason: 'Severe Anemia in 3rd Trimester', urgency: 'URGENT', status: 'IN_TRANSIT' },
    { id: '2', patient: 'Ramesh Kumar', from: 'Rampura Sub-Centre', reason: 'Stage 2 Hypertension Follow-up', urgency: 'NEEDS_CONSULT', status: 'REACHED' },
    { id: '3', patient: 'Mohan Lal', from: 'Bassi Sub-Centre', reason: 'Uncontrolled Type 2 Diabetes', urgency: 'ROUTINE', status: 'SEEN' },
  ];

  const stockAlerts = [
    { item: 'Inj Oxytocin 10 IU', current: 4, min: 20, unit: 'ampoules', status: 'CRITICAL LOW' },
    { item: 'Rapid Malaria Kits', current: 8, min: 50, unit: 'kits', status: 'LOW STOCK' },
    { item: 'ECG Machine (12-Lead)', current: 1, min: 1, unit: 'device', status: 'CALIBRATION DUE' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/worker"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Switch to Frontline View</span>
          </Link>
          <LanguageSwitcher />
        </div>

        {/* Facility Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Tier 2 Primary Health Facility</span>
            </div>
            <h1 className="text-2xl font-black">{stats.facilityName}</h1>
            <p className="text-xs text-emerald-200">
              District: {stats.district} • State: Rajasthan • NHM Facility Code: RJ-JPR-PHC-042
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/facility/inventory"
              className="px-4 py-2.5 bg-white text-emerald-900 font-bold text-xs rounded-xl shadow hover:bg-emerald-50"
            >
              Manage Medicine Stock
            </Link>
            <Link
              href="/doctor/teleconsult-queue"
              className="px-4 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow hover:bg-emerald-700"
            >
              Teleconsult Queue
            </Link>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Today's Consultations</span>
            <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white">{stats.todayConsultations}</p>
            <span className="text-[11px] text-emerald-600 font-semibold">+12% vs last week</span>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Referral Completion Rate</span>
            <p className="text-2xl font-black mt-2 text-emerald-600">{stats.referralCompletionRate}</p>
            <span className="text-[11px] text-slate-400">Target: &gt;80%</span>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Stock & Diagnostic Alerts</span>
            <p className="text-2xl font-black mt-2 text-rose-600">{stats.inventoryAlerts}</p>
            <span className="text-[11px] text-rose-500 font-semibold">Immediate re-order needed</span>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Follow-Up Compliance</span>
            <p className="text-2xl font-black mt-2 text-blue-600">{stats.followUpCompliance}</p>
            <span className="text-[11px] text-blue-500 font-semibold">High-risk ANC & TB</span>
          </div>
        </div>

        {/* 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Incoming Referrals Queue */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-amber-500" />
                <span>Incoming Referrals from Sub-Centres</span>
              </h3>
              <Link href="/worker/referrals" className="text-xs font-bold text-emerald-600">
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {incomingReferrals.map((r) => (
                <div key={r.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{r.patient}</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      r.urgency === 'URGENT' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.urgency}
                    </span>
                  </div>
                  <div className="text-slate-500">Origin: {r.from}</div>
                  <div className="text-slate-700 dark:text-slate-300 font-medium">{r.reason}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Medicine & Equipment Stock Alerts */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-rose-600" />
                <span>Critical Stock & Diagnostic Alerts</span>
              </h3>
              <Link href="/facility/inventory" className="text-xs font-bold text-emerald-600">
                Update Stock →
              </Link>
            </div>

            <div className="space-y-3">
              {stockAlerts.map((item, i) => (
                <div key={i} className="p-3.5 bg-rose-50/40 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{item.item}</span>
                    <span className="px-2 py-0.5 bg-rose-600 text-white font-black text-[10px] rounded">
                      {item.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 pt-1">
                    <span>Current Stock: <strong>{item.current} {item.unit}</strong></span>
                    <span>Min Buffer: {item.min} {item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
