---
status: diagnosed
trigger: "Diagnose mobile dark mode color issue - sidebar and background not unified on mobile"
created: 2026-01-20T10:00:00Z
updated: 2026-01-20T10:00:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: Mobile dark mode shows old colors because sidebar/components use hardcoded Tailwind classes instead of semantic CSS variables
test: Check index.css for dark mode variables and Sidebar.tsx for color class usage
expecting: Find hardcoded bg-zinc-* or bg-gray-* classes instead of CSS variable references
next_action: Read index.css and Sidebar.tsx to identify color sources

## Symptoms

expected: On mobile, dark mode should show unified warm palette (same as desktop)
actual: Mobile dark mode shows old gray colors - sidebar and background not unified
errors: None (visual issue only)
reproduction: View app on mobile device in dark mode
started: After theme system changes (new warm palette introduced)

## Eliminated

## Evidence

- timestamp: 2026-01-20T10:05:00Z
  checked: index.css dark mode CSS variables
  found: Dark mode variables are properly defined at lines 51-88 with warm palette (oklch values)
  implication: CSS variables are NOT the issue - they're correctly defined

- timestamp: 2026-01-20T10:06:00Z
  checked: Sidebar.tsx (desktop)
  found: Uses semantic tokens correctly (bg-sidebar, border-sidebar-border, text-sidebar-foreground)
  implication: Desktop sidebar should work correctly with dark mode

- timestamp: 2026-01-20T10:07:00Z
  checked: BottomNav.tsx (mobile navigation)
  found: Line 12 uses HARDCODED colors: "bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800"
  implication: Mobile nav bypasses semantic tokens - uses old zinc palette instead of warm oklch palette

- timestamp: 2026-01-20T10:08:00Z
  checked: Multiple components for hardcoded zinc colors
  found: 50+ instances of "bg-zinc-*" and "dark:bg-zinc-*" across components
  implication: Many components use zinc palette which doesn't match the warm dark mode colors

- timestamp: 2026-01-20T10:09:00Z
  checked: App.tsx main layout
  found: Line 37 uses semantic "bg-background" for main container
  implication: Main background is correct, but individual components override with hardcoded zinc

- timestamp: 2026-01-20T10:10:00Z
  checked: tailwind.config.js
  found: darkMode: ["class"] - class-based dark mode is correctly configured
  implication: Dark mode mechanism works, issue is component color usage

## Resolution

root_cause: BottomNav.tsx and many other components use hardcoded Tailwind zinc/gray colors (dark:bg-zinc-900, dark:border-zinc-800) instead of semantic CSS variable tokens (bg-background, bg-card, border-border), causing them to display the old gray palette in dark mode instead of the new warm oklch palette defined in index.css.

fix: Replace hardcoded zinc/gray colors with semantic tokens across all affected components
verification:
files_changed: []
