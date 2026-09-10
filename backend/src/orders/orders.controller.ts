import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  OrdersService,
  CreateOrderDto,
  UpdateOrderDto,
  OrderSearchFilters,
} from './orders.service';
import { OrderStatus } from '@prisma/client';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @Roles('PATIENT', 'ADMIN')
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    if (req.user.role === 'PATIENT') {
      const patient = await this.ordersService['prisma'].patient.findFirst({
        where: { userId: req.user.id },
      });
      if (!patient || patient.id !== createOrderDto.patientId) {
        throw new BadRequestException(
          'Can only create orders for your own patient profile'
        );
      }
    }
    return this.ordersService.createOrder(createOrderDto);
  }

  @Post('prescription/:prescriptionId')
  @Roles('PATIENT', 'ADMIN')
  async createOrderFromPrescription(
    @Param('prescriptionId', ParseUUIDPipe) prescriptionId: string,
    @Body() body: { pharmacyId: string; deliveryAddress: string; deliveryType?: 'PICKUP' | 'DELIVERY' },
    @Request() req
  ) {
    return this.ordersService.createOrderFromPrescription(
      prescriptionId,
      body.pharmacyId,
      body.deliveryAddress,
      body.deliveryType || 'DELIVERY'
    );
  }

  @Get(':id')
  @Roles('PATIENT', 'PHARMACY', 'ADMIN')
  async getOrderById(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.ordersService.getOrderById(id, req.user.id, req.user.role);
  }

  @Get('patient/:patientId')
  @Roles('PATIENT', 'ADMIN')
  async getOrdersByPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Request() req
  ) {
    return this.ordersService.getOrdersByPatient(
      patientId,
      req.user.id,
      req.user.role
    );
  }

  @Get('pharmacy/:pharmacyId')
  @Roles('PHARMACY', 'ADMIN')
  async getOrdersByPharmacy(
    @Param('pharmacyId', ParseUUIDPipe) pharmacyId: string,
    @Request() req,
    @Query('status') status?: OrderStatus,
    @Query('deliveryType') deliveryType?: 'PICKUP' | 'DELIVERY',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const filters: OrderSearchFilters = {};

    if (status) filters.status = status;
    if (deliveryType) filters.deliveryType = deliveryType;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    return this.ordersService.getOrdersByPharmacy(
      pharmacyId,
      req.user.id,
      req.user.role,
      filters
    );
  }

  @Get('status/:status')
  @Roles('PHARMACY', 'ADMIN')
  async getOrdersByStatus(
    @Param('status') status: OrderStatus,
    @Request() req,
    @Query('pharmacyId') pharmacyId?: string
  ) {
    let targetPharmacyId = pharmacyId;
    if (req.user.role === 'PHARMACY') {
      const pharmacy = await this.ordersService['prisma'].pharmacy.findFirst({
        where: { userId: req.user.id },
      });
      if (pharmacy) {
        targetPharmacyId = pharmacy.id;
      }
    }

    return this.ordersService.getOrdersByPharmacy(
      targetPharmacyId || '',
      req.user.id,
      req.user.role,
      { status }
    );
  }

  @Put(':id')
  @Roles('PHARMACY', 'ADMIN')
  async updateOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Request() req
  ) {
    return this.ordersService.updateOrder(
      id,
      updateOrderDto,
      req.user.id,
      req.user.role
    );
  }

  @Patch(':id/confirm')
  @Roles('PHARMACY', 'ADMIN')
  async confirmOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req
  ) {
    return this.ordersService.confirmOrder(id, req.user.id, req.user.role);
  }

  @Patch(':id/prepare')
  @Roles('PHARMACY', 'ADMIN')
  async prepareOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req
  ) {
    return this.ordersService.prepareOrder(id, req.user.id, req.user.role);
  }

  @Patch(':id/ready')
  @Roles('PHARMACY', 'ADMIN')
  async readyForPickup(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req
  ) {
    return this.ordersService.readyForPickup(id, req.user.id, req.user.role);
  }

  @Patch(':id/dispatch')
  @Roles('PHARMACY', 'ADMIN')
  async dispatchOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    data: {
      deliveryPersonName?: string;
      deliveryPersonPhone?: string;
      trackingNumber?: string;
    },
    @Request() req
  ) {
    return this.ordersService.dispatchOrder(
      id,
      data,
      req.user.id,
      req.user.role
    );
  }

  @Patch(':id/deliver')
  @Roles('PHARMACY', 'ADMIN')
  async deliverOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req
  ) {
    return this.ordersService.deliverOrder(id, req.user.id, req.user.role);
  }

  @Patch(':id/cancel')
  @Roles('PATIENT', 'PHARMACY', 'ADMIN')
  async cancelOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason: string },
    @Request() req
  ) {
    if (!body.reason) {
      throw new BadRequestException('Cancellation reason is required');
    }
    return this.ordersService.cancelOrder(
      id,
      body.reason,
      req.user.id,
      req.user.role
    );
  }

  @Patch(':id/estimated-delivery')
  @Roles('PHARMACY', 'ADMIN')
  async updateEstimatedDelivery(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { estimatedDeliveryTime: string },
    @Request() req
  ) {
    const estimatedDeliveryTime = new Date(body.estimatedDeliveryTime);
    return this.ordersService.updateOrder(
      id,
      { estimatedDelivery: estimatedDeliveryTime },
      req.user.id,
      req.user.role
    );
  }

  @Get('stats/overview')
  @Roles('PHARMACY', 'ADMIN')
  async getOrderStats(
    @Request() req,
    @Query('pharmacyId') pharmacyId?: string
  ) {
    let targetPharmacyId = pharmacyId;
    if (req.user.role === 'PHARMACY') {
      const pharmacy = await this.ordersService['prisma'].pharmacy.findFirst({
        where: { userId: req.user.id },
      });
      if (pharmacy) {
        targetPharmacyId = pharmacy.id;
      }
    }

    return this.ordersService.getOrderStats(targetPharmacyId);
  }

  @Get('recent/list')
  @Roles('PHARMACY', 'ADMIN')
  async getRecentOrders(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('pharmacyId') pharmacyId?: string
  ) {
    let targetPharmacyId = pharmacyId;
    if (req.user.role === 'PHARMACY') {
      const pharmacy = await this.ordersService['prisma'].pharmacy.findFirst({
        where: { userId: req.user.id },
      });
      if (pharmacy) {
        targetPharmacyId = pharmacy.id;
      }
    }

    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.ordersService.getRecentOrders(limitNum, targetPharmacyId);
  }

  @Get('date-range/search')
  @Roles('PHARMACY', 'ADMIN')
  async getOrdersByDateRange(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('pharmacyId') pharmacyId?: string
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required');
    }

    let targetPharmacyId = pharmacyId;
    if (req.user.role === 'PHARMACY') {
      const pharmacy = await this.ordersService['prisma'].pharmacy.findFirst({
        where: { userId: req.user.id },
      });
      if (pharmacy) {
        targetPharmacyId = pharmacy.id;
      }
    }

    return this.ordersService.getOrdersByPharmacy(
      targetPharmacyId || '',
      req.user.id,
      req.user.role,
      {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      }
    );
  }
}
