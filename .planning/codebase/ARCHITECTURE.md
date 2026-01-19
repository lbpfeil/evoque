# Architecture

**Analysis Date:** 2025-01-19

## Pattern Overview

**Overall:** React Single-Page Application with Context-based State Management

**Key Characteristics:**
- Client-side rendered SPA using Vite + React 19
- Centralized state management via React Context (StoreContext)
- Supabase backend for persistence and authentication
- Hash-based routing (HashRouter) for static hosting compatibility
- Optimistic updates with Supabase sync and rollback on error

## Layers

**Presentation Layer (Pages):**
- Purpose: Route-level components rendering full page views
- Location: `pages/`
- Contains: Dashboard, Study, StudySession, Highlights, Settings, BookDetails, Login
- Depends on: StoreContext, AuthContext, UI Components
- Used by: App.tsx router

**Component Layer:**
- Purpose: Reusable UI components and shared logic
- Location: `components/`
- Contains: Modals, popovers, sidebars, tables, selectors, context providers
- Depends on: StoreContext (for data), `lib/utils.ts`, shadcn/ui primitives
- Used by: Pages

**UI Primitives Layer:**
- Purpose: Low-level UI building blocks (shadcn/ui components)
- Location: `components/ui/`
- Contains: Button, Dialog, Input, Popover, Sheet, Command
- Depends on: Radix UI primitives, `lib/utils.ts`
- Used by: Components, Pages

**State Management Layer:**
- Purpose: Centralized application state, business logic, and Supabase sync
- Location: `components/StoreContext.tsx`, `components/AuthContext.tsx`
- Contains: All domain state (books, highlights, studyCards, tags, settings, sessions)
- Depends on: Supabase client, parsers, SM-2 algorithm
- Used by: All pages and components

**Data Access Layer:**
- Purpose: Supabase client configuration and data transformation helpers
- Location: `lib/supabase.ts`, `lib/supabaseHelpers.ts`
- Contains: Supabase client instance, to/from conversion functions for each entity
- Depends on: @supabase/supabase-js, environment variables
- Used by: StoreContext, AuthContext, Settings page (avatar upload)

**Services Layer:**
- Purpose: Domain-specific business logic and algorithms
- Location: `services/`
- Contains: File parsers (TXT, PDF, TSV), SM-2 spaced repetition algorithm, ID generation utilities
- Depends on: Types, pdfjs-dist
- Used by: StoreContext (importData), StudySession (calculateNextReview)

## Data Flow

**Import Flow (File Upload to Database):**

1. User uploads file in `pages/Settings.tsx` (Import tab)
2. File is processed by appropriate parser:
   - `.txt` -> `services/parser.ts` (parseMyClippings)
   - `.pdf` -> `services/pdfParser.ts` (parsePDFKindleHighlights)
   - `.tsv` -> `services/ankiParser.ts` (parseAnkiTSV)
3. Parser returns `{ books: Book[], highlights: Highlight[] }`
4. `StoreContext.importData()` receives parsed data
5. Graveyard check: fetches `deleted_highlights` table to filter previously deleted items
6. Optimistic update: local state updated immediately
7. Supabase sync: upsert to `books`, `highlights`, `study_cards` tables
8. State reloaded from Supabase for consistency

**Study Session Flow:**

1. User navigates to `/study` (Study page)
2. `getDeckStats()` calculates cards due per book (respecting 10/book/day limit)
3. User clicks deck -> navigates to `/study/session?deck={bookId}`
4. `startSession()` creates session with due cards, stores in `currentSession`
5. Card displayed, user responds (Again/Hard/Good/Easy)
6. `calculateNextReview()` (SM-2) computes new interval/easeFactor
7. `updateCard()` updates state + Supabase
8. `submitReview()` logs review, updates daily progress
9. Session complete: stats displayed

**State Management:**
- All domain state lives in `StoreContext`
- Pattern: Optimistic update -> Supabase sync -> Rollback on error
- Session data: persisted to localStorage (temporary), synced daily progress to Supabase
- Auth state: separate `AuthContext` using Supabase Auth

## Key Abstractions

**Book:**
- Purpose: Represents a source book from which highlights are imported
- Examples: `types.ts:Book`, Supabase table `books`
- Pattern: Deterministic UUID from title+author via `generateDeterministicUUID()`

**Highlight:**
- Purpose: A text excerpt from a book with optional note
- Examples: `types.ts:Highlight`, Supabase table `highlights`
- Pattern: Deterministic ID from title+author+content+location via `generateHighlightID()`

**StudyCard:**
- Purpose: Spaced repetition state for a highlight
- Examples: `types.ts:StudyCard`, Supabase table `study_cards`
- Pattern: 1:1 with highlight, created on import, SM-2 algorithm state

**StudySession:**
- Purpose: Ephemeral session tracking cards being reviewed
- Examples: `types.ts:StudySession`, stored in localStorage
- Pattern: Queue of card IDs, completed IDs, review history for undo

**Tag:**
- Purpose: Organization label for highlights (global or book-specific)
- Examples: `types.ts:Tag`, Supabase table `tags`
- Pattern: Hierarchical (parentId), can be book-scoped (bookId = chapter)

## Entry Points

**Browser Entry:**
- Location: `index.tsx`
- Triggers: Page load
- Responsibilities: Render React app to DOM

**App Root:**
- Location: `App.tsx`
- Triggers: React render
- Responsibilities: Provider tree (ErrorBoundary -> AuthProvider -> ProtectedApp with StoreProvider + Router)

**API Entry (Supabase):**
- Location: `lib/supabase.ts`
- Triggers: App initialization
- Responsibilities: Create Supabase client with env vars

## Error Handling

**Strategy:** Try-catch with optimistic rollback

**Patterns:**
- Optimistic updates: state is updated before Supabase call
- On Supabase error: console.error, reload data from Supabase (rollback)
- ErrorBoundary at root catches React render errors
- File parsing: try-catch with user-facing error messages

## Cross-Cutting Concerns

**Logging:**
- console.log/console.error for debugging
- DEBUG prefixed logs in StoreContext for review flow tracing
- ID generation logs in `services/idUtils.ts`

**Validation:**
- Type safety via TypeScript interfaces (`types.ts`)
- Runtime validation in parsers (field count, required fields)
- Form validation: minimal, mostly browser native

**Authentication:**
- Supabase Auth with email/password
- AuthContext provides user, loading, signIn, signUp, signOut
- Protected routes: ProtectedApp renders Login if !user

**Data Persistence:**
- Primary: Supabase (books, highlights, study_cards, tags, user_settings, review_logs, deleted_highlights)
- Secondary: localStorage (current session, daily progress backup)
- Row-level security: all queries filter by `user_id`

---

*Architecture analysis: 2025-01-19*
