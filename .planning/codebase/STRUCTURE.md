# Codebase Structure

**Analysis Date:** 2026-01-19

## Directory Layout

```
evoque/
├── components/           # Reusable React components
│   ├── ui/              # Shadcn/Radix UI primitives
│   └── *.tsx            # Feature components
├── pages/               # Route-level page components
├── services/            # Business logic and parsers
├── lib/                 # Utilities and external clients
├── scripts/             # Development/debug scripts
├── lbp_context/         # Project context documentation
├── lbp_diretrizes/      # Project guidelines
├── lbp_implementation/  # Implementation notes
├── .planning/           # GSD planning documents
│   └── codebase/        # Codebase analysis docs
├── dist/                # Build output (generated)
├── node_modules/        # Dependencies (generated)
├── App.tsx              # Root component with routing
├── index.tsx            # Application entry point
├── index.html           # HTML template
├── index.css            # Global styles (Tailwind)
├── types.ts             # TypeScript type definitions
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## Directory Purposes

**components/:**
- Purpose: Shared React components and context providers
- Contains: UI components, modals, context providers, error boundaries
- Key files:
  - `StoreContext.tsx`: Central state management (1400+ lines)
  - `AuthContext.tsx`: Authentication provider
  - `Sidebar.tsx`: Navigation sidebar
  - `ui/`: Shadcn UI primitives (button, dialog, popover, etc.)

**pages/:**
- Purpose: Route-level page components (one per route)
- Contains: Full page layouts with business logic
- Key files:
  - `Dashboard.tsx`: Home page with stats and charts
  - `Highlights.tsx`: Highlight table with filters/sorting
  - `Study.tsx`: Deck selection for study sessions
  - `StudySession.tsx`: Active flashcard review
  - `Settings.tsx`: Import, library, account, preferences tabs
  - `BookDetails.tsx`: Individual book view
  - `Login.tsx`: Authentication page

**services/:**
- Purpose: Business logic and file parsing
- Contains: Parsers, algorithms, utility functions
- Key files:
  - `parser.ts`: Kindle My Clippings TXT parser
  - `pdfParser.ts`: Kindle PDF highlights parser
  - `ankiParser.ts`: Anki TSV export parser
  - `sm2.ts`: SM-2 spaced repetition algorithm
  - `idUtils.ts`: Deterministic UUID generation
  - `mockData.ts`: Sample data for development

**lib/:**
- Purpose: External service clients and utilities
- Contains: Supabase client, helpers, CSS utilities
- Key files:
  - `supabase.ts`: Supabase client initialization
  - `supabaseHelpers.ts`: Entity mappers (toSupabase*, fromSupabase*)
  - `utils.ts`: `cn()` utility for Tailwind class merging

**scripts/:**
- Purpose: Development and debugging scripts
- Contains: Database inspection, duplicate checking
- Key files:
  - `db_inspect.ts`: Database exploration
  - `check_duplicates.ts`: Highlight deduplication check
  - `map_ids.ts`: ID mapping utilities

## Key File Locations

**Entry Points:**
- `index.tsx`: React DOM mount point
- `index.html`: HTML template with root div
- `App.tsx`: Router configuration and provider hierarchy

**Configuration:**
- `vite.config.ts`: Vite build configuration
- `tailwind.config.js`: Tailwind theme customization
- `tsconfig.json`: TypeScript compiler options
- `package.json`: Dependencies and npm scripts
- `.env`: Environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

**Core Logic:**
- `components/StoreContext.tsx`: All state management and Supabase sync
- `components/AuthContext.tsx`: Authentication state
- `services/sm2.ts`: Spaced repetition algorithm
- `types.ts`: All domain type definitions

**Testing:**
- No test files detected in current structure

## Naming Conventions

**Files:**
- Components: PascalCase (`StoreContext.tsx`, `Sidebar.tsx`)
- Services: camelCase (`parser.ts`, `sm2.ts`)
- Pages: PascalCase (`Dashboard.tsx`, `StudySession.tsx`)
- UI primitives: kebab-case functionality, PascalCase file (`button.tsx`, `dialog.tsx`)

**Directories:**
- All lowercase with no separators (`components`, `services`, `pages`)
- Nested directories: `components/ui/`

**Components:**
- Default exports for all components
- Named exports for context hooks (`useStore`, `useAuth`)
- Page components match route names (e.g., `/study` -> `Study.tsx`)

**Types:**
- Interfaces in PascalCase (`Book`, `Highlight`, `StudyCard`)
- Type aliases in PascalCase (`SortOption`, `StudyStatus`)

## Where to Add New Code

**New Feature (Page-level):**
- Primary code: `pages/{FeatureName}.tsx`
- Add route in `App.tsx`
- Add nav item in `components/Sidebar.tsx` (if needed)

**New Component (Reusable):**
- Shared component: `components/{ComponentName}.tsx`
- UI primitive: `components/ui/{component-name}.tsx`

**New Service/Algorithm:**
- Business logic: `services/{serviceName}.ts`
- Export functions, import in StoreContext or pages

**New Type:**
- Add interface/type to `types.ts`
- Update `supabaseHelpers.ts` if persisted to database

**New Supabase Entity:**
1. Add type to `types.ts`
2. Add mappers to `lib/supabaseHelpers.ts`
3. Add state and methods to `components/StoreContext.tsx`

**Utilities:**
- Shared helpers: `lib/utils.ts`
- Supabase-specific: `lib/supabaseHelpers.ts`

## Special Directories

**dist/:**
- Purpose: Vite production build output
- Generated: Yes (via `npm run build`)
- Committed: No (in .gitignore)

**node_modules/:**
- Purpose: npm dependencies
- Generated: Yes (via `npm install`)
- Committed: No (in .gitignore)

**.planning/:**
- Purpose: GSD command planning documents
- Generated: By /gsd commands
- Committed: Yes

**lbp_*/ directories:**
- Purpose: Project documentation and context
- Generated: Manual
- Committed: Yes
- Contains: Technical context, guidelines, implementation notes

## Import Patterns

**Relative imports used throughout:**
```typescript
// From pages to components
import { useStore } from '../components/StoreContext';

// From components to lib
import { supabase } from '../lib/supabase';

// From services to types
import { Book, Highlight } from '../types';
```

**No path aliases configured** - all imports use relative paths.

---

*Structure analysis: 2026-01-19*
