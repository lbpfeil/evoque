# Pitfalls Research: v4.0 (Performance, Notifications, OCR)

**Project:** Revision (Kindle Highlights)
**Researched:** 2026-02-03
**Confidence:** HIGH (Context7-verified for libraries, official docs for patterns)

## Executive Summary

Adding OCR, push notifications, and performance optimizations to an existing React/Supabase app presents five critical pitfalls to watch:

1. **Tesseract.js Memory Leaks** - Workers must be explicitly terminated; failure causes app crashes on mobile
2. **Service Worker Conflicts** - vite-plugin-pwa uses one service worker; push notifications require merging, not adding a second one
3. **StoreContext Re-render Cascade** - 1280+ line context will trigger mass re-renders when adding new OCR/notification state
4. **iOS Push Notification Limitations** - EU users cannot receive push notifications due to DMA restrictions; must implement fallback
5. **OCR Preprocessing Requirements** - Highlighted text with colored backgrounds causes recognition failures without proper image preprocessing

---

## OCR Pitfalls

### OCR-1: Tesseract.js Memory Leaks and Worker Termination

**Risk:** HIGH | **Likelihood:** HIGH

**What goes wrong:** Using Tesseract.js workers without proper cleanup causes memory to grow linearly with each image processed. On mobile devices, this leads to "WebAssembly.Memory(): could not allocate memory" errors after processing just a few images. The app becomes unresponsive or crashes entirely.

**Warning Signs:**
- Memory usage grows after each OCR operation (check DevTools Performance Monitor)
- Mobile Safari/Chrome becomes sluggish after 3-4 image scans
- "Out of memory" errors in console
- Page refresh doesn't fully clear memory (worker persists)

**Prevention:**
1. **Upgrade to Tesseract.js v6** (January 2025) - This version explicitly fixed memory leaks documented in issue #977
2. **Always await worker termination**: `await worker.terminate()` - Without await, termination may not complete
3. **Don't reuse workers indefinitely** - Create fresh workers periodically; workers "learn" incorrectly over time when processing diverse documents
4. **Limit concurrent workers on mobile** - Max 2 workers even on 8-core devices with 4GB RAM
5. **Only request needed output formats** - v6 defaults to text-only; requesting all formats adds 0.25-0.50s per image and increases memory

**Phase to Address:** Phase 1 (OCR Infrastructure) - Must be architected correctly from the start

**Sources:**
- [Fix memory leaks - Tesseract.js #977](https://github.com/naptha/tesseract.js/issues/977)
- [Version 6 Changes - Tesseract.js #993](https://github.com/naptha/tesseract.js/issues/993)
- [Memory leak after page refresh - Tesseract.js #677](https://github.com/naptha/tesseract.js/issues/677)

---

### OCR-2: Highlighted Text Color Interference

**Risk:** HIGH | **Likelihood:** HIGH

**What goes wrong:** Tesseract OCR performs binarization (converting to black/white) internally. Colored highlighter marks (yellow, pink, blue) interfere with this process, causing partial or complete text recognition failure. Users will scan highlighted passages from physical books and expect the text to be recognized.

**Warning Signs:**
- OCR returns empty or partial results for highlighted sections
- Same text works unhighlighted but fails when highlighted
- Recognition accuracy varies wildly between images
- Different highlighter colors produce different error patterns

**Prevention:**
1. **Implement custom preprocessing pipeline using OpenCV/Canvas API**:
   - Convert to grayscale first (prerequisite for thresholding)
   - Apply adaptive thresholding to handle varying highlight intensities
   - Use color segmentation to identify and neutralize highlight colors
2. **Document supported highlighter colors** - Yellow (RGB ~251,226,152) works better than darker colors
3. **Provide real-time preview** - Show user what Tesseract "sees" after preprocessing
4. **Allow manual correction** - Always provide edit capability for OCR results

**Phase to Address:** Phase 1 (OCR Infrastructure) - Part of preprocessing module

**Sources:**
- [Improve OCR of highlighted text - OCRmyPDF #371](https://github.com/jbarlow83/OCRmyPDF/issues/371)
- [Extract Highlighted Text from a Book](https://dev.to/zirkelc/extract-highlighted-text-from-a-book-using-python-e15)
- [Tesseract documentation - Improving Quality](https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html)

---

### OCR-3: Image Quality Variance from Mobile Cameras

**Risk:** MEDIUM | **Likelihood:** HIGH

**What goes wrong:** Users photograph book pages with phone cameras under variable conditions. Poor lighting, camera shake, low resolution, and lens smudges all degrade OCR accuracy. Tesseract works best at 300+ DPI; phone photos often don't meet this threshold.

**Warning Signs:**
- Accuracy varies dramatically between users/environments
- Same book page produces different results at different times
- Users report "it doesn't work" but can't explain why
- Shadows and glare visible in captured images

**Prevention:**
1. **Implement capture guidance UI**:
   - Show viewfinder overlay indicating optimal framing
   - Detect low light and prompt for flash/better lighting
   - Detect blur before accepting image
   - Show "cleaner lens" prompt when haze detected
2. **Apply preprocessing corrections**:
   - Auto-rotation/deskew for tilted images
   - Brightness/contrast normalization
   - Sharpening edges before OCR
3. **Require minimum image dimensions** - Reject images below 1000px width
4. **Allow retake before processing** - Don't immediately start OCR; let user confirm image quality

**Phase to Address:** Phase 1 (OCR Infrastructure) - Capture UI component

**Sources:**
- [7 Tips to Improve Quality of Scans from Phones - ABBYY](https://pdf.abbyy.com/blog/mobile/seven-tips-for-creating-ideal-scans/)
- [Guide to better mobile images for higher quality OCR - WiseTrend](https://www.wisetrend.com/guide-to-better-mobile-images-from-cell-phone-camera-for-higher-quality-ocr/)

---

### OCR-4: Skewed and Two-Page Book Scans

**Risk:** MEDIUM | **Likelihood:** MEDIUM

**What goes wrong:** When users photograph open books, the image often contains two facing pages with a curve at the spine. Tesseract misinterprets the structure, mixing text from both pages or reading lines incorrectly due to the curve distortion.

**Warning Signs:**
- OCR output contains jumbled words from alternating pages
- Line order is scrambled
- Text near the book spine is consistently wrong
- Users report "gibberish" results

**Prevention:**
1. **Guide single-page capture** - Prompt users to photograph one page at a time
2. **Implement page detection** - Detect when two pages are visible and warn user
3. **Apply deskew correction** - Use Leptonica/OpenCV to straighten skewed text
4. **Consider page segmentation** - Use `--psm` modes for complex layouts

**Phase to Address:** Phase 1 (OCR Infrastructure) - Preprocessing module

**Sources:**
- [Tesseract --psm Impact on Scanned Books #4389](https://github.com/tesseract-ocr/tesseract/issues/4389)
- [Tesseract OCR Guide - Unstract](https://unstract.com/blog/guide-to-optical-character-recognition-with-tesseract-ocr/)

---

## Push Notification Pitfalls

### PUSH-1: Service Worker Conflict with vite-plugin-pwa

**Risk:** CRITICAL | **Likelihood:** HIGH

**What goes wrong:** The app already uses vite-plugin-pwa with `registerType: 'autoUpdate'`. Adding a separate Firebase Messaging service worker creates conflicts - only one service worker can control a scope at a time. Result: constant page reloads, missed subscriptions, or complete notification failure.

**Warning Signs:**
- App constantly reloads after update deployment
- Console shows service worker registration errors
- Push subscriptions silently fail
- Works in development, breaks in production

**Prevention:**
1. **Do NOT create a separate firebase-messaging-sw.js** - This is the standard Firebase tutorial approach but wrong for existing PWAs
2. **Switch to `strategies: 'injectManifest'`** - This lets you create a custom service worker that merges both concerns
3. **Add push event listeners to existing service worker**:
   ```javascript
   // In custom service worker (sw.ts)
   import { precacheAndRoute } from 'workbox-precaching';

   precacheAndRoute(self.__WB_MANIFEST);

   self.addEventListener('push', (event) => {
     // Handle push notification
   });

   self.addEventListener('notificationclick', (event) => {
     // Handle notification click
   });
   ```
4. **Test service worker registration in DevTools** - Applications > Service Workers should show ONE worker

**Phase to Address:** Phase 2 (Push Notifications) - Must be first step before any Firebase integration

**Sources:**
- [Adding a second service worker breaks the app - vite-plugin-pwa #777](https://github.com/vite-pwa/vite-plugin-pwa/issues/777)
- [Webpush support in service workers - vite-plugin-pwa #84](https://github.com/vite-pwa/vite-plugin-pwa/issues/84)
- [Firebase + Vite: Push Notifications Simplified](https://dmelo.eu/blog/vite_pwa/)

---

### PUSH-2: iOS and EU User Exclusion

**Risk:** HIGH | **Likelihood:** HIGH (for EU users)

**What goes wrong:** iOS PWA push notifications only work from iOS 16.4+ AND only when installed to Home Screen. More critically, Apple removed Home Screen web app functionality for EU users in iOS 17.4 to comply with the Digital Markets Act. EU users on iOS cannot receive push notifications at all.

**Warning Signs:**
- EU users report notifications "don't work"
- iOS user engagement metrics are lower than expected
- Push subscription success rate varies by region
- Users confused about "install to Home Screen" requirement

**Prevention:**
1. **Implement graceful degradation**:
   - Detect iOS + EU combination
   - Offer alternative: in-app notification center, email reminders
   - Don't show "Enable Notifications" to users who can't use them
2. **Track notification capability at signup**:
   - Store `notificationCapable: boolean` in user settings
   - Use for analytics segmentation
3. **Design notification features as enhancement, not requirement**:
   - Spaced repetition reminders should work without push
   - Consider daily email digest as fallback
4. **Detect Home Screen installation on iOS**:
   ```javascript
   const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
   ```

**Phase to Address:** Phase 2 (Push Notifications) - Architecture decision before implementation

**Sources:**
- [4 Best Practices for iOS PWA Push Notifications - MagicBell](https://www.magicbell.com/blog/best-practices-for-ios-pwa-push-notifications)
- [How to Set Up Push Notifications for Your PWA - MobiLoud](https://www.mobiloud.com/blog/pwa-push-notifications)

---

### PUSH-3: Permission Request Timing (Immediate Request Trap)

**Risk:** HIGH | **Likelihood:** MEDIUM

**What goes wrong:** Requesting notification permission immediately on page load or login triggers an automatic deny from most users. Once denied, the browser remembers this choice and there's no programmatic way to recover - users must manually enable in browser settings.

**Warning Signs:**
- Very low notification opt-in rates (<20%)
- Users report they "never saw" the permission prompt
- Notification permission state is permanently "denied"
- No second chance to enable notifications

**Prevention:**
1. **Use soft opt-in before hard opt-in**:
   - Show custom UI explaining value: "Get reminded when cards are due"
   - Only trigger browser prompt after user clicks "Enable"
2. **Delay permission request until value is demonstrated**:
   - After first successful study session: "Want to be reminded tomorrow?"
   - After streak milestone: "Don't break your 7-day streak!"
3. **Provide clear recovery instructions**:
   - If denied, show how to enable in browser settings
   - Don't show notification features to denied users
4. **Track permission state**:
   ```javascript
   const permission = Notification.permission; // 'default', 'granted', 'denied'
   ```

**Phase to Address:** Phase 2 (Push Notifications) - UX design before implementation

**Sources:**
- [Using Push Notifications in PWAs - MagicBell](https://www.magicbell.com/blog/using-push-notifications-in-pwas)
- [14 Push Notification Best Practices for 2026 - Reteno](https://reteno.com/blog/push-notification-best-practices-ultimate-guide-for-2026)

---

### PUSH-4: VAPID Key and FCM Configuration Mismatches

**Risk:** MEDIUM | **Likelihood:** MEDIUM

**What goes wrong:** Push notifications work locally but fail in production. Common causes: wrong VAPID key environment, mixing Firebase projects between dev/prod, or hardcoding credentials in service worker.

**Warning Signs:**
- Works on localhost, fails on deployed site
- Push subscriptions succeed but notifications never arrive
- Different behavior between developers' machines
- Firebase console shows no registered devices

**Prevention:**
1. **Use environment variables for all Firebase config** - Never hardcode in service worker
2. **Verify VAPID key matches across**:
   - Firebase Console (Cloud Messaging > Web configuration)
   - Frontend code (`getToken(messaging, {vapidKey: "..."})`)
   - Backend notification sender (if using Edge Functions)
3. **Test on staging environment before production**:
   - Use separate Firebase project for staging
   - Verify full flow: subscribe > send > receive
4. **Implement subscription validation**:
   - Periodically test subscriptions
   - Remove failed endpoints from database

**Phase to Address:** Phase 2 (Push Notifications) - Configuration setup

**Sources:**
- [Get started with Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/web/get-started)
- [Complete Guide to Firebase Web Push Notifications - MagicBell](https://www.magicbell.com/blog/firebase-web-push-notifications)
- [Supabase Push Notifications Documentation](https://supabase.com/docs/guides/functions/examples/push-notifications)

---

## Performance Pitfalls

### PERF-1: StoreContext Re-render Cascade

**Risk:** CRITICAL | **Likelihood:** HIGH

**What goes wrong:** The existing StoreContext is 1280+ lines with 30+ methods and all app state. Adding OCR state (processing status, results queue) or notification state to this context will cause ALL consuming components to re-render on any state change. This is already a performance concern that will become critical with more state.

**Warning Signs:**
- Visible UI lag when OCR processes
- Components re-render when unrelated state changes (React DevTools Profiler)
- Mobile performance degrades noticeably
- "Statistics reveal that around 20-30% of component updates can lead to significant performance degradation when large contexts are used"

**Prevention:**
1. **Split StoreContext into focused contexts** (incremental migration):
   ```
   Current: StoreContext (1280 lines, everything)

   Target:
   - DataContext: books, highlights, studyCards, tags
   - SessionContext: currentSession, sessionStats, reviewLogs
   - SettingsContext: settings, dailyProgress
   - OCRContext: NEW - processing state, results queue
   - NotificationContext: NEW - permission state, preferences
   ```
2. **Separate state from actions**:
   - State consumers shouldn't re-render when only actions change
   - Use pattern: `<StateContext>` + `<ActionsContext>`
3. **Apply useMemo/useCallback to context values**:
   ```javascript
   const value = useMemo(() => ({ books, highlights }), [books, highlights]);
   ```
4. **Consider migration to Zustand for new features**:
   - Zustand's selective subscriptions prevent 40-70% more re-renders vs Context
   - Can coexist with existing Context during migration

**Phase to Address:** Phase 3 (Performance) - But should be considered in OCR/Notification phases to avoid adding state to monolithic context

**Sources:**
- [Optimizing React Context for Performance - 10X Developer](https://www.tenxdeveloper.com/blog/optimizing-react-context-performance)
- [Pitfalls of overusing React Context - LogRocket](https://blog.logrocket.com/pitfalls-of-overusing-react-context/)
- [React Context: Performance Challenges - DEV.to](https://dev.to/jackm_345442a09fb53b/react-context-performance-challenges-and-optimizations-14nd)

---

### PERF-2: Optimistic UI Rollback Failures with New Features

**Risk:** HIGH | **Likelihood:** MEDIUM

**What goes wrong:** The app uses optimistic UI pattern throughout (30+ async methods). Adding new features (OCR imports, notification preferences) that also use optimistic updates can create "windows of inconsistency" - brief moments where UI shows incorrect state. For OCR specifically, rollback from failed imports could lose user's painstakingly scanned data.

**Warning Signs:**
- State "flickers" back and forth during updates
- Concurrent mutations overwrite each other
- User data disappears after network errors
- Undo functionality behaves unexpectedly

**Prevention:**
1. **Never apply optimistic updates for OCR imports**:
   - OCR processing is slow and error-prone
   - Show explicit "Saving..." state instead
   - Only add to local state after Supabase confirms
2. **Implement proper cancellation for concurrent mutations**:
   ```javascript
   // Cancel in-flight queries before optimistic update
   queryClient.cancelQueries({ queryKey: ['highlights'] });
   ```
3. **Store previous state before ANY optimistic update** (existing pattern, maintain it)
4. **Add error boundaries around new features**:
   - OCR failure shouldn't crash the whole app
   - Notification subscription failure should be recoverable

**Phase to Address:** Each phase as new features are added - OCR (Phase 1), Notifications (Phase 2)

**Sources:**
- [Understanding optimistic UI and React's useOptimistic Hook - LogRocket](https://blog.logrocket.com/understanding-optimistic-ui-react-useoptimistic-hook/)
- [Concurrent Optimistic Updates in React Query - TkDodo](https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query)

---

### PERF-3: Code Splitting Done Wrong

**Risk:** MEDIUM | **Likelihood:** MEDIUM

**What goes wrong:** Lazy loading is applied to critical path components (Study page, card rendering), causing visible loading states during core workflows. Alternatively, excessive splitting creates too many HTTP requests, negating bundle size benefits.

**Warning Signs:**
- Suspense fallback visible during normal app usage
- Network tab shows many small chunk requests
- Time to Interactive increases despite smaller initial bundle
- Study session flow has loading spinners between cards

**Prevention:**
1. **DO lazy load**:
   - OCR capture component (large dependency: Tesseract.js)
   - Settings page (accessed infrequently)
   - Dashboard/analytics (not critical path)
2. **DO NOT lazy load**:
   - StudySession.tsx (core flow - 550 lines but critical)
   - StoreContext (needed immediately)
   - Auth flow components
3. **Preload anticipated routes**:
   ```javascript
   // On hover over Study nav link
   const StudySession = lazy(() => import('./pages/StudySession'));
   ```
4. **Use Webpack Bundle Analyzer** to find actual heavy chunks:
   - Current manual chunks: supabase, router, radix, lucide (good)
   - Add OCR as its own chunk: tesseract.js is ~5MB

**Phase to Address:** Phase 3 (Performance) - After features are complete

**Sources:**
- [Code-Splitting - React](https://legacy.reactjs.org/docs/code-splitting.html)
- [Code splitting with React.lazy and Suspense - web.dev](https://web.dev/code-splitting-suspense/)

---

### PERF-4: Tesseract.js Bundle Size Impact

**Risk:** MEDIUM | **Likelihood:** HIGH

**What goes wrong:** Tesseract.js with language data is ~5MB+ uncompressed. Including it in the main bundle will significantly increase initial load time for ALL users, even those who never use OCR. Build warnings trigger: `chunkSizeWarningLimit: 600` already set in vite.config.ts.

**Warning Signs:**
- Build warnings about chunk size
- Initial page load time increases
- Lighthouse performance score drops
- Users on slow connections experience timeouts

**Prevention:**
1. **Dynamic import Tesseract.js only when needed**:
   ```javascript
   const startOCR = async () => {
     const Tesseract = await import('tesseract.js');
     // Use Tesseract
   };
   ```
2. **Add tesseract to manual chunks** in vite.config.ts:
   ```javascript
   manualChunks: {
     'tesseract': ['tesseract.js'],
     // ... existing chunks
   }
   ```
3. **Consider language data loading**:
   - Load only Portuguese (por) and English (eng) by default
   - Host language files locally vs. CDN for reliability
4. **Show loading progress** during Tesseract initialization (~2-3 seconds on mobile)

**Phase to Address:** Phase 1 (OCR Infrastructure) - Architecture decision

**Sources:**
- [Integrating OCR in the browser with tesseract.js - Transloadit](https://transloadit.com/devtips/integrating-ocr-in-the-browser-with-tesseract-js/)
- [Image To Text Conversion With React And Tesseract.js - Smashing Magazine](https://www.smashingmagazine.com/2021/06/image-text-conversion-react-tesseract-js-ocr/)

---

## Integration Pitfalls

### INT-1: Breaking SM-2 Algorithm with New Data Sources

**Risk:** HIGH | **Likelihood:** LOW

**What goes wrong:** OCR-imported highlights create StudyCards that feed into the SM-2 spaced repetition system. If OCR produces garbage text or truncated content, the algorithm will schedule reviews for unusable cards. User loses trust in the study system.

**Warning Signs:**
- Users see garbled text in study sessions
- Review quality ratings are consistently low for OCR cards
- Users delete OCR-imported content frequently
- SM-2 statistics become skewed

**Prevention:**
1. **Require user confirmation of OCR text before creating cards**:
   - Show extracted text
   - Allow editing
   - Explicit "Add to Study" action
2. **Set flag on OCR-imported highlights**: `source: 'ocr'`
   - Enables filtering in Highlights page
   - Allows analytics segmentation
3. **Don't auto-create StudyCards from OCR imports**:
   - Unlike Kindle imports which have clean text
   - User must explicitly add to study
4. **Implement confidence scoring**:
   - Tesseract provides confidence per word
   - Flag low-confidence results for review

**Phase to Address:** Phase 1 (OCR Infrastructure) - Data model design

---

### INT-2: Notification Permissions Breaking Auth Flow

**Risk:** MEDIUM | **Likelihood:** LOW

**What goes wrong:** Requesting notification permission during auth/onboarding flow creates confusion. If permission prompt appears while Supabase auth redirect is processing, the auth can fail or user gets stuck.

**Warning Signs:**
- Users report getting "stuck" after login
- Auth errors increase after notification feature deployment
- Mobile users have more auth issues than desktop

**Prevention:**
1. **Never request permissions during auth flow**
2. **Wait for full app load before any permission requests**:
   ```javascript
   useEffect(() => {
     if (isLoaded && user && !hasPromptedNotifications) {
       // Safe to prompt
     }
   }, [isLoaded, user]);
   ```
3. **Store permission prompt state in localStorage**:
   - Avoid re-prompting on every session
   - Respect "remind me later" choice

**Phase to Address:** Phase 2 (Push Notifications) - UX implementation

---

### INT-3: Translation/i18n Gaps for New Features

**Risk:** LOW | **Likelihood:** HIGH

**What goes wrong:** New OCR and notification UI text is added in English only, breaking the Portuguese-first experience. Translation files in `public/locales/pt-BR/` are not updated.

**Warning Signs:**
- Mixed language UI
- Translation function `t()` returns keys instead of values
- Users report "some parts are in English"

**Prevention:**
1. **Add all new strings to translation files FIRST**:
   - OCR: capture prompts, error messages, success states
   - Notifications: permission requests, preference labels
2. **Use proper Portuguese accents**:
   - "configuracoes" vs "configuracoes" (accents matter)
3. **Test with Portuguese locale forced**
4. **Add to PR checklist**: "All user-visible strings are translated"

**Phase to Address:** All phases - Ongoing requirement

---

## Pitfall Summary Matrix

| Pitfall | Severity | Likelihood | Phase | Detection Difficulty |
|---------|----------|-----------|-------|---------------------|
| OCR-1: Memory Leaks | HIGH | HIGH | 1 | Easy (DevTools) |
| OCR-2: Highlighted Text | HIGH | HIGH | 1 | Medium |
| OCR-3: Image Quality | MEDIUM | HIGH | 1 | Medium |
| OCR-4: Two-Page Scans | MEDIUM | MEDIUM | 1 | Easy |
| PUSH-1: Service Worker Conflict | CRITICAL | HIGH | 2 | Easy |
| PUSH-2: iOS/EU Exclusion | HIGH | HIGH | 2 | Hard (regional) |
| PUSH-3: Permission Timing | HIGH | MEDIUM | 2 | Medium |
| PUSH-4: VAPID Mismatch | MEDIUM | MEDIUM | 2 | Medium |
| PERF-1: Context Re-renders | CRITICAL | HIGH | 1,2,3 | Medium (Profiler) |
| PERF-2: Optimistic UI Rollback | HIGH | MEDIUM | 1,2 | Hard |
| PERF-3: Code Splitting | MEDIUM | MEDIUM | 3 | Easy (Lighthouse) |
| PERF-4: Bundle Size | MEDIUM | HIGH | 1 | Easy (Build) |
| INT-1: SM-2 Data Quality | HIGH | LOW | 1 | Easy |
| INT-2: Auth + Permissions | MEDIUM | LOW | 2 | Hard |
| INT-3: i18n Gaps | LOW | HIGH | All | Easy |

---

## Priority Actions by Phase

### Phase 1: OCR Infrastructure
1. **First:** Architect worker management to prevent memory leaks (OCR-1)
2. **Second:** Implement preprocessing pipeline for highlighted text (OCR-2)
3. **Third:** Build capture UI with quality guidance (OCR-3)
4. **Throughout:** Create separate OCRContext, don't add to StoreContext (PERF-1)

### Phase 2: Push Notifications
1. **First:** Switch to `injectManifest` strategy before any Firebase code (PUSH-1)
2. **Second:** Design graceful degradation for iOS/EU (PUSH-2)
3. **Third:** Implement soft opt-in UX (PUSH-3)
4. **Throughout:** Create separate NotificationContext (PERF-1)

### Phase 3: Performance
1. **First:** Split StoreContext (PERF-1) - biggest impact
2. **Second:** Audit code splitting decisions (PERF-3)
3. **Third:** Implement lazy loading for OCR module (PERF-4)

---

*Research completed: 2026-02-03*
*Confidence: HIGH - Verified with official documentation, GitHub issues, and current (2025-2026) community practices*

## Sources

**OCR:**
- [Tesseract.js Memory Leak Fix #977](https://github.com/naptha/tesseract.js/issues/977)
- [Tesseract Documentation - Improving Quality](https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html)
- [OCR Accuracy Benchmarks 2026 - AI Multiple](https://research.aimultiple.com/ocr-accuracy/)
- [Smashing Magazine - OCR with React](https://www.smashingmagazine.com/2021/06/image-text-conversion-react-tesseract-js-ocr/)

**Push Notifications:**
- [vite-plugin-pwa Service Worker Conflicts #777](https://github.com/vite-pwa/vite-plugin-pwa/issues/777)
- [Firebase + Vite Push Notifications](https://dmelo.eu/blog/vite_pwa/)
- [iOS PWA Push Notification Best Practices](https://www.magicbell.com/blog/best-practices-for-ios-pwa-push-notifications)
- [Supabase Push Notifications Docs](https://supabase.com/docs/guides/functions/examples/push-notifications)

**Performance:**
- [React Context Performance Pitfalls - 10X Developer](https://www.tenxdeveloper.com/blog/optimizing-react-context-performance)
- [Pitfalls of Overusing React Context - LogRocket](https://blog.logrocket.com/pitfalls-of-overusing-react-context/)
- [TkDodo - Concurrent Optimistic Updates](https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query)
