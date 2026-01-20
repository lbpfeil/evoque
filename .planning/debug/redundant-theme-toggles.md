---
status: diagnosed
trigger: "Diagnose redundant theme toggle buttons in Evoque app - multiple toggles in sidebar, Study page, and fixed one at bottom-right"
created: 2026-01-20T00:00:00Z
updated: 2026-01-20T00:00:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: ThemeToggle component is rendered in multiple locations (App.tsx fixed, Sidebar.tsx, Study.tsx)
test: Read each file and locate ThemeToggle imports and usages
expecting: Find all ThemeToggle render locations to identify which are redundant
next_action: Read App.tsx, Sidebar.tsx, and Study.tsx to locate all ThemeToggle usages

## Symptoms

expected: Single theme toggle in sidebar should be sufficient
actual: Multiple theme toggles appear - one in sidebar, one in Study page, one fixed at bottom-right
errors: None (functional issue, not error)
reproduction: Navigate to any page - see fixed toggle at bottom-right; open sidebar - see another toggle; go to Study page - see third toggle
started: Unknown - likely since theme system was added

## Eliminated

## Evidence

- timestamp: 2026-01-20T00:01:00Z
  checked: App.tsx lines 55-59
  found: ThemeToggle rendered as fixed element at bottom-right (position fixed, bottom-4 right-4, z-50) for all non-study-session pages
  implication: This is the "fixed one at bottom-right" mentioned in issue

- timestamp: 2026-01-20T00:01:00Z
  checked: Sidebar.tsx lines 92-97
  found: ThemeToggle rendered inside sidebar (only visible when sidebar is expanded, fades out when collapsed)
  implication: This is the sidebar theme toggle - appropriate location

- timestamp: 2026-01-20T00:01:00Z
  checked: Study.tsx lines 65-66
  found: ThemeToggle rendered with variant="mobile" in Study page action buttons area
  implication: This is another redundant toggle on Study page specifically

## Resolution

root_cause: ThemeToggle is rendered in 3 separate locations - App.tsx (fixed bottom-right), Sidebar.tsx (sidebar section), and Study.tsx (page action buttons) - creating redundant UI controls
fix: Remove ThemeToggle from App.tsx (fixed position) and Study.tsx (action buttons), keep only sidebar version
verification:
files_changed: []
