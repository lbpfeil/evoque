# Pitfalls Research: Design System Standardization

**Domain:** Enforcing consistency in an existing React/Tailwind/shadcn app
**Researched:** 2026-01-27
**Confidence:** HIGH (verified against codebase analysis + community sources)
**Context:** v2.0 milestone -- Evoque already shipped v1.0 (theme system, semantic tokens). Now standardizing typography, spacing, component usage, and layout patterns across 7 pages and ~30 components.

---

## Critical Pitfalls

Mistakes that cause regressions, wasted effort, or undermine the entire standardization goal.

### Pitfall 1: The Guide-Reality Divergence (Already Present)

**What goes wrong:** The existing design guide (compact-ui-design-guidelines.md, 726 lines) specifies rules that the codebase already violates. New work follows the guide while old code follows its own patterns, creating TWO sources of inconsistency instead of one.

**Evidence from codebase (verified):**

| Guide says | Codebase actually does | Files |
|------------|----------------------|-------|
| Page titles: `text-lg font-semibold` | Dashboard: `text-3xl font-bold`, Highlights: `text-3xl font-bold`, Study: `text-base font-semibold`, Settings: `text-base font-semibold` | Dashboard.tsx:46, Highlights.tsx:225, Study.tsx:44, Settings.tsx:283 |
| Buttons: `h-7 px-3 text-xs` | Button.tsx defaults to `h-10 px-4 py-2` | components/ui/button.tsx:23 |
| Inputs: `h-7 text-sm` | Input.tsx defaults to `h-10 px-3 py-2 text-sm` | components/ui/input.tsx:14 |
| Border radius: `rounded` (4px) | Login: `rounded-2xl`, `rounded-lg`; Card.tsx: `rounded-xl`; Highlights: `rounded-xl`, `rounded-lg` | Login.tsx:44, card.tsx:14, Highlights.tsx:241 |
| Icons: `w-3 h-3` (12px) | Many places use `w-4 h-4`, `w-3.5 h-3.5` | Various |

**Why it happens:** The guide was written from TagManagerSidebar and Study page (two compact components), then generalized as the standard. But Dashboard, Highlights, and Login were designed with completely different spacing philosophy (generous, modern). Nobody reconciled the two.

**Consequences:**
- Developers see both patterns and pick whichever feels right
- Any AI agent given the guide will produce code that clashes with existing pages
- The guide becomes "aspirational" rather than "descriptive"

**Prevention:**
1. BEFORE writing any code: decide whether the guide should change to match the codebase, or the codebase should change to match the guide. Do not proceed without this decision.
2. Update the guide FIRST to reflect the ACTUAL target state
3. For any value where "compact guide" and "current pages" disagree, make an explicit decision and document it

**Detection:** Run a comparison audit: for each rule in the guide, grep for violations. If more than 50% of instances violate the rule, the rule is wrong, not the code.

**Which phase should address:** Phase 0 / Pre-work -- this must be resolved before any execution starts

---

### Pitfall 2: Breaking Working UI to Achieve Consistency

**What goes wrong:** Standardizing spacing/typography on a page that already looks and works well, introducing visual regressions that users notice. The app gets WORSE during a "polish" milestone.

**Evidence from codebase (verified):**
- Highlights.tsx has a polished toolbar with `rounded-xl`, `shadow-sm`, hover effects, animation -- it works beautifully as-is
- StudySession.tsx has 710 lines of carefully tuned layout with user-approved sizing for touch targets (`min-h-[48px]`), SRS color coding, and font-serif preservation
- Dashboard.tsx uses `text-3xl` headers with `space-y-12` -- generous and readable
- All these were USER APPROVED in v1.0 phases (documented in verification reports)

**Why it happens:**
- Obsessive consistency treats "uniformity" as the goal, not "quality"
- Mechanical find-and-replace changes without visual review
- The developer cannot see the page while making CSS changes in an agent workflow

**Consequences:**
- User says "it looked better before" -- now you need to revert and re-do
- Touch targets shrink below usable size (h-7 = 28px, but WCAG recommends 44px minimum for mobile)
- Study session card display loses its carefully balanced typography
- Time spent making things worse, then fixing them back

**Prevention:**
1. "If it ain't broke, don't fix it" as a gating principle -- for each page, ask: is the current state actually bad?
2. Take visual screenshots BEFORE any changes (or require the user to confirm the target)
3. Never change more than one page per plan without user review
4. Preserve intentional deviations: StudySession touch targets, SRS colors, font-serif on cards
5. Make a "DO NOT TOUCH" list for elements that were explicitly user-approved

**Detection:** After any change, the user should visually verify before proceeding to the next page. Any "batch apply" approach without verification is a red flag.

**Which phase should address:** Every phase -- verification after each plan

---

### Pitfall 3: Modifying shadcn Base Components Without Understanding Cascade

**What goes wrong:** Changing `button.tsx` defaults from `h-10` to `h-7` to match the design guide, which breaks every existing Button usage that relies on the default size.

**Evidence from codebase (verified):**
- `button.tsx` default size: `h-10 px-4 py-2` (shadcn standard)
- `input.tsx` default height: `h-10` (shadcn standard)
- Card.tsx uses `rounded-xl`, `gap-6`, `py-6` (shadcn v2 standard)
- These defaults are used by: BookContextModal, HighlightEditModal, HighlightHistoryModal, DeleteBookModal, ErrorBoundary, Login, and others
- Some components (Settings, TagManagerSidebar) override with `h-7` via className

**Why it happens:**
- Guide says "buttons are h-7" so developer changes the base component
- Seems efficient: change once, fix everywhere
- No automated tests to catch visual regressions

**Consequences:**
- Login page buttons shrink to tiny size
- Modal action buttons become cramped
- ErrorBoundary "Refresh Page" button becomes hard to click
- Every place that relied on default sizing breaks at once

**Prevention:**
1. NEVER modify shadcn base component defaults to match the "compact" guide
2. Instead, add new size variants: `xs: "h-7 px-3 text-xs"` in button.tsx
3. Apply the compact variant per-use-site, not globally
4. Or: create wrapper components like `<CompactButton>` that apply the compact classes
5. Audit all usages of a component BEFORE changing its defaults

**Detection:** Before modifying any ui/ component, grep for all imports and usages. Count them. If more than 3 files import it, modifying defaults is high-risk.

**Which phase should address:** Phase addressing component standardization -- add variants, do not change defaults

---

### Pitfall 4: Over-Engineering a Token System for 7 Pages

**What goes wrong:** Spending weeks building a sophisticated design token pipeline, Tailwind plugin, CSS custom property hierarchy, or component variant matrix for an app with 7 pages and one developer.

**Evidence of risk:**
- The existing `compact-ui-design-guidelines.md` is already 726 lines for a 7-page app
- The tailwind.config.js already has semantic color tokens, font families, and animation definitions
- CSS custom properties already handle theming (v1.0 shipped this)
- The app has ~30 components, not 300

**Why it happens:**
- Design system literature is written for large teams (10+ developers) and large apps (50+ pages)
- "Best practices" from IBM Carbon, Material Design, or Atlassian don't scale DOWN
- Over-engineering feels productive: you're building infrastructure instead of fixing inconsistencies
- AI agents will happily build elaborate abstractions if not constrained

**Consequences:**
- Weeks of work that doesn't visually change anything
- Abstraction layers that only one person uses
- More code to maintain, not less
- The actual inconsistencies (title sizes, spacing) remain unfixed

**Prevention:**
1. Set a strict budget: the entire v2.0 should take LESS time than v1.0 (which was 66 minutes total)
2. Prefer direct CSS changes over new abstractions
3. No new Tailwind plugins, no new CSS custom property layers, no Storybook setup
4. The test: "Can I fix this with a className change?" If yes, do that. Don't create infrastructure.
5. Only build abstractions when you find yourself fixing the SAME inconsistency in 5+ places

**Detection:** If a plan involves creating new files (utilities, helpers, config extensions) rather than editing existing components, question whether it's necessary.

**Which phase should address:** Roadmap design -- keep phases focused on direct fixes, not infrastructure

---

## Moderate Pitfalls

Mistakes that cause delays, confusion, or accumulated technical debt.

### Pitfall 5: Two Title Systems Coexisting Without Resolution

**What goes wrong:** Some pages use "compact" titles (text-base, Study/Settings) and some use "generous" titles (text-3xl, Dashboard/Highlights). Standardization picks one but doesn't convert all, leaving a permanent split.

**Evidence from codebase (verified):**
```
Dashboard.tsx:46   text-3xl font-bold tracking-tight
Highlights.tsx:225 text-3xl font-bold tracking-tight
Study.tsx:44       text-base font-semibold
Settings.tsx:283   text-base font-semibold
Login.tsx:40       text-2xl font-bold tracking-tight (brand, different context)
```

Two distinct camps: "generous" pages (Dashboard, Highlights) and "compact" pages (Study, Settings). Both look intentional. The existing guide says `text-lg font-semibold` -- which matches NEITHER camp.

**Why it happens:**
- Dashboard and Highlights were redesigned with modern generous spacing
- Study and Settings follow the compact sidebar aesthetic
- The guide was written from the compact components
- Nobody reconciled after Dashboard/Highlights got their redesign

**Consequences:**
- Navigating from Dashboard (text-3xl) to Study (text-base) feels jarring
- New pages: which pattern to follow?
- Guide is useless as reference because neither camp follows it

**Prevention:**
1. Pick ONE title scale for ALL pages. Recommend: `text-xl font-semibold` as a compromise, or `text-2xl font-bold` if the generous style is preferred
2. Apply it to all 5 non-login pages in a single plan
3. Update the guide to match the decision
4. Login is exempt (brand page, different context)

**Detection:** Grep `<h1` in pages/ -- all results should show the same pattern.

**Which phase should address:** Early phase -- this is the single most visible inconsistency

---

### Pitfall 6: Inconsistent Border Radius Creating Visual Noise

**What goes wrong:** Adjacent elements use different border radii, creating subtle visual discord. The eye notices shapes that don't match.

**Evidence from codebase (verified):**
```
Login.tsx:        rounded-2xl (card), rounded-lg (inputs, buttons, error box)
Card.tsx:         rounded-xl (base component)
Highlights.tsx:   rounded-xl (toolbar, table container), rounded-lg (search, dropdowns)
StudySession.tsx: rounded-md (buttons, edit containers), rounded-sm (book cover)
Settings.tsx:     rounded (buttons), rounded-full (avatar)
Dashboard.tsx:    rounded-md (book cards, charts)
```

At least 5 different border radius values used: `rounded` (4px), `rounded-md` (6px), `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px). The guide says `rounded` (4px) only.

**Why it happens:**
- shadcn components bring their own radius preferences (card.tsx uses rounded-xl)
- Different radius feels "right" for different element sizes
- Login page uses generous radius for the auth card (intentional warmth)
- No enforcement mechanism

**Consequences:**
- Subtle but real visual inconsistency
- "Something feels off" but hard to pinpoint
- Every new component requires a radius decision

**Prevention:**
1. Define 2-3 allowed radii with semantic meaning:
   - `rounded-md` for small elements (buttons, inputs, badges)
   - `rounded-lg` or `rounded-xl` for containers (cards, panels, modals)
   - `rounded-full` for avatars/pills only
2. Do NOT force everything to `rounded` (4px) -- it works for compact items but looks cheap on large containers
3. Update the guide with the actual policy

**Detection:** Grep `rounded-` across all page files. Group by file and check for consistency within each page, then across pages.

**Which phase should address:** Mid-phase -- after title/spacing decisions are made

---

### Pitfall 7: Updating the Guide Without Updating the Code (or Vice Versa)

**What goes wrong:** The guide gets rewritten to reflect the new standards, but nobody applies those standards to the actual code. Or: code gets fixed but the guide still shows old patterns.

**Evidence of risk:**
- The existing guide (v1.1, updated 2025-12-30) already doesn't match the codebase (see Pitfall 1)
- The guide's "Examples of Reference" section mentions TagManagerSidebar and Study page only
- No automated validation between guide and code exists

**Why it happens:**
- Documentation and implementation are different tasks, often done by different agents/sessions
- "We'll update the guide later" -- later never comes
- The guide is a markdown file with no connection to the codebase

**Consequences:**
- Guide becomes stale within one milestone
- New features/pages built to wrong spec
- AI agents given the guide produce inconsistent code
- Trust in documentation erodes

**Prevention:**
1. Update guide AND code in the SAME plan -- never separately
2. Keep the guide short and machine-verifiable where possible (e.g., "H1: text-xl font-semibold" not prose)
3. Add a "last verified against codebase" date to the guide header
4. At milestone end: run a verification pass comparing guide rules to actual code
5. Consider: should the guide shrink rather than grow? A 200-line guide that's accurate beats a 726-line guide that's aspirational

**Detection:** At the end of each phase, spot-check 3 rules from the guide against the code. If any are wrong, the guide needs updating.

**Which phase should address:** Final phase -- guide update as part of milestone completion

---

### Pitfall 8: Ignoring That Compact Design Has Accessibility Costs

**What goes wrong:** Aggressively compact spacing creates accessibility failures, especially on mobile where the app is a PWA.

**Evidence from codebase (verified):**
- Design guide specifies `h-5 w-5` (20px) for icon buttons -- below WCAG 44px minimum
- Guide specifies `text-xs` (12px) for metadata -- at the edge of readability
- Guide specifies `py-0.5 px-1.5` (2px/6px) for list items -- extremely tight
- StudySession already deviates with `min-h-[48px]` on response buttons (correct for mobile)

**Why it happens:**
- Compact density is the aesthetic goal ("Linear, Notion" inspiration)
- Desktop-first thinking: compact works fine with a mouse
- The app is a PWA used on phones for study sessions
- Guide was written for desktop density, not mobile PWA

**Consequences:**
- Mobile users struggle to tap buttons
- Small text hard to read on phone screens
- Violates WCAG 2.1 Success Criterion 2.5.5 (target size)
- User frustration during study sessions (the primary use case)

**Prevention:**
1. Any compact sizing applied to interactive elements must include mobile overrides
2. Pattern: `h-7 sm:h-7` for desktop, but `min-h-[44px] sm:min-h-0` for mobile
3. Never reduce StudySession touch targets -- they were sized intentionally
4. Keep `text-xs` (12px) as the absolute minimum, not the default
5. Test on actual phone, not just browser resize

**Detection:** Grep for `h-5 w-5` or `h-6 w-6` on interactive elements. Check if mobile overrides exist.

**Which phase should address:** Any phase that changes sizing -- include mobile check in verification

---

## Minor Pitfalls

Mistakes that cause annoyance or minor inconsistency but are easily fixable.

### Pitfall 9: Inconsistent Spacing Between Page Header and Content

**What goes wrong:** Each page uses different spacing between the page title and the first content section.

**Evidence from codebase (verified):**
```
Dashboard.tsx:   space-y-12 (48px gap between all sections)
Highlights.tsx:  space-y-4 (16px gap between sections)
Study.tsx:       mb-4 on "All Books" button, then inline spacing
Settings.tsx:    mb-3 after tab bar, then per-section
StudySession.tsx: p-4/p-6 on container, inline spacing
```

**Prevention:** Define one `space-y` value for page-level section spacing and apply it to all page containers.

**Which phase should address:** Same phase as title standardization

---

### Pitfall 10: Raw HTML Buttons vs. shadcn Button Component

**What goes wrong:** Some interactive elements use `<button className="...">` with hand-crafted classes, while others use `<Button>` from shadcn. Both exist in the same page.

**Evidence from codebase (verified):**
- Settings.tsx: uses raw `<button>` elements with `h-7 px-3 text-xs bg-secondary` classes (lines 686, 690, 749)
- Settings.tsx also uses `<Button>` component in TagManagerSidebar
- Highlights.tsx: raw `<button>` for toolbar actions, filter buttons, pagination
- Study.tsx: raw `<button>` for the "All Books" CTA
- Login.tsx: raw `<button>` for sign-in

**Why it happens:**
- shadcn Button defaults (h-10) don't match desired compact size
- Easier to write raw button with exact classes than configure variants
- Some buttons need very custom styling (SRS response buttons)

**Consequences:**
- No central place to change button styling
- Inconsistent hover/focus/disabled states
- Harder to enforce consistency

**Prevention:**
1. Add compact variants to Button component (`size="xs"` = `h-7 px-3 text-xs`)
2. Gradually migrate raw buttons to use `<Button>` with appropriate variant
3. Accept that some buttons (SRS response buttons, CTAs) are intentionally custom
4. Don't try to force 100% adoption -- aim for 80%

**Which phase should address:** Early phase -- add variants first, then migrate incrementally

---

### Pitfall 11: Changing font-weight Conventions Without Checking All Headings

**What goes wrong:** Deciding "all headings should be font-semibold" but some are font-bold and the difference matters visually.

**Evidence from codebase (verified):**
```
font-bold:     Dashboard h1, Highlights h1, Login h1/h2, BookContextModal title,
               StudySession "Session Complete", stat numbers
font-semibold: Study h1, Settings h1, Dialog/Sheet titles, section headings
font-medium:   Card title (card.tsx), StudySession loading/error messages
```

Three different font weights used for titles/headings. Changing them all to one value would either make bold pages feel weak or semibold pages feel heavy.

**Prevention:** Map font-weight to semantic role: page titles (bold), section headings (semibold), component titles (medium). Don't flatten to one value.

**Which phase should address:** Same phase as title size standardization

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Guide update / pre-work | Guide-reality divergence (#1) | Audit and reconcile guide BEFORE any code changes |
| Page header standardization | Two title systems (#5), font-weight confusion (#11) | Pick one scale, apply to all pages in one pass, user review |
| Component variant addition | Breaking base components (#3) | Add variants, never modify defaults |
| Spacing standardization | Breaking working UI (#2), accessibility costs (#8) | Per-page review, preserve mobile touch targets |
| Border radius cleanup | Visual noise (#6) | Define 2-3 semantic radius values, not one |
| Button migration | Raw vs. shadcn (#10) | Add xs variant first, migrate incrementally |
| Guide finalization | Stale documentation (#7) | Update guide and code in same plan |
| Infrastructure | Over-engineering (#4) | No new abstractions unless needed 5+ places |

---

## Anti-Pattern Summary

| Anti-Pattern | Do This Instead |
|--------------|----------------|
| Change shadcn defaults to match guide | Add new variants; apply per-use-site |
| Apply compact sizing globally | Apply per-page with mobile overrides |
| Rewrite the guide first, code later | Update guide and code in the same plan |
| Build token infrastructure | Make direct className fixes |
| Batch-apply changes without review | One page per plan, user verifies each |
| Force everything to one border radius | Define 2-3 semantic radius levels |
| Treat the guide as immutable truth | Reconcile guide with reality first |

---

## Key Insight: The Real Problem is Not What It Seems

The project description says "inconsistent title sizes, different table styles, irregular spacing." But the codebase analysis reveals something more nuanced:

**There are actually TWO coherent design languages coexisting:**

1. **"Compact" language** (Study, Settings, TagManagerSidebar): text-base titles, h-7 buttons, gap-1 spacing, rounded corners. Dense, tool-like, Linear-inspired.

2. **"Generous" language** (Dashboard, Highlights, Login): text-3xl titles, rounded-xl containers, space-y-12 sections, shadow effects. Spacious, modern, Apple-inspired.

The existing design guide documents language #1 but the user seems to WANT language #2 ("Apple-level consistency"). The real decision is: which language wins? Or can they be reconciled into a coherent hybrid?

This decision must happen BEFORE any code changes. Otherwise, every plan will be guessing.

---

## Sources

- Codebase analysis: direct grep/read of all components and pages in Evoque repository
- [Building a Scalable Design System with Shadcn/UI](https://shadisbaih.medium.com/building-a-scalable-design-system-with-shadcn-ui-tailwind-css-and-design-tokens-031474b03690) -- token architecture patterns
- [Adopting Design Systems (EightShapes)](https://medium.com/eightshapes-llc/adopting-design-systems-71e599ff660a) -- incremental adoption strategy
- [Design System Documentation Best Practices (Backlight)](https://backlight.dev/blog/design-system-documentation-best-practices) -- preventing stale documentation
- [Design Systems Pitfalls (Jeff Pelletier)](https://medium.com/@withinsight1/design-systems-pitfalls-6b3113fa0898) -- general design system mistakes
- [Design System in React with Tailwind, Shadcn/ui and Storybook](https://dev.to/shaikathaque/design-system-in-react-with-tailwind-shadcnui-and-storybook-17f) -- shadcn standardization patterns
- [Don't use Tailwind for your Design System (sancho.dev)](https://sancho.dev/blog/tailwind-and-design-systems) -- Tailwind abstraction tradeoffs
- [Tailwind CSS Best Practices 2025-2026](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns) -- token centralization patterns
- [Maintaining Design Systems (Brad Frost)](https://atomicdesign.bradfrost.com/chapter-5/) -- long-term maintenance
- [Design System Maintenance Checklist (UXPin)](https://www.uxpin.com/studio/blog/design-system-maintenance-checklist/) -- audit and review cycles
- [Tips for design system documentation (LogRocket)](https://blog.logrocket.com/ux-design/design-system-documentation/) -- preventing documentation rot
