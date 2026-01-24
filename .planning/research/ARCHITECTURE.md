# Architecture Research: Internationalization (i18n)

**Project:** Evoque (Kindle Highlights Manager)
**Domain:** Multi-language support with React Context integration
**Researched:** 2026-01-24
**Mode:** Architecture dimension for i18n
**Overall Confidence:** HIGH

---

## Executive Summary

i18n should be integrated into Evoque using **react-i18next** (built on i18next). This library is the ecosystem standard for React internationalization, offering:

- **Provider-based architecture**: Pairs naturally with existing Context providers (AuthContext, StoreContext)
- **Namespace organization**: Split translations by feature (common, auth, highlights, study, settings)
- **Lazy loading**: Load only needed translations (PT-BR is default, EN loads on demand)
- **Localized formatting**: Handles dates, numbers, pluralization natively
- **Minimal bundle impact**: Core library ~20KB gzipped, lazy-loaded namespaces

**Key architectural decision**: I18nProvider sits below AuthProvider but above StoreProvider, establishing language before app data loads. This allows StoreContext to format dates/numbers correctly.

---

## Provider Placement in Component Tree

### Recommended Tree Structure

```
App.tsx
  |
  +-- ErrorBoundary
        |
        +-- ThemeProvider (existing)
              |
              +-- AuthProvider (existing)
                    |
                    +-- I18nProvider (NEW - wraps everything except auth)
                          |
                          +-- ProtectedApp
                                |
                                +-- HashRouter
                                      |
                                      +-- SidebarProvider (existing)
                                            |
                                            +-- StoreProvider (existing)
                                                  |
                                                  +-- AppLayout
                                                        |
                                                        +-- Routes
```

### Why This Placement

**Above StoreProvider:**
- Language decision must happen before StoreContext loads/formats dates
- StoreContext can use `useTranslation()` for error messages, formatted dates
- Consistent translations across all data operations

**Below AuthProvider:**
- AuthProvider runs faster (just checks session), doesn't depend on language
- Language selection can be user-specific (stored in UserSettings table)
- Non-authenticated Login page still gets theme + error messages

**Below ThemeProvider:**
- Both theme and language are "environmental" providers
- Theme is independent of language, no dependency either way
- Both persist to localStorage independently

**Not wrapping Router:**
- Ensures language is set before routes render
- Avoids race conditions on initial load

### Initialization Flow

```
1. App mounts
2. ErrorBoundary wraps everything
3. ThemeProvider activates (loads theme from localStorage)
4. AuthProvider checks session → sets user or shows login
5. IF authenticated:
   - I18nProvider loads default language (PT-BR) + user language preference from UserSettings
   - ProtectedApp renders
   - StoreProvider loads app data (books, highlights, etc.)
   - Routes render with correct language

6. IF not authenticated:
   - I18nProvider loads default language (PT-BR)
   - Login page renders with theme + i18n support
```

---

## File Structure for Translations

### Directory Layout

```
evoque/
├── public/
│   └── locales/
│       ├── pt-BR/
│       │   ├── common.json        # Shared UI (buttons, nav, etc.)
│       │   ├── auth.json          # Login/signup strings
│       │   ├── highlights.json     # Highlights page
│       │   ├── study.json          # Study deck selection
│       │   ├── session.json        # StudySession interface
│       │   ├── settings.json       # Settings page
│       │   ├── dashboard.json      # Dashboard/analytics
│       │   ├── errors.json         # Error messages
│       │   └── formats.json        # Date/number format strings
│       │
│       └── en/
│           ├── common.json
│           ├── auth.json
│           ├── highlights.json
│           ├── study.json
│           ├── session.json
│           ├── settings.json
│           ├── dashboard.json
│           ├── errors.json
│           └── formats.json
│
└── src/
    ├── i18n/
    │   ├── config.ts               # i18next configuration
    │   ├── index.ts                # i18next initialization
    │   └── resources.ts            # TypeScript types for keys (optional)
    │
    ├── components/
    │   └── I18nProvider.tsx        # React wrapper component
    │
    └── hooks/
        └── useLanguage.ts          # Custom hook for language selection
```

### Namespace Organization Strategy

**Split by feature, not by component.** Key principle: namespace = feature/page, not individual components.

#### common.json (Shared UI)
Buttons, form labels, navigation items used across multiple pages:
```json
{
  "nav": {
    "dashboard": "Dashboard",
    "highlights": "Highlights",
    "study": "Study",
    "settings": "Configurações"
  },
  "buttons": {
    "save": "Salvar",
    "cancel": "Cancelar",
    "delete": "Deletar",
    "import": "Importar"
  },
  "loading": "Carregando...",
  "error": "Erro"
}
```

#### auth.json
Login, signup, password reset:
```json
{
  "login": {
    "title": "Entrar em Evoque",
    "email": "Email",
    "password": "Senha",
    "submit": "Entrar",
    "noAccount": "Não tem conta?",
    "signup": "Criar conta"
  },
  "signup": {
    "title": "Criar Conta",
    "submit": "Cadastrar"
  },
  "errors": {
    "invalidEmail": "Email inválido",
    "passwordTooShort": "Senha deve ter no mínimo 6 caracteres"
  }
}
```

#### highlights.json
Highlights page, filters, tags:
```json
{
  "page": {
    "title": "Highlights",
    "empty": "Nenhum highlight ainda"
  },
  "filters": {
    "byBook": "Filtrar por livro",
    "byTag": "Filtrar por tag",
    "search": "Buscar highlights"
  },
  "actions": {
    "addToStudy": "Adicionar ao estudo",
    "removeFromStudy": "Remover do estudo",
    "edit": "Editar",
    "delete": "Deletar"
  }
}
```

#### study.json
Deck selection page:
```json
{
  "page": {
    "title": "Estude",
    "noDecks": "Nenhum deck disponível"
  },
  "deck": {
    "allBooks": "Todos os Livros",
    "cardsNew": "{{count}} novo",
    "cardsDue": "{{count}} para revisar"
  }
}
```

#### session.json
Study session interface:
```json
{
  "card": {
    "front": "Highlight",
    "back": "Nota"
  },
  "rating": {
    "again": "Novamente",
    "hard": "Difícil",
    "good": "Bom",
    "easy": "Fácil"
  },
  "progress": "{{current}} de {{total}}",
  "sessionEnd": "Sessão concluída!"
}
```

#### settings.json
Settings page (tabs: Import, Library, Account, Preferences):
```json
{
  "tabs": {
    "import": "Importar",
    "library": "Biblioteca",
    "account": "Conta",
    "preferences": "Preferências"
  },
  "language": {
    "label": "Idioma",
    "ptBr": "Português (Brasil)",
    "en": "English"
  },
  "limits": {
    "reviewsPerDay": "Máximo de revisões por dia",
    "newCardsPerDay": "Novos cards por dia"
  }
}
```

#### dashboard.json
Analytics page:
```json
{
  "title": "Dashboard",
  "stats": {
    "totalBooks": "Livros",
    "totalHighlights": "Highlights",
    "cardsReviewed": "Cards revisados",
    "todaysProgress": "Progresso de hoje"
  }
}
```

#### errors.json
Application-wide errors:
```json
{
  "importFailed": "Falha ao importar. Tente novamente.",
  "networkError": "Erro de rede. Verifique sua conexão.",
  "unauthorized": "Acesso negado. Faça login novamente.",
  "notFound": "Recurso não encontrado"
}
```

#### formats.json
Format strings for dates, pluralization:
```json
{
  "date": {
    "long": "YYYY-MM-DD",
    "short": "DD/MM",
    "locale": "pt-BR"
  },
  "plurals": {
    "highlight_other": "{{count}} highlights",
    "highlight_one": "{{count}} highlight",
    "card_other": "{{count}} cards",
    "card_one": "{{count}} card"
  }
}
```

---

## Integration Points with Existing Architecture

### 1. AuthContext Integration

**Current state:** AuthContext provides user session

**New: Language preference from UserSettings**

In `StoreContext.tsx`, after loading user settings:

```typescript
// After loading UserSettings from Supabase
const { language = 'pt-BR' } = settings; // Default to PT-BR

// In I18nProvider initialization
useEffect(() => {
  if (user && settings.language) {
    i18n.changeLanguage(settings.language);
  }
}, [settings.language, user, i18n]);
```

### 2. StoreContext Integration

**Current state:** StoreContext loads books, highlights, study cards

**New: Format dates and numbers using i18n**

In `StoreContext.getDeckStats()`:
```typescript
// Date formatting using i18n
const reviewedToday = i18n.format(new Date(), 'date.short');

// Number formatting with pluralization
const cardsText = i18n.t('study:deck.cardsDue', { count: 5 });
// Output: "5 para revisar" (PT-BR) or "5 to review" (EN)
```

### 3. Theme + Language Synchronization

Both stored in localStorage independently:
```
localStorage.getItem('evoque-theme') → 'dark' | 'light' | 'system'
localStorage.getItem('evoque-language') → 'pt-BR' | 'en'
```

Either can change without affecting the other.

### 4. Sidebar Integration

Language toggle in Sidebar (or SettingsModal):

```typescript
// components/LanguageToggle.tsx
import { useTranslation } from 'react-i18next';

export const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const { updateSettings } = useStore();

  const handleLanguageChange = async (lang: string) => {
    await i18n.changeLanguage(lang);
    await updateSettings({ language: lang }); // Persist to Supabase
  };

  return (
    <select value={i18n.language} onChange={(e) => handleLanguageChange(e.target.value)}>
      <option value="pt-BR">Português (Brasil)</option>
      <option value="en">English</option>
    </select>
  );
};
```

### 5. Error Handling

Integrate i18n with ErrorBoundary:

```typescript
// In ErrorBoundary
const { t } = useTranslation('errors');

<p>{t('importFailed')}</p>  // Automatically translated
```

---

## Lazy Loading Strategy

### Default: Load PT-BR upfront, load EN on demand

**Configuration in `i18n/config.ts`:**

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'pt-BR',
    defaultNS: 'common',
    ns: ['common', 'auth', 'highlights', 'study', 'session', 'settings', 'dashboard', 'errors'],

    resources: {
      'pt-BR': {
        common: require('./../../public/locales/pt-BR/common.json'),
        auth: require('./../../public/locales/pt-BR/auth.json'),
        // ... other namespaces
      },
      // EN loaded lazily on demand
    },

    interpolation: {
      escapeValue: false, // React handles XSS
    },

    react: {
      useSuspense: false, // Avoid Suspense boundaries during translation load
    },
  });

export default i18n;
```

### EN Lazy Loading

When user switches to English, load EN translations asynchronously:

```typescript
const loadLanguage = async (lang: string) => {
  if (lang === 'en') {
    // Dynamically import EN translations
    const enCommon = await import('./../../public/locales/en/common.json');
    const enAuth = await import('./../../public/locales/en/auth.json');
    // ... import all namespaces

    i18n.addResourceBundle('en', 'common', enCommon);
    i18n.addResourceBundle('en', 'auth', enAuth);
    // ... add all bundles
  }
  await i18n.changeLanguage(lang);
};
```

---

## Component Usage Patterns

### Pattern 1: Simple String Translation

```typescript
import { useTranslation } from 'react-i18next';

export const Dashboard = () => {
  const { t } = useTranslation('dashboard');

  return <h1>{t('title')}</h1>;
};
```

### Pattern 2: Interpolation with Variables

```typescript
const { t } = useTranslation('study');

<p>{t('deck.cardsDue', { count: 5 })}</p>
// PT-BR: "5 para revisar"
// EN: "5 to review"
```

### Pattern 3: Multiple Namespaces

```typescript
const { t: tCommon } = useTranslation('common');
const { t: tHighlights } = useTranslation('highlights');

return (
  <>
    <button>{tCommon('buttons.save')}</button>
    <h2>{tHighlights('page.title')}</h2>
  </>
);
```

### Pattern 4: Namespace-specific hook

```typescript
import { useTranslation } from 'react-i18next';

export const useHighlightsTranslation = () => useTranslation('highlights');

// In component:
const { t } = useHighlightsTranslation();
```

### Pattern 5: Date Formatting

```typescript
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();

const formatDate = (date: Date) => {
  return date.toLocaleDateString(i18n.language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing translations in component state
**Wrong:**
```typescript
const [labels, setLabels] = useState({ save: 'Save' });
```

**Right:** Use `useTranslation()` hook, which handles re-renders on language change.

### Anti-Pattern 2: Hardcoded strings in JSX
**Wrong:**
```typescript
<button>Save</button>
```

**Right:**
```typescript
const { t } = useTranslation();
<button>{t('buttons.save')}</button>
```

### Anti-Pattern 3: One massive translation file
**Wrong:** `locales/pt-BR.json` with 500+ keys

**Right:** Split by namespace (common.json, auth.json, highlights.json, etc.)

### Anti-Pattern 4: Lazy-loading ALL languages by default
**Wrong:**
```typescript
resources: {
  'pt-BR': { ... },
  'en': { ... },  // 50KB loaded even if user never switches
  'es': { ... },
  'fr': { ... },
}
```

**Right:** Load PT-BR upfront (default), EN on demand, don't add others until needed.

### Anti-Pattern 5: Not handling missing translations
**Wrong:** Silent failure, shows `missing key` placeholder

**Right:** Set `saveMissing: true` in dev, `missingKeyHandler` for production:
```typescript
missingKeyHandler: (lngs, ns, key) => {
  console.warn(`Missing translation: ${key}`);
  return key; // Fallback to key itself
};
```

---

## Build & Performance Considerations

### Bundle Size Impact

| Item | Size | Notes |
|------|------|-------|
| i18next core | ~12KB | Framework-agnostic |
| react-i18next | ~8KB | React integration |
| PT-BR translations (all namespaces) | ~15KB | Loaded upfront |
| EN translations | ~16KB | Lazy-loaded on demand |
| **Total if EN not loaded** | ~35KB | Default experience |
| **Total if EN loaded** | ~51KB | After language switch |

**Gzip estimates (typical):**
- PT-BR + i18next: ~13KB gzipped
- EN loaded dynamically: +7KB (loaded only on demand)

### Vite Configuration

No special Vite config needed. Translations in `public/locales/` are served as static assets. Dynamic imports trigger code-splitting naturally.

### Namespace Loading

Recommend "namespace-first" loading: load common.json early, load page-specific namespaces when route renders.

```typescript
// In Highlights page
useEffect(() => {
  i18n.loadNamespace('highlights');
}, []);
```

---

## Timeline & Phases

### Phase 1: Infrastructure (1-2 days)
- [ ] Install react-i18next and i18next
- [ ] Create `src/i18n/config.ts` with initial setup
- [ ] Create `components/I18nProvider.tsx`
- [ ] Add I18nProvider to App.tsx component tree
- [ ] Create `public/locales/pt-BR/` directory structure

### Phase 2: String Extraction (2-3 days)
- [ ] Extract all UI strings to `common.json`
- [ ] Extract auth strings to `auth.json`
- [ ] Extract highlights strings to `highlights.json`
- [ ] Extract study/session strings to `study.json`, `session.json`
- [ ] Extract settings strings to `settings.json`
- [ ] Extract dashboard strings to `dashboard.json`
- [ ] Extract error messages to `errors.json`

### Phase 3: Component Integration (2-3 days)
- [ ] Add `useTranslation()` to all components
- [ ] Replace hardcoded strings with `t()` calls
- [ ] Test language switching in browser DevTools
- [ ] Verify no console warnings about missing keys

### Phase 4: English Translation & EN Directory (1-2 days)
- [ ] Translate all PT-BR files to English
- [ ] Create `public/locales/en/` directory with same structure
- [ ] Test EN file loading (should be lazy)
- [ ] Verify pluralization works in both languages

### Phase 5: Date/Number Formatting (1 day)
- [ ] Add i18n number/date formatters
- [ ] Update StoreContext to use formatters for display dates
- [ ] Add `formats.json` with locale-specific rules

### Phase 6: Settings Integration (1 day)
- [ ] Add language toggle to Settings page
- [ ] Wire language selection to StoreContext (`updateSettings`)
- [ ] Persist language preference to Supabase
- [ ] Load user's language preference on app load

---

## Testing Checklist

- [ ] PT-BR loads by default (no console errors)
- [ ] Language toggle works (Settings page → select EN)
- [ ] Page refreshes with correct language preserved
- [ ] EN files load asynchronously (check Network tab in DevTools)
- [ ] All text renders correctly (no missing keys)
- [ ] Pluralization works (`cardsDue: "5 para revisar"`)
- [ ] Date formatting respects language locale
- [ ] No console warnings about missing translations
- [ ] Language preference persists to database
- [ ] Theme and language are independent (can switch either without affecting other)

---

## Sources

**High Confidence (Official Documentation):**
- [react-i18next Official Docs](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [i18next Namespaces Guide](https://www.i18next.com/principles/namespaces)

**High Confidence (Community Best Practices):**
- [react-i18next Multiple Translation Files](https://react.i18next.com/guides/multiple-translation-files)
- [i18next vs Alternatives Comparison](https://www.i18next.com/overview/comparison-to-others)
- [Phrase: React i18n Best Libraries](https://phrase.com/blog/posts/react-i18n-best-libraries/)

**Medium Confidence (Examples & Guides):**
- [Internationalization (i18n) in React: Complete Guide 2026](https://www.glorywebs.com/blog/internationalization-in-react)
- [Contentful: React Localization with i18n](https://www.contentful.com/blog/react-localization-internationalization-i18n/)
- [React Context Design Patterns 2026](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns)

---

## Key Decisions Summary

| Decision | Rationale | Confidence |
|----------|-----------|------------|
| Use **react-i18next** | Industry standard, excellent TypeScript support, namespace-based organization, flexible | HIGH |
| **PT-BR by default**, EN lazy-loaded | Reduces initial bundle, faster startup, user can opt into EN | HIGH |
| **Provider placement** (below Auth, above Store) | Language is environment state like theme; must be ready before data operations | HIGH |
| **Split by feature** (not component) | Easier to manage, matches page/feature structure, better for team collaboration | HIGH |
| **No extraction tool initially** | Project is small enough for manual extraction; can add i18next-parser later if scaling | MEDIUM |
| **Persist language to database** | User preference survives logout/login, better UX than localStorage-only | HIGH |

---

*Last updated: 2026-01-24*
