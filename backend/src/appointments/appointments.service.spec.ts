import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, UserRole } from '@prisma/client';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    appointment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    doctor: {
      findUnique: jest.fn(),
    },
  };

  const mockUser = {
    id: 'user-1',
    email: 'patient@example.com',
    role: UserRole.PATIENT,
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockDoctor = {
    id: 'doctor-1',
    userId: 'doctor-user-1',
    specialization: 'Cardiology',
    licenseNumber: 'DOC123',
    consultationFee: 500,
    user: {
      id: 'doctor-user-1',
      firstName: 'Dr. Sarah',
      lastName: 'Wilson',
      email: 'doctor@example.com',
      role: UserRole.DOCTOR,
    },
  };

  const mockAppointment = {
    id: 'appointment-1',
    patientId: 'user-1',
    doctorId: 'doctor-1',
    scheduledAt: new Date('2024-01-15T10:00:00Z'),
    status: AppointmentStatus.PENDING,
    consultationType: 'video',
    symptoms: 'Chest pain',
    notes: 'Patient reports chest pain',
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: mockUser,
    doctor: mockDoctor,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createAppointmentDto = {
      doctorId: 'doctor-1',
      scheduledAt: new Date('2024-01-15T10:00:00Z'),
      consultationType: 'video' as const,
      symptoms: 'Chest pain',
      notes: 'Patient reports chest pain',
    };

    it('should create an appointment successfully', async () => {
      mockPrismaService.doctor.findUnique.mockResolvedValue(mockDoctor);
      mockPrismaService.appointment.findMany.mockResolvedValue([]);
      mockPrismaService.appointment.create.mockResolvedValue(mockAppointment);

      const result = await service.create(createAppointmentDto, mockUser);

      expect(result).toEqual(mockAppointment);
      expect(mockPrismaService.doctor.findUnique).toHaveBeenCalledWith({
        where: { id: 'doctor-1' },
        include: { user: true },
      });
      expect(mockPrismaService.appointment.create).toHaveBeenCalledWith({
        data: {
          patientId: 'user-1',
          doctorId: 'doctor-1',
          scheduledAt: createAppointmentDto.scheduledAt,
          consultationType: 'video',
          symptoms: 'Chest pain',
          notes: 'Patient reports chest pain',
          status: AppointmentStatus.PENDING,
        },
        include: {
          patient: true,
          doctor: { include: { user: true } },
        },
      });
    });

    it('should throw NotFoundException when doctor not found', async () => {
      mockPrismaService.doctor.findUnique.mockResolvedValue(null);

      await expect(
        service.create(createAppointmentDto, mockUser)
      ).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.doctor.findUnique).toHaveBeenCalledWith({
        where: { id: 'doctor-1' },
        include: { user: true },
      });
    });

    it('should throw BadRequestException for past appointment time', async () => {
      const pastAppointmentDto = {
        ...createAppointmentDto,
        scheduledAt: new Date('2020-01-01T10:00:00Z'),
      };
      mockPrismaService.doctor.findUnique.mockResolvedValue(mockDoctor);

      await expect(
        service.create(pastAppointmentDto, mockUser)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for appointment outside working hours', async () => {
      const outsideHoursDto = {
        ...createAppointmentDto,
        scheduledAt: new Date('2024-01-15T06:00:00Z'), // 6 AM, before working hours
      };
      mockPrismaService.doctor.findUnique.mockResolvedValue(mockDoctor);

      await expect(service.create(outsideHoursDto, mockUser)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException for conflicting appointment', async () => {
      const conflictingAppointment = {
        ...mockAppointment,
        scheduledAt: new Date('2024-01-15T10:15:00Z'), // Within 30-minute buffer
      };
      mockPrismaService.doctor.findUnique.mockResolvedValue(mockDoctor);
      mockPrismaService.appointment.findMany.mockResolvedValue([
        conflictingAppointment,
      ]);

      await expect(
        service.create(createAppointmentDto, mockUser)
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow appointment with exact 30-minute gap', async () => {
      const nonConflictingAppointment = {
        ...mockAppointment,
        scheduledAt: new Date('2024-01-15T09:30:00Z'), // Exactly 30 minutes before
      };
      mockPrismaService.doctor.findUnique.mockResolvedValue(mockDoctor);
      mockPrismaService.appointment.findMany.mockResolvedValue([
        nonConflictingAppointment,
      ]);
      mockPrismaService.appointment.create.mockResolvedValue(mockAppointment);

      const result = await service.create(createAppointmentDto, mockUser);

      expect(result).toEqual(mockAppointment);
    });
  });

  describe('findAll', () => {
    it('should return all appointments for patient', async () => {
      const appointments = [mockAppointment];
      mockPrismaService.appointment.findMany.mockResolvedValue(appointments);

      const result = await service.findAll(mockUser);

      expect(result).toEqual(appointments);
      expect(mockPrismaService.appointment.findMany).toHaveBeenCalledWith({
        where: { patientId: 'user-1' },
        include: {
          patient: true,
          doctor: { include: { user: true } },
        },
        orderBy: { scheduledAt: 'desc' },
      });
    });

    it('should return all appointments for doctor', async () => {
      const doctorUser = { ...mockUser, role: UserRole.DOCTOR };
      const appointments = [mockAppointment];
      mockPrismaService.appointment.findMany.mockResolvedValue(appointments);

      const result = await service.findAll(doctorUser);

      expect(result).toEqual(appointments);
      expect(mockPrismaService.appointment.findMany).toHaveBeenCalledWith({
        where: { doctor: { userId: 'user-1' } },
        include: {
          patient: true,
          doctor: { include: { user: true } },
        },
        orderBy: { scheduledAt: 'desc' },
      });
    });

    it('should return all appointments for admin', async () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      const appointments = [mockAppointment];
      mockPrismaService.appointment.findMany.mockResolvedValue(appointments);

      const result = await service.findAll(adminUser);

      expect(result).toEqual(appointments);
      expect(mockPrismaService.appointment.findMany).toHaveBeenCalledWith({
        include: {
          patient: true,
          doctor: { include: { user: true } },
        },
        orderBy: { scheduledAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return appointment for patient', async () => {
      mockPrismaService.appointment.findUnique.mockResolvedValue(
        mockAppointment
      );

      const result = await service.findOne('appointment-1', mockUser);

      expect(result).toEqual(mockAppointment);
      expect(mockPrismaService.appointment.findUnique).toHaveBeenCalledWith({
        where: { id: 'appointment-1' },
        include: {
          patient: true,
          doctor: { include: { user: true } },
        },
      });
    });

    it('should throw NotFoundException when appointment not found', async () => {
      mockPrismaService.appointment.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', mockUser)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ForbiddenException for unauthorized access', async () => {
      const unauthorizedAppointment = {
        ...mockAppointment,
        patientId: 'other-user',
        doctor: { ...mockDoctor, userId: 'other-doctor' },
      };
      mockPrismaService.appointment.findUnique.mockResolvedValue(
        unauthorizedAppointment
      );

      await expect(service.findOne('appointment-1', mockUser)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      status: AppointmentStatus.CONFIRMED,
      notes: 'Updated notes',
    };

    it('should update appointment successfully', async () => {
      const updatedAppointment = { ...mockAppointment, ...updateDto };
      mockPrismaService.appointment.findUnique.mockResolvedValue(
        mockAppointment
      );
      mockPrismaService.appointment.update.mockResolvedValue(
        updatedAppointment
      );

      const result = await service.update('appointment-1', updateDto, mockUser);

      expect(result).toEqual(updatedAppointment);
      expect(mockPrismaService.appointment.update).toHaveBeenCalledWith({
        where: { id: 'appointment-1' },
        data: updateDto,
        include: {
          patient: true,
          doctor: { include: { user: true } },
        },
      });
    });

    it('should throw NotFoundException when appointment not found', async () => {
      mockPrismaService.appointment.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', updateDto, mockUser)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for unauthorized update', async () => {
      const unauthorizedAppointment = {
        ...mockAppointment,
        patientId: 'other-user',
        doctor: { ...mockDoctor, userId: 'other-doctor' },
      };
      mockPrismaService.appointment.findUnique.mockResolvedValue(
        unauthorizedAppointment
      );

      await expect(
        service.update('appointment-1', updateDto, mockUser)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete appointment successfully', async () => {
      mockPrismaService.appointment.findUnique.mockResolvedValue(
        mockAppointment
      );
      mockPrismaService.appointment.delete.mockResolvedValue(mockAppointment);

      const result = await service.remove('appointment-1', mockUser);

      expect(result).toEqual(mockAppointment);
      expect(mockPrismaService.appointment.delete).toHaveBeenCalledWith({
        where: { id: 'appointment-1' },
      });
    });

    it('should throw NotFoundException when appointment not found', async () => {
      mockPrismaService.appointment.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent', mockUser)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ForbiddenException for unauthorized deletion', async () => {
      const unauthorizedAppointment = {
        ...mockAppointment,
        patientId: 'other-user',
        doctor: { ...mockDoctor, userId: 'other-doctor' },
      };
      mockPrismaService.appointment.findUnique.mockResolvedValue(
        unauthorizedAppointment
      );

      await expect(service.remove('appointment-1', mockUser)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('getDoctorAvailability', () => {
    it('should return available time slots', async () => {
      const date = '2024-01-15';
      mockPrismaService.appointment.findMany.mockResolvedValue([]);

      const result = await service.getDoctorAvailability('doctor-1', date);

      expect(result).toHaveLength(16); // 8 hours * 2 slots per hour
      expect(result[0]).toEqual({
        time: '09:00',
        available: true,
      });
    });

    it('should mark booked slots as unavailable', async () => {
      const date = '2024-01-15';
      const bookedAppointment = {
        ...mockAppointment,
        scheduledAt: new Date('2024-01-15T10:00:00Z'),
      };
      mockPrismaService.appointment.findMany.mockResolvedValue([
        bookedAppointment,
      ]);

      const result = await service.getDoctorAvailability('doctor-1', date);

      const bookedSlot = result.find(slot => slot.time === '10:00');
      expect(bookedSlot?.available).toBe(false);
    });
  });

  describe('getAppointmentStats', () => {
    it('should return appointment statistics for patient', async () => {
      mockPrismaService.appointment.count
        .mockResolvedValueOnce(5) // total
        .mockResolvedValueOnce(2) // pending
        .mockResolvedValueOnce(2) // confirmed
        .mockResolvedValueOnce(1); // completed

      const result = await service.getAppointmentStats(mockUser);

      expect(result).toEqual({
        total: 5,
        pending: 2,
        confirmed: 2,
        completed: 1,
        cancelled: 0,
      });
    });

    it('should return appointment statistics for doctor', async () => {
      const doctorUser = { ...mockUser, role: UserRole.DOCTOR };
      mockPrismaService.appointment.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3) // pending
        .mockResolvedValueOnce(4) // confirmed
        .mockResolvedValueOnce(3); // completed

      const result = await service.getAppointmentStats(doctorUser);

      expect(result).toEqual({
        total: 10,
        pending: 3,
        confirmed: 4,
        completed: 3,
        cancelled: 0,
      });
    });
  });

  describe('getTodaysAppointments', () => {
    it("should return today's appointments for doctor", async () => {
      const doctorUser = { ...mockUser, role: UserRole.DOCTOR };
      const todaysAppointments = [mockAppointment];
      mockPrismaService.appointment.findMany.mockResolvedValue(
        todaysAppointments
      );

      const result = await service.getTodaysAppointments(doctorUser);

      expect(result).toEqual(todaysAppointments);
      expect(mockPrismaService.appointment.findMany).toHaveBeenCalledWith({
        where: {
          doctor: { userId: 'user-1' },
          scheduledAt: {
            gte: expect.any(Date),
            lt: expect.any(Date),
          },
        },
        include: {
          patient: true,
          doctor: { include: { user: true } },
        },
        orderBy: { scheduledAt: 'asc' },
      });
    });

    it("should return today's appointments for patient", async () => {
      const todaysAppointments = [mockAppointment];
      mockPrismaService.appointment.findMany.mockResolvedValue(
        todaysAppointments
      );

      const result = await service.getTodaysAppointments(mockUser);

      expect(result).toEqual(todaysAppointments);
      expect(mockPrismaService.appointment.findMany).toHaveBeenCalledWith({
        where: {
          patientId: 'user-1',
          scheduledAt: {
            gte: expect.any(Date),
            lt: expect.any(Date),
          },
        },
        include: {
          patient: true,
          doctor: { include: { user: true } },
        },
        orderBy: { scheduledAt: 'asc' },
      });
    });
  });
});
