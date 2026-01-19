# Technology Stack

**Analysis Date:** 2026-01-19

## Languages

**Primary:**
- TypeScript 5.8.2 - All application code (frontend, services, scripts)

**Secondary:**
- JavaScript - Configuration files (`postcss.config.js`, `tailwind.config.js`)
- HTML - Entry point (`index.html`)
- CSS - Styling (`index.css` with Tailwind)

## Runtime

**Environment:**
- Node.js (inferred from package.json, no `.nvmrc` present)
- Browser (React SPA)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- React 19.2.1 - UI framework
- React Router DOM 7.10.0 - Client-side routing (HashRouter)
- Vite 6.2.0 - Build tool and dev server

**Styling:**
- Tailwind CSS 3.4.17 - Utility-first CSS framework
- tailwindcss-animate 1.0.7 - Animation utilities
- class-variance-authority 0.7.1 - Component variant management
- clsx 2.1.1 + tailwind-merge 3.4.0 - Class name utilities

**Testing:**
- Not detected (no test framework configured)

**Build/Dev:**
- Vite 6.2.0 - Bundler and dev server
- @vitejs/plugin-react 5.0.0 - React plugin for Vite
- PostCSS 8.5.6 - CSS processing
- Autoprefixer 10.4.22 - CSS vendor prefixing
- tsx 4.21.0 - TypeScript execution for scripts
- ts-node 10.9.2 - TypeScript execution alternative

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.88.0 - Backend-as-a-Service client (database, auth)
- pdfjs-dist 5.4.449 - PDF parsing for Kindle highlight imports
- recharts 3.5.1 - Charts and data visualization

**UI Components:**
- @radix-ui/react-dialog 1.1.15 - Accessible dialog/modal component
- @radix-ui/react-popover 1.1.15 - Accessible popover component
- @radix-ui/react-slot 1.2.4 - Slot pattern for component composition
- cmdk 1.1.1 - Command palette/search component
- lucide-react 0.555.0 - Icon library

**Infrastructure:**
- dotenv 17.2.3 - Environment variable loading (dev scripts)

## Configuration

**TypeScript:**
- Config: `tsconfig.json`
- Target: ES2022
- Module: ESNext with bundler resolution
- JSX: react-jsx
- Path alias: `@/*` maps to project root

**Vite:**
- Config: `vite.config.ts`
- Dev server: port 3000, host 0.0.0.0
- Environment variables exposed via `loadEnv()`:
  - `GEMINI_API_KEY` (defined but API not used in current code)
- Path alias: `@` maps to project root

**Tailwind:**
- Config: `tailwind.config.js`
- Dark mode: class-based
- Content paths: `./index.html`, `./pages/**`, `./components/**`, `./app/**`, `./src/**`, `./lib/**`
- Extended theme with CSS variables for theming (shadcn/ui pattern)
- Plugin: tailwindcss-animate

**PostCSS:**
- Config: `postcss.config.js`
- Plugins: tailwindcss, autoprefixer

**Environment Variables:**
- `.env` file (committed - contains non-secret Supabase public keys)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public key

## Platform Requirements

**Development:**
- Node.js (version not specified)
- npm
- Modern browser for testing

**Production:**
- Static file hosting (Vite builds to `dist/`)
- Supabase project for backend services
- No server-side runtime required (SPA)

## Build Commands

```bash
npm run dev      # Start dev server on port 3000
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

## Scripts Directory

Utility scripts in `scripts/`:
- `check_duplicates.ts` - Duplicate detection utility
- `check_duplicates_json.ts` - JSON-based duplicate checking
- `compare_pdfs.ts` - PDF comparison utility
- `db_inspect.ts` - Database inspection script
- `map_ids.ts` - ID mapping utility

Run with: `npx tsx scripts/<script>.ts`

---

*Stack analysis: 2026-01-19*
