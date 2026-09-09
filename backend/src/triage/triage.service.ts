import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { evaluateTriage, VitalsInput, SymptomsInput } from './triage-rules';

@Injectable()
export class TriageService {
  constructor(private prisma: PrismaService) {}

  async assess(workerId: string, data: {
    patientId: string;
    vitals: VitalsInput;
    symptoms: SymptomsInput;
    notes?: string;
  }) {
    const result = evaluateTriage(data.vitals, data.symptoms);

    // Save assessment
    const assessment = await this.prisma.triageAssessment.create({
      data: {
        patientId: data.patientId,
        workerId,
        vitals: data.vitals as any,
        symptoms: data.symptoms as any,
        classification: result.classification,
        recommendedAction: result.recommendedAction,
        notes: data.notes || null,
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

    return {
      ...assessment,
      evaluation: result,
    };
  }

  async findByPatient(patientId: string) {
    return this.prisma.triageAssessment.findMany({
      where: { patientId },
      include: {
        worker: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRecent(limit = 50) {
    return this.prisma.triageAssessment.findMany({
      take: limit,
      include: {
        patient: {
          include: {
            user: { select: { name: true, phone: true } },
          },
        },
        worker: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
