# Project Research Summary

**Project:** Revision v4.0 — Quality of Life & Physical Books
**Domain:** OCR, PWA notifications, performance optimization
**Researched:** 2026-02-03
**Confidence:** HIGH

## Executive Summary

Revision v4.0 adds three capability pillars to the existing React/Supabase spaced repetition app: (1) OCR for importing highlights from physical books via camera capture with automatic highlighter color detection, (2) PWA push notifications for daily study reminders and weekly summaries, and (3) performance optimizations including skeleton loaders and lazy loading. The recommended stack keeps all processing client-side where possible — Tesseract.js + OpenCV.js for OCR (zero API costs, user privacy), custom service worker with Supabase Edge Functions + pg_cron for notifications, and React 19's built-in code splitting with shadcn/ui skeletons for performance.

The central technical challenge is integrating these features without breaking the existing architecture. The app's 1280-line StoreContext is already a re-render bottleneck; adding OCR state or notification state there would cause cascading performance issues. The recommended approach is to create isolated contexts for new features (OCRContext, NotificationContext) rather than expanding the monolithic StoreContext. For push notifications, the critical first step is migrating vite-plugin-pwa from `generateSW` to `injectManifest` strategy — adding a separate Firebase service worker (the standard tutorial approach) will conflict with the existing PWA setup.

The key risks are: (1) Tesseract.js memory leaks on mobile if workers are not explicitly terminated, (2) highlighted text color interference causing OCR failures without proper image preprocessing, (3) iOS/EU users cannot receive push notifications due to DMA restrictions, and (4) service worker conflicts breaking the existing PWA. All of these have documented prevention strategies. The recommended phase order is Performance first (unblocks better UX patterns), then Notifications (simpler, establishes service worker pattern), then OCR (most complex, benefits from patterns established earlier).

## Key Findings

### Recommended Stack
*Full detail: `.planning/research/STACK.md`*

Client-side OCR using Tesseract.js v7.0 + OpenCV.js for highlight detection. This approach provides zero API costs, full privacy (images never leave device), and offline capability after initial library load. Cloud OCR (Google Vision at $1.50/1000 images) is explicitly deferred unless client-side accuracy proves insufficient for printed book text.

**Core technologies:**
- **tesseract.js ^7.0.0:** OCR engine — mature, well-documented, v7 fixed memory leaks from earlier versions
- **@techstark/opencv-js ^4.12.0:** Image processing — HSV color detection for highlighter regions, use minimal build (~2MB vs 8MB full)
- **web-push ^3.6.7:** Push notification delivery — VAPID key generation, server-side sending via Supabase Edge Functions
- **vite-plugin-pwa (injectManifest):** Custom service worker — must switch from current `generateSW` strategy
- **pg_cron (Supabase):** Notification scheduling — already available, triggers Edge Functions on schedule
- **shadcn/ui skeleton:** Loading states — already in project, add via CLI if missing

**New npm dependencies:**
```bash
npm install tesseract.js@^7.0.0 @techstark/opencv-js@^4.12.0
npm install -D rollup-plugin-visualizer@^5.14.0
```

### Expected Features
*Full detail: `.planning/research/FEATURES.md`*

**Must have (table stakes):**
1. Camera capture with file picker fallback
2. Basic OCR text extraction from photos
3. Manual text selection/editing after OCR
4. Daily reminder notification at configurable time
5. Permission request flow with soft ask before browser prompt
6. Notification settings in existing Settings page
7. Route-based code splitting (lazy page loads)
8. Skeleton loaders for Dashboard and Highlights

**Should have (differentiators):**
9. Automatic highlight detection by color (yellow/green/pink)
10. Multi-color highlight support with color-to-tag mapping
11. Cards due count in notification body ("You have 15 cards due")
12. Streak preservation alerts ("Don't break your 7-day streak!")
13. Weekly summary notification with stats
14. Badge count on PWA icon (`navigator.setAppBadge()`)
15. Prefetch adjacent routes on hover

**Defer (post-milestone):**
- Batch OCR capture (ensure single capture works first)
- Smart notification timing based on study patterns (needs usage data)
- Page number extraction from images (complex layout detection)
- Book cover/barcode recognition (separate library, adds complexity)
- Handwriting recognition (significantly harder than printed text)
- Multi-language auto-detection (user selects language in settings)

### Architecture Approach
*Full detail: `.planning/research/ARCHITECTURE-V4.md`*

The existing architecture is well-suited for these additions. Key decisions: (1) Client-side OCR with Tesseract.js WASM workers, (2) Push notifications via custom service worker + Supabase Edge Functions + pg_cron, (3) Isolated contexts for new features to avoid StoreContext bloat.

**Major components:**

1. **OCR Module**
   - `OCRImportModal.tsx` — Photo capture UI, preview, cropping
   - `ocrService.ts` — Tesseract.js wrapper, worker lifecycle management
   - `PhotoCapture.tsx` — Camera access, image capture/upload
   - `TextPreview.tsx` — Edit extracted text before saving

2. **Push Notification Module**
   - `sw.ts` — Custom service worker with push handlers
   - `pushService.ts` — Subscription management client-side
   - `NotificationSettings.tsx` — Permission request UI, preferences
   - `check-due-cards/` — Supabase Edge Function for sending pushes

3. **Performance Module**
   - Component-level lazy loading for heavy modals (OCRImportModal, TagManagerSidebar)
   - Skeleton components matching page layouts
   - React 19 compiler for automatic memoization

**Data flow pattern:** OCR terminates by calling existing `importData` function via a new adapter. Push notifications store subscriptions in new `push_subscriptions` table, triggered by pg_cron calling Edge Functions.

### Critical Pitfalls
*Full detail: `.planning/research/PITFALLS.md`*

1. **Service Worker Conflict (CRITICAL)** — Do NOT create separate firebase-messaging-sw.js. Switch to `injectManifest` strategy and merge push handlers into existing service worker. Adding a second SW causes constant reloads and subscription failures.

2. **Tesseract.js Memory Leaks (HIGH)** — Workers must be explicitly terminated with `await worker.terminate()`. Without await, termination may not complete. Create fresh workers periodically; limit to 2 concurrent workers on mobile.

3. **Highlighted Text Color Interference (HIGH)** — Colored highlighter marks interfere with Tesseract's internal binarization. Implement preprocessing: convert to grayscale, apply adaptive thresholding, use color segmentation to neutralize highlights.

4. **StoreContext Re-render Cascade (CRITICAL)** — The 1280-line monolithic context will cause mass re-renders if OCR/notification state is added. Create separate OCRContext and NotificationContext instead.

5. **iOS/EU Push Exclusion (HIGH)** — iOS requires PWA installed to Home Screen (iOS 16.4+). EU users on iOS cannot receive push notifications due to DMA restrictions. Implement graceful degradation: detect iOS + EU, offer alternative (email reminders, in-app notification center).

**Prevention summary:** Architect worker management from the start, implement image preprocessing pipeline, migrate to injectManifest before any Firebase code, create isolated contexts for new features, build permission flow with soft opt-in before hard browser prompt.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Performance Foundation + Service Worker Migration
**Rationale:** Performance patterns (lazy loading, Suspense boundaries) are prerequisites for OCR module which is 10MB+. Service worker migration to `injectManifest` is required before push notifications and is low-risk if done first.
**Delivers:** Route-level lazy loading for all pages, component-level lazy loading pattern established, skeleton components for Dashboard/Highlights, custom service worker with existing PWA functionality preserved.
**Addresses:** Features 7-8 (code splitting, skeletons), unblocks Phase 2 + Phase 3
**Avoids:** PERF-3 (Code Splitting Done Wrong), PUSH-1 (Service Worker Conflict)

### Phase 2: Push Notifications
**Rationale:** Simpler than OCR, high engagement value, builds on service worker migration from Phase 1. Clear scope with well-documented patterns.
**Delivers:** Daily study reminders, notification settings UI, permission flow, cards due count in notification body. Supabase infrastructure (push_subscriptions table, Edge Function, pg_cron job).
**Uses:** Custom service worker from Phase 1, Supabase Edge Functions, pg_cron
**Implements:** Push notification module (pushService.ts, NotificationSettings.tsx)
**Avoids:** PUSH-2 (iOS/EU exclusion via graceful degradation), PUSH-3 (permission timing via soft opt-in)

### Phase 3: OCR Infrastructure
**Rationale:** Most complex feature, benefits from patterns established in Phase 1-2. Can ship as "beta" feature if highlight detection accuracy isn't perfect.
**Delivers:** Camera capture, Tesseract.js text extraction, manual text selection, integration with existing import flow. Proper worker lifecycle management.
**Uses:** Lazy loading patterns from Phase 1, tesseract.js v7.0, @techstark/opencv-js
**Implements:** OCR module (ocrService.ts, OCRImportModal.tsx, PhotoCapture.tsx)
**Avoids:** OCR-1 (memory leaks via explicit termination), OCR-2 (highlight interference via preprocessing), PERF-4 (bundle size via dynamic import)

### Phase 4: OCR Enhancement + Polish
**Rationale:** Automatic highlight detection is the key differentiator but complex. Defer until basic OCR flow is validated.
**Delivers:** Automatic highlight detection by color (yellow/green/pink), multi-color support, highlight preview before OCR, weekly summary notification.
**Uses:** OpenCV.js HSV color thresholding, contour detection
**Addresses:** Features 9-10 (highlight detection), Feature 13 (weekly summary)
**Avoids:** Shipping broken highlight detection by validating basic flow first

### Phase Ordering Rationale

- **Phase 1 before Phase 2:** Service worker migration must happen before push notification handlers are added
- **Phase 1 before Phase 3:** Lazy loading patterns established for OCR module (10MB+)
- **Phase 2 before Phase 3:** Simpler feature first reduces risk; notifications are independent of OCR
- **Phase 3 before Phase 4:** Basic OCR must work before adding highlight detection complexity
- **Grouping follows dependency chain:** Infrastructure -> Simpler feature -> Complex feature -> Enhancement

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 3 (OCR Infrastructure):** Image preprocessing for highlighted text needs algorithm refinement; capture UI guidance for image quality; worker lifecycle patterns
- **Phase 4 (OCR Enhancement):** HSV color thresholds for different highlighter brands; contour detection tuning; real-world accuracy testing

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Performance):** React lazy loading well-documented; vite-plugin-pwa injectManifest has official docs; shadcn skeleton is one CLI command
- **Phase 2 (Push Notifications):** Standard Web Push API; Supabase has official push notification guide; Firebase FCM patterns widely documented

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All libraries verified with official docs and npm; Tesseract.js v7 confirmed, web-push well-documented |
| Features | HIGH for notifications/performance, MEDIUM for OCR highlight detection | Notification patterns standard; OCR accuracy in real-world conditions varies |
| Architecture | HIGH | Reviewed actual codebase; patterns follow existing conventions; no breaking changes |
| Pitfalls | HIGH | Verified with GitHub issues, official documentation, and 2025-2026 community practices |

**Overall confidence:** HIGH

### Gaps to Address

- **Highlight detection accuracy:** Algorithm is documented but real-world accuracy with different highlighter brands, lighting conditions, and paper types needs validation during Phase 4. Plan for "beta" label if accuracy is below 80%.
- **iOS/EU user experience:** Cannot receive push notifications. Need to design in-app alternative (notification center, email digest) and detect this condition to avoid showing broken features.
- **StoreContext migration:** Research recommends isolated contexts for new features. Long-term, the monolithic StoreContext should be split, but this is out of scope for v4.0. Document as technical debt.
- **Tesseract language data hosting:** Need to decide between CDN (faster initial load) vs local hosting (offline reliability). Recommend local in `/public/tessdata` for PWA offline support.

## Sources

### Primary (HIGH confidence)
- [Tesseract.js GitHub](https://github.com/naptha/tesseract.js) — v7.0.0, memory leak fixes, worker patterns
- [Tesseract.js npm](https://www.npmjs.com/package/tesseract.js) — 473k weekly downloads, verified active maintenance
- [Supabase Push Notifications Guide](https://supabase.com/docs/guides/functions/examples/push-notifications) — official Edge Function pattern
- [vite-plugin-pwa injectManifest](https://vite-pwa-org.netlify.app/workbox/inject-manifest.html) — custom service worker strategy
- [web-push npm](https://www.npmjs.com/package/web-push) — VAPID key generation, notification delivery
- [Supabase pg_cron](https://supabase.com/docs/guides/database/extensions/pg_cron) — scheduled function triggers
- [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) — Web Push specification
- [shadcn/ui Skeleton](https://ui.shadcn.com/docs/components/skeleton) — component implementation

### Secondary (MEDIUM confidence)
- [@techstark/opencv-js npm](https://www.npmjs.com/package/@techstark/opencv-js) — v4.12.0, HSV color detection
- [zirkelc/highlights GitHub](https://github.com/zirkelc/highlights) — reference implementation for highlight detection algorithm
- [MagicBell iOS PWA Push](https://www.magicbell.com/blog/best-practices-for-ios-pwa-push-notifications) — iOS-specific requirements
- [Push Notification Best Practices 2026](https://reteno.com/blog/push-notification-best-practices-ultimate-guide-for-2026) — frequency and timing recommendations
- [React Performance Optimization 2025](https://dev.to/alex_bobes/react-performance-optimization-15-best-practices-for-2025-17l9) — lazy loading patterns

### Tertiary (needs validation)
- OCR accuracy benchmarks for highlighted text — limited real-world data, need Phase 4 testing
- Multi-highlighter color detection thresholds — documented ranges may need adjustment for specific brands

---
*Research completed: 2026-02-03*
*Ready for roadmap: yes*
