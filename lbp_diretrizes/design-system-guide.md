# Evoque Design System Guide v2.0

**Last updated:** 2026-01-28
**Supersedes:** compact-ui-design-guidelines.md (v1.1, 2025-12-30)

## Purpose

This is the single source of truth for Evoque's visual system. A developer reading only this guide can build a new page that matches existing ones without asking questions.

**Design philosophy:** "Generous" -- big readable titles, generous spacing, rounded containers, semantic tokens. This replaced the previous "Compact" approach (tiny h-7 buttons, gap-0.5, py-0.5 px-1.5) during the v2.0 overhaul.

---

## 1. Token Architecture

Evoque uses a 3-layer token system. Every visual value flows through this chain:

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

**Why 3 layers?** CSS custom properties enable runtime theming (light/dark). Tailwind config makes them available as utility classes. Components consume only Tailwind classes -- never raw CSS variables or hardcoded values.

---

## 2. Token Reference

### Typography

6 named sizes. Use these instead of raw Tailwind `text-sm`, `text-lg`, etc.

| Token | CSS Variable | Value | Tailwind Class | Usage |
|-------|-------------|-------|----------------|-------|
| Display | `--text-display` | 2rem (32px) | `text-display` | Hero text (rare) |
| Title | `--text-title` | 1.875rem (30px) | `text-title` | PageHeader `size="default"` (currently unused) |
| Heading | `--text-heading` | 1.125rem (18px) | `text-heading` | PageHeader `size="compact"`, section headings |
| Body | `--text-body` | 0.875rem (14px) | `text-body` | Default body text |
| Caption | `--text-caption` | 0.75rem (12px) | `text-caption` | Metadata, labels, table headers |
| Overline | `--text-overline` | 0.625rem (10px) | `text-overline` | Tiny uppercase labels, tracking-wider |

**Font families:**
- `font-sans` -- Outfit Variable, Outfit, system-ui fallbacks (default for everything)
- `font-serif` -- Georgia, Cambria, Times New Roman (StudySession highlight/note text only)

### Spacing

8 semantic tokens on a 4px grid. Use these instead of raw Tailwind `p-2`, `gap-4`, etc.

| Token | CSS Variable | Value | Tailwind Class | Example Usage |
|-------|-------------|-------|----------------|---------------|
| xxs | `--space-xxs` | 0.25rem (4px) | `p-xxs`, `gap-xxs` | Minimal gaps |
| xs | `--space-xs` | 0.5rem (8px) | `p-xs`, `gap-xs` | Icon-text gaps, table cell padding |
| sm | `--space-sm` | 0.75rem (12px) | `p-sm`, `gap-sm` | DataTable cell padding |
| md | `--space-md` | 1rem (16px) | `p-md`, `gap-md` | Standard padding, PageHeader gap |
| lg | `--space-lg` | 1.5rem (24px) | `p-lg`, `gap-lg` | PageHeader default bottom margin |
| xl | `--space-xl` | 2rem (32px) | `p-xl`, `gap-xl` | Section spacing |
| 2xl | `--space-2xl` | 3rem (48px) | `p-2xl`, `gap-2xl` | Large section gaps |
| 3xl | `--space-3xl` | 4rem (64px) | `p-3xl`, `gap-3xl` | Maximum spacing |

### Border Radius

3 values derived from the base `--radius: 0.75rem` (12px).

| Token | Value | Tailwind Class |
|-------|-------|----------------|
| lg | 0.75rem (12px) | `rounded-lg` |
| md | calc(0.75rem - 2px) = 10px | `rounded-md` |
| sm | calc(0.75rem - 4px) = 8px | `rounded-sm` |

### Shadows

3 elevation levels.

| Token | CSS Variable | Tailwind Class |
|-------|-------------|----------------|
| Small | `--shadow-sm` | `shadow-sm` |
| Medium | `--shadow-md` | `shadow-md` |
| Large | `--shadow-lg` | `shadow-lg` |

### Motion

3 durations and 3 easings.

| Token | CSS Variable | Value | Tailwind Class |
|-------|-------------|-------|----------------|
| Fast | `--duration-fast` | 150ms | `duration-fast` |
| Base | `--duration-base` | 200ms | `duration-base` |
| Slow | `--duration-slow` | 300ms | `duration-slow` |
| Ease In | `--ease-in` | cubic-bezier(0.4, 0, 1, 1) | `ease-in` |
| Ease Out | `--ease-out` | cubic-bezier(0, 0, 0.2, 1) | `ease-out` |
| Ease In-Out | `--ease-in-out` | cubic-bezier(0.4, 0, 0.2, 1) | `ease-in-out` |

### Icon Sizes

3 fixed rem values (not CSS variables -- icons are theme-invariant).

| Token | Value | Tailwind Class | Usage |
|-------|-------|----------------|-------|
| SM | 0.875rem (14px) | `w-icon-sm h-icon-sm` | Small inline icons |
| MD | 1rem (16px) | `w-icon-md h-icon-md` | Standard icons |
| LG | 1.25rem (20px) | `w-icon-lg h-icon-lg` | Section/header icons |

Note: Some existing code uses explicit sizes (`w-3 h-3`, `w-4 h-4`). Prefer semantic tokens for new code.

### Z-Index Layers

7 semantic layers. Radix components use Tailwind's `z-50` (value = 50) internally, which works because they portal to `<body>`. Custom overlays should use the semantic tokens.

| Token | CSS Variable | Value | Tailwind Class | Usage |
|-------|-------------|-------|----------------|-------|
| Base | `--z-base` | 0 | `z-base` | Default content |
| Dropdown | `--z-dropdown` | 1000 | `z-dropdown` | Dropdown menus |
| Sticky | `--z-sticky` | 1020 | `z-sticky` | Sticky headers, toolbars |
| Fixed | `--z-fixed` | 1030 | `z-fixed` | Fixed nav elements |
| Modal Backdrop | `--z-modal-backdrop` | 1040 | `z-modal-backdrop` | Modal overlays |
| Modal | `--z-modal` | 1050 | `z-modal` | Modal content |
| Popover | `--z-popover` | 1060 | `z-popover` | Popovers |
| Tooltip | `--z-tooltip` | 1070 | `z-tooltip` | Top-level tooltips |

### Colors

All colors use oklch for perceptual uniformity. Light/dark values defined in `index.css` under `:root` and `.dark`. Always use the semantic Tailwind class -- never hardcode oklch values.

| Category | Token | Tailwind Class | Meaning |
|----------|-------|----------------|---------|
| **Core** | background | `bg-background` | Page background |
| | foreground | `text-foreground` | Primary text |
| | primary | `bg-primary` / `text-primary` | Brand color, CTAs |
| | primary-foreground | `text-primary-foreground` | Text on primary bg |
| | destructive | `bg-destructive` / `text-destructive` | Danger actions |
| **Surface** | card | `bg-card` | Card/container bg |
| | muted | `bg-muted` | Subtle backgrounds |
| | accent | `bg-accent` | Hover/highlight bg |
| | border | `border-border` | All borders |
| | muted-foreground | `text-muted-foreground` | Secondary text |
| **Status** | status-new | `bg-status-new` | Blue -- new cards |
| | status-learning | `bg-status-learning` | Amber -- learning |
| | status-review | `bg-status-review` | Green -- review |
| | status-foreground | `text-status-foreground` | White text on badges |
| **Tags** | tag-global | `bg-tag-global` | Blue -- global tags |
| | tag-book | `bg-tag-book` | Amber -- book-specific |
| **Success** | success | `text-success` | Green -- positive state |

For exact oklch values, see `index.css` `:root` (light) and `.dark` (dark mode) blocks.

---

## 3. Component API Reference

All components use `cn()` for class merging and support `className` override.

### Button

Source: `components/ui/button.tsx` -- CVA-based.

```typescript
variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
size:    'default' | 'compact' | 'sm' | 'lg' | 'icon'
```

| Size | Dimensions | Notes |
|------|-----------|-------|
| default | h-10 px-4 py-2 | Large actions |
| **compact** | **h-8 px-3 py-1.5** | **DEFAULT -- used everywhere** |
| sm | h-7 px-2.5 rounded-md | Tight spaces |
| lg | h-11 px-8 rounded-md | Prominent CTAs |
| icon | h-8 w-8 | Icon-only buttons |

```tsx
<Button>Primary action</Button>                    {/* compact, default variant */}
<Button variant="outline">Secondary</Button>
<Button variant="ghost" size="icon"><X /></Button>
<Button size="sm">Tight space</Button>
```

### Input

Source: `components/ui/input.tsx` -- single style, no variants.

- Base: `h-8 px-2.5 py-1.5 text-sm rounded-md border-input bg-background`
- Focus: `ring-2 ring-ring ring-offset-2`

```tsx
<Input placeholder="Search..." />
```

### Badge

Source: `components/ui/badge.tsx` -- CVA-based, pill shape.

```typescript
variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
```

- Base: `h-5 px-2 py-0.5 text-xs rounded-4xl` (pill)
- Icons inside: `size-3`

```tsx
<Badge>Default</Badge>
<Badge variant="secondary">Category</Badge>
<Badge variant="outline">Filter</Badge>
```

### Card

Source: `components/ui/card.tsx` -- size prop.

```typescript
size: 'default' | 'sm'
```

| Size | Gap | Padding-Y | Content Px |
|------|-----|-----------|-----------|
| default | gap-6 | py-6 | px-6 |
| sm | gap-4 | py-4 | px-4 |

Sub-components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### PageHeader

Source: `components/patterns/PageHeader.tsx`.

```typescript
interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  size?: 'default' | 'compact'
  className?: string
}
```

| Size | Title | Description | Bottom Margin |
|------|-------|-------------|---------------|
| default | text-title (30px) | text-body | mb-lg (24px) |
| **compact** | **text-heading (18px)** | **text-caption** | **mb-md (16px)** |

**All current pages use `size="compact"`.** The "default" variant exists but is not used. This was standardized in Phase 6 -- every page gets the same compact header for visual consistency.

```tsx
<PageHeader title="Page Title" description="Brief subtitle" size="compact" />
<PageHeader title="Title" size="compact" actions={<Button variant="outline">Action</Button>} />
```

### DataTable

Source: `components/patterns/DataTable.tsx` -- CSS Grid based (not `<table>`).

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

interface Column<T> {
  key: string
  header: string
  render: (item: T) => React.ReactNode
  className?: string
  headerClassName?: string
}
```

- Container: `border border-border rounded overflow-hidden`
- Header: `bg-muted text-caption font-semibold text-muted-foreground`
- Cells: `px-sm py-xs`
- Clickable rows: `hover:bg-accent/50 transition-colors`

```tsx
<DataTable
  columns={[
    { key: 'name', header: 'Name', render: (item) => item.name },
    { key: 'count', header: 'Count', render: (item) => item.count },
  ]}
  data={items}
  gridCols="grid-cols-[1fr_80px]"
  onRowClick={handleClick}
  emptyMessage="No items found"
/>
```

### Dialog / Modal

Source: `components/ui/dialog.tsx` -- Radix Dialog wrapper.

- Overlay: `fixed inset-0 z-50 bg-black/80`
- Content: `fixed centered, max-w-lg, p-6, sm:rounded-lg`
- Close button: `absolute right-4 top-4`, X icon `h-4 w-4`

**Canonical 3-section modal layout** (used by BookContextModal, HighlightEditModal):

```tsx
<Dialog open={open} onOpenChange={(o) => !o && onClose()}>
  <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0">
    {/* Header */}
    <DialogHeader className="p-6 border-b border-border flex-shrink-0">
      <DialogTitle className="text-heading font-bold">Title</DialogTitle>
    </DialogHeader>
    {/* Scrollable body */}
    <div className="flex-1 overflow-y-auto p-6 space-y-md">
      <p className="text-body text-foreground">Content</p>
    </div>
    {/* Footer */}
    <div className="p-4 border-t border-border bg-muted flex justify-end gap-xs flex-shrink-0">
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button>Confirm</Button>
    </div>
  </DialogContent>
</Dialog>
```

Key rules:
- `p-0` on DialogContent -- sections manage their own padding
- Header: `p-6`, `border-b`, `flex-shrink-0`
- Body: `flex-1 overflow-y-auto`
- Footer: `border-t`, `bg-muted`, `flex-shrink-0`

### Sheet

Source: `components/ui/sheet.tsx` -- CVA-based side panel. Side variants: `'top' | 'bottom' | 'left' | 'right'` (default: right). Content: `w-3/4 sm:max-w-sm, p-6`. Title: `text-lg font-semibold`.

```tsx
<Sheet>
  <SheetTrigger asChild><Button variant="outline">Open</Button></SheetTrigger>
  <SheetContent side="right">
    <SheetHeader><SheetTitle>Panel Title</SheetTitle></SheetHeader>
    {/* Content */}
  </SheetContent>
</Sheet>
```

### Select, Switch, Tabs, Checkbox, Tooltip

| Component | Source | Key Props | Notes |
|-----------|--------|-----------|-------|
| **Select** | `ui/select.tsx` | `SelectTrigger size="sm"\|"default"` | default: h-9, sm: h-8 |
| **Switch** | `ui/switch.tsx` | `size="sm"\|"default"` | default: h-[18.4px] w-[32px], sm: h-[14px] w-[24px] |
| **Tabs** | `ui/tabs.tsx` | `TabsList variant="default"\|"line"` | default: bg-muted, line: transparent + underline |
| **Checkbox** | `ui/checkbox.tsx` | (none) | Fixed: size-4, rounded-[4px], checked: bg-primary |
| **Tooltip** | `ui/tooltip.tsx` | (none) | Inverted: bg-foreground text-background, has arrow |

```tsx
{/* Select */}
<Select value={val} onValueChange={setVal}>
  <SelectTrigger size="sm"><SelectValue placeholder="Choose..." /></SelectTrigger>
  <SelectContent><SelectItem value="a">Option A</SelectItem></SelectContent>
</Select>

{/* Tabs */}
<Tabs defaultValue="tab1">
  <TabsList variant="line">
    <TabsTrigger value="tab1">First</TabsTrigger>
    <TabsTrigger value="tab2">Second</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content</TabsContent>
</Tabs>

{/* Switch, Checkbox, Tooltip */}
<Switch checked={on} onCheckedChange={setOn} />
<Checkbox checked={val} onCheckedChange={setVal} />
<Tooltip>
  <TooltipTrigger asChild><Button variant="ghost" size="icon"><Info /></Button></TooltipTrigger>
  <TooltipContent>Helpful text</TooltipContent>
</Tooltip>
```

---

## 4. Page Layout Patterns

### App Layout Wrapper

All authenticated pages render inside this structure (defined in `App.tsx`):

```
AppLayout
+-- Sidebar (left, hidden on mobile)
+-- main.flex-1.overflow-y-auto.h-screen
|     padding: p-4 md:p-8, pb-20 md:pb-8
|     sidebar offset: md:ml-56 or md:ml-14
|     +-- div.w-full.mx-auto
|         +-- [Page Component]
+-- BottomNav (mobile only)
```

The `main` element provides the outer padding. Pages should NOT add their own outer padding unless they need custom values (Pattern B).

### Pattern A: Spacer Layout (Dashboard)

Standard page with vertical spacing between sections.

```tsx
<div className="space-y-12">
  <PageHeader title="Dashboard" description="Your study overview" size="compact" />
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    {/* StatCards */}
  </div>
  <section>
    <h2 className="text-heading font-bold text-foreground mb-md">Section</h2>
    {/* Section content */}
  </section>
</div>
```

### Pattern B: Custom Padding (Study, Settings)

Page that manages its own internal padding.

```tsx
<div className="p-4 sm:p-6">
  <PageHeader title="Study" description="Review your decks" size="compact" />
  {/* Content */}
</div>
```

### Pattern C: Flex Column (Highlights)

Full-height page with sticky toolbar and scrollable content.

```tsx
<div className="space-y-4 relative h-full flex flex-col w-full px-4 sm:px-6">
  <PageHeader title="Highlights" size="compact" className="pt-6 pb-2" actions={...} />
  <div className="sticky top-0 z-20 bg-background py-2">
    <div className="flex flex-wrap items-center gap-2 bg-card p-2 rounded-xl border border-border shadow-sm">...</div>
  </div>
  <div className="flex-1 overflow-auto">{/* Table or card list */}</div>
</div>
```

### Pattern D: Full-Screen Immersive (StudySession)

**Intentional deviation** -- no sidebar, no PageHeader, serif fonts. Structure: `h-screen flex flex-col bg-background` with 3 sections:

```tsx
<div className="h-screen flex flex-col bg-background">
  <header className="px-3 sm:px-4 py-2 border-b border-border">{/* Back, progress, actions */}</header>
  <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-8">
    <div className="max-w-2xl mx-auto space-y-6">{/* font-serif content */}</div>
  </div>
  <div className="border-t bg-background p-3 sm:p-4">
    <div className="max-w-2xl mx-auto">{/* Rating buttons */}</div>
  </div>
</div>
```

### Pattern E: Centered Auth (Login)

**Intentional deviation** -- standalone, no sidebar.

```tsx
<div className="min-h-screen flex items-center justify-center bg-background">
  <div className="w-full max-w-md px-4 py-6 sm:p-8">
    {/* Logo */}
    <div className="bg-card rounded-2xl shadow-xl border p-6 sm:p-8">
      {/* Auth form */}
    </div>
  </div>
</div>
```

---

## 5. Common Patterns

### StatCard (Dashboard)

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

### Toolbar / Filter Bar (Highlights)

Sticky search bar with filter popovers inside a card container: `sticky top-0 z-20 bg-background py-2` wrapping a `flex flex-wrap items-center gap-2 bg-card p-2 rounded-xl border border-border shadow-sm`.

### Modal with Scrollable Body

See Dialog component in Section 3. Key structure: `p-0` on DialogContent with 3 flex sections (header/body/footer).

### Custom Grid Table (DeckTable, Study page)

For responsive column visibility, use CSS Grid directly (not DataTable):
- Container: `border border-border rounded-xl overflow-hidden bg-card shadow-sm`
- Header/rows: `grid grid-cols-[1fr_48px] sm:grid-cols-[1fr_48px_64px_48px_48px]`
- Header style: `bg-muted px-sm py-xs text-caption font-semibold text-muted-foreground`
- Row style: `px-sm py-xs hover:bg-accent/50 transition-colors`
- Use `tabular-nums` for numeric columns

---

## 6. Intentional Deviations

These are deliberate design choices, NOT bugs. Do not "fix" them.

| Page/Component | Deviation | Reason |
|----------------|-----------|--------|
| StudySession | `font-serif` on highlight/note text | Immersive reading experience |
| StudySession | Custom compact header (no PageHeader) | Full-screen immersive UX |
| StudySession | Direct color rating buttons (red/amber/blue/green) | SM-2 quality feedback -- not semantic tokens |
| StudySession | `h-screen flex flex-col` full-screen layout | No sidebar/nav distraction during study |
| Login | Centered card layout, no sidebar | Pre-auth standalone page |
| Login | `text-heading` (not `text-title`) for app name | Not a destination page |
| Login | `rounded-2xl` card (vs standard `rounded-xl`) | Premium feel for auth card |
| Heatmap | Component-specific color gradients | Data visualization, not semantic UI colors |

---

## 7. Rules and Anti-Patterns

| Rule | Don't | Do |
|------|-------|-----|
| No hardcoded spacing | `p-4 gap-6 mb-8` | `p-md gap-lg mb-xl` |
| No raw zinc/gray | `text-zinc-500`, `bg-zinc-50` | `text-muted-foreground`, `bg-muted` |
| No raw text sizes | `text-lg`, `text-sm`, `text-xs` | `text-heading`, `text-body`, `text-caption` |
| No manual button sizing | `<button className="h-8 px-3 ...">` | `<Button>Click</Button>` (compact default) |
| No custom modals | `<div className="fixed inset-0 ...">` | `<Dialog>` / `<DialogContent>` |
| No PageHeader default | `size="default"` | `size="compact"` (all pages) |

---

## 8. Building a New Page

Step-by-step recipe for adding a page to Evoque:

**Step 1.** Create the page file in `pages/YourPage.tsx`.

**Step 2.** Choose a layout pattern (A-E) from Section 4. Most new pages use Pattern A.

**Step 3.** Add the PageHeader:
```tsx
import { PageHeader } from '../components/patterns/PageHeader';

<PageHeader title="Your Page" description="What this page does" size="compact" />
```

**Step 4.** Build content using semantic tokens:
```tsx
<section>
  <h2 className="text-heading font-bold text-foreground mb-md">Section Title</h2>
  <p className="text-body text-muted-foreground mb-sm">Description text.</p>
  {/* Use DataTable, Card, or custom layout */}
</section>
```

**Step 5.** Add the route in `App.tsx`, navigation in `Sidebar.tsx` / `BottomNav.tsx`.

**Step 6.** Verify your page against this checklist:
- [ ] Uses `PageHeader size="compact"`
- [ ] All text uses semantic tokens (text-heading, text-body, text-caption)
- [ ] All spacing uses semantic tokens (p-md, gap-lg, mb-sm)
- [ ] All colors use semantic classes (text-foreground, bg-muted, border-border)
- [ ] Buttons use the `<Button>` component (not manual styling)
- [ ] Modals use Radix `<Dialog>` (not custom overlays)
- [ ] Tables use `<DataTable>` or follow the grid table pattern

---

## 9. Changelog

**v2.0** -- 2026-01-28: Complete rewrite for the v2.0 Design System Overhaul (Phases 4-7). Replaced "Compact" with "Generous" design language. Semantic design tokens, oklch colors with light/dark, CVA component variants, PageHeader/DataTable patterns, 5 page layout patterns.

**v1.x** -- 2025-12-05 to 2025-12-30 (superseded): Original "Compact UI Design Guidelines" in Portuguese. Based on h-7 buttons, gap-0.5, zinc-* colors. No longer reflects the codebase -- do not reference.
