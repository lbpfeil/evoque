# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
  - 1280+ lines - the heart of the application
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
│   ├── StoreContext.tsx      # ⚠️ CRITICAL: All app state + business logic
│   ├── AuthContext.tsx        # Authentication state
│   ├── Sidebar.tsx            # Main navigation
│   ├── *Modal.tsx             # Feature-specific modals
│   └── ui/                    # Radix UI + custom base components
├── pages/
│   ├── Dashboard.tsx          # Analytics (minimal implementation)
│   ├── Highlights.tsx         # All highlights with filters/tags
│   ├── Study.tsx              # Deck selection
│   ├── StudySession.tsx       # Active study interface (550 lines)
│   ├── Settings.tsx           # 4 tabs: Import, Library, Account, Preferences
│   └── Login.tsx              # Authentication
├── services/
│   ├── parser.ts              # MyClippings.txt parser (Kindle TXT exports)
│   ├── pdfParser.ts           # Kindle PDF highlights parser
│   ├── ankiParser.ts          # Anki TSV format parser
│   ├── idUtils.ts             # Deterministic UUID generation (prevents duplicates)
│   └── sm2.ts                 # ⚠️ Spaced repetition algorithm (precise math)
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── supabaseHelpers.ts     # ⚠️ CRITICAL: snake_case ↔ camelCase converters
│   └── utils.ts               # Tailwind cn() utility
└── types.ts                   # ⚠️ CRITICAL: Single source of truth for all types
```

## Critical Workflows

### Import System
Three import formats supported, all with deterministic ID generation (prevents duplicates):
1. **MyClippings.txt** (`services/parser.ts`): Kindle TXT exports with Portuguese date support
2. **PDF** (`services/pdfParser.ts`): Kindle "Email highlights" PDF exports
3. **Anki TSV** (`services/ankiParser.ts`): Tab-separated values with Latin1 encoding

**Graveyard System**: `deleted_highlights` table prevents deleted highlights from being re-imported. Tracks by both `highlight_id` (primary) and `text_content` (fallback). Automatically cleared when book is deleted.

### Study Session Flow
1. User selects deck (book or "All Books")
2. `StoreContext.startSession(bookId?)` creates queue of due cards
3. Cards presented one at a time (highlight → note)
4. User rates: Again(1), Hard(2), Good(3), Easy(4)
5. SM-2 algorithm calculates next review date
6. Updates saved to `study_cards` and logged to `review_logs`

**Daily Limits**: Respects per-book settings or global defaults (10 reviews/book/day default)

### Settings & Preferences
- **Per-Book Settings**: Each book can override global defaults for daily review limit and initial ease factor
- **User Settings**: Profile (name, avatar), daily limits, default ease factor
- **Auto-save**: All settings save on change (no Save button)

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
```

### Critical Async Pattern
```typescript
// ✅ CORRECT: Always await StoreContext mutations
await updateHighlight(id, { note: 'new note' })

// ❌ WRONG: Missing await causes state inconsistency
updateHighlight(id, { note: 'new note' })
```

### Internationalization (i18n)
- **Location**: Translation files in `public/locales/pt-BR/*.json`
- **CRITICAL**: Always use proper Portuguese accents (é, ã, ç, etc.)
  - ✅ "revisões", "mês", "ação", "configurações"
  - ❌ "revisoes", "mes", "acao", "configuracoes"
- **Format**: JSON with nested keys, supports pluralization (`_one` suffix)
- **Usage**: `useTranslation('namespace')` hook, `t('key')` function

## UI/UX Guidelines

Full guidelines in `lbp_diretrizes/design-system-guide.md` (~600 lines). Key principles:

### Design System v2.0 (Updated 2026-01-28)
```
/* Typography -- semantic tokens (not raw Tailwind sizes) */
text-heading (18px), text-body (14px), text-caption (12px), text-overline (10px)

/* Colors -- oklch semantic tokens with light/dark mode */
text-foreground, bg-muted, border-border, bg-primary, text-muted-foreground

/* Spacing -- semantic tokens on 4px grid */
gap-sm (12px), p-md (16px), mb-lg (24px), gap-xl (32px)

/* Components -- CVA variants */
Button default: h-8 (compact), Input: h-8, PageHeader: size="compact"
```

### Component Patterns
- **Modals**: Radix Dialog with `max-h-[85vh] overflow-y-auto`
- **Tables**: Fixed header + scrollable body
- **Study**: Centered content (max-w-2xl) + fixed footer

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
2. **components/StoreContext.tsx**: All app state and business logic (1280 lines)
3. **services/sm2.ts**: Spaced repetition algorithm - math is precise
4. **services/parser.ts**: Kindle TXT parser with edge case handling
5. **services/pdfParser.ts**: PDF parser with complex text extraction
6. **lib/supabaseHelpers.ts**: All Supabase operations go through these converters

## Reference Documentation

Located in `lbp_context/` and `lbp_diretrizes/`:

**Include with AI when working on:**
- Study system / SM-2 / cards → `spaced-repetition-system.md` (753 lines)
- Highlights page / filters / tags → `HighlightTab-context.md` (483 lines)
- UI components / styling → `design-system-guide.md` (~600 lines)
- Import system / deduplication → `id-stability-improvement-options.md`
- Settings page → `SETTINGS_PAGE_DESIGN.md` (623 lines)

**Primary reference (always include):**
- `lbp_context/TECHNICAL_CONTEXT.md` (850+ lines) - comprehensive technical spec

## Implementation Status

### Implemented
- MyClippings.txt, PDF, and Anki TSV imports
- SM-2 spaced repetition with daily limits
- Per-book settings (review limits, ease factor)
- Hierarchical tags (global + book-specific)
- Optimistic UI with Supabase sync
- Keyboard shortcuts (Space, Enter, 1-4, E, Ctrl+Z)
- Review logs and history
- Progressive Web App (PWA) with offline support

### Not Implemented (PRD mentions, but not in code)
- Dashboard analytics (page exists but minimal)
- Cover upload (hardcoded or empty)
- Export features (JSON, CSV)
- Advanced filters and custom sorts
- Heatmap visualization
- Gamification displays

## Development Notes

- **PWA**: Configured with vite-plugin-pwa, manifest in vite.config.ts
- **Routing**: Uses HashRouter (react-router-dom) for GitHub Pages compatibility
- **Environment**: Supabase credentials in `.env` (not in repo)
- **RLS**: ALL tables require auth.uid() = user_id
- **Scripts**: Utility scripts in `scripts/` for database inspection and debugging
