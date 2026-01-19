# Architecture Research: Theme System

**Domain:** React Theme System (dark mode)
**Researched:** 2026-01-19
**Confidence:** HIGH

## Executive Summary

The recommended architecture uses **next-themes** as the theme provider with class-based switching for Tailwind CSS integration. This approach is the de facto standard for shadcn/ui projects and provides:

- System preference detection via `prefers-color-scheme`
- localStorage persistence with cross-tab synchronization
- No flash on load (FOUC prevention)
- Mobile OS theme change detection

The project already has the CSS infrastructure in place (OKLCH variables in `:root` and `.dark`), making implementation straightforward.

---

## Theme Provider Pattern

### Recommendation: next-themes

**Why next-themes over custom implementation:**

| Aspect | next-themes | Custom Hook |
|--------|-------------|-------------|
| System preference | Built-in | Manual matchMedia |
| Persistence | Built-in | Manual localStorage |
| Cross-tab sync | Built-in | Manual storage events |
| FOUC prevention | Inline script injection | Complex manual setup |
| Hydration safety | Documented patterns | Must figure out |
| Maintenance | Community maintained | Team maintained |

**Installation:**
```bash
npm install next-themes
```

### Provider Architecture

```
App.tsx
  |
  +-- ErrorBoundary
        |
        +-- AuthProvider
              |
              +-- ThemeProvider (NEW - wraps everything)
                    |
                    +-- ProtectedApp
                          |
                          +-- HashRouter
                                |
                                +-- StoreProvider
                                      |
                                      +-- AppLayout
```

**Key insight:** ThemeProvider must wrap the router and all UI components but can be inside AuthProvider since theme is independent of auth state.

### ThemeProvider Implementation

Create `components/ThemeProvider.tsx`:

```tsx
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
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  // Resolve system theme
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light")

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
      const root = window.document.documentElement
      root.classList.remove("light", "dark")
      const newTheme = e.matches ? "dark" : "light"
      root.classList.add(newTheme)
      setResolvedTheme(newTheme)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    resolvedTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
```

### Alternative: Use next-themes Directly

For simpler implementation, use next-themes directly:

```tsx
// components/ThemeProvider.tsx
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="evoque-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

**Recommendation:** Use next-themes directly. It handles edge cases that a custom implementation might miss.

---

## Persistence Strategy

### localStorage Pattern

**Storage key:** `evoque-theme`
**Possible values:** `"light"` | `"dark"` | `"system"`

**Flow:**
1. On initial load, check localStorage for saved preference
2. If not found, default to `"system"`
3. If `"system"`, use `matchMedia("(prefers-color-scheme: dark)")` to resolve
4. Apply resolved theme as class on `<html>` element
5. On theme change, update localStorage and class immediately

### FOUC Prevention (Critical for Vite SPA)

The Flash of Unstyled Content occurs when React hydrates after the page loads with wrong theme. For Vite SPAs without SSR, add this inline script to `index.html`:

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Evoque</title>
    <script>
      // Prevent FOUC - runs before React
      (function() {
        const storageKey = 'evoque-theme';
        const theme = localStorage.getItem(storageKey);

        if (theme === 'dark' ||
            (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
            (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
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

**Why this works:** The inline script executes synchronously before React loads, applying the correct class immediately.

### Cross-Tab Synchronization

next-themes handles this automatically. For custom implementation:

```tsx
useEffect(() => {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === storageKey && e.newValue) {
      setTheme(e.newValue as Theme)
    }
  }
  window.addEventListener("storage", handleStorage)
  return () => window.removeEventListener("storage", handleStorage)
}, [])
```

---

## Mobile OS Theme Detection

### How It Works

Mobile browsers expose `prefers-color-scheme` based on OS settings:

| OS | Trigger |
|----|---------|
| iOS 13+ | Settings > Display & Brightness > Light/Dark |
| Android 10+ | Settings > Display > Dark theme |
| Scheduled modes | When user has auto-switch enabled |

### Implementation

The `matchMedia` API fires `change` events when OS theme changes:

```tsx
useEffect(() => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

  const handleChange = (e: MediaQueryListEvent) => {
    // Only react if user has "system" preference
    if (theme === "system") {
      const newTheme = e.matches ? "dark" : "light"
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(newTheme)
    }
  }

  mediaQuery.addEventListener("change", handleChange)
  return () => mediaQuery.removeEventListener("change", handleChange)
}, [theme])
```

### Edge Cases

1. **User on "system" mode, OS changes theme mid-session:** Event listener catches this
2. **User has explicit light/dark set, OS changes:** Should NOT change (user preference wins)
3. **User switches from explicit to "system":** Should immediately reflect current OS setting
4. **PWA in standalone mode:** `prefers-color-scheme` still works

---

## Component Organization

### File Structure

```
components/
  ThemeProvider.tsx       # Context provider (wraps app)
  ThemeToggle.tsx         # UI toggle component
  ui/
    dropdown-menu.tsx     # Needed for theme dropdown (add via shadcn)
```

### Theme Toggle Component

For Settings page (Preferences tab):

```tsx
// components/ThemeToggle.tsx
import { useTheme } from "./ThemeProvider"
import { Sun, Moon, Monitor } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded ${theme === "light" ? "bg-zinc-200" : ""}`}
        aria-label="Light mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded ${theme === "dark" ? "bg-zinc-200 dark:bg-zinc-700" : ""}`}
        aria-label="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded ${theme === "system" ? "bg-zinc-200 dark:bg-zinc-700" : ""}`}
        aria-label="System preference"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  )
}
```

### For Sidebar/Header (Compact Toggle)

```tsx
// Compact icon-only toggle
import { useTheme } from "./ThemeProvider"
import { Sun, Moon } from "lucide-react"

export function ThemeToggleCompact() {
  const { resolvedTheme, setTheme, theme } = useTheme()

  const cycleTheme = () => {
    // Cycle: light -> dark -> system -> light
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
    </button>
  )
}
```

---

## Existing Infrastructure Analysis

### Current CSS Setup (index.css)

The project already has proper theme infrastructure:

```css
:root {
  --background: oklch(1 0 0);           /* Light mode */
  --foreground: oklch(0.147 0.004 49.25);
  /* ... all variables defined */
}

.dark {
  --background: oklch(0.147 0.004 49.25);  /* Dark mode */
  --foreground: oklch(0.985 0.001 106.423);
  /* ... all variables defined */
}
```

**Status:** Ready to use. No CSS changes needed.

### Tailwind Config (tailwind.config.js)

```js
module.exports = {
  darkMode: ["class"],  // Already configured correctly
  // ...
}
```

**Status:** Ready to use. No config changes needed.

### Potential Issue: Hardcoded Colors in Components

Found in `App.tsx`:
```tsx
<div className="min-h-screen bg-zinc-50 flex text-zinc-900 ...">
```

These should be updated to use CSS variables:
```tsx
<div className="min-h-screen bg-background flex text-foreground ...">
```

**Action required:** Audit components for hardcoded colors.

### Tailwind Config Color Mapping Issue

The Tailwind config uses `hsl()` wrapper but CSS variables are OKLCH:

```js
// tailwind.config.js
colors: {
  background: "hsl(var(--background))",  // WRONG - vars are oklch
}
```

Should be:
```js
colors: {
  background: "var(--background)",  // Direct reference
}
```

**Action required:** Update tailwind.config.js color mappings.

---

## Implementation Checklist

### Phase 1: Infrastructure
- [ ] Install next-themes
- [ ] Create ThemeProvider component
- [ ] Add FOUC prevention script to index.html
- [ ] Wrap App with ThemeProvider

### Phase 2: Toggle UI
- [ ] Add dropdown-menu component from shadcn (if using dropdown)
- [ ] Create ThemeToggle component
- [ ] Add toggle to Sidebar
- [ ] Add toggle options to Settings > Preferences

### Phase 3: Component Audit
- [ ] Fix tailwind.config.js hsl() wrapper issue
- [ ] Replace hardcoded colors in App.tsx
- [ ] Replace hardcoded colors in Settings.tsx
- [ ] Audit other components for hardcoded zinc-* colors

### Phase 4: Testing
- [ ] Test light mode
- [ ] Test dark mode
- [ ] Test system preference detection
- [ ] Test mobile OS theme switching
- [ ] Test persistence across page refresh
- [ ] Test cross-tab synchronization

---

## Anti-Patterns to Avoid

### 1. Theme State in Component State Only
**Wrong:**
```tsx
const [isDark, setIsDark] = useState(false) // Lost on refresh!
```
**Right:** Use localStorage + context

### 2. Checking Theme Before Mount
**Wrong:**
```tsx
// Will cause hydration mismatch
const theme = localStorage.getItem("theme")
return <div className={theme === "dark" ? "dark" : ""}>
```
**Right:** Apply class to `<html>` element, not React components

### 3. Multiple Sources of Truth
**Wrong:** CSS variables + inline styles + className conditionals
**Right:** Single source: class on `<html>`, CSS variables do the rest

### 4. Ignoring System Preference Changes
**Wrong:** Check system preference once at load
**Right:** Subscribe to `matchMedia` changes

---

## Sources

- [next-themes GitHub](https://github.com/pacocoursey/next-themes) - Official documentation (HIGH confidence)
- [shadcn/ui Dark Mode - Vite](https://ui.shadcn.com/docs/dark-mode/vite) - Official Vite guide (HIGH confidence)
- [MDN prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) - Media query reference (HIGH confidence)
- [Fixing FOUC in React](https://notanumber.in/blog/fixing-react-dark-mode-flickering) - Pattern for flash prevention (MEDIUM confidence)
