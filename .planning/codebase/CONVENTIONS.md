# Coding Conventions

**Analysis Date:** 2026-01-19

## Naming Patterns

**Files:**
- Components: PascalCase with `.tsx` extension (`Sidebar.tsx`, `ErrorBoundary.tsx`, `TagSelector.tsx`)
- Pages: PascalCase in `pages/` directory (`Dashboard.tsx`, `BookDetails.tsx`, `StudySession.tsx`)
- Services/Utilities: camelCase (`parser.ts`, `sm2.ts`, `idUtils.ts`, `supabaseHelpers.ts`)
- UI Components (shadcn): lowercase with `.tsx` (`button.tsx`, `dialog.tsx`, `sheet.tsx`)

**Functions:**
- Regular functions: camelCase (`parseMyClippings`, `calculateNextReview`, `handleDrag`)
- Event handlers: `handle` prefix (`handleClose`, `handleDrop`, `handleSelectTag`)
- Getters: `get` prefix (`getBook`, `getCardsDue`, `getBookHighlights`)
- Boolean getters: `is` prefix (`isLoaded`, `isProcessing`, `isUploading`)
- Async operations: descriptive verbs (`importData`, `updateCard`, `deleteHighlight`)

**Variables:**
- State variables: camelCase (`books`, `highlights`, `currentSession`)
- Boolean state: often descriptive (`dragActive`, `showLogout`, `showStats`)
- Constants: camelCase (no SCREAMING_SNAKE_CASE used)

**Types/Interfaces:**
- PascalCase (`Book`, `Highlight`, `StudyCard`, `UserSettings`)
- Props interfaces: `ComponentNameProps` pattern (`DeleteBookModalProps`, `TagSelectorProps`)
- Context types: `ContextNameType` pattern (`AuthContextType`, `StoreContextType`)

## Code Style

**Formatting:**
- No ESLint or Prettier config in project root
- 2-space indentation (observed in codebase)
- Single quotes for strings in TypeScript
- Semicolons used consistently

**Linting:**
- No explicit linting configuration
- TypeScript strict mode not enabled
- `allowJs: true` in tsconfig for flexibility

## Import Organization

**Order:**
1. React and React-related imports (`react`, `react-router-dom`)
2. Third-party libraries (`@supabase/supabase-js`, `lucide-react`, `recharts`)
3. Local components (relative paths `../components/...`)
4. Local services/utilities (`../services/...`, `../lib/...`)
5. Types (`../types`)

**Path Aliases:**
- `@/*` maps to project root (configured in `tsconfig.json` and `vite.config.ts`)
- Used in shadcn/ui components: `@/lib/utils`, `@/components/ui`
- Most project code uses relative paths instead of aliases

**Example:**
```typescript
// From components/TagSelector.tsx
import React, { useState, useMemo } from 'react';
import { Check, Plus, Book, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useStore } from './StoreContext';
import { Tag } from '../types';
```

## Error Handling

**Patterns:**
- Try-catch blocks with console.error for async operations
- Optimistic updates with rollback on Supabase errors
- Error boundaries for React component errors (`components/ErrorBoundary.tsx`)

**Async Error Pattern:**
```typescript
// From components/StoreContext.tsx
try {
  const { error } = await supabase
    .from('highlights')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
} catch (error) {
  console.error('Failed to delete highlight from Supabase:', error);
  // Reload data on error (rollback)
  const { data } = await supabase
    .from('highlights')
    .select('*')
    .eq('user_id', user.id);
  if (data) setHighlights(data.map(fromSupabaseHighlight));
}
```

**Guard Clauses:**
```typescript
// Early returns for invalid state
if (!user) return;
if (!highlight || !book) return null;
if (!bookData) return null;
```

## Logging

**Framework:** Native `console` methods

**Patterns:**
- Debug logging with `DEBUG:` prefix for development
- `console.error()` for caught exceptions
- `console.warn()` for recoverable issues
- `console.log()` for debug tracing (should be removed in production)
- `console.group()`/`console.groupEnd()` for related logs

```typescript
console.log('DEBUG: updateCard called', { cardId, repetitions, nextReviewDate });
console.error('Failed to load data from Supabase:', error);
console.warn('Failed to parse date:', dateString, e);
```

## Comments

**When to Comment:**
- Complex algorithms (SM-2 implementation in `services/sm2.ts`)
- Non-obvious business logic
- TODO markers for incomplete features

**JSDoc/TSDoc:**
- Used sparingly, mainly in service functions
- Parameter descriptions for complex functions

```typescript
/**
 * Calculates the next review schedule based on the SM-2 algorithm.
 * @param card Current state of the card
 * @param quality Response quality (1-4):
 *   - 1: Again (Fail) - Reset card
 *   - 2: Hard - Pass but difficult (reduced interval)
 *   - 3: Good - Pass normally
 *   - 4: Easy - Pass easily (increased interval)
 */
```

## Function Design

**Size:** Functions are generally focused but can be long in complex components (StoreContext is 1400+ lines)

**Parameters:**
- Destructure props at function signature
- Use TypeScript interfaces for complex params
- Optional parameters with sensible defaults

**Return Values:**
- Explicit return types for utility functions
- React components return JSX or null
- Async functions return Promise

## Module Design

**Exports:**
- Named exports preferred over default exports
- Default exports used for page components and main components
- Grouped related exports from UI components

**Barrel Files:**
- No barrel files (index.ts) used
- Each component/service imported directly

## Component Patterns

### React Component Structure

**Functional Components Only:**
- All components are functional (except ErrorBoundary which uses class)
- Use hooks for state and effects

**Standard Component Pattern:**
```typescript
interface ComponentProps {
  prop1: string;
  prop2?: number;
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks first
  const [state, setState] = useState<Type>(initial);
  const { contextValue } = useContext(Context);

  // Derived state / memoized values
  const computed = useMemo(() => ..., [deps]);

  // Effects
  useEffect(() => { ... }, [deps]);

  // Event handlers
  const handleEvent = () => { ... };

  // Early returns for loading/error states
  if (!data) return null;

  // JSX
  return (...);
};

export default Component;
```

### Context Pattern

**Provider Pattern with Custom Hook:**
```typescript
// From components/AuthContext.tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  // State and logic
  return (
    <AuthContext.Provider value={{ ... }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### shadcn/ui Component Patterns

**Configuration:** `components.json`
- Style: `radix-vega`
- Base color: `stone`
- CSS Variables: enabled
- Icon library: `lucide`

**UI Components Location:** `components/ui/`

**Standard shadcn Pattern:**
```typescript
// From components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: { default: "...", destructive: "...", ... },
      size: { default: "...", sm: "...", lg: "...", icon: "..." },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

**Using shadcn Components:**
```typescript
// From components/TagSelector.tsx
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger asChild>
    <Button
      variant="ghost"
      role="combobox"
      aria-expanded={open}
      className={cn("h-auto p-1 hover:bg-zinc-100", className)}
    >
      ...
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-[220px] p-0" align="start">
    ...
  </PopoverContent>
</Popover>
```

**Key shadcn Utilities:**
- `cn()` from `lib/utils.ts` - Tailwind class merging
- `cva()` - Class variance authority for variants
- `asChild` prop - Radix slot pattern for composition

### Modal/Dialog Pattern

**Custom Modal (non-shadcn):**
```typescript
// From components/DeleteBookModal.tsx
<div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={onCancel}>
  <div className="bg-white rounded-md shadow-lg..." onClick={(e) => e.stopPropagation()}>
    {/* Modal content */}
  </div>
</div>
```

**Portal Pattern:**
```typescript
// From components/Portal.tsx - for rendering outside component tree
<Portal>
  <div className="fixed top-0 left-0 right-0 bottom-0...">
    {/* Overlay and modal */}
  </div>
</Portal>
```

### State Management

**Context-Based Global State:**
- `StoreContext` - Main app state (books, highlights, cards, settings)
- `AuthContext` - Authentication state
- No Redux or Zustand - pure React Context

**Optimistic Updates Pattern:**
```typescript
// 1. Update local state immediately
setHighlights(prev => prev.filter(h => h.id !== id));

// 2. Sync with backend
try {
  const { error } = await supabase.from('highlights').delete()...;
  if (error) throw error;
} catch (error) {
  // 3. Rollback on error
  const { data } = await supabase.from('highlights').select('*')...;
  if (data) setHighlights(data.map(fromSupabaseHighlight));
}
```

## Tailwind CSS Patterns

**Color Palette:** zinc-based neutral colors
- Background: `bg-zinc-50`, `bg-white`
- Text: `text-zinc-900`, `text-zinc-600`, `text-zinc-400`
- Borders: `border-zinc-200`, `border-zinc-100`
- Accents: `text-blue-600`, `text-red-600`, `text-amber-600`

**Common Utility Patterns:**
```typescript
// Interactive states
"hover:bg-zinc-100 transition-colors"

// Flexbox layouts
"flex items-center gap-2"
"flex flex-col space-y-2"

// Responsive
"hidden md:flex"
"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"

// Text truncation
"truncate" or "line-clamp-2"

// Sizing
"h-10 w-10" (fixed)
"flex-1 min-w-0" (flexible with overflow protection)
```

**CSS Variables:** Defined in `index.css` using oklch color space

## TypeScript Patterns

**Type Definitions:** Centralized in `types.ts`

**Interface vs Type:**
- Interfaces for object shapes (`interface Book { ... }`)
- Types for unions and utilities (`type StudyStatus = 'new' | 'learning' | 'review'`)

**Generic Patterns:**
```typescript
// From Supabase helpers
export const fromSupabaseBook = (row: any): Book => ({ ... });
```

**Optional Chaining:**
```typescript
highlight?.tags || []
card?.easeFactor?.toFixed(2) || '-'
```

---

*Convention analysis: 2026-01-19*
