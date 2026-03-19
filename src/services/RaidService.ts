import { getPrisma } from '../db';
import { CombatSimulator } from './CombatSimulator';

export class RaidService {
  private prisma;

  constructor(databaseUrl: string) {
    this.prisma = getPrisma(databaseUrl);
  }

  /**
   * Enlists a party for the upcoming guild raid.
   */
  async enlistParty(guildId: string, partyId: string) {
    // In a real app, we'd have a RaidEnlistment table
    // For now, we'll use a Json field on the Raid model or Guild
    return this.prisma.guild.update({
      where: { id: guildId },
      data: {
        raidState: 'ACTIVE', // Simple flag
      },
    });
  }

  /**
   * Executes the raid simulation for the guild.
   */
  async fireRaid(guildId: string) {
    const guild = await this.prisma.guild.findUnique({
      where: { id: guildId },
      include: { members: { include: { characters: true } } },
    });

    if (!guild) throw new Error('Guild not found');

    // Statistical mass combat: Total Guild Power vs Gate Floor Difficulty
    const totalPower = guild.members.reduce((sum, member) => {
      return sum + member.characters.reduce((charSum, char) => charSum + char.level, 0);
    }, 0);

    const difficulty = guild.gateFloor * 10;
    const winChance = Math.min(0.9, totalPower / difficulty);

    const success = Math.random() < winChance;

    if (success) {
      // Advance the Gate Floor
      await this.prisma.guild.update({
        where: { id: guildId },
        data: {
          gateFloor: { increment: 100 },
          raidState: 'IDLE',
        },
      });
      return { success: true, newFloor: guild.gateFloor + 100 };
    } else {
      // Failure results in Injuries (Hospital system)
      await this.prisma.guild.update({
        where: { id: guildId },
        data: { raidState: 'IDLE' },
      });
      return { success: false, injuryApplied: true };
    }
  }
}
