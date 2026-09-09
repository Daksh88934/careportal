import { PrismaClient, UserRole, Gender } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@carex.com' },
    update: {},
    create: {
      email: 'admin@carex.com',
      phone: '+919876543210',
      name: 'Admin User',
      role: UserRole.ADMIN,
      passwordHash: adminPasswordHash,
      isVerified: true,
      isActive: true,
    },
  });

  // Create sample doctor
  const doctorPasswordHash = await bcrypt.hash('doctor123', 12);
  const doctorUser = await prisma.user.upsert({
    where: { email: 'dr.smith@carex.com' },
    update: {},
    create: {
      email: 'dr.smith@carex.com',
      phone: '+919876543211',
      name: 'Dr. John Smith',
      role: UserRole.DOCTOR,
      passwordHash: doctorPasswordHash,
      isVerified: true,
      isActive: true,
    },
  });

  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      qualification: 'MBBS, MD (Internal Medicine)',
      registrationNumber: 'NMC123456789',
      specialties: ['Internal Medicine', 'General Practice'],
      clinicAddress: '123 Medical Center, Mumbai, Maharashtra 400001',
      consultFee: 500.0,
      availableHours: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
        saturday: { start: '09:00', end: '13:00' },
        sunday: { closed: true },
      },
      experience: 10,
      rating: 4.8,
      totalRatings: 150,
      isVerified: true,
      verificationDocs: [],
      bio: 'Experienced internal medicine specialist with 10+ years of practice.',
      languages: ['English', 'Hindi', 'Marathi'],
    },
  });

  // Create sample patient
  const patientPasswordHash = await bcrypt.hash('patient123', 12);
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@carex.com' },
    update: {},
    create: {
      email: 'patient@carex.com',
      phone: '+919876543212',
      name: 'Jane Doe',
      role: UserRole.PATIENT,
      passwordHash: patientPasswordHash,
      isVerified: true,
      isActive: true,
    },
  });

  const patient = await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      dateOfBirth: new Date('1990-05-15'),
      gender: Gender.FEMALE,
      address: '456 Residential Area, Mumbai, Maharashtra 400002',
      emergencyContact: '+919876543213',
      bloodGroup: 'O+',
      allergies: ['Penicillin'],
      medicalHistory: {
        conditions: ['Hypertension'],
        surgeries: [],
        medications: ['Amlodipine 5mg'],
      },
      insuranceInfo: {
        provider: 'Health Insurance Co.',
        policyNumber: 'HIC123456789',
        validUntil: '2024-12-31',
      },
    },
  });

  // Create sample pharmacy
  const pharmacyPasswordHash = await bcrypt.hash('pharmacy123', 12);
  const pharmacyUser = await prisma.user.upsert({
    where: { email: 'pharmacy@carex.com' },
    update: {},
    create: {
      email: 'pharmacy@carex.com',
      phone: '+919876543214',
      name: 'MediCare Pharmacy',
      role: UserRole.PHARMACY,
      passwordHash: pharmacyPasswordHash,
      isVerified: true,
      isActive: true,
    },
  });

  const pharmacy = await prisma.pharmacy.upsert({
    where: { userId: pharmacyUser.id },
    update: {},
    create: {
      userId: pharmacyUser.id,
      name: 'MediCare Pharmacy',
      address: '789 Pharmacy Street, Mumbai, Maharashtra 400003',
      licenseNumber: 'PH123456789',
      contact: '+919876543214',
      isVerified: true,
      rating: 4.5,
      totalRatings: 200,
      deliveryRadius: 15,
      operatingHours: {
        monday: { start: '08:00', end: '22:00' },
        tuesday: { start: '08:00', end: '22:00' },
        wednesday: { start: '08:00', end: '22:00' },
        thursday: { start: '08:00', end: '22:00' },
        friday: { start: '08:00', end: '22:00' },
        saturday: { start: '08:00', end: '22:00' },
        sunday: { start: '10:00', end: '20:00' },
      },
    },
  });

  // Create sample medicines
  const medicines = [
    {
      name: 'Paracetamol',
      sku: 'MED001',
      manufacturer: 'Generic Pharma',
      unitPrice: 25.0,
      gstPercent: 12.0,
      stock: 1000,
      packSize: '10 tablets',
      description: 'Pain reliever and fever reducer',
      category: 'Analgesics',
      composition: 'Paracetamol 500mg',
      sideEffects: 'Nausea, stomach upset (rare)',
      dosageForm: 'Tablet',
      strength: '500mg',
      requiresPrescription: false,
    },
    {
      name: 'Amoxicillin',
      sku: 'MED002',
      manufacturer: 'Antibiotic Labs',
      unitPrice: 120.0,
      gstPercent: 12.0,
      stock: 500,
      packSize: '10 capsules',
      description: 'Antibiotic for bacterial infections',
      category: 'Antibiotics',
      composition: 'Amoxicillin 500mg',
      sideEffects: 'Diarrhea, nausea, allergic reactions',
      dosageForm: 'Capsule',
      strength: '500mg',
      requiresPrescription: true,
    },
    {
      name: 'Omeprazole',
      sku: 'MED003',
      manufacturer: 'Gastro Pharma',
      unitPrice: 85.0,
      gstPercent: 12.0,
      stock: 750,
      packSize: '14 capsules',
      description: 'Proton pump inhibitor for acid reflux',
      category: 'Gastroenterology',
      composition: 'Omeprazole 20mg',
      sideEffects: 'Headache, diarrhea, stomach pain',
      dosageForm: 'Capsule',
      strength: '20mg',
      requiresPrescription: true,
    },
  ];

  for (const medicineData of medicines) {
    await prisma.medicine.upsert({
      where: { sku: medicineData.sku },
      update: {},
      create: medicineData,
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log('📋 Created:');
  console.log('   - Admin user: admin@carex.com (password: admin123)');
  console.log('   - Doctor: dr.smith@carex.com (password: doctor123)');
  console.log('   - Patient: patient@carex.com (password: patient123)');
  console.log('   - Pharmacy: pharmacy@carex.com (password: pharmacy123)');
  console.log('   - Sample medicines: Paracetamol, Amoxicillin, Omeprazole');
}

main()
  .catch(e => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
