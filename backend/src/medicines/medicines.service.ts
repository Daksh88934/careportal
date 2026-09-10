import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateMedicineDto {
  name: string;
  sku?: string;
  manufacturer: string;
  category: string;
  description?: string;
  sideEffects?: string;
  composition?: string;
  dosageForm: string;
  strength?: string;
  unitPrice: number;
  price?: number;
  stock?: number;
  packSize?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  requiresPrescription?: boolean;
  imageUrl?: string;
}

export interface UpdateMedicineDto {
  name?: string;
  sku?: string;
  manufacturer?: string;
  category?: string;
  description?: string;
  sideEffects?: string;
  composition?: string;
  dosageForm?: string;
  strength?: string;
  unitPrice?: number;
  price?: number;
  stock?: number;
  packSize?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  requiresPrescription?: boolean;
  imageUrl?: string;
}

export interface MedicineSearchFilters {
  category?: string;
  manufacturer?: string;
  requiresPrescription?: boolean;
  isActive?: boolean;
  isAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

@Injectable()
export class MedicinesService {
  constructor(private prisma: PrismaService) {}

  async createMedicine(data: CreateMedicineDto) {
    const existingMedicine = await this.prisma.medicine.findFirst({
      where: {
        name: data.name,
        manufacturer: data.manufacturer,
      },
    });

    if (existingMedicine) {
      throw new BadRequestException(
        'Medicine with this name and manufacturer already exists'
      );
    }

    const sku = data.sku || `MED-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    return this.prisma.medicine.create({
      data: {
        name: data.name,
        sku,
        manufacturer: data.manufacturer,
        category: data.category,
        description: data.description,
        sideEffects: data.sideEffects,
        composition: data.composition,
        dosageForm: data.dosageForm || 'tablet',
        strength: data.strength,
        unitPrice: data.unitPrice || data.price || 0,
        gstPercent: 5.0,
        stock: data.stock !== undefined ? data.stock : 100,
        packSize: data.packSize || '10 tablets',
        isActive: data.isActive !== undefined ? data.isActive : (data.isAvailable !== undefined ? data.isAvailable : true),
        requiresPrescription: data.requiresPrescription !== undefined ? data.requiresPrescription : true,
        imageUrl: data.imageUrl,
      },
    });
  }

  async getMedicineById(id: string) {
    const medicine = await this.prisma.medicine.findUnique({
      where: { id },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    return medicine;
  }

  async getAllMedicines(
    page = 1,
    limit = 20,
    search?: string,
    filters?: MedicineSearchFilters
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { composition: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (filters) {
      if (filters.category) {
        where.category = { contains: filters.category, mode: 'insensitive' };
      }
      if (filters.manufacturer) {
        where.manufacturer = {
          contains: filters.manufacturer,
          mode: 'insensitive',
        };
      }
      if (filters.requiresPrescription !== undefined) {
        where.requiresPrescription = filters.requiresPrescription;
      }
      if (filters.isActive !== undefined || filters.isAvailable !== undefined) {
        where.isActive = filters.isActive !== undefined ? filters.isActive : filters.isAvailable;
      }
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.unitPrice = {};
        if (filters.minPrice !== undefined) {
          where.unitPrice.gte = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          where.unitPrice.lte = filters.maxPrice;
        }
      }
    }

    const [medicines, total] = await Promise.all([
      this.prisma.medicine.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.medicine.count({ where }),
    ]);

    return {
      medicines,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateMedicine(id: string, data: UpdateMedicineDto) {
    const medicine = await this.prisma.medicine.findUnique({
      where: { id },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    if (data.name || data.manufacturer) {
      const existingMedicine = await this.prisma.medicine.findFirst({
        where: {
          id: { not: id },
          name: data.name || medicine.name,
          manufacturer: data.manufacturer || medicine.manufacturer,
        },
      });

      if (existingMedicine) {
        throw new BadRequestException(
          'Medicine with this name and manufacturer already exists'
        );
      }
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.manufacturer !== undefined) updateData.manufacturer = data.manufacturer;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.sideEffects !== undefined) updateData.sideEffects = data.sideEffects;
    if (data.composition !== undefined) updateData.composition = data.composition;
    if (data.dosageForm !== undefined) updateData.dosageForm = data.dosageForm;
    if (data.strength !== undefined) updateData.strength = data.strength;
    if (data.unitPrice !== undefined || data.price !== undefined) {
      updateData.unitPrice = data.unitPrice !== undefined ? data.unitPrice : data.price;
    }
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.packSize !== undefined) updateData.packSize = data.packSize;
    if (data.isActive !== undefined || data.isAvailable !== undefined) {
      updateData.isActive = data.isActive !== undefined ? data.isActive : data.isAvailable;
    }
    if (data.requiresPrescription !== undefined) {
      updateData.requiresPrescription = data.requiresPrescription;
    }
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

    return this.prisma.medicine.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteMedicine(id: string) {
    const medicine = await this.prisma.medicine.findUnique({
      where: { id },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    const orderItemCount = await this.prisma.orderItem.count({
      where: { medicineId: id },
    });

    if (orderItemCount > 0) {
      // Soft-delete if ordered previously
      return this.prisma.medicine.update({
        where: { id },
        data: { isActive: false },
      });
    }

    await this.prisma.medicine.delete({
      where: { id },
    });

    return { message: 'Medicine deleted successfully' };
  }

  async getMedicinesByCategory(category: string) {
    return this.prisma.medicine.findMany({
      where: {
        category: { contains: category, mode: 'insensitive' },
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getMedicinesByManufacturer(manufacturer: string) {
    return this.prisma.medicine.findMany({
      where: {
        manufacturer: { contains: manufacturer, mode: 'insensitive' },
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getPopularMedicines(limit = 10) {
    const popularOrderItems = await this.prisma.orderItem.groupBy({
      by: ['medicineId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    const medicineIds = popularOrderItems.map(item => item.medicineId);

    const medicines = await this.prisma.medicine.findMany({
      where: {
        id: { in: medicineIds },
        isActive: true,
      },
    });

    if (medicines.length === 0) {
      return this.prisma.medicine.findMany({
        where: { isActive: true },
        take: limit,
        orderBy: { name: 'asc' },
      });
    }

    return medicines;
  }

  async getMedicineCategories() {
    const medicines = await this.prisma.medicine.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });

    return medicines.map(m => ({
      category: m.category,
    }));
  }

  async getMedicineManufacturers() {
    const medicines = await this.prisma.medicine.findMany({
      where: { isActive: true },
      select: { manufacturer: true },
      distinct: ['manufacturer'],
    });

    return medicines.map(m => ({
      manufacturer: m.manufacturer,
    }));
  }

  async getMedicineStats() {
    const [total, available, prescriptionRequired] = await Promise.all([
      this.prisma.medicine.count(),
      this.prisma.medicine.count({ where: { isActive: true } }),
      this.prisma.medicine.count({ where: { requiresPrescription: true } }),
    ]);

    return {
      total,
      available,
      prescriptionRequired,
    };
  }

  async searchMedicinesBySymptoms(symptoms: string[]) {
    const searchTerms = symptoms.join(' ');

    return this.prisma.medicine.findMany({
      where: {
        OR: [
          { description: { contains: searchTerms, mode: 'insensitive' } },
          { category: { contains: searchTerms, mode: 'insensitive' } },
          { composition: { contains: searchTerms, mode: 'insensitive' } },
        ],
        isActive: true,
      },
      take: 20,
      orderBy: { name: 'asc' },
    });
  }

  async getMedicineInteractions(medicineId: string) {
    const medicine = await this.getMedicineById(medicineId);

    return {
      medicine,
      interactions: [],
      warnings: [
        'Consult your doctor before taking this medicine with other medications',
        'Do not exceed the recommended dosage',
        'Store in a cool, dry place',
      ],
    };
  }

  async bulkCreateMedicines(medicines: CreateMedicineDto[]) {
    const results = [];
    const errorsList = [];

    for (const medicineData of medicines) {
      try {
        const medicine = await this.createMedicine(medicineData);
        results.push(medicine);
      } catch (error) {
        errorsList.push({
          medicine: medicineData.name,
          error: error.message,
        });
      }
    }

    return {
      created: results.length,
      errorsCount: errorsList.length,
      results,
      errors: errorsList,
    };
  }

  async updateMedicineAvailability(id: string, isAvailable: boolean) {
    return this.updateMedicine(id, { isActive: isAvailable });
  }

  async getMedicinesByPriceRange(minPrice: number, maxPrice: number) {
    return this.prisma.medicine.findMany({
      where: {
        unitPrice: {
          gte: minPrice,
          lte: maxPrice,
        },
        isActive: true,
      },
      orderBy: { unitPrice: 'asc' },
    });
  }
}
