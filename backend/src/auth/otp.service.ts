import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  async sendOtp(userId: string, phone: string, purpose: string): Promise<{ message: string }> {
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate existing OTPs for this user/purpose
    await this.prisma.otpCode.updateMany({
      where: { userId, purpose, isUsed: false },
      data: { isUsed: true },
    });

    // Create new OTP record
    await this.prisma.otpCode.create({
      data: {
        userId,
        code,
        purpose,
        expiresAt,
      },
    });

    // In production this would call Twilio/SMS provider
    // For development, we log the OTP
    const twilioEnabled = this.configService.get('TWILIO_ACCOUNT_SID');
    if (twilioEnabled && twilioEnabled !== 'your-twilio-account-sid') {
      await this.sendViaTwilio(phone, code);
    } else {
      this.logger.log(`[DEV MODE] OTP for ${phone} (${purpose}): ${code}`);
    }

    return { message: `OTP sent to ${phone}` };
  }

  private async sendViaTwilio(phone: string, code: string) {
    try {
      const twilio = require('twilio');
      const client = twilio(
        this.configService.get('TWILIO_ACCOUNT_SID'),
        this.configService.get('TWILIO_AUTH_TOKEN')
      );

      await client.messages.create({
        body: `Your Care Portal verification code is: ${code}. Valid for 10 minutes.`,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to: phone,
      });
    } catch (error) {
      this.logger.error(`Failed to send SMS via Twilio: ${error.message}`);
    }
  }
}
