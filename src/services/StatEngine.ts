import { Character, ClassType } from '@prisma/client';

export interface CalculatedStats {
  atk: number;
  def: number;
  spd: number;
  hp: number;
  mp: number;
}

export class StatEngine {
  /**
   * Calculates the current stats of a character based on level, class, and heir multipliers.
   * Equipment bonuses are added separately in the combat/simulation layers.
   */
  static calculateBaseStats(character: Character): CalculatedStats {
    const { level, class: classType, heirMultiplier } = character;
    
    // Growth rates per level (arbitrary balanced values)
    const growth = {
      [ClassType.WARRIOR]: { atk: 2.0, def: 2.5, spd: 1.2, hp: 15.0, mp: 2.0 },
      [ClassType.MAGE]:    { atk: 3.5, def: 1.0, spd: 1.5, hp: 8.0,  mp: 8.0 },
      [ClassType.HEALER]:  { atk: 1.5, def: 1.8, spd: 1.3, hp: 12.0, mp: 6.0 },
      [ClassType.THIEF]:   { atk: 2.8, def: 1.2, spd: 3.0, hp: 10.0, mp: 3.0 },
    };

    const rates = growth[classType];

    const stats: CalculatedStats = {
      atk: Math.floor((character.baseAtk + (rates.atk * (level - 1))) * heirMultiplier),
      def: Math.floor((character.baseDef + (rates.def * (level - 1))) * heirMultiplier),
      spd: Math.floor((character.baseSpd + (rates.spd * (level - 1))) * heirMultiplier),
      hp:  Math.floor((character.baseHp  + (rates.hp  * (level - 1))) * heirMultiplier),
      mp:  Math.floor((character.baseMp  + (rates.mp  * (level - 1))) * heirMultiplier),
    };

    return stats;
  }

  /**
   * Returns the XP required for a specific level.
   * Formula: base * (level ^ exponent)
   */
  static getXpForLevel(level: number): bigint {
    if (level <= 1) return BigInt(0);
    const base = 100;
    const exponent = 2.5;
    return BigInt(Math.floor(base * Math.pow(level - 1, exponent)));
  }

  /**
   * Checks if a character has enough XP to level up.
   */
  static checkLevelUp(character: Character): { leveled: boolean; newLevel: number } {
    let currentLevel = character.level;
    const currentXp = BigInt(character.experience);
    
    let leveled = false;
    while (currentXp >= this.getXpForLevel(currentLevel + 1)) {
      currentLevel++;
      leveled = true;
    }

    return { leveled, newLevel: currentLevel };
  }
}
