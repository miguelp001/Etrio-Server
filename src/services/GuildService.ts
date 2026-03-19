import { getPrisma } from '../db';

export class GuildService {
  constructor(private prisma: any) {}

  async createGuild(name: string, ownerId: string) {
    return this.prisma.guild.create({
      data: {
        name,
        members: {
          connect: { id: ownerId },
        },
        level: 1,
        vaultGold: 0,
        buildings: JSON.stringify({ "Library": 1, "Armory": 1 }),
        gateFloor: 100,
      },
    });
  }

  async depositGold(guildId: string, userId: string, amount: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.gold < amount) throw new Error('Insufficient gold');

    // Deduct from user
    await this.prisma.user.update({
      where: { id: userId },
      data: { gold: { decrement: amount } },
    });

    // Add to guild vault
    return this.prisma.guild.update({
      where: { id: guildId },
      data: { vaultGold: { increment: amount } },
    });
  }

  async upgradeBuilding(guildId: string, buildingName: string, cost: number) {
    const guild = await this.prisma.guild.findUnique({ where: { id: guildId } });
    if (!guild || guild.vaultGold < cost) throw new Error('Insufficient guild gold');

    const buildings = JSON.parse(guild.buildings as string);
    buildings[buildingName] = (buildings[buildingName] || 0) + 1;

    return this.prisma.guild.update({
      where: { id: guildId },
      data: {
        vaultGold: { decrement: cost },
        buildings: JSON.stringify(buildings),
      },
    });
  }

  async getGuild(id: string) {
    return this.prisma.guild.findUnique({
      where: { id },
      include: { members: true },
    });
  }
}
