# Phase 4: Token Foundation - Research

**Researched:** 2026-01-27
**Domain:** Design tokens in Tailwind CSS v3 + shadcn/ui
**Confidence:** HIGH

## Summary

This research focused on auditing the current codebase and understanding how to implement a rigid design token system in a Tailwind CSS v3 + shadcn/ui project. The goal is to replace arbitrary design decisions with a prescriptive token system where every visual choice has exactly one correct answer.

**Current State Analysis:**
The codebase already has semantic color tokens (bg-background, text-foreground, etc.) working well through CSS variables in index.css. However, typography, spacing, shadows, border-radius, icon sizes, z-index, and motion are all ad-hoc. Pages use inconsistent values: Dashboard has text-3xl titles, Highlights has text-3xl titles, but Study has text-base titles. Spacing varies wildly (gap-2, gap-3, gap-4, space-y-4, space-y-12). Border-radius uses rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-2xl, rounded-full arbitrarily. No motion token system exists - durations are hardcoded (duration-200, duration-300, duration-500).

**Standard Approach:**
Tailwind CSS v3 uses theme.extend in tailwind.config.js to add custom design tokens without overriding defaults. shadcn/ui uses CSS variables defined in index.css and registers them with Tailwind using the config. The pattern: define semantic CSS variables in @layer base, then map them in tailwind.config.js theme.extend, then use them as utilities.

**Primary recommendation:** Audit actual usage patterns first, then define a minimal prescriptive token system (6 typography sizes, 8 spacing tokens, 3 radius values, 3 shadows, 3 icon sizes, 7 z-index layers, 3 durations + 3 easings), codify them as CSS variables and Tailwind config extensions, then systematically replace all ad-hoc values across the codebase.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | 3.4.17 | Utility-first CSS framework | Industry standard for design tokens via theme config |
| tailwindcss-animate | 1.0.7 | Animation utilities | shadcn/ui dependency for Radix animations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| class-variance-authority | Latest | Component variant system | shadcn/ui uses CVA for button/badge variants |
| CSS Custom Properties | Native | Runtime-switchable design tokens | Light/dark theme switching, semantic colors |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind v3 theme.extend | Tailwind v4 @theme directive | v4 not stable (2026-01), migration would delay delivery |
| CSS variables | Hardcoded config | CSS vars enable light/dark theming, config values don't |
| Manual token audit | Style Dictionary pipeline | Automation overkill for 7-page app, manual is faster |

**Installation:**
```bash
# Already installed - no new dependencies needed
# Tailwind CSS 3.4.17 and tailwindcss-animate 1.0.7 are present
```

## Architecture Patterns

### Recommended Project Structure
```
evoque/
├── index.css                  # CSS variables + @layer base definitions
├── tailwind.config.js         # theme.extend maps CSS vars to utilities
├── components/ui/             # shadcn components using semantic tokens
└── pages/                     # Pages consume tokens via utilities
```

### Pattern 1: CSS Variable Definition
**What:** Define semantic design tokens as CSS custom properties in index.css under @layer base
**When to use:** Always for runtime-switchable values (colors, motion) and semantic scales (spacing, typography)
**Example:**
```css
/* index.css */
@layer base {
  :root {
    /* Typography Scale (6 named sizes) */
    --text-display: 2rem;      /* 32px - Rare, hero text only */
    --text-title: 1.875rem;    /* 30px - Page titles */
    --text-heading: 1.125rem;  /* 18px - Section headings */
    --text-body: 0.875rem;     /* 14px - Default body text */
    --text-caption: 0.75rem;   /* 12px - Metadata, labels */
    --text-overline: 0.625rem; /* 10px - Tiny labels, uppercase */

    /* Spacing Scale (8 tokens on 4px grid) */
    --space-xxs: 0.25rem;  /* 4px - Tiny gaps */
    --space-xs: 0.5rem;    /* 8px - Compact spacing */
    --space-sm: 0.75rem;   /* 12px - Small spacing */
    --space-md: 1rem;      /* 16px - Default spacing */
    --space-lg: 1.5rem;    /* 24px - Generous spacing */
    --space-xl: 2rem;      /* 32px - Large spacing */
    --space-2xl: 3rem;     /* 48px - Section spacing */
    --space-3xl: 4rem;     /* 64px - Page-level spacing */

    /* Motion Tokens */
    --duration-fast: 150ms;
    --duration-base: 200ms;
    --duration-slow: 300ms;
    --ease-in: cubic-bezier(0.4, 0, 1, 1);
    --ease-out: cubic-bezier(0, 0, 0.2, 1);
    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

    /* Z-Index Layers (7 semantic layers) */
    --z-base: 0;
    --z-dropdown: 1000;
    --z-sticky: 1020;
    --z-fixed: 1030;
    --z-modal-backdrop: 1040;
    --z-modal: 1050;
    --z-popover: 1060;
    --z-tooltip: 1070;

    /* Already defined (keep as-is) */
    --radius: 0.75rem;
  }
}
```
**Source:** Current codebase index.css + [Tailwind v3 Custom Styles](https://v3.tailwindcss.com/docs/adding-custom-styles)

### Pattern 2: Tailwind Config Mapping
**What:** Map CSS variables to Tailwind utilities in tailwind.config.js theme.extend
**When to use:** After defining CSS variables, to make them available as utility classes
**Example:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontSize: {
        'display': 'var(--text-display)',
        'title': 'var(--text-title)',
        'heading': 'var(--text-heading)',
        'body': 'var(--text-body)',
        'caption': 'var(--text-caption)',
        'overline': 'var(--text-overline)',
      },
      spacing: {
        'xxs': 'var(--space-xxs)',
        'xs': 'var(--space-xs)',
        'sm': 'var(--space-sm)',
        'md': 'var(--space-md)',
        'lg': 'var(--space-lg)',
        'xl': 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
        '3xl': 'var(--space-3xl)',
      },
      borderRadius: {
        'sm': 'calc(var(--radius) - 4px)',
        'md': 'calc(var(--radius) - 2px)',
        'lg': 'var(--radius)',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      },
      transitionDuration: {
        'fast': 'var(--duration-fast)',
        'base': 'var(--duration-base)',
        'slow': 'var(--duration-slow)',
      },
      transitionTimingFunction: {
        'in': 'var(--ease-in)',
        'out': 'var(--ease-out)',
        'in-out': 'var(--ease-in-out)',
      },
      zIndex: {
        'dropdown': 'var(--z-dropdown)',
        'sticky': 'var(--z-sticky)',
        'fixed': 'var(--z-fixed)',
        'modal-backdrop': 'var(--z-modal-backdrop)',
        'modal': 'var(--z-modal)',
        'popover': 'var(--z-popover)',
        'tooltip': 'var(--z-tooltip)',
      },
    },
  },
}
```
**Source:** Current codebase tailwind.config.js + [Tailwind v3 Theme Extension](https://v3.tailwindcss.com/docs/adding-custom-styles)

### Pattern 3: Usage in Components
**What:** Replace arbitrary utilities with semantic token utilities
**When to use:** Every component migration
**Example:**
```tsx
// BEFORE (arbitrary values)
<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
<p className="text-muted-foreground mt-2 font-light">Overview</p>
<div className="space-y-12 gap-4">...</div>

// AFTER (semantic tokens)
<h1 className="text-title font-bold tracking-tight">Dashboard</h1>
<p className="text-muted-foreground mt-xs font-light">Overview</p>
<div className="space-y-3xl gap-md">...</div>
```
**Source:** Codebase audit findings

### Pattern 4: Icon Size Standardization
**What:** Define exactly 3 icon sizes and use them consistently
**When to use:** All Lucide React icon components
**Example:**
```tsx
// Define in tailwind.config.js theme.extend
width: {
  'icon-sm': '0.875rem',  // 14px - Inline with text-caption
  'icon-md': '1rem',      // 16px - Default icon size
  'icon-lg': '1.25rem',   // 20px - Prominent icons
}

// Usage
<Search className="w-icon-md h-icon-md" />  // Standard
<Book className="w-icon-sm h-icon-sm" />    // Small inline
<Settings className="w-icon-lg h-icon-lg" /> // Large/prominent
```
**Source:** Current codebase uses w-3 (12px), w-3.5 (14px), w-4 (16px), w-5 (20px), w-8 (32px) inconsistently

### Anti-Patterns to Avoid
- **Dynamic class interpolation:** Never use `bg-${color}-500` - Tailwind can't detect it. Use lookup objects or safelist.
- **Arbitrary values in production:** `p-[17px]` defeats the design system. If you need it, the token scale is wrong.
- **Mixing semantic and raw utilities:** Don't use `text-title bg-zinc-200` - either use all semantic or none.
- **Inline CSS variables without config:** `style={{fontSize: 'var(--text-title)'}}` bypasses Tailwind purge. Use utilities.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Design token management | Custom Sass map + build script | Tailwind theme.extend + CSS variables | Already in stack, zero dependencies, works with shadcn/ui |
| Component variant system | Custom className builder | class-variance-authority (CVA) | shadcn/ui standard, type-safe, already installed |
| Animation utilities | Custom CSS keyframes per component | tailwindcss-animate plugin | Already installed, provides standard animations |
| Color scheme switching | Multiple CSS files + JS loader | CSS variables with .dark selector | Current pattern works, no rebuild needed |

**Key insight:** Tailwind v3's theme system IS the design token solution. Don't build abstraction layers on top - the config file is the single source of truth. CSS variables are the runtime escape hatch for theming only.

## Common Pitfalls

### Pitfall 1: Dynamic Class Name Construction
**What goes wrong:** Using string interpolation `text-${size}` makes Tailwind unable to detect classes, so they're purged from production builds
**Why it happens:** Tailwind uses regex-based static analysis of source files. Dynamic strings aren't matched
**How to avoid:** Use complete class strings in lookup objects or add to safelist in tailwind.config.js
**Warning signs:** Classes work in dev but disappear in production build
**Source:** [Tailwind Dynamic Classes Gotchas](https://tailkits.com/blog/tailwind-dynamic-classes/) + [Safelist Documentation](https://blogs.perficient.com/2025/08/19/understanding-tailwind-css-safelist-keep-your-dynamic-classes-safe/)

### Pitfall 2: Over-Engineering the Token System
**What goes wrong:** Creating 20 typography sizes "for flexibility" when the app needs 6
**Why it happens:** Trying to be comprehensive instead of prescriptive
**How to avoid:** Audit actual usage first. If only 3 title sizes exist in practice, define exactly 3 in the system
**Warning signs:** Token names like "text-medium-large" or "space-between-md-and-lg"
**Source:** Research synthesis + [Design Token System Best Practices](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns)

### Pitfall 3: Z-Index Conflicts
**What goes wrong:** Modal appears under dropdown, tooltip hidden by sheet
**Why it happens:** No semantic z-index hierarchy - arbitrary values (z-10, z-20, z-50) cause conflicts
**How to avoid:** Define semantic layers (dropdown, modal, tooltip) with guaranteed separation (100-point increments)
**Warning signs:** Adding +1 to z-index to "fix" layering issues
**Source:** [Smashing Magazine Z-Index Management](https://www.smashingmagazine.com/2021/02/css-z-index-large-projects/) + Bootstrap 5.3 z-index scale

### Pitfall 4: Inconsistent Motion Feel
**What goes wrong:** Some transitions feel snappy (150ms), others sluggish (500ms), no coherent feel
**Why it happens:** Hardcoded durations per component without system-level thinking
**How to avoid:** Define exactly 3 durations (fast/base/slow) and 3 easing curves, use consistently
**Warning signs:** Components with duration-75, duration-100, duration-150, duration-200, duration-300, duration-500, duration-700
**Source:** [Carbon Design System Motion](https://carbondesignsystem.com/elements/motion/overview/) + [Material Design Easing](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs)

### Pitfall 5: Forgetting to Update tailwind.config.js Content Paths
**What goes wrong:** New token utilities work in dev but are purged in production
**Why it happens:** Content paths don't include all TSX files where tokens are used
**How to avoid:** Verify content array includes all component/page directories
**Warning signs:** Production builds smaller than expected, missing utilities
**Source:** [Tailwind Content Configuration Pitfalls](https://www.mindfulchase.com/explore/troubleshooting-tips/front-end-frameworks/troubleshooting-tailwind-css-class-purging-in-production-builds.html)

### Pitfall 6: Raw Color Classes in Components
**What goes wrong:** `bg-zinc-200` hardcodes light mode color, breaks in dark theme
**Why it happens:** Copying from Tailwind examples without understanding semantic tokens
**How to avoid:** Always use semantic tokens (bg-muted, text-muted-foreground) instead of raw colors
**Warning signs:** Components that look wrong only in dark mode
**Source:** Current codebase has 51 instances of raw color classes (zinc-*, amber-*, blue-*, green-*) that need migration

## Code Examples

Verified patterns from official sources and codebase:

### Current State Typography Audit
```tsx
// From codebase audit (grep \btext-(xs|sm|base|lg|xl|2xl|3xl)\b):
// 229 occurrences across 34 files

// Dashboard.tsx
<h1 className="text-3xl font-bold">Dashboard</h1>
<p className="text-muted-foreground mt-2">Subtitle</p>
<CardTitle className="text-xs font-medium uppercase">Stat</CardTitle>
<p className="text-3xl font-bold">Value</p>

// Highlights.tsx
<h1 className="text-3xl font-bold">Highlights</h1>
<p className="text-sm">Summary</p>
<button className="text-xs">Action</button>
<table className="text-xs">...</table>
<thead className="text-[10px] uppercase">...</thead>

// Study.tsx
<h1 className="text-base font-semibold">Study</h1>
<p className="text-xs">Subtitle</p>
<button className="text-sm">Button</button>

// PROBLEM: Inconsistent title sizes (3xl vs base), 6 sizes used + arbitrary [10px]
```
**Source:** Codebase grep analysis

### Current State Spacing Audit
```tsx
// From codebase audit (grep spacing patterns):
// 420 occurrences across 38 files

// Common patterns:
space-y-12, space-y-4, space-y-2
gap-1, gap-2, gap-3, gap-4, gap-5, gap-6
p-1, p-2, p-3, p-4, p-6, p-8, p-12
m-1, m-2, m-3, mt-1, mt-2, mb-2, mb-3, mb-6
px-3, px-4, py-1.5, py-2, py-3

// PROBLEM: 15+ different spacing values in use, no semantic meaning
```
**Source:** Codebase grep analysis

### Current State Z-Index Audit
```tsx
// From codebase audit (grep \bz-\d+):
// Used values: z-10, z-20, z-40, z-50

// BottomNav.tsx
<nav className="fixed bottom-0 z-50">...</nav>

// Sidebar.tsx
<div className="fixed inset-y-0 z-50">...</div>

// Highlights.tsx (sticky toolbar)
<div className="sticky top-0 z-20">...</div>
<thead className="sticky top-0 z-10">...</thead>

// StudySession.tsx (delete popover)
<div className="fixed inset-0 bg-foreground/10 z-40">Backdrop</div>
<div className="fixed top-16 z-50">Popover</div>

// shadcn/ui components
// dialog.tsx: z-50 (overlay and content)
// sheet.tsx: z-50 (overlay and content)
// popover.tsx: z-50
// alert-dialog.tsx: z-50

// PROBLEM: Everything uses z-50, unclear hierarchy, conflicts likely
```
**Source:** Codebase grep analysis

### Current State Motion Audit
```tsx
// From codebase audit (grep duration-):
// 52 occurrences across 16 files
// Used values: duration-75, duration-100, duration-150, duration-200, duration-300, duration-500, duration-700, duration-1000

// Common patterns:
transition-colors duration-200
transition-all duration-300
transition-opacity duration-200
animate-spin (from tailwindcss-animate)

// PROBLEM: 8 different durations, no consistent feel
```
**Source:** Codebase grep analysis

### Current State Border Radius Audit
```tsx
// From codebase audit (grep \brounded-):
// 100 occurrences across 29 files
// Used values: rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-2xl, rounded-full, rounded (default)

// Dashboard.tsx: rounded-md (cards)
// Highlights.tsx: rounded-lg (inputs), rounded-xl (table), rounded-full (button), rounded-md (pagination)
// Settings.tsx: rounded-md (dropzone), rounded-lg (inputs)
// shadcn/ui button: rounded-md (default)

// PROBLEM: 7 different radius values, no clear hierarchy
```
**Source:** Codebase grep analysis

### Target State: Complete Token System Example
```tsx
// After token migration:

// Page Title
<h1 className="text-title font-bold tracking-tight">Dashboard</h1>

// Section Heading
<h2 className="text-heading font-semibold">Recent Books</h2>

// Body Text
<p className="text-body text-muted-foreground">Description here</p>

// Metadata/Caption
<span className="text-caption text-muted-foreground">Last updated</span>

// Table Header (uppercase tiny)
<th className="text-overline uppercase tracking-wider">Column</th>

// Spacing
<div className="space-y-3xl">         {/* Large page-level gaps */}
  <section className="space-y-lg">    {/* Section spacing */}
    <div className="flex gap-md">      {/* Component gaps */}
      <button className="px-md py-xs"> {/* Component padding */}
        Action
      </button>
    </div>
  </section>
</div>

// Motion
<button className="transition-colors duration-fast ease-out hover:bg-accent">
  Quick hover
</button>
<div className="transition-all duration-slow ease-in-out">
  Smooth large animation
</div>

// Z-Index
<nav className="fixed z-sticky">Sticky nav</nav>
<div className="fixed z-modal-backdrop">Modal backdrop</div>
<Dialog className="fixed z-modal">Modal content</Dialog>
<Tooltip className="absolute z-tooltip">Tooltip</Tooltip>
```
**Source:** Design synthesis from research

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3 tailwind.config.js | Tailwind v4 @theme directive in CSS | 2024-2025 | v4 not stable yet, v3 pattern still recommended for production |
| Arbitrary hardcoded values | Design token systems | 2020-2026 | Industry standard now - Material, Carbon, Bootstrap all use tokens |
| JS-based theme config | CSS custom properties | 2019-present | Runtime theming (light/dark) requires CSS vars, not static config |
| 10+ typography sizes | 6-8 named semantic sizes | 2020-2026 | Design systems converge on minimal scales (Material: 5, Carbon: 7) |
| Unlimited spacing values | 8-value semantic scale | 2020-2026 | 4px/8px grids standard (Tailwind default, Material, Carbon) |

**Deprecated/outdated:**
- **purge option:** Renamed to content in Tailwind v3 (JIT mode doesn't use PurgeCSS anymore)
- **@apply for component styles:** Still works but discouraged - use CVA for component variants instead
- **JIT mode flag:** Default in Tailwind v3, no longer needs explicit enabling

## Open Questions

Things that couldn't be fully resolved:

1. **Should serif font stack be tokenized?**
   - What we know: StudySession uses serif for study cards ("Georgia, Cambria, Times New Roman, Times, serif")
   - What's unclear: Is this a permanent design decision or temporary?
   - Recommendation: Add font-serif-study token if permanent, document in design guide

2. **Icon size alignment with typography**
   - What we know: Current uses w-3 (12px), w-3.5 (14px), w-4 (16px), w-5 (20px)
   - What's unclear: Should icons align exactly with text sizes (14px body, 12px caption) or be slightly larger?
   - Recommendation: Test 14px, 16px, 20px sizes - likely 16px default feels most balanced

3. **Raw color usage for study status badges**
   - What we know: StudySession uses bg-blue-500, bg-amber-500, bg-green-500 for New/Learning/Review status
   - What's unclear: Should these be semantic tokens (--color-status-new) or remain raw?
   - Recommendation: Define semantic status tokens to preserve meaning and support dark mode properly

4. **Animation keyframes from tailwindcss-animate**
   - What we know: Plugin provides animate-spin, animate-in, fade-in, slide-in-from-* utilities
   - What's unclear: Do these need duration/easing overrides or are defaults sufficient?
   - Recommendation: Test with new duration tokens, override if needed in tailwind.config.js animations

## Sources

### Primary (HIGH confidence)
- Current codebase files (index.css, tailwind.config.js, pages/*.tsx, components/*.tsx) - Direct audit
- [Tailwind CSS v3 Adding Custom Styles](https://v3.tailwindcss.com/docs/adding-custom-styles) - Official v3 docs
- [shadcn/ui Theming Documentation](https://ui.shadcn.com/docs/theming) - Official shadcn docs
- Bootstrap 5.3 Z-Index Scale - [Bootstrap v5.3 Layout](https://getbootstrap.com/docs/5.3/layout/z-index/)

### Secondary (MEDIUM confidence)
- [Tailwind CSS Best Practices 2025-2026](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns) - Community patterns
- [Tailwind Dynamic Classes Explained](https://tailkits.com/blog/tailwind-dynamic-classes/) - Common pitfall documentation
- [Understanding Tailwind CSS Safelist](https://blogs.perficient.com/2025/08/19/understanding-tailwind-css-safelist-keep-your-dynamic-classes-safe/) - Safelist best practices
- [Managing CSS Z-Index In Large Projects](https://www.smashingmagazine.com/2021/02/css-z-index-large-projects/) - Z-index patterns
- [Carbon Design System Motion](https://carbondesignsystem.com/elements/motion/overview/) - Motion token patterns
- [Material Design Easing and Duration](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs) - Motion specifications

### Tertiary (LOW confidence)
- [How to Build a Design Token System](https://hexshift.medium.com/how-to-build-a-design-token-system-for-tailwind-that-scales-forever-84c4c0873e6d) - Medium article, not verified
- [Exploring Typesafe Design Tokens in Tailwind 4](https://dev.to/wearethreebears/exploring-typesafe-design-tokens-in-tailwind-4-372d) - v4-specific, not applicable

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using exact versions from package.json, verified with npm list
- Architecture: HIGH - Patterns verified in current codebase and official documentation
- Pitfalls: MEDIUM - Based on community patterns and official docs, not all tested in this specific codebase
- Current state audit: HIGH - Direct grep/read analysis of actual codebase files

**Research date:** 2026-01-27
**Valid until:** 2026-03-27 (60 days - Tailwind v3 stable, unlikely to change rapidly)

**Codebase Statistics:**
- Typography classes: 229 occurrences across 34 files
- Spacing classes: 420 occurrences across 38 files
- Border radius: 100 occurrences across 29 files
- Shadows: 20 occurrences across 15 files
- Icon sizes: 158 occurrences across 31 files
- Motion durations: 52 occurrences across 16 files
- Z-index values: 20 occurrences across 15 files (mostly z-50)
- Raw color classes: 51 occurrences across 12 files (need semantic token migration)

**Key Finding:** The codebase is ready for token migration. Semantic color system already works. The work is: (1) define 6 typography + 8 spacing + 3 radius + 3 shadow + 3 icon + 7 z-index + 6 motion tokens, (2) map them in tailwind.config.js, (3) systematically replace ~900 occurrences of ad-hoc utilities across 7 pages and 20+ components.
