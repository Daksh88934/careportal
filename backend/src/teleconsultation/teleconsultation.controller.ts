import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { TeleconsultationService } from './teleconsultation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('teleconsultation')
export class TeleconsultationController {
  constructor(private readonly teleconsultationService: TeleconsultationService) {}

  @Post('store-forward')
  @UseGuards(JwtAuthGuard)
  async createCase(@Request() req: any, @Body() body: any) {
    const workerId = req.user?.id || 'system';
    return this.teleconsultationService.createStoreForwardCase(workerId, body);
  }

  @Get('queue')
  @UseGuards(JwtAuthGuard)
  async getDoctorQueue(
    @Request() req: any,
    @Query('resolved') resolved?: string,
  ) {
    const doctorId = req.user?.doctor?.id;
    return this.teleconsultationService.getDoctorQueue(doctorId, resolved === 'true');
  }

  @Get('case/:id')
  @UseGuards(JwtAuthGuard)
  async getCase(@Param('id') id: string) {
    return this.teleconsultationService.getCaseDetails(id);
  }

  @Patch('case/:id/respond')
  @UseGuards(JwtAuthGuard)
  async respondToCase(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { doctorResponse: string; prescriptionNotes?: string },
  ) {
    const doctorId = req.user?.doctor?.id || req.user?.id;
    return this.teleconsultationService.respondToCase(id, doctorId, body);
  }
}
