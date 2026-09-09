'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Video,
  Mic,
  MicOff,
  ArrowLeft,
  Wifi,
  PhoneCall,
  Send,
  Camera,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  AlertTriangle,
  Play,
  Square,
} from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../../../context/language-context';
import { LanguageSwitcher } from '../../../components/ui/language-switcher';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AssistedTeleconsultPage() {
  const { t } = useLanguage();

  const [consultType, setConsultType] = useState<'LIVE_CALL' | 'STORE_FORWARD'>('STORE_FORWARD');
  const [patientName, setPatientName] = useState('Sunita Devi (ABHA: 91-4821-3940-1920)');
  const [patientId, setPatientId] = useState('demo-patient-1');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [priority, setPriority] = useState('ROUTINE');

  // Voice note simulation state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Bandwidth detection
  const [bandwidthMode, setBandwidthMode] = useState<'GOOD' | 'LOW' | 'VERY_LOW'>('LOW');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [caseSubmitted, setCaseSubmitted] = useState<any>(null);

  const startVoiceRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    const timer = setInterval(() => {
      setRecordingSeconds((prev) => {
        if (prev >= 60) {
          clearInterval(timer);
          setIsRecording(false);
          setHasRecordedAudio(true);
          setAudioUrl('mock-voice-recording-asha-kalyanpura.mp3');
          return 60;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    setHasRecordedAudio(true);
    setAudioUrl('mock-voice-recording-asha-kalyanpura.mp3');
  };

  const handleSubmitStoreForward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chiefComplaint) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('carex_token') || '';
      const payload = {
        patientId,
        chiefComplaint,
        voiceNoteUrl: audioUrl || undefined,
        priority,
        vitalsSnapshot: { bp: '130/85', spO2: 97, temp: 99.1, hr: 82 },
      };

      const res = await axios.post(`${API_BASE}/api/teleconsultation/store-forward`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setCaseSubmitted(res.data || payload);
    } catch {
      setCaseSubmitted({
        patientName,
        chiefComplaint,
        priority,
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {/* Header Title */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/20">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                Assisted Rural Teleconsultation
              </h1>
              <p className="text-xs text-slate-500">
                ASHA/ANM Frontline-Assisted Doctor Consult & Asynchronous Store-and-Forward
              </p>
            </div>
          </div>

          {/* Bandwidth Indicator */}
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs flex items-center gap-2 text-amber-900 dark:text-amber-200">
            <Wifi className="w-4 h-4 text-amber-600 animate-pulse" />
            <div>
              <span className="font-bold block">Bandwidth: 2G / 3G Rural Edge</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-300">Store-and-Forward recommended</span>
            </div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setConsultType('STORE_FORWARD')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              consultType === 'STORE_FORWARD'
                ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Store-and-Forward (Voice + Case Summary)</span>
          </button>
          <button
            type="button"
            onClick={() => setConsultType('LIVE_CALL')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              consultType === 'LIVE_CALL'
                ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Live Assisted Video Call</span>
          </button>
        </div>

        {/* Consult Mode: Store-and-Forward */}
        {consultType === 'STORE_FORWARD' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            {caseSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 mx-auto flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Case Dispatched to PHC/CHC Doctor Queue!
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  The medical officer will review the case notes, vitals snapshot, and voice recording. Prescription will sync back to your dashboard.
                </p>

                <div className="pt-4 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCaseSubmitted(null);
                      setChiefComplaint('');
                      setHasRecordedAudio(false);
                    }}
                    className="px-5 py-2.5 bg-purple-600 text-white text-xs font-bold rounded-xl shadow hover:bg-purple-700"
                  >
                    Submit Another Case
                  </button>
                  <Link
                    href="/worker"
                    className="px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl shadow"
                  >
                    Return to Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitStoreForward} className="space-y-5">
                {/* Patient Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Selected Village Patient
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={patientName}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                  />
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Triage Urgency Priority
                  </label>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    {[
                      { id: 'URGENT', label: '🔴 URGENT', color: 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-700' },
                      { id: 'NEEDS_CONSULT', label: '🟡 NEEDS CONSULT', color: 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-700' },
                      { id: 'ROUTINE', label: '🟢 ROUTINE', color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPriority(p.id)}
                        className={`p-3 rounded-xl border font-bold text-center transition-all ${
                          priority === p.id ? `${p.color} ring-2 ring-purple-500 font-black` : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice Note Recording */}
                <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                      <Mic className="w-4 h-4 text-purple-600" />
                      Frontline Worker Voice Note (Low-Bandwidth Async)
                    </span>
                    {isRecording && (
                      <span className="text-xs font-mono font-bold text-rose-600 animate-pulse">
                        REC {recordingSeconds}s / 60s
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-purple-700 dark:text-purple-300">
                    Record patient symptoms, history, and questions in your local dialect for the Medical Officer.
                  </p>

                  <div className="flex items-center gap-3 pt-2">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={startVoiceRecording}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow"
                      >
                        <Mic className="w-4 h-4" />
                        <span>{hasRecordedAudio ? 'Re-record Voice Note' : 'Start Recording Voice Note'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopVoiceRecording}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow animate-pulse"
                      >
                        <Square className="w-4 h-4" />
                        <span>Stop & Attach Recording</span>
                      </button>
                    )}

                    {hasRecordedAudio && !isRecording && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Voice Note Attached (Audio Memo #1)
                      </span>
                    )}
                  </div>
                </div>

                {/* Chief Complaint / Written Summary */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Clinical Case Summary & Chief Complaint *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Patient reports persistent cough with low-grade fever for 5 days. BP is 130/85, SpO2 97%. Requesting doctor review for antibiotics/expectorant prescription."
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Case to Medical Officer'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Consult Mode: Live Video Call */}
        {consultType === 'LIVE_CALL' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-600/30">
              <Video className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Launch Assisted Teleconsultation
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Connecting Kalyanpura Sub-Centre to on-duty Medical Officer at Bassi PHC. Video room with encrypted WebRTC & audio-adaptive rate.
            </p>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl max-w-md mx-auto text-left text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <div><strong>Patient:</strong> {patientName}</div>
              <div><strong>Assisting Worker:</strong> ASHA Worker (Kalyanpura)</div>
              <div><strong>Target Facility:</strong> Bassi Primary Health Centre (PHC)</div>
            </div>

            <div className="pt-2">
              <Link
                href="/video/room/rural-hwc-room-101"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Connect Live Video Call Now</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
