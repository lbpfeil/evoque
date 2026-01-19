# External Integrations

**Analysis Date:** 2026-01-19

## APIs & External Services

**Backend-as-a-Service:**
- Supabase - Primary backend for auth, database, and API
  - SDK: `@supabase/supabase-js` ^2.88.0
  - Auth: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - Client initialization: `lib/supabase.ts`

**Placeholder Images:**
- Picsum Photos - Random book cover images
  - URL: `https://picsum.photos/300/450?random={id}`
  - Used in: `services/parser.ts`, `services/pdfParser.ts`, `services/ankiParser.ts`
  - No API key required

**Google Fonts:**
- Inter font loaded via CDN in `index.html`
  - URL: `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap`

## Data Storage

**Primary Database:**
- Supabase PostgreSQL
  - Connection: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
  - Client: Supabase JS SDK (direct queries, no ORM)
  - Tables used:
    - `books` - User's imported books
    - `highlights` - Kindle highlights
    - `study_cards` - Spaced repetition cards (SM-2 algorithm)
    - `tags` - Hierarchical tag system
    - `user_settings` - User preferences and daily progress
    - `review_logs` - Study session history
    - `deleted_highlights` - Graveyard for preventing re-import

**Local Storage:**
- Browser localStorage - Session data only
  - `khm_session` - Current study session state
  - `khm_daily_progress` - Daily review progress (also synced to Supabase)

**File Storage:**
- None (no cloud file storage)
- Local file reading only (PDF, TXT imports via browser File API)

**Caching:**
- None (relies on React state and localStorage)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth
  - Implementation: Email/password authentication
  - Client: `lib/supabase.ts` via `supabase.auth.*` methods
  - Context: `components/AuthContext.tsx`
  - Features:
    - `signInWithPassword` - Login
    - `signUp` - Registration
    - `signOut` - Logout
    - `getSession` - Session persistence
    - `onAuthStateChange` - Auth state listener
  - Row-Level Security (RLS): Assumed enabled (all queries include `user_id` filter)

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, LogRocket, etc.)

**Logs:**
- Browser console only (`console.log`, `console.error`, `console.warn`)
- DEBUG logs present in `StoreContext.tsx` for development

**Analytics:**
- None detected

## CI/CD & Deployment

**Hosting:**
- Not configured in codebase
- Build output: `dist/` (static files, suitable for Vercel, Netlify, etc.)

**CI Pipeline:**
- Not detected (no `.github/workflows`, no CI config files)

## Environment Configuration

**Required env vars:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public API key

**Optional env vars:**
- `GEMINI_API_KEY` - Defined in vite.config.ts but not actively used

**Secrets location:**
- `.env` file (gitignored)
- Note: The `.env` file in the repo contains actual Supabase credentials (should be reviewed for security)

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## Data Import Sources

**Kindle Clippings (TXT):**
- Parser: `services/parser.ts` - `parseMyClippings()`
- Format: Kindle "My Clippings.txt" file
- Supports: English and Portuguese date/metadata formats

**Kindle PDF Highlights:**
- Parser: `services/pdfParser.ts` - `parsePDFKindleHighlights()`
- Library: pdfjs-dist
- Format: Amazon Kindle PDF export (Portuguese format)

**Anki TSV Export:**
- Parser: `services/ankiParser.ts` - `parseAnkiTSV()`
- Format: Tab-separated values (highlight, note, title, author)
- Includes encoding fix for Windows-1252/ISO-8859-1 to UTF-8

## Database Schema (Inferred)

**books:**
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `title`, `author`, `cover_url`
- `last_imported`, `highlight_count`

**highlights:**
- `id` (UUID, primary key)
- `user_id`, `book_id` (foreign keys)
- `text`, `note`, `location`, `page`
- `is_favorite`, `in_study`
- `date_added`, `imported_at`
- `tags` (array)

**study_cards:**
- `id` (UUID, primary key)
- `user_id`, `highlight_id` (foreign keys)
- `ease_factor`, `interval`, `repetitions`
- `next_review_date`, `last_reviewed_at`

**tags:**
- `id` (UUID, primary key)
- `user_id` (foreign key)
- `name`, `parent_id`, `book_id`, `color`

**user_settings:**
- `user_id` (primary key)
- `max_reviews_per_day`, `new_cards_per_day`
- `daily_progress` (JSON)
- `full_name`, `avatar_url`

**review_logs:**
- `id` (UUID, primary key)
- `user_id`, `card_id` (foreign keys)
- `quality`, `reviewed_at`
- `interval_days`, `ease_factor`

**deleted_highlights:**
- `user_id`, `highlight_id` (composite key)
- `text_content` - For blocking re-imports

---

*Integration audit: 2026-01-19*
