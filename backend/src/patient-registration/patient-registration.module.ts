import { Module } from '@nestjs/common';
import { PatientRegistrationService } from './patient-registration.service';
import { PatientRegistrationController } from './patient-registration.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PatientRegistrationController],
  providers: [PatientRegistrationService],
  exports: [PatientRegistrationService],
})
export class PatientRegistrationModule {}
