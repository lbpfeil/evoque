# Pitfalls Research: Adding i18n to Evoque

**Domain:** React TypeScript application with existing hardcoded English strings
**Focus:** Common mistakes when retrofitting internationalization (PT-BR + EN)
**Researched:** 2026-01-24
**Confidence:** HIGH (verified against official i18next docs and community patterns)

---

## Critical Pitfalls

Mistakes that will break the application or require significant rework.

### Pitfall 1: Incomplete String Extraction Leading to Language Toggle Failures

**What goes wrong:**
You extract and translate 80% of strings, then flip to Portuguese. Users see a mix of English and Portuguese throughout the app. Casual testing reveals the problem only after partial deployment.

**Why it happens:**
- Hardcoded strings are scattered across 50+ components
- Some strings live in:
  - Component JSX (obvious)
  - Error messages in handlers (easy to miss)
  - aria-labels, placeholders, titles (often forgotten)
  - Array data like `navItems = [{ name: 'Dashboard', ... }]` (missed in initial extraction)
  - Nested ternary operators with text
  - Inline strings in complex conditionals
- Manual extraction is error-prone at scale
- No automated detection of remaining English strings

**Consequences:**
- App appears partially broken after language switch
- Users trust the feature doesn't work
- Late discovery means more refactoring needed
- Difficult to debug which components have untranslated strings

**Prevention:**
1. **Use automation tools first**: Run [i18nize-react](https://www.npmjs.com/package/i18nize-react) or [jscodeshift transforms](https://github.com/BartoszJarocki/jscodeshift-react-i18next) to detect and replace hardcoded strings automatically
2. **Create a detection test**: Build a utility that warns if any string literal (not from i18n) appears in rendered output during PT-BR language mode
3. **Systematic extraction**:
   - First pass: Extract obvious JSX strings
   - Second pass: Find strings in objects (navItems, error messages, default values)
   - Third pass: Check aria-labels, titles, placeholders
   - Fourth pass: Search for string concatenation with user data
4. **Version control milestone**: Before moving to styling/Polish phase, commit fully extracted strings so you can diff and verify completion
5. **Create i18n coverage report**: Generate stats showing % of keys translated for each locale

**Detection:**
- User sets language to PT-BR, sees English text (obvious)
- Browser console warns about untranslated keys (if using i18next warn setting)
- Manual audit of top 5-10 user flows shows mixed languages
- QA checklist: "Every user-facing string comes from translation file, not JSX"

---

### Pitfall 2: Hardcoded Date/Time/Number Formatting Breaking When Locale Changes

**What goes wrong:**
Dates display as "2026-01-24" in English and Portuguese (same format). Numbers show "1000" everywhere. Localization library detects the language change, but text formatting is hardcoded, so users see incorrect locale-specific formats.

**Why it happens:**
- Dates currently formatted with JavaScript `.toLocaleDateString()` or formatted strings
- Numbers displayed with comma separators or currency formats hardcoded
- Study stats show "10 cards" but no `count` variable for pluralization
- No separation between content translation and formatting rules

**Consequences in Evoque context:**
- Study review dates show wrong format (Portuguese dates expect "24 de janeiro de 2026")
- Daily limits show as "10 cards" in both languages (should be "10 cartões" in PT)
- Statistics with "1,234 reviews" show wrong thousands separator
- Timestamps in review logs formatted incorrectly for locale
- Pluralization edge cases: "1 card" vs "1 livro" vs "0 cards"

**Prevention:**
1. **Use Intl API for dates/numbers**: Configure i18next with built-in formatting (v21.3.0+) using Intl.DateTimeFormat and Intl.NumberFormat
2. **Never hardcode date formatting**:
   ```typescript
   // WRONG - hardcoded format
   const formatted = date.toLocaleDateString() // American or OS default

   // RIGHT - uses locale from i18next
   const formatted = i18n.t('dateFormat:full', { val: date })
   ```
3. **Separate pluralization from content**:
   ```typescript
   // WRONG - hardcoded plural logic
   `${count} ${count === 1 ? 'card' : 'cards'}`

   // RIGHT - i18next handles plural rules
   t('cards_count', { count }) // Works with Arabic (6 forms), Polish (3 forms), etc.
   ```
4. **Create translation key for count variable**: Every `count`-based string needs a translation key
5. **Test with multiple locales**: Verify date/number/plural formatting switches correctly when language changes at runtime
6. **Define format options in i18n config**:
   - Date formats (short: "01/24", long: "24 de janeiro de 2026")
   - Number formats (decimal separator, thousands separator)
   - Plural rules (define `_zero`, `_one`, `_other` for each key)

**Detection:**
- Change to PT-BR and look at any date/timestamp (Study page, review logs)
- Check statistics display (should show Portuguese number formats)
- Test card limits: 1 card vs 2 cards (plural should work)
- Look for "millions" style formatting (should use locale's conventions)

---

### Pitfall 3: Namespace/Key Structure Decisions Made Hastily, Causes Refactoring Later

**What goes wrong:**
You create a flat structure `en.json` with 500+ keys (no organization). 6 months later, adding features becomes chaotic:
- Keys are hard to find: Is it `dashboard_cards_due` or `stats_due_cards` or `deck_due_count`?
- Developer A creates `highlight_delete_modal_title`, Dev B creates `modal_title_highlight_delete` (same feature, different key)
- Translators don't know context, translate same word differently in different keys
- Moving a feature to a different component requires renaming all keys

**Why it happens:**
- No agreed-upon key naming convention before extraction begins
- Namespace structure not defined (flat file vs. hierarchical)
- No documentation of "key conventions" document for team
- Keys named based on where they appear in code, not by semantic feature

**Consequences:**
- Large translation files are unmaintainable
- Duplicate translations (same word, different keys)
- Difficult to deprecate old keys
- Features spread across many keys instead of grouped
- Developer experience: hard to find the right translation key
- Translation management tools can't group related strings
- Risk of missed translations when feature moves

**Prevention:**
1. **Design namespace structure FIRST** (before extraction):
   ```json
   // Hierarchical structure (recommended for Evoque)
   {
     "common": { "save": "Save", "cancel": "Cancel" },
     "study": {
       "deck": { "title": "Study All Books", "empty": "No cards due today" },
       "session": { "rating": { "again": "Again", "hard": "Hard" } },
       "stats": { "new": "New", "learning": "Learning" }
     },
     "highlights": {
       "table": { "title": "Highlights", "columns": { "date": "Date" } },
       "edit": { "title": "Edit Highlight", "save": "Save Changes" }
     }
   }
   ```
2. **Create "Key Naming Convention" document**:
   - Semantic naming: Name keys by feature, not location
   - Hierarchy: `domain.feature.element.state`
   - Avoid abbreviations and acronyms
   - Never name keys after variable names (`cardCount` is bad, use `study.stats.card_count`)
3. **Use namespaced i18n loading**: Load only relevant namespaces per route
   ```typescript
   const { t } = useTranslation(['common', 'study'])
   ```
4. **Create shared key registry document**: List all standard keys and their usage
5. **Automated namespace validation**: Warn if same translation appears in multiple keys
6. **Review process**: Before extracting many strings, review key structure with team

**Detection:**
- Look at `en.json` in week 2: Is structure clear or chaotic?
- Run analysis: Count duplicated translations across keys
- Ask developer: "Without looking at the file, can you name the key for 'Study All Books'?"
- Review translation memory: Are translators confused about context?

---

### Pitfall 4: State Management + Translation Context Integration Issues

**What goes wrong:**
StoreContext (Evoque's 1280-line state manager) has computed values like:
```typescript
getCardStatus() => count === 1 ? 'card' : 'cards'
```

When you add i18n, these computed values don't re-render when language changes because they're not connected to i18next's language change listener. User switches to PT-BR, but `getCardStatus()` still returns English.

**Why it happens:**
- StoreContext is massive and changes frequently
- Translation context not integrated with existing state management
- i18next language change event doesn't trigger StoreContext updates
- No unified signal for "language changed, recompute values"

**Consequences in Evoque:**
- Study session shows "cards" when user switches to PT-BR, not "cartões"
- Any computed string value in StoreContext breaks on language switch
- User has to refresh page to see translations (defeats purpose of dynamic switching)
- Difficult to test language switching without full page reload

**Prevention:**
1. **Subscribe StoreContext to i18next language changes**:
   ```typescript
   useEffect(() => {
     i18n.on('languageChanged', () => {
       // Trigger recompute of all translated values in store
       // Update any values that depend on i18n
     });
   }, [])
   ```
2. **Never compute strings in StoreContext**:
   ```typescript
   // WRONG - hardcoded pluralization in store
   cardStatus: () => count === 1 ? 'card' : 'cards'

   // RIGHT - return count, let component translate
   cardCount: () => count // Component uses t('cards', { count })
   ```
3. **Move string computation to components**:
   - StoreContext returns data (numbers, dates, objects)
   - Components handle translation and formatting
4. **Create test for language switching**:
   ```typescript
   test('store values recompute when language changes', async () => {
     i18n.changeLanguage('pt')
     // Verify store-dependent UI updates
   })
   ```
5. **Document integration point**: Add comment in StoreContext showing i18next integration

**Detection:**
- Switch language at runtime, check Study page for untranslated strings
- Look for string methods on store values (if returning strings, that's wrong)
- Review StoreContext methods returning hardcoded text

---

### Pitfall 5: User-Supplied Content (Notes, Highlights) Not Translatable

**What goes wrong:**
Users enter highlights in English from Kindle books. When you add i18n, the UI translates but user content (notes, highlight text) doesn't. This is correct behavior, but it confuses features:
- User note in English displayed on PT-BR interface
- Mixed-language experience feels broken
- Some developers try to auto-translate user content (wrong, and unsupported by i18n libraries)

**Why it happens:**
- Unclear distinction between app UI strings (should translate) and user data (should not)
- Internationalization libraries focus on UI, not data
- No documentation of which content is translatable

**Consequences:**
- User confusion: "Why is my note still in English?"
- Feature requests for auto-translation (out of scope)
- Localization tests fail because user data isn't translated
- UX feels inconsistent

**Prevention:**
1. **Explicitly document policy in CODE**:
   ```typescript
   // TRANSLATABLE: App UI, buttons, labels, error messages
   // UNTRANSLATABLE: User-supplied highlights, notes, book titles
   // This is correct. User data belongs to user's original language.
   ```
2. **Create section in design guidelines**: Make clear what is/isn't translated
3. **In tests, use realistic data**: Include notes in English even when testing PT-BR
4. **Clarify with users early**: "Your highlights stay in their original language, app UI adapts to your preference"
5. **Never attempt user data translation** (Google Translate API, etc.):
   - Libraries don't handle this
   - Creates confusion about source language
   - Expensive and unreliable
   - Out of scope for i18n

**Detection:**
- QA asks: "Why isn't my note translated?"
- Test with pt-BR: See English notes in Portuguese UI (this is OK, but needs documentation)
- Review Highlights page: Ensure app labels translated but user content is not

---

## Moderate Pitfalls

Mistakes that cause friction, technical debt, or delayed completion.

### Pitfall 6: Forgetting to Translate Error Messages and Validation Text

**What goes wrong:**
Error messages live in async handlers and validation functions, scattered across components. When language changes, these still show in English:
```typescript
if (!email) throw new Error('Email is required')
// Doesn't translate
```

Users see English errors in PT-BR UI, making the app feel partially done.

**Why it happens:**
- Error messages are "code strings", not UI strings
- Many live in backend validators or service functions
- Not in JSX, so less obvious they need translation
- Error handling code written early, not reviewed for i18n

**Consequences:**
- Validation errors always in English (bad UX in PT-BR)
- Toast/alert messages untranslated
- API error responses shown in English
- Looks like incomplete localization

**Prevention:**
1. **Audit all `throw new Error()` and error messaging**:
   ```typescript
   // WRONG
   throw new Error('Email is required')

   // RIGHT - create error key
   throw new Error(t('validation.emailRequired'))
   ```
2. **Create validation i18n pattern**:
   ```typescript
   const validateEmail = (email: string, t: TranslationFunction) => {
     if (!email) return t('validation.emailRequired')
     return null
   }
   ```
3. **Include error translations in extraction checklist**
4. **Review try-catch blocks**: Every error message should be i18n key

**Detection:**
- Trigger validation errors in PT-BR mode (should see Portuguese)
- Check console for untranslated error keys
- Network error handling in Study/Import pages

---

### Pitfall 7: RTL Language Support Assumed But CSS Not Prepared

**What goes wrong:**
You add Arabic or Hebrew support (future-proofing). CSS uses `margin-left`, `text-left`, `right: 0` everywhere. Text flips but layout is still LTR, creating broken UI.

**Why it happens:**
- RTL usually comes later, not in initial i18n phase
- CSS written without logical properties
- Testing only with LTR languages (EN, PT)
- No automated RTL detection in build

**Consequences:**
- Unplanned work when RTL language is added
- CSS refactor needed (200+ directional properties)
- Layout breaks for RTL: buttons on wrong side, alignment off
- Brand suffers if RTL support launches broken

**Prevention:**
1. **Use logical CSS properties from the start**:
   ```css
   /* WRONG - will break in RTL */
   .button { margin-left: 8px; }

   /* RIGHT - adapts to text direction */
   .button { margin-inline-start: 8px; }
   ```
2. **Set dir attribute dynamically**:
   ```typescript
   useEffect(() => {
     document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
   }, [i18n.language])
   ```
3. **Use PostCSS plugin** [postcss-rtlcss](https://github.com/elchininet/postcss-rtlcss) to automatically generate RTL versions
4. **RTL testing checklist** (save for when RTL language is added):
   - Text direction correct
   - Flexbox layout reverses
   - Icons and images stay in correct position
   - Input fields and controls align correctly

**Detection:**
- For future-proofing: Check Tailwind usage, prefer `start/end` over `left/right`
- If adding Arabic: Test with `dir="rtl"` on html element
- Visual regression: Compare LTR and RTL layouts side-by-side

---

### Pitfall 8: Translation Keys Not Type-Safe, Leads to Runtime Errors

**What goes wrong:**
```typescript
t('study.deck.title') // Typo: should be 'study.session.title'
// No error at build time, app crashes at runtime with undefined translation
```

Developer refactors a key from `highlights.edit` to `highlights.update`, misses one component, app shows `[highlights.edit]` text to users.

**Why it happens:**
- i18next allows any string as key
- No TypeScript checking if key exists
- Key renames not caught by IDE refactoring
- Manual testing doesn't catch all uses

**Consequences:**
- Late discovery of untranslated keys (in production)
- `[missing translation key]` appears to users
- Refactoring features breaks other components
- Fragile codebase

**Prevention:**
1. **Enable type-safe translation keys with TypeScript**:
   - Use [typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n) or
   - Configure i18next with type augmentation
2. **Generate TypeScript definitions from translation files**:
   ```typescript
   // Auto-generated from en.json
   type TranslationKey = 'study.deck.title' | 'study.deck.empty' | ...

   // TypeScript error if key doesn't exist
   t('study.deck.invalid') // ❌ Type error
   ```
3. **Use LSP support**: IDE warns if key doesn't exist
4. **Add lint rule**: Disallow `t()` calls with dynamic strings (use constants)
5. **Add test**: Check that all keys in translation files are used

**Detection:**
- Build with strict mode enabled
- IDE should highlight invalid keys
- Run audit: `npm run i18n:validate-keys` (custom script)

---

### Pitfall 9: Namespace Loading Causes Waterfalls and Performance Issues

**What goes wrong:**
i18next configured to lazy-load translation files per route:
```
/study → load study.json (100KB)
/highlights → load highlights.json (150KB)
```

User navigates, translation file loads asynchronously, UI shows fallback text briefly, then translates. Looks like a glitch. If multiple namespaces needed at once, waterfalls cause delays.

**Why it happens:**
- Initial bundle size concern, try to lazy-load all namespaces
- No preloading strategy for common namespaces
- Async loading not coordinated with component rendering

**Consequences:**
- UI flicker when navigating to new route
- Delays in displaying translated content
- Bad perceived performance
- User sees loading state

**Prevention:**
1. **Keep common namespaces eagerly loaded**:
   - `common` (buttons, labels used everywhere) - bundled
   - `validation` (error messages) - bundled
   - Route-specific namespaces - lazy load
2. **Preload on route entrance**:
   ```typescript
   useEffect(() => {
     i18n.loadNamespace(['study']).then(() => setReady(true))
   }, [])
   ```
3. **Use Suspense + lazy loading boundary**:
   ```typescript
   <Suspense fallback={<LoadingState />}>
     <StudyPage /> {/* Wrapped with Suspense, waits for translations */}
   </Suspense>
   ```
4. **Bundle most-used namespaces**:
   ```typescript
   i18next.init({
     ns: ['common', 'validation'], // Always bundled
     defaultNS: 'common',
     // ... rest of config
   })
   ```
5. **Test performance**: Measure time to first translated render

**Detection:**
- Navigate to Study page, observe if UI translations appear immediately
- Network tab: Check if translation files load on demand
- Lighthouse: Verify no layout shifts from translation loading

---

### Pitfall 10: Translation Management Becomes Bottleneck Without Process

**What goes wrong:**
6 months in, adding new feature with 20 new strings. Developer adds English strings to `en.json`, but no process for translating to PT-BR. Feature ships with mixed languages. Translator doesn't know feature exists. String management becomes chaotic.

**Why it happens:**
- No translation workflow documented
- No owner of translation maintenance
- No CI check to ensure keys are translated
- Translation files treated like code, not content

**Consequences:**
- Features ship partially translated
- Translator burden grows (100 keys waiting to be translated)
- Developer frustration: "How do I add new strings?"
- Inconsistent translation quality

**Prevention:**
1. **Document translation workflow**:
   ```
   1. Dev: Add English key to en.json
   2. Dev: Use key in code with t()
   3. CI: Validate key exists in en.json
   4. Dev: Open PR with mention @translator
   5. Translator: Review PR, add PT-BR translation to pt.json
   6. Translator: Approve PR
   7. Merge: Both en.json and pt.json updated
   ```
2. **Add CI check**: PR fails if key in en.json but missing from pt.json
3. **Use translation management tool** (optional but recommended):
   - [Locize](https://locize.com) - cloud-based
   - [Crowdin](https://crowdin.com) - collaboration platform
   - Simplest: Spreadsheet + script to generate JSON
4. **Create translation checklist**: New feature PR must include:
   - English strings in en.json
   - Portuguese translations in pt.json
   - Links to translation keys in code
5. **Regular audits**: Monthly check for missing translations

**Detection:**
- In PR review: Ask "Are all strings translated?"
- Run CI check: `npm run i18n:validate-complete`
- Developer experience: Easy to add new strings and see them work

---

## Minor Pitfalls

Issues that cause annoyance but are fixable without major rework.

### Pitfall 11: Placeholder and aria-label Text Not Translated

**What goes wrong:**
Input placeholders show "Enter book title" even in PT-BR mode. aria-labels for screen readers are in English. Accessibility features partially broken for non-English users.

**Why it happens:**
- Placeholders and aria attributes treated as "not important"
- Less obvious they're user-facing than JSX text
- Easily missed in extraction pass

**Prevention:**
- Extract ALL text attributes: placeholder, aria-label, title, alt, aria-describedby
- Include in component checklist

---

### Pitfall 12: Console Warnings About Missing Translations Ignored

**What goes wrong:**
i18next warns about undefined keys in console, developers ignore warnings. Accumulates over time, becomes noise.

**Prevention:**
- Enable strict mode: `returnEmptyString: false` to make warnings visible
- Add ESLint rule to treat i18n warnings as errors in dev

---

### Pitfall 13: Date Formatting Libraries Not Localized

**What goes wrong:**
Using moment.js or date-fns without configuring locale. Dates always format in English despite changing i18n language.

**Prevention:**
- Use Intl API (modern, no dependencies)
- Or explicitly set locale on date library: `moment.locale(i18n.language)`

---

## Phase-Specific Warnings

| Phase | Likely Pitfall | Mitigation |
|-------|----------------|------------|
| **Setup** | Namespace structure too hastily decided | Review key hierarchy with team before extraction begins |
| **Extraction** | 80% of strings extracted, rest forgotten | Use automation tools, then audit systematically |
| **Translation** | Keys untranslated because process undefined | Create translation workflow, add CI validation |
| **Integration** | StoreContext not listening to language changes | Subscribe to i18next language event, trigger re-renders |
| **Testing** | Only tested with one locale | Test switching languages at runtime, not just on page load |
| **Polish** | Date/number formatting not localized | Replace hardcoded formatting with Intl API or i18next formatters |
| **Future** | RTL support impossible due to CSS architecture | Use logical CSS properties from start (not urgent, but prevents pain later) |

---

## Critical Actions Before Phase Completion

### Before "Extract Strings" Phase Ships
- [ ] Automation tool run against codebase (i18nize-react or jscodeshift)
- [ ] Manual audit of 50 random strings (should all be from en.json)
- [ ] Namespace structure documented and approved
- [ ] Key naming convention written and reviewed

### Before "Translate" Phase Ships
- [ ] All strings extracted and in en.json (100% coverage)
- [ ] All strings translated to pt.json
- [ ] CI validation: PR fails if en.json key missing from pt.json
- [ ] Language switching tested in main user flows (Study, Highlights, Settings)

### Before "Integration" Phase Ships
- [ ] StoreContext integrated with i18next language change listener
- [ ] No hardcoded plurals or date formats in StoreContext
- [ ] Date/time/number formatting uses Intl API or i18next formatters
- [ ] Error messages and validation text all translated
- [ ] RTL CSS properties planned (mark as future work if not implementing)

### Before Release
- [ ] Full flow test in PT-BR: Login → Study → Highlights → Settings
- [ ] User can switch language and see UI update without reload
- [ ] No `[missing translation key]` text visible
- [ ] Performance: Navigation doesn't show loading states for translations
- [ ] Translation management process documented

---

## Sources

- [Common Mistakes When Implementing i18n in React Apps](https://infinitejs.com/posts/common-mistakes-i18n-react)
- [How to Add Internationalization (i18n) to a React App Using i18next - 2025 Edition](https://dev.to/anilparmar/how-to-add-internationalization-i18n-to-a-react-app-using-i18next-2025-edition-3hkk)
- [react-i18next Documentation](https://react.i18next.com/)
- [Avoiding Common Internationalization Mistakes in Mattermost](https://mattermost.com/blog/avoiding-common-internationalization-mistakes/)
- [Pluralization in Software Localization - Localazy](https://localazy.com/blog/pluralization-in-software-localization-beginners-guide)
- [i18next: Formatting Dates and Numbers](https://www.i18next.com/translation-function/formatting)
- [Right to Left (RTL) in React: The Developer's Guide](https://leancode.co/blog/right-to-left-in-react)
- [Supercharge Your TypeScript App: Mastering i18next for Type-Safe Translations](https://dev.to/adrai/supercharge-your-typescript-app-mastering-i18next-for-type-safe-translations-2idp)
- [Lazy Loading Localization with React-i18next](https://pranavpandey1998official.medium.com/lazy-loading-localization-with-react-i18next-3ebb5383fabe)
- [Database Internationalization Design Patterns](https://medium.com/walkin/database-internationalization-i18n-localization-l10n-design-patterns-94ff372375c6)
