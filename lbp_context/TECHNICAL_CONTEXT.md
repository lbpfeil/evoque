# EVOQUE - Technical Context for AI Agents

> **Last Updated:** 2025-12-25
> **Version:** 1.1.0
> **Status:** Production-Ready

---

## 🎯 PROJECT OVERVIEW

**What:** Web app for managing and studying Kindle highlights using spaced repetition (SM-2 algorithm)
**Stack:** React 19 + TypeScript + Vite + Supabase + Tailwind CSS
**Architecture:** SPA with optimistic UI updates and Supabase backend

---

## 🛠️ TECH STACK (ACTUAL)

```json
{
  "frontend": {
    "framework": "React 19.2.1",
    "build": "Vite 6.2.0",
    "language": "TypeScript 5.8.2",
    "routing": "react-router-dom 7.10.0 (HashRouter)",
    "styling": "Tailwind CSS 3.4.17"
  },
  "backend": {
    "database": "Supabase (PostgreSQL)",
    "auth": "Supabase Auth (email/password)",
    "storage": "Supabase Storage (book covers)"
  },
  "ui_components": {
    "library": "Custom + Radix UI primitives",
    "icons": "lucide-react",
    "charts": "recharts (unused in current code)"
  },
  "state_management": "React Context API (StoreContext + AuthContext)"
}
```

---

## 📁 PROJECT STRUCTURE

```
evoque/
├── components/           # Reusable UI components + Contexts
│   ├── AuthContext.tsx   # Authentication state
│   ├── StoreContext.tsx  # Main app state (1280 lines - CRITICAL)
│   ├── Sidebar.tsx       # Navigation + user profile (shows avatar & name)
│   ├── *Modal.tsx        # Feature-specific modals
│   └── ui/               # Base UI components (Button, Input, etc.)
├── pages/                # Route-level components
│   ├── Dashboard.tsx     # Home page (analytics)
│   ├── BookDetails.tsx   # Single book view
│   ├── Highlights.tsx    # All highlights table
│   ├── Study.tsx         # Deck selection
│   ├── StudySession.tsx  # Active study interface (550 lines)
│   ├── Settings.tsx      # Settings with 4 tabs (Import, Library, Account, Preferences)
│   └── Login.tsx         # Auth page
├── services/             # Business logic
│   ├── parser.ts         # Parse MyClippings.txt
│   ├── sm2.ts            # Spaced repetition algorithm
│   └── mockData.ts       # Deprecated (Supabase migration)
├── lib/                  # Utilities
│   ├── supabase.ts       # Supabase client
│   ├── supabaseHelpers.ts # snake_case ↔ camelCase converters
│   └── utils.ts          # cn() for Tailwind classes
├── types.ts              # TypeScript interfaces (SINGLE SOURCE OF TRUTH)
└── App.tsx               # Root component + routing
```

---

## 🔑 CORE DATA MODELS (types.ts)

```typescript
// CRITICAL: All interfaces are in types.ts (110 lines - UPDATED 2025-12-19)

Book {
  id: string (UUID)
  title: string
  author: string
  coverUrl?: string (Supabase Storage URL)
  lastImported: string (ISO date)
  highlightCount: number (derived)
}

Highlight {
  id: string (UUID)
  bookId: string (FK)
  text: string           // The "question" in study
  note?: string          // The "answer" in study
  location: string       // Kindle location
  dateAdded: string      // When highlighted in Kindle
  importedAt?: string    // When imported to app
  inStudy?: boolean      // Has StudyCard?
  tags?: string[]        // Array of tag IDs
}

StudyCard {
  id: string (UUID)
  highlightId: string (FK, UNIQUE)
  easeFactor: number (default: 2.5)
  interval: number       // Days until next review
  repetitions: number    // Times reviewed successfully
  nextReviewDate: string (ISO date)
  lastReviewedAt?: string
}

Tag {
  id: string
  name: string
  parentId?: string      // Hierarchical tags
  bookId?: string        // If set, book-specific tag
}

DailyProgress {
  date: string (YYYY-MM-DD)
  bookReviews: Record<string, number> // bookId -> count
}

StudySession {
  id: string
  date: string
  cardIds: string[]      // Queue of cards
  completedIds: string[] // Already reviewed
  results: ReviewResult[]
  history: ReviewHistory[] // For undo (Ctrl+Z)
  bookId?: string        // null = "All Books" mode
}

StudyStatus = 'new' | 'learning' | 'review'
// new: repetitions=0, interval=0
// learning: repetitions 1-4
// review: repetitions >= 5

UserSettings {
  maxReviewsPerDay: number
  newCardsPerDay: number
  dailyProgress?: DailyProgress
  fullName?: string          // NEW 2025-12-19: User's full name
  avatarUrl?: string         // NEW 2025-12-19: Avatar URL from Supabase Storage
}
```

---

## 🏗️ ARCHITECTURE PATTERNS

### **1. State Management: Context API**

```typescript
// TWO main contexts:
1. AuthContext - User authentication (Supabase Auth)
2. StoreContext - ALL app data (books, highlights, cards, tags, settings)

// StoreContext provides 30+ methods:
- CRUD operations (async with Supabase sync)
- Derived data (getDeckStats, getCardsDue)
- Session management (startSession, submitReview)
- Tag operations (addTag, assignTagToHighlight)
- Settings management (updateSettings, reloadSettings) // UPDATED 2025-12-19
```

### **2. Optimistic UI Updates**

```typescript
// STANDARD PATTERN (used in ALL mutations):
const updateData = async (id: string, updates: any) => {
  if (!user) return;
  
  // 1. Update local state immediately (optimistic)
  setState(prev => prev.map(item => 
    item.id === id ? { ...item, ...updates } : item
  ));

  // 2. Sync with Supabase
  try {
    const { error } = await supabase
      .from('table')
      .update(toSupabaseFormat(updates, user.id))
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Sync failed:', error);
    // 3. Reload from Supabase on error (rollback)
    const { data } = await supabase.from('table').select('*').eq('user_id', user.id);
    if (data) setState(data.map(fromSupabaseFormat));
  }
};
```

### **3. Supabase Integration**

```typescript
// Naming Convention Converter (lib/supabaseHelpers.ts):
// Frontend (camelCase) ↔ Backend (snake_case)

toSupabase*():   camelCase → snake_case + add user_id
fromSupabase*(): snake_case → camelCase + remove user_id

// UPDATED 2025-12-19: toSupabaseSettings & fromSupabaseSettings
// Now include: full_name ↔ fullName, avatar_url ↔ avatarUrl

// RLS (Row Level Security):
ALL tables filtered by auth.uid() = user_id
→ Users can ONLY access their own data

// Supabase Storage (NEW 2025-12-19):
Bucket: 'avatars' (public, 2MB limit, image/* only)
RLS Policies:
- INSERT: authenticated users, path = {user_id}/avatar.*
- UPDATE: authenticated users, own files only
- DELETE: authenticated users, own files only
- SELECT: public (read-only)
```

### **4. Temporary vs Persistent Data**

```typescript
// Supabase (persistent):
- books, highlights, study_cards, tags, user_settings, review_logs

// localStorage (temporary, session-specific):
- currentSession (study session state)
- dailyProgress (synced to Supabase user_settings periodically)
```

---

## 🔄 CRITICAL WORKFLOWS

### **1. Import Flow (Settings.tsx → parser.ts / pdfParser.ts / ankiParser.ts → StoreContext)**

```typescript
// TXT IMPORT (MyClippings.txt):
1. User uploads MyClippings.txt
2. parseMyClippings(text) → { books[], highlights[] }
   - Parses Kindle format (multi-line, metadata extraction)
   - Generates deterministic UUIDs (prevents duplicates)
   - Supports Portuguese dates ("22 de julho de 2025")
3. StoreContext.importData(text)
   - Deduplicates based on (text + bookId)
   - Creates StudyCards for new highlights
   - Upserts to Supabase (books, highlights, study_cards)
   - Reloads all data for consistency
4. Returns { newBooks: number, newHighlights: number }

// PDF IMPORT (Kindle PDF exports - NEW 2025-12-25):
1. User uploads PDF (Kindle "Email highlights" export)
2. parsePDFKindleHighlights(file) → { books[], highlights[] }
   - Extracts text using pdfjs-dist
   - Parses format: "Destaque (Color) [e nota] | Página X"
   - Separates highlights from notes based on spacing
   - Cleans PDF page numbers (1, 2, 3...) from content
   - Extracts book metadata: "Title por Author Visualização"
3. StoreContext.importData({ books, highlights })
   - Same deduplication and upsert logic as TXT
4. Returns { newBooks: number, newHighlights: number }

// TSV IMPORT (Anki format - NEW 2025-12-25):
1. User uploads .tsv file (Anki export)
2. parseAnkiTSV(text) → { books[], highlights[] }
   - Parses TSV format: [text]\t[note]\t[book title]\t[author]
   - Reads with Latin1 encoding (better Portuguese support)
   - Generates deterministic UUIDs for books (prevents duplicates)
   - Location: "anki-{lineNumber}"
3. StoreContext.importData({ books, highlights })
   - Same deduplication and upsert logic as PDF
4. Returns { newBooks: number, newHighlights: number }
```

### **2. Study Session Flow (Study.tsx → StudySession.tsx → sm2.ts)**

```typescript
1. User clicks "Study Book X" or "Study All Books"
2. StoreContext.startSession(bookId?)
   - Filters cards: nextReviewDate <= today
   - Respects daily limit: 10 cards/book/day
   - Creates StudySession with cardIds queue
3. StudySession.tsx renders cards one by one
   - Shows highlight (question)
   - User reveals note (answer)
   - User rates: Again(1), Hard(2), Good(3), Easy(4)
4. handleResponse(quality)
   - Calculates next review (SM-2 algorithm in sm2.ts)
   - Updates StudyCard (interval, repetitions, easeFactor, nextReviewDate)
   - Saves ReviewLog to Supabase
   - Increments DailyProgress.bookReviews[bookId]
5. Session ends when queue empty
```

### **3. Settings Page Flow (Settings.tsx - NEW 2025-12-19)**

```typescript
// Consolidated page with 4 tabs: Import, Library, Account, Preferences

1. IMPORT TAB
   - Drag & drop MyClippings.txt upload
   - Inline success notification (not full-page)
   - Shows last import stats
   - Compact drop zone (p-8 instead of p-20)

2. LIBRARY TAB
   - Compact list view (not grid)
   - Book cards: thumbnail (w-10 h-14) + metadata
   - Title truncated at 100 characters
   - Click → Navigate to /library/:bookId
   - No search field (removed for simplicity)

3. ACCOUNT TAB (UPDATED 2025-12-19)
   - Profile Photo Section:
     * Avatar upload with preview (circular, 64x64px)
     * "Change Photo" button with file input
     * Validation: image/* types only, max 2MB
     * Upload to Supabase Storage bucket 'avatars'
     * Path: {userId}/avatar.{ext}
     * RLS policies: users can CRUD their own avatars, public read
     * Cache-busting: adds ?t={timestamp} to force browser reload
   - Profile Information:
     * Full name input field (saves on blur)
     * Email (read-only)
     * Plan (read-only)
   - Statistics (books, highlights, cards count)
   - Danger Zone:
     * Two side-by-side buttons (flex gap-2)
     * Export Data: gray button with Download icon
     * Delete Account: red text button with Trash2 icon
     * Both: h-7, text-xs, border, compact design

4. PREFERENCES TAB
   - SM-2 settings (daily limit, intervals)
   - UI preferences (keyboard hints, auto-reveal)
   - Save button (backend persistence pending)

// Tab State Persistence
- Uses useSearchParams from react-router-dom
- URL format: /settings?tab=library
- State persists when navigating away and back
- Initial tab read from URL query param
```

### **4. SM-2 Algorithm (services/sm2.ts)**

```typescript
calculateNextReview(card: StudyCard, quality: 1-4) → StudyCard

// Quality mappings:
1 (Again): repetitions=0, interval=1, easeFactor unchanged
2 (Hard):  Pass, but reduced interval (1.2x multiplier), easeFactor-=0.15
3 (Good):  Pass normally, standard interval, easeFactor unchanged
4 (Easy):  Pass easily, increased interval, easeFactor+=0.15

// Interval progression (Good responses):
repetitions=0 → interval=1 day
repetitions=1 → interval=6 days
repetitions≥2 → interval *= easeFactor

// Bounds:
easeFactor: 1.3 - 2.5
interval: min 1 day
```

---

## 🎨 UI/UX CONVENTIONS

**⚠️ FULL GUIDELINES:** See `lbp_diretrizes/compact-ui-design-guidelines.md` (550 lines)

### **Quick Reference: Design System**

```css
/* Colors */
Primary: black (#000000), Hover: zinc-800
Borders: zinc-200, Text: zinc-900/zinc-400
Backgrounds: white (cards), zinc-50 (page)

/* Spacing (Compact UI - 4px base) */
Gaps: gap-0.5 (2px), gap-1 (4px), gap-2 (8px)
Padding: py-0.5 px-1.5 (items), py-1 px-2 (buttons)
Margins: mb-2 (headers), mt-1 (footers)

/* Typography */
Titles: text-base/text-lg (16-18px)
Body: text-xs/text-sm (12-14px)
Secondary: text-[9px]/text-[10px]

/* Components */
Buttons: h-7 px-3 text-xs (standard)
Inputs: h-7 px-1.5 text-xs
Icons: w-3 h-3 (standard), w-2.5 h-2.5 (buttons)
```

### **Component Patterns**

```typescript
// Modal: Radix Dialog with max-h-[85vh] overflow-y-auto
// Table: Fixed header + scrollable body (max-h-[calc(100vh-300px)])
// Study: Compact header + centered content (max-w-2xl) + fixed footer

// See lbp_diretrizes/ for full patterns:
// - modal-pattern.md
// - compact-ui-design-guidelines.md
```

---

## 🐛 KNOWN ISSUES & EDGE CASES

### **Parser Edge Cases**

```typescript
// services/parser.ts (TXT) handles:
1. Portuguese month names: "julho" → 7, "dezembro" → 12
2. Missing notes: note = undefined (not empty string)
3. Case-insensitive note detection: /Note|Nota/i
4. Multiple highlights with same text → different UUIDs (location-based)
5. Books without authors → author = "Desconhecido"

// services/pdfParser.ts (PDF - NEW 2025-12-25) handles:
1. PDF page numbers (1, 2, 3...) removed from:
   - Start of content: "2 Some text" → "Some text"
   - End of content: "...text here. 16" → "...text here."
   - Before page markers: "...text 4 Página 95" → "...text Página 95"
   - Book title/author: "1  Title" → "Title"

2. Section headers ("Página X") appear before first highlight of each page:
   - First highlight: "Página 48 Destaque..." ✅ parsed
   - Second highlight (same page): "Destaque..." ✅ also parsed
   - Regex matches "Destaque (Color) | Página X" (not "Página X Destaque...")

3. Highlight/Note separation (when "e nota" present):
   - Split by 2+ consecutive spaces (\s{2,})
   - First block = highlight, remaining blocks = note
   - Fallback: split by newlines if spacing fails

4. Text cleanup:
   - Removes trailing "Página X" section headers
   - Preserves verse numbers (3:11, 5:3) - only removes isolated numbers
   - Handles multi-page highlights (content spans PDF pages)

5. Book metadata extraction:
   - Pattern: "Title por Author Visualização"
   - Generates deterministic UUID from title+author (prevents duplicates)
```

### **Study Session Edge Cases**

```typescript
// Daily Progress Tracking:
- Resets at midnight (date comparison)
- Tracks reviews PER BOOK (10/book/day limit)
- Undo (Ctrl+Z) decrements count correctly
- Delete card during session decrements if in completedIds

// "All Books" Session:
- Alternates between books (round-robin)
- Respects individual book limits (10/book)
- Finds book via highlight.bookId for progress tracking
```

### **Optimistic UI Rollback**

```typescript
// When Supabase sync fails:
1. Log error to console
2. Reload entire dataset from Supabase
3. Local state reverts to server truth
4. User sees flash of revert (acceptable tradeoff)

// NOT IMPLEMENTED: Granular rollback (too complex for MVP)
```

---

## 📋 CODING CONVENTIONS

### **TypeScript**

```typescript
// Interfaces: PascalCase (Book, Highlight, StudyCard)
// Props: interfaces named [ComponentName]Props
// Async functions: ALWAYS return Promise<void> or Promise<T>
// State updates: IMMUTABLE (use spread, map, filter)
```

### **Naming**

```typescript
// Handlers: handle[Action] (handleSave, handleDelete)
// Boolean state: is[State] or show[State] (isLoading, showModal)
// Get functions: get[Data] (getBook, getCardsDue)
// Supabase converters: toSupabase[Type], fromSupabase[Type]
```

### **Async/Await**

```typescript
// CRITICAL: All StoreContext mutations are async
// ALWAYS await when calling from components:

✅ await updateHighlight(id, { note: 'new note' })
❌ updateHighlight(id, { note: 'new note' }) // BAD!

// Exception: Event handlers can be async without explicit await
// if they don't need to block:
const handleClick = async () => {
  await updateCard(...) // Blocks until done
  setShowModal(false)   // Runs after update
}
```

---

## 🔧 DEVELOPMENT COMMANDS

```bash
npm run dev      # Start dev server (Vite, port 5173)
npm run build    # Production build
npm run preview  # Preview production build

# Supabase:
# - Dashboard: https://supabase.com/dashboard
# - Project: [configured in .env.local - not in repo]
# - RLS enabled on ALL tables
```

---

## 🚨 CRITICAL FILES (DON'T BREAK)

```typescript
1. types.ts (102 lines)
   → SINGLE SOURCE OF TRUTH for all interfaces
   → Change here propagates everywhere

2. components/StoreContext.tsx (1260 lines)
   → ALL app state and business logic
   → 30+ methods, complex async flows
   → OPTIMISTIC UI pattern used everywhere

3. services/sm2.ts (77 lines)
   → Spaced repetition algorithm
   → Math is precise, don't alter without testing

4. services/parser.ts
   → Kindle MyClippings.txt parsing
   → Handles edge cases (Portuguese dates, missing data)
   → UUID generation is deterministic (prevents dupes)

5. services/pdfParser.ts (175 lines - NEW 2025-12-25)
   → Kindle PDF highlights export parsing
   → Uses pdfjs-dist for text extraction
   → Parses "Destaque (Color) [e nota] | Página X" format
   → Separates highlights from notes based on spacing
   → Cleans PDF artifacts (page numbers, section headers)
   → Edge cases: multi-page highlights, Portuguese format

6. services/ankiParser.ts (150 lines - NEW 2025-12-25)
   → Anki TSV format parsing
   → Format: [highlight]\t[note]\t[book title]\t[author]
   → Latin1 encoding support (better Portuguese characters)
   → Generates deterministic UUIDs (prevents duplicate books)
   → Location: "anki-{lineNumber}"
   → Edge cases: encoding fixes, empty notes, tab handling

7. lib/supabaseHelpers.ts (145 lines)
   → Naming convention converters
   → ALL Supabase operations go through these
```

---

## 📚 REFERENCE DOCS

```markdown
lbp_context/
├── TECHNICAL_CONTEXT.md             # ⚠️ THIS FILE (always include with AI)
├── README.md                        # Documentation index
├── prd.md                           # Product context (business/market/vision)
├── SETTINGS_PAGE_DESIGN.md          # ⚠️ Settings page design spec (623 lines)
├── spaced-repetition-system.md      # ⚠️ Deep dive: SM-2 algorithm (753 lines)
└── HighlightTab-context.md          # ⚠️ Deep dive: Highlights page features (483 lines)

lbp_diretrizes/
├── compact-ui-design-guidelines.md  # ⚠️ UI/UX standards (550 lines) - Updated 2025-12-19
└── modal-pattern.md                 # Modal implementation guide
```

**When to include with AI:**
- `TECHNICAL_CONTEXT.md`: ✅ **ALWAYS** (primary reference)
- `spaced-repetition-system.md`: ✅ When working on study system, SM-2, cards, intervals
- `HighlightTab-context.md`: ✅ When working on Highlights page, filters, tags, stats
- `compact-ui-design-guidelines.md`: ✅ When working on UI components, styling, layout
- `prd.md`: ⚠️ **RARELY** - only for product/market context (avoid technical specs)

---

## 🎯 IMPLEMENTATION STATUS

### ✅ **Implemented (Production Ready)**

- [x] Authentication (Supabase Auth)
- [x] MyClippings.txt import (with Portuguese dates)
- [x] Kindle PDF import (Email highlights export - NEW 2025-12-25)
- [x] Anki TSV import (Tab-separated values format - NEW 2025-12-25)
- [x] Book library (compact list view in Settings)
- [x] Highlight management (CRUD, bulk operations)
- [x] Study system (SM-2 algorithm)
- [x] Daily progress tracking (10 cards/book/day)
- [x] Hierarchical tags (global + book-specific)
- [x] Undo last review (Ctrl+Z)
- [x] Delete card during session
- [x] Inline note editing (ESC to save)
- [x] Keyboard shortcuts (Space, Enter, 1-4, E)
- [x] Optimistic UI updates
- [x] Review logs (analytics)
- [x] Settings page (4 tabs: Import, Library, Account, Preferences)
- [x] Tab state persistence via URL query params

### ⏳ **Not Implemented (PRD mentions, but NOT in code)**

- [ ] Dashboard analytics (page exists but minimal)
- [ ] Charts/graphs (recharts installed but unused)
- [ ] Cover upload (book covers hardcoded or empty)
- [ ] Export features (JSON, CSV)
- [ ] Advanced filters (date ranges, custom sorts)
- [ ] Heatmap visualization
- [ ] Gamification (badges, streaks display)
- [ ] User settings persistence to Supabase (UI exists, backend pending)

---

## 🤖 AI AGENT GUIDANCE

### **When asked to modify code:**

1. **READ types.ts FIRST** - understand data models
2. **CHECK StoreContext** - see if functionality exists
3. **FOLLOW OPTIMISTIC UI pattern** - update state → sync Supabase → rollback on error
4. **MAINTAIN CONVENTIONS** - naming, async/await, immutability
5. **TEST ASYNC FLOWS** - ensure await is used correctly
6. **PRESERVE RLS** - always pass user.id to Supabase helpers

### **When implementing new features:**

1. **ADD TYPES FIRST** - extend interfaces in types.ts
2. **UPDATE StoreContext** - add CRUD methods with optimistic UI
3. **ADD SUPABASE HELPERS** - toSupabase*/fromSupabase* converters
4. **UPDATE UI** - components consume from useStore() hook
5. **FOLLOW UI GUIDELINES** - include @lbp_diretrizes/compact-ui-design-guidelines.md for styling
6. **DOCUMENT EDGE CASES** - add comments for complex logic

### **When debugging:**

1. **CHECK CONSOLE** - optimistic UI logs errors
2. **VERIFY SUPABASE** - check if data synced (dashboard)
3. **TEST ROLLBACK** - simulate network error (disconnect)
4. **CHECK USER_ID** - RLS requires auth.uid() = user_id

---

## 📌 QUICK REFERENCE

```typescript
// Get app state:
const { books, highlights, studyCards, tags } = useStore();

// Common operations:
await importData(text)                     // Import MyClippings.txt
await addToStudy(highlightId)              // Create StudyCard
await updateCard(card)                     // Update after review
await submitReview(cardId, quality, prev)  // Save review log
await deleteHighlight(id)                  // Delete with cascade
await assignTagToHighlight(hId, tId)       // Tag a highlight

// Derived data:
const due = getCardsDue()                  // All cards due today
const stats = getDeckStats(bookId?)        // new/learning/review counts
const status = getHighlightStudyStatus(id) // 'new'|'learning'|'review'
```

---

**END OF TECHNICAL CONTEXT**

