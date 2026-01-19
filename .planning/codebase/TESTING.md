# Testing Patterns

**Analysis Date:** 2026-01-19

## Test Framework

**Runner:**
- Not configured - no testing framework installed

**Assertion Library:**
- Not configured

**Run Commands:**
```bash
# No test scripts defined in package.json
# package.json only has: dev, build, preview
```

## Current State: No Tests

This codebase does not have any testing infrastructure set up. The following analysis documents what would be recommended based on the project's technology stack.

**Evidence of No Testing:**
- No `jest.config.*` or `vitest.config.*` files
- No test-related dependencies in `package.json`
- No `*.test.ts`, `*.test.tsx`, `*.spec.ts` files in project (only in `node_modules/`)
- No `test` or `coverage` scripts in `package.json`

## Recommended Testing Setup

Based on the tech stack (React 19, Vite, TypeScript), the recommended testing setup would be:

### Vitest (Recommended)

**Why Vitest:**
- Native Vite integration (same transforms, same config)
- Fast execution with HMR
- Jest-compatible API
- Built-in TypeScript support

**Installation:**
```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
```

**Recommended Config (`vitest.config.ts`):**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'tests/setup.ts']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
})
```

**Setup File (`tests/setup.ts`):**
```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
  },
}))
```

## Test File Organization

**Recommended Location:**
- Co-located pattern: `Component.test.tsx` next to `Component.tsx`
- Or separate `tests/` directory mirroring `src/` structure

**Recommended Naming:**
- `*.test.ts` / `*.test.tsx` for unit tests
- `*.integration.test.ts` for integration tests
- `*.e2e.test.ts` for E2E tests (if using Playwright)

**Recommended Structure:**
```
evoque/
├── components/
│   ├── Sidebar.tsx
│   ├── Sidebar.test.tsx
│   ├── StoreContext.tsx
│   ├── StoreContext.test.tsx
│   └── ui/
│       ├── button.tsx
│       └── button.test.tsx
├── services/
│   ├── parser.ts
│   ├── parser.test.ts
│   ├── sm2.ts
│   └── sm2.test.ts
├── tests/
│   ├── setup.ts
│   └── utils/
│       └── test-utils.tsx
└── vitest.config.ts
```

## Recommended Test Structure

**Unit Test Pattern:**
```typescript
// services/sm2.test.ts
import { describe, it, expect } from 'vitest'
import { calculateNextReview, initializeCard } from './sm2'

describe('SM-2 Algorithm', () => {
  describe('initializeCard', () => {
    it('creates a card with default values', () => {
      const card = initializeCard('highlight-123')

      expect(card.highlightId).toBe('highlight-123')
      expect(card.easeFactor).toBe(2.5)
      expect(card.interval).toBe(0)
      expect(card.repetitions).toBe(0)
    })
  })

  describe('calculateNextReview', () => {
    it('resets card on quality 1 (Again)', () => {
      const card = {
        id: '1',
        highlightId: 'h1',
        easeFactor: 2.5,
        interval: 10,
        repetitions: 5,
        nextReviewDate: new Date().toISOString()
      }

      const result = calculateNextReview(card, 1)

      expect(result.repetitions).toBe(0)
      expect(result.interval).toBe(1)
    })

    it('increases interval on quality 3 (Good)', () => {
      const card = {
        id: '1',
        highlightId: 'h1',
        easeFactor: 2.5,
        interval: 6,
        repetitions: 2,
        nextReviewDate: new Date().toISOString()
      }

      const result = calculateNextReview(card, 3)

      expect(result.repetitions).toBe(3)
      expect(result.interval).toBeGreaterThan(card.interval)
    })
  })
})
```

**Component Test Pattern:**
```typescript
// components/Sidebar.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Sidebar from './Sidebar'
import { AuthProvider } from './AuthContext'
import { StoreProvider } from './StoreContext'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      <StoreProvider>
        {children}
      </StoreProvider>
    </AuthProvider>
  </BrowserRouter>
)

describe('Sidebar', () => {
  it('renders navigation items', () => {
    render(<Sidebar />, { wrapper })

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Highlights')).toBeInTheDocument()
    expect(screen.getByText('Study')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('toggles logout menu on user click', () => {
    render(<Sidebar />, { wrapper })

    const userButton = screen.getByRole('button', { name: /user/i })
    fireEvent.click(userButton)

    expect(screen.getByText('Sair')).toBeInTheDocument()
  })
})
```

**Parser Test Pattern:**
```typescript
// services/parser.test.ts
import { describe, it, expect } from 'vitest'
import { parseMyClippings } from './parser'

describe('parseMyClippings', () => {
  it('parses a single highlight', () => {
    const input = `Book Title (Author Name)
- Your Highlight on Location 100-105 | Added on Monday, January 1, 2024 12:00:00 PM

This is the highlight text.
==========`

    const result = parseMyClippings(input)

    expect(result.books).toHaveLength(1)
    expect(result.books[0].title).toBe('Book Title')
    expect(result.books[0].author).toBe('Author Name')
    expect(result.highlights).toHaveLength(1)
    expect(result.highlights[0].text).toBe('This is the highlight text.')
  })

  it('handles Portuguese date format', () => {
    const input = `Livro (Autor)
- Seu destaque na posição 50-55 | Adicionado: terça-feira, 22 de julho de 2025 02:05:09

Texto do destaque.
==========`

    const result = parseMyClippings(input)

    expect(result.highlights).toHaveLength(1)
    expect(result.highlights[0].dateAdded).toContain('2025')
  })

  it('associates notes with highlights', () => {
    const input = `Book (Author)
- Your Highlight on Location 100-105 | Added on Monday, January 1, 2024 12:00:00 PM

Highlight text.
==========
Book (Author)
- Your Note on Location 105 | Added on Monday, January 1, 2024 12:01:00 PM

Note content.
==========`

    const result = parseMyClippings(input)

    expect(result.highlights).toHaveLength(1)
    expect(result.highlights[0].note).toBe('Note content.')
  })
})
```

## Mocking

**Recommended Framework:** Vitest built-in `vi`

**Patterns:**

**Mocking Supabase:**
```typescript
import { vi } from 'vitest'

// Mock entire module
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}))

// Or per-test mocking
const mockSupabase = {
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({
      data: [{ id: '1', title: 'Test Book' }],
      error: null
    })
  })
}
```

**Mocking localStorage:**
```typescript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
```

**Mocking crypto.randomUUID:**
```typescript
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'mock-uuid-123')
})
```

**What to Mock:**
- External services (Supabase)
- Browser APIs (localStorage, crypto)
- File system operations (FileReader)
- Date/Time for deterministic tests

**What NOT to Mock:**
- Pure utility functions (parser, sm2)
- React hooks (use real implementations)
- Internal component interactions

## Fixtures and Factories

**Test Data Pattern:**
```typescript
// tests/fixtures/books.ts
import { Book, Highlight, StudyCard } from '@/types'

export const createBook = (overrides?: Partial<Book>): Book => ({
  id: 'book-1',
  title: 'Test Book',
  author: 'Test Author',
  coverUrl: 'https://example.com/cover.jpg',
  lastImported: '2024-01-01T00:00:00.000Z',
  highlightCount: 5,
  ...overrides,
})

export const createHighlight = (overrides?: Partial<Highlight>): Highlight => ({
  id: 'highlight-1',
  bookId: 'book-1',
  text: 'Test highlight text',
  location: '100-105',
  dateAdded: '2024-01-01T00:00:00.000Z',
  ...overrides,
})

export const createStudyCard = (overrides?: Partial<StudyCard>): StudyCard => ({
  id: 'card-1',
  highlightId: 'highlight-1',
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
  nextReviewDate: new Date().toISOString(),
  ...overrides,
})
```

**Location:**
- `tests/fixtures/` for shared fixtures
- Or inline in test files for simple cases

## Coverage

**Requirements:** Not enforced (no coverage tool configured)

**Recommended Targets:**
- Services/utilities: 90%+
- Components: 70%+
- Overall: 80%+

**View Coverage (after setup):**
```bash
npm run test:coverage
# or
npx vitest --coverage
```

## Test Types

**Unit Tests:**
- Scope: Individual functions and components
- Approach: Test pure functions directly, mock external deps
- Priority files:
  - `services/parser.ts` - complex parsing logic
  - `services/sm2.ts` - algorithm correctness
  - `services/idUtils.ts` - deterministic ID generation
  - `lib/supabaseHelpers.ts` - data transformation

**Integration Tests:**
- Scope: Multiple components working together
- Approach: Render with real providers, mock Supabase
- Priority scenarios:
  - Import flow (file upload -> parsing -> storage)
  - Study session flow (start -> review -> complete)
  - Authentication flow (login -> data load)

**E2E Tests:**
- Framework: Playwright (recommended)
- Scope: Full user journeys
- Not currently implemented

## Common Patterns

**Async Testing:**
```typescript
import { describe, it, expect, vi } from 'vitest'
import { waitFor } from '@testing-library/react'

it('loads data on mount', async () => {
  const { getByText } = render(<Component />)

  await waitFor(() => {
    expect(getByText('Loaded')).toBeInTheDocument()
  })
})
```

**Error Testing:**
```typescript
it('handles parsing errors gracefully', () => {
  const invalidInput = 'not valid clippings format'

  const result = parseMyClippings(invalidInput)

  expect(result.books).toHaveLength(0)
  expect(result.highlights).toHaveLength(0)
})

it('throws on invalid PDF', async () => {
  const file = new File(['invalid'], 'test.pdf', { type: 'application/pdf' })

  await expect(parsePDFKindleHighlights(file)).rejects.toThrow()
})
```

**Testing User Interactions:**
```typescript
import { fireEvent, screen } from '@testing-library/react'

it('submits form on button click', () => {
  render(<ImportForm />)

  const input = screen.getByLabelText('File')
  const file = new File(['content'], 'test.txt', { type: 'text/plain' })
  fireEvent.change(input, { target: { files: [file] } })

  const button = screen.getByRole('button', { name: /import/i })
  fireEvent.click(button)

  expect(mockImport).toHaveBeenCalled()
})
```

## Priority Test Targets

Based on criticality and complexity:

1. **High Priority:**
   - `services/parser.ts` - Core import functionality
   - `services/sm2.ts` - Study algorithm correctness
   - `services/idUtils.ts` - ID stability affects data integrity
   - `components/StoreContext.tsx` - Central state management

2. **Medium Priority:**
   - `services/pdfParser.ts` - PDF import
   - `services/ankiParser.ts` - Anki import
   - `lib/supabaseHelpers.ts` - Data transformations
   - `components/AuthContext.tsx` - Auth flow

3. **Lower Priority:**
   - UI components (shadcn/ui)
   - Page components
   - Styling/layout

---

*Testing analysis: 2026-01-19*
