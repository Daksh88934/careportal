'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  ArrowLeft,
  Video,
  Mic,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Send,
  User,
  Building2,
  FileText,
} from 'lucide-react';
import { TriageResultBadge } from '../../../components/worker/triage-result-badge';
import { LanguageSwitcher } from '../../../components/ui/language-switcher';

interface CaseItem {
  id: string;
  patientName: string;
  patientAbha: string;
  age: number;
  gender: string;
  workerName: string;
  subCentre: string;
  priority: 'URGENT' | 'NEEDS_CONSULT' | 'ROUTINE';
  chiefComplaint: string;
  vitals: { bp: string; spO2: number; hr: number; temp: number };
  hasVoiceNote: boolean;
  timeAgo: string;
  isResolved: boolean;
  doctorResponse?: string;
}

export default function DoctorTeleconsultQueuePage() {
  const [cases, setCases] = useState<CaseItem[]>([
    {
      id: 'case-1',
      patientName: 'Sunita Devi',
      patientAbha: '91-4821-3940-1920',
      age: 28,
      gender: 'FEMALE',
      workerName: 'ASHA Sunita Sharma',
      subCentre: 'Kalyanpura Sub-Centre (HWC)',
      priority: 'URGENT',
      chiefComplaint: 'Patient in 32nd week of pregnancy presents with pallor, extreme fatigue, Hb test at Sub-Centre shows 6.8 g/dL. Requesting urgent specialist review.',
      vitals: { bp: '118/76', spO2: 97, hr: 88, temp: 98.4 },
      hasVoiceNote: true,
      timeAgo: '15 mins ago',
      isResolved: false,
    },
    {
      id: 'case-2',
      patientName: 'Ramesh Kumar',
      patientAbha: '91-8841-2910-4491',
      age: 52,
      gender: 'MALE',
      workerName: 'ASHA Meena Kumari',
      subCentre: 'Rampura Sub-Centre',
      priority: 'NEEDS_CONSULT',
      chiefComplaint: 'Known hypertensive presenting with BP 155/98 mmHg. Compliance with Amlodipine is irregular due to stockout.',
      vitals: { bp: '155/98', spO2: 98, hr: 76, temp: 98.6 },
      hasVoiceNote: true,
      timeAgo: '45 mins ago',
      isResolved: false,
    },
    {
      id: 'case-3',
      patientName: 'Aarav Sharma (Child)',
      patientAbha: '91-3310-9921-5582',
      age: 2,
      gender: 'MALE',
      workerName: 'ASHA Sunita Sharma',
      subCentre: 'Kalyanpura Sub-Centre (HWC)',
      priority: 'ROUTINE',
      chiefComplaint: 'Routine 14-week immunization review. Child is active and feeding well.',
      vitals: { bp: '95/60', spO2: 99, hr: 110, temp: 98.2 },
      hasVoiceNote: false,
      timeAgo: '2 hours ago',
      isResolved: true,
      doctorResponse: 'Administer Pentavalent-3, OPV-3, Rotavirus-3. Paracetamol syrup 2.5ml SOS for post-vaccine fever.',
    },
  ]);

  const [selectedCase, setSelectedCase] = useState<CaseItem>(cases[0]);
  const [responseText, setResponseText] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText) return;

    setCases(
      cases.map((c) =>
        c.id === selectedCase.id
          ? { ...c, isResolved: true, doctorResponse: responseText }
          : c,
      ),
    );
    setSelectedCase({
      ...selectedCase,
      isResolved: true,
      doctorResponse: responseText,
    });
    setResponseText('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/doctor"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Doctor Dashboard</span>
          </Link>
          <LanguageSwitcher />
        </div>

        {/* Header Title */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                Medical Officer Teleconsultation Queue
              </h1>
              <p className="text-xs text-slate-500">
                Sorted by Triage Urgency: Review Store-and-Forward Cases & Dispatch Prescriptions
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full">
              1 Urgent Case
            </span>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
              1 Needs Consult
            </span>
          </div>
        </div>

        {/* Grid: Cases List & Selected Case Review */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Cases Queue */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Patient Queue</h3>

            <div className="space-y-3">
              {cases.map((c) => {
                const isSelected = selectedCase.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCase(c)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white block">
                          {c.patientName}
                        </span>
                        <span className="text-xs text-slate-500">{c.subCentre}</span>
                      </div>
                      <TriageResultBadge classification={c.priority} size="sm" />
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                      {c.chiefComplaint}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                      <span>{c.workerName}</span>
                      <span>{c.timeAgo}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Case Details & Response Workbench */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedCase.patientName}
                  </h2>
                  <span className="text-xs text-slate-500 font-semibold">
                    ({selectedCase.age} yrs, {selectedCase.gender})
                  </span>
                </div>
                <span className="text-xs font-mono text-emerald-600 font-bold">
                  ABHA: {selectedCase.patientAbha}
                </span>
              </div>
              <TriageResultBadge classification={selectedCase.priority} size="md" />
            </div>

            {/* Vitals Snapshot */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Field Vitals Recorded by ASHA
              </span>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                  <span className="text-[10px] text-slate-400 block">BP</span>
                  <span className="font-bold text-xs">{selectedCase.vitals.bp}</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                  <span className="text-[10px] text-slate-400 block">SpO2</span>
                  <span className="font-bold text-xs">{selectedCase.vitals.spO2}%</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                  <span className="text-[10px] text-slate-400 block">Pulse</span>
                  <span className="font-bold text-xs">{selectedCase.vitals.hr} bpm</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                  <span className="text-[10px] text-slate-400 block">Temp</span>
                  <span className="font-bold text-xs">{selectedCase.vitals.temp}°F</span>
                </div>
              </div>
            </div>

            {/* Case Complaint */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border space-y-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Clinical Case Summary & Symptoms
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedCase.chiefComplaint}
              </p>
            </div>

            {/* Voice Recording Player if present */}
            {selectedCase.hasVoiceNote && (
              <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-900 dark:text-purple-200">
                  <Mic className="w-4 h-4 text-purple-600" />
                  <span>Frontline Worker Voice Memo Attached (0:42)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isPlayingAudio ? 'Playing...' : 'Play Audio Memo'}</span>
                </button>
              </div>
            )}

            {/* Existing Doctor Response if resolved */}
            {selectedCase.doctorResponse && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1 text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Your Asynchronous Clinical Response & Prescription:
                </span>
                <p className="text-emerald-950 dark:text-emerald-100">{selectedCase.doctorResponse}</p>
              </div>
            )}

            {/* Doctor Response Form */}
            <form onSubmit={handleSendResponse} className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Write Doctor Prescription & Clinical Guidance
              </label>
              <textarea
                required
                rows={4}
                placeholder="Prescribe medicines, dosage, dietary guidance, or direct frontline worker to initiate immediate referral to CHC..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Asynchronous Prescription to ASHA</span>
                </button>
                <Link
                  href="/video/room/rural-hwc-room-101"
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <Video className="w-4 h-4" />
                  <span>Escalate to Live Video Call</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
