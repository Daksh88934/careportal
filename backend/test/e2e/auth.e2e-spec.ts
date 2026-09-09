import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prismaService.refreshToken.deleteMany();
    await prismaService.otp.deleteMany();
    await prismaService.user.deleteMany();
  });

  describe('/auth/signup (POST)', () => {
    const signupDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'PATIENT',
    };

    it('should create a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto)
        .expect(201);

      expect(response.body).toHaveProperty(
        'message',
        'User created successfully. Please verify your email.'
      );
      expect(response.body).toHaveProperty('userId');

      // Verify user was created in database
      const user = await prismaService.user.findUnique({
        where: { email: signupDto.email },
      });
      expect(user).toBeTruthy();
      expect(user.firstName).toBe(signupDto.firstName);
      expect(user.lastName).toBe(signupDto.lastName);
      expect(user.role).toBe(signupDto.role);
      expect(user.isVerified).toBe(false);

      // Verify OTP was created
      const otp = await prismaService.otp.findFirst({
        where: { userId: user.id, type: 'EMAIL_VERIFICATION' },
      });
      expect(otp).toBeTruthy();
    });

    it('should return 409 for duplicate email', async () => {
      // Create user first
      await prismaService.user.create({
        data: {
          ...signupDto,
          password: await bcrypt.hash(signupDto.password, 12),
        },
      });

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto)
        .expect(409);
    });

    it('should return 400 for invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ ...signupDto, email: 'invalid-email' })
        .expect(400);
    });

    it('should return 400 for weak password', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ ...signupDto, password: '123' })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    let user: any;

    beforeEach(async () => {
      // Create verified user for login tests
      user = await prismaService.user.create({
        data: {
          email: 'test@example.com',
          password: await bcrypt.hash('password123', 12),
          firstName: 'John',
          lastName: 'Doe',
          role: 'PATIENT',
          isVerified: true,
          isActive: true,
        },
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');

      // Verify refresh token was stored
      const refreshToken = await prismaService.refreshToken.findFirst({
        where: { userId: user.id },
      });
      expect(refreshToken).toBeTruthy();
    });

    it('should return 401 for invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should return 401 for invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should return 401 for unverified user', async () => {
      await prismaService.user.update({
        where: { id: user.id },
        data: { isVerified: false },
      });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should return 401 for inactive user', async () => {
      await prismaService.user.update({
        where: { id: user.id },
        data: { isActive: false },
      });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('/auth/verify-otp (POST)', () => {
    let user: any;
    let otp: any;

    beforeEach(async () => {
      user = await prismaService.user.create({
        data: {
          email: 'test@example.com',
          password: await bcrypt.hash('password123', 12),
          firstName: 'John',
          lastName: 'Doe',
          role: 'PATIENT',
          isVerified: false,
        },
      });

      otp = await prismaService.otp.create({
        data: {
          userId: user.id,
          code: '123456',
          type: 'EMAIL_VERIFICATION',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      });
    });

    it('should verify OTP successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          userId: user.id,
          code: '123456',
          type: 'EMAIL_VERIFICATION',
        })
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Email verified successfully'
      );

      // Verify user is now verified
      const updatedUser = await prismaService.user.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser.isVerified).toBe(true);

      // Verify OTP is marked as used
      const updatedOtp = await prismaService.otp.findUnique({
        where: { id: otp.id },
      });
      expect(updatedOtp.isUsed).toBe(true);
    });

    it('should return 400 for invalid OTP', async () => {
      await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          userId: user.id,
          code: '999999',
          type: 'EMAIL_VERIFICATION',
        })
        .expect(400);
    });

    it('should return 400 for expired OTP', async () => {
      await prismaService.otp.update({
        where: { id: otp.id },
        data: { expiresAt: new Date(Date.now() - 1000) }, // Expired
      });

      await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          userId: user.id,
          code: '123456',
          type: 'EMAIL_VERIFICATION',
        })
        .expect(400);
    });

    it('should return 400 for already used OTP', async () => {
      await prismaService.otp.update({
        where: { id: otp.id },
        data: { isUsed: true },
      });

      await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          userId: user.id,
          code: '123456',
          type: 'EMAIL_VERIFICATION',
        })
        .expect(400);
    });
  });

  describe('/auth/refresh-token (POST)', () => {
    let user: any;
    let refreshToken: any;

    beforeEach(async () => {
      user = await prismaService.user.create({
        data: {
          email: 'test@example.com',
          password: await bcrypt.hash('password123', 12),
          firstName: 'John',
          lastName: 'Doe',
          role: 'PATIENT',
          isVerified: true,
          isActive: true,
        },
      });

      refreshToken = await prismaService.refreshToken.create({
        data: {
          userId: user.id,
          token: 'valid-refresh-token',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });
    });

    it('should refresh token successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .send({
          refreshToken: 'valid-refresh-token',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      // Verify old refresh token was deleted
      const oldToken = await prismaService.refreshToken.findUnique({
        where: { id: refreshToken.id },
      });
      expect(oldToken).toBeNull();

      // Verify new refresh token was created
      const newToken = await prismaService.refreshToken.findFirst({
        where: { userId: user.id },
      });
      expect(newToken).toBeTruthy();
      expect(newToken.token).not.toBe('valid-refresh-token');
    });

    it('should return 401 for invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401);
    });

    it('should return 401 for expired refresh token', async () => {
      await prismaService.refreshToken.update({
        where: { id: refreshToken.id },
        data: { expiresAt: new Date(Date.now() - 1000) }, // Expired
      });

      await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .send({
          refreshToken: 'valid-refresh-token',
        })
        .expect(401);
    });
  });

  describe('Protected routes', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create user and get access token
      const user = await prismaService.user.create({
        data: {
          email: 'test@example.com',
          password: await bcrypt.hash('password123', 12),
          firstName: 'John',
          lastName: 'Doe',
          role: 'PATIENT',
          isVerified: true,
          isActive: true,
        },
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      accessToken = loginResponse.body.accessToken;
    });

    it('should access protected route with valid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should return 401 for protected route without token', async () => {
      await request(app.getHttpServer()).get('/auth/profile').expect(401);
    });

    it('should return 401 for protected route with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
