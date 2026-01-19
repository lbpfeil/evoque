# Testing Patterns

**Analysis Date:** 2026-01-19

## Test Framework

**Runner:**
- No test framework configured
- No test runner present (no Jest, Vitest, or other)
- No test configuration files found

**Assertion Library:**
- Not applicable (no tests)

**Run Commands:**
```bash
# No test commands in package.json
# Only available scripts:
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## Test File Organization

**Location:**
- No test files exist in the project
- No `__tests__` directories
- No `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx` files in source code

**Naming:**
- Not established (no tests to set pattern)

**Structure:**
- Not applicable

## Test Structure

**Suite Organization:**
- Not established

**Patterns:**
- Not established

## Mocking

**Framework:** Not applicable

**Patterns:**
- Not established

**What to Mock (recommendations for future tests):**
- Supabase client (`lib/supabase.ts`)
- `crypto.randomUUID()` for deterministic ID generation
- `Date` for time-based logic (SM-2 algorithm, daily progress)
- localStorage for session persistence

**What NOT to Mock (recommendations):**
- Pure utility functions (`lib/utils.ts`)
- Type transformations (`lib/supabaseHelpers.ts`)
- Parsing logic (`services/parser.ts`, `services/pdfParser.ts`)

## Fixtures and Factories

**Test Data:**
- `services/mockData.ts` exists with sample data:

```typescript
// From services/mockData.ts - could be used as test fixtures
export const mockBooks: Book[] = [/* ... */];
export const mockHighlights: Highlight[] = [/* ... */];
```

**Location:**
- Mock data in `services/mockData.ts`
- No dedicated test fixtures directory

## Coverage

**Requirements:** None enforced

**View Coverage:**
```bash
# Not configured
```

## Test Types

**Unit Tests:**
- Not implemented
- Recommended targets:
  - `services/sm2.ts` - SM-2 algorithm calculations
  - `services/parser.ts` - Kindle clippings parsing
  - `services/pdfParser.ts` - PDF highlights parsing
  - `services/ankiParser.ts` - Anki TSV parsing
  - `services/idUtils.ts` - Deterministic ID generation
  - `lib/supabaseHelpers.ts` - Data transformations

**Integration Tests:**
- Not implemented
- Recommended targets:
  - `components/StoreContext.tsx` - State management with mocked Supabase
  - `components/AuthContext.tsx` - Authentication flow

**E2E Tests:**
- Not used
- Framework not configured

## Common Patterns

**Async Testing:**
- Not established (no tests)
- Recommendation for future:
```typescript
// Example pattern for testing async Supabase operations
it('should import data correctly', async () => {
  const mockSupabase = { /* ... */ };
  const result = await importData(testInput);
  expect(result.newHighlights).toBe(5);
});
```

**Error Testing:**
- Not established (no tests)
- Recommendation for future:
```typescript
// Example pattern for testing error handling
it('should throw on invalid PDF format', async () => {
  await expect(parsePDFKindleHighlights(invalidFile))
    .rejects.toThrow('Formato de PDF inválido');
});
```

## Testable Units Analysis

**High Priority (core business logic):**

1. **`services/sm2.ts`** - Spaced repetition algorithm
   - `calculateNextReview(card, quality)` - Pure function, easily testable
   - `initializeCard(highlightId)` - Pure function
   - Edge cases: quality boundaries, ease factor limits

2. **`services/parser.ts`** - Kindle clippings parser
   - `parseMyClippings(text)` - Pure function
   - `parseDate(dateString)` - Internal, but important
   - Edge cases: Portuguese dates, missing metadata

3. **`services/idUtils.ts`** - ID generation
   - `generateDeterministicUUID(input)` - Must be stable across runs
   - `generateHighlightID(...)` - Must be deterministic

4. **`lib/supabaseHelpers.ts`** - Data transformers
   - All `toSupabase*` and `fromSupabase*` functions
   - Pure functions, no side effects

**Medium Priority (parsing variants):**

5. **`services/pdfParser.ts`** - PDF highlights
   - `parsePDFKindleHighlights(file)` - Requires file mocking
   - Complex regex patterns to validate

6. **`services/ankiParser.ts`** - Anki TSV
   - `parseAnkiTSV(text)` - Pure function
   - `fixEncoding(text)` - Encoding fixes

**Lower Priority (UI/integration):**

7. **`components/StoreContext.tsx`** - State management
   - Complex, requires mocking Supabase
   - Integration tests more valuable than unit tests

## Recommended Test Setup

**Install Vitest (recommended for Vite projects):**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Add vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
});
```

**Add test script to package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

**Suggested test file structure:**
```
tests/
├── setup.ts              # Test setup and global mocks
├── services/
│   ├── sm2.test.ts       # SM-2 algorithm tests
│   ├── parser.test.ts    # Kindle parser tests
│   ├── idUtils.test.ts   # ID generation tests
│   └── ankiParser.test.ts
├── lib/
│   └── supabaseHelpers.test.ts
└── fixtures/
    ├── clippings.txt     # Sample Kindle clippings
    └── highlights.json   # Expected parsed output
```

---

*Testing analysis: 2026-01-19*
