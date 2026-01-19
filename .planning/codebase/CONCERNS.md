# Codebase Concerns

**Analysis Date:** 2026-01-19

## Tech Debt

**Monolithic State Management (StoreContext):**
- Issue: Single 1436-line file handles all application state including books, highlights, study cards, tags, sessions, settings, and daily progress
- Files: `C:/Users/ADMIN/projects/evoque/components/StoreContext.tsx`
- Impact: Difficult to maintain, test, and extend. Any state change re-renders entire tree. Race conditions possible with concurrent Supabase operations.
- Fix approach: Split into domain-specific contexts (BookContext, StudyContext, TagContext) or migrate to Redux/Zustand with slices

**Debug Console Logging in Production:**
- Issue: 50+ console.log/warn/error statements throughout codebase, including in idUtils.ts that logs every ID generation
- Files:
  - `C:/Users/ADMIN/projects/evoque/services/idUtils.ts` (line 53: logs every ID generation)
  - `C:/Users/ADMIN/projects/evoque/components/StoreContext.tsx` (40+ debug statements)
  - `C:/Users/ADMIN/projects/evoque/components/HighlightEditModal.tsx` (line 87)
  - `C:/Users/ADMIN/projects/evoque/pages/Study.tsx` (line 42)
- Impact: Performance degradation, information leakage, cluttered browser console
- Fix approach: Remove or wrap in development-only conditional (e.g., `if (import.meta.env.DEV)`)

**TODO/Incomplete Features:**
- Issue: Unimplemented settings button functionality
- Files: `C:/Users/ADMIN/projects/evoque/pages/Study.tsx` (line 40-43)
  ```typescript
  const handleSettings = () => {
    // TODO: Open settings modal
    console.log('Settings clicked');
  };
  ```
- Impact: Dead UI element, confusing UX
- Fix approach: Implement settings modal or remove button

**Hardcoded Daily Limits:**
- Issue: 10 cards per book per day is hardcoded in multiple locations instead of using settings
- Files: `C:/Users/ADMIN/projects/evoque/components/StoreContext.tsx` (lines 863, 879, 900, 913, 1036)
- Impact: Cannot customize study limits, inconsistent if changed in one place
- Fix approach: Use `settings.maxReviewsPerDay` consistently throughout

**Unused Settings Fields:**
- Issue: `maxReviewsPerDay` and `newCardsPerDay` exist in settings but are ignored
- Files:
  - `C:/Users/ADMIN/projects/evoque/types.ts` (lines 51-54)
  - `C:/Users/ADMIN/projects/evoque/components/StoreContext.tsx` (default values set but not used)
- Impact: Preferences UI exists but has no effect
- Fix approach: Wire settings values to actual study session logic

**Placeholder Cover Images:**
- Issue: Random picsum.photos URLs used for book covers instead of actual covers
- Files:
  - `C:/Users/ADMIN/projects/evoque/services/parser.ts` (line 131)
  - `C:/Users/ADMIN/projects/evoque/services/pdfParser.ts` (line 62)
  - `C:/Users/ADMIN/projects/evoque/services/ankiParser.ts` (line 122)
- Impact: Different cover on every import, not representative of actual book
- Fix approach: Integrate with Open Library API or Google Books API for real covers

## Known Bugs

**StudySession createdAt Property Access:**
- Symptoms: Code accesses `currentHighlight.createdAt` which doesn't exist on Highlight type
- Files: `C:/Users/ADMIN/projects/evoque/pages/StudySession.tsx` (lines 333-343)
- Trigger: Always - displays undefined/nothing for highlight creation date
- Workaround: Property is conditionally rendered so it fails silently

**Preferences Save Button Non-Functional:**
- Symptoms: "Save Preferences" button in Settings does nothing
- Files: `C:/Users/ADMIN/projects/evoque/pages/Settings.tsx` (line 591)
- Trigger: Click "Save Preferences" button
- Workaround: None - preferences are not saved

**Export Data / Delete Account Non-Functional:**
- Symptoms: Buttons exist but have no onClick handlers
- Files: `C:/Users/ADMIN/projects/evoque/pages/Settings.tsx` (lines 536-543)
- Trigger: Click either button in Account settings
- Workaround: None

## Security Considerations

**Environment Variables Exposure:**
- Risk: Supabase URL and anon key exposed in frontend bundle
- Files: `C:/Users/ADMIN/projects/evoque/lib/supabase.ts`
- Current mitigation: Anon key is designed to be public; RLS policies protect data
- Recommendations: Verify RLS policies are correctly configured for all tables (books, highlights, study_cards, tags, user_settings, review_logs, deleted_highlights)

**No Input Sanitization:**
- Risk: User-provided highlight text and notes stored/displayed without sanitization
- Files:
  - `C:/Users/ADMIN/projects/evoque/components/StoreContext.tsx` (importData function)
  - `C:/Users/ADMIN/projects/evoque/pages/StudySession.tsx` (displays text directly)
- Current mitigation: React auto-escapes JSX
- Recommendations: Consider sanitizing on import for extra safety

**File Upload Validation:**
- Risk: Only file extension is checked, not actual file content
- Files: `C:/Users/ADMIN/projects/evoque/pages/Settings.tsx` (processFile function, lines 66-73)
- Current mitigation: Files are parsed as text, malformed files throw errors
- Recommendations: Add MIME type validation, consider file size limits

## Performance Bottlenecks

**Full Data Reload on Import:**
- Problem: After import, entire dataset is reloaded from Supabase
- Files: `C:/Users/ADMIN/projects/evoque/components/StoreContext.tsx` (lines 350-358)
- Cause: Three parallel SELECT * queries after upsert operations
- Improvement path: Return inserted data from upsert, merge locally

**N+1 Query Pattern in bulkAddToStudy:**
- Problem: Sequential `updateHighlight` calls inside loop
- Files: `C:/Users/ADMIN/projects/evoque/components/StoreContext.tsx` (lines 695-698)
  ```typescript
  for (const highlightId of highlightIds) {
    await updateHighlight(highlightId, { inStudy: true });
  }
  ```
- Cause: Each highlight update is a separate Supabase call
- Improvement path: Batch update with single query

**Large State Object Re-renders:**
- Problem: Single context with all app state causes unnecessary re-renders
- Files: `C:/Users/ADMIN/projects/evoque/components/StoreContext.tsx`
- Cause: Any state change (e.g., session progress) re-renders all consumers
- Improvement path: Split context, use React.memo strategically, consider Zustand/Jotai

**Session Card Selection Algorithm:**
- Problem: O(n*m) complexity when building "All Books" session
- Files: `C:/Users/ADMIN/projects/evoque/components/StoreContext.tsx` (lines 892-951)
- Cause: Iterates all books, then iterates cards for each book with multiple filter passes
- Improvement path: Pre-compute card-to-book mapping, use Set operations

## Fragile Areas

**Import Parsing Logic:**
- Files:
  - `C:/Users/ADMIN/projects/evoque/services/parser.ts`
  - `C:/Users/ADMIN/projects/evoque/services/pdfParser.ts`
  - `C:/Users/ADMIN/projects/evoque/services/ankiParser.ts`
- Why fragile: Regex-based parsing assumes specific formats from Kindle/Anki exports. Format changes break import.
- Safe modification: Add comprehensive test cases before changing regex patterns
- Test coverage: No automated tests for parsers

**Deterministic ID Generation:**
- Files: `C:/Users/ADMIN/projects/evoque/services/idUtils.ts`
- Why fragile: IDs are generated from book/author/content/location. Any change in parsing affects ID stability, causing duplicate imports.
- Safe modification: Never change the ID generation formula without migration plan
- Test coverage: No automated tests

**Session State Persistence:**
- Files: `C:/Users/ADMIN/projects/evoque/components/StoreContext.tsx` (lines 166-177, 194-205)
- Why fragile: Session stored in localStorage, daily progress synced to Supabase with debounce. Race conditions possible between browser tabs.
- Safe modification: Ensure all session mutations update both local and remote state atomically
- Test coverage: No tests

**Graveyard System (Deleted Highlights):**
- Files: `C:/Users/ADMIN/projects/evoque/components/StoreContext.tsx` (lines 239-271, 463-475)
- Why fragile: Complex dual-check (ID + text content) to prevent re-import of deleted items. Silent failures if graveyard upsert fails.
- Safe modification: Add error handling for graveyard operations, add logging
- Test coverage: No automated tests

## Scaling Limits

**In-Memory State:**
- Current capacity: Entire user dataset (books, highlights, cards, tags, logs) loaded into memory
- Limit: Browser memory; expect issues at 10,000+ highlights
- Scaling path: Implement pagination, lazy loading, or virtualization

**localStorage Session Storage:**
- Current capacity: ~5MB per origin
- Limit: Large sessions with history could approach limit
- Scaling path: Store only essential session data, use IndexedDB for overflow

## Dependencies at Risk

**pdfjs-dist:**
- Risk: Large dependency (~2MB) for PDF parsing, complex worker setup
- Impact: Slow initial load, potential CSP issues with worker
- Migration plan: Consider server-side PDF parsing or lighter alternative

**picsum.photos:**
- Risk: External dependency for placeholder images; service availability not guaranteed
- Impact: Broken images if service is down
- Migration plan: Use local placeholder or fetch from more reliable source (Open Library)

## Missing Critical Features

**No Offline Support:**
- Problem: App requires constant internet connection
- Blocks: Usage without network access

**No Data Export:**
- Problem: "Export Data" button exists but is non-functional
- Blocks: Data portability, backup capability

**No Password Reset Flow:**
- Problem: Only sign in/up implemented
- Blocks: Users locked out if password forgotten

**No Email Verification:**
- Problem: Users can sign up without email verification
- Blocks: Account security

## Test Coverage Gaps

**Zero Automated Tests:**
- What's not tested: Entire codebase
- Files: No test files exist in `C:/Users/ADMIN/projects/evoque/` (only dependency tests in node_modules)
- Risk: All functionality can break unnoticed with any change
- Priority: High - parsers, SM-2 algorithm, and ID generation are most critical

**Specific Untested Areas:**
- SM-2 algorithm (`services/sm2.ts`) - Incorrect spacing could ruin learning
- Parser functions (`services/parser.ts`, `services/pdfParser.ts`, `services/ankiParser.ts`) - Import failures
- ID generation (`services/idUtils.ts`) - Duplicate detection failures
- Store operations (`components/StoreContext.tsx`) - Data corruption

---

*Concerns audit: 2026-01-19*
