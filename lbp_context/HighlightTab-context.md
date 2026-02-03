# Highlights Tab - Context Documentation

## Overview

The Highlights tab is the central hub for managing and reviewing all book highlights imported into Evoque. It provides a compact, efficient interface for filtering, searching, editing, and organizing highlights with integrated study management and tagging capabilities.

---

## Core Functionality

### 1. Highlight Management
- **Display:** Table view showing all highlights with key metadata
- **Editing:** Modal-based editing via `HighlightEditModal` (click on highlight text, note, or book title)
- **Deletion:** Bulk delete via checkbox selection
- **Study Integration:** All highlights are automatically added to study queue (badge indicator shows status)

### 2. Filtering & Search
- **Search:** Full-text search across highlight text and notes
- **Book Filter:** Filter by specific book or "All Books"
- **Tag Filter:** Contextual tag filtering (global tags + chapter tags for selected book)
- **Study Status Filter:** All / In Study / Not in Study
- **Sort Options:** Recently Imported, Recently Highlighted, Oldest First, Newest First

### 3. Tag Management
- **Inline Tagging:** `TagSelector` component for quick tag assignment
- **Tag Manager Sidebar:** Comprehensive tag management (create, edit, delete, organize)
- **Hierarchical Tags:** Support for global tags and book-specific chapter tags
- **Contextual Display:** Tag filter shows only relevant tags based on book selection

---

## UI Design Principles

### Compact Design Philosophy
The Highlights tab follows strict compact design guidelines to maximize information density while maintaining readability:

#### Typography
- **Table Headers:** `text-[9px]` uppercase, semibold
- **Highlight Text:** `text-xs` (12px), `font-serif`, `text-zinc-800`, `line-clamp-2`
- **Note Text:** `text-xs` (12px), `font-serif`, `text-zinc-800`, `line-clamp-2`
- **Dates:** `text-[9px]`, `text-zinc-400`
- **Book/Author:** `text-xs` for title, `text-[10px]` for author

#### Spacing
- **Cell Padding:** `px-2 py-1` (8px horizontal, 4px vertical)
- **Toolbar Padding:** `p-1.5` (6px)
- **Gaps:** `gap-1.5` (6px) between toolbar elements
- **Container Spacing:** `space-y-3` (12px) for main sections

#### Colors
- **Primary Text:** `text-zinc-800` (highlight/note content)
- **Secondary Text:** `text-zinc-600` (author, metadata)
- **Tertiary Text:** `text-zinc-400` (dates, placeholders)
- **Backgrounds:** `bg-zinc-50` (containers), `bg-white` (main)
- **Borders:** `border-zinc-200` (standard), `border-zinc-100` (subtle)

#### Interactive Elements
- **Hover States:** `hover:bg-zinc-50`, `hover:text-zinc-600`
- **Cursor Hints:** `cursor-pointer` on clickable text
- **Transitions:** `transition-colors` for smooth state changes

### Column Width Distribution
Current optimized widths (total ~100%):
- **Checkbox:** `w-8` (fixed)
- **Autor - Livro:** `15%`
- **Highlight:** `30%` (largest - primary content)
- **Note:** `15%`
- **Tags:** `20%`
- **Data:** `w-16` (64px fixed)
- **Status:** `w-16` (64px fixed)

---

## Component Architecture

### Main Component: `Highlights.tsx`
**Location:** `pages/Highlights.tsx`

**State Management:**
```typescript
// Filters
const [searchTerm, setSearchTerm] = useState('');
const [selectedBookId, setSelectedBookId] = useState('all');
const [selectedTagId, setSelectedTagId] = useState('all');
const [sortBy, setSortBy] = useState<SortOption>('imported');
const [studyFilter, setStudyFilter] = useState<'all' | 'in-study' | 'not-in-study'>('all');

// Selection & Editing
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
const [editingHighlightId, setEditingHighlightId] = useState<string | null>(null);
const [statsHighlightId, setStatsHighlightId] = useState<string | null>(null);
const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
```

**Key Features:**
1. **Contextual Tag Filtering:** Auto-resets tag filter when book selection changes
2. **Statistics in Subtitle:** Shows total highlights, books count, and last highlight date
3. **Compact Toolbar:** Single-line layout with fixed-width filters and flex-1 search
4. **Optimized Table:** Minimal padding, line-clamping, and strategic column widths

### Modal Component: `HighlightEditModal.tsx`
**Location:** `components/HighlightEditModal.tsx`

**Purpose:** Focused editing interface for individual highlights

**Features:**
- **Book Context Header:** Cover image, title, author, highlight date, location
- **Inline Editing:** Direct textarea editing for highlight text and note
- **Single Gray Containers:** No nested white containers - transparent textareas in gray bg
- **Collapsible Stats:** Study statistics section (starts closed by default)
- **Compact Footer:** Cancel/Save buttons with minimal padding

**Design Decisions:**
- Stats section starts **collapsed** to reduce initial modal height
- Textareas use `bg-transparent` and `border-0` for cleaner look
- Same `font-serif` styling for both highlight and note (consistency)
- `text-zinc-800` for all editable content

### Supporting Components

#### `TagSelector.tsx`
- Inline tag assignment with dropdown
- Shows current tags as compact badges
- Supports both global and chapter tags
- Click to open, click outside to close

#### `TagManagerSidebar.tsx`
- Comprehensive tag management interface
- Create, edit, delete, organize tags
- Hierarchical view (global vs. chapter tags)
- Accessible via toolbar button

#### `HighlightHistoryModal.tsx`
- Study statistics and review history
- Line chart showing interval progression
- Stats grid: Repetitions, Ease Factor, Next Review
- Integrated into `HighlightEditModal` as collapsible section

---

## User Workflows

### 1. Browsing & Filtering Highlights
```
User opens Highlights tab
→ Sees all highlights in compact table
→ Uses toolbar filters to narrow down:
   - Search by text/note content
   - Filter by book
   - Filter by tag (contextual to book)
   - Filter by study status
   - Sort by date/recency
→ Reviews filtered results
```

### 2. Editing a Highlight
```
User clicks on highlight text, note, or book title
→ HighlightEditModal opens
→ User edits text/note in single gray containers
→ Optionally expands stats section to view study progress
→ Clicks "Save Changes" or "Cancel"
→ Modal closes, table updates
```

### 3. Managing Tags
```
User clicks tag icon in toolbar
→ TagManagerSidebar opens
→ User creates/edits/deletes tags
→ Organizes tags into global/chapter categories
→ Closes sidebar
→ Returns to table, uses TagSelector for inline assignment
```

### 4. Bulk Operations
```
User selects multiple highlights via checkboxes
→ Bulk action button appears in toolbar
→ Option: Delete selected
→ User confirms action
→ Table updates, selection clears
```

### 5. Study Management
```
User views study status via badge in Status column
→ Badge shows study status: New, Learning, Review, or Not Started
→ All highlights are automatically added to study queue
→ No manual add/remove actions needed
```

---

## Data Flow & Integration

### Store Context Integration
The Highlights tab consumes the following from `StoreContext`:
- `highlights` - Array of all highlights
- `books` - Book metadata for display
- `studyCards` - Study status information
- `tags` - Tag definitions and assignments
- `deleteHighlight()` - Single highlight deletion
- `updateHighlight()` - Edit highlight text/note
- `bulkDeleteHighlights()` - Multi-delete
- `addToStudy()` / `removeFromStudy()` - Individual study management (rarely used)
- `getHighlightStudyStatus()` - Check highlight study status

### Computed Data
```typescript
// Statistics for subtitle
const { totalHighlights, uniqueBooks, lastHighlightDate } = useMemo(() => {
  const uniqueBookIds = new Set(highlights.map(h => h.bookId));
  const sortedByDate = [...highlights].sort((a, b) => 
    new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
  );
  return {
    totalHighlights: highlights.length,
    uniqueBooks: uniqueBookIds.size,
    lastHighlightDate: sortedByDate[0]?.dateAdded
  };
}, [highlights]);

// Filtered and sorted highlights
const filteredAndSortedHighlights = useMemo(() => {
  let filtered = highlights;
  
  // Apply search filter
  if (searchTerm) {
    filtered = filtered.filter(h => 
      h.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.note?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Apply book filter
  if (selectedBookId !== 'all') {
    filtered = filtered.filter(h => h.bookId === selectedBookId);
  }
  
  // Apply tag filter
  if (selectedTagId !== 'all') {
    filtered = filtered.filter(h => h.tagIds?.includes(selectedTagId));
  }
  
  // Apply study status filter
  if (studyFilter !== 'all') {
    filtered = filtered.filter(h => {
      const isInStudy = getHighlightStudyStatus(h.id);
      return studyFilter === 'in-study' ? isInStudy : !isInStudy;
    });
  }
  
  // Apply sorting
  return sortHighlights(filtered, sortBy);
}, [highlights, searchTerm, selectedBookId, selectedTagId, studyFilter, sortBy]);
```

---

## Key Design Decisions & Rationale

### 1. Statistics Removed from Dedicated Section
**Decision:** Integrate stats into subtitle instead of separate component
**Rationale:** 
- Saves ~80px vertical space
- Stats are informational, not actionable
- Natural language format is more readable
- Follows compact design principles

### 2. Single-Line Toolbar with Fixed Widths
**Decision:** All filters in one horizontal line with fixed widths
**Rationale:**
- Prevents layout shift when content changes
- Predictable, stable interface
- Search field uses `flex-1` to fill remaining space
- Truncation handles overflow gracefully

### 3. Modal-Based Editing (No Inline Editing)
**Decision:** Click opens modal instead of inline textarea
**Rationale:**
- Cleaner table view without edit states
- Focused editing experience
- Integrates stats view naturally
- Prevents accidental edits
- Consistent with "click for details" pattern

### 4. Actions Column Removed
**Decision:** Remove dedicated Actions column entirely
**Rationale:**
- Saves ~80px horizontal space
- Actions moved to appropriate contexts:
  - Edit → Click to open modal
  - Delete → Bulk delete via checkboxes
  - Study → Badge indicator only
  - Stats → Integrated in modal
- Cleaner, less cluttered interface

### 5. Study Buttons Removed from Status Column
**Decision:** Show only badge, no add/remove buttons
**Rationale:**
- Further simplifies interface
- Badge provides status information
- All highlights automatically added to study
- Reduces visual noise on hover

### 6. Bulk Add to Study Removed
**Decision:** Remove "Add to Study" from bulk actions
**Rationale:**
- All highlights are automatically studied
- No need for manual study management
- Simplifies bulk actions toolbar
- Only Delete action remains for bulk operations

### 7. Imported Date Column Removed
**Decision:** Remove "Importado" column, keep only "Data" (dateAdded)
**Rationale:**
- Import date less relevant than highlight date
- Saves horizontal space
- Reduces information overload
- Highlight date is more meaningful to users

### 8. Consistent Font Styling for Highlight & Note
**Decision:** Both use `font-serif` and `text-zinc-800`
**Rationale:**
- Visual consistency
- Equal importance in hierarchy
- Easier to scan
- Cleaner aesthetic

### 9. Stats Section Starts Collapsed in Modal
**Decision:** `showStats` defaults to `false`
**Rationale:**
- Reduces initial modal height
- Stats are secondary information
- User can expand when needed
- Faster modal load perception

---

## Common Modification Patterns

### Adding a New Filter
1. Add state: `const [newFilter, setNewFilter] = useState('default');`
2. Add select in toolbar (fixed width, e.g., `w-28`)
3. Update `filteredAndSortedHighlights` useMemo to apply filter
4. Ensure truncation for long option text

### Adding a New Column
1. Add `<th>` in table header with appropriate width
2. Add corresponding `<td>` in table body
3. Update `colSpan` in empty state message
4. Consider impact on horizontal space
5. Follow compact design (small text, minimal padding)

### Modifying Modal Content
1. Edit `HighlightEditModal.tsx`
2. Maintain single gray container pattern
3. Use `bg-transparent` for inputs/textareas
4. Keep footer compact (`p-2` max)
5. Ensure responsive max-width (`max-w-2xl`)

### Changing Table Styling
1. Maintain `px-2 py-1` cell padding
2. Use `text-[9px]` for headers
3. Use `text-xs` or `text-[10px]` for content
4. Apply `line-clamp-2` for long text
5. Use `text-zinc-400` for secondary info

---

## Performance Considerations

### Memoization Strategy
- **Statistics:** Computed once per highlights array change
- **Filtered Results:** Recomputed only when filters/sort change
- **Tag Lists:** Filtered based on book selection

### Rendering Optimization
- Table rows use `key={highlight.id}` for efficient updates
- Modals render conditionally (only when open)
- Tag selector uses controlled component pattern

---

## Accessibility Notes

- All interactive elements have `title` attributes
- Checkboxes are properly labeled
- Keyboard navigation supported in modals
- Color contrast meets WCAG AA standards
- Focus states visible on all inputs

---

## Future Enhancement Considerations

### Potential Improvements
1. **Virtual Scrolling:** For tables with 1000+ highlights
2. **Keyboard Shortcuts:** Quick actions (e.g., `e` to edit, `d` to delete)
3. **Advanced Search:** Regex or field-specific search
4. **Export Functionality:** Export filtered highlights to CSV/Markdown
5. **Highlight Merging:** Combine duplicate/similar highlights
6. **Batch Tagging:** Apply tags to multiple highlights at once

### Constraints to Maintain
- **Compact Design:** Any new feature must respect space constraints
- **Single-Line Toolbar:** No wrapping, use modals/popovers for complex UI
- **Modal-First Editing:** Keep table view clean and read-only
- **Consistent Typography:** Follow established font sizes and weights
- **Performance:** Maintain fast filtering/sorting even with large datasets

---

## Troubleshooting Guide

### Common Issues

**Issue:** Tag filter shows wrong tags
**Solution:** Check `useEffect` that resets tag filter when book changes

**Issue:** Modal doesn't open
**Solution:** Verify `editingHighlightId` state is being set correctly

**Issue:** Table columns misaligned
**Solution:** Ensure header `<th>` widths match body `<td>` structure

**Issue:** Filters not working
**Solution:** Check `filteredAndSortedHighlights` useMemo dependencies

**Issue:** Stats not showing in modal
**Solution:** Verify `studyCards` and `reviewLogs` data in StoreContext

---

## Related Files

### Core Files
- `pages/Highlights.tsx` - Main component
- `components/HighlightEditModal.tsx` - Edit modal
- `components/TagSelector.tsx` - Inline tag assignment
- `components/TagManagerSidebar.tsx` - Tag management
- `components/HighlightHistoryModal.tsx` - Study stats

### Context Files
- `lbp_diretrizes/design-system-guide.md` - Design system
- `types.ts` - TypeScript definitions
- `components/StoreContext.tsx` - Data management

### Style References
- Follow patterns from `design-system-guide.md`
- Maintain consistency with other tabs (Dashboard, Study, Books)

---

## Version History

**Current Version:** v2.1 (Latest)
- Removed bulk "Add to Study" action
- All highlights automatically added to study
- Simplified bulk actions (Delete only)

**Version:** v2.0 (Post-Compact Redesign)
- Removed statistics section
- Single-line toolbar
- Reduced table row height
- Removed Actions column
- Modal-based editing
- Optimized column widths

**Previous Version:** v1.0 (Original)
- Grid statistics layout
- Multi-line toolbar
- Tall table rows
- Dedicated Actions column
- Inline editing
- Import date column

---

*Last Updated: December 2025*
*Maintained by: Evoque Development Team*
