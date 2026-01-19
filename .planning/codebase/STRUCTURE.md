# Codebase Structure

**Analysis Date:** 2025-01-19

## Directory Layout

```
evoque/
├── .claude/              # Claude Code config
├── .planning/            # GSD planning documents
│   └── codebase/         # Codebase analysis docs
├── components/           # React components
│   └── ui/               # shadcn/ui primitives
├── lib/                  # Utility libraries
├── pages/                # Route-level page components
├── scripts/              # Development/debug scripts
├── services/             # Business logic and algorithms
├── dist/                 # Build output (generated)
├── lbp_context/          # Project context docs (Portuguese)
├── lbp_diretrizes/       # Project guidelines (Portuguese)
├── lbp_implementation/   # Implementation notes (Portuguese)
├── App.tsx               # Root component with providers/router
├── index.tsx             # React DOM entry point
├── index.html            # HTML template
├── index.css             # Global styles (Tailwind)
├── types.ts              # TypeScript interfaces
├── vite.config.ts        # Vite bundler config
├── tailwind.config.js    # Tailwind CSS config
├── tsconfig.json         # TypeScript config
└── package.json          # Dependencies and scripts
```

## Directory Purposes

**components/**
- Purpose: Reusable React components and context providers
- Contains: Modals, popovers, sidebars, tables, context providers
- Key files:
  - `StoreContext.tsx`: Central state management (1400+ lines)
  - `AuthContext.tsx`: Authentication state
  - `Sidebar.tsx`: Navigation sidebar
  - `TagSelector.tsx`: Tag assignment UI
  - `TagManagerSidebar.tsx`: Tag CRUD interface

**components/ui/**
- Purpose: shadcn/ui component library primitives
- Contains: Button, Dialog, Input, Popover, Sheet, Command
- Key files: All are Radix UI wrappers styled with Tailwind

**pages/**
- Purpose: Full page components mapped to routes
- Contains: Dashboard, Highlights, Study, StudySession, Settings, BookDetails, Login
- Key files:
  - `Dashboard.tsx`: Stats overview with charts
  - `StudySession.tsx`: Core study flashcard interface
  - `Settings.tsx`: Import, library, account, preferences tabs
  - `Highlights.tsx`: Highlight table with filters and bulk actions

**services/**
- Purpose: Pure business logic, parsing, algorithms
- Contains: File parsers, SM-2 algorithm, ID utilities
- Key files:
  - `parser.ts`: Kindle My Clippings.txt parser
  - `pdfParser.ts`: Kindle PDF export parser
  - `ankiParser.ts`: Anki TSV import parser
  - `sm2.ts`: SM-2 spaced repetition algorithm
  - `idUtils.ts`: Deterministic UUID generation

**lib/**
- Purpose: Shared utilities and external service clients
- Contains: Supabase client, data transformation helpers, className utility
- Key files:
  - `supabase.ts`: Supabase client initialization
  - `supabaseHelpers.ts`: Entity conversion functions (to/from Supabase format)
  - `utils.ts`: `cn()` function for className merging

**scripts/**
- Purpose: Development and debugging scripts (run via tsx)
- Contains: Database inspection, duplicate checking, ID mapping
- Key files:
  - `db_inspect.ts`: Database debugging
  - `check_duplicates.ts`: Find duplicate highlights
  - `map_ids.ts`: ID migration utilities

## Key File Locations

**Entry Points:**
- `index.tsx`: React DOM render
- `App.tsx`: Component tree root with providers and router
- `index.html`: HTML template with root div

**Configuration:**
- `vite.config.ts`: Build tool configuration
- `tailwind.config.js`: Tailwind theme and plugins
- `tsconfig.json`: TypeScript compiler options
- `package.json`: Dependencies and npm scripts
- `components.json`: shadcn/ui configuration
- `.env`: Environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

**Core Logic:**
- `components/StoreContext.tsx`: All application state and Supabase sync
- `services/sm2.ts`: Spaced repetition algorithm
- `services/parser.ts`: Primary import parser

**Testing:**
- No test files detected in current codebase
- Test data: `MyClippingsTest.txt`, `MyClippingsTest_10.txt`

## Naming Conventions

**Files:**
- React components: PascalCase (`StoreContext.tsx`, `Dashboard.tsx`)
- Services/utilities: camelCase (`parser.ts`, `supabaseHelpers.ts`)
- Config files: lowercase with dots (`vite.config.ts`, `tailwind.config.js`)
- UI primitives: lowercase (`button.tsx`, `dialog.tsx`)

**Directories:**
- All lowercase, singular or descriptive (`components`, `pages`, `services`, `lib`)
- UI subdirectory: `components/ui/` for shadcn primitives
- Planning: `.planning/` for project planning docs

**Components:**
- Component name matches filename: `Dashboard.tsx` exports `Dashboard`
- Context providers: `{Name}Context.tsx` with `{Name}Provider` and `use{Name}` hook
- Default exports for pages and main components

**Functions:**
- camelCase: `parseMyClippings()`, `calculateNextReview()`
- Handlers: `handle{Action}` pattern (`handleDrop`, `handleResponse`)
- Getters: `get{Thing}` pattern (`getCardsDue`, `getBook`)

## Import Organization

**Order (observed pattern):**
1. React imports (`import React, { useState, useEffect } from 'react'`)
2. Third-party libraries (`react-router-dom`, `lucide-react`, `recharts`)
3. Local components (`../components/StoreContext`)
4. Local utilities (`../lib/supabase`, `../services/parser`)
5. Types (`../types`)

**Path Aliases:**
- None configured (uses relative paths `../`, `./`)

## Where to Add New Code

**New Page:**
- Create: `pages/{PageName}.tsx`
- Add route: `App.tsx` in `<Routes>`
- Add nav item: `components/Sidebar.tsx` in `navItems` array

**New Component:**
- Reusable UI: `components/{ComponentName}.tsx`
- shadcn primitive: `components/ui/{name}.tsx` (use shadcn CLI)
- Modal/Popover: `components/{Name}Modal.tsx` or `{Name}Popover.tsx`

**New Service/Algorithm:**
- Create: `services/{name}.ts`
- Pure functions, no React dependencies
- Import in StoreContext or pages as needed

**New Supabase Entity:**
1. Add interface to `types.ts`
2. Add `to/from` functions in `lib/supabaseHelpers.ts`
3. Add state and CRUD methods in `components/StoreContext.tsx`

**New API/Integration:**
- Client init: `lib/{serviceName}.ts`
- Helpers: `lib/{serviceName}Helpers.ts`

**Utilities:**
- General utils: `lib/utils.ts`
- Domain-specific: create new file in `lib/` or `services/`

## Special Directories

**dist/**
- Purpose: Production build output
- Generated: Yes (by `vite build`)
- Committed: No (in .gitignore)

**node_modules/**
- Purpose: npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (in .gitignore)

**.planning/**
- Purpose: GSD planning and codebase analysis documents
- Generated: Partially (by GSD commands)
- Committed: Yes

**lbp_*/**
- Purpose: Project-specific context, guidelines, implementation notes (Portuguese)
- Generated: No (manual documentation)
- Committed: Yes

---

*Structure analysis: 2025-01-19*
