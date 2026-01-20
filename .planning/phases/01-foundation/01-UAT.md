---
status: diagnosed
phase: 01-foundation
source: 01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md, 01-04-SUMMARY.md, 01-05-SUMMARY.md
started: 2026-01-19T23:00:00Z
updated: 2026-01-19T23:15:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Theme Toggle Cycles Modes
expected: Click theme toggle button. It cycles light → dark → system with icon changing (Sun → Moon → Laptop).
result: issue
reported: "Já temos um botão de theme na sidebar e dentro da aba Study, não precisamos de mais um."
severity: minor

### 2. Theme Persists After Refresh
expected: Set theme to dark mode. Hard refresh the page (Ctrl+F5). Page should load in dark mode without flashing light mode first.
result: pass

### 3. System Preference Detection
expected: Set theme to "system" mode. If your OS is in dark mode, app shows dark theme. If OS is light mode, app shows light theme.
result: pass

### 4. Light Mode Warm Color
expected: In light mode, background should have visible warm cream/beige tint (not stark white). Compare against pure white - should be noticeably warmer.
result: pass

### 5. Dark Mode Unified Colors
expected: In dark mode, sidebar and main content area should have the SAME background color (no visible seam between them).
result: issue
reported: "Na versão mobile não, ainda está com a cor antiga. Desktop: páginas ainda estão aparecendo atrás da barra lateral (conteúdo cortado à esquerda)."
severity: major

### 6. Font Rendering
expected: Text throughout the app should render with Outfit font (clean, modern sans-serif). Check DevTools > Computed > font-family shows "Outfit Variable".
result: pass
note: "User request: campos highlight/note na tabela Highlights devem usar Outfit, mas manter serif no StudySession"

### 7. Sidebar Layout
expected: Sidebar displays beside main content, not overlapping it. On hover, sidebar expands and overlays content smoothly.
result: issue
reported: "Mesmo problema do teste 5 - conteúdo da página aparecendo atrás da sidebar, texto cortado à esquerda."
severity: major

### 8. ThemeToggle Hidden on StudySession
expected: Navigate to /study/session. The fixed theme toggle at bottom-right should NOT appear. Study footer buttons should be unobstructed.
result: pass
note: "User request: remover ThemeToggle, botão refresh e botão configurações da página Study (não servem)"

### 9. Cards Contrast Against Background
expected: In both light and dark mode, cards (white/elevated areas) should have slight visual contrast against the page background.
result: pass
note: "User noted: StudySessions e Review Activity (heatmap) ainda estão no cinza antigo"

## Summary

total: 9
passed: 6
issues: 3
pending: 0
skipped: 0

## Gaps

- truth: "Theme toggle button exists without redundancy"
  status: failed
  reason: "User reported: Já temos um botão de theme na sidebar e dentro da aba Study, não precisamos de mais um."
  severity: minor
  test: 1
  root_cause: "ThemeToggle rendered in 3 locations (App.tsx fixed, Sidebar.tsx, Study.tsx) when only sidebar version should exist"
  artifacts:
    - path: "App.tsx"
      issue: "Lines 10, 55-59: imports and renders fixed ThemeToggle at bottom-right"
    - path: "pages/Study.tsx"
      issue: "Lines 6, 66: imports and renders ThemeToggle in action buttons"
  missing:
    - "Remove ThemeToggle from App.tsx (import and JSX block)"
    - "Remove ThemeToggle from pages/Study.tsx (import and component)"
  debug_session: ".planning/debug/redundant-theme-toggles.md"

- truth: "Dark mode sidebar and content have unified colors, content not hidden behind sidebar"
  status: failed
  reason: "User reported: Na versão mobile não, ainda está com a cor antiga. Desktop: páginas ainda estão aparecendo atrás da barra lateral (conteúdo cortado à esquerda)."
  severity: major
  test: 5
  root_cause: "Components use hardcoded zinc colors (dark:bg-zinc-900) instead of semantic tokens (bg-background), bypassing warm oklch palette"
  artifacts:
    - path: "components/BottomNav.tsx"
      issue: "Mobile nav uses dark:bg-zinc-900 instead of bg-background"
    - path: "components/ui/*.tsx"
      issue: "50+ instances of hardcoded dark:bg-zinc-* in UI components"
    - path: "components/StudyHeatmap.tsx"
      issue: "Multiple dark:bg-zinc-* variants"
  missing:
    - "Replace dark:bg-zinc-900 with bg-card or bg-popover"
    - "Replace dark:border-zinc-800 with border-border"
    - "Update BottomNav.tsx for mobile"
  debug_session: ".planning/debug/mobile-dark-mode-colors.md"

- truth: "Sidebar displays beside main content without overlapping"
  status: failed
  reason: "User reported: Mesmo problema do teste 5 - conteúdo da página aparecendo atrás da sidebar, texto cortado à esquerda."
  severity: major
  test: 7
  root_cause: "Main content has static md:ml-14 margin but sidebar expands to w-56 on hover, causing 168px overlap"
  artifacts:
    - path: "App.tsx"
      issue: "Line 40: main content uses static md:ml-14 regardless of sidebar state"
    - path: "components/Sidebar.tsx"
      issue: "Sidebar transitions between w-14 (collapsed) and w-56 (expanded)"
  missing:
    - "Make main content margin dynamic based on isExpanded state"
    - "Import useSidebarContext in AppLayout"
    - "Add transition to main content for smooth animation"
  debug_session: ".planning/debug/sidebar-layout-issue.md"
