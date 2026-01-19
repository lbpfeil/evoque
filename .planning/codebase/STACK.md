# Technology Stack

**Analysis Date:** 2026-01-19

## Languages

**Primary:**
- TypeScript ~5.8.2 - All application code (React components, services, types)

**Secondary:**
- JavaScript - Configuration files (`tailwind.config.js`, `postcss.config.js`)

## Runtime

**Environment:**
- Node.js (version not pinned, no `.nvmrc` present)
- Browser (ES2022 target, DOM APIs)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React ^19.2.1 - UI framework
- React Router DOM ^7.10.0 - Client-side routing (HashRouter)
- Vite ^6.2.0 - Build tool and dev server

**UI/Styling:**
- Tailwind CSS ^3.4.17 - Utility-first CSS framework
- shadcn/ui (radix-vega style) - Component library built on Radix primitives
- Radix UI (Dialog, Popover, Slot) - Accessible UI primitives
- class-variance-authority ^0.7.1 - Variant-based component styling
- tailwind-merge ^3.4.0 - Merge Tailwind classes
- clsx ^2.1.1 - Conditional class names
- lucide-react ^0.555.0 - Icon library

**Data Visualization:**
- recharts ^3.5.1 - Charts (AreaChart, BarChart) on Dashboard

**Testing:**
- Not detected - No test framework configured

**Build/Dev:**
- Vite ^6.2.0 - Bundler and dev server
- @vitejs/plugin-react ^5.0.0 - React Fast Refresh
- PostCSS ^8.5.6 - CSS processing
- Autoprefixer ^10.4.22 - CSS vendor prefixes
- tsx ^4.21.0 - TypeScript execution (scripts)
- ts-node ^10.9.2 - TypeScript execution (alternative)

## Key Dependencies

**Critical:**
- @supabase/supabase-js ^2.88.0 - Backend-as-a-Service (auth, database, real-time)
- pdfjs-dist ^5.4.449 - PDF parsing for Kindle highlights import
- cmdk ^1.1.1 - Command palette component

**Infrastructure:**
- dotenv ^17.2.3 - Environment variable loading (dev)

**Fonts:**
- @fontsource-variable/inter ^5.2.8 - Inter variable font

## Configuration

**Environment:**
- `.env` file with Vite-prefixed variables (`VITE_*`)
- Required env vars:
  - `VITE_SUPABASE_URL` - Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` - Supabase anonymous API key
- Optional: `GEMINI_API_KEY` (defined in vite.config.ts but not actively used in codebase)

**Build:**
- `vite.config.ts` - Vite configuration with path aliases
- `tsconfig.json` - TypeScript configuration (ES2022, bundler module resolution)
- `tailwind.config.js` - Tailwind with shadcn/ui theme
- `postcss.config.js` - PostCSS with Tailwind and Autoprefixer
- `components.json` - shadcn/ui configuration (radix-vega style, stone base color)

**TypeScript:**
- Target: ES2022
- Module: ESNext with bundler resolution
- JSX: react-jsx
- Path alias: `@/*` maps to project root

## Platform Requirements

**Development:**
- Node.js (LTS recommended)
- npm
- Dev server runs on port 3000 (host: 0.0.0.0)

**Production:**
- Static SPA deployment (Vite build outputs to `dist/`)
- Supabase backend (hosted)
- No server-side rendering

**Browser Support:**
- Modern browsers (ES2022 features)
- No explicit polyfills configured

---

*Stack analysis: 2026-01-19*
