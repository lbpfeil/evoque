# Research Summary

**Project:** evoque (Kindle Highlights Manager)
**Domain:** UI Redesign - Warm/Friendly Aesthetic
**Researched:** 2026-01-19
**Confidence:** HIGH

---

## Key Findings

### Cross-Cutting Discovery: Infrastructure Is Ready, Execution Is Fragmented

All four research dimensions reveal the same pattern: the project has solid foundations (OKLCH variables, shadcn setup, Tailwind dark mode config) but inconsistent implementation (hardcoded colors, missing ThemeProvider, duplicate CSS blocks). The redesign is primarily about **unification and polish**, not starting from scratch.

### The HSL/OKLCH Mismatch Is Blocking Everything

The most critical finding: `tailwind.config.js` wraps colors in `hsl()` but `index.css` uses OKLCH values. This causes colors to silently fail. **This must be fixed before any other work.**

---

## Stack Recommendations

### From STACK.md

The existing stack is well-suited for the redesign. No major technology changes needed.

**Install these shadcn components:**
```bash
npx shadcn@latest add card tabs dropdown-menu badge tooltip scroll-area select checkbox switch -y
```

**Create these files:**
- `components/ThemeProvider.tsx` - Custom theme context (NOT next-themes for Vite SPA)
- `components/ModeToggle.tsx` - Theme switcher UI

**Key decision:** Use custom ThemeProvider over next-themes. The STACK.md research confirms next-themes is optimized for Next.js SSR concerns that don't apply to Vite SPAs.

**Do not change:**
- Keep Inter font (warm it up with styling, not font swap)
- Keep stone base color
- Keep radix-vega style
- Keep lucide icons

---

## Design Direction

### From FEATURES.md

**What makes UI feel warm/friendly:**

| Category | Cold (Avoid) | Warm (Target) |
|----------|--------------|---------------|
| Corners | 0-4px radius | 8-12px radius |
| Backgrounds | Pure white/black | Cream/warm charcoal |
| Shadows | Hard, dark | Soft, warm-tinted |
| Transitions | Instant | 150-300ms ease-out |
| Spacing | Cramped | Generous (8px grid) |

**Quick wins for immediate impact:**
1. Increase `--radius` from 0.45rem to 0.75rem
2. Add cream tint to light mode backgrounds
3. Slow down all transitions to 150-200ms
4. Increase padding by 25-50%

**Typography strategy (Option C from research):**
- Keep Inter but with warmer styling
- Increase letter-spacing slightly (+0.01em)
- Use heavier weights for headings (600-700)
- Line-height: 1.6 for body, 1.2-1.3 for headings

**Implementation phases from FEATURES.md:**
1. Phase 1: Color foundation (immediate visual impact)
2. Phase 2: Polish layer (transitions, hover states, shadows)
3. Phase 3: Delight layer (celebrations, loading states, empty states)

---

## Architecture

### From ARCHITECTURE.md

**Theme system architecture:**

```
App.tsx
  +-- ErrorBoundary
        +-- AuthProvider
              +-- ThemeProvider  <-- NEW
                    +-- ProtectedApp
                          +-- HashRouter
                                +-- StoreProvider
                                      +-- AppLayout
```

**ThemeProvider responsibilities:**
1. Manage theme state (light/dark/system)
2. Persist to localStorage (`evoque-theme` key)
3. Apply `.dark` class to `<html>` element
4. Listen to OS theme changes via matchMedia
5. Expose `useTheme()` hook

**Critical FOUC prevention:**
Add blocking script to `index.html` before React loads:
```html
<script>
  (function() {
    const theme = localStorage.getItem('evoque-theme');
    if (theme === 'dark' || (!theme && matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

**Component organization:**
```
components/
  ThemeProvider.tsx    # Context provider
  ModeToggle.tsx       # Theme switcher UI
  ui/                  # shadcn components
```

---

## Watch Out For

### From PITFALLS.md

**Critical (Phase 1 blockers):**

1. **HSL/OKLCH mismatch** - `tailwind.config.js` uses `hsl(var(--primary))` but CSS vars are OKLCH. Fix: Remove `hsl()` wrappers or use direct var references.

2. **Missing ThemeProvider** - CSS variables exist but no JS to toggle `.dark` class. Fix: Create ThemeProvider before any UI work.

3. **Duplicate @layer base blocks** - index.css has two `@layer base` blocks. Fix: Consolidate into single block.

4. **Hardcoded colors everywhere** - Components use `bg-zinc-50`, `text-zinc-900` instead of `bg-background`, `text-foreground`. Fix: Systematic audit and replacement.

**Moderate (Phase 2 concerns):**

5. **Theme flash on load (FOUC)** - Page loads light then flashes dark. Fix: Blocking inline script in index.html.

6. **Foreground color mismatches** - Using `bg-primary` without `text-primary-foreground`. Fix: Always pair backgrounds with matching foregrounds.

7. **Relative import paths** - shadcn components using `../../lib/utils`. Fix: Use `@/lib/utils` aliases consistently.

**Mobile (Phase 3 polish):**

8. **Missing theme-color meta** - Browser chrome doesn't match app theme. Fix: Add/update `<meta name="theme-color">`.

9. **Touch target sizes** - Desktop-optimized buttons too small for mobile. Fix: 44x44px minimum targets.

---

## Implementation Priority

Based on combined research, execute in this order:

### Phase 1: Foundation Fix (Do First)

**What:** Fix the broken infrastructure before any visual changes.

**Tasks:**
1. Fix tailwind.config.js HSL/OKLCH mismatch
2. Consolidate duplicate @layer base blocks in index.css
3. Create ThemeProvider component
4. Add FOUC prevention script to index.html
5. Wrap app with ThemeProvider
6. Install additional shadcn components (card, tabs, dropdown-menu, badge, tooltip, switch)

**Avoids pitfalls:** #1, #3, #4, #5 from PITFALLS.md

**Why first:** Nothing else works until colors render correctly and theme can toggle.

---

### Phase 2: Color Warmth (Visual Impact)

**What:** Apply warm color palette across both themes.

**Tasks:**
1. Update :root CSS variables with warm light palette
2. Update .dark CSS variables with warm dark palette
3. Increase --radius to 0.75rem
4. Audit and replace hardcoded colors in components:
   - `bg-zinc-*` -> `bg-background`/`bg-muted`/`bg-card`
   - `text-zinc-*` -> `text-foreground`/`text-muted-foreground`
   - `border-zinc-*` -> `border-border`

**Uses:** OKLCH values from FEATURES.md color recommendations

**Why second:** High visual impact, validates foundation work.

---

### Phase 3: Component Migration (Systematic)

**What:** Convert existing components to use shadcn patterns consistently.

**Tasks:**
1. Add ModeToggle to settings/sidebar
2. Convert Dashboard cards to shadcn Card
3. Add proper tabs navigation
4. Add badges for tags/status
5. Add tooltips for accessibility

**Approach:** One component at a time, audit behavior before replacing, commit after each.

**Avoids pitfall:** #11 (all-or-nothing migration)

---

### Phase 4: Polish Layer (Delight)

**What:** Add transitions, hover states, micro-interactions.

**Tasks:**
1. Add 150-200ms transitions to all interactive elements
2. Implement hover lift effect on cards
3. Add warm-tinted shadows
4. Increase spacing throughout (8px grid)
5. Add celebration animations on actions
6. Mobile theme-color meta tag
7. Touch target size audit

**Addresses:** "Professional vs Amateur" checklist from FEATURES.md

---

### Research Flags

**Needs deeper research:**
- None - all phases have well-documented patterns

**Standard patterns (skip phase research):**
- All phases use established shadcn/ui patterns
- Color values provided in research files
- ThemeProvider code provided in ARCHITECTURE.md

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official shadcn docs verified, existing setup analyzed |
| Features | HIGH | Multiple design sources cross-referenced |
| Architecture | HIGH | Official Vite pattern from shadcn docs |
| Pitfalls | HIGH | Codebase-specific issues identified via analysis |

**Overall confidence:** HIGH

### Gaps to Address

1. **Sidebar styling** - CSS has sidebar variables but unclear if sidebar component will be redesigned
2. **Chart colors** - May need refinement to match warm palette
3. **Progress bar animation** - Custom animation may need warm colors
4. **next-themes vs custom** - ARCHITECTURE.md recommends next-themes but STACK.md recommends custom. Resolution: Use custom for Vite SPA (STACK.md rationale is specific to project setup)

---

## Sources

### Primary (HIGH confidence)
- shadcn/ui Theming documentation
- shadcn/ui Dark Mode for Vite guide
- shadcn/ui Component documentation
- Tailwind CSS dark mode documentation

### Secondary (MEDIUM confidence)
- tweakcn theme editor
- Learn UI Design blog
- Interaction Design Foundation

### Tertiary (LOW confidence)
- 2025 color trend articles (verify currency)

---

*Research completed: 2026-01-19*
*Ready for roadmap: yes*
