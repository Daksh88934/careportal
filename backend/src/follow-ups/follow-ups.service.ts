import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FollowUpCategory } from '@prisma/client';
import { generateFollowUpPlan } from './follow-up-scheduler';

@Injectable()
export class FollowUpsService {
  constructor(private prisma: PrismaService) {}

  async createSchedule(data: {
    patientId: string;
    workerId?: string;
    category: FollowUpCategory;
    startDate?: Date;
  }) {
    const plan = generateFollowUpPlan(data.category, data.startDate ? new Date(data.startDate) : new Date());

    const created = await Promise.all(
      plan.map((item) =>
        this.prisma.followUpSchedule.create({
          data: {
            patientId: data.patientId,
            workerId: data.workerId || null,
            category: data.category,
            title: item.title,
            dueDate: item.dueDate,
            priority: item.priority,
            notes: item.notes || null,
          },
        }),
      ),
    );

    return {
      count: created.length,
      tasks: created,
    };
  }

  async getTasks(workerId?: string, isCompleted = false) {
    const where: any = { isCompleted };
    if (workerId) where.workerId = workerId;

    const tasks = await this.prisma.followUpSchedule.findMany({
      where,
      include: {
        patient: {
          include: {
            user: { select: { name: true, phone: true } },
            facility: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    const now = new Date();
    return tasks.map((t) => ({
      ...t,
      isOverdue: !t.isCompleted && new Date(t.dueDate) < now,
    }));
  }

  async completeTask(taskId: string, notes?: string) {
    const existing = await this.prisma.followUpSchedule.findUnique({ where: { id: taskId } });
    if (!existing) throw new NotFoundException('Task not found');

    return this.prisma.followUpSchedule.update({
      where: { id: taskId },
      data: {
        isCompleted: true,
        completedDate: new Date(),
        notes: notes ? (existing.notes ? `${existing.notes} | ${notes}` : notes) : existing.notes,
      },
    });
  }

  async getPatientFollowUps(patientId: string) {
    return this.prisma.followUpSchedule.findMany({
      where: { patientId },
      orderBy: { dueDate: 'asc' },
    });
  }
}
