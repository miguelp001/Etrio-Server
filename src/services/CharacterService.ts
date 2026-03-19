import { getPrisma } from '../db';
import { ClassType } from '../types/game';
import { StatEngine } from './StatEngine';

export class CharacterService {
  constructor(private prisma: any) {}

  async createCharacter(userId: string, name: string, classType: ClassType, isHero: boolean = false) {
    return this.prisma.character.create({
      data: {
        userId,
        name,
        class: classType,
        isHero,
        isNPC: !isHero,
        level: 1,
        experience: BigInt(0),
        baseAtk: 10,
        baseDef: 10,
        baseSpd: 10,
        baseHp: 100,
        baseMp: 50,
        heirMultiplier: 1.0,
      },
    });
  }

  async updateExperience(id: string, xpGain: bigint) {
    const char = await this.prisma.character.findUnique({ where: { id } });
    if (!char) throw new Error('Character not found');

    const newXp = BigInt(char.experience) + xpGain;
    
    // Check for level up
    const { leveled, newLevel } = StatEngine.checkLevelUp({ ...char, experience: newXp });
    
    return this.prisma.character.update({
      where: { id },
      data: { 
        experience: newXp,
        level: newLevel,
      },
    });
  }

  async getCalculatedStats(id: string) {
    const char = await this.prisma.character.findUnique({ where: { id } });
    if (!char) throw new Error('Character not found');

    return StatEngine.calculateBaseStats(char);
  }
}
