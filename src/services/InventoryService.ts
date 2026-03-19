import { getPrisma } from '../db';

export class InventoryService {
  constructor(private prisma: any) {}

  async equipItem(characterId: string, itemId: string) {
    // Un-equip current item in the same slot if needed (simplifying for now)
    // In a real app, logic would check slots (Weapon, Armor, etc.)
    
    return this.prisma.item.update({
      where: { id: itemId },
      data: {
        equippedToId: characterId,
        charId: characterId, // Ensure it stays in the character's inventory
      },
    });
  }

  async unequipItem(itemId: string) {
    return this.prisma.item.update({
      where: { id: itemId },
      data: {
        equippedToId: null,
      },
    });
  }

  async degradeDurability(itemId: string, amount: number) {
    const item = await this.prisma.item.findUnique({ where: { id: itemId } });
    if (!item) throw new Error('Item not found');

    const newDurability = Math.max(0, item.durability - amount);
    
    if (newDurability === 0) {
      // Permanently destroy the item if durability reaches 0 as per GDD
      return this.prisma.item.delete({
        where: { id: itemId },
      });
    }

    return this.prisma.item.update({
      where: { id: itemId },
      data: { durability: newDurability },
    });
  }

  async getInventory(characterId: string) {
    return this.prisma.item.findMany({
      where: { charId: characterId },
    });
  }
}
