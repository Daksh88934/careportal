import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { VideoModule } from './video/video.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { MedicinesModule } from './medicines/medicines.module';
import { OrdersModule } from './orders/orders.module';
import { PharmaciesModule } from './pharmacies/pharmacies.module';
import { PaymentsModule } from './payments/payments.module';
import { AiChatModule } from './ai-chat/ai-chat.module';

import { FacilitiesModule } from './facilities/facilities.module';
import { PatientRegistrationModule } from './patient-registration/patient-registration.module';
import { TriageModule } from './triage/triage.module';
import { TeleconsultationModule } from './teleconsultation/teleconsultation.module';
import { EhrModule } from './ehr/ehr.module';
import { ReferralsModule } from './referrals/referrals.module';
import { InventoryModule } from './inventory/inventory.module';
import { FollowUpsModule } from './follow-ups/follow-ups.module';
import { EmergencyModule } from './emergency/emergency.module';
import { DashboardsModule } from './dashboards/dashboards.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,
    }),
    PrismaModule,
    AuthModule,
    VideoModule,
    AppointmentsModule,
    PrescriptionsModule,
    MedicinesModule,
    OrdersModule,
    PharmaciesModule,
    PaymentsModule,
    AiChatModule,
    FacilitiesModule,
    PatientRegistrationModule,
    TriageModule,
    TeleconsultationModule,
    EhrModule,
    ReferralsModule,
    InventoryModule,
    FollowUpsModule,
    EmergencyModule,
    DashboardsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
