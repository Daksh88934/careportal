import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RazorpayService } from './razorpay.service';
import { StripeService } from './stripe.service';
import { OrdersService } from '../orders/orders.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { PaymentStatus } from '@prisma/client';

export interface CreatePaymentDto {
  orderId?: string;
  appointmentId?: string;
  amount: number;
  paymentMethod: string;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface ProcessPaymentDto {
  paymentId: string;
  paymentMethod: string;
  gatewayPaymentId: string;
  gatewayOrderId?: string;
  gatewaySignature?: string;
  gatewayData?: Record<string, any>;
}

export interface RefundPaymentDto {
  paymentId: string;
  amount?: number;
  reason?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private razorpayService: RazorpayService,
    private stripeService: StripeService,
    private ordersService: OrdersService,
    private appointmentsService: AppointmentsService
  ) {}

  async createPayment(
    data: CreatePaymentDto,
    userId: string,
    userRole: string
  ) {
    // Validate that either orderId or appointmentId is provided
    if (!data.orderId && !data.appointmentId) {
      throw new BadRequestException(
        'Either orderId or appointmentId must be provided'
      );
    }

    if (data.orderId && data.appointmentId) {
      throw new BadRequestException(
        'Cannot provide both orderId and appointmentId'
      );
    }

    let order = null;
    let appointment = null;

    // Validate order or appointment
    if (data.orderId) {
      order = await this.ordersService.getOrderById(
        data.orderId,
        userId,
        userRole
      );

      // Check if order already has a successful payment
      const existingPayment = await this.prisma.payment.findFirst({
        where: {
          orderId: data.orderId,
          status: 'COMPLETED',
        },
      });

      if (existingPayment) {
        throw new BadRequestException('Order already has a successful payment');
      }
    }

    if (data.appointmentId) {
      appointment = await this.appointmentsService.getAppointmentById(
        data.appointmentId
      );

      // Check if appointment already has a successful payment
      const existingPayment = await this.prisma.payment.findFirst({
        where: {
          appointmentId: data.appointmentId,
          status: 'COMPLETED',
        },
      });

      if (existingPayment) {
        throw new BadRequestException(
          'Appointment already has a successful payment'
        );
      }
    }

    const providerName = (data.paymentMethod || 'razorpay').toLowerCase();
    const currency = data.currency || (providerName === 'razorpay' ? 'INR' : 'USD');

    // Create initial pending payment record
    const payment = await this.prisma.payment.create({
      data: {
        orderId: data.orderId,
        appointmentId: data.appointmentId,
        providerTransactionId: `pending_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        provider: providerName,
        amount: data.amount,
        currency,
        paymentMethod: data.paymentMethod,
        status: 'PENDING',
        gatewayResponse: data.metadata || {},
      },
      include: {
        order: {
          include: {
            patient: { include: { user: true } },
            pharmacy: { include: { user: true } },
          },
        },
        appointment: {
          include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } },
          },
        },
      },
    });

    // Create gateway order/payment intent
    let gatewayResponse: any = null;

    try {
      if (providerName === 'razorpay') {
        gatewayResponse = await this.razorpayService.createOrder({
          amount: this.razorpayService.rupeesToPaise(data.amount),
          currency: payment.currency,
          receipt: payment.id,
          notes: {
            paymentId: payment.id,
            orderId: data.orderId || '',
            appointmentId: data.appointmentId || '',
            ...data.metadata,
          },
        });
      } else if (providerName === 'stripe') {
        const customerEmail =
          payment.order?.patient?.user?.email ||
          payment.appointment?.patient?.user?.email;
        const customerName = `${payment.order?.patient?.user?.firstName || payment.appointment?.patient?.user?.firstName || ''} ${payment.order?.patient?.user?.lastName || payment.appointment?.patient?.user?.lastName || ''}`.trim();

        gatewayResponse = await this.stripeService.createPaymentIntent({
          amount: this.stripeService.dollarsToCents(data.amount),
          currency: payment.currency.toLowerCase(),
          description: data.description,
          metadata: {
            paymentId: payment.id,
            orderId: data.orderId || '',
            appointmentId: data.appointmentId || '',
            customerEmail,
            customerName,
            ...data.metadata,
          },
        });
      }

      // Update payment with gateway transaction ID
      const updatedPayment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerTransactionId: gatewayResponse?.id || payment.providerTransactionId,
          gatewayResponse: gatewayResponse || {},
        },
        include: {
          order: {
            include: {
              patient: { include: { user: true } },
              pharmacy: { include: { user: true } },
            },
          },
          appointment: {
            include: {
              patient: { include: { user: true } },
              doctor: { include: { user: true } },
            },
          },
        },
      });

      return {
        payment: updatedPayment,
        gatewayData: gatewayResponse,
      };
    } catch (error) {
      // Update payment status to failed
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });

      throw new BadRequestException(
        `Failed to create gateway order: ${error.message}`
      );
    }
  }

  async processPayment(
    data: ProcessPaymentDto,
    userId: string,
    userRole: string
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: data.paymentId },
      include: {
        order: {
          include: {
            patient: { include: { user: true } },
            pharmacy: { include: { user: true } },
          },
        },
        appointment: {
          include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Check access permissions
    const isPatient =
      payment.order?.patient?.userId === userId ||
      payment.appointment?.patient?.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isPatient && !isAdmin) {
      throw new ForbiddenException('Access denied to this payment');
    }

    if (payment.status !== 'PENDING') {
      throw new BadRequestException('Payment is not in pending status');
    }

    let isVerified = false;
    const providerName = (data.paymentMethod || payment.provider || 'razorpay').toLowerCase();

    try {
      // Verify payment with gateway
      if (providerName === 'razorpay') {
        if (!data.gatewayOrderId || !data.gatewaySignature) {
          throw new BadRequestException(
            'Razorpay order ID and signature are required'
          );
        }

        isVerified = await this.razorpayService.verifyPayment({
          razorpay_order_id: data.gatewayOrderId,
          razorpay_payment_id: data.gatewayPaymentId,
          razorpay_signature: data.gatewaySignature,
        });
      } else if (providerName === 'stripe') {
        const paymentIntent = await this.stripeService.getPaymentIntent(
          data.gatewayPaymentId
        );
        isVerified = paymentIntent.status === 'succeeded';
      }

      if (!isVerified) {
        throw new BadRequestException('Payment verification failed');
      }

      // Update payment status
      const updatedPayment = await this.prisma.payment.update({
        where: { id: data.paymentId },
        data: {
          status: 'COMPLETED',
          providerTransactionId: data.gatewayPaymentId,
          gatewayResponse: data.gatewayData || (payment.gatewayResponse as any) || {},
        },
        include: {
          order: true,
          appointment: true,
        },
      });

      // Update order status if it's an order payment
      if (updatedPayment.orderId) {
        await this.ordersService.confirmOrder(
          updatedPayment.orderId,
          userId,
          userRole
        );
      }

      // Update appointment status if it's an appointment payment
      if (updatedPayment.appointmentId) {
        await this.appointmentsService.confirmAppointment(
          updatedPayment.appointmentId
        );
      }

      return updatedPayment;
    } catch (error) {
      // Update payment status to failed
      await this.prisma.payment.update({
        where: { id: data.paymentId },
        data: { status: 'FAILED' },
      });

      throw new BadRequestException(
        `Payment processing failed: ${error.message}`
      );
    }
  }

  async getPaymentById(id: string, userId: string, userRole: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            patient: { include: { user: true } },
            pharmacy: { include: { user: true } },
            orderItems: { include: { medicine: true } },
          },
        },
        appointment: {
          include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Check access permissions
    const isPatient =
      payment.order?.patient?.userId === userId ||
      payment.appointment?.patient?.userId === userId;
    const isPharmacy = payment.order?.pharmacy?.userId === userId;
    const isDoctor = payment.appointment?.doctor?.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isPatient && !isPharmacy && !isDoctor && !isAdmin) {
      throw new ForbiddenException('Access denied to this payment');
    }

    return payment;
  }

  async getPaymentsByUser(
    userId: string,
    userRole: string,
    page = 1,
    limit = 20
  ) {
    const skip = (page - 1) * limit;
    let where: any = {};

    if (userRole === 'PATIENT') {
      const patient = await this.prisma.patient.findFirst({
        where: { userId },
      });
      if (patient) {
        where.OR = [
          { order: { patientId: patient.id } },
          { appointment: { patientId: patient.id } },
        ];
      }
    } else if (userRole === 'PHARMACY') {
      const pharmacy = await this.prisma.pharmacy.findFirst({
        where: { userId },
      });
      if (pharmacy) {
        where.order = { pharmacyId: pharmacy.id };
      }
    } else if (userRole === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findFirst({ where: { userId } });
      if (doctor) {
        where.appointment = { doctorId: doctor.id };
      }
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          order: {
            include: {
              patient: { include: { user: true } },
              pharmacy: { include: { user: true } },
            },
          },
          appointment: {
            include: {
              patient: { include: { user: true } },
              doctor: { include: { user: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async refundPayment(
    data: RefundPaymentDto,
    userId: string,
    userRole: string
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: data.paymentId },
      include: {
        order: {
          include: {
            patient: { include: { user: true } },
            pharmacy: { include: { user: true } },
          },
        },
        appointment: {
          include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'COMPLETED') {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    // Check permissions - only admin or pharmacy/doctor can initiate refunds
    const isPharmacy = payment.order?.pharmacy?.userId === userId;
    const isDoctor = payment.appointment?.doctor?.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isPharmacy && !isDoctor && !isAdmin) {
      throw new ForbiddenException('Access denied to refund this payment');
    }

    const numericAmount = Number(payment.amount);
    const existingRefund = Number(payment.refundAmount || 0);
    const refundAmount = data.amount || (numericAmount - existingRefund);

    if (refundAmount <= 0) {
      throw new BadRequestException('Invalid refund amount');
    }

    if (existingRefund + refundAmount > numericAmount) {
      throw new BadRequestException('Refund amount exceeds payment amount');
    }

    try {
      let gatewayRefund: any = null;
      const providerName = (payment.provider || 'razorpay').toLowerCase();

      // Process refund with gateway
      if (providerName === 'razorpay') {
        gatewayRefund = await this.razorpayService.refundPayment(
          payment.providerTransactionId,
          this.razorpayService.rupeesToPaise(refundAmount),
          data.metadata
        );
      } else if (providerName === 'stripe') {
        gatewayRefund = await this.stripeService.createRefund(
          payment.providerTransactionId,
          this.stripeService.dollarsToCents(refundAmount),
          data.reason,
          data.metadata
        );
      }

      // Update payment record with refund information
      const updatedPayment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REFUNDED',
          refundAmount: existingRefund + refundAmount,
          refundedAt: new Date(),
          gatewayResponse: gatewayRefund || (payment.gatewayResponse as any) || {},
        },
      });

      return updatedPayment;
    } catch (error) {
      throw new BadRequestException(
        `Refund processing failed: ${error.message}`
      );
    }
  }

  async getPaymentStats(userId?: string, userRole?: string) {
    let where: any = {};

    if (userId && userRole === 'PHARMACY') {
      const pharmacy = await this.prisma.pharmacy.findFirst({
        where: { userId },
      });
      if (pharmacy) {
        where.order = { pharmacyId: pharmacy.id };
      }
    } else if (userId && userRole === 'DOCTOR') {
      const doctor = await this.prisma.doctor.findFirst({ where: { userId } });
      if (doctor) {
        where.appointment = { doctorId: doctor.id };
      }
    }

    const [total, completed, pending, failed, refunded] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.payment.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.payment.count({ where: { ...where, status: 'FAILED' } }),
      this.prisma.payment.count({ where: { ...where, status: 'REFUNDED' } }),
    ]);

    const totalRevenue = await this.prisma.payment.aggregate({
      where: { ...where, status: 'COMPLETED' },
      _sum: { amount: true },
    });

    const totalRefunds = await this.prisma.payment.aggregate({
      where: { ...where, status: 'REFUNDED' },
      _sum: { refundAmount: true },
    });

    const rev = Number(totalRevenue._sum.amount || 0);
    const ref = Number(totalRefunds._sum.refundAmount || 0);

    return {
      total,
      completed,
      pending,
      failed,
      refunded,
      totalRevenue: rev,
      totalRefunds: ref,
      netRevenue: rev - ref,
    };
  }

  async handleWebhook(
    provider: 'razorpay' | 'stripe',
    body: any,
    signature: string
  ) {
    try {
      let event = null;

      if (provider === 'razorpay') {
        const isValid = this.razorpayService.verifyWebhookSignature(
          JSON.stringify(body),
          signature
        );
        if (!isValid) {
          throw new BadRequestException('Invalid webhook signature');
        }
        event = body;
      } else if (provider === 'stripe') {
        event = this.stripeService.verifyWebhookSignature(body, signature);
      }

      // Process webhook event
      await this.processWebhookEvent(provider, event);

      return { received: true };
    } catch (error) {
      throw new BadRequestException(
        `Webhook processing failed: ${error.message}`
      );
    }
  }

  private async processWebhookEvent(provider: string, event: any) {
    if (provider === 'razorpay') {
      switch (event.event) {
        case 'payment.captured':
          await this.handleRazorpayPaymentCaptured(
            event.payload.payment.entity
          );
          break;
        case 'payment.failed':
          await this.handleRazorpayPaymentFailed(event.payload.payment.entity);
          break;
        case 'refund.processed':
          await this.handleRazorpayRefundProcessed(event.payload.refund.entity);
          break;
      }
    } else if (provider === 'stripe') {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handleStripePaymentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handleStripePaymentFailed(event.data.object);
          break;
        case 'charge.dispute.created':
          await this.handleStripeChargeDispute(event.data.object);
          break;
      }
    }
  }

  private async handleRazorpayPaymentCaptured(paymentData: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { providerTransactionId: paymentData.order_id },
    });

    if (payment && payment.status === 'PENDING') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          providerTransactionId: paymentData.id,
        },
      });
    }
  }

  private async handleRazorpayPaymentFailed(paymentData: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { providerTransactionId: paymentData.order_id },
    });

    if (payment && payment.status === 'PENDING') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
    }
  }

  private async handleRazorpayRefundProcessed(refundData: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { providerTransactionId: refundData.payment_id },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED', refundedAt: new Date() },
      });
    }
  }

  private async handleStripePaymentSucceeded(paymentIntentData: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { providerTransactionId: paymentIntentData.id },
    });

    if (payment && payment.status === 'PENDING') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          providerTransactionId: paymentIntentData.id,
        },
      });
    }
  }

  private async handleStripePaymentFailed(paymentIntentData: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { providerTransactionId: paymentIntentData.id },
    });

    if (payment && payment.status === 'PENDING') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
    }
  }

  private async handleStripeChargeDispute(disputeData: any) {
    console.log('Stripe charge dispute created:', disputeData);
  }
}
