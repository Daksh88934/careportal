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
import { PaymentStatus, PaymentMethod } from '@prisma/client';

export interface CreatePaymentDto {
  orderId?: string;
  appointmentId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface ProcessPaymentDto {
  paymentId: string;
  paymentMethod: PaymentMethod;
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
    let patientId = null;

    // Validate order or appointment
    if (data.orderId) {
      order = await this.ordersService.getOrderById(
        data.orderId,
        userId,
        userRole
      );
      patientId = order.patientId;

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
        data.appointmentId,
        userId,
        userRole
      );
      patientId = appointment.patientId;

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

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        orderId: data.orderId,
        appointmentId: data.appointmentId,
        patientId,
        amount: data.amount,
        currency:
          data.currency || (data.paymentMethod === 'RAZORPAY' ? 'INR' : 'USD'),
        paymentMethod: data.paymentMethod,
        status: 'PENDING',
        description: data.description,
        metadata: data.metadata || {},
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
    let gatewayResponse = null;

    try {
      if (data.paymentMethod === 'RAZORPAY') {
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
      } else if (data.paymentMethod === 'STRIPE') {
        const customerEmail =
          payment.order?.patient?.user?.email ||
          payment.appointment?.patient?.user?.email;
        const customerName = `${payment.order?.patient?.user?.firstName || payment.appointment?.patient?.user?.firstName} ${payment.order?.patient?.user?.lastName || payment.appointment?.patient?.user?.lastName}`;

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

      // Update payment with gateway details
      const updatedPayment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          gatewayOrderId: gatewayResponse.id,
          gatewayData: gatewayResponse,
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

    try {
      // Verify payment with gateway
      if (data.paymentMethod === 'RAZORPAY') {
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
      } else if (data.paymentMethod === 'STRIPE') {
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
          gatewayPaymentId: data.gatewayPaymentId,
          gatewayData: data.gatewayData || {},
          paidAt: new Date(),
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
          updatedPayment.appointmentId,
          userId,
          userRole
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
        refunds: true,
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
        where.patientId = patient.id;
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
          refunds: true,
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
        refunds: true,
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

    // Calculate refund amount
    const totalRefunded = payment.refunds.reduce(
      (sum, refund) => sum + refund.amount,
      0
    );
    const refundAmount = data.amount || payment.amount - totalRefunded;

    if (refundAmount <= 0) {
      throw new BadRequestException('Invalid refund amount');
    }

    if (totalRefunded + refundAmount > payment.amount) {
      throw new BadRequestException('Refund amount exceeds payment amount');
    }

    try {
      let gatewayRefund = null;

      // Process refund with gateway
      if (payment.paymentMethod === 'RAZORPAY') {
        gatewayRefund = await this.razorpayService.refundPayment(
          payment.gatewayPaymentId,
          this.razorpayService.rupeesToPaise(refundAmount),
          data.metadata
        );
      } else if (payment.paymentMethod === 'STRIPE') {
        gatewayRefund = await this.stripeService.createRefund(
          payment.gatewayPaymentId,
          this.stripeService.dollarsToCents(refundAmount),
          data.reason,
          data.metadata
        );
      }

      // Create refund record
      const refund = await this.prisma.refund.create({
        data: {
          paymentId: payment.id,
          amount: refundAmount,
          reason: data.reason,
          status: 'COMPLETED',
          gatewayRefundId: gatewayRefund.id,
          gatewayData: gatewayRefund,
          metadata: data.metadata || {},
        },
      });

      // Update payment status if fully refunded
      if (totalRefunded + refundAmount >= payment.amount) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'REFUNDED' },
        });
      }

      return refund;
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

    const totalRefunds = await this.prisma.refund.aggregate({
      where: { payment: where },
      _sum: { amount: true },
    });

    return {
      total,
      completed,
      pending,
      failed,
      refunded,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalRefunds: totalRefunds._sum.amount || 0,
      netRevenue:
        (totalRevenue._sum.amount || 0) - (totalRefunds._sum.amount || 0),
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
      where: { gatewayOrderId: paymentData.order_id },
    });

    if (payment && payment.status === 'PENDING') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          gatewayPaymentId: paymentData.id,
          paidAt: new Date(),
        },
      });
    }
  }

  private async handleRazorpayPaymentFailed(paymentData: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { gatewayOrderId: paymentData.order_id },
    });

    if (payment && payment.status === 'PENDING') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
    }
  }

  private async handleRazorpayRefundProcessed(refundData: any) {
    const refund = await this.prisma.refund.findFirst({
      where: { gatewayRefundId: refundData.id },
    });

    if (refund) {
      await this.prisma.refund.update({
        where: { id: refund.id },
        data: { status: 'COMPLETED' },
      });
    }
  }

  private async handleStripePaymentSucceeded(paymentIntentData: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { gatewayOrderId: paymentIntentData.id },
    });

    if (payment && payment.status === 'PENDING') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          gatewayPaymentId: paymentIntentData.id,
          paidAt: new Date(),
        },
      });
    }
  }

  private async handleStripePaymentFailed(paymentIntentData: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { gatewayOrderId: paymentIntentData.id },
    });

    if (payment && payment.status === 'PENDING') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
    }
  }

  private async handleStripeChargeDispute(disputeData: any) {
    // Handle charge disputes - could create dispute records or notify admins
    console.log('Stripe charge dispute created:', disputeData);
  }
}
