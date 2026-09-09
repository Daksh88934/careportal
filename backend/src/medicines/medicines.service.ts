import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateMedicineDto {
  name: string;
  genericName: string;
  manufacturer: string;
  category: string;
  description?: string;
  sideEffects?: string;
  contraindications?: string;
  dosageForm: string;
  strength: string;
  price: number;
  isAvailable: boolean;
  requiresPrescription: boolean;
  imageUrl?: string;
}

export interface UpdateMedicineDto {
  name?: string;
  genericName?: string;
  manufacturer?: string;
  category?: string;
  description?: string;
  sideEffects?: string;
  contraindications?: string;
  dosageForm?: string;
  strength?: string;
  price?: number;
  isAvailable?: boolean;
  requiresPrescription?: boolean;
  imageUrl?: string;
}

export interface MedicineSearchFilters {
  category?: string;
  manufacturer?: string;
  requiresPrescription?: boolean;
  isAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

@Injectable()
export class MedicinesService {
  constructor(private prisma: PrismaService) {}

  async createMedicine(data: CreateMedicineDto) {
    // Check if medicine with same name already exists
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

    return this.prisma.medicine.create({
      data,
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

    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Apply filters
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
      if (filters.isAvailable !== undefined) {
        where.isAvailable = filters.isAvailable;
      }
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {};
        if (filters.minPrice !== undefined) {
          where.price.gte = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          where.price.lte = filters.maxPrice;
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

    // Check for duplicate if name or manufacturer is being updated
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

    return this.prisma.medicine.update({
      where: { id },
      data,
    });
  }

  async deleteMedicine(id: string) {
    const medicine = await this.prisma.medicine.findUnique({
      where: { id },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    // Check if medicine is used in any prescriptions
    const prescriptionCount = await this.prisma.prescriptionMedicine.count({
      where: { medicineId: id },
    });

    if (prescriptionCount > 0) {
      throw new BadRequestException(
        'Cannot delete medicine that is used in prescriptions'
      );
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
        isAvailable: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getMedicinesByManufacturer(manufacturer: string) {
    return this.prisma.medicine.findMany({
      where: {
        manufacturer: { contains: manufacturer, mode: 'insensitive' },
        isAvailable: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getPopularMedicines(limit = 10) {
    // Get medicines that are most frequently prescribed
    const popularMedicines = await this.prisma.prescriptionMedicine.groupBy({
      by: ['medicineId'],
      _count: {
        medicineId: true,
      },
      orderBy: {
        _count: {
          medicineId: 'desc',
        },
      },
      take: limit,
    });

    const medicineIds = popularMedicines.map(pm => pm.medicineId);

    const medicines = await this.prisma.medicine.findMany({
      where: {
        id: { in: medicineIds },
        isAvailable: true,
      },
    });

    // Sort medicines by prescription count
    const sortedMedicines = medicines.sort((a, b) => {
      const aCount =
        popularMedicines.find(pm => pm.medicineId === a.id)?._count
          .medicineId || 0;
      const bCount =
        popularMedicines.find(pm => pm.medicineId === b.id)?._count
          .medicineId || 0;
      return bCount - aCount;
    });

    return sortedMedicines.map(medicine => ({
      ...medicine,
      prescriptionCount:
        popularMedicines.find(pm => pm.medicineId === medicine.id)?._count
          .medicineId || 0,
    }));
  }

  async getMedicineCategories() {
    const categories = await this.prisma.medicine.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      where: {
        isAvailable: true,
      },
      orderBy: {
        category: 'asc',
      },
    });

    return categories.map(cat => ({
      category: cat.category,
      count: cat._count.category,
    }));
  }

  async getMedicineManufacturers() {
    const manufacturers = await this.prisma.medicine.groupBy({
      by: ['manufacturer'],
      _count: {
        manufacturer: true,
      },
      where: {
        isAvailable: true,
      },
      orderBy: {
        manufacturer: 'asc',
      },
    });

    return manufacturers.map(man => ({
      manufacturer: man.manufacturer,
      count: man._count.manufacturer,
    }));
  }

  async getMedicineStats() {
    const [total, available, prescriptionRequired, categories, manufacturers] =
      await Promise.all([
        this.prisma.medicine.count(),
        this.prisma.medicine.count({ where: { isAvailable: true } }),
        this.prisma.medicine.count({ where: { requiresPrescription: true } }),
        this.prisma.medicine.groupBy({
          by: ['category'],
          _count: { category: true },
        }),
        this.prisma.medicine.groupBy({
          by: ['manufacturer'],
          _count: { manufacturer: true },
        }),
      ]);

    return {
      total,
      available,
      prescriptionRequired,
      categoriesCount: categories.length,
      manufacturersCount: manufacturers.length,
    };
  }

  async searchMedicinesBySymptoms(symptoms: string[]) {
    // This is a simplified implementation
    // In a real system, you'd have a more sophisticated mapping between symptoms and medicines
    const searchTerms = symptoms.join(' ');

    return this.prisma.medicine.findMany({
      where: {
        OR: [
          { description: { contains: searchTerms, mode: 'insensitive' } },
          { category: { contains: searchTerms, mode: 'insensitive' } },
        ],
        isAvailable: true,
      },
      take: 20,
      orderBy: { name: 'asc' },
    });
  }

  async getMedicineInteractions(medicineId: string) {
    // This would typically involve a drug interaction database
    // For now, return a placeholder response
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
    const errors = [];

    for (const medicineData of medicines) {
      try {
        const medicine = await this.createMedicine(medicineData);
        results.push(medicine);
      } catch (error) {
        errors.push({
          medicine: medicineData.name,
          error: error.message,
        });
      }
    }

    return {
      created: results.length,
      errors: errors.length,
      results,
      errors,
    };
  }

  async updateMedicineAvailability(id: string, isAvailable: boolean) {
    return this.updateMedicine(id, { isAvailable });
  }

  async getMedicinesByPriceRange(minPrice: number, maxPrice: number) {
    return this.prisma.medicine.findMany({
      where: {
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
        isAvailable: true,
      },
      orderBy: { price: 'asc' },
    });
  }
}
