import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';

export interface CreateAppointmentDto {
  doctorId: string;
  patientId: string;
  scheduledAt: Date;
  type: 'VIDEO' | 'IN_PERSON';
  notes?: string;
}

export interface UpdateAppointmentDto {
  scheduledAt?: Date;
  status?: AppointmentStatus;
  notes?: string;
  doctorNotes?: string;
}

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async createAppointment(data: CreateAppointmentDto) {
    // Validate appointment time is in the future
    const now = new Date();
    if (new Date(data.scheduledAt) <= now) {
      throw new BadRequestException(
        'Appointment must be scheduled for a future time'
      );
    }

    // Check if doctor exists and is available
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: data.doctorId },
      include: { user: true },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Check if patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: data.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Check for scheduling conflicts
    const conflictingAppointment = await this.checkSchedulingConflict(
      data.doctorId,
      new Date(data.scheduledAt)
    );

    if (conflictingAppointment) {
      throw new ConflictException(
        'Doctor has another appointment at this time'
      );
    }

    // Create the appointment
    const appointment = await this.prisma.appointment.create({
      data: {
        doctorId: data.doctorId,
        patientId: data.patientId,
        scheduledAt: new Date(data.scheduledAt),
        status: 'REQUESTED',
        notes: data.notes,
        videoRoomId: `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      },
      include: {
        doctor: {
          include: { user: true },
        },
        patient: {
          include: { user: true },
        },
      },
    });

    return appointment;
  }

  async getAppointmentById(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: {
          include: { user: true },
        },
        patient: {
          include: { user: true },
        },
        prescriptions: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async getAppointmentsByDoctor(doctorId: string, status?: AppointmentStatus) {
    const where: any = { doctorId };
    if (status) {
      where.status = status;
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        patient: {
          include: { user: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getAppointmentsByPatient(
    patientId: string,
    status?: AppointmentStatus
  ) {
    const where: any = { patientId };
    if (status) {
      where.status = status;
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        doctor: {
          include: { user: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async updateAppointment(id: string, data: UpdateAppointmentDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // If rescheduling, check for conflicts
    if (data.scheduledAt) {
      const conflictingAppointment = await this.checkSchedulingConflict(
        appointment.doctorId,
        new Date(data.scheduledAt),
        id // Exclude current appointment from conflict check
      );

      if (conflictingAppointment) {
        throw new ConflictException(
          'Doctor has another appointment at this time'
        );
      }
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      },
      include: {
        doctor: {
          include: { user: true },
        },
        patient: {
          include: { user: true },
        },
      },
    });
  }

  async confirmAppointment(id: string) {
    return this.prisma.appointment.update({
      where: { id },
      data: { status: 'CONFIRMED' },
    });
  }

  async cancelAppointment(id: string, reason?: string) {
    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
      },
    });
  }

  async completeAppointment(id: string, doctorNotes?: string) {
    return this.updateAppointment(id, {
      status: 'COMPLETED',
      doctorNotes,
    });
  }

  async getDoctorAvailability(doctorId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['REQUESTED', 'CONFIRMED'],
        },
      },
      select: {
        scheduledAt: true,
      },
    });

    // Generate available time slots (assuming 30-minute slots from 9 AM to 5 PM)
    const availableSlots = [];
    const workingHours = {
      start: 9, // 9 AM
      end: 17, // 5 PM
      slotDuration: 30, // 30 minutes
    };

    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += workingHours.slotDuration) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);

        // Check if this slot is already booked
        const isBooked = appointments.some(apt => {
          const aptTime = new Date(apt.scheduledAt);
          return (
            Math.abs(aptTime.getTime() - slotTime.getTime()) < 30 * 60 * 1000
          ); // 30 minutes
        });

        if (!isBooked && slotTime > new Date()) {
          availableSlots.push(slotTime);
        }
      }
    }

    return availableSlots;
  }

  async getUpcomingAppointments(limit = 10) {
    const now = new Date();
    return this.prisma.appointment.findMany({
      where: {
        scheduledAt: { gte: now },
        status: {
          in: ['REQUESTED', 'CONFIRMED'],
        },
      },
      include: {
        doctor: {
          include: { user: true },
        },
        patient: {
          include: { user: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
      take: limit,
    });
  }

  async getAppointmentStats(doctorId?: string) {
    const where = doctorId ? { doctorId } : {};

    const [total, pending, confirmed, completed, cancelled] = await Promise.all(
      [
        this.prisma.appointment.count({ where }),
        this.prisma.appointment.count({
          where: { ...where, status: 'REQUESTED' },
        }),
        this.prisma.appointment.count({
          where: { ...where, status: 'CONFIRMED' },
        }),
        this.prisma.appointment.count({
          where: { ...where, status: 'COMPLETED' },
        }),
        this.prisma.appointment.count({
          where: { ...where, status: 'CANCELLED' },
        }),
      ]
    );

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
    };
  }

  private async checkSchedulingConflict(
    doctorId: string,
    scheduledAt: Date,
    excludeAppointmentId?: string
  ) {
    // Check for appointments within 30 minutes before or after
    const bufferTime = 30 * 60 * 1000; // 30 minutes in milliseconds
    const startTime = new Date(scheduledAt.getTime() - bufferTime);
    const endTime = new Date(scheduledAt.getTime() + bufferTime);

    const where: any = {
      doctorId,
      scheduledAt: {
        gte: startTime,
        lte: endTime,
      },
      status: {
        in: ['REQUESTED', 'CONFIRMED'],
      },
    };

    if (excludeAppointmentId) {
      where.id = { not: excludeAppointmentId };
    }

    return this.prisma.appointment.findFirst({ where });
  }
}
