# Gateway of Darkness Idle - Alignment Milestones (TASKS.2)

Last generated: 2026-08-05

## Purpose

This plan defines the next milestones needed to align the current implementation more closely with:

- Gateway of Darkness Idle - Structured GDD
- Gateway of Darkness Idle - UI UX Implementation Outline

Use this file as a follow-on plan after the completed items in TASKS.md.

## Scope of known alignment gaps

- App shell and panel routing architecture need stricter parity with the documented three-row shell and dedicated UI state boundaries.
- Combat/state transitions need stricter finite-state guard behavior and explicit boss/gate substate UX.
- Save safety UX needs full corruption-recovery polish and explicit autosave cadence visibility.
- Training reset semantics and milestone reward rules need strict conformance checks against the reset matrix and stage-based reward entitlement.
- Accessibility, keyboard flow, and responsive behavior need final parity checks against the outline requirements.
- Test coverage should be expanded to prove formula, reset, and corruption edge cases from the GDD.

## Milestone 7: Architecture and shell parity

Owner: ui-builder
Supporting agents: qa-tester

- [x] Enforce one production app entry path and remove or quarantine scaffold/duplicate app flows from runtime composition.
- [x] Ensure the UI layout is a strict three-row shell with always-mounted middle battle row and routed bottom panel host.
- [x] Separate persistent game state from transient UI state (active panel, modal state, toasts, draft import text, focus return target).
- [x] Add/confirm selector-based read models for affordability, stage lock state, milestone summaries, and rate displays.
- [x] Confirm training navigation visibility rules match unlock and ever-reset behavior.

## Milestone 8: Combat and progression state-machine hardening

Owner: economy-designer
Supporting agents: ui-builder, idle-loop-performance, qa-tester

- [ ] Validate and enforce combat phase transitions: battling, post-battle cooldown, immediate restart on manual stage change.
- [ ] Implement or harden boss encounter substate UX for stages 10, 100, and 1000 (banner, gate state messaging, boss-clear transitions).
- [ ] Enforce stage unlock rules using current-cycle max unlocked stage plus active-stage kill tracking only.
- [ ] Confirm kill counter reset behavior when leaving a stage and 0-based restart when returning.
- [ ] Validate 60-bucket rolling window calculations for estimated Exp per second and Monster Souls per second.

## Milestone 9: Save integrity and recovery UX completion

Owner: save-system-engineer
Supporting agents: ui-builder, qa-tester

- [ ] Confirm autosave cadence at 5-minute intervals and expose last autosave metadata in Options UX.
- [ ] Verify canonical export/import bundle fields: version, schema, issuedAt, salt, payload, checksum.
- [ ] Harden checksum-failure handling so invalid bundles are never silently accepted.
- [ ] Ensure rolling backups are maintained and surfaced in corruption recovery flows.
- [ ] Validate write-then-swap save strategy and corruption fallback behavior in browser crash/interruption scenarios.

## Milestone 10: Training reset conformance and prestige telemetry

Owner: economy-designer
Supporting agents: save-system-engineer, ui-builder, qa-tester

- [ ] Verify exact reset field list for Training reset and enforce default-then-recompute ordering.
- [ ] Confirm persisted lifetime counters survive Training, Rebirth, and Gateway resets where specified.
- [ ] Validate milestone reward entitlement uses highest stage reached in current cycle.
- [ ] Confirm milestone rewards are re-earned every Training cycle.
- [ ] Ensure Training panel explains lost versus retained state before confirmation.

## Milestone 11: Accessibility, input, and responsive parity

Owner: ui-builder
Supporting agents: qa-tester

- [ ] Verify keyboard mappings: left/right stage navigation, panel hotkeys 1-4, Enter confirm, Escape cancel.
- [ ] Enforce modal focus trap and focus return to trigger element.
- [ ] Add or validate polite live-region updates for HP, stage clear, and affordability warnings.
- [ ] Verify reduced-motion mode disables nonessential combat and number animations.
- [ ] Validate responsive breakpoints and minimum 44px touch targets with no layout jump from rapidly changing values.

## Milestone 12: Visual direction and content fidelity pass

Owner: ui-builder
Supporting agents: qa-tester

- [ ] Align visuals to documented dark-fantasy dashboard direction using intentional tokens, typography pairing, and layered backgrounds.
- [ ] Ensure achievement presentation parity: five-column desktop grid intent, locked greyscale versus unlocked color state, reward typing display.
- [ ] Verify boss, player, and monster placeholder asset routing is data-driven.
- [ ] Ensure player-facing terminology is consistently spaced and pluralized (Monster Souls, Training Points).

## Milestone 13: Verification matrix and release gate

Owner: qa-tester
Supporting agents: economy-designer, save-system-engineer, ui-builder, idle-loop-performance

- [ ] Add scenario tests for level overflow, cost scaling, boss-tier HP multipliers, and stage-gate logic.
- [ ] Add save corruption and invalid import test cases covering checksum mismatch and backup recovery selection.
- [ ] Add Training reset tests for reset field correctness, recomputation ordering, and reward totals by highest stage.
- [ ] Add accessibility regression checks for keyboard-only completion of save/load/reset and modal actions.
- [ ] Run performance checks to confirm high-frequency battle updates do not trigger broad panel rerenders.

## Multi-agent orchestration guide

Use this coordination pattern when a milestone has multiple agents:

1. Contract first

- Lead owner writes a short implementation contract before coding starts.
- Contract includes state fields touched, selector outputs, UI events, and acceptance checks.

2. Parallel lane split

- economy-designer lane: formulas, progression rules, reset semantics, simulation invariants.
- save-system-engineer lane: schema updates, migration logic, checksum, backup/recovery behavior.
- ui-builder lane: rendering, interaction wiring, modal flows, responsive/accessibility behavior.
- qa-tester lane: test plan and failing tests prepared early from contract acceptance criteria.

3. Merge order

- Merge domain logic first (economy or save), then UI wiring, then QA validation pass.
- If logic and UI must land together, gate behind feature flags until both lanes are ready.

4. Handshake checkpoints

- Checkpoint A: shared type/state contract approved.
- Checkpoint B: lane PRs ready and rebased on latest contract.
- Checkpoint C: integrated branch passes tests and manual acceptance checklist.

## Agent assignment summary

- Milestone 7: ui-builder lead, qa-tester validating.
- Milestone 8: economy-designer lead with ui-builder plus idle-loop-performance plus qa-tester.
- Milestone 9: save-system-engineer lead with ui-builder plus qa-tester.
- Milestone 10: economy-designer lead with save-system-engineer plus ui-builder plus qa-tester.
- Milestone 11: ui-builder lead with qa-tester.
- Milestone 12: ui-builder lead with qa-tester.
- Milestone 13: qa-tester lead with all implementation agents supporting.

## Progress tracking convention

- Keep all checklist items unchecked until verified complete.
- The lead owner for each milestone is responsible for checking boxes as acceptance criteria are met.
- If multiple agents complete one item together, the milestone lead checks it off after QA confirmation.
