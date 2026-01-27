# Project Research Summary

**Project:** Evoque v2.0 -- Design System Overhaul
**Domain:** Design system standardization for a React/Tailwind/shadcn app
**Researched:** 2026-01-27
**Confidence:** HIGH

## Executive Summary

Evoque v1.0 shipped a working theme system (OKLCH colors, semantic CSS variables, shadcn/ui primitives) but no governing design system. The result is two coherent design languages coexisting accidentally: a "Compact" language (Study, Settings -- `text-base` titles, `h-7` buttons, tight spacing) and a "Generous" language (Dashboard, Highlights -- `text-3xl` titles, `rounded-xl` containers, `space-y-12` sections). The existing design guide documents Compact but the codebase drifted Generous on the most visible pages. This is the central problem: not missing infrastructure, but an unresolved identity split. The first action must be picking a winner.

The recommended approach is direct, low-infrastructure standardization. The existing Tailwind v3 + CVA + shadcn/ui stack already has enforcement mechanisms -- what is missing is configuration tightening (restrict Tailwind's theme to exact scales), ESLint enforcement (ban arbitrary values), and systematic page-by-page migration. No new runtime dependencies are needed. The only new dev dependency is `eslint-plugin-tailwindcss` for automated enforcement. No Storybook, no W3C Design Tokens, no Tailwind v4 migration, no component library package.

The key risk is breaking working, user-approved UI in pursuit of uniformity. Dashboard, Highlights, and StudySession were all approved during v1.0. Aggressive mechanical find-and-replace could regress these pages. Every page change needs visual verification. The second risk is over-engineering: spending weeks on token pipelines and abstractions when the actual fix is 59 arbitrary font-size values and 56 arbitrary spacing values that need to map to named tokens, plus 5 page headers that need the same component.

## Key Findings

### Recommended Stack
*Full detail: `.planning/research/STACK.md`*

No new runtime dependencies. The fix is configuration, not libraries.

**Three enforcement layers:**
- **Tailwind config restriction:** Override `theme.fontSize` and `theme.fontWeight` to expose ONLY the allowed design tokens. This eliminates wrong choices from IntelliSense and reduces generated CSS.
- **ESLint enforcement:** `eslint-plugin-tailwindcss` with `no-arbitrary-value` rule bans all `text-[10px]`, `w-[400px]` bracket syntax, forcing migration to named tokens.
- **tailwind-merge extension:** Extend `cn()` to recognize custom font-size classes (`text-2xs`, `text-sm-caption`) so class conflict resolution works correctly.

**Critical configuration changes:**
- `tailwind.config.js`: Override `theme.fontSize` (9 named sizes replacing Tailwind's 13 defaults), `theme.fontWeight` (4 values), `theme.zIndex` (7 semantic layers)
- `lib/utils.ts`: Extend `tailwind-merge` with custom font-size class group
- `eslint.config.js`: New file, flat config with Tailwind rules
- `package.json`: Add `lint` and `lint:fix` scripts

**What NOT to do:** Do not upgrade to Tailwind v4, do not adopt W3C Design Tokens, do not add Storybook, do not add `@tailwindcss/typography`.

### Expected Features
*Full detail: `.planning/research/FEATURES.md`*

**Must have (table stakes):**
1. Typography scale -- 6 named sizes with strict context rules (display, title, heading, body, caption, overline)
2. Spacing scale -- 8 semantic tokens on a 4px grid
3. Color usage rules -- ban raw `text-zinc-*`, enforce semantic-only usage
4. Border radius scale -- collapse 5+ values to exactly 3 (sm/md/lg)
5. Shadow scale -- exactly 3 elevations
6. Icon size scale -- exactly 3 sizes (sm=14px, md=16px, lg=20px)
7. CVA component contracts -- Button, Input, Badge, Card with tightened variants
8. Z-index layer system -- 7 semantic layers

**Should have (differentiators):**
9. PageHeader component -- single canonical page layout template
10. Motion tokens -- 3 durations + 3 easings as CSS custom properties
11. Interactive state matrix -- all states defined for every interactive element
12. Empty state pattern -- single canonical template
13. Data table pattern -- single reusable table structure

**Defer (post-milestone):**
- Density context system (document the 2 exceptions instead)
- Storybook (unnecessary for solo developer)
- Token pipeline automation (manual is fine)
- Responsive typography with `clamp()` (fixed sizes appropriate for data-dense app)

### Architecture Approach
*Full detail: `.planning/research/ARCHITECTURE.md`*

Five-layer architecture: CSS Variables (colors in `index.css`) -> Tailwind Config (bindings) -> shadcn Components (primitives with correct defaults) -> App Components (compositions) -> Documentation (governance). Colors stay as CSS variables because they change between themes. Typography and spacing go in Tailwind config because they do not change between themes.

**Major components:**
1. **Token layer** (`index.css` + `tailwind.config.js`) -- restricted theme with only allowed values
2. **Component layer** (`components/ui/*.tsx`) -- shadcn primitives with defaults matching the design system (h-8 buttons, h-8 inputs)
3. **Composition layer** (`PageHeader` + page patterns) -- one new component, documented layout conventions
4. **Governance layer** (`.planning/design-system/`) -- TOKENS.md, COMPONENTS.md, PATTERNS.md, AUDIT-CHECKLIST.md

### Critical Pitfalls

1. **Guide-Reality Divergence** -- The existing guide contradicts the codebase in 5+ dimensions. Must reconcile BEFORE writing any code. Audit every rule against actual usage.
2. **Breaking Working UI** -- Dashboard and StudySession were user-approved. Visual verification after every page change. Maintain a "DO NOT TOUCH" list for intentional deviations.
3. **Cascading Base Component Changes** -- Changing `button.tsx` default from `h-10` to `h-8` affects every Button usage. Audit all usages before changing any base component.
4. **Over-Engineering** -- Building token infrastructure for 7 pages instead of making direct CSS fixes. Prefer `className` changes over new abstractions.
5. **Two Title Systems** -- `text-3xl` (Dashboard/Highlights) vs `text-base` (Study/Settings). Must pick one before any execution starts.

## Implications for Roadmap

### Phase 0: Design Decision Resolution
**Rationale:** The single biggest risk is starting execution without resolving the Compact-vs-Generous split. This is a design DECISION, not a code change.
**Delivers:** Updated design guide with explicit decisions on title size, spacing convention, border radius policy, and a "DO NOT TOUCH" list.
**Addresses:** Pitfall 1 (Guide-Reality Divergence), Pitfall 5 (Two Title Systems)
**Avoids:** Building on an unresolved foundation

### Phase 1: Token Foundation + Tooling
**Rationale:** All enforcement depends on a restricted Tailwind config and ESLint setup. No page migration can be validated until the tooling exists.
**Delivers:** Restricted `tailwind.config.js`, `eslint.config.js`, extended `tailwind-merge`, `lib/design-tokens.ts`.
**Addresses:** Features 1-6 (token scales), Stack Layer 1 + Layer 2
**Avoids:** Pitfall 4 (Over-Engineering) -- only 3 dev dependencies added, zero runtime additions

### Phase 2: Component Defaults + PageHeader
**Rationale:** Component defaults must be fixed before page migration, otherwise every page change fights incorrect defaults.
**Delivers:** Updated `button.tsx`, `input.tsx`, new `page-header.tsx`, normalized import paths.
**Addresses:** Feature 7 (CVA contracts), Feature 9 (PageHeader)
**Avoids:** Pitfall 3 (Cascading Changes) -- audit all usages before changing each component

### Phase 3: Page Migration (Core Pages)
**Rationale:** Pages are the user-facing surface. With tokens defined and components fixed, pages can be migrated systematically.
**Delivers:** Dashboard, Highlights, Study, Settings using canonical typography, spacing, PageHeader, semantic colors. All 59 arbitrary font-sizes replaced.
**Addresses:** Feature 9 (Page Layout Template), arbitrary value elimination
**Avoids:** Pitfall 2 (Breaking Working UI) -- one page per plan, visual verification after each

### Phase 4: Page Migration (Special Pages) + Component Audit
**Rationale:** StudySession and Login have intentional deviations. Modals and complex components depend on page decisions being final.
**Delivers:** StudySession (minimal, preserve touch targets), Login (may keep branding), all modals/popovers aligned.
**Addresses:** Feature 11 (Interactive State Matrix), Feature 13 (Empty State Pattern)
**Avoids:** Pitfall 2 (Breaking Working UI), Pitfall 8 (Accessibility Costs)

### Phase 5: Polish + Documentation + Governance
**Rationale:** Documentation must describe reality, not aspiration. Writing docs last ensures accuracy.
**Delivers:** Motion tokens, TOKENS.md, COMPONENTS.md, PATTERNS.md, AUDIT-CHECKLIST.md. ESLint `no-arbitrary-value` upgraded to `error`.
**Addresses:** Feature 10 (Motion Tokens), Feature 14 (Data Table Pattern)
**Avoids:** Pitfall 7 (Stale Documentation)

### Phase Ordering Rationale

- Phase 0 before everything: the Compact-vs-Generous decision gates all subsequent work
- Phase 1 before Phase 2: token definitions must exist before components reference them
- Phase 2 before Phase 3: component defaults must be correct before pages consume them
- Phase 3 before Phase 4: core pages establish the pattern; special pages adapt
- Phase 5 last: documentation describes what IS, not what WILL BE
- Grouping follows FEATURES dependency chain: primitive tokens -> component contracts -> page compositions -> governance

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Component Defaults):** Needs full cascade audit of every `button.tsx`, `input.tsx`, and `card.tsx` usage before changing defaults
- **Phase 3 (Dashboard Migration):** Chart components and stat cards with custom layouts may need research into standardization approach

Phases with standard patterns (skip research-phase):
- **Phase 0 (Design Decisions):** Pure decision-making, no technical research needed
- **Phase 1 (Token Foundation):** STACK research provides exact config code; mechanical implementation
- **Phase 5 (Documentation):** Standard markdown authoring, no technical complexity

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations verified against official Tailwind v3 docs, eslint-plugin-tailwindcss GitHub, tailwind-merge npm |
| Features | HIGH | Cross-referenced Apple HIG, Carbon, Polaris, Material Design; grounded in codebase audit |
| Architecture | HIGH | Based on direct file-by-file codebase audit; conservative recommendations |
| Pitfalls | HIGH | Every pitfall backed by specific file:line evidence from codebase |

**Overall confidence:** HIGH

### Gaps to Address

- **Which title size wins:** ARCHITECTURE recommends `text-lg font-semibold`. FEATURES recommends 18px. PITFALLS suggests `text-xl` or `text-2xl` as compromise. Must resolve in Phase 0 with user input.
- **Button default height:** STACK says `h-7`, ARCHITECTURE says `h-8` (better touch targets), PITFALLS warns against changing defaults at all. Recommendation: `h-8` with full usage audit first.
- **Config restriction vs documentation:** STACK recommends overriding `theme.fontSize` (restrictive). ARCHITECTURE recommends documentation-only (simpler). Recommendation: go with STACK's restrictive approach -- more durable, zero runtime cost.
- **shadcn generation mismatch:** Two component generations use different patterns (forwardRef vs function, relative vs alias imports). Low-priority cleanup, normalize imports opportunistically.

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v3 Theme Configuration](https://v3.tailwindcss.com/docs/theme)
- [Tailwind CSS v3 Font Size](https://v3.tailwindcss.com/docs/font-size)
- [eslint-plugin-tailwindcss](https://github.com/francoismassart/eslint-plugin-tailwindcss)
- [CVA Official Docs](https://cva.style/docs)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [tailwind-merge npm](https://www.npmjs.com/package/tailwind-merge)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- Evoque codebase audit (direct file reads, all pages and components)

### Secondary (MEDIUM confidence)
- [Typography in Design Systems (EightShapes)](https://medium.com/eightshapes-llc/typography-in-design-systems-6ed771432f1e)
- [Building Scalable Design System with shadcn/ui](https://shadisbaih.medium.com/building-a-scalable-design-system-with-shadcn-ui-tailwind-css-and-design-tokens-031474b03690)
- [Tailwind CSS Best Practices 2025](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns)
- [Carbon Design System Motion](https://carbondesignsystem.com/elements/motion/overview/)
- [Adopting Design Systems (EightShapes)](https://medium.com/eightshapes-llc/adopting-design-systems-71e599ff660a)
- Existing guide: `lbp_diretrizes/compact-ui-design-guidelines.md` v1.1

### Tertiary (LOW confidence)
- [W3C Design Tokens Specification](https://www.w3.org/community/design-tokens/) -- referenced for why NOT to adopt
- Storybook vs Ladle comparison -- opinion-based, project-size dependent

---
*Research completed: 2026-01-27*
*Ready for roadmap: yes*
