import { ItemFactory } from './ItemFactory';

export interface LootResult {
  gold: number;
  items: any[];
}

export class LootEngine {
  private itemFactory: ItemFactory;

  constructor(private prisma: any) {
    this.itemFactory = new ItemFactory(prisma);
  }

  /**
   * Generates loot for a successful battle based on floor level.
   */
  async generateLoot(userId: string, floorLevel: number): Promise<LootResult> {
    const gold = Math.floor(10 * Math.pow(1.1, floorLevel));
    const items: any[] = [];

    // 10% chance for an item drop per kill
    if (Math.random() < 0.1) {
      const item = await this.itemFactory.generateItem(userId, floorLevel);
      items.push(item);
    }

    return { gold, items };
  }

  /**
   * Statistical loot generation for offline progress.
   */
  async generateOfflineLoot(userId: string, floorLevel: number, totalKills: number): Promise<LootResult> {
    const avgGoldPerKill = 10 * Math.pow(1.1, floorLevel);
    let gold = Math.floor(avgGoldPerKill * totalKills);
    
    // Statistical item drops (10% of kills)
    const potentialItems = Math.floor(totalKills * 0.1);
    const items: any[] = [];
    
    // To avoid creating 10,000 items in the DB, we only generate up to 5 "special" items
    // and convert the rest to "Trash Loot Gold" (50% value as per GDD).
    const maxItems = 5;
    for (let i = 0; i < Math.min(potentialItems, maxItems); i++) {
      const item = await this.itemFactory.generateItem(userId, floorLevel);
      items.push(item);
    }
    
    // Auto-sell logic for the remaining potential items
    const trashItemsValue = (potentialItems - items.length) * (avgGoldPerKill * 0.5);
    gold += Math.floor(trashItemsValue);

    return { gold, items };
  }
}
