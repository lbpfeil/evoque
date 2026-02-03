# Architecture Research: v4.0 (Performance, Notifications, OCR)

**Domain:** React/Supabase PWA enhancement
**Researched:** 2026-02-03
**Overall Confidence:** HIGH

## Executive Summary

This research documents architecture patterns for integrating three major features into the existing Revision app:

1. **OCR Integration** - For importing highlights from physical books via photo capture
2. **Push Notifications** - For study reminders when cards are due
3. **Performance Optimizations** - Code splitting, memoization, and lazy loading improvements

The existing architecture is well-suited for these additions. The app already uses React.lazy for route-based code splitting, has vite-plugin-pwa configured (though without push support), and follows an optimistic UI pattern that can be extended. Key architectural decisions:

- **OCR**: Use Tesseract.js (WASM) for client-side processing due to privacy benefits and zero server cost. Cloud OCR (Google Vision) reserved as future premium feature.
- **Push Notifications**: Extend vite-plugin-pwa with `injectManifest` strategy for custom service worker. Use Supabase Edge Functions + pg_cron for scheduled notification dispatch.
- **Performance**: The current lazy loading covers routes; extend to component-level for heavy features (OCR modal, tag manager). Leverage React 19 Compiler for automatic memoization.

---

## OCR Integration Architecture

### Decision: Client-Side with Tesseract.js (WASM)

**Rationale:**
- **Privacy**: Sensitive book content never leaves user's device
- **Cost**: Zero server/API costs vs. Google Vision ($1.50/1000 pages after free tier)
- **Offline**: Works without internet after initial WASM load (~2.1MB with Brotli)
- **Accuracy**: Sufficient for printed book text (Tesseract excels at printed text)

**Tradeoff acknowledged:** Lower accuracy than Google Vision on complex layouts (~85% vs 95%). Acceptable for book highlights which are typically clean printed text.

### New Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `OCRImportModal.tsx` | `components/` | Photo capture UI, preview, cropping |
| `ocrService.ts` | `services/` | Tesseract.js wrapper, worker management |
| `PhotoCapture.tsx` | `components/` | Camera access, image capture/upload |
| `TextPreview.tsx` | `components/` | Edit extracted text before saving |

### Data Flow

```
User Flow:
[Camera/Upload] --> [PhotoCapture Component]
                            |
                            v
                    [Image Preview + Crop]
                            |
                            v
                    [ocrService.ts]
                            |
                            v
                    [Tesseract.js Worker]
                    (WASM processing)
                            |
                            v
                    [Extracted Text]
                            |
                            v
                    [TextPreview + Edit]
                            |
                            v
                    [Create Highlight via StoreContext]
                            |
                            v
                    [Supabase sync (existing pattern)]
```

### Service Architecture: `services/ocrService.ts`

```typescript
// Lazy-loaded worker initialization
import { createWorker, Worker } from 'tesseract.js';

class OCRService {
  private worker: Worker | null = null;

  async initialize(): Promise<void> {
    if (!this.worker) {
      this.worker = await createWorker('por+eng', 1, {
        // Use Supabase Storage or CDN for language files
        langPath: '/tessdata',
        // Enable SIMD if supported for ~1.6x performance
      });
    }
  }

  async recognizeImage(image: File | Blob): Promise<string> {
    await this.initialize();
    const result = await this.worker!.recognize(image);
    return result.data.text;
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrService = new OCRService();
```

### Integration with StoreContext

The OCR flow terminates by calling existing `importData` function, but requires a new adapter:

```typescript
// In StoreContext or as utility
function createHighlightFromOCR(
  text: string,
  bookId: string,
  userId: string
): { books: Book[], highlights: Highlight[] } {
  // Use existing ID generation
  const highlight = {
    id: generateHighlightID(userId, bookTitle, bookAuthor, text, 'ocr-import'),
    bookId,
    text,
    location: 'OCR Import',
    dateAdded: new Date().toISOString(),
  };
  // Return format compatible with importData
}
```

### Supabase Changes for OCR

**No new tables required.** OCR creates standard highlights using existing schema.

**Optional future enhancement:**
- Add `source: 'kindle' | 'pdf' | 'anki' | 'ocr'` column to highlights table
- Useful for analytics but not required for MVP

### Performance Considerations

1. **Lazy load Tesseract.js** - Only import when OCR modal opens (~2.1MB)
2. **Worker reuse** - Keep worker alive during OCR session, terminate on modal close
3. **Image preprocessing** - Resize large images before OCR (reduces processing time)
4. **Progress feedback** - Tesseract provides progress callback, show loading bar

---

## Push Notifications Architecture

### Decision: Custom Service Worker + Supabase Edge Functions

**Rationale:**
- vite-plugin-pwa already configured, but uses `generateSW` strategy
- Must switch to `injectManifest` for push notification handlers
- Supabase Edge Functions handle server-side push dispatch
- pg_cron schedules daily notification checks

### Architecture Overview

```
Notification Flow:

[User grants permission] --> [Store subscription in Supabase]
        |
        v
[pg_cron job (daily)] --> [Edge Function: check-due-cards]
        |
        v
[Query users with due cards] --> [For each user with due cards]
        |
        v
[web-push library] --> [Push to subscription endpoint]
        |
        v
[Service Worker receives push] --> [Show notification]
        |
        v
[User clicks notification] --> [Open app to /study]
```

### New Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `sw.ts` | `src/` | Custom service worker with push handlers |
| `NotificationSettings.tsx` | `components/` | Permission request UI, settings |
| `pushService.ts` | `services/` | Subscription management client-side |
| `check-due-cards/` | `supabase/functions/` | Edge function for sending pushes |

### Service Worker Changes

**Current:** vite-plugin-pwa uses `generateSW` (auto-generated)

**Required:** Switch to `injectManifest` strategy

```typescript
// vite.config.ts changes
VitePWA({
  strategies: 'injectManifest',
  srcDir: 'src',
  filename: 'sw.ts',
  injectManifest: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
  },
  // ... rest of config
})
```

```typescript
// src/sw.ts - Custom service worker
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// Workbox precaching (injected by vite-plugin-pwa)
precacheAndRoute(self.__WB_MANIFEST);

// Supabase API caching (existing)
registerRoute(
  ({ url }) => url.origin.includes('supabase.co'),
  new NetworkFirst({
    cacheName: 'supabase-api',
    networkTimeoutSeconds: 10,
  })
);

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};

  const options: NotificationOptions = {
    body: data.body || 'Voce tem cartoes para revisar!',
    icon: '/favicon-evq/web-app-manifest-192x192.png',
    badge: '/favicon-evq/favicon-96x96.png',
    data: { url: data.url || '/#/study' },
    tag: 'study-reminder',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Revision', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/#/study';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Focus existing window or open new
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
```

### Client-Side Push Service

```typescript
// services/pushService.ts
import { supabase } from '../lib/supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export async function subscribeToPush(userId: string): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // Store subscription in Supabase
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        subscription: JSON.stringify(subscription),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return false;
  }
}

export async function unsubscribeFromPush(userId: string): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    await subscription.unsubscribe();
  }

  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId);
}
```

### Supabase Changes for Push

**New table: `push_subscriptions`**

```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription JSONB NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id);
```

**New column in `user_settings`:**

```sql
ALTER TABLE user_settings
  ADD COLUMN notification_time TIME DEFAULT '09:00',
  ADD COLUMN notifications_enabled BOOLEAN DEFAULT false;
```

### Edge Function: `check-due-cards`

```typescript
// supabase/functions/check-due-cards/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

webpush.setVapidDetails(
  'mailto:admin@revision.app',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!
);

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const today = new Date().toISOString().split('T')[0];

  // Find users with due cards and enabled notifications
  const { data: usersWithDueCards } = await supabase
    .from('study_cards')
    .select(`
      user_id,
      push_subscriptions!inner(subscription, enabled),
      user_settings!inner(notifications_enabled)
    `)
    .lte('next_review_date', today)
    .eq('push_subscriptions.enabled', true)
    .eq('user_settings.notifications_enabled', true);

  // Deduplicate by user_id and send one notification per user
  const sentUsers = new Set<string>();

  for (const card of usersWithDueCards || []) {
    if (sentUsers.has(card.user_id)) continue;
    sentUsers.add(card.user_id);

    try {
      await webpush.sendNotification(
        JSON.parse(card.push_subscriptions.subscription),
        JSON.stringify({
          title: 'Hora de estudar!',
          body: 'Voce tem cartoes para revisar hoje.',
          url: '/#/study',
        })
      );
    } catch (error) {
      console.error(`Failed to send to ${card.user_id}:`, error);
    }
  }

  return new Response(JSON.stringify({ sent: sentUsers.size }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Cron Job Setup

```sql
-- Enable pg_cron extension (if not already)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily notification check at 9:00 AM UTC
SELECT cron.schedule(
  'daily-study-reminders',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/check-due-cards',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('supabase.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
```

---

## Performance Architecture

### Current State Analysis

The app already implements several performance optimizations:

**Existing optimizations:**
- Route-based code splitting via React.lazy (App.tsx lines 16-20)
- Dynamic imports for parsers (Settings.tsx lines 89-124)
- Manual chunk splitting in Vite config (vite.config.ts lines 81-85)
- Deferred non-critical data loading (StoreContext.tsx lines 199-226)
- useMemo for context value (StoreContext.tsx line 1720)
- useCallback for frequently-called functions (StoreContext.tsx)

**Identified improvement opportunities:**
1. Heavy components loaded eagerly (TagManagerSidebar, StudyHeatmap)
2. Large component files (StoreContext 1800+ lines, StudySession 500+ lines)
3. Potential over-rendering from context value object creation
4. No virtualization for large highlight lists

### Code Splitting Strategy

**Route-level (already implemented):**
```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Highlights = lazy(() => import('./pages/Highlights'));
const Study = lazy(() => import('./pages/Study'));
const Settings = lazy(() => import('./pages/Settings'));
const StudySession = lazy(() => import('./pages/StudySession'));
```

**Component-level (to add):**

| Component | Trigger | Bundle Impact |
|-----------|---------|---------------|
| `OCRImportModal` | Opens OCR modal | ~300KB (Tesseract.js) |
| `TagManagerSidebar` | Opens tag manager | ~20KB |
| `StudyHeatmap` | Views Dashboard | ~15KB |
| `HighlightEditModal` | Edits highlight | ~10KB |
| `DeleteBookModal` | Deletes book | ~5KB |

```typescript
// Example: Lazy modal pattern
const OCRImportModal = lazy(() => import('./components/OCRImportModal'));

// Usage in Settings.tsx
{showOCRModal && (
  <Suspense fallback={<ModalSkeleton />}>
    <OCRImportModal onClose={() => setShowOCRModal(false)} />
  </Suspense>
)}
```

### Lazy Loading Points

```
App.tsx
  |
  +-- Pages (already lazy)
  |     |-- Dashboard
  |     |     +-- StudyHeatmap (NEW: lazy on mount)
  |     |
  |     |-- Highlights
  |     |     +-- TagManagerSidebar (NEW: lazy on toggle)
  |     |     +-- HighlightEditModal (NEW: lazy on edit)
  |     |
  |     |-- Settings
  |     |     +-- OCRImportModal (NEW: lazy on button)
  |     |     +-- DeleteBookModal (already conditionally rendered)
  |     |
  |     +-- StudySession
  |           +-- DeleteCardPopover (small, keep eager)
  |
  +-- Services (already dynamic imports)
        |-- pdfParser (import on PDF file)
        |-- ankiParser (import on TSV file)
        |-- parser (import on TXT file)
        +-- ocrService (NEW: import on OCR button)
```

### Memoization Strategy

**React 19 Compiler Integration:**

The React Compiler (released October 2025) automatically handles most memoization. However, for compatibility during transition:

```typescript
// babel.config.js or vite.config.ts
import { reactCompiler } from 'babel-plugin-react-compiler';

export default {
  plugins: [
    ['babel-plugin-react-compiler', {
      // Opt into compiler optimizations
    }],
  ],
};
```

**Manual optimizations to keep:**

1. **StoreContext value** - Already memoized with useMemo, keep it
2. **Heavy computations** - getDeckStats, getCardsDue already use useCallback
3. **Large lists** - Consider virtualization (see below)

**Pattern for component memoization:**

```typescript
// Only memo components receiving object/array props from parent
const BookCard = memo(function BookCard({ book, onSelect }: Props) {
  // Component code
});

// Don't memo leaf components or those with primitive props only
```

### Large List Virtualization

For users with 1000+ highlights, virtualization prevents rendering all rows:

```typescript
// Using react-window
import { FixedSizeList } from 'react-window';

function HighlightList({ highlights }: { highlights: Highlight[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={highlights.length}
      itemSize={80}
      width="100%"
    >
      {({ index, style }) => (
        <HighlightRow
          style={style}
          highlight={highlights[index]}
        />
      )}
    </FixedSizeList>
  );
}
```

**Recommendation:** Implement virtualization in Highlights page when highlight count exceeds 200.

---

## Integration Points with Existing Code

| Existing Component | Integration for v4.0 |
|-------------------|----------------------|
| **StoreContext.tsx** | Add `importFromOCR()` method wrapping existing `importData` pattern. No structural changes needed. |
| **Settings.tsx** | Add OCR button in Import tab, Notification toggle in Preferences tab |
| **vite.config.ts** | Change PWA strategy from `generateSW` to `injectManifest`, add sw.ts source |
| **types.ts** | Add `NotificationSettings` interface, `PushSubscription` type |
| **lib/supabase.ts** | No changes (existing client works with new tables) |
| **lib/supabaseHelpers.ts** | Add `fromSupabasePushSubscription`, `toSupabasePushSubscription` converters |
| **services/\*.ts** | Add `ocrService.ts`, `pushService.ts` as new files |
| **App.tsx** | No changes (existing Suspense boundaries sufficient) |
| **pages/Study.tsx** | Show notification prompt if not subscribed |
| **pages/Dashboard.tsx** | Lazy load StudyHeatmap for performance |
| **pages/Highlights.tsx** | Add virtualization for large lists, lazy load TagManagerSidebar |

---

## Suggested Build Order

### Phase 1: Performance Foundation (Build First)

1. **Migrate to injectManifest PWA strategy** - Required before push notifications
   - Low risk, enables future features
   - Changes vite.config.ts + adds sw.ts

2. **Add component-level lazy loading** - Immediate performance wins
   - Wrap heavy modals in Suspense
   - Dynamic import for OCR/notification services

### Phase 2: OCR Feature

3. **Create ocrService.ts** with Tesseract.js integration
   - Lazy worker initialization
   - Progress callback support

4. **Build OCRImportModal component**
   - Camera capture or file upload
   - Image preview and crop
   - Text extraction and editing
   - Book selection for new highlight

5. **Integrate with Settings.tsx Import tab**
   - Add OCR button alongside existing file upload
   - Connect to existing importData flow

### Phase 3: Push Notifications

6. **Create Supabase infrastructure**
   - push_subscriptions table
   - user_settings notification columns
   - Edge function for sending pushes
   - pg_cron job for scheduling

7. **Build pushService.ts** client-side subscription management

8. **Create NotificationSettings.tsx** component
   - Permission request flow
   - Time selection
   - Enable/disable toggle

9. **Update sw.ts** with push handlers (builds on Phase 1 migration)

10. **Integrate notification prompt** in Study page

### Phase 4: Advanced Performance (Optional)

11. **Add list virtualization** for Highlights page (if needed based on user data size)

12. **Enable React Compiler** for automatic memoization

13. **Profile and optimize** any remaining bottlenecks

---

## Risk Assessment

| Area | Risk Level | Mitigation |
|------|------------|------------|
| PWA strategy migration | LOW | vite-plugin-pwa supports gradual migration; existing caching preserved |
| Tesseract.js bundle size | MEDIUM | Lazy load only when needed; use CDN for language data |
| Push notification permissions | LOW | Graceful fallback if denied; optional feature |
| Browser support for Web Push | LOW | Safari 16+, Chrome, Firefox all support; fallback to no notifications |
| StoreContext size | LOW | No changes to core; new methods follow existing patterns |
| Supabase Edge Function cold starts | LOW | Simple functions start fast; pg_cron provides buffer |

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| OCR architecture | HIGH | Tesseract.js is mature, well-documented; existing parser patterns to follow |
| Push notifications | HIGH | Standard Web Push API; Supabase Edge Functions documented; vite-plugin-pwa supports custom SW |
| Performance patterns | HIGH | Existing code already follows best practices; improvements are incremental |
| Integration points | HIGH | Reviewed actual source code; no breaking changes required |

---

*Research completed: 2026-02-03*

## Sources

### OCR
- [Tesseract.js GitHub](https://github.com/naptha/tesseract.js)
- [Tesseract-WASM Demo](https://robertknight.github.io/tesseract-wasm/)
- [Google Vision vs Tesseract Comparison](https://stackshare.io/stackups/google-cloud-vision-api-vs-tesseract-js)

### Push Notifications
- [Supabase Push Notifications Guide](https://supabase.com/docs/guides/functions/examples/push-notifications)
- [Web Push API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [vite-plugin-pwa Custom Service Worker](https://github.com/vite-pwa/vite-plugin-pwa/discussions/756)

### Performance
- [React Code Splitting Docs](https://legacy.reactjs.org/docs/code-splitting.html)
- [React.memo Reference](https://react.dev/reference/react/memo)
- [useMemo/useCallback Best Practices](https://kentcdodds.com/blog/usememo-and-usecallback)

### Supabase
- [Supabase Cron Documentation](https://supabase.com/docs/guides/cron)
- [Edge Functions Scheduling](https://supabase.com/docs/guides/functions/schedule-functions)
