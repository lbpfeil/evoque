# Stack Research: shadcn/ui Warm/Friendly UI Redesign

**Project:** evoque (Kindle Highlights Manager)
**Researched:** 2025-01-19
**Mode:** Stack dimension for UI redesign
**Overall Confidence:** HIGH

---

## Executive Summary

Your existing setup is well-positioned for a warm/friendly redesign. You already have:
- shadcn v3.7.0 with the modern "radix-vega" style
- OKLCH color variables with a warm palette (hue 49-70, stone-based)
- Tailwind CSS v3.4.17 with `darkMode: ["class"]`
- Six shadcn components installed (button, dialog, input, popover, command, sheet)

The primary work is: (1) installing additional components, (2) implementing a proper theme provider for light/dark toggle, and (3) refining the warm color palette for better consistency.

---

## shadcn Components to Install

### Required Components (High Priority)

| Component | Installation | Why You Need It |
|-----------|--------------|-----------------|
| **card** | `npx shadcn@latest add card` | Flashcard display, settings panels, import/export dialogs. Core visual container. |
| **tabs** | `npx shadcn@latest add tabs` | Navigation between views (highlights, books, tags). Essential for content organization. |
| **dropdown-menu** | `npx shadcn@latest add dropdown-menu` | Actions menu on cards, sort/filter options. Already using command for search. |
| **badge** | `npx shadcn@latest add badge` | Tag display on highlights, status indicators (new, reviewed). Visual metadata. |
| **tooltip** | `npx shadcn@latest add tooltip` | Accessibility for icon buttons, explain truncated text. UX polish. |

### Secondary Components (Medium Priority)

| Component | Installation | Why You Need It |
|-----------|--------------|-----------------|
| **scroll-area** | `npx shadcn@latest add scroll-area` | Custom scrollbars for highlight lists, maintains aesthetic in overflow areas. |
| **select** | `npx shadcn@latest add select` | Book/tag filtering, sort order selection. More structured than dropdown-menu. |
| **checkbox** | `npx shadcn@latest add checkbox` | Bulk selection for export, settings toggles. |
| **switch** | `npx shadcn@latest add switch` | Theme toggle, feature on/off in settings. Binary choices. |

### Batch Installation Command

```bash
npx shadcn@latest add card tabs dropdown-menu badge tooltip scroll-area select checkbox switch -y
```

**Rationale:** The `-y` flag skips confirmation. All components use your existing radix-vega style and OKLCH variables from `components.json`.

### Component Dependencies (Already Satisfied)

Your current dependencies cover the requirements:
- `@radix-ui/react-dialog` - base for dialog, sheet
- `@radix-ui/react-popover` - base for popover, dropdown-menu, tooltip
- `@radix-ui/react-slot` - composition utility
- `lucide-react` - icon library (matches your config)
- `class-variance-authority` - variant styling
- `tailwind-merge` - class merging

New Radix primitives will be auto-installed by shadcn CLI as needed.

---

## Theme Implementation

### Recommended: Custom Theme Provider (Not next-themes)

**Why NOT next-themes:**
- next-themes is optimized for Next.js SSR/hydration concerns
- You're using Vite + React SPA (no SSR)
- next-themes adds unnecessary complexity for client-only apps
- Your setup already has `darkMode: ["class"]` configured

**Confidence:** HIGH (verified from shadcn/ui Vite documentation)

### Implementation Pattern

Create `components/theme-provider.tsx`:

```typescript
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
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "evoque-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
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

### Theme Toggle Component

Create `components/mode-toggle.tsx`:

```typescript
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### App Integration

Wrap your app in `main.tsx` or `App.tsx`:

```typescript
import { ThemeProvider } from "@/components/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="evoque-ui-theme">
      {/* Your app content */}
    </ThemeProvider>
  )
}
```

---

## Color Palette: Warm/Friendly

### Current Analysis

Your existing palette is already warm-toned (hue range 46-70 in OKLCH):
- Primary: `oklch(0.67 0.16 58)` - Amber/copper tone
- Chart colors: Hue 46-92 (yellow-orange family)
- Stone-based grays (warm undertones)

**Assessment:** Good foundation. Refinements below enhance warmth and accessibility.

### Recommended Warm Palette

Based on 2025 design trends and color psychology research, a "warm/friendly" aesthetic uses:
- **Primary:** Amber/warm orange (energetic, optimistic, approachable)
- **Neutral base:** Stone/warm gray (not cold zinc/slate)
- **Accent:** Soft peach or terracotta (inviting without being loud)

#### Light Mode Variables

```css
:root {
  /* Backgrounds - warm white/cream undertones */
  --background: oklch(0.995 0.003 90);  /* Warm white with slight cream */
  --foreground: oklch(0.18 0.01 50);     /* Warm dark brown-gray */

  /* Cards - slightly warmer than background */
  --card: oklch(1 0.002 85);
  --card-foreground: oklch(0.18 0.01 50);

  /* Primary - warm amber (your existing is good) */
  --primary: oklch(0.67 0.16 58);        /* Amber */
  --primary-foreground: oklch(0.99 0.02 95);

  /* Secondary - soft warm gray */
  --secondary: oklch(0.95 0.008 80);
  --secondary-foreground: oklch(0.25 0.01 55);

  /* Muted - warm stone */
  --muted: oklch(0.96 0.006 80);
  --muted-foreground: oklch(0.50 0.02 55);

  /* Accent - soft peach for highlights */
  --accent: oklch(0.94 0.04 70);
  --accent-foreground: oklch(0.25 0.01 55);

  /* Borders - warm undertone */
  --border: oklch(0.90 0.01 70);
  --input: oklch(0.90 0.01 70);
  --ring: oklch(0.67 0.16 58);

  /* Destructive - warm red (not cold) */
  --destructive: oklch(0.58 0.22 30);
  --destructive-foreground: oklch(0.98 0.01 90);

  /* Radius - slightly rounded for friendly feel */
  --radius: 0.5rem;
}
```

#### Dark Mode Variables

```css
.dark {
  /* Backgrounds - warm dark, not pure black */
  --background: oklch(0.16 0.01 50);     /* Warm charcoal */
  --foreground: oklch(0.96 0.006 80);    /* Warm off-white */

  /* Cards - elevated warm surface */
  --card: oklch(0.22 0.012 55);
  --card-foreground: oklch(0.96 0.006 80);

  /* Primary - brighter amber for dark mode */
  --primary: oklch(0.75 0.15 68);
  --primary-foreground: oklch(0.20 0.06 50);

  /* Secondary */
  --secondary: oklch(0.28 0.01 55);
  --secondary-foreground: oklch(0.96 0.006 80);

  /* Muted */
  --muted: oklch(0.26 0.012 50);
  --muted-foreground: oklch(0.68 0.02 60);

  /* Accent - deeper peach for dark mode */
  --accent: oklch(0.30 0.04 55);
  --accent-foreground: oklch(0.96 0.006 80);

  /* Borders - subtle warm */
  --border: oklch(1 0 0 / 12%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.60 0.12 60);

  /* Destructive - brighter for dark mode */
  --destructive: oklch(0.70 0.20 25);
  --destructive-foreground: oklch(0.98 0.01 90);
}
```

### Color Psychology Rationale

| Color Role | Why This Choice |
|------------|-----------------|
| **Amber primary** | Energetic, optimistic, warm. Promotes engagement without urgency. |
| **Stone neutrals** | Warm undertones feel cozy vs cold grays. Grounds the amber. |
| **Peach accent** | Soft, friendly, inviting. Modern 2025 trend (clementine/peach palettes). |
| **Warm charcoal dark** | Avoids harsh pure black. Feels cozy for evening reading. |
| **0.5rem radius** | Slightly rounded corners feel approachable, not sharp/corporate. |

**Confidence:** HIGH (verified against 2025 design trend research and color psychology sources)

---

## Configuration Updates

### Tailwind Config (No Changes Needed)

Your current `tailwind.config.js` is correctly configured:
- `darkMode: ["class"]` enables class-based theme switching
- CSS variables are mapped to semantic color names
- Border radius uses CSS variables

### components.json (Already Optimal)

Your current config is ideal:
```json
{
  "style": "radix-vega",      // Modern 2025 style
  "tailwind": {
    "baseColor": "stone",     // Warm base (correct)
    "cssVariables": true      // Required for theming
  },
  "iconLibrary": "lucide"     // Consistent with existing
}
```

### index.css Updates

Your CSS is mostly correct. Recommended cleanup:

1. **Remove duplicate `@layer base`** - You have two `@layer base` blocks
2. **Ensure consistent OKLCH** - Line 32 has `210 40% 98%` (HSL) instead of OKLCH
3. **Apply refined palette** - Replace current values with warm palette above

---

## Installation Sequence

### Step 1: Install Components

```bash
cd C:/Users/ADMIN/projects/evoque
npx shadcn@latest add card tabs dropdown-menu badge tooltip scroll-area select checkbox switch -y
```

### Step 2: Create Theme Provider

Create `components/theme-provider.tsx` with code from Theme Implementation section.

### Step 3: Create Mode Toggle

Create `components/mode-toggle.tsx` with code from Theme Implementation section.

### Step 4: Update CSS Variables

Replace color values in `index.css` with the refined warm palette.

### Step 5: Wrap App

Add `<ThemeProvider>` to your root component.

---

## Sources

**HIGH Confidence (Official Documentation):**
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming) - OKLCH variables, CSS patterns
- [shadcn/ui Dark Mode - Vite](https://ui.shadcn.com/docs/dark-mode/vite) - Theme provider pattern
- [shadcn/ui Card Component](https://ui.shadcn.com/docs/components/card) - Component structure
- [shadcn/ui Tabs Component](https://ui.shadcn.com/docs/components/tabs) - Component structure
- [shadcn/ui Themes](https://ui.shadcn.com/themes) - Theme picker, base colors
- [shadcn/ui Changelog](https://ui.shadcn.com/docs/changelog) - Vega style, OKLCH migration

**MEDIUM Confidence (Verified Community Sources):**
- [tweakcn Theme Editor](https://tweakcn.com/) - OKLCH theme customization
- [Shadcn Studio Theme Generator](https://shadcnstudio.com/theme-generator) - Visual theme tools

**Color Psychology & Design Trends:**
- [Figma - Amber Color](https://www.figma.com/colors/amber/) - Color psychology
- [Figma - Terracotta Color](https://www.figma.com/colors/terracotta/) - Warm palette meanings
- [Gelato - Trending Colors 2025](https://www.gelato.com/blog/trending-colors) - Clementine/peach trends
- [IxDF - UI Color Palette 2025](https://www.interaction-design.org/literature/article/ui-color-palette) - Warm color best practices

---

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Component Installation | HIGH | Official shadcn CLI, verified commands |
| Theme Provider Pattern | HIGH | Official Vite documentation from shadcn |
| Color Palette Values | MEDIUM | Based on design research + your existing setup |
| Dark Mode Implementation | HIGH | Official shadcn pattern for Vite apps |
| Component Selection | HIGH | Based on your stated requirements |

---

## Open Questions for Implementation

1. **Sidebar styling** - Your CSS has sidebar variables. Will the redesign include a sidebar component?
2. **Chart colors** - Current chart variables may need refinement to match warm palette
3. **Progress bar animation** - Custom animation uses black/gray; may need warm colors
4. **Font choice** - Inter is neutral; consider warmer alternatives like Nunito if desired

---

## Summary Recommendation

**Use this stack:**
- Install 9 additional shadcn components via single CLI command
- Implement custom ThemeProvider (not next-themes) for Vite SPA
- Refine OKLCH colors with provided warm palette
- Keep stone base, radix-vega style, lucide icons

**Do NOT:**
- Install next-themes (unnecessary for Vite SPA)
- Change to a different shadcn style (radix-vega is current)
- Use HSL colors (stick with OKLCH for consistency)
