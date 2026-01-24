# Features Research: i18n/Internationalization

**Domain:** React-based flashcard app (Evoque)
**Researched:** 2026-01-24
**Project Focus:** Adding PT-BR (default) + EN support with user language switching in Settings

## Executive Summary

i18n in React apps requires more than just translation file management. Users expect automatic language detection, persistent preferences, proper number/date formatting, and seamless UI updates when switching languages. This research identifies 7 table stakes (must-have), 6 differentiators (nice-to-have), and 3 critical anti-features (what NOT to do).

The most mature ecosystem uses **react-i18next** (built on i18next framework), which handles dynamic language switching, namespaces for code organization, browser language detection, and localStorage persistence. Alternative: **react-intl** (FormatJS) offers simpler setup but less flexibility.

---

## Table Stakes (Must-Have)

Features users expect. Missing any = product feels incomplete or broken.

| Feature | Why Expected | Complexity | Implementation Notes |
|---------|--------------|------------|----------------------|
| **String Translation** | Users see content in their language | Low | All hardcoded strings must be moved to translation files (JSON/YAML). No hardcoded strings in components. |
| **Dynamic Language Switching** | Users select a language and entire UI updates immediately | Medium | When user changes language, all components must re-render with new strings. Requires context/provider pattern. |
| **Language Persistence** | User's choice remembered across sessions | Low | Store selected language in localStorage or cookie. Auto-load on app restart. |
| **Browser Language Detection** | First visit uses browser's language preference (if available) | Low | i18next-browser-languagedetector plugin provides cascade: URL → localStorage → browser → fallback. |
| **Translation Files Management** | Translations organized and maintainable | Medium | Use JSON files per language (en.json, pt-br.json). For large apps, consider namespaces (auth.json, study.json). |
| **Fallback Language** | If translation missing, show English instead of key or broken text | Low | Set fallback: EN → show English string instead of "translation.key" |
| **Number/Date Formatting** | Dates, numbers formatted per locale (e.g., "24/01/2026" for PT-BR, "01/24/2026" for EN) | Low-Medium | Use native Intl API (Intl.DateTimeFormat, Intl.NumberFormat) or date-fns with locale support. ~97%+ browser support. |

---

## Differentiators (Nice-to-Have)

Features that set product apart or improve UX beyond baseline.

| Feature | Value Proposition | Complexity | Implementation Notes |
|---------|-------------------|------------|----------------------|
| **Pluralization Rules** | "1 card" vs "2 cards" (some languages have complex rules) | Low | i18next handles this via `count` parameter. Different languages have different plural forms (e.g., Hindi has more rules than English). |
| **Variable Interpolation** | Display dynamic content: "You studied 5 cards today" | Low | Use {{variable}} syntax in translation keys. i18next replaces at runtime. |
| **RTL Layout Support** | If adding Arabic/Hebrew in future: text direction flips automatically | Medium | Set `document.body.dir` based on language. Requires CSS that supports both LTR and RTL. Not needed for PT-BR/EN. |
| **Namespace Code Splitting** | Large apps: split translations by feature (auth.json, study.json, dashboard.json) | Medium | Reduces bundle size, enables lazy loading. Each feature loads only needed translations. |
| **Language Switcher UI** | Dropdown/toggle in Settings showing available languages | Low | Standard pattern: dropdown or radio buttons. Selected language highlighted. Shows language name (e.g., "Português", "English"). |
| **Translation Management System Integration** | Connect to Crowdin/Lokalise for professional translation workflows | Medium | Enables non-developers to manage translations. Out-of-scope for MVP but worth architecture planning. |

---

## Anti-Features (What NOT to Do)

Common mistakes that cause rewrites, maintenance nightmares, or poor user experience.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Hard-Coded Strings with String Concatenation** | "You studied " + cardCount + " cards" breaks in languages with different word order (e.g., German puts verb last). | Use ICU message format with variables: `"You studied {{count}} cards"`. Let library handle placement. |
| **Determining Pluralization by count === 1** | Different languages have different plural rules. Hindi: singular (1), dual (2), plural (3+). | Let i18next handle pluralization rules per language. Pass count to library, use `"cards_one"`, `"cards_other"` keys. |
| **Text Expansion Blindness** | German words ~30-40% longer than English. French can be longer. UI breaks with long translations. | Design UI with text expansion in mind: avoid fixed-width containers, use flexible layouts, test with pseudo-translations (elongated strings). |

---

## UX Patterns (Best Practices)

### Language Detection & First Visit

**Recommended flow:**

1. User visits app for first time
2. i18next-browser-languagedetector checks in order:
   - URL query parameter (`?lng=pt-BR`)
   - localStorage (previous choice)
   - Browser navigator language
   - HTML lang attribute
   - Fallback to EN
3. App loads with detected language
4. User can manually override in Settings

**Why this matters:** Feels native to the user (app respects their system language) while allowing override.

### Language Switching in Settings

**Expected UX:**

- Settings page includes "Language" option (similar to other preferences)
- Radio buttons or dropdown showing:
  - `Português (Brasil)` ✓ (if selected)
  - `English`
- Selection saves immediately (no "Save" button needed)
- Entire UI updates within 200ms
- No page refresh required
- URL doesn't change (unless using language in URL as pattern)

**Why this matters:** Matches user expectations from apps like Amazon, Google, Slack.

### Date/Time Formatting

**Recommended pattern:**

```typescript
// DON'T:
const dateStr = new Date().toLocaleDateString(); // Works but limited control

// DO:
const formatter = new Intl.DateTimeFormat('pt-BR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});
const dateStr = formatter.format(new Date()); // "24/01/2026"
```

For React, use helper function or hook to format dates throughout app.

### Number Formatting (Study Stats)

**PT-BR vs EN differences:**
- PT-BR: 1.234,56 (comma for decimals, period for thousands)
- EN: 1,234.56 (period for decimals, comma for thousands)

Use `Intl.NumberFormat` to handle automatically.

### Translation File Organization

**Recommended structure for Evoque (medium-size app):**

```
locales/
├── pt-br/
│   ├── common.json       (UI labels, buttons: "Iniciar", "Salvar")
│   ├── study.json        (Study session: "Novamente", "Bom", "Fácil")
│   ├── highlights.json   (Highlights page: filters, search)
│   └── settings.json     (Settings tabs, user preferences)
└── en/
    ├── common.json
    ├── study.json
    ├── highlights.json
    └── settings.json
```

Benefits:
- Easier to find strings for a feature
- Enables lazy loading (load only needed namespaces)
- Developers work in parallel without merge conflicts
- Reduces bundle size if implementing code splitting

### Pluralization Example (Evoque-specific)

```json
// pt-br/study.json
{
  "cards_review": {
    "one": "1 cartão para revisar",
    "other": "{{count}} cartões para revisar"
  }
}

// Usage:
t('cards_review', { count: cardCount })
// Outputs: "1 cartão para revisar" (if count=1) or "5 cartões para revisar" (if count=5)
```

### Auto-Detection Cascade (i18next-browser-languageDetector)

The detector stops at first match:

1. **Query string**: `?lng=pt-BR` (highest priority for sharing links in specific language)
2. **Cookie**: Previous session preference
3. **localStorage**: `i18nextLng` key (persisted from last manual selection)
4. **sessionStorage**: Current session preference
5. **Navigator**: `navigator.language` from browser settings
6. **HTML attribute**: `<html lang="pt-BR">`
7. **Fallback**: 'en' (configured default)

**For Evoque:** User's manual selection in Settings should update localStorage so it persists.

---

## Implementation Complexity Summary

| Category | Estimated Effort | Risk Level |
|----------|-----------------|------------|
| **Core i18n setup** (translation files + react-i18next provider) | 1-2 days | Low |
| **String extraction** (move all hardcoded strings to translation files) | 3-5 days | Medium |
| **Language switcher UI** (Settings option) | 1 day | Low |
| **Date/time formatting** (Intl API integration) | 1 day | Low |
| **Number formatting** (study stats, review counts) | 0.5 days | Low |
| **Testing** (verify both languages render correctly) | 2-3 days | Medium |
| **Total** | **~1 week** | **Low-Medium** |

---

## MVP Recommendation

For first i18n release, prioritize in this order:

### Phase 1: Core (Must Have)
1. ✓ String translation (PT-BR + EN)
2. ✓ Language detection (browser + localStorage)
3. ✓ Language persistence (localStorage)
4. ✓ Language switcher in Settings
5. ✓ Dynamic language switching (UI re-renders)
6. ✓ Date formatting (study session dates, review history)

### Phase 2: Polish (Nice to Have)
1. Pluralization (cards review counts, etc.)
2. Number formatting (study stats)
3. Namespace organization (if codebase grows)

### Defer to Post-MVP
- RTL support (not relevant for PT-BR/EN)
- Advanced pluralization edge cases
- Translation management system integration (Crowdin, Lokalise)
- Pseudo-translation testing (text expansion validation)

---

## Feature Dependencies

```
Language Detection & Persistence
  ↓
String Translation + Translation Files
  ↓
Dynamic Language Switching
  ↓
Language Switcher UI (Settings)
  ├─→ Date/Time Formatting
  └─→ Pluralization (optional)
       ↓
      Number Formatting (optional)
```

**Critical path:** Must-have features form an unbreakable chain. Can't have language switching without translation files. Can't have translation files without string extraction.

---

## Sources

Core i18n ecosystem research:
- [Internationalization (i18n) in React: Complete Guide 2026](https://www.glorywebs.com/blog/internationalization-in-react)
- [GitHub - react-i18next](https://github.com/i18next/react-i18next)
- [react-i18next vs. react-intl: The Ultimate Comparison](https://www.locize.com/blog/react-intl-vs-react-i18next/)
- [Curated List: Best Libraries for React I18n](https://phrase.com/blog/posts/react-i18n-best-libraries/)

Best practices and patterns:
- [A Guide to React Localization with i18next](https://phrase.com/blog/posts/localizing-react-apps-with-i18next/)
- [Common Mistakes When Implementing i18n in React Apps](https://infinitejs.com/posts/common-mistakes-i18n-react)
- [Lessons From Linguistics: i18n Best Practices for Front-End Developers - Shopify](https://shopify.engineering/internationalization-i18n-best-practices-front-end-developers/)

Advanced features:
- [How to Add Internationalization (i18n) to a React App Using i18next [2025 Edition]](https://dev.to/anilparmar/how-to-add-internationalization-i18n-to-a-react-app-using-i18next-2025-edition-3hkk)
- [Lazy Loading Localization with React-i18next](https://pranavpandey1998official.medium.com/lazy-loading-localization-with-react-i18next-3ebb5383fabe)
- [React: automatic date formatting in translations (i18next + date-fns)](https://dev.to/ekeijl/react-automatic-date-formatting-in-translations-i18next-date-fns-8df)

Language detection:
- [GitHub - i18next-browser-languageDetector](https://github.com/i18next/i18next-browser-languageDetector)
- [i18n for beginners: Every way to detect a user's locale (from best to worst)](https://dev.to/lingodotdev/every-way-to-detect-a-users-locale-from-best-to-worst-369i)

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Table Stakes | **HIGH** | Verified against official react-i18next docs, multiple authoritative sources agree |
| Differentiators | **HIGH** | Community consensus across multiple guides and case studies |
| Anti-Features | **HIGH** | Multiple sources (Shopify engineering, community posts) document these exact pitfalls |
| UX Patterns | **HIGH** | Industry standard patterns confirmed across major platforms (Google, Amazon, Slack) |
| Date/Time Formatting | **HIGH** | Native Intl API verified, 97%+ browser support documented |
| Complexity Estimates | **MEDIUM** | Based on typical implementation timelines, may vary by team experience |
