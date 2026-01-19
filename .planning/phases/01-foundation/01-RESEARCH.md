# Phase 1 Research: Foundation

**Researched:** 2026-01-19
**Domain:** Theme system, color configuration, shadcn components
**Confidence:** HIGH

## Summary

Phase 1 establishes the foundation for the warm/friendly UI redesign by fixing critical color system issues, implementing theme management, and installing additional shadcn components. The primary blockers are:

1. **HSL/OKLCH mismatch** - tailwind.config.js wraps CSS variables in `hsl()` but index.css uses OKLCH values. This causes colors to render incorrectly.
2. **Missing ThemeProvider** - No mechanism exists to toggle themes or persist user preference.
3. **index.html issues** - Contains a CDN Tailwind script and hardcoded styles that conflict with the build system.

**Primary recommendation:** Fix the HSL/OKLCH mismatch FIRST, then implement ThemeProvider, then install components.

---

## HSL/OKLCH Fix

### The Problem

**tailwind.config.js (line 24-56):**
```javascript
colors: {
    background: "hsl(var(--background))",  // WRONG
    foreground: "hsl(var(--foreground))",  // WRONG
    // ... all colors wrapped in hsl()
}
```

**index.css (line 10-36):**
```css
:root {
    --background: oklch(1 0 0);           // OKLCH format
    --foreground: oklch(0.147 0.004 49.25); // OKLCH format
    --primary: oklch(0.67 0.16 58);       // OKLCH format
}
```

**Result:** `hsl(oklch(...))` is invalid CSS. Colors fail silently or render incorrectly.

### The Fix

Remove `hsl()` wrappers from tailwind.config.js and reference CSS variables directly:

```javascript
// tailwind.config.js
colors: {
    border: "var(--border)",
    input: "var(--input)",
    ring: "var(--ring)",
    background: "var(--background)",
    foreground: "var(--foreground)",
    primary: {
        DEFAULT: "var(--primary)",
        foreground: "var(--primary-foreground)",
    },
    secondary: {
        DEFAULT: "var(--secondary)",
        foreground: "var(--secondary-foreground)",
    },
    destructive: {
        DEFAULT: "var(--destructive)",
        foreground: "var(--destructive-foreground)",
    },
    muted: {
        DEFAULT: "var(--muted)",
        foreground: "var(--muted-foreground)",
    },
    accent: {
        DEFAULT: "var(--accent)",
        foreground: "var(--accent-foreground)",
    },
    popover: {
        DEFAULT: "var(--popover)",
        foreground: "var(--popover-foreground)",
    },
    card: {
        DEFAULT: "var(--card)",
        foreground: "var(--card-foreground)",
    },
    sidebar: {
        DEFAULT: "var(--sidebar)",
        foreground: "var(--sidebar-foreground)",
        primary: "var(--sidebar-primary)",
        "primary-foreground": "var(--sidebar-primary-foreground)",
        accent: "var(--sidebar-accent)",
        "accent-foreground": "var(--sidebar-accent-foreground)",
        border: "var(--sidebar-border)",
        ring: "var(--sidebar-ring)",
    },
    chart: {
        1: "var(--chart-1)",
        2: "var(--chart-2)",
        3: "var(--chart-3)",
        4: "var(--chart-4)",
        5: "var(--chart-5)",
    },
},
```

### Additional CSS Fix

**index.css line 32 and 90** have HSL values mixed with OKLCH:
```css
--destructive-foreground: 210 40% 98%;  // WRONG - raw HSL without oklch()
```

Should be:
```css
--destructive-foreground: oklch(0.985 0.001 106.423);  // Match other foreground values
```

**Confidence:** HIGH - Verified against actual codebase and shadcn OKLCH documentation.

---

## ThemeProvider Implementation

### Architecture

The project is a **Vite SPA** (not Next.js), so use a custom ThemeProvider, NOT next-themes.

**Provider location:** `components/ThemeProvider.tsx`
**Hook location:** Same file, exported as `useTheme`

### Complete Implementation

```typescript
// components/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "dark" | "light"
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "evoque-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "light"
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return theme
  })

  // Apply theme class to document
  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
      setResolvedTheme(systemTheme)
    } else {
      root.classList.add(theme)
      setResolvedTheme(theme)
    }
  }, [theme])

  // Listen for system preference changes
  useEffect(() => {
    if (theme !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? "dark" : "light"
      const root = window.document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(newTheme)
      setResolvedTheme(newTheme)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme)
    setThemeState(newTheme)
  }

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
```

### App Integration

Wrap the app at the highest level possible:

```typescript
// App.tsx
import { ThemeProvider } from './components/ThemeProvider';

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="evoque-theme">
          <ProtectedApp />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};
```

**Confidence:** HIGH - This is the official shadcn/ui pattern for Vite apps.

---

## Anti-FOUC Script

### The Problem

Without a blocking script, users with dark mode preference see a flash of light theme before React hydrates.

### The Solution

Add an inline script to `index.html` that runs BEFORE React loads:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#fafaf9" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#1c1917" media="(prefers-color-scheme: dark)" />
    <title>Evoque</title>
    <script>
      // Anti-FOUC: Apply theme before React loads
      (function() {
        const storageKey = 'evoque-theme';
        const theme = localStorage.getItem(storageKey);

        if (theme === 'dark' ||
            (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
            (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.add('light');
        }
      })();
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
```

### Current index.html Issues to Fix

The current `index.html` has several problems:

1. **CDN Tailwind script** (line 8) - Should be removed, Vite handles this
2. **Google Fonts link** (line 9) - Already using @fontsource-variable/inter in CSS
3. **Hardcoded styles** (lines 10-15) - Conflicts with CSS variables

**Confidence:** HIGH - Standard pattern for Vite SPAs with class-based dark mode.

---

## shadcn Installation

### Exact Command

```bash
npx shadcn@latest add card tabs badge select checkbox switch tooltip scroll-area dropdown-menu -y
```

### Components to Install

| Component | Purpose |
|-----------|---------|
| card | Flashcard display, settings panels |
| tabs | Navigation between views |
| badge | Tag display on highlights |
| select | Book/tag filtering |
| checkbox | Bulk selection, settings toggles |
| switch | Theme toggle, feature toggles |
| tooltip | Accessibility for icon buttons |
| scroll-area | Custom scrollbars for highlight lists |
| dropdown-menu | Actions menu, theme selector |

### Already Installed

- button
- dialog
- input
- popover
- command
- sheet

### Import Path Issue

Current button.tsx uses relative import:
```typescript
import { cn } from "../../lib/utils"  // AVOID
```

Should use alias (already configured in components.json):
```typescript
import { cn } from "@/lib/utils"  // PREFERRED
```

The shadcn CLI should use correct aliases when installing new components.

**Confidence:** HIGH - Verified from existing components.json configuration.

---

## Warm Palette Values

### Current Palette Analysis

The existing palette is already warm-toned (stone-based with amber hue range 46-70). Minor refinements needed:

### Light Mode Updates (Warmer)

```css
:root {
  /* Backgrounds - add slight cream tint */
  --background: oklch(0.995 0.003 90);     /* Was: oklch(1 0 0) - pure white */
  --foreground: oklch(0.18 0.01 50);        /* Warm dark, not pure black */

  /* Cards - slightly warmer */
  --card: oklch(1 0.002 85);
  --card-foreground: oklch(0.18 0.01 50);

  /* Primary - keep current amber */
  --primary: oklch(0.67 0.16 58);           /* Keep - already warm amber */
  --primary-foreground: oklch(0.99 0.02 95);

  /* Secondary - warm undertone */
  --secondary: oklch(0.95 0.008 80);
  --secondary-foreground: oklch(0.25 0.01 55);

  /* Muted - warm stone */
  --muted: oklch(0.96 0.006 80);
  --muted-foreground: oklch(0.50 0.02 55);

  /* Accent - soft peach */
  --accent: oklch(0.94 0.04 70);
  --accent-foreground: oklch(0.25 0.01 55);

  /* Borders - warm undertone */
  --border: oklch(0.90 0.01 70);
  --input: oklch(0.90 0.01 70);
  --ring: oklch(0.67 0.16 58);

  /* Destructive - warm red */
  --destructive: oklch(0.58 0.22 30);
  --destructive-foreground: oklch(0.98 0.01 90);

  /* Radius - increase for friendlier feel */
  --radius: 0.75rem;                        /* Was: 0.45rem */
}
```

### Dark Mode Updates (Less Saturated)

```css
.dark {
  /* Backgrounds - warm charcoal, not pure black */
  --background: oklch(0.16 0.01 50);        /* Warm charcoal */
  --foreground: oklch(0.96 0.006 80);       /* Warm off-white */

  /* Cards - elevated warm surface */
  --card: oklch(0.22 0.012 55);
  --card-foreground: oklch(0.96 0.006 80);

  /* Primary - brighter amber for dark mode contrast */
  --primary: oklch(0.75 0.15 68);
  --primary-foreground: oklch(0.20 0.06 50);

  /* Secondary */
  --secondary: oklch(0.28 0.01 55);
  --secondary-foreground: oklch(0.96 0.006 80);

  /* Muted */
  --muted: oklch(0.26 0.012 50);
  --muted-foreground: oklch(0.68 0.02 60);

  /* Accent */
  --accent: oklch(0.30 0.04 55);
  --accent-foreground: oklch(0.96 0.006 80);

  /* Borders - subtle warm */
  --border: oklch(1 0 0 / 12%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.60 0.12 60);

  /* Destructive */
  --destructive: oklch(0.70 0.20 25);
  --destructive-foreground: oklch(0.98 0.01 90);
}
```

### Border Radius Update

Current: `--radius: 0.45rem;`
Target: `--radius: 0.75rem;`

This creates friendlier, more rounded corners throughout the UI.

**Confidence:** MEDIUM - Based on design research and color psychology. Values may need fine-tuning during implementation.

---

## CSS Cleanup

### Duplicate @layer base Blocks

**Current state (index.css):**
```css
@layer base {
  :root { ... }
  .dark { ... }
  .theme { ... }
  * { @apply border-border outline-ring/50; }
  body { @apply font-sans bg-background text-foreground; }
  html { @apply font-sans; }
}

@layer base {  /* DUPLICATE - lines 123-130 */
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}
```

**Fix:** Remove the second `@layer base` block entirely. The first block already contains these rules.

### Progress Bar Animation

The `.progress-bar-animated` class uses hardcoded colors:
```css
background: linear-gradient(90deg, #000000 0%, #3b3b3b 25%, ...);
```

Should use CSS variables for theme compatibility:
```css
background: linear-gradient(90deg,
  var(--foreground) 0%,
  var(--muted-foreground) 25%,
  var(--foreground) 50%,
  var(--muted-foreground) 75%,
  var(--foreground) 100%
);
```

**Confidence:** HIGH - Verified from actual codebase analysis.

---

## Implementation Order

Critical path with dependencies:

### Step 1: Fix HSL/OKLCH Mismatch (FOUND-01)
**Why first:** All color rendering depends on this. Nothing else works correctly until fixed.
**Files:** tailwind.config.js, index.css (line 32, 90)

### Step 2: Consolidate CSS (FOUND-07)
**Why second:** Clean foundation before adding more.
**Files:** index.css (remove duplicate @layer base)

### Step 3: Clean index.html
**Why third:** Remove conflicts before adding anti-FOUC script.
**Files:** index.html (remove CDN script, Google Fonts, hardcoded styles)

### Step 4: Add Anti-FOUC Script (FOUND-06)
**Why fourth:** Prepare for theme switching.
**Files:** index.html

### Step 5: Create ThemeProvider (FOUND-02, FOUND-04, FOUND-05)
**Why fifth:** Infrastructure for theme management.
**Files:** components/ThemeProvider.tsx

### Step 6: Integrate ThemeProvider
**Why sixth:** Wire up the provider.
**Files:** App.tsx

### Step 7: Create Theme Toggle (FOUND-03)
**Why seventh:** User-facing control.
**Files:** components/ThemeToggle.tsx

### Step 8: Install shadcn Components (COMP-01)
**Why eighth:** Can happen any time after Step 1, but doing last keeps focus.
**Files:** components/ui/*.tsx

### Step 9: Apply Warm Palette (COLOR-01, COLOR-02)
**Why ninth:** Visual refinement after infrastructure works.
**Files:** index.css

### Step 10: Update Border Radius (COLOR-05)
**Why last:** Simple visual tweak.
**Files:** index.css (--radius variable)

---

## Hardcoded Colors to Replace

Components using hardcoded colors that should use CSS variables:

### App.tsx (lines 21, 23, 40-46)
```typescript
// Current
<div className="min-h-screen bg-zinc-50 flex text-zinc-900 ...">
<div className="min-h-screen flex items-center justify-center bg-zinc-50">
<Loader2 className="w-12 h-12 text-blue-600 animate-spin ...">
<p className="text-sm text-zinc-600">

// Should be
<div className="min-h-screen bg-background flex text-foreground ...">
<div className="min-h-screen flex items-center justify-center bg-background">
<Loader2 className="w-12 h-12 text-primary animate-spin ...">
<p className="text-sm text-muted-foreground">
```

This is noted for Phase 2 (Component Migration), not Phase 1.

---

## Verification Checklist

After Phase 1 completion, verify:

- [ ] No `hsl(var(--` patterns in tailwind.config.js
- [ ] All CSS variables use consistent OKLCH format
- [ ] Only one `@layer base` block in index.css
- [ ] index.html has anti-FOUC script, no CDN Tailwind
- [ ] ThemeProvider wraps app root
- [ ] Theme toggle visible and functional
- [ ] Theme persists across page refresh
- [ ] System preference detection works
- [ ] No flash on page load with dark preference
- [ ] All new shadcn components installed
- [ ] Border radius increased to 0.75rem
- [ ] Warm palette applied to light and dark modes

---

## Sources

### Primary (HIGH confidence)
- shadcn/ui Dark Mode for Vite: https://ui.shadcn.com/docs/dark-mode/vite
- shadcn/ui Theming: https://ui.shadcn.com/docs/theming
- Existing codebase analysis: tailwind.config.js, index.css, index.html, components.json

### Secondary (MEDIUM confidence)
- Color psychology research in .planning/research/FEATURES.md
- Design patterns in .planning/research/STACK.md

---

## Metadata

**Confidence breakdown:**
- HSL/OKLCH fix: HIGH - Verified against actual files
- ThemeProvider: HIGH - Official shadcn Vite pattern
- Anti-FOUC: HIGH - Standard Vite SPA pattern
- shadcn installation: HIGH - Official CLI
- Warm palette: MEDIUM - Design research, may need tuning
- Implementation order: HIGH - Based on dependency analysis

**Research date:** 2026-01-19
**Valid until:** 2026-02-19 (stable domain, 30 days)
