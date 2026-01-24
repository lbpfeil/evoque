# Plan: 05-07a Settings Account and Preferences Tabs Strings

---
phase: 05-string-extraction
plan: 07a
type: execute
wave: 5
depends_on: [05-02]
files_modified:
  - pages/Settings.tsx
  - components/DeleteBookModal.tsx
  - public/locales/pt-BR/settings.json
autonomous: true

must_haves:
  truths:
    - "Account tab profile fields show Portuguese labels"
    - "Preferences tab options show Portuguese labels"
    - "DeleteBookModal shows Portuguese confirmation"
  artifacts:
    - path: "pages/Settings.tsx"
      provides: "Settings with account and preferences strings"
      contains: "t('account."
    - path: "components/DeleteBookModal.tsx"
      provides: "DeleteBookModal with useTranslation hook"
      contains: "useTranslation"
    - path: "public/locales/pt-BR/settings.json"
      provides: "Portuguese translations for account and preferences"
      contains: "account"
  key_links:
    - from: "pages/Settings.tsx"
      to: "public/locales/pt-BR/settings.json"
      via: "useTranslation hook"
      pattern: "t\\(['\"]account\\."
---

<objective>
Extract Settings page Account tab and Preferences tab strings using the settings namespace.

Purpose: Complete settings page translation (Account/Preferences) - Requirement TRANS-06 (part 2).
Output: Fully translated Account and Preferences tabs with DeleteBookModal
</objective>

<execution_context>
@C:\Users\lbp80\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\lbp80\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@pages/Settings.tsx
@components/DeleteBookModal.tsx
@public/locales/pt-BR/settings.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace Account and Preferences tab strings in Settings.tsx</name>
  <files>pages/Settings.tsx</files>
  <action>
Replace Account tab strings:
- "Account Settings" -> t('account.title')
- "Manage your account and profile" -> t('account.subtitle')
- "Profile Photo" -> t('account.photo.title')
- "Change Photo" -> t('account.photo.change')
- "JPG, PNG or GIF. Max 2MB." -> t('account.photo.hint')
- "Profile Information" -> t('account.profile.title')
- "Name:" -> t('account.profile.name')
- "Your full name" placeholder -> t('account.profile.namePlaceholder')
- "Email:" -> t('account.profile.email')
- "Plan:" -> t('account.profile.plan')
- "Free" -> t('account.profile.freePlan')
- "Statistics" -> t('account.stats.title')
- "Books", "Highlights", "Study Cards" labels -> t('account.stats.books'), etc.
- "Danger Zone" -> t('account.danger.title')
- "Export Data" -> t('account.danger.export')
- "Delete Account" -> t('account.danger.delete')

Replace Preferences tab strings:
- "Study Preferences" -> t('preferences.title')
- "Customize spaced repetition and study behavior" -> t('preferences.subtitle')
- "Study Options" -> t('preferences.study.title')
- "Default Daily Review Limit" -> t('preferences.study.dailyLimit')
- "cards/book/day" -> t('preferences.study.cardsPerBookDay')
- "Default Initial Ease Factor" -> t('preferences.study.easeFactor')
- "Apply Global Settings to All Books" -> t('preferences.study.applyGlobal')
- "Removes custom daily limits and ease factors from all books" -> t('preferences.study.applyGlobalHint')
- "Display & Interface" -> t('preferences.display.title')
- "Show keyboard shortcuts hints" -> t('preferences.display.keyboardHints')
- "Auto-reveal answer after 3 seconds" -> t('preferences.display.autoReveal')
- "Note: These settings are not yet functional" -> t('preferences.display.notFunctional')

Replace validation messages (move to errors namespace if not already):
- "Please upload an image file" -> t('errors:validation.imageRequired')
- "File size must be less than 2MB" -> t('errors:validation.fileTooLarge2MB')
  </action>
  <verify>grep -c "t('account" pages/Settings.tsx && grep -c "t('preferences" pages/Settings.tsx</verify>
  <done>Settings.tsx has all Account and Preferences tab strings using t() calls</done>
</task>

<task type="auto">
  <name>Task 2: Add useTranslation to DeleteBookModal</name>
  <files>components/DeleteBookModal.tsx</files>
  <action>
Import useTranslation in DeleteBookModal.tsx:
```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation('settings');
```

Replace strings:
- "Delete [Title]?" -> t('deleteBook.title', { title })
- "This action will permanently delete:" -> t('deleteBook.warning')
- "X highlights" -> t('deleteBook.highlights', { count })
- "X study cards" -> t('deleteBook.studyCards', { count })
- "All review history for this book" -> t('deleteBook.reviewHistory')
- "All chapter tags associated with this book" -> t('deleteBook.chapterTags')
- "This book is in your active study session" -> t('deleteBook.activeSession')
- "I understand this action cannot be undone" -> t('deleteBook.confirm')
- "Cancel" -> t('common:buttons.cancel')
- "Delete Book" -> t('deleteBook.button')
  </action>
  <verify>grep -n "useTranslation" components/DeleteBookModal.tsx</verify>
  <done>DeleteBookModal.tsx uses useTranslation with translated strings</done>
</task>

<task type="auto">
  <name>Task 3: Update settings.json with Account, Preferences, and DeleteBook keys</name>
  <files>public/locales/pt-BR/settings.json</files>
  <action>
Add account, preferences, and deleteBook sections to settings.json (merge with existing):
```json
{
  "account": {
    "title": "Configuracoes da Conta",
    "subtitle": "Gerencie sua conta e perfil",
    "photo": {
      "title": "Foto de Perfil",
      "change": "Alterar Foto",
      "hint": "JPG, PNG ou GIF. Max 2MB."
    },
    "profile": {
      "title": "Informacoes do Perfil",
      "name": "Nome:",
      "namePlaceholder": "Seu nome completo",
      "email": "Email:",
      "plan": "Plano:",
      "freePlan": "Gratuito"
    },
    "stats": {
      "title": "Estatisticas",
      "books": "Livros",
      "highlights": "Destaques",
      "studyCards": "Cartoes de Estudo"
    },
    "danger": {
      "title": "Zona de Perigo",
      "export": "Exportar Dados",
      "delete": "Excluir Conta"
    }
  },
  "preferences": {
    "title": "Preferencias de Estudo",
    "subtitle": "Personalize o comportamento da repeticao espacada",
    "study": {
      "title": "Opcoes de Estudo",
      "dailyLimit": "Limite Diario Padrao de Revisao",
      "cardsPerBookDay": "cartoes/livro/dia",
      "easeFactor": "Fator de Facilidade Inicial Padrao",
      "applyGlobal": "Aplicar Configuracoes Globais a Todos os Livros",
      "applyGlobalHint": "Remove limites diarios e fatores de facilidade personalizados de todos os livros"
    },
    "display": {
      "title": "Interface & Exibicao",
      "keyboardHints": "Mostrar dicas de atalhos de teclado",
      "autoReveal": "Revelar resposta automaticamente apos 3 segundos",
      "notFunctional": "Nota: Essas configuracoes ainda nao estao funcionais"
    }
  },
  "deleteBook": {
    "title": "Excluir {{title}}?",
    "warning": "Esta acao excluira permanentemente:",
    "highlights": "{{count}} destaques",
    "highlights_one": "{{count}} destaque",
    "studyCards": "{{count}} cartoes de estudo",
    "studyCards_one": "{{count}} cartao de estudo",
    "reviewHistory": "Todo o historico de revisao deste livro",
    "chapterTags": "Todas as tags de capitulo associadas a este livro",
    "activeSession": "Este livro esta na sua sessao de estudo ativa",
    "confirm": "Eu entendo que esta acao nao pode ser desfeita",
    "button": "Excluir Livro"
  }
}
```
  </action>
  <verify>npm run dev -- --open & sleep 5 && echo "Check settings account and preferences tabs render in Portuguese"</verify>
  <done>settings.json contains account, preferences, and deleteBook keys, tabs display Portuguese text</done>
</task>

</tasks>

<verification>
- [ ] Account tab profile fields show Portuguese labels
- [ ] Account tab statistics show Portuguese labels
- [ ] Preferences tab options show Portuguese labels
- [ ] DeleteBookModal shows Portuguese confirmation
- [ ] No console warnings about missing translation keys
</verification>

<success_criteria>
- Account tab and Preferences tab fully translated
- useTranslation hook used in DeleteBookModal.tsx
- settings.json contains account, preferences, and deleteBook sections
</success_criteria>

<output>
After completion, create `.planning/phases/05-string-extraction/05-07a-SUMMARY.md`
</output>
