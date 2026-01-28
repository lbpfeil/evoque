# Roadmap: Evoque v2.0 Design System Overhaul

## Milestones

- v1.0 UI Overhaul - Phases 1-3 (shipped 2026-01-23) -- see `.planning/milestones/v1.0-ROADMAP.md`
- v2.0 Design System Overhaul - Phases 4-7 (in progress)

## Overview

v1.0 shipped a working theme system but no governing design system -- the result is two design languages coexisting accidentally (Compact vs Generous). v2.0 resolves this by picking the winner (Generous), encoding it into rigid design tokens, standardizing every component against those tokens, migrating all 7 pages to canonical patterns, and documenting the final system in a single concise guide. The goal is Apple-level visual uniformity: zero surprises across any page.

## Phases

- [x] **Phase 4: Token Foundation** - Define the rigid design vocabulary (typography, spacing, radius, shadows, motion, icons, z-index, color rules)
- [x] **Phase 5: Component Standardization** - Audit and align all components to the token system
- [ ] **Phase 6: Page Migration** - Migrate all 7 pages + modals to canonical patterns
- [ ] **Phase 7: Design Guide** - Document the living design system in a single concise guide

## Phase Details

### Phase 4: Token Foundation
**Goal**: Every visual decision has exactly one correct answer encoded in the design system
**Depends on**: v1.0 complete (Phases 1-3)
**Requirements**: TOKENS-01, TOKENS-02, TOKENS-03, TOKENS-04, TOKENS-05, TOKENS-06, TOKENS-07, TOKENS-08
**Success Criteria** (what must be TRUE):
  1. Typography uses exactly 6 named sizes -- applying any text style is a lookup, not a judgment call
  2. Spacing uses semantic tokens on a 4px grid -- no arbitrary pixel values for padding/gaps/margins
  3. Border-radius, shadows, and icon sizes each have exactly 3 allowed values
  4. Motion tokens (durations + easings) exist as CSS custom properties usable in any transition
  5. Raw color classes (text-zinc-*, bg-gray-*) are identified and mapped to semantic replacements
**Plans**: 2 plans
Plans:
- [x] 04-01-PLAN.md -- Define CSS custom properties and Tailwind config for all token scales (typography, spacing, radius, shadows, motion, icons, z-index)
- [x] 04-02-PLAN.md -- Audit raw color classes and define semantic replacements (status tokens + migration map)

### Phase 5: Component Standardization
**Goal**: Every shadcn component has one canonical way to be used, and new composition components exist for repeated patterns
**Depends on**: Phase 4
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04
**Success Criteria** (what must be TRUE):
  1. All shadcn component defaults (button height, input height, card radius, badge size) match the token system
  2. A PageHeader component provides the canonical page layout template (title, description, actions)
  3. A data table pattern exists as a reusable structure with consistent header, row, and hover styles
  4. CVA variants for Button, Input, Badge, and Card reflect the token system (no arbitrary overrides needed)
**Plans**: 2 plans
Plans:
- [x] 05-01-PLAN.md -- Fix shadcn component CVA defaults (Button compact variant, Input h-8, Badge verification)
- [x] 05-02-PLAN.md -- Create PageHeader and DataTable composition patterns

### Phase 6: Page Migration
**Goal**: Every page in the app looks like it was designed by the same person on the same day
**Depends on**: Phase 5
**Requirements**: PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05, PAGE-06, PAGE-07, PAGE-08
**Success Criteria** (what must be TRUE):
  1. All 7 pages use PageHeader with consistent title size, spacing, and layout
  2. All tables use token-aligned typography and consistent header/hover styling
  3. StudySession preserves its serif font and intentional deviations while using system tokens for everything else
  4. All modals share consistent header style (DialogTitle text-heading) and button placement
  5. No arbitrary typography values (text-[Xpx]) remain in any page or component file
**Plans**: 7 plans
Plans:
- [ ] 06-01-PLAN.md -- Migrate Login and Dashboard to token typography and PageHeader
- [ ] 06-02-PLAN.md -- Migrate Study, DeckTable, and StudyStatusBadge to token patterns
- [ ] 06-03-PLAN.md -- Migrate Settings to PageHeader and eliminate 15+ arbitrary values
- [ ] 06-04-PLAN.md -- Migrate StudySession while preserving intentional deviations
- [ ] 06-05-PLAN.md -- Migrate Highlights and HighlightTableRow to PageHeader and token typography
- [ ] 06-06-PLAN.md -- Migrate modals, sidebar, bottom nav, and tag selector to token typography
- [ ] 06-07-PLAN.md -- Comprehensive audit and visual verification

### Phase 7: Design Guide
**Goal**: A new developer (or future Claude) can build a page that looks identical to existing ones without asking questions
**Depends on**: Phase 6
**Requirements**: DOC-01, DOC-02
**Success Criteria** (what must be TRUE):
  1. A single design guide document exists with token tables, component usage rules, and page layout patterns
  2. The old compact-ui-design-guidelines.md is replaced/updated to reflect the actual system (no contradictions with codebase)
**Plans**: TBD

## Progress

**Execution Order:** Phase 4 -> 5 -> 6 -> 7

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 4. Token Foundation | v2.0 | 2/2 | Complete | 2026-01-27 |
| 5. Component Standardization | v2.0 | 2/2 | Complete | 2026-01-28 |
| 6. Page Migration | v2.0 | 0/7 | In progress | - |
| 7. Design Guide | v2.0 | 0/TBD | Not started | - |

---
*Created: 2026-01-27*
*Milestone: v2.0 Design System Overhaul*
