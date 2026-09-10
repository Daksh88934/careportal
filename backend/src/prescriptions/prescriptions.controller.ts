import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  PrescriptionsService,
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
} from './prescriptions.service';

@ApiTags('Prescriptions')
@ApiBearerAuth()
@Controller('prescriptions')
@UseGuards(JwtAuthGuard)
export class PrescriptionsController {
  constructor(private prescriptionsService: PrescriptionsService) {}

  @Post()
  @Roles('doctor')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create new prescription (Doctor only)' })
  @ApiResponse({
    status: 201,
    description: 'Prescription created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid prescription data' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async createPrescription(
    @Request() req: any,
    @Body() createPrescriptionDto: CreatePrescriptionDto
  ) {
    // Get doctor ID from user
    const doctor = await this.prescriptionsService['prisma'].doctor.findFirst({
      where: { userId: req.user.id },
    });

    if (!doctor) {
      throw new Error('Doctor profile not found');
    }

    const prescription = await this.prescriptionsService.createPrescription(
      doctor.id,
      createPrescriptionDto
    );

    return {
      success: true,
      data: prescription,
      message: 'Prescription created successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get prescription by ID' })
  @ApiResponse({
    status: 200,
    description: 'Prescription retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getPrescriptionById(@Param('id') id: string, @Request() req: any) {
    const prescription = await this.prescriptionsService.getPrescriptionById(
      id,
      req.user.id,
      req.user.role
    );

    return {
      success: true,
      data: prescription,
      message: 'Prescription retrieved successfully',
    };
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get prescriptions by patient' })
  @ApiResponse({
    status: 200,
    description: 'Patient prescriptions retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getPrescriptionsByPatient(
    @Param('patientId') patientId: string,
    @Request() req: any
  ) {
    const prescriptions =
      await this.prescriptionsService.getPrescriptionsByPatient(
        patientId,
        req.user.id,
        req.user.role
      );

    return {
      success: true,
      data: prescriptions,
      message: 'Patient prescriptions retrieved successfully',
    };
  }

  @Get('doctor/:doctorId')
  @ApiOperation({ summary: 'Get prescriptions by doctor' })
  @ApiResponse({
    status: 200,
    description: 'Doctor prescriptions retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getPrescriptionsByDoctor(
    @Param('doctorId') doctorId: string,
    @Request() req: any
  ) {
    const prescriptions =
      await this.prescriptionsService.getPrescriptionsByDoctor(
        doctorId,
        req.user.id,
        req.user.role
      );

    return {
      success: true,
      data: prescriptions,
      message: 'Doctor prescriptions retrieved successfully',
    };
  }

  @Patch(':id')
  @Roles('doctor')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update prescription (Doctor only)' })
  @ApiResponse({
    status: 200,
    description: 'Prescription updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @HttpCode(HttpStatus.OK)
  async updatePrescription(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto
  ) {
    // Get doctor ID from user
    const doctor = await this.prescriptionsService['prisma'].doctor.findFirst({
      where: { userId: req.user.id },
    });

    if (!doctor) {
      throw new Error('Doctor profile not found');
    }

    const prescription = await this.prescriptionsService.updatePrescription(
      id,
      doctor.id,
      updatePrescriptionDto
    );

    return {
      success: true,
      data: prescription,
      message: 'Prescription updated successfully',
    };
  }

  @Delete(':id')
  @Roles('doctor')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete prescription (Doctor only)' })
  @ApiResponse({
    status: 200,
    description: 'Prescription deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @HttpCode(HttpStatus.OK)
  async deletePrescription(@Param('id') id: string, @Request() req: any) {
    // Get doctor ID from user
    const doctor = await this.prescriptionsService['prisma'].doctor.findFirst({
      where: { userId: req.user.id },
    });

    if (!doctor) {
      throw new Error('Doctor profile not found');
    }

    const result = await this.prescriptionsService.deletePrescription(
      id,
      doctor.id
    );

    return {
      success: true,
      data: result,
      message: 'Prescription deleted successfully',
    };
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download prescription PDF' })
  @ApiResponse({ status: 200, description: 'PDF downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async downloadPrescriptionPdf(
    @Param('id') id: string,
    @Request() req: any,
    @Res() res: Response
  ) {
    const result = await this.prescriptionsService.downloadPrescriptionPdf(
      id,
      req.user.id,
      req.user.role
    );

    // In production, you would stream the PDF directly or redirect to the cloud URL
    return {
      success: true,
      data: result,
      message: 'PDF URL generated successfully',
    };
  }

  @Get('my/prescriptions')
  @ApiOperation({ summary: 'Get current user prescriptions' })
  @ApiResponse({
    status: 200,
    description: 'User prescriptions retrieved successfully',
  })
  async getMyPrescriptions(@Request() req: any) {
    const user = req.user;
    let prescriptions;

    if (user.role === 'DOCTOR') {
      // Find doctor record
      const doctor = await this.prescriptionsService['prisma'].doctor.findFirst(
        {
          where: { userId: user.id },
        }
      );
      if (doctor) {
        prescriptions =
          await this.prescriptionsService.getPrescriptionsByDoctor(
            doctor.id,
            user.id,
            user.role
          );
      }
    } else if (user.role === 'PATIENT') {
      // Find patient record
      const patient = await this.prescriptionsService[
        'prisma'
      ].patient.findFirst({
        where: { userId: user.id },
      });
      if (patient) {
        prescriptions =
          await this.prescriptionsService.getPrescriptionsByPatient(
            patient.id,
            user.id,
            user.role
          );
      }
    }

    return {
      success: true,
      data: prescriptions || [],
      message: 'User prescriptions retrieved successfully',
    };
  }

  @Get('stats')
  @Roles('admin', 'doctor')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get prescription statistics' })
  @ApiQuery({
    name: 'doctorId',
    required: false,
    description: 'Filter by doctor ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Prescription statistics retrieved successfully',
  })
  async getPrescriptionStats(
    @Query('doctorId') doctorId?: string,
    @Request() req?: any
  ) {
    // If user is doctor, only show their stats
    if (req.user.role === 'DOCTOR' && !doctorId) {
      const doctor = await this.prescriptionsService['prisma'].doctor.findFirst(
        {
          where: { userId: req.user.id },
        }
      );
      doctorId = doctor?.id;
    }

    const stats =
      await this.prescriptionsService.getPrescriptionStats(doctorId);

    return {
      success: true,
      data: stats,
      message: 'Prescription statistics retrieved successfully',
    };
  }

  @Get('appointment/:appointmentId/prescription')
  @ApiOperation({ summary: 'Get prescription by appointment ID' })
  @ApiResponse({
    status: 200,
    description: 'Prescription retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async getPrescriptionByAppointment(
    @Param('appointmentId') appointmentId: string,
    @Request() req: any
  ) {
    const prescription = await this.prescriptionsService[
      'prisma'
    ].prescription.findFirst({
      where: { appointmentId },
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
      return {
        success: true,
        data: null,
        message: 'No prescription found for this appointment',
      };
    }

    // Check access permissions
    const isDoctor = prescription.appointment.doctor.userId === req.user.id;
    const isPatient = prescription.appointment.patient.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isDoctor && !isPatient && !isAdmin) {
      throw new Error('Access denied to this prescription');
    }

    return {
      success: true,
      data: prescription,
      message: 'Prescription retrieved successfully',
    };
  }
}
