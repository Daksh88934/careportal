import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmergencyAlertStatus } from '@prisma/client';

@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Post('alert')
  @UseGuards(JwtAuthGuard)
  async triggerAlert(@Request() req: any, @Body() body: any) {
    const workerId = req.user?.id || 'system';
    return this.emergencyService.triggerAlert(workerId, body);
  }

  @Get('alerts')
  @UseGuards(JwtAuthGuard)
  async getAlerts(@Query('status') status?: EmergencyAlertStatus) {
    return this.emergencyService.getAlerts(status);
  }

  @Patch('alerts/:id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: EmergencyAlertStatus; notes?: string },
  ) {
    return this.emergencyService.updateStatus(id, body.status, body.notes);
  }
}
