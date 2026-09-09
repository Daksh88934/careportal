import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiChatService, ChatResponse } from './ai-chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

export class SendMessageDto {
  message: string;
}

export class ChatHistoryQueryDto {
  limit?: number = 50;
}

@Controller('ai-chat')
@UseGuards(JwtAuthGuard)
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('message')
  @HttpCode(HttpStatus.OK)
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @Request() req: any
  ): Promise<ChatResponse> {
    const userId = req.user?.sub;
    return this.aiChatService.processMessage(sendMessageDto.message, userId);
  }

  @Get('history')
  async getChatHistory(
    @Query() query: ChatHistoryQueryDto,
    @Request() req: any
  ) {
    const userId = req.user?.sub;
    return this.aiChatService.getChatHistory(userId, query.limit);
  }

  @Get('insights')
  async getHealthInsights(@Request() req: any) {
    const userId = req.user?.sub;
    return this.aiChatService.getHealthInsights(userId);
  }

  @Post('message/anonymous')
  @HttpCode(HttpStatus.OK)
  async sendAnonymousMessage(
    @Body() sendMessageDto: SendMessageDto
  ): Promise<ChatResponse> {
    // Allow anonymous chat for demo purposes
    return this.aiChatService.processMessage(sendMessageDto.message);
  }
}
