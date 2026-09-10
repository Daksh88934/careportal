import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class VideoService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService
  ) {}

  async createVideoRoom(appointmentId: string, userId: string) {
    // Verify appointment exists and user has access
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        OR: [{ patientId: userId }, { doctorId: userId }],
      },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found or access denied');
    }

    // Check if appointment is confirmed and within time window
    if (appointment.status !== 'CONFIRMED') {
      throw new BadRequestException(
        'Appointment must be confirmed to start video call'
      );
    }

    const now = new Date();
    const appointmentTime = new Date(appointment.scheduledAt);
    const timeDiff =
      Math.abs(now.getTime() - appointmentTime.getTime()) / (1000 * 60); // minutes

    if (timeDiff > 15) {
      throw new BadRequestException(
        'Video call can only be started within 15 minutes of appointment time'
      );
    }

    // Generate unique room ID if not exists
    let roomId = appointment.videoRoomId;
    if (!roomId) {
      roomId = `carex-${appointmentId}-${uuidv4().substring(0, 8)}`;

      await this.prisma.appointment.update({
        where: { id: appointmentId },
        data: { videoRoomId: roomId },
      });
    }

    // Generate Jitsi Meet link with JWT token
    const jitsiLink = this.generateJitsiMeetLink(roomId, appointment);

    return {
      roomId,
      jitsiLink,
      appointment: {
        id: appointment.id,
        scheduledAt: appointment.scheduledAt,
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
    };
  }

  private generateJitsiMeetLink(roomId: string, appointment: any): string {
    const jitsiAppId = this.config.get('JITSI_APP_ID');
    const jitsiDomain = this.config.get('JITSI_DOMAIN') || '8x8.vc';

    // Create JWT token for Jitsi authentication
    const jitsiJWT = this.generateJitsiJWT(roomId, appointment);

    // Generate Jitsi Meet URL
    const baseUrl = `https://${jitsiDomain}/${jitsiAppId}/${roomId}`;
    const params = new URLSearchParams({
      jwt: jitsiJWT,
      config: JSON.stringify({
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
        requireDisplayName: true,
        enableClosePage: false,
      }),
    });

    return `${baseUrl}?${params.toString()}`;
  }

  private generateJitsiJWT(roomId: string, appointment: any): string {
    const jitsiAppId = this.config.get('JITSI_APP_ID');
    const jitsiKid = this.config.get('JITSI_KID');

    // Use the provided JWT as base or create new one
    const providedJWT = this.config.get('JITSI_JWT');

    if (providedJWT) {
      return providedJWT;
    }

    // Fallback: create basic JWT structure
    const payload = {
      aud: 'jitsi',
      iss: 'chat',
      sub: jitsiAppId,
      room: roomId,
      context: {
        user: {
          id: appointment.doctor.user.id,
          name: appointment.doctor.user.name,
          email: appointment.doctor.user.email,
          moderator: true,
        },
        features: {
          livestreaming: true,
          recording: true,
          transcription: true,
          'outbound-call': true,
        },
      },
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiry
      iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, 'fallback-secret', {
      algorithm: 'HS256',
      header: { kid: jitsiKid, alg: 'HS256' } as any,
    });
  }

  async getRoomParticipants(roomId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { videoRoomId: roomId },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });

    if (!appointment) return [];

    return [
      {
        id: appointment.doctor.user.id,
        name: appointment.doctor.user.name,
        role: 'DOCTOR',
      },
      {
        id: appointment.patient.user.id,
        name: appointment.patient.user.name,
        role: 'PATIENT',
      },
    ];
  }

  async joinVideoRoom(appointmentId: string, userId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        OR: [
          { id: appointmentId, patient: { userId } },
          { id: appointmentId, doctor: { userId } },
          { videoRoomId: appointmentId, patient: { userId } },
          { videoRoomId: appointmentId, doctor: { userId } },
        ],
      },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found or access denied');
    }

    if (!appointment.videoRoomId) {
      throw new BadRequestException('Video room not created yet');
    }

    const jitsiLink = this.generateJitsiMeetLink(
      appointment.videoRoomId,
      appointment
    );

    return {
      roomId: appointment.videoRoomId,
      jitsiLink,
      userRole: appointment.patient.userId === userId ? 'patient' : 'doctor',
      iceServers: this.getIceServers(),
    };
  }

  async endVideoCall(appointmentId: string, userId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        OR: [
          { id: appointmentId, doctor: { userId } },
          { videoRoomId: appointmentId, doctor: { userId } },
        ],
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found or access denied');
    }

    // Update appointment status to completed
    await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: 'COMPLETED',
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Video call ended successfully',
      appointmentId: appointment.id,
    };
  }

  async getVideoRoomDetails(appointmentId: string, userId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        OR: [
          { id: appointmentId, patient: { userId } },
          { id: appointmentId, doctor: { userId } },
          { videoRoomId: appointmentId, patient: { userId } },
          { videoRoomId: appointmentId, doctor: { userId } },
        ],
      },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found or access denied');
    }

    return {
      roomId: appointment.videoRoomId,
      status: appointment.status,
      scheduledAt: appointment.scheduledAt,
      duration: appointment.duration,
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
    };
  }

  // ICE servers configuration for WebRTC fallback
  getIceServers() {
    return [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: 'turn:turnserver.example.com:3478',
        username: this.config.get('COTURN_USERNAME'),
        credential: this.config.get('COTURN_PASSWORD'),
      },
    ];
  }
}
