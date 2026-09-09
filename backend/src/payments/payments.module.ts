import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { RazorpayService } from './razorpay.service';
import { StripeService } from './stripe.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersModule } from '../orders/orders.module';
import { AppointmentsModule } from '../appointments/appointments.module';

@Module({
  imports: [PrismaModule, OrdersModule, AppointmentsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, RazorpayService, StripeService],
  exports: [PaymentsService, RazorpayService, StripeService],
})
export class PaymentsModule {}
