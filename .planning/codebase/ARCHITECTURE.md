# Architecture

**Analysis Date:** 2026-01-19

## Pattern Overview

**Overall:** React Single-Page Application with Centralized Context Store

**Key Characteristics:**
- Client-side React SPA with Vite as build tool
- Centralized state management via React Context (`StoreContext`)
- Supabase as Backend-as-a-Service (auth, database, storage)
- Optimistic UI updates with Supabase sync
- Hash-based routing (`HashRouter`) for static hosting compatibility

## Layers

**Presentation Layer (Pages + Components):**
- Purpose: Render UI and handle user interactions
- Location: `pages/`, `components/`
- Contains: React components, page layouts, modals, UI primitives
- Depends on: StoreContext, AuthContext, services
- Used by: App.tsx router

**State Management Layer (Context):**
- Purpose: Centralized application state and business logic
- Location: `components/StoreContext.tsx`, `components/AuthContext.tsx`
- Contains: Global state, CRUD operations, Supabase sync logic
- Depends on: lib/supabase, lib/supabaseHelpers, services
- Used by: All pages and components via `useStore()` and `useAuth()` hooks

**Data Access Layer (Lib):**
- Purpose: Database client and data transformation
- Location: `lib/`
- Contains: Supabase client (`supabase.ts`), entity mappers (`supabaseHelpers.ts`)
- Depends on: @supabase/supabase-js, types
- Used by: StoreContext, AuthContext

**Services Layer:**
- Purpose: Business logic and data parsing
- Location: `services/`
- Contains: File parsers (TXT, PDF, TSV), SM-2 algorithm, ID generation
- Depends on: types, pdfjs-dist
- Used by: StoreContext (import), StudySession (review)

**Types Layer:**
- Purpose: TypeScript type definitions
- Location: `types.ts`
- Contains: Domain model interfaces (Book, Highlight, StudyCard, etc.)
- Depends on: Nothing
- Used by: All layers

## Data Flow

**Import Flow (Highlights Import):**

1. User uploads file in `Settings.tsx` (TXT, PDF, or TSV)
2. File processed by appropriate parser (`parser.ts`, `pdfParser.ts`, `ankiParser.ts`)
3. Parser returns `{ books: Book[], highlights: Highlight[] }`
4. `StoreContext.importData()` merges with existing state (optimistic update)
5. Creates StudyCards for new highlights (auto-enrollment in study)
6. Syncs to Supabase via upsert operations
7. Reloads from Supabase to ensure consistency

**Study Session Flow:**

1. User navigates to `/study` or `/study/session?deck={bookId}`
2. `StudySession.tsx` calls `startSession(bookId?)` on mount
3. `StoreContext.startSession()` filters due cards respecting daily limits (10/book/day)
4. User reviews cards via quality buttons (1-4: Again/Hard/Good/Easy)
5. `StudySession.handleResponse()` calls `calculateNextReview()` (SM-2 algorithm)
6. Card updated via `updateCard()`, review logged via `submitReview()`
7. Daily progress tracked in `dailyProgress` state, synced to Supabase

**Authentication Flow:**

1. `App.tsx` wraps everything in `AuthProvider`
2. On mount, `AuthContext` checks Supabase session
3. If no user, renders `Login.tsx`
4. Login/signup via `supabase.auth.signInWithPassword()` or `signUp()`
5. On auth state change, `StoreProvider` loads user data from Supabase

**State Management:**
- React Context provides global state via `StoreContext.Provider`
- Components access state via `useStore()` hook
- All mutations go through context methods (not direct Supabase calls)
- Optimistic updates: UI updates immediately, then syncs to Supabase
- On error: rollback local state and reload from Supabase

## Key Abstractions

**Book:**
- Purpose: Container for highlights from a single source
- Examples: `types.ts:Book`, stored in Supabase `books` table
- Pattern: Deterministic ID from `title-author` hash

**Highlight:**
- Purpose: A single text excerpt with optional note
- Examples: `types.ts:Highlight`, stored in Supabase `highlights` table
- Pattern: Deterministic ID from content hash for deduplication

**StudyCard:**
- Purpose: Spaced repetition state for a highlight
- Examples: `types.ts:StudyCard`, stored in Supabase `study_cards` table
- Pattern: 1:1 with Highlight, created automatically on import

**StudySession:**
- Purpose: In-memory session state for active study
- Examples: `types.ts:StudySession`, stored in localStorage
- Pattern: Ephemeral, resets daily or on deck change

**Tag:**
- Purpose: Categorization for highlights (global or book-specific)
- Examples: `types.ts:Tag`, stored in Supabase `tags` table
- Pattern: Hierarchical (parentId), can be book-scoped (bookId)

## Entry Points

**Application Entry:**
- Location: `index.tsx`
- Triggers: Browser loads `index.html`
- Responsibilities: Mount React app to DOM

**Router Entry:**
- Location: `App.tsx`
- Triggers: Application mount
- Responsibilities: Setup providers (Auth, Store), route definitions

**API Entry:**
- Location: `lib/supabase.ts`
- Triggers: Any Supabase operation
- Responsibilities: Initialize and export Supabase client

## Error Handling

**Strategy:** Try-catch with optimistic rollback

**Patterns:**
- Optimistic UI update before Supabase call
- On Supabase error: log to console, reload state from database
- User-facing errors shown via local state (e.g., `importError` in Settings)
- `ErrorBoundary` component wraps entire app for uncaught errors

## Cross-Cutting Concerns

**Logging:** Console.log for debug (DEBUG prefixed), console.error for errors

**Validation:** Minimal client-side validation; relies on TypeScript types and Supabase constraints

**Authentication:** Supabase Auth with session persistence; `useAuth()` hook provides user state

**Deleted Highlight Graveyard:**
- Deleted highlights stored in `deleted_highlights` table
- Import filters out previously deleted highlights by ID and text content
- Prevents re-import of unwanted highlights

---

*Architecture analysis: 2026-01-19*
