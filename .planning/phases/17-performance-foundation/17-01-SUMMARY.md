---
phase: 17-performance-foundation
plan: 01
subsystem: ui
tags: [react, lazy-loading, code-splitting, skeleton, performance]

# Dependency graph
requires: []
provides:
  - Centralized lazyWithPreload page exports (pages/lazyPages.ts)
  - Route prefetch on hover via Sidebar NavLink onMouseEnter
  - Lazy-loaded TagManagerSidebar with Suspense wrapper
  - Base Skeleton primitive component (components/ui/skeleton.tsx)
  - useSkeletonDelay hook with 200ms delay / 300ms min display / 150ms fade pattern
affects: [17-02-skeleton-pages, 18-ocr-feature]

# Tech tracking
tech-stack:
  added: [react-lazy-with-preload@2.2.1]
  patterns:
    - lazyWithPreload for all route-level components (prefetchable chunks)
    - Named-export lazy import via .then(m => ({ default: m.ExportName }))
    - Suspense with fallback=null for sidebar/modal lazy components
    - 200ms delay + 300ms minimum display + 150ms fade transition for skeleton UX

key-files:
  created:
    - pages/lazyPages.ts
    - components/ui/skeleton.tsx
    - hooks/useSkeletonDelay.ts
  modified:
    - App.tsx
    - components/Sidebar.tsx
    - pages/Highlights.tsx

key-decisions:
  - "All 5 page routes use lazyWithPreload from centralized lazyPages.ts module to avoid circular dependency between App.tsx and Sidebar.tsx"
  - "TagManagerSidebar wrapped in isTagManagerOpen conditional to avoid loading chunk before user interaction"
  - "Skeleton delay pattern: 200ms before show, 300ms minimum display, 150ms CSS fade on content reveal"

patterns-established:
  - "lazyPages.ts pattern: centralize all lazy route exports to share between App.tsx (route rendering) and Sidebar.tsx (prefetch)"
  - "Skeleton hook pattern: useSkeletonDelay(isLoaded) returns { showSkeleton, showContent } for consistent loading states"

requirements-completed: [PERF-01, PERF-04, PERF-05]

# Metrics
duration: 2min
completed: 2026-02-21
---

# Phase 17 Plan 01: Code Splitting Infrastructure Summary

**lazyWithPreload routes for all 5 pages with hover prefetch, lazy TagManagerSidebar, Skeleton primitive and useSkeletonDelay hook with 200/300/150ms timing pattern**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-21T14:23:59Z
- **Completed:** 2026-02-21T14:26:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- All 5 route components use `lazyWithPreload` from centralized `pages/lazyPages.ts`, enabling both code splitting and hover-prefetch
- Sidebar NavLinks call `.preload()` on `onMouseEnter`, triggering bundle fetch before navigation
- TagManagerSidebar moved to its own 10KB chunk, only loaded when user opens tag manager
- Skeleton primitive and useSkeletonDelay hook ready for Plan 02 page-level skeleton screens

## Task Commits

Each task was committed atomically:

1. **Task 1: Install react-lazy-with-preload, create lazyPages module, wire prefetch into App.tsx + Sidebar** - `5b7f4ae` (feat)
2. **Task 2: Lazy-load TagManagerSidebar, create Skeleton primitive and useSkeletonDelay hook** - `6e19053` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `pages/lazyPages.ts` - Centralized lazyWithPreload exports for Dashboard, Highlights, Study, Settings, StudySession
- `App.tsx` - Updated to import from lazyPages instead of using React.lazy directly
- `components/Sidebar.tsx` - Import lazy pages, add component field to navItems, call .preload() on hover
- `pages/Highlights.tsx` - Lazy-load TagManagerSidebar with Suspense wrapper (conditional on isTagManagerOpen)
- `components/ui/skeleton.tsx` - Base skeleton primitive: animate-pulse + bg-muted, composable via className
- `hooks/useSkeletonDelay.ts` - Delay/min-display/fade hook: 200ms delay, 300ms min, 150ms fade transition

## Decisions Made

- Centralized all lazy page exports in `pages/lazyPages.ts` to avoid circular dependency (Sidebar imports from pages, pages import from Sidebar would be circular)
- Renamed `Settings` page import to `SettingsPage` in Sidebar to avoid collision with lucide-react `Settings` icon
- Wrapped TagManagerSidebar in `isTagManagerOpen` conditional before Suspense so the chunk is not even attempted until the user opens the panel

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Build warnings about duplicate keys in `ankiParser.ts` are pre-existing and unrelated to this plan's changes.

## Next Phase Readiness

- `pages/lazyPages.ts`, `Skeleton`, and `useSkeletonDelay` are all ready for Plan 02 to use when building page-level skeleton screens
- No blockers

---
*Phase: 17-performance-foundation*
*Completed: 2026-02-21*
