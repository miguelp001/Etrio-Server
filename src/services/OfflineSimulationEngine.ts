import { Character, Party } from '@prisma/client';
import { getPrisma } from '../db';
import { CombatSimulator } from './CombatSimulator';
import { LootEngine } from './LootEngine';
import { CharacterService } from './CharacterService';
import { InventoryService } from './InventoryService';

export class OfflineSimulationEngine {
  private prisma;
  private lootEngine: LootEngine;
  private charService: CharacterService;
  private invService: InventoryService;

  constructor(databaseUrl: string) {
    this.prisma = getPrisma(databaseUrl);
    this.lootEngine = new LootEngine(databaseUrl);
    this.charService = new CharacterService(databaseUrl);
    this.invService = new InventoryService(databaseUrl);
  }

  /**
   * Main catch-up logic for offline progress.
   */
  async processOfflineProgress(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { characters: { where: { isHero: true } } },
    });

    if (!user || user.characters.length === 0) return;

    const hero = user.characters[0];
    const now = new Date();
    const lastUpdate = new Date(hero.lastUpdate);
    const secondsOffline = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);

    if (secondsOffline < 60) return; // Minimum 1 minute for simulation

    // Get party members and floor level
    const party = await this.prisma.party.findFirst({
      where: {
        members: { some: { id: hero.id } },
      },
      include: { members: true },
    });

    if (!party) return;

    // Calculate efficiency
    const { winRate, avgTimePerKill } = CombatSimulator.calculateEfficiency(party.members, party.lastFloor);

    // Kills = (Time / TimePerKill) * WinRate
    const totalKills = Math.floor((secondsOffline / avgTimePerKill) * winRate);

    // Generate Rewards
    const rewards = await this.lootEngine.generateOfflineLoot(userId, party.lastFloor, totalKills);

    // Apply Gold
    await this.prisma.user.update({
      where: { id: userId },
      data: { gold: { increment: rewards.gold } },
    });

    // Apply XP and Durability loss to all members
    const xpPerKill = 50 * Math.pow(1.05, party.lastFloor);
    const totalXp = BigInt(Math.floor(xpPerKill * totalKills));

    for (const member of party.members) {
      await this.charService.updateExperience(member.id, totalXp);
      
      // Degrade equipped items (1 durability per 100 kills)
      const equippedItems = await this.prisma.item.findMany({
        where: { equippedToId: member.id },
      });
      
      for (const item of equippedItems) {
        await this.invService.degradeDurability(item.id, Math.floor(totalKills / 100));
      }

      // Update lastUpdate timestamp
      await this.prisma.character.update({
        where: { id: member.id },
        data: { lastUpdate: now },
      });
    }

    return {
      secondsOffline,
      totalKills,
      goldGained: rewards.gold,
      itemsGained: rewards.items.length,
      xpGained: totalXp.toString(),
    };
  }
}
