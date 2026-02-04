---
status: resolved
trigger: "Revisões feitas hoje (04/fev) estão aparecendo como 03/fev no heatmap - 1 dia de atraso"
created: 2026-02-04T12:00:00Z
updated: 2026-02-04T12:00:00Z
---

## Current Focus

hypothesis: CONFIRMED - formatDate() in tooltip uses new Date("YYYY-MM-DD") which interprets date-only strings as UTC midnight, causing 1-day offset for users west of UTC
test: Verified with Node.js - new Date("2026-02-04").getDate() returns 3 in UTC-4 timezone
expecting: Found the bug
next_action: Fix formatDate() to parse date-only strings as local dates instead of UTC

## Symptoms

expected: Revisões feitas em 04/fev deveriam aparecer na célula de 04/fev no heatmap
actual: Revisões de 04/fev estão aparecendo na célula de 03/fev (1 dia atrasadas)
errors: Nenhum erro visível - apenas data incorreta
reproduction: Fazer revisões de cards e verificar o heatmap no Dashboard
started: Reportado agora, possível problema de timezone ou conversão de data

## Eliminated

## Evidence

- timestamp: 2026-02-04T12:05:00Z
  checked: Date creation flow in StoreContext
  found: reviewedAt is created with `new Date().toISOString()` (UTC format)
  implication: Dates are stored as UTC ISO strings (e.g., "2026-02-04T15:00:00.000Z")

- timestamp: 2026-02-04T12:06:00Z
  checked: StudyHeatmap.tsx aggregateReviewsByDate function
  found: Line 35 creates `new Date(log.reviewedAt)` which correctly interprets UTC
  implication: JavaScript Date should handle timezone conversion to local automatically

- timestamp: 2026-02-04T12:10:00Z
  checked: JavaScript Date parsing of date-only strings
  found: new Date("2026-02-04") is interpreted as UTC midnight, not local midnight
  implication: For users west of UTC, this shows as previous day (Feb 3rd 20:00-21:00)

- timestamp: 2026-02-04T12:12:00Z
  checked: formatDate() function in StudyHeatmap.tsx line 234-237
  found: Uses new Date(dateStr) where dateStr is "YYYY-MM-DD" format from cell's day.date
  implication: This is the ROOT CAUSE - tooltip shows wrong date due to UTC interpretation

- timestamp: 2026-02-04T12:13:00Z
  checked: Verified with Node.js test
  found: In UTC-4 timezone: new Date("2026-02-04").getDate() returns 3 (not 4)
  implication: The cell data is CORRECT, but the tooltip DISPLAYS the wrong date

## Resolution

root_cause: formatDate() and other functions use new Date("YYYY-MM-DD") to parse date-only strings. JavaScript interprets these as UTC midnight, which for users west of UTC (e.g., Brazil UTC-3) shows as the previous day in local time. The cells contain correct data, but the tooltip displays dates 1 day earlier than expected.

fix: Created parseLocalDate() helper that parses "YYYY-MM-DD" as local midnight instead of UTC midnight. Replaced 4 instances of new Date(dateStr) with parseLocalDate() in:
- generateMonthLabels (line 196)
- getIntensityClass (line 221)
- formatDate (line 243)
- handleCellHover (line 315)

verification: |
  - Build succeeded
  - Node.js test confirmed fix:
    - OLD: new Date("2026-02-04").getDate() = 3 (wrong)
    - NEW: parseLocalDate("2026-02-04").getDate() = 4 (correct)
  - formatDate output changed from "Feb 3, 2026" to "Feb 4, 2026"
files_changed: [components/StudyHeatmap.tsx]
