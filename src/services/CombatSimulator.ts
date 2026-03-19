// import { Character } from '@prisma/client';
import { StatEngine } from './StatEngine';
import { CalculatedStats } from '../types/game';

export interface CombatEntity {
  id: string;
  name: string;
  stats: CalculatedStats;
  currentHp: number;
}

export interface BattleResult {
  winner: 'PARTY' | 'ENEMIES';
  rounds: number;
  log: string[];
}

export class CombatSimulator {
  
  /**
   * Resolves a turn-based battle between a party and a group of enemies.
   */
  static resolveBattle(partyMembers: any[], enemies: CombatEntity[]): BattleResult {
    const party: CombatEntity[] = partyMembers.map((m: any) => ({
      id: m.id,
      name: m.name,
      stats: StatEngine.calculateBaseStats(m),
      currentHp: StatEngine.calculateBaseStats(m).hp,
    }));

    const log: string[] = [];
    let rounds = 0;
    const maxRounds = 100;

    while (rounds < maxRounds) {
      rounds++;
      
      // Speed-based turn order
      const combined = [...party, ...enemies].sort((a, b) => b.stats.spd - a.stats.spd);

      for (const attacker of combined) {
        if (attacker.currentHp <= 0) continue;

        const isPartyAttacking = party.includes(attacker);
        const targets = isPartyAttacking ? enemies : party;
        const aliveTargets = targets.filter(t => t.currentHp > 0);

        if (aliveTargets.length === 0) break;

        // Random target
        const target = aliveTargets[Math.floor(Math.random() * aliveTargets.length)];
        const damage = Math.max(1, attacker.stats.atk - target.stats.def);
        
        target.currentHp -= damage;
        log.push(`${attacker.name} attacks ${target.name} for ${damage} damage.`);

        if (target.currentHp <= 0) {
          log.push(`${target.name} has fallen!`);
        }
      }

      const partyAlive = party.some(p => p.currentHp > 0);
      const enemiesAlive = enemies.some(e => e.currentHp > 0);

      if (!partyAlive) return { winner: 'ENEMIES', rounds, log };
      if (!enemiesAlive) return { winner: 'PARTY', rounds, log };
    }

    return { winner: 'ENEMIES', rounds, log }; // Timeout defaults to loss
  }

  /**
   * Calculates the statistical win-rate and resource usage for offline progression.
   * This is the "single-tick" efficient math required by the GDD.
   */
  static calculateEfficiency(party: any[], floorLevel: number): { winRate: number; avgTimePerKill: number } {
    // Basic placeholder for statistical model
    // In a real implementation, we'd compare Party Total DPS vs Enemy HP/DEF
    return { winRate: 0.95, avgTimePerKill: 60 }; // 95% win rate, 60 seconds per kill
  }
}
