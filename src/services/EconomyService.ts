import { getPrisma } from '../db';

export class EconomyService {
  constructor(private prisma: any) {}

  /**
   * Processes the auto-sell logic for a set of items based on a rarity threshold.
   * "Trash loot" is converted to gold at 50% market value as per the GDD.
   */
  async autoSellTrash(userId: string, rarityThreshold: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { items: true },
    });

    if (!user) throw new Error('User not found');

    const rarities = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'CORRUPTED'];
    const thresholdIndex = rarities.indexOf(rarityThreshold);

    const itemsToSell = user.items.filter(item => {
      const itemIndex = rarities.indexOf(item.rarity);
      return itemIndex <= thresholdIndex && !item.equippedToId;
    });

    let totalGold = 0;
    for (const item of itemsToSell) {
      // Base market value = 20 * floor(level scale) - simplified for now
      const marketValue = 20; 
      totalGold += Math.floor(marketValue * 0.5);

      await this.prisma.item.delete({ where: { id: item.id } });
    }

    if (totalGold > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { gold: { increment: totalGold } },
      });
    }

    return { itemsSold: itemsToSell.length, goldGained: totalGold };
  }
}
