import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { TriageService } from './triage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { evaluateTriage } from './triage-rules';

@Controller('triage')
export class TriageController {
  constructor(private readonly triageService: TriageService) {}

  @Post('evaluate-preview')
  async evaluatePreview(@Body() body: { vitals: any; symptoms: any }) {
    return evaluateTriage(body.vitals || {}, body.symptoms || {});
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async assess(@Request() req: any, @Body() body: any) {
    const workerId = req.user?.id || 'system';
    return this.triageService.assess(workerId, body);
  }

  @Get('patient/:patientId')
  @UseGuards(JwtAuthGuard)
  async findByPatient(@Param('patientId') patientId: string) {
    return this.triageService.findByPatient(patientId);
  }

  @Get('recent')
  @UseGuards(JwtAuthGuard)
  async findRecent(@Query('limit') limit?: string) {
    return this.triageService.findRecent(limit ? parseInt(limit, 10) : 50);
  }
}
