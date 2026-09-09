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
    return this.ordersService.createOrder(createOrderDto);
  }

  @Post('from-prescription/:prescriptionId')
  @Roles('PATIENT', 'ADMIN')
  async createOrderFromPrescription(
    @Param('prescriptionId', ParseUUIDPipe) prescriptionId: string,
    @Body()
    body: {
      pharmacyId: string;
      deliveryAddress: string;
      deliveryType: 'PICKUP' | 'DELIVERY';
    },
    @Request() req
  ) {
    return this.ordersService.createOrderFromPrescription(
      prescriptionId,
      body.pharmacyId,
      body.deliveryAddress,
      body.deliveryType
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
    @Query('status') status?: OrderStatus,
    @Query('deliveryType') deliveryType?: 'PICKUP' | 'DELIVERY',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req
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
    @Query('pharmacyId') pharmacyId?: string,
    @Request() req
  ) {
    return this.ordersService.getOrdersByStatus(status, pharmacyId);
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
  async confirmOrder(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.ordersService.confirmOrder(id, req.user.id, req.user.role);
  }

  @Patch(':id/prepare')
  @Roles('PHARMACY', 'ADMIN')
  async prepareOrder(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.ordersService.prepareOrder(id, req.user.id, req.user.role);
  }

  @Patch(':id/ready')
  @Roles('PHARMACY', 'ADMIN')
  async readyForPickup(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.ordersService.readyForPickup(id, req.user.id, req.user.role);
  }

  @Patch(':id/dispatch')
  @Roles('PHARMACY', 'ADMIN')
  async dispatchOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    body: {
      deliveryPersonName?: string;
      deliveryPersonPhone?: string;
      trackingNumber?: string;
    },
    @Request() req
  ) {
    return this.ordersService.dispatchOrder(
      id,
      body,
      req.user.id,
      req.user.role
    );
  }

  @Patch(':id/deliver')
  @Roles('PHARMACY', 'ADMIN')
  async deliverOrder(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
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
    return this.ordersService.updateOrderEstimatedDelivery(
      id,
      estimatedDeliveryTime,
      req.user.id,
      req.user.role
    );
  }

  @Get('stats/overview')
  @Roles('PHARMACY', 'ADMIN')
  async getOrderStats(
    @Query('pharmacyId') pharmacyId?: string,
    @Request() req
  ) {
    // If user is pharmacy role, restrict to their pharmacy only
    if (req.user.role === 'PHARMACY') {
      const pharmacy = await this.ordersService['prisma'].pharmacy.findFirst({
        where: { userId: req.user.id },
      });
      if (pharmacy) {
        pharmacyId = pharmacy.id;
      }
    }

    return this.ordersService.getOrderStats(pharmacyId);
  }

  @Get('recent/list')
  @Roles('PHARMACY', 'ADMIN')
  async getRecentOrders(
    @Query('limit') limit?: string,
    @Query('pharmacyId') pharmacyId?: string,
    @Request() req
  ) {
    // If user is pharmacy role, restrict to their pharmacy only
    if (req.user.role === 'PHARMACY') {
      const pharmacy = await this.ordersService['prisma'].pharmacy.findFirst({
        where: { userId: req.user.id },
      });
      if (pharmacy) {
        pharmacyId = pharmacy.id;
      }
    }

    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.ordersService.getRecentOrders(limitNum, pharmacyId);
  }

  @Get('date-range/search')
  @Roles('PHARMACY', 'ADMIN')
  async getOrdersByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('pharmacyId') pharmacyId?: string,
    @Request() req
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required');
    }

    // If user is pharmacy role, restrict to their pharmacy only
    if (req.user.role === 'PHARMACY') {
      const pharmacy = await this.ordersService['prisma'].pharmacy.findFirst({
        where: { userId: req.user.id },
      });
      if (pharmacy) {
        pharmacyId = pharmacy.id;
      }
    }

    return this.ordersService.getOrdersByDateRange(
      new Date(startDate),
      new Date(endDate),
      pharmacyId
    );
  }
}

// Additional DTOs for validation
export class CreateOrderItemDto {
  medicineId: string;
  quantity: number;
  prescribedQuantity?: number;
}

export class CreateOrderRequestDto {
  prescriptionId?: string;
  patientId: string;
  pharmacyId: string;
  items: CreateOrderItemDto[];
  deliveryAddress: string;
  deliveryType: 'PICKUP' | 'DELIVERY';
  notes?: string;
}

export class UpdateOrderRequestDto {
  status?: OrderStatus;
  pharmacyNotes?: string;
  estimatedDeliveryTime?: Date;
  trackingNumber?: string;
  deliveryPersonName?: string;
  deliveryPersonPhone?: string;
}

export class DispatchOrderDto {
  deliveryPersonName?: string;
  deliveryPersonPhone?: string;
  trackingNumber?: string;
}

export class CancelOrderDto {
  reason: string;
}

export class UpdateEstimatedDeliveryDto {
  estimatedDeliveryTime: string;
}

export class CreateOrderFromPrescriptionDto {
  pharmacyId: string;
  deliveryAddress: string;
  deliveryType: 'PICKUP' | 'DELIVERY';
}
