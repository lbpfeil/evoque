# Phase 6: Page Migration - Research

**Researched:** 2026-01-28
**Domain:** React page standardization with design tokens and composition patterns
**Confidence:** HIGH

## Summary

Phase 6 migrates all 6 pages (Dashboard, Highlights, Study, StudySession, Settings, Login) plus 4 modals to use canonical patterns established in Phases 4-5. The "BookDetails" page mentioned in requirements was removed from the codebase (PAGE-05 is obsolete).

The primary tools are:
1. **PageHeader** composition component (size='default' for Dashboard/Highlights, size='compact' for Study/Settings)
2. **DataTable** composition component (for DeckTable replacement if needed, and potentially Highlights table)
3. **Design tokens** (text-title, text-heading, text-body, text-caption, text-overline for typography; status colors for badges)

**Key finding:** There are 50+ arbitrary Tailwind values (`text-[10px]`, `text-[9px]`, `text-[11px]`, `text-[8px]`, `w-[Npx]`) scattered across pages and components. The token `text-overline` (10px) covers most of these, but `text-[9px]` has no exact token match and must be migrated to `text-overline` (10px) or `text-caption` (12px).

**Primary recommendation:** Migrate pages in waves grouped by complexity: (1) Login as simplest standalone page, (2) Dashboard/Study as similar structure pages, (3) Settings as moderate complexity, (4) StudySession with intentional deviations, (5) Highlights as most complex with custom table.

## Current State Audit

### Page Analysis

| Page | Lines | Header Pattern | Table? | Arbitrary Values | Migration Complexity |
|------|-------|----------------|--------|------------------|---------------------|
| Dashboard.tsx | 111 | `text-3xl font-bold` | No | None | LOW |
| Highlights.tsx | 561 | `text-3xl font-bold` | Custom table | 25+ `text-[10px]`, `w-[Npx]` | HIGH |
| Study.tsx | 136 | `text-base font-semibold` | Uses DeckTable | 5 `text-[10px]` | LOW |
| StudySession.tsx | 713 | N/A (custom header) | No | 13 `text-[9px]`, `text-[10px]` | MEDIUM (intentional deviations) |
| Settings.tsx | 800 | `text-base font-semibold` | Book list | 15+ `text-[9px]`, `text-[10px]` | MEDIUM |
| Login.tsx | 120 | `text-2xl font-bold` | No | None | LOW |

#### Dashboard.tsx
**Current:**
- Header: `<h1 className="text-3xl font-bold text-foreground tracking-tight">`
- Description: `<p className="text-muted-foreground mt-2 font-light">`
- Layout: `space-y-12` between sections

**Migration:**
- Replace header with `<PageHeader title={t('title')} description={t('subtitle')} size="default" />`
- Text: Already uses semantic colors (text-foreground, text-muted-foreground)
- Spacing: `space-y-12` = 48px = `space-y-2xl` token

**Deviations:** None. Clean migration.

#### Highlights.tsx
**Current:**
- Header: `<h1 className="text-3xl font-bold text-foreground tracking-tight">` with actions button
- Complex custom table with hardcoded column widths (`w-[40px]`, `w-[180px]`, `w-[280px]`, etc.)
- Toolbar with inline styles and `text-[10px]`
- Bulk actions bar with `text-[10px]`

**Migration:**
- Replace header with `<PageHeader title={...} description={...} actions={<ManageTagsButton />} size="default" />`
- Table: Keep custom table (DataTable doesn't support selection, sorting, or responsive columns the same way)
- Replace `text-[10px]` with `text-overline`
- Replace column widths with token equivalents where possible

**Deviations:** Custom table structure must remain for bulk selection and sorting features.

#### Study.tsx
**Current:**
- Header: `<h1 className="text-base font-semibold text-foreground">` (compact style)
- Uses `<DeckTable>` component
- "All Books" button with `text-[10px]` labels

**Migration:**
- Replace header with `<PageHeader title={t('title')} description={t('subtitle')} size="compact" />`
- DeckTable stays as-is (it's already well-structured)
- Replace `text-[10px]` with `text-overline`

**Deviations:** None.

#### StudySession.tsx (Special Handling Required)
**Current:**
- Custom full-screen layout with fixed header/footer
- Serif font for highlight text: `font-serif italic text-lg md:text-xl`
- Rating buttons with explicit colors: `bg-red-500`, `bg-amber-500`, `bg-blue-500`, `bg-green-500`
- Tags display with `text-[9px]` font size
- Edit labels with `text-[10px]` uppercase

**Intentional Deviations to Preserve:**
1. **Serif font** (`font-serif`) for highlight/note display - reading experience
2. **Italic styling** on blockquotes - literary presentation
3. **Rating button colors** - semantic (red=again, amber=hard, blue=good, green=easy) not random
4. **Full-screen fixed layout** - immersive study experience

**Migration:**
- Rating buttons: Keep explicit colors (these ARE semantic, just not using status tokens because they represent user actions, not card states)
- Replace `text-[9px]` and `text-[10px]` with `text-overline` (10px)
- Preserve `font-serif` and `italic` on content areas

#### Settings.tsx
**Current:**
- Header: `<h1 className="text-base font-semibold text-foreground">` (compact style)
- Tab navigation with custom buttons
- Multiple subsections with `text-xs font-semibold text-muted-foreground` headers
- Form inputs with `text-[10px]` helper text
- Book list with `text-[9px]` and `text-[10px]` labels

**Migration:**
- Replace header with `<PageHeader title={t('title')} description={t('subtitle')} size="compact" />`
- Replace `text-[9px]` with `text-overline` (visual change: 9px -> 10px)
- Replace `text-[10px]` with `text-overline`
- Consider token spacing for consistent padding/gaps

**Deviations:** None required.

#### Login.tsx
**Current:**
- Centered card layout
- Logo with `text-2xl font-bold`
- Form with standard inputs
- No arbitrary values

**Migration:**
- Consider using `text-title` (30px) or `text-heading` (18px) for logo
- Minimal changes needed - already clean

**Deviations:** None.

### Modal Analysis

| Modal | Current Styling | Issues | Migration Need |
|-------|-----------------|--------|----------------|
| BookContextModal.tsx | `p-6`, `text-[10px]` labels | Arbitrary text sizes | Replace with text-overline |
| DeleteBookModal.tsx | Uses AlertDialog (shadcn) | None | Minimal |
| HighlightEditModal.tsx | `p-3`, `text-[9px]` labels | Multiple arbitrary sizes | Replace with text-overline |
| HighlightHistoryModal.tsx | Standard Dialog | None | Minimal |
| DeleteCardPopover.tsx | AlertDialog, `max-w-xs` | None | Minimal |
| EmptyDeckPopover.tsx | AlertDialog, `max-w-xs` | None | Minimal |

**Modal Standardization Needs:**
1. **Padding:** Currently inconsistent (p-0, p-3, p-4, p-6) - standardize to token values (p-md, p-lg)
2. **Header style:** DialogTitle varies (text-base, text-sm, text-2xl) - standardize
3. **Button placement:** All use DialogFooter with right-aligned buttons - consistent
4. **Typography:** Replace `text-[9px]` and `text-[10px]` with `text-overline`

### Arbitrary Values Audit

**Pages - text-[Npx] occurrences:**

| File | Count | Values | Replacement |
|------|-------|--------|-------------|
| StudySession.tsx | 13 | `text-[9px]`, `text-[10px]` | `text-overline` |
| Settings.tsx | 15 | `text-[9px]`, `text-[10px]`, `text-[11px]` | `text-overline` or `text-caption` |
| Highlights.tsx | 5 | `text-[10px]` | `text-overline` |
| Study.tsx | 5 | `text-[10px]` | `text-overline` |
| Dashboard.tsx | 0 | - | - |
| Login.tsx | 0 | - | - |

**Pages - w-[Npx] occurrences (column widths):**

| File | Count | Values | Handling |
|------|-------|--------|----------|
| Highlights.tsx | 8 | `w-[40px]`, `w-[180px]`, `w-[280px]`, `w-[140px]`, `w-[80px]`, `w-[90px]` | Keep for table columns (intentional responsive breakpoints) |
| HighlightTableRow.tsx | 6 | Same column widths | Keep (paired with Highlights.tsx) |

**Components - text-[Npx] occurrences:**

| File | Count | Values | Replacement |
|------|-------|--------|-------------|
| DeckTable.tsx | 1 | `text-[10px]` | `text-overline` |
| StudyStatusBadge.tsx | 4 | `text-[10px]` | `text-overline` |
| HighlightEditModal.tsx | 5 | `text-[9px]` | `text-overline` |
| BookContextModal.tsx | 2 | `text-[10px]` | `text-overline` |
| TagManagerSidebar.tsx | 3 | `text-[9px]` | `text-overline` |
| TagSelector.tsx | 1 | `text-[10px]` | `text-overline` |
| StudyHeatmap.tsx | 2 | `text-[8px]` | Consider keeping (very small for heatmap) |
| BottomNav.tsx | 1 | `text-[10px]` | `text-overline` |
| Sidebar.tsx | 1 | `text-[10px]` | `text-overline` |

**Total arbitrary text sizes: ~60 occurrences**

## Available Tools

### Design Tokens (from Phase 4)

**Typography Scale:**
```
text-display   → 32px (hero text, unused in current pages)
text-title     → 30px (page titles - Dashboard, Highlights)
text-heading   → 18px (section headings - Study, Settings compact headers)
text-body      → 14px (default body text)
text-caption   → 12px (metadata, labels)
text-overline  → 10px (tiny labels, replaces text-[10px])
```

**Spacing Scale:**
```
space-xxs → 4px   (gap-xxs, p-xxs)
space-xs  → 8px   (gap-xs, p-xs)
space-sm  → 12px  (gap-sm, p-sm)
space-md  → 16px  (gap-md, p-md)
space-lg  → 24px  (gap-lg, p-lg)
space-xl  → 32px  (gap-xl, p-xl)
space-2xl → 48px  (gap-2xl, p-2xl)
space-3xl → 64px  (gap-3xl, p-3xl)
```

**Status Colors:**
```
bg-status-new       → Blue (new cards)
bg-status-learning  → Amber (learning cards)
bg-status-review    → Green (review cards)
text-status-foreground → White on status badges
```

**Tag Colors:**
```
bg-tag-global → Blue (global tags)
bg-tag-book   → Amber (book-specific tags)
```

### Composition Components (from Phase 5)

**PageHeader:**
```tsx
import { PageHeader } from '../components/patterns/PageHeader'

// Destination pages (Dashboard, Highlights)
<PageHeader
  title={t('title')}
  description={t('subtitle')}
  size="default"  // text-title (30px)
/>

// Tool pages (Study, Settings)
<PageHeader
  title={t('title')}
  description={t('subtitle')}
  size="compact"  // text-heading (18px)
/>

// With actions
<PageHeader
  title={t('title')}
  description={t('subtitle')}
  actions={<Button onClick={...}>Action</Button>}
/>
```

**DataTable:**
```tsx
import { DataTable, Column } from '../components/patterns/DataTable'

const columns: Column<Item>[] = [
  { key: 'name', header: 'Name', render: (item) => item.name },
  { key: 'count', header: 'Count', render: (item) => item.count, className: 'text-right' },
]

<DataTable
  columns={columns}
  data={items}
  gridCols="grid-cols-[1fr_80px]"
  gridColsSm="sm:grid-cols-[1fr_80px_80px]"
  onRowClick={(item) => handleClick(item)}
  emptyMessage="No items found"
/>
```

## Migration Strategy

### Page Categorization

**Category A: Clean Pages (minimal changes)**
- Login.tsx - no arbitrary values, simple layout
- Dashboard.tsx - no arbitrary values, uses PageHeader pattern naturally

**Category B: Header + Minor Token Updates**
- Study.tsx - replace header, fix 5 `text-[10px]`
- Settings.tsx - replace header, fix 15+ arbitrary values

**Category C: Complex with Custom Patterns**
- Highlights.tsx - custom table must stay, fix arbitrary values
- StudySession.tsx - intentional deviations, fix arbitrary values

### Wave Recommendation

**Wave 1: Login (standalone, simplest)**
- Replace logo text with appropriate token
- Verify no regressions

**Wave 2: Dashboard + Study (similar patterns)**
- Both use PageHeader naturally
- Dashboard: size='default', Study: size='compact'
- Fix Study's `text-[10px]` instances

**Wave 3: Settings (moderate complexity)**
- Replace header with PageHeader size='compact'
- Fix 15+ arbitrary text values
- Consider standardizing tab styling

**Wave 4: StudySession (intentional deviations)**
- Document preserved deviations explicitly
- Fix arbitrary values while preserving serif/italic
- Keep rating button colors as-is (semantic purpose)

**Wave 5: Highlights (most complex)**
- Replace header with PageHeader + actions
- Fix arbitrary values in toolbar/table
- Keep custom table structure (selection/sorting needs)

**Wave 6: Modals (cross-cutting)**
- Standardize padding (p-md or p-lg)
- Replace all `text-[9px]`/`text-[10px]` with text-overline
- Verify consistent header styling

### StudySession Special Handling

**PRESERVE (intentional deviations):**
1. `font-serif` on highlight text and notes - literary reading experience
2. `italic` on blockquote - traditional quotation styling
3. Rating button colors (`bg-red-500`, `bg-amber-500`, `bg-blue-500`, `bg-green-500`) - semantic user feedback mapping
4. Full-height fixed layout (`h-screen flex flex-col`) - immersive study mode

**MIGRATE:**
1. `text-[9px]` → `text-overline` (10px) for tag badges
2. `text-[10px]` → `text-overline` (10px) for labels
3. Spacing values where semantic tokens fit

**DO NOT MIGRATE:**
- `text-lg md:text-xl` for highlight text - intentionally larger for reading
- `text-sm` for note text - intentional hierarchy
- Fixed header/footer layout - core UX pattern

## Key Risks

### Risk 1: text-[9px] to text-overline Visual Change
**What:** `text-[9px]` becomes `text-overline` (10px) - 11% size increase
**Impact:** Tags and labels in StudySession/Settings may appear slightly larger
**Mitigation:** Accept as intentional standardization. 9px is too small for accessibility.

### Risk 2: Highlights Table Column Widths
**What:** Table uses hardcoded widths (`w-[180px]`, `w-[280px]`, etc.)
**Impact:** Cannot use DataTable; must keep custom table
**Mitigation:** Keep custom table but standardize other aspects (typography, colors)

### Risk 3: Modal Padding Inconsistency
**What:** Modals have varying padding (p-0, p-3, p-4, p-6)
**Impact:** Changing padding may affect content layout
**Mitigation:** Apply token padding (p-md, p-lg) carefully, verify each modal

### Risk 4: DeckTable vs DataTable
**What:** DeckTable has domain-specific logic (stats, responsive columns)
**Impact:** Cannot simply replace with DataTable
**Mitigation:** Keep DeckTable as-is; DataTable is for future/simpler tables

### Risk 5: StudySession Rating Buttons
**What:** Uses hardcoded colors instead of status tokens
**Impact:** Could seem inconsistent with token system
**Mitigation:** Document as intentional - these represent user actions (Again/Hard/Good/Easy), not card states (New/Learning/Review)

## Open Questions

1. **text-[11px] in Settings.tsx**
   - What we know: One instance of `text-[11px]` (between 10px and 12px)
   - Recommendation: Migrate to `text-overline` (10px) or `text-caption` (12px) depending on context

2. **text-[8px] in StudyHeatmap.tsx**
   - What we know: Very small text for heatmap day labels
   - Recommendation: Consider keeping `text-[8px]` as intentional exception (heatmap has unique space constraints)

3. **BookDetails (PAGE-05)**
   - What we know: Page was removed from codebase
   - Recommendation: Mark PAGE-05 as OBSOLETE in requirements

## Sources

### Primary (HIGH confidence)
- `pages/*.tsx` - Direct code analysis
- `components/patterns/*.tsx` - Phase 5 composition components
- `index.css` - Design token definitions
- `tailwind.config.js` - Token mappings
- `.planning/phases/05-component-standardization/05-VERIFICATION.md` - Phase 5 outcomes

### Secondary (MEDIUM confidence)
- `.planning/phases/04-token-foundation/04-01-PLAN.md` - Token system design intent
- `.planning/phases/05-component-standardization/05-02-PLAN.md` - Composition pattern design intent

## Metadata

**Confidence breakdown:**
- Current state audit: HIGH - based on direct code analysis
- Token availability: HIGH - verified in index.css and tailwind.config.js
- Migration strategy: MEDIUM - based on pattern analysis, needs validation during execution
- Risk assessment: MEDIUM - some edge cases may emerge during implementation

**Research date:** 2026-01-28
**Valid until:** 2026-02-28 (30 days - stable domain)
