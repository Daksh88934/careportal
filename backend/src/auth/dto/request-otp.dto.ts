import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({ description: 'Phone number', example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be in international format (e.g., +919876543210)',
  })
  phone: string;

  @ApiProperty({
    description: 'Purpose of OTP',
    example: 'registration',
    enum: ['registration', 'login', 'password_reset'],
  })
  @IsString()
  @IsNotEmpty()
  purpose: string;
}
