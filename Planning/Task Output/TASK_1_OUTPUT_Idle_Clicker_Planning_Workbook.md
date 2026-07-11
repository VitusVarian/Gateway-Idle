# TASK 1 Output: Idle/Clicker Planning Workbook

## 1. Purpose and How to Use This Workbook
This workbook helps you convert an idle/clicker game concept into an implementation-ready plan.

How to use it:
- Read Sections 2 and 3 to align on proven genre patterns.
- Answer every question in Section 4 with concrete values (numbers, formulas, feature scope).
- Complete the checklist in Section 5 to reduce design and production risk.
- Fill Section 6 to capture product direction and user-facing priorities.
- Use Section 7 to produce a developer handoff summary.

Recommended output quality:
- Prefer specific ranges over vague terms (example: "session length 3-7 minutes" instead of "short").
- Define at least one measurable target per system (economy, retention, progression, performance).
- Note assumptions explicitly where data is missing.

---

## 2. Idle/Clicker Genre Research Summary
### Core characteristics
- Continuous or semi-continuous resource generation, including offline progress.
- Simple early interactions (tap/click) that evolve into layered automation.
- Exponential or staircase growth curves balanced by periodic resets/prestige.
- Strong number feedback loops (damage, currency, multipliers, milestones).
- Frequent short rewards plus slower long-term meta progression.

### Common player loops
- Core loop (seconds to minutes):
  - Tap/collect currency -> buy upgrade/producer -> increase income rate -> repeat.
- Mid loop (minutes to hours):
  - Unlock new systems (automation, skill trees, milestones, events) -> optimize build.
- Long loop (days to weeks):
  - Prestige/reset -> gain permanent meta currency -> start faster/stronger next run.

### Typical progression systems
- Generator tiers: each tier unlocks at thresholds and accelerates earlier tiers.
- Upgrade layers: additive bonuses first, multiplicative bonuses later.
- Milestones/achievements: permanent boosts tied to goals.
- Prestige ascension: reset run-state for meta gains.
- Limited-time events: temporary progression tracks for re-engagement.

### Monetization patterns (common in free-to-play idle games)
- Ad-based boosts: optional rewarded ads for temporary multipliers.
- Time skips/speed-ups: premium currency to accelerate progress.
- Starter bundles: early conversion offers with high perceived value.
- Subscription/VIP: convenience bonuses (auto-collect, extra offline cap, QoL).
- Cosmetic packs/themes: lower gameplay impact, high identity value.

### Why idle/clicker games sustain long engagement
- Low cognitive load with constant visible growth.
- Frequent rewards and clear next goals reduce decision paralysis.
- Prestige turns "starting over" into meaningful advancement.
- Build optimization creates mastery for experienced players.
- Offline progression supports habit-based re-entry.

---

## 3. Core Design Patterns (with Pros, Cons, and Pitfalls)
Use these patterns as modular building blocks. Combine only what your team can balance and ship.

### Pattern 1: Layered Currency Economy
- What it is:
  - Multiple currencies with distinct purposes (run currency, rare upgrade currency, prestige currency).
- Why it works:
  - Supports short-term spending and long-term goals simultaneously.
- Pros:
  - Better control of pacing and reward cadence.
  - Easier content gating by layer.
- Cons:
  - Higher balancing and UI complexity.
- Common implementation pitfalls:
  - Too many currencies too early.
  - Overlapping use-cases that confuse player decisions.

### Pattern 2: Prestige/Ascension Reset Loop
- What it is:
  - Player resets run progress to gain permanent meta power.
- Why it works:
  - Solves late-game stagnation and creates repeatable long-term progression.
- Pros:
  - Extends lifetime content without endless linear levels.
  - Provides strategic timing decisions.
- Cons:
  - Can feel punishing if reset value is unclear.
- Common implementation pitfalls:
  - Poor communication of expected post-reset gains.
  - Prestige available too late or too early for pacing.

### Pattern 3: Softcaps with Alternative Growth Paths
- What it is:
  - Main stats slow after thresholds; players pivot to other multipliers/systems.
- Why it works:
  - Prevents single dominant strategy and preserves decision depth.
- Pros:
  - Improves build diversity.
  - Delays runaway inflation.
- Cons:
  - Requires clear UX explanation.
- Common implementation pitfalls:
  - Hidden caps that look like bugs.
  - Hard stop caps that feel unfair instead of gently diminishing returns.

### Pattern 4: Milestone Unlock Chains
- What it is:
  - Features unlock at explicit progression milestones (new generators, automation slots, mini-systems).
- Why it works:
  - Creates anticipation and structured content delivery.
- Pros:
  - Strong guidance for new players.
  - Natural tutorialization via unlock order.
- Cons:
  - Risk of over-scripted progression.
- Common implementation pitfalls:
  - Long dead zones between milestones.
  - Unlocks that add complexity without meaningful payoff.

### Pattern 5: Offline Progress with Return Burst
- What it is:
  - On return, player claims generated resources and optional bonus actions.
- Why it works:
  - Reinforces daily habit and makes breaks feel productive.
- Pros:
  - Better retention for low-session-frequency players.
  - Reduces fear of missing progress.
- Cons:
  - Can devalue active play if overpowered.
- Common implementation pitfalls:
  - Infinite offline accumulation with no cap.
  - Large economy inflation from unbounded offline multipliers.

### Pattern 6: Limited-Time Events with Parallel Progression
- What it is:
  - Side progression track active for a fixed time window, often with exclusive rewards.
- Why it works:
  - Generates urgency and periodic re-engagement spikes.
- Pros:
  - Supports live-ops cadence.
  - Adds variety without replacing core progression.
- Cons:
  - Live content production burden.
- Common implementation pitfalls:
  - Event rewards mandatory for main progression (feels pay-to-keep-up).
  - Repetitive event format causing fatigue.

---

## 4. Implementation Planning Questions
Answer with concrete values. Guidance notes are included under each topic.

### A. Product Vision and Audience
Guidance note: define who the game is for and what session behavior you expect.
- What is the one-sentence fantasy of your game?
    - Fantasy idle RPG with stat and item customization to allow a plyaer to face and defeat ever growing challenges.
- Who is the primary target audience (age range, platform habits, play style)?
    - Late 20s to early 50s, "old-school" RPG fans, Final Fantasy fans
- What is the intended play cadence (check-in frequency per day/week)?
    - At a minimum, daily check in, possibly multiple times per day
- What is the target session length for early, mid, and late game?
    - 15-30 minute sessions. Basic check ins may be shorter. Early game and "crafting" sessions may be longer
- What are your top 3 player experience goals (example: relaxing, optimization-heavy, humorous)?
    - Relaxing, min-maxing, accomplishment/fulfilment/progress

### B. Core Loop and Input Model
Guidance note: lock the shortest repeatable loop first, then layer systems.
- What are the exact core loop steps from first tap to first upgrade?
    - Fight monster, win, gain experience, level up
- Which inputs are supported (tap, hold, auto, gesture, keyboard/controller)?
    - Mouse only
- At what minute does automation begin?
    - Initially, there will be no automation
- What actions remain active-player only throughout the game?
    - All actions are active-player only
- What moment should make the player feel first power spike?
    - First level up

### C. Economy and Growth Math
Guidance note: define formulas early to prevent rework.
- What are all currencies and their distinct sinks/sources?
    - Gold -> Generated from the "Mine". Spent on upgrading sword, armor, mining tools
    - Experience -> Generated from "Fighting". At certain amounts, the player gains a level
    - Skill Points -> Generated from leveling up. Spent in a Skill Tree that amplifies player attributes
- What is the baseline income formula?
    - Gold = Base_Gain * Tool_Effect * (1 + .18 * Mining_Ability^.5)
        - Base_Gain = 10, Tool_Effect is a multiplier that starts at 1.0 and will increase from purchased items, Mining_Abiltiy is the number of items a player has mined in the past (starts at 0)
    - Experience_Gain = (Base * Monster_Level^monster_xp_modifier) * Bonus_Experience
        - Base = 10, monster_xp_modifier starts at 1.2 but can later be modified by player actions, bonus_experience starts at 1.0 but can be modified by player actions
    - Experience_required_to_level = 20 * (1.50)^Level , rounded down
        - example: xp required for level 2 is 20+(1.5)^2 = 45, level 3 requires 68 (after rounding)
        - The 1.5 value should be a variable as it will be able to be modified later on by player decisions. This is the leveling_difficulty
- Which bonuses are additive vs multiplicative?
    - The answers above should suffice by way of formula
- What are your target growth multipliers by phase (early/mid/late)?
    - Early multipliers would be Mining_Ability, Bonus_Experience, Tool_effect
    - Mid multipliers would be monster_xp_modifier, leveling_difficulty
    - Late multipliers currently do not exist 
- Where are softcaps applied, and what alternative growth paths open there?
    - No soft caps exist outside of the formula
- What is the maximum offline accumulation time cap?
    - 36 hours

### D. Progression and Unlock Design
Guidance note: every unlock should change player behavior, not just numbers.
- What are the first 10 meaningful unlocks in order?
    - The player has choices almost immediately after the first automated fight. Leveling up unlocks the skill tree. Mining unlocks upgrading weapon or armor at the blacksmith.
- What unlock condition type is used (currency threshold, achievement, time, quest)?
    - Skill tree is locked behind Skill Points (from leveling up by fighting monsters)
    - Blacksmith upgrading is locked behind gold (from mining)
- Which system introduces prestige, and when?
    - This game is more linear than most and does not have ap restige cycle
- What permanent gains are granted after each prestige cycle?
    - This game is more linear than most and does not have ap restige cycle
- How many resets should a player complete before mid-game systems are fully open?
    - This game is more linear than most and does not have ap restige cycle

### E. Retention, Motivation, and Content Cadence
Guidance note: pair short-term goals with long-term goals.
- Which daily/weekly goals are shown at login?
    - Daily quest to gain a level or x amount of gold.
    - Reward is a time acceleration boost
- What recurring systems exist (quests, events, streaks, seasonal passes)?
    - Daily quest
- What comeback mechanic supports returning lapsed players?
    - None
- How do you prevent dead zones where no meaningful decision exists?
    - Game updates
- What is your retention target for D1, D7, and D30?
    - I am not sure how to answer this

### F. Monetization and Fairness
Guidance note: monetize acceleration/convenience, not hard progression walls.
- What monetization methods are included (ads, IAP bundles, subscription, cosmetics)?
    - Completely optional 1 time donation or recurring subscription. No in game benefits.
- Which boosts are optional and non-mandatory for progression?
    - All monetization is optional
- What is the first-time payer offer and where is it surfaced?
    - There is no first time offer
- What anti-pay-to-win rules are enforced?
    - No in game benefits from donating or subscribing
- What economy safeguards prevent ad abuse or premium inflation?
    - No in game benefits from donating or subscribing

### G. UX/UI and Information Architecture
Guidance note: idle games fail fast when numbers are powerful but unreadable.
- What are the 5 always-visible HUD elements?
    - Character Name, Level, Experience bar, Skill Points, Gold
- How are upgrade options sorted/prioritized (ROI, affordability, recommendation)?
    - They are not sorted
- How is affordability communicated (color, animation, sound, icon state)?
    - Unaffordable upgrades or skills should be greyed out and unclickable with a hover state showing a red circle with a line through it
- How are large numbers formatted (K/M/B/T/scientific/custom notation)?
    - Scientific Notation
- Which tutorial moments are contextual vs forced?
    - The first time a player reaches a new screen there should be a lore pop up / tutorial. After the first visit, there should be a help icon in the top right of each screen to replay the message as needed

### H. Technical Scope and Implementation Constraints
Guidance note: align feature ambition to team and engine realities.
- Target platform(s): mobile, web, desktop, cross-platform?
    - Web
- Engine/framework and why?
    - Typescript, next.js, mongodb, tailwind.css with shadcn/ui
- Save strategy: local only, cloud sync, account-based?
    - Account-based, mongoDB as source of truth, local displays are approximated
- What anti-cheat protections are needed (time spoof, memory tampering, economy validation)?
    - Time spoofing, local variable adjustments, trying to send incorrect data to mongodb
- Performance budget: max memory, target FPS, load time budget?
    - Web browser based game, needs to load fast and feel very responsive to every click
- Analytics events required at launch (economy spend, churn points, ad views, conversion)?
    - Standard analytics

### I. Content Production and Pipeline
Guidance note: content velocity matters in idle games.
- Who owns economy tuning, feature implementation, and content ops?
    - Game dev
- How will upgrade/milestone data be authored (JSON, ScriptableObject, DB table)?
    - DB table
- What balancing workflow is used (simulation script, telemetry, spreadsheets)?
    - Simulation
- What live-ops cadence is realistic for your team (weekly, biweekly, monthly)?
    - weekly
- What is the minimum viable content set for launch?
    - Sign up/Login page with google account, 
    - character creation (choose artwork and name)
    - Fighting page
        - List of monsters and their associated levels, defaults to level 1 monster
        - Art showing player character and enemy character and attacks
        - Animated health bars
        - On victory, award experience. If experience exceeds the required amount to level up, increments player level and award 1 skill point and reset experience
        - The time between fights (after a victory or defeat) defaults to 10 seconds.
    - Blacksmith page
        - Display of weapon and armor in two separate panels
        - Weapon display includes sword image and a list of attributes that can be upgraded
            - Maximum damage (uses gold)
            - Minimum damage (cannot exceed Maximum damage) (uses gold)
            - Weapon speed (cannot be upgraded at game start)
            - Critical hit chance (cannot be upgraded at game start)
            - Critical hit damage (cannot be upgraded at game start)
        - Armor display includes shield image and list of attributes that can be upgraded
            - Protection (uses gold)
            - Life (uses gold)
            - Block Chance (cannot be upgraded at game start)
            - Reduction (cannot be upgraded at game start)
            - Regeneration (cannot be upgraded at game start)
    - Skill Tree
        - Display a skill tree in the Path of Exile style, but with only 1 starting node. A player should be able to spend skill points to traverse the tree in multiple different directions.
        - Travel node values may consist of:
            - Strength (multiplier to total damage before mitigation)
            - Endurance (mutliplier to protection)
            - Agility (multiplier to weapon speed)
            - Consitituion (multiplier to regeneration)
        - Tree may have "wheel" branches with like-themed goals
            - Increased weapon damage %
            - Increased maximum life %
            - Increased protection %
    - Mining page
        - User can visit the store to buy tools
            - Iron Pickaxe | 25% bonus | 10,000 gold cost
            - Mythril Pickaxe | 50% bonus | 100,000 gold cost
            - Enchant Mythril Pickaxe | 100% bonus 1,000,000 gold cost
        - User can Mine for gold
        - Base mining speed is 1 mining action per 10 seconds.

---

## 5. Design Considerations Checklist
Mark each item before implementation begins.

### Balance and Economy
- [ ] Currency sinks are defined for every source.
- [ ] Early game has frequent upgrades (no long empty waits).
- [ ] Mid-game includes at least 2 viable build paths.
- [ ] Late-game inflation is controlled with softcaps/prestige.
- [ ] Offline rewards are capped and balanced versus active play.

### Pacing and Progression
- [ ] First automation unlock occurs at a clear milestone.
- [ ] First prestige occurs before player fatigue point.
- [ ] Every unlock changes strategy, not only raw numbers.
- [ ] No progression dead zone longer than target threshold.
- [ ] Short-term and long-term goals are always visible.

### Retention and Motivation
- [ ] Daily return incentive exists and feels valuable.
- [ ] Comeback rewards exist for lapsed users.
- [ ] Event cadence is achievable with team bandwidth.
- [ ] Achievement/milestone rewards support core progression.
- [ ] Notification/reminder plan is platform-appropriate.

### UI Clarity and Accessibility
- [ ] Primary CTA and upgrade affordances are obvious.
- [ ] Number formatting remains readable at all scales.
- [ ] Color use supports contrast and color-vision differences.
- [ ] Core systems are understandable without long tutorials.
- [ ] Key actions are usable one-handed on mobile (if mobile target).

### Technical Feasibility and Operations
- [ ] Save/load handles app restarts and version migration.
- [ ] Offline time calculation is deterministic and tested.
- [ ] Economy formulas are data-driven (not hard-coded only).
- [ ] Anti-exploit checks are defined for launch.
- [ ] Analytics instrumentation covers core loop and monetization.
- [ ] QA test cases include economy breakpoints and reset edge cases.

---

## 6. Personalization and Desired Elements
Use this section to define your product identity and constraints.

### A. Theme, Fantasy, and Tone
- Preferred theme/world: Medieval, fantasy
- Tone (cozy, comedic, serious, competitive, etc.): Dark, RPG, serious
- Narrative presence level (none/light/moderate/heavy): Light
- Reference games/media inspiration: Path of Exile

### B. Mechanics Preferences
Must-have mechanics:
- [ ] real time fighting
- [ ] navigable skill tree

### C. Visual and Audio Direction
Must-have style traits: -- These to be provided by another document at a later time

### D. Accessibility and Inclusion Priorities
Must-have accessibility features:
- [ ] Scalable text
- [ ] Color-blind-safe palette options
- [ ] Reduced motion option
- [ ] Haptics/audio toggles
- [ ] Left/right-handed layout option (if relevant)
- [ ] Other:

### E. Platform and Distribution Priorities
Must-have platform priorities:
- Primary platform: Web browser
- Input method priority: Mouse
- Performance floor target: As fast as possible. Compare local numbers against database as needed to not detriment player experience
- Online/offline requirement: While offline, continue with the players last action (if they were mining, keep mining until they next log in and choose something else)

---

## 7. Completed Plan Summary (To Fill After Answering)
Fill this after completing Sections 4-6.

### Product Summary
- Game concept (1-2 sentences):
- Target audience:
- Platforms:
- Core loop summary:

### Systems Scope (Launch)
- Economy systems included:
- Progression systems included:
- Prestige/reset model:
- Retention systems included:
- Monetization systems included:

### Technical Plan
- Engine/framework:
- Data architecture approach:
- Save/load approach:
- Analytics plan:
- Anti-exploit plan:

### Balance Targets
- Early game pacing target:
- Mid-game pacing target:
- Late-game pacing target:
- Offline cap and multiplier policy:
- Key tuning risks:

### Production Plan
- MVP features locked for implementation:
- Team roles and ownership:
- Milestone timeline:
- Test/QA focus areas:

### Open Questions and Risks
- Unknowns requiring prototype validation:
- Assumptions that may fail:
- Fallback options if scope/tuning slips:

### Developer Handoff Checklist
- [ ] Feature list is implementation-ready and prioritized.
- [ ] Core formulas and balancing targets are documented.
- [ ] UI flow and critical screens are identified.
- [ ] Technical constraints and dependencies are listed.
- [ ] Launch scope vs post-launch scope is explicit.
