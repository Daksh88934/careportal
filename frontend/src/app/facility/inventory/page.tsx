'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ArrowLeft,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  Activity,
  Check,
  X,
} from 'lucide-react';
import { LanguageSwitcher } from '../../../components/ui/language-switcher';

interface InventoryItem {
  id: string;
  name: string;
  type: 'MEDICINE' | 'DIAGNOSTIC_EQUIPMENT';
  stock: number;
  minStock: number;
  unit: string;
  isOperational: boolean;
  lastUpdated: string;
}

export default function FacilityInventoryPage() {
  const [selectedFacility, setSelectedFacility] = useState('Bassi Community Health Centre (CHC - Tier 3)');

  const [items, setItems] = useState<InventoryItem[]>([
    { id: '1', name: 'Paracetamol 500mg', type: 'MEDICINE', stock: 420, minStock: 100, unit: 'strips', isOperational: true, lastUpdated: 'Today' },
    { id: '2', name: 'Amoxicillin 500mg', type: 'MEDICINE', stock: 180, minStock: 50, unit: 'strips', isOperational: true, lastUpdated: 'Today' },
    { id: '3', name: 'Inj Oxytocin 10 IU', type: 'MEDICINE', stock: 45, minStock: 20, unit: 'ampoules', isOperational: true, lastUpdated: 'Yesterday' },
    { id: '4', name: 'Inj Magnesium Sulfate 50%', type: 'MEDICINE', stock: 28, minStock: 15, unit: 'vials', isOperational: true, lastUpdated: 'Yesterday' },
    { id: '5', name: 'Iron Folic Acid (IFA Red)', type: 'MEDICINE', stock: 800, minStock: 200, unit: 'tablets', isOperational: true, lastUpdated: 'Today' },
    { id: '6', name: 'Rapid Malaria Antigen Kits', type: 'MEDICINE', stock: 65, minStock: 30, unit: 'kits', isOperational: true, lastUpdated: 'Today' },
    { id: '7', name: 'Ultrasound Scanner (USG 2D/Doppler)', type: 'DIAGNOSTIC_EQUIPMENT', stock: 1, minStock: 1, unit: 'unit', isOperational: true, lastUpdated: 'Sep 8, 2026' },
    { id: '8', name: 'Blood Storage Unit (Refrigerator + Backup)', type: 'DIAGNOSTIC_EQUIPMENT', stock: 1, minStock: 1, unit: 'unit', isOperational: true, lastUpdated: 'Sep 9, 2026' },
    { id: '9', name: 'Digital 12-Lead ECG Machine', type: 'DIAGNOSTIC_EQUIPMENT', stock: 2, minStock: 1, unit: 'devices', isOperational: true, lastUpdated: 'Today' },
    { id: '10', name: 'X-Ray Machine (300mA)', type: 'DIAGNOSTIC_EQUIPMENT', stock: 1, minStock: 1, unit: 'unit', isOperational: false, lastUpdated: 'Maintenance Required' },
  ]);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'MEDICINE' | 'DIAGNOSTIC_EQUIPMENT'>('ALL');

  // Pre-referral verification check
  const [checkQuery, setCheckQuery] = useState('');
  const [checkResult, setCheckResult] = useState<any>(null);

  const handleCheck = () => {
    if (!checkQuery) return;
    const match = items.find((i) => i.name.toLowerCase().includes(checkQuery.toLowerCase()));
    if (!match) {
      setCheckResult({ found: false, message: `Item "${checkQuery}" is NOT carried at ${selectedFacility}.` });
    } else if (match.type === 'MEDICINE' && match.stock <= 0) {
      setCheckResult({ found: true, available: false, message: `OUT OF STOCK: ${match.name} currently has 0 ${match.unit}.` });
    } else if (match.type === 'DIAGNOSTIC_EQUIPMENT' && !match.isOperational) {
      setCheckResult({ found: true, available: false, message: `NON-OPERATIONAL: ${match.name} is currently out of service.` });
    } else {
      setCheckResult({ found: true, available: true, message: `AVAILABLE: ${match.name} is functional with ${match.stock} ${match.unit} in stock.` });
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/facility/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Facility Dashboard</span>
          </Link>
          <LanguageSwitcher />
        </div>

        {/* Header Title */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-lg shadow-cyan-600/20">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                Medicine Stock & Diagnostic Equipment Tracker
              </h1>
              <p className="text-xs text-slate-500">
                Live Facility Inventory & Pre-Referral Service Availability Verification
              </p>
            </div>
          </div>

          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="px-3 py-2 rounded-xl border text-xs font-bold bg-slate-50 dark:bg-slate-800"
          >
            <option value="Kalyanpura Sub-Centre (HWC - Tier 1)">Kalyanpura Sub-Centre (HWC - Tier 1)</option>
            <option value="Bassi Primary Health Centre (PHC - Tier 2)">Bassi Primary Health Centre (PHC - Tier 2)</option>
            <option value="Bassi Community Health Centre (CHC - Tier 3)">Bassi Community Health Centre (CHC - Tier 3)</option>
            <option value="Jaipur District Hospital (DH - Tier 4)">Jaipur District Hospital (DH - Tier 4)</option>
          </select>
        </div>

        {/* Pre-Referral Availability Check Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 rounded-3xl text-white shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold">Pre-Referral Readiness Check</h3>
          </div>
          <p className="text-xs text-blue-200 max-w-2xl">
            Before referring a patient, verify whether {selectedFacility} has the required diagnostic equipment (e.g. Ultrasound, Blood Bank) or essential medicines in stock to prevent unnecessary transit.
          </p>

          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="e.g., Ultrasound / Blood / Oxytocin / X-Ray"
              value={checkQuery}
              onChange={(e) => setCheckQuery(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl text-xs text-slate-900 outline-none"
            />
            <button
              type="button"
              onClick={handleCheck}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs rounded-xl"
            >
              Verify Availability
            </button>
          </div>

          {checkResult && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              checkResult.available
                ? 'bg-emerald-500/30 border border-emerald-400 text-emerald-200'
                : 'bg-rose-500/30 border border-rose-400 text-rose-200'
            }`}>
              {checkResult.available ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-rose-400" />}
              <span>{checkResult.message}</span>
            </div>
          )}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex gap-2">
            {(['ALL', 'MEDICINE', 'DIAGNOSTIC_EQUIPMENT'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterType === type
                    ? 'bg-cyan-600 text-white shadow'
                    : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300'
                }`}
              >
                {type === 'ALL' ? 'All Items' : type === 'MEDICINE' ? 'Essential Medicines' : 'Diagnostic Equipment'}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search stock..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 pl-9 rounded-xl border text-xs bg-white dark:bg-slate-900"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-4">Item Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Current Stock</th>
                  <th className="p-4">Buffer Status</th>
                  <th className="p-4">Operational Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map((item) => {
                  const isLow = item.type === 'MEDICINE' && item.stock <= item.minStock;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{item.name}</td>
                      <td className="p-4 text-slate-500">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-[10px]">
                          {item.type}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                        {item.stock} {item.unit}
                      </td>
                      <td className="p-4">
                        {isLow ? (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold text-[10px] rounded">
                            LOW STOCK (Min: {item.minStock})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">
                            Sufficient (Min: {item.minStock})
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {item.isOperational ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Operational</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Non-Functional / Offline</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
