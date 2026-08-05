# Gateway of Darkness Idle - Ground-Up Build Plan

## Foundational decisions

- Project mode: Ground-up implementation from planning documents.
- Core stack (finalized): React + TypeScript, Vite + pnpm, DOM-first UI, Tailwind CSS.
- State management (finalized): Zustand for global state, split into persistent game state and ephemeral UI state.
- Numeric model (finalized): bignumber.js for progression/economy math; serialize all persisted big values as canonical decimal strings.
- Save strategy (finalized): Plain JSON with `schemaVersion` and manual migrators; local persistence via idb-keyval.
- Save safety (finalized): salted Base64 export/import bundle, checksum verification via Web Crypto API (`crypto.subtle`), rolling backups, and write-then-swap writes.
- Runtime validation (finalized): Zod at load/import boundaries.
- Number formatting (finalized): `Intl.NumberFormat` + custom notation layer for extreme values.
- Routing/forms/UI utilities (finalized): react-router-dom, react-hook-form, @radix-ui/react-dialog, sonner, lucide-react, react-hotkeys-hook, clsx, class-variance-authority.
- Additional dependency posture (finalized): no third-party telemetry, no logging dependency, no date library dependency, no animation dependency, no clipboard dependency, no event-bus dependency, no FSM dependency package, no selector memoization package, no immutable-update package, no offline/PWA dependency.
- Testing and quality (finalized): Vitest (unit/integration), Playwright (E2E smoke/regression), ESLint + Prettier.
- Baseline architecture:
  - `src/app`: app bootstrap and shell.
  - `src/engine`: deterministic tick/combat pipeline.
  - `src/state`: Zustand stores, actions, selectors.
  - `src/features`: battle, armory, achievements, options, training.
  - `src/services`: save, crypto, time, formatters.
  - `src/components`: primitives, dialogs, feedback.

## Save schema v1

Start with a versioned serializable shape on day one:

```ts
type SaveSchemaV1 = {
  schemaVersion: 1;
  meta: {
    appVersion: string;
    createdAt: number;
    updatedAt: number;
    lastTickAt: number;
  };

  player: {
    level: string;
    strength: string;
    strengthGrowth: string;
    experience: string;
    levelingDifficulty: string;
  };

  combat: {
    phase: "idle" | "battling" | "postBattleCooldown";
    currentStage: number;
    maxUnlockedStage: number;
    isBossStage: boolean;
    monsterHpCurrent: string;
    monsterHpMax: string;
    killsOnStage: number;
    killsRequiredOnStage: number;
    attackSpeedBase: string;
    damageMultiplier: string;
    autoAdvanceEnabled: boolean;
    killRateWindow: {
      bucketSizeMs: 1000;
      bucketCount: 60;
      buckets: Array<{
        ts: number;
        exp: string;
        souls: string;
      }>;
    };
  };

  economy: {
    monsterSoul: string;
    weaponUpgradeLevel: number;
  };

  prestige: {
    trainingUnlocked: boolean;
    trainingEverReset: boolean;
    trainingPoints: string;
    trainingResetCount: number;
    totalTrainingPointsEarned: string;
    upgrades: {
      strengthGrowthLevel: number;
      levelingDifficultyLevel: number;
      experienceModifierLevel: number;
      monsterSoulModifierLevel: number;
    };
  };

  achievements: {
    unlockedIds: string[];
  };

  timers: {
    playTimeMs: number;
    trainingCycleMs: number;
    rebirthCycleMs: number;
    gatewayCycleMs: number;
    firstTrainingMs: number | null;
    firstRebirthMs: number | null;
    firstGatewayMs: number | null;
  };

  unlocks: {
    rebirthUnlocked: boolean;
    gatewayUnlocked: boolean;
  };
};
```

Serialization constraints:

- Persist only primitives, arrays, and plain objects.
- Persist all BigNumber-compatible values as decimal strings.
- Exclude transient UI state from save payloads.
- Validate imported payloads with Zod before hydration.
- Keep migrator pipeline from the start (`v1 -> v2 -> ...`) even if only `v1` exists now.

## Milestone sequence

1. Bare core loop (smallest playable)
- Build minimal app shell and in-memory state.
- Implement one monster fight loop with manual trigger + visible resource gain.
- No persistence, no panel complexity, no polish.
- Demo gate: player can repeatedly gain resources in a deterministic loop.

2. Tick/passive generation + scaling
- Add deterministic simulation tick for attacks, HP depletion, rewards, cooldown.
- Implement level-up and weapon upgrade formulas with scaling costs.
- Add stage progression gate basics and simple auto-advance toggle behavior.
- Demo gate: passive progression is stable and formula outputs are credible.

3. Save/load + integrity + no-offline-progress policy
- Implement autosave/manual save/load using idb-keyval and Save schema v1.
- Add export/import pipeline with salted Base64 bundle + checksum verification.
- Add corruption handling and latest-valid-backup recovery UX.
- Implement elapsed-time resume behavior that restores state but grants no offline progress.
- Demo gate: reload/import reliably restores valid state and rejects invalid payloads.

4. Real UI implementation pass
- Build three-row layout with always-visible middle battle area.
- Implement Armory, Achievements, Options, and Training (locked/unlocked behavior).
- Integrate dialogs, toasts, iconography, hotkeys, and responsive breakpoints.
- Apply spaced player-facing labels globally (Monster Souls, Training Points).
- Demo gate: full main loop is operable through UI without debug controls.

5. Secondary systems from GDD (one by one)
- Implement Training reset flow, milestone reward math, and upgrade table.
- Add boss gate behavior at stages 10/100/1000 and unlock flags.
- Implement achievement catalog wiring with explicit rewardType per achievement.
- Keep Rebirth/Gateway as locked placeholders with correct timer/state placeholders.
- Demo gate: complete first prestige cycle end-to-end and begin accelerated second cycle.

6. Polish and hardening
- Finalize large-number display notation and consistency rules.
- Add accessibility pass: focus flow, modal trap/return, ARIA live updates, contrast checks, reduced motion.
- Add performance pass: selector granularity, render isolation, and high-frequency update checks.
- Expand test coverage: deterministic sim tests (Vitest) and save/reset smoke tests (Playwright).
- Demo gate: stable long-session behavior with acceptable performance and regression confidence.

## Open decisions to flag

- No open stack decisions remain; all dependency and architecture choices are finalized and incorporated.
- Non-blocking alignment note: older planning text references CSS Modules, but finalized stack selects Tailwind CSS. Tailwind is authoritative for implementation.
- Implementation clarifications to lock early (not stack reopeners):
  - Canonical decimal-string serialization rules (for example, fixed non-exponent save format).
  - Initial achievement ID catalog and reward payload schema details.

## Per-milestone handoff plan

1. Milestone 1 owner: Core Loop Implementer
- Scope: minimal in-memory gameplay loop.
- QA involvement: smoke validation on loop determinism and state sanity.

2. Milestone 2 owner: Economy Designer
- Scope: tick cadence, cost curves, scaling formulas, and stage gate baseline.
- QA involvement: deterministic formula and progression consistency tests.

3. Milestone 3 owner: Save System Engineer
- Scope: save schema v1, migration scaffold, import/export integrity, backup recovery.
- QA involvement: corruption, rollback, and resume-path validation.

4. Milestone 4 owner: UI Builder
- Scope: full shell/panels, responsive behavior, and interaction layer.
- QA involvement: keyboard/accessibility/navigation coverage.

5. Milestone 5 owner: Progression Systems Engineer
- Scope: Training system, boss-gate unlock flow, achievements wiring.
- QA involvement: reset semantics and reward entitlement verification.

6. Milestone 6 owner: QA Tester (primary)
- Scope: regression suite, performance checks, accessibility hardening, release readiness.
- Supporting roles: UI Builder, Save System Engineer, Economy Designer for targeted fixes.
