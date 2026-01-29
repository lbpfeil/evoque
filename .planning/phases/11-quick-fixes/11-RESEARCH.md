# Phase 11: Quick Fixes - Research

**Researched:** 2026-01-29
**Domain:** UI fixes, code cleanup, favicon update
**Confidence:** HIGH

## Summary

Phase 11 consists of 8 discrete fixes that are straightforward CSS/styling adjustments, one file deletion, and one favicon update. All fixes are localized to specific files with no cross-cutting concerns. The codebase uses a well-defined design system (semantic tokens, Tailwind classes) making the styling fixes simple pattern applications.

Key findings:
- **FIX-01** (Badge contrast): The `StudyStatusBadge.tsx` uses hardcoded Tailwind yellow colors. The yellow badge needs darker text or different background for accessibility.
- **FIX-02** (DeckTable text): Currently uses `text-caption` (12px) on desktop. Need to bump to `text-body` (14px).
- **FIX-03** (Heatmap size): Current cells are `w-2.5 h-2.5` (10px). Should increase to ~`w-3 h-3` (12px) or larger.
- **FIX-04** (Heatmap timezone): The `aggregateReviewsByDate` function converts dates correctly but `calculateStreaks` uses `toISOString()` which is UTC-based.
- **FIX-05** (Sidebar icons): Icons need `justify-center` when collapsed (currently left-aligned via `pl-sm`).
- **FIX-06** (Favicon): New favicons exist in `public/favicon-evq/`. Need to update `index.html` and `vite.config.ts`.
- **FIX-07** (Settings width): Settings page has no max-width constraint. Add `max-w-2xl` or similar.
- **FIX-08** (useTheme removal): `hooks/useTheme.ts` is unused. ThemeProvider exports its own `useTheme`. Safe to delete.

**Primary recommendation:** Execute all 8 fixes as a single plan. Each fix is isolated and takes 5-15 minutes.

## Standard Stack

No new libraries needed. All fixes use existing:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | 3.x | Styling | Already in use, semantic tokens defined |
| React | 19.x | Components | No changes needed |

### Supporting
No additional libraries required. All fixes are CSS/file management.

## Architecture Patterns

### File Organization

Each fix maps to 1-2 files:

| Fix | Primary File | Secondary File |
|-----|-------------|----------------|
| FIX-01 | `components/StudyStatusBadge.tsx` | - |
| FIX-02 | `components/DeckTable.tsx` | - |
| FIX-03 | `components/StudyHeatmap.tsx` | - |
| FIX-04 | `components/StudyHeatmap.tsx` | - |
| FIX-05 | `components/Sidebar.tsx` | - |
| FIX-06 | `index.html` | `vite.config.ts` |
| FIX-07 | `pages/Settings.tsx` | - |
| FIX-08 | `hooks/useTheme.ts` | - |

### Pattern: Color Contrast Fix (FIX-01)

The yellow badge in `StudyStatusBadge.tsx` currently uses:
```tsx
// Line 31-35 - Current "new" status badge
<span className="... bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 ...">
```

**Problem:** `text-yellow-700` on `bg-yellow-50` has low contrast. Same issue in dark mode.

**Solution options:**
1. Use `text-yellow-900` (darker text) on light, `text-yellow-200` on dark
2. Use amber colors which have better contrast: `bg-amber-100 text-amber-800`
3. Add semantic token for status-new-foreground (most aligned with design system)

**Recommended:** Option 2 - Use amber colors for the "new" badge since amber provides better contrast while maintaining visual distinction from blue (learning) and green (review).

### Pattern: Text Size Adjustment (FIX-02)

`DeckTable.tsx` lines 48-57 currently use `sm:text-caption` for both title and author on desktop. This should be `sm:text-body` for the title to improve readability.

```tsx
// Current (line 48-53)
<div className={cn(
    "text-body sm:text-caption text-foreground truncate",  // sm:text-caption is too small
    deck.isAllBooks && "font-semibold"
)}>

// Fix: Remove sm:text-caption (let text-body apply at all breakpoints)
<div className={cn(
    "text-body text-foreground truncate",
    deck.isAllBooks && "font-semibold"
)}>
```

### Pattern: Heatmap Size Increase (FIX-03)

`StudyHeatmap.tsx` has several size-related values:

```tsx
// Line 233-241 - Cell sizing
const weekWidth = 12; // 10px cell + 2px gap

// Line 339 - Day label cells
<div className="w-2.5 h-2.5 text-[8px] ..."

// Line 352 - Heatmap cells
<div className="w-2.5 h-2.5 rounded-sm ..."
```

**Fix approach:**
1. Increase cell size from `w-2.5 h-2.5` (10px) to `w-3 h-3` (12px) or `w-3.5 h-3.5` (14px)
2. Update `calculateNumWeeks` to use new weekWidth (e.g., 14-16px)
3. Increase day label text from `text-[8px]` to `text-[9px]` or `text-overline`

For "more largo" (wider), the heatmap already uses responsive calculation. Larger cells will naturally fill more width.

### Pattern: Timezone Fix (FIX-04)

The bug is in `calculateStreaks` function (lines 103-171) which uses `toISOString().split('T')[0]`:

```tsx
// Line 108-111 - BUG: toISOString() converts to UTC
const todayKey = today.toISOString().split('T')[0];
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayKey = yesterday.toISOString().split('T')[0];
```

This causes timezone issues when local time and UTC are on different days. The fix should use the same local date formatting as `aggregateReviewsByDate`:

```tsx
// Fix: Use local timezone consistently
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const todayKey = formatLocalDate(today);
// ... same for yesterday
```

### Pattern: Sidebar Icon Centering (FIX-05)

`Sidebar.tsx` nav items (lines 72-93) use fixed left padding:

```tsx
// Line 77-80
`flex items-center pl-sm pr-sm py-sm rounded-md ...`
```

When collapsed, icons appear left-aligned because of `pl-sm`. The fix:

```tsx
// Option 1: Conditional centering
className={`flex items-center ${isExpanded ? 'pl-sm pr-sm' : 'justify-center'} py-sm ...`}

// Option 2: Use justify-center always with icon having its own margin when expanded
className={`flex items-center justify-center py-sm ...`}
// And add margin to icon when expanded
```

**Recommended:** Option 1 with conditional classes based on `isExpanded`.

Also check the logo in header (line 44) and user avatar (line 129) for the same issue.

### Pattern: Favicon Update (FIX-06)

Current state:
- `index.html` references `/favicon.ico` from root
- `vite.config.ts` includes `favicon.ico` in PWA assets
- New favicons exist in `public/favicon-evq/` directory

**Fix approach:**
1. Update `index.html` line 16:
   ```html
   <link rel="icon" type="image/svg+xml" href="/favicon-evq/favicon.svg" />
   <link rel="icon" type="image/x-icon" href="/favicon-evq/favicon.ico" />
   ```

2. Update `vite.config.ts` line 17:
   ```typescript
   includeAssets: ['favicon-evq/favicon.ico', 'favicon-evq/apple-touch-icon.png', ...],
   ```

3. Optionally copy the files to root for simpler paths, or keep in subdirectory.

### Pattern: Settings Width (FIX-07)

`Settings.tsx` line 284-285 has no max-width:
```tsx
<div className="p-lg">
```

**Fix:** Add max-width constraint:
```tsx
<div className="p-lg max-w-2xl">  // 672px max
// or
<div className="p-lg max-w-3xl">  // 768px max
```

This matches common patterns in other pages and prevents the Settings page from stretching too wide on large monitors.

### Pattern: Dead Code Removal (FIX-08)

`hooks/useTheme.ts` is completely unused:
- `ThemeProvider.tsx` exports its own `useTheme` hook
- `ThemeToggle.tsx` imports from `./ThemeProvider`, not `../hooks/useTheme`
- No other file imports from `hooks/useTheme`

**Fix:** Simply delete the file. No other changes needed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Color contrast | Manual oklch calculations | Tailwind color utilities | Pre-calculated, consistent |
| Responsive sizing | Media queries | Tailwind responsive prefixes | Standard pattern |
| Timezone handling | Manual offset calculations | Use local Date methods | Avoid UTC conversion |

## Common Pitfalls

### Pitfall 1: Breaking Responsive Behavior
**What goes wrong:** Changing mobile styles when intending to change desktop only.
**Why it happens:** Tailwind mobile-first means base classes are mobile. `sm:` prefix is desktop.
**How to avoid:** Always check both mobile and desktop after changes. The `text-body sm:text-caption` pattern means body on mobile, caption on desktop.

### Pitfall 2: Heatmap Layout Break
**What goes wrong:** Changing cell sizes without updating the `calculateNumWeeks` function.
**Why it happens:** The function calculates how many weeks fit based on `weekWidth` constant.
**How to avoid:** Update both the cell classes AND the calculation constants together.

### Pitfall 3: Favicon Caching
**What goes wrong:** Browser shows old favicon after update.
**Why it happens:** Favicons are aggressively cached.
**How to avoid:** Hard refresh (Ctrl+Shift+R), clear cache, or add cache-busting query param.

### Pitfall 4: Sidebar Animation Jank
**What goes wrong:** Icon position "jumps" during expand/collapse.
**Why it happens:** Changing between `justify-center` and `pl-sm` without transition.
**How to avoid:** Use consistent icon positioning with only opacity/width transitions for labels.

## Code Examples

### Badge Contrast Fix
```tsx
// Before (StudyStatusBadge.tsx line 31-35)
<span className="inline-flex items-center gap-xxs px-xs py-0.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 text-overline uppercase font-bold tracking-wider rounded-full border border-yellow-100 dark:border-yellow-800/50">

// After - Using amber for better contrast
<span className="inline-flex items-center gap-xxs px-xs py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 text-overline uppercase font-bold tracking-wider rounded-full border border-amber-200 dark:border-amber-700/50">
```

### Timezone-Safe Date Formatting
```tsx
// Helper function for consistent local date formatting
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

### Conditional Sidebar Centering
```tsx
// NavLink classes
className={({ isActive }) =>
  cn(
    "flex items-center py-sm rounded-md text-body font-medium transition-colors duration-200",
    isExpanded ? "px-sm" : "justify-center w-full",
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:..."
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `toISOString()` for dates | Local date methods | Always recommended | Avoids timezone bugs |
| Hardcoded yellow colors | Amber or semantic tokens | Design system v2.0 | Better contrast |

## Open Questions

None. All 8 fixes have clear, documented solutions.

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `StudyStatusBadge.tsx`, `StudyHeatmap.tsx`, `Sidebar.tsx`, `Settings.tsx`, `DeckTable.tsx`
- Design system guide: `lbp_diretrizes/design-system-guide.md`
- Tailwind documentation (training data)

### Secondary (MEDIUM confidence)
- WCAG color contrast guidelines (training data) - 4.5:1 ratio for normal text

## Metadata

**Confidence breakdown:**
- Badge contrast: HIGH - Direct code inspection, standard accessibility fix
- Text sizes: HIGH - Design system tokens clearly defined
- Heatmap sizing: HIGH - Direct code inspection
- Timezone fix: HIGH - Clear bug with documented solution pattern
- Sidebar centering: HIGH - CSS flexbox standard pattern
- Favicon update: HIGH - Files already exist, just path updates
- Settings width: HIGH - Simple Tailwind class addition
- useTheme removal: HIGH - Grep confirms no imports

**Research date:** 2026-01-29
**Valid until:** Indefinite (fixes are straightforward, no external dependencies)
