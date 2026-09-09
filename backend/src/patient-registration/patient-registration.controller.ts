import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { PatientRegistrationService } from './patient-registration.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('patient-registration')
export class PatientRegistrationController {
  constructor(private readonly registrationService: PatientRegistrationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async register(@Request() req: any, @Body() body: any) {
    const workerId = req.user?.id || 'system';
    return this.registrationService.register(workerId, body);
  }

  @Post('bulk-sync')
  @UseGuards(JwtAuthGuard)
  async bulkSync(@Request() req: any, @Body() body: { items: any[] }) {
    const workerId = req.user?.id || 'system';
    return this.registrationService.bulkSync(workerId, body.items || []);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Request() req: any,
    @Query('facilityId') facilityId?: string,
    @Query('search') search?: string,
  ) {
    const workerId = req.user?.role === 'FRONTLINE_WORKER' ? req.user.id : undefined;
    return this.registrationService.findAll(workerId, facilityId, search);
  }

  @Get('by-abha')
  async findByAbha(@Query('abhaId') abhaId: string) {
    return this.registrationService.findByAbha(abhaId);
  }
}
