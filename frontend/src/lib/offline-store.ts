import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface OfflineRegistration {
  localId: string;
  fullName: string;
  age: number;
  gender: string;
  abhaId: string;
  village: string;
  phone: string;
  languagePreference: string;
  facilityId?: string;
  syncStatus: 'SYNCED' | 'PENDING_SYNC';
  createdAt: string;
}

export interface OfflineTriage {
  localId: string;
  patientId: string;
  patientName: string;
  vitals: any;
  symptoms: any;
  classification: string;
  recommendedAction: string;
  syncStatus: 'SYNCED' | 'PENDING_SYNC';
  createdAt: string;
}

export interface OfflineReferral {
  localId: string;
  patientId: string;
  patientName: string;
  fromFacilityId: string;
  toFacilityId: string;
  reason: string;
  urgency: string;
  status: string;
  syncStatus: 'SYNCED' | 'PENDING_SYNC';
  createdAt: string;
}

interface RuralHealthDB extends DBSchema {
  registrations: {
    key: string;
    value: OfflineRegistration;
    indexes: { 'by-sync': string };
  };
  triages: {
    key: string;
    value: OfflineTriage;
    indexes: { 'by-sync': string };
  };
  referrals: {
    key: string;
    value: OfflineReferral;
    indexes: { 'by-sync': string };
  };
}

const DB_NAME = 'rural_healthcare_offline_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<RuralHealthDB>> | null = null;

export function getOfflineDB() {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<RuralHealthDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('registrations')) {
          const regStore = db.createObjectStore('registrations', { keyPath: 'localId' });
          regStore.createIndex('by-sync', 'syncStatus');
        }
        if (!db.objectStoreNames.contains('triages')) {
          const triageStore = db.createObjectStore('triages', { keyPath: 'localId' });
          triageStore.createIndex('by-sync', 'syncStatus');
        }
        if (!db.objectStoreNames.contains('referrals')) {
          const refStore = db.createObjectStore('referrals', { keyPath: 'localId' });
          refStore.createIndex('by-sync', 'syncStatus');
        }
      },
    });
  }
  return dbPromise;
}

// Helper: Save registration locally
export async function saveOfflineRegistration(item: Omit<OfflineRegistration, 'syncStatus' | 'createdAt'>): Promise<OfflineRegistration> {
  const db = await getOfflineDB();
  const record: OfflineRegistration = {
    ...item,
    syncStatus: 'PENDING_SYNC',
    createdAt: new Date().toISOString(),
  };
  if (db) {
    await db.put('registrations', record);
  }
  return record;
}

// Helper: Get all offline registrations
export async function getOfflineRegistrations(): Promise<OfflineRegistration[]> {
  const db = await getOfflineDB();
  if (!db) return [];
  return db.getAll('registrations');
}

// Helper: Get pending registrations
export async function getPendingRegistrations(): Promise<OfflineRegistration[]> {
  const db = await getOfflineDB();
  if (!db) return [];
  return db.getAllFromIndex('registrations', 'by-sync', 'PENDING_SYNC');
}

// Helper: Mark registration as synced
export async function markRegistrationSynced(localId: string, abhaId?: string): Promise<void> {
  const db = await getOfflineDB();
  if (!db) return;
  const item = await db.get('registrations', localId);
  if (item) {
    item.syncStatus = 'SYNCED';
    if (abhaId) item.abhaId = abhaId;
    await db.put('registrations', item);
  }
}

// Helper: Save triage locally
export async function saveOfflineTriage(item: Omit<OfflineTriage, 'syncStatus' | 'createdAt'>): Promise<OfflineTriage> {
  const db = await getOfflineDB();
  const record: OfflineTriage = {
    ...item,
    syncStatus: 'PENDING_SYNC',
    createdAt: new Date().toISOString(),
  };
  if (db) {
    await db.put('triages', record);
  }
  return record;
}

// Helper: Get all offline triages
export async function getOfflineTriages(): Promise<OfflineTriage[]> {
  const db = await getOfflineDB();
  if (!db) return [];
  return db.getAll('triages');
}
