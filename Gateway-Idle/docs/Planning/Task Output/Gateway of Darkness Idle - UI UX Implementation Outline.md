# Game Summary (5-10 sentences)

Gateway of Darkness Idle is a browser-based incremental RPG with an always-running combat loop and long-horizon prestige progression. The player repeatedly fights stage-based monsters, gains Experience and Monster Souls, levels up to increase Strength, and upgrades weapons in the Armory to raise damage output. Combat resolves automatically on a timer, with the player primarily making strategic UI decisions: selecting stages, spending resources, and triggering prestige resets. Stage progression follows a kill-gate structure with special boss gates at stage 10, 100, and 1000 that unlock deeper prestige layers. The first implemented prestige layer, Training, resets core run progress but grants Training Points that permanently improve growth and economy modifiers. The game is intentionally endless, with no final victory screen; progression speed and milestone timing are the core satisfaction loop. The UI must continuously present combat clarity (damage, DPS, health, stage state), economy feedback (costs, affordability, rewards), and reset consequences (what is lost vs retained). The experience should feel calm but compelling: low click intensity, high readability, and clear momentum from each optimization decision.

# Tech Stack & Architecture

Framework recommendation: React + TypeScript.
Justification: The game has medium UI complexity, many reactive stats, and several navigation panels; React with TypeScript provides predictable component composition and safe state contracts for a long-lived incremental project.

Rendering approach: DOM-first UI (no dedicated gameplay canvas).
Justification: Combat is stat/timer driven, not physics-heavy. Health bars, cooldown indicators, and character/monster visuals can be done with regular DOM, SVG, and CSS animation while keeping accessibility and debugging straightforward.

State management pattern: Zustand for global game/UI state + explicit finite-state submachines for combat and stage progression.
Justification: Zustand keeps boilerplate low and performant with selector-based subscriptions, while finite-state modeling prevents invalid transitions (for example, battling -> cooldown -> ready -> battling).

Styling approach: CSS Modules + design tokens via CSS custom properties.
Justification: Scoped styles reduce regression risk across screens, and tokenized colors/spacing/typography make balancing dark-fantasy theming and accessibility easier.

Build tooling and package manager: Vite + pnpm.
Justification: Fast iterative builds, simple TypeScript setup, and efficient dependency management for a UI-heavy project.

Suggested folder/module structure:

- src/
  - app/ - App bootstrap, providers, top-level layout shell, route-free screen composition
  - engine/ - Time loop orchestration, combat tick scheduling, progression calculators, deterministic update pipeline
  - state/
    - gameStore/ - Persistent progression state slices and actions
    - uiStore/ - Ephemeral UI state (modals, toasts, panel visibility, focus intent)
    - selectors/ - Memoized read models for screen components
  - features/
    - battle/ - Battle panel, stage controls, health bar, DPS display, combat feedback
    - armory/ - Weapon upgrade table, cost/affordability logic, warning messaging
    - achievements/ - Achievement grid, lock/unlock visuals, optional reward copy
    - training/ - Training reset panel, milestone preview, prestige upgrade table
    - options/ - Save/load/reset flows, confirmations, import/export handling
    - navigation/ - Top nav links and unlock visibility rules
  - components/
    - primitives/ - Buttons, bars, cards, typographic components, icon wrappers
    - feedback/ - Toasts, banners, inline status, loading/error shells
    - modals/ - Confirmation and danger dialog components
  - services/
    - save/ - Autosave, salted Base64 export/import encoding, checksum verification, rolling backups
    - crypto/ - Web Crypto wrappers for salt generation and checksum utilities
    - time/ - Session/run timer tracking and formatting
  - assets/ - Images, sprite sheets, fonts, UI textures
  - styles/ - Global tokens, resets, motion settings, layout utilities
  - types/ - Shared domain and UI type definitions

Design pattern recommendations:

- Finite state machines for combat lifecycle and stage unlock flow.
- Observer/event stream pattern between engine ticks and UI selectors.
- Command-style action creators for user intents (upgrade weapon, switch stage, training reset, save/load).
- Read-model selectors that transform raw game state into UI-ready view data (for example affordability and milestone summaries).

# Screen/Component Inventory

| Screen or State                  | Purpose                                        | Key Components                                                                                                                                               | Reads From State                                                                                                                       | Dispatches Actions/Events                                                   | Entry Trigger                                                     | Exit Trigger                                          |
| -------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------- |
| App Shell                        | Three-row game frame and persistent navigation | TopNav, MiddleBattleContainer, BottomPanelHost, GlobalToastRegion, ModalHost                                                                                 | Screen selection, unlock flags, global alerts                                                                                          | Change active panel, open/close modal                                       | App boot complete                                                 | Never fully exits during runtime                      |
| Battle Screen (middle row)       | Real-time combat visibility and stage control  | StageStepper, AutoAdvanceToggle, PlayerDisplay, MonsterDisplay, MonsterHealthBar, DPSReadout, ExpPerSecondReadout, MonsterSoulPerSecondReadout, BattleStatus | Current stage, unlock status, monster HP/max HP, attack timer, damage, cooldown, kills toward stage gate, recent kill telemetry window | Start battle, change stage, toggle auto-advance                             | Default on startup and persistent in middle row                   | Only combat substate changes (screen remains mounted) |
| Armory Panel                     | Spend MonsterSoul on weapon progression        | WeaponCard, DamageMultiplierStat, WeaponLevelStat, UpgradeButton, CostLabel, WarningMessage                                                                  | MonsterSoul, WeaponUpgradeLevel, DamageMultiplier, WeaponUpgradeCost                                                                   | Attempt weapon upgrade                                                      | Nav selection Armory (default bottom panel)                       | Nav change                                            |
| Achievements Panel               | Track unlockable goals in a visual grid        | AchievementGrid, AchievementTile, UnlockBadge, RewardText                                                                                                    | Achievement list, unlocked flags, optional reward metadata                                                                             | Optional: claim reward if designed later                                    | Nav selection Achievements                                        | Nav change                                            |
| Options Panel                    | Save/load/reset and data safety controls       | SaveButton, LoadSection, ExportStringField, ImportField, ConfirmDialogs, ResetDangerZone, BackupStatus                                                       | Save metadata, corruption state, backup history, import text validity                                                                  | Manual save, manual load, import bundle, full reset, confirm/cancel dialogs | Nav selection Options                                             | Nav change                                            |
| Training Panel (locked/unlocked) | Prestige reset and TrainingPoint investment    | TrainingWarning, ResetButton, MilestoneSummary, UpgradeTable, UpgradeRow                                                                                     | Training unlock status, TrainingPoint, milestone rewards reached, training upgrade levels, projected costs                             | Trigger training reset, spend TrainingPoint on attribute                    | Nav selection after unlock; permanently visible after first reset | Nav change                                            |
| Boss Encounter Substate          | Special gate behavior at stages 10/100/1000    | BossBanner, BossHPBarVariant, GateInfoPanel                                                                                                                  | Current stage, boss flag, boss-clear status                                                                                            | Start boss fight, resolve boss clear                                        | Entering boss stage with unlock pending                           | Boss defeated or player changes stage                 |
| Confirm Modal State              | Prevent destructive mistakes                   | ConfirmModal, DangerCopy, Primary/Secondary actions                                                                                                          | Active modal type and payload                                                                                                          | Confirm action, cancel action                                               | Any action requiring confirmation                                 | Confirm or cancel                                     |
| Corrupted Save Recovery State    | Handle checksum failure safely                 | CorruptionAlert, BackupSelectionDialog, RecoveryActionButtons                                                                                                | Save integrity flag, backup snapshots                                                                                                  | Recover latest valid backup, dismiss alert                                  | Load process detects invalid bundle                               | Recovery complete or user cancel                      |

# Component Hierarchy

- AppRoot
  - GameProviders (shared)
    - ErrorBoundary (shared)
    - AppShell
      - TopRow
        - TopNav (shared)
          - NavLinkArmory
          - NavLinkAchievements
          - NavLinkOptions
          - NavLinkTraining (conditional)
      - MiddleRow
        - BattleScreen (screen-specific)
          - StageHeader
            - BackStageButton
            - StageIndexDisplay
            - ForwardStageButton (conditional visibility)
            - AutoAdvanceCheckbox
          - CombatViewport
            - PlayerPane
              - PlayerSprite
              - DPSBadge
            - MonsterPane
              - MonsterSprite
              - MonsterHealthBar
              - MonsterHPLabel
          - CombatStateFooter
            - CooldownTimer
            - BattleStatusText
      - BottomRow
        - PanelRouter
          - ArmoryPanel (screen-specific)
          - AchievementsPanel (screen-specific)
          - OptionsPanel (screen-specific)
          - TrainingPanel (screen-specific, conditional unlock)
      - OverlayLayer (shared)
        - ModalHost
          - ConfirmModal
          - CorruptionRecoveryModal
        - ToastHost

# State Model

Core UI-relevant game state to read and mutate:

- Player progression: Level, Experience, ExperienceToLevel, Strength, StrengthGrowth.
- Combat readiness: AttackSpeedBase, DamageMultiplier, DamageDealt, DPS value, battle phase, cooldown remaining.
- Monster context: current stage level, monster HP/max HP, boss flag, kills this stage, kills required for unlock.
- Economy: MonsterSoul, WeaponUpgradeLevel, WeaponUpgradeCost.
- Prestige: Training unlock flags, TrainingPoint, training reset count, total TrainingPoints earned, per-attribute upgrade levels.
- Timers: total play time, current Training cycle time, current Rebirth cycle time, current Gateway cycle time, time-to-first milestones.
- Save system state: last autosave timestamp, backup snapshot metadata, checksum status, import validation state.
- Navigation and panels: active bottom panel, training link visibility conditions.
- Visual placeholders: player placeholder asset ID, shared monster placeholder asset ID, shared boss placeholder asset ID.

Primary state shape sketch (high-level):

- GameState
  - meta
    - version: string
    - schema: string
    - startedAt: number
  - player
    - level: number
    - strength: number
    - strengthGrowth: number
    - experience: number
    - levelingDifficulty: number
  - combat
    - phase: idle | battling | postBattleCooldown
    - currentStage: number
    - maxUnlockedStage: number
    - isBossStage: boolean
    - monsterHpCurrent: number
    - monsterHpMax: number
    - killsOnStage: number
    - killsRequiredOnStage: number
    - attackSpeedBase: number
    - damageMultiplier: number
    - autoAdvanceEnabled: boolean
    - killRateWindow: RollingKillWindow
  - economy
    - monsterSoul: number
    - weaponUpgradeLevel: number
  - prestige
    - trainingPoints: number
    - trainingResetCount: number
    - totalTrainingPointsEarned: number
    - trainingUnlocked: boolean
    - trainingEverReset: boolean
    - upgrades
      - strengthGrowthLevel: number
      - levelingDifficultyLevel: number
      - experienceModifierLevel: number
      - monsterSoulModifierLevel: number
  - achievements
    - items: Achievement[]
  - timers
    - playTimeMs: number
    - trainingCycleMs: number
    - rebirthCycleMs: number
    - gatewayCycleMs: number
    - firstTrainingMs: number | null
    - firstRebirthMs: number | null
    - firstGatewayMs: number | null
  - save
    - lastAutosaveAt: number | null
    - integrityStatus: valid | corrupted | unknown
    - backups: SaveBackupMeta[]

UI state separation:

- Keep UI-only concerns in a separate uiStore: activePanel, openModal, toastQueue, focusedElementId, importFieldDraft, and temporary form errors.
- Never persist transient UI flags in long-term save payloads.

Data flow direction:

1. Engine tick computes deterministic game updates (combat damage, cooldown expiry, reward grants, level-up checks).
2. Game store is updated through atomic actions.
3. Selector layer derives UI-ready values (DPS text, upgrade affordability, stage lock messaging).
   It also derives estimated Exp/s and Monster Soul/s from the recent kill window.
4. React components subscribe to narrow selectors and render.
5. User interactions dispatch intent actions back to store/engine (for example setStage, buyWeaponUpgrade, triggerTrainingReset).

# Real-Time & Performance Considerations

Update and tick targets:

- Core simulation tick: 5 to 10 updates per second is sufficient for numeric progression and timers.
- Visual interpolation layer: up to 60 FPS only for smooth HP bar transitions and lightweight sprite effects.

Frequent vs infrequent renders:

- Frequent: monster HP bar, cooldown timer, battle phase labels, DPS display.
- Frequent: estimated Exp/s and Monster Soul/s display.
- Medium: resources (Experience, MonsterSoul), stage kill counters.
- Infrequent: training tables, options forms, achievements grid unlock transitions.

Render optimization strategy:

- Use store selectors per widget to avoid broad re-renders.
- Keep heavy lists (achievements) memoized and keyed by unlock hash.
- Split middle-row combat display from bottom-panel navigation to prevent panel rerenders from affecting combat.
- Batch state updates inside each simulation tick.
- For estimated Exp/s and Monster Soul/s, prefer fixed-size rolling buckets (for example 60 one-second buckets) over storing raw kill history.

Animation recommendations:

- CSS transitions for bar fills and number pop effects.
- requestAnimationFrame only for optional smooth interpolation (not authoritative simulation).
- Respect reduced-motion setting and fall back to instant state updates.

# Input Handling

Input methods to support:

- Primary: mouse/trackpad (required).
- Secondary: keyboard navigation and shortcuts (recommended).
- Touch: basic support for buttons/toggles on smaller screens (recommended).
- Gamepad: not required for initial build.

Control scheme recommendation:

- Stage navigation: Left and Right arrow keys mirror stage buttons.
- Panel switching: number keys 1-4 map to Armory, Achievements, Options, Training (when unlocked).
- Confirm modal actions: Enter confirms primary action, Escape cancels.

Assumption: keyboard shortcuts are additive convenience and do not replace clickable controls.

Input gating by state:

- During confirmation modals, disable underlying panel inputs.
- During post-battle cooldown, allow manual stage switch (as specified) and bypass cooldown when switching.
- During locked Training state, hide or disable direct Training entry controls except unlock hint text.

# Responsive & Platform Behavior

Target platforms:

- Desktop-first web experience is the primary target.
- Responsive behavior should support tablets and mobile browsers for accessibility of management actions.

Assumption: full feature parity is maintained on mobile, but visual density is reduced.

Breakpoint plan:

- Large desktop: 1280px and above, full three-row layout with side-by-side battle actors.
- Small desktop/tablet: 768px to 1279px, compact spacing and reduced decorative elements.
- Mobile: below 768px, stacked middle-row internals, larger tap targets, collapsible secondary text.

Platform-specific adaptations:

- Touch-friendly minimum target size (44px).
- Sticky action bars for key controls (stage navigation and upgrade actions) on narrow screens.
- Prevent viewport jump on frequent number updates by reserving fixed-width numeric slots.

# Accessibility Notes

- Implement logical focus order across top navigation, battle controls, and active bottom panel.
- Move focus into modals on open and return focus to trigger element on close.
- Expose live combat updates with polite ARIA live regions (HP changes, stage clear, not enough souls warning).
- Use semantic button elements for all actionable controls; avoid div-based click targets.
- Ensure color contrast minimum 4.5:1 for text and 3:1 for large UI indicators.
- Do not rely on color alone for locked/unlocked or affordable/unaffordable states; add icons/text labels.
- Provide reduced-motion mode: disable nonessential sprite pulses, hit flashes, and animated counter rolls.
- Ensure keyboard-only completion of save/load/reset flows, including danger confirmation dialogs.

# Visual/Art Direction Summary

The game tone is dark fantasy with a ritual, ancient-gate atmosphere, but the interaction model should stay clean and data-legible like a strategy dashboard. Use a layered background treatment (subtle textures, soft radial lighting, and restrained particle accents) rather than a flat fill. Favor a high-contrast palette built from charcoal, desaturated stone, iron, ember-orange highlights, and muted toxic green for positive progression feedback. Typography should pair an expressive display face for headings (for example Cinzel or Marcellus) with a highly readable sans-serif for data and controls (for example IBM Plex Sans or Source Sans 3). Combat feedback should feel weighty but minimal: quick impact flashes, smooth HP drain, and deliberate stage transition cues. Achievements should visually shift from monochrome to rich color on unlock to reinforce progression. The overall style should avoid cartoon exaggeration and instead lean into measured, atmospheric seriousness.

Assumption: no official art bible or sprite pack exists yet, so this serves as a default visual direction for initial implementation.

# Open Questions & Assumptions Log

1. Decision: Remove passphrase-locked exports. Manual export/import uses salted Base64 payloads with checksum validation.
2. Decision: Use placeholder art in the first UI pass. Player has one placeholder, all regular monsters share one placeholder, and all bosses share one placeholder.
3. Decision: UI must support data-driven placeholders (including achievements and content lists not yet finalized).
4. Decision: Stage progression persists only as max unlocked stage within the current prestige cycle plus kill count on the currently active stage. Kill count resets when leaving a stage, and returning to that stage starts its kill count from 0. Once a stage gate is cleared (for example 10/10 at stage 8), that stage remains unlocked for this cycle and can be farmed without any further gate requirement. Any prestige reset (Training/Rebirth/Gateway) resets max unlocked stage to default.
5. Decision: DPS and HP presentation is sufficient; no combat log panel in initial scope.
6. Confirmed assumption: Single-player only; no multiplayer, social, or network latency UI is required.
7. Confirmed assumption: No pause system exists; simulation continues while app is open, including background tab behavior where browser timers permit.
8. Confirmed assumption: Rebirth and Gateway screens are not implemented in the first UI scope beyond timer placeholders and locked/unavailable indicators.
9. Confirmed assumption: Battle remains always visible in the middle row while bottom panel content changes via navigation.
10. Confirmed assumption: Desktop keyboard shortcuts are included as quality-of-life features.
11. Decision: Target time to first Training for a new player is about 20 minutes.
12. Decision: Target Training cycle pacing after first reset is about 10 minutes, then about 5 minutes, then about 3 minutes.
13. Decision: On Training reset, reset these fields to default: `level`, `strength`, `strengthGrowth`, `experience`, `currentStage`, `maxUnlockedStage`, `killsOnStage`, `damageMultiplier`, `killRateWindow`, `monsterSoul`, `weaponUpgradeLevel`, and `trainingCycleMs`.
14. Decision: Training milestone reward entitlement is based on highest stage reached in the current cycle.
15. Decision: Training milestone rewards are re-earned each cycle.
16. Decision: Monster HP model uses tier multipliers by boss thresholds:
    - `MonsterRawHP(level) = MonsterBaseHitPoints * (level * MonsterCoefficient + MonsterGrowthRate^level)`
    - `BossLevels = {10, 100, 1000}`
    - `TierMultiplier(level) = 2 ^ (count of BossLevels <= level)`
    - `MonsterHitPoints(level) = FLOOR(MonsterRawHP(level) * TierMultiplier(level))`
17. Decision: Player-facing text uses spaced labels (`Monster Souls`, `Training Points`), while internal state keys may remain compact.
18. Decision: `trainingResetCount` and `totalTrainingPointsEarned` persist across Training, Rebirth, and Gateway as lifetime counters (not currency/power).
19. Decision: On Training reset, default reset fields first, then recompute effective runtime values from persisted Training upgrade levels (including `strengthGrowth`).
20. Decision: Initial achievement catalog requires explicit `rewardType` for every achievement (`none` or concrete reward payload).
21. Decision: Enforce spaced player-facing terminology globally across UI strings.

# Suggested Build Order

Phase 1: Foundation and shell

- Set up Vite + React + TypeScript + pnpm project structure.
- Build app shell with three-row layout and top navigation.
- Establish game store, uiStore, and baseline selector architecture.

Phase 2: Core combat presentation

- Implement Battle screen components (stage controls, HP bar, DPS, cooldown state labels).
- Wire deterministic simulation tick and battle state machine transitions.
- Add auto-advance toggle behavior and stage unlock gating visuals.

Phase 3: Economy and progression panels

- Implement Armory panel with upgrade costs, affordability states, and warning messaging.
- Implement Training unlock logic, reset confirmation flow, and upgrade table.
- Add boss encounter banners and special gate messaging.

Phase 4: Persistence and safety UX

- Implement Options panel for save/load/export/import/reset.
- Integrate checksum verification, corruption handling UI, and rolling backup recovery flow.
- Add autosave cadence indicators and confirmation toasts.

Phase 5: Achievements and timing instrumentation

- Build achievements grid and locked/unlocked visual states.
- Integrate time-tracking displays for run and milestone times.
- Validate large-number display formatting for late-game readability.

Phase 6: Polish, responsiveness, and accessibility hardening

- Implement responsive breakpoints and touch target refinements.
- Add animation polish with reduced-motion fallback.
- Complete keyboard flow, ARIA live updates, focus management, and contrast verification.
- Run performance pass to ensure high-frequency combat updates do not rerender unrelated panels.
