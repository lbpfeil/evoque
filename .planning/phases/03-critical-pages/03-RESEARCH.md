# Phase 3: Critical Pages - Research

**Researched:** 2026-01-23
**Domain:** Study page migration, StudySession page migration, user approval workflow
**Confidence:** HIGH

## Summary

Phase 3 modernizes the Study and StudySession pages to use semantic color tokens and shadcn patterns. Unlike Phase 2's autonomous execution, Phase 3 requires **user approval at each step** - this constraint fundamentally shapes how plans must be structured.

The Study.tsx page (134 lines) is relatively simple with a prominent "Study All Books" button, a heatmap component, and a DeckTable. StudySession.tsx (711 lines) is significantly more complex with multiple UI states (loading, no cards, session complete, error, active session), keyboard shortcuts, edit modes, and the critical **serif font requirement** for study cards.

**Primary recommendation:** Structure plans as single-component changes with explicit visual checkpoints. Each plan should modify one visual element, build, and pause for user approval before the next. This maximizes user control while maintaining atomic commits.

---

## Study.tsx Analysis

### Current State

**Lines:** 134
**Hardcoded colors:** ~20 instances (16 unique patterns)
**Components used:**
- DeckTable (child component)
- EmptyDeckPopover (already migrated to shadcn AlertDialog in Phase 2)
- StudyHeatmap (child component)

### Hardcoded Color Audit

| Location | Current Classes | Semantic Replacement |
|----------|-----------------|---------------------|
| Loading state (line 15) | `text-zinc-500 dark:text-zinc-400` | `text-muted-foreground` |
| Page header (line 44) | `text-zinc-900 dark:text-zinc-100` | `text-foreground` |
| Subtitle (line 45) | `text-zinc-500 dark:text-zinc-400` | `text-muted-foreground` |
| All Books button (line 58) | `bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black` | Keep as `bg-foreground text-background hover:bg-foreground/90` (inverted pattern from 02-02) |
| Icon background (line 61) | `bg-white/10 dark:bg-black/10` | `bg-background/10` |
| Subtitle in button (line 68) | `text-white/70 dark:text-black/70` | `text-background/70` |
| Due count label (line 75) | `text-white/50 dark:text-black/50` | `text-background/50` |
| Stats colors (lines 82-91) | `text-blue-300/700`, `text-amber-300/700`, `text-green-300/700` | Keep semantic colors but adjust for theme: see note |
| Section header (line 103) | `text-zinc-600 dark:text-zinc-400` | `text-muted-foreground` |
| Empty state (lines 109-110) | `text-zinc-500/400 dark:text-zinc-400/500` | `text-muted-foreground` |

**Note on stats colors:** The blue/amber/green colors for New/Learning/Review are semantically meaningful (consistent with Anki/SRS conventions). These should use explicit dark mode variants like Phase 2 established, not semantic tokens.

### Migration Complexity: LOW

Study.tsx is straightforward - mostly text color replacements with one special case (the inverted "All Books" button).

---

## StudySession.tsx Analysis

### Current State

**Lines:** 711
**Hardcoded colors:** ~70 instances
**Critical constraints:**
1. **Preserve serif font** on study cards (user decision from 01-04)
2. **Keyboard shortcuts** must continue working: Space, Enter, 1-4, E, Ctrl+Z, ESC
3. **Progress bar** already uses semantic tokens (via CSS class)

### Page States (5 distinct UI states)

1. **Loading** (line 263-269): Simple centered text
2. **No cards available** (line 272-299): Message + Back button
3. **Session complete** (line 302-327): Stats display + Back button
4. **Card error** (line 330-347): Error message + Back button
5. **Active session** (line 352-706): Full study interface

### Serif Font Locations (MUST PRESERVE)

| Line | Context | Current Class |
|------|---------|---------------|
| 529 | Edit highlight textarea | `font-serif` |
| 538 | Highlight blockquote | `font-serif italic` |
| 578 | Divider tilde | `font-serif italic` |
| 584 | Note display | `font-serif` |

**Pattern:** Serif font is used for:
- Highlight text display (blockquote)
- Note text display
- Edit textareas for both
- Decorative divider

### Hardcoded Color Categories

**1. Container/Background:**
- `bg-white dark:bg-zinc-900` (main container, footer, tag selector container)
- `bg-zinc-50 dark:bg-zinc-950` (edit sections)

**2. Borders:**
- `border-zinc-200 dark:border-zinc-800` (header, progress bar background, edit sections, dividers)
- `border-zinc-300 dark:border-zinc-700` (tag selector container)

**3. Text:**
- `text-zinc-900 dark:text-zinc-100` (headings, book title)
- `text-zinc-800 dark:text-zinc-200` (highlight text, note text)
- `text-zinc-500 dark:text-zinc-500` (loading, muted text)
- `text-zinc-400 dark:text-zinc-500` (icons, secondary text)
- `text-zinc-300 dark:text-zinc-700` (decorative elements)

**4. Interactive elements:**
- `hover:bg-zinc-100 dark:hover:bg-zinc-800` (header buttons)
- `hover:text-black dark:hover:text-white` (edit buttons)

**5. Response buttons (intentionally colored):**
- Again: `bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700`
- Hard: `bg-amber-500 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-700`
- Good: `bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700`
- Easy: `bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700`

**6. Card status indicators:**
- New: `bg-blue-500`
- Learning: `bg-amber-500`
- Review: `bg-green-500`

**7. Tags (intentionally colored):**
- Global: `bg-blue-500 dark:bg-blue-600`
- Book-specific: `bg-amber-500 dark:bg-amber-600`
- Overflow button: `bg-zinc-300 dark:bg-zinc-700`

### Keyboard Shortcuts Implementation

Located in useEffect (lines 188-260):
- Listens on `window` for `keydown`
- Guards: `showTagSelector`, `isEditingHighlight`, `isEditingNote`, `isSubmittingResponse`
- Key handlers:
  - `Ctrl+Z`: Undo
  - `ESC`: Save when editing
  - `Space`/`Enter`: Reveal answer (when not shown)
  - `Enter`: Submit Good (when answer shown)
  - `1-4`: Submit response quality
  - `E`: Edit note

**Risk:** None. Keyboard shortcuts are in JS logic, not affected by CSS changes.

### Migration Complexity: HIGH

StudySession.tsx requires careful migration due to:
1. Multiple UI states to verify
2. Intentionally colored elements (response buttons, status indicators, tags) that should NOT become semantic
3. Serif font preservation requirement
4. Complex interactive states (editing, submitting)

---

## Related Components Analysis

### DeckTable.tsx

**Lines:** 94
**Hardcoded colors:** ~14 instances
**Used by:** Study.tsx

| Pattern | Current | Replacement |
|---------|---------|-------------|
| Container border | `border-zinc-200 dark:border-zinc-800` | `border-border` |
| Header background | `bg-zinc-50 dark:bg-zinc-950` | `bg-muted` |
| Header text | `text-zinc-600 dark:text-zinc-400` | `text-muted-foreground` |
| Divider | `divide-zinc-100 dark:divide-zinc-800` | `divide-border` |
| Row hover | `hover:bg-zinc-50 dark:hover:bg-zinc-800` | `hover:bg-accent/50` |
| All Books bg | `bg-zinc-50/50 dark:bg-zinc-800/50` | `bg-muted/50` |
| Title text | `text-zinc-900 dark:text-zinc-100` | `text-foreground` |
| Author text | `text-zinc-400 dark:text-zinc-500` | `text-muted-foreground` |
| Stats colors | `text-blue-600`, `text-amber-600`, `text-green-600` | Keep (semantic meaning) |
| Zero stats | `text-zinc-400 dark:text-zinc-500` | `text-muted-foreground` |

### StudyHeatmap.tsx

**Lines:** 377
**Hardcoded colors:** ~18 instances
**Used by:** Study.tsx

| Pattern | Current | Replacement |
|---------|---------|-------------|
| Container | `bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800` | `bg-card border-border` |
| Header text | `text-zinc-600 dark:text-zinc-400` | `text-muted-foreground` |
| Secondary text | `text-zinc-400 dark:text-zinc-500` | `text-muted-foreground` |
| Heatmap cells | green-200/400/500/600 and zinc-100/800 | Keep green scale (semantic), convert zinc to muted |
| Future cells | `bg-zinc-50 dark:bg-zinc-900/50` | `bg-muted/50` |
| Tooltip | `bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900` | Keep inverted pattern |

**Note:** Heatmap green colors are intentionally data-visualization colors. Only convert the structural zinc colors.

### DeleteCardPopover.tsx & EmptyDeckPopover.tsx

**Already migrated** in Phase 2-05. Using shadcn AlertDialog with semantic tokens.

### TagSelector.tsx

**Partially migrated.** Uses some semantic tokens but has hardcoded blue/amber colors for tag types.
- Lines 110, 119, 229, 238: `text-blue-600 hover:bg-blue-50`, `text-amber-600 hover:bg-amber-50`
- These are intentionally colored (global vs book-specific tags)

---

## Patterns from Phase 2 to Reuse

### Semantic Token Mapping (established in 02-RESEARCH.md)

| Hardcoded | Semantic |
|-----------|----------|
| `bg-white` | `bg-card` or `bg-background` |
| `bg-zinc-50` | `bg-muted` |
| `dark:bg-zinc-900` | REMOVE |
| `text-zinc-900` | `text-foreground` |
| `text-zinc-500/400` | `text-muted-foreground` |
| `border-zinc-200` | `border-border` |
| `hover:bg-zinc-100` | `hover:bg-accent` or `hover:bg-accent/50` |

### Inverted Button Pattern (from 02-02)

For the "All Books" and "Back to Decks" buttons:
```tsx
// Current
className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"

// Semantic (using foreground/background inversion)
className="bg-foreground text-background hover:bg-foreground/90"
```

### Keep Explicit Dark Mode (from 02-03)

For intentionally colored elements like status indicators and response buttons, keep explicit dark mode variants:
```tsx
// Keep this pattern for response buttons
className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700"
```

---

## User Approval Workflow

### Constraint Analysis

Requirements state:
- "cada decisao aprovada pelo usuario" (each decision approved by user)
- "User has explicitly approved the final appearance of both pages"

### Recommended Plan Structure

**Option A: One plan per page, multiple approval checkpoints**
- Pro: Fewer plan files
- Con: Long plans, harder to track what was approved

**Option B: One plan per major visual change** (RECOMMENDED)
- Pro: Atomic changes, clear approval scope
- Con: More plan files (4-6 plans)
- Rationale: User can approve/reject each visual element independently

### Proposed Plan Sequence

| Plan | Target | Scope | Approval Question |
|------|--------|-------|-------------------|
| 03-01 | Study.tsx | All Books button + header | "Does this inverted button look correct in both modes?" |
| 03-02 | DeckTable.tsx | Table styling | "Does the deck table render correctly?" |
| 03-03 | StudyHeatmap.tsx | Heatmap container | "Does the heatmap look correct?" |
| 03-04 | StudySession.tsx | Container, header, footer | "Does the session shell look correct?" |
| 03-05 | StudySession.tsx | Card display (preserve serif) | "Does the study card display correctly with serif font?" |
| 03-06 | StudySession.tsx | Response buttons + states | "Do the response buttons and state screens look correct?" |

### Approval Checkpoint Pattern

Each plan should end with:
```markdown
<verification>
## Visual Verification Required

**Before proceeding to next plan:**
1. Run `npm run dev`
2. Navigate to [page]
3. Toggle between light/dark mode
4. [Specific things to check]

**Approval question:** [What the user should confirm]

If approved, proceed to 03-0X.
If changes needed, document in STATE.md and revise.
</verification>
```

---

## Risks and Special Considerations

### Risk 1: Serif Font Loss

**Severity:** HIGH
**Prevention:** Each plan touching StudySession.tsx must explicitly verify `font-serif` remains on:
- Line 529 (edit textarea)
- Line 538 (blockquote)
- Line 578 (divider)
- Line 584 (note display)

**Verification:** Grep for `font-serif` after each change.

### Risk 2: Response Button Color Change

**Severity:** MEDIUM
**Issue:** Changing red/amber/blue/green buttons to semantic tokens would break SRS conventions
**Prevention:** These buttons MUST keep explicit colors with dark variants

### Risk 3: Keyboard Shortcuts Breaking

**Severity:** LOW
**Issue:** CSS changes shouldn't affect JS, but complex refactoring might
**Prevention:** Test all shortcuts after each StudySession.tsx change

### Risk 4: Tag Colors Becoming Semantic

**Severity:** LOW
**Issue:** Global (blue) vs book-specific (amber) tags have semantic meaning
**Prevention:** Keep explicit tag colors, only convert structural elements

### Risk 5: Progress Bar Animation

**Severity:** NONE
**Status:** Already migrated in Phase 1 (uses `var(--foreground)` and `var(--muted-foreground)`)

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal overlays | Custom fixed divs | shadcn Dialog/AlertDialog | Already done in Phase 2 |
| Form validation | Manual state | Leave as-is for now | Out of scope |
| Loading spinners | New components | Existing pattern | Don't change behavior |

---

## Code Examples

### Study.tsx - All Books Button Migration

```tsx
// BEFORE
<button
  onClick={() => handleDeckClick('all')}
  className="w-full mb-4 px-3 sm:px-4 py-3 bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black rounded-md transition-colors flex items-center justify-between group"
>

// AFTER
<button
  onClick={() => handleDeckClick('all')}
  className="w-full mb-4 px-3 sm:px-4 py-3 bg-foreground hover:bg-foreground/90 text-background rounded-md transition-colors flex items-center justify-between group"
>
```

### StudySession.tsx - Container Migration (Preserve Serif)

```tsx
// BEFORE
<blockquote
  className="text-lg md:text-xl font-serif italic text-zinc-800 dark:text-zinc-200 leading-relaxed text-justify"
>

// AFTER
<blockquote
  className="text-lg md:text-xl font-serif italic text-foreground leading-relaxed text-justify"
>
```

### DeckTable.tsx - Row Hover Pattern

```tsx
// BEFORE
className={cn(
  "w-full px-2 py-1 grid ...",
  "hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left",
)}

// AFTER
className={cn(
  "w-full px-2 py-1 grid ...",
  "hover:bg-accent/50 transition-colors duration-200 text-left",
)}
```

### Response Buttons - Keep Explicit (DO NOT CHANGE TO SEMANTIC)

```tsx
// KEEP AS-IS (intentionally colored)
<button
  onClick={() => handleResponse(1)}
  className="py-2.5 sm:py-1.5 min-h-[48px] sm:min-h-0 bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white rounded-md ..."
>
  Again
</button>
```

---

## Sources

### Primary (HIGH confidence)
- Direct file analysis: Study.tsx, StudySession.tsx, DeckTable.tsx, StudyHeatmap.tsx
- Phase 2 research: `.planning/phases/02-component-migration/02-RESEARCH.md`
- Phase 2 plans: 02-01 through 02-07 (established patterns)
- STATE.md: Prior decisions including 01-04 (serif font), 02-02 (inverted pattern)

### Secondary (MEDIUM confidence)
- CLAUDE.md: Project context, file structure, critical workflows

---

## Metadata

**Confidence breakdown:**
- Study.tsx analysis: HIGH - Direct file inspection, simple structure
- StudySession.tsx analysis: HIGH - Thorough line-by-line review
- Related components: HIGH - Direct file inspection
- Migration patterns: HIGH - Based on Phase 2 established patterns
- User approval workflow: HIGH - Based on requirements constraint

**Research date:** 2026-01-23
**Valid until:** 2026-02-23 (stable domain, 30 days)
