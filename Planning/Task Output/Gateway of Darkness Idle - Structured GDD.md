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
- Player attack animation and damage application occur every `AttackSpeedBase` seconds.
- Stage navigation supports advancing and backtracking via arrows.
- Advancing is locked until the stage-clear requirement is met.
- Optional auto-advance can move the player to the next stage after clearing the current one.

## Resources & Currencies
### Character Stats / Progress Values
- `Level` (default: 1)
  - Increases when `Experience >= ExperienceToLevel`.
  - On level-up: increments `Strength` and `Endurance` (as written in source).
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
- `DamageDealt = FLOOR((BaseDamage * DamageMultiplier) / MonsterDifficultyModifier)`
- `MonsterHitPoints = FLOOR(MonsterBaseHitPoints * (MonsterLevel * MonsterCoefficient + MonsterGrowthRate^MonsterLevel))`
- `MonsterBaseHitPoints = 10`
- `MonsterCoefficient = 2`
- `MonsterGrowthRate = 1.08`
- `ExperienceGain = FLOOR(10 * MonsterLevel * ExperienceModifier)`
- `MonsterSoulGain = FLOOR(10 * MonsterLevel * MonsterSoulModifier)`
- `AttackSpeedBase = 0.8`
- `DPSvalue = FLOOR(DamageDealt * AttackSpeedBase)`

### Stage Progression and Boss Gates
- Must defeat 10 monsters at stage level `x` to unlock stage `x+1`.
- Boss stages at levels 10, 100, and 1000 unlock prestige tiers.
- Boss stage rules:
  - Single-monster mandatory fights.
  - Cannot skip, reduce, or increase boss stage difficulty.
  - Boss stats are double the previous level's stats (example given: level 10 boss = 2x level 9).
- After each boss stage, normal monster scaling continues from the boss-adjusted stat level, preserving a step-up in difficulty.

### Prestige System
#### Unlock Levels
- Training unlock level listed as **11** in prestige section.
- Rebirth unlock level: 101.
- Gateway unlock level: 1001.
- Rebirth and Gateway systems are intentionally deferred for later definition.

#### Prestige Reset Rule (General)
- Using a prestige tier resets all lower-tier prestige stats to defaults, except stats explicitly marked as non-resetting.

#### Training Screen and Training Reset
- Training screen includes a warning that training resets battle progress and returns player to base stats.
- On Training reset click:
  - Reset character to Level 1, Strength 1, Experience 0.
  - Reset weapon upgrade level as specified in source (see contradiction note below).
  - Award `TrainingPoint` based on highest level reached and milestone reward formula.
- Persisted tracking:
  - Number of Training resets.
  - Total Training Points earned.
- Visibility behavior:
  - Training link appears after level threshold is reached.
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

## Idle/Offline Mechanics
- Autosave should occur locally every 5 minutes.
- No explicit offline progression/earnings formula, cap, or simulation method is defined in the source.

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
- Initially visible links include Armory and Options.
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

## Out of Scope / Rejected Ideas
- Rebirth and Gateway prestige attributes/effects are intentionally not yet defined and are deferred to a future design pass.

## Contradictions & Ambiguities Detected
- Training unlock threshold appears in two places with different values:
  - Navigation note: Training link appears after player reaches level 10.
  - Prestige unlock list: Training unlocks at level 11.
- `WeaponUpgradeLevel` default is 0, but Training reset instruction says reset to `WeaponUpgradeLevel = 1`.
- `TrainingPoint` spend list includes `EnduranceGrowth`, but this attribute is not defined in the prestige-upgradable-attributes section.
- `Endurance` is referenced as a level-up gain stat, but its default value and gameplay effect are not defined.
- `DamageDealt` formula uses `MonsterDifficultyModifier`, but this variable has no definition/formula.
- DPS formula uses `DamageDealt * AttackSpeedBase`; if `AttackSpeedBase` is in seconds per attack, this may conflict with conventional DPS interpretation.

## Open Questions
1. Should Training unlock at level 10 or level 11?
2. On Training reset, should `WeaponUpgradeLevel` reset to 0 (its default) or to 1 as currently written?
3. What is the exact definition of `BaseDamage`? Is it always equal to `Strength`, or are additional terms intended?
4. What is `MonsterDifficultyModifier`, and how is it calculated per stage/monster?
5. Is the DPS formula intentionally `FLOOR(DamageDealt * AttackSpeedBase)`, or should it use attacks-per-second (`DamageDealt / AttackSpeedBase`)?
6. What are `Endurance` and `EnduranceGrowth` used for (default values, growth, and gameplay effects)?
7. Are all prestige upgrades priced at exactly 1 `TrainingPoint` per purchase, or does each have its own scaling cost formula?
8. How exactly are TrainingPoint rewards computed from milestones when a reset occurs:
   - Sum rewards for all milestones reached?
   - Reward only the highest milestone reached?
   - Reward only newly crossed milestones since last Training?
9. Should stage progress (10-kill completion counts) persist through normal play session changes and app reloads, and how is it reset by each prestige tier?
10. When the player manually changes stage during/after combat, what happens to in-progress combat state and cooldown timer?
11. For boss stages (10/100/1000), do they still require 10 kills to advance, or does a single mandatory boss clear replace the normal 10-kill gate?
12. How should save-data tamper resistance work for base64 saves: checksum, signature/HMAC, obfuscation, or another approach?
13. What is the exact data schema for tracked timers (real-time vs active-time, pause/background handling)?
14. Is offline progress intended at all? If yes, what systems should simulate offline and what cap limits should apply?
15. Are there any win-state/end-state conditions, or is progression intentionally endless?
