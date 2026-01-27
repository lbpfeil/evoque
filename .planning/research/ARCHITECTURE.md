# Architecture: Design System Standardization

**Domain:** Design system organization in React 19 + Tailwind CSS 3 + shadcn/ui
**Researched:** 2026-01-27
**Confidence:** HIGH (based on codebase audit + current ecosystem best practices)

---

## Executive Summary

Evoque's v1.0 milestone successfully established a working theme system with OKLCH color tokens, semantic CSS variables, and shadcn/ui component primitives. However, the codebase lacks a **governing design system** -- there is no single authority dictating how typography, spacing, and components should be used across pages. The result is measurable inconsistency: page titles range from `text-base` to `text-3xl`, button heights mix `h-7` and `h-10`, and the existing design guidelines document (`lbp_diretrizes/compact-ui-design-guidelines.md`) is partially outdated and contradicts actual usage in several places.

The architecture recommended here is **pragmatic, not aspirational**. Evoque is a single-developer project on Tailwind CSS v3 (not v4). The right approach is: formalize what exists, eliminate drift, and create enforceable standards -- not build a Style Dictionary pipeline or a Figma-to-code token system.

---

## Current State: What Exists

### Token Layer (Working)

The color token system is solid and already in production:

```
index.css (:root / .dark)     -->  tailwind.config.js (colors: {...})  -->  Components (bg-background, text-foreground, etc.)
   CSS Variables (OKLCH)              Tailwind bindings                       Semantic utility classes
```

**Files involved:**
- `index.css` -- CSS variables in `:root` and `.dark` (OKLCH values)
- `tailwind.config.js` -- Maps CSS variables to Tailwind utility classes
- `lib/utils.ts` -- `cn()` utility (clsx + tailwind-merge)

**What works well:**
- Color tokens are semantic (`--background`, `--foreground`, `--primary`, etc.)
- Dark mode is fully functional via `.dark` class
- Components use semantic classes (`bg-background`, `text-muted-foreground`)
- Only 2 instances of hardcoded `text-zinc-*` remain in the entire codebase (in `StudyHeatmap.tsx`)

**What is missing:**
- No typography tokens (font sizes, weights, line heights are ad-hoc)
- No spacing tokens (padding, gaps, margins are chosen per-component)
- No component usage tokens (button sizes, input heights are inconsistent)
- No radius tokens beyond the single `--radius` variable

### Component Layer (Mixed Generations)

The `components/ui/` directory contains 16 shadcn components installed at **two different times**, resulting in two architectural patterns coexisting:

**Generation 1 (v1.0 Phase 1, older shadcn CLI):**
- `button.tsx`, `input.tsx`, `dialog.tsx`, `popover.tsx`, `command.tsx`, `sheet.tsx`, `alert-dialog.tsx`, `checkbox.tsx`
- Use `React.forwardRef` pattern
- Import via relative path: `from "../../lib/utils"`
- Import from individual Radix packages: `@radix-ui/react-dialog`

**Generation 2 (v1.0 Phase 2+, newer shadcn CLI):**
- `card.tsx`, `badge.tsx`, `tabs.tsx`, `select.tsx`, `switch.tsx`, `tooltip.tsx`, `dropdown-menu.tsx`, `scroll-area.tsx`
- Use function component pattern (no forwardRef)
- Import via alias: `from "@/lib/utils"`
- Import from unified `radix-ui` package
- Use `data-slot` attributes for CSS targeting

This is not a bug, but it creates maintenance confusion. Both patterns work, but the codebase looks like two different developers wrote it.

### Typography (Inconsistent)

Actual usage found across pages:

| Context | Dashboard | Highlights | Study | Settings | Login |
|---------|-----------|------------|-------|----------|-------|
| Page title | `text-3xl font-bold` | `text-3xl font-bold` | `text-base font-semibold` | `text-base font-semibold` | `text-2xl font-bold` |
| Page subtitle | `text-base font-light` | `text-sm font-light` | `text-xs` | `text-xs` | -- |
| Section heading | `text-lg font-bold` | -- | `text-xs font-semibold` | -- | -- |
| Card stat value | `text-3xl font-bold` | -- | `text-lg font-bold` | -- | -- |

**The problem:** Two style families exist in the codebase simultaneously:
1. **"Magazine" style** (Dashboard, Highlights, Login): `text-3xl` titles, generous spacing, `font-bold`
2. **"Compact" style** (Study, Settings): `text-base` titles, tight spacing, `font-semibold`

The existing design guidelines doc (`compact-ui-design-guidelines.md`) prescribes the compact style, but Dashboard and Highlights were modernized in v1.0 Phase 2 with a different visual approach.

### Spacing (Inconsistent)

| Context | Dashboard | Highlights | Study | Settings |
|---------|-----------|------------|-------|----------|
| Page padding | `space-y-12` | `px-4 sm:px-6` | `p-4 sm:p-6` | `p-4 sm:p-6` |
| Header margin | `mb-6` (implicit) | `gap-4 pt-6 pb-2` | `mb-3` | `mb-2` |
| Section gap | `gap-4` to `gap-6` | `gap-2` | `mb-4` | `gap-3` |

### Component Defaults vs. Overrides

The shadcn `button.tsx` defines default size as `h-10 px-4 py-2`, but the design guidelines prescribe `h-7 px-3 text-sm`. In practice, almost every button usage in the codebase overrides the default with custom className. The same is true for `input.tsx` (default `h-10`, actually used as `h-7`).

This means the component defaults are wrong for this project. Every usage pays the cost of overriding.

---

## Recommended Architecture

### Principle: Tokens in CSS, Consumed via Tailwind, Applied in Components

The architecture follows the established shadcn/ui pattern, extended with typography and spacing:

```
                                DESIGN SYSTEM LAYERS

Layer 1: CSS Variables          index.css (:root / .dark)
         (Tokens)               Colors, radius, font-family
                                    |
                                    v
Layer 2: Tailwind Config        tailwind.config.js (theme.extend)
         (Bindings)             Maps CSS vars to utility classes
                                Adds typography scale, spacing scale
                                    |
                                    v
Layer 3: shadcn Components      components/ui/*.tsx
         (Primitives)           button, input, dialog, card, etc.
                                Defaults match our design system
                                    |
                                    v
Layer 4: App Components         components/*.tsx, pages/*.tsx
         (Compositions)         Use primitives with cn() overrides
                                Follow documented patterns
                                    |
                                    v
Layer 5: Documentation          .planning/design-system/
         (Governance)           Canonical reference for all decisions
```

### Where Tokens Should Live

#### Color Tokens: CSS Variables (index.css) -- KEEP AS-IS

Color tokens are already correctly placed. No changes needed.

```css
/* index.css -- already correct */
:root {
    --background: oklch(0.97 0.015 85);
    --foreground: oklch(0.18 0.01 50);
    --primary: oklch(0.67 0.16 58);
    /* ... */
}
.dark {
    --background: oklch(0.14 0.012 55);
    /* ... */
}
```

#### Typography Tokens: Tailwind Config (tailwind.config.js) -- ADD

Typography should NOT be CSS variables. It should be Tailwind theme extensions, because:
1. Typography does not change between light/dark mode
2. Tailwind's `text-*` utilities are the consumption mechanism
3. Custom font sizes map directly to Tailwind's type scale

**Recommended addition to `tailwind.config.js`:**

```js
theme: {
    extend: {
        fontSize: {
            // Design system type scale
            'page-title': ['1.125rem', { lineHeight: '1.3', fontWeight: '600' }],  // 18px - text-lg equiv
            'section-title': ['0.875rem', { lineHeight: '1.5', fontWeight: '600' }],  // 14px
            'body': ['0.875rem', { lineHeight: '1.5' }],  // 14px - text-sm equiv
            'caption': ['0.75rem', { lineHeight: '1.4' }],  // 12px - text-xs equiv
            'micro': ['0.625rem', { lineHeight: '1.2' }],  // 10px
        },
    }
}
```

**Why custom names instead of Tailwind defaults:** Using `text-page-title` makes intent explicit. A developer cannot accidentally use `text-3xl` when the design system says page titles are `text-page-title`. The standard Tailwind classes (`text-sm`, `text-lg`) remain available for edge cases but are not the primary API.

**Alternative (simpler, recommended for this project):** Do NOT add custom fontSize tokens. Instead, document the mapping between contexts and standard Tailwind classes, and enforce via code review / audit. This avoids adding complexity to a working system.

**Recommendation: Use the simpler approach.** Document `text-lg font-semibold` as the page title standard. Do not create custom font-size tokens. Evoque is a single-developer project; the documentation IS the enforcement mechanism.

#### Spacing Tokens: Documentation Only -- NO NEW INFRASTRUCTURE

Spacing tokens (page padding, section gaps, etc.) should NOT be added to tailwind.config.js. The standard Tailwind spacing scale (4px base) is sufficient. What is missing is a documented **spatial convention**, not new utility classes.

**Document these conventions:**

| Context | Value | Tailwind Class |
|---------|-------|----------------|
| Page outer padding | 16px mobile, 24px desktop | `p-4 sm:p-6` |
| Page header bottom margin | 12px | `mb-3` |
| Section gap | 16px | `space-y-4` or `gap-4` |
| Card internal padding | 16px | `p-4` |
| List item gap | 4px | `gap-1` |
| Button height (standard) | 28px | `h-7` |
| Input height (standard) | 28px | `h-7` |

#### Border Radius: CSS Variable (index.css) -- KEEP AS-IS

The existing `--radius: 0.75rem` with Tailwind's `lg`, `md`, `sm` derivatives is correct.

### Component Standardization Strategy

#### Fix Defaults, Don't Create Wrappers

The key architectural decision: **modify shadcn component defaults to match the design system**, rather than creating wrapper components.

**Before (current):**
```tsx
// button.tsx default: h-10 px-4 py-2
// Every usage overrides:
<Button className="h-7 px-3 text-xs">Save</Button>
<Button className="h-7 text-sm px-3">Add</Button>
```

**After (recommended):**
```tsx
// button.tsx default changed to: h-7 px-3 text-sm
// Usage is clean:
<Button>Save</Button>
<Button size="lg">Larger Action</Button>
```

**Components to update defaults:**

| Component | Current Default | New Default | Rationale |
|-----------|----------------|-------------|-----------|
| `button.tsx` | `h-10 px-4 py-2` | `h-8 px-3 text-sm` | Match compact guidelines, h-8 for accessible touch target |
| `button.tsx` size="sm" | `h-9 px-3` | `h-7 px-2.5 text-xs` | Compact variant |
| `button.tsx` size="icon" | `h-10 w-10` | `h-8 w-8` | Match default height |
| `input.tsx` | `h-10 px-3 py-2` | `h-8 px-2.5 text-sm` | Match compact guidelines |

**Why h-8 (32px) not h-7 (28px):** The design guidelines prescribe h-7, but 28px is below WCAG recommended 44px touch target. h-8 (32px) is a pragmatic compromise -- compact enough for the density goals, but more forgiving for touch interaction. For truly compact contexts (inline edits, tag managers), use h-7 explicitly.

#### Unify Component Generations

Normalize all components to a consistent pattern. Do NOT rewrite working components just for consistency -- instead, normalize import paths:

**Action:** Update all Generation 1 components to use `@/lib/utils` import alias instead of `../../lib/utils`. This is a mechanical find-and-replace that makes the codebase consistent without changing behavior.

**Do NOT** rewrite forwardRef components to function components. Both patterns work. The shadcn CLI changed its output format, but both are valid React 19 patterns. The cost of rewriting exceeds the benefit.

### Component Organization

#### Current Structure (Keep)

```
components/
    ui/                         # shadcn primitives (DO NOT add app logic here)
        button.tsx
        input.tsx
        dialog.tsx
        card.tsx
        ... (16 components)
    AuthContext.tsx              # Auth state
    StoreContext.tsx             # App state
    ThemeProvider.tsx            # Theme state
    SidebarContext.tsx           # Sidebar state
    Sidebar.tsx                 # Navigation
    BottomNav.tsx               # Mobile navigation
    TagManagerSidebar.tsx       # Tag management panel
    TagSelector.tsx             # Tag picker
    DeckTable.tsx               # Study deck list
    StudyHeatmap.tsx            # Review activity heatmap
    StudyStatusBadge.tsx        # Card status indicator
    DashboardCharts.tsx         # Dashboard chart section
    HighlightTableRow.tsx       # Highlights table row
    HighlightEditModal.tsx      # Highlight editing
    HighlightHistoryModal.tsx   # Review history modal
    BookContextModal.tsx        # Book details modal
    DeleteBookModal.tsx         # Book deletion confirmation
    DeleteCardPopover.tsx       # Card deletion confirmation
    EmptyDeckPopover.tsx        # Empty deck notification
    ErrorBoundary.tsx           # Error handling
    Portal.tsx                  # Portal wrapper
    ThemeToggle.tsx             # Theme switcher
pages/
    Dashboard.tsx
    Highlights.tsx
    Study.tsx
    StudySession.tsx
    Settings.tsx
    Login.tsx
```

**Do NOT restructure into feature folders.** The current flat structure is appropriate for a 6-page app with ~20 components. Feature folders add navigation overhead without meaningful benefit at this scale.

#### What to Add

```
components/
    ui/
        page-header.tsx         # NEW: Standardized page header (title + subtitle + optional action)
```

One new component: `PageHeader`. This is the highest-leverage standardization because every page has a header and they are all different. A single component enforces consistency:

```tsx
// components/ui/page-header.tsx
interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
    return (
        <header className="mb-3">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-lg font-semibold text-foreground">{title}</h1>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                    )}
                </div>
                {action && <div className="flex-shrink-0">{action}</div>}
            </div>
        </header>
    );
}
```

**Why only one new component?** The project mandate is "obsessive consistency," not "new component library." Every other UI element (buttons, inputs, cards, tables, modals) already has a shadcn primitive. The problem is inconsistent usage, not missing primitives.

### Documentation Architecture

#### Retire the Old Guide

`lbp_diretrizes/compact-ui-design-guidelines.md` is 725 lines, written in Portuguese, last updated 2025-12-30, and contradicts actual v1.0 implementation in several places (e.g., prescribes `text-zinc-900` for titles, but v1.0 uses `text-foreground`; prescribes `rounded` but modals use `rounded-lg`; prescribes `h-7` buttons but defaults are `h-10`).

**Action:** Do not delete the old guide (it has useful reference patterns). Create a new canonical guide that supersedes it.

#### New Documentation Structure

```
.planning/
    design-system/
        TOKENS.md               # Canonical color, typography, spacing reference
        COMPONENTS.md           # How to use each shadcn component (with examples)
        PATTERNS.md             # Page layout patterns, modal patterns, table patterns
        AUDIT-CHECKLIST.md      # Checklist for auditing a page against the system
```

**Why `.planning/design-system/` not `lbp_diretrizes/`?** The `.planning/` directory is the established project governance location. Placing the design system here makes it part of the project planning workflow, not a legacy reference folder.

---

## Inconsistency Audit: What Must Be Fixed

### Typography Standardization

**Decision needed:** Which style family wins -- "Magazine" (Dashboard/Highlights) or "Compact" (Study/Settings)?

**Recommendation: Compact wins.** Rationale:
1. The project explicitly values "obsessive consistency" and "compact density"
2. Study and Settings pages were most recently designed with user approval
3. The existing guidelines doc prescribes compact
4. Dashboard and Highlights adopted the "Magazine" style from shadcn defaults during v1.0 Phase 2, not from intentional design

**Canonical type scale:**

| Context | Class | Size | Weight |
|---------|-------|------|--------|
| Page title | `text-lg font-semibold` | 18px | 600 |
| Page subtitle | `text-xs text-muted-foreground` | 12px | 400 |
| Section heading | `text-sm font-semibold` | 14px | 600 |
| Body text | `text-sm` | 14px | 400 |
| Metadata / captions | `text-xs text-muted-foreground` | 12px | 400 |
| Stat values (large) | `text-lg font-bold` | 18px | 700 |
| Micro labels | `text-[10px]` | 10px | 400-500 |

**Files requiring title demotion:**
- `Dashboard.tsx`: `text-3xl font-bold` -> `text-lg font-semibold`
- `Highlights.tsx`: `text-3xl font-bold` -> `text-lg font-semibold`
- `Login.tsx`: `text-2xl font-bold` -> keep (login is a special case, standalone page)
- `Dashboard.tsx` stat values: `text-3xl font-bold` -> `text-lg font-bold`
- `Dashboard.tsx` "Recent Books" heading: `text-lg font-bold` -> `text-sm font-semibold`

### Spacing Standardization

**Canonical page layout:**

```tsx
// Every page follows this pattern:
<div className="p-4 sm:p-6">
    <PageHeader title="..." subtitle="..." />
    {/* Page content with consistent gaps */}
    <div className="space-y-4">
        {/* Sections */}
    </div>
</div>
```

**Files requiring spacing fixes:**
- `Dashboard.tsx`: `space-y-12` -> `space-y-4` (excessively loose)
- `Highlights.tsx`: `space-y-4 px-4 sm:px-6` (add outer padding wrapper)
- `Dashboard.tsx`: `mb-6` between sections -> `mb-4`

### Component Usage Standardization

| Component | Current Usage | Canonical Usage |
|-----------|---------------|-----------------|
| Button (default) | Mixed h-7, h-10, custom | `<Button>` (after defaults are fixed to h-8) |
| Button (compact) | `className="h-7 text-xs px-3"` | `<Button size="sm">` (after sm is fixed to h-7) |
| Input | Mixed h-7, h-10, h-8 | `<Input>` (after default fixed to h-8) |
| Card (shadcn) | Only in Dashboard | Use for all boxed content sections |
| Dialog | Consistent (shadcn) | Keep as-is |
| Page headers | 5 different patterns | `<PageHeader>` component |

---

## Suggested Build Order

The dependency chain for design system standardization:

```
Phase 1: Define Tokens + Fix Defaults          (Foundation - no visual changes yet)
    |
    |-- 1a. Write TOKENS.md (canonical reference)
    |-- 1b. Fix button.tsx defaults (h-10 -> h-8, sm: h-9 -> h-7)
    |-- 1c. Fix input.tsx defaults (h-10 -> h-8)
    |-- 1d. Normalize import paths (../../ -> @/)
    |-- 1e. Create PageHeader component
    |
    v
Phase 2: Audit + Fix Pages                     (Visual consistency enforcement)
    |
    |-- 2a. Audit Dashboard.tsx (biggest inconsistency)
    |-- 2b. Audit Highlights.tsx (second biggest)
    |-- 2c. Audit Settings.tsx
    |-- 2d. Audit Study.tsx (should be close already)
    |-- 2e. Audit StudySession.tsx (preserve serif, minimal changes)
    |-- 2f. Audit Login.tsx (standalone, may keep distinct style)
    |
    v
Phase 3: Audit + Fix Components                (Supporting elements)
    |
    |-- 3a. Audit modals (BookContextModal, HighlightEditModal, HighlightHistoryModal)
    |-- 3b. Audit popovers (DeleteCardPopover, EmptyDeckPopover)
    |-- 3c. Audit complex components (TagManagerSidebar, TagSelector, DeckTable)
    |-- 3d. Audit Sidebar and BottomNav
    |
    v
Phase 4: Documentation + Governance            (Prevent future drift)
    |
    |-- 4a. Write COMPONENTS.md (usage guide for each shadcn component)
    |-- 4b. Write PATTERNS.md (page layouts, modals, tables)
    |-- 4c. Write AUDIT-CHECKLIST.md (checklist for future pages)
    |-- 4d. Mark old guide as superseded
```

**Why this order:**
1. Phase 1 must come first because it establishes the reference standard. You cannot audit pages against rules that do not yet exist.
2. Phase 2 before Phase 3 because pages are the user-facing surface. Components inside pages inherit from page-level decisions.
3. Phase 4 last because documentation should describe what IS, not what WILL BE. Writing docs before implementation creates drift.

---

## How to Audit Existing Pages Systematically

### Per-Page Audit Protocol

For each page, check these dimensions in order:

**1. Structure**
- [ ] Uses `<div className="p-4 sm:p-6">` as outer wrapper
- [ ] Uses `<PageHeader>` component for title/subtitle
- [ ] Content sections use `space-y-4` or equivalent consistent gaps

**2. Typography**
- [ ] Page title: `text-lg font-semibold text-foreground`
- [ ] Page subtitle: `text-xs text-muted-foreground`
- [ ] Section headings: `text-sm font-semibold text-muted-foreground` (or `text-foreground` if primary)
- [ ] Body text: `text-sm`
- [ ] Metadata: `text-xs text-muted-foreground`
- [ ] No `text-3xl`, `text-2xl`, `text-xl` (except StudySession special case)
- [ ] No `font-light` (only `font-medium`, `font-semibold`, `font-bold`)

**3. Colors**
- [ ] No hardcoded `zinc-*`, `gray-*`, `slate-*` colors
- [ ] Uses `text-foreground`, `text-muted-foreground`, `bg-background`, `bg-card`, `bg-muted`, `bg-accent`
- [ ] SRS status colors allowed: `text-blue-600`, `text-amber-600`, `text-green-600`, `text-red-600` (these are semantic)
- [ ] Chart colors use `--chart-*` variables

**4. Components**
- [ ] Buttons use `<Button>` with standard sizes (not custom height overrides after defaults are fixed)
- [ ] Inputs use `<Input>` (not raw `<input>`)
- [ ] Cards use shadcn `<Card>` where appropriate
- [ ] Modals use shadcn `<Dialog>` or `<AlertDialog>`
- [ ] No inline `<button>` with complex className (extract to `<Button>` variant)

**5. Spacing**
- [ ] Consistent with canonical page layout pattern
- [ ] No `space-y-12` or `gap-6` (too loose for compact density)
- [ ] Padding follows 4px base (0.5, 1, 1.5, 2, 3, 4)

**6. Responsiveness**
- [ ] Mobile-first (base classes for mobile, sm:/md: for larger)
- [ ] No fixed pixel widths without responsive alternative
- [ ] Touch targets minimum 32px (h-8) for buttons, 28px (h-7) for compact

---

## Anti-Patterns to Avoid

### 1. Don't Create a Component Library Layer

**Bad:** Creating `components/design-system/DSButton.tsx` that wraps `components/ui/button.tsx`
**Good:** Fixing `components/ui/button.tsx` defaults directly

Wrappers add indirection. shadcn components are YOUR code -- modify them directly.

### 2. Don't Add CSS Variable Tokens for Everything

**Bad:** `--font-size-page-title: 1.125rem` in index.css
**Good:** Documenting that page titles use `text-lg font-semibold`

CSS variables are for values that CHANGE (light/dark mode colors). Typography and spacing do not change between themes. Use Tailwind utility classes and document the convention.

### 3. Don't Migrate to Tailwind v4 During This Milestone

Tailwind v4 has a CSS-first `@theme` directive that is architecturally superior. However, migrating from v3 to v4 during a standardization milestone is scope creep. The v3 architecture is sufficient for the goals. Consider Tailwind v4 migration as a separate future milestone.

### 4. Don't Enforce with Runtime Checks

**Bad:** A React hook that validates component props at runtime
**Good:** Documentation + audit checklist + systematic page-by-page review

At single-developer scale, governance is documentation-driven, not tooling-driven.

### 5. Don't Over-Componentize

**Bad:** Creating `<SectionHeading>`, `<BodyText>`, `<Caption>` wrapper components
**Good:** Using `text-sm font-semibold text-muted-foreground` directly with documented patterns

Typography wrappers add indirection without value in a small codebase. The `PageHeader` component is the exception because it genuinely varies structurally (flex layout, optional action slot), not just stylistically.

---

## Scalability Considerations

| Concern | At Current Scale | If Evoque Grows |
|---------|-----------------|-----------------|
| Token management | index.css + tailwind.config.js | Consider Style Dictionary if multi-platform |
| Component consistency | Documentation + audit | Consider Storybook for visual testing |
| Design governance | CLAUDE.md + .planning/ docs | Consider eslint-plugin-tailwindcss rules |
| Typography drift | Manual audit | Consider custom ESLint rule banning text-3xl etc. |
| Dark mode testing | Manual toggle | Consider Chromatic or similar for automated visual testing |

None of the "If Evoque Grows" column items are needed now. They are noted for awareness.

---

## Sources

- [Tailwind CSS Official Theme Docs](https://tailwindcss.com/docs/theme) -- Token architecture (HIGH confidence)
- [Building Scalable UI Systems with Tailwind CSS v4 and shadcn/UI](https://www.shoaibsid.dev/blog/building-scalable-ui-systems-with-tailwind-css-v4-and-shadcn-ui) -- Layered architecture pattern (MEDIUM confidence, v4-focused but principles apply)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming) -- Official theming approach (HIGH confidence)
- [FrontendTools -- Tailwind Best Practices 2025](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns) -- Token organization patterns (MEDIUM confidence)
- [Building a Scalable Design System with shadcn/UI, Tailwind CSS, and Design Tokens](https://shadisbaih.medium.com/building-a-scalable-design-system-with-shadcn-ui-tailwind-css-and-design-tokens-031474b03690) -- Token-to-component flow (MEDIUM confidence)
- [The Anatomy of shadcn/ui](https://manupa.dev/blog/anatomy-of-shadcn-ui) -- Three-layer architecture (HIGH confidence)
- Codebase audit of `C:\Users\ADMIN\Projects\evoque` (HIGH confidence -- direct observation)
- Existing guidelines: `lbp_diretrizes/compact-ui-design-guidelines.md` v1.1 (MEDIUM confidence -- partially outdated)
