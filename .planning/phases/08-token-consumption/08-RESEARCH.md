# Phase 8: Token Consumption - Research

**Researched:** 2026-01-28
**Domain:** Tailwind CSS semantic token migration (spacing, typography, color)
**Confidence:** HIGH

## Summary

Phase 8 closes the "last mile" gap identified in the v2.0 Milestone Audit: the semantic token infrastructure (CSS custom properties, Tailwind config mappings) was built in Phase 4 but never consumed by pages or non-UI components. The token vocabulary is fully defined and correctly wired -- the work is purely mechanical replacement of raw Tailwind classes with their semantic equivalents.

The codebase has 3 categories of raw values to replace: (1) raw numeric spacing (`p-4`, `gap-6`, `mb-3`), (2) raw Tailwind color classes (`bg-blue-500`, `text-green-600`, `text-amber-600`), and (3) raw typography sizes (`text-sm`, `text-xs`, `text-base`, `text-lg`, `text-2xl`, `text-4xl`). All replacements have a 1:1 mapping to existing semantic tokens. No new tokens need to be created.

**Primary recommendation:** Migrate file-by-file across pages and non-UI components, using the mapping tables below. Exclude `components/ui/` (base shadcn components) and known intentional deviations (StudySession rating buttons, StudyHeatmap gradients).

## Standard Stack

No new libraries or tools needed. This phase uses only existing infrastructure:

### Core (Already Exists)
| Layer | File | Purpose | Status |
|-------|------|---------|--------|
| CSS Variables | `index.css` :root / .dark | Token definitions (8 spacing, 6 typography, 7+ color) | Complete |
| Tailwind Config | `tailwind.config.js` | Maps CSS vars to utility classes | Complete |
| Design Guide | `lbp_diretrizes/design-system-guide.md` | Documents all token names and usage | Complete |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `cn()` from `lib/utils.ts` | Tailwind class merging | Already used everywhere; no change needed |

**Installation:** None required. All infrastructure exists.

## Architecture Patterns

### Token Replacement is 1:1 Mechanical

Every raw value maps to exactly one semantic token. There are no judgment calls -- the mapping is deterministic.

### File Scope Definition

**IN SCOPE (must have zero raw values after migration):**
- `pages/*.tsx` -- All 6 pages (Dashboard, Highlights, Study, StudySession, Settings, Login)
- `components/*.tsx` -- All non-UI components (DeckTable, BookContextModal, HighlightEditModal, HighlightHistoryModal, HighlightTableRow, StudyStatusBadge, TagSelector, TagManagerSidebar, Sidebar, BottomNav, DashboardCharts, DeleteBookModal, DeleteCardPopover, EmptyDeckPopover, ErrorBoundary, StudyHeatmap, I18nProvider)

**OUT OF SCOPE (do NOT modify):**
- `components/ui/*.tsx` -- Base shadcn/radix components (button, input, dialog, etc.) use raw values by design; they ARE the component layer
- `components/patterns/*.tsx` -- PageHeader and DataTable already use semantic tokens (verified)
- `tailwind.config.js` -- Infrastructure, not consumer
- `index.css` -- Token definitions, not consumer
- Context providers (AuthContext, StoreContext, SidebarContext, ThemeProvider, ThemeToggle) -- No styling

### Known Intentional Deviations (Do NOT Replace)

These raw values are deliberate design choices documented in the design guide:

| File | Raw Values | Why They Stay |
|------|-----------|---------------|
| `StudySession.tsx` lines 636-660 | `bg-red-500`, `bg-amber-500`, `bg-blue-500`, `bg-green-500` (rating buttons) | SM-2 quality feedback colors -- these are NOT status tokens, they are direct color feedback for Again/Hard/Good/Easy |
| `StudySession.tsx` line 540 | `text-lg md:text-xl font-serif` | Immersive reading experience, intentional deviation |
| `StudySession.tsx` line 586 | `text-lg md:text-xl font-serif` | Same -- immersive note display |
| `StudyHeatmap.tsx` lines 216-219 | `bg-green-200` through `bg-green-600` | Data visualization gradient, not semantic UI |
| `StudyHeatmap.tsx` line 377 | `bg-zinc-900 dark:bg-zinc-100` | Tooltip with inverted colors (component-internal) |
| `StudyHeatmap.tsx` line 385 | `text-zinc-300 dark:text-zinc-600` | Tooltip subtext |
| `StudyHeatmap.tsx` line 317 | `text-orange-500` | Streak icon color (data viz) |
| `ErrorBoundary.tsx` lines 32,42 | `bg-red-50`, `text-red-500`, `text-red-600` | Error display using destructive semantics (could map to destructive tokens) |

### Responsive Breakpoint + Semantic Token Syntax

**CRITICAL:** Tailwind responsive prefixes work WITH semantic spacing tokens. The syntax `sm:p-md` means "at the `sm` breakpoint, apply padding `p-md` (16px)". This works because:
- `sm:` is a responsive prefix (breakpoint at 640px)
- `p-md` is the semantic spacing token mapped in tailwind.config.js

There is NO conflict between `sm:` breakpoint prefix and `sm` spacing token because the spacing token is used as a value suffix (`p-sm` = 12px) while the breakpoint is used as a prefix (`sm:p-4`). The combination `sm:p-sm` is valid and means "at 640px+ breakpoint, apply 12px padding".

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Spacing values | Custom CSS or inline styles | Semantic tokens (`p-md`, `gap-sm`) | Already defined, Tailwind-native |
| Status colors | Ternary logic with raw colors | Semantic tokens (`bg-status-new`) | Light/dark mode handled automatically |
| Tag scope colors | Raw `text-blue-600` / `text-amber-600` | Semantic tokens (`bg-tag-global`, `bg-tag-book`) | Consistent with design system |
| Success/positive states | `text-green-600 dark:text-green-400` | `text-success` | Single token handles both modes |

## Common Pitfalls

### Pitfall 1: Fractional Spacing Values Have No Token
**What goes wrong:** Values like `p-1.5`, `py-0.5`, `gap-0.5`, `space-y-0.5` exist in the codebase but have no exact semantic token equivalent.
**Why it happens:** The semantic spacing grid is on 4px increments (4, 8, 12, 16, 24, 32, 48, 64px). Values like 6px (1.5), 2px (0.5), 10px (2.5), 14px (3.5) fall between grid points.
**How to avoid:** Map to the NEAREST semantic token. Specifically:
- `p-0.5` (2px) -> Keep as `p-0.5` (sub-token, too fine for semantic mapping) OR map to `p-xxs` (4px) if visual difference is negligible
- `p-1` (4px) -> `p-xxs`
- `p-1.5` (6px) -> `p-xs` (8px) -- slight increase, usually fine
- `py-2.5` (10px) -> `py-sm` (12px) -- slight increase
- `p-3.5` (14px) -> `p-md` (16px) -- slight increase
**Warning signs:** If replacing a fractional value changes the layout noticeably, keep the raw value and document why.

### Pitfall 2: Spacing Tokens Inside Component Internals
**What goes wrong:** Replacing values inside very tight UI elements (inline tags, tiny badges, icon-text gaps) with semantic tokens changes the visual density.
**Why it happens:** Fine-grained spacing (`gap-0.5`, `px-1.5 py-0.5`) is intentionally sub-grid for compact elements.
**How to avoid:** For values below `xxs` (4px), specifically `0.5` (2px) spacing, it is acceptable to KEEP raw values. The semantic grid starts at 4px. Sub-4px values are component-internal micro-spacing.

### Pitfall 3: Responsive Pairs Must Be Migrated Together
**What goes wrong:** Migrating `p-4` to `p-md` but forgetting the responsive pair `sm:p-6` -> `sm:p-lg`.
**Why it happens:** Responsive pairs like `px-4 sm:px-6` or `p-3 sm:p-4` are easy to partially migrate.
**How to avoid:** Always search for the full class string and migrate both base and responsive variants together.

### Pitfall 4: Color Replacements Need Dark Mode Awareness
**What goes wrong:** Replacing `text-green-600 dark:text-green-400` with `text-success` but forgetting that the dark variant is automatically handled.
**Why it happens:** Semantic color tokens include dark mode via CSS variables -- no need for `dark:` prefix.
**How to avoid:** When replacing color pairs like `text-green-600 dark:text-green-400`, replace the ENTIRE pair with the single semantic token `text-success`. Delete both the light and dark variants.

### Pitfall 5: StudyStatusBadge Uses Status-Like Colors But Not Status Tokens
**What goes wrong:** Assuming `StudyStatusBadge` should use `bg-status-new/learning/review` tokens.
**Why it happens:** The badge uses `bg-green-50`, `bg-blue-50`, `bg-yellow-50` with matching text/border colors. The `--status-*` tokens are solid fill colors (e.g., `bg-status-review` = solid green), but the badges use light tinted backgrounds.
**How to avoid:** The status tokens are designed for solid background fills (like the status dots in Study page). StudyStatusBadge uses tinted backgrounds (`bg-green-50`) which need a DIFFERENT approach -- either new tinted status tokens or keeping the current pattern. **Recommendation:** Keep StudyStatusBadge as-is OR create additional `bg-status-review/10` opacity variants. Do NOT replace `bg-green-50` with `bg-status-review` (wrong visual).

### Pitfall 6: Tag Colors in TagSelector Use Hover Variants
**What goes wrong:** TagSelector uses `text-blue-600 hover:bg-blue-50` and `text-amber-600 hover:bg-amber-50` for tag color coding.
**Why it happens:** The semantic `bg-tag-global` and `bg-tag-book` tokens are solid fill colors, but TagSelector needs text-color and light-hover variants.
**How to avoid:** For tag-related colors:
- `text-blue-600` (global tag text) -> can map to a custom utility or keep raw
- `hover:bg-blue-50` (global tag hover bg) -> no semantic token exists for tinted hover
- `text-amber-600` (book tag text) -> same issue
- `bg-amber-50 text-amber-700` (book tag badge bg) -> no tinted variant exists
**Recommendation:** These need NEW token definitions for tinted variants, OR keep raw colors in TagSelector. Since Phase 8 should NOT create new tokens (that was Phase 4), keep these as documented exceptions or define them as follow-up work.

## Token Mapping Tables

### Typography Mapping (HIGH confidence)

| Raw Class | Semantic Token | Size | Notes |
|-----------|---------------|------|-------|
| `text-xs` | `text-caption` | 12px | Most common replacement |
| `text-sm` | `text-body` | 14px | Second most common |
| `text-base` | `text-body` or keep | 16px | `text-body` is 14px; `text-base` is 16px. No exact match. See below. |
| `text-lg` | `text-heading` | 18px | Exact match |
| `text-xl` | (no token) | 20px | Gap between heading (18px) and title (30px). Keep or use `text-heading`. |
| `text-2xl` | (no token) | 24px | Same gap. Keep for special display cases. |
| `text-4xl` | (no token) | 36px | Only in StudySession completion stats. Keep. |

**Key decision for `text-base` (16px):** There is no 16px semantic token. `text-body` is 14px (text-sm equivalent). Options:
1. Map `text-base` -> `text-body` (slight size decrease 16px -> 14px)
2. Keep `text-base` as-is (it falls between body and heading)
3. Create a new token

**Recommendation:** Where `text-base` is used for body-like content, map to `text-body`. Where it's used as a subtitle/emphasis, keep `text-base` as an exception. The occurrences:
- `StudySession.tsx:282` "loading" message -> `text-body` (14px is fine for a loading message)
- `StudySession.tsx:336` "error" message -> `text-body`
- `StudySession.tsx:531` textarea font size -> keep `text-base` (input fields need readable size)
- `Sidebar.tsx:50` logo text -> keep `text-base` (brand text, intentional)
- `HighlightEditModal.tsx:99` dialog title -> `text-heading` (it's already a heading role)
- `TagManagerSidebar.tsx:262` sheet title -> `text-heading`

### Spacing Mapping (HIGH confidence)

| Raw Value | Pixels | Semantic Token | Token Pixels | Delta |
|-----------|--------|----------------|-------------|-------|
| `0.5` | 2px | Keep raw | - | Sub-grid micro-spacing |
| `1` | 4px | `xxs` | 4px | Exact |
| `1.5` | 6px | `xs` | 8px | +2px (acceptable) |
| `2` | 8px | `xs` | 8px | Exact |
| `2.5` | 10px | `sm` | 12px | +2px (acceptable) |
| `3` | 12px | `sm` | 12px | Exact |
| `4` | 16px | `md` | 16px | Exact |
| `5` | 20px | `lg` | 24px | +4px (verify visually) |
| `6` | 24px | `lg` | 24px | Exact |
| `7` | 28px | `xl` | 32px | +4px (verify visually) |
| `8` | 32px | `xl` | 32px | Exact |
| `10` | 40px | `2xl` | 48px | +8px (verify visually) |
| `12` | 48px | `2xl` | 48px | Exact |
| `16` | 64px | `3xl` | 64px | Exact |
| `20` | 80px | Keep raw | - | Above token scale |

**Safe exact matches (zero visual change):** 1->xxs, 2->xs, 3->sm, 4->md, 6->lg, 8->xl, 12->2xl, 16->3xl

**Near matches (slight visual change, usually acceptable):** 1.5->xs, 2.5->sm, 5->lg

**No match (keep raw):** 0.5, values above 64px, and non-standard responsive values like `py-20` (Dashboard loading spinner padding)

### Color Mapping (HIGH confidence)

**Status Colors (Study card states):**
| Raw | Semantic | Context |
|-----|----------|---------|
| `bg-blue-500` | `bg-status-new` | Status indicator dots/fills |
| `bg-amber-500` | `bg-status-learning` | Status indicator dots/fills |
| `bg-green-500` | `bg-status-review` | Status indicator dots/fills |
| `text-blue-600` (in deck stats) | Consider keeping | DeckTable stat color |
| `text-amber-600` (in deck stats) | Consider keeping | DeckTable stat color |
| `text-green-600` (in deck stats) | Consider keeping | DeckTable stat color |
| `text-blue-300 dark:text-blue-700` | Consider `text-status-new` variant | Study page stats (inverted context) |

**Tag Colors:**
| Raw | Semantic | Context |
|-----|----------|---------|
| `bg-blue-500 dark:bg-blue-600 text-white` | `bg-tag-global text-status-foreground` | Tag fill badges |
| `bg-amber-500 dark:bg-amber-600 text-white` | `bg-tag-book text-status-foreground` | Tag fill badges |
| `text-amber-600` | No exact token | Tag text-only references |
| `text-amber-500` | No exact token | Tag icon coloring |
| `text-blue-600 hover:bg-blue-50` | No exact token | Tag selector hover |

**Success/Positive:**
| Raw | Semantic | Context |
|-----|----------|---------|
| `text-green-600 dark:text-green-400` | `text-success` | Import success messages, copy confirmation |
| `bg-green-500/10 border-green-500/30` | No opacity token | Success alert background |
| `hover:text-green-600` | No hover token | Copy button hover |

**Error/Destructive:**
| Raw | Semantic | Context |
|-----|----------|---------|
| `text-red-500` | `text-destructive` | Error icons |
| `text-red-600` | `text-destructive` | Error text |
| `bg-red-50` | `bg-destructive/10` | Error background (use opacity) |
| `bg-red-500 dark:bg-red-600` | Keep raw (rating button) | Intentional deviation |

**Avatar/Brand:**
| Raw | Semantic | Context |
|-----|----------|---------|
| `bg-blue-600` | `bg-primary` | Avatar fallback circle in Settings + Sidebar |

### Spacing Occurrence Inventory (Per File)

**Pages:**
| File | Est. Raw Spacing | Est. Raw Typography | Est. Raw Colors | Complexity |
|------|-----------------|--------------------|-----------------|-|
| `Dashboard.tsx` | ~15 | ~5 | 0 | Low |
| `Highlights.tsx` | ~40 | ~20 | ~5 | High |
| `Study.tsx` | ~15 | ~10 | ~5 | Medium |
| `StudySession.tsx` | ~35 | ~30 | ~15 | Very High (many deviations) |
| `Settings.tsx` | ~50 | ~45 | ~5 | Very High (most raw values) |
| `Login.tsx` | ~20 | ~8 | 0 | Medium |

**Components (non-UI):**
| File | Est. Raw Spacing | Est. Raw Typography | Est. Raw Colors | Complexity |
|------|-----------------|--------------------|-----------------|-|
| `DeckTable.tsx` | ~5 | ~12 | ~5 | Medium |
| `BookContextModal.tsx` | ~10 | ~8 | 0 | Medium |
| `HighlightEditModal.tsx` | ~8 | ~10 | 0 | Medium |
| `HighlightHistoryModal.tsx` | ~5 | ~8 | 0 | Low |
| `HighlightTableRow.tsx` | ~8 | ~5 | 0 | Low |
| `StudyStatusBadge.tsx` | ~2 | 0 | ~12 | Medium (color-heavy) |
| `TagSelector.tsx` | ~15 | ~15 | ~10 | High (tag colors) |
| `TagManagerSidebar.tsx` | ~15 | ~12 | ~5 | High |
| `Sidebar.tsx` | ~8 | ~5 | ~2 | Medium |
| `BottomNav.tsx` | ~3 | ~1 | 0 | Low |
| `DashboardCharts.tsx` | ~3 | ~2 | ~15 (hsl) | Special (hsl bug is Phase 10) |
| `DeleteBookModal.tsx` | ~3 | ~2 | 0 | Low |
| `DeleteCardPopover.tsx` | ~1 | ~3 | 0 | Low |
| `EmptyDeckPopover.tsx` | ~1 | ~2 | ~1 | Low |
| `ErrorBoundary.tsx` | ~3 | ~3 | ~3 | Low |
| `StudyHeatmap.tsx` | ~5 | ~3 | ~8 | Medium (deviations) |
| `I18nProvider.tsx` | 0 | ~1 | 0 | Trivial |

## Code Examples

### Spacing Replacement Pattern
```tsx
// BEFORE: Raw numeric spacing
<div className="p-4 space-y-3">
  <h2 className="mb-2">Title</h2>
  <p className="mt-6">Content</p>
</div>

// AFTER: Semantic spacing tokens
<div className="p-md space-y-sm">
  <h2 className="mb-xs">Title</h2>
  <p className="mt-lg">Content</p>
</div>
```

### Typography Replacement Pattern
```tsx
// BEFORE: Raw text sizes
<h2 className="text-xs font-semibold text-muted-foreground">Section</h2>
<p className="text-sm text-foreground">Body text</p>
<span className="text-xs text-muted-foreground">Metadata</span>

// AFTER: Semantic typography tokens
<h2 className="text-caption font-semibold text-muted-foreground">Section</h2>
<p className="text-body text-foreground">Body text</p>
<span className="text-caption text-muted-foreground">Metadata</span>
```

### Color Replacement Pattern
```tsx
// BEFORE: Raw Tailwind colors with dark mode
<span className="text-green-600 dark:text-green-400">Success!</span>
<div className="bg-blue-600">Avatar</div>
<span className="bg-blue-500 dark:bg-blue-600 text-white">Global Tag</span>

// AFTER: Semantic color tokens (dark mode automatic)
<span className="text-success">Success!</span>
<div className="bg-primary">Avatar</div>
<span className="bg-tag-global text-status-foreground">Global Tag</span>
```

### Responsive Spacing Replacement
```tsx
// BEFORE: Responsive raw values
<div className="px-4 sm:px-6">
  <div className="p-3 sm:p-4">

// AFTER: Responsive semantic tokens
<div className="px-md sm:px-lg">
  <div className="p-sm sm:p-md">
```

### StudySession Status Dots (Replace)
```tsx
// BEFORE: Raw colors for status indicator
const getCardStatus = (card: StudyCard) => {
    return { status: 'new', color: 'bg-blue-500', label: t('status.new') };
    return { status: 'learning', color: 'bg-amber-500', label: t('status.learning') };
    return { status: 'review', color: 'bg-green-500', label: t('status.review') };
};

// AFTER: Semantic status tokens
const getCardStatus = (card: StudyCard) => {
    return { status: 'new', color: 'bg-status-new', label: t('status.new') };
    return { status: 'learning', color: 'bg-status-learning', label: t('status.learning') };
    return { status: 'review', color: 'bg-status-review', label: t('status.review') };
};
```

### StudySession Rating Buttons (DO NOT Replace)
```tsx
// These stay as raw colors -- intentional deviation (SM-2 quality feedback)
<button className="bg-red-500 dark:bg-red-600 ...">Again (1)</button>
<button className="bg-amber-500 dark:bg-amber-600 ...">Hard (2)</button>
<button className="bg-blue-500 dark:bg-blue-600 ...">Good (3)</button>
<button className="bg-green-500 dark:bg-green-600 ...">Easy (4)</button>
```

## State of the Art

| Old Approach (current) | Target Approach (Phase 8) | Impact |
|------------------------|--------------------------|--------|
| `p-4 gap-6 mb-3` | `p-md gap-lg mb-sm` | Semantic, themeable spacing |
| `text-sm text-xs` | `text-body text-caption` | Named typography scale |
| `bg-blue-500 text-white` | `bg-status-new text-status-foreground` | Dark mode automatic |
| `text-green-600 dark:text-green-400` | `text-success` | Single class, both modes |
| Manual light+dark color pairs | Single semantic token | Reduced class count |

## Open Questions

### 1. What to do with `text-base` (16px)?
- **What we know:** No semantic token maps to 16px. `text-body` is 14px, `text-heading` is 18px.
- **What's unclear:** Whether a 16px token should be created or if `text-body` is close enough.
- **Recommendation:** Map case-by-case: loading/error messages -> `text-body`, input fields -> keep `text-base`, dialog titles -> `text-heading`.

### 2. What to do with `text-xl` (20px), `text-2xl` (24px), `text-4xl` (36px)?
- **What we know:** These appear only in StudySession (completion stats, serif reading text). No tokens exist for these sizes.
- **What's unclear:** Whether they should be mapped to existing tokens or kept as intentional deviations.
- **Recommendation:** Keep as intentional deviations. StudySession is a special immersive page. Document in deviations list.

### 3. Tag and status TINTED backgrounds (`bg-blue-50`, `bg-green-50`)
- **What we know:** StudyStatusBadge and TagSelector use tinted (10% opacity) backgrounds, not solid fills. Semantic tokens (`bg-status-new`, `bg-tag-global`) are SOLID colors.
- **What's unclear:** Whether to create new tinted tokens (`bg-status-new/10`) or keep raw colors.
- **Recommendation:** Use Tailwind opacity modifier: `bg-status-new/10` instead of `bg-blue-50`. Test visually since oklch opacity != Tailwind palette tinting. If visual mismatch, keep raw values and document.

### 4. DeckTable stat text colors (`text-blue-600`, `text-amber-600`, `text-green-600`)
- **What we know:** Used for new/learning/review count numbers. These are text-colored, not background-filled.
- **What's unclear:** Whether `text-status-new` etc. would work for text color (tokens designed for `bg-` primarily).
- **Recommendation:** Test `text-status-new` / `text-status-learning` / `text-status-review` -- if the Tailwind config allows `text-status-*` alongside `bg-status-*` (it should, since colors are defined under `colors.status.*`), use them.

### 5. Micro-spacing below 4px (`gap-0.5`, `py-0.5`, `space-y-0.5`)
- **What we know:** ~20 instances of sub-4px spacing across components. No semantic token for 2px.
- **What's unclear:** Whether these should map to `xxs` (4px, doubling the value) or stay raw.
- **Recommendation:** Keep sub-4px spacing raw. Document as "micro-spacing" exception. The semantic grid starts at 4px.

### 6. hsl(var(--...)) wrapping oklch values (DashboardCharts, HighlightEditModal, HighlightHistoryModal)
- **What we know:** This is a functional color rendering bug -- hsl() wrapping oklch() values.
- **What's unclear:** Whether to fix in Phase 8 or defer to Phase 10.
- **Recommendation:** Defer to Phase 10 (Bug Fixes). Phase 8 scope is token CONSUMPTION, not bug fixes. These are JavaScript/Recharts inline styles, not Tailwind classes.

## Verification Strategy

After each file migration, verify with grep patterns:

```bash
# Check for remaining raw typography in pages
grep -n "text-\(sm\|xs\|base\|lg\|xl\|2xl\|3xl\|4xl\)" pages/*.tsx

# Check for remaining raw numeric spacing in pages
grep -nP "\b(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-[xy])-[0-9]" pages/*.tsx

# Check for remaining raw colors in pages
grep -nP "\b(text|bg|border)-(zinc|gray|red|amber|blue|green|yellow|orange)-[0-9]+" pages/*.tsx

# Same for components (excluding ui/)
grep -n "text-\(sm\|xs\|base\|lg\|xl\)" components/*.tsx
```

**Expected exceptions (will still appear in grep but are intentional):**
- StudySession rating button colors (bg-red/amber/blue/green-500)
- StudySession serif text sizes (text-lg md:text-xl)
- StudySession completion stats (text-2xl, text-4xl)
- StudyHeatmap gradient + tooltip colors
- Sub-4px micro-spacing (gap-0.5, py-0.5, etc.)

## Sources

### Primary (HIGH confidence)
- `tailwind.config.js` -- Verified all token mappings (spacing, fontSize, colors)
- `index.css` -- Verified all CSS custom property definitions and values
- `lbp_diretrizes/design-system-guide.md` -- Verified token reference tables
- `.planning/v2.0-MILESTONE-AUDIT.md` -- Verified gap analysis (TOKENS-02 BROKEN, TOKENS-08 BROKEN)
- `.planning/ROADMAP.md` -- Verified Phase 8 success criteria

### Secondary (MEDIUM confidence)
- Grep results across all page and component files -- Full inventory of raw values

### Tertiary (LOW confidence)
- Mapping of fractional values (1.5, 2.5, 3.5) to nearest semantic tokens -- visual impact unverified
- `bg-status-new/10` opacity approach for tinted backgrounds -- untested with oklch values

## Metadata

**Confidence breakdown:**
- Token vocabulary: HIGH -- verified directly from tailwind.config.js and index.css
- Typography mapping: HIGH -- all raw sizes have clear semantic equivalents (with documented exceptions)
- Spacing mapping: HIGH -- exact matches for standard values, documented approach for fractional values
- Color mapping: HIGH for solid fills, MEDIUM for tinted/opacity variants
- File scope: HIGH -- verified all files via glob, checked deviations against design guide
- Pitfalls: HIGH -- identified from direct code inspection

**Research date:** 2026-01-28
**Valid until:** Indefinite (tokens are stable infrastructure, already built)
