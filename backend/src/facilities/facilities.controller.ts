import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FacilityTier } from '@prisma/client';

@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Get()
  async findAll(
    @Query('district') district?: string,
    @Query('tier') tier?: FacilityTier,
  ) {
    return this.facilitiesService.findAll(district, tier);
  }

  @Get('hierarchy')
  async getHierarchy() {
    return this.facilitiesService.getTiersHierarchy();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.facilitiesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: any) {
    return this.facilitiesService.create(body);
  }
}
