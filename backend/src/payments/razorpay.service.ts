import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Razorpay from 'razorpay';
import * as crypto from 'crypto';

export interface RazorpayOrderData {
  amount: number; // in paise
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayPaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;

  constructor(private configService: ConfigService) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not configured');
    }

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  async createOrder(orderData: RazorpayOrderData) {
    try {
      const options = {
        amount: orderData.amount, // amount in paise
        currency: orderData.currency || 'INR',
        receipt: orderData.receipt,
        notes: orderData.notes || {},
      };

      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create Razorpay order: ${error.message}`
      );
    }
  }

  async verifyPayment(
    verification: RazorpayPaymentVerification
  ): Promise<boolean> {
    try {
      const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

      const body =
        verification.razorpay_order_id + '|' + verification.razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

      return expectedSignature === verification.razorpay_signature;
    } catch (error) {
      throw new BadRequestException(
        `Payment verification failed: ${error.message}`
      );
    }
  }

  async getPayment(paymentId: string) {
    try {
      return await this.razorpay.payments.fetch(paymentId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch payment: ${error.message}`
      );
    }
  }

  async getOrder(orderId: string) {
    try {
      return await this.razorpay.orders.fetch(orderId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch order: ${error.message}`
      );
    }
  }

  async capturePayment(paymentId: string, amount: number) {
    try {
      return await this.razorpay.payments.capture(paymentId, amount, 'INR');
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to capture payment: ${error.message}`
      );
    }
  }

  async refundPayment(
    paymentId: string,
    amount?: number,
    notes?: Record<string, string>
  ) {
    try {
      const refundData: any = {
        payment_id: paymentId,
      };

      if (amount) {
        refundData.amount = amount;
      }

      if (notes) {
        refundData.notes = notes;
      }

      return await this.razorpay.payments.refund(paymentId, refundData);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to refund payment: ${error.message}`
      );
    }
  }

  async getRefund(refundId: string) {
    try {
      return await this.razorpay.refunds.fetch(refundId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch refund: ${error.message}`
      );
    }
  }

  async getAllRefundsForPayment(paymentId: string) {
    try {
      return await this.razorpay.payments.fetchMultipleRefund(paymentId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch refunds: ${error.message}`
      );
    }
  }

  async createSubscription(
    planId: string,
    customerNotify = 1,
    notes?: Record<string, string>
  ) {
    try {
      const subscriptionData: any = {
        plan_id: planId,
        customer_notify: customerNotify,
        total_count: 12, // 12 months by default
      };

      if (notes) {
        subscriptionData.notes = notes;
      }

      return await this.razorpay.subscriptions.create(subscriptionData);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create subscription: ${error.message}`
      );
    }
  }

  async cancelSubscription(subscriptionId: string, cancelAtCycleEnd = false) {
    try {
      return await this.razorpay.subscriptions.cancel(
        subscriptionId,
        cancelAtCycleEnd
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to cancel subscription: ${error.message}`
      );
    }
  }

  async createCustomer(
    name: string,
    email: string,
    contact?: string,
    notes?: Record<string, string>
  ) {
    try {
      const customerData: any = {
        name,
        email,
      };

      if (contact) {
        customerData.contact = contact;
      }

      if (notes) {
        customerData.notes = notes;
      }

      return await this.razorpay.customers.create(customerData);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create customer: ${error.message}`
      );
    }
  }

  async getCustomer(customerId: string) {
    try {
      return await this.razorpay.customers.fetch(customerId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch customer: ${error.message}`
      );
    }
  }

  async createPaymentLink(
    amount: number,
    description: string,
    customerInfo: any,
    callbackUrl?: string
  ) {
    try {
      const paymentLinkData: any = {
        amount: amount, // in paise
        currency: 'INR',
        accept_partial: false,
        description,
        customer: customerInfo,
        notify: {
          sms: true,
          email: true,
        },
        reminder_enable: true,
      };

      if (callbackUrl) {
        paymentLinkData.callback_url = callbackUrl;
        paymentLinkData.callback_method = 'get';
      }

      return await this.razorpay.paymentLink.create(paymentLinkData);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create payment link: ${error.message}`
      );
    }
  }

  async getPaymentLink(paymentLinkId: string) {
    try {
      return await this.razorpay.paymentLink.fetch(paymentLinkId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch payment link: ${error.message}`
      );
    }
  }

  async cancelPaymentLink(paymentLinkId: string) {
    try {
      return await this.razorpay.paymentLink.cancel(paymentLinkId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to cancel payment link: ${error.message}`
      );
    }
  }

  // Webhook signature verification
  verifyWebhookSignature(body: string, signature: string): boolean {
    try {
      const webhookSecret = this.configService.get<string>(
        'RAZORPAY_WEBHOOK_SECRET'
      );

      if (!webhookSecret) {
        throw new Error('Webhook secret not configured');
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      return false;
    }
  }

  // Utility method to convert rupees to paise
  rupeesToPaise(rupees: number): number {
    return Math.round(rupees * 100);
  }

  // Utility method to convert paise to rupees
  paiseToRupees(paise: number): number {
    return paise / 100;
  }
}
