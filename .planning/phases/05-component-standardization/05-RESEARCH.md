# Phase 5: Component Standardization - Research

**Researched:** 2026-01-27
**Domain:** React component architecture, shadcn/ui customization, design system implementation
**Confidence:** HIGH

## Summary

Phase 5 standardizes the component layer to match the token foundation from Phase 4. This involves three distinct activities: (1) auditing and fixing shadcn/ui component defaults to match the design system, (2) creating canonical composition patterns for repeated UI structures (PageHeader, data tables), and (3) adjusting CVA variants to reflect the token system without requiring arbitrary overrides.

The research reveals that the codebase already has excellent patterns in place (DeckTable, shadcn/ui with CVA), but lacks consistency across pages. Three pages use `text-3xl` titles (Dashboard, Highlights), while two use `text-base` (Study, Settings). The token system defines `text-title` (30px) but no pages use it yet. The solution is to establish PageHeader as the canonical pattern and migrate all pages to consistent structures.

**Primary recommendation:** Use composition (PageHeader component) for page structure standardization, CVA variant adjustments for component defaults, and extract the DeckTable pattern into a general DataTable pattern that can be reused across the app.

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| class-variance-authority (CVA) | Latest | Component variant management | Used by shadcn/ui, industry standard for type-safe variants |
| @radix-ui/* | Latest | Headless component primitives | shadcn/ui foundation, accessibility built-in |
| tailwindcss | Latest | Utility-first CSS framework | Design token delivery mechanism |
| React 19 | 19.x | Component framework | Latest stable, already in use |

### Supporting (Already Available)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | Latest | Icon system | Already standardized at 14px/16px/20px (--icon-sm/md/lg) |
| cn() utility | N/A | className merging | From lib/utils.ts, used everywhere |

### No New Dependencies Required

All tools needed for component standardization are already installed and in active use. The work is about **establishing patterns** and **adjusting defaults**, not adding new libraries.

## Architecture Patterns

### Recommended Project Structure

```
components/
├── ui/                    # shadcn/ui base components (DO NOT modify structure)
│   ├── button.tsx        # Adjust CVA defaults to match tokens
│   ├── input.tsx         # Adjust height default to h-8 or h-9
│   ├── card.tsx          # Already matches token system
│   └── badge.tsx         # Adjust CVA defaults to match tokens
├── patterns/             # NEW: Canonical composition patterns
│   ├── PageHeader.tsx    # Standard page layout template
│   └── DataTable.tsx     # Reusable table structure (generalize DeckTable)
└── [app components]      # Existing app-specific components
```

### Pattern 1: PageHeader Component (Composition Pattern)

**What:** A canonical page layout template that provides consistent structure for all pages.

**When to use:** Every page except Login and StudySession (which have unique layouts).

**Current state:** Pages have inconsistent header patterns:
- Dashboard/Highlights: `text-3xl` titles, `text-muted-foreground mt-2` subtitles
- Study/Settings: `text-base` titles, `text-xs text-muted-foreground mt-1` subtitles
- Some have action buttons, some don't
- No consistent spacing pattern

**Desired state:** Single PageHeader component used everywhere with variants for size.

**Example:**
```typescript
// components/patterns/PageHeader.tsx
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  size?: 'default' | 'compact'
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  size = 'default',
  className
}: PageHeaderProps) {
  return (
    <header className={cn('mb-6', size === 'compact' && 'mb-3', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={cn(
            'font-bold text-foreground tracking-tight',
            size === 'default' ? 'text-title' : 'text-heading'
          )}>
            {title}
          </h1>
          {description && (
            <p className={cn(
              'text-muted-foreground mt-1',
              size === 'default' ? 'text-body' : 'text-caption'
            )}>
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </header>
  )
}

// Usage in pages/Dashboard.tsx (AFTER migration):
<PageHeader
  title={t('title')}
  description={t('subtitle')}
  size="default"
/>

// Usage in pages/Study.tsx (AFTER migration):
<PageHeader
  title={t('title')}
  description={t('subtitle')}
  size="compact"
/>
```

**Token mapping:**
- `text-title` (30px) for default size titles → replaces `text-3xl`
- `text-heading` (18px) for compact size titles → replaces `text-base`
- `text-body` (14px) for default descriptions → replaces `text-sm`
- `text-caption` (12px) for compact descriptions → replaces `text-xs`

**Benefits:**
- Single source of truth for page headers
- Consistent spacing and typography
- Easy to update globally
- Type-safe props with TypeScript

### Pattern 2: DataTable Component (Generalize DeckTable)

**What:** A reusable data table structure with consistent header, row, and hover styles.

**When to use:** Any tabular data display (currently only DeckTable, future: highlights table, review logs table).

**Current state:** DeckTable (components/DeckTable.tsx) is excellent but specific to deck data. It has:
- Fixed header with border
- Hover states with `hover:bg-accent/50`
- Grid layout for responsive columns
- Semantic color coding for status (text-status-new/learning/review)

**Desired state:** Extract the pattern into a generic DataTable that can be configured with column definitions.

**Example structure:**
```typescript
// components/patterns/DataTable.tsx
interface Column<T> {
  key: string
  header: string
  render: (item: T) => React.ReactNode
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (item: T) => void
  gridCols: string  // e.g., "grid-cols-[1fr_48px]"
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  gridCols
}: DataTableProps<T>) {
  return (
    <div className="border border-border rounded overflow-hidden">
      {/* Header */}
      <div className={cn(
        'bg-muted border-b border-border px-2 py-1 grid gap-2 items-center',
        gridCols
      )}>
        {columns.map(col => (
          <div
            key={col.key}
            className={cn('text-caption font-semibold text-muted-foreground', col.headerClassName)}
          >
            {col.header}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="divide-y divide-border">
        {data.map(item => (
          <button
            key={item.id}
            onClick={() => onRowClick?.(item)}
            className={cn(
              'w-full px-2 py-1 grid gap-2 items-center',
              gridCols,
              'hover:bg-accent/50 transition-colors text-left'
            )}
          >
            {columns.map(col => (
              <div key={col.key} className={col.className}>
                {col.render(item)}
              </div>
            ))}
          </button>
        ))}
      </div>
    </div>
  )
}

// Usage (migrating DeckTable):
<DataTable
  columns={[
    { key: 'title', header: t('table.deck'), render: (deck) => (
      <div className="min-w-0">
        <div className="text-body text-foreground truncate">{deck.title}</div>
        {deck.author && <div className="text-caption text-muted-foreground truncate">{deck.author}</div>}
      </div>
    )},
    { key: 'new', header: t('table.new'), className: 'text-caption text-right', render: (deck) => (
      <span className={cn(deck.stats.new > 0 ? 'text-status-new font-medium' : 'text-muted-foreground')}>
        {deck.stats.new}
      </span>
    )},
    // ... other columns
  ]}
  data={decks}
  onRowClick={(deck) => handleDeckClick(deck.id)}
  gridCols="grid-cols-[1fr_48px_64px_48px_48px]"
/>
```

**Benefits:**
- Reusable across any table-like data
- Consistent styling and behavior
- Type-safe with generics
- Easier to maintain and test

### Pattern 3: CVA Variant Adjustments for Token System

**What:** Modify CVA default variants in shadcn/ui components to match token system defaults without requiring overrides on every usage.

**When to use:** For Button, Input, Badge, Card components where current defaults don't match the token system.

**Current issues identified:**
1. **Button height:** Default is `h-10` (40px), but compact UI uses `h-7` (28px) or `h-8` (32px)
2. **Input height:** Default is `h-10` (40px), matches Button but may be too tall for compact design
3. **Badge size:** Default `h-5` seems correct, but verify against token system usage
4. **Card radius:** Already uses `rounded-xl` which matches token system

**Example adjustment (Button):**
```typescript
// components/ui/button.tsx (BEFORE)
const buttonVariants = cva(
  "inline-flex items-center justify-center ...",
  {
    variants: {
      variant: { /* ... */ },
      size: {
        default: "h-10 px-4 py-2",  // ← Too tall for compact UI
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",  // ← This is the problem
    },
  }
)

// components/ui/button.tsx (AFTER - Option A: Change default)
const buttonVariants = cva(
  "inline-flex items-center justify-center ...",
  {
    variants: {
      variant: { /* ... */ },
      size: {
        default: "h-8 px-3 py-1.5",  // ← Matches compact UI (32px)
        sm: "h-7 rounded-md px-2.5", // ← Smaller (28px)
        lg: "h-10 rounded-md px-4",  // ← Larger (40px, old default)
        icon: "h-8 w-8",             // ← Match new default
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",  // ← Now defaults to h-8
    },
  }
)

// components/ui/button.tsx (AFTER - Option B: Add compact variant)
const buttonVariants = cva(
  "inline-flex items-center justify-center ...",
  {
    variants: {
      variant: { /* ... */ },
      size: {
        default: "h-10 px-4 py-2",     // ← Keep original
        compact: "h-8 px-3 py-1.5",    // ← NEW: Matches compact UI
        sm: "h-7 rounded-md px-2.5",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "compact",  // ← Default to compact
    },
  }
)
```

**Decision point:** Option A (change default) is simpler but may break existing usage. Option B (add compact variant) is safer but requires changing defaultVariants. Recommend **Option B** for safety.

**Input adjustment:**
```typescript
// components/ui/input.tsx (BEFORE)
className={cn(
  "flex h-10 w-full rounded-md border border-input ...",
  className
)}

// components/ui/input.tsx (AFTER)
className={cn(
  "flex h-8 w-full rounded-md border border-input ...",  // ← h-10 → h-8
  className
)}
```

Input doesn't use CVA, so this is a direct change. However, this **will break** any inputs that expect the larger size. Recommend auditing all Input usages first.

### Anti-Patterns to Avoid

**❌ Don't: Modify shadcn/ui component structure**
```typescript
// BAD: Changing the component's composition
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className="wrapper">  {/* ← Adding wrapper div */}
      <div className={cn("ring-foreground/10 bg-card ...", className)} {...props} />
    </div>
  )
}
```
**Why bad:** Breaks shadcn/ui's update path. Can't `npx shadcn@latest add card` without conflicts.

**✅ Do: Adjust only className defaults and CVA variants**
```typescript
// GOOD: Only changing default classes, structure unchanged
function Card({ className, size = "default", ...props }: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      className={cn(
        "ring-foreground/10 bg-card text-card-foreground gap-6 ...",  // ← Only these change
        className
      )}
      {...props}
    />
  )
}
```

**❌ Don't: Create wrapper components that hide original props**
```typescript
// BAD: Custom wrapper that limits flexibility
export function MyButton({ label, onClick }: { label: string, onClick: () => void }) {
  return <Button onClick={onClick}>{label}</Button>
}
```
**Why bad:** Loses all Button props (disabled, type, className, etc.). Not composable.

**✅ Do: Use composition with full props passthrough**
```typescript
// GOOD: Composition pattern that preserves all props
export function PageHeader({ title, actions }: { title: string, actions?: React.ReactNode }) {
  return (
    <header>
      <h1>{title}</h1>
      {actions}
    </header>
  )
}

// Usage preserves Button flexibility:
<PageHeader
  title="Settings"
  actions={<Button size="sm" variant="outline" disabled={isLoading}>Save</Button>}
/>
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Component variants | Custom switch/case logic | CVA (class-variance-authority) | Type-safe, composable, already used by shadcn/ui |
| className merging | String concatenation | cn() from lib/utils | Handles conditional classes, deduplicates, uses clsx + tailwind-merge |
| Responsive grids | Custom media queries | Tailwind grid utilities | Already in use (DeckTable uses `grid-cols-[1fr_48px] sm:grid-cols-[...]`) |
| Icon sizing | Inline width/height | Token-based utilities (w-icon-sm/md/lg) | Already defined in Phase 4, consistent across app |
| Page layout | Copy-paste header code | PageHeader composition component | Single source of truth, easier to maintain |

**Key insight:** The codebase already uses best-practice tools (CVA, cn(), Tailwind utilities). The work is about **consistency** and **patterns**, not replacing tools.

## Common Pitfalls

### Pitfall 1: Breaking Existing shadcn/ui Usage

**What goes wrong:** Changing Button default from `h-10` to `h-8` breaks existing buttons that expect the larger size (e.g., login page, prominent CTAs).

**Why it happens:** Default size changes affect ALL usage unless explicitly overridden.

**How to avoid:**
1. Audit all Button/Input usages BEFORE changing defaults
2. Use CVA variant approach (add `compact` variant, change defaultVariants) instead of modifying existing variants
3. Grep for all usages: `<Button` and check for size props
4. Consider a gradual migration: add new variant, migrate usage, then change default

**Warning signs:**
- Tests fail after component changes
- Visual regression in Login or prominent CTAs
- Buttons look unexpectedly small

### Pitfall 2: Over-Engineering the DataTable

**What goes wrong:** Creating a fully-featured table component with sorting, filtering, pagination, selection, etc. This becomes a massive undertaking that delays the phase.

**Why it happens:** Temptation to build a "perfect" table component that handles every use case.

**How to avoid:**
1. Start with ONLY the DeckTable pattern (header, rows, click handlers, hover states)
2. Don't add sorting/filtering/pagination in Phase 5 (defer to future needs)
3. Keep it simple: columns, data, render functions, that's it
4. If a feature isn't used in DeckTable today, don't add it

**Warning signs:**
- DataTable.tsx exceeds 200 lines
- Adding props for features that don't exist in DeckTable
- Scope creep ("while we're here, let's add...")

### Pitfall 3: Inconsistent Token Usage in Components

**What goes wrong:** PageHeader uses `text-title` but other components still use `text-3xl` or raw sizes. Token system adoption becomes partial and inconsistent.

**Why it happens:** Mixing old and new patterns during migration without a complete plan.

**How to avoid:**
1. Make token mapping explicit in the plan (COMP-02 task)
2. Use RAW_COLOR_MAP.md approach: create a TOKEN_USAGE_MAP.md for typography/spacing
3. Migrate all pages to PageHeader in a single atomic change
4. Use grep to verify no pages still use old patterns after migration

**Warning signs:**
- Some pages use `text-title`, others use `text-3xl`
- Spacing inconsistencies (some `mb-6`, others `mb-3`)
- Developer confusion about which token to use

### Pitfall 4: Losing shadcn/ui Update Path

**What goes wrong:** Modifying shadcn/ui component structure (adding wrappers, changing data-slot attributes, restructuring DOM) breaks the ability to update components via `npx shadcn@latest add <component>`.

**Why it happens:** Treating shadcn/ui components like regular app components that can be freely modified.

**How to avoid:**
1. Only modify CVA variant definitions and className strings
2. Never add/remove/restructure DOM elements in shadcn/ui components
3. Never change data-slot, data-* attributes
4. Test updates: after changes, run `npx shadcn@latest add button --overwrite` and verify no conflicts

**Warning signs:**
- Merge conflicts when running shadcn update commands
- Lost custom changes after updating a component
- Components that look nothing like official shadcn/ui examples

## Code Examples

Verified patterns from codebase analysis and best practices research:

### Example 1: Current DeckTable Pattern (Reference)

```typescript
// components/DeckTable.tsx (CURRENT - 97 lines total)
// This is the GOLD STANDARD for table structure
export const DeckTable: React.FC<DeckTableProps> = ({ decks, onDeckClick }) => {
  const { t } = useTranslation('study');

  return (
    <div className="border border-border rounded overflow-hidden">
      {/* Table Header */}
      <div className="bg-muted border-b border-border px-2 py-1 grid grid-cols-[1fr_48px] sm:grid-cols-[1fr_48px_64px_48px_48px] gap-2 items-center">
        <div className="text-xs font-semibold text-muted-foreground">{t('table.deck')}</div>
        <div className="hidden sm:block text-xs font-semibold text-muted-foreground text-right">{t('table.new')}</div>
        {/* ... */}
      </div>

      {/* Table Body */}
      <div className="divide-y divide-border">
        {decks.map((deck) => (
          <button
            key={deck.id}
            onClick={() => onDeckClick(deck.id)}
            className={cn(
              "w-full px-2 py-1 grid grid-cols-[1fr_48px] sm:grid-cols-[1fr_48px_64px_48px_48px] gap-2 items-center",
              "hover:bg-accent/50 transition-colors text-left",
              deck.isAllBooks && "bg-muted/50 font-medium"
            )}
          >
            {/* Cell content */}
          </button>
        ))}
      </div>
    </div>
  );
};
```

**Key patterns to preserve:**
- `border border-border rounded overflow-hidden` wrapper
- `bg-muted border-b border-border` header
- `text-xs` (text-caption) for headers
- `hover:bg-accent/50` for row hover
- `divide-y divide-border` for row separators
- Responsive grid with `sm:` breakpoint

### Example 2: Inconsistent Page Headers (Current Problem)

```typescript
// pages/Dashboard.tsx (CURRENT - uses text-3xl)
<div className="space-y-12">
  <div>
    <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('title')}</h1>
    <p className="text-muted-foreground mt-2 font-light">{t('subtitle')}</p>
  </div>
  {/* ... */}
</div>

// pages/Study.tsx (CURRENT - uses text-base)
<div className="p-4 sm:p-6">
  <header className="mb-3">
    <h1 className="text-base font-semibold text-foreground">{t('title')}</h1>
    <p className="text-xs text-muted-foreground mt-1">{t('subtitle')}</p>
  </header>
  {/* ... */}
</div>

// pages/Settings.tsx (CURRENT - uses text-base)
<h1 className="text-base font-semibold text-foreground">{t('title')}</h1>

// pages/Highlights.tsx (CURRENT - uses text-3xl)
<h1 className="text-3xl font-bold text-foreground tracking-tight">{t('title')}</h1>
<p className="text-muted-foreground mt-2 text-sm">{t('stats', { /* ... */ })}</p>
```

**Problem:** 3 different patterns across 5 pages (excluding Login/StudySession).

### Example 3: Proposed PageHeader Usage (After Standardization)

```typescript
// pages/Dashboard.tsx (AFTER)
import { PageHeader } from '../components/patterns/PageHeader'

const Dashboard = () => {
  const { t } = useTranslation('dashboard');

  return (
    <div className="space-y-12">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        size="default"
      />
      {/* ... */}
    </div>
  );
};

// pages/Study.tsx (AFTER)
import { PageHeader } from '../components/patterns/PageHeader'

const Study = () => {
  const { t } = useTranslation('study');

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        size="compact"
      />
      {/* ... */}
    </div>
  );
};

// pages/Settings.tsx (AFTER - with actions)
import { PageHeader } from '../components/patterns/PageHeader'

const Settings = () => {
  const { t } = useTranslation('settings');

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title={t('title')}
        size="compact"
        actions={
          <Button size="sm" onClick={handleSave}>Save All</Button>
        }
      />
      {/* ... */}
    </div>
  );
};
```

**Result:** All pages use the same component, differences are explicit via props (size, actions), not copy-pasted markup.

### Example 4: CVA Variant Extension (Button)

```typescript
// components/ui/button.tsx (PROPOSED CHANGE)
// Based on shadcn/ui + CVA best practices from research

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",      // UNCHANGED: Keep original for compatibility
        compact: "h-8 px-3 py-1.5",     // NEW: Matches compact UI (32px)
        sm: "h-7 rounded-md px-2.5",    // ADJUST: Smaller compact (28px)
        lg: "h-11 rounded-md px-8",     // UNCHANGED
        icon: "h-10 w-10",              // UNCHANGED
      },
    },
    defaultVariants: {
      variant: "default",
      size: "compact",  // CHANGED: Default to compact for design system consistency
    },
  }
)

// Export unchanged, usage unchanged
export { Button, buttonVariants }
```

**Impact:**
- Existing `<Button>` without size prop now renders at h-8 (compact)
- Existing `<Button size="default">` still works, renders at h-10
- New code automatically matches design system without needing to specify size="compact" everywhere

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Copy-paste page headers | Composition components (PageHeader pattern) | 2024-2026 | React community standard for reusable layouts |
| Inline className strings | CVA for variants | 2023+ | shadcn/ui standard, type-safe variant management |
| CSS modules or styled-components | Tailwind + CSS variables | 2023+ | shadcn/ui approach, works with design tokens |
| Component libraries (MUI, Chakra) | Headless UI (Radix) + styled wrappers | 2023+ | shadcn/ui philosophy: own your components |

**Deprecated/outdated:**
- **CSS-in-JS (styled-components, emotion):** Still works but not the direction of shadcn/ui or this codebase. Tailwind + CSS variables is the modern approach.
- **Large component libraries:** MUI, Ant Design, Chakra UI give you components but you don't own them. shadcn/ui gives you the source code.
- **CSS Modules for component styling:** Tailwind utilities are now preferred for component-level styling.

**Current best practices (2026):**
- CVA for variant management (type-safe, composable)
- Composition pattern for reusable layouts (PageHeader, DataTable)
- CSS custom properties (CSS variables) for design tokens
- Tailwind utilities for styling
- Radix UI primitives for accessibility
- Own your component source code (shadcn/ui philosophy)

## Open Questions

### 1. Button/Input Height Defaults

**What we know:**
- Current defaults are h-10 (40px)
- Compact UI design guide suggests h-7 (28px) or h-8 (32px)
- Some existing buttons may expect the larger size (Login page, prominent CTAs)

**What's unclear:**
- Should we change the default to h-8 (compact) or keep h-10 (original)?
- How many existing buttons would break with a default change?

**Recommendation:**
- Add `compact` variant as h-8, change defaultVariants to `size: "compact"`
- Audit all Button usages in COMP-01 task
- Document any buttons that need explicit `size="default"` to preserve original size
- This is safer than changing the "default" variant itself

### 2. PageHeader Size Variants

**What we know:**
- Dashboard/Highlights have larger titles (currently text-3xl)
- Study/Settings have smaller titles (currently text-base)
- Token system has text-title (30px) and text-heading (18px)

**What's unclear:**
- Should PageHeader have size="default" map to text-title or text-heading?
- Is text-title (30px) too close to text-3xl (30px) to be different?
- Should we add a size="large" for marketing/hero pages?

**Recommendation:**
- `size="default"` → text-title (30px) for pages that feel like "destinations" (Dashboard, Highlights)
- `size="compact"` → text-heading (18px) for pages that feel like "tools" (Study, Settings)
- No size="large" needed (only Login/StudySession have unique layouts, they won't use PageHeader)

### 3. DataTable Scope

**What we know:**
- DeckTable is the only table in the app right now
- Future phases might add tables for highlights, review logs, etc.

**What's unclear:**
- Should DataTable be generic enough for all future tables?
- Or should it just match DeckTable's current features?

**Recommendation:**
- Start with ONLY DeckTable's current features (columns, data, click handler, hover)
- Don't add sorting/filtering/pagination (YAGNI - You Aren't Gonna Need It)
- Document the pattern so future tables can either use DataTable or extend it
- Defer advanced features to Phase 6+ when actual requirements exist

## Sources

### Primary (HIGH confidence)

- **Codebase analysis:**
  - `components/ui/button.tsx` - CVA structure and variants
  - `components/ui/input.tsx` - Current default height (h-10)
  - `components/ui/card.tsx` - Already token-aligned structure
  - `components/ui/badge.tsx` - CVA structure and variants
  - `components/DeckTable.tsx` - Gold standard for table pattern
  - `pages/*.tsx` - Inconsistent header patterns across 6 pages
  - `index.css` - Token system from Phase 4 (typography, spacing, colors)
  - `tailwind.config.js` - Token mappings to utilities
  - `.planning/phases/04-token-foundation/RAW_COLOR_MAP.md` - 67 raw color audit

- **Official shadcn/ui documentation:**
  - [The Anatomy of shadcn/ui Components | Vercel Academy](https://vercel.com/academy/shadcn-ui/extending-shadcn-ui-with-custom-components)
  - [Introduction - shadcn/ui](https://ui.shadcn.com/docs)
  - [The Foundation for your Design System - shadcn/ui](https://ui.shadcn.com/)
  - [Changelog - shadcn/ui](https://ui.shadcn.com/docs/changelog)

- **CVA (class-variance-authority) documentation:**
  - Used by shadcn/ui for all component variants
  - Type-safe variant management with TypeScript
  - Already installed and in use in Button, Badge components

### Secondary (MEDIUM confidence)

- [How to Make Shadcn UI Components Actually Yours | Spectrum UI Blog](https://ui.spectrumhq.in/blog/shadcn-customization-guide)
  - Best practices: Don't modify original components, create new ones that use originals
  - CVA is "non-negotiable" for reusable components
  - Maintain design token consistency through CSS variables

- [The anatomy of shadcn/ui](https://manupa.dev/blog/anatomy-of-shadcn-ui)
  - Component architecture: separation of variants and implementation
  - Flexibility through composition and render props

- [Building Reusable React Components in 2026 | Medium](https://medium.com/@romko.kozak/building-reusable-react-components-in-2026-a461d30f8ce4)
  - 2026 best practices: modularity, documentation, flexible styling, accessibility
  - Composition pattern for modular, reusable UI

- [Understanding the Composition Pattern in React - DEV Community](https://dev.to/wallacefreitas/understanding-the-composition-pattern-in-react-3dfp)
  - Core principle: break components into smaller, reusable parts
  - Declarative approach aligns with React principles

### Tertiary (LOW confidence)

- Web search results on React patterns and shadcn/ui customization (2026)
  - Multiple sources confirm CVA as standard for variants
  - Composition pattern is recommended over inheritance
  - Design token consistency is emphasized across sources

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - All libraries already installed, verified in package.json
- Architecture patterns: **HIGH** - Based on existing codebase patterns (DeckTable) and official shadcn/ui guidance
- Pitfalls: **HIGH** - Derived from common shadcn/ui customization mistakes and codebase constraints

**Research date:** 2026-01-27
**Valid until:** 90 days (stable ecosystem, slow-moving patterns)

**Key constraints:**
- Must preserve shadcn/ui update path (no structural changes to components/ui/*)
- Must work with existing token system from Phase 4
- Must maintain backward compatibility for existing component usage
- Cannot add new dependencies (all tools already available)

**Success metrics for Phase 5:**
- All 6 pages (excluding Login/StudySession) use PageHeader component
- Button, Input, Badge, Card defaults match token system (no arbitrary overrides needed)
- DeckTable pattern extracted into reusable DataTable component
- Zero raw color classes remain (migration complete from Phase 4 RAW_COLOR_MAP.md)
- `npm run build` succeeds with no warnings
- Visual regression: all pages look the same or better than before
