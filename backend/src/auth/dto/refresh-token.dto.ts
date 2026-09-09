import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token', example: 'abc123...' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
