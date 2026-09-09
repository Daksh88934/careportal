import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TriageClassification } from '@prisma/client';

@Injectable()
export class TeleconsultationService {
  constructor(private prisma: PrismaService) {}

  async createStoreForwardCase(workerId: string, data: {
    patientId: string;
    chiefComplaint: string;
    vitalsSnapshot?: any;
    voiceNoteUrl?: string;
    mediaUrls?: string[];
    priority?: TriageClassification;
  }) {
    return this.prisma.storeForwardCase.create({
      data: {
        patientId: data.patientId,
        workerId,
        chiefComplaint: data.chiefComplaint,
        vitalsSnapshot: data.vitalsSnapshot || null,
        voiceNoteUrl: data.voiceNoteUrl || null,
        mediaUrls: data.mediaUrls || [],
        priority: data.priority || TriageClassification.ROUTINE,
      },
      include: {
        patient: {
          include: {
            user: { select: { name: true, phone: true } },
          },
        },
        worker: { select: { name: true, phone: true } },
      },
    });
  }

  async getDoctorQueue(doctorId?: string, resolved = false) {
    const cases = await this.prisma.storeForwardCase.findMany({
      where: {
        isResolved: resolved,
        ...(doctorId ? { doctorId } : {}),
      },
      include: {
        patient: {
          include: {
            user: { select: { name: true, phone: true } },
            facility: true,
          },
        },
        worker: { select: { name: true, phone: true } },
        doctor: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Sort by priority order: URGENT first, then NEEDS_CONSULT, then ROUTINE
    const priorityWeight: Record<string, number> = {
      [TriageClassification.URGENT]: 3,
      [TriageClassification.NEEDS_CONSULT]: 2,
      [TriageClassification.ROUTINE]: 1,
    };

    return cases.sort((a, b) => {
      const weightA = priorityWeight[a.priority] || 0;
      const weightB = priorityWeight[b.priority] || 0;
      if (weightB !== weightA) return weightB - weightA;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  async respondToCase(caseId: string, doctorId: string, response: {
    doctorResponse: string;
    prescriptionNotes?: string;
  }) {
    const existing = await this.prisma.storeForwardCase.findUnique({
      where: { id: caseId },
    });
    if (!existing) throw new NotFoundException('Case not found');

    return this.prisma.storeForwardCase.update({
      where: { id: caseId },
      data: {
        doctorId,
        doctorResponse: response.doctorResponse,
        prescriptionNotes: response.prescriptionNotes || null,
        isResolved: true,
        respondedAt: new Date(),
      },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        worker: true,
      },
    });
  }

  async getCaseDetails(caseId: string) {
    const record = await this.prisma.storeForwardCase.findUnique({
      where: { id: caseId },
      include: {
        patient: {
          include: {
            user: true,
            facility: true,
            encounters: { take: 3, orderBy: { visitDate: 'desc' } },
            triageAssessments: { take: 2, orderBy: { createdAt: 'desc' } },
          },
        },
        worker: true,
        doctor: { include: { user: true } },
      },
    });
    if (!record) throw new NotFoundException('Case not found');
    return record;
  }
}
