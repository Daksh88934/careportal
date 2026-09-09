'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  ArrowLeft,
  Activity,
  Users,
  AlertOctagon,
  TrendingUp,
  ShieldCheck,
  MapPin,
  ArrowUpRight,
  PieChart,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { LanguageSwitcher } from '../../../components/ui/language-switcher';

const diseaseTrendData = [
  { month: 'Jan', ancRegistrations: 120, hypertensionCases: 340, tbUnderTreatment: 45, acuteReferrals: 28 },
  { month: 'Feb', ancRegistrations: 145, hypertensionCases: 360, tbUnderTreatment: 48, acuteReferrals: 32 },
  { month: 'Mar', ancRegistrations: 160, hypertensionCases: 390, tbUnderTreatment: 42, acuteReferrals: 24 },
  { month: 'Apr', ancRegistrations: 190, hypertensionCases: 410, tbUnderTreatment: 39, acuteReferrals: 19 },
  { month: 'May', ancRegistrations: 210, hypertensionCases: 425, tbUnderTreatment: 37, acuteReferrals: 22 },
  { month: 'Jun', ancRegistrations: 240, hypertensionCases: 450, tbUnderTreatment: 35, acuteReferrals: 18 },
];

const facilityTierData = [
  { tier: 'Sub-Centres (HWC)', count: 48, consultations: 1240, activeWorkers: 54 },
  { tier: 'Primary Health Centres (PHC)', count: 12, consultations: 3420, activeWorkers: 24 },
  { tier: 'Community Health Centres (CHC)', count: 4, consultations: 2150, activeWorkers: 16 },
  { tier: 'District Hospital (DH)', count: 1, consultations: 4800, activeWorkers: 85 },
];

export default function DistrictIntelligenceDashboard() {
  const [district, setDistrict] = useState('Jaipur Rural');

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
            <span>Switch to Frontline Dashboard</span>
          </Link>
          <LanguageSwitcher />
        </div>

        {/* District Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-indigo-900/50">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>District Health Command Center • Rajasthan</span>
            </div>
            <h1 className="text-2xl font-black">{district} Health Intelligence</h1>
            <p className="text-xs text-indigo-200">
              Aggregated 4-Tier Public Health Surveillance, Disease Burden & Frontline Adherence
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/district/emergency"
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 animate-pulse"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>District SOS Command (1 Active)</span>
            </Link>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Total Facilities</span>
            <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white">65</p>
            <span className="text-[11px] text-indigo-600 font-semibold">Across 4 Public Tiers</span>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Registered Citizens</span>
            <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white">11,610</p>
            <span className="text-[11px] text-emerald-600 font-semibold">ABHA Mapped: 94%</span>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Referral Success Rate</span>
            <p className="text-2xl font-black mt-2 text-emerald-600">86.4%</p>
            <span className="text-[11px] text-emerald-600 font-semibold">Avg transit: 42 mins</span>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Frontline Workers Active</span>
            <p className="text-2xl font-black mt-2 text-blue-600">179</p>
            <span className="text-[11px] text-blue-500 font-semibold">ASHA & ANM sync active</span>
          </div>
        </div>

        {/* Trend Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Disease Trends Line Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Maternal & Chronic Surveillance Trends
                </h3>
                <p className="text-xs text-slate-500">Monthly progression across district health facilities</p>
              </div>
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>

            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={diseaseTrendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ancRegistrations" stroke="#10b981" name="ANC Registrations" strokeWidth={2} />
                  <Line type="monotone" dataKey="hypertensionCases" stroke="#6366f1" name="Hypertension Screened" strokeWidth={2} />
                  <Line type="monotone" dataKey="acuteReferrals" stroke="#ef4444" name="Acute Referrals" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Facility Tier Breakdown Bar Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Patient Inflow by Facility Tier
                </h3>
                <p className="text-xs text-slate-500">Strengthening primary gatekeeping at Sub-Centres & PHCs</p>
              </div>
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={facilityTierData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="tier" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="consultations" fill="#10b981" name="Monthly Consultations" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="count" fill="#6366f1" name="Facility Count" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
