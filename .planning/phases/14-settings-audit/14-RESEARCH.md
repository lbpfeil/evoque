# Phase 14: Settings Audit - Research

**Researched:** 2026-01-30
**Domain:** Settings functionality validation, testing infrastructure
**Confidence:** HIGH

## Summary

This phase focuses on auditing existing Settings functionality, validating that Study Options and daily limits work correctly, and introducing automated testing to the project.

The codebase currently has **no testing infrastructure** - no test framework, no test files, no coverage setup. The Settings page (`pages/Settings.tsx`) is fully implemented with 4 tabs: Import, Library, Account, and Preferences. The study logic in `StoreContext.tsx` implements daily limits per book and uses settings for ease factor configuration.

**Primary recommendation:** Use Vitest with React Testing Library for testing. Focus tests on pure logic functions (SM-2 algorithm, daily limit calculations) first, then expand to integration tests for settings persistence.

## Current Settings Implementation

### Settings Data Model (types.ts)

```typescript
// User-level settings
interface UserSettings {
  maxReviewsPerDay: number;        // Global default daily limit (default: 15)
  newCardsPerDay: number;          // Not currently used in logic
  dailyProgress?: DailyProgress;   // Tracks reviews per book per day
  fullName?: string;
  avatarUrl?: string;
  defaultInitialEaseFactor?: number;  // Global default for new cards (default: 2.5)
  theme?: 'light' | 'dark' | 'system';
}

// Book-level settings (overrides global)
interface Book {
  settings?: {
    dailyReviewLimit?: number;      // Override maxReviewsPerDay
    initialEaseFactor?: number;     // Override defaultInitialEaseFactor
  };
}

// Daily progress tracking
interface DailyProgress {
  date: string;  // YYYY-MM-DD
  bookReviews: Record<string, number>;  // bookId -> count
}
```

### Settings UI (Settings.tsx)

**Preferences Tab - Study Options:**
- `maxReviewsPerDay`: Input (1-100), auto-saves on change
- `defaultInitialEaseFactor`: Input (1.3-3.5, step 0.1), auto-saves on change
- "Apply to All Books" button: Resets all book-specific settings to use global defaults

**Library Tab - Per-Book Settings:**
- Each book has collapsible settings section
- `dailyReviewLimit`: Input, placeholder shows global default
- `initialEaseFactor`: Input, placeholder shows global default
- Empty value = use global default

### Settings Persistence (StoreContext.tsx)

1. **Load settings on mount** (loadData function, lines 147-170):
   - Fetches from `user_settings` table
   - Handles missing settings gracefully (PGRST116 error code)
   - Validates dailyProgress date, resets if stale

2. **Save settings on change** (updateSettings function, lines 860-887):
   - Optimistic update
   - Upserts to `user_settings` table
   - Reloads after save to ensure sync

3. **Book settings** (updateBookSettings function, lines 1523-1559):
   - Merges new settings with existing
   - Stores in `settings` JSONB column of `books` table

## Study Options Logic

### How Settings Affect Study Sessions

**1. Session Creation (startSession function, lines 964-1097):**

For single-book session:
```typescript
const book = books.find(b => b.id === bookId);
const dailyLimit = book?.settings?.dailyReviewLimit || settings.maxReviewsPerDay || 10;
const reviewsToday = dailyProgress.bookReviews[bookId] || 0;

if (reviewsToday >= dailyLimit) {
  return;  // No cards available
}

const remaining = dailyLimit - reviewsToday;
const sessionCards = sortedDue.slice(0, remaining);
```

For "All Books" session:
```typescript
books.forEach(book => {
  const dailyLimit = book.settings?.dailyReviewLimit || settings.maxReviewsPerDay || 10;
  const reviewsToday = dailyProgress.bookReviews[book.id] || 0;

  if (reviewsToday < dailyLimit && bookCards.length > 0) {
    // Add cards up to (dailyLimit - reviewsToday)
  }
});
```

**2. Deck Stats Calculation (getDeckStats function, lines 1192-1233):**

```typescript
const dailyLimit = book?.settings?.dailyReviewLimit || settings.maxReviewsPerDay || 10;
const remaining = Math.max(0, dailyLimit - reviewsToday);
const limitedCards = sortedCards.slice(0, remaining);
```

**3. Card Creation (addToStudy function, lines 709-753):**

```typescript
const book = books.find(b => b.id === highlight.bookId);
const initialEaseFactor = book?.settings?.initialEaseFactor
  || settings.defaultInitialEaseFactor
  || 2.5;

const newCard: StudyCard = {
  easeFactor: initialEaseFactor,
  // ...
};
```

### Settings Priority Cascade

1. Book-specific setting (if defined)
2. User global setting (if defined)
3. Hard-coded default (10 for daily limit, 2.5 for ease factor)

## Daily Limits Implementation

### How Per-Book Limits Work

**Tracking (dailyProgress state):**
```typescript
const [dailyProgress, setDailyProgress] = useState<DailyProgress>({
  date: new Date().toISOString().split('T')[0],
  bookReviews: {}  // { bookId: reviewCount }
});
```

**Increment on Review (submitReview function, lines 1099-1162):**
```typescript
const highlight = highlights.find(h => h.id === previousCard.highlightId);
if (highlight) {
  const bookId = highlight.bookId;
  setDailyProgress(prev => ({
    ...prev,
    bookReviews: {
      ...prev.bookReviews,
      [bookId]: (prev.bookReviews[bookId] || 0) + 1
    }
  }));
}
```

**Decrement on Undo (undoLastReview function, lines 1249-1307):**
```typescript
setDailyProgress(prev => ({
  ...prev,
  bookReviews: {
    ...prev.bookReviews,
    [bookId]: Math.max(0, (prev.bookReviews[bookId] || 0) - 1)
  }
}));
```

**Daily Reset (startSession function, lines 967-971):**
```typescript
if (dailyProgress.date !== today) {
  setDailyProgress({ date: today, bookReviews: {} });
}
```

### Critical Logic Points to Test

1. **Daily limit enforcement**: Cards stop appearing after limit reached
2. **Per-book isolation**: Book A's limit doesn't affect Book B
3. **Day boundary**: Progress resets at midnight
4. **Undo correctness**: Decrement works without going negative
5. **Settings cascade**: Book override > Global > Default

## Testing Strategy

### Recommended Stack

| Library | Version | Purpose |
|---------|---------|---------|
| vitest | ^2.x | Test runner, native Vite integration |
| @testing-library/react | ^16.x | React component testing |
| @testing-library/jest-dom | ^6.x | Custom DOM matchers |
| @testing-library/user-event | ^14.x | User interaction simulation |

**Installation:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Configuration

**vite.config.ts addition:**
```typescript
export default defineConfig({
  // existing config...
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['services/**', 'components/StoreContext.tsx']
    }
  }
});
```

**src/setupTests.ts:**
```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

**package.json scripts:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Test Categories for Settings Audit

**1. Unit Tests (Pure Functions) - HIGH PRIORITY**

| Function | File | Test Cases |
|----------|------|------------|
| `calculateNextReview` | services/sm2.ts | All quality ratings (1-4), ease factor bounds |
| `initializeCard` | services/sm2.ts | Default values, highlightId passed correctly |

**2. Integration Tests (Settings Logic) - HIGH PRIORITY**

| Area | Test Cases |
|------|------------|
| Daily Limit Cascade | Book override > Global > Default |
| Ease Factor Cascade | Book override > Global > Default |
| Daily Progress Tracking | Increment, decrement, reset, persistence |
| Session Card Limiting | Correct number of cards based on limit |

**3. Component Tests (Settings UI) - MEDIUM PRIORITY**

| Component | Test Cases |
|-----------|------------|
| Preferences Tab | Input changes trigger updateSettings |
| Library Tab | Book settings expand/collapse, save on change |
| Settings cascade | Empty value shows placeholder, value overrides |

### Test File Structure

```
evoque/
├── services/
│   ├── sm2.ts
│   └── sm2.test.ts         # Unit tests for SM-2 algorithm
├── components/
│   ├── StoreContext.tsx
│   └── StoreContext.test.tsx  # Integration tests for settings logic
└── pages/
    └── Settings.test.tsx    # Component tests for Settings page
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Test assertions | Custom expect functions | @testing-library/jest-dom matchers |
| User interactions | Direct event dispatch | @testing-library/user-event |
| Component rendering | ReactDOM.render | @testing-library/react render |
| Test isolation | Manual cleanup | afterEach(cleanup) |
| Async waiting | setTimeout | waitFor, findBy queries |

## Common Pitfalls

### Pitfall 1: Testing Implementation Details
**What goes wrong:** Tests break when refactoring even though behavior is unchanged
**How to avoid:** Test user-visible behavior, not internal state. Use getByRole, getByText instead of getByTestId.

### Pitfall 2: Date Mocking Issues
**What goes wrong:** Tests pass/fail depending on time of day or timezone
**How to avoid:** Mock Date.now() and new Date() consistently in tests involving dailyProgress.

```typescript
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-30T12:00:00'));
});

afterEach(() => {
  vi.useRealTimers();
});
```

### Pitfall 3: Async State Updates
**What goes wrong:** Tests fail intermittently because state updates haven't propagated
**How to avoid:** Use waitFor() for assertions after state changes.

```typescript
await user.click(submitButton);
await waitFor(() => {
  expect(screen.getByText('Saved')).toBeInTheDocument();
});
```

### Pitfall 4: Context Provider Missing
**What goes wrong:** "useStore must be used within a StoreProvider" error
**How to avoid:** Create test wrapper with required providers.

```typescript
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <StoreProvider>{children}</StoreProvider>
  </AuthProvider>
);

render(<Settings />, { wrapper });
```

## Code Examples

### SM-2 Unit Test Example

```typescript
// services/sm2.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateNextReview, initializeCard } from './sm2';
import type { StudyCard } from '../types';

describe('calculateNextReview', () => {
  let baseCard: StudyCard;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-30T12:00:00'));

    baseCard = {
      id: 'test-card',
      highlightId: 'test-highlight',
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReviewDate: new Date().toISOString()
    };
  });

  describe('quality 1 (Again)', () => {
    it('resets repetitions to 0', () => {
      const card = { ...baseCard, repetitions: 3 };
      const result = calculateNextReview(card, 1);
      expect(result.repetitions).toBe(0);
    });

    it('sets interval to 1 day', () => {
      const result = calculateNextReview(baseCard, 1);
      expect(result.interval).toBe(1);
    });

    it('preserves ease factor', () => {
      const card = { ...baseCard, easeFactor: 2.0 };
      const result = calculateNextReview(card, 1);
      expect(result.easeFactor).toBe(2.0);
    });
  });

  describe('quality 3 (Good)', () => {
    it('increments repetitions', () => {
      const result = calculateNextReview(baseCard, 3);
      expect(result.repetitions).toBe(1);
    });

    it('sets interval to 1 on first review', () => {
      const result = calculateNextReview(baseCard, 3);
      expect(result.interval).toBe(1);
    });

    it('sets interval to 6 on second review', () => {
      const card = { ...baseCard, repetitions: 1, interval: 1 };
      const result = calculateNextReview(card, 3);
      expect(result.interval).toBe(6);
    });
  });

  describe('ease factor bounds', () => {
    it('does not go below 1.3', () => {
      const card = { ...baseCard, easeFactor: 1.4 };
      const result = calculateNextReview(card, 2); // Hard reduces by 0.15
      expect(result.easeFactor).toBe(1.3);
    });

    it('does not exceed 2.5', () => {
      const card = { ...baseCard, easeFactor: 2.45 };
      const result = calculateNextReview(card, 4); // Easy increases by 0.15
      expect(result.easeFactor).toBe(2.5);
    });
  });
});
```

### Daily Limit Logic Test Example

```typescript
// components/StoreContext.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { StoreProvider, useStore } from './StoreContext';
import { AuthProvider } from './AuthContext';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null })
    }))
  }
}));

describe('Daily Limit Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-30T10:00:00'));
  });

  it('respects per-book daily limit over global', async () => {
    const wrapper = ({ children }) => (
      <AuthProvider><StoreProvider>{children}</StoreProvider></AuthProvider>
    );

    const { result } = renderHook(() => useStore(), { wrapper });

    // Setup: Book with custom limit of 5, global is 10
    await act(async () => {
      // ... test implementation
    });

    // Assert: getDeckStats returns max 5 cards for this book
  });
});
```

## Known Issues/Gaps

### Issue 1: bulkAddToStudy Uses Hard-Coded Ease Factor
**Location:** StoreContext.tsx, lines 785-831
**Problem:** Does not respect book/global initialEaseFactor setting
```typescript
// Current (incorrect):
easeFactor: 2.5,

// Should be:
const book = books.find(b => b.id === highlight.bookId);
const initialEaseFactor = book?.settings?.initialEaseFactor
  || settings.defaultInitialEaseFactor
  || 2.5;
```
**Recommendation:** Fix during audit

### Issue 2: Magic Number for Daily Limit Default
**Location:** Multiple places in StoreContext.tsx
**Problem:** Hard-coded `10` instead of using constant
```typescript
// Should extract to constant:
const DEFAULT_DAILY_LIMIT = 10;
const DEFAULT_EASE_FACTOR = 2.5;
```
**Recommendation:** Extract constants during audit

### Issue 3: StudySession Hard-Coded Limit Check
**Location:** StudySession.tsx, line 283
**Problem:** `reviewsToday >= 10` should use actual limit
```typescript
const isDailyLimitReached = deckId && reviewsToday >= 10;
// Should be:
const book = books.find(b => b.id === deckId);
const dailyLimit = book?.settings?.dailyReviewLimit || settings.maxReviewsPerDay || 10;
const isDailyLimitReached = deckId && reviewsToday >= dailyLimit;
```
**Recommendation:** Fix during audit

### Issue 4: No Validation on Settings Inputs
**Location:** Settings.tsx, Preferences tab
**Problem:** User can enter values outside valid range (negative numbers, non-numeric)
**Recommendation:** Add input validation in audit

## Open Questions

1. **Should tests mock Supabase entirely?**
   - Current thinking: Yes, for unit/integration tests
   - E2E tests (if ever added) would use real Supabase

2. **Test coverage target?**
   - Recommendation: 80% for services/, 60% for components/

3. **Should Settings.tsx be split into smaller components?**
   - Current: 809 lines, manageable but getting large
   - Could extract tab content into separate files for easier testing

## Sources

### Primary (HIGH confidence)
- StoreContext.tsx - Direct code analysis
- Settings.tsx - Direct code analysis
- types.ts - Direct code analysis
- sm2.ts - Direct code analysis

### Secondary (MEDIUM confidence)
- [Vitest Getting Started](https://vitest.dev/guide/) - Official documentation
- [React Testing Library Guide](https://makersden.io/blog/guide-to-react-testing-library-vitest) - Integration patterns
- [Vitest Component Testing](https://vitest.dev/guide/browser/component-testing) - Official docs

## Metadata

**Confidence breakdown:**
- Current implementation analysis: HIGH - Direct code review
- Testing strategy: HIGH - Vitest is standard for Vite projects
- Known issues: HIGH - Found through code analysis
- Best practices: MEDIUM - Based on web search results

**Research date:** 2026-01-30
**Valid until:** 60 days (testing patterns are stable)
