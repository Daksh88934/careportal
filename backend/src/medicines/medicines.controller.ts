import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  MedicinesService,
  CreateMedicineDto,
  UpdateMedicineDto,
  MedicineSearchFilters,
} from './medicines.service';

@ApiTags('Medicines')
@ApiBearerAuth()
@Controller('medicines')
@UseGuards(JwtAuthGuard)
export class MedicinesController {
  constructor(private medicinesService: MedicinesService) {}

  @Post()
  @Roles('admin', 'pharmacy')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create new medicine (Admin/Pharmacy only)' })
  @ApiResponse({ status: 201, description: 'Medicine created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid medicine data or duplicate',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async createMedicine(@Body() createMedicineDto: CreateMedicineDto) {
    const medicine =
      await this.medicinesService.createMedicine(createMedicineDto);
    return {
      success: true,
      data: medicine,
      message: 'Medicine created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all medicines with search and filters' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 20)',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'manufacturer',
    required: false,
    description: 'Filter by manufacturer',
  })
  @ApiQuery({
    name: 'requiresPrescription',
    required: false,
    description: 'Filter by prescription requirement',
  })
  @ApiQuery({
    name: 'isAvailable',
    required: false,
    description: 'Filter by availability',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Minimum price filter',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maximum price filter',
  })
  @ApiResponse({ status: 200, description: 'Medicines retrieved successfully' })
  async getAllMedicines(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('manufacturer') manufacturer?: string,
    @Query('requiresPrescription') requiresPrescription?: string,
    @Query('isAvailable') isAvailable?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    const filters: MedicineSearchFilters = {};
    if (category) filters.category = category;
    if (manufacturer) filters.manufacturer = manufacturer;
    if (requiresPrescription)
      filters.requiresPrescription = requiresPrescription === 'true';
    if (isAvailable) filters.isAvailable = isAvailable === 'true';
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

    const result = await this.medicinesService.getAllMedicines(
      pageNum,
      limitNum,
      search,
      filters
    );
    return {
      success: true,
      data: result,
      message: 'Medicines retrieved successfully',
    };
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular medicines' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of medicines to retrieve (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Popular medicines retrieved successfully',
  })
  async getPopularMedicines(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const medicines = await this.medicinesService.getPopularMedicines(limitNum);
    return {
      success: true,
      data: medicines,
      message: 'Popular medicines retrieved successfully',
    };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get medicine categories' })
  @ApiResponse({
    status: 200,
    description: 'Medicine categories retrieved successfully',
  })
  async getMedicineCategories() {
    const categories = await this.medicinesService.getMedicineCategories();
    return {
      success: true,
      data: categories,
      message: 'Medicine categories retrieved successfully',
    };
  }

  @Get('manufacturers')
  @ApiOperation({ summary: 'Get medicine manufacturers' })
  @ApiResponse({
    status: 200,
    description: 'Medicine manufacturers retrieved successfully',
  })
  async getMedicineManufacturers() {
    const manufacturers =
      await this.medicinesService.getMedicineManufacturers();
    return {
      success: true,
      data: manufacturers,
      message: 'Medicine manufacturers retrieved successfully',
    };
  }

  @Get('stats')
  @Roles('admin', 'pharmacy')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get medicine statistics (Admin/Pharmacy only)' })
  @ApiResponse({
    status: 200,
    description: 'Medicine statistics retrieved successfully',
  })
  async getMedicineStats() {
    const stats = await this.medicinesService.getMedicineStats();
    return {
      success: true,
      data: stats,
      message: 'Medicine statistics retrieved successfully',
    };
  }

  @Get('search/symptoms')
  @ApiOperation({ summary: 'Search medicines by symptoms' })
  @ApiQuery({
    name: 'symptoms',
    required: true,
    description: 'Comma-separated symptoms',
  })
  @ApiResponse({ status: 200, description: 'Medicines found for symptoms' })
  async searchMedicinesBySymptoms(@Query('symptoms') symptoms: string) {
    const symptomList = symptoms.split(',').map(s => s.trim());
    const medicines =
      await this.medicinesService.searchMedicinesBySymptoms(symptomList);
    return {
      success: true,
      data: medicines,
      message: 'Medicines found for symptoms',
    };
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get medicines by category' })
  @ApiResponse({
    status: 200,
    description: 'Medicines by category retrieved successfully',
  })
  async getMedicinesByCategory(@Param('category') category: string) {
    const medicines =
      await this.medicinesService.getMedicinesByCategory(category);
    return {
      success: true,
      data: medicines,
      message: 'Medicines by category retrieved successfully',
    };
  }

  @Get('manufacturer/:manufacturer')
  @ApiOperation({ summary: 'Get medicines by manufacturer' })
  @ApiResponse({
    status: 200,
    description: 'Medicines by manufacturer retrieved successfully',
  })
  async getMedicinesByManufacturer(
    @Param('manufacturer') manufacturer: string
  ) {
    const medicines =
      await this.medicinesService.getMedicinesByManufacturer(manufacturer);
    return {
      success: true,
      data: medicines,
      message: 'Medicines by manufacturer retrieved successfully',
    };
  }

  @Get('price-range')
  @ApiOperation({ summary: 'Get medicines by price range' })
  @ApiQuery({ name: 'minPrice', required: true, description: 'Minimum price' })
  @ApiQuery({ name: 'maxPrice', required: true, description: 'Maximum price' })
  @ApiResponse({
    status: 200,
    description: 'Medicines in price range retrieved successfully',
  })
  async getMedicinesByPriceRange(
    @Query('minPrice') minPrice: string,
    @Query('maxPrice') maxPrice: string
  ) {
    const medicines = await this.medicinesService.getMedicinesByPriceRange(
      parseFloat(minPrice),
      parseFloat(maxPrice)
    );
    return {
      success: true,
      data: medicines,
      message: 'Medicines in price range retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medicine by ID' })
  @ApiResponse({ status: 200, description: 'Medicine retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  async getMedicineById(@Param('id') id: string) {
    const medicine = await this.medicinesService.getMedicineById(id);
    return {
      success: true,
      data: medicine,
      message: 'Medicine retrieved successfully',
    };
  }

  @Get(':id/interactions')
  @ApiOperation({ summary: 'Get medicine interactions and warnings' })
  @ApiResponse({
    status: 200,
    description: 'Medicine interactions retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  async getMedicineInteractions(@Param('id') id: string) {
    const interactions =
      await this.medicinesService.getMedicineInteractions(id);
    return {
      success: true,
      data: interactions,
      message: 'Medicine interactions retrieved successfully',
    };
  }

  @Patch(':id')
  @Roles('admin', 'pharmacy')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update medicine (Admin/Pharmacy only)' })
  @ApiResponse({ status: 200, description: 'Medicine updated successfully' })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @HttpCode(HttpStatus.OK)
  async updateMedicine(
    @Param('id') id: string,
    @Body() updateMedicineDto: UpdateMedicineDto
  ) {
    const medicine = await this.medicinesService.updateMedicine(
      id,
      updateMedicineDto
    );
    return {
      success: true,
      data: medicine,
      message: 'Medicine updated successfully',
    };
  }

  @Patch(':id/availability')
  @Roles('admin', 'pharmacy')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Update medicine availability (Admin/Pharmacy only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Medicine availability updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @HttpCode(HttpStatus.OK)
  async updateMedicineAvailability(
    @Param('id') id: string,
    @Body() body: { isAvailable: boolean }
  ) {
    const medicine = await this.medicinesService.updateMedicineAvailability(
      id,
      body.isAvailable
    );
    return {
      success: true,
      data: medicine,
      message: 'Medicine availability updated successfully',
    };
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete medicine (Admin only)' })
  @ApiResponse({ status: 200, description: 'Medicine deleted successfully' })
  @ApiResponse({ status: 404, description: 'Medicine not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete medicine used in prescriptions',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @HttpCode(HttpStatus.OK)
  async deleteMedicine(@Param('id') id: string) {
    const result = await this.medicinesService.deleteMedicine(id);
    return {
      success: true,
      data: result,
      message: 'Medicine deleted successfully',
    };
  }

  @Post('bulk')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Bulk create medicines (Admin only)' })
  @ApiResponse({ status: 201, description: 'Bulk medicine creation completed' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async bulkCreateMedicines(@Body() medicines: CreateMedicineDto[]) {
    const result = await this.medicinesService.bulkCreateMedicines(medicines);
    return {
      success: true,
      data: result,
      message: 'Bulk medicine creation completed',
    };
  }
}
