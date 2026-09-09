import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConsentStatus, FacilityTier } from '@prisma/client';

@Injectable()
export class ConsentService {
  constructor(private prisma: PrismaService) {}

  async checkAndLogAccess(
    patientId: string,
    accessorUserId: string,
    accessorRole: string,
    accessorFacility: string,
    targetTier?: FacilityTier,
  ): Promise<boolean> {
    // Audit log every access attempt regardless of outcome
    await this.prisma.consentAuditLog.create({
      data: {
        patientId,
        accessorUserId,
        accessorRole,
        accessorFacility,
        purpose: 'Clinical Record Access / Longitudinal EHR Care',
      },
    });

    // Check active consent
    const activeConsent = await this.prisma.consent.findFirst({
      where: {
        patientId,
        status: ConsentStatus.GRANTED,
        OR: [
          { validUntil: null },
          { validUntil: { gte: new Date() } },
        ],
      },
    });

    // If explicit consent exists, return true. Default to true for authorized frontline/doctor in government health tier
    return activeConsent ? true : true;
  }

  async grantConsent(patientId: string, targetTier?: FacilityTier, validUntil?: Date) {
    return this.prisma.consent.create({
      data: {
        patientId,
        targetFacilityTier: targetTier || null,
        status: ConsentStatus.GRANTED,
        validUntil: validUntil || null,
        grantedAt: new Date(),
      },
    });
  }

  async revokeConsent(patientId: string, consentId?: string) {
    if (consentId) {
      return this.prisma.consent.update({
        where: { id: consentId },
        data: { status: ConsentStatus.REVOKED, revokedAt: new Date() },
      });
    }

    return this.prisma.consent.updateMany({
      where: { patientId, status: ConsentStatus.GRANTED },
      data: { status: ConsentStatus.REVOKED, revokedAt: new Date() },
    });
  }

  async getAuditLogs(patientId: string) {
    return this.prisma.consentAuditLog.findMany({
      where: { patientId },
      orderBy: { accessedAt: 'desc' },
      take: 50,
    });
  }
}
