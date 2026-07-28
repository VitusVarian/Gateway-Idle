# Gateway of Darkness Idle - Structured Game Design Document

## Core Concept & Theme
- **Premise:** A slow-paced, desktop web idle game with RPG progression.
- **Player fantasy:** Repeatedly fight monsters, grow stronger through levels and weapon upgrades, then reset progress through prestige systems to accelerate future runs.
- **Long-term hook:** Multiple prestige layers (Training first, Rebirth and Gateway later) with escalating milestones and boss gates.

## Core Loop
1. Fight monsters in the Battle screen.
2. Deal periodic attack damage based on player stats and weapon multiplier.
3. Defeat monsters to earn Experience and MonsterSoul.
4. Level up when Experience reaches threshold; carry excess Experience into subsequent level checks.
5. Spend MonsterSoul in Armory to increase weapon upgrade level and DamageMultiplier.
6. Progress to higher monster stages after clearing required kills.
7. Eventually perform Training reset to earn TrainingPoint and improve meta-progression stats.
8. Repeat the loop faster/stronger each cycle.

### Battle Flow
- Combat runs until the current monster reaches 0 HP or below, or until the player chooses a different monster/stage.
- After each monster battle, there is a 3-second cooldown before the next battle begins.
- Manual stage changes bypass post-battle cooldown and start the new stage immediately.
- Player attack animation and damage application occur every `AttackSpeedBase` seconds.
- Stage navigation supports advancing and backtracking via arrows.
- Advancing is locked until the stage-clear requirement is met.
- Optional auto-advance can move the player to the next stage after clearing the current one.

## Resources & Currencies
### Character Stats / Progress Values
- `Level` (default: 1)
  - Increases when `Experience >= ExperienceToLevel`.
  - On level-up: increments `Strength` (as written in source).
- `Strength` (default: 1)
  - Gains `StrengthGrowth` per level.
  - 1 Strength = +1 BaseDamage.
- `Experience` (default: 0)
  - Awarded via `ExperienceGain` on monster defeat.
  - Excess carries over through possible multi-level gains.

### Combat/Upgrade Resource
- `MonsterSoul` (default: 0)
  - Awarded via `MonsterSoulGain` on monster defeat.
  - Spent on weapon upgrades in Armory.

### Prestige Currency
- `TrainingPoint` (default: 0)
  - Earned from Training reset milestone reward logic.
  - Spent on prestige-upgradable attributes.

## Progression Systems
### Leveling
- `ExperienceToLevel = FLOOR(20 * Level^LevelingDifficulty)`
- If a single reward grants enough Experience for multiple levels, apply all levels sequentially and keep overflow.

### Weapon Progression (Armory)
- `WeaponUpgradeLevel` (default: 0)
- `DamageMultiplier` (default: 1.0)
  - Increases by +0.1 per weapon upgrade level.
- `WeaponUpgradeCost = FLOOR(WeaponBaseCost * WeaponCostGrowthRate^WeaponUpgradeLevel)`
- `WeaponBaseCost = 50`
- `WeaponCostGrowthRate = 1.1`
- Upgrade rule:
  - If `MonsterSoul >= WeaponUpgradeCost`, spend cost and increment `WeaponUpgradeLevel` by 1.
  - Otherwise show warning: "Not enough souls!"

### Combat / Reward Formulas
- `BaseDamage = Strength` (current implementation).
- Future intent: `BaseDamage` may later become a sum of Strength plus additional modifiers.
- `DamageDealt = FLOOR(BaseDamage * DamageMultiplier)`
- `MonsterHitPoints = FLOOR(MonsterBaseHitPoints * (MonsterLevel * MonsterCoefficient + MonsterGrowthRate^MonsterLevel))`
- `MonsterBaseHitPoints = 10`
- `MonsterCoefficient = 2`
- `MonsterGrowthRate = 1.08`
- `ExperienceGain = FLOOR(10 * MonsterLevel * ExperienceModifier)`
- `MonsterSoulGain = FLOOR(10 * MonsterLevel * MonsterSoulModifier)`
- `AttackSpeedBase = 0.8`
- `DPSvalue = FLOOR(DamageDealt / AttackSpeedBase)`

### Stage Progression and Boss Gates
- Standard stages require 10 monster defeats at stage level `x` to unlock stage `x+1`.
- Boss stages at levels 10, 100, and 1000 unlock prestige tiers.
- Boss stage rules:
  - Single-monster mandatory fights.
  - A boss clear replaces the standard 10-kill gate for that level.
  - Cannot skip, reduce, or increase boss stage difficulty.
  - Boss stats are double the previous level's stats (example given: level 10 boss = 2x level 9).
- After each boss stage, normal monster scaling continues from the boss-adjusted stat level, preserving a step-up in difficulty.
- Stage progression persistence:
  - Stage progression persists across normal play and reloads.
  - Stage progression resets to default when any prestige is used (Training, Rebirth, or Gateway).
- Manual stage change behavior:
  - Changing stage immediately resets in-progress combat state and targets the newly selected monster/stage.
  - Stage clear progress for the newly selected stage starts at 0 (no carry-over from another stage).

### Prestige System
#### Unlock Levels
- Training unlocks after beating the boss at level 10.
- Rebirth unlocks after beating the boss at level 100.
- Gateway unlocks after beating the boss at level 1000.
- Rebirth and Gateway systems are intentionally deferred for later definition.

#### Prestige Reset Rule (General)
- Using a prestige tier resets all lower-tier prestige stats to defaults, except stats explicitly marked as non-resetting.

#### Training Screen and Training Reset
- Training screen includes a warning that training resets battle progress and returns player to base stats.
- On Training reset click:
  - Reset character to Level 1, Strength 1, Experience 0.
  - Reset `WeaponUpgradeLevel` to 0.
  - Award `TrainingPoint` as the sum of milestone rewards for all milestones reached.
- Persisted tracking:
  - Number of Training resets.
  - Total Training Points earned.
- Visibility behavior:
  - Training link appears after the level 10 boss is defeated.
  - After first Training reset, Training link always remains visible.
  - After first Training reset, Training screen shows upgrade table:
    - Columns: Prestige Upgradable Attribute | Current Value | Upgrade Button with TrainingPoint cost.

#### Training Milestone Formulas
- `MilestoneLevel(n) = FLOOR(FirstMilestone * MilestoneSpacing^(n-1))`
- `FirstMilestone = 10`
- `MilestoneSpacing = 1.6` (source contains typo variant "MilestoneSpaceing")
- `MilestoneReward(n) = FLOOR(BaseReward + RewardCoeff * SQRT(n))`
- `BaseReward = 1`
- `RewardCoeff = 2`

#### Training Prestige-Upgradable Attributes
- `StrengthGrowth` (default: 1)
  - +1 per TrainingPoint investment.
- `LevelingDifficulty` (default: 2.0)
  - -0.1 per TrainingPoint investment.
  - Max 10 upgrades.
- `ExperienceModifier` (default: 1.0)
  - +0.01 per TrainingPoint investment.
- `MonsterSoulModifier` (default: 1.0)
  - +0.01 per TrainingPoint investment.
- Upgrade cost model (all Training prestige attributes):
  - `TrainingPrestigeBaseCost = 1`
  - `TrainingPrestigeCostGrowthRate = 1.1`
  - `TrainingPrestigeUpgradeCost(attribute) = FLOOR(TrainingPrestigeBaseCost * TrainingPrestigeCostGrowthRate^attributeUpgradeLevel)`
  - Each attribute tracks its own `attributeUpgradeLevel` (default: 0).

## Idle/Offline Mechanics
- Autosave should occur locally every 5 minutes.
- No offline progression is intended.
- Game simulation is real-time while the game is running, including when in background.

## Automation
- Auto-advance checkbox: when enabled, automatically move to next stage after current stage clear requirement is met.
- Combat itself appears time-based/automatic once battle is active (attacks occur every `AttackSpeedBase` seconds).

## Content & Milestones
### Screens / Areas
- Battle (middle row main area).
- Armory (navigation).
- Achievements (navigation).
- Options (navigation).
- Training (locked at start; unlock behavior defined above).

### Achievements
- Grid layout, 5 columns wide.
- Each achievement displays an image plus unlock-condition description.
- Optional reward line per achievement.
- Visual state:
  - Locked = greyed out.
  - Unlocked = colorful.

### Time Tracking Requirements
Track and display/store:
- Overall play time.
- Time in current Training cycle.
- Time in current Rebirth cycle.
- Time in current Gateway cycle.
- Time to first Training.
- Time to first Rebirth.
- Time to first Gateway.
- Time tracking mode: real-time (foreground and background while running).

### Large Number Handling
- Game is expected to reach very large values.
- Use a performant big-number library for calculations and display.

## UI/UX Notes
### Layout
- Three-row layout:
  - Top row: small navigation bar.
  - Middle row: Battle screen.
  - Bottom row: content panel for selected navigation section.

### Navigation Defaults
- Initially visible links include Armory, Achievements, and Options.
- Achievements appears to the left of Options.
- Training link appears later based on unlock rules.

### Battle UI Elements
- Stage counter centered at top.
- Back/advance arrows for stage navigation.
- Advance arrow hidden when stage-clear requirement not met.
- Player character animation on left, monster on right.
- DPS readout near player: `DPS: <value>`.
- Vertical monster health bar near monster, updates as damage is dealt.

### Armory UI Elements
- Weapon image on left.
- To the right: current DamageMultiplier and current WeaponUpgradeLevel.
- Upgrade button label format: `Upgrade: <WeaponUpgradeCost>`.
- On insufficient currency, show: "Not enough souls!"

### Options UI Elements
- Save button.
- Load button.
- Full Reset button with explicit danger confirmation.
- Save output format: base64-encoded game-state string shown in adjacent text field.
- Load input: pasted base64 string with confirmation step.

### Save Integrity / Anti-Tamper Direction
- Chosen approach: local-only tamper-evident saves with corruption detection, optional passphrase-locked exports, and rolling backups.
- Security reality (explicit): without a server-held secret, true anti-tamper is not achievable against a determined player in a client-only game.
- Primary goals:
  - Detect accidental corruption reliably.
  - Detect casual/manual edits to exported save strings.
  - Preserve recoverability with backups.
- Save bundle format (canonical):
  - `version`, `schema`, `issuedAt`, `nonce`, `payload`, `checksum`.
  - `payload` is canonical JSON (stable key order, normalized numeric/string formats).
  - `checksum = SHA-256(payload + metadata)` for integrity verification.
- Optional locked export mode (recommended):
  - Player enters export passphrase.
  - Derive key via `PBKDF2` (high iteration count, per-save random salt).
  - Encrypt canonical payload with `AES-GCM` using random IV.
  - Store/export `{kdfParams, iv, ciphertext, authTag}` as base64 bundle.
  - Import requires passphrase; decryption/authentication failure rejects load.
- Load policy:
  - Autosave/local load: verify checksum; on mismatch, mark save corrupted and offer latest valid backup.
  - Import string load: require checksum verification (and passphrase decryption when locked export is used).
  - Never silently accept invalid bundles.
- Reliability safeguards:
  - Maintain rolling backup slots (for example last 3 valid autosaves with timestamps).
  - Write-then-swap strategy to avoid partial-write corruption.
  - Include `schema`/`version` for future migrations.
- Platform notes:
  - Use Web Crypto API (`crypto.subtle`) for SHA-256, PBKDF2, and AES-GCM.
  - Web Crypto requires a secure context; if unavailable, disable locked export and keep checksum + backups only.

## Out of Scope / Rejected Ideas
- Rebirth and Gateway prestige attributes/effects are intentionally not yet defined and are deferred to a future design pass.
- Endurance and EnduranceGrowth are removed from the current design.
- MonsterDifficultyModifier is removed from the current design.
- Progression is intentionally endless (no final win-state).

## Contradictions & Ambiguities Detected
- No unresolved contradictions currently in the Training-layer design.

## Open Questions
1. Should locked export mode be optional (default off) or required for all manual save exports?
