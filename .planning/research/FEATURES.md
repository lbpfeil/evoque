# Feature Landscape: Design System Standardization

**Domain:** Rigid design system for a small/medium React + Tailwind + shadcn/ui app
**Researched:** 2026-01-27
**Confidence:** HIGH (cross-referenced Apple HIG, industry design systems, Tailwind/shadcn docs, and codebase audit)

---

## Current State: Evidence of Inconsistency

Before defining what to build, here is the concrete evidence of inconsistency in the Evoque codebase that this design system must eliminate:

**Title sizes across pages (currently):**
- Dashboard: `text-3xl font-bold` (30px)
- Highlights: `text-3xl font-bold` (30px)
- Study: `text-base font-semibold` (16px)
- Settings: `text-base font-semibold` (16px)
- Login: `text-2xl font-bold` (24px)
- StudySession completion: `text-2xl font-bold` (24px)

**Border radius across pages:**
- Login card: `rounded-2xl` (16px)
- Highlights table: `rounded-xl` (12px)
- Highlights filter bar: `rounded-xl` (12px)
- Dashboard book cards: `rounded-md` (6px)
- Settings sections: `rounded` (4px)
- Study button: `rounded-md` (6px)

**Spacing patterns:**
- Dashboard: `space-y-12` (48px between sections)
- Highlights: `space-y-4` (16px between sections)
- Settings: `space-y-3` to `space-y-4` (12-16px)
- Study: `mb-3` to `mb-4` (12-16px)

**Button height defaults (from shadcn Button component):**
- Default: `h-10` (40px)
- sm: `h-9` (36px)
- But pages manually override with `h-7` (28px), `py-3` (various), `py-2.5`, etc.

This is what "zero design system" looks like. Every page was designed independently.

---

## Table Stakes Features

These are non-negotiable. Without them, you do not have a design system -- you have a style guide document nobody reads.

### 1. Typography Scale: Exactly 6 Named Sizes with Strict Context Rules

**What it is:** A closed set of font size + weight + line-height + letter-spacing combinations. Each has a name and a rule for when to use it.

**Concrete specification:**

| Token Name | Size | Weight | Line Height | Letter Spacing | Usage Rule |
|------------|------|--------|-------------|----------------|------------|
| `display` | 24px (`text-2xl`) | 700 (bold) | 1.2 | -0.025em | Login/splash page title ONLY. Max 1 per app. |
| `title` | 18px (`text-lg`) | 600 (semibold) | 1.3 | -0.015em | Page title. Exactly 1 per page. |
| `heading` | 14px (`text-sm`) | 600 (semibold) | 1.4 | 0 | Section headers within a page. Cards, groups, sidebar sections. |
| `body` | 14px (`text-sm`) | 400 (normal) | 1.5 | 0 | Default text. Table cells, form labels, descriptions. |
| `caption` | 12px (`text-xs`) | 500 (medium) | 1.4 | 0.01em | Metadata, timestamps, counts, badges, secondary info. |
| `overline` | 10px (`text-[10px]`) | 600 (semibold) | 1.4 | 0.05em | Uppercase labels, table headers, category markers. Minimum 10px. |

**Enforcement rule:** No other font size may appear in the codebase. If a developer writes `text-3xl`, `text-2xl` (outside login), `text-xl`, `text-base`, or `text-lg` outside a page title -- it is a violation.

**Why exactly these 6:** Research shows 5-7 sizes is the sweet spot. Salesforce Lightning uses 4 headings + 2 body. IBM Carbon uses far more (19) and suffers inconsistency. Our compact UI needs density, so sizes cluster at the small end. The `display` size exists only for the login/branding moment.

**Confidence:** HIGH -- based on Nathan Curtis (EightShapes) typography in design systems, Design Systems typography guide, and Apple HIG principles of limited, purposeful scale.

### 2. Spacing Scale: Named Semantic Tokens on a 4px Grid

**What it is:** A closed set of spacing values with semantic names that describe their purpose, not their pixel value.

**Concrete specification:**

| Token Name | Value | Tailwind | Usage Rule |
|------------|-------|----------|------------|
| `space-0` | 0px | `gap-0` / `p-0` | No space. Tight element grouping. |
| `space-xs` | 2px | `gap-0.5` / `p-0.5` | Between tightly related items (icon + label within a button). |
| `space-sm` | 4px | `gap-1` / `p-1` | Between related items in a group (list items, form field + label). |
| `space-md` | 8px | `gap-2` / `p-2` | Between components in a section (card padding, button groups). |
| `space-lg` | 12px | `gap-3` / `p-3` | Between sections within a card or panel. |
| `space-xl` | 16px | `gap-4` / `p-4` | Between major sections on a page. Page content padding. |
| `space-2xl` | 24px | `gap-6` / `p-6` | Between top-level page sections (header-to-content, content-to-footer). |
| `space-3xl` | 32px | `gap-8` / `p-8` | Page-level vertical breathing room (rare, intentional). |

**Enforcement rule:** No spacing value outside this scale. Specifically: `space-y-12` (48px, used in Dashboard) is banned. `gap-5`, `gap-12`, `space-y-8` arbitrarily -- banned. Every spacing decision must map to a semantic token.

**Why this scale:** 4px base grid is the standard for compact/dense UIs (Linear, Notion, Figma all use it). The existing Evoque guidelines already recommend 4px base. We keep it but add semantic names so developers think "what is the relationship between these elements?" not "how many pixels should this be?"

**Confidence:** HIGH -- 4px grid is universally recommended for compact UIs. Semantic naming is standard practice in Carbon, Polaris, and Material.

### 3. Color Semantic Tokens: Already-Built Foundation + Usage Rules

**What it is:** The existing OKLCH CSS variable system (`--primary`, `--foreground`, `--muted`, etc.) is already solid. What is missing is strict usage rules documenting when each token applies.

**Concrete specification:**

| Token | Light Mode | Usage Rule |
|-------|------------|------------|
| `foreground` | Near-black warm | Primary text, page titles, active labels |
| `muted-foreground` | Mid warm gray | Secondary text, descriptions, placeholders, disabled text |
| `primary` | Warm amber | Interactive elements: buttons, links, focus rings, active states |
| `primary-foreground` | Cream white | Text on primary-colored backgrounds only |
| `destructive` | Warm red | Delete actions, error messages. Never for emphasis. |
| `border` | Light warm | All borders, dividers, separators |
| `input` | Same as border | Input field borders specifically |
| `background` | Warm off-white | Page background |
| `card` | Slightly warmer | Card/panel surfaces |
| `muted` | Warm light gray | Disabled backgrounds, subtle fills, hover states |
| `accent` | Warm accent | Selected items, hover backgrounds |

**Enforcement rule:** No raw color classes like `text-zinc-400`, `bg-zinc-50`, `text-blue-600`, `border-zinc-200` anywhere in page or component code. Every color must reference a semantic token (`text-muted-foreground`, `bg-muted`, `text-primary`, `border-border`). The only exception is the study session rating buttons which use semantic color (red/amber/blue/green for Again/Hard/Good/Easy) -- these get their own tokens.

**What needs to be added:** Study rating color tokens:
- `--rating-again` / `--rating-hard` / `--rating-good` / `--rating-easy`

**Confidence:** HIGH -- the CSS variable foundation already exists and works. The gap is documentation and enforcement, not implementation.

### 4. Border Radius Scale: Exactly 3 Values

**What it is:** A closed set of border radius values with clear rules.

**Concrete specification:**

| Token | Value | Tailwind | Usage Rule |
|-------|-------|----------|------------|
| `radius-sm` | 4px | `rounded` | Small inline elements: badges, chips, tags, inline inputs |
| `radius-md` | 8px | `rounded-lg` | Standard components: buttons, cards, inputs, dropdowns, modals |
| `radius-lg` | 12px | `rounded-xl` | Large containers: page-level cards, hero sections, login card |

**Enforcement rule:** No `rounded-2xl` (16px), no `rounded-full` except for avatar circles and pill badges, no `rounded-sm` (which is 2px and too subtle), no `rounded-md` (6px -- it falls between our tokens). The current codebase uses `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`, and `rounded-2xl` across different pages. This must collapse to exactly 3.

**Confidence:** HIGH -- 3-level radius scale is standard practice. Apple uses primarily 2 radii (small for controls, large for containers).

### 5. Shadow Scale: Exactly 3 Elevations

**What it is:** Consistent shadow system for visual hierarchy.

**Concrete specification:**

| Token | Usage Rule | Tailwind |
|-------|------------|----------|
| `shadow-sm` | Subtle surface separation. Cards at rest, inputs. | `shadow-sm` |
| `shadow-md` | Elevated interactive elements. Dropdowns, popovers, hover cards. | `shadow-md` |
| `shadow-lg` | High-prominence overlays. Modals, dialogs, toasts. | `shadow-lg` or `shadow-xl` |

**Enforcement rule:** No `shadow-2xl`. No custom shadow values. If a component needs to feel "elevated," pick from these 3. The current codebase uses `shadow-sm`, `shadow-md`, `shadow-xl` inconsistently.

**Confidence:** HIGH -- 3-level elevation is standard (Material Design uses 5 but 3 is sufficient for a small app).

### 6. Icon Size Scale: Exactly 3 Sizes

**What it is:** Fixed icon sizes to prevent visual noise from inconsistent icons.

**Concrete specification:**

| Token | Size | Tailwind | Usage Rule |
|-------|------|----------|------------|
| `icon-sm` | 14px | `w-3.5 h-3.5` | Inside buttons, inline with body text, action icons |
| `icon-md` | 16px | `w-4 h-4` | Section headers, standalone icons, navigation |
| `icon-lg` | 20px | `w-5 h-5` | Page header icons, empty state illustrations, stat cards |

**Enforcement rule:** No `w-2.5 h-2.5` (10px), no `w-3 h-3` (12px unless adjusted), no `w-6 h-6`. The current codebase uses at least 5 different icon sizes: 10px, 12px, 14px, 16px, 20px. This must collapse.

**Note:** The existing compact guidelines recommend `w-3 h-3` (12px) as standard, but this is too small for the warm/friendly design direction. Bumping to 14px minimum improves touch/click targets and readability.

**Confidence:** MEDIUM -- icon sizing is often debated. The 3-tier approach is opinionated but aligns with Apple's 3-size approach (compact/regular/large).

### 7. Component Variant System (CVA Contracts)

**What it is:** Every shared component (Button, Input, Badge, Card) exposes a typed variant API via Class Variance Authority. No ad-hoc className overrides for size/appearance.

**Concrete specification for Button (example):**

```typescript
const buttonVariants = cva(base, {
  variants: {
    variant: {
      default: "...",     // Primary action
      secondary: "...",   // Secondary action
      ghost: "...",       // Tertiary/icon action
      destructive: "...", // Delete/danger
      link: "...",        // Inline text link
    },
    size: {
      default: "h-8 px-3 text-sm",    // Standard button (32px)
      sm: "h-7 px-2.5 text-xs",       // Compact button (28px)
      lg: "h-10 px-4 text-sm",        // Prominent CTA (40px)
      icon: "h-8 w-8",                // Icon-only button (32px)
      "icon-sm": "h-7 w-7",           // Small icon button (28px)
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});
```

**Enforcement rule:** Pages must not apply raw sizing classes to buttons. `<Button className="h-7 px-3 text-sm">` is banned. Use `<Button size="sm">` instead. The Button component is the contract -- pages consume the contract.

**This must be done for:** Button, Input, Badge, Card, Dialog/Modal, Select. These are the 6 components that appear on every page.

**Confidence:** HIGH -- CVA is the de facto standard for React + Tailwind component APIs in 2025. Already partially in use (Button has variants), but the variants don't match the design system's actual sizes.

### 8. Z-Index Layer System

**What it is:** A fixed layering system so overlapping elements always stack correctly.

**Concrete specification:**

| Token | Value | Usage |
|-------|-------|-------|
| `z-base` | 0 | Page content |
| `z-sticky` | 10 | Sticky headers, fixed table headers |
| `z-sidebar` | 20 | Navigation sidebar |
| `z-dropdown` | 30 | Dropdowns, popovers, tooltips |
| `z-backdrop` | 40 | Modal/sheet backdrop overlay |
| `z-modal` | 50 | Modal/sheet/dialog content |
| `z-toast` | 60 | Toast notifications (always on top) |

**Enforcement rule:** No arbitrary z-index values. The existing guidelines already define this scale. Enforcement is the gap.

**Confidence:** HIGH -- already documented in existing guidelines. Just needs to be formalized as tokens and enforced.

---

## Differentiators

These features separate a "has a design system" app from an "Apple-level consistent" app. They are what make users subconsciously feel "this app is polished."

### 9. Page Layout Template: Single Canonical Structure

**What it is:** Every page follows the exact same layout skeleton. No page is a special snowflake.

**Concrete specification:**

```
[Page Container: px-4 sm:px-6, max-width constraint]
  [Page Header: fixed structure]
    [Title: exactly `title` token, exactly 1 per page]
    [Subtitle: exactly `body` token + muted-foreground, optional]
  [space-2xl gap]
  [Page Content: flexible area]
    [Section: heading token + space-xl internal gap]
    [Section: heading token + space-xl internal gap]
  [Page Footer: optional, fixed-bottom for study]
```

**Rules:**
- Every page starts with the same `<PageHeader title="..." subtitle="..." />` component
- Page padding is always `px-4 sm:px-6` (never `p-4 sm:p-6`, never no padding)
- Header-to-content gap is always `space-2xl` (24px)
- Section-to-section gap is always `space-xl` (16px)
- No page may define its own title styling inline

**Current violations:**
- Dashboard uses inline `<h1 className="text-3xl font-bold">` -- should use PageHeader
- Highlights uses inline `<h1 className="text-3xl font-bold">` -- should use PageHeader
- Study uses inline `<h1 className="text-base font-semibold">` -- should use PageHeader
- Settings uses inline `<h1 className="text-base font-semibold">` -- should use PageHeader

**Confidence:** HIGH -- layout components are a foundational React pattern. Apple enforces identical page structure across every app screen.

### 10. Transition/Motion Tokens: 3 Durations, 3 Easings

**What it is:** Every animation in the app uses a named duration + easing pair. No arbitrary timing.

**Concrete specification:**

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `motion-fast` | 100ms | ease-out | Micro-feedback: button press, checkbox toggle, icon swap |
| `motion-normal` | 150ms | ease-out | Standard interactions: hover states, color changes, focus rings |
| `motion-slow` | 250ms | ease-in-out | Layout changes: modal open/close, accordion, page transitions |

**As CSS custom properties:**
```css
:root {
  --duration-fast: 100ms;
  --duration-normal: 150ms;
  --duration-slow: 250ms;
  --ease-out: cubic-bezier(0.33, 1, 0.68, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
```

**Enforcement rule:** No `duration-200`, `duration-300`, or `transition-all duration-150` scattered across components. The current codebase uses `duration-200` in some places and `transition-colors` (default 150ms) in others with no reasoning.

**Confidence:** HIGH -- motion tokens are standard in Carbon (IBM), Fluent (Microsoft), and Seeds (Sprout Social). Three durations is the minimum viable motion system.

### 11. Interactive State Matrix: Complete Coverage

**What it is:** Every interactive element (button, input, link, card, table row) has defined styles for ALL states. No state may be undefined.

**Concrete specification:**

| State | Visual Treatment | Applies To |
|-------|-----------------|------------|
| `default` | Base appearance | All elements |
| `hover` | `bg-accent` or subtle background shift | Buttons, cards, table rows, links |
| `focus-visible` | `ring-2 ring-ring ring-offset-2` | All focusable elements (keyboard navigation) |
| `active` / `pressed` | Slightly darker than hover, `scale-[0.98]` for buttons | Buttons, clickable cards |
| `disabled` | `opacity-50 cursor-not-allowed pointer-events-none` | Buttons, inputs, links |
| `selected` | `bg-accent text-accent-foreground` | Table rows, list items, tabs |
| `loading` | Spinner icon replacing content, maintain dimensions | Buttons (async actions) |

**Enforcement rule:** Before a component ships, every state in this matrix must be defined. If a button has no `disabled` style, it is incomplete. If a table row has no `hover` style, it is incomplete.

**Confidence:** HIGH -- Apple HIG explicitly requires all states be designed. This is the most common gap in web apps.

### 12. Density Modes: Compact-Only with Documented Exceptions

**What it is:** The entire app operates in compact density. But specific contexts (StudySession reading area) explicitly use relaxed density for readability.

**Concrete specification:**

| Context | Density | Button Height | Text Size | Padding |
|---------|---------|---------------|-----------|---------|
| Default (all pages) | Compact | 32px (`h-8`) | 14px (`text-sm`) | `p-2` to `p-3` |
| Study reading area | Relaxed | N/A | 18-20px (`text-lg`/`text-xl`) | `p-4` to `p-6` |
| Login page | Relaxed | 44px (touch target) | 14px (`text-sm`) | `p-6` to `p-8` |

**Enforcement rule:** The relaxed context is opt-in and explicit. You must wrap content in a density context component (e.g., `<DensityProvider mode="relaxed">`) or document why a specific page deviates. No accidental mixing.

**Confidence:** MEDIUM -- density modes are used by Fluent UI and Material Design. For a small app, documenting the 2 exceptions explicitly is simpler than a full density system.

### 13. Empty State Pattern: Single Canonical Template

**What it is:** Every empty state (no books, no highlights, no study cards, no search results) follows the same visual template.

**Concrete specification:**

```
[Container: centered, max-w-sm, py-12]
  [Icon: icon-lg, muted-foreground, mb-3]
  [Title: heading token, foreground]
  [Description: body token, muted-foreground, max-w-xs, text-center]
  [Action button: optional, size="default", variant="default"]
```

**Rules:**
- Icon is always from the same icon set (Lucide)
- Text is always centered
- Action button is always below the description
- No custom empty states with different layouts

**Confidence:** HIGH -- empty states are a known consistency gap. One template eliminates the problem.

### 14. Data Table Pattern: Single Reusable Structure

**What it is:** Every table in the app (Highlights table, Settings library table, Study deck table) uses the same base structure.

**Concrete specification:**

| Element | Style |
|---------|-------|
| Table container | `rounded-lg border border-border overflow-hidden` |
| Header row | `bg-muted text-overline uppercase tracking-wider` |
| Header cell padding | `px-4 py-3` |
| Body cell padding | `px-4 py-3` |
| Row hover | `hover:bg-accent/50 transition-colors` |
| Row border | `border-b border-border last:border-b-0` |
| Sort indicator | `icon-sm` chevron, `text-foreground` when active, `text-muted-foreground` when inactive |

**Enforcement rule:** No table may define its own cell padding, header styling, or hover behavior. All tables share a single `<DataTable>` component or at minimum follow this exact pattern.

**Confidence:** HIGH -- the Highlights table already has good patterns. Standardize and reuse.

---

## Anti-Features

These are things to deliberately NOT build, even though they might seem like "good design system practices." They are over-engineering for an app of this size.

### DO NOT: Build a Storybook

**Why avoid:** Storybook is valuable for teams of 5+ developers sharing components across multiple apps. Evoque has 1 developer and 16 UI components. The maintenance cost of Storybook (keeping stories in sync, configuring addons, updating versions) outweighs the benefit. The design system document IS the documentation.

**What to do instead:** Document component variants in the design system spec file. Use the app itself as the visual reference.

### DO NOT: Create Figma-to-Code Token Pipeline

**Why avoid:** Token export tooling (Style Dictionary, Tokens Studio, Terrazzo) is designed for organizations where designers and developers are different people working in different tools. Evoque has no Figma file. The CSS custom properties ARE the source of truth.

**What to do instead:** Define tokens directly in `index.css` and `tailwind.config.js`. That's the pipeline.

### DO NOT: Build Responsive Typography with clamp()

**Why avoid:** `clamp()` fluid typography is for content-heavy marketing sites where headings need to scale dramatically between mobile and desktop. Evoque is a data-dense app where text sizes should be consistent across breakpoints. A 14px label should be 14px everywhere.

**What to do instead:** Use fixed font sizes from the typography scale. Only the page container width changes responsively, not the text sizes.

### DO NOT: Build a Theme Switcher (Beyond Light/Dark)

**Why avoid:** Supporting arbitrary color themes (like "Ocean Blue," "Forest Green") requires token abstraction that doubles CSS complexity. The warm OKLCH palette IS the brand. Light and dark modes are sufficient.

**What to do instead:** Keep exactly 2 themes: light and dark. Both use the warm OKLCH palette. Done.

### DO NOT: Add CSS-in-JS or Styled Components

**Why avoid:** The project already uses Tailwind + CVA + cn(). Adding another styling layer (Emotion, styled-components, vanilla-extract) creates competing systems and increases bundle size. Tailwind utility classes + CSS custom properties is the complete solution.

**What to do instead:** Use Tailwind classes exclusively. Use CSS custom properties for tokens. Use CVA for component variant APIs.

### DO NOT: Create Wrapper Components for Every HTML Element

**Why avoid:** Wrapping `<h1>`, `<p>`, `<span>` in `<Typography variant="h1">` components is a pattern from Material UI that adds indirection without value in a Tailwind project. Tailwind classes already ARE the abstraction.

**What to do instead:** Define the typography tokens as documented CSS classes or Tailwind `@apply` utilities (e.g., `.text-title { @apply text-lg font-semibold leading-tight tracking-tight; }`). Use them directly on HTML elements. The PageHeader component handles the most common case (page title).

### DO NOT: Build a Design Token JSON File

**Why avoid:** W3C Design Token format and JSON token files are for cross-platform systems (web + iOS + Android). Evoque is web-only. The `index.css` file with CSS custom properties IS the token file, and Tailwind consumes it natively.

**What to do instead:** CSS custom properties in `index.css` for colors/motion. Tailwind config for spacing/typography/radius. These two files ARE the token system.

---

## Feature Dependencies

```
Typography Scale ──────────────────────┐
                                       ├──> Page Layout Template
Spacing Scale ─────────────────────────┤
                                       ├──> Data Table Pattern
Color Semantic Tokens (exists) ────────┤
                                       ├──> Empty State Pattern
Border Radius Scale ───────────────────┤
                                       ├──> Interactive State Matrix
Shadow Scale ──────────────────────────┘

Icon Size Scale ───────────────────────> Component Variants (CVA)

Z-Index System (exists) ───────────────> Modal/Dialog Pattern

Motion Tokens ─────────────────────────> Interactive State Matrix
```

**Dependency reading:** You must define typography + spacing + color + radius + shadow scales BEFORE you can build page layout templates, data tables, or empty states -- because those compositions reference the primitive tokens.

---

## MVP Recommendation

For the design system milestone, prioritize in this order:

**Phase 1 -- Token Foundation (must be first):**
1. Typography scale (6 sizes with usage rules)
2. Spacing scale (8 named semantic tokens)
3. Border radius scale (3 values)
4. Shadow scale (3 elevations)
5. Icon size scale (3 sizes)
6. Motion tokens (3 durations + easings)

**Phase 2 -- Component Contracts (depends on Phase 1):**
7. Button variant update (align CVA to new scale)
8. Input variant update
9. Card variant update
10. Badge variant update

**Phase 3 -- Composition Patterns (depends on Phase 2):**
11. PageHeader component + Page Layout template
12. Data Table pattern
13. Empty State pattern
14. Interactive State Matrix enforcement

**Phase 4 -- Migration (depends on Phase 3):**
15. Migrate all 6-7 pages to use the system
16. Audit and remove all non-token values

**Defer to post-milestone:**
- Density context system (just document the 2 exceptions instead)
- Storybook (unnecessary for 1-person team)
- Token pipeline automation (manual is fine)

---

## Sources

**Typography Scale:**
- [Typography in Design Systems -- Nathan Curtis / EightShapes](https://medium.com/eightshapes-llc/typography-in-design-systems-6ed771432f1e)
- [The 2025 Guide to Responsive Typography Sizing and Scales -- Design Shack](https://designshack.net/articles/typography/guide-to-responsive-typography-sizing-and-scales/)
- [Mastering Typography in Design Systems -- UX Collective](https://uxdesign.cc/mastering-typography-in-design-systems-with-semantic-tokens-and-responsive-scaling-6ccd598d9f21)
- [Design Systems Typography Guide -- DesignSystems.com](https://www.designsystems.com/typography-guides/)

**Spacing and Layout:**
- [Tailwind CSS Best Practices 2025 -- FrontendTools](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns)
- [How to Build a Design Token System for Tailwind -- Medium](https://hexshift.medium.com/how-to-build-a-design-token-system-for-tailwind-that-scales-forever-84c4c0873e6d)

**Component Variants (CVA):**
- [Enterprise Component Architecture with CVA -- thedanielmark.com](https://www.thedanielmark.com/blog/enterprise-component-architecture-type-safe-design-systems-with-class-variance-authority)
- [CVA Official Docs](https://cva.style/docs)
- [CVA API Reference](https://cva.style/docs/api-reference)

**Motion Tokens:**
- [Animation/Motion Design Tokens -- Oscar Gonzalez / Prototypr](https://prototypr.io/post/animation-design-tokens)
- [Motion -- Carbon Design System (IBM)](https://carbondesignsystem.com/elements/motion/overview/)
- [Motion -- Fluent 2 Design System (Microsoft)](https://fluent2.microsoft.design/motion)
- [Motion -- Seeds Design System (Sprout Social)](https://seeds.sproutsocial.com/visual/motion/)

**Design System Architecture:**
- [Building a Scalable Design System with shadcn/ui -- Shadi Sbaih](https://shadisbaih.medium.com/building-a-scalable-design-system-with-shadcn-ui-tailwind-css-and-design-tokens-031474b03690)
- [An Opinionated Guide to Building a Scalable React Component System in 2025 -- Medium](https://iamshadi.medium.com/an-opinionated-guide-to-building-a-scalable-react-component-system-in-2025-cdffb77c36a2)

**Apple HIG / Consistency Principles:**
- [Human Interface Guidelines -- Apple](https://developer.apple.com/design/human-interface-guidelines/)
- [Apple HIG Design System -- designsystems.surf](https://designsystems.surf/design-systems/apple)
