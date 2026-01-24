# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-24)

**Core value:** Experiência de estudo fluida e sem fricção
**Current focus:** v1.1 Internationalization

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-01-24 — Milestone v1.1 started

Progress: v1.1 PLANNING

## Performance Metrics

**Velocity:**
- Total plans completed: 20
- Average duration: 3.2min
- Total execution time: 66min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 7 | 18min | 2.6min |
| 2. Component Migration | 7 | 33min | 4.7min |
| 3. Critical Pages | 6 | 15min | 2.5min |

**Recent Trend:**
- Last 5 plans: 03-02 (2min), 03-03 (2min), 03-04 (3min), 03-05 (2min), 03-06 (2min)
- Trend: Consistent fast execution

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Init]: Use custom ThemeProvider (not next-themes) for Vite SPA
- [Init]: Fix HSL/OKLCH mismatch before any visual work
- [01-01]: Use OKLCH color space for perceptual uniformity
- [01-01]: Keep two @layer base blocks (variables vs base styles)
- [01-02]: Use localStorage for theme persistence (not Supabase) - enables anti-FOUC
- [01-02]: ThemeToggle placed at fixed bottom-right (Phase 2 will move to Sidebar)
- [01-04]: Use Outfit Variable font as primary sans-serif
- [01-04]: Define --font-sans in CSS with full fallback chain
- [01-04]: Add serif stack for study cards (font-serif class)
- [01-05]: Light mode L=97% with C=0.015 for visible warmth
- [01-05]: Sidebar equals background in both modes for seamless UI
- [01-03]: Sidebar uses semantic color tokens (bg-sidebar, text-sidebar-foreground)
- [01-03]: ThemeToggle hidden on StudySession page to prevent footer overlap
- [01-06]: ThemeToggle only exists in Sidebar (removed from App.tsx and Study.tsx)
- [01-07]: Use isExpanded from SidebarContext for dynamic main margin (md:ml-56/md:ml-14)
- [01-07]: BottomNav uses semantic tokens (bg-background, border-border, text-foreground)
- [02-01]: Use bg-popover/text-popover-foreground for floating elements (command, popover)
- [02-01]: Use bg-accent/text-accent-foreground for interactive hover states
- [02-01]: Use bg-secondary/text-secondary-foreground for secondary button variant
- [02-02]: Use bg-foreground/text-background for inverted logo (theme-aware contrast)
- [02-02]: Use bg-destructive/10 + border-destructive/30 + text-destructive for error states
- [02-02]: Use hover:border-primary/30 for subtle card hover effects
- [02-03]: Keep bg-blue-600 for avatar placeholder (brand color intentional)
- [02-03]: Success states use explicit dark mode: bg-green-500/10 text-green-600 dark:text-green-400
- [02-04]: Use hover:bg-accent/50 for table row hover (subtle effect)
- [02-04]: Use bg-primary/5 for selected row state (distinguishable from hover)
- [02-04]: Use border-input for form inputs (consistent with design system)
- [02-05]: Keep original props interface for DeleteCardPopover/EmptyDeckPopover (backward compat)
- [02-05]: Use text-amber-500 for informational icons vs text-destructive for warnings
- [02-06]: Use hsl(var(--primary)) for Recharts colors (theme-aware charts)
- [02-06]: Use Dialog open={!!id} pattern for controlled modal state
- [02-06]: Tooltip uses card/border CSS variables for consistent styling
- [02-07]: Use hsl(var(--*)) for Recharts colors (DashboardCharts now theme-aware)
- [02-07]: Delete orphaned components (HighlightStats.tsx removed)
- [03-01]: Use bg-foreground/text-background for prominent action buttons (inverted pattern)
- [03-01]: Preserve SRS-meaningful colors (blue/amber/green) for study stats
- [03-02]: Use hover:bg-accent/50 for table row hover (consistent pattern)
- [03-02]: Use bg-muted/50 for special row differentiation (All Books)
- [03-03]: Keep green heatmap colors (green-200 to green-900) for data visualization meaning
- [03-03]: Keep inverted tooltip pattern for visibility in both themes
- [03-03]: Use bg-muted for empty/future heatmap cells
- [03-04]: Use bg-foreground/text-background for all "Back to Decks" buttons (inverted pattern)
- [03-04]: Use hover:bg-accent for icon buttons (tag, copy, delete)
- [03-04]: Keep green-600 for copy success feedback (intentional semantic color)
- [03-04]: Use hover:text-destructive for delete button hover
- [03-05]: Preserve font-serif on highlight text, note text, edit textareas, and divider tilde
- [03-05]: Use bg-muted for edit containers (highlight and note editing)
- [03-05]: Keep tag colors explicit (blue=global, amber=book-specific) for data meaning
- [03-06]: Use bg-foreground/10 for modal backdrops (tag selector)
- [03-06]: Keep SRS response button colors explicit (red/amber/blue/green for learning convention)

### Pending Todos

None yet.

### Blockers/Concerns

- ~~HSL/OKLCH mismatch in tailwind.config.js blocks all color work~~ (RESOLVED in 01-01)
- ~~Font rendering issues (strange font appearance)~~ (RESOLVED in 01-04)
- ~~Light mode too stark white~~ (RESOLVED in 01-05)
- ~~Dark mode sidebar/background mismatch~~ (RESOLVED in 01-05)
- ~~Redundant ThemeToggle in multiple locations~~ (RESOLVED in 01-06)
- ~~Sidebar overlap on desktop when expanded~~ (RESOLVED in 01-07)
- ~~BottomNav gray colors in dark mode~~ (RESOLVED in 01-07)
- Existing `hooks/useTheme.ts` left in place but unused - can be removed in future cleanup

## Session Continuity

Last session: 2026-01-23T20:14:43Z
Stopped at: PROJECT COMPLETE - All phases finished
Resume file: None - project complete
