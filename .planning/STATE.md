# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-03)

**Core value:** Revisao eficiente de highlights — ajudar usuarios a reter conhecimento dos livros que leem atraves de repeticao espacada (SM-2).
**Current focus:** Phase 17 - Performance Foundation

## Current Position

Phase: 17 of 20 (Performance Foundation)
Plan: 3 of 3 in current phase
Status: In Progress
Last activity: 2026-02-21 — Completed 17-01: Code splitting infrastructure with lazyWithPreload + Skeleton

Progress: [###.......] 30%

## Performance Metrics

**Velocity:**
- Total plans completed: 1
- Average duration: 2 min
- Total execution time: 0.03 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 17 | 1/3 | 2 min | 2 min |
| 18 | 0/4 | - | - |
| 19 | 0/4 | - | - |
| 20 | 0/3 | - | - |

**Recent Trend:**
- Last 5 plans: 2 min
- Trend: New milestone

*Updated after each plan completion*
| Phase 17 P01 | 2 | 2 tasks | 6 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v4.0]: Performance first (unblocks lazy loading patterns for OCR)
- [v4.0]: Push notifications via custom service worker (not Firebase)
- [v4.0]: Client-side OCR with Tesseract.js (zero API costs, privacy)
- [v4.0]: Isolated contexts for new features (avoid StoreContext bloat)
- [Phase 17]: injectManifest over generateSW: custom sw.ts needed for Phase 18 push notification addEventListener handlers
- [Phase 17]: BackgroundSyncPlugin for offline review_logs POST/study_cards PATCH: queued in IndexedDB with 24h retention, not silently dropped
- [Phase 17-01]: lazyPages.ts centralization avoids circular dependency between App.tsx and Sidebar.tsx (both need lazy page refs)
- [Phase 17-01]: TagManagerSidebar wrapped in isTagManagerOpen conditional before Suspense to prevent premature chunk fetch

### Pending Todos

None yet.

### Blockers/Concerns

- [Research]: iOS/EU users cannot receive push notifications due to DMA restrictions. Need graceful degradation.
- [Research]: Tesseract.js memory leaks on mobile if workers not terminated. Must implement explicit cleanup.
- [Research]: Highlighted text color interferes with OCR. Preprocessing pipeline required.

## Session Continuity

Last session: 2026-02-21
Stopped at: Completed 17-01-PLAN.md: Code splitting + Skeleton infrastructure
Resume file: None
