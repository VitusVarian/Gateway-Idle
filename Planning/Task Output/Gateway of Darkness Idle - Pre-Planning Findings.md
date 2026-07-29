# Gateway of Darkness Idle - Pre-Planning Findings (Post-Answers)

## Summary
All previously blocking clarification items are now resolved. Planning can proceed.

## Confirmed Decisions

1. Rebirth/Gateway reset policy for Training lifetime counters
- `trainingResetCount` and `totalTrainingPointsEarned` persist across Training, Rebirth, and Gateway resets.
- Rationale: these are lifetime counters/analytics and are not spendable currency or direct power stats.

2. Achievement reward catalog completeness
- Confirmed. The initial achievement list must include explicit `rewardType` on every entry (`none` or a concrete reward payload).

3. Training reset recomputation rule acceptance
- Confirmed. On Training reset, fields are defaulted first, then effective runtime values are recomputed from persisted Training upgrade levels (including `strengthGrowth`).

4. Naming convention lock
- Confirmed. Player-facing spaced labels (for example, "Monster Souls" and "Training Points") are the global UI naming standard.

## Updated Source Documents
- Structured GDD updated with pacing targets, reset field list, milestone trigger/re-earn logic, revised monster HP formulas, naming convention, and draft forward-compatible reset matrix.
- UI/UX outline updated with matching decisions in the assumptions log and player-facing terminology.
