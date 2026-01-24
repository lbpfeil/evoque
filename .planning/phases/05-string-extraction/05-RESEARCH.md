# Phase 5: String Extraction - Research

**Researched:** 2026-01-24
**Domain:** React i18n string extraction and translation key management
**Confidence:** HIGH

## Summary

String extraction is the process of identifying all hardcoded UI strings in a React application and replacing them with i18next translation keys. This phase requires systematic identification of strings, creation of translation keys, and population of translation files.

The standard approach uses **i18next-cli** for automated string detection and extraction, combined with manual refactoring to replace hardcoded strings with `useTranslation` hook calls. For React applications, the `t()` function handles simple strings while the `<Trans>` component manages strings containing JSX/HTML elements.

Based on codebase analysis, EVOQUE has 6 pages, 20+ components (including modals/popovers), and multiple validation/error messages that need translation. The existing namespace structure (common, auth, highlights, study, session, settings, dashboard, errors) from Phase 4 provides the organizational framework.

**Primary recommendation:** Use i18next-cli for detection and verification, organize keys semantically by feature and UI location, and follow the pattern of extracting strings incrementally by namespace to maintain quality control.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-i18next | 14.x+ | Translation runtime | Official React bindings for i18next, React 19 compatible |
| i18next-cli | Latest | String extraction & validation | Official i18next tool, replaces deprecated i18next-parser, handles TypeScript/TSX |
| useTranslation hook | (react-i18next) | Access translations in components | Standard React hook pattern, enables reactivity |
| Trans component | (react-i18next) | Translate JSX with embedded components | Handles complex strings with HTML/React elements |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| i18next-scanner | Legacy | Alternative extraction tool | Only if i18next-cli doesn't meet needs (not recommended) |
| jscodeshift-react-i18next | Community | Automated string wrapping | Experimental - use for inspiration only |
| i18n-check | Latest | Validate translation coverage | CI/CD validation, find missing keys |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| i18next-cli | i18next-scanner | Scanner is older (2015), lower maintenance, lacks TypeScript support |
| i18next-cli | Manual grep/find | Manual search misses edge cases, no AST analysis, error-prone |
| Manual extraction | jscodeshift automation | Automation unreliable for complex JSX, requires manual verification |

**Installation:**
```bash
npm install --save-dev i18next-cli
```

## Architecture Patterns

### Recommended Project Structure
```
evoque/
├── public/
│   └── locales/
│       ├── pt-BR/
│       │   ├── common.json      # Buttons, labels, common UI elements
│       │   ├── auth.json        # Login/signup strings
│       │   ├── highlights.json  # Highlights page strings
│       │   ├── study.json       # Study deck selection
│       │   ├── session.json     # Study session strings
│       │   ├── settings.json    # Settings page strings
│       │   ├── dashboard.json   # Dashboard strings
│       │   └── errors.json      # Error/validation messages
│       └── en/                  # (Phase 6 - future)
├── components/
│   └── [Component].tsx          # Import { useTranslation } from 'react-i18next'
└── i18next.config.ts            # i18next-cli configuration
```

### Pattern 1: Simple String Replacement (t function)
**What:** Replace hardcoded strings with `t('namespace:key')` calls
**When to use:** Any simple text without HTML/JSX elements (90% of cases)
**Example:**
```typescript
// Before
<button>Save</button>

// After
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation();
  return <button>{t('common:buttons.save')}</button>;
};

// Translation file: public/locales/pt-BR/common.json
{
  "buttons": {
    "save": "Salvar"
  }
}
```

### Pattern 2: Complex Strings with JSX (Trans component)
**What:** Use `<Trans>` component for strings containing React components or HTML
**When to use:** Strings with `<strong>`, `<Link>`, `<br>`, or custom components
**Example:**
```typescript
// Before
<p>Click <strong>here</strong> to continue</p>

// After
import { Trans, useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation();
  return (
    <Trans i18nKey="common:messages.clickToContinue">
      Click <strong>here</strong> to continue
    </Trans>
  );
};

// Translation file: public/locales/pt-BR/common.json
{
  "messages": {
    "clickToContinue": "Clique <1>aqui</1> para continuar"
  }
}
```

### Pattern 3: Dynamic Strings with Interpolation
**What:** Use interpolation for dynamic content (names, counts, dates)
**When to use:** Strings containing variables
**Example:**
```typescript
// Before
<p>Welcome, {user.name}!</p>

// After
<p>{t('common:welcome', { name: user.name })}</p>

// Translation file
{
  "welcome": "Bem-vindo, {{name}}!"
}
```

### Pattern 4: Validation and Error Messages
**What:** Store all error messages in `errors` namespace
**When to use:** Any user-facing error, validation message, or alert
**Example:**
```typescript
// Before
alert('Please upload a .txt, .pdf, or .tsv file');

// After
alert(t('errors:import.invalidFileType'));

// Translation file: public/locales/pt-BR/errors.json
{
  "import": {
    "invalidFileType": "Por favor, envie um arquivo .txt, .pdf ou .tsv",
    "fileTooLarge": "O arquivo deve ter menos de 2MB",
    "uploadFailed": "Falha ao enviar arquivo: {{message}}"
  }
}
```

### Pattern 5: Namespace Organization by Feature
**What:** Group related strings into namespaces matching app structure
**When to use:** Always - enforces organization and enables lazy loading
**Structure:**
```
common.json       → Sidebar, buttons, common labels (Dashboard, Highlights, Study, Settings)
auth.json         → Login page (Email, Senha, Criar Conta, Entrar)
highlights.json   → Highlights page (filters, tags, actions)
study.json        → Study page (deck selection, stats)
session.json      → StudySession page (Again, Hard, Good, Easy, keyboard shortcuts)
settings.json     → Settings page (4 tabs: Import, Library, Account, Preferences)
dashboard.json    → Dashboard page (analytics, charts)
errors.json       → All error/validation messages
```

### Pattern 6: Hierarchical Key Naming
**What:** Use dot notation with 2-3 levels of nesting: `category.subcategory.item`
**When to use:** Always - improves maintainability and readability
**Best Practices:**
- Use semantic names: `buttons.save` not `btnSave` or `button1`
- Mirror UI structure: `settings.tabs.import` reflects Settings page → Import tab
- Be specific: `errors.import.invalidFileType` not `errors.invalidFile`
- Consistent casing: Use camelCase throughout (`welcomeMessage` not `welcome_message`)

**Examples:**
```json
// Good: semantic, hierarchical, clear
{
  "sidebar": {
    "navigation": {
      "dashboard": "Dashboard",
      "highlights": "Highlights",
      "study": "Estudo",
      "settings": "Configurações"
    },
    "user": {
      "logout": "Sair"
    }
  },
  "buttons": {
    "save": "Salvar",
    "cancel": "Cancelar",
    "delete": "Excluir"
  }
}

// Bad: flat, cryptic, inconsistent
{
  "dashboardTxt": "Dashboard",
  "btn1": "Salvar",
  "error_msg": "Erro"
}
```

### Anti-Patterns to Avoid
- **Reusing keys across contexts:** Don't use `common:save` for both "Save highlight" and "Save settings" if Portuguese translations differ
- **Breaking up sentences:** Never split "Welcome to EVOQUE" into `t('welcome') + ' ' + t('to') + ' EVOQUE'` (word order varies by language)
- **Hardcoded concatenation:** Avoid `t('greeting') + ', ' + name + '!'` - use interpolation instead
- **Skipping validation messages:** All user-facing errors must be translated, including `alert()` and `throw new Error()` messages
- **Generic keys:** Avoid `error1`, `text1` - keys should be self-documenting
- **Deep nesting (4+ levels):** Keep hierarchy 2-3 levels max for readability

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Finding hardcoded strings | Manual grep/regex | i18next-cli extract | AST-based parsing understands context, finds t() calls, ignores comments/code |
| Detecting missing translations | Custom scripts | i18next-cli lint/status | Validates keys exist in all locales, catches typos, shows coverage % |
| Validating translation keys | Manual review | i18next-cli + TypeScript types | Generates types for autocomplete, catches missing keys at compile time |
| Organizing namespaces | Single file | Feature-based namespaces | Enables lazy loading, team collaboration, clear ownership |
| Wrapping strings automatically | Custom AST transforms | Manual + i18next-cli validation | Automated wrapping unreliable for complex JSX, better to verify human work |

**Key insight:** String extraction is tedious but not complex - automation should focus on detection and validation, not transformation. Human judgment is needed for proper key naming and context determination.

## Common Pitfalls

### Pitfall 1: Using t() Outside React Components
**What goes wrong:** Calling `t()` in module-level code or utility functions causes errors or returns keys instead of translations
**Why it happens:** `useTranslation` is a React hook and only works inside functional components
**How to avoid:**
- Always call `useTranslation()` inside component body
- Pass `t` function as parameter to utility functions if needed
- For rare cases outside components, use `i18n.t()` directly (but ensure i18n is initialized)
**Warning signs:** `Invalid Hook Call` errors, translation keys rendered as-is in UI

### Pitfall 2: Translation Timing Issues
**What goes wrong:** During initial render, translations may not be loaded yet, showing keys or blank text
**Why it happens:** http-backend loads translations asynchronously
**How to avoid:**
- Use Suspense wrapper (already implemented in I18nProvider)
- Provide loading fallback with hardcoded text (already done: "Carregando idioma...")
- Never bypass Suspense for i18n-dependent components
**Warning signs:** Flash of untranslated content (FOUC), keys briefly visible on page load

### Pitfall 3: Breaking Sentences for Reuse
**What goes wrong:** Splitting sentences into reusable parts fails in other languages due to different word orders
**Why it happens:** Developers try to be DRY (Don't Repeat Yourself) with translations
**How to avoid:**
- Keep full sentences as single translation keys
- Duplicate similar sentences rather than concatenating parts
- Use interpolation for variable parts: `"Welcome, {{name}}!"` not `"Welcome, " + name + "!"`
**Warning signs:** Translations sound robotic, word order errors in other languages
**Example:**
```typescript
// ❌ BAD - breaks in languages with different word order
<p>{t('common:added')} {date}</p>

// ✅ GOOD - full sentence with interpolation
<p>{t('common:addedOn', { date })}</p>
// PT-BR: "Adicionado em {{date}}"
// EN: "Added on {{date}}"
// JA: "{{date}}に追加されました" (date comes first!)
```

### Pitfall 4: Forgetting Error Messages
**What goes wrong:** Error messages remain in English because they're in `alert()`, `throw new Error()`, or console logs
**Why it happens:** Developers focus on UI text and overlook validation/error paths
**How to avoid:**
- Create dedicated `errors.json` namespace
- Grep for `alert(`, `throw new Error`, `setError(` to find all error messages
- Test all error paths (invalid inputs, network failures) to verify translations
**Warning signs:** English text appearing in error dialogs, untranslated validation messages

### Pitfall 5: Inconsistent Namespace Usage
**What goes wrong:** Keys scattered across namespaces inconsistently, making maintenance difficult
**Why it happens:** No clear ownership rules for which strings belong where
**How to avoid:**
- Follow feature-based organization (page/component determines namespace)
- Document namespace purpose in comments
- Use `common` sparingly (only truly shared UI elements)
- Review namespace distribution during code review
**Warning signs:** `common.json` grows to hundreds of keys, duplicate keys across namespaces

### Pitfall 6: Missing Translation Keys
**What goes wrong:** React renders translation keys as strings (e.g., "common:buttons.save") instead of translated text
**Why it happens:** Key typo, wrong namespace, or key not added to translation file yet
**How to avoid:**
- Enable i18next debug mode during development (`debug: import.meta.env.DEV`)
- Use i18next-cli lint/status to validate all keys exist
- Consider TypeScript strict mode with generated types (optional, Phase 5+)
**Warning signs:** Dot-notation strings rendered in UI, console warnings about missing keys

## Code Examples

Verified patterns from official sources:

### Basic Hook Usage
```typescript
// Source: https://react.i18next.com/latest/usetranslation-hook
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation(); // Default namespace

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
};
```

### Multiple Namespaces
```typescript
// Source: https://react.i18next.com/guides/multiple-translation-files
import { useTranslation } from 'react-i18next';

const Settings = () => {
  const { t } = useTranslation(['settings', 'common']);

  return (
    <div>
      <h1>{t('settings:title')}</h1>
      <button>{t('common:buttons.save')}</button>
    </div>
  );
};
```

### Trans Component with Interpolation
```typescript
// Source: https://react.i18next.com/latest/trans-component
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';

const Message = ({ count }) => {
  return (
    <Trans i18nKey="studyComplete" count={count}>
      You studied <strong>{{ count }}</strong> cards today!
      <Link to="/stats">View stats</Link>
    </Trans>
  );
};

// Translation file
{
  "studyComplete_one": "Você estudou <1>{{count}}</1> cartão hoje! <3>Ver estatísticas</3>",
  "studyComplete_other": "Você estudou <1>{{count}}</1> cartões hoje! <3>Ver estatísticas</3>"
}
```

### Error Message Translation
```typescript
// Source: Best practices from codebase analysis
import { useTranslation } from 'react-i18next';

const FileUpload = () => {
  const { t } = useTranslation('errors');

  const handleUpload = async (file: File) => {
    if (!file.name.match(/\.(txt|pdf|tsv)$/)) {
      alert(t('import.invalidFileType'));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert(t('import.fileTooLarge'));
      return;
    }

    try {
      await uploadFile(file);
    } catch (error) {
      alert(t('import.uploadFailed', { message: error.message }));
    }
  };
};
```

### Conditional Rendering with Translations
```typescript
// Pattern from EVOQUE Login page
const Login = () => {
  const { t } = useTranslation('auth');
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div>
      <h2>{isSignUp ? t('createAccount') : t('signIn')}</h2>
      <button type="submit">
        {isSignUp ? t('buttons.createAccount') : t('buttons.signIn')}
      </button>
      <button onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? t('links.alreadyHaveAccount') : t('links.needAccount')}
      </button>
    </div>
  );
};
```

### i18next-cli Configuration
```typescript
// Source: https://github.com/i18next/i18next-cli
// File: i18next.config.ts
import { defineConfig } from 'i18next-cli';

export default defineConfig({
  locales: ['pt-BR', 'en'],
  extract: {
    input: [
      'components/**/*.{ts,tsx}',
      'pages/**/*.{ts,tsx}',
      '!**/*.test.{ts,tsx}',
      '!**/node_modules/**',
    ],
    output: 'public/locales/{{language}}/{{namespace}}.json',

    // Functions to detect
    functions: ['t', '*.t', 'i18next.t'],

    // React components to detect
    transComponents: ['Trans', 'Translation'],

    // Default namespace
    defaultNamespace: 'common',
  },

  // Linting rules
  lint: {
    // Warn about hardcoded strings
    detectHardcodedStrings: true,

    // Check for missing translations
    checkMissingKeys: true,
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| i18next-parser | i18next-cli | Sep 2025 | Official tool now, better TypeScript support, active maintenance |
| Manual string detection | AST-based extraction | 2024+ | More accurate detection, fewer false positives/negatives |
| Single translation file | Namespaced files | i18next 20+ | Lazy loading, better organization, team collaboration |
| react-i18next without Suspense | React.Suspense integration | React 18+ | Better loading states, prevents FOUC |
| withTranslation HOC | useTranslation hook | react-i18next 10+ | Modern React patterns, better TypeScript support |

**Deprecated/outdated:**
- **i18next-parser:** Officially deprecated Sept 2025, use i18next-cli instead
- **withTranslation HOC:** Legacy pattern, use `useTranslation` hook for functional components
- **i18next.init() in component:** Anti-pattern, initialize at app root (already done in EVOQUE)

## Open Questions

Things that couldn't be fully resolved:

1. **Should we generate TypeScript types for translation keys?**
   - What we know: i18next-cli supports generating `.d.ts` files for autocomplete
   - What's unclear: Whether strict TypeScript mode provides enough value vs. complexity
   - Recommendation: Skip for Phase 5 (manual extraction), consider for Phase 8+ (future maintenance)

2. **Should we use i18next-cli detect for hardcoded string detection?**
   - What we know: i18next-cli has `lint` command with `detectHardcodedStrings` option
   - What's unclear: Accuracy for React/JSX patterns, false positive rate
   - Recommendation: Test on small component first, use as validation tool not primary detection

3. **How to handle date formatting in translations?**
   - What we know: Codebase uses `toLocaleDateString('pt-BR')` for date formatting
   - What's unclear: Whether to move to i18next's built-in date formatting or Phase 7 (Localization)
   - Recommendation: Keep existing date formatting for Phase 5, address in Phase 7 (FMT-01 requirement)

## Sources

### Primary (HIGH confidence)
- [i18next Official Documentation - Extracting Translations](https://www.i18next.com/how-to/extracting-translations)
- [i18next-cli GitHub Repository](https://github.com/i18next/i18next-cli)
- [react-i18next Documentation - Trans Component](https://react.i18next.com/latest/trans-component)
- [react-i18next Documentation - Multiple Translation Files](https://react.i18next.com/guides/multiple-translation-files)
- [i18next Documentation - Namespaces](https://www.i18next.com/principles/namespaces)

### Secondary (MEDIUM confidence)
- [Locize Blog - The Art of the Key: i18n Key Naming Guide](https://www.locize.com/blog/guide-to-i18n-key-naming/)
- [Tolgee Blog - Ultimate Guide to Naming Translation Keys](https://tolgee.io/blog/naming-translation-keys)
- [Shopify Engineering - i18n Best Practices for Front-End](https://shopify.engineering/internationalization-i18n-best-practices-front-end-developers)
- [InfiniteJS - Common Mistakes When Implementing i18n in React](https://infinitejs.com/posts/common-mistakes-i18n-react)

### Tertiary (LOW confidence)
- [GitHub - jscodeshift-react-i18next](https://github.com/BartoszJarocki/jscodeshift-react-i18next) - Experimental automation tool, not recommended for production use

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - i18next-cli is official tool, react-i18next patterns well-documented
- Architecture: HIGH - Namespace organization and key naming have established best practices
- Pitfalls: MEDIUM - Based on WebSearch + official docs, but EVOQUE-specific issues may emerge

**Research date:** 2026-01-24
**Valid until:** 2026-04-24 (90 days - i18n is stable, patterns unlikely to change rapidly)

**EVOQUE-specific context:**
- Total scope: 6 pages, 20+ components, 9 requirements (TRANS-01 to TRANS-09)
- Infrastructure: Phase 4 completed (i18n configured, namespaces created, I18nProvider integrated)
- Current state: No strings translated yet, all UI text hardcoded in Portuguese
- Namespace structure: Already defined in Phase 4 (common, auth, highlights, study, session, settings, dashboard, errors)
- Key decision from STATE.md: Semantic hierarchical keys (`buttons.save` not `btnSave`)

**Next steps for planner:**
- Break work into namespace-based plans (1 plan per major namespace)
- Prioritize critical paths: auth → common → settings (most user-visible)
- Include validation steps: i18next-cli lint, manual testing per namespace
- Consider incremental approach: extract + translate + verify before moving to next namespace
