import { getPrisma } from '../db';
import { CharacterService } from './CharacterService';

export class HeirSystem {
  private charService: CharacterService;

  constructor(private prisma: any) {
    this.charService = new CharacterService(prisma);
  }

  /**
   * Triggers the "Grand Retirement" of the current hero, creating the next generation.
   */
  async retireAndBirthHeir(userId: string, inheritedItemId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { 
        characters: { where: { isHero: true } },
        items: true
      },
    });

    if (!user || user.characters.length === 0) throw new Error('Hero not found');

    const hero = user.characters[0];
    const newMultiplier = hero.heirMultiplier * 1.1; // Permanent +10% boost
    const newGeneration = hero.generation + 1;

    // 1. Validate Inherited Item
    const item = await this.prisma.item.findUnique({ where: { id: inheritedItemId } });
    if (!item || item.ownerId !== userId) throw new Error('Invalid inherited item');

    // 2. Wipe Current Party & NPCs associated with this user
    // In a real database, we might move them to a "Graveyard" or simply delete.
    await this.prisma.character.deleteMany({
      where: { userId: userId }
    });

    // 3. Create the Heir
    const newHero = await this.prisma.character.create({
      data: {
        userId: userId,
        name: `${hero.name} II`, // Simple naming for now
        class: hero.class,
        isHero: true,
        heirMultiplier: newMultiplier,
        generation: newGeneration,
        level: 1,
        experience: BigInt(0),
        baseAtk: 10,
        baseDef: 10,
        baseSpd: 10,
        baseHp: 100,
        baseMp: 50,
      }
    });

    // 4. Transfer the inherited item
    await this.prisma.item.update({
      where: { id: inheritedItemId },
      data: {
        charId: newHero.id,
        equippedToId: null, // Reset equipment state
      }
    });

    return {
      heir: newHero,
      inheritedItem: item,
      generation: newGeneration,
      multiplier: newMultiplier
    };
  }
}
