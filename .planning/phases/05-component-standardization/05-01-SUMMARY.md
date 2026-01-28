---
phase: 05-component-standardization
plan: 01
subsystem: ui-components
tags: [shadcn, cva, button, input, badge, tokens]

dependency_graph:
  requires: [04-01, 04-02]
  provides: [token-aligned-button, token-aligned-input, token-aligned-badge]
  affects: [05-02, 05-03]

tech_stack:
  added: []
  patterns: [cva-compact-defaults]

key_files:
  created: []
  modified:
    - components/ui/button.tsx
    - components/ui/input.tsx

decisions:
  - "Button 'compact' variant (h-8) as new default"
  - "Button 'icon' variant shrunk from h-10 to h-8"
  - "Input reduced from h-10 to h-8 with proportional padding"
  - "Badge already token-aligned (h-5), no changes needed"

metrics:
  duration: 2.5min
  completed: 2026-01-28
---

# Phase 5 Plan 01: Adjust shadcn Component Defaults Summary

**One-liner:** CVA defaults adjusted to h-8 compact sizing for Button and Input; Badge verified as already aligned.

## Execution Summary

| Task | Name | Commit | Status |
|------|------|--------|--------|
| 1 | Adjust Button CVA variants for token-aligned defaults | 3e7df3d | Done |
| 2 | Adjust Input height and verify Badge alignment | ca4f389 | Done |

**Total duration:** ~2.5 minutes

## Changes Made

### Task 1: Button CVA Variants

Modified `components/ui/button.tsx`:

**Size variants (before):**
```typescript
default: "h-10 px-4 py-2"
sm: "h-9 rounded-md px-3"
lg: "h-11 rounded-md px-8"
icon: "h-10 w-10"
```

**Size variants (after):**
```typescript
default: "h-10 px-4 py-2"      // Keep for backward compat
compact: "h-8 px-3 py-1.5"     // NEW: Matches design tokens
sm: "h-7 rounded-md px-2.5"    // Adjusted smaller
lg: "h-11 rounded-md px-8"     // Unchanged
icon: "h-8 w-8"                // Adjusted to match compact
```

**Default changed:** `size: "default"` -> `size: "compact"`

### Task 2: Input and Badge

**Input (`components/ui/input.tsx`):**
- Height: h-10 -> h-8 (32px)
- Padding: px-3 py-2 -> px-2.5 py-1.5

**Badge (`components/ui/badge.tsx`):**
- Verified as already token-aligned: h-5, text-xs, px-2
- No changes needed

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

| Decision | Context | Rationale |
|----------|---------|-----------|
| Compact as default | All 10 Button usages specify explicit size or className | h-8 matches design tokens; no implicit usages rely on h-10 |
| Icon size reduced | TagManagerSidebar overrides with className="h-5 w-5" | Consistent with compact default; existing code unaffected |
| Badge unchanged | Already uses h-5, text-xs, px-2 | Matches design token specification exactly |

## Artifacts

**Modified:**
- `components/ui/button.tsx` - CVA variants + default
- `components/ui/input.tsx` - Height and padding

**Verified (no changes):**
- `components/ui/badge.tsx` - Already token-aligned

## Verification Results

- `npm run build` passes with no errors
- All Button usages have explicit size or className overrides
- All 4 Input usages in TagManagerSidebar compatible with h-8
- Badge h-5 confirmed as token specification

## Next Phase Readiness

Ready for Plan 02 (Card/Dialog standardization).

**Dependencies provided:**
- Button compact default (h-8) established
- Input default (h-8) established
- Badge verified as aligned

**No blockers identified.**
