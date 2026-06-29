# Phase 1: Project Setup - Detailed Instructions

## Step-by-Step Commands

### 1. Initialize the project (run from project root)
`
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias \"@/*\"
`

### 2. Install required dependencies
`
npm install zustand idb decimal.js date-fns
npm install -D @types/node
`

### 3. Configure TypeScript (tsconfig.json)
Ensure strict mode is enabled:
- \"strict\": true
- \"esModuleInterop\": true
- \"skipLibCheck\": true
- \"forceConsistentCasingInFileNames\": true

### 4. Configure Tailwind (tailwind.config.ts)
Add custom color palette for dark theme:
- primary-dark: #1a1a2e
- secondary-dark: #16213e
- accent-teal: #00d2ff
- text-primary: #e0e0e0
- text-secondary: #b0b0b0

### 5. Create the folder structure
Create these directories:
- src/app/(game)/home
- src/app/(game)/armory
- src/app/(game)/temple
- src/app/(game)/training-grounds
- src/app/(game)/tepke-mines
- src/components
- src/hooks
- src/lib
- src/store
- src/types
- src/utils
- src/db

### 6. Create layout.tsx for (game) route group
This will contain the GameLayout wrapper with sidebar navigation.

### 7. Verify setup
- Run \"npm run dev\" and confirm the dev server starts
- Check that Tailwind is working by adding a utility class
- Confirm TypeScript compilation has no errors
