# Phase 3: State Management (Zustand) - Detailed Instructions

## File: src/store/gameStore.ts

### Store Setup
Use Zustand with persist middleware for automatic save/load.

`	ypescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { openDB } from 'idb';
import { CharacterState, EquipmentState, BattleState, PrayerState, MiningState, SaveGame } from '@/types';

// Initialize default states
const defaultCharacter: CharacterState = {
  level: 1,
  experience: 0,
  experienceToNextLevel: 100,
  skillPoints: { unspent: 0, total: 0 },
  attributes: {
    strength: 0,
    speed: 0,
    endurance: 0,
    vitality: 0,
    piety: 0,
    divinity: 0,
  },
  calculatedStats: {
    damageIncrease: 0,
    lifeIncrease: 0,
    protectionIncrease: 0,
    speedIncrease: 0,
  },
  resources: { gold: 0 },
  forgingMaterials: {
    iron: 0,
    quartz: 0,
    rubies: 0,
    sapphire: 0,
    emeralds: 0,
    topaz: 0,
  },
};

// Define the full store interface
interface GameState {
  // State
  character: CharacterState;
  equipment: EquipmentState;
  battle: BattleState;
  prayer: PrayerState;
  mining: MiningState;
  unlockedMonsters: string[];
  currentSaveId: string | null;

  // Actions - Character
  addExperience: (amount: number) => void;
  levelUp: () => void;
  spendSkillPoint: (stat: string) => void;

  // Actions - Prayer
  startPrayer: (stat: 'strength' | 'speed' | 'vitality' | 'endurance') => void;
  tickPrayer: (deltaSeconds: number) => void;
  completePrayer: () => void;

  // Actions - Mining
  startMining: () => void;
  tickMining: (deltaSeconds: number) => void;
  completeMining: () => void;

  // Actions - Combat
  startCombat: (monsterId: string) => void;
  tickCombat: (deltaSeconds: number) => void;
  endCombat: (playerWon: boolean) => void;

  // Actions - Equipment
  equipItem: (itemId: string) => void;
  unequipItem: (slot: string) => void;
  sellItem: (itemId: string) => void;

  // Actions - Save/Load
  newGame: (saveId: string, characterName: string) => void;
  loadGame: (saveData: SaveGame) => void;
  saveGame: () => Promise<void>;
  resetGame: () => void;
}
`

### IndexedDB Setup (src/db/saveDatabase.ts)
`	ypescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface GameDB extends DBSchema {
  saves: {
    key: string;
    value: any; // SaveGame type
  };
}

const dbName = 'GatewayIncremental';
const dbVersion = 1;

export async function getDB(): Promise<IDBPDatabase<GameDB>> {
  return openDB<GameDB>(dbName, dbVersion, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('saves')) {
        db.createObjectStore('saves', { keyPath: 'id' });
      }
    },
  });
}

export async function saveGame(saveData: any): Promise<void> {
  const db = await getDB();
  await db.put('saves', saveData);
}

export async function loadGame(saveId: string): Promise<any | undefined> {
  const db = await getDB();
  return await db.get('saves', saveId);
}

export async function listSaves(): Promise<any[]> {
  const db = await getDB();
  return await db.getAll('saves');
}

export async function deleteSave(saveId: string): Promise<void> {
  const db = await getDB();
  await db.delete('saves', saveId);
}
`

### Tick System Hook (src/hooks/useGameTick.ts)
`	ypescript
// Custom hook that manages the game tick
// Runs every 100ms and updates active timers
// Should be used in the main layout component
// Handles:
// - Prayer timer countdown
// - Mining timer countdown
// - Combat action timing
// - Cooldown timer countdown
// - Auto-save every 30 seconds
`

### Key Design Decisions
1. Single store for simplicity - all game state in one place
2. Persist middleware handles auto-save to IndexedDB
3. Tick system is centralized - one interval drives all time-based mechanics
4. Actions are pure functions that mutate state predictably
5. Checksum validation on load to detect tampering
