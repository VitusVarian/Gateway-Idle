# Gateway of Darkness Idle - Pre-Planning Findings (Post-Answers)

## Summary
Most previously blocking gaps are now resolved. Planning can begin once the remaining clarification items below are confirmed.

## Remaining Items Requiring Confirmation

1. Rebirth/Gateway reset policy for Training lifetime counters
- The current draft matrix marks `trainingResetCount` and `totalTrainingPointsEarned` as "reset policy TBD" under Rebirth/Gateway.
- Confirm whether these should reset strictly (per lower-tier reset rule) or persist as lifetime analytics.

2. Achievement reward catalog completeness
- Design now supports mixed achievements (some rewarding, some cosmetic-only).
- Confirm the initial achievement list includes explicit `rewardType` for each entry (`none` or concrete reward payload).

3. Training reset recomputation rule acceptance
- The GDD now states reset fields are defaulted first, then effective runtime values are recomputed from persisted Training upgrade levels.
- Confirm this is the intended implementation behavior, especially for `strengthGrowth`.

4. Naming convention lock
- Player-facing labels are now standardized as spaced terms (for example, "Monster Souls" and "Training Points").
- Confirm this convention should be enforced globally across all UI strings.

## Updated Source Documents
- Structured GDD updated with pacing targets, reset field list, milestone trigger/re-earn logic, revised monster HP formulas, naming convention, and draft forward-compatible reset matrix.
- UI/UX outline updated with matching decisions in the assumptions log and player-facing terminology.
