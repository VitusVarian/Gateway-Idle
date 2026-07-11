import type {
  Avatar,
  Character,
  CombatState,
  Monster,
  Resources,
  SkillNodeData,
  SkillTreeState,
  Tool,
} from './types'

export const initialCharacter: Character = {
  id: 'char_001',
  name: 'Aldric',
  avatarId: 'avatar_knight_02',
  level: 7,
  xp: 154,
  xpRequired: 227,
  skillPoints: 2,
}

export const initialResources: Resources = {
  gold: 14820,
  totalMined: 923,
  toolEffectMultiplier: 1.25,
}

export const initialCombat: CombatState = {
  selectedMonsterLevel: 3,
  playerHp: 118,
  playerMaxHp: 140,
  enemyHp: 0,
  enemyMaxHp: 90,
  cooldownSecRemaining: 0,
  lastOutcome: 'none',
}

export const initialSkillTree: SkillTreeState = {
  availablePoints: 2,
  allocatedNodeIds: ['start_01', 'travel_str_02'],
}

export const avatars: Avatar[] = [
  { avatarId: 'avatar_knight_01', label: 'Iron Vanguard', seed: 'knight-one' },
  { avatarId: 'avatar_knight_02', label: 'Ashen Sentinel', seed: 'knight-two' },
  { avatarId: 'avatar_ranger_01', label: 'Gloom Ranger', seed: 'ranger-one' },
  { avatarId: 'avatar_mage_01', label: 'Ember Warden', seed: 'mage-one' },
  { avatarId: 'avatar_rogue_01', label: 'Nightblade', seed: 'rogue-one' },
  { avatarId: 'avatar_cleric_01', label: 'Pale Cleric', seed: 'cleric-one' },
]

export const monsters: Monster[] = [
  { id: 'm_1', name: 'Cave Rat', level: 1, maxHp: 35, xpReward: 12, goldReward: 40 },
  { id: 'm_2', name: 'Gloom Bat', level: 2, maxHp: 58, xpReward: 20, goldReward: 70 },
  { id: 'm_3', name: 'Ashen Ghoul', level: 3, maxHp: 90, xpReward: 34, goldReward: 120 },
  { id: 'm_4', name: 'Bone Warden', level: 4, maxHp: 128, xpReward: 52, goldReward: 190 },
  { id: 'm_5', name: 'Cursed Knight', level: 5, maxHp: 175, xpReward: 78, goldReward: 280 },
  { id: 'm_6', name: 'Void Revenant', level: 6, maxHp: 240, xpReward: 110, goldReward: 420 },
]

export const tools: Tool[] = [
  { toolId: 'tool_pick_iron', name: 'Iron Pickaxe', bonusPercent: 10, cost: 500 },
  { toolId: 'tool_pick_steel', name: 'Steel Pickaxe', bonusPercent: 25, cost: 2400 },
  { toolId: 'tool_drill_hand', name: 'Hand Drill', bonusPercent: 45, cost: 6800 },
  { toolId: 'tool_drill_auto', name: 'Automated Drill', bonusPercent: 80, cost: 18000 },
]

export const initialOwnedToolIds: string[] = ['tool_pick_iron']

/** Weapon and armor upgrade ladders for the blacksmith. */
export interface UpgradeTier {
  label: string
  value: string
  cost: number
}

export const weaponTiers: UpgradeTier[] = [
  { label: 'Worn Blade', value: '8 ATK', cost: 0 },
  { label: 'Honed Blade', value: '14 ATK', cost: 900 },
  { label: 'Runed Longsword', value: '23 ATK', cost: 3200 },
  { label: 'Ashsteel Greatsword', value: '38 ATK', cost: 9500 },
  { label: 'Void-Touched Edge', value: '60 ATK', cost: 24000 },
]

export const armorTiers: UpgradeTier[] = [
  { label: 'Tattered Mail', value: '12 DEF', cost: 0 },
  { label: 'Reinforced Mail', value: '20 DEF', cost: 1100 },
  { label: 'Knightly Plate', value: '33 DEF', cost: 3800 },
  { label: 'Warden Plate', value: '52 DEF', cost: 11000 },
  { label: 'Obsidian Aegis', value: '80 DEF', cost: 26000 },
]

/** Skill tree layout — laid out on a simple grid canvas (no heavy libs). */
export const skillNodes: SkillNodeData[] = [
  {
    nodeId: 'start_01',
    title: 'Awakening',
    description: 'The origin of your path. Unlocks the skill tree.',
    type: 'start',
    cost: 0,
    col: 2,
    row: 0,
    requires: [],
  },
  {
    nodeId: 'travel_str_01',
    title: 'Strength I',
    description: '+4% melee damage.',
    type: 'travel',
    cost: 1,
    col: 1,
    row: 1,
    requires: ['start_01'],
  },
  {
    nodeId: 'travel_str_02',
    title: 'Strength II',
    description: '+6% melee damage.',
    type: 'travel',
    cost: 1,
    col: 1,
    row: 2,
    requires: ['travel_str_01'],
  },
  {
    nodeId: 'notable_berserk',
    title: 'Bloodlust',
    description: 'Gain 10% attack speed while below half health.',
    type: 'notable',
    cost: 2,
    col: 1,
    row: 3,
    requires: ['travel_str_02'],
  },
  {
    nodeId: 'travel_vit_01',
    title: 'Vitality I',
    description: '+20 maximum health.',
    type: 'travel',
    cost: 1,
    col: 3,
    row: 1,
    requires: ['start_01'],
  },
  {
    nodeId: 'travel_vit_02',
    title: 'Vitality II',
    description: '+35 maximum health.',
    type: 'travel',
    cost: 1,
    col: 3,
    row: 2,
    requires: ['travel_vit_01'],
  },
  {
    nodeId: 'notable_bulwark',
    title: 'Iron Bulwark',
    description: 'Reduce incoming damage by 8%.',
    type: 'notable',
    cost: 2,
    col: 3,
    row: 3,
    requires: ['travel_vit_02'],
  },
  {
    nodeId: 'notable_prospect',
    title: 'Prospector',
    description: 'Mining yields 15% more gold.',
    type: 'notable',
    cost: 2,
    col: 2,
    row: 2,
    requires: ['start_01'],
  },
]
