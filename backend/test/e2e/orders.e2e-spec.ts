import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole, OrderStatus } from '@prisma/client';

describe('Orders (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let patientToken: string;
  let doctorToken: string;
  let pharmacyToken: string;
  let adminToken: string;

  let patientUser: any;
  let doctorUser: any;
  let pharmacyUser: any;
  let adminUser: any;
  let pharmacy: any;
  let medicine: any;
  let prescription: any;
  let order: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();

    // Clean up database
    await prisma.order.deleteMany();
    await prisma.prescription.deleteMany();
    await prisma.medicine.deleteMany();
    await prisma.pharmacy.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.user.deleteMany();

    // Create test users
    patientUser = await prisma.user.create({
      data: {
        email: 'patient@test.com',
        password: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.PATIENT,
        phoneNumber: '+1234567890',
        isVerified: true,
      },
    });

    doctorUser = await prisma.user.create({
      data: {
        email: 'doctor@test.com',
        password: 'hashedpassword',
        firstName: 'Dr. Sarah',
        lastName: 'Wilson',
        role: UserRole.DOCTOR,
        phoneNumber: '+1234567891',
        isVerified: true,
      },
    });

    pharmacyUser = await prisma.user.create({
      data: {
        email: 'pharmacy@test.com',
        password: 'hashedpassword',
        firstName: 'Pharmacy',
        lastName: 'Manager',
        role: UserRole.PHARMACY,
        phoneNumber: '+1234567892',
        isVerified: true,
      },
    });

    adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: 'hashedpassword',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        phoneNumber: '+1234567893',
        isVerified: true,
      },
    });

    // Create doctor profile
    const doctor = await prisma.doctor.create({
      data: {
        userId: doctorUser.id,
        specialization: 'Cardiology',
        licenseNumber: 'DOC123456',
        consultationFee: 500,
        experience: 10,
        qualifications: 'MBBS, MD',
      },
    });

    // Create pharmacy
    pharmacy = await prisma.pharmacy.create({
      data: {
        userId: pharmacyUser.id,
        name: 'Test Pharmacy',
        licenseNumber: 'PHARM123456',
        address: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        phoneNumber: '+1234567892',
        isActive: true,
        deliveryRadius: 10,
        deliveryFee: 50,
      },
    });

    // Create medicine
    medicine = await prisma.medicine.create({
      data: {
        name: 'Paracetamol',
        genericName: 'Acetaminophen',
        manufacturer: 'Test Pharma',
        category: 'Pain Relief',
        dosageForm: 'Tablet',
        strength: '500mg',
        price: 10.0,
        requiresPrescription: true,
        isAvailable: true,
        description: 'Pain relief medication',
      },
    });

    // Create prescription
    prescription = await prisma.prescription.create({
      data: {
        patientId: patientUser.id,
        doctorId: doctor.id,
        medicines: [
          {
            medicineId: medicine.id,
            dosage: '1 tablet',
            frequency: 'Twice daily',
            duration: '5 days',
            instructions: 'Take after meals',
          },
        ],
        diagnosis: 'Fever',
        notes: 'Rest and take medication',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Generate JWT tokens
    patientToken = jwtService.sign({
      sub: patientUser.id,
      email: patientUser.email,
    });
    doctorToken = jwtService.sign({
      sub: doctorUser.id,
      email: doctorUser.email,
    });
    pharmacyToken = jwtService.sign({
      sub: pharmacyUser.id,
      email: pharmacyUser.email,
    });
    adminToken = jwtService.sign({ sub: adminUser.id, email: adminUser.email });
  });

  afterAll(async () => {
    await prisma.order.deleteMany();
    await prisma.prescription.deleteMany();
    await prisma.medicine.deleteMany();
    await prisma.pharmacy.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('/orders (POST)', () => {
    it('should create order from prescription', async () => {
      const createOrderDto = {
        pharmacyId: pharmacy.id,
        prescriptionId: prescription.id,
        deliveryAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(createOrderDto)
        .expect(201);

      expect(response.body).toMatchObject({
        pharmacyId: pharmacy.id,
        patientId: patientUser.id,
        prescriptionId: prescription.id,
        status: OrderStatus.PENDING,
        totalAmount: expect.any(Number),
        deliveryAddress: createOrderDto.deliveryAddress,
      });

      order = response.body;
    });

    it('should create order with direct medicines', async () => {
      const createOrderDto = {
        pharmacyId: pharmacy.id,
        medicines: [
          {
            medicineId: medicine.id,
            quantity: 2,
          },
        ],
        deliveryAddress: {
          street: '456 Test Ave',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(createOrderDto)
        .expect(201);

      expect(response.body).toMatchObject({
        pharmacyId: pharmacy.id,
        patientId: patientUser.id,
        status: OrderStatus.PENDING,
        totalAmount: expect.any(Number),
        medicines: expect.arrayContaining([
          expect.objectContaining({
            medicineId: medicine.id,
            quantity: 2,
          }),
        ]),
      });
    });

    it('should fail to create order without authentication', async () => {
      const createOrderDto = {
        pharmacyId: pharmacy.id,
        medicines: [{ medicineId: medicine.id, quantity: 1 }],
        deliveryAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
        },
      };

      await request(app.getHttpServer())
        .post('/orders')
        .send(createOrderDto)
        .expect(401);
    });

    it('should fail to create order with invalid pharmacy', async () => {
      const createOrderDto = {
        pharmacyId: 'invalid-pharmacy-id',
        medicines: [{ medicineId: medicine.id, quantity: 1 }],
        deliveryAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
        },
      };

      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(createOrderDto)
        .expect(404);
    });
  });

  describe('/orders (GET)', () => {
    it('should get all orders for patient', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toMatchObject({
        patientId: patientUser.id,
        pharmacy: expect.objectContaining({
          name: pharmacy.name,
        }),
      });
    });

    it('should get all orders for pharmacy', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${pharmacyToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toMatchObject({
        pharmacyId: pharmacy.id,
        patient: expect.objectContaining({
          firstName: patientUser.firstName,
        }),
      });
    });

    it('should get all orders for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should fail to get orders without authentication', async () => {
      await request(app.getHttpServer()).get('/orders').expect(401);
    });
  });

  describe('/orders/:id (GET)', () => {
    it('should get specific order for patient', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${order.id}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: order.id,
        patientId: patientUser.id,
        pharmacyId: pharmacy.id,
      });
    });

    it('should get specific order for pharmacy', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${order.id}`)
        .set('Authorization', `Bearer ${pharmacyToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: order.id,
        pharmacyId: pharmacy.id,
      });
    });

    it('should fail to get order for unauthorized user', async () => {
      await request(app.getHttpServer())
        .get(`/orders/${order.id}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(403);
    });

    it('should fail to get non-existent order', async () => {
      await request(app.getHttpServer())
        .get('/orders/non-existent-id')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(404);
    });
  });

  describe('/orders/:id (PATCH)', () => {
    it('should update order status by pharmacy', async () => {
      const updateDto = {
        status: OrderStatus.CONFIRMED,
        pharmacyNotes: 'Order confirmed and being prepared',
      };

      const response = await request(app.getHttpServer())
        .patch(`/orders/${order.id}`)
        .set('Authorization', `Bearer ${pharmacyToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: order.id,
        status: OrderStatus.CONFIRMED,
        pharmacyNotes: 'Order confirmed and being prepared',
      });
    });

    it('should update order with delivery details', async () => {
      const updateDto = {
        status: OrderStatus.DISPATCHED,
        deliveryPersonName: 'John Delivery',
        deliveryPersonPhone: '+1234567899',
        trackingNumber: 'TRACK123456',
        estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      const response = await request(app.getHttpServer())
        .patch(`/orders/${order.id}`)
        .set('Authorization', `Bearer ${pharmacyToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: order.id,
        status: OrderStatus.DISPATCHED,
        deliveryPersonName: 'John Delivery',
        trackingNumber: 'TRACK123456',
      });
    });

    it('should fail to update order by patient', async () => {
      const updateDto = {
        status: OrderStatus.DELIVERED,
      };

      await request(app.getHttpServer())
        .patch(`/orders/${order.id}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(updateDto)
        .expect(403);
    });

    it('should fail to update non-existent order', async () => {
      const updateDto = {
        status: OrderStatus.CONFIRMED,
      };

      await request(app.getHttpServer())
        .patch('/orders/non-existent-id')
        .set('Authorization', `Bearer ${pharmacyToken}`)
        .send(updateDto)
        .expect(404);
    });
  });

  describe('/orders/:id/cancel (POST)', () => {
    let cancelableOrder: any;

    beforeAll(async () => {
      // Create a new order for cancellation test
      const createOrderDto = {
        pharmacyId: pharmacy.id,
        medicines: [{ medicineId: medicine.id, quantity: 1 }],
        deliveryAddress: {
          street: '789 Cancel St',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(createOrderDto);

      cancelableOrder = response.body;
    });

    it('should cancel order by patient', async () => {
      const response = await request(app.getHttpServer())
        .post(`/orders/${cancelableOrder.id}/cancel`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ reason: 'Changed my mind' })
        .expect(200);

      expect(response.body).toMatchObject({
        id: cancelableOrder.id,
        status: OrderStatus.CANCELLED,
        cancellationReason: 'Changed my mind',
      });
    });

    it('should fail to cancel already dispatched order', async () => {
      await request(app.getHttpServer())
        .post(`/orders/${order.id}/cancel`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ reason: 'Want to cancel' })
        .expect(400);
    });
  });

  describe('/orders/stats (GET)', () => {
    it('should get order statistics for patient', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/stats')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        total: expect.any(Number),
        pending: expect.any(Number),
        confirmed: expect.any(Number),
        dispatched: expect.any(Number),
        delivered: expect.any(Number),
        cancelled: expect.any(Number),
      });
    });

    it('should get order statistics for pharmacy', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/stats')
        .set('Authorization', `Bearer ${pharmacyToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        total: expect.any(Number),
        pending: expect.any(Number),
        confirmed: expect.any(Number),
        dispatched: expect.any(Number),
        delivered: expect.any(Number),
        cancelled: expect.any(Number),
      });
    });
  });

  describe('/orders/recent (GET)', () => {
    it('should get recent orders for patient', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/recent')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeLessThanOrEqual(10); // Should limit to 10 recent orders
    });

    it('should get recent orders for pharmacy', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/recent')
        .set('Authorization', `Bearer ${pharmacyToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeLessThanOrEqual(10);
    });
  });
});
