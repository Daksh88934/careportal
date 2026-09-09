import { TriageClassification } from '@prisma/client';

export interface VitalsInput {
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  respiratoryRate?: number;
  spO2?: number;
  temperatureF?: number;
  bloodSugar?: number;
}

export interface SymptomsInput {
  breathlessness?: boolean;
  chestPain?: boolean;
  severeBleeding?: boolean;
  unconsciousOrConfused?: boolean;
  convulsions?: boolean;
  highFeverDays?: number;
  vomiting?: boolean;
  severeAbdominalPain?: boolean;
  coughDays?: number;
  pregnancyComplications?: boolean;
  childLethargicOrNotDrinking?: boolean;
  otherSymptoms?: string[];
}

export interface TriageResult {
  classification: TriageClassification;
  urgencyScore: number; // 1 (Routine) - 10 (Critical)
  redFlags: string[];
  yellowFlags: string[];
  recommendedAction: string;
  recommendedFacilityTier: 'SUB_CENTRE' | 'PHC' | 'CHC' | 'DISTRICT_HOSPITAL';
}

export function evaluateTriage(vitals: VitalsInput, symptoms: SymptomsInput): TriageResult {
  const redFlags: string[] = [];
  const yellowFlags: string[] = [];

  // 1. Critical Red Flag Symptoms
  if (symptoms.breathlessness) redFlags.push('Acute Severe Breathlessness');
  if (symptoms.chestPain) redFlags.push('Acute Chest Pain (Suspected Cardiac/Pulmonary)');
  if (symptoms.severeBleeding) redFlags.push('Active Severe Bleeding');
  if (symptoms.unconsciousOrConfused) redFlags.push('Altered Mental Status / Unconsciousness');
  if (symptoms.convulsions) redFlags.push('Active or Recent Seizure / Convulsion');
  if (symptoms.pregnancyComplications) redFlags.push('High-risk Obstetric Emergency');
  if (symptoms.childLethargicOrNotDrinking) redFlags.push('Severe Pediatric Danger Sign: Unable to drink/breastfeed');
  if (symptoms.severeAbdominalPain) redFlags.push('Acute Severe Abdomen');

  // 2. Critical Vitals Red Flags
  if (vitals.spO2 !== undefined && vitals.spO2 > 0 && vitals.spO2 < 92) {
    redFlags.push(`Critical Hypoxia: SpO2 ${vitals.spO2}% (<92%)`);
  }
  if (vitals.systolicBp !== undefined && vitals.systolicBp > 0) {
    if (vitals.systolicBp > 180 || (vitals.diastolicBp && vitals.diastolicBp > 110)) {
      redFlags.push(`Hypertensive Crisis: BP ${vitals.systolicBp}/${vitals.diastolicBp} mmHg`);
    } else if (vitals.systolicBp < 85) {
      redFlags.push(`Hypotension / Shock: Systolic BP ${vitals.systolicBp} mmHg (<85)`);
    }
  }
  if (vitals.heartRate !== undefined && vitals.heartRate > 0) {
    if (vitals.heartRate > 130) redFlags.push(`Severe Tachycardia: Heart Rate ${vitals.heartRate} bpm`);
    if (vitals.heartRate < 45) redFlags.push(`Severe Bradycardia: Heart Rate ${vitals.heartRate} bpm`);
  }
  if (vitals.temperatureF !== undefined && vitals.temperatureF >= 104) {
    redFlags.push(`Hyperpyrexia: Temperature ${vitals.temperatureF}°F`);
  }

  // 3. Moderate / Yellow Flags
  if (symptoms.highFeverDays && symptoms.highFeverDays >= 3) {
    yellowFlags.push(`Prolonged Fever: ${symptoms.highFeverDays} days`);
  }
  if (symptoms.coughDays && symptoms.coughDays >= 14) {
    yellowFlags.push(`Chronic Cough (>2 weeks - rule out TB)`);
  }
  if (symptoms.vomiting) {
    yellowFlags.push('Persistent Vomiting / Inability to retain fluids');
  }
  if (vitals.spO2 !== undefined && vitals.spO2 >= 92 && vitals.spO2 <= 94) {
    yellowFlags.push(`Borderline Oxygen: SpO2 ${vitals.spO2}% (92-94%)`);
  }
  if (vitals.systolicBp !== undefined && (vitals.systolicBp >= 140 || (vitals.diastolicBp && vitals.diastolicBp >= 90))) {
    yellowFlags.push(`Stage 1/2 Hypertension: BP ${vitals.systolicBp}/${vitals.diastolicBp} mmHg`);
  }
  if (vitals.temperatureF !== undefined && vitals.temperatureF >= 100.4 && vitals.temperatureF < 104) {
    yellowFlags.push(`Fever: Temperature ${vitals.temperatureF}°F`);
  }

  // Decision Logic
  if (redFlags.length > 0) {
    return {
      classification: TriageClassification.URGENT,
      urgencyScore: Math.min(10, 8 + redFlags.length),
      redFlags,
      yellowFlags,
      recommendedAction: 'Immediate referral & emergency stabilization. Transfer to CHC/District Hospital via 108 ambulance.',
      recommendedFacilityTier: 'DISTRICT_HOSPITAL',
    };
  }

  if (yellowFlags.length > 0) {
    return {
      classification: TriageClassification.NEEDS_CONSULT,
      urgencyScore: Math.min(7, 4 + yellowFlags.length),
      redFlags,
      yellowFlags,
      recommendedAction: 'Medical Officer consultation recommended within 24 hours at nearest PHC or via Teleconsultation.',
      recommendedFacilityTier: 'PHC',
    };
  }

  return {
    classification: TriageClassification.ROUTINE,
    urgencyScore: 2,
    redFlags: [],
    yellowFlags: [],
    recommendedAction: 'Routine frontline management, symptomatic home care, lifestyle guidance, or routine Sub-Centre follow-up.',
    recommendedFacilityTier: 'SUB_CENTRE',
  };
}
