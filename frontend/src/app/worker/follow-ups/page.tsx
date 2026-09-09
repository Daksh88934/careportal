'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Baby,
  HeartPulse,
  Pill,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../../context/language-context';
import { LanguageSwitcher } from '../../../components/ui/language-switcher';

interface FollowUpTask {
  id: string;
  patientName: string;
  patientAbha: string;
  village: string;
  category: 'ANC' | 'IMMUNIZATION' | 'TB_DOTS' | 'CHRONIC';
  title: string;
  dueDate: string;
  isOverdue: boolean;
  isCompleted: boolean;
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  notes?: string;
}

export default function FollowUpsPage() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [tasks, setTasks] = useState<FollowUpTask[]>([
    {
      id: 'task-1',
      patientName: 'Sunita Devi',
      patientAbha: '91-4821-3940-1920',
      village: 'Kalyanpura',
      category: 'ANC',
      title: 'ANC 2nd Checkup (14-26 Weeks) - Anomaly Scan & TT1 Injection',
      dueDate: 'Yesterday (Sep 9, 2026)',
      isOverdue: true,
      isCompleted: false,
      priority: 'CRITICAL',
      notes: 'High risk due to previous history of anemia (Hb 6.8). Check BP & fetal heart.',
    },
    {
      id: 'task-2',
      patientName: 'Aarav Sharma (Child)',
      patientAbha: '91-3310-9921-5582',
      village: 'Kalyanpura',
      category: 'IMMUNIZATION',
      title: '14 Weeks: Pentavalent-3 + OPV-3 + Rotavirus-3 + fIPV-2 + PCV-2',
      dueDate: 'Today (Sep 10, 2026)',
      isOverdue: false,
      isCompleted: false,
      priority: 'HIGH',
      notes: 'Third primary dose series completion before 6 months window.',
    },
    {
      id: 'task-3',
      patientName: 'Gopal Meena',
      patientAbha: '91-7712-4401-8823',
      village: 'Bassi',
      category: 'TB_DOTS',
      title: 'TB DOTS Week 4: Month 1 Sputum Smear & Adherence Check',
      dueDate: 'In 2 days (Sep 12, 2026)',
      isOverdue: false,
      isCompleted: false,
      priority: 'CRITICAL',
      notes: 'Ensure uninterrupted 4-FDC intake. Record patient body weight.',
    },
    {
      id: 'task-4',
      patientName: 'Ramesh Kumar',
      patientAbha: '91-8841-2910-4491',
      village: 'Rampura',
      category: 'CHRONIC',
      title: 'Monthly NCD Check: BP Screening & Fasting Glucose',
      dueDate: 'Sep 15, 2026',
      isOverdue: false,
      isCompleted: false,
      priority: 'NORMAL',
      notes: 'Target BP < 140/90. Refill Amlodipine 5mg strip at Sub-Centre.',
    },
  ]);

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    patientName: '',
    category: 'ANC' as const,
  });

  const handleMarkComplete = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, isCompleted: true, isOverdue: false } : t)),
    );
  };

  const handleGeneratePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const newTasks: FollowUpTask[] = [
      {
        id: `auto-${Date.now()}-1`,
        patientName: newPlan.patientName || 'New ANC Patient',
        patientAbha: '91-5510-4419-8821',
        village: 'Kalyanpura',
        category: newPlan.category,
        title: `${newPlan.category} Standard Schedule - Visit 1 Checkup`,
        dueDate: 'Sep 17, 2026',
        isOverdue: false,
        isCompleted: false,
        priority: 'HIGH',
        notes: 'Auto-generated national clinical guideline schedule.',
      },
    ];
    setTasks([...newTasks, ...tasks]);
    setShowPlanModal(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedCategory === 'ALL') return true;
    return t.category === selectedCategory;
  });

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
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/20">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                {t.followUps} Engine
              </h1>
              <p className="text-xs text-slate-500">
                Automated Clinical Scheduling for High-Risk ANC, UIP Immunization, TB DOTS & NCD Care
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPlanModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auto-Generate Schedule</span>
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'All Tasks', icon: ClipboardList },
            { id: 'ANC', label: t.ancCare, icon: HeartPulse },
            { id: 'IMMUNIZATION', label: t.immunization, icon: Baby },
            { id: 'TB_DOTS', label: t.tbDots, icon: Pill },
            { id: 'CHRONIC', label: t.chronicNcd, icon: Calendar },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Plan Generation Modal */}
        {showPlanModal && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-500 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Auto-Generate National Protocol Schedule
              </h3>
              <button
                type="button"
                onClick={() => setShowPlanModal(false)}
                className="text-xs font-bold text-slate-400"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleGeneratePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Pooja Sharma (Pregnancy Week 8)"
                  value={newPlan.patientName}
                  onChange={(e) => setNewPlan({ ...newPlan, patientName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Clinical Protocol Program</label>
                <select
                  value={newPlan.category}
                  onChange={(e) => setNewPlan({ ...newPlan, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800"
                >
                  <option value="ANC">Antenatal Care (4 Standard Trimester Checkups + USG + TT)</option>
                  <option value="IMMUNIZATION">Universal Immunization Programme (Birth to 24 Months)</option>
                  <option value="TB_DOTS">National TB Elimination Program (Weekly & Sputum Checks)</option>
                  <option value="CHRONIC">National NCD Program (Monthly BP & Glucose Adherence)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow"
              >
                Generate & Append Follow-Up Timeline
              </button>
            </form>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-5 rounded-2xl border transition-all ${
                task.isCompleted
                  ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                  : task.isOverdue
                  ? 'bg-rose-50/50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-800 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      {task.patientName}
                    </span>
                    <span className="text-xs text-slate-500">({task.village})</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold">
                      {task.patientAbha}
                    </span>
                    {task.isOverdue && (
                      <span className="px-2 py-0.5 bg-rose-600 text-white font-extrabold text-[10px] rounded-full animate-pulse">
                        ⚠️ {t.overdue}
                      </span>
                    )}
                    {task.isCompleted && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                        ✓ Completed
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {task.title}
                  </h4>
                  <p className="text-xs text-slate-500">{task.notes}</p>
                </div>

                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Due: {task.dueDate}
                  </span>

                  {!task.isCompleted && (
                    <button
                      type="button"
                      onClick={() => handleMarkComplete(task.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.markDone}</span>
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
