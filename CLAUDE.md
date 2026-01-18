# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Recent Updates (January 2026)

**Major features implemented:**
- ✅ **Review Activity Heatmap**: Anki-style visualization with streaks (StudyHeatmap.tsx - 377 lines)
- ✅ **Dark Mode**: Complete theme system with light/dark/system modes (useTheme hook + ThemeToggle)
- ✅ **Study Status Badges**: Visual indicators for card states (new/learning/review)
- ✅ **Book Cover Uploads**: Image processing with cache-busting
- ✅ **Duplicate Book Detection**: Prevents re-importing by title+author matching
- ✅ **Mobile Optimizations**: Responsive heatmap, bottom navigation, touch-friendly UI
- ✅ **Timezone Fixes**: Correct local date handling for heatmap and daily progress

## Project Overview

EVOQUE is a web app for managing and studying Kindle highlights using spaced repetition (SM-2 algorithm). Built with React 19, TypeScript, Vite, Supabase (PostgreSQL), and Tailwind CSS.

## Development Commands

```bash
# Development
npm run dev      # Start dev server (Vite, http://localhost:3000)
npm run build    # Production build
npm run preview  # Preview production build

# PWA Asset Generation (already configured)
npx pwa-asset-generator # Generate PWA icons and assets
```

## Core Architecture

### State Management
Two React Context providers manage all application state:
- **AuthContext** (`components/AuthContext.tsx`): Supabase authentication
- **StoreContext** (`components/StoreContext.tsx`): ALL app data (books, highlights, study cards, tags, settings)
  - 1800+ lines - the heart of the application
  - 30+ async methods with optimistic UI pattern
  - Every mutation: update local state → sync Supabase → rollback on error

### Data Flow Pattern (Critical)
```typescript
// ALL mutations follow this optimistic UI pattern:
1. Update local state immediately (optimistic)
2. Sync with Supabase asynchronously
3. On error: reload from Supabase (rollback)
```

### Database Integration
- **Backend**: Supabase (PostgreSQL) with Row Level Security (RLS) on all tables
- **Naming Convention**: Frontend uses camelCase, Supabase uses snake_case
- **Converters**: `lib/supabaseHelpers.ts` handles all transformations
  - `toSupabase*()`: camelCase → snake_case + add user_id
  - `fromSupabase*()`: snake_case → camelCase + remove user_id
- **Storage**: Supabase Storage bucket 'avatars' for user profile photos (public, 2MB limit)

### Type System
- **Single Source of Truth**: `types.ts` (all TypeScript interfaces)
- **Key Models**: Book, Highlight, StudyCard, Tag, UserSettings, StudySession
- **Never** create duplicate type definitions elsewhere

## File Structure

```
evoque/
├── components/
│   ├── StoreContext.tsx          # ⚠️ CRITICAL: All app state + business logic (1800 lines)
│   ├── AuthContext.tsx            # Authentication state
│   ├── Sidebar.tsx                # Main navigation (desktop)
│   ├── BottomNav.tsx              # Bottom navigation (mobile)
│   ├── StudyHeatmap.tsx           # Anki-style review activity heatmap (377 lines)
│   ├── StudyStatusBadge.tsx       # Card status indicators (new/learning/review)
│   ├── ThemeToggle.tsx            # Dark mode toggle with system preference
│   ├── DeckTable.tsx              # Book deck selection table
│   ├── TagManagerSidebar.tsx      # Hierarchical tag management
│   ├── *Modal.tsx                 # Feature-specific modals
│   └── ui/                        # Radix UI + custom base components
├── pages/
│   ├── Dashboard.tsx              # Analytics (minimal implementation)
│   ├── Highlights.tsx             # All highlights with filters/tags
│   ├── Study.tsx                  # Deck selection with heatmap
│   ├── StudySession.tsx           # Active study interface (700 lines)
│   ├── Settings.tsx               # 4 tabs: Import, Library, Account, Preferences
│   └── Login.tsx                  # Authentication
├── services/
│   ├── parser.ts                  # MyClippings.txt parser (Kindle TXT exports)
│   ├── pdfParser.ts               # Kindle PDF highlights parser
│   ├── ankiParser.ts              # Anki TSV format parser
│   ├── idUtils.ts                 # Deterministic UUID generation (prevents duplicates)
│   └── sm2.ts                     # ⚠️ Spaced repetition algorithm (precise math)
├── hooks/
│   ├── useTheme.ts                # Theme management with system preference detection
│   └── useSidebarCollapse.ts      # Sidebar collapse state management
├── lib/
│   ├── supabase.ts                # Supabase client
│   ├── supabaseHelpers.ts         # ⚠️ CRITICAL: snake_case ↔ camelCase converters
│   ├── imageUtils.ts              # Image resizing and optimization for covers/avatars
│   └── utils.ts                   # Tailwind cn() utility
└── types.ts                       # ⚠️ CRITICAL: Single source of truth for all types
```

## Critical Workflows

### Import System
Three import formats supported, all with deterministic ID generation (prevents duplicates):
1. **MyClippings.txt** (`services/parser.ts`): Kindle TXT exports with Portuguese date support
2. **PDF** (`services/pdfParser.ts`): Kindle "Email highlights" PDF exports
3. **Anki TSV** (`services/ankiParser.ts`): Tab-separated values with Latin1 encoding

**Duplicate Prevention**:
- **Books**: Detects duplicates by matching title + author (case-insensitive)
- **Highlights**: Deterministic UUID generation using hash(Title + Author + Location + Content)
- **Graveyard System**: `deleted_highlights` table prevents deleted highlights from being re-imported. Tracks by both `highlight_id` (primary) and `text_content` (fallback). Automatically cleared when book is deleted.

### Study Session Flow
1. User selects deck (book or "All Books")
2. `StoreContext.startSession(bookId?)` creates queue of due cards
3. Cards presented one at a time (highlight → note)
4. User rates: Again(1), Hard(2), Good(3), Easy(4)
5. SM-2 algorithm calculates next review date
6. Updates saved to `study_cards` and logged to `review_logs`

**Daily Limits**: Respects per-book settings or global defaults (10 reviews/book/day default)

### Review Activity Heatmap
- **Component**: `StudyHeatmap.tsx` displays Anki-style heatmap on Study page
- **Data source**: Aggregates `review_logs` by date (local timezone)
- **Features**:
  - Color intensity based on percentiles (0-4 levels)
  - Current and longest streak tracking (with grace period)
  - Responsive: adapts to container width (14-52 weeks)
  - Hover tooltips showing date and review count
  - Month labels and day-of-week indicators
  - Mobile-optimized with compact 10px cells
- **Timezone handling**: Converts UTC timestamps to browser's local timezone for date aggregation
- **Grace period**: Current streak maintained if studied yesterday but not yet today

### Settings & Preferences
- **Per-Book Settings**: Each book can override global defaults for daily review limit and initial ease factor
- **User Settings**: Profile (name, avatar), daily limits, default ease factor, theme preference
- **Auto-save**: All settings save on change (no Save button)

### Theme System
- **Three modes**: Light, Dark, and System (follows OS preference)
- **Implementation**: `useTheme` hook manages theme state with `prefers-color-scheme` media query
- **Persistence**: Theme saved to Supabase settings and localStorage for PWA offline support
- **Dark mode**: Full Tailwind CSS dark mode classes throughout the app (dark:*)
- **Component**: `ThemeToggle` cycles through modes (system → light → dark → system)

### Book Covers & Avatars
- **Upload**: User profile avatars and book covers (future feature)
- **Storage**: Supabase Storage bucket 'avatars' (public, 2MB limit)
- **Processing**: `lib/imageUtils.ts` resizes images to fit max dimensions with quality optimization
- **Cache-busting**: Timestamp query params prevent stale cached images after upload

## Coding Conventions

### TypeScript
- **Interfaces**: PascalCase (Book, Highlight, StudyCard)
- **Props**: Named `[ComponentName]Props`
- **Async functions**: Always explicitly return `Promise<void>` or `Promise<T>`
- **Immutability**: Use spread, map, filter for state updates

### Naming Patterns
```typescript
// Handlers
handleSave, handleDelete, handleSubmit

// Boolean state
isLoading, showModal, hasError

// Data getters
getBook, getCardsDue, getDeckStats

// Supabase converters
toSupabaseBook, fromSupabaseHighlight

// Custom hooks
useTheme, useSidebarCollapse, useStore, useAuth
```

### Critical Async Pattern
```typescript
// ✅ CORRECT: Always await StoreContext mutations
await updateHighlight(id, { note: 'new note' })

// ❌ WRONG: Missing await causes state inconsistency
updateHighlight(id, { note: 'new note' })
```

## UI/UX Guidelines

Full guidelines in `lbp_diretrizes/compact-ui-design-guidelines.md` (550 lines). Key principles:

### Design System v1.2 (Updated 2026-01-18)
```css
/* Typography (increased for better legibility) */
H1/Titles: text-lg (18px)
Normal text: text-sm (14px)
Secondary/Metadata: text-xs (12px)

/* Colors (Light Mode / Dark Mode) */
Primary: black (#000000) / white
Borders: zinc-200 / zinc-800
Backgrounds: white (cards), zinc-50 (page) / zinc-900 (cards), zinc-950 (page)
Text: zinc-900 / zinc-100
Secondary text: zinc-500 / zinc-400

/* Dark Mode Pattern */
All color classes use dark: variants (e.g., dark:bg-zinc-900, dark:text-zinc-100)
Theme follows Tailwind CSS dark mode class strategy

/* Spacing (Compact - 4px base unit) */
Gaps: gap-1 (4px), gap-2 (8px)
Padding: py-0.5 px-1.5 (items), py-1 px-2 (buttons)

/* Components */
Buttons: h-7 px-3 text-xs
Inputs: h-7 px-1.5 text-xs
Icons: w-3 h-3 (standard), w-3.5 h-3.5 (ThemeToggle)
```

### Component Patterns
- **Modals**: Radix Dialog with `max-h-[85vh] overflow-y-auto`
- **Tables**: Fixed header + scrollable body
- **Study**: Centered content (max-w-2xl) + fixed footer
- **Heatmap**: Grid layout with responsive week count (14-52 weeks based on container width)
- **Status Badges**: Inline-flex with icons, colored backgrounds, and uppercase text
- **Theme Toggle**: Cycles through system → light → dark with appropriate icons

## Known Edge Cases

### Parser Edge Cases
- **Portuguese dates**: "22 de julho de 2025" → proper Date object
- **PDF page numbers**: Automatically stripped (1, 2, 3... artifacts)
- **Highlight/Note separation**: PDF parser splits by 2+ consecutive spaces
- **Missing metadata**: Books without authors → "Desconhecido"

### ID Stability
- **Deterministic IDs**: hash(Title + Author + Location + Content)
- **Known issues**: Documented in `lbp_implementation/id-stability-improvement-options.md`
  - Spacing variations in PDF exports
  - Page number changes between exports (rare)

### Daily Progress
- Resets at midnight (date comparison)
- Tracked per book (separate limits)
- Undo (Ctrl+Z) correctly decrements count

## Critical Files (Exercise Extreme Caution)

1. **types.ts**: All interface definitions - changes propagate everywhere
2. **components/StoreContext.tsx**: All app state and business logic (1800 lines)
3. **services/sm2.ts**: Spaced repetition algorithm - math is precise
4. **services/parser.ts**: Kindle TXT parser with edge case handling
5. **services/pdfParser.ts**: PDF parser with complex text extraction
6. **lib/supabaseHelpers.ts**: All Supabase operations go through these converters
7. **components/StudyHeatmap.tsx**: Complex date/timezone logic for review activity visualization
8. **pages/StudySession.tsx**: Study interface with keyboard shortcuts and undo logic (700 lines)

## Reference Documentation

Located in `lbp_context/` and `lbp_diretrizes/`:

**Include with AI when working on:**
- Study system / SM-2 / cards → `spaced-repetition-system.md`
- Highlights page / filters / tags → `HighlightTab-context.md`
- UI components / styling → `compact-ui-design-guidelines.md`
- Settings page → `SETTINGS_PAGE_DESIGN.md`
- PWA / mobile / offline → `PWA_MOBILE_IMPLEMENTATION.md`
- Performance optimization → `PERFORMANCE_OPTIMIZATIONS.md`
- Modal patterns → `modal-pattern.md`

**Primary reference (always include):**
- `lbp_context/TECHNICAL_CONTEXT.md` - comprehensive technical spec

## Implementation Status

### Implemented
- MyClippings.txt, PDF, and Anki TSV imports with duplicate detection
- SM-2 spaced repetition with daily limits
- Per-book settings (review limits, ease factor)
- Hierarchical tags (global + book-specific)
- Optimistic UI with Supabase sync
- Keyboard shortcuts (Space, Enter, 1-4, E, Ctrl+Z)
- Review logs and history
- Progressive Web App (PWA) with offline support
- **Heatmap visualization**: Anki-style review activity heatmap with streaks
- **Dark mode**: Full theme system (light/dark/system) with localStorage persistence
- **Book cover uploads**: Image resizing, optimization, and cache-busting
- **Duplicate book detection**: Prevents re-importing books by title+author match
- **Study status badges**: Visual indicators for card states (new/learning/review)
- **Mobile-responsive**: Bottom navigation, responsive heatmap, touch-optimized

### Not Implemented (PRD mentions, but not in code)
- Dashboard analytics (page exists but minimal - mock data)
- Export features (JSON, CSV)
- Advanced filters and custom sorts
- Gamification displays

## Development Notes

- **PWA**: Configured with vite-plugin-pwa, manifest in vite.config.ts
- **Routing**: Uses HashRouter (react-router-dom) for GitHub Pages compatibility
- **Environment**: Supabase credentials in `.env` (not in repo)
- **RLS**: ALL tables require auth.uid() = user_id
- **Scripts**: Utility scripts in `scripts/` for database inspection and debugging
