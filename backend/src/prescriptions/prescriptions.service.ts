import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from './pdf.service';
import { ConfigService } from '@nestjs/config';

export interface CreatePrescriptionDto {
  appointmentId: string;
  patientId: string;
  diagnosis: string;
  symptoms: string;
  medicines: PrescriptionMedicineDto[];
  instructions: string;
  followUpDate?: Date;
  notes?: string;
}

export interface PrescriptionMedicineDto {
  medicineId: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface UpdatePrescriptionDto {
  diagnosis?: string;
  symptoms?: string;
  medicines?: PrescriptionMedicineDto[];
  instructions?: string;
  followUpDate?: Date;
  notes?: string;
}

@Injectable()
export class PrescriptionsService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private configService: ConfigService
  ) {}

  async createPrescription(doctorId: string, data: CreatePrescriptionDto) {
    // Verify appointment exists and belongs to the doctor
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: data.appointmentId },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
        prescriptions: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.doctorId !== doctorId) {
      throw new ForbiddenException(
        'You can only create prescriptions for your own appointments'
      );
    }

    if (
      appointment.status !== 'COMPLETED' &&
      appointment.status !== 'CONFIRMED'
    ) {
      throw new BadRequestException(
        'Prescription can only be created for completed or confirmed appointments'
      );
    }

    if (appointment.prescriptions && appointment.prescriptions.length > 0) {
      throw new BadRequestException(
        'Prescription already exists for this appointment'
      );
    }

    // Verify patient ID matches appointment
    if (appointment.patientId !== data.patientId) {
      throw new BadRequestException('Patient ID does not match appointment');
    }

    // Validate medicines exist
    const medicineIds = data.medicines.map(m => m.medicineId);
    const medicines = await this.prisma.medicine.findMany({
      where: { id: { in: medicineIds } },
    });

    if (medicines.length !== medicineIds.length) {
      throw new BadRequestException('One or more medicines not found');
    }

    // Map medicines to get full details for JSON
    const detailedMedicines = data.medicines.map(m => {
      const medInfo = medicines.find(med => med.id === m.medicineId);
      return {
        ...m,
        name: medInfo?.name,
      };
    });

    // Create prescription with JSON content
    const prescription = await this.prisma.prescription.create({
      data: {
        appointmentId: data.appointmentId,
        patientId: data.patientId,
        doctorId,
        notes: data.notes,
        content: {
          diagnosis: data.diagnosis,
          symptoms: data.symptoms,
          instructions: data.instructions,
          followUpDate: data.followUpDate,
          medicines: detailedMedicines,
        },
      },
      include: {
        appointment: {
          include: {
            doctor: { include: { user: true } },
            patient: { include: { user: true } },
          },
        },
      },
    });

    // Generate PDF
    const pdfBuffer =
      await this.pdfService.generatePrescriptionPdf(prescription);

    // Update prescription with PDF URL
    const pdfUrl = await this.uploadPdfToStorage(pdfBuffer, prescription.id);

    const updatedPrescription = await this.prisma.prescription.update({
      where: { id: prescription.id },
      data: { pdfUrl },
      include: {
        appointment: {
          include: {
            doctor: { include: { user: true } },
            patient: { include: { user: true } },
          },
        },
      },
    });

    return updatedPrescription;
  }

  async getPrescriptionById(id: string, userId: string, userRole: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            doctor: { include: { user: true } },
            patient: { include: { user: true } },
          },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    // Check access permissions
    const isDoctor = prescription.appointment.doctor.userId === userId;
    const isPatient = prescription.appointment.patient.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isDoctor && !isPatient && !isAdmin) {
      throw new ForbiddenException('Access denied to this prescription');
    }

    return prescription;
  }

  async getPrescriptionsByPatient(
    patientId: string,
    userId: string,
    userRole: string
  ) {
    // Verify access permissions
    if (userRole === 'PATIENT') {
      const patient = await this.prisma.patient.findFirst({
        where: { userId },
      });
      if (!patient || patient.id !== patientId) {
        throw new ForbiddenException('Access denied');
      }
    } else if (userRole !== 'ADMIN' && userRole !== 'DOCTOR') {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.prescription.findMany({
      where: { patientId },
      include: {
        appointment: {
          include: {
            doctor: { include: { user: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPrescriptionsByDoctor(
    doctorId: string,
    userId: string,
    userRole: string
  ) {
    // Verify access permissions
    if (userRole === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findFirst({
        where: { userId },
      });
      if (!doctor || doctor.id !== doctorId) {
        throw new ForbiddenException('Access denied');
      }
    } else if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.prescription.findMany({
      where: { doctorId },
      include: {
        appointment: {
          include: {
            patient: { include: { user: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePrescription(
    id: string,
    doctorId: string,
    data: UpdatePrescriptionDto
  ) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: { appointment: true },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    if (prescription.doctorId !== doctorId) {
      throw new ForbiddenException(
        'You can only update your own prescriptions'
      );
    }

    let updatedMedicines = undefined;

    // If medicines are being updated, validate them
    if (data.medicines) {
      const medicineIds = data.medicines.map(m => m.medicineId);
      const medicines = await this.prisma.medicine.findMany({
        where: { id: { in: medicineIds } },
      });

      if (medicines.length !== medicineIds.length) {
        throw new BadRequestException('One or more medicines not found');
      }

      updatedMedicines = data.medicines.map(m => {
        const medInfo = medicines.find(med => med.id === m.medicineId);
        return {
          ...m,
          name: medInfo?.name,
        };
      });
    }

    // Merge existing content with new content
    const existingContent = prescription.content as any || {};
    const newContent = {
      ...existingContent,
      diagnosis: data.diagnosis !== undefined ? data.diagnosis : existingContent.diagnosis,
      symptoms: data.symptoms !== undefined ? data.symptoms : existingContent.symptoms,
      instructions: data.instructions !== undefined ? data.instructions : existingContent.instructions,
      followUpDate: data.followUpDate !== undefined ? data.followUpDate : existingContent.followUpDate,
      medicines: updatedMedicines !== undefined ? updatedMedicines : existingContent.medicines,
    };

    const updatedPrescription = await this.prisma.prescription.update({
      where: { id },
      data: {
        notes: data.notes !== undefined ? data.notes : prescription.notes,
        content: newContent,
      },
      include: {
        appointment: {
          include: {
            doctor: { include: { user: true } },
            patient: { include: { user: true } },
          },
        },
      },
    });

    // Regenerate PDF if prescription was updated
    const pdfBuffer =
      await this.pdfService.generatePrescriptionPdf(updatedPrescription);
    const pdfUrl = await this.uploadPdfToStorage(pdfBuffer, prescription.id);

    return this.prisma.prescription.update({
      where: { id },
      data: { pdfUrl },
      include: {
        appointment: {
          include: {
            doctor: { include: { user: true } },
            patient: { include: { user: true } },
          },
        },
      },
    });
  }

  async deletePrescription(id: string, doctorId: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    if (prescription.doctorId !== doctorId) {
      throw new ForbiddenException(
        'You can only delete your own prescriptions'
      );
    }

    await this.prisma.prescription.delete({
      where: { id },
    });

    return { message: 'Prescription deleted successfully' };
  }

  async downloadPrescriptionPdf(id: string, userId: string, userRole: string) {
    const prescription = await this.getPrescriptionById(id, userId, userRole);

    if (prescription.pdfUrl) {
      return { pdfUrl: prescription.pdfUrl };
    }

    // Generate PDF if not exists
    const pdfBuffer =
      await this.pdfService.generatePrescriptionPdf(prescription);
    const pdfUrl = await this.uploadPdfToStorage(pdfBuffer, prescription.id);

    await this.prisma.prescription.update({
      where: { id },
      data: { pdfUrl },
    });

    return { pdfUrl };
  }

  async getPrescriptionStats(doctorId?: string) {
    const where = doctorId ? { doctorId } : {};

    const [total, thisMonth, thisWeek] = await Promise.all([
      this.prisma.prescription.count({ where }),
      this.prisma.prescription.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      this.prisma.prescription.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      total,
      thisMonth,
      thisWeek,
    };
  }

  private async uploadPdfToStorage(
    pdfBuffer: Buffer,
    prescriptionId: string
  ): Promise<string> {
    // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
    // For now, return a placeholder URL
    const fileName = `prescription_${prescriptionId}_${Date.now()}.pdf`;

    // This would be the actual cloud storage upload logic
    // const uploadResult = await this.cloudStorage.upload(pdfBuffer, fileName);
    // return uploadResult.url;

    // Placeholder implementation
    return `${this.configService.get('APP_URL')}/api/prescriptions/${prescriptionId}/pdf`;
  }
}
