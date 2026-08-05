# Gateway of Darkness Idle - Stack Decisions Log

Last updated: 2026-08-05

## Purpose
Track confirmed technical choices, note decisions already made in planning, and stage the next decision that still needs your call.

## Confirmed Stack Choices

- Framework: React + TypeScript.
- Build tooling: Vite + pnpm.
- Rendering approach: DOM-first UI (no dedicated gameplay canvas).
- Styling choice (new): Tailwind CSS.
- Local persistence utility (new): idb-keyval.
- State management (decided): Zustand.
- Big-number library (decided): bignumber.js.
- Save format and migration strategy (decided): Plain JSON + schemaVersion + manual migrators.
- Test strategy (decided): Vitest.
- Runtime schema validation library (decided): Zod.
- Number display formatting strategy (decided): built-in Intl.NumberFormat plus a small custom notation layer.
- End-to-end browser test framework (decided): Playwright.
- Production error telemetry strategy (decided): no third-party telemetry (local-only logs + optional manual export).
- Client diagnostics logging utility strategy (decided): no logging dependency (native console wrapper in app code).
- Timer and date formatting utility strategy (decided): no date library dependency (Intl.DateTimeFormat + in-app duration formatter).
- UI animation utility strategy (decided): no animation dependency (CSS transitions/keyframes + tiny app helpers).
- Keyboard shortcut utility strategy (decided): react-hotkeys-hook.
- Toast and notification utility strategy (decided): sonner.
- Modal and dialog utility strategy (decided): @radix-ui/react-dialog.
- Icon library strategy (decided): lucide-react.
- Clipboard copy utility strategy (decided): no dependency (native navigator.clipboard + app fallback handling).
- Class composition utility strategy (decided): clsx.
- Component variant utility strategy (decided): class-variance-authority.
- Offline support and PWA caching strategy (decided): no offline/PWA dependency (network-only app + local save only).
- Form state utility strategy (decided): react-hook-form.
- Routing strategy (decided): react-router-dom.
- URL query parameter utility strategy (decided): no dependency (native URLSearchParams + react-router-dom useSearchParams).
- Event bus utility strategy (decided): no event-bus dependency (tiny in-app pub/sub helper).
- Finite-state-machine utility strategy (decided): no FSM dependency (in-app state machine reducers/guards).
- Selector memoization strategy (decided): no selector memoization dependency (Zustand built-in subscriptions + inline derived values).
- Immutable update strategy (decided): no dependency (plain object spread in Zustand actions).
- Crypto/hash utility strategy (decided): no dependency (native Web Crypto API — crypto.subtle).
- Code quality tooling strategy (decided): ESLint + Prettier.

## Notes on Existing Planning Decisions

These are already documented in the UI/UX outline assumptions log and remain in effect unless you change them:

- Manual export/import uses salted Base64 payloads with checksum validation (no passphrase lock).
- Placeholder art is used in first pass (shared regular monster placeholder and shared boss placeholder).
- Stage progression persistence/reset behavior is explicitly defined per prestige cycle.
- DPS + HP are sufficient for initial combat presentation (no combat log in first scope).
- Single-player only, no multiplayer/network latency UI.
- No pause system; simulation continues while open (subject to browser timer behavior).
- Rebirth and Gateway UI are deferred in first scope beyond placeholders/locked indicators.
- Battle remains always visible while bottom panel content changes.
- Desktop keyboard shortcuts are included.
- Pacing targets are defined (time to first Training and post-reset cycle targets).
- Player-facing labels use spaced terms (Monster Souls, Training Points).

## Stack Decisions Queue (Open)

All decisions resolved. No open items.

## Decision Closed: State Management

### Result

Selected option: Zustand.

Reason retained: best performance-to-complexity ratio for frequent tick updates with very low bundle impact.

## Decision Closed: Big-Number Library

### Result

Selected option: bignumber.js.

Reason retained: active maintenance, strong adoption signal, robust TS support, and manageable bundle size for the required operations.

## Decision Closed: Save Format and Migration Strategy

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| Plain JSON payload + explicit schemaVersion + manual migrators | Web standard; no package maintenance risk. | 0 KB dependency cost. | Strong fit for long-lived saves and player-facing export/import strings. Works naturally with idb-keyval and base64 export flows. BigNumber values should be serialized as canonical strings. | N/A (platform standard) |
| superjson + schemaVersion + migrators | Active. npm 2.2.6 published 8 months ago. GitHub latest commit last month. Repo snapshot: Issues 21, PRs 25. Weekly downloads: 8,187,513. | Bundlephobia API: 10.77 KB minified, 3.91 KB gzip. | Great when you need richer non-JSON types without manual mapping. For this game, still requires explicit handling conventions for bignumber.js objects via custom serializers. | MIT |
| @msgpack/msgpack + schemaVersion + migrators | Active. npm 3.1.3 published 7 months ago. GitHub latest commit 2 weeks ago. Repo snapshot: Issues 18, PRs 5. Weekly downloads: 4,311,647. | Bundlephobia API endpoint returned 503 during research. | Good for compact binary payloads and fast encode/decode. Clipboard/export UX becomes less transparent (needs base64 wrapping), and debugging/manual recovery is less convenient than JSON. | ISC |
| zipson (compressed JSON-style) + schemaVersion + migrators | Low activity. npm 0.2.12 published 6 years ago. GitHub latest commit 3 years ago. Repo snapshot: Issues 11, PRs 3. Weekly downloads: 14,352. | Bundlephobia API endpoint returned 503 during research. | Can reduce save string size, but maintenance staleness adds risk for a core persistence path. Precision defaults require careful configuration to avoid unwanted float reduction behavior. | MIT |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- superjson: 8,187,513 last week; 33,195,093 last month.
- @msgpack/msgpack: 4,311,647 last week; 16,677,517 last month.
- zipson: 14,352 last week; 81,389 last month.

### Recommendation

I would lean toward plain JSON payloads with explicit schemaVersion and manual migration steps per version because it keeps your persistence layer transparent, debuggable, and dependency-light while matching your existing base64 export/import UX. Final call is yours.

### Result

Selected option: Plain JSON + schemaVersion + manual migrators.

### What would change this recommendation

- Choose superjson if you decide to persist more rich runtime types and want to reduce custom serializer code.
- Choose @msgpack/msgpack if save payload size and binary transport efficiency become priority constraints over human readability.
- Choose zipson only if you need aggressive string-size reduction and are comfortable accepting a slower-maintained dependency.

## Next Decision to Make: Test Strategy for Deterministic Economy and Tick Simulation

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| Vitest | Active. npm 4.1.10; repo updated within hours. GitHub snapshot: Issues 326, PRs 74, stars 16.9k. Weekly downloads: 84,959,096. | Bundlephobia endpoint returned 503 during research. Dev-only dependency. | Best fit with Vite + TypeScript stack. Fast watch mode, strong mocking, and straightforward setup for deterministic tick/economy unit tests and store integration tests. | MIT |
| Jest | Active. npm 30.4.2; latest release 2 months ago; repo updated last month. GitHub snapshot: Issues 165, PRs 65, stars 45.5k. Weekly downloads: 46,751,491. | Bundlephobia returned 422 for package endpoint. Dev-only dependency. | Mature ecosystem and broad familiarity, but Vite integration is less native and usually needs extra config layers in this stack. | MIT |
| Mocha | Active. npm 11.7.6; repo updated within days. GitHub snapshot: Issues 201, PRs 46, stars 22.9k. Weekly downloads: 14,791,710. | Bundlephobia API: 192.73 KB minified, 66.66 KB gzip. Dev-only dependency. | Very flexible low-level runner, but requires assembling assertion/mocking stack and more wiring for TS + Vite projects. | MIT |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- vitest: 84,959,096 last week; 331,015,977 last month.
- jest: 46,751,491 last week; 181,381,599 last month.
- mocha: 14,791,710 last week; 58,570,925 last month.

### Recommendation

I would lean toward Vitest for this project because it aligns directly with your Vite + TypeScript stack and lowers setup friction while still covering deterministic simulation tests, selector tests, and persistence migration tests. Final call is yours.

### Result

Selected option: Vitest.

### What would change this recommendation

- Choose Jest if your team has strong existing Jest tooling and shared test utilities that would accelerate delivery more than Vite-native integration.
- Choose Mocha if you explicitly want a minimal runner and prefer composing your own testing stack around bespoke conventions.

## Decision Closed: Runtime Schema Validation Library

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| Zod | Very active. npm 4.4.3 latest. GitHub latest commit last month. Snapshot: Issues 119, PRs 223, stars 43.4k. Weekly downloads: 245,639,357. | Bundlephobia API: 281,328 minified, 61,791 gzip. | Excellent DX and ecosystem for validating imported save payloads and migration inputs. Heaviest bundle among candidates if used in shipped client paths. | MIT |
| Valibot | Active. npm 1.4.2 latest (last month). GitHub latest commit 2 days ago. Snapshot: Issues 79, PRs 82, stars 8.9k. Weekly downloads: 16,029,576. | Bundlephobia API: 85,544 minified, 14,738 gzip. | Strong fit for browser idle game: significantly lighter than Zod, TS-first, and good parse/safeParse ergonomics for save import and migration boundary checks. | MIT |
| ArkType | Active. npm 2.2.3 latest (3 weeks ago). GitHub latest commit 3 weeks ago. Snapshot: Issues 238, PRs 17, stars 7.8k. Weekly downloads: 1,410,849. | Bundlephobia API: 151,905 minified, 45,825 gzip. | Powerful type-level ergonomics, but comparatively steeper learning curve and heavier than Valibot for this use case. | MIT |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- zod: 245,639,357 last week; 975,019,949 last month.
- valibot: 16,029,576 last week; 62,235,685 last month.
- arktype: 1,410,849 last week; 5,286,857 last month.

### Recommendation

I would lean toward Valibot for this project because it provides solid TypeScript-first schema validation with materially lower bundle impact for a client-only game while still handling save import and migration guardrails cleanly. Final call is yours.

### Result

Selected option: Zod.

### What would change this recommendation

- Choose Zod if maximum ecosystem familiarity and third-party integration breadth matters more than client bundle footprint.
- Choose ArkType if your team strongly prefers its type-expression style and is comfortable with the extra complexity.

## Decision Closed: Number Display Formatting Strategy

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| Built-in Intl.NumberFormat + custom suffix formatter for extreme magnitudes | Web platform standard; no package lifecycle risk. | 0 KB dependency cost. | Strong default for a client-only idle game: fast localized formatting for normal ranges, plus custom late-game notation (for example scientific/engineering/aa-ab style) layered on top of bignumber.js values. | N/A (platform standard) |
| d3-format | Active. npm 3.1.2 published 6 months ago; repo release 6 months ago. GitHub snapshot: Issues 10, PRs 5, stars 644. Weekly downloads: 74,560,924. | Bundlephobia endpoint returned 503 during research. | Excellent format-specifier model for consistent number rendering; good if you want expressive formatting strings. Less opinionated for idle-game notation progression, so custom glue code is still needed. | ISC |
| numbro | Lower activity cadence. npm 2.5.0 latest; GitHub latest commit 2 years ago. Snapshot: Issues 204, PRs 65, stars 1.1k. Weekly downloads: 720,278. | Bundlephobia endpoint returned 503 during research. | Includes many human-readable formatting helpers, but slower maintenance makes it riskier as a core UX dependency for a long-lived project. | MIT |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- d3-format: 74,560,924 last week; 289,069,617 last month.
- numbro: 720,278 last week; 3,047,675 last month.

### Recommendation

I would lean toward built-in Intl.NumberFormat plus a small custom notation layer for extreme values because it avoids dependency risk, minimizes bundle impact, and gives you full control over idle-specific large-number readability. Final call is yours.

### Result

Selected option: built-in Intl.NumberFormat plus a small custom notation layer.

### Source freshness note

Research snapshot is current as of 2026-07-29. Re-verify package activity and size data before implementation if this decision is revisited later.

### What would change this recommendation

- Choose d3-format if you want declarative format specifiers throughout the UI and are comfortable adding a dependency for formatter ergonomics.
- Choose numbro only if you specifically prefer its formatting API and accept the lower recent maintenance cadence.

## Decision Closed: End-to-End Browser Test Framework

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| Playwright | Very active. npm 1.62.0; latest release 5 days ago; repo updated minutes ago. GitHub snapshot: Issues 144, PRs 10, stars 93.7k. Weekly downloads: 68,386,573. | Bundlephobia API: 3,766,268 minified, 5,020 gzip (package metadata is not fully representative of browser binaries). | Strong fit for deterministic idle-game smoke tests (save/load flow, autosave integrity, long-session tick checks). Excellent tracing and cross-browser coverage with TS-friendly setup. | Apache-2.0 |
| Cypress | Very active. npm 15.19.0; latest release last week; repo updated minutes ago. GitHub snapshot: Issues about 1k, PRs 66, stars 50.6k. Weekly downloads: 7,782,859. | Bundlephobia API: 494 minified, 328 gzip (not representative of installed runtime footprint). | Mature ecosystem and good DX, but cross-browser and long-running deterministic checks are often less straightforward for this exact idle-game test profile than Playwright's model. | MIT |
| WebdriverIO | Active. npm 9.30.0; latest release last week; repo updated minutes ago. GitHub snapshot: Issues 233, PRs 118, stars 9.8k. Weekly downloads: 3,229,103. | Bundlephobia endpoint returned 503 during research. | Very flexible and powerful, especially for broader automation stacks, but higher setup complexity than needed for focused browser smoke/regression tests in this project. | MIT |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- playwright: 68,386,573 last week; 277,974,428 last month.
- cypress: 7,782,859 last week; 30,531,343 last month.
- webdriverio: 3,229,103 last week; 12,668,836 last month.

### Recommendation

I would lean toward Playwright for this project because it matches your TypeScript workflow, handles deterministic multi-browser smoke testing well, and provides robust tracing for debugging economy/save regressions. Final call is yours.

### Result

Selected option: Playwright.

### Source freshness note

Research snapshot is current as of 2026-07-29. Re-verify package activity and footprint details if this decision is revisited later.

### What would change this recommendation

- Choose Cypress if your team strongly prefers its interaction model and you are prioritizing a familiar single-framework UI testing workflow over broader cross-browser parity.
- Choose WebdriverIO if you later need a more extensible multi-service automation stack beyond current project scope.

## Decision Closed: Production Error Telemetry Strategy

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| No third-party telemetry (local-only logs + optional manual export) | No package maintenance dependency. | 0 KB dependency cost. | Maximum privacy and minimal bundle impact. Best if you do not need centralized crash visibility and can rely on manual bug reports/exported diagnostics. | N/A (no package) |
| @sentry/browser | Very active. npm 10.69.0 released hours ago. GitHub updated minutes ago. Snapshot: Issues 599, PRs 60, stars 8.7k. Weekly downloads: 29,373,117. | Bundlephobia endpoint returned 503 during research. | Strong browser SDK ecosystem and good TS support. Excellent for capturing runtime errors around save/import/migration flows in production builds. Note: service usage follows Sentry SaaS/self-host terms beyond SDK license. | MIT SDK |
| @bugsnag/js | Active. npm 8.10.0 released 3 weeks ago. GitHub updated last week. Snapshot: Issues 55, PRs 25, stars 894. Weekly downloads: 1,174,993. | Bundlephobia endpoint returned 503 during research. | Mature commercial error-reporting option with broad framework plugins. Lower adoption signal than Sentry in this stack segment, but still viable for centralized client crash monitoring. Note: service usage follows Bugsnag commercial terms beyond SDK license. | MIT SDK |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- @sentry/browser: 29,373,117 last week; 116,565,084 last month.
- @bugsnag/js: 1,174,993 last week; 4,792,988 last month.

### Recommendation

I would lean toward no third-party telemetry for initial release if privacy and dependency minimization are top priorities, then revisit Sentry once live-player debugging needs justify the trade-off. If you already expect broad external testing quickly, I would lean directly to @sentry/browser instead. Final call is yours.

### Result

Selected option: no third-party telemetry (local-only logs + optional manual export).

### Source freshness note

Research snapshot is current as of 2026-07-29. Re-verify package activity and pricing/terms if this decision is revisited later.

### What would change this recommendation

- Choose @sentry/browser if post-release debugging velocity and centralized crash triage become immediate priorities.
- Choose @bugsnag/js if your team already uses Bugsnag tooling elsewhere and wants operational consistency.

## Decision Closed: Client Diagnostics Logging Utility Strategy

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| No logging dependency (native console wrapper in app code) | No external package maintenance risk. | 0 KB dependency cost. | Best for strict dependency minimization. You can still gate logs by build mode and expose a simple exportable diagnostics buffer for player bug reports. | N/A (no package) |
| loglevel | Stable but slower cadence. npm 1.9.2 (latest); GitHub latest commit 2 years ago. Snapshot: Issues 17, PRs 2, stars 2.7k. Weekly downloads: 21,382,217. | Bundlephobia API: 3,331 minified, 1,418 gzip. | Very lightweight and browser-friendly log levels. Good fit if you want a tiny dependency for toggled verbosity without extra formatting features. | MIT |
| consola | Active. npm 3.4.2; GitHub latest commit 5 months ago. Snapshot: Issues 40, PRs 51, stars 7.3k. Weekly downloads: 53,328,461. | Bundlephobia API: 6,346 minified, 2,475 gzip. | Richer logging UX and reporters, including browser build paths. Useful if you want structured dev/support logs beyond basic level toggles. | MIT |
| debug | Mature and active enough for broad ecosystem use. npm 4.4.3; GitHub latest commit 4 months ago. Snapshot: Issues 60, PRs 30, stars 11.4k. Weekly downloads: 677,494,411. | Bundlephobia API: 5,969 minified, 2,477 gzip. | Namespace-based logging is powerful, but ergonomics are oriented around DEBUG namespace toggles rather than app-level player support flows. | MIT |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- loglevel: 21,382,217 last week; 82,027,415 last month.
- consola: 53,328,461 last week; 218,781,300 last month.
- debug: 677,494,411 last week; 2,773,835,275 last month.

### Recommendation

I would lean toward no logging dependency and a small in-app console wrapper first, because it aligns with your no-third-party-telemetry choice and keeps the runtime footprint minimal while still enabling exportable diagnostics when needed. Final call is yours.

### Result

Selected option: no logging dependency (native console wrapper in app code).

### Source freshness note

Research snapshot is current as of 2026-07-29. Re-verify maintenance and size data before implementation if this decision is revisited later.

### What would change this recommendation

- Choose loglevel if you want minimal overhead but prefer a proven, off-the-shelf log-level API.
- Choose consola if support workflows require richer formatting/reporters in development builds.
- Choose debug if your team strongly prefers namespace-driven logging conventions.

## Decision Closed: Timer and Date Formatting Utility Strategy

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| No date library dependency (Intl.DateTimeFormat + app-level duration formatter) | No package lifecycle risk. | 0 KB dependency cost. | Strong fit for this project: timer UI mostly needs duration formatting (playtime, cycle timers) and occasional timestamp labels. Native Intl handles locale for absolute times; custom duration formatter keeps control over idle-specific readability. | N/A (platform standard) |
| dayjs | Active. npm 1.11.21 latest (2 months ago). GitHub latest commit last month. Snapshot: Issues 968, PRs 322, stars 48.7k. Weekly downloads: 63,949,121. | Bundlephobia API: 7,123 minified, 3,037 gzip. | Familiar API and good plugin ecosystem. Useful if you want concise date formatting APIs beyond what Intl gives directly. | MIT |
| date-fns | Active. npm 4.4.0 latest (2 months ago). GitHub latest commit last month. Snapshot: Issues 664, PRs 319, stars 36.6k. Weekly downloads: 96,114,380. | Bundlephobia endpoint returned 503 during research. | Functional, tree-shakeable utility style with excellent TS support; strong choice if you prefer pure function helpers over chain APIs. | MIT |
| luxon | Active-moderate. npm 3.7.2 latest (about 10 months ago). GitHub latest commit 3 months ago. Snapshot: Issues 161, PRs 33, stars 16.4k. Weekly downloads: 36,380,333. | Bundlephobia API: 69,777 minified, 21,914 gzip. | Richer timezone and calendar capabilities, but heavier than alternatives and likely beyond initial needs for this idle game. | MIT |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- dayjs: 63,949,121 last week; 258,197,865 last month.
- date-fns: 96,114,380 last week; 395,830,824 last month.
- luxon: 36,380,333 last week; 140,529,384 last month.

### Recommendation

I would lean toward no date library dependency at first, using Intl.DateTimeFormat for timestamps and a small in-app duration formatter for playtime/cycle counters, because it keeps bundle/runtime complexity low and matches your existing no-extra-dependency decisions. Final call is yours.

### Result

Selected option: no date library dependency (Intl.DateTimeFormat + in-app duration formatter).

### Source freshness note

Research snapshot is current as of 2026-07-29. Re-verify package activity and size details if this decision is revisited later.

### What would change this recommendation

- Choose date-fns if your UI starts needing many reusable date/time transforms beyond simple timers and labels.
- Choose dayjs if your team prefers chain-style date APIs and plugin-based extension.
- Choose luxon if timezone-heavy presentation requirements become central to player-facing UX.

## Decision Closed: UI Animation Utility Strategy

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| No animation dependency (CSS transitions/keyframes + tiny app helpers) | No package lifecycle risk. | 0 KB dependency cost. | Strong fit for current scope if animations stay lightweight (button feedback, panel transitions, simple number pop effects). Keeps runtime lean and avoids another core UI dependency. | N/A (platform standard) |
| motion (motion/react) | Very active. npm 12.43.0 latest. GitHub latest commit yesterday. Snapshot: Issues 107, PRs 5, stars 33.0k. Weekly downloads: 16,754,366. | Bundlephobia API: 135,634 minified, 45,307 gzip. | Modern React-first API from the Motion project. Good fit if you want declarative component animation for panel changes and polished interaction effects with less custom CSS glue code. | MIT |
| framer-motion | Very active. npm 12.43.0 latest. GitHub latest commit yesterday (same upstream project as Motion). Weekly downloads: 41,356,690. | Bundlephobia API: 184,130 minified, 62,090 gzip. | Mature and widely adopted. In this stack, Motion is the newer package direction; framer-motion still works but is generally heavier than motion in current size snapshots. | MIT |
| gsap | Active-moderate. npm 3.15.0 latest (about 3 months ago). GitHub latest commit about 3 months ago. Snapshot: Issues 5, PRs 1, stars 27.2k. Weekly downloads: 4,210,505. | Bundlephobia endpoint returned 503 during research. | Extremely capable timeline engine and cross-framework tooling. Likely overpowered for initial idle-game UI unless you expect complex chained sequences and advanced choreography early. | Standard License (non-MIT; see gsap.com/standard-license) |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- motion: 16,754,366 last week; 63,874,081 last month.
- framer-motion: 41,356,690 last week; 166,286,575 last month.
- gsap: 4,210,505 last week; 16,544,230 last month.

### Recommendation

I would lean toward no animation dependency for first implementation, then reassess after core loop UX is playable; this keeps complexity low and aligns with your dependency-minimization choices so far. If you want a library now, I would lean toward motion over framer-motion for the newer package direction and smaller current footprint. Final call is yours.

### Result

Selected option: no animation dependency (CSS transitions/keyframes + tiny app helpers).

### Source freshness note

Research snapshot is current as of 2026-07-29. Re-verify package activity, bundle size, and GSAP license terms before implementation if this decision is revisited later.

### What would change this recommendation

- Choose motion if interaction polish becomes a priority early and custom CSS animation code starts spreading across many components.
- Choose framer-motion if your team already has strong existing patterns with its API and migration cost is near zero.
- Choose gsap if you need advanced timeline choreography, sequencing control, or animation tooling beyond what declarative React animation covers.

## Decision Closed: Keyboard Shortcut Utility Strategy

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| No shortcut dependency (native KeyboardEvent handling in app code) | No external package maintenance risk. | 0 KB dependency cost. | Strong fit if shortcut scope stays small (for example: toggle panel, confirm action, open settings). Requires careful in-app handling for focus rules, key repeat, and input-field exclusion. | N/A (platform standard) |
| tinykeys | Active. npm 4.0.0 latest (about 6 months ago). GitHub latest commit 2 months ago. Snapshot: stars 4.1k, PRs 6. Weekly downloads: 306,598. | Bundlephobia API: 1,899 minified, 1,046 gzip. | Excellent low-footprint option for custom keymaps in a browser game. Good control over sequence bindings and platform modifier behavior without React-specific abstractions. | MIT |
| react-hotkeys-hook | Active. npm 5.3.3 latest (about 1 month ago). GitHub latest commit last week. Snapshot: Issues 18, PRs 14, stars 3.5k. Weekly downloads: 4,021,403. | Bundlephobia API: 7,946 minified, 2,974 gzip. | React-native hook ergonomics with scopes and provider pattern. Best fit if you want shortcuts declared per component with minimal wiring and TS-friendly options. | MIT |
| hotkeys-js | Active. npm 4.0.4 latest (about 3 months ago). GitHub latest commit 2 months ago. Snapshot: stars 7.1k, Issues 135, PRs 26. Weekly downloads: 1,429,949. | Bundlephobia API: 7,682 minified, 3,376 gzip. | Mature and framework-agnostic with broad key syntax support. Strong candidate if you want one centralized shortcut layer shared across non-React contexts too. | MIT |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- tinykeys: 306,598 last week; 1,147,323 last month.
- react-hotkeys-hook: 4,021,403 last week; 15,074,217 last month.
- hotkeys-js: 1,429,949 last week; 5,389,690 last month.

### Recommendation

I would lean toward no shortcut dependency first if your initial hotkey set is small and stable, because it keeps bundle complexity minimal and matches your current dependency-light direction. If you want a package now, I would lean toward tinykeys for the best size-to-capability ratio in a browser idle game. Final call is yours.

### Result

Selected option: react-hotkeys-hook.

### Source freshness note

Research snapshot is current as of 2026-07-29. Re-verify package activity and size signals if this decision is revisited later.

### What would change this recommendation

- Choose react-hotkeys-hook if your shortcut definitions become highly component-scoped and you want provider-based scope toggling in React.
- Choose hotkeys-js if you prefer a mature, centralized, framework-agnostic hotkey registry.
- Choose tinykeys directly if you decide to adopt a dependency now but still prioritize very low footprint.

## Decision Closed: Toast and Notification Utility Strategy

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| No toast dependency (small in-app notification queue) | No package maintenance risk. | 0 KB dependency cost. | Good fit if notifications remain simple and infrequent (for example milestone unlocks, save/import status, error banners). Requires building queueing, dismissal, and accessibility behavior yourself. | N/A (platform standard) |
| react-hot-toast | Active-moderate. npm 2.6.0 latest (about 11 months ago). GitHub latest commit about 11 months ago. Snapshot: Issues 115, PRs 28, stars 11.0k. Weekly downloads: 3,724,875. | Bundlephobia API: 12,181 minified, 4,835 gzip. | Lightweight and popular with strong DX for simple app-wide toasts. Good fit for quick integration in React without large runtime overhead. | MIT |
| sonner | Active-moderate. npm 2.0.7 latest (about 12 months ago). GitHub latest commit about 7 months ago. Snapshot: Issues 52, PRs 35, stars 12.7k. Weekly downloads: 44,345,528. | Bundlephobia API: 34,219 minified, 9,390 gzip. | Polished default visuals and clean API. Good fit if you want high-quality notification UX out of the box with minimal styling work. | MIT |
| notistack | Active-moderate. npm 3.0.2 latest (about 18 months ago). GitHub repo has slower code activity; README/docs updates more recent. Snapshot: Issues 53, PRs 14, stars 4.1k. Weekly downloads: 1,908,424. | Bundlephobia endpoint returned 503 during research. | Flexible stacked snackbar model and stable API. Viable if you want queue-heavy snackbar flows, but current activity cadence is slower than other options. | MIT |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- react-hot-toast: 3,724,875 last week; 14,962,970 last month.
- sonner: 44,345,528 last week; 190,311,577 last month.
- notistack: 1,908,424 last week; 7,289,942 last month.

### Recommendation

I would lean toward no toast dependency initially if your first milestone only needs a small number of system messages, to stay aligned with your dependency-minimization path. If you want a dedicated library now, I would lean toward react-hot-toast for a lighter footprint and mature usage pattern, while sonner is stronger when visual polish is the top priority. Final call is yours.

### Result

Selected option: sonner.

### Source freshness note

Research snapshot is current as of 2026-07-29. Re-verify package activity and bundle metrics before implementation if this decision is revisited later.

### What would change this recommendation

- Choose sonner if premium default styling and interaction polish are more important than smaller package size.
- Choose react-hot-toast if you want the smallest practical React toast dependency with broad adoption.
- Choose notistack if your UX specifically needs stacked queue semantics and fine-grained snackbar lifecycle control.

## Decision Closed: Modal and Dialog Utility Strategy

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| No dialog dependency (in-app portal + focus trap + scroll lock) | No package maintenance risk. | 0 KB dependency cost. | Viable if overlay scope stays minimal. You must implement and maintain accessibility details yourself (focus return, aria attributes, escape handling, inert background, scroll locking). | N/A (platform standard) |
| @radix-ui/react-dialog | Very active. npm 1.1.23 latest. GitHub primitives repo updated yesterday. Snapshot: Issues 183, PRs 123, stars 19.1k. Weekly downloads: 68,453,597. | Bundlephobia API: 37,942 minified, 12,585 gzip. | Strong accessibility defaults with composable primitives. Excellent fit for React + Tailwind stack when you want reliable focus and portal behavior without full component framework lock-in. | MIT |
| @headlessui/react (Dialog) | Active. npm 2.2.10 latest (about 3 months ago). GitHub latest commit about 3 months ago. Snapshot: Issues 81, PRs 24, stars 28.7k. Weekly downloads: 7,068,428. | Bundlephobia API: 209,422 minified, 62,986 gzip (full package footprint). | Great Tailwind-oriented DX and accessible patterns, but brings a broader component set when you may only need dialogs right now. | MIT |
| @ariakit/react (Dialog) | Very active. npm 0.4.35 latest. GitHub repo updated within hours. Snapshot: Issues 31, PRs 4, stars 8.6k. Weekly downloads: 1,179,951. | Bundlephobia endpoint returned 503 during research. | Highly accessible toolkit with fine-grained control and strong dialog primitives. Good fit if you anticipate deeper accessibility-heavy UI patterns beyond dialogs. | MIT package (repo also contains non-package directories with different licenses) |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- @radix-ui/react-dialog: 68,453,597 last week; 277,907,029 last month.
- @headlessui/react: 7,068,428 last week; 28,453,521 last month.
- @ariakit/react: 1,179,951 last week; 4,294,362 last month.

### Recommendation

I would lean toward no dialog dependency initially only if you are sure overlays remain simple and few. If you want a dependency now, I would lean toward @radix-ui/react-dialog for the best balance of accessibility reliability, focused scope, and fit with your current React + Tailwind stack. Final call is yours.

### Result

Selected option: @radix-ui/react-dialog.

### Source freshness note

Research snapshot is current as of 2026-07-29. Re-verify package activity and bundle signals if this decision is revisited later.

### What would change this recommendation

- Choose @headlessui/react if you expect to adopt several Headless UI components beyond dialog and want one consistent API family.
- Choose @ariakit/react if your UI roadmap has stronger accessibility complexity and you want a deeper toolkit approach.
- Choose no dependency if you decide strict dependency minimization outweighs implementation and maintenance cost for a11y behaviors.

## Decision Closed: Icon Library Strategy

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| No icon dependency (inline SVG assets in app) | No package maintenance risk. | 0 KB dependency cost. | Strong fit if icon count stays small and curated. Requires manual asset handling and consistency work for sizing/stroke style across UI. | N/A (project-owned assets) |
| lucide-react | Very active. npm 1.27.0 latest. GitHub repo latest commit 4 days ago. Snapshot: Issues 282, PRs 267, stars 23.7k. Weekly downloads: 84,783,669. | Bundlephobia API: 635,198 minified, 159,381 gzip (full package; typically tree-shaken per icon import). | Excellent fit with React + Tailwind. Large icon set, clean stroke style, and common adoption. Works well if you import icons individually to keep shipped footprint low. | ISC |
| @heroicons/react | Active-moderate. npm 2.2.0 latest (about 2 years ago). GitHub latest commit 2 months ago. Snapshot: PRs 3, stars 23.7k. Weekly downloads: 3,835,639. | Bundlephobia endpoint returned 503 during research. | Good visual match with Tailwind ecosystem and straightforward usage. Update cadence is slower, but package remains widely used and stable. | MIT |
| @phosphor-icons/react | Active-moderate. npm 2.1.10 latest (about 14 months ago). GitHub latest commit about 6 months ago. Snapshot: Issues 15, PRs 5, stars 1.7k. Weekly downloads: 2,778,506. | Bundlephobia endpoint returned 503 during research. | Flexible multi-weight icon style can be useful for stateful UI emphasis, but package breadth can impact dev tooling unless imports are kept granular. | MIT |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- lucide-react: 84,783,669 last week; 357,800,751 last month.
- @heroicons/react: 3,835,639 last week; 15,032,628 last month.
- @phosphor-icons/react: 2,778,506 last week; 10,430,448 last month.

### Recommendation

I would lean toward lucide-react for this project because it balances active maintenance, very strong adoption, and easy React + Tailwind integration while still allowing tree-shaken per-icon imports. If you want maximum dependency minimization, no icon package is still a valid option for a tightly scoped icon set. Final call is yours.

### Result

Selected option: lucide-react.

### Source freshness note

Research snapshot is current as of 2026-07-29. Re-verify package activity and size signals if this decision is revisited later.

### What would change this recommendation

- Choose @heroicons/react if you want strict visual alignment with the Tailwind/Headless UI ecosystem and do not need frequent icon-pack updates.
- Choose @phosphor-icons/react if multiple icon weights are central to your UI language and state expression.
- Choose no icon dependency if icon scope remains small and you prefer full asset control over package convenience.

## Decision Closed: Clipboard Copy Utility Strategy

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| No dependency (native navigator.clipboard + app fallback handling) | No package lifecycle risk. | 0 KB dependency cost. | Strong fit if you only need copy-to-clipboard for save/export strings and can maintain your own secure-context checks plus fallback UX messaging. | N/A (platform standard) |
| copy-to-clipboard | Active. npm 4.0.2 latest (about 7 months ago). GitHub latest commit 3 months ago. Snapshot: Issues 8, PRs 8, stars 1.4k. Weekly downloads: 11,727,083. | Bundlephobia API: 3,299 minified, 1,551 gzip. | Good browser-focused option with async Clipboard API path and fallback behavior. Strong fit for reliable copy actions in save export flows. | MIT |
| clipboard-copy | Low activity. npm 4.0.1 latest (about 6 years ago). GitHub latest commit about 6 years ago. Snapshot: Issues 4, PRs 3, stars 633. Weekly downloads: 595,794. | Bundlephobia API: 862 minified, 484 gzip. | Extremely small footprint and simple API. Viable if you only target modern copy path behavior and accept slower maintenance cadence. | MIT |
| clipboard (clipboard.js) | Low activity. npm 2.0.11 latest (about 4 years ago). GitHub latest commit about 4 years ago. Snapshot: Issues 11, PRs 5, stars 34.1k. Weekly downloads: 2,225,963. | Bundlephobia endpoint returned 503 during research. | Historically popular and event-driven, but older architecture and slower maintenance make it less attractive for new React app code unless specific legacy behavior is required. | MIT |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- copy-to-clipboard: 11,727,083 last week; 47,253,059 last month.
- clipboard-copy: 595,794 last week; 2,305,329 last month.
- clipboard: 2,225,963 last week; 8,992,873 last month.

### Recommendation

I would lean toward no dependency first if you are comfortable implementing a small, tested clipboard helper around navigator.clipboard for your export UX. If you prefer an off-the-shelf package now, I would lean toward copy-to-clipboard for the best balance of maintenance activity, adoption, and fallback support. Final call is yours.

### Result

Selected option: no dependency (native navigator.clipboard + app fallback handling).

### Source freshness note

Research snapshot is current as of 2026-07-29. Re-verify package activity and size signals if this decision is revisited later.

### What would change this recommendation

- Choose copy-to-clipboard if you want ready-made fallback behavior and less custom browser edge-case code.
- Choose clipboard-copy if absolute minimum dependency size is the top priority and your browser support target is modern-only.
- Choose clipboard (clipboard.js) only if you need its specific event/delegation model or legacy compatibility patterns.

## Decision Closed: Class Composition Utility Strategy

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| No dependency (template strings / arrays / helper function in app code) | No package maintenance risk. | 0 KB dependency cost. | Works for small UI scope, but conditional Tailwind class handling can get noisy as components grow and variant combinations increase. | N/A (app code) |
| clsx | Active-moderate. npm 2.1.1 latest (about 2 years ago). GitHub latest commit 2 years ago. Snapshot: Issues 8, PRs 9, stars 9.8k. Weekly downloads: 105,492,854. | Bundlephobia API: 563 minified, 353 gzip. | Excellent low-cost default for conditional class strings in React components. Very small footprint and straightforward API. | MIT |
| classnames | Active and stable. npm 2.5.1 latest (about 2 years ago). GitHub latest commit 2 days ago (docs/maintenance updates). Snapshot: Issues 4, PRs 7, stars 17.8k. Weekly downloads: 31,477,086. | Bundlephobia API: 832 minified, 474 gzip. | Mature, widely understood utility with stable behavior. Slightly larger than clsx but still tiny; good if your team already prefers this API. | MIT |
| clsx + tailwind-merge | clsx status above; tailwind-merge is active (npm 3.6.0, latest release 2 months ago; repo updated 2 weeks ago). tailwind-merge snapshot: Issues 23, PRs 5, stars 5.7k. Weekly downloads: 77,687,665. | Bundlephobia API: clsx 563/353 + tailwind-merge 28,708/8,964 (approx combined 29,271 minified, 9,317 gzip before tree-shaking). | Best fit when Tailwind class conflicts are common (variant-heavy components). clsx builds conditionals; tailwind-merge resolves conflicting utilities deterministically. | MIT + MIT |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- clsx: 105,492,854 last week; 442,843,885 last month.
- classnames: 31,477,086 last week; 123,752,735 last month.
- tailwind-merge: 77,687,665 last week; 304,762,530 last month.

### Recommendation

I would lean toward clsx as the baseline because it keeps your bundle impact negligible while improving readability in conditional Tailwind class assembly. If you start seeing frequent utility conflicts (for example variant systems overriding spacing/color classes), I would then lean toward a small helper that combines clsx with tailwind-merge. Final call is yours.

### Result

Selected option: clsx.

### Source freshness note

Research snapshot is current as of 2026-07-29. Re-verify package activity and size signals if this decision is revisited later.

### What would change this recommendation

- Choose clsx + tailwind-merge immediately if your component library already uses many conflicting Tailwind variants.
- Choose classnames if your team already standardizes on it and migration cost matters more than micro-size differences.
- Choose no dependency only if you want absolute minimal dependencies and are comfortable enforcing class-string conventions manually.

## Decision Closed: Component Variant Utility Strategy

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| No dependency (manual variant maps + clsx helpers) | No package maintenance risk. | 0 KB dependency cost. | Works for small/medium UI scope, but complex button/card/panel variant matrices can become verbose and harder to keep consistent. | N/A (app code) |
| class-variance-authority | Active enough with stable package lineage. npm 0.7.1 latest. GitHub repo currently active with commits 2 days ago. Snapshot: stars 6.9k, PRs 3. Weekly downloads: 54,585,790. | Bundlephobia endpoint returned empty response during research; package homepage advertises small footprint. | Excellent fit for React + Tailwind variant modeling with typed variant contracts. Common pairing with clsx and design-system-style components. | Apache-2.0 |
| tailwind-variants | Active. npm 3.3.0 latest (published recently). GitHub latest commit 3 days ago. Snapshot: Issues 5, PRs 7, stars 3.3k. Weekly downloads: 3,270,610. | Bundlephobia API: 41,792 minified, 13,135 gzip. | Richer feature set (slots, composition, built-in conflict resolution). Strong when components are highly variant-heavy, but larger and more opinionated than CVA-style baseline. | MIT |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- class-variance-authority: 54,585,790 last week; 232,017,180 last month.
- tailwind-variants: 3,270,610 last week; 12,619,071 last month.

### Recommendation

I would lean toward class-variance-authority for this project as the next step beyond clsx because it keeps variant definitions typed and maintainable with modest conceptual overhead. If you anticipate heavy slot-based components and frequent Tailwind conflict resolution inside variant APIs, I would lean toward tailwind-variants instead. Final call is yours.

### Result

Selected option: class-variance-authority.

### Source freshness note

Research snapshot is current as of 2026-07-29. Re-verify package activity and size signals if this decision is revisited later.

### What would change this recommendation

- Choose tailwind-variants if slot-heavy component APIs and built-in Tailwind conflict resolution become immediate needs.
- Choose no dependency if your component set stays simple enough that manual variant maps remain easy to maintain.
- Stay with clsx-only if you prefer delaying variant abstraction until after first playable milestone UI stabilizes.

## Decision Closed: Audio and SFX Utility Strategy

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| No dependency (native HTMLAudioElement/Web Audio wrappers in app code) | No package lifecycle risk. | 0 KB dependency cost. | Best for strict dependency minimization if audio scope stays simple (button clicks, reward pings, short looped BGM). Requires in-app handling for unlock-on-user-gesture, preload policy, and browser playback quirks. | N/A (platform standard) |
| howler | Active-moderate. npm 2.2.4 latest (published ~3 years ago). GitHub latest commit 8 months ago. Snapshot: Issues 364, PRs 51, stars 25.3k. Weekly downloads: 958,533. | Bundlephobia endpoint returned 503 during research. howler README advertises around 7 KB gzipped core in typical usage. | Strong fit for cross-browser playback reliability, global/group controls, and sound sprites. Good balance if you want robust SFX/BGM handling without building your own compatibility layer. | MIT |
| use-sound | Semi-maintained by author statement. npm 5.0.0 latest (last year). GitHub latest commit last year. Snapshot: Issues 37, PRs 23, stars 3.2k. Weekly downloads: 203,388. | Bundlephobia API: main 1,832 minified / 907 gzip, plus async chunk 36,426 minified / 9,656 gzip (loads howler). | React hook DX is excellent for component-local effects and toggles. Good if you prefer declarative hooks and accept semi-maintained cadence plus howler as underlying dependency. | MIT |
| tone | Very active. npm 15.1.22 latest (released 2 weeks ago). GitHub latest commit 2 weeks ago. Snapshot: Issues 48, PRs 11, stars 14.7k. Weekly downloads: 235,940. | Bundlephobia API: 336,893 minified, 76,599 gzip. | Powerful for synthesis, transport scheduling, and procedural music. Likely over-scoped for this project's initial needs (UI SFX + looped tracks) and significantly heavier than other options. | MIT |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- howler: 958,533 last week; 3,591,827 last month.
- use-sound: 203,388 last week; 858,630 last month.
- tone: 235,940 last week; 983,414 last month.

### Recommendation

I would lean toward howler for this project if you want a dedicated audio dependency now, because it gives you reliable browser playback behavior and useful primitives (sprites, fades, group controls) at modest runtime cost. If you want to keep dependencies minimal for first playable, no dependency is still a valid starting point. Final call is yours.

### Result

Selected option: no dependency (native audio helpers).

### Source freshness note

Research snapshot is current as of 2026-07-29. Re-verify package activity and size signals if this decision is revisited later.

### What would change this recommendation

- Choose no dependency if your initial sound scope remains tiny and you prefer owning a minimal helper rather than pulling a package.
- Choose use-sound if your team strongly prefers hook-first React ergonomics and is comfortable with its semi-maintained status.
- Choose tone if procedural synthesis, transport-timed events, or music-tooling depth becomes a core requirement.

## Decision Closed: Offline Support and PWA Caching Strategy

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| No offline/PWA dependency (network-only app + local save only) | No package maintenance risk. | 0 KB dependency cost. | Simplest baseline and lowest complexity. Save persistence via IndexedDB still works, but app shell and static assets are unavailable offline, and reconnect reload behavior is less resilient for long sessions. | N/A (platform standard) |
| vite-plugin-pwa | Active. npm 1.3.0 latest (released this year). GitHub latest release 2 months ago. Snapshot: Issues 166, PRs 20, stars 4.2k. Weekly downloads: 3,989,906. | Bundlephobia endpoint returned 503 during research. Mostly build-time plugin plus generated service worker/runtime registration code. | Strong fit with Vite + React + TypeScript stack. Fast setup for precache/runtime caching, update prompts, and manifest support with minimal boilerplate. | MIT |
| workbox-window (+ custom service worker setup) | Active. npm 7.4.1 latest (recent). Workbox repo latest release 2 months ago. Snapshot: Issues 60, PRs 34, stars 13.0k. Weekly downloads: 8,662,939. | Bundlephobia endpoint returned 503 during research. Runtime client helper only; footprint depends on selected Workbox modules and custom SW logic. | Most flexible and battle-tested path for fine-grained caching policies, but requires more manual setup and maintenance than vite-plugin-pwa in this project. | MIT |
| serwist | Very active. npm 9.5.12 latest (last week). GitHub latest publish commit last week. Snapshot: Issues 8, PRs 1, stars 1.5k. Weekly downloads: 552,685. | Bundlephobia endpoint returned 503 during research. | Modern service-worker toolkit (Workbox-lineage ecosystem) with active cadence and multi-framework tooling. Good option if you want deeper SW control and actively evolving APIs, at the cost of additional integration decisions. | MIT |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- vite-plugin-pwa: 3,989,906 last week; 15,616,229 last month.
- workbox-window: 8,662,939 last week; 35,160,842 last month.
- serwist: 552,685 last week; 2,194,108 last month.

### Recommendation

I would lean toward vite-plugin-pwa for this project because it matches your existing Vite stack and gives practical offline shell caching with less implementation overhead than hand-rolled Workbox integration. If you want to defer offline behavior until after first playable, no offline dependency is still a valid near-term choice. Final call is yours.

### Result

Selected option: no offline/PWA dependency (network-only app + local save only).

### Source freshness note

Research snapshot is current as of 2026-07-29. Re-verify package activity and size signals if this decision is revisited later.

### What would change this recommendation

- Choose no offline/PWA dependency if first-playable speed and lowest maintenance are higher priority than offline resilience.
- Choose workbox-window + custom SW if you need strict, bespoke caching/versioning policies beyond plugin defaults.
- Choose serwist if you want a rapidly evolving SW toolkit and are comfortable with additional integration complexity.

## Decision Closed: Form State Utility Strategy

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| No form-state dependency (native controlled/uncontrolled React inputs + small helpers) | No package maintenance risk. | 0 KB dependency cost. | Strong fit if form scope stays limited (save import field, settings toggles, confirmation inputs). Keeps runtime lean and aligns with your dependency-minimization path. | N/A (app code) |
| react-hook-form | Very active. npm 7.83.0 latest (published recently). GitHub latest commit 8 hours ago. Snapshot: Issues 2, PRs 7, stars 44.8k. Weekly downloads: 58,020,262. | Bundlephobia endpoint returned 503 during research. Package highlights small footprint and no runtime dependencies. | Excellent fit for React + TypeScript with high-performance forms, strong DX, and easy integration with Zod validation for import/settings forms. | MIT |
| Formik | Active-moderate. npm 2.4.9 latest (published 8 months ago). GitHub latest commit 8 months ago. Snapshot: Issues 705, PRs 133, stars 34.3k. Weekly downloads: 4,636,813. | Bundlephobia endpoint returned 503 during research. | Mature, widely known API with strong ecosystem. Heavier abstraction and generally more rerender overhead than react-hook-form for frequently updated React UIs. | Apache-2.0 |
| final-form | Active-moderate. npm 5.0.1 latest (published 2 months ago). GitHub latest commit 2 months ago. Snapshot: Issues 87, PRs 17, stars 3.0k. Weekly downloads: 745,916. | Bundlephobia returned 404 for package endpoint during research. Package metadata includes size-limit targets around 6-7 KB for distributed builds. | Framework-agnostic, subscription-based core with good performance characteristics. In React projects it usually pairs with additional bindings and more wiring than react-hook-form. | MIT |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- react-hook-form: 58,020,262 last week; 240,891,182 last month.
- formik: 4,636,813 last week; 18,895,742 last month.
- final-form: 745,916 last week; 2,922,866 last month.

### Recommendation

I would lean toward no form-state dependency for now, because your current UI plan has a small number of forms and this keeps complexity and runtime footprint minimal. If form flows expand (multi-step settings, dense validation, reusable form primitives), I would lean toward react-hook-form next. Final call is yours.

### Result

Selected option: react-hook-form.

### Source freshness note

Research snapshot is current as of 2026-07-29. Re-verify package activity and size signals if this decision is revisited later.

### What would change this recommendation

- Choose react-hook-form if form count and validation complexity grow beyond a few simple inputs and toggles.
- Choose Formik if your team already has Formik conventions/utilities and migration cost is effectively zero.
- Choose final-form if you want a framework-agnostic subscription core and are comfortable with extra React wiring.

## Decision Closed: Routing Strategy

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| No routing dependency (single-page app state routing only) | No package maintenance risk. | 0 KB dependency cost. | Strong fit if app remains a single mounted shell with panel switching in local state only. Lowest complexity, but no URL deep links/back-forward semantics for panel states unless implemented manually. | N/A (app code) |
| react-router-dom | Very active. npm 7.18.2 latest. GitHub react-router repo latest release last week and active commits. Snapshot: Issues 95, PRs 51, stars 56.5k. Weekly downloads: 43,675,483. | Bundlephobia endpoint returned 503 during research. | Proven standard with robust history handling, nested routes, and long-term ecosystem support. Good option if you expect real route structure growth (for example dedicated options/import screens later). | MIT |
| wouter | Active-moderate. npm 3.10.0 latest (published 2 months ago). GitHub latest commit 2 days ago. Snapshot: Issues 28, PRs 2, stars 7.9k. Weekly downloads: 2,113,439. | Bundlephobia endpoint returned 503 during research. Package/repo messaging emphasizes very small footprint (about 2 KB gzipped class of size). | Minimal router with hook-first API and low overhead. Good fit when you want URL-based navigation without adopting a larger routing stack. License is Unlicense (public domain style), not MIT. | Unlicense |
| @tanstack/react-router | Very active. npm 1.170.18 latest (recent). GitHub latest commit 3 days ago and frequent releases. Snapshot: Issues 288, PRs 255, stars 14.9k. Weekly downloads: 21,804,389. | Bundlephobia endpoint returned 503 during research. | Highly type-safe, feature-rich modern router with loaders/search-param typing and strong DX. Powerful but more opinionated/complex than needed for a currently route-light idle game shell. | MIT |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- react-router-dom: 43,675,483 last week; 185,924,588 last month.
- wouter: 2,113,439 last week; 7,862,332 last month.
- @tanstack/react-router: 21,804,389 last week; 88,895,563 last month.

### Recommendation

I would lean toward no routing dependency for the first playable milestone, because your current architecture is a single persistent battle shell with panel switching and this keeps complexity lowest. If you decide URL deep-linking/history semantics are required soon, I would lean next toward react-router-dom for broad ecosystem support. Final call is yours.

### Result

Selected option: react-router-dom.

### Source freshness note

Research snapshot is current as of 2026-07-29. Re-verify package activity and size signals if this decision is revisited later.

### What would change this recommendation

- Choose react-router-dom if you want robust URL navigation, route guards/loaders, and broad team familiarity now.
- Choose wouter if you want URL routing with minimal footprint and are comfortable with a smaller ecosystem and Unlicense terms.
- Choose @tanstack/react-router if end-to-end type-safe route/search-param modeling is a near-term requirement.

## Decision Closed: URL Query Parameter Utility Strategy

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| No dependency (native URLSearchParams + react-router-dom useSearchParams) | Web platform standard + maintained by React Router package lifecycle already in stack. | 0 KB extra dependency cost. | Strong fit for current scope: panel selection, basic filters, and shareable import/settings URLs can be handled with native APIs. Keeps dependency count low and integrates directly with chosen router. | N/A (platform standard) |
| query-string | Active. npm 9.4.1 latest (last month). GitHub latest commit last month. Snapshot: Issues 1, stars 6.9k. Weekly downloads: 23,625,325. | Bundlephobia API: 7,944 minified, 2,778 gzip. | Great ergonomics for parse/stringify options and typed parsing conveniences. Good if your URL state model needs richer coercion and utilities than URLSearchParams alone. | MIT |
| qs | Active. npm 6.15.3 latest (last month). GitHub latest commit 3 weeks ago. Snapshot: Issues 51, PRs 35, stars 8.9k. Weekly downloads: 165,344,415. | Bundlephobia API: 40,907 minified, 12,694 gzip. | Very robust parsing/stringifying, especially nested and edge-case-heavy query data. Likely overpowered/heavier than needed for this client app's expected URL state complexity. | BSD-3-Clause |
| serialize-query-params | Active-moderate. npm 2.0.4 latest (8 months ago). Repo latest commit 8 months ago. Snapshot from use-query-params monorepo: Issues 36, PRs 8, stars 2.2k. Weekly downloads: 865,184. | Bundlephobia endpoint returned 503 during research. | Useful codec layer for typed query params and works well with React query-state patterns. Best when you want schema-like URL param encode/decode primitives. | ISC |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- query-string: 23,625,325 last week; 90,676,776 last month.
- qs: 165,344,415 last week; 682,957,304 last month.
- serialize-query-params: 865,184 last week; 3,413,381 last month.

### Recommendation

I would lean toward no additional dependency and use native URLSearchParams with react-router-dom useSearchParams first, because it covers your likely needs while keeping bundle and complexity down. If URL state becomes more complex and type coercion/codec logic spreads across features, I would lean toward query-string next. Final call is yours.

### Result

Selected option: no dependency (native URLSearchParams + react-router-dom useSearchParams).

### Source freshness note

Research snapshot is current as of 2026-07-29. Re-verify package activity and size signals if this decision is revisited later.

### What would change this recommendation

- Choose query-string if you need richer parse/stringify controls, coercion, and URL utility helpers beyond native behavior.
- Choose qs if you need advanced nested query structures and stronger edge-case handling despite larger footprint.
- Choose serialize-query-params if you want explicit encode/decode codecs for typed query-state modeling.

## Decision Closed: Event Bus Utility Strategy

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| No event-bus dependency (tiny in-app pub/sub helper) | No package maintenance risk. | 0 KB dependency cost. | Strong fit if eventing scope remains small (toasts, diagnostics, occasional cross-feature notifications). Keeps runtime footprint minimal and avoids another abstraction layer. | N/A (app code) |
| mitt | Stable package with high adoption. npm 3.0.1 latest (published 3 years ago). GitHub repository activity is low cadence (latest commit 3 years ago) with open maintenance queue. Weekly downloads: 29,575,276. | Bundlephobia endpoint returned 503 during research. Package/readme advertises ~200 byte footprint. | Very tiny API and TS-friendly generic typing; good if you want minimal pub/sub semantics. Lower recent maintenance cadence is the main trade-off. | MIT |
| eventemitter3 | Active-moderate and heavily adopted. npm 5.0.4 latest (published 6 months ago). GitHub latest commit 6 months ago. Snapshot: Issues 15, PRs 7, stars 3.5k. Weekly downloads: 153,858,220. | Bundlephobia endpoint returned 503 during research. | Robust, high-performance EventEmitter API with broad ecosystem familiarity. Slightly more API surface than needed for simple UI events, but very battle-tested. | MIT |
| nanoevents | Active. npm 10.0.0 latest (published last week). GitHub latest commit last week. Snapshot: stars 1.6k, low issue/PR load. Weekly downloads: 1,096,148. | Bundlephobia endpoint returned 503 during research. Package/readme advertises about 100-byte class footprint. | Minimal modern emitter with clean API and fresh maintenance cadence. Good choice if you want tiny size plus more active recent upkeep than mitt. | MIT |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- mitt: 29,575,276 last week; 114,059,611 last month.
- eventemitter3: 153,858,220 last week; 592,549,855 last month.
- nanoevents: 1,096,148 last week; 4,133,870 last month.

### Recommendation

I would lean toward no event-bus dependency at this stage, because your current architecture can cover likely signal flows with a tiny in-app helper and store actions while staying dependency-light. If you want a package now, I would lean toward nanoevents for the best balance of tiny footprint and active current maintenance. Final call is yours.

### Result

Selected option: no event-bus dependency (tiny in-app pub/sub helper).

### Source freshness note

Research snapshot is current as of 2026-07-29. Re-verify package activity and size signals if this decision is revisited later.

### What would change this recommendation

- Choose nanoevents if you want a very small emitter with active recent updates.
- Choose eventemitter3 if you need a fuller EventEmitter-style API and maximum ecosystem familiarity.
- Choose mitt if you specifically prefer its wildcard event style and minimal API despite slower recent maintenance cadence.

## Decision Closed: Finite-State-Machine Utility Strategy

### Candidate Comparison (2026-07-29 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| No dependency (in-app state machine reducers/guards) | No package maintenance risk. | 0 KB dependency cost. | Strong fit if combat/stage flow remains modest (idle, battling, cooldown, stage advance, boss gate checks) and you keep transition logic centralized in engine/state modules. | N/A (app code) |
| xstate | Very active. npm 5.32.5 latest. GitHub latest release activity last week, active commits, snapshot: Issues 92, PRs 26, stars 29.9k. Weekly downloads: 5,182,386. | Bundlephobia endpoint returned 503 during research. | Most feature-complete option with actors, guards, effects, tooling, and visualization. Excellent for complex orchestration but heavier conceptual and implementation overhead than likely needed for first playable idle loop. | MIT |
| @xstate/fsm | Low activity relative to core xstate. npm 2.1.0 latest (published about 3 years ago). Weekly downloads remain high: 5,384,606 (often ecosystem-driven). | Bundlephobia endpoint returned 503 during research. | Lighter finite-state subset API than full xstate, but older release cadence makes long-term direction less clear versus current xstate core packages. | MIT |
| robot3 | Active-moderate. npm 1.2.0 latest (published about 7 years ago); repository activity continues with latest repo commit about 7 months ago. Weekly downloads: 1,258,941. | Bundlephobia endpoint returned 503 during research. | Functional immutable FSM style with compact API and lower conceptual weight than xstate. Good middle path if you want explicit state modeling without full actor ecosystem. | BSD-2-Clause |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- xstate: 5,182,386 last week; 19,803,295 last month.
- @xstate/fsm: 5,384,606 last week; 20,227,665 last month.
- robot3: 1,258,941 last week; 4,902,862 last month.

### Recommendation

I would lean toward no FSM dependency for the first implementation, because your current combat and progression flow can be expressed clearly with deterministic reducer-style transitions while minimizing abstraction overhead. If flow complexity grows quickly (more concurrent substates, async guards, richer tooling needs), I would lean toward xstate next. Final call is yours.

### Result

Selected option: no FSM dependency (in-app state machine reducers/guards).

### Source freshness note

Research snapshot is current as of 2026-07-29. Re-verify package activity and size signals if this decision is revisited later.

### What would change this recommendation

- Choose xstate if you need actor-model orchestration, richer tooling/visualization, or many interacting state machines soon.
- Choose robot3 if you want a compact functional FSM library without xstate-level ecosystem complexity.
- Choose @xstate/fsm only if its narrower API is a precise fit and you are comfortable with its slower recent release cadence.

## Next Decision to Make: Selector Memoization Strategy

### Candidate Comparison (2026-08-05 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| No selector memoization dependency (Zustand built-in subscriptions + inline derived values) | No package maintenance risk. | 0 KB dependency cost. | Strong fit for current scope: Zustand's selector subscriptions already prevent unnecessary rerenders per subscriber, and inline selectors work well for simple derived values without additional memoization overhead. | N/A (app code) |
| reselect | Active. npm 5.2.0 latest (about 2 months ago). GitHub latest commit 3 days ago. Snapshot: Issues 31, PRs 24, stars 19.0k. Weekly downloads: 42,083,738. | Bundlephobia endpoint returned 503 during research. | Mature, widely adopted input-selector memoization. Good fit if your derived selectors take multiple expensive Zustand slices as input and need reliable referential equality guarantees for deeply nested computed data. | MIT |
| proxy-memoize | Active-moderate. npm 3.0.1 latest (about 2 years ago). GitHub latest commit 3 months ago. Snapshot: Issues 3, stars 858. Weekly downloads: 1,035,975. | Bundlephobia API: 3,150 minified, 1,468 gzip. | Proxy-based auto-tracked memoization; re-runs only if accessed properties changed. Documented Zustand integration example. Good fit for selector granularity without explicit input selector wiring. | MIT |
| re-reselect | Active. npm 5.1.1 latest (released today). GitHub latest commit today. Snapshot: Issues 2, PRs 5, stars 1.1k. Weekly downloads: 373,056. | Bundlephobia endpoint returned 503 during research. | Extends reselect with per-argument caching for selectors called with different IDs/keys. Useful if you have per-entity selectors (for example per-upgrade-slot derived values) but adds complexity. Requires reselect as peer dependency. | MIT |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- reselect: 42,083,738 last week; 160,166,890 last month.
- proxy-memoize: 1,035,975 last week; 4,435,833 last month.
- re-reselect: 373,056 last week; 1,560,200 last month.

### Recommendation

I would lean toward no selector memoization dependency, relying on Zustand's built-in subscription model and inline selector functions, because your current derived value needs (DPS, affordability, stage lock state) are straightforward enough to stay performant without an external memoization layer. If you encounter referential equality churn from complex multi-slice derived objects, I would lean toward reselect next. Final call is yours.

### Result

Selected option: no selector memoization dependency (Zustand built-in subscriptions + inline derived values).

### Source freshness note

Research snapshot is current as of 2026-08-05. Re-verify package activity and size signals if this decision is revisited later.

### What would change this recommendation

- Choose reselect if derived selectors combining multiple Zustand slices begin causing excessive rerenders.
- Choose proxy-memoize if you prefer auto-tracked property access over explicit input selectors, especially with deeply nested state.
- Choose re-reselect if you need per-key cached selectors for entity-level derived values.

## Next Decision to Make: Immutable Update Strategy

### Candidate Comparison (2026-08-05 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| No dependency (plain object spread / immutable patterns in Zustand actions) | No package maintenance risk. | 0 KB dependency cost. | Strong fit if state update complexity stays manageable. Zustand actions using spread syntax are explicit and easily testable. Performance depends on spread depth; can become verbose for deeply nested state slices. | N/A (app code) |
| immer (via Zustand immer middleware) | Very active. npm 11.1.15 latest (3 weeks ago). GitHub latest commit 3 weeks ago. Snapshot: Issues 35, PRs 19, stars 29.0k. Weekly downloads: 56,552,431. | Bundlephobia API: 17,929 minified, 6,491 gzip. | Industry-standard Proxy-based draft mutation with strong Zustand middleware support. Auto-freeze enabled by default (affects runtime performance on deep writes). | MIT |
| mutative (via zustand-mutative middleware) | Active-moderate. npm 1.3.0 latest (11 months ago). GitHub latest commit 7 months ago. Snapshot: Issues 14, PRs 10, stars 2.0k. Weekly downloads: 1,047,520. | Bundlephobia API: 21,333 minified, 7,164 gzip. | Claims 10x+ faster than Immer with auto-freeze off (default). Dedicated zustand-mutative middleware available. Smaller ecosystem than Immer but drop-in compatible API. | MIT |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- immer: 56,552,431 last week; 226,781,330 last month.
- mutative: 1,047,520 last week; 3,888,177 last month.

### Recommendation

I would lean toward no dependency with plain spread patterns for first implementation, because Zustand actions stay explicit and readable at current state complexity. If action verbosity or deeply nested update patterns become a real friction point, I would lean toward immer next for its Zustand middleware integration and broad ecosystem familiarity. Final call is yours.

### Result

Selected option: no dependency (plain object spread in Zustand actions).

### Source freshness note

Research snapshot is current as of 2026-08-05. Re-verify package activity and size signals if this decision is revisited later.

### What would change this recommendation

- Choose immer if nested state update patterns start becoming verbose and error-prone across store slices.
- Choose mutative if you want immer-style draft ergonomics with better runtime performance and are comfortable with a smaller ecosystem.

## Next Decision to Make: Crypto/Hash Utility Strategy

### Candidate Comparison (2026-08-05 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| No dependency (native Web Crypto API — crypto.subtle) | Web platform standard; no package maintenance risk. | 0 KB dependency cost. | Direct fit for this project: the GDD explicitly calls for Web Crypto API and crypto.subtle for SHA-256 checksums and salt generation. Requires a secure context (HTTPS or localhost), which is standard for any deployed web app. Async API only. | N/A (platform standard) |
| @noble/hashes | Very active. npm 2.2.0 latest (4 months ago). GitHub latest commit 11 hours ago. Snapshot: Issues 4, stars 896. Weekly downloads: 70,419,100. | Bundlephobia API: 232 bytes minified, 192 bytes gzip for the package barrel — individual sub-modules (e.g. sha2.js) are tree-shaken and compact. | Audited, zero-dependency, tree-shakeable hash library. Good backup if you need synchronous hashing or broader algorithm support in a non-secure context. Actively maintained and widely used in the security ecosystem. | MIT |
| crypto-js | **Discontinued** by maintainer. npm 4.2.0 latest (3 years ago). GitHub latest commit 3 years ago. Snapshot: Issues 260, stars 16.4k. Weekly downloads: 19,125,555. | Bundlephobia API: 63,937 minified, 23,374 gzip (full bundle). | Explicitly self-discontinued in its README. The maintainer directs users to native Crypto instead. High issue backlog. Should not be chosen for new projects. | MIT |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- @noble/hashes: 70,419,100 last week; 281,915,463 last month.
- crypto-js: 19,125,555 last week; 79,918,452 last month (downloads are ecosystem-driven inertia, not active adoption signal).

### Recommendation

I would lean strongly toward no dependency and native Web Crypto API (`crypto.subtle`) because it is exactly what the GDD specifies, requires zero bundle cost, and is available in every deployment context this game targets. crypto-js should be ruled out immediately as it is self-discontinued. @noble/hashes is the right dependency if you ever need synchronous hashing, broader algorithm support, or non-secure-context fallback behavior. Final call is yours.

### Result

Selected option: no dependency (native Web Crypto API — crypto.subtle).

### Source freshness note

Research snapshot is current as of 2026-08-05. Re-verify package activity and size signals if this decision is revisited later.

### What would change this recommendation

- Choose @noble/hashes if you need synchronous SHA-256 (for example in a Web Worker context without async overhead) or if you add features requiring algorithms beyond what crypto.subtle exposes.
- Avoid crypto-js in all cases; it is discontinued.

## Next Decision to Make: Code Quality Tooling Strategy

### Candidate Comparison (2026-08-05 snapshot)

| Candidate | Maintenance status | Bundle size | Fit notes for this idle game | License |
|---|---|---|---|---|
| ESLint + Prettier (separate tools) | Both very active. ESLint @typescript-eslint/eslint-plugin: 135,729,141 weekly downloads. Prettier npm 3.9.6 latest (2 weeks ago), GitHub latest commit yesterday, stars 52.2k. Weekly downloads: 129,572,220. | Dev-only; no runtime bundle impact. | The standard combination for TypeScript React projects. Maximum rule ecosystem, editor plugin coverage, and community documentation. Requires coordinating two config files and eslint-config-prettier to prevent conflicts. | MIT |
| Biome (all-in-one linter + formatter) | Very active. npm 2.5.7 latest (yesterday). GitHub latest commit 8 hours ago. Snapshot: Issues 390, PRs 123, stars 25.5k. Weekly downloads: 12,446,047. | Dev-only; no runtime bundle impact. | Single-tool replacement for ESLint + Prettier, written in Rust. 97% Prettier compatibility. 500+ lint rules. Significantly faster than ESLint + Prettier in CI. One config file. Smaller ecosystem and fewer custom rules than ESLint. | MIT or Apache-2.0 |

### Download trend signal

Using npm API last-week vs last-month snapshots:

- @typescript-eslint/eslint-plugin: 135,729,141 last week; 553,673,108 last month.
- prettier: 129,572,220 last week; 502,570,554 last month.
- @biomejs/biome: 12,446,047 last week; 47,359,235 last month.

### Recommendation

I would lean toward ESLint + Prettier for this project because maximum editor tooling compatibility, rule availability (including React Hooks rules and accessibility rules that are important for this project), and team/community documentation are stronger priorities than build-time speed for a solo or small-team idle game project. If CI lint time becomes a concern later, Biome is a viable migration target. Final call is yours.

### Result

Selected option: ESLint + Prettier.

### Source freshness note

Research snapshot is current as of 2026-08-05. Re-verify package activity if this decision is revisited later.

### What would change this recommendation

- Choose Biome if CI lint/format speed is a top priority, you want a single config file, and you are comfortable with a smaller custom-rule ecosystem.
- Stick with ESLint + Prettier if maximum plugin availability (e.g. eslint-plugin-react-hooks, eslint-plugin-jsx-a11y) and broad tooling documentation matter most.

## Research Source Notes

Primary sources consulted for this snapshot:

- npm package pages and npm downloads API.
- GitHub repository overview pages (activity, open issues/PRs, releases).
- Bundlephobia API for size checks (some endpoints returned HTTP 503 during fetch).

Re-validate maintenance/download/size signals if this document is older than 30 days.