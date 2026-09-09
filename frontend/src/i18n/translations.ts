export type Language = 'en' | 'hi';

export const translations = {
  en: {
    appName: 'Rural Healthcare Access & Quality Support System',
    appTagline: 'Strengthening India\'s 4-Tier Public Health Hierarchy (Sub-Centre → PHC → CHC → District Hospital)',
    dashboard: 'Frontline Dashboard',
    registerPatient: 'Register Patient',
    digitalTriage: 'Digital Triage',
    teleconsult: 'Assisted Teleconsult',
    referralTracking: 'Referral Tracking',
    followUps: 'High-Risk Follow-Ups',
    emergencySOS: 'Emergency SOS',
    inventoryReadiness: 'Medicine & Diagnostics',
    districtIntelligence: 'District Intelligence',
    
    // Status
    synced: 'Synced',
    pendingSync: 'Pending Sync',
    offline: 'Offline Mode',
    online: 'Online',
    
    // Frontline worker terms
    ashaWorker: 'ASHA / ANM Frontline Worker',
    subCentre: 'Sub-Centre / HWC',
    phc: 'Primary Health Centre (PHC)',
    chc: 'Community Health Centre (CHC)',
    districtHospital: 'District Hospital',
    
    // Form fields
    fullName: 'Full Name',
    age: 'Age',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    abhaId: 'ABHA Health ID (Ayushman Bharat)',
    autoGenerate: 'Auto-Generate ABHA',
    village: 'Village / Gram Panchayat',
    phoneNumber: 'Phone Number',
    preferredLanguage: 'Language Preference',
    submitRegistration: 'Save & Register Patient',
    
    // Triage
    triageTitle: 'Digital Triage & Decision Engine',
    symptomsChecklist: 'Symptoms & Red Flag Checklist',
    vitalsTitle: 'Clinical Vitals',
    evaluateTriage: 'Evaluate Triage Urgency',
    urgent: 'URGENT - Immediate Referral',
    needsConsult: 'NEEDS CONSULT - Medical Officer Review',
    routine: 'ROUTINE - Frontline Care & Home Management',
    
    // Follow-ups
    ancCare: 'Antenatal Care (ANC)',
    immunization: 'Universal Immunization',
    tbDots: 'TB / DOTS Adherence',
    chronicNcd: 'NCD / Hypertension / Diabetes',
    markDone: 'Mark Complete',
    overdue: 'OVERDUE',
    
    // Emergency
    sosAlert: 'TRIGGER EMERGENCY ESCALATION',
    sosPrompt: 'One-tap dispatch alert with pre-filled vitals to nearest CHC/District Hospital & 108 Ambulance',
  },
  hi: {
    appName: 'ग्रामीण स्वास्थ्य सहायता एवं गुणवत्ता प्रणाली',
    appTagline: 'भारत की 4-स्तरीय सार्वजनिक स्वास्थ्य प्रणाली का सशक्तिकरण (उप-केंद्र → PHC → CHC → जिला अस्पताल)',
    dashboard: 'आशा / एएनएम डैशबोर्ड',
    registerPatient: 'मरीज पंजीकरण',
    digitalTriage: 'डिजिटल ट्राइएज',
    teleconsult: 'टेली-परामर्श',
    referralTracking: 'रेफरल ट्रैकिंग',
    followUps: 'उच्च जोखिम फॉलो-अप',
    emergencySOS: 'आपातकालीन सहायता (SOS)',
    inventoryReadiness: 'दवा व जांच उपलब्धता',
    districtIntelligence: 'जिला स्वास्थ्य निगरानी',
    
    // Status
    synced: 'सिंक हो गया',
    pendingSync: 'सिंक लंबित',
    offline: 'ऑफलाइन मोड',
    online: 'ऑनलाइन',
    
    // Frontline worker terms
    ashaWorker: 'आशा / एएनएम स्वास्थ्य कार्यकर्ता',
    subCentre: 'उप-स्वास्थ्य केंद्र / आरोग्य मंदिर',
    phc: 'प्राथमिक स्वास्थ्य केंद्र (PHC)',
    chc: 'सामुदायिक स्वास्थ्य केंद्र (CHC)',
    districtHospital: 'जिला अस्पताल',
    
    // Form fields
    fullName: 'पूरा नाम',
    age: 'आयु (वर्ष)',
    gender: 'लिंग',
    male: 'पुरुष',
    female: 'महिला',
    other: 'अन्य',
    abhaId: 'आभा आईडी (ABHA Health ID)',
    autoGenerate: 'स्वतः उत्पन्न करें',
    village: 'गाँव / ग्राम पंचायत',
    phoneNumber: 'मोबाइल नंबर',
    preferredLanguage: 'पसंदीदा भाषा',
    submitRegistration: 'मरीज पंजीकृत करें',
    
    // Triage
    triageTitle: 'डिजिटल ट्राइएज एवं निर्णय प्रणाली',
    symptomsChecklist: 'लक्षण एवं खतरे के संकेत',
    vitalsTitle: 'शारीरिक माप (Vitals)',
    evaluateTriage: 'ट्राइएज जांच करें',
    urgent: 'आपातकालीन - तत्काल उच्च केंद्र रेफर करें',
    needsConsult: 'परामर्श आवश्यक - 24 घंटे में डॉक्टर को दिखाएं',
    routine: 'सामान्य - उप-केंद्र स्तर पर प्राथमिक देखभाल',
    
    // Follow-ups
    ancCare: 'गर्भावस्था देखभाल (ANC)',
    immunization: 'टीकाकरण कार्यक्रम',
    tbDots: 'टीबी / डॉट्स दवा निगरानी',
    chronicNcd: 'बीपी / शुगर दीर्घकालिक देखभाल',
    markDone: 'पूर्ण चिह्नित करें',
    overdue: 'अवधि समाप्त (Overdue)',
    
    // Emergency
    sosAlert: 'आपातकालीन अलर्ट भेजें (SOS)',
    sosPrompt: 'तुरंत 108 एम्बुलेंस और जिला अस्पताल को मरीज की स्थिति भेजें',
  },
};
