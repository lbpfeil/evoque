-- ============================================
-- CLEANUP ORPHANED STUDY CARDS
-- ============================================
--
-- This script removes study cards that point to non-existent highlights.
-- This can happen after ID generation changes or data migrations.
--
-- USAGE:
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
--
-- IMPORTANT: This script is safe to run multiple times.
-- ============================================

-- Step 1: Identify orphaned cards (for logging/verification)
SELECT
  sc.id AS card_id,
  sc.highlight_id,
  sc.user_id,
  'Orphaned - highlight does not exist' AS reason
FROM study_cards sc
LEFT JOIN highlights h ON sc.highlight_id = h.id
WHERE h.id IS NULL;

-- Step 2: Delete orphaned study cards
DELETE FROM study_cards sc
WHERE NOT EXISTS (
  SELECT 1 FROM highlights h WHERE h.id = sc.highlight_id
);

-- Step 3: Verify cleanup - this should return 0 rows if successful
SELECT COUNT(*) as orphaned_cards_remaining
FROM study_cards sc
LEFT JOIN highlights h ON sc.highlight_id = h.id
WHERE h.id IS NULL;

-- ============================================
-- ADDITIONAL CLEANUP (Optional)
-- ============================================

-- Find highlights pointing to non-existent books
-- (This shouldn't happen with proper imports, but check anyway)
SELECT
  h.id AS highlight_id,
  h.book_id,
  h.user_id,
  'Orphaned - book does not exist' AS reason
FROM highlights h
LEFT JOIN books b ON h.book_id = b.id
WHERE b.id IS NULL;

-- Find review logs pointing to non-existent cards
-- (Cleanup if needed)
SELECT
  rl.id AS log_id,
  rl.card_id,
  rl.user_id,
  'Orphaned - card does not exist' AS reason
FROM review_logs rl
LEFT JOIN study_cards sc ON rl.card_id = sc.id
WHERE sc.id IS NULL;

-- ============================================
-- NOTES:
-- ============================================
-- - The app now automatically filters orphaned cards on load
-- - This SQL cleanup is optional but recommended for DB hygiene
-- - Run this after major migrations or ID generation changes
-- ============================================
