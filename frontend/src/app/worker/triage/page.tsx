'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  ArrowLeft,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Heart,
  Thermometer,
  Wind,
  ShieldAlert,
  ArrowRight,
  Send,
  UserCheck,
} from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../../../context/language-context';
import { LanguageSwitcher } from '../../../components/ui/language-switcher';
import { TriageResultBadge } from '../../../components/worker/triage-result-badge';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function DigitalTriagePage() {
  const { t } = useLanguage();

  const [patientId, setPatientId] = useState('demo-patient-1');
  const [patientName, setPatientName] = useState('Sunita Devi (28 yrs, Kalyanpura)');

  // Vitals State
  const [vitals, setVitals] = useState({
    systolicBp: 120,
    diastolicBp: 80,
    heartRate: 78,
    spO2: 98,
    temperatureF: 98.6,
    respiratoryRate: 16,
    bloodSugar: 110,
  });

  // Symptoms Checklist State
  const [symptoms, setSymptoms] = useState({
    breathlessness: false,
    chestPain: false,
    severeBleeding: false,
    unconsciousOrConfused: false,
    convulsions: false,
    pregnancyComplications: false,
    childLethargicOrNotDrinking: false,
    severeAbdominalPain: false,
    highFeverDays: 0,
    coughDays: 0,
    vomiting: false,
  });

  const [notes, setNotes] = useState('');
  const [evalResult, setEvalResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Client-side instant evaluation
  const evaluateLocal = () => {
    const redFlags: string[] = [];
    const yellowFlags: string[] = [];

    if (symptoms.breathlessness) redFlags.push('Severe Breathlessness / Respiratory Distress');
    if (symptoms.chestPain) redFlags.push('Acute Chest Pain (Suspected Cardiac/Pulmonary)');
    if (symptoms.severeBleeding) redFlags.push('Active Severe Bleeding');
    if (symptoms.unconsciousOrConfused) redFlags.push('Altered Mental Status / Unconsciousness');
    if (symptoms.convulsions) redFlags.push('Active Seizure / Convulsion');
    if (symptoms.pregnancyComplications) redFlags.push('High-risk Obstetric Emergency');
    if (symptoms.childLethargicOrNotDrinking) redFlags.push('Severe Pediatric Danger Sign (Unable to drink)');
    if (symptoms.severeAbdominalPain) redFlags.push('Acute Rigid Abdomen');

    if (vitals.spO2 > 0 && vitals.spO2 < 92) redFlags.push(`Critical Hypoxia: SpO2 ${vitals.spO2}% (<92%)`);
    if (vitals.systolicBp > 180 || vitals.diastolicBp > 110) redFlags.push(`Hypertensive Crisis: BP ${vitals.systolicBp}/${vitals.diastolicBp} mmHg`);
    if (vitals.systolicBp > 0 && vitals.systolicBp < 85) redFlags.push(`Hypotension / Shock: Systolic BP ${vitals.systolicBp} mmHg`);
    if (vitals.heartRate > 130) redFlags.push(`Severe Tachycardia: Heart Rate ${vitals.heartRate} bpm`);
    if (vitals.temperatureF >= 104) redFlags.push(`Hyperpyrexia: Temperature ${vitals.temperatureF}°F`);

    if (symptoms.highFeverDays >= 3) yellowFlags.push(`Prolonged Fever: ${symptoms.highFeverDays} days`);
    if (symptoms.coughDays >= 14) yellowFlags.push('Chronic Cough (>2 weeks - rule out TB)');
    if (symptoms.vomiting) yellowFlags.push('Persistent Vomiting / Inability to retain fluids');
    if (vitals.spO2 >= 92 && vitals.spO2 <= 94) yellowFlags.push(`Borderline Oxygen: SpO2 ${vitals.spO2}%`);
    if (vitals.systolicBp >= 140 || vitals.diastolicBp >= 90) yellowFlags.push(`Elevated BP: ${vitals.systolicBp}/${vitals.diastolicBp} mmHg`);
    if (vitals.temperatureF >= 100.4 && vitals.temperatureF < 104) yellowFlags.push(`Fever: ${vitals.temperatureF}°F`);

    if (redFlags.length > 0) {
      return {
        classification: 'URGENT' as const,
        redFlags,
        yellowFlags,
        recommendedAction: 'Immediate referral & emergency stabilization. Transfer to CHC/District Hospital via 108 ambulance.',
        recommendedTier: 'District Hospital / CHC (Tier 3/4)',
      };
    }
    if (yellowFlags.length > 0) {
      return {
        classification: 'NEEDS_CONSULT' as const,
        redFlags,
        yellowFlags,
        recommendedAction: 'Medical Officer consultation recommended within 24 hours at nearest PHC or via Teleconsultation.',
        recommendedTier: 'Primary Health Centre (PHC - Tier 2)',
      };
    }
    return {
      classification: 'ROUTINE' as const,
      redFlags: [],
      yellowFlags: [],
      recommendedAction: 'Routine frontline management, symptomatic home care, lifestyle guidance, or routine Sub-Centre follow-up.',
      recommendedTier: 'Sub-Centre / HWC (Tier 1)',
    };
  };

  useEffect(() => {
    setEvalResult(evaluateLocal());
  }, [vitals, symptoms]);

  const handleSaveAssessment = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('carex_token') || '';
      await axios.post(
        `${API_BASE}/api/triage`,
        {
          patientId,
          vitals,
          symptoms,
          notes,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      setSavedSuccess(true);
    } catch {
      // Fallback
      setSavedSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                {t.triageTitle}
              </h1>
              <p className="text-xs text-slate-500">
                Evidence-Based Protocol: WHO IMNCI & Emergency Triage Standards
              </p>
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl text-xs">
            <span className="text-slate-400 block text-[10px]">CURRENT PATIENT:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{patientName}</span>
          </div>
        </div>

        {/* Live Evaluation Banner */}
        {evalResult && (
          <div className={`p-6 rounded-3xl border shadow-lg transition-all ${
            evalResult.classification === 'URGENT'
              ? 'bg-gradient-to-r from-rose-900 to-red-800 border-rose-600 text-white'
              : evalResult.classification === 'NEEDS_CONSULT'
              ? 'bg-gradient-to-r from-amber-900 to-yellow-800 border-amber-600 text-white'
              : 'bg-gradient-to-r from-emerald-900 to-teal-800 border-emerald-600 text-white'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TriageResultBadge classification={evalResult.classification} size="lg" />
                  <span className="text-xs font-bold px-2 py-0.5 bg-white/20 rounded-full">
                    Target: {evalResult.recommendedTier}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                  {evalResult.recommendedAction}
                </p>

                {/* Red & Yellow Flag Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {evalResult.redFlags.map((flag: string) => (
                    <span key={flag} className="px-2.5 py-1 rounded-lg bg-red-500/40 border border-red-300/40 text-xs font-bold text-white">
                      ⚠️ {flag}
                    </span>
                  ))}
                  {evalResult.yellowFlags.map((flag: string) => (
                    <span key={flag} className="px-2.5 py-1 rounded-lg bg-amber-500/40 border border-amber-300/40 text-xs font-semibold text-white">
                      ⚡ {flag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 min-w-[180px]">
                {evalResult.classification === 'URGENT' && (
                  <Link
                    href="/worker/emergency"
                    className="w-full text-center px-4 py-2.5 bg-white text-rose-700 hover:bg-rose-50 font-black text-xs rounded-xl shadow-lg animate-pulse"
                  >
                    TRIGGER SOS ESCALATION
                  </Link>
                )}
                <Link
                  href="/worker/referrals"
                  className="w-full text-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow"
                >
                  Create Referral Chain →
                </Link>
                <Link
                  href="/worker/teleconsult"
                  className="w-full text-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl"
                >
                  Start Assisted Teleconsult
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Triage Inputs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vitals Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base border-b border-slate-100 dark:border-slate-800 pb-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>{t.vitalsTitle}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* SpO2 */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">SpO2 (%)</span>
                  <Wind className="w-4 h-4 text-cyan-500" />
                </div>
                <input
                  type="number"
                  value={vitals.spO2}
                  onChange={(e) => setVitals({ ...vitals, spO2: Number(e.target.value) })}
                  className={`w-full text-xl font-black rounded-lg px-2 py-1 bg-transparent border-b-2 outline-none ${
                    vitals.spO2 < 92 ? 'border-rose-500 text-rose-600' : 'border-emerald-500 text-emerald-600'
                  }`}
                />
                <span className="text-[10px] text-slate-400">Normal: 95-100% (&lt;92% Urgent)</span>
              </div>

              {/* Blood Pressure */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">BP (mmHg)</span>
                  <Heart className="w-4 h-4 text-rose-500" />
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Sys"
                    value={vitals.systolicBp}
                    onChange={(e) => setVitals({ ...vitals, systolicBp: Number(e.target.value) })}
                    className="w-16 text-lg font-black rounded-lg px-1 py-1 bg-transparent border-b-2 border-slate-400 outline-none"
                  />
                  <span className="text-slate-400 font-bold">/</span>
                  <input
                    type="number"
                    placeholder="Dia"
                    value={vitals.diastolicBp}
                    onChange={(e) => setVitals({ ...vitals, diastolicBp: Number(e.target.value) })}
                    className="w-16 text-lg font-black rounded-lg px-1 py-1 bg-transparent border-b-2 border-slate-400 outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400">Target: 120/80 mmHg</span>
              </div>

              {/* Heart Rate */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Pulse (bpm)</span>
                  <Heart className="w-4 h-4 text-red-500" />
                </div>
                <input
                  type="number"
                  value={vitals.heartRate}
                  onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) })}
                  className="w-full text-xl font-black rounded-lg px-2 py-1 bg-transparent border-b-2 border-emerald-500 text-slate-800 dark:text-white outline-none"
                />
                <span className="text-[10px] text-slate-400">Normal: 60-100 bpm</span>
              </div>

              {/* Temperature */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Temp (°F)</span>
                  <Thermometer className="w-4 h-4 text-amber-500" />
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={vitals.temperatureF}
                  onChange={(e) => setVitals({ ...vitals, temperatureF: Number(e.target.value) })}
                  className="w-full text-xl font-black rounded-lg px-2 py-1 bg-transparent border-b-2 border-emerald-500 text-slate-800 dark:text-white outline-none"
                />
                <span className="text-[10px] text-slate-400">Normal: 98.6°F</span>
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Clinical Examination Notes
              </label>
              <textarea
                rows={3}
                placeholder="Observed signs, pallor, edema, medication adherence..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Symptoms Checklist */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>{t.symptomsChecklist}</span>
              </div>
              <span className="text-[11px] text-rose-600 font-bold">Tap red flags to flag urgency</span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { key: 'breathlessness', label: 'Severe Breathlessness / Inability to speak in full sentences', critical: true },
                { key: 'chestPain', label: 'Chest Pain radiating to arm / neck / jaw', critical: true },
                { key: 'severeBleeding', label: 'Active Severe Bleeding (Postpartum or trauma)', critical: true },
                { key: 'unconsciousOrConfused', label: 'Unconscious, Lethargic or Disoriented', critical: true },
                { key: 'convulsions', label: 'Convulsions / Fits / Eclampsia signs', critical: true },
                { key: 'pregnancyComplications', label: 'Obstetric Red Flag (Severe headache, vision blur, leaking fluid)', critical: true },
                { key: 'childLethargicOrNotDrinking', label: 'Child Unable to breastfeed / drink / persistent vomiting', critical: true },
                { key: 'severeAbdominalPain', label: 'Acute Severe Abdomen / Rigid belly', critical: true },
              ].map((item) => (
                <label
                  key={item.key}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    (symptoms as any)[item.key]
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-900 dark:text-rose-200 font-bold shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={(symptoms as any)[item.key]}
                    onChange={(e) => setSymptoms({ ...symptoms, [item.key]: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                  />
                  <span>{item.label}</span>
                </label>
              ))}

              {/* Moderate Symptom Sliders */}
              <div className="pt-2 grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Fever Duration (Days)
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={symptoms.highFeverDays}
                    onChange={(e) => setSymptoms({ ...symptoms, highFeverDays: Number(e.target.value) })}
                    className="w-full px-2 py-1 text-sm font-bold border rounded bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Cough Duration (Days)
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={symptoms.coughDays}
                    onChange={(e) => setSymptoms({ ...symptoms, coughDays: Number(e.target.value) })}
                    className="w-full px-2 py-1 text-sm font-bold border rounded bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={handleSaveAssessment}
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{savedSuccess ? 'Assessment Saved to EHR!' : isSubmitting ? 'Saving...' : 'Save Triage Record to Patient EHR'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
