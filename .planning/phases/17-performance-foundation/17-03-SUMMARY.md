---
phase: 17-performance-foundation
plan: 03
subsystem: infra
tags: [pwa, workbox, service-worker, background-sync, offline, react]

# Dependency graph
requires: []
provides:
  - Custom service worker (sw.ts) with workbox precaching, NetworkFirst Supabase caching, and BackgroundSyncPlugin for offline review queuing
  - useOnlineStatus hook for detecting online/offline status
  - Offline indicator in Sidebar (WifiOff icon + "Offline" text)
  - injectManifest strategy in vite.config.ts (enables Phase 18 push notification handlers)
affects: [18-push-notifications]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Custom service worker pattern: injectManifest strategy over generateSW for extensibility"
    - "Background sync pattern: BackgroundSyncPlugin queues POST/PATCH requests when offline, replays on reconnect"
    - "Online status hook: navigator.onLine + window online/offline events for reactive detection"

key-files:
  created:
    - sw.ts
    - hooks/useOnlineStatus.ts
  modified:
    - vite.config.ts
    - components/Sidebar.tsx

key-decisions:
  - "injectManifest over generateSW: custom sw.ts required for Phase 18 push notification handlers (addEventListener push/notificationclick)"
  - "NetworkOnly + BackgroundSyncPlugin for review_logs POST and study_cards PATCH: ensures offline study submissions are queued and replayed, not silently dropped"
  - "Amber-500 color for offline indicator: visible in both light/dark modes without being alarming"

patterns-established:
  - "Service worker extensibility: all future SW handlers added directly to sw.ts, not via vite.config.ts workbox options"
  - "Offline UI: use useOnlineStatus hook anywhere offline state needs to be reflected in UI"

requirements-completed: [SW-01, SW-02]

# Metrics
duration: 2min
completed: 2026-02-21
---

# Phase 17 Plan 03: Custom Service Worker + Offline Indicator Summary

**Custom workbox service worker with injectManifest strategy, BackgroundSyncPlugin for offline review queuing, and amber offline indicator in Sidebar**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-21T14:23:52Z
- **Completed:** 2026-02-21T14:25:30Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Custom sw.ts replaces auto-generated service worker, enabling Phase 18 push notification handlers
- BackgroundSyncPlugin queues review_logs POST and study_cards PATCH requests when offline and replays on reconnect
- useOnlineStatus hook provides reactive online/offline detection via browser events
- Sidebar shows WifiOff icon + "Offline" text when disconnected, hidden when online

## Task Commits

Each task was committed atomically:

1. **Task 1: Create custom service worker and update vite.config.ts** - `a609f9a` (feat)
2. **Task 2: Create useOnlineStatus hook and add offline indicator to Sidebar** - `ef410d3` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `sw.ts` - Custom workbox service worker with precaching, NetworkFirst Supabase caching, BackgroundSyncPlugin for offline review/card queuing, push notification placeholders
- `hooks/useOnlineStatus.ts` - React hook tracking navigator.onLine + online/offline events
- `vite.config.ts` - Migrated from generateSW to injectManifest strategy pointing to sw.ts
- `components/Sidebar.tsx` - Added WifiOff import, useOnlineStatus hook call, offline indicator JSX between header and nav

## Decisions Made
- Used injectManifest over generateSW: the custom service worker file is required to add addEventListener('push') and addEventListener('notificationclick') handlers for Phase 18 — these cannot be injected via generateSW config options.
- NetworkOnly + BackgroundSyncPlugin (not NetworkFirst) for review_logs and study_cards mutations: ensuring offline study session data is never silently dropped; requests are queued in IndexedDB and replayed with 24-hour retention window.
- Kept Sidebar 17-01 changes intact: read current Sidebar.tsx state before applying changes (Plan 17-01 had already added lazyPages import and onMouseEnter prefetch). Applied only non-overlapping changes (imports + offline indicator JSX).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Sidebar.tsx had already been modified by Plan 17-01 (lazyPages import, onMouseEnter prefetch on navItems). The plan anticipated this and instructed reading the current file state first. Changes merged cleanly as predicted since they target non-overlapping regions.

## User Setup Required
None - no external service configuration required. Service worker registers automatically via vite-plugin-pwa.

## Next Phase Readiness
- sw.ts is the foundation for Phase 18 push notifications — push/notificationclick handler stubs are in place
- injectManifest strategy confirmed working: build produces dist/sw.js with 46 precached entries
- useOnlineStatus hook available for any component needing offline-aware behavior
- No blockers for Phase 18

## Self-Check: PASSED

- FOUND: sw.ts
- FOUND: hooks/useOnlineStatus.ts
- FOUND: vite.config.ts (modified)
- FOUND: components/Sidebar.tsx (modified)
- FOUND: .planning/phases/17-performance-foundation/17-03-SUMMARY.md
- FOUND commit: a609f9a (Task 1 - custom service worker)
- FOUND commit: ef410d3 (Task 2 - useOnlineStatus hook + sidebar indicator)

---
*Phase: 17-performance-foundation*
*Completed: 2026-02-21*
