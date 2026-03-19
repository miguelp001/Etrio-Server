import { getPrisma } from '../db';

export interface ItemStats {
  atkBonus: number;
  defBonus: number;
  hpBonus: number;
  mpBonus: number;
}

export class ItemFactory {
  private prisma;

  constructor(databaseUrl: string) {
    this.prisma = getPrisma(databaseUrl);
  }

  // Configuration for procedural generation
  private static bases = [
    { name: 'Sword', type: 'WEAPON', atk: 5, def: 0 },
    { name: 'Staff', type: 'WEAPON', atk: 8, def: 0 },
    { name: 'Shield', type: 'ARMOR', atk: 0, def: 5 },
    { name: 'Plate Armor', type: 'ARMOR', atk: 0, def: 8 },
  ];

  private static prefixes = [
    { name: 'Sharp', atkMod: 1.2, defMod: 1.0 },
    { name: 'Sturdy', atkMod: 1.0, defMod: 1.2 },
    { name: 'Blessed', atkMod: 1.1, defMod: 1.1 },
    { name: 'Ancient', atkMod: 1.5, defMod: 1.5 },
  ];

  private static suffixes = [
    { name: 'of Might', atkAdd: 5 },
    { name: 'of Protection', defAdd: 5 },
    { name: 'of the Phoenix', hpAdd: 50 },
  ];

  async generateItem(ownerId: string, floorLevel: number) {
    const base = ItemFactory.bases[Math.floor(Math.random() * ItemFactory.bases.length)];
    const prefix = ItemFactory.prefixes[Math.floor(Math.random() * ItemFactory.prefixes.length)];
    const suffix = ItemFactory.suffixes[Math.floor(Math.random() * ItemFactory.suffixes.length)];

    // Scaling based on floor level
    const floorScale = 1 + (floorLevel * 0.05);

    // Corrupted Logic (5% chance)
    const isCorrupted = Math.random() < 0.05;
    const corruptionMultiplier = isCorrupted ? 2.5 : 1.0;

    const atkBonus = Math.floor((base.atk * prefix.atkMod * floorScale + (suffix.atkAdd || 0)) * corruptionMultiplier);
    const defBonus = Math.floor((base.def * prefix.defMod * floorScale + (suffix.defAdd || 0)) * corruptionMultiplier);
    const hpBonus = Math.floor((suffix.hpAdd || 0) * floorScale * corruptionMultiplier);
    const mpBonus = Math.floor((suffix.mpAdd || 0) * floorScale * corruptionMultiplier);

    const itemName = `${prefix.name} ${base.name} ${suffix.name}${isCorrupted ? ' (Corrupted)' : ''}`;

    return this.prisma.item.create({
      data: {
        ownerId,
        name: itemName,
        prefix: prefix.name,
        suffix: suffix.name,
        baseType: base.name,
        rarity: isCorrupted ? 'CORRUPTED' : 'RARE',
        isCorrupted,
        isStabilized: false,
        atkBonus,
        defBonus,
        hpBonus,
        mpBonus,
        durability: 100,
        maxDurability: 100,
      },
    });
  }

  async stabilizeItem(itemId: string) {
    const item = await this.prisma.item.findUnique({ where: { id: itemId } });
    if (!item || !item.isCorrupted) throw new Error('Item not found or not corrupted');

    // Stabilization significantly reduces the penalty (logic to be used in combat/healing)
    return this.prisma.item.update({
      where: { id: itemId },
      data: { isStabilized: true },
    });
  }
}
