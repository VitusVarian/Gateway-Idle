# Phase 8-9: Polish, Optimization & Future Roadmap

## Phase 8: Polish and Optimization

### 8.1 Performance Optimizations

**Memoization:**
- Wrap all stat calculations in useMemo hooks
- Use React.memo for list items (inventory, monster list, combat log)
- Debounce auto-save function (30 second interval)

**State Updates:**
- Batch state updates where possible
- Avoid unnecessary re-renders by splitting store selectors
- Use Zustand's built-in selector pattern: useStore(state => state.character.gold)

**Large Lists:**
- Use react-window or react-virtualized for inventory if it grows large
- Paginate combat log display

### 8.2 Number Formatting Utility (src/lib/formatNumber.ts)
`	ypescript
export function formatNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toString();
}
`

### 8.3 Accessibility Checklist
- [ ] All buttons have aria-label attributes
- [ ] Progress bars have aria-valuenow, aria-valuemin, aria-valuemax
- [ ] Color contrast ratio meets WCAG AA (4.5:1 for normal text)
- [ ] Keyboard navigation works for all interactive elements
- [ ] Focus indicators visible on all focusable elements
- [ ] Screen reader announcements for state changes (level up, combat end)

### 8.4 Mobile Testing Checklist
- [ ] Sidebar toggles correctly on mobile
- [ ] All touch targets are >= 44x44px
- [ ] Text is readable without zooming
- [ ] No horizontal scrolling on any page
- [ ] Portrait and landscape orientations work
- [ ] Swipe gestures don't conflict with UI interactions

## Phase 9: Future Features Roadmap

### Tier 1 - Near Term (after core features work)
1. **Skill Tree System**
   - Visual skill tree UI
   - Unlockable passive bonuses
   - Skill point allocation UI

2. **Equipment Crafting**
   - Use forging materials to craft new items
   - Recipe system
   - Quality tiers based on materials used

3. **Achievement System**
   - Track milestones (first kill, 100 prayers, etc.)
   - Achievement notifications
   - Rewards for achievements

### Tier 2 - Medium Term
4. **Cloud Saves**
   - MongoDB integration
   - User authentication
   - Sync local and cloud saves
   - Conflict resolution

5. **Daily Rewards**
   - Login bonus system
   - Daily challenges
   - Streak tracking

6. **Expanded Content**
   - More monster types
   - Dungeon exploration
   - Boss fights
   - New areas to unlock

### Tier 3 - Long Term
7. **Social Features**
   - Leaderboards
   - Guilds / parties
   - PvP combat

8. **Advanced Anti-Cheat**
   - Server-side validation of all actions
   - Cryptographic signatures on save data
   - Anomaly detection

9. **Monetization** (optional)
   - Cosmetic-only purchases
   - Premium themes
   - Supporter badges

## Testing Guidelines for Future LLM

### Unit Tests (src/__tests__/)
- Test all formula functions in src/lib/formulas.ts
- Test edge cases: zero values, negative values, overflow
- Test level-up triggers at exact experience thresholds
- Test prayer time calculations with various stat combinations

### Integration Tests
- Test save/load cycle preserves all data
- Test combat flow from start to end
- Test equipment swap logic
- Test sell confirmation and refund calculation

### Manual Testing Checklist
- [ ] Start new game -> all values are zero/default
- [ ] Pray for stat -> timer counts down -> stat increases
- [ ] Navigate away during prayer -> return -> progress preserved
- [ ] Mine -> receive gold/materials -> values increase
- [ ] Fight monster -> win -> gain experience -> level up
- [ ] Equip item -> stats update -> unequip -> stats revert
- [ ] Sell item -> gold increases by 50% of purchase price
- [ ] Save game -> reload page -> state restored
- [ ] Delete save -> save removed from list
- [ ] Auto-save triggers after 30 seconds

## File Reference Map

| File | Purpose |
|------|---------|
| app/page.tsx | Landing page - save file selection |
| app/(game)/layout.tsx | Game layout wrapper |
| app/(game)/home/page.tsx | Character stats display |
| app/(game)/armory/page.tsx | Equipment management |
| app/(game)/temple/page.tsx | Prayer system |
| app/(game)/training-grounds/page.tsx | Combat system |
| app/(game)/tepke-mines/page.tsx | Mining system |
| src/store/gameStore.ts | Zustand game state |
| src/db/saveDatabase.ts | IndexedDB operations |
| src/hooks/useGameTick.ts | Game tick management |
| src/lib/formulas.ts | All game calculations |
| src/lib/formatNumber.ts | Number formatting |
| src/types/ | TypeScript type definitions |
| src/components/ | Reusable UI components |
