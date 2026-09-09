import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VideoService } from './video.service';

interface ConnectedUser {
  userId: string;
  roomId?: string;
  role: 'doctor' | 'patient';
  socketId: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/video',
})
export class VideoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(VideoGateway.name);
  private connectedUsers = new Map<string, ConnectedUser>();
  private roomParticipants = new Map<string, Set<string>>();

  constructor(private videoService: VideoService) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    try {
      // Extract user info from JWT token in handshake
      const token = client.handshake.auth?.token;
      if (!token) {
        client.disconnect();
        return;
      }

      // In a real implementation, you would verify the JWT token here
      // For now, we'll assume the token contains user info
      const userId = client.handshake.auth?.userId;
      if (!userId) {
        client.disconnect();
        return;
      }

      this.connectedUsers.set(client.id, {
        userId,
        socketId: client.id,
        role: client.handshake.auth?.role || 'patient',
      });

      client.emit('connected', { message: 'Connected to video server' });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    const user = this.connectedUsers.get(client.id);
    if (user?.roomId) {
      this.leaveRoom(client, { roomId: user.roomId });
    }

    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; appointmentId: string }
  ) {
    try {
      const user = this.connectedUsers.get(client.id);
      if (!user) {
        client.emit('error', { message: 'User not authenticated' });
        return;
      }

      // Verify user can join this room
      const roomConfig = await this.videoService.joinVideoRoom(
        data.roomId,
        user.userId
      );

      // Join the socket room
      await client.join(data.roomId);

      // Update user's room
      user.roomId = data.roomId;
      this.connectedUsers.set(client.id, user);

      // Add to room participants
      if (!this.roomParticipants.has(data.roomId)) {
        this.roomParticipants.set(data.roomId, new Set());
      }
      this.roomParticipants.get(data.roomId)!.add(client.id);

      // Get current participants
      const participants = await this.videoService.getRoomParticipants(
        data.roomId
      );

      // Notify others in the room
      client.to(data.roomId).emit('user-joined', {
        userId: user.userId,
        role: user.role,
        socketId: client.id,
      });

      // Send room info to the joining user
      client.emit('room-joined', {
        roomId: data.roomId,
        participants,
        iceServers: roomConfig.iceServers,
      });

      this.logger.log(`User ${user.userId} joined room ${data.roomId}`);
    } catch (error) {
      this.logger.error(`Join room error: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('leave-room')
  async leaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    try {
      const user = this.connectedUsers.get(client.id);
      if (!user) return;

      // Leave the socket room
      await client.leave(data.roomId);

      // Remove from room participants
      const participants = this.roomParticipants.get(data.roomId);
      if (participants) {
        participants.delete(client.id);
        if (participants.size === 0) {
          this.roomParticipants.delete(data.roomId);
        }
      }

      // Update user
      user.roomId = undefined;
      this.connectedUsers.set(client.id, user);

      // Notify others in the room
      client.to(data.roomId).emit('user-left', {
        userId: user.userId,
        socketId: client.id,
      });

      client.emit('room-left', { roomId: data.roomId });

      this.logger.log(`User ${user.userId} left room ${data.roomId}`);
    } catch (error) {
      this.logger.error(`Leave room error: ${error.message}`);
    }
  }

  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { offer: RTCSessionDescriptionInit; targetUserId: string }
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user?.roomId) return;

    // Find target user's socket
    const targetSocket = this.findUserSocket(data.targetUserId, user.roomId);
    if (targetSocket) {
      this.server.to(targetSocket).emit('offer', {
        offer: data.offer,
        fromUserId: user.userId,
        fromSocketId: client.id,
      });
    }
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { answer: RTCSessionDescriptionInit; targetUserId: string }
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user?.roomId) return;

    // Find target user's socket
    const targetSocket = this.findUserSocket(data.targetUserId, user.roomId);
    if (targetSocket) {
      this.server.to(targetSocket).emit('answer', {
        answer: data.answer,
        fromUserId: user.userId,
        fromSocketId: client.id,
      });
    }
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { candidate: RTCIceCandidateInit; targetUserId: string }
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user?.roomId) return;

    // Find target user's socket
    const targetSocket = this.findUserSocket(data.targetUserId, user.roomId);
    if (targetSocket) {
      this.server.to(targetSocket).emit('ice-candidate', {
        candidate: data.candidate,
        fromUserId: user.userId,
        fromSocketId: client.id,
      });
    }
  }

  @SubscribeMessage('toggle-video')
  handleToggleVideo(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { enabled: boolean }
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user?.roomId) return;

    client.to(user.roomId).emit('user-video-toggle', {
      userId: user.userId,
      enabled: data.enabled,
    });
  }

  @SubscribeMessage('toggle-audio')
  handleToggleAudio(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { enabled: boolean }
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user?.roomId) return;

    client.to(user.roomId).emit('user-audio-toggle', {
      userId: user.userId,
      enabled: data.enabled,
    });
  }

  @SubscribeMessage('screen-share')
  handleScreenShare(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { enabled: boolean }
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user?.roomId) return;

    client.to(user.roomId).emit('user-screen-share', {
      userId: user.userId,
      enabled: data.enabled,
    });
  }

  @SubscribeMessage('chat-message')
  handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { message: string; timestamp: string }
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user?.roomId) return;

    // Broadcast message to all users in the room
    this.server.to(user.roomId).emit('chat-message', {
      message: data.message,
      timestamp: data.timestamp,
      fromUserId: user.userId,
      fromRole: user.role,
    });
  }

  @SubscribeMessage('end-call')
  async handleEndCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { appointmentId: string }
  ) {
    try {
      const user = this.connectedUsers.get(client.id);
      if (!user?.roomId) return;

      // End the video call in the service
      await this.videoService.endVideoCall(data.appointmentId, user.userId);

      // Notify all users in the room
      this.server.to(user.roomId).emit('call-ended', {
        endedBy: user.userId,
        reason: 'User ended call',
      });

      // Remove all users from the room
      const participants = this.roomParticipants.get(user.roomId);
      if (participants) {
        for (const socketId of participants) {
          const socket = this.server.sockets.sockets.get(socketId);
          if (socket) {
            await socket.leave(user.roomId);
            const participantUser = this.connectedUsers.get(socketId);
            if (participantUser) {
              participantUser.roomId = undefined;
              this.connectedUsers.set(socketId, participantUser);
            }
          }
        }
        this.roomParticipants.delete(user.roomId);
      }

      this.logger.log(
        `Call ended for room ${user.roomId} by user ${user.userId}`
      );
    } catch (error) {
      this.logger.error(`End call error: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('connection-quality')
  handleConnectionQuality(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { quality: 'excellent' | 'good' | 'poor' | 'disconnected' }
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user?.roomId) return;

    client.to(user.roomId).emit('user-connection-quality', {
      userId: user.userId,
      quality: data.quality,
    });
  }

  private findUserSocket(userId: string, roomId: string): string | null {
    for (const [socketId, user] of this.connectedUsers.entries()) {
      if (user.userId === userId && user.roomId === roomId) {
        return socketId;
      }
    }
    return null;
  }

  // Admin methods for monitoring
  getRoomStats() {
    const stats = {
      totalConnections: this.connectedUsers.size,
      activeRooms: this.roomParticipants.size,
      roomDetails: Array.from(this.roomParticipants.entries()).map(
        ([roomId, participants]) => ({
          roomId,
          participantCount: participants.size,
        })
      ),
    };
    return stats;
  }
}
