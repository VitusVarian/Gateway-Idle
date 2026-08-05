# Gateway Idle

Gateway Idle is a browser-based incremental game prototype built with React, TypeScript, and Vite.
The current implementation focuses on a working gameplay scaffold with stage progression, combat simulation,
training reset loops, save/load infrastructure, and automated tests.

## Features

- Stage-based progression with boss milestones at stages 10, 100, and 1000
- Core combat/economy simulation using deterministic tick advancement
- Training reset loop with upgrade economy and milestone rewards
- Achievement unlock tracking tied to progression events
- Big-number-safe resources and scaling using `bignumber.js`
- Save system with schema validation/migration, primary/backup persistence, and offline progress handling
- Unit test coverage for economy, simulation, save codec, and store behavior
- End-to-end smoke test coverage with Playwright

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Zustand (state management)
- Tailwind CSS (via `@tailwindcss/vite`)
- Vitest (unit tests)
- Playwright (E2E tests)
- ESLint + Prettier

## Prerequisites

- Node.js 20+ (recommended)
- pnpm 10+

To install pnpm globally if needed:

```bash
npm install -g pnpm
```

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Start the development server:

```bash
pnpm dev
```

3. Open the local URL shown in the terminal (usually `http://localhost:5173`).

## Available Scripts

- `pnpm dev`: start Vite development server
- `pnpm build`: typecheck and produce a production build
- `pnpm preview`: preview the production build locally
- `pnpm typecheck`: run TypeScript project type checks
- `pnpm lint`: run ESLint
- `pnpm format`: check formatting with Prettier
- `pnpm format:write`: apply Prettier formatting
- `pnpm test`: run unit tests once (Vitest)
- `pnpm test:watch`: run unit tests in watch mode
- `pnpm test:e2e`: run Playwright end-to-end tests

## Testing

### Unit tests

```bash
pnpm test
```

### E2E tests

```bash
pnpm test:e2e
```

The Playwright config starts the app on `127.0.0.1:4173` and runs tests from `e2e/`.

## Build and Preview

Build for production:

```bash
pnpm build
```

Preview production output:

```bash
pnpm preview
```

## Project Structure

Key folders:

- `src/engine/`: economy formulas, simulation loop, progression math
- `src/store/`: Zustand game store and selectors/slices
- `src/services/save/`: save schema, codec, runtime save system
- `src/features/`: UI/gameplay feature modules (battle, training, achievements, etc.)
- `src/pages/`: page-level UI composition (`GamePage`)
- `e2e/`: Playwright smoke tests
- `docs/Planning/`: design and planning documents

## Notes

- Routing uses hash-based navigation for static hosting compatibility.
- Vite computes its production `base` from the GitHub repository name and falls back to `/Gateway-Idle/` locally.

## GitHub Pages Deployment

- GitHub Actions deploys the site to GitHub Pages on every push to the `main` branch.
- The workflow file lives at the repository root in `.github/workflows/deploy-pages.yml` and builds the app from the `Gateway-Idle/` subdirectory.
- The current checked out branch in this repo is `main`, so pushes to `main` are the deployment trigger.
- The deployed site path is based on the repository name, which currently resolves to `/Gateway-Idle/`.
