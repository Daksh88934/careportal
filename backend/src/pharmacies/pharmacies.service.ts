import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreatePharmacyDto {
  name: string;
  licenseNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  operatingHours: string;
  deliveryRadius?: number;
  deliveryFee?: number;
  minimumOrderAmount?: number;
  description?: string;
  website?: string;
}

export interface UpdatePharmacyDto {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  operatingHours?: string;
  deliveryRadius?: number;
  deliveryFee?: number;
  minimumOrderAmount?: number;
  description?: string;
  website?: string;
  isActive?: boolean;
}

export interface PharmacySearchFilters {
  city?: string;
  state?: string;
  pincode?: string;
  isActive?: boolean;
  hasDelivery?: boolean;
  maxDeliveryFee?: number;
  maxDistance?: number;
  patientLocation?: { lat: number; lng: number };
}

@Injectable()
export class PharmaciesService {
  constructor(private prisma: PrismaService) {}

  async createPharmacy(userId: string, data: CreatePharmacyDto) {
    // Check if user already has a pharmacy
    const existingPharmacy = await this.prisma.pharmacy.findFirst({
      where: { userId },
    });

    if (existingPharmacy) {
      throw new BadRequestException('User already has a pharmacy registered');
    }

    // Check if license number is already used
    const existingLicense = await this.prisma.pharmacy.findFirst({
      where: { licenseNumber: data.licenseNumber },
    });

    if (existingLicense) {
      throw new BadRequestException('License number already registered');
    }

    return this.prisma.pharmacy.create({
      data: {
        userId,
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        licenseNumber: data.licenseNumber,
        contact: data.phone || data.email || '',
        deliveryRadius: data.deliveryRadius || 10,
        operatingHours:
          (typeof data.operatingHours === 'string'
            ? { hours: data.operatingHours }
            : data.operatingHours) || {},
        isActive: false, // Requires admin approval
        isVerified: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });
  }

  async getPharmacyById(id: string) {
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!pharmacy) {
      throw new NotFoundException('Pharmacy not found');
    }

    return pharmacy;
  }

  async getPharmacyByUserId(userId: string) {
    const pharmacy = await this.prisma.pharmacy.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!pharmacy) {
      throw new NotFoundException('Pharmacy not found for this user');
    }

    return pharmacy;
  }

  async getAllPharmacies(
    filters?: PharmacySearchFilters,
    page = 1,
    limit = 20
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters) {
      if (filters.city) {
        where.city = { contains: filters.city, mode: 'insensitive' };
      }
      if (filters.state) {
        where.state = { contains: filters.state, mode: 'insensitive' };
      }
      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }
      if (filters.hasDelivery) {
        where.deliveryRadius = { gt: 0 };
      }
    }

    const [pharmacies, total] = await Promise.all([
      this.prisma.pharmacy.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pharmacy.count({ where }),
    ]);

    return {
      pharmacies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updatePharmacy(
    id: string,
    data: UpdatePharmacyDto,
    userId: string,
    userRole: string
  ) {
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { id },
    });

    if (!pharmacy) {
      throw new NotFoundException('Pharmacy not found');
    }

    // Check permissions
    if (userRole === 'PHARMACY' && pharmacy.userId !== userId) {
      throw new ForbiddenException('You can only update your own pharmacy');
    } else if (userRole !== 'ADMIN' && userRole !== 'PHARMACY') {
      throw new ForbiddenException('Access denied');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.phone !== undefined || data.email !== undefined)
      updateData.contact = data.phone || data.email;
    if (data.deliveryRadius !== undefined)
      updateData.deliveryRadius = data.deliveryRadius;
    if (data.operatingHours !== undefined) {
      updateData.operatingHours =
        typeof data.operatingHours === 'string'
          ? { hours: data.operatingHours }
          : data.operatingHours;
    }
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return this.prisma.pharmacy.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });
  }

  async activatePharmacy(id: string) {
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { id },
    });

    if (!pharmacy) {
      throw new NotFoundException('Pharmacy not found');
    }

    return this.prisma.pharmacy.update({
      where: { id },
      data: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });
  }

  async deactivatePharmacy(id: string) {
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { id },
    });

    if (!pharmacy) {
      throw new NotFoundException('Pharmacy not found');
    }

    return this.prisma.pharmacy.update({
      where: { id },
      data: { isActive: false },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });
  }

  async verifyPharmacy(id: string) {
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { id },
    });

    if (!pharmacy) {
      throw new NotFoundException('Pharmacy not found');
    }

    return this.prisma.pharmacy.update({
      where: { id },
      data: { isVerified: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });
  }

  async deletePharmacy(id: string, userId: string, userRole: string) {
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!pharmacy) {
      throw new NotFoundException('Pharmacy not found');
    }

    // Check permissions
    if (userRole === 'PHARMACY' && pharmacy.userId !== userId) {
      throw new ForbiddenException('You can only delete your own pharmacy');
    } else if (userRole !== 'ADMIN' && userRole !== 'PHARMACY') {
      throw new ForbiddenException('Access denied');
    }

    // Check if pharmacy has orders
    if (pharmacy._count.orders > 0) {
      throw new BadRequestException(
        'Cannot delete pharmacy with existing orders'
      );
    }

    await this.prisma.pharmacy.delete({
      where: { id },
    });

    return { message: 'Pharmacy deleted successfully' };
  }

  async getNearbyPharmacies(lat: number, lng: number, radius = 10) {
    // This is a simplified implementation
    // In production, you would use PostGIS or similar for proper geospatial queries
    const pharmacies = await this.prisma.pharmacy.findMany({
      where: {
        isActive: true,
        deliveryRadius: { gte: radius },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // In a real implementation, you would calculate actual distances
    // For now, we'll return all active pharmacies with delivery
    return pharmacies.filter(
      pharmacy => pharmacy.deliveryRadius && pharmacy.deliveryRadius >= radius
    );
  }

  async getPharmacyStats(pharmacyId?: string) {
    const where = pharmacyId ? { id: pharmacyId } : {};

    const [total, active, verified, pending] = await Promise.all([
      this.prisma.pharmacy.count({ where }),
      this.prisma.pharmacy.count({ where: { ...where, isActive: true } }),
      this.prisma.pharmacy.count({ where: { ...where, isVerified: true } }),
      this.prisma.pharmacy.count({
        where: { ...where, isActive: false, isVerified: false },
      }),
    ]);

    return {
      total,
      active,
      verified,
      pending,
    };
  }

  async getPharmaciesByCity() {
    const result = await this.prisma.pharmacy.groupBy({
      by: ['city'],
      where: { isActive: true },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    return result.map(item => ({
      city: item.city,
      count: item._count.id,
    }));
  }

  async getPharmaciesByState() {
    const result = await this.prisma.pharmacy.groupBy({
      by: ['state'],
      where: { isActive: true },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    return result.map(item => ({
      state: item.state,
      count: item._count.id,
    }));
  }

  async searchPharmacies(query: string, filters?: PharmacySearchFilters) {
    const where: any = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (filters) {
      if (filters.city) {
        where.city = { contains: filters.city, mode: 'insensitive' };
      }
      if (filters.state) {
        where.state = { contains: filters.state, mode: 'insensitive' };
      }
      if (filters.hasDelivery) {
        where.deliveryRadius = { gt: 0 };
      }
    }

    return this.prisma.pharmacy.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getTopPharmacies(limit = 10) {
    return this.prisma.pharmacy.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: [{ rating: 'desc' }, { totalRatings: 'desc' }],
      take: limit,
    });
  }

  async updatePharmacyLocation(
    id: string,
    lat: number,
    lng: number,
    userId: string,
    userRole: string
  ) {
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { id },
    });

    if (!pharmacy) {
      throw new NotFoundException('Pharmacy not found');
    }

    // Check permissions
    if (userRole === 'PHARMACY' && pharmacy.userId !== userId) {
      throw new ForbiddenException(
        'You can only update your own pharmacy location'
      );
    } else if (userRole !== 'ADMIN' && userRole !== 'PHARMACY') {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.pharmacy.update({
      where: { id },
      data: {
        latitude: lat,
        longitude: lng,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });
  }
}
