import { Module } from '@nestjs/common';
import { TeleconsultationService } from './teleconsultation.service';
import { TeleconsultationController } from './teleconsultation.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TeleconsultationController],
  providers: [TeleconsultationService],
  exports: [TeleconsultationService],
})
export class TeleconsultationModule {}
