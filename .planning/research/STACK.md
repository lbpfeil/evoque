# Stack Research: v4.0 (Performance, Notifications, OCR)

**Project:** Revision
**Researched:** 2026-02-03
**Overall Confidence:** HIGH

## Executive Summary

For OCR, use **Tesseract.js v7.0** for client-side processing (free, private, no API costs) combined with **OpenCV.js** for highlight color detection. This approach keeps all image processing in the browser, avoiding cloud API costs and privacy concerns. For PWA push notifications, extend the existing vite-plugin-pwa setup with a custom service worker using `injectManifest` strategy, paired with **Supabase Edge Functions** and **pg_cron** for scheduled delivery. Performance optimization requires minimal new dependencies since React 19's compiler handles most memoization automatically.

---

## OCR/Text Extraction

### Recommended: Tesseract.js + OpenCV.js (Client-Side)

| Component | Library | Version | Purpose |
|-----------|---------|---------|---------|
| OCR Engine | tesseract.js | ^7.0.0 | Extract text from images |
| Image Processing | @techstark/opencv-js | ^4.12.0 | Detect highlighted regions by color |

**Why this over alternatives:**

1. **Privacy**: Images never leave the user's device - critical for personal book photos
2. **Cost**: Zero API costs vs $1.50/1000 images for cloud OCR
3. **Offline**: Works without internet after initial load
4. **Good enough accuracy**: 95%+ for printed text (the primary use case)

**Integration Approach:**

```typescript
// 1. Load image from camera/file
// 2. Use OpenCV.js to create color mask (yellow/green/pink highlighter)
// 3. Extract bounding boxes of highlighted regions
// 4. Pass cropped regions to Tesseract.js for OCR
// 5. Return extracted text for each highlight
```

**Color Detection Strategy (OpenCV.js):**
- Convert image to HSV color space
- Apply `cv.inRange()` with highlighter color thresholds
- Yellow: HSV(20-40, 100-255, 100-255)
- Green: HSV(35-85, 100-255, 100-255)
- Pink: HSV(140-170, 100-255, 100-255)
- Find contours to get bounding boxes
- Crop original image to highlighted regions

**Bundle Size Considerations:**
- Tesseract.js: ~2MB (WASM + English trained data)
- OpenCV.js: ~8MB (full build) or ~2MB (custom minimal build)
- Total: 4-10MB - load lazily only when OCR feature is used

**Confidence:** HIGH (Tesseract.js is industry-standard for browser OCR)

### Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Google Cloud Vision** | 99%+ accuracy, handles handwriting | $1.50/1000 images, requires backend, privacy concerns | REJECTED: Cost adds up for active users |
| **AWS Textract** | Great for forms/tables | Same cost issues, AWS lock-in | REJECTED: Overkill for book highlights |
| **Azure Computer Vision** | Slightly cheaper | Still cloud-based, requires keys | REJECTED: Same issues |
| **Scribe.js** | Improved Tesseract model, PDF support | Less mature (newer project) | CONSIDER: If accuracy issues arise with Tesseract.js |
| **zirkelc/highlights** | Purpose-built for highlighted text | Only 4 GitHub stars, not production-ready | REJECTED: Too immature, but good reference implementation |

**When to reconsider cloud OCR:**
- If user feedback shows Tesseract.js accuracy is insufficient
- If handwriting recognition becomes a requirement
- Consider hybrid: client-side first, cloud fallback for failures

---

## PWA Push Notifications

### Recommended Approach

**Architecture:**
```
[User Device]           [Supabase]              [Push Service]
     |                      |                        |
     |-- Subscribe -------->|                        |
     |   (VAPID public key) |                        |
     |<-- Subscription -----|                        |
     |   (endpoint, keys)   |                        |
     |                      |                        |
     |                      |-- pg_cron triggers --->|
     |                      |   Edge Function        |
     |                      |                        |
     |<------------------- Push Notification --------|
     |   (via FCM/APNs)     |                        |
```

| Component | Technology | Notes |
|-----------|------------|-------|
| Service Worker | Custom (injectManifest) | Extend existing vite-plugin-pwa setup |
| VAPID Keys | web-push CLI | Generate once, store in Supabase Vault |
| Backend | Supabase Edge Functions | Deno-based, handle push delivery |
| Scheduling | pg_cron (Supabase) | Trigger daily/weekly notification jobs |
| Subscription Storage | Supabase Database | New `push_subscriptions` table |

**Required Changes to vite.config.ts:**

```typescript
// Current: strategies: 'generateSW' (default)
// Change to: strategies: 'injectManifest'
VitePWA({
  strategies: 'injectManifest',
  srcDir: 'src',
  filename: 'sw.ts',
  // ... rest of config
})
```

**Custom Service Worker (sw.ts):**

```typescript
import { precacheAndRoute } from 'workbox-precaching';

// Workbox precaching (existing functionality)
precacheAndRoute(self.__WB_MANIFEST);

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon-evq/web-app-manifest-192x192.png',
      badge: '/favicon-evq/favicon-96x96.png',
      data: data.url,
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data || '/'));
});
```

**Edge Function for Sending Notifications:**

```typescript
// supabase/functions/send-push/index.ts
import webpush from 'npm:web-push@3.6.7';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!
);

Deno.serve(async (req) => {
  const { userId, title, body, url } = await req.json();
  // Fetch subscription from database, send notification
});
```

**pg_cron Schedule Examples:**

```sql
-- Daily study reminder at 9 AM user's timezone
SELECT cron.schedule(
  'daily-study-reminder',
  '0 9 * * *',
  $$SELECT net.http_post(...edge_function_url...)$$
);

-- Weekly summary every Sunday at 6 PM
SELECT cron.schedule(
  'weekly-summary',
  '0 18 * * 0',
  $$SELECT net.http_post(...edge_function_url...)$$
);
```

**Browser Support:**
- iOS: Supported since iOS 16.4 (PWA must be added to home screen)
- Android: Full support via Chrome, Firefox
- Desktop: Full support in Chrome, Edge, Firefox

**Confidence:** HIGH (well-documented pattern, Supabase has official guides)

---

## Performance Optimization

### Recommended Tools

| Category | Approach | Library/Tool | Notes |
|----------|----------|--------------|-------|
| **Profiling** | React DevTools Profiler | Built-in | Already available, no install needed |
| **Bundle Analysis** | rollup-plugin-visualizer | ^5.14.0 | Add to vite.config.ts for bundle visualization |
| **Code Splitting** | React.lazy + Suspense | Built-in | Already in React 19 |
| **Memoization** | React 19 compiler | Built-in | Auto-memoizes, manual hooks rarely needed |

**Key Insight:** React 19's compiler automatically handles most memoization. The existing project already has good code splitting in vite.config.ts with manual chunks for supabase, router, radix, and lucide.

### Recommended Lazy Loading Patterns

**Route-Based (Primary Strategy):**

```typescript
// pages/index.ts (lazy exports)
export const Dashboard = lazy(() => import('./Dashboard'));
export const StudySession = lazy(() => import('./StudySession'));
export const Settings = lazy(() => import('./Settings'));

// App.tsx
<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/study/:id" element={<StudySession />} />
    <Route path="/settings" element={<Settings />} />
  </Routes>
</Suspense>
```

**Component-Based (For Heavy Components):**

```typescript
// Lazy load OCR module only when needed
const OCRImporter = lazy(() => import('./components/OCRImporter'));

// In Settings or wherever OCR is triggered
{showOCR && (
  <Suspense fallback={<Spinner />}>
    <OCRImporter />
  </Suspense>
)}
```

### When to Use Manual Memoization (React 19)

React 19's compiler handles most cases automatically. Use manual hooks only for:

1. **useCallback**: When passing callbacks to native DOM event listeners (not React components)
2. **useMemo**: For genuinely expensive computations (>10ms)
3. **React.memo**: For components receiving primitive props from unoptimized parents

**The project likely needs:**
- Lazy loading for pages (Dashboard, Settings, StudySession)
- Lazy loading for OCR module (10MB+ bundle)
- Lazy loading for Recharts (only used on Dashboard)

**Confidence:** HIGH (React 19 patterns well-established)

---

## Skeleton Components

### Recommended Approach: Use Existing shadcn/ui Skeleton

The project already has shadcn/ui configured. Use the built-in Skeleton component.

**Installation (if not already present):**

```bash
npx shadcn@latest add skeleton
```

**Component Implementation:**

```typescript
// components/ui/skeleton.tsx
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
```

**Usage Patterns:**

```typescript
// Card skeleton
export function BookCardSkeleton() {
  return (
    <div className="flex flex-col gap-sm">
      <Skeleton className="h-[180px] w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

// Table row skeleton
export function HighlightRowSkeleton() {
  return (
    <div className="flex items-center gap-md p-md">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
```

**Best Practices:**
- Match skeleton dimensions to actual content (prevents layout shift)
- Use semantic design tokens: `bg-muted`, `rounded-md`
- Keep animation subtle (default `animate-pulse` is good)
- Create reusable skeleton components for cards, rows, headers

**Confidence:** HIGH (shadcn/ui is already in the project)

---

## What NOT to Add

| Library/Service | Reason to Avoid |
|-----------------|-----------------|
| **Cloud OCR APIs (Google, AWS, Azure)** | Unnecessary cost and complexity for book photos with printed text |
| **Firebase Cloud Messaging** | Adds Firebase dependency when Supabase + web-push is sufficient |
| **OneSignal** | Third-party service adds cost and dependency |
| **react-loadable** | Deprecated; use native React.lazy instead |
| **@loadable/component** | Only needed for SSR; this is a client-side SPA |
| **million.js** | React 19 compiler handles virtualization better |
| **why-did-you-render** | Debugging tool, not needed for production optimization |
| **Full OpenCV.js build** | Use minimal/custom build - full is 8MB |
| **Multiple OCR engines** | Start with Tesseract.js only; add complexity if needed |

---

## Integration Summary

| Feature | Library/Service | Version | Integration Notes |
|---------|----------------|---------|-------------------|
| **OCR Engine** | tesseract.js | ^7.0.0 | Lazy load, ~2MB |
| **Image Processing** | @techstark/opencv-js | ^4.12.0 | Lazy load, use minimal build |
| **Push Subscriptions** | web-push (CLI only) | ^3.6.7 | Generate VAPID keys, backend sends |
| **Push Backend** | Supabase Edge Functions | N/A | New function: send-push |
| **Push Scheduling** | pg_cron (Supabase) | 1.6.4 | Already available in Supabase |
| **Service Worker** | vite-plugin-pwa | ^1.2.0 | Already installed, switch to injectManifest |
| **Skeleton** | shadcn/ui skeleton | N/A | Add component via CLI |
| **Bundle Analysis** | rollup-plugin-visualizer | ^5.14.0 | Dev dependency only |

### New npm Dependencies

```bash
# Production dependencies
npm install tesseract.js@^7.0.0 @techstark/opencv-js@^4.12.0

# Development dependencies (optional)
npm install -D rollup-plugin-visualizer@^5.14.0
```

### Backend Setup Required

1. **Supabase Database:**
   - New table: `push_subscriptions` (user_id, endpoint, keys, created_at)
   - Enable pg_cron extension if not already

2. **Supabase Edge Functions:**
   - New function: `send-push` for delivering notifications
   - New function: `daily-reminder` triggered by pg_cron
   - New function: `weekly-summary` triggered by pg_cron

3. **Supabase Vault:**
   - Store VAPID_PUBLIC_KEY
   - Store VAPID_PRIVATE_KEY

---

## Cost Analysis

| Feature | Cost Model | Estimated Monthly Cost |
|---------|------------|----------------------|
| **OCR (Tesseract.js)** | Free (client-side) | $0 |
| **Push Notifications** | Supabase Edge Functions | ~$0 (within free tier for most usage) |
| **pg_cron** | Included in Supabase | $0 |
| **Cloud OCR (if needed later)** | Google Vision | $1.50/1000 images after free tier |

**Total additional cost:** $0 for typical usage patterns

---

## Sources

### OCR
- [Tesseract.js GitHub](https://github.com/naptha/tesseract.js) - Version 7.0.0, December 2025
- [Tesseract.js npm](https://www.npmjs.com/package/tesseract.js) - 473k weekly downloads
- [@techstark/opencv-js npm](https://www.npmjs.com/package/@techstark/opencv-js) - Version 4.12.0
- [zirkelc/highlights](https://github.com/zirkelc/highlights) - Reference implementation for highlight detection
- [Google Cloud Vision Pricing](https://cloud.google.com/vision/pricing) - $1.50/1000 units
- [OCR Accuracy Benchmark 2026](https://research.aimultiple.com/ocr-accuracy/)

### Push Notifications
- [Supabase Push Notifications Guide](https://supabase.com/docs/guides/functions/examples/push-notifications)
- [vite-plugin-pwa injectManifest](https://vite-pwa-org.netlify.app/workbox/inject-manifest.html)
- [web-push npm](https://www.npmjs.com/package/web-push) - Version 3.6.7
- [Supabase pg_cron](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [MDN Push API Tutorial](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Re-engageable_Notifications_Push)
- [MagicBell PWA Push Guide](https://www.magicbell.com/blog/using-push-notifications-in-pwas)

### Performance
- [React Code Splitting](https://legacy.reactjs.org/docs/code-splitting.html)
- [Kent C. Dodds - When to useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback)
- [shadcn/ui Skeleton](https://ui.shadcn.com/docs/components/skeleton)
- [DebugBear - React useMemo and useCallback](https://www.debugbear.com/blog/react-usememo-usecallback)

### Image Processing
- [OpenCV.js Color Detection Tutorial](https://randomnerdtutorials.com/esp32-cam-opencv-js-color-detection-tracking/)
- [OpenCV.js Official Tutorials](https://docs.opencv.org/3.4/d5/d10/tutorial_js_root.html)
- [DigitalOcean OpenCV.js Introduction](https://www.digitalocean.com/community/tutorials/introduction-to-computer-vision-in-javascript-using-opencvjs)

---

*Research completed: 2026-02-03*
*Confidence: HIGH - All recommendations verified with current documentation*
