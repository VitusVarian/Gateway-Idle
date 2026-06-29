# Phase 2: TypeScript Type Definitions

## File: src/types/character.ts

export interface CharacterAttributes {
  strength: number;
  speed: number;
  endurance: number;
  vitality: number;
  piety: number;
  divinity: number;
}

export interface CalculatedStats {
  damageIncrease: number;
  lifeIncrease: number;
  protectionIncrease: number;
  speedIncrease: number;
}

export interface Resources {
  gold: number;
}

export interface ForgingMaterials {
  iron: number;
  quartz: number;
  rubies: number;
  sapphire: number;
  emeralds: number;
  topaz: number;
}

export interface CharacterState {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  skillPoints: {
    unspent: number;
    total: number;
  };
  attributes: CharacterAttributes;
  calculatedStats: CalculatedStats;
  resources: Resources;
  forgingMaterials: ForgingMaterials;
}

## File: src/types/equipment.ts

export type EquipmentSlotType = 'weapon' | 'bodyArmor' | 'ring' | 'amulet';

export interface ItemStats {
  damage?: number;
  health?: number;
  protection?: number;
  strengthBonus?: number;
  speedBonus?: number;
  enduranceBonus?: number;
  vitalityBonus?: number;
  pietyBonus?: number;
}

export interface Item {
  id: string;
  name: string;
  type: EquipmentSlotType;
  stats: ItemStats;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  purchasePrice: number;
  sellPrice: number; // Always 50% of purchasePrice
}

export interface InventoryItem extends Item {
  equipped: boolean;
}

export interface EquipmentSlots {
  weapon: Item | null;
  bodyArmor: Item | null;
  rings: (Item | null, Item | null);
  amulet: Item | null;
}

export interface EquipmentState {
  slots: EquipmentSlots;
  inventory: InventoryItem[];
}

## File: src/types/combat.ts

export interface Monster {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  experienceReward: number;
  unlockCondition: number; // Player level required to unlock
}

export interface CombatLogEntry {
  timestamp: number;
  source: 'player' | 'monster';
  message: string;
  damageDealt?: number;
}

export interface BattleState {
  isActive: boolean;
  currentMonsterId: string | null;
  playerHp: number;
  playerMaxHp: number;
  monsterHp: number;
  monsterMaxHp: number;
  combatLog: CombatLogEntry[];
  cooldownTimer: number; // Seconds until next battle can start
}

## File: src/types/prayer.ts

export type PrayerStatType = 'strength' | 'speed' | 'vitality' | 'endurance';

export interface PrayerState {
  activeStat: PrayerStatType | null;
  progress: number; // 0 to 1
  remainingTime: number; // seconds
  totalTime: number; // seconds for current prayer
  totalPrayers: Record<PrayerStatType, number>;
}

## File: src/types/mining.ts

export interface MiningState {
  isActive: boolean;
  progress: number; // 0 to 1
  remainingTime: number; // seconds
  totalTime: number; // seconds for current mine
  totalMines: number;
}

## File: src/types/save.ts

import { CharacterState } from './character';
import { EquipmentState } from './equipment';
import { PrayerState } from './prayer';
import { MiningState } from './mining';

export interface SaveGame {
  id: string;
  version: number;
  characterName: string;
  createdAt: number;
  lastPlayedAt: number;
  character: CharacterState;
  equipment: EquipmentState;
  prayer: PrayerState;
  mining: MiningState;
  unlockedMonsters: string[];
  checksum: string; // For anti-cheat validation
}

## File: src/types/index.ts

// Re-export all types for easy importing
export * from './character';
export * from './equipment';
export * from './combat';
export * from './prayer';
export * from './mining';
export * from './save';
