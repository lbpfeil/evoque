# Pitfalls Research: shadcn/ui Adoption and Theme Systems

**Domain:** React app redesign with shadcn/ui component library
**Researched:** 2026-01-19
**Confidence:** HIGH (verified against official docs and codebase analysis)

---

## Critical Pitfalls

Mistakes that cause broken UI, rewrites, or major issues.

### Pitfall 1: HSL/OKLCH Color Function Mismatch

**What goes wrong:** CSS variables use OKLCH format but Tailwind config wraps them in `hsl()`. Colors render incorrectly or opacity modifiers fail completely.

**Current state in codebase:**
```css
/* index.css uses OKLCH */
--primary: oklch(0.67 0.16 58);

/* tailwind.config.js wraps in hsl() */
primary: {
  DEFAULT: "hsl(var(--primary))",  /* BROKEN! */
}
```

**Why it happens:**
- shadcn/ui transitioned from HSL to OKLCH in late 2024
- Old Tailwind configs still use `hsl()` wrappers
- `hsl(oklch(...))` is invalid CSS and silently fails

**Consequences:**
- Colors appear as fallback/transparent
- Opacity modifiers (`bg-primary/50`) don't work
- Dark mode colors broken or invisible

**Prevention:**
1. Match color formats: If CSS uses OKLCH, remove `hsl()` wrappers from Tailwind config
2. For Tailwind v3: Use raw values with `<alpha-value>` placeholder:
   ```js
   primary: "oklch(0.67 0.16 58 / <alpha-value>)"
   ```
3. For Tailwind v4: Use `@theme inline` directive without wrappers

**Detection:**
- Colors look wrong or transparent
- Browser DevTools shows `hsl(oklch(...))` in computed styles
- Opacity classes have no effect

**Which phase should address:** Phase 1 (Foundation) - Fix before any component work

---

### Pitfall 2: Hardcoded Colors Bypassing Theme System

**What goes wrong:** Components use Tailwind color classes (`bg-zinc-50`, `text-blue-600`) instead of semantic variables (`bg-background`, `text-primary`). Theme switching has no effect.

**Current state in codebase:**
```tsx
// App.tsx - hardcoded colors
<div className="min-h-screen bg-zinc-50 flex text-zinc-900">

// Sidebar.tsx - hardcoded colors
<aside className="bg-white border-r border-zinc-200 text-zinc-900">

// Dashboard.tsx - hardcoded colors everywhere
<div className="bg-white p-6 rounded-md border border-zinc-200">
```

**Why it happens:**
- Components written before theme system setup
- Partial adoption: some shadcn components, some legacy
- Quick fixes using familiar Tailwind classes

**Consequences:**
- Dark mode toggle changes CSS variables but UI doesn't respond
- "Partially themed" appearance (some elements switch, others don't)
- Mobile theme switching appears completely broken

**Prevention:**
1. Audit all components before theme implementation
2. Replace hardcoded colors with semantic variables:
   - `bg-zinc-50` -> `bg-muted` or `bg-background`
   - `text-zinc-900` -> `text-foreground`
   - `border-zinc-200` -> `border-border`
   - `bg-white` -> `bg-card` or `bg-background`
3. Use ESLint rule or grep to catch hardcoded color classes

**Detection:**
- `grep -r "bg-zinc\|text-zinc\|bg-blue\|bg-white" components/`
- Toggle theme and observe which elements don't change

**Which phase should address:** Phase 2 (Component Migration) - Systematic conversion

---

### Pitfall 3: Missing ThemeProvider Implementation

**What goes wrong:** Theme CSS variables are defined but no JavaScript handles theme state, localStorage persistence, or system preference detection.

**Current state in codebase:**
- `index.css` has `:root` and `.dark` CSS variables (good)
- `tailwind.config.js` has `darkMode: ["class"]` (good)
- No ThemeProvider component exists (bad)
- No mechanism to add `.dark` class to `<html>` (bad)

**Why it happens:**
- CSS-only approach seems sufficient initially
- Assumption that `darkMode: ["class"]` is enough
- Missing the JavaScript orchestration layer

**Consequences:**
- Dark mode literally cannot be activated
- System preference not respected
- No persistence across sessions

**Prevention:**
1. Implement ThemeProvider with three concerns:
   - State management (light/dark/system)
   - localStorage persistence
   - System preference detection via `matchMedia`
2. Wrap app root with provider
3. Add mode toggle component

**Detection:**
- Check for ThemeProvider in component tree
- Verify `<html>` element receives `class="dark"` when toggled

**Which phase should address:** Phase 1 (Foundation) - Required for all theme work

---

### Pitfall 4: Duplicate `@layer base` Blocks

**What goes wrong:** Multiple `@layer base` blocks with conflicting styles. Later declarations may not override earlier ones as expected.

**Current state in codebase:**
```css
/* index.css has TWO @layer base blocks */
@layer base {
  :root { ... }
  .dark { ... }
  .theme { --font-sans: 'Inter Variable', sans-serif; }
  * { @apply border-border outline-ring/50; }
  body { @apply font-sans bg-background text-foreground; }
}

@layer base {  /* DUPLICATE! */
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}
```

**Why it happens:**
- Multiple shadcn component additions over time
- Manual CSS edits without consolidation
- Copy-paste from documentation

**Consequences:**
- Unexpected style specificity
- Styles may not apply as intended
- Harder to debug and maintain

**Prevention:**
1. Consolidate all `@layer base` content into single block
2. Remove duplicate rules
3. Review CSS file structure after each shadcn component addition

**Detection:**
- Search for multiple `@layer base` in CSS files
- Check for duplicate selectors

**Which phase should address:** Phase 1 (Foundation) - CSS cleanup

---

## Theme System Pitfalls

### Pitfall 5: Theme Flash on Page Load (FOUC)

**What goes wrong:** Page loads with light theme, then flashes to dark theme after React hydrates and reads localStorage.

**Why it happens:**
- ThemeProvider runs after initial render
- localStorage read happens in useEffect
- Server/static HTML has no theme class

**Consequences:**
- Jarring visual experience
- Especially noticeable on slow connections
- Users with dark preference see bright flash

**Prevention:**
1. Add blocking inline script to `index.html` BEFORE React:
   ```html
   <script>
     (function() {
       const theme = localStorage.getItem('theme');
       if (theme === 'dark' ||
           (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
         document.documentElement.classList.add('dark');
       }
     })();
   </script>
   ```
2. Script must be synchronous (no defer/async)
3. Place in `<head>` before any stylesheets if possible

**Detection:**
- Load page with dark theme preference
- Watch for brief white flash

**Which phase should address:** Phase 1 (Foundation) - Alongside ThemeProvider

---

### Pitfall 6: System Theme Not Triggering

**What goes wrong:** User has "system" theme selected, but changing OS preference doesn't update the app.

**Why it happens:**
- Missing `matchMedia` event listener
- Only checking preference on initial load
- Using `darkMode: 'media'` in Tailwind config when class-based approach is needed

**Consequences:**
- "System" option appears broken
- User must manually toggle when OS changes

**Prevention:**
1. Add event listener for system preference changes:
   ```tsx
   useEffect(() => {
     const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
     const handler = () => {
       if (theme === 'system') {
         updateTheme();
       }
     };
     mediaQuery.addEventListener('change', handler);
     return () => mediaQuery.removeEventListener('change', handler);
   }, [theme]);
   ```
2. Ensure Tailwind config uses `darkMode: ["class"]` not `darkMode: 'media'`

**Detection:**
- Select "System" theme
- Change OS preference
- Observe if app updates

**Which phase should address:** Phase 1 (Foundation) - ThemeProvider implementation

---

### Pitfall 7: Inconsistent Foreground Color Pairing

**What goes wrong:** Text becomes unreadable because background changes but foreground doesn't, or vice versa.

**Why it happens:**
- Using `bg-primary` without `text-primary-foreground`
- Mixing semantic and hardcoded colors
- Not understanding the `-foreground` convention

**Consequences:**
- Light text on light background (invisible)
- Dark text on dark background (invisible)
- Poor contrast ratios, accessibility failures

**Prevention:**
1. Always pair background with matching foreground:
   - `bg-primary text-primary-foreground`
   - `bg-card text-card-foreground`
   - `bg-muted text-muted-foreground`
2. shadcn components do this correctly - don't override
3. For custom components, follow the same pattern

**Detection:**
- Toggle themes and look for unreadable text
- Check contrast with browser DevTools

**Which phase should address:** Phase 2 (Component Migration) - Component styling

---

## shadcn Adoption Pitfalls

### Pitfall 8: Relative Import Paths in shadcn Components

**What goes wrong:** shadcn components use relative paths that break when file structure changes.

**Current state in codebase:**
```tsx
// button.tsx uses relative import
import { cn } from "../../lib/utils"

// Should use alias
import { cn } from "@/lib/utils"
```

**Why it happens:**
- Manual component addition without proper alias setup
- VSCode auto-import suggestions
- Copying code without updating paths

**Consequences:**
- Breaks when files move
- Inconsistent import styles across codebase
- Harder to maintain

**Prevention:**
1. Verify `tsconfig.json` has correct path aliases:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```
2. Verify `vite.config.ts` has matching resolve aliases
3. Use alias imports consistently: `@/lib/utils`, `@/components/ui/button`

**Detection:**
- Grep for `../` in component imports
- Check for mixed import styles

**Which phase should address:** Phase 1 (Foundation) - Alias configuration

---

### Pitfall 9: Not Owning Your Components

**What goes wrong:** Treating shadcn components as immutable library code. When bugs appear, waiting for "upstream fix" that won't come.

**Why it happens:**
- Mindset from traditional component libraries (MUI, Chakra)
- shadcn components added via CLI feel like dependencies
- Fear of modifying "library" code

**Consequences:**
- Bugs persist indefinitely
- Workarounds accumulate
- Miss the entire point of shadcn/ui

**Prevention:**
1. Understand: Once added, shadcn components are YOUR code
2. Modify freely to fix bugs or add features
3. Don't expect CLI updates to fix your specific issues
4. Document customizations in component files

**Detection:**
- Check for workarounds wrapping shadcn components
- Look for comments like "shadcn bug" without fixes

**Which phase should address:** All phases - Mindset shift

---

### Pitfall 10: Component Dependency Version Conflicts

**What goes wrong:** Radix UI or cmdk updates break shadcn components.

**Why it happens:**
- shadcn components depend on specific Radix versions
- npm update pulls incompatible versions
- No lockfile discipline

**Consequences:**
- Components throw runtime errors
- Components render incorrectly
- Combobox/Command particularly vulnerable

**Prevention:**
1. Pin Radix versions in package.json
2. Test after any Radix/cmdk updates
3. Check shadcn/ui GitHub issues before updating
4. Use lockfile (package-lock.json) consistently

**Detection:**
- Components that worked stop working after npm install
- Console errors mentioning Radix internals

**Which phase should address:** Phase 1 (Foundation) - Dependency audit

---

## Migration Pitfalls

### Pitfall 11: All-or-Nothing Migration Approach

**What goes wrong:** Attempting to convert all components to shadcn at once. Project becomes unstable, progress hard to measure.

**Why it happens:**
- Enthusiasm for new system
- Underestimating scope
- Not having incremental strategy

**Consequences:**
- Broken UI for extended period
- Lost context on what changed
- Difficult to debug regressions

**Prevention:**
1. Migrate component-by-component
2. Each component migration should be atomic:
   - Convert
   - Test
   - Commit
3. Keep both systems working during transition
4. Prioritize by visibility/usage

**Detection:**
- Large uncommitted changes spanning multiple components
- Multiple broken features simultaneously

**Which phase should address:** Phase 2-3 - Use incremental approach

---

### Pitfall 12: Losing Custom Functionality During Conversion

**What goes wrong:** Custom component behavior lost when replacing with shadcn equivalent.

**Why it happens:**
- Assuming shadcn component is drop-in replacement
- Not auditing existing component functionality
- Focus on visual parity only

**Consequences:**
- Features silently disappear
- User workflows break
- Regression bugs discovered late

**Prevention:**
1. Document existing component behavior before migration
2. List all props, callbacks, edge cases
3. Verify each behavior in shadcn version
4. Add missing functionality to shadcn component

**Detection:**
- Feature works before migration, not after
- User bug reports after "styling update"

**Which phase should address:** Phase 2 (Component Migration) - Audit first

---

## Mobile-Specific Pitfalls

### Pitfall 13: Mobile Browser Theme-Color Meta Tag

**What goes wrong:** Browser chrome (address bar) doesn't match app theme on mobile.

**Why it happens:**
- Missing `<meta name="theme-color">` tag
- Static theme-color not updated when theme changes
- Only desktop testing

**Consequences:**
- Jarring contrast between browser chrome and app
- Unprofessional appearance on mobile
- iOS Safari especially affected

**Prevention:**
1. Add theme-color meta tag to index.html:
   ```html
   <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
   <meta name="theme-color" content="#171717" media="(prefers-color-scheme: dark)">
   ```
2. Or update dynamically when theme changes:
   ```tsx
   document.querySelector('meta[name="theme-color"]')
     ?.setAttribute('content', isDark ? '#171717' : '#ffffff');
   ```

**Detection:**
- Test on actual mobile device
- Check browser chrome color vs app background

**Which phase should address:** Phase 3 (Polish) - Mobile optimization

---

### Pitfall 14: Touch Target Size on Mobile

**What goes wrong:** shadcn components optimized for desktop have small touch targets on mobile.

**Why it happens:**
- Default shadcn sizing for desktop
- Not testing with actual fingers
- Icon-only buttons particularly affected

**Consequences:**
- Frustrating mobile UX
- Accessibility failures
- Misclicks on adjacent elements

**Prevention:**
1. Minimum 44x44px touch targets (WCAG)
2. Use larger size variants on mobile:
   ```tsx
   <Button size="lg" className="md:size-default">
   ```
3. Add padding to icon buttons
4. Test on real mobile devices

**Detection:**
- Mobile testing with actual touch
- Accessibility audit tools

**Which phase should address:** Phase 3 (Polish) - Mobile optimization

---

### Pitfall 15: Sheet/Drawer Gesture Conflicts

**What goes wrong:** Mobile sheet/drawer components conflict with browser back gesture or scroll behavior.

**Why it happens:**
- Radix Sheet not optimized for mobile gestures
- Swipe areas overlap browser gestures
- No explicit gesture handling

**Consequences:**
- Accidentally navigating back instead of closing sheet
- Scroll lock issues on iOS
- Inconsistent behavior across browsers

**Prevention:**
1. Consider mobile-first drawer library (Vaul) for mobile sheets
2. Test swipe gestures thoroughly
3. Add explicit close buttons, don't rely on gestures alone
4. Handle iOS scroll position restoration

**Detection:**
- Test sheet/drawer on iOS and Android
- Try swiping from edge while sheet is open

**Which phase should address:** Phase 3 (Polish) - After basic mobile works

---

## Phase-Specific Warnings Summary

| Phase | Likely Pitfall | Mitigation |
|-------|---------------|------------|
| Phase 1: Foundation | HSL/OKLCH mismatch (#1), Missing ThemeProvider (#3), Duplicate @layer base (#4) | Fix color system and provider first |
| Phase 2: Component Migration | Hardcoded colors (#2), Relative imports (#8), Lost functionality (#12) | Audit before converting |
| Phase 3: Polish | Theme flash (#5), Mobile theme-color (#13), Touch targets (#14) | Mobile-specific testing |
| All Phases | Not owning components (#9), All-or-nothing migration (#11) | Incremental, owned approach |

---

## Verification Checklist

Before considering theme system complete:

- [ ] `hsl()` wrappers match CSS variable format (both HSL or both removed)
- [ ] Zero hardcoded color classes in components (`bg-zinc-*`, `text-blue-*`)
- [ ] ThemeProvider wraps app root
- [ ] Theme persists across refresh (localStorage)
- [ ] System preference respected and updates live
- [ ] No flash on page load (blocking script)
- [ ] Mobile theme-color meta updates
- [ ] All components readable in both themes
- [ ] Path aliases work consistently

---

## Sources

- [shadcn/ui Theming Documentation](https://ui.shadcn.com/docs/theming)
- [shadcn/ui Dark Mode for Vite](https://ui.shadcn.com/docs/dark-mode/vite)
- [Tailwind CSS v4 OKLCH Migration](https://tailwindcss.com/blog/tailwindcss-v4)
- [OKLCH Opacity Issues - GitHub #14499](https://github.com/tailwindlabs/tailwindcss/issues/14499)
- [Dark Mode Not Working - GitHub #278](https://github.com/shadcn-ui/ui/issues/278)
- [System Theme Not Triggered - GitHub #2387](https://github.com/shadcn-ui/ui/issues/2387)
- [@layer base Issues - GitHub #313](https://github.com/shadcn-ui/ui/issues/313)
- [What I DON'T Like About shadcn/ui](https://leonardomontini.dev/shadcn-ui-use-with-caution/)
- [Prevent Theme Flash in React](https://dev.to/gaisdav/how-to-prevent-theme-flash-in-a-react-instant-dark-mode-switching-o20)
- [Tailwind v4 Theme Variables](https://tailwindcss.com/docs/theme)
