'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Wifi,
  WifiOff,
  ShieldCheck,
  AlertCircle,
  QrCode,
} from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../../../context/language-context';
import { useOfflineSync } from '../../../hooks/use-offline-sync';
import { saveOfflineRegistration } from '../../../lib/offline-store';
import { LanguageSwitcher } from '../../../components/ui/language-switcher';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function PatientRegistrationPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isOnline, refreshPending } = useOfflineSync();

  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: 'FEMALE',
    abhaId: '',
    village: 'Kalyanpura',
    phone: '',
    languagePreference: 'hi',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateAbha = () => {
    const randomDigits = () => Math.floor(1000 + Math.random() * 9000);
    const abha = `91-${randomDigits()}-${randomDigits()}-${randomDigits()}`;
    setFormData((prev) => ({ ...prev, abhaId: abha }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.fullName || !formData.age || !formData.phone) {
      setError('Please fill in all required fields (Name, Age, Phone).');
      return;
    }

    setIsSubmitting(true);
    const localId = `local_reg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const payload = {
      ...formData,
      age: Number(formData.age),
      abhaId: formData.abhaId || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      localId,
    };

    try {
      if (isOnline) {
        // Direct Server Registration
        const token = localStorage.getItem('careportal_token') || '';
        const res = await axios.post(`${API_BASE}/api/patient-registration`, payload, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setSuccessData({ ...res.data, mode: 'ONLINE_SYNCED' });
      } else {
        // Offline IndexedDB Storage
        await saveOfflineRegistration(payload);
        await refreshPending();
        setSuccessData({ ...payload, mode: 'OFFLINE_SAVED' });
      }
    } catch (err: any) {
      console.warn('Network call failed, falling back to local IndexedDB store:', err);
      await saveOfflineRegistration(payload);
      await refreshPending();
      setSuccessData({ ...payload, mode: 'OFFLINE_SAVED' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
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

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white">
                  {t.registerPatient}
                </h1>
                <p className="text-xs text-slate-500">
                  ASHA / ANM Frontline Household Registration
                </p>
              </div>
            </div>

            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              isOnline
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'Online Sync Active' : 'Offline Mode'}</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successData ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Patient Successfully Registered!
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {successData.mode === 'ONLINE_SYNCED'
                  ? 'Record is saved to the central Ayushman Bharat / State health registry.'
                  : 'Record is stored securely in IndexedDB and will auto-sync when network connectivity returns.'}
              </p>

              {/* Patient Card Preview */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-left max-w-md mx-auto space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{successData.fullName}</span>
                  <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono rounded font-bold">
                    ABHA: {successData.abhaId}
                  </span>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>Age/Gender: {successData.age} yrs • {successData.gender}</div>
                  <div>Village: {successData.village} • Phone: {successData.phone}</div>
                  <div className="font-semibold text-emerald-600">Status: {successData.mode}</div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setSuccessData(null);
                    setFormData({
                      fullName: '',
                      age: '',
                      gender: 'FEMALE',
                      abhaId: '',
                      village: 'Kalyanpura',
                      phone: '',
                      languagePreference: 'hi',
                    });
                  }}
                  className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow hover:bg-emerald-700"
                >
                  Register Another Patient
                </button>
                <Link
                  href="/worker/triage"
                  className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow hover:bg-blue-700"
                >
                  Proceed to Triage Assessment →
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.fullName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sunita Devi / Ramesh Kumar"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.age} *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="120"
                    placeholder="e.g., 28"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.gender}
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="FEMALE">{t.female}</option>
                    <option value="MALE">{t.male}</option>
                    <option value="OTHER">{t.other}</option>
                  </select>
                </div>
              </div>

              {/* ABHA ID */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.abhaId}
                  </label>
                  <button
                    type="button"
                    onClick={generateAbha}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t.autoGenerate}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="91-XXXX-XXXX-XXXX (Leave blank to auto-generate)"
                    value={formData.abhaId}
                    onChange={(e) => setFormData({ ...formData, abhaId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <QrCode className="absolute right-3 top-2.5 w-5 h-5 text-slate-400" />
                </div>
              </div>

              {/* Village & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.village} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Kalyanpura / Bassi / Rampura"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.phoneNumber} *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g., 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Language Preference */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.preferredLanguage}
                </label>
                <select
                  value={formData.languagePreference}
                  onChange={(e) => setFormData({ ...formData, languagePreference: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="en">English</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="gu">ગુજરાતી (Gujarati)</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registering...' : t.submitRegistration}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
