'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  Stethoscope,
  Video,
  ArrowUpRight,
  ClipboardList,
  AlertTriangle,
  Building2,
  Calendar,
  Activity,
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/language-context';
import { useOfflineSync } from '../../hooks/use-offline-sync';
import { OfflineBanner } from '../../components/ui/offline-banner';
import { LanguageSwitcher } from '../../components/ui/language-switcher';
import { SyncStatusBadge } from '../../components/worker/sync-status-badge';
import { EmergencyButton } from '../../components/emergency/emergency-button';

export default function WorkerDashboardPage() {
  const { t, language } = useLanguage();
  const { isOnline, pendingCount } = useOfflineSync();
  const [stats, setStats] = useState({
    todayTriaged: 14,
    registeredPatients: 142,
    pendingFollowUps: 6,
    activeReferrals: 3,
  });

  const quickActions = [
    {
      title: t.registerPatient,
      description: 'Offline-first ABHA registration & village mapping',
      href: '/worker/register',
      icon: UserPlus,
      color: 'from-emerald-500 to-teal-600',
      badge: isOnline ? 'Online Sync' : 'Offline Ready',
    },
    {
      title: t.digitalTriage,
      description: 'Vitals & symptom rule engine → Immediate tier guidance',
      href: '/worker/triage',
      icon: Stethoscope,
      color: 'from-blue-600 to-indigo-600',
      badge: 'IMNCI / Red Flags',
    },
    {
      title: t.teleconsult,
      description: 'Store-and-forward voice notes & assisted video consult',
      href: '/worker/teleconsult',
      icon: Video,
      color: 'from-purple-600 to-violet-600',
      badge: 'Low Bandwidth',
    },
    {
      title: t.referralTracking,
      description: 'Sub-Centre → PHC → CHC → DH tracking with stale alerts',
      href: '/worker/referrals',
      icon: ArrowUpRight,
      color: 'from-amber-500 to-orange-600',
      badge: '4-Tier Pipeline',
    },
    {
      title: t.followUps,
      description: 'ANC, Immunization calendar, TB DOTS & NCD schedule',
      href: '/worker/follow-ups',
      icon: ClipboardList,
      color: 'from-rose-500 to-pink-600',
      badge: `${stats.pendingFollowUps} Due Today`,
    },
    {
      title: 'Facility Inventory Check',
      description: 'Verify medicine stock & diagnostic readiness before referral',
      href: '/facility/inventory',
      icon: Building2,
      color: 'from-cyan-600 to-blue-700',
      badge: 'Real-time Stock',
    },
  ];

  const recentPatients = [
    { id: '1', name: 'Sunita Devi', age: 28, village: 'Kalyanpura', abha: '91-4821-3940-1920', status: 'ANC Trimester 2', tier: 'PHC Referral' },
    { id: '2', name: 'Ramesh Kumar', age: 52, village: 'Rampura', abha: '91-8841-2910-4491', status: 'Hypertension Stage 2', tier: 'Sub-Centre Follow-up' },
    { id: '3', name: 'Aarav Sharma (Child)', age: 2, village: 'Kalyanpura', abha: '91-3310-9921-5582', status: 'Pentavalent-3 Due', tier: 'Immunization' },
    { id: '4', name: 'Gopal Meena', age: 41, village: 'Bassi', abha: '91-7712-4401-8823', status: 'TB DOTS Week 4', tier: 'Sputum Check' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <OfflineBanner />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Care Portal</h1>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full">
                  SIH 2025
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t.ashaWorker} • Kalyanpura Sub-Centre (HWC)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SyncStatusBadge status={!isOnline ? 'OFFLINE' : pendingCount > 0 ? 'PENDING_SYNC' : 'SYNCED'} />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hierarchy Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>National Health Mission • Tiered Public Health Support</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{t.appName}</h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {t.appTagline}
            </p>

            {/* Visual 4-Tier Ribbon */}
            <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
                <span className="text-[10px] text-emerald-300 font-bold block">TIER 1</span>
                <span className="font-bold">Sub-Centre / HWC</span>
                <span className="text-[10px] text-slate-300 block">ASHA / ANM Frontline</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
                <span className="text-[10px] text-emerald-300 font-bold block">TIER 2</span>
                <span className="font-bold">PHC</span>
                <span className="text-[10px] text-slate-300 block">Medical Officer Care</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
                <span className="text-[10px] text-emerald-300 font-bold block">TIER 3</span>
                <span className="font-bold">CHC</span>
                <span className="text-[10px] text-slate-300 block">Specialists & Surgery</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/10">
                <span className="text-[10px] text-emerald-300 font-bold block">TIER 4</span>
                <span className="font-bold">District Hospital</span>
                <span className="text-[10px] text-slate-300 block">Multispecialty & ICU</span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency SOS Button */}
        <EmergencyButton />

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Patients Registered</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white">{stats.registeredPatients}</p>
            <span className="text-[11px] text-emerald-600 font-medium">Mapped to Kalyanpura</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Triaged Today</span>
              <Stethoscope className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white">{stats.todayTriaged}</p>
            <span className="text-[11px] text-blue-600 font-medium">2 Urgent Referrals</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Follow-Ups Due</span>
              <Clock className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-black mt-2 text-rose-600">{stats.pendingFollowUps}</p>
            <span className="text-[11px] text-rose-500 font-medium">3 ANC, 2 Immunization</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Active Referrals</span>
              <ArrowUpRight className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white">{stats.activeReferrals}</p>
            <span className="text-[11px] text-amber-600 font-medium">1 In-Transit to CHC</span>
          </div>
        </div>

        {/* Quick Action Tiles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Frontline Clinical Workflow Tools</h3>
            <span className="text-xs text-slate-500">Tap to start action</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group block bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                      {action.badge}
                    </span>
                  </div>
                  <h4 className="text-base font-bold mt-4 text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {action.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                    <span>Open Module</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Patients List & Direct EHR Links */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Village Patients & Longitudinal EHR</h3>
              <p className="text-xs text-slate-500">Tap patient to view longitudinal history across facility tiers</p>
            </div>
            <Link
              href="/worker/register"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-700"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Register New</span>
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl transition-colors">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{patient.name}</span>
                    <span className="text-xs text-slate-500">({patient.age} yrs)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-300">
                      ABHA: {patient.abha}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>Village: {patient.village}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold">{patient.status}</span>
                    <span>•</span>
                    <span className="text-slate-600 dark:text-slate-400">{patient.tier}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/worker/ehr/${patient.id}`}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    View EHR Timeline
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
