import { FollowUpCategory } from '@prisma/client';

export interface GeneratedTask {
  title: string;
  dueDate: Date;
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  notes?: string;
}

export function generateFollowUpPlan(
  category: FollowUpCategory,
  startDate: Date = new Date(),
): GeneratedTask[] {
  const tasks: GeneratedTask[] = [];
  const baseTime = startDate.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  switch (category) {
    case FollowUpCategory.ANC:
      tasks.push(
        {
          title: 'ANC 1st Checkup (1st Trimester - Registration & Blood/Urine/IFA)',
          dueDate: new Date(baseTime + 7 * dayMs),
          priority: 'HIGH',
          notes: 'Check Hb, Blood Group, Syphilis/HIV screening, IFA & Calcium supplementation.',
        },
        {
          title: 'ANC 2nd Checkup (14-26 Weeks - Quickening & USG)',
          dueDate: new Date(baseTime + 90 * dayMs),
          priority: 'HIGH',
          notes: 'Anomaly scan, TT1 injection, BP & fetal heart sound check.',
        },
        {
          title: 'ANC 3rd Checkup (28-34 Weeks - Growth & Hemoglobin)',
          dueDate: new Date(baseTime + 180 * dayMs),
          priority: 'HIGH',
          notes: 'TT2 booster, evaluate gestational diabetes, pre-eclampsia signs.',
        },
        {
          title: 'ANC 4th Checkup (36-40 Weeks - Delivery Planning & High-Risk Audit)',
          dueDate: new Date(baseTime + 240 * dayMs),
          priority: 'CRITICAL',
          notes: 'Institutional delivery plan, identify transport / 108 readiness, check for malpresentation.',
        },
      );
      break;

    case FollowUpCategory.IMMUNIZATION:
      tasks.push(
        {
          title: 'Birth Dose: BCG + OPV 0 + Hepatitis B',
          dueDate: new Date(baseTime + 2 * dayMs),
          priority: 'HIGH',
          notes: 'Given at birth/within 24 hours of delivery.',
        },
        {
          title: '6 Weeks: Pentavalent-1 + OPV-1 + Rotavirus-1 + fIPV-1 + PCV-1',
          dueDate: new Date(baseTime + 42 * dayMs),
          priority: 'HIGH',
          notes: 'Essential primary immunization window.',
        },
        {
          title: '10 Weeks: Pentavalent-2 + OPV-2 + Rotavirus-2',
          dueDate: new Date(baseTime + 70 * dayMs),
          priority: 'HIGH',
          notes: 'Second dose series.',
        },
        {
          title: '14 Weeks: Pentavalent-3 + OPV-3 + Rotavirus-3 + fIPV-2 + PCV-2',
          dueDate: new Date(baseTime + 98 * dayMs),
          priority: 'HIGH',
          notes: 'Third primary dose series completion.',
        },
        {
          title: '9-12 Months: MR-1 (Measles-Rubella) + PCV-Booster + Vit A Dose 1',
          dueDate: new Date(baseTime + 270 * dayMs),
          priority: 'CRITICAL',
          notes: 'Measles-Rubella first dose and Vitamin A drop.',
        },
      );
      break;

    case FollowUpCategory.TB_DOTS:
      tasks.push(
        {
          title: 'TB DOTS Week 1: Adherence & Medication Tolerance Check',
          dueDate: new Date(baseTime + 7 * dayMs),
          priority: 'CRITICAL',
          notes: 'Verify 4-FDC intake, check for jaundice / gastric intolerance.',
        },
        {
          title: 'TB DOTS Week 4: Month 1 Sputum & Weight Check',
          dueDate: new Date(baseTime + 30 * dayMs),
          priority: 'HIGH',
          notes: 'Record weight gain, ensure uninterrupted supply at Sub-Centre.',
        },
        {
          title: 'TB DOTS Month 2: End of Intensive Phase Evaluation',
          dueDate: new Date(baseTime + 60 * dayMs),
          priority: 'CRITICAL',
          notes: 'Repeat smear microscopy to check conversion before continuation phase.',
        },
      );
      break;

    case FollowUpCategory.CHRONIC:
      tasks.push(
        {
          title: 'NCD Follow-up: 30-Day BP & Fasting Blood Glucose Screening',
          dueDate: new Date(baseTime + 30 * dayMs),
          priority: 'NORMAL',
          notes: 'Target BP < 140/90, FBS < 126 mg/dL. Refill Amlodipine / Metformin.',
        },
        {
          title: 'NCD Follow-up: 60-Day Medication Review & Lifestyle Check',
          dueDate: new Date(baseTime + 60 * dayMs),
          priority: 'NORMAL',
          notes: 'Dietary salt reduction counseling and exercise evaluation.',
        },
        {
          title: 'NCD Follow-up: 90-Day Comprehensive MO Review at PHC',
          dueDate: new Date(baseTime + 90 * dayMs),
          priority: 'HIGH',
          notes: 'HbA1c & lipid profile test at PHC / CHC.',
        },
      );
      break;
  }

  return tasks;
}
