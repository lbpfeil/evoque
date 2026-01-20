---
status: complete
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
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Dark mode sidebar and content have unified colors, content not hidden behind sidebar"
  status: failed
  reason: "User reported: Na versão mobile não, ainda está com a cor antiga. Desktop: páginas ainda estão aparecendo atrás da barra lateral (conteúdo cortado à esquerda)."
  severity: major
  test: 5
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Sidebar displays beside main content without overlapping"
  status: failed
  reason: "User reported: Mesmo problema do teste 5 - conteúdo da página aparecendo atrás da sidebar, texto cortado à esquerda."
  severity: major
  test: 7
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
