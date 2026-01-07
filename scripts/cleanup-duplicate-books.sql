-- Cleanup duplicate books caused by ID generation changes (04/01/2026)
-- This script:
-- 1. Migrates highlights from duplicate books to the oldest book
-- 2. Deletes duplicate books
-- 3. Preserves all user data safely

-- BACKUP REMINDER: Always backup your database before running destructive operations!

BEGIN;

-- ==================================================
-- BOOK 1: "Há dois mil anos (Série Romances de Emmanuel)"
-- ==================================================
-- Oldest: 2f4e2c42-2f4e-4c42-2f4e-2c422f4e2c42 (26/12, 7 highlights) [KEEP THIS]
-- Middle: 56574e91-5657-4e91-5657-4e9156574e91 (05/01, 7 highlights) [DELETE]
-- Newest: 1b402bbf-1b40-4bbf-1b40-2bbf1b402bbf (07/01, 46 highlights) [DELETE]

-- Migrate highlights from middle duplicate to oldest
UPDATE highlights
SET book_id = '2f4e2c42-2f4e-4c42-2f4e-2c422f4e2c42'
WHERE book_id = '56574e91-5657-4e91-5657-4e9156574e91';

-- Migrate highlights from newest duplicate to oldest
UPDATE highlights
SET book_id = '2f4e2c42-2f4e-4c42-2f4e-2c422f4e2c42'
WHERE book_id = '1b402bbf-1b40-4bbf-1b40-2bbf1b402bbf';

-- Delete middle duplicate book
DELETE FROM books
WHERE id = '56574e91-5657-4e91-5657-4e9156574e91';

-- Delete newest duplicate book
DELETE FROM books
WHERE id = '1b402bbf-1b40-4bbf-1b40-2bbf1b402bbf';

-- Update highlight count for the kept book
UPDATE books
SET highlight_count = (
  SELECT COUNT(*) FROM highlights WHERE book_id = '2f4e2c42-2f4e-4c42-2f4e-2c422f4e2c42'
)
WHERE id = '2f4e2c42-2f4e-4c42-2f4e-2c422f4e2c42';

-- ==================================================
-- BOOK 2: "O Novo Testamento"
-- ==================================================
-- Oldest: 582eb99a-582e-499a-582e-b99a582eb99a (31/12, 84 highlights) [KEEP THIS]
-- Newest: 6517386b-6517-486b-6517-386b6517386b (05/01, 84 highlights) [DELETE]

-- Migrate highlights from newest to oldest
UPDATE highlights
SET book_id = '582eb99a-582e-499a-582e-b99a582eb99a'
WHERE book_id = '6517386b-6517-486b-6517-386b6517386b';

-- Delete newest duplicate book
DELETE FROM books
WHERE id = '6517386b-6517-486b-6517-386b6517386b';

-- Update highlight count for the kept book
UPDATE books
SET highlight_count = (
  SELECT COUNT(*) FROM highlights WHERE book_id = '582eb99a-582e-499a-582e-b99a582eb99a'
)
WHERE id = '582eb99a-582e-499a-582e-b99a582eb99a';

-- ==================================================
-- VERIFICATION
-- ==================================================
-- After running this script, verify:
-- 1. All highlights are migrated to the correct books
-- 2. No orphaned highlights exist
-- 3. highlight_count matches actual counts

SELECT
  'Há dois mil anos' as book,
  COUNT(*) as highlights_count
FROM highlights
WHERE book_id = '2f4e2c42-2f4e-4c42-2f4e-2c422f4e2c42'

UNION ALL

SELECT
  'O Novo Testamento' as book,
  COUNT(*) as highlights_count
FROM highlights
WHERE book_id = '582eb99a-582e-499a-582e-b99a582eb99a';

COMMIT;
