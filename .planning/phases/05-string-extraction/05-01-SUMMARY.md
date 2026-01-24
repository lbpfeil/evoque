# Phase 05 Plan 01: Login and Auth Strings Summary

---
phase: 05-string-extraction
plan: 01
subsystem: authentication
tags: [i18n, react-i18next, login, auth]

dependency-graph:
  requires:
    - 04-02 (i18n configuration)
  provides:
    - Login page with full i18n support
    - auth namespace translations
  affects:
    - 05-09 (errors namespace may extend)

tech-stack:
  patterns:
    - useTranslation hook pattern
    - Namespace-based translations

file-tracking:
  key-files:
    modified:
      - pages/Login.tsx
      - public/locales/pt-BR/auth.json

decisions:
  - key: auth-namespace-structure
    choice: Separate login/signup/errors namespaces within auth.json
    rationale: Clearer organization, easier to extend

metrics:
  duration: 3 minutes
  completed: 2026-01-24
---

## One-liner
Login page fully internationalized with 12 translation keys using react-i18next useTranslation hook

## What Was Done

### Task 1: Add useTranslation hook to Login.tsx
- Imported `useTranslation` from react-i18next
- Added `const { t } = useTranslation('auth')` hook call
- Replaced 9 hardcoded Portuguese strings with t() calls:
  - Title: `t('signup.title')` / `t('login.title')`
  - Labels: `t('login.email')`, `t('login.password')`
  - Placeholder: `t('login.emailPlaceholder')`
  - Submit button: `t('signup.submit')` / `t('login.submit')`
  - Toggle links: `t('signup.hasAccount')` / `t('login.noAccount')`
  - Footer: `t('login.dataProtected')`
  - Messages: `t('signup.verifyEmail')`, `t('errors.generic')`

### Task 2: Update auth.json with all keys
Updated public/locales/pt-BR/auth.json with complete key structure:
- `login.*` - 7 keys for login form
- `signup.*` - 4 keys for signup form
- `errors.*` - 1 key for generic error

## Key Translation Keys

| Key | Portuguese Value |
|-----|------------------|
| login.title | Entrar |
| login.email | Email |
| login.password | Senha |
| login.emailPlaceholder | seu@email.com |
| login.submit | Entrar |
| login.noAccount | Nao tem conta? Criar agora |
| login.dataProtected | Seus dados sao protegidos e criptografados |
| signup.title | Criar Conta |
| signup.submit | Criar Conta |
| signup.hasAccount | Ja tem uma conta? Entrar |
| signup.verifyEmail | Verifique seu email para confirmar o cadastro! |
| errors.generic | Erro ao autenticar |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 314cdfe | feat | add useTranslation hook to Login page |
| f50d004 | feat | update auth.json with all Login page keys |

## Verification Results

- [x] Login page displays all text in Portuguese
- [x] No console warnings about missing translation keys (build passes)
- [x] Both login and signup modes use correct translations
- [x] Error messages use t('errors.generic') fallback
- [x] auth.json contains all 12 keys referenced in Login.tsx
- [x] No hardcoded Portuguese strings remaining in Login.tsx JSX

## Deviations from Plan

None - plan executed exactly as written.

## Pattern Established

This plan establishes the standard pattern for all subsequent string extraction:

```typescript
// 1. Import at top
import { useTranslation } from 'react-i18next';

// 2. Hook call in component
const { t } = useTranslation('namespace');

// 3. Replace strings
<label>{t('key.path')}</label>
```

## Next Phase Readiness

Ready for:
- Plan 05-02: Sidebar and Common strings (Wave 1 parallel)
- Plan 05-03: Dashboard strings (Wave 2)
