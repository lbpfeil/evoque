# Stack Research: Design System Standardization

**Project:** EVOQUE (Kindle Highlights Manager)
**Researched:** 2026-01-27
**Mode:** Stack dimension for rigid design system enforcement (v2.0 milestone)
**Overall Confidence:** HIGH

---

## Executive Summary

Your v1.0 shipped a warm OKLCH color palette and theme system. The next step is enforcing obsessive consistency across typography, spacing, and component usage. This research identifies what tools and configuration approaches will lock down your design tokens so that every visual element is identical to its equivalent on any page.

The core insight: **you do not need new libraries.** Your existing Tailwind v3 + CVA + shadcn/ui stack already has the enforcement mechanisms. What you need is configuration tightening (restrict the Tailwind theme to your exact scales), linting enforcement (ESLint plugin to ban arbitrary values), and documentation (lightweight design guide, not Storybook).

---

## Current State Assessment

### What You Have

| Technology | Version | Status |
|------------|---------|--------|
| Tailwind CSS | 3.4.17 | Stable, well-configured |
| class-variance-authority | 0.7.1 | Used by all shadcn components |
| tailwind-merge | 3.4.0 | Used via `cn()` utility |
| clsx | 2.1.1 | Used via `cn()` utility |
| shadcn/ui components | 16 components | button, dialog, input, popover, command, sheet, card, tabs, badge, select, switch, tooltip, scroll-area, dropdown-menu, alert-dialog, checkbox |
| Outfit Variable font | @fontsource-variable/outfit | Primary sans-serif |

### What Needs Fixing

**59 arbitrary font-size values** scattered across 14 files (`text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`). These are exactly the kind of values that erode design system consistency. They need to be absorbed into named token sizes.

**56 arbitrary spacing/dimension values** across 18 files (`w-[400px]`, `max-h-[300px]`, `h-[80px]`, etc.). Some are legitimate layout constraints; others should become tokens.

**No ESLint configuration** exists at the project root -- there is no mechanism to prevent new arbitrary values from being introduced.

**Typography guidelines exist only in prose** (`compact-ui-design-guidelines.md`) but are not enforced by tooling. The Tailwind config still exposes Tailwind's full default `fontSize` scale plus `fontFamily` extensions, allowing devs to use any size.

---

## Recommended Approach: Token Enforcement via Tailwind Config + ESLint

### Strategy: Three Layers

```
Layer 1: RESTRICT  -- Override Tailwind theme to only expose allowed tokens
Layer 2: ENFORCE   -- ESLint plugin bans arbitrary values in utility classes
Layer 3: DOCUMENT  -- In-code design guide with usage examples
```

This approach does not add weight to the runtime bundle. Layer 1 actually reduces CSS output (fewer utility classes generated). Layer 2 is dev-only tooling. Layer 3 is documentation.

---

## Layer 1: Tailwind Config Token Restriction

### Typography Scale

**Approach:** Override `theme.fontSize` (not `theme.extend.fontSize`) to completely replace Tailwind's 13 default sizes with your exact design system scale.

**Rationale:** When you place font sizes under `theme.fontSize` instead of `theme.extend.fontSize`, Tailwind eliminates all defaults. Only your defined sizes generate utility classes. The VS Code IntelliSense only suggests your allowed sizes. This is the strongest enforcement mechanism.

**Confidence:** HIGH -- verified from [Tailwind v3 Font Size docs](https://v3.tailwindcss.com/docs/font-size) and [Theme Configuration docs](https://v3.tailwindcss.com/docs/theme).

**Recommended scale (based on existing compact-ui-design-guidelines.md v1.1):**

```javascript
// tailwind.config.js -- theme.fontSize (replaces defaults)
fontSize: {
  // Micro -- heatmap cells, extreme metadata
  "2xs": ["8px", { lineHeight: "1.2" }],

  // Caption -- tag pills, labels, keyboard hints, stats labels
  "xs": ["10px", { lineHeight: "1.3" }],

  // Small caption -- table headers, metadata, secondary info
  "sm-caption": ["11px", { lineHeight: "1.35" }],

  // Body small -- default text, list items, descriptions
  "sm": ["12px", { lineHeight: "1.5" }],

  // Body -- normal text, input text (compact-ui v1.1)
  "base": ["14px", { lineHeight: "1.5" }],

  // Heading 3 / Section title
  "lg": ["16px", { lineHeight: "1.4" }],

  // Heading 2 / Page subtitle
  "xl": ["18px", { lineHeight: "1.3" }],

  // Heading 1 / Page title
  "2xl": ["20px", { lineHeight: "1.3" }],

  // Display -- hero stats, large numbers
  "3xl": ["24px", { lineHeight: "1.2" }],
}
```

**Why this scale and not a modular ratio:** Your app is a compact productivity tool, not a marketing site. The existing design guidelines specify exact pixel values (8px, 9px, 10px, 11px, 12px, 14px, 16px, 18px, 20px). A modular ratio (e.g., 1.25x) would produce sizes like 10, 12.5, 15.6, 19.5 -- none of which match your current guidelines. Use a hand-tuned scale that matches what you already use.

**Migration note:** The existing `text-[9px]` and `text-[10px]` usages (59 occurrences across 14 files) map to `text-xs`. The `text-[8px]` usages map to `text-2xs`. The `text-[11px]` usages map to `text-sm-caption`. This is a mechanical find-and-replace migration.

### Font Weight Scale

**Approach:** Override `theme.fontWeight` to restrict to three weights only.

```javascript
fontWeight: {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
}
```

**Rationale:** Outfit Variable supports the full 100-900 range but your design guidelines only use normal, medium, semibold, and bold. Restricting prevents `font-thin`, `font-extralight`, `font-light`, `font-extrabold`, `font-black` from ever appearing in code.

### Spacing Scale

**Approach:** Keep Tailwind's default spacing scale but add semantic aliases. Do NOT override `theme.spacing` -- Tailwind's 4px-based default scale already matches your compact-ui-design-guidelines (which explicitly states "4px base unit").

```javascript
// theme.extend.spacing -- add semantic aliases only
spacing: {
  "section": "12px",   // gap-section = 12px (between sections)
  "group": "8px",      // gap-group = 8px (between related items)
  "item": "4px",       // gap-item = 4px (between list items)
  "tight": "2px",      // gap-tight = 2px (minimal gaps)
}
```

**Why NOT override spacing:** Unlike typography, where you have 13 unused defaults cluttering autocomplete, the spacing scale's values (0.5=2px, 1=4px, 1.5=6px, 2=8px, 3=12px, 4=16px) are ALL used in your guidelines. Overriding would break existing code for no benefit.

**Why add semantic aliases:** Semantic names (`gap-section`, `gap-group`, `gap-item`) make intent explicit. A developer choosing between `gap-2` and `gap-3` might guess wrong. A developer choosing `gap-group` cannot. But this is optional polish, not required for enforcement.

### Border Radius Scale

**Approach:** Keep CSS variable approach (already in place).

Your config already has:
```javascript
borderRadius: {
  lg: "var(--radius)",
  md: "calc(var(--radius) - 2px)",
  sm: "calc(var(--radius) - 4px)",
}
```

This is correct. `--radius: 0.75rem` produces a consistent 3-step scale. No changes needed.

### Z-Index Scale

**Approach:** Override `theme.zIndex` to match the layer system documented in compact-ui-design-guidelines.md.

```javascript
zIndex: {
  "base": "0",
  "header": "10",
  "sidebar": "20",
  "dropdown": "30",
  "backdrop": "40",
  "modal": "50",
  "toast": "60",
}
```

**Rationale:** Your guidelines define this exact layer system. Making it the only available z-index scale prevents `z-[999]` and `z-50` competing in the same codebase. Semantic names make the layer hierarchy self-documenting.

---

## Layer 2: ESLint Enforcement

### Tool: eslint-plugin-tailwindcss

**Install:**
```bash
npm install -D eslint eslint-plugin-tailwindcss @eslint/js
```

**Why this plugin:** It is the most mature ESLint plugin for Tailwind CSS v3. It provides the `no-arbitrary-value` rule which bans all `[bracket]` syntax in Tailwind utility classes. This is the single most impactful rule for design system enforcement.

**Confidence:** HIGH -- verified from [eslint-plugin-tailwindcss GitHub](https://github.com/francoismassart/eslint-plugin-tailwindcss) and [npm](https://www.npmjs.com/package/eslint-plugin-tailwindcss).

**Configuration (flat config, ESLint v9+):**

```javascript
// eslint.config.js
import tailwind from "eslint-plugin-tailwindcss";

export default [
  ...tailwind.configs["flat/recommended"],
  {
    settings: {
      tailwindcss: {
        callees: ["cn", "cva", "clsx"],
        config: "tailwind.config.js",
      },
    },
    rules: {
      // CRITICAL: Ban arbitrary values -- forces use of design tokens
      "tailwindcss/no-arbitrary-value": "warn",

      // Auto-fixable: Replace arbitrary values that match config
      // e.g., m-[1.25rem] -> m-5
      "tailwindcss/no-unnecessary-arbitrary-value": "error",

      // Order classes consistently
      "tailwindcss/classnames-order": "warn",

      // Prevent contradictions like p-2 p-3
      "tailwindcss/no-contradicting-classname": "error",

      // Use shorthand (e.g., mx-2 instead of ml-2 mr-2)
      "tailwindcss/enforces-shorthand": "warn",
    },
  },
];
```

**Key rules explained:**

| Rule | Severity | What It Does |
|------|----------|-------------|
| `no-arbitrary-value` | `warn` | Flags ANY `text-[10px]`, `w-[400px]`, etc. Forces migration to tokens. Start as `warn` during migration, upgrade to `error` when clean. |
| `no-unnecessary-arbitrary-value` | `error` | Auto-fixes `m-[1.25rem]` to `m-5` when a config match exists. Safe to error immediately. |
| `no-contradicting-classname` | `error` | Catches `p-2 p-3` (conflicting padding). Always error. |
| `classnames-order` | `warn` | Consistent class ordering. Quality of life. |
| `enforces-shorthand` | `warn` | Prefers `mx-2` over `ml-2 mr-2`. Quality of life. |

**Migration strategy for `no-arbitrary-value`:** Start as `warn` because you have 59+ arbitrary font sizes and 56+ arbitrary spacing values. Migrate file by file. Once all arbitrary values use tokens, upgrade to `error` to prevent regression.

**Script additions:**
```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix"
  }
}
```

### What NOT to Install

**Do NOT install `@poupe/eslint-plugin-tailwindcss`:** It targets Tailwind CSS v4 specifically. You are on v3. The original `eslint-plugin-tailwindcss` has full v3 support.

**Do NOT install Stylelint:** Your CSS is minimal (just `index.css` with Tailwind directives and CSS variables). Stylelint would add complexity for no benefit. ESLint handles the utility class enforcement.

**Do NOT install `eslint-plugin-better-tailwindcss`:** It is newer and less battle-tested. Stick with the established plugin.

---

## Layer 3: Documentation Approach

### Recommendation: In-Code Design Guide (NOT Storybook)

**Why NOT Storybook:**
- Your app is a solo/small-team project with 16 shadcn components
- Storybook adds ~66MB of dependencies and ~8s cold start
- The overhead of maintaining stories for 16 components exceeds the documentation value
- Your design guidelines already exist in markdown (`compact-ui-design-guidelines.md`)

**Why NOT Ladle:**
- Ladle is faster (1.2s cold start, 388KB) but still adds build infrastructure
- For 16 components with clear CVA variants, the cost-benefit ratio is unfavorable
- Better suited for teams with 50+ custom components

**Confidence:** MEDIUM -- this is an opinion based on project size. Storybook becomes valuable at ~30+ custom components or when multiple developers need a shared visual reference.

**Recommended approach: Enhanced markdown design guide + TypeScript constants file**

Create a design tokens TypeScript file that serves as both documentation and enforcement:

```typescript
// lib/design-tokens.ts

/**
 * EVOQUE Design System Tokens
 *
 * Single source of truth for all design decisions.
 * These constants are used for documentation and runtime reference.
 * The actual enforcement happens in tailwind.config.js and eslint.
 */

export const typography = {
  "2xs": { size: "8px", lineHeight: "1.2", use: "Heatmap cells, extreme metadata" },
  "xs": { size: "10px", lineHeight: "1.3", use: "Tag pills, labels, keyboard hints" },
  "sm-caption": { size: "11px", lineHeight: "1.35", use: "Table headers, metadata" },
  "sm": { size: "12px", lineHeight: "1.5", use: "Body small, list items" },
  "base": { size: "14px", lineHeight: "1.5", use: "Body text, inputs" },
  "lg": { size: "16px", lineHeight: "1.4", use: "Section titles (H3)" },
  "xl": { size: "18px", lineHeight: "1.3", use: "Page subtitles (H2)" },
  "2xl": { size: "20px", lineHeight: "1.3", use: "Page titles (H1)" },
  "3xl": { size: "24px", lineHeight: "1.2", use: "Display, hero stats" },
} as const;

export const spacing = {
  tight: { value: "2px", tailwind: "gap-0.5", use: "Between related items in a row" },
  item: { value: "4px", tailwind: "gap-1", use: "Between list items" },
  group: { value: "8px", tailwind: "gap-2", use: "Between groups of related items" },
  section: { value: "12px", tailwind: "gap-3", use: "Between major sections" },
} as const;

export const elevation = {
  base: { z: "0", use: "Page content" },
  header: { z: "10", use: "Fixed headers" },
  sidebar: { z: "20", use: "Sidebars, navigation" },
  dropdown: { z: "30", use: "Dropdowns, tooltips" },
  backdrop: { z: "40", use: "Modal backdrop" },
  modal: { z: "50", use: "Modal content" },
  toast: { z: "60", use: "Toast notifications" },
} as const;
```

This file is importable, greppable, and serves as living documentation. It does not add runtime cost (tree-shaken if unused) but gives developers a single place to check "what size should I use for X?"

### Update Existing Guidelines

The existing `compact-ui-design-guidelines.md` should be updated to:
1. Reference the Tailwind token names instead of raw pixel values
2. Add a mapping table: "If you previously used `text-[10px]`, now use `text-xs`"
3. Remove any guidance that contradicts the restricted Tailwind config

---

## Component Standardization with CVA

### Current State

Your shadcn `Button` component already uses CVA with four size variants (`default`, `sm`, `lg`, `icon`) and six style variants. This is the correct pattern.

### Recommendation: Tighten Existing Component Sizes

The default shadcn button sizes (`h-10`, `h-9`, `h-11`) do not match your compact guidelines (`h-7` for buttons). Rather than overriding with `className` on every usage, update the CVA definitions in the component source:

```typescript
// components/ui/button.tsx -- update size variants
size: {
  default: "h-7 px-3 text-xs",      // was h-10 px-4 py-2
  sm: "h-6 rounded-md px-2 text-xs", // was h-9 px-3
  lg: "h-9 rounded-md px-6",         // was h-11 px-8
  icon: "h-7 w-7",                   // was h-10 w-10
  "icon-sm": "h-5 w-5",             // new: compact icon buttons
},
```

Apply the same approach to all 16 shadcn components: make the default variants match your compact design guidelines so that bare `<Button>` renders correctly without className overrides.

### Do NOT Fork shadcn Components Further

shadcn components are meant to be modified (they are copied into your project). However, limit changes to:
1. Size/spacing adjustments (tighten to compact guidelines)
2. Default variant changes
3. Adding new variants when needed

Do NOT restructure the component internals, change the Radix primitive usage, or rewrite the component API. This keeps future shadcn updates easy to merge.

---

## tailwind-merge Configuration

### Current State

Your `cn()` utility uses `twMerge(clsx(...))` which is correct. However, `tailwind-merge` does not know about custom font size names like `text-2xs` or `text-sm-caption`.

### Recommendation: Extend tailwind-merge

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["2xs", "xs", "sm-caption", "sm", "base", "lg", "xl", "2xl", "3xl"] },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Why this matters:** Without this extension, `cn("text-sm", "text-xs")` might not correctly resolve the conflict, keeping both classes in the output. The custom config tells tailwind-merge that `text-2xs` through `text-3xl` are all in the same conflict group.

**Confidence:** HIGH -- verified from [tailwind-merge npm docs](https://www.npmjs.com/package/tailwind-merge) and [custom config guide](https://www.adamleithp.com/blog/tailwind-merge-and-custom-classes).

---

## What NOT to Do

### Do NOT Upgrade to Tailwind CSS v4

Tailwind v4 introduces `@theme` (CSS-first configuration) which is elegant for design tokens. However:
- Your project is stable on v3.4.17
- The shadcn component library still primarily targets v3
- `eslint-plugin-tailwindcss` has full v3 support but only beta v4 support
- The migration is non-trivial (config file format change, PostCSS changes)
- No feature in v4 is required for your design system goals

**When to upgrade:** After Tailwind v4 reaches broader ecosystem support (eslint plugin stable, shadcn fully migrated). Not during a design system standardization milestone.

### Do NOT Adopt W3C Design Tokens Format

The W3C Design Tokens specification reached stable v1.0 in October 2025. It is a JSON-based format for cross-tool interoperability. It is relevant if you:
- Share tokens between Figma and code
- Maintain multiple brands/themes
- Use tools like Style Dictionary or Tokens Studio

You do none of these. Your tokens live in `tailwind.config.js` and `index.css`. Adding a JSON token pipeline would be overengineering for a single-app, single-brand project.

### Do NOT Use `@tailwindcss/typography` Plugin

The `@tailwindcss/typography` plugin (`prose` classes) is for styling uncontrolled HTML (e.g., CMS content, markdown output). Your app renders controlled React components where you explicitly set every text style. The plugin would add unused CSS and confuse the design system by introducing a parallel typography scale.

### Do NOT Create a Shared Component Library Package

Your project is a single app, not a monorepo. Extracting components into a package would add build complexity (Vite library mode, package.json exports, versioning) for zero benefit. Keep components in `components/ui/`.

---

## Installation Summary

### New Dependencies

```bash
# Linting (dev only)
npm install -D eslint eslint-plugin-tailwindcss @eslint/js
```

Total new dependencies: 3 packages (dev only). Zero runtime additions.

### Files to Create

| File | Purpose |
|------|---------|
| `eslint.config.js` | ESLint flat config with Tailwind rules |
| `lib/design-tokens.ts` | Design token constants + documentation |

### Files to Modify

| File | Change |
|------|--------|
| `tailwind.config.js` | Override `theme.fontSize`, `theme.fontWeight`, `theme.zIndex`; add semantic spacing |
| `lib/utils.ts` | Extend `tailwind-merge` with custom font-size classes |
| `components/ui/button.tsx` | Tighten size variants to compact defaults |
| `components/ui/*.tsx` | Tighten all shadcn component size defaults |
| `compact-ui-design-guidelines.md` | Update to reference token names |
| `package.json` | Add `lint` and `lint:fix` scripts |

### Files to Migrate (59+ arbitrary values)

| File | Arbitrary Values | Migration |
|------|-----------------|-----------|
| `pages/Settings.tsx` | 14 occurrences | `text-[10px]` -> `text-xs`, `text-[9px]` -> `text-xs`, `text-[11px]` -> `text-sm-caption` |
| `pages/StudySession.tsx` | 13 occurrences | `text-[9px]` -> `text-xs`, `text-[10px]` -> `text-xs` |
| `components/HighlightEditModal.tsx` | 6 occurrences | `text-[9px]` -> `text-xs` |
| `pages/Study.tsx` | 5 occurrences | `text-[10px]` -> `text-xs` |
| Other files | ~21 occurrences | Same pattern |

---

## Alternatives Considered

| Concern | Recommended | Alternative | Why Not |
|---------|-------------|-------------|---------|
| Token enforcement | Tailwind config override | CSS-only custom properties | Tailwind override restricts IntelliSense + generated CSS; CSS vars alone still allow arbitrary utility classes |
| Lint enforcement | eslint-plugin-tailwindcss | Manual code review | Humans miss things; automated enforcement is consistent |
| Component docs | In-code tokens file + markdown | Storybook | Overkill for 16 components, solo/small team |
| Component docs (alt) | -- | Ladle | Still adds build infra for minimal component count |
| Typography scale | Hand-tuned pixel scale | Modular ratio (1.25x) | Modular ratio produces sizes that don't match existing guidelines |
| Token format | Tailwind config JS | W3C Design Tokens JSON | Single app, single brand, no cross-tool sharing needed |

---

## Sources

**HIGH Confidence (Official Documentation):**
- [Tailwind CSS v3 Font Size](https://v3.tailwindcss.com/docs/font-size) -- custom fontSize configuration, tuple syntax
- [Tailwind CSS v3 Theme Configuration](https://v3.tailwindcss.com/docs/theme) -- override vs extend distinction
- [eslint-plugin-tailwindcss GitHub](https://github.com/francoismassart/eslint-plugin-tailwindcss) -- plugin rules and configuration
- [eslint-plugin-tailwindcss no-arbitrary-value rule](https://github.com/francoismassart/eslint-plugin-tailwindcss/blob/master/docs/rules/no-arbitrary-value.md) -- rule documentation
- [CVA official docs](https://cva.style/docs) -- variant patterns and best practices
- [tailwind-merge npm](https://www.npmjs.com/package/tailwind-merge) -- custom config for extended merge

**MEDIUM Confidence (Verified Community Sources):**
- [Subframe: Creating a Type Scale in Tailwind](https://www.subframe.com/blog/creating-a-type-scale-in-tailwind-css) -- custom type scale approach
- [Tailwind-merge custom classes guide](https://www.adamleithp.com/blog/tailwind-merge-and-custom-classes) -- extending twMerge
- [Shadi Sbaih: Building a Scalable Design System with shadcn/ui](https://shadisbaih.medium.com/building-a-scalable-design-system-with-shadcn-ui-tailwind-css-and-design-tokens-031474b03690) -- layered token architecture
- [Storybook 10 vs Ladle comparison](https://dev.to/saswatapal/storybook-10-why-i-chose-it-over-ladle-and-histoire-for-component-documentation-2omn) -- component documentation tool comparison

**LOW Confidence (Single Source / Unverified):**
- [W3C Design Tokens Specification](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/) -- referenced for context on why NOT to adopt yet

---

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Tailwind config override approach | HIGH | Documented in official Tailwind v3 docs |
| ESLint plugin rules | HIGH | Verified from plugin source and npm docs |
| Typography scale values | HIGH | Derived from existing compact-ui-design-guidelines.md |
| tailwind-merge extension | HIGH | Documented in tailwind-merge npm API |
| Storybook/Ladle recommendation | MEDIUM | Opinion based on project size; larger teams may disagree |
| CVA component tightening | HIGH | Standard shadcn customization pattern |
| Migration effort estimate | MEDIUM | Based on grep counts, not tested |
