import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { EhrService } from './ehr.service';
import { ConsentService } from './consent.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ehr')
export class EhrController {
  constructor(
    private readonly ehrService: EhrService,
    private readonly consentService: ConsentService,
  ) {}

  @Get('patient/:id')
  @UseGuards(JwtAuthGuard)
  async getRecord(@Request() req: any, @Param('id') id: string) {
    const accessor = {
      id: req.user?.id || 'unknown',
      role: req.user?.role || 'HEALTHCARE_WORKER',
      facilityName: req.user?.facility?.name,
    };
    return this.ehrService.getLongitudinalRecord(id, accessor);
  }

  @Post('encounter')
  @UseGuards(JwtAuthGuard)
  async recordEncounter(@Body() body: any) {
    return this.ehrService.recordEncounter(body);
  }

  @Post('condition')
  @UseGuards(JwtAuthGuard)
  async recordCondition(@Body() body: any) {
    return this.ehrService.recordCondition(body);
  }

  @Post('consent/grant')
  @UseGuards(JwtAuthGuard)
  async grantConsent(@Body() body: { patientId: string; targetTier?: any; validUntil?: Date }) {
    return this.consentService.grantConsent(body.patientId, body.targetTier, body.validUntil);
  }

  @Post('consent/revoke')
  @UseGuards(JwtAuthGuard)
  async revokeConsent(@Body() body: { patientId: string; consentId?: string }) {
    return this.consentService.revokeConsent(body.patientId, body.consentId);
  }

  @Get('consent/audit/:patientId')
  @UseGuards(JwtAuthGuard)
  async getAuditLogs(@Param('patientId') patientId: string) {
    return this.consentService.getAuditLogs(patientId);
  }
}
