'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowLeft,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  PhoneCall,
  Send,
} from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../../../context/language-context';
import { LanguageSwitcher } from '../../../components/ui/language-switcher';
import { ReferralStatusTracker, ReferralStatus } from '../../../components/referrals/referral-status-tracker';
import { TriageResultBadge } from '../../../components/worker/triage-result-badge';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ReferralItem {
  id: string;
  patientName: string;
  patientAbha: string;
  fromFacility: string;
  toFacility: string;
  tier: string;
  reason: string;
  urgency: 'URGENT' | 'NEEDS_CONSULT' | 'ROUTINE';
  status: ReferralStatus;
  isStale: boolean;
  initiatedAt: string;
  outcome?: string;
}

export default function ReferralTrackingPage() {
  const { t } = useLanguage();

  const [referrals, setReferrals] = useState<ReferralItem[]>([
    {
      id: 'ref-101',
      patientName: 'Sunita Devi',
      patientAbha: '91-4821-3940-1920',
      fromFacility: 'Kalyanpura Sub-Centre (HWC)',
      toFacility: 'Bassi Community Health Centre (CHC)',
      tier: 'Sub-Centre → CHC',
      reason: 'Severe Anemia (Hb 6.8 g/dL) in 3rd Trimester pregnancy requiring parenteral iron/blood transfusion.',
      urgency: 'URGENT',
      status: 'IN_TRANSIT',
      isStale: false,
      initiatedAt: '2 hours ago',
    },
    {
      id: 'ref-102',
      patientName: 'Gopal Meena',
      patientAbha: '91-7712-4401-8823',
      fromFacility: 'Kalyanpura Sub-Centre (HWC)',
      toFacility: 'Jaipur District Hospital',
      tier: 'Sub-Centre → DH',
      reason: 'Suspected Drug-Resistant TB evaluation + Chest X-ray and GeneXpert confirmation.',
      urgency: 'NEEDS_CONSULT',
      status: 'REFERRED',
      isStale: true,
      initiatedAt: '52 hours ago',
    },
    {
      id: 'ref-103',
      patientName: 'Kailash Chand',
      patientAbha: '91-2291-8832-1109',
      fromFacility: 'Bassi PHC',
      toFacility: 'Jaipur District Hospital',
      tier: 'PHC → DH',
      reason: 'Diabetic Foot Ulcer with deep tissue involvement and cellulitis.',
      urgency: 'URGENT',
      status: 'OUTCOME_RECORDED',
      isStale: false,
      initiatedAt: '3 days ago',
      outcome: 'Admitted to Surgical Ward 4. Debridement completed and IV antibiotics started.',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReferral, setNewReferral] = useState({
    patientName: '',
    patientAbha: '',
    toFacility: 'Bassi Community Health Centre (CHC)',
    reason: '',
    urgency: 'NEEDS_CONSULT' as const,
  });

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    const item: ReferralItem = {
      id: `ref-${Date.now().toString().slice(-4)}`,
      patientName: newReferral.patientName || 'New Patient',
      patientAbha: newReferral.patientAbha || '91-4401-2910-5591',
      fromFacility: 'Kalyanpura Sub-Centre (HWC)',
      toFacility: newReferral.toFacility,
      tier: 'Sub-Centre → CHC',
      reason: newReferral.reason,
      urgency: newReferral.urgency,
      status: 'REFERRED',
      isStale: false,
      initiatedAt: 'Just now',
    };
    setReferrals([item, ...referrals]);
    setShowCreateModal(false);
    setNewReferral({
      patientName: '',
      patientAbha: '',
      toFacility: 'Bassi Community Health Centre (CHC)',
      reason: '',
      urgency: 'NEEDS_CONSULT',
    });
  };

  const handleUpdateStatus = (id: string, newStatus: ReferralStatus) => {
    setReferrals(
      referrals.map((r) =>
        r.id === id ? { ...r, status: newStatus, isStale: false } : r,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
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

        {/* Header Title */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                {t.referralTracking}
              </h1>
              <p className="text-xs text-slate-500">
                Closed-Loop Tracking across Sub-Centre → PHC → CHC → District Hospital
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Initiate New Referral</span>
          </button>
        </div>

        {/* Create Referral Modal */}
        {showCreateModal && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-emerald-500 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Initiate Patient Referral to Higher Facility Tier
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Sunita Devi"
                    value={newReferral.patientName}
                    onChange={(e) => setNewReferral({ ...newReferral, patientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">ABHA Health ID</label>
                  <input
                    type="text"
                    placeholder="91-XXXX-XXXX-XXXX"
                    value={newReferral.patientAbha}
                    onChange={(e) => setNewReferral({ ...newReferral, patientAbha: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Destination Facility Tier</label>
                  <select
                    value={newReferral.toFacility}
                    onChange={(e) => setNewReferral({ ...newReferral, toFacility: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800"
                  >
                    <option value="Bassi Primary Health Centre (PHC - Tier 2)">Bassi Primary Health Centre (PHC - Tier 2)</option>
                    <option value="Bassi Community Health Centre (CHC - Tier 3)">Bassi Community Health Centre (CHC - Tier 3)</option>
                    <option value="Jaipur District Hospital (DH - Tier 4)">Jaipur District Hospital (DH - Tier 4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Triage Urgency</label>
                  <select
                    value={newReferral.urgency}
                    onChange={(e) => setNewReferral({ ...newReferral, urgency: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800"
                  >
                    <option value="URGENT">🔴 URGENT (Immediate ambulance/stabilization)</option>
                    <option value="NEEDS_CONSULT">🟡 NEEDS CONSULT (Within 24 hours)</option>
                    <option value="ROUTINE">🟢 ROUTINE (Scheduled outpatient visit)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Clinical Reason & Summary *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe reason for referral, vitals observed, and preliminary interventions given..."
                  value={newReferral.reason}
                  onChange={(e) => setNewReferral({ ...newReferral, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow"
              >
                Confirm & Dispatch Referral Notice
              </button>
            </form>
          </div>
        )}

        {/* Referrals List */}
        <div className="space-y-4">
          {referrals.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm space-y-4 transition-all ${
                item.isStale
                  ? 'border-rose-300 dark:border-rose-900 bg-rose-50/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-slate-900 dark:text-white">{item.patientName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-bold">
                      ABHA: {item.patientAbha}
                    </span>
                    <TriageResultBadge classification={item.urgency} size="sm" />
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{item.fromFacility}</span>
                    <span className="text-emerald-600 font-bold">→</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.toFacility}</span>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-slate-400">Initiated: {item.initiatedAt}</span>
              </div>

              {/* Reason */}
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <strong>Clinical Reason:</strong> {item.reason}
              </p>

              {/* Progress Pipeline */}
              <ReferralStatusTracker currentStatus={item.status} isStale={item.isStale} />

              {/* Outcome if recorded */}
              {item.outcome && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200">
                  <strong className="block mb-0.5">Hospital Outcome Recorded:</strong>
                  <span>{item.outcome}</span>
                </div>
              )}

              {/* Quick Status Update Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">Update Referral Status:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(item.id, 'IN_TRANSIT')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Mark In-Transit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(item.id, 'REACHED')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Mark Reached
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(item.id, 'SEEN')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Mark Seen by Doctor
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(item.id, 'OUTCOME_RECORDED')}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                  >
                    Close & Record Outcome
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
