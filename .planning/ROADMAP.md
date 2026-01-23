# Roadmap: Evoque UI Overhaul

## Overview

This roadmap transforms Evoque from a functional but visually inconsistent app into a polished, warm/friendly interface with a working theme system. Phase 1 fixes the broken color infrastructure and establishes the foundation. Phase 2 migrates all general pages, modals, and components to shadcn patterns. Phase 3 tackles the critical Study pages with user participation in each decision.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Fix color system, create ThemeProvider, install shadcn components
- [x] **Phase 2: Component Migration** - Modernize all general pages, modals, and transitions
- [x] **Phase 3: Critical Pages** - Study and StudySession with user-approved decisions

## Phase Details

### Phase 1: Foundation
**Goal**: Theme toggle works, colors render correctly, warm palette applied
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07, COLOR-01, COLOR-02, COLOR-05, COMP-01
**Success Criteria** (what must be TRUE):
  1. User can toggle between light and dark mode via UI control
  2. Theme preference persists across browser sessions (localStorage)
  3. App respects system preference on first visit (prefers-color-scheme)
  4. No flash of wrong theme on page load (FOUC prevented)
  5. All colors render correctly (no broken OKLCH/HSL values)
  6. Sidebar displays beside content, not overlapping
  7. Font renders correctly with Outfit family
  8. Light mode has warm cream/beige tone
  9. Dark mode has consistent sidebar/background colors
**Plans**: 7 plans

Plans:
- [x] 01-01-PLAN.md — Fix HSL/OKLCH mismatch and apply warm palette
- [x] 01-02-PLAN.md — Create ThemeProvider, toggle, anti-FOUC, install shadcn components
- [x] 01-03-PLAN.md — Fix sidebar layout and theme toggle position (GAP-01, GAP-05)
- [x] 01-04-PLAN.md — Install and configure Outfit font (GAP-02)
- [x] 01-05-PLAN.md — Adjust color palette for warmer light and consistent dark mode (GAP-03, GAP-04)
- [x] 01-06-PLAN.md — Remove redundant ThemeToggle from App.tsx and Study.tsx (UAT gap closure)
- [x] 01-07-PLAN.md — Fix sidebar layout overlap and BottomNav dark mode colors (UAT gap closure)

### Phase 2: Component Migration
**Goal**: All general pages and modals use shadcn components with consistent styling
**Depends on**: Phase 1
**Requirements**: COLOR-04, COMP-03, COMP-04, PAGE-01, PAGE-02, PAGE-04, PAGE-05, MODAL-01, MODAL-02, MODAL-03, MODAL-04, MODAL-05, MODAL-06
**Pre-completed by Phase 1**: COLOR-03 (App.tsx), PAGE-06 (Sidebar.tsx), COMP-02 (ThemeToggle in Sidebar)
**Obsolete**: PAGE-03 (BookDetails.tsx was removed from codebase)
**Success Criteria** (what must be TRUE):
  1. Dashboard displays stats and charts using shadcn Card components
  2. All pages (Highlights, Settings, Login, Sidebar) use semantic color tokens (no hardcoded zinc-*)
  3. Theme toggle is accessible from Sidebar (pre-completed)
  4. All modals and popovers follow shadcn Dialog/Popover patterns
  5. Interactive elements have visible hover states and smooth transitions (150-300ms)
**Plans**: 7 plans

Plans:
- [x] 02-01-PLAN.md — Fix UI component semantic tokens (button, input, dialog, popover, command, sheet)
- [x] 02-02-PLAN.md — Migrate Login and Dashboard pages to semantic tokens + verify Phase 1 completions
- [x] 02-03-PLAN.md — Migrate Settings page to semantic tokens (preserving parser imports)
- [x] 02-04-PLAN.md — Migrate Highlights page and related components
- [x] 02-05-PLAN.md — Install AlertDialog, migrate DeleteBookModal, DeleteCardPopover, EmptyDeckPopover
- [x] 02-06-PLAN.md — Migrate HighlightEditModal, HighlightHistoryModal, BookContextModal to Dialog
- [x] 02-07-PLAN.md — Migrate remaining child components (gap closure: DashboardCharts, TagSelector, StudyStatusBadge, ErrorBoundary)

### Phase 3: Critical Pages
**Goal**: Study and StudySession pages modernized with user approval at each step
**Depends on**: Phase 2
**Requirements**: CRIT-01, CRIT-02
**Success Criteria** (what must be TRUE):
  1. Study.tsx uses shadcn components with warm styling (user approved each change)
  2. StudySession.tsx uses shadcn components while preserving serif font on cards (user approved each change)
  3. Both pages respond correctly to light/dark theme toggle
  4. User has explicitly approved the final appearance of both pages
**Plans**: 6 plans

Plans:
- [x] 03-01-PLAN.md — Migrate Study.tsx header and All Books button to semantic tokens
- [x] 03-02-PLAN.md — Migrate DeckTable.tsx to semantic tokens (preserving SRS stat colors)
- [x] 03-03-PLAN.md — Migrate StudyHeatmap.tsx container and text to semantic tokens
- [x] 03-04-PLAN.md — Migrate StudySession.tsx container, header, footer shell to semantic tokens
- [x] 03-05-PLAN.md — Migrate StudySession.tsx card display (preserving serif font)
- [x] 03-06-PLAN.md — Complete StudySession.tsx: tag selector modal and verify SRS colors preserved

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 7/7 | Complete | 2026-01-20 |
| 2. Component Migration | 7/7 | Complete | 2026-01-21 |
| 3. Critical Pages | 6/6 | Complete | 2026-01-23 |

---
*Roadmap created: 2026-01-19*
*Last updated: 2026-01-23 - Phase 3 complete (all 6 plans executed with user approval)*
