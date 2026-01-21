# Phase 2: Component Migration - Research

**Researched:** 2026-01-21
**Domain:** shadcn/ui component migration, semantic color tokens, theme-aware UI
**Confidence:** HIGH

## Summary

Phase 2 migrates all general pages (Dashboard, Highlights, Settings, Login, Sidebar) and modals to use shadcn components with semantic color tokens. The primary work involves:

1. **Color token migration**: Replacing 400+ hardcoded `zinc-*` references across 28+ files with semantic tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, etc.)
2. **Modal standardization**: Converting 6 custom modals to use shadcn Dialog/AlertDialog patterns
3. **Component modernization**: Refactoring pages to use shadcn Card, Button, Input consistently
4. **Interactive polish**: Adding transition utilities (150-300ms) and consistent hover states

**Primary recommendation:** Start with Sidebar (adds ThemeToggle, already uses semantic tokens) and App.tsx (minimal changes), then migrate pages from simplest (Login) to most complex (Highlights), leaving modals for last since they're self-contained.

---

## Current State Analysis

### Pages - Hardcoded Color Audit

| Page | Hardcoded Colors | Primary Issues |
|------|------------------|----------------|
| Dashboard.tsx | 13 instances | `bg-white`, `text-zinc-900/500/400`, `border-zinc-200/300`, `bg-zinc-100` |
| Highlights.tsx | 38 instances | Heavy `zinc-*` usage in toolbar, table, pagination, bulk actions |
| Settings.tsx | 89 instances | Extensive `zinc-*` in tabs, forms, cards (DO NOT touch parser imports) |
| Login.tsx | 13 instances | `bg-gradient-to-br from-blue-50`, `border-zinc-*`, `bg-blue-600`, `text-zinc-*` |
| Study.tsx | 10 instances | Minimal (Phase 3, but noted for context) |
| StudySession.tsx | 63 instances | Phase 3 - DO NOT TOUCH |

### Components - Hardcoded Color Audit

| Component | Count | Notes |
|-----------|-------|-------|
| Sidebar.tsx | 1 | Already uses semantic tokens (sidebar-*, muted-foreground) |
| ThemeToggle.tsx | 0 | Already semantic (muted-foreground, accent-*) |
| HighlightTableRow.tsx | 10 | Part of Highlights page migration |
| TagManagerSidebar.tsx | 32 | Used from Highlights page |
| BookContextModal.tsx | 17 | Modal migration |
| HighlightEditModal.tsx | 26 | Modal migration |
| HighlightHistoryModal.tsx | 17 | Modal migration |
| DeleteBookModal.tsx | 9 | Modal migration |
| DeleteCardPopover.tsx | 6 | Popover migration |
| EmptyDeckPopover.tsx | 5 | Popover migration |

### UI Components with Hardcoded Colors

| Component | Issues | Fix |
|-----------|--------|-----|
| button.tsx | `zinc-*` in outline, secondary, ghost variants | Replace with semantic tokens |
| input.tsx | `border-zinc-200/800`, `bg-white/zinc-900`, `text-zinc-*` | Replace with semantic tokens |
| dialog.tsx | `border-zinc-200/800`, `bg-white/zinc-900` | Replace with semantic tokens |
| popover.tsx | `border-zinc-200/800`, `bg-white/zinc-900` | Replace with semantic tokens |
| command.tsx | 7 instances | Replace with semantic tokens |
| sheet.tsx | 8 instances | Replace with semantic tokens |

---

## shadcn Components Status

### Already Installed (Phase 1)

All required components are already installed:

| Component | File | Status |
|-----------|------|--------|
| button | `ui/button.tsx` | Needs color token fix |
| dialog | `ui/dialog.tsx` | Needs color token fix |
| input | `ui/input.tsx` | Needs color token fix |
| popover | `ui/popover.tsx` | Needs color token fix |
| command | `ui/command.tsx` | Needs color token fix |
| sheet | `ui/sheet.tsx` | Needs color token fix |
| card | `ui/card.tsx` | Already semantic |
| tabs | `ui/tabs.tsx` | Check for issues |
| badge | `ui/badge.tsx` | Check for issues |
| select | `ui/select.tsx` | Check for issues |
| checkbox | `ui/checkbox.tsx` | Check for issues |
| switch | `ui/switch.tsx` | Check for issues |
| tooltip | `ui/tooltip.tsx` | Check for issues |
| scroll-area | `ui/scroll-area.tsx` | Check for issues |
| dropdown-menu | `ui/dropdown-menu.tsx` | Check for issues |

### Need to Install

| Component | Purpose | Command |
|-----------|---------|---------|
| alert-dialog | Confirmation modals (DeleteBookModal, DeleteCardPopover) | `npx shadcn@latest add alert-dialog` |

---

## Semantic Token Reference

### Available Tokens (from index.css)

```css
/* Backgrounds */
--background        /* Page background */
--card              /* Card/panel background */
--popover           /* Popover/dropdown background */
--muted             /* Muted/subtle background */
--accent            /* Interactive hover background */
--secondary         /* Secondary button background */
--destructive       /* Destructive action background */

/* Foregrounds */
--foreground        /* Primary text */
--card-foreground   /* Card text */
--popover-foreground /* Popover text */
--muted-foreground  /* Secondary/muted text */
--accent-foreground /* Accent hover text */
--secondary-foreground /* Secondary button text */
--destructive-foreground /* Destructive action text */

/* Borders */
--border            /* Default border */
--input             /* Input border */
--ring              /* Focus ring */
```

### Mapping Guide

| Hardcoded | Semantic Replacement |
|-----------|---------------------|
| `bg-white` | `bg-background` or `bg-card` |
| `bg-zinc-50` | `bg-muted` |
| `bg-zinc-100` | `bg-muted` or `bg-secondary` |
| `bg-zinc-950` (dark) | `bg-muted` |
| `text-zinc-900` | `text-foreground` |
| `text-zinc-700/600` | `text-foreground` or `text-muted-foreground` |
| `text-zinc-500/400` | `text-muted-foreground` |
| `border-zinc-200` | `border-border` |
| `hover:bg-zinc-100` | `hover:bg-accent` |
| `hover:bg-zinc-50` | `hover:bg-muted` |
| `dark:bg-zinc-900` | (not needed with semantic) |
| `dark:text-zinc-100` | (not needed with semantic) |

---

## Modal Migration Patterns

### Current Modal Implementations

All 6 modals use a similar custom pattern:

```tsx
// Current Pattern (example from DeleteBookModal)
<div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={onCancel}>
  <div
    className="bg-white dark:bg-zinc-900 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-800 p-5 max-w-md mx-4"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Content */}
  </div>
</div>
```

### Target: shadcn Dialog Pattern

```tsx
// For informational modals (BookContextModal, HighlightEditModal, HighlightHistoryModal)
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

<Dialog open={!!bookId} onOpenChange={(open) => !open && onClose()}>
  <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Target: shadcn AlertDialog Pattern

```tsx
// For confirmation modals (DeleteBookModal, DeleteCardPopover)
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

<AlertDialog open={!!bookId} onOpenChange={(open) => !open && onCancel()}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Book?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Modal Migration Table

| Modal | Current | Target | Complexity |
|-------|---------|--------|------------|
| DeleteBookModal | Custom overlay | AlertDialog | Medium (has checkbox confirmation) |
| DeleteCardPopover | Custom overlay | AlertDialog | Low |
| EmptyDeckPopover | Custom overlay | AlertDialog (informational) | Low |
| HighlightEditModal | Custom Portal | Dialog | High (forms, charts, auto-save) |
| HighlightHistoryModal | Custom overlay | Dialog | Medium (charts) |
| BookContextModal | Custom overlay | Dialog | Medium (scrolling list) |

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal overlays | Custom `fixed inset-0` divs | shadcn Dialog/AlertDialog | Focus trapping, ESC handling, animations, accessibility |
| Confirmation dialogs | Custom with manual state | AlertDialog | Built-in confirm/cancel flow, accessible |
| Theme-aware colors | `dark:` modifiers everywhere | Semantic tokens | Single source of truth, easier maintenance |
| Hover transitions | Inline `transition-colors` | Utility class `transition-colors duration-200` | Consistent timing |

---

## Common Pitfalls

### Pitfall 1: Incomplete Dark Mode Migration

**What goes wrong:** Migrating `bg-white` to `bg-background` but leaving `dark:bg-zinc-900`
**Why it happens:** Copy-paste replacement without removing dark variants
**How to avoid:** When replacing hardcoded colors, remove BOTH light AND dark variants
**Warning signs:** Classes like `bg-background dark:bg-zinc-900` (redundant dark: prefix)

### Pitfall 2: Breaking Parser Imports in Settings.tsx

**What goes wrong:** Accidentally modifying the dynamic import logic for parsers
**Why it happens:** Settings.tsx is 800 lines, easy to touch wrong section
**How to avoid:** ONLY modify JSX/className attributes, never touch lines 82-136 (parser logic)
**Warning signs:** Any changes to `import('../services/parser')` or `import('../services/pdfParser')`

### Pitfall 3: Inconsistent Transition Timing

**What goes wrong:** Mix of `duration-150`, `duration-200`, `duration-300` across UI
**Why it happens:** Each developer picks their preferred timing
**How to avoid:** Standardize on `transition-colors duration-200` for hover states
**Warning signs:** Visual jank when hovering over adjacent elements with different timings

### Pitfall 4: Dialog State Management

**What goes wrong:** Modal doesn't close properly or has race conditions
**Why it happens:** Mixing controlled/uncontrolled patterns with shadcn Dialog
**How to avoid:** Always use `open={!!itemId}` and `onOpenChange={(open) => !open && onClose()}`
**Warning signs:** Modal stays open after action, or opens/closes unexpectedly

### Pitfall 5: Missing Chart Theme Colors

**What goes wrong:** Recharts uses hardcoded colors that don't adapt to theme
**Why it happens:** Charts configured with literal hex/rgb values
**How to avoid:** Use CSS variables via `var(--chart-1)` etc., or getComputedStyle
**Warning signs:** Charts look wrong in dark mode (bright colors on dark bg)

---

## Implementation Order

### Recommended Sequence

```
1. UI Components (foundation)
   - button.tsx, input.tsx (most used)
   - dialog.tsx, popover.tsx (used by modals)
   - command.tsx, sheet.tsx (used by pages)

2. Install AlertDialog
   - npx shadcn@latest add alert-dialog

3. Sidebar.tsx (COMP-02)
   - ThemeToggle is already integrated
   - Minimal changes needed

4. App.tsx (COLOR-03)
   - Already uses semantic tokens
   - Just verify/cleanup

5. Login.tsx (PAGE-05)
   - Simplest page
   - Replace gradient, blue-* colors

6. Dashboard.tsx (PAGE-01)
   - Replace StatCard pattern with shadcn Card
   - Fix chart colors

7. Settings.tsx (PAGE-04)
   - Long file but straightforward replacements
   - DO NOT TOUCH lines 82-136 (parsers)

8. Highlights.tsx (PAGE-02)
   - Most complex page
   - Many interactive elements

9. Modals (MODAL-01 through MODAL-06)
   - DeleteCardPopover -> AlertDialog
   - DeleteBookModal -> AlertDialog
   - EmptyDeckPopover -> AlertDialog (info)
   - HighlightEditModal -> Dialog
   - HighlightHistoryModal -> Dialog
   - BookContextModal -> Dialog
```

### Dependencies

```
UI Components (1) -> Pages (4-8) -> Modals (9)
AlertDialog install (2) -> Modal migration (9)
Sidebar (3) -> No blockers (already has ThemeToggle)
```

---

## Code Examples

### Semantic Color Migration

```tsx
// BEFORE
<div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
  <p className="text-zinc-500 dark:text-zinc-400">Description</p>
</div>

// AFTER
<div className="bg-card border border-border text-card-foreground">
  <p className="text-muted-foreground">Description</p>
</div>
```

### Button Variant Fix (ui/button.tsx)

```tsx
// BEFORE
outline: "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100",
secondary: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700",
ghost: "hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100",

// AFTER
outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
ghost: "hover:bg-accent hover:text-accent-foreground",
```

### Input Component Fix (ui/input.tsx)

```tsx
// BEFORE
className={cn(
  "flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  className
)}

// AFTER
className={cn(
  "flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  className
)}
```

### Dashboard StatCard with shadcn Card

```tsx
// BEFORE
const StatCard = ({ title, value, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-md border border-zinc-200 flex flex-col justify-between h-32 hover:border-zinc-300 transition-colors">
    <div className="flex justify-between items-start">
      <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider text-xs">{title}</p>
      <Icon className="w-5 h-5 text-zinc-400" />
    </div>
    <h3 className="text-3xl font-bold text-zinc-900 tracking-tight">{value}</h3>
  </div>
);

// AFTER
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const StatCard = ({ title, value, icon: Icon }: StatCardProps) => (
  <Card className="hover:border-primary/30 transition-colors duration-200">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="w-5 h-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
    </CardContent>
  </Card>
);
```

### AlertDialog for DeleteBookModal

```tsx
// AFTER
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"

export const DeleteBookModal: React.FC<DeleteBookModalProps> = ({ bookId, onConfirm, onCancel }) => {
  const [confirmed, setConfirmed] = useState(false);
  // ... bookData logic unchanged ...

  return (
    <AlertDialog open={!!bookId} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Delete "{bookData?.book.title}"?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>This action will permanently delete:</p>
            <ul className="list-disc list-inside ml-2">
              <li>{bookData?.highlightCount} highlights</li>
              <li>{bookData?.cardCount} study cards</li>
              <li>All review history for this book</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-center gap-2 py-2">
          <Checkbox
            id="confirm-delete"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(!!checked)}
          />
          <label htmlFor="confirm-delete" className="text-sm text-muted-foreground cursor-pointer">
            I understand this action cannot be undone
          </label>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={!confirmed}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Book
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
```

---

## Transition Standards

### Interactive Elements (COMP-03, COMP-04)

```tsx
// Standard transition for hover states
className="transition-colors duration-200"

// For transforms (scale, translate)
className="transition-transform duration-200"

// For multiple properties
className="transition-all duration-200"

// Hover state pattern
className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200"

// Focus ring pattern (already in shadcn)
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
```

### Timing Guidelines

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Hover color change | 200ms | ease (default) |
| Button press | 150ms | ease |
| Modal open/close | 200ms | ease-in-out |
| Sidebar expand/collapse | 300ms | ease-in-out |
| Page transitions | 200-300ms | ease |

---

## Risk Areas

### High Risk: Settings.tsx Parser Imports

**Lines 82-136 are PROTECTED:**
```tsx
// DO NOT MODIFY - Parser dynamic imports
const { parsePDFKindleHighlights } = await import('../services/pdfParser');
const { parseAnkiTSV } = await import('../services/ankiParser');
const { parseMyClippings } = await import('../services/parser');
```

**Safe to modify:**
- All JSX className attributes
- State declarations
- Event handlers (unless they call parsers)
- UI component structure

### Medium Risk: HighlightEditModal Charts

The modal uses Recharts with hardcoded colors:
```tsx
<Line type="monotone" dataKey="interval" stroke="#2563eb" strokeWidth={2} />
```

**Migration approach:**
1. Define chart colors as CSS variables (already in index.css as --chart-1 through --chart-5)
2. Access via computed style or inline style with var()
3. Test in both light and dark modes

### Low Risk: Pagination Components

Highlights.tsx pagination buttons use simple styling:
```tsx
className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-sm font-medium disabled:opacity-50"
```

Replace with Button component:
```tsx
<Button variant="outline" size="sm" disabled={currentPage === 1}>
  <ChevronLeft className="w-4 h-4" /> Previous
</Button>
```

---

## Sources

### Primary (HIGH confidence)
- Codebase analysis: Direct file inspection of all target files
- Phase 1 research: `.planning/phases/01-foundation/01-RESEARCH.md`
- shadcn/ui components.json: Configuration verified
- index.css: All semantic tokens verified

### Secondary (MEDIUM confidence)
- [shadcn/ui AlertDialog](https://ui.shadcn.com/docs/components/alert-dialog) - Official documentation
- [shadcn/ui Dialog](https://ui.shadcn.com/docs/components/dialog) - Official documentation

---

## Metadata

**Confidence breakdown:**
- Color audit: HIGH - Direct codebase grep analysis
- Component status: HIGH - Verified from file system
- Migration patterns: HIGH - Based on official shadcn patterns
- Risk assessment: HIGH - Based on actual code structure

**Research date:** 2026-01-21
**Valid until:** 2026-02-21 (stable domain, 30 days)
