---
phase: 08-token-consumption
verified: 2026-01-28T22:30:00Z
status: gaps_found
score: 4/4 must-haves partially verified (3 with gaps, 1 verified)
gaps:
  - truth: "All pages use semantic spacing tokens (p-sm, gap-md, mb-lg) instead of raw numeric values"
    status: failed
    reason: "Study.tsx has 9 raw spacing violations; minor gaps in 6 other components"
    artifacts:
      - path: "pages/Study.tsx"
        issue: "9 raw numeric spacing values: p-4/p-6, px-3/px-4, py-3, mb-4, gap-2/gap-3/gap-4, ml-4, mb-2, py-12"
      - path: "components/Sidebar.tsx"
        issue: "2 instances of p-1.5 (6px micro-spacing) - should map to p-xs (8px)"
      - path: "components/TagManagerSidebar.tsx"
        issue: "Multiple px-1.5 instances (micro-spacing for compact tag UI)"
      - path: "components/HighlightTableRow.tsx"
        issue: "1 instance: pt-3.5 (14px) - should map to pt-md (16px)"
      - path: "components/DeleteBookModal.tsx"
        issue: "1 instance: space-y-1 (4px) - should map to space-y-xxs"
      - path: "components/StudyHeatmap.tsx"
        issue: "1 instance: pl-3.5 (14px) - should map to pl-md (16px)"
      - path: "components/ThemeToggle.tsx"
        issue: "1 instance: p-2 (8px) - should map to p-xs"
    missing:
      - "Map Study.tsx spacing: p-4->p-md, p-6->p-lg, px-3->px-sm, px-4->px-md, py-3->py-sm, mb-4->mb-md, gap-2->gap-xs, gap-3->gap-sm, gap-4->gap-md, ml-4->ml-md, mb-2->mb-xs, py-12->py-3xl"
      - "Map Sidebar.tsx p-1.5->p-xs (acceptable +2px variance)"
      - "Map TagManagerSidebar.tsx px-1.5->px-xs throughout"
      - "Map HighlightTableRow.tsx pt-3.5->pt-md"
      - "Map DeleteBookModal.tsx space-y-1->space-y-xxs"
      - "Map StudyHeatmap.tsx pl-3.5->pl-md"
      - "Map ThemeToggle.tsx p-2->p-xs"
  
  - truth: "All status/tag/success colors use semantic tokens (bg-status-new, bg-tag-global, text-success) instead of raw Tailwind colors"
    status: failed
    reason: "Study.tsx uses raw blue/amber/green colors for status stat numbers (text-blue-300 dark:text-blue-700, etc.)"
    artifacts:
      - path: "pages/Study.tsx"
        issue: "Lines 80, 84, 88: status stat colors use raw text-blue-300/700, text-amber-300/700, text-green-300/700"
    missing:
      - "Replace Study.tsx stat colors with semantic tokens: text-blue-300 dark:text-blue-700 -> text-status-new, text-amber-300 dark:text-amber-700 -> text-status-learning, text-green-300 dark:text-green-700 -> text-status-review"
      - "Verify semantic status tokens work for text color context (not just bg-)"
  
  - truth: "All remaining raw text-sm/text-xs usages are replaced with text-body/text-caption tokens"
    status: failed
    reason: "Study.tsx has 6 raw typography violations (text-sm, text-xs)"
    artifacts:
      - path: "pages/Study.tsx"
        issue: "Lines 65, 66, 77, 101, 107, 108: uses text-sm and text-xs instead of text-body and text-caption"
    missing:
      - "Replace Study.tsx typography: text-sm->text-body (3 instances), text-xs->text-caption (3 instances)"
  
  - truth: "Zero raw numeric spacing, raw color, or raw typography values in page files"
    status: failed
    reason: "Study.tsx blocks this truth with 9 spacing + 6 typography + 3 color violations"
    artifacts:
      - path: "pages/Study.tsx"
        issue: "Total 18 violations prevent zero-raw-values goal"
    missing:
      - "Complete Study.tsx migration to semantic tokens across all three categories"
---

# Phase 8: Token Consumption Verification Report

**Phase Goal:** Every page uses semantic tokens for spacing, typography, and color -- no raw numeric values remain

**Verified:** 2026-01-28T22:30:00Z
**Status:** gaps_found
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | All pages use semantic spacing tokens (p-sm, gap-md, mb-lg) instead of raw numeric values | FAILED | 142 semantic spacing tokens confirmed in use BUT Study.tsx has 9 violations + 6 components have minor gaps |
| 2 | All status/tag/success colors use semantic tokens (bg-status-new, bg-tag-global, text-success) instead of raw Tailwind colors | FAILED | Study.tsx lines 80,84,88 use raw status colors (text-blue/amber/green-300/700) for stat numbers |
| 3 | All remaining raw text-sm/text-xs usages are replaced with text-body/text-caption tokens | FAILED | 174 semantic typography tokens confirmed BUT Study.tsx has 6 violations (3x text-sm, 3x text-xs) |
| 4 | Zero raw numeric spacing, raw color, or raw typography values in page files | FAILED | Study.tsx blocks this with 18 total violations (9 spacing + 6 typography + 3 color) |

**Score:** 0/4 truths fully verified (all 4 partially verified with gaps)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| pages/Settings.tsx | Zero raw values, full semantic tokens | VERIFIED | Zero violations found. 100% semantic token usage. |
| pages/Login.tsx | Zero raw values, full semantic tokens | VERIFIED | Zero violations found. 100% semantic token usage. |
| pages/Dashboard.tsx | Zero raw values, full semantic tokens | VERIFIED | Zero violations found. Uses space-y-0, pb-xs, space-y-2xl correctly. |
| pages/Highlights.tsx | Zero raw values, full semantic tokens | VERIFIED | Zero violations found. Uses py-xs, py-2xl, pr-sm correctly. |
| pages/StudySession.tsx | Semantic tokens except documented deviations | VERIFIED | Zero unexpected violations. Documented deviations confirmed: rating button colors (bg-red/amber/blue/green-500), serif text (text-lg/xl), py-2.5/py-1.5/gap-1.5 micro-spacing. |
| pages/Study.tsx | Zero raw values, full semantic tokens | FAILED | 18 violations: 9 spacing (p-4, p-6, px-3, px-4, py-3, mb-4, gap-2/3/4, ml-4, mb-2, py-12), 6 typography (text-sm, text-xs), 3 colors (status stat colors) |
| components/DeckTable.tsx | Zero raw values | VERIFIED | Zero violations found. |
| components/StudyStatusBadge.tsx | Uses semantic tokens OR documented deviation | VERIFIED | Uses semantic tokens (px-xs, py-0.5, text-overline). Raw colors (bg-green/blue/yellow-50/700) are documented deviation (tinted status badge pattern). |
| components/TagSelector.tsx | Uses semantic tokens OR documented deviation | VERIFIED | Uses semantic tokens (px-xs, py-1.5, gap-xxs, text-caption). Raw colors (hover:bg-blue-50, hover:bg-amber-50) are documented deviation (tag category affordance). |
| components/StudyHeatmap.tsx | Semantic tokens except data-viz colors | PARTIAL | Uses semantic tokens for layout BUT has 1 spacing violation: pl-3.5 (line 362) should be pl-md. Data-viz colors (bg-green-200/400/500/600, text-orange-500) correctly preserved as documented deviation. |
| components/Sidebar.tsx | Zero raw values except brand text | PARTIAL | text-base logo confirmed as documented deviation. BUT has 2 spacing violations: p-1.5 (lines 44, 61) should map to p-xs. |
| components/TagManagerSidebar.tsx | Zero raw values | PARTIAL | Uses semantic tokens extensively BUT has multiple px-1.5/py-0.5 micro-spacing values that should map to semantic grid. |
| components/HighlightTableRow.tsx | Zero raw values | PARTIAL | Uses semantic tokens extensively BUT has 1 violation: pt-3.5 (line 117) should map to pt-md. |
| components/DeleteBookModal.tsx | Zero raw values | PARTIAL | Uses semantic tokens BUT has 1 violation: space-y-1 (line 67) should map to space-y-xxs. |
| components/ThemeToggle.tsx | Zero raw values | PARTIAL | Has 1 violation: p-2 (line 16) should map to p-xs. |
| Other components | Zero raw values | VERIFIED | BottomNav, BookContextModal, ErrorBoundary, HighlightEditModal, HighlightHistoryModal, DeleteCardPopover, EmptyDeckPopover, DashboardCharts, I18nProvider all verified clean. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| tailwind.config.js | All pages | Semantic spacing tokens | PARTIAL | 142 instances of semantic spacing tokens confirmed across pages. Settings, Login, Dashboard, Highlights, StudySession FULLY use tokens. Study.tsx BLOCKS full verification. |
| tailwind.config.js | All pages | Semantic typography tokens | PARTIAL | 174 instances of semantic typography tokens confirmed. Settings, Login, Dashboard, Highlights, StudySession FULLY use tokens. Study.tsx BLOCKS full verification. |
| tailwind.config.js | All pages | Semantic color tokens | PARTIAL | Status/tag/success tokens widely used. Study.tsx stat colors NOT using semantic tokens. |

### Requirements Coverage

Phase 8 maps to requirements TOKENS-02 (full satisfaction) and TOKENS-08 (full satisfaction).

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| TOKENS-02: Semantic spacing tokens consumed by all pages | BLOCKED | Study.tsx + 6 components have raw spacing values |
| TOKENS-08: Semantic color tokens consumed by all pages | BLOCKED | Study.tsx uses raw status colors for stat numbers |


### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| pages/Study.tsx | 44 | p-4 sm:p-6 | BLOCKER | Prevents semantic spacing adoption; should be p-md sm:p-lg |
| pages/Study.tsx | 56 | mb-4 px-3 sm:px-4 py-3 | BLOCKER | Multiple raw spacing in prominent All Books button |
| pages/Study.tsx | 58,78 | gap-2 sm:gap-3, gap-3 | BLOCKER | Raw gaps throughout layout |
| pages/Study.tsx | 65,66,101,107,108 | text-sm, text-xs | BLOCKER | Raw typography instead of text-body/text-caption |
| pages/Study.tsx | 80,84,88 | text-blue/amber/green-300 dark:...-700 | BLOCKER | Raw status colors instead of semantic tokens |
| components/Sidebar.tsx | 44,61 | p-1.5 (6px) | WARNING | Sub-optimal micro-spacing; should use p-xs (8px) |
| components/TagManagerSidebar.tsx | Multiple | px-1.5, py-0.5 | WARNING | Micro-spacing that could use semantic tokens |
| components/HighlightTableRow.tsx | 117 | pt-3.5 (14px) | WARNING | Should use pt-md (16px) |

**Categorization:**
- BLOCKERS (9): All in Study.tsx -- prevents phase goal achievement
- WARNINGS (7+): Minor gaps in 6 components -- low impact but inconsistent

### Human Verification Required

None. All verifications can be performed programmatically via grep and build checks.

### Gaps Summary

**Phase 8 goal is BLOCKED by Study.tsx**, which has NOT been migrated to semantic tokens. The SUMMARYs claim "all pages migrated" but Study.tsx was missed or reverted.

**Breakdown:**

**Critical (Study.tsx):**
- 9 raw spacing values across layout, buttons, gaps, margins
- 6 raw typography values (text-sm, text-xs) that should be text-body/text-caption
- 3 raw color values for status stat numbers that should use text-status-* tokens

**Minor (6 components):**
- Sidebar: 2x p-1.5 should be p-xs
- TagManagerSidebar: Multiple px-1.5 instances should be px-xs
- HighlightTableRow: 1x pt-3.5 should be pt-md
- DeleteBookModal: 1x space-y-1 should be space-y-xxs
- StudyHeatmap: 1x pl-3.5 should be pl-md
- ThemeToggle: 1x p-2 should be p-xs

**Documented deviations CORRECTLY preserved:**
- StudySession: Rating buttons (bg-red/amber/blue/green-500), serif text, micro-spacing (verified)
- StudyStatusBadge: Tinted status backgrounds (bg-green/blue/yellow-50) (verified)
- TagSelector: Tinted tag hover backgrounds (hover:bg-blue-50, hover:bg-amber-50) (verified)
- StudyHeatmap: Data-viz gradient colors (bg-green-200/400/500/600, text-orange-500) (verified)

**Positive findings:**
- 142 semantic spacing tokens in active use
- 174 semantic typography tokens in active use
- 28+ semantic color tokens in active use
- Settings, Login, Dashboard, Highlights, StudySession: 100% semantic token compliance
- Build succeeds with zero errors
- No visual breakage reported

**Verification confidence:** HIGH -- gaps identified via systematic grep across entire codebase with pattern exclusion for documented exceptions.

---

_Verified: 2026-01-28T22:30:00Z_
_Verifier: Claude (gsd-verifier)_
