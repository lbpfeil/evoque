# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-27)

**Core value:** Consistencia obsessiva -- cada elemento visual identico ao equivalente em qualquer pagina. Zero surpresas visuais.
**Current focus:** v2.0 Gap Closure -- phases 8-10 (audit-driven)

## Current Position

Phase: 9 of 10 (Component Adoption)
Plan: 1 of 5 in phase 9
Status: In progress
Last activity: 2026-01-28 -- Completed 09-01-PLAN.md (foundation files migration)

Progress: [█████████░] 90% (9/10 phases, 1/5 plans in phase 9)

## Performance Metrics

**Velocity (from v1.0):**
- Total plans completed: 22
- Average duration: 3.3min
- Total execution time: 75.7min

**By Phase (v2.0):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 04-token-foundation | 2 | 5.3min | 2.7min |
| 05-component-standardization | 2 | 5.9min | 3.0min |
| 06-page-migration | 7/7 | ~18.6min | ~2.7min |
| 07-design-guide | 1/1 | 7.2min | 7.2min |
| 08-token-consumption | 5/5 | ~30min | ~6min |
| 09-component-adoption | 1/5 | 4min | 4min |

**Recent Trend:**
- Phase 8 plan 03: ~5min (Dashboard + Highlights token migration)
- Phase 8 plan 04: 12.5min (6 high-interaction components + tag/status color tokens)
- Phase 8 plan 05: ~8min (11 remaining components + comprehensive audit, phase complete)
- Phase 9 plan 01: 4min (Login, Sidebar, ThemeToggle, ErrorBoundary Button/Input migration)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v2.0 Init]: "Generous" design language wins (Dashboard/Highlights style -- big titles, generous spacing, rounded containers)
- [v2.0 Init]: No ESLint enforcement in v1 scope (deferred to v2 requirements)
- [v2.0 Init]: Single concise design guide (not multiple docs)
- [v2.0 Init]: All 7 pages migrated (no exceptions)
- [04-01]: Typography scale matches existing Tailwind sizes (text-heading=text-lg, text-body=text-sm)
- [04-01]: Named spacing utilities without prefix (p-md, gap-lg) - no conflicts with breakpoints
- [04-01]: Icon sizes as fixed rem values (not CSS vars) - theme-invariant
- [04-01]: Shadow tokens theme-agnostic for now (dark variants deferred)
- [04-02]: Blue (new), Amber (learning), Green (review) for study status colors - preserves existing visual language
- [04-02]: Blue (global), Amber (book-specific) for tag colors - critical for user comprehension
- [04-02]: Heatmap gradients remain component-specific (not global semantic tokens)
- [05-01]: Button 'compact' (h-8) as new CVA default - all existing usages specify explicit size
- [05-01]: Input reduced to h-8 with proportional padding (px-2.5 py-1.5)
- [05-01]: Badge verified as already token-aligned (h-5, text-xs, px-2)
- [05-02]: PageHeader size='default' (text-title 30px) for destination pages, size='compact' (text-heading 18px) for tool pages
- [05-02]: DataTable uses gridCols string prop for flexibility, rowClassName function for per-row styling
- [06-04]: StudySession preserves font-serif, rating colors, full-screen layout as intentional deviations
- [06-04]: No PageHeader on StudySession (custom compact header is intentional immersive UX)
- [06-06]: BookContextModal title downsized from text-2xl to text-heading for modal-appropriate scale
- [06-05]: text-[11px] mapped to text-overline (10px) rather than text-caption (12px) for tiny metadata intent
- [06-06]: All text-[9px] and text-[10px] consistently map to text-overline across all cross-cutting components
- [06-01]: Login uses text-heading (not text-title) since it is not a destination page
- [06-01]: StatCard title uses text-overline for uppercase tracking-wider label pattern
- [06-07]: All PageHeader pages standardized to size='compact' (default/compact distinction removed)
- [07-01]: Single design-system-guide.md replaces compact-ui-design-guidelines.md
- [07-01]: Guide written in English (matches CLAUDE.md and codebase)
- [07-01]: CLAUDE.md updated to reference new guide in all locations
- [08-03]: Tag colors use text-tag-book and text-tag-global semantic tokens (not raw amber/blue)
- [08-03]: py-20 (80px) kept as raw value when above token scale maximum (64px)
- [08-01]: py-2.5 maps to py-sm (12px) with acceptable +2px variance for Login input fields
- [08-01]: Sub-4px micro-spacing (0.5 values) preserved as raw - semantic grid starts at 4px
- [08-05]: ErrorBoundary uses text-destructive and bg-destructive/10 for error states
- [08-05]: StudyHeatmap data-viz colors (green gradients, orange streak, inverted tooltip) preserved as intentional deviations with /* data-viz */ comments
- [08-05]: DashboardCharts hsl() color bug deferred to Phase 10 (hsl-to-oklch migration)
- [08-05]: Phase 8 complete - all pages + components use semantic tokens (zero unexpected raw values)
- [08-02]: StudySession rating buttons preserve raw colors (SM-2 quality feedback, not status indicators)
- [08-02]: Study page inverted background uses raw light shades (300/700) for proper contrast on dark foreground background
- [08-02]: Plan 08-02 verification - work already complete in commits 6a591e7 and 0d5f597
- [08-04]: Tinted color variants (bg-blue-50, hover:bg-amber-50) kept as raw with comments - no semantic tinted tokens exist
- [08-04]: Tag solid colors successfully migrated (text-tag-global, text-tag-book)
- [08-04]: Status stat colors successfully migrated (text-status-new/learning/review in DeckTable)
- [09-01]: Login toggle button uses variant='link' for text-only action (underlined navigation pattern)
- [09-01]: Sidebar buttons use variant='ghost' for transparent navigation with hover
- [09-01]: Dashboard.tsx confirmed 0 raw buttons via grep (no migration needed)

### Pending Todos

- Remove unused `hooks/useTheme.ts` (carried from v1.0)

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-01-28
Stopped at: Completed 09-01-PLAN.md (foundation files migration complete)
Resume file: None
