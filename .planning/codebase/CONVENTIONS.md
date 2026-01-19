# Coding Conventions

**Analysis Date:** 2026-01-19

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `StoreContext.tsx`, `ErrorBoundary.tsx`)
- Services/utilities: camelCase (e.g., `parser.ts`, `idUtils.ts`, `supabaseHelpers.ts`)
- UI components: lowercase with single word (e.g., `button.tsx`, `dialog.tsx`, `input.tsx`)
- Pages: PascalCase (e.g., `Dashboard.tsx`, `Highlights.tsx`, `StudySession.tsx`)

**Functions:**
- camelCase for all functions
- Verbs for actions: `parseMyClippings`, `calculateNextReview`, `generateDeterministicUUID`
- Prefixes: `get*` for getters, `update*` for mutations, `handle*` for event handlers
- Async functions follow same pattern: `signIn`, `signOut`, `loadData`

**Variables:**
- camelCase for local variables and state
- `is*`/`has*` prefix for booleans: `isLoaded`, `hasNote`, `isCorrect`
- Descriptive names: `filteredAndSortedHighlights`, `dailyProgress`, `currentSession`

**Types/Interfaces:**
- PascalCase for types and interfaces: `Book`, `Highlight`, `StudyCard`, `UserSettings`
- Props interfaces: `ComponentNameProps` pattern (e.g., `HighlightEditModalProps`)
- Context types: `*ContextType` suffix (e.g., `AuthContextType`, `StoreContextType`)

**React Components:**
- PascalCase function names matching file names
- Default export for page/feature components
- Named exports for UI primitives and utilities

## Code Style

**Formatting:**
- No explicit Prettier config in project root (uses defaults)
- 2-space indentation
- Single quotes for strings
- No trailing semicolons (inconsistent - some files have them)
- Max line length ~100-120 characters

**Linting:**
- No ESLint configuration detected
- TypeScript strict mode not enabled
- `allowJs: true` in tsconfig

## Import Organization

**Order:**
1. React and React-related imports (`react`, `react-dom`, `react-router-dom`)
2. External library imports (`@supabase/supabase-js`, `lucide-react`, `recharts`)
3. Internal components (relative paths: `./components/*`, `../components/*`)
4. Internal services/utilities (`../services/*`, `../lib/*`)
5. Types (`../types`)
6. CSS (`./index.css`)

**Path Aliases:**
- `@/*` maps to project root (configured in `tsconfig.json` and `vite.config.ts`)
- Usage example: `import { cn } from "@/lib/utils"`
- Relative paths more commonly used: `../../lib/utils`

## Error Handling

**Patterns:**
- Try-catch blocks with console.error logging
- Optimistic updates with rollback on failure (Supabase operations)
- Error state thrown to React error boundaries for critical failures

**Example pattern from `StoreContext.tsx`:**
```typescript
try {
  const { error } = await supabase.from('books').delete().eq('id', id);
  if (error) throw error;
} catch (error) {
  console.error('Failed to delete book from Supabase:', error);
  // Rollback: reload data from server
  const { data } = await supabase.from('books').select('*').eq('user_id', user.id);
  if (data) setBooks(data.map(fromSupabaseBook));
}
```

**Async error handling:**
- Supabase errors checked via `if (error) throw error`
- User-facing errors wrapped in `new Error()` with descriptive messages
- Non-critical errors logged but not thrown (e.g., review logs)

## Logging

**Framework:** Native `console` methods

**Patterns:**
- `console.error()` for caught exceptions
- `console.warn()` for recoverable issues (e.g., parsing failures)
- `console.log()` with `DEBUG:` prefix for development logging
- `console.group()`/`console.groupEnd()` for grouped output

**When to log:**
- Supabase operation failures
- Data parsing errors
- Debug information during development (should be removed for production)

## Comments

**When to Comment:**
- JSDoc-style comments for utility functions with parameters
- Section dividers using `// ============================================`
- Inline comments for complex business logic

**JSDoc/TSDoc:**
- Used in service files (`services/sm2.ts`, `services/idUtils.ts`)
- Document parameters with `@param` tags
- Not consistently applied across all files

**Example from `sm2.ts`:**
```typescript
/**
 * Calculates the next review schedule based on the SM-2 algorithm.
 * @param card Current state of the card
 * @param quality Response quality (1-4):
 *   - 1: Again (Fail) - Reset card
 *   - 2: Hard - Pass but difficult
 *   - 3: Good - Pass normally
 *   - 4: Easy - Pass easily
 */
```

## Function Design

**Size:**
- Small, focused functions preferred
- Larger functions (100+ lines) exist in `StoreContext.tsx` for complex state operations

**Parameters:**
- Destructuring for React props
- Object parameters for functions with multiple options
- Optional parameters with defaults or `?` syntax

**Return Values:**
- Explicit return types not consistently used (TypeScript inference)
- Async functions return `Promise<void>` or `Promise<T>`
- Context methods return void or simple types

## Module Design

**Exports:**
- Default exports for React components
- Named exports for utilities and types
- Barrel exports in UI folder (`components/ui/*.tsx`)

**Barrel Files:**
- Not used (no `index.ts` files for re-exports)
- Direct imports to specific files

## React Patterns

**State Management:**
- React Context for global state (`StoreContext`, `AuthContext`)
- `useState` for local component state
- `useMemo` for expensive computations
- `useEffect` for side effects and data loading

**Component Structure:**
```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';

// 2. Type definitions (inline or imported)
interface ComponentProps {
  prop: string;
}

// 3. Component function
const Component: React.FC<ComponentProps> = ({ prop }) => {
  // 4. Hooks at top
  const [state, setState] = useState();

  // 5. Derived state / memoized values
  const computed = useMemo(() => {}, []);

  // 6. Effects
  useEffect(() => {}, []);

  // 7. Event handlers
  const handleClick = () => {};

  // 8. Render
  return <div />;
};

// 9. Export
export default Component;
```

## Styling Conventions

**Approach:** Tailwind CSS with utility classes

**Class naming:**
- Use `cn()` utility from `lib/utils.ts` for conditional classes
- Class-variance-authority (CVA) for component variants (see `components/ui/button.tsx`)

**Color scheme:**
- Zinc-based grayscale: `zinc-50`, `zinc-100`, `zinc-200`, `zinc-500`, `zinc-900`
- Accent colors via CSS variables: `--primary`, `--secondary`, `--destructive`
- HSL color format in Tailwind config

**Spacing:**
- Consistent use of Tailwind spacing scale
- Common patterns: `p-4`, `p-6`, `p-8`, `gap-2`, `gap-4`, `space-y-4`

## Data Transformation

**Supabase helpers pattern:**
- `toSupabase*` functions convert app types to database format
- `fromSupabase*` functions convert database rows to app types
- Located in `lib/supabaseHelpers.ts`

**Example:**
```typescript
export const toSupabaseBook = (book: Book, userId: string) => ({
  id: book.id,
  user_id: userId,
  title: book.title,
  cover_url: book.coverUrl || null,  // camelCase to snake_case
});

export const fromSupabaseBook = (row: any): Book => ({
  id: row.id,
  title: row.title,
  coverUrl: row.cover_url,  // snake_case to camelCase
});
```

---

*Convention analysis: 2026-01-19*
