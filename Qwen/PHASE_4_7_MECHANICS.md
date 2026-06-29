# Phase 4-7: Core Game Mechanics - Detailed Instructions

## Phase 4: Landing Page (app/page.tsx)

### Components Needed:
1. SaveFileCard - displays a single save file option
2. NewGameModal - dialog for creating a new save
3. DeleteConfirmModal - confirmation before deleting a save

### Flow:
1. On mount, fetch all saves from IndexedDB
2. Display each save with: character name, level, last played date
3. \"Continue\" button loads the save and navigates to /home
4. \"New Game\" opens modal for character name input
5. \"Delete\" opens confirmation modal
6. If no saves exist, show a welcome screen with \"Start New Game\"

## Phase 5: UI Shell (src/components/GameLayout.tsx)

### Structure:
`	sx
<GameLayout>
  <Header>
    - Game title: \"Gateway Incremental\"
    - Character level badge
    - Gold amount display
    - Manual save button
  </Header>
  <div className=\"flex\">
    <Sidebar>
      - Navigation links (Home, Armory, Temple, Training Grounds, Tepke Mines)
      - Locked items shown with lock icon and disabled state
    </Sidebar>
    <main>
      - {children} - page content
    </main>
  </div>
</GameLayout>
`

### Mobile Responsive:
- Sidebar collapses to hamburger menu on screens < 768px
- Header remains visible on all screen sizes
- Touch targets minimum 44x44px

### Color Scheme (Tailwind config):
`javascript
theme: {
  extend: {
    colors: {
      'game-dark': '#1a1a2e',
      'game-darker': '#16213e',
      'game-accent': '#00d2ff',
      'game-text': '#e0e0e0',
      'game-text-dim': '#b0b0b0',
    }
  }
}
`

## Phase 6: Game Formulas (src/lib/formulas.ts)

### Prayer Time Calculation
`	ypescript
// Base: 60 seconds
// Each point in the stat adds 10% to the time
// Piety reduces time by 5% per point
// Divinity increases time by 2% per point
export function calculatePrayerTime(
  statPoints: number,
  piety: number,
  divinity: number
): number {
  const baseTime = 60;
  const statPenalty = 1 + (statPoints * 0.1);
  const pietyBonus = 1 + (piety * 0.05);
  const divinityPenalty = 1 + (divinity * 0.02);
  return baseTime * (statPenalty / pietyBonus) * divinityPenalty;
}
`

### Mining Reward Calculation
`	ypescript
// Base gold: 10
// Each mine adds 2% to gold reward
// Forging material drop chance: 10% base, scales slightly with mines
export function calculateMiningReward(totalMines: number): {
  gold: number;
  materialDropChance: number;
} {
  const baseGold = 10;
  const gold = Math.floor(baseGold * (1 + totalMines * 0.02));
  const materialDropChance = Math.min(0.1 + (totalMines * 0.001), 0.5);
  return { gold, materialDropChance };
}
`

### Experience & Leveling
`	ypescript
// Experience needed for next level scales exponentially
export function calculateExpToNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}
`

### Combat Damage Calculation
`	ypescript
// Player damage = baseDamage * (1 + strength * 0.1) * equipmentDamageBonus
// Monster damage = monsterBaseDamage
// Damage reduction = protection / (protection + 100)
export function calculatePlayerDamage(
  strength: number,
  equipmentDamageBonus: number
): number {
  const baseDamage = 10;
  return baseDamage * (1 + strength * 0.1) * (1 + equipmentDamageBonus);
}

export function calculateDamageReduction(protection: number): number {
  return protection / (protection + 100);
}
`

### Combat Speed / Action Timing
`	ypescript
// Higher speed = faster actions
// Base action interval: 2 seconds
// Speed reduces interval by 5% per point (min 0.2s)
export function calculateActionInterval(speed: number): number {
  const baseInterval = 2000; // ms
  const reduction = Math.min(speed * 0.05, 0.9);
  return Math.max(baseInterval * (1 - reduction), 200);
}
`

## Phase 7: Combat System Design

### Combat Flow:
1. Player selects monster from list
2. BattleState.isActive = true
3. Game tick drives combat:
   - Compare player speed vs monster speed to determine who acts
   - Loser takes damage based on winner's damage stats
   - Apply damage reduction from protection
   - Log the action
4. When either HP reaches 0, combat ends
5. If player wins: award experience, check for level up
6. Start 10-second cooldown timer before next battle

### Combat Log Display:
- Scrollable log showing last 20 entries
- Each entry shows: timestamp, actor, action, damage
- Auto-scroll to latest entry
- Color coding: green for player actions, red for monster actions

### Monster Progression:
- Monster N is unlocked after defeating Monster N-1
- Monster stats scale with ID (health, damage increase ~20% per tier)
- Experience reward scales with monster difficulty
