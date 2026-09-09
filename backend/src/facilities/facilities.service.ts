import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FacilityTier } from '@prisma/client';

@Injectable()
export class FacilitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(district?: string, tier?: FacilityTier) {
    const where: any = { isActive: true };
    if (district) where.district = { contains: district, mode: 'insensitive' };
    if (tier) where.tier = tier;

    return this.prisma.facility.findMany({
      where,
      include: {
        inventory: true,
        _count: {
          select: {
            doctors: true,
            patients: true,
            registeredPatients: true,
            incomingReferrals: true,
            outgoingReferrals: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const facility = await this.prisma.facility.findUnique({
      where: { id },
      include: {
        inventory: true,
        doctors: { include: { user: true } },
        appointmentSlots: {
          where: { startTime: { gte: new Date() } },
          orderBy: { startTime: 'asc' },
        },
      },
    });
    if (!facility) throw new NotFoundException('Facility not found');
    return facility;
  }

  async create(data: {
    name: string;
    tier: FacilityTier;
    district: string;
    state?: string;
    block?: string;
    village?: string;
    pincode?: string;
    contactPhone?: string;
    latitude?: number;
    longitude?: number;
  }) {
    return this.prisma.facility.create({
      data,
    });
  }

  async getTiersHierarchy() {
    return [
      { tier: FacilityTier.SUB_CENTRE, label: 'Sub-Centre (HWC)', level: 1, description: 'ASHA/ANM Frontline Care & Screenings' },
      { tier: FacilityTier.PHC, label: 'Primary Health Centre (PHC)', level: 2, description: 'Medical Officer, Basic Diagnostics & Outpatient Care' },
      { tier: FacilityTier.CHC, label: 'Community Health Centre (CHC)', level: 3, description: 'Specialist Consults, Minor Surgeries & Inpatient' },
      { tier: FacilityTier.DISTRICT_HOSPITAL, label: 'District Hospital (DH)', level: 4, description: 'Comprehensive Multispecialty & ICU Care' },
    ];
  }
}
