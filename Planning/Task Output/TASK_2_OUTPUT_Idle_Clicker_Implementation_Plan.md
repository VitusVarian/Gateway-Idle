# TASK 2 Output: Idle/Clicker Implementation Plan

## Section 1: Project summary (concise)
Build a web-based idle-RPG with active-play-first loops (combat, mining, blacksmith upgrades, skill tree growth), account-based persistence, deterministic offline catch-up (capped at 36 hours), and no pay-to-win monetization.

Target stack:
- Frontend: Next.js + TypeScript + Tailwind + shadcn/ui
- Backend: Next.js API routes/server actions (or route handlers) + MongoDB
- Data authority: Server-side source of truth, client-side optimistic display with reconciliation

Launch vertical slice goals:
- User can sign up/login via Google
- User can create a character (name + artwork choice)
- User can fight monsters, gain XP, level up, and earn skill points
- User can spend gold in blacksmith upgrades
- User can spend skill points in a navigable skill tree
- User can mine gold and buy mining tools
- User receives deterministic offline progress up to 36h

## Section 2: Assumptions and constraints
Assumptions (explicit)
- A1. Combat runs as timed rounds while user is on the fighting screen, with a default 10s delay between encounters.
- A2. "No automation" means no passive global loop outside selected activity, but activity loops can be timer-driven while screen is active.
- A3. Monetization is donation/subscription only and grants no gameplay power.
- A4. Weekly updates are desired, but launch scope is MVP systems listed in workbook.
- A5. Scientific notation is required for large-number formatting at all relevant HUD and panel surfaces.

Constraints (from source workbook)
- C1. Platform is web browser, mouse-first interactions.
- C2. Game theme/tone: serious dark fantasy RPG, light narrative.
- C3. Required stack: TypeScript, Next.js, MongoDB, Tailwind, shadcn/ui.
- C4. Save is account-based; MongoDB is source of truth.
- C5. Anti-cheat concerns include time spoofing, local variable tampering, and invalid client payloads.
- C6. Offline accumulation cap: 36 hours.
- C7. Must-have accessibility: scalable text, color-blind-safe palette options, reduced motion option.

Ambiguities to resolve later but not blocking implementation start
- B1. Exact combat formula for damage/mitigation is not fully specified.
- B2. Daily quest reward duration and stacking rules are not specified.
- B3. "As fast as possible" performance target needs measurable thresholds.
- B4. First 10 unlocks are not fully enumerated; current systems imply milestone-based unlock progression.

## Section 3: Architecture and technical approach
### 3.1 System architecture
- Client (Next.js app router): renders UI, sends intent-only actions, shows optimistic local state.
- Game service layer (server): validates intents, computes economy/combat outcomes deterministically, persists canonical snapshots.
- Database (MongoDB): stores player profile, progression state, inventory/tools, skill tree allocations, activity timestamps, and event logs.
- Analytics pipeline: event capture endpoint with queue/batch writing to analytics store.

### 3.2 Domain modules
- Auth module: Google OAuth, session handling, account linkage.
- Character module: creation, display identity, base stats.
- Combat module: encounter generation, fight resolution, XP award, level-up transitions.
- Economy module: gold generation/spending, tool effects, upgrade costs.
- Progression module: level requirements, skill points, skill tree traversal rules.
- Mining module: timed mining loop, tool purchase and multiplier application.
- Offline module: deterministic catch-up engine with cap and anti-spoof checks.
- Tutorial/help module: first-visit lore modal and replay help button.

### 3.3 Data model (MongoDB collections)
- users
  - _id, authProvider, createdAt, lastLoginAt
- characters
  - userId, name, avatarId, level, xp, xpToNext, skillPoints, createdAt
- resources
  - userId, gold, totalMined, updatedAt
- equipment
  - userId, weapon{minDamage,maxDamage,speed,critChance,critDamage}, armor{protection,life,blockChance,reduction,regen}
- mining
  - userId, ownedTools[], activeToolId, toolEffectMultiplier, lastMineAt, mineIntervalSec
- skillTree
  - userId, allocatedNodes[], derivedStatMultipliers
- combat
  - userId, selectedMonsterLevel, currentEncounterState, lastEncounterAt, encounterCooldownSec
- offlineClaims
  - userId, lastClaimAt, claimedSeconds, awardedGold, awardedXp, checksum
- dailyQuests
  - userId, questType, targetValue, progress, rewardType, rewardValue, expiresAt, claimedAt
- telemetryEvents
  - userId, eventType, eventPayload, occurredAt

### 3.4 Server-authoritative anti-cheat strategy
- Validate all client actions against server-stored state and timestamps.
- Recompute rewards server-side; client sends intents only (example: START_MINING, BUY_UPGRADE).
- Reject impossible transitions (negative cost, out-of-order timestamps, unowned upgrades).
- Maintain monotonic time references (server clock only) for offline rewards.
- Add event signature/checksum for sensitive economic actions.

### 3.5 Formula implementation notes
Use workbook formulas as launch baseline:
- Gold gain
  - goldGain = BaseGain * ToolEffect * (1 + 0.18 * sqrt(MiningAbility))
- XP gain
  - xpGain = (Base * monsterLevel^monsterXpModifier) * bonusExperience
- XP required to level
  - xpRequired(level) = floor(20 * levelingDifficulty^level)

Configuration-driven constants (DB or versioned JSON):
- BaseGain, BaseXp, monsterXpModifier, bonusExperience, levelingDifficulty, offlineCapHours, cooldownSeconds.

### 3.6 Deployment and ops baseline
- Environments: local, staging, production.
- Migrations: versioned data migration scripts for schema evolution.
- Observability: API latency metrics, economy error logs, failed validation counters.

## Section 4: Phased roadmap
### Phase 0 - Foundation and guardrails
Milestone M0: working skeleton with auth, data contracts, CI checks.
- Outcomes: project bootstrap, lint/test setup, env config, auth flow, base DB models.

### Phase 1 - Core gameplay vertical slice
Milestone M1: playable loop from login -> create character -> fight -> level up.
- Outcomes: combat loop, XP/level progression, HUD display, persistence.

### Phase 2 - Economy and progression expansion
Milestone M2: blacksmith + mining + skill tree integrated with persistence.
- Outcomes: gold sources/sinks active, skill spending, upgrade effects reflected in combat/mining.

### Phase 3 - Retention and live-readiness
Milestone M3: offline progress + daily quest + tutorials + analytics.
- Outcomes: re-engagement loops, anti-cheat validations, first-pass telemetry.

### Phase 4 - Quality hardening and release readiness
Milestone M4: accessibility pass, balancing simulation, performance tuning, release checklist.
- Outcomes: measurable quality gates met, launch candidate.

Parallelization guidance
- Safe parallel tracks after M0:
  - Track A (Frontend): screen implementation using stable API contracts.
  - Track B (Backend): domain services and persistence.
  - Track C (QA/Tools): simulation scripts, test harnesses, analytics validation.
- Merge gates:
  - API contract freeze before heavy UI integration.
  - Formula constants freeze before balancing simulation sign-off.

## Section 5: Deliverable backlog (smallest meaningful units)
Priority legend: P0 (critical path), P1 (high), P2 (medium)

| ID | Priority | Title | Description | Inputs/Dependencies | Implementation tasks | Test tasks | Acceptance criteria | Estimated complexity (S/M/L) | Parallelizable (Yes/No) | Suggested owner type |
|---|---|---|---|---|---|---|---|---|---|---|
| D01 | P0 | Project bootstrap and standards | Purpose: establish reliable dev baseline. Scope in: Next.js TS app, Tailwind, shadcn/ui, lint/test config, env handling. Scope out: feature gameplay logic. | Workbook stack constraints | Initialize app, configure Tailwind/shadcn, set eslint+prettier, add env schema validation, setup CI checks | Run lint/typecheck/unit smoke in CI | CI passes on clean repo; local run script works; env validation fails on missing vars | S | No | Full-stack |
| D02 | P0 | Google auth and session | Purpose: account-based save prerequisite. Scope in: login/logout/session guard. Scope out: guest mode. | D01 | Implement OAuth provider, session middleware, protected routes, user record upsert | Auth integration tests, unauthorized route tests | User can sign in/out; protected pages redirect correctly; user record created once | M | Yes | Full-stack |
| D03 | P0 | Character creation flow | Purpose: create playable identity. Scope in: name + avatar selection + persist. Scope out: deep appearance customization. | D02 | Build character creation screen, API endpoint, validation, default starter stats | Form validation tests, API schema tests | Character persisted with valid defaults; invalid names rejected; first login routes to creation | S | Yes | Full-stack |
| D04 | P0 | Global app shell and HUD | Purpose: consistent navigation and always-visible player state. Scope in: top HUD fields + nav. Scope out: advanced sorting/recommendations. | D03 | Implement layout shell, nav tabs (Fight/Blacksmith/Skill Tree/Mining), HUD values (name, level, XP bar, skill points, gold), scientific notation formatter | Component tests for HUD rendering and number formatting | HUD visible on all gameplay pages; values sync with server snapshot; notation applied above threshold | M | Yes | Frontend |
| D05 | P0 | Core formula engine module | Purpose: central deterministic game math. Scope in: workbook formulas for gold/XP/level requirement. Scope out: late-game softcaps/prestige. | D01 | Implement pure functions with typed inputs; load constants from config; add rounding rules | Unit tests for formula outputs with fixture values | Formula outputs match workbook examples and edge cases; no floating precision regressions beyond tolerance | S | Yes | Backend |
| D06 | P0 | Combat domain service and API | Purpose: server-authoritative fight loop. Scope in: encounter resolve, XP awards, level-up and skill-point grant. Scope out: advanced monster AI. | D03, D05 | Create monster table, resolve combat tick/round, enforce 10s post-fight delay, persist combat state transitions | API tests for valid/invalid transitions; level-up boundary tests | Player can run consecutive fights; XP and level progression persist; cooldown enforced server-side | L | No | Backend |
| D07 | P0 | Fight screen UI integration | Purpose: expose combat loop to player. Scope in: monster list by level, character/enemy art slots, animated health bars, fight status. Scope out: cinematic effects. | D04, D06 | Build fight page, bind to combat API, animate health bars, states for loading/defeat/victory | UI interaction tests; visual state tests for loading/error/success | User can select monster level and start fight; post-fight results render correctly; health bars animate and remain readable | M | Yes | Frontend |
| D08 | P0 | Progression write path hardening | Purpose: guarantee consistency of XP->level->skill points. Scope in: transactional updates and idempotency guards. Scope out: respec feature. | D06 | Add atomic update logic, optimistic concurrency/version checks, retry-safe idempotency keys | Concurrency tests with duplicate requests | No duplicate level grants under repeated calls; state remains consistent under race conditions | M | No | Backend |
| D09 | P1 | Skill tree data schema and rules | Purpose: define traversable Path-of-Exile-like node graph. Scope in: one start node, adjacency rules, travel nodes and themed wheels. Scope out: procedural tree generation. | D05, D08 | Create node schema, adjacency validation, cost=1 skill point, multiplier aggregation logic | Unit tests for valid path traversal and invalid jumps | User can allocate only connected nodes; multipliers recalc deterministically | M | Yes | Backend |
| D10 | P1 | Skill tree screen and interactions | Purpose: let players spend points in multi-direction tree. Scope in: node map render, selectable states, allocated path visuals. Scope out: zoom/pan minimap polish beyond MVP. | D04, D09 | Build skill tree canvas/SVG component, node tooltip, allocate action, disabled states when insufficient points | Component and interaction tests (click/keyboard focus) | Points spend correctly; allocated path visually persistent; locked nodes clearly indicated | L | Yes | Frontend |
| D11 | P1 | Blacksmith pricing and upgrade service | Purpose: implement gold sinks for weapon/armor growth. Scope in: allowed launch upgrades and locked future stats. Scope out: crafting materials. | D05, D08 | Model upgrade tiers/cost curves, enforce minDamage<=maxDamage, lock unavailable stats at launch | API tests for affordability and constraint validations | Buying valid upgrades deducts gold and updates stats; invalid upgrades rejected with clear errors | M | Yes | Backend |
| D12 | P1 | Blacksmith screen UI | Purpose: expose weapon/armor panels with upgrade controls. Scope in: two panels, locked stat badges, affordability visual states. Scope out: item rarity systems. | D04, D11 | Build weapon and armor cards, button states (disabled/affordable), hover not-allowed indicator with red slashed icon | UI state tests and snapshot tests | Unaffordable actions are greyed and unclickable; locked upgrades shown with reason tooltip | M | Yes | Frontend |
| D13 | P1 | Mining economy service and store API | Purpose: implement gold source and tool purchases. Scope in: mine action timing, tool multipliers, predefined launch tool list. Scope out: random mining events. | D05, D08 | Add mine tick endpoint, store purchase endpoint, ownership checks, tool effect recalculation | Unit/API tests for multipliers and ownership constraints | Mining grants gold per formula; tool purchases apply exact bonus values; unauthorized purchases blocked | M | Yes | Backend |
| D14 | P1 | Mining screen UI and store | Purpose: deliver mining gameplay and tool store interaction. Scope in: mine action, timer display, store items (iron/mythril/enchant). Scope out: store pagination. | D04, D13 | Implement mining panel with countdown, store catalog, buy actions, success/error feedback | UI tests for timer and buy flows | User can mine repeatedly and buy tools; UI reflects new multipliers and gold in near-real-time | M | Yes | Frontend |
| D15 | P0 | Offline progress engine | Purpose: deterministic catch-up while user was away. Scope in: 36h cap, last-action continuation, anti-time-spoof validation. Scope out: infinite accumulation. | D06, D13 | Compute elapsed server time, cap at 129600 seconds, apply activity-specific gains, write claim log with checksum | Unit tests for cap boundaries; tampered timestamp rejection tests | Login grants capped offline rewards consistent with last action; spoof attempts are rejected/logged | L | No | Backend |
| D16 | P1 | Daily quest system | Purpose: baseline retention loop with non-pay rewards. Scope in: daily quests (gain level or gold target), reward as time acceleration boost. Scope out: weekly quests. | D06, D13, D15 | Define quest generator, reset at UTC boundary, progress tracking hooks, claim endpoint | Quest lifecycle tests across reset boundaries | User receives one daily quest, progress updates correctly, reward claim applies once only | M | Yes | Full-stack |
| D17 | P1 | Tutorial/lore and contextual help | Purpose: improve onboarding and relearning. Scope in: first-visit modal per screen + replay help icon. Scope out: branching narrative dialogue trees. | D04 | Add per-screen first-visit flag, modal content framework, top-right help icon trigger | UI tests for first-visit and replay behavior | First entry shows tutorial once; help icon reopens same content on demand | S | Yes | Frontend |
| D18 | P0 | Anti-cheat validation middleware | Purpose: protect economy integrity. Scope in: payload schema validation, state transition guards, server-clock enforcement. Scope out: invasive client anti-tamper. | D06, D11, D13, D15 | Add shared validation middleware, request signatures/checksum verification for economic endpoints, anomaly logging | Security-focused tests with malformed and replay payloads | Invalid/tampered requests rejected with audit log; no economic mutation on invalid calls | M | No | Backend |
| D19 | P1 | Accessibility and settings controls | Purpose: satisfy mandatory accessibility features. Scope in: scalable text, color-blind-safe palette option, reduced motion toggle. Scope out: full screen-reader narrated combat logs. | D04, D07, D10, D12, D14 | Implement settings panel, CSS variable token switches, motion preference handling, semantic landmarks | Accessibility tests (keyboard-only + contrast checks) | All main screens usable by keyboard; contrast meets target; toggles persist per account | M | Yes | Frontend |
| D20 | P0 | Analytics instrumentation baseline | Purpose: launch observability for core loop and churn diagnosis. Scope in: event taxonomy, key gameplay events, failures. Scope out: advanced experimentation platform. | D06-D16 | Define event schema, instrument page views/actions/economy spends/progression, add ingestion endpoint | Event contract tests and sample dashboard validation | Required launch events are emitted with correct payload shape and timestamps | S | Yes | Full-stack |
| D21 | P0 | Test harness and balancing simulation | Purpose: prevent economy regression and support weekly tuning. Scope in: deterministic simulation scripts and CI threshold checks. Scope out: full Monte Carlo balancing suite. | D05, D06, D11, D13, D15 | Build simulation script for 1h/24h/7d progress snapshots, compare against expected ranges, fail CI on drift beyond threshold | Regression tests for growth curves and upgrade ROI sanity | Simulation runs in CI and flags deviations; balancing report artifact generated per run | M | Yes | Full-stack |
| D22 | P0 | Release readiness and performance hardening | Purpose: ensure fast, responsive launch quality. Scope in: performance budget checks, error monitoring, release checklist. Scope out: native app packaging. | D07-D21 | Add web vitals tracking, optimize hot paths, bundle analysis, finalize release checklist and rollback plan | Load/perf tests and smoke tests on staging | Startup and interaction latency within agreed thresholds; release checklist signed off | M | No | Full-stack |

## Section 6: Testing and quality strategy
### 6.1 Test layers
- Unit tests
  - Formula engine, progression transitions, skill-tree traversal, upgrade constraints.
- Integration tests
  - API endpoints with Mongo test DB, auth-protected mutation flows, offline reward claims.
- UI component tests
  - HUD rendering, stateful buttons, form validation, accessibility attributes.
- End-to-end tests
  - Login -> character creation -> fight -> level up -> spend skill point -> mine -> upgrade.
- Simulation tests
  - Economy growth snapshots and balance drift monitoring.

### 6.2 Quality gates (release blockers)
- QG1. No P0 backlog item open.
- QG2. Zero critical/high security findings on gameplay mutation endpoints.
- QG3. 95%+ pass on automated tests in main branch; no flaky test unresolved.
- QG4. All required accessibility checks pass on key flows.
- QG5. Offline cap behavior verified at 0h, 1h, 36h, and >36h cases.

### 6.3 Core scenario test matrix
- T1. XP threshold crossing grants exactly one level and one skill point.
- T2. Min damage cannot exceed max damage after any upgrade sequence.
- T3. Unaffordable action appears disabled and cannot mutate backend state.
- T4. Time spoof attempt does not produce extra offline reward.
- T5. Daily quest reset occurs once per UTC day and does not duplicate rewards.
- T6. Scientific notation appears consistently for large values across all major screens.

### 6.4 Non-functional checks
- Performance
  - Measure first contentful paint and interaction latency on gameplay screens.
- Reliability
  - Verify idempotency and replay protection for mutation endpoints.
- Accessibility
  - Keyboard-only traversal, semantic landmarks, focus-visible states, color contrast checks.

## Section 7: Risks and mitigations
- R1. Economy inflation or dead zones from initial constants.
  - Mitigation: D21 simulation + configurable constants + weekly tuning cadence.
- R2. Ambiguity around "no automation" causing inconsistent behavior.
  - Mitigation: lock design decision A2 in product spec and test expected loop behavior.
- R3. Anti-cheat false positives can block legitimate users.
  - Mitigation: anomaly scoring + reversible moderation path + detailed server logs.
- R4. Skill tree UX complexity can overwhelm new users.
  - Mitigation: first-visit tutorial, clear locked states, starter-node highlight.
- R5. Performance regressions from heavy UI rendering.
  - Mitigation: component memoization, minimal rerenders, perf budgets in CI.
- R6. Weekly content expectations exceed solo/team capacity.
  - Mitigation: enforce MVP scope freeze and template-driven content updates.

## Section 8: Open questions
- O1. Should combat continue in background while user is on other tabs/pages, or only when fight screen is active?
- O2. Exact damage formula and enemy stat scaling by monster level are still undefined.
- O3. Daily quest reward magnitude and acceleration duration/stack behavior are undefined.
- O4. Should player support manual stat respec at launch?
- O5. What measurable performance SLOs define "fast and responsive" (example: P95 click-to-feedback <150ms)?
- O6. What analytics taxonomy is included in "standard analytics" for this project?

## Section 9: Handoff instructions for implementation AIs
Execution rules
- Implement backlog items in ID order unless dependencies indicate safe parallelization.
- Do not start frontend API integration for a feature before backend contract is frozen for that feature.
- Preserve server-authoritative calculations; client must never compute canonical rewards.

Per-deliverable implementation packet template
- Inputs
  - Relevant backlog ID, dependencies, required formulas/constants.
- Work steps
  - Follow implementation tasks exactly and commit in small increments.
- Validation
  - Execute listed test tasks and attach pass/fail results.
- Done check
  - Verify all acceptance criteria for the deliverable.

Parallel lane assignment (recommended)
- Lane A (Backend): D05, D06, D08, D09, D11, D13, D15, D18.
- Lane B (Frontend): D04, D07, D10, D12, D14, D17, D19.
- Lane C (Platform/Quality): D01, D02, D20, D21, D22.

Contract-first guidance
- Define API contracts (request/response schemas + error codes) before UI binding.
- Version gameplay constants and document all default values in one source.
- Require deterministic replay tests for combat/economy mutation endpoints.

Definition of done for the full plan execution
- All P0 deliverables completed and validated.
- At least one full end-to-end path from login to progression spend verified on staging.
- Accessibility baseline features delivered and test-passed.
- Offline progression and anti-cheat checks verified in production-like environment.

## Section 10: UI requirements package for Vercel v0 (AI-parseable)
### Artifact A: Structured UI spec (YAML)
```yaml
ui_spec:
  project_name: "Gateway Incremental"
  objective: "Generate production-ready, reusable UI for a web idle-RPG MVP with fighting, mining, blacksmith, and skill tree flows."
  generation_target:
    tool: "v0"
    framework: "Next.js (App Router) + TypeScript"
    styling: "Tailwind CSS with shadcn/ui components"
    component_strategy: "Composable, reusable presentational components with typed props and state-driven variants"
  design_system:
    visual_direction:
      theme: "Dark fantasy RPG, serious tone, light lore"
      principles:
        - "Readable numeric information first"
        - "Dark backgrounds with subdued body text and high-contrast interactive text"
        - "Strong status contrast for actionable vs unavailable actions"
        - "Low-clutter HUD and clear progression affordances"
      brand_constraints:
        - "No cartoon style"
        - "No neon sci-fi motifs"
        - "Maintain sober, high-contrast palette with maximum legibility"
    layout_system:
      app_shell:
        desktop: "2-column layout where the left column is 25% width and the right column is 75% width"
        tablet: "2-column layout where the left column remains fixed at 25% when viewport allows"
        mobile: "Single-column stacked layout; navigation and stats collapse into a top drawer/panel"
      left_column:
        width: "25%"
        contains:
          - "Character stats"
          - "Primary navigation"
          - "Contextual quick actions"
      main_content:
        width: "75%"
        contains: "All page-specific gameplay elements for the active route (fight, blacksmith, skill tree, mining, settings)"
    tokens:
      colors:
        background_primary: "#0F1115"
        background_secondary: "#171A21"
        surface_card: "#1E232D"
        text_primary: "#E6EAF2"
        text_secondary: "#AAB3C5"
        text_body_subdued: "#9CA6B8"
        text_high_contrast: "#F4F7FF"
        accent_primary: "#C29B5A"
        accent_secondary: "#4E7DA6"
        success: "#3FA66A"
        warning: "#D4A24A"
        error: "#C24A4A"
        focus_ring: "#7FB3FF"
        disabled_bg: "#2B303A"
        disabled_text: "#6F7788"
      typography:
        font_display: "Cinzel"
        font_body: "Source Sans 3"
        scale:
          xs: "12px"
          sm: "14px"
          md: "16px"
          lg: "20px"
          xl: "28px"
          xxl: "36px"
        weights:
          regular: 400
          semibold: 600
          bold: 700
      spacing:
        base_unit: 4
        scale:
          1: "4px"
          2: "8px"
          3: "12px"
          4: "16px"
          5: "20px"
          6: "24px"
          8: "32px"
          10: "40px"
      radius:
        sm: "6px"
        md: "10px"
        lg: "14px"
      shadows:
        sm: "0 1px 2px rgba(0,0,0,0.35)"
        md: "0 6px 18px rgba(0,0,0,0.35)"
        focus: "0 0 0 3px rgba(127,179,255,0.45)"
  screens:
    - id: "auth_login"
      route: "/login"
      purpose: "Authenticate with Google and start or resume game"
      layout_regions:
        - "Header: game title and subtitle"
        - "Main card: sign-in CTA and trust notes"
        - "Footer: legal/support links"
      components:
        - "BrandHeader"
        - "PrimaryButton"
        - "InfoCallout"
      states:
        - "default"
        - "loading"
        - "error"
        - "success"
      interactions:
        - "Click Sign in with Google triggers OAuth"
        - "Keyboard Enter on focused button triggers OAuth"
      responsive_rules:
        - "Mobile: single centered column"
        - "Desktop: centered card with max-width 480px"
    - id: "character_create"
      route: "/character/create"
      purpose: "Create character name and avatar before entering game"
      layout_regions:
        - "Top: title and instructions"
        - "Left: avatar selection grid"
        - "Right: name input and create action"
      components:
        - "AvatarPicker"
        - "TextInput"
        - "PrimaryButton"
        - "InlineValidation"
      states:
        - "default"
        - "hover"
        - "focus"
        - "disabled"
        - "loading"
        - "error"
        - "success"
      interactions:
        - "Avatar tile click selects avatar"
        - "Name input validates length and allowed characters"
        - "Create button disabled until valid selection"
      responsive_rules:
        - "Mobile: stacked avatar grid then form"
        - "Tablet/Desktop: 2-column layout"
    - id: "fight"
      route: "/fight"
      purpose: "Run combat encounters, gain XP, and level up"
      layout_regions:
        - "App shell left column (25%): character stats and navigation"
        - "App shell main content (75%): fight page elements"
        - "Main content internal regions: left panel monster list, center panel combat arena, right panel combat log/actions"
      components:
        - "GlobalHUD"
        - "MonsterList"
        - "CombatArena"
        - "HealthBar"
        - "ActionButton"
        - "StatusBadge"
      states:
        - "default"
        - "loading"
        - "empty"
        - "error"
        - "success"
        - "victory"
        - "defeat"
        - "cooldown"
      interactions:
        - "Monster row click selects target level"
        - "Fight action starts encounter"
        - "Post-result cooldown timer displayed (default 10s)"
        - "Keyboard navigation through monster rows"
      responsive_rules:
        - "Mobile: single-column stack with collapsible stats/nav panel"
        - "Desktop: app shell 25/75 split, with fight content using internal 3-column gameplay layout"
    - id: "blacksmith"
      route: "/blacksmith"
      purpose: "Upgrade weapon and armor using gold"
      layout_regions:
        - "App shell left column (25%): character stats and navigation"
        - "App shell main content (75%): weapon and armor upgrade cards"
      components:
        - "GlobalHUD"
        - "UpgradeCard"
        - "UpgradeRow"
        - "LockBadge"
        - "CostLabel"
      states:
        - "default"
        - "hover"
        - "focus"
        - "disabled"
        - "loading"
        - "error"
        - "success"
      interactions:
        - "Upgrade click submits purchase intent"
        - "Disabled state when unaffordable"
        - "Locked upgrades show tooltip reason"
      responsive_rules:
        - "Mobile: single-column stack with collapsible stats/nav panel"
        - "Desktop: app shell 25/75 split; main content shows side-by-side two card layout"
    - id: "skill_tree"
      route: "/skills"
      purpose: "Spend skill points on connected nodes"
      layout_regions:
        - "App shell left column (25%): character stats and navigation"
        - "App shell main content (75%): tree canvas and node details panel"
      components:
        - "GlobalHUD"
        - "SkillNode"
        - "SkillEdge"
        - "SkillDetailPanel"
        - "PointCounter"
      states:
        - "default"
        - "hover"
        - "focus"
        - "disabled"
        - "loading"
        - "empty"
        - "error"
        - "success"
      interactions:
        - "Node click selects node and opens details"
        - "Allocate action enabled only for connected nodes"
        - "Keyboard node traversal supported"
      responsive_rules:
        - "Mobile: simplified tree view with vertical scrolling and collapsible stats/nav panel"
        - "Desktop: app shell 25/75 split; expanded tree canvas with side detail panel"
    - id: "mining"
      route: "/mining"
      purpose: "Mine gold and buy mining tools"
      layout_regions:
        - "App shell left column (25%): character stats and navigation"
        - "App shell main content (75%): mining activity and tool store panels"
      components:
        - "GlobalHUD"
        - "TimerDisplay"
        - "PrimaryButton"
        - "ToolStoreItem"
        - "PurchaseButton"
      states:
        - "default"
        - "loading"
        - "disabled"
        - "error"
        - "success"
        - "cooldown"
      interactions:
        - "Mine action triggers timed resource gain"
        - "Purchase tool applies multiplier and ownership state"
      responsive_rules:
        - "Mobile: stacked activity then store with collapsible stats/nav panel"
        - "Desktop: app shell 25/75 split; main content uses internal two-column split"
    - id: "settings_help"
      route: "/settings"
      purpose: "Accessibility controls and tutorial replay"
      layout_regions:
        - "App shell left column (25%): character stats and navigation"
        - "App shell main content (75%): accessibility settings and tutorial replay actions"
      components:
        - "ToggleSwitch"
        - "SelectInput"
        - "HelpReplayButton"
      states:
        - "default"
        - "focus"
        - "disabled"
        - "success"
      interactions:
        - "Reduced motion toggle updates animation behavior"
        - "Color-safe palette toggle updates theme tokens"
        - "Text scale control updates typography scale"
      responsive_rules:
        - "Mobile: single-column content with collapsible stats/nav panel"
        - "Desktop: app shell 25/75 split"
  components:
    - name: "GlobalHUD"
      props:
        - "characterName: string"
        - "level: number"
        - "xpCurrent: number"
        - "xpRequired: number"
        - "skillPoints: number"
        - "gold: number"
      variants:
        - "compact"
        - "full"
      states:
        - "default"
        - "loading"
        - "error"
      accessibility_notes:
        - "Use semantic header region"
        - "XP progress uses aria-valuenow/aria-valuemax"
    - name: "UpgradeRow"
      props:
        - "label: string"
        - "currentValue: string"
        - "nextValue: string"
        - "cost: number"
        - "affordable: boolean"
        - "locked: boolean"
      variants:
        - "weapon"
        - "armor"
      states:
        - "default"
        - "hover"
        - "focus"
        - "disabled"
        - "loading"
        - "success"
        - "error"
      accessibility_notes:
        - "Disabled buttons remain focusable only if tooltip is needed; otherwise remove from tab order"
    - name: "SkillNode"
      props:
        - "nodeId: string"
        - "title: string"
        - "allocated: boolean"
        - "connected: boolean"
        - "cost: number"
      variants:
        - "start"
        - "travel"
        - "notable"
      states:
        - "default"
        - "hover"
        - "focus"
        - "disabled"
        - "success"
      accessibility_notes:
        - "Represent as button with aria-pressed for allocated nodes"
    - name: "ToolStoreItem"
      props:
        - "toolId: string"
        - "name: string"
        - "bonusPercent: number"
        - "cost: number"
        - "owned: boolean"
        - "affordable: boolean"
      variants:
        - "available"
        - "owned"
      states:
        - "default"
        - "hover"
        - "focus"
        - "disabled"
        - "success"
        - "error"
      accessibility_notes:
        - "Price and ownership status should be announced via aria-live on purchase"
  data_models:
    - entity: "Character"
      fields:
        - "id: string"
        - "name: string"
        - "avatarId: string"
        - "level: number"
        - "xp: number"
        - "xpRequired: number"
        - "skillPoints: number"
      sample:
        id: "char_001"
        name: "Aldric"
        avatarId: "avatar_knight_02"
        level: 7
        xp: 154
        xpRequired: 227
        skillPoints: 2
    - entity: "Resources"
      fields:
        - "gold: number"
        - "totalMined: number"
        - "toolEffectMultiplier: number"
      sample:
        gold: 14820
        totalMined: 923
        toolEffectMultiplier: 1.25
    - entity: "CombatState"
      fields:
        - "selectedMonsterLevel: number"
        - "playerHp: number"
        - "enemyHp: number"
        - "cooldownSecRemaining: number"
        - "lastOutcome: string"
      sample:
        selectedMonsterLevel: 3
        playerHp: 118
        enemyHp: 0
        cooldownSecRemaining: 8
        lastOutcome: "victory"
    - entity: "SkillTreeState"
      fields:
        - "availablePoints: number"
        - "allocatedNodeIds: string[]"
      sample:
        availablePoints: 1
        allocatedNodeIds:
          - "start_01"
          - "travel_str_02"
  accessibility:
    semantic_requirements:
      - "Use one h1 per page and semantic landmarks (header, nav, main, aside, footer where relevant)"
      - "All actionable controls use native button/input semantics"
      - "Error and success feedback use aria-live polite/assertive as appropriate"
    keyboard_flows:
      - "Full navigation without mouse across all primary screens"
      - "Visible focus ring using token color focus_ring"
      - "Escape closes modals and returns focus to trigger"
    contrast_target: "WCAG 2.2 AA minimum for text and controls"
  constraints:
    do_not_generate:
      - "Do not generate backend API/business logic"
      - "Do not generate payment or monetization advantage UI"
      - "Do not add prestige/reset UI for launch"
      - "Do not include mobile touch-only gestures as primary interaction"
    technical_limits:
      - "UI must be compatible with Next.js app router"
      - "Use Tailwind utility classes and shadcn primitives only"
      - "Avoid external heavy visualization libraries for skill tree"
  acceptance_criteria:
    - criterion_id: "UI-AC-01"
      description: "All defined screens are generated with required layout regions and wired component placeholders"
      validation_method: "Manual QA against screen map"
    - criterion_id: "UI-AC-02"
      description: "All components include default/hover/focus/disabled/loading/error/success states where applicable"
      validation_method: "Storybook or local state matrix review"
    - criterion_id: "UI-AC-03"
      description: "Mobile-first responsive behavior implemented for all screen responsive_rules"
      validation_method: "Viewport tests at 360px, 768px, 1280px"
    - criterion_id: "UI-AC-04"
      description: "Accessibility requirements are met for semantics, keyboard flow, and contrast"
      validation_method: "Automated axe checks plus manual keyboard traversal"
```

### Artifact B: Vercel v0 prompt text (paste-ready)
```text
Generate production-ready Next.js + TypeScript UI code for the project defined in the YAML ui_spec below. Use Tailwind CSS and shadcn/ui components, mobile-first responsive behavior, and reusable component architecture.

Strict instructions:
1) Parse and follow ui_spec fields exactly: generation_target, design_system, screens, components, data_models, accessibility, constraints, acceptance_criteria.
2) Enforce ui_spec.design_system.layout_system.app_shell across all gameplay routes: left column fixed at 25% for character stats/navigation, main content area holds all page-specific elements.
3) Produce real implementation-ready UI code, not wireframes or pseudo-layouts.
4) Create reusable components with typed props that match ui_spec.components.
5) Apply consistent design tokens from ui_spec.design_system.tokens through CSS variables/Tailwind mapping.
6) Implement all defined screen routes and layout_regions.
7) Implement component states and variants, including default/hover/focus/disabled/loading/empty/error/success where applicable.
8) Implement keyboard-accessible interactions and semantic markup per ui_spec.accessibility.
9) Keep outputs within constraints.do_not_generate and constraints.technical_limits.
10) Include mock bindings using ui_spec.data_models.sample so every screen renders with realistic placeholder data.
11) Output should include:
   - App shell layout and navigation
   - Screen components for each ui_spec.screens item
   - Reusable shared components from ui_spec.components
   - Token definitions and theme setup
   - Minimal mock data module and typed interfaces

Use this YAML as the source of truth:

[PASTE THE EXACT ui_spec YAML FROM ARTIFACT A HERE]
```
