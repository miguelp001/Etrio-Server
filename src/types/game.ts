export enum ClassType {
  WARRIOR = 'WARRIOR',
  MAGE = 'MAGE',
  HEALER = 'HEALER',
  THIEF = 'THIEF'
}

export enum SubClassType {
  NONE = 'NONE',
  PALADIN = 'PALADIN',
  BERSERKER = 'BERSERKER',
  ARCHMAGE = 'ARCHMAGE',
  NECROMANCER = 'NECROMANCER',
  BISHOP = 'BISHOP',
  PROPHET = 'PROPHET',
  ASSASSIN = 'ASSASSIN',
  ROGUE = 'ROGUE'
}

export interface CalculatedStats {
  atk: number;
  def: number;
  spd: number;
  hp: number;
  mp: number;
}
