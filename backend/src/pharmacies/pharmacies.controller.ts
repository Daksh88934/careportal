import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  ParseUUIDPipe,
  ParseIntPipe,
  ParseFloatPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  PharmaciesService,
  CreatePharmacyDto,
  UpdatePharmacyDto,
  PharmacySearchFilters,
} from './pharmacies.service';

@Controller('pharmacies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PharmaciesController {
  constructor(private pharmaciesService: PharmaciesService) {}

  @Post()
  @Roles('PHARMACY', 'ADMIN')
  async createPharmacy(
    @Body() createPharmacyDto: CreatePharmacyDto,
    @Request() req
  ) {
    return this.pharmaciesService.createPharmacy(
      req.user.id,
      createPharmacyDto
    );
  }

  @Get()
  async getAllPharmacies(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('pincode') pincode?: string,
    @Query('isActive') isActive?: string,
    @Query('hasDelivery') hasDelivery?: string,
    @Query('maxDeliveryFee', new ParseFloatPipe({ optional: true }))
    maxDeliveryFee?: number
  ) {
    const filters: PharmacySearchFilters = {};

    if (city) filters.city = city;
    if (state) filters.state = state;
    if (pincode) filters.pincode = pincode;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (hasDelivery !== undefined) filters.hasDelivery = hasDelivery === 'true';
    if (maxDeliveryFee !== undefined) filters.maxDeliveryFee = maxDeliveryFee;

    return this.pharmaciesService.getAllPharmacies(filters, page, limit);
  }

  @Get('search')
  async searchPharmacies(
    @Query('q') query: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('pincode') pincode?: string,
    @Query('hasDelivery') hasDelivery?: string,
    @Query('maxDeliveryFee', new ParseFloatPipe({ optional: true }))
    maxDeliveryFee?: number
  ) {
    if (!query) {
      throw new BadRequestException('Search query is required');
    }

    const filters: PharmacySearchFilters = {};

    if (city) filters.city = city;
    if (state) filters.state = state;
    if (pincode) filters.pincode = pincode;
    if (hasDelivery !== undefined) filters.hasDelivery = hasDelivery === 'true';
    if (maxDeliveryFee !== undefined) filters.maxDeliveryFee = maxDeliveryFee;

    return this.pharmaciesService.searchPharmacies(query, filters);
  }

  @Get('nearby')
  async getNearbyPharmacies(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query('radius', new ParseFloatPipe({ optional: true })) radius = 10
  ) {
    return this.pharmaciesService.getNearbyPharmacies(lat, lng, radius);
  }

  @Get('top')
  async getTopPharmacies(
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10
  ) {
    return this.pharmaciesService.getTopPharmacies(limit);
  }

  @Get('stats')
  @Roles('ADMIN')
  async getPharmacyStats(@Query('pharmacyId') pharmacyId?: string) {
    return this.pharmaciesService.getPharmacyStats(pharmacyId);
  }

  @Get('by-city')
  async getPharmaciesByCity() {
    return this.pharmaciesService.getPharmaciesByCity();
  }

  @Get('by-state')
  async getPharmaciesByState() {
    return this.pharmaciesService.getPharmaciesByState();
  }

  @Get('my-pharmacy')
  @Roles('PHARMACY')
  async getMyPharmacy(@Request() req) {
    return this.pharmaciesService.getPharmacyByUserId(req.user.id);
  }

  @Get(':id')
  async getPharmacyById(@Param('id', ParseUUIDPipe) id: string) {
    return this.pharmaciesService.getPharmacyById(id);
  }

  @Put(':id')
  @Roles('PHARMACY', 'ADMIN')
  async updatePharmacy(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePharmacyDto: UpdatePharmacyDto,
    @Request() req
  ) {
    return this.pharmaciesService.updatePharmacy(
      id,
      updatePharmacyDto,
      req.user.id,
      req.user.role
    );
  }

  @Patch(':id/activate')
  @Roles('ADMIN')
  async activatePharmacy(@Param('id', ParseUUIDPipe) id: string) {
    return this.pharmaciesService.activatePharmacy(id);
  }

  @Patch(':id/deactivate')
  @Roles('ADMIN')
  async deactivatePharmacy(@Param('id', ParseUUIDPipe) id: string) {
    return this.pharmaciesService.deactivatePharmacy(id);
  }

  @Patch(':id/verify')
  @Roles('ADMIN')
  async verifyPharmacy(@Param('id', ParseUUIDPipe) id: string) {
    return this.pharmaciesService.verifyPharmacy(id);
  }

  @Patch(':id/location')
  @Roles('PHARMACY', 'ADMIN')
  async updatePharmacyLocation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { lat: number; lng: number },
    @Request() req
  ) {
    if (!body.lat || !body.lng) {
      throw new BadRequestException('Latitude and longitude are required');
    }
    return this.pharmaciesService.updatePharmacyLocation(
      id,
      body.lat,
      body.lng,
      req.user.id,
      req.user.role
    );
  }

  @Delete(':id')
  @Roles('PHARMACY', 'ADMIN')
  async deletePharmacy(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.pharmaciesService.deletePharmacy(
      id,
      req.user.id,
      req.user.role
    );
  }
}

// DTOs for validation
export class CreatePharmacyRequestDto {
  name: string;
  licenseNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  operatingHours: string;
  deliveryRadius?: number;
  deliveryFee?: number;
  minimumOrderAmount?: number;
  description?: string;
  website?: string;
}

export class UpdatePharmacyRequestDto {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  operatingHours?: string;
  deliveryRadius?: number;
  deliveryFee?: number;
  minimumOrderAmount?: number;
  description?: string;
  website?: string;
  isActive?: boolean;
}

export class UpdateLocationDto {
  lat: number;
  lng: number;
}
