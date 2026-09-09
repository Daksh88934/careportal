import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { RazorpayService } from './razorpay.service';
import { StripeService } from './stripe.service';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prismaService: jest.Mocked<PrismaService>;
  let razorpayService: jest.Mocked<RazorpayService>;
  let stripeService: jest.Mocked<StripeService>;

  const mockPayment = {
    id: '1',
    orderId: 'order_1',
    appointmentId: null,
    amount: 1000,
    currency: 'INR',
    gateway: 'RAZORPAY',
    gatewayPaymentId: 'pay_123',
    gatewayOrderId: 'order_123',
    status: 'PENDING',
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrder = {
    id: 'order_1',
    patientId: 'patient_1',
    pharmacyId: 'pharmacy_1',
    prescriptionId: 'prescription_1',
    status: 'PENDING',
    totalAmount: 1000,
    deliveryAddress: 'Test Address',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAppointment = {
    id: 'appointment_1',
    patientId: 'patient_1',
    doctorId: 'doctor_1',
    scheduledAt: new Date(),
    status: 'PENDING',
    consultationFee: 500,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      payment: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      order: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      appointment: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      refund: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const mockRazorpayService = {
      createOrder: jest.fn(),
      verifyPayment: jest.fn(),
      processRefund: jest.fn(),
      verifyWebhookSignature: jest.fn(),
    };

    const mockStripeService = {
      createPaymentIntent: jest.fn(),
      confirmPayment: jest.fn(),
      processRefund: jest.fn(),
      verifyWebhookSignature: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RazorpayService, useValue: mockRazorpayService },
        { provide: StripeService, useValue: mockStripeService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prismaService = module.get(PrismaService);
    razorpayService = module.get(RazorpayService);
    stripeService = module.get(StripeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrderPayment', () => {
    const createPaymentDto = {
      orderId: 'order_1',
      gateway: 'RAZORPAY' as const,
      currency: 'INR' as const,
    };

    it('should create order payment successfully with Razorpay', async () => {
      prismaService.order.findUnique.mockResolvedValue(mockOrder);
      razorpayService.createOrder.mockResolvedValue({
        id: 'order_123',
        amount: 100000, // in paise
        currency: 'INR',
        receipt: 'order_1',
      });
      prismaService.payment.create.mockResolvedValue(mockPayment);

      const result = await service.createOrderPayment(
        createPaymentDto,
        'patient_1'
      );

      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: createPaymentDto.orderId },
      });
      expect(razorpayService.createOrder).toHaveBeenCalledWith({
        amount: mockOrder.totalAmount,
        currency: 'INR',
        receipt: mockOrder.id,
      });
      expect(prismaService.payment.create).toHaveBeenCalled();
      expect(result).toEqual(mockPayment);
    });

    it('should throw NotFoundException for non-existent order', async () => {
      prismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.createOrderPayment(createPaymentDto, 'patient_1')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for unauthorized access', async () => {
      prismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.createOrderPayment(createPaymentDto, 'different_patient')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createAppointmentPayment', () => {
    const createPaymentDto = {
      appointmentId: 'appointment_1',
      gateway: 'STRIPE' as const,
      currency: 'USD' as const,
    };

    it('should create appointment payment successfully with Stripe', async () => {
      prismaService.appointment.findUnique.mockResolvedValue(mockAppointment);
      stripeService.createPaymentIntent.mockResolvedValue({
        id: 'pi_123',
        amount: 50000, // in cents
        currency: 'usd',
        client_secret: 'pi_123_secret',
      });
      prismaService.payment.create.mockResolvedValue({
        ...mockPayment,
        appointmentId: 'appointment_1',
        orderId: null,
        gateway: 'STRIPE',
        currency: 'USD',
      });

      const result = await service.createAppointmentPayment(
        createPaymentDto,
        'patient_1'
      );

      expect(prismaService.appointment.findUnique).toHaveBeenCalledWith({
        where: { id: createPaymentDto.appointmentId },
      });
      expect(stripeService.createPaymentIntent).toHaveBeenCalledWith({
        amount: mockAppointment.consultationFee,
        currency: 'USD',
        metadata: { appointmentId: mockAppointment.id },
      });
      expect(result).toHaveProperty('appointmentId', 'appointment_1');
    });
  });

  describe('verifyPayment', () => {
    const verifyPaymentDto = {
      paymentId: '1',
      gatewayPaymentId: 'pay_123',
      gatewayOrderId: 'order_123',
      signature: 'valid_signature',
    };

    it('should verify Razorpay payment successfully', async () => {
      prismaService.payment.findUnique.mockResolvedValue(mockPayment);
      razorpayService.verifyPayment.mockResolvedValue(true);
      prismaService.order.findUnique.mockResolvedValue(mockOrder);

      const updatedPayment = { ...mockPayment, status: 'COMPLETED' };
      const updatedOrder = { ...mockOrder, status: 'CONFIRMED' };

      prismaService.$transaction.mockImplementation(async callback => {
        return callback({
          payment: {
            update: jest.fn().mockResolvedValue(updatedPayment),
          },
          order: {
            update: jest.fn().mockResolvedValue(updatedOrder),
          },
        });
      });

      const result = await service.verifyPayment(verifyPaymentDto, 'patient_1');

      expect(razorpayService.verifyPayment).toHaveBeenCalledWith({
        razorpay_payment_id: verifyPaymentDto.gatewayPaymentId,
        razorpay_order_id: verifyPaymentDto.gatewayOrderId,
        razorpay_signature: verifyPaymentDto.signature,
      });
      expect(result).toEqual({
        success: true,
        payment: updatedPayment,
        message: 'Payment verified and order confirmed successfully',
      });
    });

    it('should throw BadRequestException for invalid signature', async () => {
      prismaService.payment.findUnique.mockResolvedValue(mockPayment);
      razorpayService.verifyPayment.mockResolvedValue(false);

      await expect(
        service.verifyPayment(verifyPaymentDto, 'patient_1')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('processRefund', () => {
    const processRefundDto = {
      paymentId: '1',
      amount: 500,
      reason: 'Customer request',
    };

    it('should process refund successfully', async () => {
      const completedPayment = { ...mockPayment, status: 'COMPLETED' };
      prismaService.payment.findUnique.mockResolvedValue(completedPayment);
      razorpayService.processRefund.mockResolvedValue({
        id: 'rfnd_123',
        amount: 50000,
        currency: 'INR',
        status: 'processed',
      });

      const mockRefund = {
        id: '1',
        paymentId: '1',
        amount: 500,
        reason: 'Customer request',
        gatewayRefundId: 'rfnd_123',
        status: 'PROCESSED',
        createdAt: new Date(),
      };

      prismaService.$transaction.mockImplementation(async callback => {
        return callback({
          refund: {
            create: jest.fn().mockResolvedValue(mockRefund),
          },
          payment: {
            update: jest.fn().mockResolvedValue({
              ...completedPayment,
              status: 'REFUNDED',
            }),
          },
        });
      });

      const result = await service.processRefund(
        processRefundDto,
        'pharmacy_1',
        'PHARMACY'
      );

      expect(razorpayService.processRefund).toHaveBeenCalledWith(
        completedPayment.gatewayPaymentId,
        processRefundDto.amount,
        processRefundDto.reason
      );
      expect(result).toEqual(mockRefund);
    });

    it('should throw BadRequestException for already refunded payment', async () => {
      const refundedPayment = { ...mockPayment, status: 'REFUNDED' };
      prismaService.payment.findUnique.mockResolvedValue(refundedPayment);

      await expect(
        service.processRefund(processRefundDto, 'pharmacy_1', 'PHARMACY')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPaymentHistory', () => {
    it('should return payment history for patient', async () => {
      const mockPayments = [mockPayment];
      prismaService.payment.findMany.mockResolvedValue(mockPayments);

      const result = await service.getPaymentHistory('patient_1', 'PATIENT');

      expect(prismaService.payment.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { order: { patientId: 'patient_1' } },
            { appointment: { patientId: 'patient_1' } },
          ],
        },
        include: {
          order: { include: { pharmacy: true } },
          appointment: { include: { doctor: true } },
          refunds: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockPayments);
    });
  });

  describe('getPaymentStats', () => {
    it('should return payment statistics', async () => {
      const mockStats = [
        {
          status: 'COMPLETED',
          _count: { status: 10 },
          _sum: { amount: 10000 },
        },
        { status: 'PENDING', _count: { status: 5 }, _sum: { amount: 5000 } },
      ];

      prismaService.payment.findMany.mockResolvedValue(mockStats as any);

      const result = await service.getPaymentStats('pharmacy_1', 'PHARMACY');

      expect(result).toEqual({
        totalPayments: 15,
        totalAmount: 15000,
        completedPayments: 10,
        pendingPayments: 5,
        completedAmount: 10000,
        pendingAmount: 5000,
      });
    });
  });

  describe('handleWebhook', () => {
    const webhookData = {
      gateway: 'RAZORPAY' as const,
      signature: 'valid_signature',
      payload: {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_123',
              order_id: 'order_123',
              status: 'captured',
            },
          },
        },
      },
    };

    it('should handle Razorpay webhook successfully', async () => {
      razorpayService.verifyWebhookSignature.mockReturnValue(true);
      prismaService.payment.findUnique.mockResolvedValue(mockPayment);
      prismaService.payment.update.mockResolvedValue({
        ...mockPayment,
        status: 'COMPLETED',
      });

      const result = await service.handleWebhook(webhookData);

      expect(razorpayService.verifyWebhookSignature).toHaveBeenCalledWith(
        webhookData.payload,
        webhookData.signature
      );
      expect(result).toEqual({
        success: true,
        message: 'Webhook processed successfully',
      });
    });

    it('should throw BadRequestException for invalid webhook signature', async () => {
      razorpayService.verifyWebhookSignature.mockReturnValue(false);

      await expect(service.handleWebhook(webhookData)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('utility methods', () => {
    describe('convertToGatewayCurrency', () => {
      it('should convert INR to paise for Razorpay', () => {
        const result = service.convertToGatewayCurrency(100, 'INR', 'RAZORPAY');
        expect(result).toBe(10000); // 100 * 100
      });

      it('should convert USD to cents for Stripe', () => {
        const result = service.convertToGatewayCurrency(100, 'USD', 'STRIPE');
        expect(result).toBe(10000); // 100 * 100
      });
    });

    describe('convertFromGatewayCurrency', () => {
      it('should convert paise to INR for Razorpay', () => {
        const result = service.convertFromGatewayCurrency(
          10000,
          'INR',
          'RAZORPAY'
        );
        expect(result).toBe(100); // 10000 / 100
      });

      it('should convert cents to USD for Stripe', () => {
        const result = service.convertFromGatewayCurrency(
          10000,
          'USD',
          'STRIPE'
        );
        expect(result).toBe(100); // 10000 / 100
      });
    });
  });
});
