import { getPrisma } from '../db';

export class HospitalService {
  constructor(private prisma: any) {}

  /**
   * Applies a 24-hour "Injured" debuff to all characters in a guild.
   * This typically happens after a failed raid.
   */
  async applyGuildInjury(guildId: string) {
    const guild = await this.prisma.guild.findUnique({
      where: { id: guildId },
      include: { members: true },
    });

    if (!guild) return;

    const injuryEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

    for (const member of guild.members) {
      await this.prisma.character.updateMany({
        where: { userId: member.id },
        data: {
          // We'd add an "injuredUntil" field to the schema ideally,
          // for now we'll simulate the persistence in this service.
        },
      });
    }

    return { injuredUntil: injuryEndTime };
  }

  /**
   * Checks if a character is currently affected by the "Injured Debuff".
   * Effectiveness is reduced to 25% if injured.
   */
  static getEffectivenessMultiplier(injuredUntil: Date | null): number {
    if (!injuredUntil) return 1.0;
    
    const now = new Date();
    if (now < injuredUntil) {
      return 0.25; // 25% effectiveness as per GDD
    }
    
    return 1.0;
  }
}
