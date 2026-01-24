# Roadmap: Evoque v1.1 Internationalization

**Created:** 2026-01-24
**Milestone:** v1.1 Internationalization
**Phases:** 4 (continuing from v1.0)
**Requirements:** 21 mapped
**Depth:** Quick

## Phase Overview

| # | Phase | Goal | Requirements |
|---|-------|------|--------------|
| 4 | Foundation | i18n infrastructure ready for string extraction | INFRA-01, INFRA-02, INFRA-03, INFRA-04 |
| 5 | String Extraction | All UI strings translated to PT-BR | TRANS-01, TRANS-02, TRANS-03, TRANS-04, TRANS-05, TRANS-06, TRANS-07, TRANS-08, TRANS-09 |
| 6 | Language Switching | Users can toggle between PT-BR and EN | LANG-01, LANG-02, LANG-03, EN-01, EN-02 |
| 7 | Localization | Dates/numbers formatted per locale | FMT-01, FMT-02, FMT-03 |

## Phase Details

### Phase 4: Foundation

**Goal:** i18n infrastructure ready for string extraction

**Dependencies:** None (starts after v1.0 UI Overhaul completion)

**Requirements:**
- INFRA-01: Sistema i18n configurado com react-i18next
- INFRA-02: Arquivos de tradução organizados por namespace (common, study, highlights, settings, etc.)
- INFRA-03: I18nProvider integrado na árvore de componentes
- INFRA-04: Idioma padrão configurado como PT-BR

**Success Criteria:**
1. User opens app and i18next initializes with PT-BR as default language
2. Translation files organized in `public/locales/pt-BR/` with namespaces (common, auth, highlights, study, session, settings, dashboard, errors)
3. I18nProvider renders in component tree below AuthProvider without errors
4. Developer can import `useTranslation` hook and call `t('common:test')` successfully

**Research Flags:** None (patterns well-documented)

**Plans:** 2 plans

Plans:
- [x] 04-01-PLAN.md — Install i18n dependencies and create PT-BR translation file structure
- [x] 04-02-PLAN.md — Configure i18next, create I18nProvider, integrate into App.tsx

---

### Phase 5: String Extraction

**Goal:** All UI strings translated to PT-BR

**Dependencies:** Phase 4 (requires i18n infrastructure)

**Requirements:**
- TRANS-01: Todas as strings da Sidebar traduzidas
- TRANS-02: Todas as strings do Dashboard traduzidas
- TRANS-03: Todas as strings da página Highlights traduzidas
- TRANS-04: Todas as strings da página Study traduzidas
- TRANS-05: Todas as strings da página StudySession traduzidas
- TRANS-06: Todas as strings da página Settings traduzidas
- TRANS-07: Todas as strings da página Login traduzidas
- TRANS-08: Todas as strings de modais e popovers traduzidas
- TRANS-09: Todas as mensagens de erro e validação traduzidas

**Success Criteria:**
1. User navigates through all pages (Dashboard, Highlights, Study, StudySession, Settings, Login) and sees Portuguese text
2. User triggers validation errors (invalid email, missing fields) and sees Portuguese error messages
3. User opens all modals (EditHighlightModal, ConfirmDeleteModal, etc.) and sees Portuguese labels/buttons
4. Developer runs grep for hardcoded strings and finds no remaining English text in JSX/components
5. No console warnings about missing translation keys

**Research Flags:** Medium (automation tools for detection)

**Plans:** (created by /gsd:plan-phase)

Plans:
- [ ] TBD — awaiting planning

---

### Phase 6: Language Switching

**Goal:** Users can toggle between PT-BR and EN

**Dependencies:** Phase 5 (requires PT-BR strings extracted)

**Requirements:**
- LANG-01: Seletor de idioma na página Settings
- LANG-02: Preferência de idioma persistida em localStorage
- LANG-03: Idioma aplicado após reload da página
- EN-01: Arquivo de tradução EN completo (fallback)
- EN-02: Todas as strings traduzidas para inglês

**Success Criteria:**
1. User opens Settings page and sees language selector (radio buttons or dropdown) with PT-BR and English options
2. User switches from PT-BR to EN and entire UI updates immediately without page reload
3. User reloads browser and selected language persists (reads from localStorage)
4. User clears localStorage and app defaults to PT-BR
5. Developer inspects translation files and confirms all PT-BR keys exist in EN with proper translations

**Research Flags:** None (standard patterns)

**Plans:** (created by /gsd:plan-phase)

Plans:
- [ ] TBD — awaiting planning

---

### Phase 7: Localization

**Goal:** Dates/numbers formatted per locale

**Dependencies:** Phase 6 (requires language switching functional)

**Requirements:**
- FMT-01: Datas formatadas conforme locale (DD/MM/YYYY para PT-BR)
- FMT-02: Números formatados conforme locale (1.234,56 para PT-BR)
- FMT-03: Pluralização correta (1 cartão vs 5 cartões)

**Success Criteria:**
1. User views StudySession with PT-BR selected and sees dates formatted as "24/01/2026"
2. User switches to EN and sees dates formatted as "01/24/2026"
3. User views Dashboard statistics with PT-BR and sees numbers as "1.234,56"
4. User switches to EN and sees numbers as "1,234.56"
5. User views daily review limits and sees correct plural forms ("1 cartão" in PT-BR, "1 card" in EN, "5 cartões" in PT-BR, "5 cards" in EN)

**Research Flags:** None (Intl API patterns established)

**Plans:** (created by /gsd:plan-phase)

Plans:
- [ ] TBD — awaiting planning

---

## Coverage Validation

All v1.1 requirements mapped:

- Infrastructure: 4/4 (Phase 4)
- Translation: 9/9 (Phase 5)
- Formatting: 3/3 (Phase 7)
- Language Selection: 3/3 (Phase 6)
- English Support: 2/2 (Phase 6)

**Total: 21/21**

## Progress

| Phase | Status | Plans | Completed |
|-------|--------|-------|-----------|
| 4 - Foundation | ✓ Complete | 2/2 | 100% |
| 5 - String Extraction | Pending | 0/0 | 0% |
| 6 - Language Switching | Pending | 0/0 | 0% |
| 7 - Localization | Pending | 0/0 | 0% |

**Overall:** 1/4 phases complete (25%)

---

*Roadmap created: 2026-01-24*
*Phase 4 planned: 2026-01-24*
*Phase 4 complete: 2026-01-24*
*Next: `/gsd:plan-phase 5`*
