---
status: complete
phase: 17-performance-foundation
source: [17-01-SUMMARY.md, 17-02-SUMMARY.md, 17-03-SUMMARY.md]
started: 2026-02-21T10:42:00Z
updated: 2026-02-21T10:45:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Route Prefetch on Hover
expected: Open Chrome DevTools > Network tab. Clear the network log. Hover over a sidebar nav link (e.g., "Highlights" while on Dashboard). A JS chunk file should appear in the Network tab BEFORE you click — the route bundle is being prefetched on hover.
result: pass

### 2. TagManagerSidebar Lazy Loading
expected: On the Highlights page, open DevTools > Network tab. Clear the log. Click "Manage Tags" (tag manager button). A new JS chunk should appear in the Network tab — TagManagerSidebar loads on demand, not with the page.
result: pass

### 3. Dashboard Skeleton
expected: Hard-refresh the Dashboard page (Ctrl+Shift+R) with DevTools > Network > "Slow 3G" throttling enabled. You should see a skeleton layout (pulsing gray blocks matching the dashboard layout — KPI cards, heatmap area, top books) instead of a text "Carregando..." message. When data loads, content fades in smoothly.
result: pass

### 4. Highlights Skeleton
expected: Navigate to Highlights with Slow 3G throttling. You should see a skeleton layout (pulsing gray blocks for toolbar, table header, 10 table rows) instead of blank content. Content fades in when data loads.
result: pass

### 5. Study Skeleton
expected: Navigate to Study with Slow 3G throttling. You should see a skeleton layout (pulsing blocks for heatmap, deck table rows) instead of text loading. Content fades in when data loads.
result: pass

### 6. Settings Skeleton
expected: Navigate to Settings with Slow 3G throttling. You should see a skeleton layout (pulsing blocks for tab bar, form content area) instead of blank content. Content fades in when data loads.
result: pass

### 7. No Skeleton Flash on Fast Load
expected: Disable network throttling (back to "No throttling"). Navigate between pages. On fast localhost, skeletons should NOT flash — pages should appear directly without a visible skeleton flicker.
result: pass

### 8. Offline Indicator in Sidebar
expected: In DevTools > Application > Service Workers, check "Offline" toggle. The sidebar should show a small amber WifiOff icon (and "Offline" text if sidebar is expanded) between the header and navigation links. Uncheck "Offline" — the indicator should disappear.
result: pass

### 9. App Loads Offline (PWA)
expected: First, do a production build and preview (`npm run build && npm run preview`). Load the app, then toggle "Offline" in DevTools > Application > Service Workers. Reload the page — the app shell should still load from cache (PWA offline support preserved after service worker migration).
result: pass

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
