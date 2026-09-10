import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MedicinesService } from '../medicines/medicines.service';
import { OrderStatus } from '@prisma/client';

export interface CreateOrderDto {
  prescriptionId?: string;
  patientId: string;
  pharmacyId: string;
  items: OrderItemDto[];
  deliveryAddress: string;
  deliveryType?: 'PICKUP' | 'DELIVERY';
  notes?: string;
}

export interface OrderItemDto {
  medicineId: string;
  quantity: number;
  prescribedQuantity?: number;
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  notes?: string;
  pharmacyNotes?: string;
  estimatedDelivery?: Date;
  estimatedDeliveryTime?: Date;
  trackingNumber?: string;
  deliveryPersonName?: string;
  deliveryPersonPhone?: string;
}

export interface OrderSearchFilters {
  status?: OrderStatus;
  pharmacyId?: string;
  patientId?: string;
  startDate?: Date;
  endDate?: Date;
  deliveryType?: 'PICKUP' | 'DELIVERY';
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private medicinesService: MedicinesService
  ) {}

  async createOrder(data: CreateOrderDto) {
    // Validate patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: data.patientId },
      include: { user: true },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Validate pharmacy exists and is active
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { id: data.pharmacyId },
      include: { user: true },
    });

    if (!pharmacy) {
      throw new NotFoundException('Pharmacy not found');
    }

    if (!pharmacy.isActive) {
      throw new BadRequestException('Pharmacy is not active');
    }

    // If prescription-based order, validate prescription
    if (data.prescriptionId) {
      const prescription = await this.prisma.prescription.findUnique({
        where: { id: data.prescriptionId },
      });

      if (!prescription) {
        throw new NotFoundException('Prescription not found');
      }

      if (prescription.patientId !== data.patientId) {
        throw new BadRequestException(
          'Prescription does not belong to this patient'
        );
      }
    }

    // Validate medicines exist and are available
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of data.items) {
      const medicine = await this.prisma.medicine.findUnique({
        where: { id: item.medicineId },
      });

      if (!medicine) {
        throw new NotFoundException(`Medicine ${item.medicineId} not found`);
      }

      if (!medicine.isActive || (medicine.stock !== undefined && medicine.stock <= 0)) {
        throw new BadRequestException(
          `Medicine ${medicine.name} is currently out of stock`
        );
      }

      // Check if medicine requires prescription
      if (medicine.requiresPrescription && !data.prescriptionId) {
        throw new BadRequestException(
          `Medicine ${medicine.name} requires a prescription`
        );
      }

      const price = Number(medicine.unitPrice);
      const itemTotal = price * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        medicineId: item.medicineId,
        quantity: item.quantity,
        unitPrice: price,
        totalPrice: itemTotal,
      });
    }

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        patientId: data.patientId,
        pharmacyId: data.pharmacyId,
        totalAmount,
        deliveryAddress: data.deliveryAddress,
        status: 'PLACED',
        notes: data.notes,
        orderItems: {
          create: validatedItems,
        },
      },
      include: {
        orderItems: {
          include: { medicine: true },
        },
        patient: {
          include: { user: true },
        },
        pharmacy: {
          include: { user: true },
        },
        payments: true,
      },
    });

    return order;
  }

  async getOrderById(id: string, userId: string, userRole: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: { medicine: true },
        },
        patient: {
          include: { user: true },
        },
        pharmacy: {
          include: { user: true },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check access permissions
    const isPatient = order.patient.userId === userId;
    const isPharmacy = order.pharmacy.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isPatient && !isPharmacy && !isAdmin) {
      throw new ForbiddenException('Access denied to this order');
    }

    return order;
  }

  async getOrdersByPatient(
    patientId: string,
    userId: string,
    userRole: string
  ) {
    // Verify access permissions
    if (userRole === 'PATIENT') {
      const patient = await this.prisma.patient.findFirst({
        where: { userId },
      });
      if (!patient || patient.id !== patientId) {
        throw new ForbiddenException('Access denied');
      }
    } else if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.order.findMany({
      where: { patientId },
      include: {
        orderItems: {
          include: { medicine: true },
        },
        pharmacy: {
          include: { user: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrdersByPharmacy(
    pharmacyId: string,
    userId: string,
    userRole: string,
    filters?: OrderSearchFilters
  ) {
    // Verify access permissions
    if (userRole === 'PHARMACY') {
      const pharmacy = await this.prisma.pharmacy.findFirst({
        where: { userId },
      });
      if (!pharmacy || pharmacy.id !== pharmacyId) {
        throw new ForbiddenException('Access denied');
      }
    } else if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }

    const where: any = { pharmacyId };

    if (filters) {
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
          where.createdAt.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.createdAt.lte = filters.endDate;
        }
      }
    }

    return this.prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: { medicine: true },
        },
        patient: {
          include: { user: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrder(
    id: string,
    data: UpdateOrderDto,
    userId: string,
    userRole: string
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { pharmacy: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Only pharmacy or admin can update orders
    if (userRole === 'PHARMACY') {
      const pharmacy = await this.prisma.pharmacy.findFirst({
        where: { userId },
      });
      if (!pharmacy || pharmacy.id !== order.pharmacyId) {
        throw new ForbiddenException(
          'You can only update orders for your pharmacy'
        );
      }
    } else if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }

    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.notes || data.pharmacyNotes) updateData.notes = data.notes || data.pharmacyNotes;
    if (data.estimatedDelivery || data.estimatedDeliveryTime) {
      updateData.estimatedDelivery = data.estimatedDelivery || data.estimatedDeliveryTime;
    }
    if (data.trackingNumber || data.deliveryPersonName || data.deliveryPersonPhone) {
      updateData.trackingInfo = {
        trackingNumber: data.trackingNumber,
        deliveryPersonName: data.deliveryPersonName,
        deliveryPersonPhone: data.deliveryPersonPhone,
      };
    }

    return this.prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        orderItems: {
          include: { medicine: true },
        },
        patient: {
          include: { user: true },
        },
        pharmacy: {
          include: { user: true },
        },
        payments: true,
      },
    });
  }

  async confirmOrder(id: string, userId: string, userRole: string) {
    return this.updateOrder(id, { status: 'PROCESSING' }, userId, userRole);
  }

  async prepareOrder(id: string, userId: string, userRole: string) {
    return this.updateOrder(id, { status: 'PROCESSING' }, userId, userRole);
  }

  async readyForPickup(id: string, userId: string, userRole: string) {
    return this.updateOrder(
      id,
      { status: 'PROCESSING' },
      userId,
      userRole
    );
  }

  async dispatchOrder(
    id: string,
    data: {
      deliveryPersonName?: string;
      deliveryPersonPhone?: string;
      trackingNumber?: string;
    },
    userId: string,
    userRole: string
  ) {
    return this.updateOrder(
      id,
      {
        status: 'SHIPPED',
        deliveryPersonName: data.deliveryPersonName,
        deliveryPersonPhone: data.deliveryPersonPhone,
        trackingNumber: data.trackingNumber,
      },
      userId,
      userRole
    );
  }

  async deliverOrder(id: string, userId: string, userRole: string) {
    return this.updateOrder(id, { status: 'DELIVERED' }, userId, userRole);
  }

  async cancelOrder(
    id: string,
    reason: string,
    userId: string,
    userRole: string
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { patient: true, pharmacy: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if user can cancel this order
    const isPatient = order.patient.userId === userId;
    const isPharmacy = order.pharmacy.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isPatient && !isPharmacy && !isAdmin) {
      throw new ForbiddenException('Access denied');
    }

    // Only allow cancellation if order is not yet dispatched
    if (['SHIPPED', 'DELIVERED'].includes(order.status)) {
      throw new BadRequestException(
        'Cannot cancel order that has been dispatched or delivered'
      );
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: reason,
      },
      include: {
        orderItems: {
          include: { medicine: true },
        },
        patient: {
          include: { user: true },
        },
        pharmacy: {
          include: { user: true },
        },
        payments: true,
      },
    });
  }

  async getOrderStats(pharmacyId?: string) {
    const where = pharmacyId ? { pharmacyId } : {};

    const [
      total,
      placed,
      processing,
      shipped,
      delivered,
      cancelled,
    ] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.count({ where: { ...where, status: 'PLACED' } }),
      this.prisma.order.count({ where: { ...where, status: 'PROCESSING' } }),
      this.prisma.order.count({ where: { ...where, status: 'SHIPPED' } }),
      this.prisma.order.count({ where: { ...where, status: 'DELIVERED' } }),
      this.prisma.order.count({ where: { ...where, status: 'CANCELLED' } }),
    ]);

    const totalRevenue = await this.prisma.order.aggregate({
      where: { ...where, status: 'DELIVERED' },
      _sum: { totalAmount: true },
    });

    return {
      total,
      placed,
      processing,
      shipped,
      delivered,
      cancelled,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    };
  }

  async getRecentOrders(limit = 10, pharmacyId?: string) {
    const where = pharmacyId ? { pharmacyId } : {};

    return this.prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: { medicine: true },
        },
        patient: {
          include: { user: true },
        },
        pharmacy: {
          include: { user: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async createOrderFromPrescription(
    prescriptionId: string,
    pharmacyId: string,
    deliveryAddress: string,
    deliveryType: 'PICKUP' | 'DELIVERY' = 'DELIVERY'
  ) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        patient: true,
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    const content = (prescription.content as any) || {};
    const medicines = Array.isArray(content.medicines) ? content.medicines : [];
    const orderItems: OrderItemDto[] = medicines.map((m: any) => ({
      medicineId: m.medicineId || m.id,
      quantity: m.quantity || 1,
      prescribedQuantity: m.quantity || 1,
    })).filter((item: any) => !!item.medicineId);

    return this.createOrder({
      prescriptionId,
      patientId: prescription.patientId,
      pharmacyId,
      items: orderItems,
      deliveryAddress,
      deliveryType,
    });
  }
}
