import { getPrisma } from '../db';
import { ClassType } from '../types/game';
import { CharacterService } from './CharacterService';

export class TavernService {
  private charService: CharacterService;

  constructor(private prisma: any) {
    this.charService = new CharacterService(prisma);
  }

  /**
   * Generates a list of hireable NPCs for the Tavern.
   */
  async getHireables(count: number = 5) {
    const classes = [ClassType.WARRIOR, ClassType.MAGE, ClassType.HEALER, ClassType.THIEF];
    const hireables = [];

    for (let i = 0; i < count; i++) {
      const cls = classes[Math.floor(Math.random() * classes.length)];
      hireables.push({
        name: `Traveler ${i + 1}`,
        class: cls,
        cost: 100, // Fixed cost for now
        baseAtk: 10,
        baseDef: 10,
        baseSpd: 10,
        baseHp: 100,
        baseMp: 50,
      });
    }

    return hireables;
  }

  /**
   * Hires an NPC and adds them to the player's party/roster.
   */
  async hireNPC(userId: string, npcData: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.gold < npcData.cost) throw new Error('Insufficient gold');

    // Deduct gold
    await this.prisma.user.update({
      where: { id: userId },
      data: { gold: { decrement: npcData.cost } },
    });

    // Create NPC character
    return this.prisma.character.create({
      data: {
        userId: userId,
        name: npcData.name,
        class: npcData.class,
        isHero: false,
        isNPC: true,
        level: 1,
        experience: BigInt(0),
        baseAtk: npcData.baseAtk,
        baseDef: npcData.baseDef,
        baseSpd: npcData.baseSpd,
        baseHp: npcData.baseHp,
        baseMp: npcData.baseMp,
      },
    });
  }
}
