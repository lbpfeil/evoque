# Roadmap: Evoque UI Overhaul

## Overview

This roadmap transforms Evoque from a functional but visually inconsistent app into a polished, warm/friendly interface with a working theme system. Phase 1 fixes the broken color infrastructure and establishes the foundation. Phase 2 migrates all general pages, modals, and components to shadcn patterns. Phase 3 tackles the critical Study pages with user participation in each decision.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Foundation** - Fix color system, create ThemeProvider, install shadcn components
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
**Plans**: TBD

Plans:
- [ ] 01-01: TBD
- [ ] 01-02: TBD

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
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD
- [ ] 02-03: TBD

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
| 1. Foundation | 0/TBD | Not started | - |
| 2. Component Migration | 0/TBD | Not started | - |
| 3. Critical Pages | 0/TBD | Not started | - |

---
*Roadmap created: 2026-01-19*
*Last updated: 2026-01-19*
