# Feature Landscape: v4.0 (OCR, Notifications, Performance)

**Domain:** Spaced repetition flashcard app with physical book import, push notifications, and performance improvements
**Researched:** 2026-02-03
**Confidence:** HIGH for notifications/performance, MEDIUM for OCR highlight detection

---

## Executive Summary

v4.0 adds three capability areas to Revision:

1. **OCR Physical Book Import** - Capture highlighted passages from physical books using device camera. The key differentiator is automatic highlight detection (yellow/green/pink markers), reducing manual selection. Browser-based OCR via Tesseract.js is feasible but requires careful UX to handle ~15MB library download and processing time.

2. **PWA Push Notifications** - Daily study reminders when user hasn't reviewed. iOS support requires PWA to be installed to home screen (iOS 16.4+). Firebase Cloud Messaging is the standard solution. Notification fatigue is the primary anti-pattern to avoid.

3. **Performance & Skeletons** - Route-based code splitting, skeleton loaders for perceived performance, and bundle optimization. Vite handles most of this automatically with dynamic imports. Focus on LCP < 2.5s and bundle size awareness.

**Key recommendation:** Start with Performance (unblocks better UX), then Notifications (simpler), then OCR (most complex).

---

## OCR Physical Book Import

### Table Stakes

Features users expect from a physical book highlight capture feature.

| Feature | Description | Complexity | Notes |
|---------|-------------|------------|-------|
| Camera capture | Open device camera, take photo of book page | Low | Use `navigator.mediaDevices.getUserMedia()` or simpler `<input type="file" accept="image/*" capture>` |
| Basic OCR text extraction | Extract all text from captured image | Medium | Tesseract.js v6.0 is the standard. ~15MB download on first use. |
| Manual text selection | User highlights/selects the passage they want after OCR | Low | Text overlay on image with selectable regions |
| Book metadata entry | Title + Author for new books, or select existing book | Low | Reuse existing book selection UI from import flow |
| Edit before save | Review and correct OCR errors before saving | Low | Simple textarea with original image reference |
| Batch capture mode | Take multiple photos in sequence for a reading session | Medium | Queue images, process sequentially or in parallel |
| Progress indicator | Show OCR processing status (can take 2-5 seconds per image) | Low | Essential UX for perceived performance |
| Error handling | Graceful handling of blurry images, poor lighting | Low | Show retry option with tips for better capture |

### Differentiators

Features that set Revision apart from generic OCR apps like Readwise.

| Feature | Description | Complexity | Notes |
|---------|-------------|------------|-------|
| Automatic highlight detection | Detect yellow/green/pink highlighted regions and only OCR those | High | Uses HSV color thresholding + contour detection. OpenCV.js or custom Canvas API manipulation. Most competitors require manual selection. |
| Multi-color highlight support | Detect different highlighter colors (yellow, green, pink, blue, orange) | Medium | HSV ranges for each color. Could map colors to tags. |
| Highlight preview before OCR | Show detected highlight regions visually before running full OCR | Medium | Faster feedback loop than running OCR on entire page |
| Offline OCR capability | Process images without network connection | Medium | Tesseract.js runs entirely client-side once language data is cached |
| Page number extraction | Auto-detect and save page numbers from captured images | High | Requires additional OCR region detection, page number formats vary |
| Book cover recognition | Scan book cover/barcode to auto-populate metadata | Medium | Use ISBN barcode scanning library or Google Books API lookup |
| Smart cropping | Auto-detect book page boundaries, correct perspective | Medium | OpenCV.js or similar. Handles tilted photos. |

### Anti-Features (Don't Build)

| Feature | Why Avoid | What to Do Instead |
|---------|-----------|-------------------|
| Full page OCR by default | Wastes processing time, extracts unwanted text (page numbers, headers, footnotes) | Default to highlight detection; full page is opt-in |
| Continuous camera scanning | Complex implementation, battery drain, unnecessary for reading session use case | Take discrete photos, batch mode is sufficient |
| Cloud OCR processing | Adds latency, requires API costs, privacy concerns for book content | Tesseract.js is sufficient quality for highlighted text, runs locally |
| Handwriting recognition | Significantly harder than printed text, different model requirements, low accuracy | Focus on printed book highlights only; notes can be typed manually |
| Real-time OCR preview | CPU intensive, creates laggy experience, unnecessary since batch capture works | Show processing indicator after capture, not during |
| Multi-language auto-detection | Adds complexity, Tesseract accuracy varies by language, most users read in 1-2 languages | User selects language in settings; default to Portuguese |
| Export to other apps | Scope creep; focus on Revision's own study system | Highlights are for study sessions, not general export |

### User Flow (Recommended)

```
1. Import > "Physical Book" tab
2. Select existing book OR create new (title/author entry)
3. Camera opens (or file picker on desktop)
4. Capture photo(s) of highlighted pages
   - "Add another" button for batch mode
   - Preview thumbnails of queued images
5. Process button triggers OCR pipeline:
   a. Detect highlighted regions (if enabled)
   b. Run Tesseract.js on detected regions (or full page)
   c. Show extracted text with confidence indicator
6. Review screen:
   - List of extracted highlights
   - Edit button for each
   - Delete button for unwanted extractions
   - Optional: add page number, add note
7. Save all > Creates highlights in database
```

### Technical Considerations

**OCR Library Choice:**
- **Tesseract.js v6.0** - Standard choice for browser OCR. ~15MB initial download (language data + WASM). Supports 100+ languages. Runs entirely client-side.
- **tesseract-wasm** - Lighter alternative (~2.1MB with Brotli). Better for apps where OCR is optional feature (like Revision). Uses WebAssembly SIMD when available.

**Highlight Detection Algorithm:**
1. Convert image from RGB to HSV color space
2. Apply color threshold for highlight color (e.g., yellow: H=22-45, S=30-255, V=30-255)
3. Find contours of highlighted regions
4. Extract bounding boxes for each contour
5. Crop original image to bounding boxes
6. Run OCR only on cropped regions

**Lazy Loading Strategy:**
- OCR libraries should be dynamically imported only when user accesses Physical Book import
- Show download progress indicator (~15MB can take 5-10 seconds on slower connections)
- Cache language data in IndexedDB for subsequent uses

**Sources:**
- [Tesseract.js GitHub](https://github.com/naptha/tesseract.js) - Performance docs show lazy loading patterns
- [Extract Highlighted Text from a Book using Python](https://dev.to/zirkelc/extract-highlighted-text-from-a-book-using-python-e15) - HSV thresholding approach
- [Readwise OCR Docs](https://docs.readwise.io/readwise/docs/importing-highlights/ocr) - Competitor workflow reference
- [Highlighted App](https://apps.apple.com/us/app/highlighted-book-highlights/id1480216009) - iOS competitor with excellent UX

---

## PWA Push Notifications

### Table Stakes

Features users expect from study reminder notifications.

| Feature | Description | Complexity | Notes |
|---------|-------------|------------|-------|
| Daily reminder at configurable time | "Time to review!" notification if user hasn't studied today | Medium | Firebase Cloud Messaging + scheduled Cloud Function |
| Permission request flow | Soft ask before hard browser permission | Low | "Enable notifications?" UI before `Notification.requestPermission()` |
| Notification settings page | Enable/disable, set preferred time | Low | Add to existing Settings page |
| Click-through to app | Notification opens Revision study page | Low | Service worker `notificationclick` handler |
| Respect user preferences | Only send if user opted in, honor quiet hours | Low | Store preference in user settings |
| HTTPS requirement | PWA notifications require secure context | N/A | Already using HTTPS via Vercel/Supabase |

### Differentiators

Features that improve notification effectiveness for spaced repetition.

| Feature | Description | Complexity | Notes |
|---------|-------------|------------|-------|
| Smart timing based on study patterns | Send notification when user typically studies, not fixed time | Medium | Analyze review_logs for user's usual study times |
| Cards due count in notification | "You have 15 cards due today" instead of generic reminder | Low | Query due cards count in Cloud Function before sending |
| Book-specific reminders | "Continue studying 'Atomic Habits'" for partially-reviewed books | Medium | Adds personalization, requires tracking session state |
| Streak preservation alerts | "Don't break your 7-day streak! Review now." | Low | Effective engagement mechanic from Duolingo |
| Weekly summary notification | "This week: 47 cards reviewed, 3 books studied" | Low | Scheduled weekly push with stats |
| Skip today acknowledgment | User can dismiss today's reminder without disabling all notifications | Medium | Requires tracking "snoozed" state per day |
| Badge count on PWA icon | Show number of due cards on home screen icon | Low | `navigator.setAppBadge()` API (supported on most platforms) |

### Anti-Features (Don't Build)

| Feature | Why Avoid | What to Do Instead |
|---------|-----------|-------------------|
| Multiple daily notifications | Notification fatigue leads to opt-out. Research shows <5/week optimal. | Single daily reminder is sufficient |
| Notification for every card due | Would spam users with 20+ notifications per day | Aggregate into single "X cards due" notification |
| Aggressive re-engagement | "You haven't studied in 3 days!" guilt-trip notifications | Gentle, positive framing only |
| Sound/vibration customization | Over-engineering for minimal benefit | Use system defaults |
| Notification channels/categories | Android-specific complexity, overkill for a PWA | Single notification type is sufficient |
| In-app notification center | Duplicates browser notification history | Link to Settings for preferences, trust OS notification center |
| SMS/Email fallback | Different infrastructure, different consent requirements | Push notifications only; email is separate concern |

### iOS-Specific Considerations

**Requirements for iOS PWA Push Notifications:**
1. iOS 16.4 or later (released March 2023)
2. PWA must be installed to home screen (Safari-only browsing doesn't support push)
3. Manifest must have `"display": "standalone"`
4. User must grant notification permission after a user gesture

**Detection and Guidance:**
- Detect if running in Safari vs. installed PWA
- If Safari on iOS, show "Add to Home Screen" instructions before notification prompt
- Check `navigator.userActivation` to detect iOS 16.4+ capability

**EU Considerations:**
- Apple briefly removed PWA support in EU (iOS 17.4 beta) but reversed the decision
- Full PWA support including push notifications is available in EU as of 2025

### Technical Implementation

**Firebase Cloud Messaging Setup:**
1. Create Firebase project, enable Cloud Messaging
2. Add `firebase-messaging-sw.js` service worker to `/public`
3. Generate VAPID keys for web push
4. Store FCM tokens in Supabase user record
5. Cloud Function to send notifications based on user timezone and preferences

**Service Worker Pattern:**
```javascript
// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-messaging-compat.js');

firebase.initializeApp({ /* config */ });
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification;
  self.registration.showNotification(title, { body, icon });
});
```

**Sources:**
- [Push Notification Best Practices 2026](https://reteno.com/blog/push-notification-best-practices-ultimate-guide-for-2026) - Frequency and timing recommendations
- [PWA Push Notifications on iOS](https://www.magicbell.com/blog/best-practices-for-ios-pwa-push-notifications) - iOS-specific requirements
- [Firebase Cloud Messaging Web Docs](https://firebase.google.com/docs/cloud-messaging/web/get-started) - Official implementation guide
- [Web Push Notifications with React and FCM](https://dev.to/emmanuelayinde/web-push-notifications-with-react-and-firebase-cloud-messaging-fcm-18kb) - React integration tutorial

---

## Performance & Skeletons

### Table Stakes

Performance optimizations expected in a modern React application.

| Feature | Description | Complexity | Notes |
|---------|-------------|------------|-------|
| Route-based code splitting | Lazy load page components, reduce initial bundle | Low | Vite handles automatically with `React.lazy()` + dynamic imports |
| Skeleton loaders for data fetching | Show content structure while loading instead of spinner | Medium | Replace loading spinners with layout-matching skeletons |
| Bundle size monitoring | Track JS bundle size, prevent regressions | Low | `vite-bundle-visualizer` or `rollup-plugin-visualizer` |
| Image optimization | Lazy load images, use appropriate sizes | Low | Native `loading="lazy"`, consider book cover thumbnails |
| Vendor chunk separation | Separate React/dependencies from app code | Low | Vite `manualChunks` config for better caching |

### Differentiators

Performance patterns that create perceived speed.

| Feature | Description | Complexity | Notes |
|---------|-------------|------------|-------|
| Optimistic UI (already implemented) | Show changes immediately, sync in background | N/A | Already in StoreContext, maintain pattern |
| Suspense boundaries per section | Allow parts of page to load independently | Medium | Wrap independent sections in Suspense |
| Prefetch adjacent routes | Load likely-next pages before user clicks | Low | `<link rel="prefetch">` or React Router `prefetch` |
| Service worker caching | Cache static assets for instant repeat loads | Low | vite-plugin-pwa already configured, verify strategy |
| LCP optimization | Ensure largest element loads quickly | Low | Preload critical fonts, optimize hero images |
| Component-level skeletons | Match skeleton to exact component shape | Medium | More work than generic skeletons but better perceived performance |

### Anti-Features (Don't Build)

| Feature | Why Avoid | What to Do Instead |
|---------|-----------|-------------------|
| Over-aggressive code splitting | Too many small chunks create request waterfalls | Split by route, not by component. Keep chunks > 30KB. |
| SSR/Server Components | Major architecture change, unnecessary for this app size | Keep client-side SPA; focus on initial load optimization |
| Complex caching strategies | Stale-while-revalidate patterns add complexity | Simple cache-first for static, network-first for API |
| Virtualization everywhere | Only needed for very long lists (1000+ items) | Highlights table with pagination doesn't need virtualization |
| Micro-frontend architecture | Massive over-engineering for single-developer app | Keep monolithic React app structure |
| Custom bundler configuration | Vite defaults are well-optimized | Only customize if measurements show specific problems |
| Performance monitoring SaaS | LogRocket, Sentry performance, etc. add cost and complexity | Browser DevTools + Lighthouse are sufficient for this app |

### Skeleton Design Patterns

**Principles:**
1. Match skeleton shape to actual content structure
2. Use subtle animation (pulse or wave) to indicate loading
3. Maintain same dimensions to prevent layout shift (CLS)
4. Respect user motion preferences (`prefers-reduced-motion`)

**Component-Specific Skeletons:**

| Component | Skeleton Pattern |
|-----------|-----------------|
| Page header | Rectangle for title (18px height, 200px width) |
| Book card | Rectangle for cover (150x200px) + 2 text lines |
| Highlights table | 5 rows of rectangles matching column widths |
| Dashboard KPI | Circle/rectangle for number + small text line |
| Heatmap | Grid of small squares matching actual cell layout |
| Study card | Large rectangle for highlight text area |

**Implementation Options:**
- **react-loading-skeleton** - Automatically sizes to parent, minimal config
- **Custom CSS** - Simple `bg-muted animate-pulse rounded` pattern with Tailwind

### Performance Targets

| Metric | Target | Current (estimate) | Notes |
|--------|--------|-------------------|-------|
| LCP | < 2.5s | Unknown | Measure with Lighthouse |
| FCP | < 1.8s | Unknown | Should be achievable with code splitting |
| CLS | < 0.1 | Unknown | Skeletons help prevent layout shift |
| TTI | < 3.5s | Unknown | Route splitting will help |
| Bundle size (initial) | < 150KB gzipped | Unknown | Audit current state first |

**Measurement Approach:**
1. Run Lighthouse audit on current production build
2. Identify specific bottlenecks
3. Apply targeted optimizations
4. Measure again to verify improvement

**Sources:**
- [React Performance Optimization Best Practices 2025](https://dev.to/alex_bobes/react-performance-optimization-15-best-practices-for-2025-17l9)
- [Core Web Vitals](https://web.dev/articles/vitals) - Target metrics
- [Vite Code Splitting](https://sambitsahoo.com/blog/vite-code-splitting-that-works.html) - Implementation patterns
- [Skeleton Loader Best Practices](https://ironeko.com/posts/the-dos-and-donts-of-skeleton-loading-in-react) - UX patterns
- [React Loading Skeleton](https://www.npmjs.com/package/react-loading-skeleton) - Library docs

---

## Feature Dependencies

| Feature | Depends On | Notes |
|---------|-----------|-------|
| OCR highlight detection | Tesseract.js loaded | Must lazy-load OCR library |
| OCR batch capture | Camera API permissions | Request on first use |
| Push notifications | Service worker registered | vite-plugin-pwa handles this |
| Push notifications | User permission granted | Soft ask before hard ask |
| Push notifications (iOS) | PWA installed to home screen | Show installation guidance |
| Daily reminder | Firebase Cloud Functions | Backend scheduling required |
| Cards due count in notification | Supabase query | Cloud Function needs DB access |
| Skeleton loaders | Component structure defined | Design skeletons after final layouts |
| Route code splitting | React.lazy + Suspense | Refactor page imports |
| Bundle monitoring | Build pipeline | Add to CI/CD |

### Dependency Graph

```
Performance Foundation (do first)
  |
  +-- Route code splitting
  +-- Vendor chunk separation
  +-- Bundle size audit
  +-- Skeleton components
  |
  v
Push Notifications (medium complexity)
  |
  +-- Firebase setup
  +-- Service worker enhancement
  +-- Permission flow UI
  +-- Settings integration
  +-- Cloud Function for scheduling
  |
  v
OCR Import (highest complexity)
  |
  +-- Camera/file capture UI
  +-- Tesseract.js integration
  +-- Highlight detection algorithm
  +-- Review/edit flow
  +-- Integration with existing import
```

---

## MVP Recommendations

### Phase Order Recommendation

**Start with Performance** because:
1. Lowest risk, immediate user benefit
2. Establishes patterns (Suspense, lazy loading) used by OCR feature
3. Measurable improvement in Lighthouse scores
4. No new infrastructure required

**Then Notifications** because:
1. Clear scope, well-documented patterns
2. Firebase is a one-time setup that enables future features
3. High engagement value for retention

**Finally OCR** because:
1. Highest complexity, most unknown risk (highlight detection accuracy)
2. Benefits from patterns established in earlier phases
3. Can be shipped as "beta" feature if accuracy isn't perfect

### MVP Scope per Feature

**Performance MVP:**
- [ ] Route-based code splitting (all 6 pages)
- [ ] Skeleton loaders for Dashboard and Highlights
- [ ] Bundle size audit and vendor chunk separation
- [ ] Lighthouse baseline and target metrics

**Notifications MVP:**
- [ ] Daily reminder at user-configured time
- [ ] Simple permission flow with soft ask
- [ ] Settings page toggle and time picker
- [ ] Cards due count in notification body
- [ ] iOS installation guidance

**OCR MVP:**
- [ ] Camera capture (single photo mode first)
- [ ] Tesseract.js text extraction (full page)
- [ ] Manual text selection from extracted text
- [ ] Save to existing book
- [ ] Defer: Automatic highlight detection (can add in v4.1)

### What to Explicitly Defer

| Feature | Defer Until | Reason |
|---------|-------------|--------|
| Automatic highlight detection | v4.1 or user feedback | Complex algorithm, uncertain accuracy |
| Batch OCR capture | After single capture works | Ensure core flow is solid first |
| Smart notification timing | After basic notifications work | Need usage data to optimize |
| Weekly summary notification | v4.1 | Nice-to-have, not essential |
| Book cover barcode scanning | v4.1 | Separate library, adds complexity |

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Performance patterns | HIGH | Well-documented, Vite has excellent defaults |
| Push notification implementation | HIGH | Firebase + FCM is standard, many React tutorials |
| iOS notification requirements | HIGH | Well-documented Apple requirements since iOS 16.4 |
| Tesseract.js OCR | HIGH | Mature library, extensive documentation |
| Highlight detection algorithm | MEDIUM | Algorithm is known but accuracy in real-world conditions varies |
| User behavior for OCR | MEDIUM | Based on competitor analysis (Readwise, Highlighted app) |

---

*Research completed: 2026-02-03*
*Sources: Web searches verified against official documentation where available*
