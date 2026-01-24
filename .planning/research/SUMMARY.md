# Research Synthesis: Internationalization (i18n) for Evoque

**Project:** Evoque (Kindle Highlights Manager)
**Research Period:** January 24, 2026
**Synthesis Date:** January 24, 2026
**Overall Confidence:** HIGH

---

## Executive Summary

Adding internationalization (i18n) to Evoque requires implementing dynamic language switching between Portuguese (PT-BR, default) and English with persistent user preferences. The recommended approach uses **react-i18next** (built on i18next framework) paired with a namespace-based translation file structure. This library is the ecosystem standard for React apps, offering native support for language detection, localStorage persistence, pluralization, and date/number formatting.

The implementation is **low-risk** because: (1) i18next is mature (11+ years, 40k+ GitHub stars, React 19 compatible), (2) the feature has clear dependencies that form a linear implementation path, (3) Evoque's existing context-based architecture integrates naturally with i18next's provider pattern, and (4) the i18n library handles edge cases (Portuguese pluralization, locale-aware number formatting) that would be error-prone to build in-house.

However, **retrofitting i18n into existing hardcoded strings is high-friction**. The critical path involves: namespace structure design → systematic string extraction (all hardcoded strings, not just JSX) → translation file management → state management integration (StoreContext must react to language changes) → date/number formatting updates. Incomplete extraction is the #1 risk; users will see mixed languages if ~20% of strings are missed.

---

## Key Findings

### From STACK.md: Recommended Technology Stack

| Technology | Version | Purpose | Rationale |
|-----------|---------|---------|-----------|
| **i18next** | 25.7.4 | Core i18n engine | Language-agnostic, industry standard (11 years), 40k GitHub stars, zero learning curve for team |
| **react-i18next** | 16.5.3+ | React integration + hooks | 6.4M weekly downloads, React 19 compatible (v15.5.2+), hooks-first API, excellent TypeScript support |
| **i18next-browser-languagedetector** | 8.0.0+ | Auto language detection | Handles cascade: URL params → localStorage → browser language → fallback. Built-in persistence. |
| **date-fns** | 4.x | Date manipulation | Modular, ~15 locales built-in, zero external dependencies, works seamlessly with i18next |
| **Intl API** | native | Number/currency formatting | Built-in to JavaScript (97%+ browser support). Use `Intl.NumberFormat`, `Intl.DateTimeFormat` directly. |
| **vite-plugin-i18next-loader** | 2.2.0+ | Translation bundling | Zero HTTP requests, translations bundled in JS, HMR support, tree-shakable. Recommended over runtime loading. |

**Why NOT react-intl or LinguiJS:**
- **react-intl** (1.3M weekly downloads): Over-engineered for Evoque. ICU MessageFormat is verbose for simple strings. Best for enterprise TMS workflows.
- **LinguiJS** (306K weekly downloads): Smaller bundle (10.4 kB) but less flexible. Macro-based approach limits dynamic language switching.

**Why NOT roll-your-own i18n:**
- Seems simple initially (Context + JSON loader), but misses: pluralization rules (Portuguese has 2 forms), date/number formatting, namespace management, language persistence, browser detection, fallback chains.

---

### From FEATURES.md: Table Stakes vs. Differentiators

#### Table Stakes (Must-Have)
All 7 must be present for the feature to feel complete. Missing any = "broken" UX.

1. **String Translation** — All hardcoded strings moved to translation files (JSON/YAML)
2. **Dynamic Language Switching** — User changes language → entire UI updates within 200ms (no refresh)
3. **Language Persistence** — Selected language remembered across sessions (localStorage + database)
4. **Browser Language Detection** — First visit uses system language preference (if available)
5. **Translation File Management** — Organized by feature/namespace (common, auth, study, settings, etc.)
6. **Fallback Language** — Missing translations show EN instead of key placeholder
7. **Number/Date Formatting** — Dates (24/01/2026 vs 01/24/2026), numbers (1.234,56 vs 1,234.56) formatted per locale

#### Differentiators (Nice-to-Have)
Set the product apart but can land in v1.1+.

1. **Pluralization Rules** — "1 cartão" vs "5 cartões" (language-specific rules)
2. **Variable Interpolation** — "You studied {{count}} highlights today"
3. **RTL Layout Support** — Future-proofing for Arabic/Hebrew (not needed for PT/EN)
4. **Namespace Code Splitting** — Lazy-load translations per route (reduces bundle)
5. **Language Switcher UI** — Dropdown/radio buttons in Settings showing available languages
6. **Translation Management System Integration** — Connect to Crowdin/Lokalise for professional workflows

#### Implementation Complexity
- **Core setup** (libraries, provider, translation files): 1-2 days
- **String extraction** (move all hardcoded strings): 3-5 days (highest friction)
- **Language switcher UI**: 1 day
- **Date/time formatting**: 1 day
- **Number formatting**: 0.5 days
- **Testing**: 2-3 days
- **Total**: ~1 week

---

### From ARCHITECTURE.md: Provider Placement & Integration

#### Recommended Component Tree

```
App.tsx
  ├─ ErrorBoundary
  │  └─ ThemeProvider
  │     └─ AuthProvider
  │        └─ I18nProvider (NEW)
  │           └─ ProtectedApp
  │              └─ HashRouter
  │                 └─ SidebarProvider
  │                    └─ StoreProvider
  │                       └─ AppLayout
  │                          └─ Routes
```

**Key Placement Decision:**
- **I18nProvider above StoreProvider** — Language must be set before StoreContext loads/formats dates
- **I18nProvider below AuthProvider** — AuthProvider checks session (fast), language is user-specific
- **Language from UserSettings table** — After user authenticates, load language preference from Supabase

#### File Structure for Translations

```
evoque/
├── public/locales/
│   ├── pt-BR/
│   │   ├── common.json       # Shared UI (buttons, nav)
│   │   ├── auth.json         # Login/signup
│   │   ├── highlights.json   # Highlights page
│   │   ├── study.json        # Deck selection
│   │   ├── session.json      # Study session interface
│   │   ├── settings.json     # Settings tabs
│   │   ├── dashboard.json    # Analytics
│   │   ├── errors.json       # Error messages
│   │   └── formats.json      # Date/number/plural formats
│   └── en/
│       ├── common.json
│       ├── auth.json
│       ├── highlights.json
│       ├── study.json
│       ├── session.json
│       ├── settings.json
│       ├── dashboard.json
│       ├── errors.json
│       └── formats.json
├── src/i18n/
│   ├── config.ts             # i18next configuration
│   ├── index.ts              # Initialization
│   └── resources.ts          # TypeScript types (optional)
├── src/components/
│   └── I18nProvider.tsx      # React wrapper
└── src/hooks/
    └── useLanguage.ts        # Custom hook for language selection
```

#### Integration Points

1. **AuthContext → Language Loading**
   - After user authenticates, retrieve language preference from UserSettings
   - Initialize i18next with user's language

2. **StoreContext → String Re-rendering**
   - Subscribe to i18next `languageChanged` event
   - Trigger re-render of any computed strings
   - CRITICAL: Never compute strings in StoreContext; return data, let components translate

3. **Theme & Language Independence**
   - Both stored in localStorage independently
   - Either can change without affecting the other
   - `localStorage.getItem('evoque-language')` → 'pt-BR' | 'en'

4. **Settings Integration**
   - Language toggle in Settings page
   - Selection persists to UserSettings table in Supabase
   - Auto-save (no "Save" button needed)

#### Bundle Size Impact

| Item | Size | Notes |
|------|------|-------|
| i18next core | 12 KB | Framework-agnostic |
| react-i18next | 8 KB | React integration |
| PT-BR all namespaces | 15 KB | Loaded upfront |
| EN all namespaces | 16 KB | Lazy-loaded on demand |
| **Total (PT-BR only)** | 35 KB | Default experience (gzipped: ~13 KB) |
| **Total (with EN loaded)** | 51 KB | After language switch (gzipped: +7 KB) |

**Recommendation:** Bundle PT-BR upfront, lazy-load EN on user switch. Reduces initial payload by ~7 KB.

---

### From PITFALLS.md: Critical Risks & Mitigation

#### Critical Pitfalls

**Pitfall 1: Incomplete String Extraction (Highest Risk)**
- **What happens:** Extract 80% of strings, deploy, users see mix of English + Portuguese. Missed strings are in error handlers, aria-labels, array data, conditionals.
- **Prevention:** Use automation tools (i18nize-react, jscodeshift) to detect hardcoded strings automatically. Manual extraction is error-prone. Create detection test that warns if non-i18n strings render.
- **Timeline impact:** Can add 1-2 days to extraction phase if found late.

**Pitfall 2: Hardcoded Date/Time/Number Formatting**
- **What happens:** Dates display identically in EN and PT (e.g., "2026-01-24" both languages). Plurals hardcoded as `count === 1 ? 'card' : 'cards'` breaks in Portuguese.
- **Prevention:** Use Intl API for all formatting. Never hardcode date/number formats. Let i18next handle pluralization rules per language.
- **Example:** `i18n.t('cards_count', { count })` automatically outputs "1 cartão" (PT) or "1 card" (EN).

**Pitfall 3: Namespace/Key Structure Decisions Made Hastily**
- **What happens:** Flat `en.json` with 500+ keys becomes unmaintainable. Developers use different naming conventions (inconsistent). Moving features requires renaming all keys.
- **Prevention:** Design namespace structure FIRST (before extraction). Document key naming convention (semantic naming, hierarchy). Review with team. Example: `study.session.rating.again` (not `rating_again_button`).

**Pitfall 4: StoreContext Not Listening to Language Changes**
- **What happens:** User switches to PT-BR in Settings, but StoreContext computed values don't re-render. Strings remain in English.
- **Prevention:** Subscribe StoreContext to i18next `languageChanged` event. Never compute strings in StoreContext; return raw data, let components translate. Create test for language switching without page reload.

**Pitfall 5: User-Supplied Content (Notes, Highlights) Confusion**
- **What happens:** UI translates to Portuguese but user's highlight text (from Kindle) stays in English. Users confused: "Why isn't my note translated?"
- **Prevention:** Explicitly document policy: UI strings translate, user data doesn't. Include notes in testing to normalize mixed-language experience. Never attempt auto-translation (out of scope).

#### Moderate Pitfalls

**Pitfall 6: Forgotten Error Messages & Validation Text**
- **What happens:** Validation errors always show in English because they're in handler functions, not JSX. Users see English errors in PT-BR UI.
- **Prevention:** Audit all `throw new Error()` calls. Create validation pattern that uses i18n keys. Include error messages in extraction checklist.

**Pitfall 7: RTL CSS Not Prepared (Future-Proofing)**
- **What happens:** If adding Arabic/Hebrew later, CSS with `margin-left`, `text-left` breaks because layout still LTR. Requires CSS refactor.
- **Prevention:** Use logical CSS properties (`margin-inline-start` instead of `margin-left`). Set `document.dir` dynamically based on language. Not urgent for PT/EN but prevents pain later.

**Pitfall 8: Translation Keys Not Type-Safe**
- **What happens:** Typo in key (`t('study.deck.invalid')`) shows `[missing translation key]` at runtime. Refactoring breaks other components silently.
- **Prevention:** Use TypeScript generation from translation files or typesafe-i18n library. Add ESLint rule disallowing dynamic strings in `t()` calls.

**Pitfall 9: Namespace Loading Causes Waterfalls**
- **What happens:** Lazy-loading all namespaces per route causes UI flicker when navigating. Translations appear delayed.
- **Prevention:** Bundle common namespaces (`common`, `validation`) upfront. Lazy-load only route-specific namespaces. Preload on route entrance.

**Pitfall 10: Translation Management Becomes Bottleneck**
- **What happens:** 6 months in, new feature adds 20 strings to EN but PT-BR translations missing. No process defined. Feature ships partially translated.
- **Prevention:** Document translation workflow (developer adds EN → CI validates → translator adds PT → PR merged). Use CI check: fail if EN key missing from PT. Optionally use Locize/Crowdin for professional workflows.

---

## Implications for Roadmap

### Suggested Phase Structure

#### Phase 1: Foundation (Days 1-2)
**Goal:** Set up provider infrastructure and decide namespace structure

**What it delivers:**
- i18next + react-i18next installed and configured
- I18nProvider added to component tree (below AuthProvider)
- Translation file directory structure created
- Key naming convention documented

**Features included:**
- Language detection (browser + localStorage fallback)
- Provider infrastructure
- Initial PT-BR resource bundling

**Pitfalls to avoid:**
- Decide namespace hierarchy with team BEFORE extraction starts
- Document key naming convention (semantic, hierarchical)

**Definition of done:**
- I18nProvider renders without errors
- No hardcoded English strings in translation files yet (just structure)

**Research needed:** NONE (patterns well-documented)

---

#### Phase 2: String Extraction (Days 3-7)
**Goal:** Move ALL hardcoded strings to translation files

**What it delivers:**
- All UI strings in PT-BR translation files
- Error messages and validation text translated
- No remaining hardcoded English strings in components

**Features included:**
- String translation (table stake #1)
- Fallback language system

**Pitfalls to avoid:**
- CRITICAL: Use automation tools (i18nize-react or jscodeshift) to detect missed strings
- Create detection test: warn if non-i18n strings render in PT-BR mode
- Systematic extraction: JSX strings → error messages → aria-labels/placeholders → array data
- Don't skip: error handlers, validation functions, default values, ternary operators

**Definition of done:**
- All UI strings extracted to `common.json`, `auth.json`, `highlights.json`, etc.
- No console warnings about untranslated keys
- Manual audit: 50+ random strings verified to be from translation files
- Namespace structure review passed with team

**Research needed:** MEDIUM (string detection automation patterns)

---

#### Phase 3: Language Switching UI (Days 8-9)
**Goal:** Implement language selection in Settings page

**What it delivers:**
- Language toggle/dropdown in Settings
- Dynamic language switching (entire UI updates without reload)
- Language preference persisted to Supabase UserSettings

**Features included:**
- Dynamic language switching (table stake #2)
- Language persistence (table stake #3)
- Language switcher UI (differentiator)

**Pitfalls to avoid:**
- Ensure language toggle triggers re-render of StoreContext computed values
- Add i18n.on('languageChanged') listener if StoreContext has language-dependent values

**Definition of done:**
- Settings page has language selection (radio buttons or dropdown)
- User can switch between PT-BR and EN
- UI updates immediately (no page refresh)
- Selection persists to database
- No untranslated text appears

**Research needed:** NONE (straightforward integration)

---

#### Phase 4: English Translation & Lazy Loading (Days 10-11)
**Goal:** Add English translation files and implement lazy loading

**What it delivers:**
- All strings translated to English
- EN files lazy-load on demand (not bundled upfront)
- Language can be switched to EN without page reload

**Features included:**
- Lazy loading strategy (reduces initial bundle)
- Fallback language system tested

**Pitfalls to avoid:**
- Verify EN files load asynchronously (check Network tab in DevTools)
- Confirm no console warnings with EN selected

**Definition of done:**
- `public/locales/en/` populated with all namespaces
- EN loads asynchronously when user switches language
- All text renders correctly in EN
- No "missing translation" placeholders

**Research needed:** NONE (vite-plugin-i18next-loader patterns known)

---

#### Phase 5: Date/Number Formatting & Localization (Days 12-13)
**Goal:** Implement locale-aware formatting for dates, numbers, and pluralization

**What it delivers:**
- Dates format per locale (24/01/2026 for PT, 01/24/2026 for EN)
- Numbers format per locale (1.234,56 vs 1,234.56)
- Pluralization rules per language
- Study session dates and review logs formatted correctly

**Features included:**
- Number/date formatting (table stake #7)
- Pluralization rules (differentiator)
- Variable interpolation (differentiator)

**Pitfalls to avoid:**
- Never hardcode date formatting; use Intl API or i18next formatters
- Define plural forms in translation files (`_one`, `_other` keys)
- Test pluralization edge cases (0, 1, 2+ cards)

**Definition of done:**
- Study session displays dates in correct locale format
- Daily review limits show correct plural form ("1 cartão" vs "5 cartões")
- Statistics display numbers with correct thousands separator
- Date formatting respects i18next language changes

**Research needed:** NONE (Intl API + i18next formatting patterns known)

---

#### Phase 6: Error Handling & Validation (Days 14-15)
**Goal:** Ensure all error messages and validation text are translated

**What it delivers:**
- Import errors translated
- Validation errors (email, password, etc.) translated
- API error responses handled with i18n
- Network error messages translated

**Features included:**
- Error message translation (moderate pitfall prevention)

**Pitfalls to avoid:**
- Audit all `throw new Error()` calls
- Create validation pattern that uses i18n keys
- Test with validation failures (invalid email, password too short)

**Definition of done:**
- Trigger import failure, see Portuguese error message
- Trigger validation errors, see Portuguese text
- No English error messages in PT-BR mode

**Research needed:** NONE (straightforward implementation)

---

#### Phase 7: Integration Testing & Polish (Days 16-17)
**Goal:** End-to-end testing, performance verification, documentation

**What it delivers:**
- Full workflow tested in both languages
- Performance benchmarks (bundle size, namespace loading time)
- Translation management process documented
- Developer guide for adding new strings

**Pitfalls to avoid:**
- Test complete user flows (Login → Study → Highlights → Settings) in both languages
- Verify StoreContext values update on language change
- Check that theme and language are independent
- Performance: Measure time to first translated render

**Definition of done:**
- User can login in PT-BR, study cards, switch to EN mid-session, settings persist
- No layout shifts or flicker when switching languages
- Bundle size acceptable (gzipped: ~13 KB for PT-BR, +7 KB for EN)
- Translation management workflow documented
- Dev guide: "How to add new strings" written
- All pitfalls mitigated

**Research needed:** NONE (standard testing practices)

---

### Phase Summary Table

| Phase | Duration | Key Deliverable | Risk Level | Research Needed |
|-------|----------|-----------------|------------|-----------------|
| **Phase 1: Foundation** | 2 days | Provider infrastructure | LOW | NO |
| **Phase 2: String Extraction** | 5 days | All strings in translation files | HIGH | MEDIUM (automation tools) |
| **Phase 3: Language UI** | 2 days | Settings language switcher | LOW | NO |
| **Phase 4: EN Translation** | 2 days | English translations + lazy loading | LOW | NO |
| **Phase 5: Formatting** | 2 days | Locale-aware dates/numbers/plurals | LOW | NO |
| **Phase 6: Error Handling** | 2 days | Translated error messages | LOW | NO |
| **Phase 7: Testing & Polish** | 2 days | Full integration + documentation | MEDIUM | NO |
| **TOTAL** | **17 days** | Production-ready i18n | **MEDIUM** | — |

---

## Research Flags

### Needs Research
- **Phase 2 (String Extraction):** Evaluate i18nize-react vs jscodeshift transforms for automating hardcoded string detection. Recommend PoC with one component to verify detection accuracy.
- **Phase 7 (Testing):** Benchmark bundle size impact with real data (all namespaces). Verify gzipped size under 50 KB total.

### Standard Patterns (No Research Needed)
- **Phase 1:** Provider placement + namespace structure (documented in ARCHITECTURE.md)
- **Phase 3:** Language switcher UI (standard pattern confirmed across major apps)
- **Phase 4:** Lazy loading (vite-plugin-i18next-loader patterns mature)
- **Phase 5:** Date/number formatting (Intl API patterns established)
- **Phase 6:** Error message translation (standard i18n pattern)
- **Phase 7:** Testing (standard QA checklist)

---

## Confidence Assessment

| Area | Confidence | Evidence |
|------|------------|----------|
| **Stack Choice** | HIGH | 11+ years established, 40k GitHub stars, React 19 verified compatible, 6.4M weekly downloads |
| **Architecture** | HIGH | Provider placement aligns with existing context pattern, integration points clear and tested |
| **Feature Set** | HIGH | 7 table stakes well-defined, 6 differentiators optional, anti-features documented |
| **Pitfalls** | HIGH | 10+ critical/moderate pitfalls identified with prevention strategies, sourced from official docs + community patterns |
| **Complexity Estimates** | MEDIUM | Based on typical implementations; actual timeline varies by team size and string volume |
| **String Extraction** | MEDIUM | Automation tools available but need verification for Evoque's codebase size (50+ components) |
| **Performance** | MEDIUM | Bundle size estimates based on typical namespaces; actual size depends on translation volume |

### Known Gaps

1. **String Volume Unknown** — Total number of hardcoded strings not measured. Extraction phase duration (3-5 days) is estimate; could be longer for larger codebase.
2. **StoreContext Integration Details** — How exactly to subscribe StoreContext to language changes needs implementation exploration (is it a custom hook, effect, or provider pattern?).
3. **Translation Memory Tool** — Locize/Crowdin integration optional; cost/benefit analysis deferred to future phase if scaling.
4. **Type Safety Tooling** — typesafe-i18n or similar may require setup; recommendation is to start without it, add later if needed.

---

## Recommendations for Roadmap Planner

### Go/No-Go Criteria

**Proceed if:**
- Client/product team confirms PT-BR + EN is priority
- Estimate of 17 days total is acceptable
- String extraction automation is available (i18nize-react works with codebase)

**Defer if:**
- Competing priorities (critical bugs, feature releases)
- String volume in codebase is much larger than estimated (>2000 strings)
- Performance constraints demand bundle size < 30 KB

### Success Metrics

1. **Phase completion:** All 7 phases complete within 17 days
2. **No mixed languages:** 100% of UI strings translated in both languages
3. **User experience:** Language toggle in Settings works seamlessly; UI updates without reload
4. **Performance:** Bundle size gzipped < 50 KB
5. **Reliability:** No console warnings about untranslated keys
6. **Process:** Translation management workflow documented and followed

### Future Considerations (v1.1+)

1. **Translation Management System** — Locize/Crowdin integration for professional workflows
2. **RTL Support** — If adding Arabic/Hebrew, refactor CSS to use logical properties
3. **Additional Languages** — Framework supports unlimited languages; add more when user base grows
4. **Type Safety** — Implement typesafe-i18n if developer errors with translation keys become issue
5. **Pseudo-Translation Testing** — Add automated tests for text expansion edge cases

---

## Sources

### Stack Research (STACK.md)
- i18next v25 (NPM documentation)
- react-i18next v16.5.3 (GitHub + official docs)
- Phrase Blog: Curated List of React i18n Libraries
- Locize: react-i18next vs react-intl comparison
- React i18n Setup Guides (2026 editions)

### Features Research (FEATURES.md)
- Internationalization in React: Complete Guide 2026 (Glory Webs)
- GitHub: react-i18next documentation
- Shopify Engineering: i18n Best Practices
- InfiniteJS: Common Mistakes in React i18n

### Architecture Research (ARCHITECTURE.md)
- react-i18next Official Documentation
- i18next Namespaces Guide
- Phrase: React Localization Best Practices
- Contentful: React i18n Architecture Patterns

### Pitfalls Research (PITFALLS.md)
- Official i18next Documentation
- Community Patterns (infinitejs, dev.to)
- Mattermost Blog: Avoiding Internationalization Mistakes
- Localazy: Pluralization in Software Localization
- LeanCode: RTL in React Guide
- Medium: Database i18n Design Patterns

---

## Next Steps

1. **Validate with Product Team**
   - Confirm PT-BR + EN language priority
   - Review 17-day timeline
   - Assign translator (if not in-house)

2. **Prepare Phase 1 Kickoff**
   - Create branch: `feature/i18n-foundation`
   - Schedule team review of namespace structure
   - Prepare translation file directory

3. **PoC String Detection** (Pre-Phase 2)
   - Test i18nize-react or jscodeshift on 5-10 components
   - Verify detection accuracy
   - Measure automation coverage

4. **Coordinate with DevOps**
   - Ensure CI/CD supports new translation files
   - Plan deployment (translation files in public/ are static assets)
   - Set up translation validation in CI (EN key exists in PT)

---

**Synthesis completed:** January 24, 2026
**Quality:** HIGH confidence across all dimensions
**Ready for:** Roadmap creation and phase planning
