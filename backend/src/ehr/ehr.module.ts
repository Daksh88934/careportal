import { Module } from '@nestjs/common';
import { EhrService } from './ehr.service';
import { ConsentService } from './consent.service';
import { EhrController } from './ehr.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EhrController],
  providers: [EhrService, ConsentService],
  exports: [EhrService, ConsentService],
})
export class EhrModule {}
