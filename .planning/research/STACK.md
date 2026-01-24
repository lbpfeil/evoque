# Stack Research: Internationalization (i18n)

**Project:** Evoque (React 19 + Vite + Tailwind CSS)
**Researched:** January 24, 2026
**Confidence:** HIGH

---

## Recommended Stack

### Core i18n Framework

| Package | Version | Purpose | Why |
|---------|---------|---------|-----|
| **i18next** | 25.7.4 | Core internationalization engine | Industry standard (11+ years), language-agnostic, 40k+ GitHub stars. Powers react-i18next without coupling to React. |
| **react-i18next** | 16.5.3 | React bindings + hooks for i18next | Most popular React i18n solution (6.4M weekly downloads). React 19 compatible (fixes in v15.5.2+, v16.3.0+). Hooks-first API aligns with modern React. |
| **i18next-browser-languagedetector** | 8.0.0+ | Auto language detection | Handles localStorage persistence + browser language fallback. Standard approach for web apps. |

### Date/Number Formatting

| Package | Version | Purpose | Why |
|---------|---------|---------|-----|
| **date-fns** | 4.x | Date manipulation + locale support | Modular (~15 locales built-in, 200+ functions). Works seamlessly with i18next + React. Modern alternative to moment.js. Zero external dependencies. |
| **Intl API** (native) | — | Number/currency formatting | Built-in to JavaScript. Use `Intl.NumberFormat`, `Intl.DateTimeFormat` for locale-aware formatting. No additional package needed for basic cases. |

### Translation Loading (Choose One)

#### Option A: Build-Time Bundling (Recommended)
| Package | Version | Purpose | Why |
|---------|---------|---------|-----|
| **vite-plugin-i18next-loader** | 2.2.0+ | Vite plugin for bundling translations | **RECOMMENDED**: Zero HTTP requests. Translations bundled in JS. HMR support. Tree-shakable. Best for Vite. |

#### Option B: Runtime HTTP Loading
| Package | Version | Purpose | Why |
|---------|---------|---------|-----|
| **i18next-http-backend** | 2.5.0+ | Load translations from HTTP | Use only if translations update frequently or you need CDN distribution. Adds HTTP latency. |

---

## Complete Installation

```bash
# Core i18n
npm install i18next react-i18next i18next-browser-languagedetector

# Date/Number formatting
npm install date-fns

# Choose one translation loader:

# Option A: Build-time bundling (RECOMMENDED)
npm install -D vite-plugin-i18next-loader

# OR

# Option B: Runtime HTTP loading
npm install i18next-http-backend
```

---

## Why This Stack

### Why react-i18next (not react-intl or LinguiJS)?

| Criteria | react-i18next | react-intl | LinguiJS |
|----------|---------------|-----------|----------|
| **Weekly downloads** | 6.4M | 1.3M | 306K |
| **Bundle size** | ~30 kB | 17.8 kB | 10.4 kB |
| **React 19 support** | Full (v15.5.2+) | Yes | Yes |
| **Plugin ecosystem** | Extensive | Moderate | Limited |
| **TypeScript support** | Excellent (native) | Good | Good |
| **DX: Dynamic translations** | Easy | Complex | Macro-based |
| **Language persistence** | Built-in | Manual | Manual |
| **Pluralization** | Rich rule system | ICU rules | Yes |

**Recommendation: react-i18next**

- **Largest ecosystem** - 10+ years of plugins and patterns
- **Best for YOUR use case** - Dynamic language toggle in settings + localStorage persistence = built-in
- **Most flexible** - Fits both simple and complex translation scenarios
- **Active maintenance** - Just released v16.5.3 (6 days ago) with React 19 fixes

**When to choose alternatives:**
- **react-intl**: If you need strict ICU compliance for enterprise TMS workflows
- **LinguiJS**: If bundle size is critical (<10 kB requirement) and you don't need runtime flexibility

---

## Integration with Your Stack

### Vite Configuration

Add to `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import i18nextLoader from 'vite-plugin-i18next-loader'

export default defineConfig({
  plugins: [
    react(),
    i18nextLoader({
      paths: ['./public/locales'],
      namespaceResolution: 'basename',
    }),
  ],
})
```

### File Structure

```
evoque/
├── public/
│   └── locales/
│       ├── en/
│       │   ├── common.json       # UI strings, buttons
│       │   ├── settings.json     # Settings page
│       │   └── study.json        # Study session
│       └── pt-BR/
│           ├── common.json
│           ├── settings.json
│           └── study.json
├── src/
│   ├── lib/
│   │   └── i18n.ts              # i18n initialization
│   └── App.tsx                  # Import i18n at top
```

### Initialization (`src/lib/i18n.ts`)

```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translations from vite-plugin-i18next-loader
import resources from 'virtual:i18next-loader'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    defaultNS: 'common',

    // Language detection: localStorage → browser language → fallback
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },

    ns: ['common', 'settings', 'study'],

    interpolation: {
      escapeValue: false, // React already escapes
    },
  })

export default i18n
```

### React Component Usage

```typescript
import { useTranslation } from 'react-i18next'

export function MyComponent() {
  const { t, i18n } = useTranslation()

  // Simple string translation
  const label = t('submitButton')

  // Language toggle in Settings
  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng) // Auto-saves to localStorage
  }

  // Date formatting
  const date = new Date()
  const formatted = new Intl.DateTimeFormat(i18n.language).format(date)

  return (
    <>
      <button>{label}</button>
      <p>{formatted}</p>
    </>
  )
}
```

### Translation Files (`public/locales/pt-BR/common.json`)

```json
{
  "submitButton": "Enviar",
  "cancel": "Cancelar",
  "loading": "Carregando...",
  "studyCards": "{{count}} cartão",
  "studyCards_plural": "{{count}} cartões"
}
```

---

## Vite-Specific Considerations

### Build-Time vs Runtime Loading

| Aspect | vite-plugin-i18next-loader | i18next-http-backend |
|--------|---------------------------|----------------------|
| **HTTP requests** | 0 (bundled) | 1+ per language load |
| **Bundle size** | Larger JS (+30-50 kB) | Smaller initial JS |
| **Performance** | Faster (no network latency) | Slower (network + parsing) |
| **Updates** | Requires rebuild | Real-time CDN updates |
| **Dev experience** | HMR-enabled | Manual reload |
| **Recommendation** | Use this | CMS-driven apps only |

**For Evoque:** Use `vite-plugin-i18next-loader` (build-time). Translations don't change at runtime; bundling reduces latency.

---

## What NOT to Use (and Why)

### Roll-Your-Own i18n
**Why not:** Tempting to write simple `context.ts` + JSON loader. Avoids dependencies but:
- No pluralization rules (Portuguese has complex rules)
- No date/number formatting helpers
- Harder to add features later (namespaces, fallbacks, detection)
- i18next already does this perfectly

### react-intl (For This Project)
**Why not:** Over-engineered for Evoque's needs.
- ICU MessageFormat syntax is verbose for simple strings
- Best suited for enterprise apps with strict TMS workflows
- Smaller bundle (17.8 kB) not worth sacrificing DX

### i18next-localstorage-backend
**Why not:** Deprecated (GitHub repo marked deprecated).
- Use `i18next-browser-languagedetector` instead (modern alternative)
- Built into language detection flow

### Paraglide JS (Not Yet)
**Why not:** Excellent library (compiler-based, tree-shakable, 70% smaller bundles) but:
- Not production-ready for React 19 ecosystem yet
- No language persistence built-in (you'd add it manually)
- TypeScript support emerging (not mature like react-i18next)
- Revisit in 2027 when patterns mature

### moment.js for Date Formatting
**Why not:**
- Massive bundle (66 kB minified)
- Deprecated by maintainers
- date-fns is modern, modular, zero dependencies

---

## React 19 Compatibility Notes

### Verified Compatibility

- **react-i18next v16.5.3**: Full React 19 support
- **Fix for element.ref access**: v15.5.2 and later (PR #1846)
- **React Compiler wrapper**: v16.3.0+ (PR #1884)
- **Trans component improvements**: v16.4.0+ (optional count inference)

---

## Implementation Checklist

- [ ] Install `i18next`, `react-i18next`, `i18next-browser-languagedetector`
- [ ] Install `vite-plugin-i18next-loader` as dev dependency
- [ ] Add plugin to `vite.config.ts`
- [ ] Create `src/lib/i18n.ts` initialization file
- [ ] Create `public/locales/` folder structure (pt-BR, en)
- [ ] Import i18n in `src/App.tsx` (at the top)
- [ ] Create language toggle in Settings component
- [ ] Convert hardcoded strings to `t()` calls
- [ ] Test localStorage persistence (language survives reload)
- [ ] Test date/number formatting with `Intl` API
- [ ] Verify HMR works (edit translation, page updates automatically)

---

## Sources

- [Curated List of React i18n Libraries (Phrase Blog)](https://phrase.com/blog/posts/react-i18n-best-libraries/)
- [Internationalization Guide 2026 (Glory Webs)](https://www.glorywebs.com/blog/internationalization-in-react)
- [react-i18next Documentation](https://react.i18next.com/)
- [i18next v25 (NPM)](https://www.npmjs.com/package/i18next)
- [react-i18next v16.5.3 (NPM)](https://www.npmjs.com/package/react-i18next)
- [react-i18next CHANGELOG (GitHub)](https://github.com/i18next/react-i18next/blob/master/CHANGELOG.md)
- [React 19 Compatibility Issues (GitHub)](https://github.com/i18next/react-i18next/issues/1823)
- [i18next TypeScript Documentation](https://www.i18next.com/overview/typescript)
- [Vite + React i18n Setup Guide (Intlayer)](https://intlayer.org/doc/environment/vite-and-react)
- [react-i18next vs react-intl Comparison (Locize Blog)](https://www.locize.com/blog/react-intl-vs-react-i18next/)
- [Paraglide JS Library (inlang)](https://inlang.com/m/gerre34r/library-inlang-paraglideJs/)
- [i18next-browser-languagedetector (GitHub)](https://github.com/i18next/i18next-browser-languageDetector)
- [date-fns i18n Support (GitHub)](https://github.com/date-fns/date-fns/blob/main/docs/i18n.md)
- [vite-plugin-i18next-loader (GitHub)](https://github.com/alienfast/vite-plugin-i18next-loader)
- [React i18n Setup with TypeScript (Medium)](https://medium.com/@sundargautam2022/for-integrating-internationalization-i18n-in-a-react-vite-typescript-project-the-best-and-e240f444fdif)
