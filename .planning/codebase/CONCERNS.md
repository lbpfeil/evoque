# Codebase Concerns

**Analysis Date:** 2026-01-19

## Tech Debt

**Massive StoreContext Component:**
- Issue: `components/StoreContext.tsx` is 1435 lines - a monolithic state management component handling ALL application state and business logic
- Files: `C:\Users\ADMIN\projects\evoque\components\StoreContext.tsx`
- Impact: Hard to maintain, test, and reason about. Any change risks breaking unrelated functionality. Slow IDE performance.
- Fix approach: Split into domain-specific contexts (BooksContext, StudyContext, TagsContext) or migrate to a proper state management solution like Zustand or Redux Toolkit

**Excessive DEBUG Console Logs in Production Code:**
- Issue: Multiple console.log statements with DEBUG prefix left in production code
- Files:
  - `C:\Users\ADMIN\projects\evoque\components\StoreContext.tsx` (lines 141, 383, 396, 405, 1009, 1148)
  - `C:\Users\ADMIN\projects\evoque\components\HighlightEditModal.tsx` (line 87)
  - `C:\Users\ADMIN\projects\evoque\services\idUtils.ts` (line 53)
- Impact: Console noise, potential sensitive data exposure, performance overhead
- Fix approach: Remove all DEBUG logs or use a proper logging library with environment-based log levels

**Widespread `any` Type Usage:**
- Issue: TypeScript `any` types used throughout, especially in Supabase helpers
- Files: `C:\Users\ADMIN\projects\evoque\lib\supabaseHelpers.ts` (lines 17, 45, 74, 97, 109, 118, 130, 140)
- Impact: Loses type safety benefits, potential runtime errors from mismatched data shapes
- Fix approach: Generate proper types from Supabase schema using `supabase gen types typescript`

**Unimplemented TODO:**
- Issue: TODO comment for settings modal not implemented
- Files: `C:\Users\ADMIN\projects\evoque\pages\Study.tsx` (line 41)
- Impact: Missing feature - settings button does nothing
- Fix approach: Implement settings modal or remove the button

**Preferences Tab Not Functional:**
- Issue: Preferences tab checkboxes and inputs are not connected to state/settings
- Files: `C:\Users\ADMIN\projects\evoque\pages\Settings.tsx` (lines 550-594)
- Impact: User changes to preferences are lost - UI is misleading
- Fix approach: Connect inputs to UserSettings state and persist to Supabase

## Known Bugs

**Session Streak Counter Always Zero:**
- Symptoms: `sessionStats.streak` is hardcoded to 0 in StoreContext
- Files: `C:\Users\ADMIN\projects\evoque\components\StoreContext.tsx` (line 1026)
- Trigger: View any study session stats
- Workaround: None - feature is non-functional

**Highlight createdAt Field Access Error:**
- Symptoms: StudySession.tsx references `currentHighlight.createdAt` but the Highlight type does not have this field
- Files: `C:\Users\ADMIN\projects\evoque\pages\StudySession.tsx` (line 333), `C:\Users\ADMIN\projects\evoque\types.ts` (Highlight interface)
- Trigger: Any card with a highlight that doesn't have createdAt
- Workaround: Code checks for existence before use, but the field is never populated

**Danger Zone Buttons Not Implemented:**
- Symptoms: "Export Data" and "Delete Account" buttons in Settings have no functionality
- Files: `C:\Users\ADMIN\projects\evoque\pages\Settings.tsx` (lines 536-544)
- Trigger: Click either button
- Workaround: None - buttons are non-functional

## Security Considerations

**Environment Variables Validation:**
- Risk: Missing environment variables cause app to crash rather than graceful degradation
- Files: `C:\Users\ADMIN\projects\evoque\lib\supabase.ts`
- Current mitigation: Throws error if variables are missing (good)
- Recommendations: Consider adding runtime validation for expected env vars at app startup

**No Input Sanitization on File Import:**
- Risk: User-uploaded files (txt, pdf, tsv) are parsed without validation of content size or structure limits
- Files:
  - `C:\Users\ADMIN\projects\evoque\services\parser.ts`
  - `C:\Users\ADMIN\projects\evoque\services\pdfParser.ts`
  - `C:\Users\ADMIN\projects\evoque\services\ankiParser.ts`
- Current mitigation: None
- Recommendations: Add file size limits, maximum highlight counts, and sanitize parsed text content

**User Data Not Isolated at Database Level:**
- Risk: Reliance on application-level `user_id` filtering instead of Row Level Security
- Files: All Supabase queries in `C:\Users\ADMIN\projects\evoque\components\StoreContext.tsx`
- Current mitigation: `.eq('user_id', user.id)` added to all queries
- Recommendations: Verify Supabase RLS policies are properly configured as defense in depth

## Performance Bottlenecks

**Full Data Reload After Import:**
- Problem: After importing highlights, all books, highlights, and cards are reloaded from Supabase
- Files: `C:\Users\ADMIN\projects\evoque\components\StoreContext.tsx` (lines 350-358)
- Cause: `Promise.all` fetches all data after upserts regardless of changes
- Improvement path: Only fetch newly imported/changed records, or trust optimistic updates

**No Pagination for Large Data Sets:**
- Problem: All highlights, books, cards, and review logs loaded into memory at once
- Files: `C:\Users\ADMIN\projects\evoque\components\StoreContext.tsx` (lines 93-144)
- Cause: No limit/offset on Supabase queries
- Improvement path: Implement virtual scrolling in Highlights table, paginate API calls

**Inefficient getBookCardsDue Lookup:**
- Problem: Nested find operations for each card when calculating due cards
- Files: `C:\Users\ADMIN\projects\evoque\components\StoreContext.tsx` (lines 1067-1079)
- Cause: O(n*m) complexity iterating cards and highlights
- Improvement path: Create index maps (Map<highlightId, bookId>) at data load time

## Fragile Areas

**StoreContext State Management:**
- Files: `C:\Users\ADMIN\projects\evoque\components\StoreContext.tsx`
- Why fragile: 1400+ lines with interdependent state updates. Optimistic updates with rollback on error can leave state inconsistent if multiple operations fail.
- Safe modification: Add new functionality at the end, avoid modifying existing state update logic without comprehensive testing
- Test coverage: No tests exist for this component

**Highlight ID Generation:**
- Files: `C:\Users\ADMIN\projects\evoque\services\idUtils.ts`
- Why fragile: ID generation depends on exact string matching of book title, author, location, and content. Any parsing change in import logic can break ID consistency.
- Safe modification: Never change the key generation formula without migration plan for existing data
- Test coverage: No tests exist

**Session State Persistence:**
- Files: `C:\Users\ADMIN\projects\evoque\components\StoreContext.tsx` (lines 166-177, 194-205)
- Why fragile: Mix of localStorage (session) and Supabase (dailyProgress). Session is lost on localStorage clear but dailyProgress persists.
- Safe modification: Keep localStorage and Supabase writes in sync
- Test coverage: None

## Scaling Limits

**In-Memory State:**
- Current capacity: All user data loaded into React state
- Limit: Browser memory (typically 1-2GB); likely fails gracefully at ~100k highlights
- Scaling path: Implement virtual scrolling, server-side pagination, lazy loading

**Supabase Free Tier:**
- Current capacity: 500MB database, 1GB storage
- Limit: Will hit limits with ~10k users or heavy PDF uploads
- Scaling path: Monitor usage, upgrade plan when approaching limits

## Dependencies at Risk

**None Critical:**
- All dependencies are well-maintained packages from major providers (React, Supabase, Radix UI, Recharts)
- No deprecated packages detected in current versions

## Missing Critical Features

**No Offline Support:**
- Problem: Application requires network connection, no service worker or local caching
- Blocks: Mobile usage on spotty connections, study during commute
- Note: Would require significant architecture changes to implement

**No Data Export:**
- Problem: Users cannot export their highlights/progress
- Blocks: Data portability, backup, analysis in other tools
- Note: "Export Data" button exists but is not implemented

**No Error Recovery for Failed Syncs:**
- Problem: When Supabase operations fail, data is reloaded (potential data loss for optimistic updates)
- Blocks: Reliable operation on poor connections
- Note: Error handling exists but no retry queue or offline queue

## Test Coverage Gaps

**Zero Test Coverage:**
- What's not tested: The entire application has no test files in the source directory
- Files: All files in `C:\Users\ADMIN\projects\evoque\components\`, `C:\Users\ADMIN\projects\evoque\services\`, `C:\Users\ADMIN\projects\evoque\pages\`
- Risk: Any refactoring can introduce regressions undetected. SM-2 algorithm changes could silently break spaced repetition.
- Priority: High - especially for:
  - `services/sm2.ts` (core algorithm)
  - `services/parser.ts` (data integrity)
  - `services/idUtils.ts` (ID generation stability)
  - `components/StoreContext.tsx` (state management)

---

*Concerns audit: 2026-01-19*
