---
phase: 04-token-foundation
plan: 01
subsystem: ui
tags: [css-variables, tailwind, design-tokens, typography, spacing, shadows, motion, z-index]

# Dependency graph
requires:
  - phase: v2.0-init
    provides: Roadmap structure and design system research
provides:
  - Complete design token vocabulary as CSS custom properties (31 tokens)
  - Tailwind utility class mappings for all 7 token categories
  - Foundation for systematic UI migration in Phases 5-6
affects: [05-typography-migration, 06-component-system, 07-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - CSS custom properties for design tokens (no theme change)
    - Tailwind theme.extend for token-to-utility mapping
    - Semantic naming (text-heading, space-md, shadow-lg)

key-files:
  created: []
  modified:
    - index.css
    - tailwind.config.js

key-decisions:
  - "Typography scale: 6 named sizes (display through overline) matching existing Tailwind scale"
  - "Spacing scale: 8 semantic tokens (xxs through 3xl) on 4px grid"
  - "Named spacing utilities (p-md, gap-lg) with no responsive breakpoint conflicts"
  - "Icon sizes: Fixed rem values (not CSS vars) since they don't change with theme"
  - "Shadow tokens: Same values for light/dark (dark variants deferred)"
  - "Z-index: 8 semantic layers (base through tooltip) with clear hierarchy"

patterns-established:
  - "Token definition: CSS custom properties in :root for theme-agnostic values"
  - "Token mapping: theme.extend in tailwind.config.js for utility generation"
  - "Naming convention: --{category}-{size} for CSS vars, category-size for utilities"

# Metrics
duration: 1m 41s
completed: 2026-01-27
---

# Phase 4 Plan 01: Token Foundation Summary

**Complete design token vocabulary with 31 CSS custom properties mapped to Tailwind utilities across 7 categories (typography, spacing, shadows, motion, icons, z-index)**

## Performance

- **Duration:** 1m 41s
- **Started:** 2026-01-27T23:47:58Z
- **Completed:** 2026-01-27T23:49:39Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Defined 31 CSS custom properties in index.css organized by token category
- Mapped all tokens to Tailwind utilities (text-heading, p-md, shadow-lg, duration-fast, z-modal, etc.)
- Verified build succeeds with no breaking changes
- Established foundation for systematic UI migration in Phases 5-6

## Task Commits

Each task was committed atomically:

1. **Task 1: Add CSS custom properties for all design tokens to index.css** - `a64cefa` (feat)
2. **Task 2: Map all design tokens to Tailwind utilities in tailwind.config.js** - `e361bf9` (feat)

**Plan metadata:** [pending - will be committed after SUMMARY.md creation]

## Files Created/Modified

- `index.css` - Added 31 CSS custom properties in :root (6 typography, 8 spacing, 3 shadow, 6 motion, 8 z-index)
- `tailwind.config.js` - Extended theme with fontSize, spacing, boxShadow, transitionDuration, transitionTimingFunction, width/height (icons), zIndex mappings

## Decisions Made

1. **Typography scale matches existing Tailwind sizes** - text-heading (18px) = text-lg, text-body (14px) = text-sm, text-caption (12px) = text-xs. This ensures smooth migration without visual changes.

2. **Named spacing utilities without prefix** - Used bare names (p-md, gap-lg) instead of prefixed (p-sp-md). Tailwind's spacing scale is numeric (0-96) so named keys are pure additions. Responsive breakpoints (sm:, md:, lg:) use colon syntax and don't conflict.

3. **Icon sizes as fixed rem values** - Width/height for icons (14px, 16px, 20px) are hardcoded in tailwind.config.js, not CSS variables, because they're invariant across themes.

4. **Shadow tokens theme-agnostic** - Same shadow values in light and dark modes for now. Dark-mode shadow variants can be added later if needed (by updating CSS vars in .dark block).

5. **Z-index semantic layers** - 8 layers with 10-point gaps (1000, 1020, 1030...) provide clear stacking hierarchy and room for edge cases.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - both tasks completed successfully. Build verified with `npm run build` (passed with only pre-existing warnings in ankiParser.ts).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 5 (Typography Migration):**
- All typography tokens available as utilities (text-display, text-title, text-heading, text-body, text-caption, text-overline)
- All spacing tokens available (p-md, gap-lg, m-xxs, etc.)
- Build system verified working
- No breaking changes to existing components

**Ready for Phase 6 (Component System):**
- Shadow tokens (shadow-sm, shadow-md, shadow-lg)
- Motion tokens (duration-fast, duration-base, duration-slow, ease-in, ease-out, ease-in-out)
- Icon sizes (w-icon-sm, h-icon-md, etc.)
- Z-index layers (z-modal, z-dropdown, z-tooltip, etc.)

**No blockers or concerns.**

---
*Phase: 04-token-foundation*
*Completed: 2026-01-27*
