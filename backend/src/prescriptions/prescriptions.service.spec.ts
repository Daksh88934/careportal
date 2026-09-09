import { Test, TestingModule } from '@nestjs/testing';
import { PrescriptionsService } from './prescriptions.service';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from './pdf.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('PrescriptionsService', () => {
  let service: PrescriptionsService;
  let prismaService: PrismaService;
  let pdfService: PdfService;

  const mockPrismaService = {
    prescription: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    appointment: {
      findUnique: jest.fn(),
    },
    medicine: {
      findMany: jest.fn(),
    },
    doctor: {
      findUnique: jest.fn(),
    },
  };

  const mockPdfService = {
    generatePrescriptionPdf: jest.fn(),
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
    status: 'COMPLETED',
    scheduledAt: new Date(),
    patient: mockUser,
    doctor: mockDoctor,
  };

  const mockMedicine = {
    id: 'medicine-1',
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    manufacturer: 'Test Pharma',
    category: 'Pain Relief',
    dosageForm: 'Tablet',
    strength: '500mg',
    price: 10.0,
    requiresPrescription: true,
  };

  const mockPrescription = {
    id: 'prescription-1',
    patientId: 'user-1',
    doctorId: 'doctor-1',
    appointmentId: 'appointment-1',
    medicines: [
      {
        medicineId: 'medicine-1',
        dosage: '1 tablet',
        frequency: 'Twice daily',
        duration: '5 days',
        instructions: 'Take after meals',
      },
    ],
    diagnosis: 'Fever',
    notes: 'Rest and take medication',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: mockUser,
    doctor: mockDoctor,
    appointment: mockAppointment,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrescriptionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: PdfService,
          useValue: mockPdfService,
        },
      ],
    }).compile();

    service = module.get<PrescriptionsService>(PrescriptionsService);
    prismaService = module.get<PrismaService>(PrismaService);
    pdfService = module.get<PdfService>(PdfService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createPrescriptionDto = {
      appointmentId: 'appointment-1',
      medicines: [
        {
          medicineId: 'medicine-1',
          dosage: '1 tablet',
          frequency: 'Twice daily',
          duration: '5 days',
          instructions: 'Take after meals',
        },
      ],
      diagnosis: 'Fever',
      notes: 'Rest and take medication',
    };

    const doctorUser = {
      ...mockUser,
      role: UserRole.DOCTOR,
      id: 'doctor-user-1',
    };

    it('should create a prescription successfully', async () => {
      mockPrismaService.appointment.findUnique.mockResolvedValue(
        mockAppointment
      );
      mockPrismaService.doctor.findUnique.mockResolvedValue(mockDoctor);
      mockPrismaService.medicine.findMany.mockResolvedValue([mockMedicine]);
      mockPrismaService.prescription.create.mockResolvedValue(mockPrescription);

      const result = await service.create(createPrescriptionDto, doctorUser);

      expect(result).toEqual(mockPrescription);
      expect(mockPrismaService.appointment.findUnique).toHaveBeenCalledWith({
        where: { id: 'appointment-1' },
        include: { patient: true, doctor: { include: { user: true } } },
      });
      expect(mockPrismaService.prescription.create).toHaveBeenCalledWith({
        data: {
          patientId: 'user-1',
          doctorId: 'doctor-1',
          appointmentId: 'appointment-1',
          medicines: createPrescriptionDto.medicines,
          diagnosis: 'Fever',
          notes: 'Rest and take medication',
          validUntil: expect.any(Date),
        },
        include: {
          patient: true,
          doctor: { include: { user: true } },
          appointment: true,
        },
      });
    });

    it('should throw NotFoundException when appointment not found', async () => {
      mockPrismaService.appointment.findUnique.mockResolvedValue(null);

      await expect(
        service.create(createPrescriptionDto, doctorUser)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when doctor not assigned to appointment', async () => {
      const wrongAppointment = {
        ...mockAppointment,
        doctor: { ...mockDoctor, userId: 'other-doctor' },
      };
      mockPrismaService.appointment.findUnique.mockResolvedValue(
        wrongAppointment
      );

      await expect(
        service.create(createPrescriptionDto, doctorUser)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when appointment not completed', async () => {
      const pendingAppointment = { ...mockAppointment, status: 'PENDING' };
      mockPrismaService.appointment.findUnique.mockResolvedValue(
        pendingAppointment
      );
      mockPrismaService.doctor.findUnique.mockResolvedValue(mockDoctor);

      await expect(
        service.create(createPrescriptionDto, doctorUser)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when medicine not found', async () => {
      mockPrismaService.appointment.findUnique.mockResolvedValue(
        mockAppointment
      );
      mockPrismaService.doctor.findUnique.mockResolvedValue(mockDoctor);
      mockPrismaService.medicine.findMany.mockResolvedValue([]);

      await expect(
        service.create(createPrescriptionDto, doctorUser)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException for non-doctor user', async () => {
      await expect(
        service.create(createPrescriptionDto, mockUser)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return all prescriptions for patient', async () => {
      const prescriptions = [mockPrescription];
      mockPrismaService.prescription.findMany.mockResolvedValue(prescriptions);

      const result = await service.findAll(mockUser);

      expect(result).toEqual(prescriptions);
      expect(mockPrismaService.prescription.findMany).toHaveBeenCalledWith({
        where: { patientId: 'user-1' },
        include: {
          patient: true,
          doctor: { include: { user: true } },
          appointment: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return all prescriptions for doctor', async () => {
      const doctorUser = { ...mockUser, role: UserRole.DOCTOR };
      const prescriptions = [mockPrescription];
      mockPrismaService.prescription.findMany.mockResolvedValue(prescriptions);

      const result = await service.findAll(doctorUser);

      expect(result).toEqual(prescriptions);
      expect(mockPrismaService.prescription.findMany).toHaveBeenCalledWith({
        where: { doctor: { userId: 'user-1' } },
        include: {
          patient: true,
          doctor: { include: { user: true } },
          appointment: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return all prescriptions for admin', async () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      const prescriptions = [mockPrescription];
      mockPrismaService.prescription.findMany.mockResolvedValue(prescriptions);

      const result = await service.findAll(adminUser);

      expect(result).toEqual(prescriptions);
      expect(mockPrismaService.prescription.findMany).toHaveBeenCalledWith({
        include: {
          patient: true,
          doctor: { include: { user: true } },
          appointment: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return prescription for patient', async () => {
      mockPrismaService.prescription.findUnique.mockResolvedValue(
        mockPrescription
      );

      const result = await service.findOne('prescription-1', mockUser);

      expect(result).toEqual(mockPrescription);
      expect(mockPrismaService.prescription.findUnique).toHaveBeenCalledWith({
        where: { id: 'prescription-1' },
        include: {
          patient: true,
          doctor: { include: { user: true } },
          appointment: true,
        },
      });
    });

    it('should throw NotFoundException when prescription not found', async () => {
      mockPrismaService.prescription.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', mockUser)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ForbiddenException for unauthorized access', async () => {
      const unauthorizedPrescription = {
        ...mockPrescription,
        patientId: 'other-user',
        doctor: { ...mockDoctor, userId: 'other-doctor' },
      };
      mockPrismaService.prescription.findUnique.mockResolvedValue(
        unauthorizedPrescription
      );

      await expect(service.findOne('prescription-1', mockUser)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      notes: 'Updated notes',
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    };

    const doctorUser = {
      ...mockUser,
      role: UserRole.DOCTOR,
      id: 'doctor-user-1',
    };

    it('should update prescription successfully', async () => {
      const updatedPrescription = { ...mockPrescription, ...updateDto };
      mockPrismaService.prescription.findUnique.mockResolvedValue(
        mockPrescription
      );
      mockPrismaService.prescription.update.mockResolvedValue(
        updatedPrescription
      );

      const result = await service.update(
        'prescription-1',
        updateDto,
        doctorUser
      );

      expect(result).toEqual(updatedPrescription);
      expect(mockPrismaService.prescription.update).toHaveBeenCalledWith({
        where: { id: 'prescription-1' },
        data: updateDto,
        include: {
          patient: true,
          doctor: { include: { user: true } },
          appointment: true,
        },
      });
    });

    it('should throw NotFoundException when prescription not found', async () => {
      mockPrismaService.prescription.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', updateDto, doctorUser)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for unauthorized update', async () => {
      const unauthorizedPrescription = {
        ...mockPrescription,
        doctor: { ...mockDoctor, userId: 'other-doctor' },
      };
      mockPrismaService.prescription.findUnique.mockResolvedValue(
        unauthorizedPrescription
      );

      await expect(
        service.update('prescription-1', updateDto, doctorUser)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for non-doctor user', async () => {
      await expect(
        service.update('prescription-1', updateDto, mockUser)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    const doctorUser = {
      ...mockUser,
      role: UserRole.DOCTOR,
      id: 'doctor-user-1',
    };

    it('should delete prescription successfully', async () => {
      mockPrismaService.prescription.findUnique.mockResolvedValue(
        mockPrescription
      );
      mockPrismaService.prescription.delete.mockResolvedValue(mockPrescription);

      const result = await service.remove('prescription-1', doctorUser);

      expect(result).toEqual(mockPrescription);
      expect(mockPrismaService.prescription.delete).toHaveBeenCalledWith({
        where: { id: 'prescription-1' },
      });
    });

    it('should throw NotFoundException when prescription not found', async () => {
      mockPrismaService.prescription.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent', doctorUser)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ForbiddenException for unauthorized deletion', async () => {
      const unauthorizedPrescription = {
        ...mockPrescription,
        doctor: { ...mockDoctor, userId: 'other-doctor' },
      };
      mockPrismaService.prescription.findUnique.mockResolvedValue(
        unauthorizedPrescription
      );

      await expect(
        service.remove('prescription-1', doctorUser)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('generatePdf', () => {
    it('should generate PDF for prescription', async () => {
      const pdfBuffer = Buffer.from('mock-pdf-content');
      mockPrismaService.prescription.findUnique.mockResolvedValue(
        mockPrescription
      );
      mockPdfService.generatePrescriptionPdf.mockResolvedValue(pdfBuffer);

      const result = await service.generatePdf('prescription-1', mockUser);

      expect(result).toEqual(pdfBuffer);
      expect(mockPdfService.generatePrescriptionPdf).toHaveBeenCalledWith(
        mockPrescription
      );
    });

    it('should throw NotFoundException when prescription not found', async () => {
      mockPrismaService.prescription.findUnique.mockResolvedValue(null);

      await expect(
        service.generatePdf('nonexistent', mockUser)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for unauthorized PDF generation', async () => {
      const unauthorizedPrescription = {
        ...mockPrescription,
        patientId: 'other-user',
        doctor: { ...mockDoctor, userId: 'other-doctor' },
      };
      mockPrismaService.prescription.findUnique.mockResolvedValue(
        unauthorizedPrescription
      );

      await expect(
        service.generatePdf('prescription-1', mockUser)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getPatientPrescriptions', () => {
    it('should return patient prescriptions', async () => {
      const prescriptions = [mockPrescription];
      mockPrismaService.prescription.findMany.mockResolvedValue(prescriptions);

      const result = await service.getPatientPrescriptions('user-1');

      expect(result).toEqual(prescriptions);
      expect(mockPrismaService.prescription.findMany).toHaveBeenCalledWith({
        where: { patientId: 'user-1' },
        include: {
          patient: true,
          doctor: { include: { user: true } },
          appointment: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getDoctorPrescriptions', () => {
    it('should return doctor prescriptions', async () => {
      const prescriptions = [mockPrescription];
      mockPrismaService.prescription.findMany.mockResolvedValue(prescriptions);

      const result = await service.getDoctorPrescriptions('doctor-1');

      expect(result).toEqual(prescriptions);
      expect(mockPrismaService.prescription.findMany).toHaveBeenCalledWith({
        where: { doctorId: 'doctor-1' },
        include: {
          patient: true,
          doctor: { include: { user: true } },
          appointment: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getRecentPrescriptions', () => {
    it('should return recent prescriptions for patient', async () => {
      const prescriptions = [mockPrescription];
      mockPrismaService.prescription.findMany.mockResolvedValue(prescriptions);

      const result = await service.getRecentPrescriptions(mockUser);

      expect(result).toEqual(prescriptions);
      expect(mockPrismaService.prescription.findMany).toHaveBeenCalledWith({
        where: { patientId: 'user-1' },
        include: {
          patient: true,
          doctor: { include: { user: true } },
          appointment: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
    });

    it('should return recent prescriptions for doctor', async () => {
      const doctorUser = { ...mockUser, role: UserRole.DOCTOR };
      const prescriptions = [mockPrescription];
      mockPrismaService.prescription.findMany.mockResolvedValue(prescriptions);

      const result = await service.getRecentPrescriptions(doctorUser);

      expect(result).toEqual(prescriptions);
      expect(mockPrismaService.prescription.findMany).toHaveBeenCalledWith({
        where: { doctor: { userId: 'user-1' } },
        include: {
          patient: true,
          doctor: { include: { user: true } },
          appointment: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
    });
  });

  describe('validatePrescription', () => {
    it('should return true for valid prescription', async () => {
      const validPrescription = {
        ...mockPrescription,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // Valid for 1 more day
      };
      mockPrismaService.prescription.findUnique.mockResolvedValue(
        validPrescription
      );

      const result = await service.validatePrescription('prescription-1');

      expect(result).toBe(true);
    });

    it('should return false for expired prescription', async () => {
      const expiredPrescription = {
        ...mockPrescription,
        validUntil: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired 1 day ago
      };
      mockPrismaService.prescription.findUnique.mockResolvedValue(
        expiredPrescription
      );

      const result = await service.validatePrescription('prescription-1');

      expect(result).toBe(false);
    });

    it('should return false for non-existent prescription', async () => {
      mockPrismaService.prescription.findUnique.mockResolvedValue(null);

      const result = await service.validatePrescription('nonexistent');

      expect(result).toBe(false);
    });
  });
});
