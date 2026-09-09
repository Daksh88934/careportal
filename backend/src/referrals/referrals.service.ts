import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralStatus, TriageClassification } from '@prisma/client';

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    patientId: string;
    fromFacilityId: string;
    toFacilityId: string;
    reason: string;
    clinicalSummary?: string;
    urgency?: TriageClassification;
  }) {
    return this.prisma.referral.create({
      data: {
        patientId: data.patientId,
        fromFacilityId: data.fromFacilityId,
        toFacilityId: data.toFacilityId,
        reason: data.reason,
        clinicalSummary: data.clinicalSummary || null,
        urgency: data.urgency || TriageClassification.ROUTINE,
        status: ReferralStatus.REFERRED,
        initiatedAt: new Date(),
      },
      include: {
        patient: { include: { user: true } },
        fromFacility: true,
        toFacility: true,
      },
    });
  }

  async updateStatus(
    id: string,
    status: ReferralStatus,
    outcome?: string,
  ) {
    const existing = await this.prisma.referral.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Referral not found');

    const updateData: any = {
      status,
      isStale: false, // reset stale alert when updated
    };

    const now = new Date();
    if (status === ReferralStatus.IN_TRANSIT) updateData.transitStartedAt = now;
    if (status === ReferralStatus.REACHED) updateData.reachedAt = now;
    if (status === ReferralStatus.SEEN) updateData.seenAt = now;
    if (status === ReferralStatus.OUTCOME_RECORDED) {
      updateData.outcome = outcome || null;
      updateData.outcomeRecordedAt = now;
    }

    return this.prisma.referral.update({
      where: { id },
      data: updateData,
      include: {
        patient: { include: { user: true } },
        fromFacility: true,
        toFacility: true,
      },
    });
  }

  async findAll(filters: {
    facilityId?: string;
    patientId?: string;
    status?: ReferralStatus;
    staleOnly?: boolean;
    urgency?: TriageClassification;
  }) {
    const where: any = {};
    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.status) where.status = filters.status;
    if (filters.urgency) where.urgency = filters.urgency;
    if (filters.staleOnly) where.isStale = true;

    if (filters.facilityId) {
      where.OR = [
        { fromFacilityId: filters.facilityId },
        { toFacilityId: filters.facilityId },
      ];
    }

    return this.prisma.referral.findMany({
      where,
      include: {
        patient: {
          include: {
            user: { select: { name: true, phone: true } },
          },
        },
        fromFacility: true,
        toFacility: true,
      },
      orderBy: { initiatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const ref = await this.prisma.referral.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: true,
            triageAssessments: { take: 3, orderBy: { createdAt: 'desc' } },
            encounters: { take: 3, orderBy: { visitDate: 'desc' } },
          },
        },
        fromFacility: true,
        toFacility: true,
      },
    });
    if (!ref) throw new NotFoundException('Referral not found');
    return ref;
  }

  // Periodic check for referrals pending > 48h
  async flagStaleReferrals() {
    const threshold = new Date(Date.now() - 48 * 60 * 60 * 1000);
    return this.prisma.referral.updateMany({
      where: {
        status: { in: [ReferralStatus.REFERRED, ReferralStatus.IN_TRANSIT] },
        initiatedAt: { lte: threshold },
        isStale: false,
      },
      data: { isStale: true },
    });
  }
}
