# External Integrations

**Analysis Date:** 2026-01-19

## APIs & External Services

**Supabase (Primary Backend):**
- SDK: `@supabase/supabase-js` 2.88.0
- Client initialization: `lib/supabase.ts`
- Auth: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Usage: Authentication, database, real-time sync

**Gemini API (Configured but not used):**
- Environment variable: `GEMINI_API_KEY`
- Exposed via Vite config but no implementation found
- Status: Placeholder for future AI features

**Picsum Photos (Placeholder Images):**
- Usage: Random book cover images
- Pattern: `https://picsum.photos/300/450?random=${Math.floor(Math.random() * 1000)}`
- Location: `services/parser.ts`, `services/pdfParser.ts`, `services/ankiParser.ts`

**Google Fonts (CDN):**
- Font: Inter (weights: 300-700)
- Loaded in: `index.html`

## Data Storage

**Primary Database: Supabase PostgreSQL**
- Connection: `VITE_SUPABASE_URL`
- Client: `@supabase/supabase-js`
- Tables (inferred from helpers in `lib/supabaseHelpers.ts`):
  - `books` - User's imported books
  - `highlights` - Book highlights/annotations
  - `study_cards` - Spaced repetition cards (SM-2 algorithm)
  - `tags` - Hierarchical tagging system
  - `user_settings` - User preferences and daily progress
  - `review_logs` - Study session history
  - `deleted_highlights` - Graveyard for preventing re-import

**Local Storage (Browser):**
- Key: `khm_session` - Current study session state
- Key: `khm_daily_progress` - Daily review progress (backup)
- Purpose: Temporary session data that syncs to Supabase

**File Storage:**
- None (no file uploads to cloud storage)
- PDF/TXT files processed client-side only

## Authentication & Identity

**Auth Provider: Supabase Auth**
- Implementation: `components/AuthContext.tsx`
- Methods supported:
  - Email/password sign up: `supabase.auth.signUp()`
  - Email/password sign in: `supabase.auth.signInWithPassword()`
  - Sign out: `supabase.auth.signOut()`
- Session management: `supabase.auth.getSession()`, `onAuthStateChange()`
- User type: `@supabase/supabase-js` `User` type

**Row-Level Security (RLS):**
- All database tables filtered by `user_id`
- Pattern: `.eq('user_id', user.id)` on all queries
- Enforced both client-side and via Supabase policies

## Data Import Sources

**Kindle My Clippings.txt:**
- Parser: `services/parser.ts`
- Function: `parseMyClippings(text: string)`
- Supports: English and Portuguese date formats
- Extracts: Highlights, notes, bookmarks

**Kindle PDF Export:**
- Parser: `services/pdfParser.ts`
- Function: `parsePDFKindleHighlights(file: File)`
- Library: `pdfjs-dist`
- Language: Portuguese (patterns for "Destaque", "Página", etc.)

**Anki TSV Export:**
- Parser: `services/ankiParser.ts`
- Function: `parseAnkiTSV(text: string)`
- Format: `[highlight]\t[note]\t[book title]\t[author]`
- Includes encoding fix for Windows-1252/ISO-8859-1 to UTF-8

## Monitoring & Observability

**Error Tracking:**
- Basic: `ErrorBoundary` component (`components/ErrorBoundary.tsx`)
- No external service (Sentry, etc.)

**Logs:**
- Console logging throughout code
- Debug logs prefixed with `DEBUG:`
- ID generation logs prefixed with `[ID GEN]`

## CI/CD & Deployment

**Hosting:**
- Not detected (likely Vercel, Netlify, or similar static hosting)
- Build output: `dist/` directory

**CI Pipeline:**
- Not detected (no GitHub Actions, CircleCI, etc.)

## Environment Configuration

**Required env vars (.env):**
```
VITE_SUPABASE_URL=<supabase-project-url>
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
```

**Optional env vars:**
```
GEMINI_API_KEY=<google-gemini-api-key>  # Not currently used
```

**Secrets location:**
- `.env` file (public keys only - safe to commit)
- Supabase handles server-side secrets

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## Database Schema (Inferred)

**books:**
- `id` (UUID, deterministic from title+author)
- `user_id` (UUID, foreign key)
- `title` (text)
- `author` (text)
- `cover_url` (text, nullable)
- `last_imported` (timestamp)
- `highlight_count` (integer)

**highlights:**
- `id` (UUID, deterministic from title+author+content+location)
- `user_id` (UUID, foreign key)
- `book_id` (UUID, foreign key)
- `text` (text)
- `note` (text, nullable)
- `location` (text)
- `page` (text, nullable)
- `is_favorite` (boolean)
- `in_study` (boolean)
- `date_added` (timestamp)
- `imported_at` (timestamp)
- `tags` (text array)

**study_cards:**
- `id` (UUID)
- `user_id` (UUID, foreign key)
- `highlight_id` (UUID, foreign key)
- `ease_factor` (float, SM-2 algorithm)
- `interval` (integer, days)
- `repetitions` (integer)
- `next_review_date` (timestamp)
- `last_reviewed_at` (timestamp, nullable)

**tags:**
- `id` (UUID)
- `user_id` (UUID, foreign key)
- `name` (text)
- `parent_id` (UUID, nullable, self-referential)
- `book_id` (UUID, nullable, for book-specific chapters)
- `color` (text, nullable)

**user_settings:**
- `user_id` (UUID, primary key)
- `max_reviews_per_day` (integer)
- `new_cards_per_day` (integer)
- `daily_progress` (JSONB)
- `full_name` (text, nullable)
- `avatar_url` (text, nullable)

**review_logs:**
- `id` (UUID)
- `user_id` (UUID, foreign key)
- `card_id` (UUID, foreign key)
- `quality` (integer, 1-4)
- `reviewed_at` (timestamp)
- `interval_days` (integer)
- `ease_factor` (float)

**deleted_highlights (Graveyard):**
- `user_id` (UUID)
- `highlight_id` (UUID)
- `text_content` (text)
- `deleted_at` (timestamp, inferred)
- Unique constraint: `(user_id, highlight_id)`

---

*Integration audit: 2026-01-19*
