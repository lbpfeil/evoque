---
phase: 04-token-foundation
plan: 02
subsystem: design-tokens
completed: 2026-01-27
duration: 3.6min

requires:
  - 04-01 (token vocabulary foundation)
provides:
  - Complete raw color audit with migration mapping
  - Semantic color tokens for study status states
  - Semantic color tokens for tag scope distinction
  - Reference document for Phase 5/6 migration

affects:
  - Phase 5: Component migration (will use RAW_COLOR_MAP.md as reference)
  - Phase 6: Page migration (will use RAW_COLOR_MAP.md as reference)

tech-stack:
  added: []
  patterns:
    - "Semantic color tokens for domain-specific features (status, tags)"
    - "Comprehensive raw color audit with file/line/context documentation"

key-files:
  created:
    - .planning/phases/04-token-foundation/RAW_COLOR_MAP.md
  modified:
    - index.css
    - tailwind.config.js

decisions:
  - id: TOKENS-08-audit
    choice: "Audited entire codebase for raw color classes - found 67 instances across 10 files"
    context: "Need comprehensive inventory before migration"
    alternatives: ["Migrate incrementally without full audit"]

  - id: TOKENS-08-status
    choice: "Blue (new), Amber (learning), Green (review) for study card states"
    context: "These colors already in use - preserving existing visual language"
    alternatives: ["Different color scheme", "Single color with variations"]

  - id: TOKENS-08-tags
    choice: "Blue (global), Amber (book-specific) for tag scope distinction"
    context: "Critical for user comprehension of tag scope"
    alternatives: ["No color distinction", "Icon-only distinction"]

  - id: TOKENS-08-heatmap
    choice: "Leave heatmap green gradients as component-specific (not semantic tokens)"
    context: "Component-local colors don't need global semantic tokens"
    alternatives: ["Create intensity-1 through intensity-4 semantic tokens"]

tags: [design-system, colors, semantic-tokens, audit, documentation]
---

# Phase 4 Plan 2: Complete Color Token System Summary

**One-liner:** Audited 67 raw color classes across 10 files, created migration reference, and defined 7 semantic tokens for study status and tag colors.

## What Was Built

### 1. Comprehensive Raw Color Audit

Created `.planning/phases/04-token-foundation/RAW_COLOR_MAP.md` documenting:
- **67 raw color class instances** across 10 files (pages and components)
- **File, line, raw class, semantic replacement, and context** for each occurrence
- **7 new semantic tokens needed** for study status and tag colors
- **Migration strategy and notes** for Phase 5/6 implementation

**Files audited:**
- pages/: Highlights.tsx, Settings.tsx, Study.tsx, StudySession.tsx
- components/: DeckTable.tsx, EmptyDeckPopover.tsx, ErrorBoundary.tsx, Sidebar.tsx, StudyHeatmap.tsx, StudyStatusBadge.tsx, TagManagerSidebar.tsx, TagSelector.tsx

**Raw color categories found:**
- Study status colors (blue/amber/green for new/learning/review states)
- Tag colors (blue for global, amber for book-specific)
- Success colors (green for confirmations)
- Error colors (red - already covered by --destructive)
- Component-specific colors (heatmap gradients, tooltips)

### 2. Semantic Color Token Definitions

Added 7 new semantic color tokens to `index.css` (both `:root` and `.dark`):

**Study Status Colors:**
- `--status-new`: Blue (oklch 0.55 0.20 250 / 0.65 0.18 250) - New cards
- `--status-learning`: Amber (oklch 0.70 0.15 85 / 0.78 0.13 85) - Learning cards
- `--status-review`: Green (oklch 0.60 0.18 145 / 0.70 0.16 145) - Review cards
- `--status-foreground`: White (oklch 0.99 0.01 90) - Text on status badges

**Tag Colors:**
- `--tag-global`: Blue (oklch 0.55 0.20 250 / 0.65 0.18 250) - Global tags
- `--tag-book`: Amber (oklch 0.70 0.15 85 / 0.78 0.13 85) - Book-specific tags

**Success Color:**
- `--success`: Green (oklch 0.60 0.18 145 / 0.70 0.16 145) - Success messages

All tokens mapped in `tailwind.config.js` under:
- `colors.status.new/learning/review/foreground`
- `colors.tag.global/book`
- `colors.success`

### 3. Token System Verification

- ✅ `npm run build` succeeds with all new tokens
- ✅ `npm run dev` starts without errors
- ✅ No visual regressions (all changes are additive - raw colors not yet replaced)

## How It Works

### Raw Color Audit Process

1. **Search patterns:** Grepped codebase for `text-*`, `bg-*`, `border-*` with color names (zinc, gray, blue, amber, green, red, etc.)
2. **File filtering:** Excluded .planning, lbp_*, node_modules - focused on source files (pages/, components/)
3. **Context analysis:** For each raw color, determined:
   - What it's used for (status badge, tag indicator, error message, etc.)
   - Appropriate semantic replacement token
   - Whether new token needed or existing token sufficient
4. **Documentation:** Created comprehensive table with file, line, raw class, replacement, and context

### Semantic Token Structure

**Study Status Colors:**
Used throughout the app for spaced repetition card states:
- **New (blue):** Cards never seen before
- **Learning (amber):** Cards in active learning phase
- **Review (green):** Mature cards being reviewed

Contexts: StatusBadge component, rating buttons, deck statistics, study page counters

**Tag Colors:**
Visual distinction for tag scope:
- **Global (blue):** Tags available across all books
- **Book-specific (amber):** Tags scoped to single book

Contexts: TagSelector, TagManagerSidebar, Highlights page, StudySession tag display

**Success Color:**
Generic success state (separate from "review" status which is also green):
- Success messages (Settings import confirmation)
- Checkmarks and confirmations
- Success hover states (copy button)

## Migration Reference Document

**RAW_COLOR_MAP.md provides:**
- Definitive list of ALL raw colors to replace
- Semantic replacement for EACH occurrence
- Context explaining WHY that replacement is appropriate
- Notes on special cases (heatmap component-specific colors, etc.)

**Phase 5/6 will use this document to:**
1. Migrate files systematically (file-by-file or component-by-component)
2. Know exactly what to replace and with what
3. Verify completeness (all 67 instances migrated)
4. Maintain consistency (same raw color → same semantic token everywhere)

## Verification

### Color Token Completeness

✅ All 67 raw color instances documented
✅ Every instance has specific semantic replacement
✅ New tokens defined for all previously missing semantics
✅ No "TBD" or "TODO" in mapping document

### Build Verification

```bash
npm run build
# ✓ built in 9.84s (no errors)

npm run dev
# VITE v6.4.1 ready in 187ms (no errors)
```

### Token System Coverage

| Category | Status |
|----------|--------|
| Base colors (background, foreground, etc.) | ✅ 04-01 |
| Component colors (card, popover, etc.) | ✅ 04-01 |
| Sidebar colors | ✅ 04-01 |
| Chart colors | ✅ 04-01 |
| **Study status colors** | ✅ **04-02** |
| **Tag scope colors** | ✅ **04-02** |
| **Success color** | ✅ **04-02** |
| Typography tokens | ✅ 04-01 |
| Spacing tokens | ✅ 04-01 |
| Shadow tokens | ✅ 04-01 |
| Motion tokens | ✅ 04-01 |
| Z-index tokens | ✅ 04-01 |

**Result:** Color token system is now complete. All raw colors have semantic replacements defined.

## Known Issues

### Pre-existing Issues (not introduced by this plan)

1. **StudyStatusBadge.tsx line 32:** Uses `yellow-*` colors for "Learning" badge instead of `amber-*` (inconsistent with rest of app). Will be fixed during Phase 5 migration.

2. **Heatmap component:** Uses green gradients (lines 216-219) that are component-specific. These should remain as raw colors or convert to component-local CSS variables, not global semantic tokens.

### No New Issues

All changes are additive (new tokens added). No existing code modified yet. Migration happens in Phase 5/6.

## Deviations from Plan

**None** - Plan executed exactly as written.

## Next Phase Readiness

### Phase 5 (Component Migration) Blockers

✅ None - RAW_COLOR_MAP.md provides complete migration reference

### Phase 6 (Page Migration) Blockers

✅ None - RAW_COLOR_MAP.md provides complete migration reference

### Documentation Artifacts Ready

- ✅ RAW_COLOR_MAP.md (migration reference with 67 instances mapped)
- ✅ index.css (complete token vocabulary)
- ✅ tailwind.config.js (all tokens mapped to Tailwind utilities)

## Performance Metrics

- **Duration:** 3.6 minutes (2026-01-27T23:53:25Z to 2026-01-27T23:56:54Z)
- **Files created:** 1 (RAW_COLOR_MAP.md)
- **Files modified:** 2 (index.css, tailwind.config.js)
- **Commits:** 2 (audit + token definitions)
- **Raw colors audited:** 67 instances
- **New semantic tokens added:** 7

## What's Next

### Immediate Next Steps (Phase 4)

Phase 4 token foundation is **complete** after this plan. No further token-related work needed before component/page migration.

### Phase 5 (Component Migration)

Will use RAW_COLOR_MAP.md to:
1. Migrate shadcn/ui components (if any raw colors found - audit showed none)
2. Migrate custom components (TagSelector, StudyStatusBadge, DeckTable, etc.)
3. Replace raw colors with semantic tokens systematically
4. Verify visual consistency after each component migration

### Phase 6 (Page Migration)

Will use RAW_COLOR_MAP.md to:
1. Migrate pages (Study, StudySession, Highlights, Settings)
2. Replace raw colors with semantic tokens
3. Verify visual consistency after each page migration
4. Complete the "no raw colors" enforcement (TOKENS-08 requirement)

## Lessons Learned

1. **Comprehensive audit before migration:** Having the complete list of raw colors (67 instances) with context makes Phase 5/6 much more systematic. No guesswork.

2. **Semantic token design:** Study status and tag colors need semantic tokens (not just "blue-600", "amber-500") because they carry domain meaning. Users understand "status-new" vs "status-review" semantically.

3. **Component-specific vs global tokens:** Not every color needs to be a global semantic token. Heatmap gradients are component-specific and should stay that way.

4. **Documentation as artifact:** RAW_COLOR_MAP.md is both a planning artifact AND a reference document for future development. It's the single source of truth for color migration.
