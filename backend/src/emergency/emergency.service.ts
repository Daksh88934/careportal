import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmergencyAlertStatus } from '@prisma/client';

@Injectable()
export class EmergencyService {
  constructor(private prisma: PrismaService) {}

  async triggerAlert(workerId: string, data: {
    patientId?: string;
    facilityId?: string;
    location?: string;
    vitalsSnapshot?: any;
    symptomsSummary?: string;
  }) {
    return this.prisma.emergencyAlert.create({
      data: {
        workerId,
        patientId: data.patientId || null,
        facilityId: data.facilityId || null,
        location: data.location || 'Rural Field Location',
        vitalsSnapshot: data.vitalsSnapshot || null,
        symptomsSummary: data.symptomsSummary || 'Immediate emergency medical assistance requested',
        status: EmergencyAlertStatus.TRIGGERED,
      },
      include: {
        worker: { select: { id: true, name: true, phone: true } },
        patient: { include: { user: true } },
        facility: true,
      },
    });
  }

  async getAlerts(status?: EmergencyAlertStatus) {
    const where: any = {};
    if (status) where.status = status;

    return this.prisma.emergencyAlert.findMany({
      where,
      include: {
        worker: { select: { id: true, name: true, phone: true } },
        patient: { include: { user: true } },
        facility: true,
      },
      orderBy: { triggeredAt: 'desc' },
      take: 100,
    });
  }

  async updateStatus(id: string, status: EmergencyAlertStatus, notes?: string) {
    const existing = await this.prisma.emergencyAlert.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Emergency alert not found');

    const updateData: any = {
      status,
      responseNotes: notes ? (existing.responseNotes ? `${existing.responseNotes} | ${notes}` : notes) : existing.responseNotes,
    };

    if (status === EmergencyAlertStatus.ACKNOWLEDGED) updateData.acknowledgedAt = new Date();
    if (status === EmergencyAlertStatus.RESOLVED) updateData.resolvedAt = new Date();

    return this.prisma.emergencyAlert.update({
      where: { id },
      data: updateData,
      include: {
        worker: true,
        patient: { include: { user: true } },
        facility: true,
      },
    });
  }
}
