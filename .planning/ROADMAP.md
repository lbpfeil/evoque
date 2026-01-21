# Roadmap: Evoque UI Overhaul

## Overview

This roadmap transforms Evoque from a functional but visually inconsistent app into a polished, warm/friendly interface with a working theme system. Phase 1 fixes the broken color infrastructure and establishes the foundation. Phase 2 migrates all general pages, modals, and components to shadcn patterns. Phase 3 tackles the critical Study pages with user participation in each decision.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Fix color system, create ThemeProvider, install shadcn components
- [ ] **Phase 2: Component Migration** - Modernize all general pages, modals, and transitions
- [ ] **Phase 3: Critical Pages** - Study and StudySession with user-approved decisions

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
**Requirements**: COLOR-03, COLOR-04, COMP-02, COMP-03, COMP-04, PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05, PAGE-06, MODAL-01, MODAL-02, MODAL-03, MODAL-04, MODAL-05, MODAL-06
**Success Criteria** (what must be TRUE):
  1. Dashboard displays stats and charts using shadcn Card components
  2. All pages (Highlights, BookDetails, Settings, Login, Sidebar) use semantic color tokens (no hardcoded zinc-*)
  3. Theme toggle is accessible from Sidebar
  4. All modals and popovers follow shadcn Dialog/Popover patterns
  5. Interactive elements have visible hover states and smooth transitions (150-300ms)
**Plans**: 6 plans

Plans:
- [ ] 02-01-PLAN.md — Fix UI component semantic tokens (button, input, dialog, popover, command, sheet)
- [ ] 02-02-PLAN.md — Migrate Login and Dashboard pages to semantic tokens
- [ ] 02-03-PLAN.md — Migrate Settings page to semantic tokens (preserving parser imports)
- [ ] 02-04-PLAN.md — Migrate Highlights page and related components
- [ ] 02-05-PLAN.md — Install AlertDialog, migrate DeleteBookModal, DeleteCardPopover, EmptyDeckPopover
- [ ] 02-06-PLAN.md — Migrate HighlightEditModal, HighlightHistoryModal, BookContextModal to Dialog

### Phase 3: Critical Pages
**Goal**: Study and StudySession pages modernized with user approval at each step
**Depends on**: Phase 2
**Requirements**: CRIT-01, CRIT-02
**Success Criteria** (what must be TRUE):
  1. Study.tsx uses shadcn components with warm styling (user approved each change)
  2. StudySession.tsx uses shadcn components while preserving serif font on cards (user approved each change)
  3. Both pages respond correctly to light/dark theme toggle
  4. User has explicitly approved the final appearance of both pages
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 7/7 | ✓ Complete | 2026-01-20 |
| 2. Component Migration | 0/6 | Ready to execute | - |
| 3. Critical Pages | 0/TBD | Not started | - |

---
*Roadmap created: 2026-01-19*
*Last updated: 2026-01-21*
