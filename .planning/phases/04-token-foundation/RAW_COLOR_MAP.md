# Raw Color Audit - Phase 4 Token Foundation

**Audit Date:** 2026-01-27
**Phase:** 04-token-foundation
**Plan:** 04-02

## Summary

- **Total raw color occurrences:** 67
- **Files affected:** 10
- **New semantic tokens needed:** 7 (status colors + tag colors)

## New Tokens Required

| Token | Light Value | Dark Value | Used For |
|-------|-------------|------------|----------|
| --status-new | oklch(0.55 0.20 250) | oklch(0.65 0.18 250) | Study card "New" state (blue) |
| --status-learning | oklch(0.70 0.15 85) | oklch(0.78 0.13 85) | Study card "Learning" state (amber) |
| --status-review | oklch(0.60 0.18 145) | oklch(0.70 0.16 145) | Study card "Review/Due" state (green) |
| --status-foreground | oklch(0.99 0.01 90) | oklch(0.99 0.01 90) | Text on status badges (white) |
| --tag-global | oklch(0.55 0.20 250) | oklch(0.65 0.18 250) | Global tags (blue) |
| --tag-book | oklch(0.70 0.15 85) | oklch(0.78 0.13 85) | Book-specific tags (amber) |
| --success | oklch(0.60 0.18 145) | oklch(0.70 0.16 145) | Success messages (green) |

**Note:** Error/destructive colors already exist as semantic tokens (--destructive). Heatmap colors are component-specific and will be handled separately in Phase 5.

## Migration Map

### Pages

| File | Line | Raw Class | Semantic Replacement | Context |
|------|------|-----------|---------------------|---------|
| pages/Highlights.tsx | 274 | text-amber-500 | text-tag-book | Book tag icon |
| pages/Highlights.tsx | 380 | text-amber-500 | text-tag-book | Book tag icon |
| pages/Highlights.tsx | 381 | text-amber-600 | text-tag-book | Book tag text |
| pages/Settings.tsx | 323 | bg-green-500/10 | bg-success/10 | Success banner background |
| pages/Settings.tsx | 323 | border-green-500/30 | border-success/30 | Success banner border |
| pages/Settings.tsx | 325 | text-green-600 dark:text-green-400 | text-success | Success icon |
| pages/Settings.tsx | 326 | text-green-600 dark:text-green-400 | text-success | Success message text |
| pages/Settings.tsx | 332 | text-green-600 dark:text-green-400 | text-success | Success link |
| pages/Settings.tsx | 609 | bg-blue-600 | bg-primary | Avatar placeholder background |
| pages/Study.tsx | 84 | text-blue-300 dark:text-blue-700 | text-status-new | New card count |
| pages/Study.tsx | 88 | text-amber-300 dark:text-amber-700 | text-status-learning | Learning card count |
| pages/Study.tsx | 92 | text-green-300 dark:text-green-700 | text-status-review | Review card count |
| pages/StudySession.tsx | 14 | bg-blue-500 | bg-status-new | Status badge - New |
| pages/StudySession.tsx | 17 | bg-amber-500 | bg-status-learning | Status badge - Learning |
| pages/StudySession.tsx | 19 | bg-green-500 | bg-status-review | Status badge - Review |
| pages/StudySession.tsx | 335 | text-red-500 | text-destructive | Error message |
| pages/StudySession.tsx | 383 | hover:text-green-600 | hover:text-success | Copy button hover |
| pages/StudySession.tsx | 386 | text-green-600 | text-success | Copy success state |
| pages/StudySession.tsx | 455 | bg-amber-500 dark:bg-amber-600 | bg-tag-book | Book-specific tag badge |
| pages/StudySession.tsx | 456 | bg-blue-500 dark:bg-blue-600 | bg-tag-global | Global tag badge |
| pages/StudySession.tsx | 498 | bg-amber-500 dark:bg-amber-600 | bg-tag-book | Book-specific tag badge |
| pages/StudySession.tsx | 499 | bg-blue-500 dark:bg-blue-600 | bg-tag-global | Global tag badge |
| pages/StudySession.tsx | 636 | bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 | bg-destructive hover:bg-destructive/90 | Rating button - Again (1) |
| pages/StudySession.tsx | 644 | bg-amber-500 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-700 | bg-status-learning hover:bg-status-learning/90 | Rating button - Hard (2) |
| pages/StudySession.tsx | 652 | bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 | bg-status-new hover:bg-status-new/90 | Rating button - Good (3) |
| pages/StudySession.tsx | 660 | bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 | bg-status-review hover:bg-status-review/90 | Rating button - Easy (4) |

### Components (non-UI)

| File | Line | Raw Class | Semantic Replacement | Context |
|------|------|-----------|---------------------|---------|
| components/DeckTable.tsx | 63 | text-blue-600 | text-status-new | New card count (active) |
| components/DeckTable.tsx | 71 | text-amber-600 | text-status-learning | Learning card count (active) |
| components/DeckTable.tsx | 79 | text-green-600 | text-status-review | Review card count (active) |
| components/EmptyDeckPopover.tsx | 26 | text-amber-500 | text-muted-foreground | Warning icon |
| components/ErrorBoundary.tsx | 32 | bg-red-50 | bg-destructive/10 | Error icon background |
| components/ErrorBoundary.tsx | 32 | text-red-500 | text-destructive | Error icon |
| components/ErrorBoundary.tsx | 42 | text-red-600 | text-destructive | Error message |
| components/Sidebar.tsx | 125 | bg-blue-600 | bg-primary | User avatar placeholder |
| components/StudyHeatmap.tsx | 216 | bg-green-200 dark:bg-green-900 hover:bg-green-300 dark:hover:bg-green-800 | [PHASE 5] Component-specific heatmap gradient |
| components/StudyHeatmap.tsx | 217 | bg-green-400 dark:bg-green-700 hover:bg-green-500 dark:hover:bg-green-600 | [PHASE 5] Component-specific heatmap gradient |
| components/StudyHeatmap.tsx | 218 | bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-500 | [PHASE 5] Component-specific heatmap gradient |
| components/StudyHeatmap.tsx | 219 | bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-400 | [PHASE 5] Component-specific heatmap gradient |
| components/StudyHeatmap.tsx | 317 | text-orange-500 | text-primary | Streak icon |
| components/StudyHeatmap.tsx | 377 | bg-zinc-900 dark:bg-zinc-100 | bg-popover | Tooltip background |
| components/StudyHeatmap.tsx | 377 | text-white dark:text-zinc-900 | text-popover-foreground | Tooltip text |
| components/StudyHeatmap.tsx | 385 | text-zinc-300 dark:text-zinc-600 | text-muted-foreground | Empty date label |
| components/StudyStatusBadge.tsx | 18 | bg-green-50 dark:bg-green-900/20 | bg-status-review/10 | Review badge background |
| components/StudyStatusBadge.tsx | 18 | text-green-700 dark:text-green-300 | text-status-review | Review badge text |
| components/StudyStatusBadge.tsx | 18 | border-green-100 dark:border-green-800/50 | border-status-review/30 | Review badge border |
| components/StudyStatusBadge.tsx | 25 | bg-blue-50 dark:bg-blue-900/20 | bg-status-new/10 | New badge background |
| components/StudyStatusBadge.tsx | 25 | text-blue-700 dark:text-blue-300 | text-status-new | New badge text |
| components/StudyStatusBadge.tsx | 25 | border-blue-100 dark:border-blue-800/50 | border-status-new/30 | New badge border |
| components/StudyStatusBadge.tsx | 32 | bg-yellow-50 dark:bg-yellow-900/20 | bg-status-learning/10 | Learning badge background (uses yellow, should be amber) |
| components/StudyStatusBadge.tsx | 32 | text-yellow-700 dark:text-yellow-300 | text-status-learning | Learning badge text |
| components/StudyStatusBadge.tsx | 32 | border-yellow-100 dark:border-yellow-800/50 | border-status-learning/30 | Learning badge border |
| components/TagManagerSidebar.tsx | 162 | text-amber-500 | text-tag-book | Book tag icon |
| components/TagManagerSidebar.tsx | 181 | text-amber-600 | text-tag-book | Book tag count |
| components/TagManagerSidebar.tsx | 287 | text-amber-600 | text-tag-book | Book tag icon (large) |
| components/TagManagerSidebar.tsx | 318 | text-amber-500 | text-tag-book | Book tag icon (nested) |
| components/TagSelector.tsx | 112 | text-blue-600 | text-tag-global | "Create global tag" button text |
| components/TagSelector.tsx | 112 | hover:bg-blue-50 | hover:bg-tag-global/10 | "Create global tag" button hover |
| components/TagSelector.tsx | 121 | text-amber-600 | text-tag-book | "Create book tag" button text |
| components/TagSelector.tsx | 121 | hover:bg-amber-50 | hover:bg-tag-book/10 | "Create book tag" button hover |
| components/TagSelector.tsx | 152 | text-amber-500 | text-tag-book | Book tag icon in list |
| components/TagSelector.tsx | 188 | bg-amber-50 dark:bg-amber-900/30 | bg-tag-book/10 | Selected book tag background |
| components/TagSelector.tsx | 188 | text-amber-700 dark:text-amber-500 | text-tag-book | Selected book tag text |
| components/TagSelector.tsx | 188 | border-amber-200 dark:border-amber-800 | border-tag-book/30 | Selected book tag border |
| components/TagSelector.tsx | 231 | text-blue-600 | text-tag-global | "Create global tag" button text (modal) |
| components/TagSelector.tsx | 231 | hover:bg-blue-50 | hover:bg-tag-global/10 | "Create global tag" button hover (modal) |
| components/TagSelector.tsx | 240 | text-amber-600 | text-tag-book | "Create book tag" button text (modal) |
| components/TagSelector.tsx | 240 | hover:bg-amber-50 | hover:bg-tag-book/10 | "Create book tag" button hover (modal) |
| components/TagSelector.tsx | 271 | text-amber-500 | text-tag-book | Book tag icon (modal list) |

### shadcn/ui Components

No raw colors found in components/ui/*.tsx files. All shadcn/ui components already use semantic tokens.

## Migration Notes

### Study Status Colors
The study card status system uses a consistent color language:
- **Blue** (New): Cards never seen before
- **Amber** (Learning): Cards in active learning phase
- **Green** (Review): Cards being reviewed (mature)

These are used in multiple contexts:
1. Status badges (StudyStatusBadge component)
2. Rating buttons (StudySession page - 1/2/3/4 buttons)
3. Deck statistics (Study page, DeckTable component)
4. Status indicators (various components)

### Tag Colors
The tag system uses two colors to distinguish scope:
- **Blue** (Global): Tags available across all books
- **Amber** (Book-specific): Tags scoped to a single book

This color distinction is critical for user comprehension and should be preserved through semantic tokens.

### Heatmap Colors
The StudyHeatmap component uses green gradients to show activity intensity (lines 216-219). These are component-specific and should remain as raw colors or be converted to component-local CSS variables in Phase 5. They are not general-purpose semantic tokens.

### Success vs Review
- `--success` token is for generic success messages (checkmarks, confirmations)
- `--status-review` is specifically for the "review" study state (happens to also be green)
- These may have the same OKLCH values but serve different semantic purposes

## Implementation Strategy

**Task 2 will:**
1. Add all 7 new tokens to index.css (:root and .dark)
2. Map all 7 tokens in tailwind.config.js
3. Verify build succeeds
4. Leave actual migration to Phase 5/6 (this is reference documentation only)

**Phase 5/6 will:**
1. Use this document as the definitive migration reference
2. Replace raw colors file-by-file with semantic tokens
3. Update StudyStatusBadge.tsx line 32 to use amber (not yellow) for consistency
4. Handle StudyHeatmap component-specific colors separately
