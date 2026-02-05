# Phase 17: Performance Foundation - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Optimize application load performance through lazy-loaded routes with code splitting, skeleton loading states for all data-fetching pages, and migration from generateSW to injectManifest service worker (enabling future push notification support in Phase 18). Full offline study capability with queued sync.

</domain>

<decisions>
## Implementation Decisions

### Skeleton appearance
- Pulse animation (opacity fade) — clean, minimal, matches shadcn/ui style
- High fidelity: skeletons mirror exact positions of cards, charts, text blocks — zero layout shift on load
- All data-fetching pages get skeletons (Dashboard, Highlights, Study deck selection, Settings), not just Dashboard + Highlights
- Use semantic tokens: bg-muted with border-border — automatically adapts to dark mode

### Loading transitions
- Brief delay (~200ms) before showing skeleton — stay on current page to avoid flash for fast loads
- Minimum 300ms skeleton display time — prevents flicker, feels intentional
- Content fades in (~150ms transition) replacing skeleton — smooth, polished
- Sidebar and header always visible during route transitions — only main content area shows skeleton (app shell stays stable)

### Offline behavior
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

</decisions>

<specifics>
## Specific Ideas

- Transitions should feel like a native app — the shell never disappears, only content area updates
- Offline study is a key value prop: users study on commute (subway, plane) where connectivity is spotty
- Sync indicator should be brief and non-blocking — user shouldn't have to wait or acknowledge

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 17-performance-foundation*
*Context gathered: 2026-02-05*
