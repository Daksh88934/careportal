import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConsentService } from './consent.service';
import { FacilityTier } from '@prisma/client';

@Injectable()
export class EhrService {
  constructor(
    private prisma: PrismaService,
    private consentService: ConsentService,
  ) {}

  async getLongitudinalRecord(
    patientId: string,
    accessor: { id: string; role: string; facilityName?: string },
  ) {
    // 1. Check and log consent
    await this.consentService.checkAndLogAccess(
      patientId,
      accessor.id,
      accessor.role,
      accessor.facilityName || 'Primary Health Centre',
    );

    // 2. Fetch full patient entity
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: { select: { name: true, phone: true, email: true } },
        facility: true,
        encounters: {
          include: {
            facility: true,
            observations: true,
            medicationRequests: true,
          },
          orderBy: { visitDate: 'desc' },
        },
        conditions: {
          orderBy: { recordedAt: 'desc' },
        },
        triageAssessments: {
          include: { worker: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        referrals: {
          include: {
            fromFacility: true,
            toFacility: true,
          },
          orderBy: { initiatedAt: 'desc' },
        },
        followUpSchedules: {
          orderBy: { dueDate: 'asc' },
        },
        consents: {
          orderBy: { grantedAt: 'desc' },
        },
      },
    });

    if (!patient) {
      // Check if this is a PatientRegistration ID instead
      const reg = await this.prisma.patientRegistration.findUnique({
        where: { id: patientId },
        include: { facility: true, worker: true },
      });
      if (reg) {
        return {
          registrationOnly: true,
          registration: reg,
          encounters: [],
          conditions: [],
          triageAssessments: [],
          referrals: [],
          followUpSchedules: [],
        };
      }
      throw new NotFoundException('Patient record not found');
    }

    return patient;
  }

  async recordEncounter(data: {
    patientId: string;
    facilityId: string;
    providerName: string;
    facilityTier: FacilityTier;
    chiefComplaint: string;
    diagnosis?: string;
    notes?: string;
    observations?: Array<{ code: string; description: string; value: string; unit?: string }>;
    medications?: Array<{
      medicationName: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }>;
  }) {
    return this.prisma.encounter.create({
      data: {
        patientId: data.patientId,
        facilityId: data.facilityId,
        providerName: data.providerName,
        facilityTier: data.facilityTier,
        chiefComplaint: data.chiefComplaint,
        diagnosis: data.diagnosis || null,
        notes: data.notes || null,
        observations: data.observations
          ? {
              create: data.observations.map((obs) => ({
                code: obs.code,
                description: obs.description,
                value: obs.value,
                unit: obs.unit || null,
              })),
            }
          : undefined,
        medicationRequests: data.medications
          ? {
              create: data.medications.map((med) => ({
                medicationName: med.medicationName,
                dosage: med.dosage,
                frequency: med.frequency,
                duration: med.duration,
                instructions: med.instructions || null,
              })),
            }
          : undefined,
      },
      include: {
        observations: true,
        medicationRequests: true,
        facility: true,
      },
    });
  }

  async recordCondition(data: {
    patientId: string;
    code: string;
    name: string;
    severity?: string;
    status?: string;
    onsetDate?: Date;
  }) {
    return this.prisma.condition.create({
      data: {
        patientId: data.patientId,
        code: data.code,
        name: data.name,
        severity: data.severity || null,
        status: data.status || 'active',
        onsetDate: data.onsetDate || null,
      },
    });
  }
}
