# Phase 12: StudySession UX - Research

**Researched:** 2026-01-29
**Domain:** React inline editing, UI/UX patterns, CSS typography matching
**Confidence:** HIGH

## Summary

Phase 12 focuses on four specific UX improvements to the StudySession component:
1. **STUDY-01:** Larger book cover (currently `w-10 h-14` / 40x56px)
2. **STUDY-02:** Back button as primary arrow (remove text label)
3. **STUDY-03:** Standardized edit buttons (highlight and note)
4. **STUDY-04:** Seamless inline editing (same font, size, position)

The current implementation already has inline editing in place, but the editing mode uses different styling than the display mode, causing a jarring visual transition. The core challenge is making the textarea visually identical to the blockquote/div it replaces.

**Primary recommendation:** Use CSS `font: inherit` pattern with transparent backgrounds to make textareas visually match their display counterparts. No new libraries needed -- this is pure CSS/styling work.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already in Use)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19 | UI framework | Already in codebase |
| Tailwind CSS | 3.x | Styling | Already in codebase |
| lucide-react | Latest | Icons (ArrowLeft, Edit2) | Already in codebase |

### Supporting (Already in Use)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| cn() utility | - | Class merging | Conditional styles |

### No New Libraries Needed

This phase requires only CSS/styling changes. All functionality (textarea, autoFocus, onBlur save) already exists.

**Installation:** N/A - no new dependencies.

## Architecture Patterns

### Current StudySession Structure
```
StudySession (h-screen flex flex-col)
+-- header (compact, with back button, progress, actions)
+-- main content (flex-1 overflow-y-auto)
|   +-- max-w-2xl mx-auto
|       +-- Book Info section (cover, title, author, tags)
|       +-- Highlight blockquote (OR editing textarea)
|       +-- Answer section (when revealed)
|           +-- Note div (OR editing textarea)
+-- footer (rating buttons)
```

### Pattern 1: Seamless Inline Edit
**What:** Replace display element with textarea that visually matches it exactly.
**When to use:** User clicks edit button or presses E key.

**Current Problem:**
```tsx
// Display mode: serif italic text-lg/xl, no border, no background
<blockquote className="text-lg md:text-xl font-serif italic text-foreground leading-relaxed">

// Edit mode: different container, different font, visible border/background
<div className="bg-muted border border-border rounded-md p-md">
  <textarea className="... bg-background border border-input ... font-serif" />
</div>
```

**Recommended Solution:**
```tsx
// Seamless textarea that inherits all visual styles
{isEditingHighlight ? (
  <textarea
    value={editedHighlight}
    onChange={(e) => setEditedHighlight(e.target.value)}
    onBlur={handleSaveHighlight}
    className="w-full bg-transparent border-none text-lg md:text-xl font-serif italic text-foreground leading-relaxed text-justify resize-none focus:outline-none focus:ring-0"
    style={{ minHeight: 'auto' }}
    autoFocus
  />
) : (
  <blockquote className="text-lg md:text-xl font-serif italic text-foreground leading-relaxed text-justify">
    "{currentHighlight.text}"
  </blockquote>
)}
```

Key CSS principles:
- `bg-transparent` - no background change
- `border-none` or `border-0` - no visible border
- `focus:outline-none focus:ring-0` - no focus ring
- `resize-none` - prevent manual resizing
- **Inherit all typography from display element:** same font-size, font-family, font-style, line-height, text-align

### Pattern 2: Auto-Height Textarea
**What:** Textarea automatically adjusts height to content.
**When to use:** Multi-line content that shouldn't have fixed height.

```tsx
const textareaRef = useRef<HTMLTextAreaElement>(null);

useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }
}, [editedHighlight]);

<textarea
  ref={textareaRef}
  value={editedHighlight}
  onChange={(e) => {
    setEditedHighlight(e.target.value);
    // Auto-resize on change
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }}
  className="..."
/>
```

### Pattern 3: Subtle Edit Indicator
**What:** Minimal visual cue that user is in edit mode without breaking layout.
**Options:**
1. Cursor changes to text cursor (automatic with textarea)
2. Very subtle border (1px dashed border-border/50)
3. Tiny edit icon or "editing..." label floating near text
4. Background tint (bg-muted/30)

**Recommended:** Use subtle dashed border that doesn't change element dimensions:
```tsx
<textarea className="... border border-dashed border-border/50 ..." />
```

### Anti-Patterns to Avoid
- **Container swap:** Don't wrap textarea in a different container than display mode
- **Fixed rows:** Don't use `rows={6}` which creates fixed height -- use auto-height
- **Visible focus rings:** Don't show default browser focus ring during seamless edit
- **Labels/headers in edit mode:** Don't add "Editing highlight" label that shifts content
- **Different padding:** Don't change padding between display and edit modes

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auto-resizing textarea | Complex height calculations | `scrollHeight` pattern above | Simple, reliable |
| Focus management | Manual DOM queries | `autoFocus` prop | React handles it |
| Save on blur | Custom event listeners | `onBlur={handleSave}` | Already in code |
| Typography matching | Manual pixel values | CSS `inherit` + Tailwind classes | Maintainable |

**Key insight:** The current implementation already has all the functionality (edit states, save handlers, blur events). The work is purely CSS/styling to make the textarea visually match the display element.

## Common Pitfalls

### Pitfall 1: Textarea Font Inheritance
**What goes wrong:** Textarea doesn't inherit font-family, font-size, etc. by default in browsers.
**Why it happens:** Browser default stylesheets set form elements to system fonts.
**How to avoid:** Explicitly set `font: inherit` or use Tailwind classes that match display element.
**Warning signs:** Textarea shows different font than surrounding text.

### Pitfall 2: Content Shift on Edit
**What goes wrong:** Layout jumps when switching between display and edit modes.
**Why it happens:** Different padding, margins, or element heights between modes.
**How to avoid:** Use identical container structure, padding, and positioning.
**Warning signs:** Other elements on page shift position when edit mode activates.

### Pitfall 3: Fixed Textarea Height
**What goes wrong:** Textarea cuts off long content or has excessive empty space.
**Why it happens:** Using `rows` prop or fixed height instead of auto-sizing.
**How to avoid:** Use scrollHeight-based auto-resize pattern.
**Warning signs:** Scrollbar appears inside textarea, or large empty area below text.

### Pitfall 4: Quotes in Edit Mode
**What goes wrong:** Opening/closing quotes from display mode are editable.
**Why it happens:** Including literal `"` characters in the blockquote content.
**How to avoid:** Display mode wraps text in quotes; edit mode shows raw text without quotes.
**Warning signs:** User can accidentally delete the opening quote.

### Pitfall 5: Edit Button Visibility
**What goes wrong:** Edit button always visible, cluttering the interface.
**Why it happens:** Not using hover-reveal pattern.
**How to avoid:** Keep `opacity-0 group-hover:opacity-100` pattern (already implemented).
**Warning signs:** Edit buttons compete with content for attention.

## Code Examples

Verified patterns from the codebase and best practices:

### Book Cover Sizing (STUDY-01)
```tsx
// Current: w-10 h-14 (40x56px) - too small
// Recommended: w-16 h-24 (64x96px) or w-20 h-28 (80x112px)

{currentBook.coverUrl && (
  <img
    src={currentBook.coverUrl}
    alt={currentBook.title}
    className="w-16 h-24 object-cover rounded shadow-sm flex-shrink-0"
  />
)}
```

Reference sizes from codebase:
- HighlightEditModal: `w-14 h-[86px]` (56x86px)
- Recommended for StudySession: `w-16 h-24` (64x96px) - prominent but not overwhelming

### Back Button Arrow-Only (STUDY-02)
```tsx
// Current: Arrow + text (hidden on mobile, shown on desktop)
<Button variant="ghost" onClick={handleBack} className="flex items-center gap-xxs ...">
  <ArrowLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
  <span className="text-caption text-muted-foreground hidden sm:inline">
    {t('actions.backToDecks')}
  </span>
</Button>

// Recommended: Arrow only, larger touch target
<Button
  variant="ghost"
  size="icon"
  onClick={handleBack}
  className="min-h-[40px] min-w-[40px]"
  title={t('actions.backToDecks')}
>
  <ArrowLeft className="w-5 h-5" />
</Button>
```

### Standardized Edit Button (STUDY-03)
```tsx
// Consistent edit button pattern for both highlight and note
const EditButton = ({ onClick, title }: { onClick: () => void; title: string }) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onClick}
    className="absolute -top-xxs -right-xxs p-xxs opacity-0 group-hover:opacity-100 transition-opacity"
    title={title}
  >
    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
  </Button>
);

// Usage (both highlight and note use same component)
<div className="relative group">
  {/* Content here */}
  <EditButton onClick={handleEditHighlight} title={t('edit.highlightLabel')} />
</div>
```

### Seamless Inline Edit (STUDY-04)
```tsx
// Highlight editing - matches blockquote exactly
{isEditingHighlight ? (
  <div className="relative">
    <textarea
      ref={highlightTextareaRef}
      value={editedHighlight}
      onChange={(e) => {
        setEditedHighlight(e.target.value);
        // Auto-resize
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }}
      onBlur={handleSaveHighlight}
      className={cn(
        // Match blockquote styling exactly
        "w-full text-lg md:text-xl font-serif italic text-foreground leading-relaxed text-justify",
        // Make textarea invisible
        "bg-transparent border-0 resize-none",
        // No focus decorations
        "focus:outline-none focus:ring-0",
        // Subtle edit indicator (optional)
        "border border-dashed border-border/30 rounded-sm -m-1 p-1"
      )}
      autoFocus
    />
    {isSaving && (
      <div className="absolute top-0 right-0">
        <Clock className="w-3 h-3 text-muted-foreground animate-spin" />
      </div>
    )}
  </div>
) : (
  <div className="relative group">
    <blockquote className="text-lg md:text-xl font-serif italic text-foreground leading-relaxed text-justify">
      "{currentHighlight.text}"
    </blockquote>
    <EditButton onClick={handleEditHighlight} title={t('edit.highlightLabel')} />
  </div>
)}
```

### Note Editing - Same Pattern
```tsx
// Note editing - matches note display exactly
{isEditingNote ? (
  <div className="relative">
    <textarea
      ref={noteTextareaRef}
      value={editedNote}
      onChange={(e) => {
        setEditedNote(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }}
      onBlur={handleSaveNote}
      placeholder={t('edit.notePlaceholder')}
      className={cn(
        // Match note display styling exactly
        "w-full text-lg md:text-xl font-serif text-foreground leading-relaxed text-justify whitespace-pre-wrap",
        // Make textarea invisible
        "bg-transparent border-0 resize-none",
        // No focus decorations
        "focus:outline-none focus:ring-0",
        // Subtle edit indicator
        "border border-dashed border-border/30 rounded-sm -m-1 p-1"
      )}
      autoFocus
    />
    {isSaving && (
      <div className="absolute top-0 right-0">
        <Clock className="w-3 h-3 text-muted-foreground animate-spin" />
      </div>
    )}
  </div>
) : (
  <div className="relative group">
    <div className="text-lg md:text-xl font-serif text-foreground leading-relaxed text-justify whitespace-pre-wrap">
      {currentHighlight.note}
    </div>
    <EditButton onClick={handleEditNote} title={t('note.edit')} />
  </div>
)}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Modal-based editing | Inline editing | 2025 | Faster, less disruptive |
| Fixed-height textareas | Auto-height textareas | 2024 | Better UX for variable content |
| Visible edit containers | Seamless/transparent edits | 2024 | Cleaner, more modern feel |
| Rich text editors | Plain textarea with styling | - | Simpler, faster, fewer bugs |

**Deprecated/outdated:**
- `contenteditable` approach: More complex, browser inconsistencies, sanitization issues
- WYSIWYG editors (Froala, TinyMCE): Overkill for plain text editing
- `react-edit-inline-textarea` npm package: Unnecessary when pattern is simple

## Open Questions

Things that couldn't be fully resolved:

1. **Quote handling in edit mode**
   - What we know: Display shows `"{text}"` with quotes; edit shows raw text
   - What's unclear: Should there be any visual indication of quote boundaries?
   - Recommendation: Keep current behavior (quotes are decorative, not editable)

2. **Save indicator placement**
   - What we know: Current uses Clock icon with "Press ESC to save" text
   - What's unclear: Is the text necessary for seamless editing?
   - Recommendation: Keep spinner icon only; remove text label for cleaner look

3. **Mobile touch targets**
   - What we know: Edit buttons use hover-reveal which doesn't work on touch
   - What's unclear: Should edit buttons be always visible on mobile?
   - Recommendation: Consider always-visible but more subtle on mobile (sm: breakpoint)

## Sources

### Primary (HIGH confidence)
- StudySession.tsx (current implementation) - lines 419-627
- design-system-guide.md - typography, spacing, component patterns
- HighlightEditModal.tsx - reference edit modal implementation
- index.css - CSS custom properties and tokens

### Secondary (MEDIUM confidence)
- [How to build an inline edit component in React](https://www.emgoto.com/react-inline-edit/) - React inline edit patterns
- [Custom CSS Styles for Form Inputs and Textareas | Modern CSS](https://moderncss.dev/custom-css-styles-for-form-inputs-and-textareas/) - Font inheritance for form elements

### Tertiary (LOW confidence)
- WebSearch results for inline editing patterns - general UX guidance

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries needed, all exists in codebase
- Architecture patterns: HIGH - Clear CSS-only solution path
- Pitfalls: HIGH - Common issues well-documented in web development

**Research date:** 2026-01-29
**Valid until:** 60 days (stable CSS patterns, no library dependencies)

---

## Implementation Checklist for Planner

The planner should create tasks that:

1. **STUDY-01 (Cover size):** Change `w-10 h-14` to `w-16 h-24` on book cover img
2. **STUDY-02 (Back button):** Remove text span, make button `size="icon"` with larger arrow
3. **STUDY-03 (Edit buttons):** Extract shared EditButton component, apply to both highlight and note
4. **STUDY-04 (Seamless editing):**
   - Remove wrapper div with `bg-muted border border-border rounded-md p-md`
   - Style textarea to match blockquote/div exactly
   - Add auto-resize on change
   - Remove "Press ESC to save" text, keep only spinner
   - Add subtle dashed border as edit indicator

All changes are localized to `pages/StudySession.tsx` with no new dependencies.
