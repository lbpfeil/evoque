# Roadmap: Revision v4.0

## Overview

Revision v4.0 delivers three capability pillars: performance optimization (lazy loading, skeletons, code splitting), PWA push notifications (daily reminders, streak alerts, weekly summaries), and OCR for importing highlights from physical books via camera capture with automatic highlighter color detection. The recommended execution order is Performance first (establishes lazy loading patterns for 10MB+ OCR bundle), then Notifications (simpler, builds on service worker migration), then OCR (most complex, benefits from patterns established earlier).

## Milestones

- v1.0 UI Overhaul - Phases 1-3 (shipped 2026-01-23)
- v2.0 Design System Overhaul - Phases 4-10 (shipped 2026-01-29)
- v3.0 Dashboard Intelligence - Phases 11-16 (shipped 2026-01-31)
- **v4.0 Quality of Life & Physical Books** - Phases 17-20 (in progress)

## Phases

- [ ] **Phase 17: Performance Foundation** - Lazy loading, skeletons, service worker migration
- [ ] **Phase 18: Push Notifications** - Daily reminders, streak alerts, weekly summaries
- [ ] **Phase 19: OCR Infrastructure** - Camera capture, text extraction, import flow
- [ ] **Phase 20: OCR Enhancement** - Automatic highlighter color detection

## Phase Details

### Phase 17: Performance Foundation
**Goal**: Application loads faster with skeleton states and routes are lazy-loaded; custom service worker enables future push notification support.
**Depends on**: Nothing (first phase of v4.0)
**Requirements**: PERF-01, PERF-02, PERF-03, PERF-04, PERF-05, SW-01, SW-02
**Success Criteria** (what must be TRUE):
  1. User sees skeleton loader when navigating to Dashboard while data loads
  2. User sees skeleton loader when navigating to Highlights while data loads
  3. User hovering navigation links triggers prefetch of target route bundle
  4. Heavy modals (OCR, TagManager) load their code only when opened
  5. PWA continues to work offline after service worker migration (existing functionality preserved)
**Plans**: 3 plans

Plans:
- [ ] 17-01-PLAN.md — Route lazy loading with prefetch, skeleton primitives, and useSkeletonDelay hook
- [ ] 17-02-PLAN.md — High-fidelity skeleton components for all data-fetching pages
- [ ] 17-03-PLAN.md — Service worker migration to injectManifest with offline sync

### Phase 18: Push Notifications
**Goal**: Users receive timely reminders to study, preserving engagement and streaks.
**Depends on**: Phase 17 (custom service worker required)
**Requirements**: PUSH-01, PUSH-02, PUSH-03, PUSH-04, PUSH-05, PUSH-06, PUSH-07
**Success Criteria** (what must be TRUE):
  1. User can enable notifications via soft-ask flow before browser permission prompt
  2. User receives daily reminder at configured time showing count of due cards
  3. User receives streak alert when about to break study sequence
  4. User receives weekly summary notification with study statistics
  5. PWA icon shows badge count with pending cards (where supported)
**Plans**: TBD

Plans:
- [ ] 18-01: Notification permission flow and settings UI
- [ ] 18-02: Supabase infrastructure (subscriptions table, Edge Function, pg_cron)
- [ ] 18-03: Daily reminder and streak alert implementation
- [ ] 18-04: Weekly summary and badge count

### Phase 19: OCR Infrastructure
**Goal**: Users can import highlights from physical books by taking photos of marked pages.
**Depends on**: Phase 17 (lazy loading patterns for 10MB+ bundle)
**Requirements**: OCR-01, OCR-02, OCR-03, OCR-04, OCR-05, OCR-06
**Success Criteria** (what must be TRUE):
  1. User can access physical book import from Settings page
  2. User can select existing book or create new book for import target
  3. User can capture photos via camera or select from file system
  4. User can capture multiple photos before processing (batch mode)
  5. User can review and edit extracted text before saving as highlights
**Plans**: TBD

Plans:
- [ ] 19-01: OCR import entry point and book selection
- [ ] 19-02: Camera capture and photo management
- [ ] 19-03: Tesseract.js integration and text extraction
- [ ] 19-04: Text review and highlight creation flow

### Phase 20: OCR Enhancement
**Goal**: System automatically detects highlighted text regions by color, reducing manual selection.
**Depends on**: Phase 19 (basic OCR must work first)
**Requirements**: OCR-07, OCR-08, OCR-09, OCR-10
**Success Criteria** (what must be TRUE):
  1. System detects and extracts text marked with yellow highlighter
  2. System detects and extracts text marked with green highlighter
  3. System detects and extracts text marked with pink highlighter
  4. User sees preview of detected highlights before confirming import
**Plans**: TBD

Plans:
- [ ] 20-01: OpenCV.js integration and color detection pipeline
- [ ] 20-02: Multi-color highlighter support (yellow, green, pink)
- [ ] 20-03: Highlight preview and confirmation flow

## Progress

**Execution Order:**
Phases execute in numeric order: 17 -> 18 -> 19 -> 20

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 17. Performance Foundation | 2/3 | In Progress|  |
| 18. Push Notifications | 0/4 | Not started | - |
| 19. OCR Infrastructure | 0/4 | Not started | - |
| 20. OCR Enhancement | 0/3 | Not started | - |

---
*Roadmap created: 2026-02-03*
*Last updated: 2026-02-21*
