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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  AppointmentsService,
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from './appointments.service';
import { AppointmentStatus } from '@prisma/client';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid appointment data or scheduling conflict',
  })
  async createAppointment(@Body() createAppointmentDto: CreateAppointmentDto) {
    const appointment =
      await this.appointmentsService.createAppointment(createAppointmentDto);
    return {
      success: true,
      data: appointment,
      message: 'Appointment created successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Appointment retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async getAppointmentById(@Param('id') id: string) {
    const appointment = await this.appointmentsService.getAppointmentById(id);
    return {
      success: true,
      data: appointment,
      message: 'Appointment retrieved successfully',
    };
  }

  @Get('doctor/:doctorId')
  @ApiOperation({ summary: 'Get appointments by doctor' })
  @ApiQuery({ name: 'status', required: false, enum: AppointmentStatus })
  @ApiResponse({
    status: 200,
    description: 'Doctor appointments retrieved successfully',
  })
  async getAppointmentsByDoctor(
    @Param('doctorId') doctorId: string,
    @Query('status') status?: AppointmentStatus
  ) {
    const appointments = await this.appointmentsService.getAppointmentsByDoctor(
      doctorId,
      status
    );
    return {
      success: true,
      data: appointments,
      message: 'Doctor appointments retrieved successfully',
    };
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get appointments by patient' })
  @ApiQuery({ name: 'status', required: false, enum: AppointmentStatus })
  @ApiResponse({
    status: 200,
    description: 'Patient appointments retrieved successfully',
  })
  async getAppointmentsByPatient(
    @Param('patientId') patientId: string,
    @Query('status') status?: AppointmentStatus
  ) {
    const appointments =
      await this.appointmentsService.getAppointmentsByPatient(
        patientId,
        status
      );
    return {
      success: true,
      data: appointments,
      message: 'Patient appointments retrieved successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update appointment' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @ApiResponse({ status: 409, description: 'Scheduling conflict' })
  @HttpCode(HttpStatus.OK)
  async updateAppointment(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto
  ) {
    const appointment = await this.appointmentsService.updateAppointment(
      id,
      updateAppointmentDto
    );
    return {
      success: true,
      data: appointment,
      message: 'Appointment updated successfully',
    };
  }

  @Patch(':id/confirm')
  @Roles('doctor')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Confirm appointment (Doctor only)' })
  @ApiResponse({
    status: 200,
    description: 'Appointment confirmed successfully',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @HttpCode(HttpStatus.OK)
  async confirmAppointment(@Param('id') id: string) {
    const appointment = await this.appointmentsService.confirmAppointment(id);
    return {
      success: true,
      data: appointment,
      message: 'Appointment confirmed successfully',
    };
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel appointment' })
  @ApiResponse({
    status: 200,
    description: 'Appointment cancelled successfully',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @HttpCode(HttpStatus.OK)
  async cancelAppointment(
    @Param('id') id: string,
    @Body() body: { reason?: string }
  ) {
    const appointment = await this.appointmentsService.cancelAppointment(
      id,
      body.reason
    );
    return {
      success: true,
      data: appointment,
      message: 'Appointment cancelled successfully',
    };
  }

  @Patch(':id/complete')
  @Roles('doctor')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Complete appointment (Doctor only)' })
  @ApiResponse({
    status: 200,
    description: 'Appointment completed successfully',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  @HttpCode(HttpStatus.OK)
  async completeAppointment(
    @Param('id') id: string,
    @Body() body: { doctorNotes?: string }
  ) {
    const appointment = await this.appointmentsService.completeAppointment(
      id,
      body.doctorNotes
    );
    return {
      success: true,
      data: appointment,
      message: 'Appointment completed successfully',
    };
  }

  @Get('doctor/:doctorId/availability')
  @ApiOperation({ summary: 'Get doctor availability for a specific date' })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiResponse({
    status: 200,
    description: 'Doctor availability retrieved successfully',
  })
  async getDoctorAvailability(
    @Param('doctorId') doctorId: string,
    @Query('date') date: string
  ) {
    const availabilityDate = new Date(date);
    const availableSlots = await this.appointmentsService.getDoctorAvailability(
      doctorId,
      availabilityDate
    );
    return {
      success: true,
      data: {
        date: availabilityDate,
        availableSlots,
      },
      message: 'Doctor availability retrieved successfully',
    };
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming appointments' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of appointments to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'Upcoming appointments retrieved successfully',
  })
  async getUpcomingAppointments(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const appointments =
      await this.appointmentsService.getUpcomingAppointments(limitNumber);
    return {
      success: true,
      data: appointments,
      message: 'Upcoming appointments retrieved successfully',
    };
  }

  @Get('stats')
  @Roles('admin', 'doctor')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get appointment statistics' })
  @ApiQuery({
    name: 'doctorId',
    required: false,
    description: 'Filter by doctor ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment statistics retrieved successfully',
  })
  async getAppointmentStats(@Query('doctorId') doctorId?: string) {
    const stats = await this.appointmentsService.getAppointmentStats(doctorId);
    return {
      success: true,
      data: stats,
      message: 'Appointment statistics retrieved successfully',
    };
  }

  @Get('my/appointments')
  @ApiOperation({ summary: 'Get current user appointments' })
  @ApiQuery({ name: 'status', required: false, enum: AppointmentStatus })
  @ApiResponse({
    status: 200,
    description: 'User appointments retrieved successfully',
  })
  async getMyAppointments(
    @Request() req: any,
    @Query('status') status?: AppointmentStatus
  ) {
    const user = req.user;
    let appointments;

    // Determine if user is doctor or patient and fetch accordingly
    if (user.role === 'DOCTOR') {
      // Find doctor record
      const doctor = await this.appointmentsService['prisma'].doctor.findFirst({
        where: { userId: user.id },
      });
      if (doctor) {
        appointments = await this.appointmentsService.getAppointmentsByDoctor(
          doctor.id,
          status
        );
      }
    } else if (user.role === 'PATIENT') {
      // Find patient record
      const patient = await this.appointmentsService[
        'prisma'
      ].patient.findFirst({
        where: { userId: user.id },
      });
      if (patient) {
        appointments = await this.appointmentsService.getAppointmentsByPatient(
          patient.id,
          status
        );
      }
    }

    return {
      success: true,
      data: appointments || [],
      message: 'User appointments retrieved successfully',
    };
  }
}
