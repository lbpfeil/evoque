# Phase 17: Performance Foundation - Research

**Researched:** 2026-02-21
**Domain:** React code splitting, skeleton loaders, PWA service worker migration (generateSW → injectManifest), offline sync
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Skeleton appearance:**
- Pulse animation (opacity fade) — clean, minimal, matches shadcn/ui style
- High fidelity: skeletons mirror exact positions of cards, charts, text blocks — zero layout shift on load
- All data-fetching pages get skeletons (Dashboard, Highlights, Study deck selection, Settings), not just Dashboard + Highlights
- Use semantic tokens: bg-muted with border-border — automatically adapts to dark mode

**Loading transitions:**
- Brief delay (~200ms) before showing skeleton — stay on current page to avoid flash for fast loads
- Minimum 300ms skeleton display time — prevents flicker, feels intentional
- Content fades in (~150ms transition) replacing skeleton — smooth, polished
- Sidebar and header always visible during route transitions — only main content area shows skeleton (app shell stays stable)

**Offline behavior:**
- Cached app shell + last data: app loads from cache offline, shows stale data with offline indicator
- Full offline study: cards cached locally, reviews queued and synced when connection returns
- Subtle banner/badge for offline status (e.g., small indicator in sidebar or top bar)
- Show sync status when reconnected: brief "Syncing X reviews..." indicator
- Auto-sync queued reviews on reconnection with visible progress

### Claude's Discretion

- Prefetch strategy (hover, viewport, idle — not discussed, Claude picks)
- Exact skeleton component implementation (reusable Skeleton primitive vs per-page)
- Service worker caching strategy details (precache vs runtime cache split)
- Offline data storage mechanism (IndexedDB, localStorage, Cache API)
- Bundle splitting boundaries (which modals/routes get their own chunks)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PERF-01 | Páginas são carregadas via lazy loading (code splitting por rota) | Already implemented in App.tsx via React.lazy + Suspense. Phase upgrades the fallback from spinner to skeleton. |
| PERF-02 | Dashboard exibe skeleton loader enquanto dados carregam | Need to replace the `!isLoaded` text guard with high-fidelity skeleton matching Dashboard layout |
| PERF-03 | Highlights exibe skeleton loader enquanto dados carregam | Highlights has no `isLoaded` guard today — need to add + skeleton for header/toolbar/table area |
| PERF-04 | Modais pesados (OCR, TagManager) são carregados via lazy loading | TagManagerSidebar (396 lines) is synchronously imported in Highlights.tsx. OCR not yet built (Phase 19) — but modal lazy pattern needs establishing now |
| PERF-05 | Rotas adjacentes são pré-carregadas no hover de links de navegação | Sidebar NavLinks need onMouseEnter handlers calling `.preload()` on lazy page components |
| SW-01 | PWA migrada para estratégia injectManifest (custom service worker) | Requires switching vite.config.ts from default generateSW to `strategies: 'injectManifest'` + creating `src/sw.ts` |
| SW-02 | Funcionalidade offline existente preservada após migração | Must replicate current workbox config (globPatterns, supabase NetworkFirst) inside the custom sw.ts |
</phase_requirements>

---

## Summary

Phase 17 has three parallel workstreams: (1) code splitting already exists but needs upgraded fallbacks and prefetch, (2) skeleton components need to be built and wired into the existing `isLoaded` pattern, and (3) the service worker needs to migrate from auto-generated to custom so Phase 18 can add push notification handlers.

**Critical discovery:** Routes are already lazy-loaded via `React.lazy()` in `App.tsx`. The Suspense fallback is currently a spinner (`PageLoadingFallback`). The real work is (a) building skeleton components that match each page's layout, (b) replacing the per-page `!isLoaded` text guard with those skeletons, and (c) adding the Suspense delay/fade transition logic. The offline sync requirement is partially scoped to this phase — the service worker migration is the foundation, but the actual "queue reviews offline + sync" behaviour lives in the SW and StoreContext offline detection layer.

**Primary recommendation:** Build a reusable `Skeleton` primitive (single bg-muted animate-pulse div), compose it into per-page skeleton layouts (DashboardSkeleton, HighlightsSkeleton, StudySkeleton, SettingsSkeleton), replace text loading guards with these skeletons, add hover prefetch to Sidebar NavLinks via `react-lazy-with-preload`, and migrate the service worker to `injectManifest` with `workbox-background-sync` for offline review queuing.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `vite-plugin-pwa` | 1.2.0 (installed) | Manages service worker build and manifest injection | Already installed, official Vite PWA solution |
| `workbox-precaching` | 7.4.0 (installed) | Precache app shell assets in custom SW | Already in package.json |
| `workbox-routing` | 7.x (transitive, installed) | Register runtime caching routes in custom SW | Already in node_modules |
| `workbox-strategies` | 7.x (transitive, installed) | NetworkFirst/CacheFirst/StaleWhileRevalidate handlers | Already in node_modules |
| `workbox-background-sync` | 7.x (transitive, installed) | Queue failed POST requests (reviews) offline | Already in node_modules via vite-plugin-pwa |
| `workbox-core` | 7.x (transitive, installed) | `clientsClaim`, `skipWaiting` | Already in node_modules |
| `react-lazy-with-preload` | latest (~1.1.3) | Attaches `.preload()` to React.lazy components for hover prefetch | Minimal, purpose-built, MIT |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tailwind `animate-pulse` | built-in | CSS pulse animation for skeleton | Already available, no install needed |
| `tailwindcss-animate` | installed | Provides `animate-in fade-in` for content reveal | Already installed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `react-lazy-with-preload` | Manual preload pattern (`Component.preload = importFn`) | Hand-rolled is ~5 lines, works identically. react-lazy-with-preload adds zero deps and is well-typed. Use either. |
| `workbox-background-sync` | Custom IndexedDB queue in StoreContext | Background sync uses native Background Sync API for automatic retry. Custom IndexedDB needs manual `online` event handling. Background sync is more reliable on mobile. |
| `animate-pulse` | Shimmer gradient animation | Shimmer is more complex (gradient keyframes, mask). Pulse matches shadcn/ui style and is locked decision. |

**Installation:**
```bash
npm install react-lazy-with-preload
```
(All workbox packages are already installed transitively via `vite-plugin-pwa`.)

---

## Architecture Patterns

### Recommended Project Structure
```
evoque/
├── src/
│   └── sw.ts                   # NEW: custom service worker (injectManifest strategy)
├── components/
│   └── ui/
│       └── skeleton.tsx        # NEW: base Skeleton primitive
│   └── skeletons/
│       ├── DashboardSkeleton.tsx  # NEW: high-fidelity page skeleton
│       ├── HighlightsSkeleton.tsx # NEW: high-fidelity page skeleton
│       ├── StudySkeleton.tsx      # NEW: high-fidelity page skeleton
│       └── SettingsSkeleton.tsx   # NEW: high-fidelity page skeleton
├── App.tsx                     # MODIFIED: lazy→lazyWithPreload, Sidebar prefetch
├── components/Sidebar.tsx      # MODIFIED: onMouseEnter prefetch handlers
├── pages/Dashboard.tsx         # MODIFIED: replace !isLoaded text with DashboardSkeleton
├── pages/Highlights.tsx        # MODIFIED: add isLoaded check + HighlightsSkeleton, lazy TagManager
├── pages/Study.tsx             # MODIFIED: replace !isLoaded text with StudySkeleton
├── pages/Settings.tsx          # MODIFIED: add loading guard + SettingsSkeleton
└── vite.config.ts              # MODIFIED: strategies: 'injectManifest', srcDir: 'src', filename: 'sw.ts'
```

### Pattern 1: Base Skeleton Primitive
**What:** A single reusable div with `bg-muted animate-pulse rounded-md` that accepts className for sizing.
**When to use:** As building block for all page-level skeleton compositions.
**Example:**
```typescript
// Source: shadcn/ui skeleton component pattern
// components/ui/skeleton.tsx
import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}

export { Skeleton }
```

### Pattern 2: High-Fidelity Page Skeleton
**What:** Per-page skeleton that mirrors the exact layout of the real page. Zero layout shift.
**When to use:** Replace the `if (!isLoaded) return <text>` guard in each page.
**Example (Dashboard):**
```typescript
// components/skeletons/DashboardSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton'

export const DashboardSkeleton = () => (
  <div className="p-md sm:p-lg">
    {/* PageHeader skeleton */}
    <div className="flex items-center justify-between mb-lg">
      <div className="space-y-xs">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-24 rounded-lg" />
    </div>

    {/* Quick Study CTA skeleton */}
    <Skeleton className="h-20 w-full rounded-xl mb-lg" />

    {/* KPI grid: 2 cols mobile, 4 cols desktop */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm mb-lg">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border border-border rounded-xl p-md space-y-xs">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-12" />
        </div>
      ))}
    </div>

    {/* Heatmap skeleton */}
    <Skeleton className="h-32 w-full rounded-xl mb-lg" />

    {/* Top books grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
      <Skeleton className="md:col-span-2 h-48 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  </div>
)
```

### Pattern 3: Skeleton Delay + Fade Transition (Locked Decision)
**What:** Show nothing for 200ms, then skeleton for min 300ms, then fade in real content at 150ms.
**When to use:** Every page that shows a skeleton — prevents flash for fast loads.
**Implementation approach:** Use a custom hook `useSkeletonDelay`:
```typescript
// hooks/useSkeletonDelay.ts
// Source: custom pattern based on locked design decisions
import { useState, useEffect } from 'react'

export function useSkeletonDelay(isLoaded: boolean, delay = 200, minDisplay = 300) {
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    let delayTimer: ReturnType<typeof setTimeout>
    let minTimer: ReturnType<typeof setTimeout>

    if (!isLoaded) {
      delayTimer = setTimeout(() => setShowSkeleton(true), delay)
    } else {
      setShowSkeleton(false)
      minTimer = setTimeout(() => setShowContent(true), minDisplay)
    }

    return () => {
      clearTimeout(delayTimer)
      clearTimeout(minTimer)
    }
  }, [isLoaded, delay, minDisplay])

  return { showSkeleton, showContent }
}
```
**Note:** The 200ms delay means if `isLoaded` fires before 200ms, the skeleton never appears. The 300ms minimum means after data arrives, skeleton stays visible briefly before content fades in.

### Pattern 4: Route Lazy Loading with Prefetch on Hover
**What:** Replace `React.lazy()` with `lazyWithPreload()`. Attach `.preload()` calls to Sidebar NavLink `onMouseEnter`.
**When to use:** All main page routes in App.tsx, with corresponding Sidebar nav items.
**Example:**
```typescript
// Source: react-lazy-with-preload README pattern
// App.tsx
import { lazyWithPreload } from 'react-lazy-with-preload'

const Dashboard = lazyWithPreload(() => import('./pages/Dashboard'))
const Highlights = lazyWithPreload(() => import('./pages/Highlights'))
const Study = lazyWithPreload(() => import('./pages/Study'))
const Settings = lazyWithPreload(() => import('./pages/Settings'))
const StudySession = lazyWithPreload(() => import('./pages/StudySession'))

// Export for Sidebar to call preload:
export { Dashboard, Highlights, Study, Settings, StudySession }
```

```typescript
// Sidebar.tsx — add onMouseEnter to each NavLink
// Pass preloaders as prop or import directly
<NavLink
  to={item.path}
  onMouseEnter={() => item.component?.preload()}
  className={...}
>
```
**Alternative (no library):** Store the import function and call it on hover. This avoids the dependency at the cost of a few extra lines. Either approach is valid.

### Pattern 5: Heavy Modal Lazy Loading
**What:** Load TagManagerSidebar code only when the user opens it, not on page load.
**When to use:** PERF-04 — any component ≥100 lines opened conditionally.
**Example:**
```typescript
// pages/Highlights.tsx
// Source: React.lazy pattern
import { lazy, Suspense, useState } from 'react'

const TagManagerSidebar = lazy(() =>
  import('../components/TagManagerSidebar').then(m => ({ default: m.TagManagerSidebar }))
)

// In JSX — Suspense fallback can be null or minimal since sidebar has its own open state
{isTagManagerOpen && (
  <Suspense fallback={null}>
    <TagManagerSidebar open={isTagManagerOpen} onOpenChange={setIsTagManagerOpen} />
  </Suspense>
)}
```

### Pattern 6: injectManifest Service Worker
**What:** Custom TypeScript service worker that precaches the app shell and adds handlers for runtime caching and future push notifications.
**When to use:** SW-01 — replaces the generateSW auto-generated service worker.
**vite.config.ts change:**
```typescript
// Source: https://vite-pwa-org.netlify.app/guide/inject-manifest
VitePWA({
  strategies: 'injectManifest',
  srcDir: 'src',
  filename: 'sw.ts',
  injectManifest: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
  },
  // Keep the existing manifest block unchanged
  manifest: { /* same as current */ },
  registerType: 'autoUpdate',
})
```

**src/sw.ts — minimal viable custom SW:**
```typescript
// Source: https://github.com/vite-pwa/vite-plugin-pwa/blob/main/docs/guide/inject-manifest.md
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'
import { clientsClaim } from 'workbox-core'

declare let self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()

// Precache all app shell assets (self.__WB_MANIFEST injected by vite-plugin-pwa)
precacheAndRoute(self.__WB_MANIFEST)

// Runtime cache: Supabase API — NetworkFirst, 1 hour TTL
registerRoute(
  ({ url }) => url.hostname.includes('supabase.co'),
  new NetworkFirst({
    cacheName: 'supabase-api',
    plugins: [
      // expiration handled via workbox-expiration if needed
    ]
  })
)

// Push notification handler placeholder (Phase 18 will add full implementation)
self.addEventListener('push', (event) => {
  // Phase 18: implement push notification display
})
```

**TypeScript tsconfig note:** The project's `tsconfig.json` does not include `"WebWorker"` in `lib`. For the service worker TypeScript to type-check correctly, either:
- Add a separate `tsconfig.sw.json` with `"lib": ["ES2022", "WebWorker"]`
- Or use `declare let self: ServiceWorkerGlobalScope` to type the global manually (works without tsconfig changes since `noEmit: true`)

### Pattern 7: Offline Review Queue
**What:** When offline, intercept Supabase POST requests (review submissions) and queue them in IndexedDB via workbox-background-sync. Replay automatically on reconnection.
**When to use:** Part of SW-01/SW-02 offline behavior requirement.
**Example (in src/sw.ts):**
```typescript
// Source: workbox-background-sync docs (Context7 verified)
import { BackgroundSyncPlugin } from 'workbox-background-sync'
import { NetworkOnly } from 'workbox-strategies'

const reviewSyncPlugin = new BackgroundSyncPlugin('review-queue', {
  maxRetentionTime: 24 * 60, // 24 hours in minutes
})

// Intercept Supabase review_logs POST requests
registerRoute(
  ({ url, request }) =>
    url.hostname.includes('supabase.co') &&
    url.pathname.includes('review_logs') &&
    request.method === 'POST',
  new NetworkOnly({ plugins: [reviewSyncPlugin] }),
  'POST'
)
```

**Critical limitation:** workbox-background-sync requires the native Background Sync API (Chrome, Edge, Firefox) for automatic replay. Safari does not support the Background Sync API. On Safari, Workbox falls back to replaying when the service worker next starts up (not guaranteed). For offline review queuing on iOS Safari, the app must also handle this at the application layer (StoreContext offline detection + manual sync on reconnect).

### Pattern 8: Offline Indicator UI
**What:** Detect online/offline and show a subtle status badge. Show sync progress on reconnect.
**When to use:** Required by locked decisions — sidebar badge or top bar indicator.
**Implementation:**
```typescript
// hooks/useOnlineStatus.ts
import { useState, useEffect } from 'react'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
```

### Anti-Patterns to Avoid
- **Using `generateSW` with `importScripts`:** Cannot add push notification handlers; must use `injectManifest`.
- **Putting all skeleton markup inline in page files:** Creates duplicate code; use the `components/skeletons/` folder.
- **Showing skeleton immediately on navigation:** The 200ms delay is a locked decision — always use the delay hook.
- **Forgetting `cleanupOutdatedCaches()`:** Old precache entries accumulate across deployments causing stale asset issues.
- **Not declaring `ServiceWorkerGlobalScope`:** TypeScript will error on `self.__WB_MANIFEST` without proper typing.
- **Applying `animate-pulse` without `rounded-md`:** Skeleton edges look broken without border radius.
- **Lazy loading TagManagerSidebar without Suspense wrapper:** Will throw if Suspense boundary is missing.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Prefetchable lazy components | Custom factory function | `react-lazy-with-preload` | Tiny, typed, handles edge cases (idempotent preload calls) |
| Offline request queuing | Custom IndexedDB queue in StoreContext | `workbox-background-sync` | Background Sync API integration, automatic retry via sync event, already installed |
| Skeleton animation | Custom CSS keyframes | Tailwind `animate-pulse` | Built-in, already configured, matches locked decision |
| SW asset manifest | Manual glob list | `self.__WB_MANIFEST` injection | Vite plugin generates this automatically; hand-rolling causes cache misses on hash changes |

**Key insight:** All workbox packages (`workbox-routing`, `workbox-strategies`, `workbox-background-sync`, `workbox-core`) are already installed as transitive dependencies of `vite-plugin-pwa`. Zero new installs needed for the service worker work.

---

## Common Pitfalls

### Pitfall 1: Skeleton Flicker on Fast Loads
**What goes wrong:** Skeleton appears briefly then disappears, causing a distracting flash.
**Why it happens:** `isLoaded` resolves in <200ms on fast connections but the skeleton shows anyway.
**How to avoid:** The 200ms delay hook (Pattern 3) — only show skeleton if loading takes longer than 200ms.
**Warning signs:** Skeleton visible for <100ms on localhost.

### Pitfall 2: injectManifest Build Failure: `self.__WB_MANIFEST` Not Found
**What goes wrong:** Build fails with "Could not find injectionPoint in service worker".
**Why it happens:** The custom SW file does not call `precacheAndRoute(self.__WB_MANIFEST)`, so vite-plugin-pwa has nowhere to inject the manifest.
**How to avoid:** Always include `precacheAndRoute(self.__WB_MANIFEST)` as the first thing in sw.ts.
**Warning signs:** Build error mentioning `injectionPoint`.

### Pitfall 3: TypeScript Errors in sw.ts
**What goes wrong:** `self.__WB_MANIFEST` and `ServiceWorkerGlobalScope` are unknown types.
**Why it happens:** The project's `tsconfig.json` does not have `"WebWorker"` in `lib`.
**How to avoid:** Add `declare let self: ServiceWorkerGlobalScope` at the top of sw.ts. This is sufficient because `noEmit: true` means the SW is compiled by Vite, not tsc directly.
**Warning signs:** TypeScript errors about `__WB_MANIFEST` on `self`.

### Pitfall 4: Named Export with React.lazy
**What goes wrong:** `lazy(() => import('../components/TagManagerSidebar'))` fails because TagManagerSidebar is a named export (not default).
**Why it happens:** `React.lazy()` requires the module's default export.
**How to avoid:** Use `.then(m => ({ default: m.TagManagerSidebar }))` or add a re-export file.
**Warning signs:** Runtime error "The default export of a lazily-loaded module must be a React component".

### Pitfall 5: Background Sync Not Working on iOS Safari
**What goes wrong:** Offline reviews are lost on iOS — they don't sync when the user comes back online.
**Why it happens:** Safari does not support the Background Sync API. Workbox falls back to "replay on next SW start" which only triggers when the app reopens.
**How to avoid:** Complement SW-level queuing with application-level online detection: when `navigator.onLine` returns true after being false, trigger a manual sync of any locally-stored reviews. Store queued reviews in `localStorage` as a fallback.
**Warning signs:** Reviews on iOS do not appear in Supabase after going offline and reconnecting.

### Pitfall 6: Skeleton Layout Shift (PERF-02/PERF-03 Compliance)
**What goes wrong:** Page layout jumps when real content replaces the skeleton because skeleton dimensions differ from content.
**Why it happens:** Skeleton heights are estimated, not matched to actual content height.
**How to avoid:** Match skeleton dimensions to the computed sizes of actual components. Use fixed heights on skeleton blocks corresponding to the actual rendered element heights (e.g., StatCard ≈ `h-24`, PageHeader ≈ `h-14`).
**Warning signs:** Visible layout jump when content loads, observable with Chrome DevTools Layout Shift recording.

### Pitfall 7: Prefetch Firing Too Early (Mobile Hover Issues)
**What goes wrong:** On touch devices, hover events fire just before tap, causing unnecessary network requests.
**Why it happens:** Mobile browsers simulate `mouseenter` on touch.
**How to avoid:** Prefetch on hover is low-risk for chunk files (they're cached after first load). The prefetch is idempotent — calling `.preload()` multiple times returns the same Promise. No special handling needed, but be aware this fires on mobile.
**Warning signs:** Extra network requests on touch navigation (acceptable — they're chunk files that cache immediately).

---

## Code Examples

### Current State: App.tsx lazy loading (already implemented)
```typescript
// App.tsx — already exists, needs upgrade to lazyWithPreload
const Dashboard = lazy(() => import('./pages/Dashboard'))    // ← change to lazyWithPreload
const Highlights = lazy(() => import('./pages/Highlights'))  // ← change to lazyWithPreload
const Study = lazy(() => import('./pages/Study'))            // ← change to lazyWithPreload
const Settings = lazy(() => import('./pages/Settings'))      // ← change to lazyWithPreload
const StudySession = lazy(() => import('./pages/StudySession')) // ← change to lazyWithPreload
```

### Current State: Dashboard loading guard (needs skeleton replacement)
```typescript
// pages/Dashboard.tsx — line 201 — replace this:
if (!isLoaded) {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      {t('loading', { ns: 'common' })}
    </div>
  );
}

// Replace with:
if (!isLoaded) {
  return <DashboardSkeleton />
}
```

### Current State: Study loading guard (same pattern)
```typescript
// pages/Study.tsx — line 17 — replace this:
if (!isLoaded) {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      {t('loading')}
    </div>
  );
}

// Replace with:
if (!isLoaded) {
  return <StudySkeleton />
}
```

### Current State: Highlights has no loading guard (needs one added)
```typescript
// pages/Highlights.tsx — add at top of component body:
const { highlights, books, studyCards, tags, ..., isLoaded } = useStore()

if (!isLoaded) {
  return <HighlightsSkeleton />
}
```

### Current State: TagManagerSidebar is static import (needs lazy)
```typescript
// pages/Highlights.tsx — line 8:
import { TagManagerSidebar } from '../components/TagManagerSidebar'  // ← synchronous

// Replace with:
const TagManagerSidebar = lazy(() =>
  import('../components/TagManagerSidebar').then(m => ({ default: m.TagManagerSidebar }))
)
```

### Sidebar NavLink with prefetch (PERF-05)
```typescript
// components/Sidebar.tsx — navItems need component reference
// Import lazy pages in Sidebar (or receive as prop from App)

// Option A: Sidebar imports the preloadable components
import { Dashboard, Highlights, Study, Settings } from '../App' // re-exported from App.tsx

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, component: Dashboard },
  { name: 'Highlights', path: '/highlights', icon: BookMarked, component: Highlights },
  { name: 'Study', path: '/study', icon: GraduationCap, component: Study },
  { name: 'Settings', path: '/settings', icon: SettingsIcon, component: Settings },
]

// In the NavLink:
<NavLink
  to={item.path}
  onMouseEnter={() => item.component?.preload()}
  className={...}
>
```

### Service Worker vite.config.ts change
```typescript
// vite.config.ts — change VitePWA plugin config:
VitePWA({
  strategies: 'injectManifest',   // ← was implicit 'generateSW'
  srcDir: 'src',
  filename: 'sw.ts',
  injectManifest: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
  },
  registerType: 'autoUpdate',
  // rest of config unchanged (manifest, includeAssets)
})
// NOTE: The 'workbox' key in the old config is replaced by 'injectManifest' key
// The old workbox.runtimeCaching config moves INTO src/sw.ts as registerRoute calls
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `generateSW` with `workbox:` config | `injectManifest` with custom `sw.ts` | Needed for push notifications since 2020 | Unlocks push notification handlers, background sync customization |
| Spinner fallback in Suspense | Skeleton fallback with layout-matching shapes | Industry shift ~2020-2022 | Zero layout shift, better perceived performance |
| Route prefetch on click | Route prefetch on hover | ~2019-2021 (popularized by Next.js) | ~200ms perceived load time improvement |

**Deprecated/outdated:**
- `importScripts()` in generateSW custom SW additions: Deprecated, error-prone, does not support ES modules. Use `injectManifest` instead.
- `workbox-window` manual registration: `registerSW` from `virtual:pwa-register` is the current approach for vite-plugin-pwa.

---

## Open Questions

1. **Sidebar prefetch import circularity**
   - What we know: App.tsx defines lazy components. Sidebar.tsx needs to call `.preload()` on them. Importing from App.tsx in Sidebar.tsx could create a circular dependency.
   - What's unclear: Whether re-exporting from App.tsx or defining a separate `lazyPages.ts` module is cleaner for this project.
   - Recommendation: Create `pages/lazyPages.ts` that exports all `lazyWithPreload()` components. Both App.tsx and Sidebar.tsx import from there. Eliminates circular dependency.

2. **Offline review queuing scope**
   - What we know: SW-01/SW-02 require offline study to work. Background sync handles service worker level. But the "Syncing X reviews..." indicator requires the app layer to track queue state.
   - What's unclear: Whether Phase 17 should implement the full indicator UI + StoreContext integration, or just establish the SW foundation and defer the UI to a sub-task.
   - Recommendation: Plan 17-03 (SW migration) implements the custom SW with background sync plugin. The offline indicator and StoreContext integration should be a separate plan 17-04 or scoped to the same plan with clear acceptance criteria.

3. **Settings page skeleton**
   - What we know: CONTEXT.md says all data-fetching pages get skeletons including Settings. Settings.tsx has no `isLoaded` check today.
   - What's unclear: Settings loads UI immediately but some sections (book library) require data. Should the entire Settings page skeleton, or only the Library tab?
   - Recommendation: Add `isLoaded` check at the Settings page level and show a skeleton for the full page (consistent with other pages). The Settings skeleton should match the tab headers + content area.

---

## Sources

### Primary (HIGH confidence)
- `/websites/vite-pwa-org_netlify_app` (Context7) — injectManifest strategy, generateSW vs injectManifest, custom SW configuration, precache manifest injection
- `/vite-pwa/vite-plugin-pwa` (Context7) — InjectManifest SW config, globPatterns, srcDir/filename options
- `/googlechrome/workbox` (Context7) — workbox-background-sync Queue/BackgroundSyncPlugin patterns, offline request queuing
- `/remix-run/react-router` (Context7) — React.lazy lazy loading, route-level code splitting
- `https://vite-pwa-org.netlify.app/guide/inject-manifest` — Migration details, required file structure, essential imports
- `https://github.com/ianschmitz/react-lazy-with-preload` — lazyWithPreload API, `.preload()` usage pattern

### Secondary (MEDIUM confidence)
- `https://blog.maximeheckel.com/posts/preloading-views-with-react/` — `ReactLazyPreload` factory pattern verified against library approach
- `https://ui.shadcn.com/docs/components/radix/skeleton` — Skeleton component shape, installation, usage examples

### Tertiary (LOW confidence)
- WebSearch findings on hover prefetch patterns (cross-verified with Context7 and official React docs)
- WebSearch findings on skeleton delay/fade timing (200ms/300ms/150ms values are from CONTEXT.md locked decisions, not external sources)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All packages verified installed (package.json, node_modules). vite-plugin-pwa injectManifest verified against official docs.
- Architecture: HIGH — Patterns verified against Context7 official sources. Code examples derived from existing codebase analysis.
- Pitfalls: HIGH for build/type issues (documented extensively). MEDIUM for iOS Safari background sync limitation (known limitation, not project-specific).

**Research date:** 2026-02-21
**Valid until:** 2026-03-21 (stable APIs — workbox 7.x, vite-plugin-pwa 1.x)
