# Phase 9: Component Adoption - Research

**Researched:** 2026-01-28
**Domain:** Replacing raw HTML elements with standardized shadcn components
**Confidence:** HIGH

## Summary

Phase 9 closes the component adoption gap identified in the v2.0 Milestone Audit: the Button and Input components were standardized in Phase 5 but only adopted by 2 components (TagSelector and TagManagerSidebar). All 6 pages and most components still use raw `<button>` and `<input>` elements with manual styling.

The DataTable composition pattern created in Phase 5 remains completely orphaned (0 imports). DeckTable uses a nearly identical table structure but never adopted the DataTable abstraction.

**Primary recommendation:** Replace raw HTML elements file-by-file with shadcn components, evaluating each `<button>` and `<input>` context. Some button elements (table rows, conditional elements) may need to stay raw for semantic or technical reasons. Evaluate whether to adopt DataTable or remove it.

## Current State

### Component Inventory

**Button component (`components/ui/button.tsx`):**
- CVA variants: default, destructive, outline, secondary, ghost, link
- Size variants: default (h-10), compact (h-8, default), sm (h-7), lg (h-11), icon (h-8 w-8)
- Current adopters: TagSelector (1 usage), TagManagerSidebar (9+ usages)
- Status: READY for adoption -- properly standardized with token-aligned defaults

**Input component (`components/ui/input.tsx`):**
- Default height: h-8 (32px) with px-2.5 py-1.5 padding
- Text size: text-sm (14px)
- Current adopters: TagManagerSidebar only
- Status: READY for adoption -- properly standardized with token-aligned defaults

**DataTable pattern (`components/patterns/DataTable.tsx`):**
- Generic table component with Column<T> interface
- Props: columns, data, gridCols, rowClassName, onRowClick, emptyMessage
- Current adopters: NONE (0 imports anywhere)
- Status: ORPHANED -- built but never used

**DeckTable component (`components/DeckTable.tsx`):**
- Purpose: Display study decks with stats (new, learning, review, total)
- Structure: Hand-coded grid table with header + button rows
- Lines: 96 total
- Status: Nearly identical structure to DataTable but never adopted the pattern

### Raw Element Counts

**Raw `<button>` elements:**
- Pages: 41 total
  - Highlights.tsx: ~15 buttons (filters, bulk actions, comboboxes, row actions)
  - Settings.tsx: ~15 buttons (file upload, avatar actions, book settings)
  - Login.tsx: 2 buttons (sign in, sign up)
  - Study.tsx: 1 button (All Books deck)
  - StudySession.tsx: ~8 buttons (rating buttons, navigation, controls)
  - Dashboard.tsx: 0 raw buttons
- Components: 16 total (excluding ui/)
  - DeckTable.tsx: 1 button (deck row)
  - BookContextModal.tsx: 1 button
  - HighlightTableRow.tsx: 1 button ("add note")
  - HighlightEditModal.tsx: 1 button
  - Sidebar.tsx: 3 buttons
  - TagManagerSidebar.tsx: 4+ buttons (despite importing Button component)
  - TagSelector.tsx: 4+ buttons (despite importing Button component)
  - ThemeToggle.tsx: 1 button
  - ErrorBoundary.tsx: 1 button

**Raw `<input>` elements:**
- Pages: 14 total
  - Settings.tsx: 10 inputs (text, number, file, checkbox)
  - Highlights.tsx: 2 inputs (search, checkbox)
  - Login.tsx: 2 inputs (email, password)
- Components: 1 total
  - HighlightTableRow.tsx: 1 input (checkbox with custom SVG checkmark)

### Button Element Categories

Based on usage patterns, raw buttons fall into these categories:

**1. Standard Interactive Buttons (SHOULD replace):**
- Action buttons with onClick handlers
- Navigation buttons
- Modal/dialog action buttons
- Form submit buttons
- Example: Login sign-in/sign-up, Settings upload buttons

**2. Combobox/Dropdown Triggers (SHOULD replace):**
- Buttons with role="combobox"
- Popover/Command triggers
- Select-like elements
- Example: Highlights filter comboboxes, TagSelector triggers

**3. Table Row Buttons (EVALUATE case-by-case):**
- Clickable table rows using `<button>` for accessibility
- Example: DeckTable rows, DataTable rows
- Issue: Button component adds default styling (borders, shadows, bg colors) that breaks table row appearance
- Options: (a) Keep raw button, (b) Use Button with variant="ghost" + asChild, (c) Convert to div with onClick

**4. Conditional Element Types (MUST stay raw):**
- Components that render different elements based on props
- Example: DataTable line 54: `const Row = onRowClick ? 'button' : 'div'`
- Reason: Cannot conditionally render `<Button>` vs `<div>` -- would need different prop signatures

**5. StudySession Rating Buttons (KEEP raw - intentional deviation):**
- SM-2 quality feedback buttons (Again, Hard, Good, Easy)
- Use raw colors (bg-red-500, bg-amber-500, bg-blue-500, bg-green-500)
- Documented deviation in Phase 8 -- these are NOT semantic status colors

### Input Element Categories

**1. Form Text Inputs (SHOULD replace):**
- Email, password, text inputs in forms
- Number inputs for settings
- Example: Login email/password, Settings daily limits

**2. Search Inputs (SHOULD replace):**
- Search boxes with onChange handlers
- Example: Highlights search bar

**3. File Inputs (EVALUATE carefully):**
- File upload inputs
- Example: Settings avatar upload, import file upload
- Issue: File inputs have special browser UI that Input component might not handle correctly
- Recommendation: Test thoroughly before replacing

**4. Checkboxes (EVALUATE - may need Checkbox component):**
- Custom styled checkboxes
- Example: HighlightTableRow selection checkbox with custom SVG checkmark
- Issue: Input component is for text inputs, not checkboxes -- need `components/ui/checkbox.tsx`
- Recommendation: Use shadcn Checkbox component (already exists) instead of raw input

### DataTable Adoption Analysis

**DeckTable vs DataTable comparison:**

DeckTable structure (hand-coded):
```tsx
<div className="border border-border rounded overflow-hidden">
  <div className="bg-muted border-b border-border px-xs py-xxs grid grid-cols-[...] gap-xs items-center">
    {/* Header cells */}
  </div>
  <div className="divide-y divide-border">
    {decks.map(deck => (
      <button className="w-full px-xs py-xxs grid grid-cols-[...] gap-xs items-center hover:bg-accent/50">
        {/* Row cells */}
      </button>
    ))}
  </div>
</div>
```

DataTable structure (generic):
```tsx
<DataTable
  columns={[
    { key: 'title', header: 'Deck', render: (item) => <div>...</div> },
    { key: 'new', header: 'New', render: (item) => item.stats.new },
    // ...
  ]}
  data={decks}
  gridCols="grid-cols-[1fr_48px] sm:grid-cols-[1fr_48px_64px_48px_48px]"
  onRowClick={handleDeckClick}
  rowClassName={(item) => item.isAllBooks && "bg-muted/50 font-medium"}
/>
```

**Should DeckTable adopt DataTable?**

**Arguments FOR adoption:**
- Reduces DeckTable from 96 lines to ~40 lines (column definitions)
- Makes table structure consistent across app
- Eliminates duplicate grid/header/hover styling logic
- Future tables can use same pattern

**Arguments AGAINST adoption:**
- DeckTable has complex responsive layout (mobile shows 2 cols, desktop shows 5 cols)
- DeckTable has special styling for "All Books" row (bg-muted/50, font-medium)
- DataTable uses button element for clickable rows (would need variant="ghost" + custom classes)
- DeckTable works perfectly as-is -- adoption would be refactoring for refactoring's sake
- HighlightTableRow uses `<tr>` (semantic HTML table), not grid -- incompatible with DataTable

**Recommendation:** REMOVE DataTable pattern (it's orphaned infrastructure). If a future table needs this pattern, it can be rebuilt when needed. The current tables (DeckTable, HighlightTableRow) have different enough requirements that forcing them into a generic abstraction adds complexity without benefit.

## Standard Stack

No new libraries or tools needed. This phase uses only existing infrastructure:

### Core (Already Exists)
| Component | File | Purpose | Status |
|-----------|------|---------|--------|
| Button | `components/ui/button.tsx` | Standardized button with CVA variants | Complete |
| Input | `components/ui/input.tsx` | Standardized text input with token height | Complete |
| Checkbox | `components/ui/checkbox.tsx` | Radix checkbox with custom styling | Complete (exists, not verified) |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `cn()` from `lib/utils.ts` | Tailwind class merging | For combining Button variants with custom classes |

**Installation:** None required. All components exist.

## Architecture Patterns

### Button Replacement is Context-Aware

Not all `<button>` elements should become `<Button>`. The decision tree:

```
Is it a button element?
  ├─ YES: Is it a table row / conditional element / DataTable row?
  │   ├─ YES: Keep raw <button> (semantic HTML or technical constraint)
  │   └─ NO: Is it StudySession rating button?
  │       ├─ YES: Keep raw (documented deviation)
  │       └─ NO: Replace with <Button>
  └─ NO: Skip
```

### Button Variant Selection

When replacing a raw button, choose the variant based on visual weight:

| Raw Button Pattern | Button Variant | Notes |
|--------------------|----------------|-------|
| Primary action (bg color, prominent) | `variant="default"` | Solid background, high contrast |
| Secondary action (border, no bg) | `variant="outline"` | Border only, lower visual weight |
| Tertiary action (hover only) | `variant="ghost"` | No border, no bg, hover state only |
| Danger/destructive | `variant="destructive"` | Red background |
| Text-only link-like | `variant="link"` | Underline on hover, no button appearance |

### Input Replacement is Straightforward

All text-based inputs should become `<Input>`:
- Email inputs → `<Input type="email" />`
- Password inputs → `<Input type="password" />`
- Text inputs → `<Input type="text" />`
- Number inputs → `<Input type="number" />`
- Search inputs → `<Input type="search" />` (or keep type="text")

**Exception:** Checkboxes should use `<Checkbox>` from `components/ui/checkbox.tsx`

**Exception:** File inputs may need custom wrapper or special handling (test first)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Button styling | Raw `<button className="...">` with 8+ classes | `<Button variant="..." size="...">` | Semantic variants, theme integration |
| Input styling | Raw `<input className="...">` with custom height/padding | `<Input />` | Token-aligned height (h-8), consistent styling |
| Checkbox styling | Raw `<input type="checkbox" className="...">` with custom CSS | `<Checkbox />` | Radix accessibility, theme colors |
| Hover states | Manual `hover:bg-accent hover:text-accent-foreground` | Button ghost variant | Built-in hover handling |

## Common Pitfalls

### Pitfall 1: Replacing Table Row Buttons Breaks Styling
**What goes wrong:** Converting `<button className="w-full grid grid-cols-[...]">` to `<Button>` adds unwanted button styling (border-radius, box-shadow, default padding).
**Why it happens:** Button component has built-in visual styling that conflicts with table row appearance.
**How to avoid:**
- Option 1: Keep raw `<button>` for table rows (semantic HTML, no visual regression)
- Option 2: Use `<Button variant="ghost" asChild><button className="..."></button></Button>` but this is verbose and adds no value
- Option 3: Use DataTable pattern (but we're removing it)
**Recommendation:** Keep table row buttons raw. The Button component is for standalone interactive elements, not table rows.

### Pitfall 2: Input Component Doesn't Handle File Inputs
**What goes wrong:** `<Input type="file" />` renders but file browser UI might be broken or unstyled.
**Why it happens:** File inputs have special browser UI that CSS can't fully control.
**How to avoid:** Test file inputs thoroughly after replacement. If broken, keep raw `<input type="file">` with custom styling.

### Pitfall 3: Checkbox Inputs Need Checkbox Component
**What goes wrong:** Trying to replace `<input type="checkbox">` with `<Input type="checkbox">`.
**Why it happens:** Input component is designed for text inputs, not checkboxes.
**How to avoid:** Use `<Checkbox>` from `components/ui/checkbox.tsx` for all checkbox replacements. Import from `../components/ui/checkbox`.

### Pitfall 4: Combobox Buttons Need Special Handling
**What goes wrong:** Replacing `<button role="combobox" className="...">` with `<Button role="combobox">` changes the appearance but combobox needs specific accessibility attributes.
**Why it happens:** Combobox triggers are buttons but need aria-expanded, aria-controls, etc.
**How to avoid:**
- Use `<Button variant="outline">` for combobox appearance
- Preserve all aria-* and role attributes
- Keep popover/command wiring intact
**Example:**
```tsx
// Before
<button role="combobox" className="px-sm py-xs border rounded hover:bg-accent">...</button>

// After
<Button role="combobox" variant="outline" size="compact">...</Button>
```

### Pitfall 5: Missing Size Prop Results in Wrong Height
**What goes wrong:** `<Button>` renders at h-8 (compact default) when you need h-10 (original default).
**Why it happens:** Phase 5 changed Button default from h-10 to h-8 (compact).
**How to avoid:**
- For compact buttons (most cases): No size prop needed → h-8
- For larger buttons: `size="default"` → h-10
- For small buttons: `size="sm"` → h-7
- For icon-only: `size="icon"` → h-8 w-8

### Pitfall 6: Conditional Button/Div Rendering Cannot Use Button Component
**What goes wrong:** Code like `const Row = onRowClick ? 'button' : 'div'` cannot be converted to Button component.
**Why it happens:** Button component is a fixed React component, not a dynamic HTML tag name.
**How to avoid:** Keep this pattern as raw HTML elements. The DataTable component at line 54 has this issue -- it must stay raw or be completely restructured.

### Pitfall 7: Button Component Adds `type="button"` by Default
**What goes wrong:** Form submit buttons need `type="submit"` but Button renders `type="button"`.
**Why it happens:** Button component sets `type="button"` to prevent accidental form submission.
**How to avoid:** Explicitly set `type="submit"` on form submit buttons:
```tsx
<Button type="submit">Sign In</Button>
```

## File-by-File Migration Strategy

### Pages (High Priority)

**Login.tsx** (2 buttons, 2 inputs)
- Replace email input → `<Input type="email">`
- Replace password input → `<Input type="password">`
- Replace sign in button → `<Button type="submit">`
- Replace sign up button → `<Button variant="outline">`
- Complexity: LOW

**Settings.tsx** (~15 buttons, ~10 inputs)
- Replace text/number inputs → `<Input>`
- File upload buttons: Test carefully, may need to stay raw
- Avatar upload button → `<Button>`
- Book setting buttons → `<Button variant="outline">`
- Checkbox inputs → Keep raw or use `<Checkbox>` (2 checkboxes at lines 764, 768)
- Complexity: MEDIUM (file inputs need testing)

**Highlights.tsx** (~15 buttons, 2 inputs)
- Replace search input → `<Input type="search">`
- Bulk action buttons → `<Button variant="ghost">` or `<Button variant="destructive">`
- Combobox triggers (3) → `<Button variant="outline" size="compact">`
- Filter toggle buttons (4) → `<Button variant="ghost">`
- Clear filters button → `<Button variant="ghost">`
- Select all checkbox → Keep raw (custom styled)
- Complexity: HIGH (many buttons with specific roles)

**Study.tsx** (1 button)
- "All Books" deck button → Keep raw (styled like a card, not a button)
- Alternative: `<Button variant="ghost" asChild>` wrapper but this adds complexity
- Complexity: LOW (evaluate if replacement adds value)

**StudySession.tsx** (~8 buttons)
- Rating buttons (4) → KEEP RAW (documented deviation with SM-2 colors)
- Next/previous buttons → Replace with `<Button>`
- Control buttons → Replace with `<Button variant="ghost">`
- Complexity: LOW (only non-rating buttons)

**Dashboard.tsx** (0 buttons)
- No raw buttons to replace
- Complexity: NONE

### Components (Medium Priority)

**DeckTable.tsx** (1 button)
- Deck row button → KEEP RAW (table row with grid layout)
- Reason: Button component styling conflicts with table appearance
- Complexity: NONE (no action needed)

**HighlightTableRow.tsx** (1 button, 1 input)
- "Add note" button → EVALUATE (keep raw or use `<Button variant="ghost">`)
- Checkbox input → KEEP RAW (has custom SVG checkmark with inline CSS)
- Alternative for checkbox: Use `<Checkbox>` component but would need to replicate checkmark style
- Complexity: LOW (both can stay raw)

**Sidebar.tsx** (3 buttons)
- Logo button → Replace with `<Button variant="ghost">`
- Nav item buttons → Replace with `<Button variant="ghost">`
- Mobile toggle → Replace with `<Button variant="ghost">`
- Complexity: LOW

**TagManagerSidebar.tsx** (4+ buttons)
- Already imports Button component but has raw buttons
- Replace inline action buttons → `<Button size="icon" variant="ghost">`
- Replace add tag button → `<Button>`
- Complexity: LOW (component already uses Button in some places)

**TagSelector.tsx** (4+ buttons)
- Already imports Button component but has raw buttons
- Replace tag selection buttons → `<Button variant="ghost">`
- Replace add tag button → `<Button>`
- Complexity: LOW

**Other Components** (BookContextModal, HighlightEditModal, ErrorBoundary, ThemeToggle)
- Each has 1-2 buttons
- Replace with appropriate Button variant
- Complexity: LOW

### Out of Scope (Do NOT Modify)

**components/ui/*.tsx** - Base shadcn components (already use Button/Input internally where appropriate)

**DataTable rows** - Line 54 uses conditional element type (`const Row = onRowClick ? 'button' : 'div'`) which cannot be replaced with Button component

**StudySession rating buttons** - Lines 636-660 use raw colors (bg-red-500, etc.) as documented deviation

## DataTable Decision

**Recommendation: REMOVE DataTable component**

Rationale:
1. **Zero adoption:** No file imports DataTable after 3+ weeks of existence
2. **DeckTable won't adopt it:** DeckTable has complex responsive layout and special styling that DataTable can't handle cleanly
3. **HighlightTableRow incompatible:** Uses semantic HTML `<tr>` elements, not grid-based layout
4. **Technical constraint:** DataTable line 54 uses conditional element rendering that conflicts with Button component adoption
5. **No future need identified:** If a generic table is needed later, it can be rebuilt with learnings from DeckTable/HighlightTableRow

**Action:** Delete `components/patterns/DataTable.tsx` and update any documentation references.

**Alternative:** Keep DataTable but document it as "infrastructure-ready, not required" in design guide. But this violates the principle of deleting unused code.

## Code Examples

### Button Replacement Pattern

```tsx
// BEFORE: Raw button with manual styling
<button
  onClick={handleAction}
  className="px-sm py-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
>
  Action
</button>

// AFTER: Button component with variant
<Button onClick={handleAction}>
  Action
</Button>
```

### Button Variant Examples

```tsx
// Primary action (default variant)
<Button onClick={handleSubmit}>Submit</Button>

// Secondary action (outline)
<Button variant="outline" onClick={handleCancel}>Cancel</Button>

// Tertiary action (ghost - hover only)
<Button variant="ghost" onClick={handleEdit}>Edit</Button>

// Destructive action
<Button variant="destructive" onClick={handleDelete}>Delete</Button>

// Icon-only button
<Button size="icon" variant="ghost">
  <Trash2 className="h-4 w-4" />
</Button>
```

### Input Replacement Pattern

```tsx
// BEFORE: Raw input with manual styling
<input
  type="email"
  className="h-8 px-2.5 py-1.5 border border-input rounded-md bg-background"
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// AFTER: Input component
<Input
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### Checkbox Replacement Pattern

```tsx
// BEFORE: Raw checkbox input
<input
  type="checkbox"
  className="w-4 h-4 rounded border-input"
  checked={isSelected}
  onChange={() => toggleSelection()}
/>

// AFTER: Checkbox component
<Checkbox
  checked={isSelected}
  onCheckedChange={toggleSelection}
/>
```

### Combobox Button Pattern

```tsx
// BEFORE: Raw combobox trigger
<button
  role="combobox"
  aria-expanded={open}
  className="w-full px-sm py-xs bg-background border border-input rounded-lg hover:bg-accent"
>
  {selectedValue || "Select..."}
</button>

// AFTER: Button with combobox role
<Button
  role="combobox"
  aria-expanded={open}
  variant="outline"
  size="compact"
  className="w-full justify-between"
>
  {selectedValue || "Select..."}
</Button>
```

### Table Row Button (Keep Raw)

```tsx
// KEEP THIS PATTERN - do not replace with Button component
<button
  onClick={() => onRowClick(item)}
  className="w-full px-xs py-xxs grid grid-cols-[...] gap-xs hover:bg-accent/50"
>
  {/* Row cells */}
</button>

// WHY: Button component adds unwanted styling (border-radius, shadows, default padding)
// that conflicts with table row appearance. Raw button is correct here.
```

## State of the Art

| Old Approach (current) | Target Approach (Phase 9) | Impact |
|------------------------|--------------------------|--------|
| Raw `<button className="px-sm py-xs bg-primary...">` | `<Button>` | Semantic variants, theme integration |
| Raw `<input className="h-8 border...">` | `<Input />` | Consistent height, styling |
| Manual hover states | Button ghost variant | Built-in interaction states |
| Mixed styling patterns | Standardized component API | Visual consistency |
| 57 raw buttons/inputs in pages | ~20-30 remaining (table rows, deviations) | 50%+ reduction |

## Open Questions

### 1. Should Study.tsx "All Books" button be replaced?
- **What we know:** It's styled as a large card-like element, not a typical button
- **What's unclear:** Whether Button component can replicate this appearance without adding complexity
- **Recommendation:** Evaluate `<Button variant="ghost" asChild>` wrapper or keep raw. Replacement should simplify, not complicate.

### 2. Should file inputs be replaced with Input component?
- **What we know:** Settings has 2-3 file upload inputs
- **What's unclear:** Whether Input component handles file browser UI correctly
- **Recommendation:** Test in Settings.tsx first. If browser UI breaks, keep raw `<input type="file">`.

### 3. Should HighlightTableRow checkbox be replaced with Checkbox component?
- **What we know:** It has custom SVG checkmark with inline CSS for light/dark mode
- **What's unclear:** Whether Checkbox component can replicate this exact appearance
- **Recommendation:** Keep raw for now. Checkbox standardization could be separate cleanup task.

### 4. Should DataTable be removed or kept as "infrastructure-ready"?
- **What we know:** 0 imports after 3+ weeks, incompatible with current tables
- **What's unclear:** Whether future tables might need it
- **Recommendation:** REMOVE. YAGNI principle -- build it when you need it. Current DataTable doesn't fit current table needs.

### 5. What to do with TagManagerSidebar and TagSelector buttons?
- **What we know:** Both files already import Button but still have raw buttons
- **What's unclear:** Whether the raw buttons were kept intentionally or just missed in Phase 5
- **Recommendation:** Replace with Button component -- these files already use Button elsewhere, so there's no reason to mix raw and component buttons.

### 6. Should combobox triggers use Button component?
- **What we know:** Highlights.tsx has 3 combobox triggers with `role="combobox"`
- **What's unclear:** Whether Button component properly supports combobox role and aria attributes
- **Recommendation:** Yes, replace with `<Button variant="outline" size="compact">` and preserve role/aria attributes. Test dropdown functionality after replacement.

## Verification Strategy

After each file migration, verify:

```bash
# Check for remaining raw buttons in pages (excluding intentional deviations)
grep -n "<button" pages/*.tsx

# Check for remaining raw inputs in pages
grep -n "<input" pages/*.tsx

# Verify Button imports were added
grep -n "import.*Button" pages/*.tsx

# Verify Input imports were added
grep -n "import.*Input" pages/*.tsx

# Check for Button component usage
grep -n "<Button" pages/*.tsx
```

**Expected exceptions (will still appear in grep but are intentional):**
- StudySession.tsx: 4 rating buttons with raw colors (lines 636-660)
- Study.tsx: "All Books" card button (line 54) if kept raw
- DeckTable.tsx: Deck row buttons (line 36)
- HighlightTableRow.tsx: Custom checkbox (line 48), "add note" button if kept raw
- DataTable.tsx: Conditional button/div rendering (line 54) -- or removed entirely

## Sources

### Primary (HIGH confidence)
- `components/ui/button.tsx` -- Verified CVA variants and size defaults
- `components/ui/input.tsx` -- Verified h-8 default height
- `components/patterns/DataTable.tsx` -- Verified 0 imports, conditional element rendering
- `components/DeckTable.tsx` -- Verified table structure and button usage
- `.planning/v2.0-MILESTONE-AUDIT.md` -- Verified Button BROKEN, DataTable ORPHANED gaps
- `.planning/ROADMAP.md` -- Verified Phase 9 success criteria

### Secondary (MEDIUM confidence)
- Grep results for button/input counts across all files
- Component file inspection for Button/Input imports

### Tertiary (LOW confidence)
- File input compatibility with Input component -- needs testing
- Combobox button accessibility with Button component -- needs testing

## Metadata

**Confidence breakdown:**
- Button component readiness: HIGH -- already standardized and working in 2 components
- Input component readiness: HIGH -- already standardized and working in 1 component
- File-by-file migration strategy: HIGH -- all files inspected, contexts categorized
- DataTable removal decision: HIGH -- zero adoption, technical constraints, incompatible with existing tables
- Button variant mapping: HIGH -- clear decision tree based on visual weight and role
- Pitfalls: HIGH -- identified from component API and table row use cases

**Research date:** 2026-01-28
**Valid until:** Indefinite (component APIs are stable)
