import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReferralStatus, TriageClassification } from '@prisma/client';

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: any) {
    return this.referralsService.create(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('facilityId') facilityId?: string,
    @Query('patientId') patientId?: string,
    @Query('status') status?: ReferralStatus,
    @Query('stale') stale?: string,
    @Query('urgency') urgency?: TriageClassification,
  ) {
    return this.referralsService.findAll({
      facilityId,
      patientId,
      status,
      staleOnly: stale === 'true',
      urgency,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.referralsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: ReferralStatus; outcome?: string },
  ) {
    return this.referralsService.updateStatus(id, body.status, body.outcome);
  }

  @Post('check-stale')
  @UseGuards(JwtAuthGuard)
  async checkStale() {
    return this.referralsService.flagStaleReferrals();
  }
}
