# Gateway of Darkness Idle - Ground-Up Build Plan

Last regenerated: 2026-08-05

## Foundational decisions

- Project mode: Ground-up implementation from planning documents.
- Framework and language: React + TypeScript.
- Build tooling: Vite + pnpm.
- Styling approach: Tailwind CSS.
- State management: Zustand.
- Numeric model: bignumber.js for economy and progression values.
- Persistence model: Plain JSON saves with schemaVersion + manual migrators.
- Local persistence utility: idb-keyval.
- Validation: Zod at load/import boundaries.
- Number display: Intl.NumberFormat + small custom notation layer.
- Routing: react-router-dom.
- Forms: react-hook-form.
- Dialogs: @radix-ui/react-dialog.
- Notifications: sonner.
- Icons: lucide-react.
- Utilities: clsx + class-variance-authority.
- Dependency posture: no offline/PWA package, no telemetry package, no logging package, no date package, no animation package, no clipboard package, no event-bus package, no FSM package, no selector memoization package, no immutable-update package, no crypto package.
- Crypto/checksum implementation: native Web Crypto API (crypto.subtle).
- Testing: Vitest (unit/integration) + Playwright (browser smoke/regression).
- Code quality: ESLint + Prettier.
- Baseline folder layout:
  - src/app
  - src/engine
  - src/state
  - src/features
  - src/services
  - src/components

## Save schema v1

Start versioned from day one.

```ts
type SaveSchemaV1 = {
  schemaVersion: 1;
  meta: {
    appVersion: string;
    createdAt: number;
    updatedAt: number;
    lastTickAt: number;
  };
  resources: {
    experience: string;
    monsterSoul: string;
    trainingPoints: string;
  };
  player: {
    level: string;
    strength: string;
    strengthGrowth: string;
  };
  progression: {
    currentStage: number;
    maxUnlockedStage: number;
    trainingUnlocked: boolean;
    rebirthUnlocked: boolean;
    gatewayUnlocked: boolean;
  };
  upgrades: {
    weaponLevel: number;
    training: Record<string, number>;
  };
  achievements: {
    unlockedIds: string[];
  };
  timers: {
    totalPlayMs: number;
    trainingCycleMs: number;
    rebirthCycleMs: number;
    gatewayCycleMs: number;
    firstTrainingMs: number | null;
    firstRebirthMs: number | null;
    firstGatewayMs: number | null;
  };
};
```

Serialization rules:

- Persist only serializable JSON values.
- Persist big-number values as canonical decimal strings.
- Keep transient UI state out of save payloads.
- Validate import payloads with Zod before hydration.
- Keep migration pipeline explicit (v1 -> v2 -> ...).

## Milestone sequence

## Milestone 0: Project scaffold and stack setup
- [x] Initialize Vite + React + TypeScript project with pnpm
- [x] Install finalized dependencies from the stack decisions log
- [x] Configure ESLint + Prettier, Vitest, and Playwright baseline scripts
- [x] Create baseline folder layout under src/
- [x] Confirm app boots and basic CI/local scripts run

## Milestone 1: Bare core loop
- [ ] Implement one resource and one generator loop in memory
- [ ] Add a manual increment action to verify state changes
- [ ] Render minimal UI to display changing values
- [ ] Keep milestone in-memory only (no persistence yet)

## Milestone 2: Tick loop and scaling
- [ ] Add deterministic tick/passive generation loop
- [ ] Add baseline cost scaling for upgrades/progression
- [ ] Wire stage progression basics and basic combat/state transitions
- [ ] Confirm deterministic behavior under repeated ticks

## Milestone 3: Save/load and offline-resume behavior
- [ ] Implement local save/load using SaveSchemaV1 and idb-keyval
- [ ] Add schema validation + migration entrypoint for save loading
- [ ] Implement export/import with checksum validation
- [ ] Implement resume behavior based on elapsed time policy (no offline simulation dependency)
- [ ] Add corruption handling and latest-valid fallback path

## Milestone 4: Full UI implementation
- [ ] Build three-row shell with always-visible battle area
- [ ] Implement Armory, Achievements, Options, and Training panels
- [ ] Integrate dialogs, toasts, icons, and keyboard shortcuts
- [ ] Apply responsive behavior for desktop and smaller layouts
- [ ] Enforce player-facing label conventions (Monster Souls, Training Points)

## Milestone 5: Secondary systems from GDD
- [ ] Implement Training reset system end-to-end
- [ ] Implement boss gates at stages 10, 100, and 1000
- [ ] Implement achievement catalog, unlock checks, and reward typing
- [ ] Keep Rebirth and Gateway as locked placeholders with correct state/timer scaffolding

## Milestone 6: Polish and hardening
- [ ] Finalize large-number formatting consistency and readability
- [ ] Run accessibility pass (focus, keyboard flow, ARIA feedback, contrast)
- [ ] Run performance pass for high-frequency updates and selector/render isolation
- [ ] Expand regression coverage in Vitest + Playwright
- [ ] Resolve edge cases for long-session stability and save safety

## Open decisions to flag

- No blocking stack decisions remain; core technical choices are finalized.
- Clarification to lock early: exact canonical decimal-string format for persisted bignumber.js values.
- Clarification to lock early: initial achievement ID catalog and reward payload schema details.

## Per-milestone handoff plan

- Milestone 0 owner: React UI Builder.
- Milestone 1 owner: React UI Builder.
- Milestone 2 owner: Economy Designer (handoff to React UI Builder for UI wiring).
- Milestone 3 owner: Save System Engineer.
- Milestone 4 owner: React UI Builder.
- Milestone 5 owner: Economy Designer for system math/logic + React UI Builder for presentation, one subsystem at a time.
- Milestone 6 owner: React UI Builder for UX polish + Idle-Loop Performance for efficiency sign-off.
- QA Tester: runs throughout all milestones, validating each milestone as it lands.

## Progress tracking convention

- Keep all milestone checklist items unchecked until implementation is complete.
- As implementation agents finish items, they should check off the corresponding boxes in this file.
- If work is done outside agent handoffs, manually check completed boxes here so TASKS.md remains the single source of truth.
