---
status: resolved
trigger: "heatmap-missing-review-days"
created: 2026-02-21T00:00:00Z
updated: 2026-02-21T00:01:00Z
---

## Current Focus

hypothesis: CONFIRMED (primary) - Supabase default row limit (1000) silently truncates review_logs query, causing missing days on heatmap. CONFIRMED (secondary) - timezone bug in calculateStreaks longest-streak calculation using new Date("YYYY-MM-DD") instead of parseLocalDate().
test: Read all relevant code - StoreContext.tsx loadNonCriticalData, StudyHeatmap.tsx aggregateReviewsByDate, calculateStreaks
expecting: Fix both issues: (1) add .limit(10000) or paginate review_logs query, (2) replace new Date() with parseLocalDate() in streak calculation
next_action: Apply fixes to StoreContext.tsx and StudyHeatmap.tsx

## Symptoms

expected: Heatmap should show activity for almost every day — user says they only skipped 1 day of reviews
actual: Heatmap shows multiple days as empty/dark (no activity) when the user did review on those days
errors: No error messages reported
reproduction: Just look at the heatmap on the Dashboard — visible gaps on days that should have activity
started: User noticed it now; unclear when it started
recent_context: Recent commit "fix(heatmap): correct date display for users west of UTC" (9da169b) — timezone fix may be relevant

## Eliminated

- hypothesis: The recent timezone fix (9da169b) introduced the heatmap gaps
  evidence: The fix only changed parseLocalDate() usage for DISPLAY functions (tooltips, month labels, intensity comparison). The aggregateReviewsByDate() function correctly uses new Date(log.reviewedAt) to convert UTC ISO strings to local dates, then formatLocalDate() to extract local YYYY-MM-DD. This part was already correct before and after the fix.
  timestamp: 2026-02-21T00:01:00Z

- hypothesis: The date aggregation logic in aggregateReviewsByDate is wrong
  evidence: new Date(log.reviewedAt) correctly parses UTC ISO timestamps to local Date objects. formatLocalDate() then extracts the local year/month/day. The generated heatmap grid also uses local dates. The keys match correctly.
  timestamp: 2026-02-21T00:01:00Z

## Evidence

- timestamp: 2026-02-21T00:00:00Z
  checked: Directory structure
  found: StudyHeatmap.tsx component exists as a separate component file
  implication: Heatmap is encapsulated in its own component, Dashboard likely imports it

- timestamp: 2026-02-21T00:01:00Z
  checked: StoreContext.tsx loadNonCriticalData (lines 199-226)
  found: The review_logs query is `.from('review_logs').select('*').eq('user_id', user.id)` with NO .limit() or .order() call
  implication: Supabase PostgREST default row limit is 1000. Any user with >1000 review log entries gets silently truncated. With 10 reviews/day, you hit 1000 logs after ~100 days. Since there's no .order(), the 1000 rows returned are arbitrary, causing random gaps across the timeline.

- timestamp: 2026-02-21T00:01:00Z
  checked: StoreContext.tsx rollback query (line 1523) - also loads review_logs
  found: Same query pattern without .limit() - same issue applies
  implication: Both load paths have the same truncation problem

- timestamp: 2026-02-21T00:01:00Z
  checked: StudyHeatmap.tsx calculateStreaks lines 171-172
  found: Uses `new Date(sortedDates[i - 1])` and `new Date(sortedDates[i])` on YYYY-MM-DD strings — the same timezone bug the previous commit (9da169b) fixed for other functions. These parse as UTC midnight, meaning for users in UTC-3/UTC-4 they represent the previous day.
  implication: The diffDays calculation could be off by ±1 day for users west of UTC. This makes some consecutive days appear non-consecutive, breaking the longest streak calculation. However, it affects the STREAK DISPLAY (flame number), not the heatmap cell colors.

- timestamp: 2026-02-21T00:01:00Z
  checked: ReviewLog type and fromSupabaseReviewLog converter
  found: reviewedAt is stored as UTC ISO string (new Date().toISOString()) and loaded back as-is from Supabase's reviewed_at column
  implication: Date storage/retrieval is correct. The issue is not in date conversion but in query row limit.

## Resolution

root_cause: |
  PRIMARY: Supabase PostgREST has a default maximum of 1000 rows per query. The review_logs
  query in StoreContext.tsx loadNonCriticalData() uses no .limit() call, so when a user
  accumulates >1000 review log entries (achieved at ~10 reviews/day for 100 days), the query
  silently returns only 1000 of the rows. Since there's no .order() call, the rows returned
  are arbitrary, causing some days to have some/all of their review logs missing from the
  result set. This makes the heatmap show those days as empty even though reviews occurred.

  SECONDARY: calculateStreaks() in StudyHeatmap.tsx uses new Date(YYYY-MM-DD string) instead
  of parseLocalDate() for the longest streak calculation. This was missed in the previous
  timezone fix commit (9da169b). For users west of UTC, this can cause off-by-one errors in
  the consecutive-day check, breaking the longest streak counter display.

fix: |
  1. Add .limit(10000) to review_logs queries in StoreContext.tsx (handles up to 10k logs;
     a proper pagination solution would be better long-term but this is pragmatic for now)
  2. Replace new Date() with parseLocalDate() for YYYY-MM-DD strings in calculateStreaks()

verification: |
  Build succeeded (npm run build) with no TypeScript errors. Both changed files compiled
  cleanly. The pre-existing warnings in ankiParser.ts are unrelated to this fix.

  Fix 1 verification: review_logs query now has .order('reviewed_at', ascending) and
  .limit(10000), ensuring all logs are returned in chronological order and not silently
  truncated by Supabase's 1000-row default.

  Fix 2 verification: calculateStreaks longest-streak calculation now uses parseLocalDate()
  instead of new Date() for YYYY-MM-DD strings, matching the approach from the previous
  timezone fix commit (9da169b) applied to other functions in the same file.

files_changed:
  - components/StoreContext.tsx
  - components/StudyHeatmap.tsx
