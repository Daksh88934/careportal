import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface StripePaymentIntentData {
  amount: number; // in cents
  currency: string;
  metadata?: Record<string, string>;
  description?: string;
  customer?: string;
  payment_method?: string;
  confirm?: boolean;
  return_url?: string;
}

export interface StripeCustomerData {
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!secretKey) {
      throw new Error('Stripe secret key not configured');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2022-11-15' as any,
    });
  }

  async createPaymentIntent(data: StripePaymentIntentData) {
    try {
      const paymentIntentData: Stripe.PaymentIntentCreateParams = {
        amount: data.amount,
        currency: data.currency || 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
      };

      if (data.metadata) {
        paymentIntentData.metadata = data.metadata;
      }

      if (data.description) {
        paymentIntentData.description = data.description;
      }

      if (data.customer) {
        paymentIntentData.customer = data.customer;
      }

      if (data.payment_method) {
        paymentIntentData.payment_method = data.payment_method;
      }

      if (data.confirm) {
        paymentIntentData.confirm = data.confirm;
      }

      if (data.return_url) {
        paymentIntentData.return_url = data.return_url;
      }

      return await this.stripe.paymentIntents.create(paymentIntentData);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create payment intent: ${error.message}`
      );
    }
  }

  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethod?: string,
    returnUrl?: string
  ) {
    try {
      const confirmData: Stripe.PaymentIntentConfirmParams = {};

      if (paymentMethod) {
        confirmData.payment_method = paymentMethod;
      }

      if (returnUrl) {
        confirmData.return_url = returnUrl;
      }

      return await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        confirmData
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to confirm payment intent: ${error.message}`
      );
    }
  }

  async getPaymentIntent(paymentIntentId: string) {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve payment intent: ${error.message}`
      );
    }
  }

  async cancelPaymentIntent(paymentIntentId: string) {
    try {
      return await this.stripe.paymentIntents.cancel(paymentIntentId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to cancel payment intent: ${error.message}`
      );
    }
  }

  async createCustomer(data: StripeCustomerData) {
    try {
      const customerData: Stripe.CustomerCreateParams = {
        email: data.email,
      };

      if (data.name) {
        customerData.name = data.name;
      }

      if (data.phone) {
        customerData.phone = data.phone;
      }

      if (data.metadata) {
        customerData.metadata = data.metadata;
      }

      return await this.stripe.customers.create(customerData);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create customer: ${error.message}`
      );
    }
  }

  async getCustomer(customerId: string) {
    try {
      return await this.stripe.customers.retrieve(customerId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve customer: ${error.message}`
      );
    }
  }

  async updateCustomer(customerId: string, data: Partial<StripeCustomerData>) {
    try {
      return await this.stripe.customers.update(customerId, data);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update customer: ${error.message}`
      );
    }
  }

  async deleteCustomer(customerId: string) {
    try {
      return await this.stripe.customers.del(customerId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete customer: ${error.message}`
      );
    }
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string,
    metadata?: Record<string, string>
  ) {
    try {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = amount;
      }

      if (reason) {
        refundData.reason = reason as Stripe.RefundCreateParams.Reason;
      }

      if (metadata) {
        refundData.metadata = metadata;
      }

      return await this.stripe.refunds.create(refundData);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create refund: ${error.message}`
      );
    }
  }

  async getRefund(refundId: string) {
    try {
      return await this.stripe.refunds.retrieve(refundId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve refund: ${error.message}`
      );
    }
  }

  async createSubscription(
    customerId: string,
    priceId: string,
    metadata?: Record<string, string>
  ) {
    try {
      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      };

      if (metadata) {
        subscriptionData.metadata = metadata;
      }

      return await this.stripe.subscriptions.create(subscriptionData);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create subscription: ${error.message}`
      );
    }
  }

  async getSubscription(subscriptionId: string) {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve subscription: ${error.message}`
      );
    }
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = false) {
    try {
      if (cancelAtPeriodEnd) {
        return await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      } else {
        return await this.stripe.subscriptions.cancel(subscriptionId);
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to cancel subscription: ${error.message}`
      );
    }
  }

  async createPrice(
    productId: string,
    amount: number,
    currency = 'usd',
    interval?: 'month' | 'year'
  ) {
    try {
      const priceData: Stripe.PriceCreateParams = {
        product: productId,
        unit_amount: amount,
        currency,
      };

      if (interval) {
        priceData.recurring = { interval };
      }

      return await this.stripe.prices.create(priceData);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create price: ${error.message}`
      );
    }
  }

  async createProduct(
    name: string,
    description?: string,
    metadata?: Record<string, string>
  ) {
    try {
      const productData: Stripe.ProductCreateParams = {
        name,
      };

      if (description) {
        productData.description = description;
      }

      if (metadata) {
        productData.metadata = metadata;
      }

      return await this.stripe.products.create(productData);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create product: ${error.message}`
      );
    }
  }

  async createCheckoutSession(
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    customerId?: string,
    metadata?: Record<string, string>
  ) {
    try {
      const sessionData: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
      };

      if (customerId) {
        sessionData.customer = customerId;
      }

      if (metadata) {
        sessionData.metadata = metadata;
      }

      return await this.stripe.checkout.sessions.create(sessionData);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create checkout session: ${error.message}`
      );
    }
  }

  async getCheckoutSession(sessionId: string) {
    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve checkout session: ${error.message}`
      );
    }
  }

  async createPaymentMethod(type: string, card?: any, customerId?: string) {
    try {
      const paymentMethodData: Stripe.PaymentMethodCreateParams = {
        type: type as Stripe.PaymentMethodCreateParams.Type,
      };

      if (card) {
        paymentMethodData.card = card;
      }

      const paymentMethod =
        await this.stripe.paymentMethods.create(paymentMethodData);

      if (customerId) {
        await this.stripe.paymentMethods.attach(paymentMethod.id, {
          customer: customerId,
        });
      }

      return paymentMethod;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create payment method: ${error.message}`
      );
    }
  }

  async getPaymentMethod(paymentMethodId: string) {
    try {
      return await this.stripe.paymentMethods.retrieve(paymentMethodId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve payment method: ${error.message}`
      );
    }
  }

  async listCustomerPaymentMethods(customerId: string, type = 'card') {
    try {
      return await this.stripe.paymentMethods.list({
        customer: customerId,
        type: type as Stripe.PaymentMethodListParams.Type,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to list payment methods: ${error.message}`
      );
    }
  }

  // Webhook signature verification
  verifyWebhookSignature(
    body: string | Buffer,
    signature: string
  ): Stripe.Event {
    try {
      const webhookSecret = this.configService.get<string>(
        'STRIPE_WEBHOOK_SECRET'
      );

      if (!webhookSecret) {
        throw new Error('Webhook secret not configured');
      }

      return this.stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (error) {
      throw new BadRequestException(
        `Webhook verification failed: ${error.message}`
      );
    }
  }

  // Utility method to convert dollars to cents
  dollarsToCents(dollars: number): number {
    return Math.round(dollars * 100);
  }

  // Utility method to convert cents to dollars
  centsToDollars(cents: number): number {
    return cents / 100;
  }
}
