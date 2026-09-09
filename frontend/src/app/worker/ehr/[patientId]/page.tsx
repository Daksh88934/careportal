'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FileText,
  ArrowLeft,
  Building2,
  Calendar,
  Activity,
  Pill,
  ShieldCheck,
  ShieldAlert,
  Clock,
  User,
  CheckCircle2,
  Lock,
  Eye,
} from 'lucide-react';
import { useLanguage } from '../../../../context/language-context';
import { LanguageSwitcher } from '../../../../components/ui/language-switcher';

export default function LongitudinalEhrPage() {
  const params = useParams();
  const patientId = params.patientId as string;
  const { t } = useLanguage();

  const [hasConsent, setHasConsent] = useState(true);
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Mock Longitudinal Record Data spanning tiers
  const patient = {
    name: 'Sunita Devi',
    age: 28,
    gender: 'FEMALE',
    village: 'Kalyanpura, Block Bassi',
    phone: '9876543210',
    abhaId: '91-4821-3940-1920',
    bloodGroup: 'B Positive',
    conditions: [
      { code: 'ANC-TRI-3', name: '3rd Trimester Pregnancy (Week 32)', severity: 'High Risk', onset: 'Jan 2026' },
      { code: 'D50.9', name: 'Microcytic Iron Deficiency Anemia (Hb 6.8 g/dL)', severity: 'Severe', onset: 'Aug 2026' },
    ],
    encounters: [
      {
        id: 'enc-1',
        facility: 'Bassi Community Health Centre (CHC - Tier 3)',
        provider: 'Dr. Neha Verma (Gynecologist / Specialist)',
        date: 'Sep 9, 2026',
        tier: 'CHC (Tier 3)',
        chiefComplaint: 'Referred from Kalyanpura Sub-Centre for Severe Anemia in 3rd Trimester.',
        diagnosis: 'Severe Gestational Anemia with Fetal Growth Monitoring',
        observations: [
          { name: 'Hemoglobin (Hb)', value: '6.8', unit: 'g/dL (Low - Critical)' },
          { name: 'Blood Pressure', value: '118/76', unit: 'mmHg' },
          { name: 'Fetal Heart Rate', value: '144', unit: 'bpm (Normal)' },
          { name: 'Obstetric USG', value: 'Single live intrauterine fetus, cephalic, adequate liquor', unit: '' },
        ],
        medications: [
          { name: 'Inj Ferric Carboxymaltose 500mg', dosage: '1 dose IV in 100ml NS', duration: 'Day 1' },
          { name: 'Iron Folic Acid (IFA Red Tablet)', dosage: '1 tab daily after meals', duration: '90 days' },
          { name: 'Calcium + Vit D3', dosage: '500mg twice daily', duration: '90 days' },
        ],
      },
      {
        id: 'enc-2',
        facility: 'Bassi Primary Health Centre (PHC - Tier 2)',
        provider: 'Dr. R. K. Meena (Medical Officer)',
        date: 'Aug 14, 2026',
        tier: 'PHC (Tier 2)',
        chiefComplaint: 'General weakness, dizziness, and mild shortness of breath on exertion.',
        diagnosis: 'Moderate Anemia (Hb 8.2 g/dL)',
        observations: [
          { name: 'Hemoglobin (Hb)', value: '8.2', unit: 'g/dL' },
          { name: 'SpO2', value: '98', unit: '%' },
          { name: 'Blood Sugar (Random)', value: '96', unit: 'mg/dL' },
        ],
        medications: [
          { name: 'Iron Folic Acid Tablets (IFA)', dosage: '2 tablets daily', duration: '30 days' },
        ],
      },
      {
        id: 'enc-3',
        facility: 'Kalyanpura Sub-Centre / HWC (Tier 1)',
        provider: 'ASHA Worker & ANM Sunita Sharma',
        date: 'Jun 10, 2026',
        tier: 'Sub-Centre (Tier 1)',
        chiefComplaint: 'ANC 1st Registration & Routine Screening.',
        diagnosis: 'Normal 1st Trimester Pregnancy Registration',
        observations: [
          { name: 'Weight', value: '52', unit: 'kg' },
          { name: 'Blood Pressure', value: '110/70', unit: 'mmHg' },
          { name: 'Urine Albumin/Sugar', value: 'Nil / Negative', unit: '' },
        ],
        medications: [
          { name: 'Folic Acid 5mg', dosage: '1 tab daily', duration: '30 days' },
          { name: 'TT 1st Injection', dosage: '0.5ml IM', duration: 'Administered' },
        ],
      },
    ],
    auditLogs: [
      { accessor: 'Dr. Neha Verma (Gynecologist)', facility: 'Bassi CHC', purpose: 'Emergency Specialist Referral Care', time: 'Sep 9, 2026, 11:20 AM' },
      { accessor: 'Dr. R. K. Meena (Medical Officer)', facility: 'Bassi PHC', purpose: 'Routine ANC Outpatient Review', time: 'Aug 14, 2026, 10:15 AM' },
      { accessor: 'ANM Sunita Sharma', facility: 'Kalyanpura Sub-Centre', purpose: 'Frontline Registration & Vitals Upload', time: 'Jun 10, 2026, 09:30 AM' },
    ],
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

        {/* Patient Master Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-600/20">
                <User className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900 dark:text-white">{patient.name}</h1>
                  <span className="text-xs text-slate-500 font-semibold">({patient.age} yrs, {patient.gender})</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1 text-xs">
                  <span className="font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 rounded font-bold">
                    ABHA: {patient.abhaId}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-600 dark:text-slate-300">
                    Village: {patient.village}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-600 dark:text-slate-300">
                    Blood Group: {patient.bloodGroup}
                  </span>
                </div>
              </div>
            </div>

            {/* Consent Gate Controller */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Cross-Tier Access Consent:</span>
                <button
                  type="button"
                  onClick={() => setHasConsent(!hasConsent)}
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                    hasConsent
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {hasConsent ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{hasConsent ? 'Consent Granted' : 'Consent Revoked'}</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditModal(true)}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Privacy Access Audit Trail</span>
              </button>
            </div>
          </div>

          {/* Active Diagnoses / Conditions */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Active Diagnoses & Conditions
            </span>
            <div className="flex flex-wrap gap-2">
              {patient.conditions.map((c) => (
                <div
                  key={c.code}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-2"
                >
                  <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                  <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 font-bold text-[10px] rounded">
                    {c.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy Audit Trail Modal */}
        {showAuditModal && (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>FHIR Patient Consent & Cross-Tier Access Audit Trail</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="text-xs font-bold text-slate-400"
              >
                ✕ Close
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {patient.auditLogs.map((log, i) => (
                <div key={i} className="py-2.5 flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{log.accessor}</span>
                    <span className="text-slate-500">{log.facility} • {log.purpose}</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Longitudinal Encounter Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Longitudinal Clinical Timeline (4-Tier Public Health Continuum)
            </h3>
            <span className="text-xs text-slate-500">Chronological Encounters</span>
          </div>

          <div className="space-y-4">
            {patient.encounters.map((enc) => (
              <div
                key={enc.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
              >
                {/* Encounter Top Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-slate-900 dark:text-white">
                        {enc.facility}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-[10px] rounded-md">
                        {enc.tier}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">Provider: {enc.provider}</span>
                  </div>

                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {enc.date}
                  </span>
                </div>

                {/* Complaint & Diagnosis */}
                <div className="space-y-1 text-xs">
                  <div><strong>Chief Complaint:</strong> {enc.chiefComplaint}</div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    <strong>Diagnosis:</strong> {enc.diagnosis}
                  </div>
                </div>

                {/* Observations / Lab Vitals */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">
                    Clinical Observations & Lab Findings
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {enc.observations.map((obs, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                        <span className="text-slate-500 block text-[10px]">{obs.name}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{obs.value}</span>{' '}
                        <span className="text-[10px] text-slate-400">{obs.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medications */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">
                    Prescribed Medication & Therapy
                  </span>
                  <div className="space-y-1.5">
                    {enc.medications.map((med, i) => (
                      <div key={i} className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-slate-900 dark:text-white">{med.name}</span>
                        </div>
                        <span className="text-slate-500">{med.dosage} • {med.duration}</span>
                      </div>
                    ))}
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
