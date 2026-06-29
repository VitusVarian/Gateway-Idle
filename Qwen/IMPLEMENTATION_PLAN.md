# Gateway Incremental - Implementation Plan
Created by: Qwen

## Phase 1: Project Setup and Core Architecture
### 1.1 Initialize Next.js Project
- Run: npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias \"@/*\"
- Install additional dependencies:
  - ` npm install zustand ` (state management)
  - ` npm install idb ` (IndexedDB wrapper for local save data)
  - ` npm install big.js ` or ` npm install decimal.js ` (large number handling for incremental game)
  - ` npm install date-fns ` (time utilities)

### 1.2 Folder Structure
@/
  app/
    (game)/          # Game routes (protected by save file selection)
      home/
      armory/
      temple/
      training-grounds/
      tepke-mines/
    page.tsx         # Save file selection landing page
  src/
    components/      # Reusable UI components
    hooks/           # Custom React hooks
    lib/             # Utilities, constants, config
    store/           # Zustand stores (game state)
    types/           # TypeScript type definitions
    utils/           # Game logic utilities (combat, mining, prayer calculations)
    db/              # IndexedDB save/load logic

## Phase 2: Type Definitions and Data Models
### 2.1 Core Types (src/types/)
Create TypeScript interfaces for all game entities:

**Character.ts:**
- CharacterStats: level, experience, skillPoints (unspent/total)
- Attributes: strength, speed, endurance, vitality, piety, divinity
- CalculatedStats: damageIncrease, lifeIncrease, protectionIncrease, speedIncrease
- Resources: gold
- ForgingMaterials: { iron, quartz, rubies, sapphire, emeralds, topaz }

**Equipment.ts:**
- Item interface: id, name, type, stats, rarity, sellPrice
- EquipmentSlot: weapon, bodyArmor, rings[2], amulet
- InventoryItem: extends Item with equipped boolean

**Combat.ts:**
- Monster interface: id, name, health, damage, speed, experienceReward, unlockCondition
- BattleState: playerHp, monsterHp, combatLog, isActive

**Prayer.ts:**
- PrayerState: activeStat, progress, remainingTime, totalPrayers

**Mining.ts:**
- MiningState: isActive, progress, remainingTime, totalMines

### 2.2 Save Game Schema
- SaveGame interface containing all character data, inventory, unlocked monsters, timestamps
- Version field for future save file migrations

## Phase 3: State Management (Zustand)
### 3.1 Game Store (src/store/gameStore.ts)
Single Zustand store with persist middleware pointing to IndexedDB:
- characterState
- equipmentState
- combatState
- prayerState
- miningState
- unlockedContent (monsters, areas)
- Actions: all game mutations (levelUp, equipItem, sellItem, startPrayer, startMining, startCombat)

### 3.2 Tick System
- Custom hook useGameTick() that runs on setInterval
- Handles prayer timers, mining timers, combat actions
- Pauses when user is not on the relevant screen (optional optimization)
- Persists timer state so progress continues when user navigates away

## Phase 4: Landing Page and Save System
### 4.1 Save File Selection (app/page.tsx)
- Display list of existing save files from IndexedDB
- Options: Continue, New Game, Delete Save
- Each save shows: character name, level, last played timestamp

### 4.2 Save/Load Logic (src/db/)
- Auto-save every 30 seconds
- Manual save button in header
- Load on app initialization
- Anti-cheat measures:
  - Hash critical save data and store checksum
  - Validate timestamps (detect impossible progression)
  - Server-side validation (future phase)

## Phase 5: UI Shell and Layout
### 5.1 Game Layout Component (src/components/GameLayout.tsx)
- Header banner with game title, character level, gold display
- Left navigation pane (collapsible on mobile):
  - Home, Armory, Temple, Training Grounds, Tepke Mines
  - Locked items shown as disabled with lock icon
- Right main content area for page-specific content
- Dark theme: dark grey backgrounds (#1a1a2e, #16213e), teal accents (#00d2ff), white/light grey text
- Responsive: mobile hamburger menu, desktop sidebar

### 5.2 Routing Setup
- Next.js App Router with (game) route group
- Middleware to redirect to landing page if no save is loaded

## Phase 6: Feature Implementation (in order)
### 6.1 Home Page (app/(game)/home/page.tsx)
- Character stats display panel
- Progress bar for experience
- Resources panel (gold, forging materials)
- Calculated stats summary

### 6.2 Temple (app/(game)/temple/page.tsx)
- Prayer selection UI (strength, speed, vitality, endurance)
- Progress bar showing prayer completion
- Timer display (MM:SS remaining)
- Scaling formula: baseTime = 60s * (1 + statPoints * 0.1) / (1 + piety * 0.05)
- Divinity increases with each prayer, slightly slowing future prayers

### 6.3 Tepke Mines (app/(game)/tepke-mines/page.tsx)
- Mining action button with progress bar
- Rewards: gold (scales with mine count), random forging materials
- Scaling: goldReward = baseGold * (1 + totalMines * 0.02)

### 6.4 Training Grounds (app/(game)/training-grounds/page.tsx)
- Monster selection list (progressive unlock)
- Real-time combat display:
  - Player and monster health bars
  - Combat log showing actions
  - Speed determines action frequency
  - Damage calculated from stats + equipment
- Post-battle: experience award, level-up check, 10s cooldown timer
- Model animation integration (future: map animation states to combat events)

### 6.5 Armory (app/(game)/armory/page.tsx)
- Equipment slots display (weapon, body armor, 2 rings, amulet)
- Inventory grid for unequipped items
- Click to equip/swap logic
- Sell button with confirmation modal (50% gold refund)
- Equipped item stats summary

## Phase 7: Game Balance and Formulas
### 7.1 Core Formulas Document (src/lib/formulas.ts)
- Damage calculation: baseDamage * strengthMultiplier * equipmentBonus
- Health calculation: baseHealth * vitalityMultiplier * equipmentBonus
- Protection calculation: baseProtection * enduranceMultiplier * equipmentBonus
- Prayer time scaling
- Mining reward scaling
- Combat cooldown scaling
- Level-up experience curve (exponential: expNeeded = base * level^1.5)

### 7.2 Large Number Handling
- Use decimal.js for any values that may exceed Number.MAX_SAFE_INTEGER
- Display formatting: K/M/B/T notation for large numbers

## Phase 8: Polish and Optimization
### 8.1 Performance
- Memoize expensive calculations with useMemo
- Virtualize long lists (inventory, monster list)
- Debounce auto-save

### 8.2 Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support
- Color contrast compliance

### 8.3 Mobile Responsiveness
- Touch-friendly button sizes (min 44x44px)
- Swipe gestures for navigation
- Portrait/landscape handling

## Phase 9: Future Considerations
- Online MongoDB sync for cloud saves
- Skill tree system (mentioned in Home stats)
- Equipment crafting/forging system
- Achievement system
- Daily rewards / login bonuses
- Anti-cheat server validation

## Implementation Checklist for Next LLM
- [ ] Phase 1: Initialize project and install dependencies
- [ ] Phase 2: Define all TypeScript types
- [ ] Phase 3: Set up Zustand store with persistence
- [ ] Phase 4: Build landing page and save system
- [ ] Phase 5: Create game layout shell
- [ ] Phase 6.1: Implement Home page
- [ ] Phase 6.2: Implement Temple (prayer system)
- [ ] Phase 6.3: Implement Tepke Mines (mining system)
- [ ] Phase 6.4: Implement Training Grounds (combat system)
- [ ] Phase 6.5: Implement Armory (equipment system)
- [ ] Phase 7: Implement all game formulas
- [ ] Phase 8: Polish and optimize
- [ ] Phase 9: Plan future features

## Notes for Implementation
- Always use TypeScript strict mode
- Follow Next.js App Router conventions
- Keep game logic separate from UI components
- Use custom hooks for game mechanics
- Comment all formula calculations for transparency
- Test edge cases (zero values, overflow, rapid clicks)
