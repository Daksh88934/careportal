import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('video')
@ApiBearerAuth()
@Controller('video')
@UseGuards(JwtAuthGuard)
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('room/create/:appointmentId')
  @ApiOperation({ summary: 'Create video room for appointment' })
  @ApiResponse({ status: 201, description: 'Video room created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async createVideoRoom(
    @Param('appointmentId') appointmentId: string,
    @Request() req: any
  ) {
    const userId = req.user.sub;
    return this.videoService.createVideoRoom(appointmentId, userId);
  }

  @Post('room/join/:appointmentId')
  @ApiOperation({ summary: 'Join video room for appointment' })
  @ApiResponse({ status: 200, description: 'Joined video room successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async joinVideoRoom(
    @Param('appointmentId') appointmentId: string,
    @Request() req: any
  ) {
    const userId = req.user.sub;
    return this.videoService.joinVideoRoom(appointmentId, userId);
  }

  @Post('call/end/:appointmentId')
  @ApiOperation({ summary: 'End video call (doctor only)' })
  @ApiResponse({ status: 200, description: 'Video call ended successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async endVideoCall(
    @Param('appointmentId') appointmentId: string,
    @Request() req: any
  ) {
    const userId = req.user.sub;
    return this.videoService.endVideoCall(appointmentId, userId);
  }

  @Get('room/details/:appointmentId')
  @ApiOperation({ summary: 'Get video room details' })
  @ApiResponse({ status: 200, description: 'Video room details retrieved' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async getVideoRoomDetails(
    @Param('appointmentId') appointmentId: string,
    @Request() req: any
  ) {
    const userId = req.user.sub;
    return this.videoService.getVideoRoomDetails(appointmentId, userId);
  }

  @Get('ice-servers')
  @ApiOperation({ summary: 'Get ICE servers configuration' })
  @ApiResponse({ status: 200, description: 'ICE servers configuration' })
  async getIceServers() {
    return {
      iceServers: this.videoService.getIceServers(),
    };
  }

  @Post('consultation/start')
  @ApiOperation({ summary: 'Start video consultation' })
  @ApiResponse({ status: 200, description: 'Consultation started' })
  async startConsultation(
    @Body() body: { appointmentId: string },
    @Request() req: any
  ) {
    const { appointmentId } = body;
    const userId = req.user.sub;

    if (!appointmentId) {
      throw new BadRequestException('Appointment ID is required');
    }

    // Create or join video room
    const roomData = await this.videoService.createVideoRoom(
      appointmentId,
      userId
    );

    return {
      message: 'Video consultation started',
      roomData,
      consultationUrl: `/consultation/room/${roomData.roomId}`,
      jitsiUrl: roomData.jitsiLink,
    };
  }

  @Get('consultation/room/:roomId')
  @ApiOperation({ summary: 'Get consultation room info by room ID' })
  @ApiResponse({ status: 200, description: 'Room information retrieved' })
  async getConsultationRoom(
    @Param('roomId') roomId: string,
    @Request() req: any
  ) {
    // Find appointment by room ID
    const appointment = await this.videoService['prisma'].appointment.findFirst(
      {
        where: { videoRoomId: roomId },
        include: {
          patient: { include: { user: true } },
          doctor: { include: { user: true } },
        },
      }
    );

    if (!appointment) {
      throw new BadRequestException('Video room not found');
    }

    const userId = req.user.sub;
    const isAuthorized =
      appointment.patient.userId === userId ||
      appointment.doctor.userId === userId;

    if (!isAuthorized) {
      throw new BadRequestException('Access denied to this video room');
    }

    return {
      roomId,
      appointment: {
        id: appointment.id,
        scheduledAt: appointment.scheduledAt,
        status: appointment.status,
        duration: appointment.duration,
      },
      participants: {
        patient: {
          id: appointment.patient.id,
          name: appointment.patient.user.name,
          email: appointment.patient.user.email,
        },
        doctor: {
          id: appointment.doctor.id,
          name: appointment.doctor.user.name,
          email: appointment.doctor.user.email,
        },
      },
      userRole: appointment.patient.userId === userId ? 'patient' : 'doctor',
    };
  }
}
