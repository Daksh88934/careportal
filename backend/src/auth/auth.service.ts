import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from './otp.service';
import * as bcrypt from 'bcryptjs';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private otpService: OtpService
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, phone, password, name, role } = signupDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        phone,
        name,
        role,
        passwordHash,
        isVerified: false,
      },
    });

    // Create role-specific profile
    if (role === 'PATIENT') {
      await this.prisma.patient.create({
        data: { userId: user.id },
      });
    } else if (role === 'DOCTOR') {
      await this.prisma.doctor.create({
        data: {
          userId: user.id,
          qualification: '',
          registrationNumber: `TEMP-${user.id}`,
          specialties: [],
          clinicAddress: '',
          consultFee: 0,
          availableHours: {},
        },
      });
    } else if (role === 'PHARMACY') {
      await this.prisma.pharmacy.create({
        data: {
          userId: user.id,
          name: name,
          address: '',
          licenseNumber: `TEMP-${user.id}`,
          contact: phone,
          operatingHours: {},
        },
      });
    }

    // Send OTP for verification
    await this.otpService.sendOtp(user.id, phone, 'registration');

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
      ...tokens,
      message: 'Account created. Please verify your phone number.',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
      ...tokens,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) return null;

    return user;
  }

  async refreshToken(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Delete old refresh token
    await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });

    const tokens = await this.generateTokens(
      tokenRecord.user.id,
      tokenRecord.user.email,
      tokenRecord.user.role
    );

    return tokens;
  }

  async requestOtp(userId: string, phone: string, purpose: string) {
    return this.otpService.sendOtp(userId, phone, purpose);
  }

  async verifyOtp(userId: string, code: string) {
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        userId,
        code,
        isUsed: false,
        expiresAt: { gte: new Date() },
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Mark OTP as used
    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // Mark user as verified if this is registration OTP
    if (otpRecord.purpose === 'registration') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });
    }

    return { message: 'OTP verified successfully' };
  }

  async logout(userId: string) {
    // Delete all refresh tokens for the user
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        doctor: true,
        patient: true,
        pharmacy: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload);

    const refreshTokenString = require('crypto').randomBytes(40).toString('hex');
    const refreshExpiresIn = parseInt(
      this.configService.get('JWT_REFRESH_EXPIRES_IN') || '604800'
    );
    const expiresAt = new Date(Date.now() + refreshExpiresIn * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshTokenString,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenString,
      expiresIn: parseInt(
        this.configService.get('JWT_EXPIRES_IN') || '900'
      ),
    };
  }
}
