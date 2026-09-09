import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  ParseUUIDPipe,
  ParseIntPipe,
  Headers,
  RawBody,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  PaymentsService,
  CreatePaymentDto,
  ProcessPaymentDto,
  RefundPaymentDto,
} from './payments.service';
import { PaymentMethod } from '@prisma/client';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  @Roles('PATIENT', 'ADMIN')
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req
  ) {
    return this.paymentsService.createPayment(
      createPaymentDto,
      req.user.id,
      req.user.role
    );
  }

  @Post('process')
  @Roles('PATIENT', 'ADMIN')
  async processPayment(
    @Body() processPaymentDto: ProcessPaymentDto,
    @Request() req
  ) {
    return this.paymentsService.processPayment(
      processPaymentDto,
      req.user.id,
      req.user.role
    );
  }

  @Get(':id')
  @Roles('PATIENT', 'DOCTOR', 'PHARMACY', 'ADMIN')
  async getPaymentById(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.paymentsService.getPaymentById(id, req.user.id, req.user.role);
  }

  @Get()
  @Roles('PATIENT', 'DOCTOR', 'PHARMACY', 'ADMIN')
  async getPaymentsByUser(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Request() req
  ) {
    return this.paymentsService.getPaymentsByUser(
      req.user.id,
      req.user.role,
      page,
      limit
    );
  }

  @Post('refund')
  @Roles('DOCTOR', 'PHARMACY', 'ADMIN')
  async refundPayment(
    @Body() refundPaymentDto: RefundPaymentDto,
    @Request() req
  ) {
    return this.paymentsService.refundPayment(
      refundPaymentDto,
      req.user.id,
      req.user.role
    );
  }

  @Get('stats/overview')
  @Roles('DOCTOR', 'PHARMACY', 'ADMIN')
  async getPaymentStats(@Request() req) {
    return this.paymentsService.getPaymentStats(req.user.id, req.user.role);
  }

  @Post('webhooks/razorpay')
  async handleRazorpayWebhook(
    @RawBody() body: Buffer,
    @Headers('x-razorpay-signature') signature: string
  ) {
    if (!signature) {
      throw new BadRequestException('Missing webhook signature');
    }

    const bodyString = body.toString();
    const bodyJson = JSON.parse(bodyString);

    return this.paymentsService.handleWebhook('razorpay', bodyJson, signature);
  }

  @Post('webhooks/stripe')
  async handleStripeWebhook(
    @RawBody() body: Buffer,
    @Headers('stripe-signature') signature: string
  ) {
    if (!signature) {
      throw new BadRequestException('Missing webhook signature');
    }

    return this.paymentsService.handleWebhook('stripe', body, signature);
  }

  @Post('orders/:orderId/payment')
  @Roles('PATIENT', 'ADMIN')
  async createOrderPayment(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body()
    body: {
      paymentMethod: PaymentMethod;
      currency?: string;
      description?: string;
    },
    @Request() req
  ) {
    // Get order details to determine amount
    const order = await this.paymentsService['ordersService'].getOrderById(
      orderId,
      req.user.id,
      req.user.role
    );

    const createPaymentDto: CreatePaymentDto = {
      orderId,
      amount: order.totalAmount,
      paymentMethod: body.paymentMethod,
      currency: body.currency,
      description: body.description || `Payment for order ${orderId}`,
    };

    return this.paymentsService.createPayment(
      createPaymentDto,
      req.user.id,
      req.user.role
    );
  }

  @Post('appointments/:appointmentId/payment')
  @Roles('PATIENT', 'ADMIN')
  async createAppointmentPayment(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @Body()
    body: {
      paymentMethod: PaymentMethod;
      amount: number;
      currency?: string;
      description?: string;
    },
    @Request() req
  ) {
    const createPaymentDto: CreatePaymentDto = {
      appointmentId,
      amount: body.amount,
      paymentMethod: body.paymentMethod,
      currency: body.currency,
      description:
        body.description || `Payment for appointment ${appointmentId}`,
    };

    return this.paymentsService.createPayment(
      createPaymentDto,
      req.user.id,
      req.user.role
    );
  }

  @Get('orders/:orderId/payments')
  @Roles('PATIENT', 'PHARMACY', 'ADMIN')
  async getOrderPayments(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Request() req
  ) {
    return this.paymentsService['prisma'].payment.findMany({
      where: { orderId },
      include: {
        refunds: true,
        order: {
          include: {
            patient: { include: { user: true } },
            pharmacy: { include: { user: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('appointments/:appointmentId/payments')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  async getAppointmentPayments(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @Request() req
  ) {
    return this.paymentsService['prisma'].payment.findMany({
      where: { appointmentId },
      include: {
        refunds: true,
        appointment: {
          include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

// DTOs for validation
export class CreatePaymentRequestDto {
  orderId?: string;
  appointmentId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export class ProcessPaymentRequestDto {
  paymentId: string;
  paymentMethod: PaymentMethod;
  gatewayPaymentId: string;
  gatewayOrderId?: string;
  gatewaySignature?: string;
  gatewayData?: Record<string, any>;
}

export class RefundPaymentRequestDto {
  paymentId: string;
  amount?: number;
  reason?: string;
  metadata?: Record<string, any>;
}

export class CreateOrderPaymentDto {
  paymentMethod: PaymentMethod;
  currency?: string;
  description?: string;
}

export class CreateAppointmentPaymentDto {
  paymentMethod: PaymentMethod;
  amount: number;
  currency?: string;
  description?: string;
}
