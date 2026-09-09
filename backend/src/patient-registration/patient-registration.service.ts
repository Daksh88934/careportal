import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SyncStatus, Gender, UserRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export interface CreateRegistrationDto {
  fullName: string;
  age: number;
  gender: Gender;
  abhaId?: string;
  village: string;
  phone: string;
  languagePreference?: string;
  facilityId?: string;
  localId?: string;
}

@Injectable()
export class PatientRegistrationService {
  constructor(private prisma: PrismaService) {}

  generateAbhaId(): string {
    const randomDigits = () => Math.floor(1000 + Math.random() * 9000);
    return `91-${randomDigits()}-${randomDigits()}-${randomDigits()}`;
  }

  async register(workerId: string, dto: CreateRegistrationDto) {
    const abhaId = dto.abhaId?.trim() || this.generateAbhaId();

    // Check if already registered by ABHA
    const existing = await this.prisma.patientRegistration.findUnique({
      where: { abhaId },
    });

    if (existing) {
      return existing;
    }

    // 1. Create PatientRegistration record
    const registration = await this.prisma.patientRegistration.create({
      data: {
        fullName: dto.fullName,
        age: Number(dto.age),
        gender: dto.gender,
        abhaId,
        village: dto.village,
        phone: dto.phone,
        languagePreference: dto.languagePreference || 'en',
        workerId,
        facilityId: dto.facilityId || null,
        syncStatus: SyncStatus.SYNCED,
        localId: dto.localId || null,
        syncedAt: new Date(),
      },
      include: {
        facility: true,
        worker: { select: { id: true, name: true, phone: true } },
      },
    });

    // 2. Ensure corresponding Patient record exists in database for EHR continuity
    try {
      let user = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      });

      if (!user) {
        const dummyEmail = `patient_${abhaId.replace(/[^a-zA-Z0-9]/g, '')}@ruralhealth.gov.in`;
        user = await this.prisma.user.create({
          data: {
            name: dto.fullName,
            phone: dto.phone,
            email: dummyEmail,
            role: UserRole.PATIENT,
            passwordHash: '$2a$10$ruralhealthpatientdummyhash12345678901234567890',
            isVerified: true,
            facilityId: dto.facilityId || null,
          },
        });
      }

      const existingPatient = await this.prisma.patient.findUnique({
        where: { userId: user.id },
      });

      if (!existingPatient) {
        const birthYear = new Date().getFullYear() - Number(dto.age);
        await this.prisma.patient.create({
          data: {
            userId: user.id,
            abhaId,
            village: dto.village,
            gender: dto.gender,
            languagePreference: dto.languagePreference || 'en',
            facilityId: dto.facilityId || null,
            dateOfBirth: new Date(birthYear, 0, 1),
            address: dto.village,
          },
        });
      }
    } catch (e) {
      console.warn('Could not mirror user/patient entity:', e?.message);
    }

    return registration;
  }

  async bulkSync(workerId: string, items: CreateRegistrationDto[]) {
    const results = [];
    for (const item of items) {
      try {
        const res = await this.register(workerId, item);
        results.push({ localId: item.localId, abhaId: res.abhaId, status: 'SUCCESS', record: res });
      } catch (err) {
        results.push({ localId: item.localId, status: 'ERROR', message: err.message });
      }
    }
    return {
      syncedCount: results.filter((r) => r.status === 'SUCCESS').length,
      failedCount: results.filter((r) => r.status === 'ERROR').length,
      items: results,
    };
  }

  async findAll(workerId?: string, facilityId?: string, search?: string) {
    const where: any = {};
    if (workerId) where.workerId = workerId;
    if (facilityId) where.facilityId = facilityId;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { abhaId: { contains: search, mode: 'insensitive' } },
        { village: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    return this.prisma.patientRegistration.findMany({
      where,
      include: {
        facility: true,
        worker: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findByAbha(abhaId: string) {
    return this.prisma.patientRegistration.findUnique({
      where: { abhaId },
      include: { facility: true, worker: true },
    });
  }
}
