import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Get('facility/:facilityId')
  @UseGuards(JwtAuthGuard)
  async getFacilityDashboard(@Param('facilityId') facilityId: string) {
    return this.dashboardsService.getFacilityDashboard(facilityId);
  }

  @Get('district')
  @UseGuards(JwtAuthGuard)
  async getDistrictDashboard(@Query('district') district?: string) {
    return this.dashboardsService.getDistrictDashboard(district || 'Jaipur');
  }
}
