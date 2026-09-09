import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ description: '6-digit OTP code', example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;
}
