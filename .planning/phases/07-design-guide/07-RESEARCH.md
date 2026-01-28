# Phase 7: Design Guide - Research

**Researched:** 2026-01-28
**Domain:** Design documentation / design systems documentation
**Confidence:** HIGH (all findings from direct codebase inspection)

## Summary

This phase requires writing a single, comprehensive design guide that replaces the outdated `lbp_diretrizes/compact-ui-design-guidelines.md` (v1.1, dated 2025-12-30). The existing document is fundamentally misaligned with the current codebase: it describes a "compact" design philosophy (h-7 buttons, gap-0.5, py-0.5 px-1.5) that was superseded by the v2.0 "generous" design language decided during planning. The codebase now uses semantic design tokens (CSS custom properties + Tailwind extensions), CVA-based component variants, and reusable pattern components (PageHeader, DataTable) that the old guide knows nothing about.

The research focused on extracting every actual token value, component API, and page layout pattern from the live codebase. All findings come from direct file reads -- no external sources needed since this is pure documentation of existing code.

**Primary recommendation:** Write a single Markdown design guide document that covers tokens, component usage, and page layout patterns, structured so a developer (or future Claude) can build a page matching existing ones without ambiguity.

## Standard Stack

No new libraries needed. The design guide documents what already exists:

### Core
| Library | Version | Purpose | Role in Design System |
|---------|---------|---------|----------------------|
| Tailwind CSS | 3.x | Utility CSS framework | Token consumption layer via `extend` config |
| class-variance-authority (CVA) | 0.7.x | Component variant management | Button, Badge, Sheet, Tabs variants |
| Radix UI | Various | Headless UI primitives | Dialog, Sheet, Popover, Select, Tabs, etc. |
| Lucide React | Latest | Icon library | All icons throughout the system |
| Outfit Variable | Variable | Primary font family | Font-sans stack |

### Supporting
| Tool | Purpose |
|------|---------|
| `cn()` utility (`lib/utils.ts`) | Tailwind class merging (clsx + tailwind-merge) |
| `tailwindcss-animate` plugin | Entry/exit animations for Radix components |
| CSS custom properties (`:root`) | Design token definitions |

## Architecture Patterns

### Token Architecture (3 Layers)

```
Layer 1: CSS Custom Properties (index.css :root)
  --text-heading: 1.125rem;
  --space-md: 1rem;
  --status-new: oklch(0.55 0.20 250);

Layer 2: Tailwind Config Extensions (tailwind.config.js)
  fontSize: { heading: 'var(--text-heading)' }
  spacing: { md: 'var(--space-md)' }
  colors: { status: { new: 'var(--status-new)' } }

Layer 3: Usage in Components
  className="text-heading"
  className="p-md gap-lg"
  className="bg-status-new"
```

### Complete Token Tables

#### Typography Tokens (TOKENS-01)
| Token Name | CSS Variable | Value | Tailwind Class | Usage |
|------------|-------------|-------|----------------|-------|
| Display | `--text-display` | 2rem (32px) | `text-display` | Hero text, rare |
| Title | `--text-title` | 1.875rem (30px) | `text-title` | Page titles (`PageHeader size="default"`) |
| Heading | `--text-heading` | 1.125rem (18px) | `text-heading` | Section headings, compact page titles |
| Body | `--text-body` | 0.875rem (14px) | `text-body` | Default body text |
| Caption | `--text-caption` | 0.75rem (12px) | `text-caption` | Metadata, labels, table headers |
| Overline | `--text-overline` | 0.625rem (10px) | `text-overline` | Tiny labels, uppercase tracking |

**Font families:**
- `font-sans`: Outfit Variable, Outfit, system-ui fallbacks
- `font-serif`: Georgia, Cambria, Times New Roman (StudySession only)

#### Spacing Tokens (TOKENS-02)
| Token | CSS Variable | Value | Tailwind Class | Usage Example |
|-------|-------------|-------|----------------|---------------|
| xxs | `--space-xxs` | 0.25rem (4px) | `p-xxs`, `gap-xxs` | Minimal gaps |
| xs | `--space-xs` | 0.5rem (8px) | `p-xs`, `gap-xs` | Icon-text gaps, table cell padding |
| sm | `--space-sm` | 0.75rem (12px) | `p-sm`, `gap-sm` | DataTable cell padding |
| md | `--space-md` | 1rem (16px) | `p-md`, `gap-md` | Standard padding, PageHeader gap |
| lg | `--space-lg` | 1.5rem (24px) | `p-lg`, `gap-lg` | PageHeader bottom margin |
| xl | `--space-xl` | 2rem (32px) | `p-xl`, `gap-xl` | Section spacing |
| 2xl | `--space-2xl` | 3rem (48px) | `p-2xl`, `gap-2xl` | Large section gaps |
| 3xl | `--space-3xl` | 4rem (64px) | `p-3xl`, `gap-3xl` | Maximum spacing |

#### Color Tokens (oklch-based)
| Category | Token | Light Mode | Dark Mode | Tailwind Class |
|----------|-------|-----------|-----------|----------------|
| **Core** | background | oklch(0.97 0.015 85) | oklch(0.14 0.012 55) | `bg-background` |
| | foreground | oklch(0.18 0.01 50) | oklch(0.96 0.006 80) | `text-foreground` |
| | primary | oklch(0.67 0.16 58) | oklch(0.75 0.15 68) | `bg-primary` / `text-primary` |
| | primary-foreground | oklch(0.99 0.02 95) | oklch(0.20 0.06 50) | `text-primary-foreground` |
| | destructive | oklch(0.58 0.22 30) | oklch(0.70 0.20 25) | `bg-destructive` |
| **Surface** | card | oklch(0.98 0.012 80) | oklch(0.18 0.015 55) | `bg-card` |
| | muted | oklch(0.94 0.012 78) | oklch(0.20 0.012 50) | `bg-muted` |
| | accent | oklch(0.92 0.05 70) | oklch(0.24 0.04 55) | `bg-accent` |
| | border | oklch(0.88 0.015 70) | oklch(1 0 0 / 10%) | `border-border` |
| **Muted text** | muted-foreground | oklch(0.50 0.02 55) | oklch(0.68 0.02 60) | `text-muted-foreground` |
| **Status** | status-new | oklch(0.55 0.20 250) | oklch(0.65 0.18 250) | `bg-status-new` (Blue) |
| | status-learning | oklch(0.70 0.15 85) | oklch(0.78 0.13 85) | `bg-status-learning` (Amber) |
| | status-review | oklch(0.60 0.18 145) | oklch(0.70 0.16 145) | `bg-status-review` (Green) |
| | status-foreground | oklch(0.99 0.01 90) | oklch(0.99 0.01 90) | `text-status-foreground` (White) |
| **Tags** | tag-global | oklch(0.55 0.20 250) | oklch(0.65 0.18 250) | `bg-tag-global` (Blue) |
| | tag-book | oklch(0.70 0.15 85) | oklch(0.78 0.13 85) | `bg-tag-book` (Amber) |
| **Success** | success | oklch(0.60 0.18 145) | oklch(0.70 0.16 145) | `text-success` (Green) |

#### Shadow Tokens (TOKENS-04)
| Token | CSS Variable | Value | Tailwind Class |
|-------|-------------|-------|----------------|
| Small | `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | `shadow-sm` |
| Medium | `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | `shadow-md` |
| Large | `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | `shadow-lg` |

#### Motion Tokens (TOKENS-05)
| Token | CSS Variable | Value | Tailwind Class |
|-------|-------------|-------|----------------|
| Fast | `--duration-fast` | 150ms | `duration-fast` |
| Base | `--duration-base` | 200ms | `duration-base` |
| Slow | `--duration-slow` | 300ms | `duration-slow` |
| Ease In | `--ease-in` | cubic-bezier(0.4, 0, 1, 1) | `ease-in` |
| Ease Out | `--ease-out` | cubic-bezier(0, 0, 0.2, 1) | `ease-out` |
| Ease In-Out | `--ease-in-out` | cubic-bezier(0.4, 0, 0.2, 1) | `ease-in-out` |

#### Icon Size Tokens (fixed rem, NOT CSS vars)
| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| Icon SM | 0.875rem (14px) | `w-icon-sm h-icon-sm` | Small inline icons |
| Icon MD | 1rem (16px) | `w-icon-md h-icon-md` | Standard icons |
| Icon LG | 1.25rem (20px) | `w-icon-lg h-icon-lg` | Section/header icons |

**Note:** Many codebase icons still use explicit sizes (w-3 h-3, w-4 h-4, w-3.5 h-3.5) rather than the semantic tokens. The guide should document both and recommend the semantic tokens for new code.

#### Z-Index Tokens (TOKENS-07)
| Token | CSS Variable | Value | Tailwind Class | Usage |
|-------|-------------|-------|----------------|-------|
| Base | `--z-base` | 0 | `z-base` | Default content |
| Dropdown | `--z-dropdown` | 1000 | `z-dropdown` | Dropdown menus |
| Sticky | `--z-sticky` | 1020 | `z-sticky` | Sticky headers, toolbars |
| Fixed | `--z-fixed` | 1030 | `z-fixed` | Fixed nav elements |
| Modal Backdrop | `--z-modal-backdrop` | 1040 | `z-modal-backdrop` | Modal overlays |
| Modal | `--z-modal` | 1050 | `z-modal` | Modal content |
| Popover | `--z-popover` | 1060 | `z-popover` | Popovers, tooltips |
| Tooltip | `--z-tooltip` | 1070 | `z-tooltip` | Top-level tooltips |

**Note:** Radix components use `z-50` hardcoded (Dialog, Sheet). The semantic tokens are defined but not fully consumed by all components yet. The guide should document the intended layer system.

#### Border Radius
| Token | Value | Tailwind Class |
|-------|-------|----------------|
| lg | `--radius` = 0.75rem (12px) | `rounded-lg` |
| md | calc(--radius - 2px) = 10px | `rounded-md` |
| sm | calc(--radius - 4px) = 8px | `rounded-sm` |

### Component Architecture

All components follow these patterns:
1. **CVA for variants** (Button, Badge, Sheet, Tabs)
2. **Radix UI primitives** for accessible behavior (Dialog, Popover, Select, etc.)
3. **`cn()` for class merging** throughout
4. **Semantic color classes** (bg-primary, text-foreground, border-border)
5. **Pattern components** for page-level reuse (PageHeader, DataTable)

## Component API Reference

### Button (`components/ui/button.tsx`)
```typescript
// Variants
variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
size: 'default' | 'compact' | 'sm' | 'lg' | 'icon'

// Default: variant="default", size="compact"
// Size values:
//   default: h-10 px-4 py-2
//   compact: h-8 px-3 py-1.5    <-- DEFAULT
//   sm:      h-7 px-2.5 rounded-md
//   lg:      h-11 px-8 rounded-md
//   icon:    h-8 w-8

// Usage:
<Button>Default compact</Button>
<Button size="sm">Small</Button>
<Button variant="outline" size="icon"><Icon /></Button>
```

### Input (`components/ui/input.tsx`)
```typescript
// No variants - single style
// Base: h-8 px-2.5 py-1.5 text-sm rounded-md border-input
// Focus: ring-2 ring-ring ring-offset-2

<Input placeholder="Search..." />
```

### Badge (`components/ui/badge.tsx`)
```typescript
// Variants
variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'

// Base: h-5 px-2 py-0.5 text-xs rounded-4xl (pill shape)
// Icons inside: size-3

<Badge>Default</Badge>
<Badge variant="secondary">Tag name</Badge>
```

### Card (`components/ui/card.tsx`)
```typescript
// Size prop
size: 'default' | 'sm'

// default: gap-6 py-6 rounded-xl
// sm:      gap-4 py-4 (via data-[size=sm])

// Sub-components: Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter
// CardContent/CardHeader: px-6 (default) or px-4 (sm)

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### PageHeader (`components/patterns/PageHeader.tsx`)
```typescript
interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  size?: 'default' | 'compact'
  className?: string
}

// size="default": text-title (30px), text-body description, mb-lg
// size="compact": text-heading (18px), text-caption description, mb-md

// ALL current pages use size="compact" (standardized in Phase 6)
<PageHeader title="Page Title" description="Subtitle" size="compact" />
<PageHeader title="Title" size="compact" actions={<Button>Action</Button>} />
```

### DataTable (`components/patterns/DataTable.tsx`)
```typescript
interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (item: T) => void
  gridCols: string          // Required: e.g. "grid-cols-[1fr_48px_64px]"
  gridColsSm?: string       // Optional responsive: e.g. "sm:grid-cols-[1fr_48px_64px_48px]"
  rowClassName?: (item: T) => string | undefined
  emptyMessage?: string
}

// Structure: border container > muted header > divide-y body
// Header: bg-muted text-caption font-semibold
// Cells: px-sm py-xs
// Click rows: hover:bg-accent/50 transition-colors
```

### Dialog / Modal (`components/ui/dialog.tsx`)
```typescript
// Standard Radix Dialog wrapper
// Overlay: fixed inset-0 z-50 bg-black/80
// Content: fixed centered, max-w-lg, p-6, rounded-lg (sm+)
// Close button: absolute right-4 top-4, X icon (h-4 w-4)

// Canonical usage pattern:
<Dialog open={!!id} onOpenChange={(open) => !open && onClose()}>
  <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0">
    <DialogHeader className="p-6 border-b border-border flex-shrink-0">
      <DialogTitle className="text-heading font-bold">Title</DialogTitle>
    </DialogHeader>
    <div className="flex-1 overflow-y-auto p-6">
      {/* Scrollable content */}
    </div>
    <div className="p-4 border-t border-border bg-muted flex justify-end flex-shrink-0">
      {/* Footer actions */}
    </div>
  </DialogContent>
</Dialog>
```

### Sheet (`components/ui/sheet.tsx`)
```typescript
// Side variants: 'top' | 'bottom' | 'left' | 'right' (default: right)
// Overlay: bg-black/80
// Content: w-3/4 sm:max-w-sm, p-6
// Title: text-lg font-semibold
// Close: absolute right-4 top-4
```

### Select (`components/ui/select.tsx`)
```typescript
// Size prop on trigger: 'sm' | 'default'
//   default: h-9
//   sm: h-8
// Rounded-md, border, shadow-xs
```

### Switch (`components/ui/switch.tsx`)
```typescript
// Size prop: 'sm' | 'default'
//   default: h-[18.4px] w-[32px], thumb size-4
//   sm: h-[14px] w-[24px], thumb size-3
```

### Tabs (`components/ui/tabs.tsx`)
```typescript
// TabsList variants: 'default' (bg-muted) | 'line' (transparent, underline active)
// TabsTrigger: text-sm font-medium, h-9 in horizontal mode
// TabsContent: text-sm
```

### Checkbox (`components/ui/checkbox.tsx`)
```typescript
// Fixed: size-4, rounded-[4px], border, shadow-xs
// Checked: bg-primary text-primary-foreground
```

### Tooltip (`components/ui/tooltip.tsx`)
```typescript
// bg-foreground text-background (inverted)
// px-3 py-1.5 text-xs rounded-md
// Has arrow
```

## Page Layout Patterns

### Standard Page Layout (Dashboard, Study, Settings, Highlights)

```
AppLayout (App.tsx)
├── Sidebar (left, hidden on mobile)
├── main.flex-1.p-4.md:p-8.overflow-y-auto.h-screen
│   └── div.w-full.mx-auto
│       └── [Page Component]
└── BottomNav (mobile only)
```

The `main` element provides:
- `p-4` mobile, `md:p-8` desktop padding
- `pb-20 md:pb-8` (extra bottom padding for mobile bottom nav)
- `md:ml-56` or `md:ml-14` (sidebar offset, expanded/collapsed)
- `overflow-y-auto h-screen`

### Canonical Page Structure

**Pattern A: Spacer Layout (Dashboard)**
```tsx
<div className="space-y-12">
  <PageHeader title="..." description="..." size="compact" />
  <div className="grid ...">
    {/* Content sections with generous spacing */}
  </div>
</div>
```

**Pattern B: Custom Padding (Study, Settings)**
```tsx
<div className="p-4 sm:p-6">
  <PageHeader title="..." description="..." size="compact" />
  {/* Content directly follows */}
</div>
```

**Pattern C: Flex Column (Highlights)**
```tsx
<div className="space-y-4 relative h-full flex flex-col w-full px-4 sm:px-6">
  <PageHeader title="..." size="compact" className="pt-6 pb-2" actions={...} />
  {/* Sticky toolbar */}
  <div className="sticky top-0 z-20 bg-background ...">...</div>
  {/* Flex-1 scrollable content */}
  <div className="flex-1 overflow-auto ...">...</div>
  {/* Footer */}
</div>
```

**Pattern D: Full-Screen Immersive (StudySession -- INTENTIONAL DEVIATION)**
```tsx
<div className="h-screen flex flex-col bg-background">
  <header className="px-3 sm:px-4 py-2 border-b ...">
    {/* Compact custom header, NOT PageHeader */}
    {/* Progress bar: h-[3px] */}
  </header>
  <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-8">
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Centered content */}
    </div>
  </div>
  <div className="border-t bg-background p-3 sm:p-4">
    <div className="max-w-2xl mx-auto">
      {/* Fixed footer with rating buttons */}
    </div>
  </div>
</div>
```

**Pattern E: Centered Auth (Login -- INTENTIONAL DEVIATION)**
```tsx
<div className="min-h-screen flex items-center justify-center bg-background">
  <div className="w-full max-w-md px-4 py-6 sm:p-8">
    {/* Logo */}
    <div className="bg-card rounded-2xl shadow-xl border p-6 sm:p-8">
      {/* Form content */}
    </div>
  </div>
</div>
```

### Modal Layout Patterns

**Standard Dialog Modal (BookContextModal, HighlightEditModal):**
```tsx
<DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0">
  <DialogHeader className="p-6 border-b border-border flex-shrink-0">
    {/* Header content */}
  </DialogHeader>
  <div className="flex-1 overflow-y-auto p-6 space-y-4">
    {/* Scrollable body */}
  </div>
  <div className="p-4 border-t border-border bg-muted flex justify-end flex-shrink-0">
    {/* Footer actions */}
  </div>
</DialogContent>
```

Key structural rules:
- `p-0` on DialogContent (sections manage their own padding)
- Header: `p-6` (or `p-3` for compact modals like HighlightEdit), `border-b`, `flex-shrink-0`
- Body: `flex-1 overflow-y-auto`
- Footer: `border-t`, `bg-muted`, `flex-shrink-0`

**Custom Centered Modal (TagSelector in StudySession):**
```tsx
{/* Backdrop */}
<div className="fixed inset-0 bg-foreground/10 dark:bg-foreground/30 z-40" onClick={close} />
{/* Centered content */}
<div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-2 w-full max-w-md sm:px-4">
  <div className="bg-card rounded-md shadow-xl border border-border">
    {/* Content */}
  </div>
</div>
```

### Table Patterns

**Custom Table (Highlights page):**
```tsx
<div className="flex-1 overflow-auto border border-border rounded-xl bg-card shadow-sm">
  <table className="w-full text-left text-xs">
    <thead className="bg-muted text-overline uppercase tracking-wider font-semibold text-muted-foreground sticky top-0 z-10 border-b">
      <tr><th className="px-4 py-3 ...">Column</th></tr>
    </thead>
    <tbody className="divide-y divide-border">
      <tr><td className="px-4 py-3 ...">Cell</td></tr>
    </tbody>
  </table>
</div>
```

**DataTable Component (generic):**
- Uses CSS Grid (not `<table>`)
- `gridCols` string prop for column definition
- Header: `bg-muted text-caption font-semibold`
- Body: `divide-y divide-border`
- Cells: `px-sm py-xs`

**DeckTable (Study page):**
- Uses CSS Grid with responsive columns
- Mobile: `grid-cols-[1fr_48px]`
- Desktop: `sm:grid-cols-[1fr_48px_64px_48px_48px]`
- `tabular-nums` for numeric columns

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Token values | Hardcoded px/rem values | CSS custom properties + Tailwind semantic classes | Central source of truth, dark mode support |
| Page headers | Custom `<h1>` + `<p>` combos | `<PageHeader>` component | Consistent sizing, spacing, action slot |
| Data tables | Custom `<div>` grids | `<DataTable>` component | Consistent header/body styling, click handling |
| Modals | Custom positioned divs | Radix `<Dialog>` + `<DialogContent>` | Focus trapping, ESC handling, overlay, animation |
| Side panels | Custom animated panels | Radix `<Sheet>` | Slide animation, overlay, close behavior |
| Button sizing | Per-instance `className="h-8 px-3"` | `<Button size="compact">` (default) | CVA manages all variant dimensions |
| Color values | Direct oklch() or hex | Semantic tokens (`bg-primary`, `text-muted-foreground`) | Dark mode, consistency |

## Common Pitfalls

### Pitfall 1: Using Old Compact Guidelines
**What goes wrong:** Developer references the existing `compact-ui-design-guidelines.md` and builds components with h-7 buttons, gap-0.5, py-0.5 -- violating the v2.0 "generous" design.
**Why it happens:** The old doc still exists and appears authoritative.
**How to avoid:** Phase 7 replaces/updates this document. The new guide must be the single source of truth.

### Pitfall 2: Hardcoded Color Values Instead of Tokens
**What goes wrong:** Using `text-zinc-500` instead of `text-muted-foreground`, or `bg-zinc-50` instead of `bg-muted`.
**Why it happens:** The old guide used zinc-* classes extensively. Some codebase areas still do.
**How to avoid:** The guide should list semantic color classes as the only acceptable approach. Note: some zinc-* usage may still exist in the codebase from pre-token migration.

### Pitfall 3: Wrong PageHeader Size
**What goes wrong:** Using `size="default"` (text-title, 30px) when all pages now use `size="compact"` (text-heading, 18px).
**Why it happens:** The component still accepts "default" as an option. Prior to Phase 6 standardization, some pages used it.
**How to avoid:** Document that ALL current pages use `size="compact"`. The "default" variant exists but is not currently used.

### Pitfall 4: Missing Dark Mode Support
**What goes wrong:** Using colors that only work in light mode.
**Why it happens:** Not using semantic token classes that automatically switch.
**How to avoid:** ALL color references should use semantic classes (bg-background, text-foreground, border-border, etc.). The oklch values in `:root` and `.dark` handle the switching.

### Pitfall 5: StudySession Font/Layout Deviations
**What goes wrong:** Developer tries to make StudySession match other pages (adding PageHeader, removing serif font).
**Why it happens:** Not knowing the intentional deviations.
**How to avoid:** Document StudySession's intentional deviations explicitly.

### Pitfall 6: z-index Conflicts
**What goes wrong:** Custom modals/overlays using arbitrary z-index values that conflict with Radix components.
**Why it happens:** Radix components use `z-50` (= 50), while the token system uses 1000+ values.
**How to avoid:** Document that Radix UI components use Tailwind's `z-50` and custom modals should follow the same pattern or use the semantic z-index tokens.

## Intentional Deviations (Must Document)

These are NOT bugs -- they are deliberate design choices:

| Page/Component | Deviation | Reason | Decision Source |
|----------------|-----------|--------|-----------------|
| StudySession | `font-serif` on highlight/note text | Immersive reading experience | [06-04] |
| StudySession | Custom compact header (no PageHeader) | Full-screen immersive UX | [06-04] |
| StudySession | Direct rating color buttons (red/amber/blue/green) | SM-2 quality feedback, not semantic tokens | [06-04] |
| StudySession | Full-screen `h-screen flex flex-col` layout | No sidebar/nav distraction during study | [06-04] |
| Login | Centered card layout, no sidebar | Pre-auth, standalone page | [06-01] |
| Login | `text-heading` (not `text-title`) for app name | Not a destination page | [06-01] |
| Login | `rounded-2xl` card (vs standard `rounded-xl`) | Premium feel for auth | Codebase observation |
| Heatmap | Component-specific color gradients | Data visualization, not semantic | [04-02] |

## What the Old Guide Gets Wrong

The existing `compact-ui-design-guidelines.md` (v1.1) has these specific contradictions with the current codebase:

| Old Guide Says | Codebase Actually Uses | Severity |
|----------------|----------------------|----------|
| Button default: `h-7` (28px) | Button default (compact): `h-8` (32px) | HIGH |
| Input: `h-7 px-1.5` | Input: `h-8 px-2.5 py-1.5` | HIGH |
| Gaps: `gap-0.5` or `gap-1` | Semantic spacing: `gap-sm`, `gap-md`, `gap-lg` | HIGH |
| Padding: `py-0.5 px-1.5` | Semantic spacing: `p-sm`, `p-md` | HIGH |
| Colors: `text-zinc-900`, `bg-zinc-50` | Semantic: `text-foreground`, `bg-muted` | HIGH |
| Icon sizes: `w-3 h-3`, `w-2.5 h-2.5` | Icon tokens: `w-icon-sm h-icon-sm`, `w-icon-md h-icon-md` | MEDIUM |
| Border: `rounded` (4px) | Radius tokens: `rounded-sm` (8px), `rounded-md` (10px), `rounded-lg` (12px) | HIGH |
| Titles: `text-lg font-semibold` | Token: `text-heading font-bold` via PageHeader | HIGH |
| z-index: `z-40`, `z-50` raw | Token layer system: `z-modal-backdrop`, `z-modal` | MEDIUM |
| No dark mode awareness | Full oklch light/dark theme | HIGH |
| No mention of CVA variants | Button, Badge, Sheet, Tabs all use CVA | HIGH |
| Manual modal positioning | Radix Dialog/Sheet with animation | HIGH |

## Code Examples

### Building a New Standard Page
```tsx
import { PageHeader } from '../components/patterns/PageHeader';
import { DataTable, Column } from '../components/patterns/DataTable';
import { Button } from '../components/ui/button';

const MyPage = () => {
  return (
    <div className="space-y-12">
      <PageHeader
        title="Page Title"
        description="Brief page description"
        size="compact"
        actions={<Button variant="outline">Action</Button>}
      />

      {/* Content sections with generous spacing */}
      <section>
        <h2 className="text-heading font-bold text-foreground mb-md">Section</h2>
        <DataTable
          columns={columns}
          data={items}
          gridCols="grid-cols-[1fr_100px_80px]"
          onRowClick={handleClick}
          emptyMessage="No items found"
        />
      </section>
    </div>
  );
};
```

### Building a Modal
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';

const MyModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0">
      <DialogHeader className="p-6 border-b border-border flex-shrink-0">
        <DialogTitle className="text-heading font-bold">Modal Title</DialogTitle>
      </DialogHeader>
      <div className="flex-1 overflow-y-auto p-6 space-y-md">
        {/* Body content */}
        <p className="text-body text-foreground">Content here</p>
      </div>
      <div className="p-4 border-t border-border bg-muted flex justify-end gap-xs flex-shrink-0">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button>Confirm</Button>
      </div>
    </DialogContent>
  </Dialog>
);
```

### StatCard Pattern (Dashboard)
```tsx
const StatCard = ({ title, value, icon: Icon }: StatCardProps) => (
  <Card className="hover:border-primary/30 transition-colors duration-200">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-overline font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="w-5 h-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <p className="text-title font-bold tracking-tight">{value}</p>
    </CardContent>
  </Card>
);
```

### Toolbar/Filter Bar Pattern (Highlights)
```tsx
<div className="sticky top-0 z-20 bg-background py-2">
  <div className="flex flex-wrap items-center gap-2 bg-card p-2 rounded-xl border border-border shadow-sm">
    {/* Search */}
    <div className="relative flex-1 min-w-[200px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-sm ..." />
    </div>
    {/* Filter Popovers */}
    <Popover>...</Popover>
  </div>
</div>
```

## State of the Art

| Old Approach (Pre-Phase 4) | Current Approach (Post-Phase 6) | Impact |
|---------------------------|-------------------------------|--------|
| Hardcoded Tailwind utility values | CSS custom properties + Tailwind extensions | Central token control, dark mode |
| `text-lg`, `text-sm`, `text-xs` | `text-heading`, `text-body`, `text-caption` | Semantic meaning, single change point |
| `gap-1`, `p-2`, `mb-4` | `gap-xs`, `p-md`, `mb-lg` | Named intent, grid alignment |
| Manual button sizing per-instance | CVA variants: `size="compact"` | Consistent, less error-prone |
| No reusable page patterns | PageHeader, DataTable components | Zero-effort consistency |
| zinc-* color palette | oklch semantic tokens with dark mode | Theme-ready, perceptually uniform |

## Open Questions

1. **Icon token adoption completeness**
   - What we know: `w-icon-sm`, `w-icon-md`, `w-icon-lg` tokens exist in tailwind.config.js
   - What's unclear: Many components still use `w-3 h-3`, `w-4 h-4` etc. directly
   - Recommendation: Document both the token classes and the commonly-used explicit sizes. Note that semantic tokens are preferred for new code.

2. **z-index token vs Radix z-50**
   - What we know: Token system uses 1000-1070. Radix components use `z-50` (Tailwind default = 50).
   - What's unclear: Whether this mismatch causes layering issues
   - Recommendation: Document the dual system. Radix components work correctly with `z-50` because they portal to body. Custom overlays should follow the token system.

3. **Settings page tab pattern**
   - What we know: Settings uses a custom tab implementation (not the Radix `<Tabs>` component)
   - What's unclear: Whether this was intentional or pre-dates the Radix Tabs component addition
   - Recommendation: Document both patterns (Radix Tabs for new code, custom tabs as existing pattern)

## Sources

### Primary (HIGH confidence)
All findings from direct codebase inspection:
- `index.css` - All CSS custom property definitions (lines 1-201)
- `tailwind.config.js` - All Tailwind extensions (lines 1-166)
- `components/ui/button.tsx` - Button CVA variants
- `components/ui/input.tsx` - Input styling
- `components/ui/badge.tsx` - Badge CVA variants
- `components/ui/card.tsx` - Card component with size prop
- `components/ui/dialog.tsx` - Dialog/Modal structure
- `components/ui/sheet.tsx` - Sheet/Sidebar structure
- `components/ui/select.tsx` - Select trigger size variants
- `components/ui/switch.tsx` - Switch size variants
- `components/ui/tabs.tsx` - Tabs list variants
- `components/ui/checkbox.tsx` - Checkbox styling
- `components/ui/tooltip.tsx` - Tooltip styling
- `components/patterns/PageHeader.tsx` - Page header component
- `components/patterns/DataTable.tsx` - Data table component
- `pages/Dashboard.tsx` - Standard page layout (Pattern A)
- `pages/Study.tsx` - Page with custom padding (Pattern B)
- `pages/Highlights.tsx` - Flex column layout (Pattern C)
- `pages/StudySession.tsx` - Full-screen immersive (Pattern D)
- `pages/Login.tsx` - Centered auth layout (Pattern E)
- `pages/Settings.tsx` - Tabbed page layout
- `components/BookContextModal.tsx` - Standard dialog modal
- `components/HighlightEditModal.tsx` - Compact dialog modal
- `components/DeckTable.tsx` - Custom grid table
- `App.tsx` - App layout structure
- `lbp_diretrizes/compact-ui-design-guidelines.md` - Existing (outdated) guide

### Secondary (MEDIUM confidence)
- Phase decision records [04-01], [04-02], [05-01], [05-02], [06-01] through [06-07] - Documented in phase context

## Metadata

**Confidence breakdown:**
- Token values: HIGH - Read directly from CSS/config files
- Component APIs: HIGH - Read directly from component source
- Page layouts: HIGH - Read directly from page source
- Intentional deviations: HIGH - Documented in phase decisions
- Old guide contradictions: HIGH - Direct comparison of old doc vs codebase

**Research date:** 2026-01-28
**Valid until:** Indefinite (documents existing codebase state; only invalidated by code changes)
