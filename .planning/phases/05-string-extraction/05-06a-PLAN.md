# Plan: 05-06a StudySession Rating Actions Strings

---
phase: 05-string-extraction
plan: 06a
type: execute
wave: 4
depends_on: [05-04]
files_modified:
  - pages/StudySession.tsx
  - components/DeleteCardPopover.tsx
  - public/locales/pt-BR/session.json
autonomous: true

must_haves:
  truths:
    - "Rating buttons show 'Denovo', 'Dificil', 'Bom', 'Facil'"
    - "Keyboard hints show Portuguese text"
    - "DeleteCardPopover shows Portuguese confirmation"
  artifacts:
    - path: "pages/StudySession.tsx"
      provides: "StudySession with translated rating buttons"
      contains: "t('rating."
    - path: "components/DeleteCardPopover.tsx"
      provides: "DeleteCardPopover with useTranslation hook"
      contains: "useTranslation"
    - path: "public/locales/pt-BR/session.json"
      provides: "Portuguese translations for rating namespace"
      contains: "rating"
  key_links:
    - from: "pages/StudySession.tsx"
      to: "public/locales/pt-BR/session.json"
      via: "useTranslation hook"
      pattern: "t\\(['\"]rating\\."
---

<objective>
Extract StudySession rating button and action strings using the session namespace.

Purpose: Complete study session rating translation - Requirement TRANS-05 (part 2).
Output: Fully translated rating buttons and DeleteCardPopover
</objective>

<execution_context>
@C:\Users\lbp80\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\lbp80\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@pages/StudySession.tsx
@components/DeleteCardPopover.tsx
@public/locales/pt-BR/session.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace rating button strings in StudySession.tsx</name>
  <files>pages/StudySession.tsx</files>
  <action>
Replace rating buttons:
- "Reveal Answer" -> t('actions.revealAnswer')
- "(Space / Enter)" hint -> t('keyboard.revealHint')
- "Again" -> t('rating.again')
- "Hard" -> t('rating.hard')
- "Good" -> t('rating.good')
- "Easy" -> t('rating.easy')
- "(1)", "(2)", "(3 / Enter)", "(4)" keyboard hints -> t('keyboard.again'), t('keyboard.hard'), t('keyboard.good'), t('keyboard.easy')
  </action>
  <verify>grep -n "rating\." pages/StudySession.tsx && grep -c "t('rating" pages/StudySession.tsx</verify>
  <done>StudySession.tsx has all rating buttons using t() calls</done>
</task>

<task type="auto">
  <name>Task 2: Add useTranslation to DeleteCardPopover</name>
  <files>components/DeleteCardPopover.tsx</files>
  <action>
Import useTranslation in DeleteCardPopover.tsx:
```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation('session');
```

Replace strings:
- "Delete this card?" -> t('deleteCard.title')
- "This will remove the card from your study system..." -> t('deleteCard.message')
- "Cancel" -> t('common:buttons.cancel')
- "Delete" -> t('common:buttons.delete')
  </action>
  <verify>grep -n "useTranslation" components/DeleteCardPopover.tsx</verify>
  <done>DeleteCardPopover.tsx uses useTranslation with translated strings</done>
</task>

<task type="auto">
  <name>Task 3: Update session.json with rating and delete keys</name>
  <files>public/locales/pt-BR/session.json</files>
  <action>
Add rating and keyboard sections to session.json (merge with existing):
```json
{
  "actions": {
    "revealAnswer": "Revelar Resposta"
  },
  "rating": {
    "again": "Denovo",
    "hard": "Dificil",
    "good": "Bom",
    "easy": "Facil"
  },
  "keyboard": {
    "revealHint": "(Espaco / Enter)",
    "again": "(1)",
    "hard": "(2)",
    "good": "(3 / Enter)",
    "easy": "(4)"
  },
  "deleteCard": {
    "title": "Excluir este cartao?",
    "message": "Isso removera o cartao do seu sistema de estudo. Esta acao nao pode ser desfeita."
  }
}
```
  </action>
  <verify>npm run dev -- --open & sleep 5 && echo "Check rating buttons render in Portuguese"</verify>
  <done>session.json contains rating and keyboard keys, rating buttons display Portuguese text</done>
</task>

</tasks>

<verification>
- [ ] Rating buttons show "Denovo", "Dificil", "Bom", "Facil"
- [ ] Reveal Answer button shows Portuguese text
- [ ] Keyboard hints show Portuguese text
- [ ] DeleteCardPopover shows Portuguese confirmation
- [ ] No console warnings about missing translation keys
</verification>

<success_criteria>
- All rating buttons translated
- useTranslation hook used in DeleteCardPopover.tsx
- session.json contains rating, keyboard, and deleteCard keys
</success_criteria>

<output>
After completion, create `.planning/phases/05-string-extraction/05-06a-SUMMARY.md`
</output>
