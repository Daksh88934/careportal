import { Controller, Get, Patch, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('facility/:facilityId')
  async getInventory(@Param('facilityId') facilityId: string) {
    return this.inventoryService.getFacilityInventory(facilityId);
  }

  @Patch('facility/:facilityId/item/:itemId')
  @UseGuards(JwtAuthGuard)
  async updateStock(
    @Param('facilityId') facilityId: string,
    @Param('itemId') itemId: string,
    @Body() body: { currentStock?: number; isOperational?: boolean },
  ) {
    return this.inventoryService.updateStock(facilityId, itemId, body);
  }

  @Post('facility/:facilityId/check')
  async checkAvailability(
    @Param('facilityId') facilityId: string,
    @Body() body: { items: string[] },
  ) {
    return this.inventoryService.checkAvailability(facilityId, body.items || []);
  }

  @Post('facility/:facilityId/seed')
  @UseGuards(JwtAuthGuard)
  async seedDefault(
    @Param('facilityId') facilityId: string,
    @Body('tier') tier: string,
  ) {
    return this.inventoryService.seedDefaultFacilityInventory(facilityId, tier || 'PHC');
  }
}
