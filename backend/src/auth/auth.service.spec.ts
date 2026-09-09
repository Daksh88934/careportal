import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword',
    role: 'PATIENT',
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOtp = {
    id: '1',
    userId: '1',
    code: '123456',
    type: 'EMAIL_VERIFICATION',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    isUsed: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      otp: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    const signupDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'PATIENT' as const,
    };

    it('should create a new user successfully', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword');
      prismaService.user.create.mockResolvedValue(mockUser);
      prismaService.otp.create.mockResolvedValue(mockOtp);

      const result = await service.signup(signupDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signupDto.email },
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(signupDto.password, 12);
      expect(prismaService.user.create).toHaveBeenCalled();
      expect(prismaService.otp.create).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'User created successfully. Please verify your email.',
        userId: mockUser.id,
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.signup(signupDto)).rejects.toThrow(
        ConflictException
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signupDto.email },
      });
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true);
      jwtService.sign
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');
      configService.get
        .mockReturnValueOnce('15m') // ACCESS_TOKEN_EXPIRES_IN
        .mockReturnValueOnce('7d'); // REFRESH_TOKEN_EXPIRES_IN
      prismaService.refreshToken.create.mockResolvedValue({
        id: '1',
        token: 'refreshToken',
        userId: '1',
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      const result = await service.login(loginDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password
      );
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      prismaService.user.findUnique.mockResolvedValue(inactiveUser);
      mockedBcrypt.compare.mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('verifyOtp', () => {
    const verifyOtpDto = {
      userId: '1',
      code: '123456',
      type: 'EMAIL_VERIFICATION' as const,
    };

    it('should verify OTP successfully', async () => {
      prismaService.otp.findFirst.mockResolvedValue(mockOtp);
      prismaService.user.update.mockResolvedValue({
        ...mockUser,
        isVerified: true,
      });
      prismaService.otp.update.mockResolvedValue({ ...mockOtp, isUsed: true });

      const result = await service.verifyOtp(verifyOtpDto);

      expect(prismaService.otp.findFirst).toHaveBeenCalledWith({
        where: {
          userId: verifyOtpDto.userId,
          code: verifyOtpDto.code,
          type: verifyOtpDto.type,
          isUsed: false,
          expiresAt: { gt: expect.any(Date) },
        },
      });
      expect(result).toEqual({ message: 'Email verified successfully' });
    });

    it('should throw BadRequestException for invalid OTP', async () => {
      prismaService.otp.findFirst.mockResolvedValue(null);

      await expect(service.verifyOtp(verifyOtpDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException for expired OTP', async () => {
      const expiredOtp = { ...mockOtp, expiresAt: new Date(Date.now() - 1000) };
      prismaService.otp.findFirst.mockResolvedValue(expiredOtp);

      await expect(service.verifyOtp(verifyOtpDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto = {
      refreshToken: 'validRefreshToken',
    };

    it('should refresh token successfully', async () => {
      const mockRefreshToken = {
        id: '1',
        token: 'validRefreshToken',
        userId: '1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date(),
      };

      prismaService.refreshToken.findUnique.mockResolvedValue(mockRefreshToken);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      jwtService.sign
        .mockReturnValueOnce('newAccessToken')
        .mockReturnValueOnce('newRefreshToken');
      configService.get.mockReturnValueOnce('15m').mockReturnValueOnce('7d');
      prismaService.refreshToken.delete.mockResolvedValue(mockRefreshToken);
      prismaService.refreshToken.create.mockResolvedValue({
        ...mockRefreshToken,
        token: 'newRefreshToken',
      });

      const result = await service.refreshToken(refreshTokenDto);

      expect(result).toHaveProperty('accessToken', 'newAccessToken');
      expect(result).toHaveProperty('refreshToken', 'newRefreshToken');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      prismaService.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      const expiredRefreshToken = {
        id: '1',
        token: 'expiredRefreshToken',
        userId: '1',
        expiresAt: new Date(Date.now() - 1000), // Expired
        createdAt: new Date(),
      };

      prismaService.refreshToken.findUnique.mockResolvedValue(
        expiredRefreshToken
      );

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('generateOtp', () => {
    it('should generate a 6-digit OTP', () => {
      const otp = service.generateOtp();
      expect(otp).toMatch(/^\d{6}$/);
      expect(otp.length).toBe(6);
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      jwtService.sign
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');
      configService.get.mockReturnValueOnce('15m').mockReturnValueOnce('7d');

      const result = service.generateTokens('1', 'PATIENT');

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });
  });
});
