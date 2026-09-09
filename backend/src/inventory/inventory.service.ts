import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getFacilityInventory(facilityId: string) {
    return this.prisma.facilityInventory.findMany({
      where: { facilityId },
      orderBy: [{ itemType: 'asc' }, { itemName: 'asc' }],
    });
  }

  async updateStock(
    facilityId: string,
    itemId: string,
    data: { currentStock?: number; isOperational?: boolean },
  ) {
    const item = await this.prisma.facilityInventory.findFirst({
      where: { id: itemId, facilityId },
    });
    if (!item) throw new NotFoundException('Inventory item not found for facility');

    return this.prisma.facilityInventory.update({
      where: { id: itemId },
      data: {
        currentStock: data.currentStock !== undefined ? data.currentStock : item.currentStock,
        isOperational: data.isOperational !== undefined ? data.isOperational : item.isOperational,
        lastCheckedAt: new Date(),
      },
    });
  }

  async checkAvailability(facilityId: string, itemsToCheck: string[]) {
    const inventory = await this.prisma.facilityInventory.findMany({
      where: {
        facilityId,
        itemName: { in: itemsToCheck, mode: 'insensitive' },
      },
    });

    const results = itemsToCheck.map((name) => {
      const match = inventory.find((i) => i.itemName.toLowerCase() === name.toLowerCase());
      if (!match) {
        return { item: name, available: false, reason: 'Not carried at this facility' };
      }
      if (match.itemType === 'MEDICINE' && match.currentStock <= 0) {
        return { item: name, available: false, reason: 'Out of stock' };
      }
      if (match.itemType === 'DIAGNOSTIC_EQUIPMENT' && !match.isOperational) {
        return { item: name, available: false, reason: 'Equipment out of service / non-functional' };
      }
      return {
        item: name,
        available: true,
        stock: match.currentStock,
        isOperational: match.isOperational,
      };
    });

    return {
      allAvailable: results.every((r) => r.available),
      results,
    };
  }

  async seedDefaultFacilityInventory(facilityId: string, tier: string) {
    const defaultItems: Array<{ itemName: string; itemType: string; currentStock: number; unit: string }> = [
      { itemName: 'Paracetamol 500mg', itemType: 'MEDICINE', currentStock: 250, unit: 'strips' },
      { itemName: 'Amoxicillin 500mg', itemType: 'MEDICINE', currentStock: 120, unit: 'strips' },
      { itemName: 'ORS Packets', itemType: 'MEDICINE', currentStock: 300, unit: 'packets' },
      { itemName: 'Iron Folic Acid (IFA)', itemType: 'MEDICINE', currentStock: 400, unit: 'tablets' },
      { itemName: 'Zinc Sulfate 20mg', itemType: 'MEDICINE', currentStock: 150, unit: 'tablets' },
      { itemName: 'Pulse Oximeter', itemType: 'DIAGNOSTIC_EQUIPMENT', currentStock: 3, unit: 'devices' },
      { itemName: 'Digital BP Monitor', itemType: 'DIAGNOSTIC_EQUIPMENT', currentStock: 2, unit: 'devices' },
      { itemName: 'Rapid Malaria Test Kits', itemType: 'MEDICINE', currentStock: 80, unit: 'kits' },
      { itemName: 'Hemoglobinometer', itemType: 'DIAGNOSTIC_EQUIPMENT', currentStock: 2, unit: 'devices' },
      { itemName: 'Glucometer + Strips', itemType: 'DIAGNOSTIC_EQUIPMENT', currentStock: 100, unit: 'strips' },
    ];

    if (tier === 'PHC' || tier === 'CHC' || tier === 'DISTRICT_HOSPITAL') {
      defaultItems.push(
        { itemName: 'Inj Oxytocin 10 IU', itemType: 'MEDICINE', currentStock: 45, unit: 'ampoules' },
        { itemName: 'Inj Magnesium Sulfate 50%', itemType: 'MEDICINE', currentStock: 30, unit: 'vials' },
        { itemName: 'ECG Machine (12-Lead)', itemType: 'DIAGNOSTIC_EQUIPMENT', currentStock: 1, unit: 'device' },
        { itemName: 'Oxygen Concentrator', itemType: 'DIAGNOSTIC_EQUIPMENT', currentStock: 4, unit: 'devices' },
        { itemName: 'X-Ray Machine', itemType: 'DIAGNOSTIC_EQUIPMENT', currentStock: 1, unit: 'device' },
      );
    }

    if (tier === 'CHC' || tier === 'DISTRICT_HOSPITAL') {
      defaultItems.push(
        { itemName: 'Ultrasound Scanner (USG)', itemType: 'DIAGNOSTIC_EQUIPMENT', currentStock: 1, unit: 'device' },
        { itemName: 'Blood Storage Unit', itemType: 'DIAGNOSTIC_EQUIPMENT', currentStock: 1, unit: 'refrigerator' },
        { itemName: 'Ventilator / BiPAP', itemType: 'DIAGNOSTIC_EQUIPMENT', currentStock: 2, unit: 'units' },
      );
    }

    for (const item of defaultItems) {
      await this.prisma.facilityInventory.create({
        data: {
          facilityId,
          itemName: item.itemName,
          itemType: item.itemType,
          currentStock: item.currentStock,
          unit: item.unit,
          isOperational: true,
        },
      });
    }

    return { count: defaultItems.length };
  }
}
