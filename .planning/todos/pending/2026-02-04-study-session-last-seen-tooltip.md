---
created: 2026-02-04T08:30
title: Add "last seen" tooltip to study session status circle
area: ui
files:
  - pages/StudySession.tsx
---

## Problem

During a study session, the card status indicator circle shows the current card's state but doesn't reveal when it was last reviewed. Users have no quick way to know when they previously saw a card, which helps contextualize their performance and recall.

## Solution

Add a tooltip on hover to the status circle in StudySession that shows the last review date:
- Format: "visto pela última vez em [date]" (or similar Portuguese text)
- Use the card's `lastReviewDate` or `lastReviewedAt` field
- For new cards (never reviewed), show "primeira revisão" or similar
