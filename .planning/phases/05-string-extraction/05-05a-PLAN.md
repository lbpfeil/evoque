# Plan: 05-05a TagManager Component Strings

---
phase: 05-string-extraction
plan: 05a
type: execute
wave: 3
depends_on: [05-02]
files_modified:
  - components/TagManagerSidebar.tsx
  - components/TagSelector.tsx
  - components/HighlightTableRow.tsx
  - public/locales/pt-BR/highlights.json
autonomous: true

must_haves:
  truths:
    - "TagManagerSidebar shows Portuguese text throughout"
    - "TagSelector dropdown shows Portuguese labels"
    - "HighlightTableRow tooltips are translated"
  artifacts:
    - path: "components/TagManagerSidebar.tsx"
      provides: "TagManagerSidebar with useTranslation hook"
      contains: "useTranslation"
    - path: "components/TagSelector.tsx"
      provides: "TagSelector with translated labels"
      contains: "useTranslation"
  key_links:
    - from: "components/TagManagerSidebar.tsx"
      to: "public/locales/pt-BR/highlights.json"
      via: "useTranslation hook"
      pattern: "t\\(['\"]tagManager\\."
---

<objective>
Extract strings from TagManager components using the highlights namespace.

Purpose: Complete highlights page tag management translation - Requirement TRANS-03 (part 2).
Output: Fully translated TagManagerSidebar.tsx, TagSelector.tsx, and HighlightTableRow.tsx
</objective>

<execution_context>
@C:\Users\lbp80\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\lbp80\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@components/TagManagerSidebar.tsx
@components/TagSelector.tsx
@components/HighlightTableRow.tsx
@public/locales/pt-BR/highlights.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add useTranslation to TagManagerSidebar and replace all strings</name>
  <files>components/TagManagerSidebar.tsx</files>
  <action>
Import useTranslation in TagManagerSidebar.tsx:
```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation('highlights');
```

Replace all TagManagerSidebar strings:
- "Manage Tags" title -> t('tagManager.title')
- "Organize your tags hierarchically..." -> t('tagManager.description')
- "Global Tags" -> t('tagManager.globalTags')
- "Book-Specific Tags" -> t('tagManager.bookTags')
- "books" suffix -> t('tagManager.booksCount', { count })
- "New root tag name..." placeholder -> t('tagManager.newRootTag')
- "New child tag name..." placeholder -> t('tagManager.newChildTag')
- "New chapter tag..." placeholder -> t('tagManager.newChapterTag')
- "Adding child to: X" -> t('tagManager.addingChildTo', { name })
- "Add" button -> t('common:buttons.add')
- Delete confirmation messages -> Use errors namespace
  </action>
  <verify>grep -n "useTranslation" components/TagManagerSidebar.tsx && grep -c "t('" components/TagManagerSidebar.tsx</verify>
  <done>TagManagerSidebar.tsx uses useTranslation, all labels and messages use t() calls</done>
</task>

<task type="auto">
  <name>Task 2: Add useTranslation to TagSelector and HighlightTableRow</name>
  <files>components/TagSelector.tsx, components/HighlightTableRow.tsx</files>
  <action>
Check TagSelector.tsx for any hardcoded strings and extract them:
- Placeholder text
- Empty state messages
- Action labels

Check HighlightTableRow.tsx for any hardcoded strings:
- Tooltip text
- Accessibility labels
- Status indicators

Add useTranslation hook to both components if strings are found.
  </action>
  <verify>grep -n "useTranslation" components/TagSelector.tsx components/HighlightTableRow.tsx</verify>
  <done>TagSelector.tsx and HighlightTableRow.tsx have all strings translated</done>
</task>

<task type="auto">
  <name>Task 3: Update highlights.json with TagManager keys</name>
  <files>public/locales/pt-BR/highlights.json</files>
  <action>
Add tagManager section to public/locales/pt-BR/highlights.json:
```json
{
  "tagManager": {
    "title": "Gerenciar Tags",
    "description": "Organize suas tags hierarquicamente. Tags globais aparecem em todos os livros.",
    "globalTags": "Tags Globais",
    "bookTags": "Tags por Livro",
    "booksCount": "{{count}} livros",
    "booksCount_one": "{{count}} livro",
    "newRootTag": "Nome da nova tag raiz...",
    "newChildTag": "Nome da nova sub-tag...",
    "newChapterTag": "Nova tag de capitulo...",
    "addingChildTo": "Adicionando sub-tag em: {{name}}"
  }
}
```
Merge with existing highlights.json keys.
  </action>
  <verify>npm run dev -- --open & sleep 5 && echo "Check tag manager sidebar renders in Portuguese"</verify>
  <done>highlights.json contains tagManager keys, TagManagerSidebar displays Portuguese text</done>
</task>

</tasks>

<verification>
- [ ] TagManagerSidebar shows Portuguese text throughout
- [ ] TagSelector dropdown shows Portuguese labels
- [ ] HighlightTableRow has translated accessibility text
- [ ] No console warnings about missing translation keys
</verification>

<success_criteria>
- useTranslation hook used in TagManagerSidebar.tsx
- All tag management UI translated
- highlights.json updated with tagManager section
</success_criteria>

<output>
After completion, create `.planning/phases/05-string-extraction/05-05a-SUMMARY.md`
</output>
