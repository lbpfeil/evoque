# Requirements: Evoque v1.1 Internationalization

**Defined:** 2026-01-24
**Core Value:** Experiência de estudo fluida e sem fricção

## v1.1 Requirements

Requirements for internationalization milestone. Each maps to roadmap phases.

### Infrastructure

- [ ] **INFRA-01**: Sistema i18n configurado com react-i18next
- [ ] **INFRA-02**: Arquivos de tradução organizados por namespace (common, study, highlights, settings, etc.)
- [ ] **INFRA-03**: I18nProvider integrado na árvore de componentes
- [ ] **INFRA-04**: Idioma padrão configurado como PT-BR

### Translation

- [ ] **TRANS-01**: Todas as strings da Sidebar traduzidas
- [ ] **TRANS-02**: Todas as strings do Dashboard traduzidas
- [ ] **TRANS-03**: Todas as strings da página Highlights traduzidas
- [ ] **TRANS-04**: Todas as strings da página Study traduzidas
- [ ] **TRANS-05**: Todas as strings da página StudySession traduzidas
- [ ] **TRANS-06**: Todas as strings da página Settings traduzidas
- [ ] **TRANS-07**: Todas as strings da página Login traduzidas
- [ ] **TRANS-08**: Todas as strings de modais e popovers traduzidas
- [ ] **TRANS-09**: Todas as mensagens de erro e validação traduzidas

### Formatting

- [ ] **FMT-01**: Datas formatadas conforme locale (DD/MM/YYYY para PT-BR)
- [ ] **FMT-02**: Números formatados conforme locale (1.234,56 para PT-BR)
- [ ] **FMT-03**: Pluralização correta (1 cartão vs 5 cartões)

### Language Selection

- [ ] **LANG-01**: Seletor de idioma na página Settings
- [ ] **LANG-02**: Preferência de idioma persistida em localStorage
- [ ] **LANG-03**: Idioma aplicado após reload da página

### English Support

- [ ] **EN-01**: Arquivo de tradução EN completo (fallback)
- [ ] **EN-02**: Todas as strings traduzidas para inglês

## Future Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Enhanced UX

- **UX-01**: Dynamic language switching sem reload
- **UX-02**: Browser language detection na primeira visita
- **UX-03**: Sincronização de preferência de idioma com Supabase

### Advanced

- **ADV-01**: RTL layout support (para árabe/hebraico)
- **ADV-02**: Integração com Crowdin/Lokalise
- **ADV-03**: Lazy loading de traduções por namespace

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Tradução de conteúdo do usuário (highlights, notas) | Conteúdo do usuário permanece no idioma original |
| Mais de 2 idiomas | PT-BR e EN são suficientes para MVP |
| Parsers de importação | Já funcionam, não mexer |
| Backend/Supabase changes | Não é escopo deste milestone |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 4 | Pending |
| INFRA-02 | Phase 4 | Pending |
| INFRA-03 | Phase 4 | Pending |
| INFRA-04 | Phase 4 | Pending |
| TRANS-01 | Phase 5 | Pending |
| TRANS-02 | Phase 5 | Pending |
| TRANS-03 | Phase 5 | Pending |
| TRANS-04 | Phase 5 | Pending |
| TRANS-05 | Phase 5 | Pending |
| TRANS-06 | Phase 5 | Pending |
| TRANS-07 | Phase 5 | Pending |
| TRANS-08 | Phase 5 | Pending |
| TRANS-09 | Phase 5 | Pending |
| FMT-01 | Phase 7 | Pending |
| FMT-02 | Phase 7 | Pending |
| FMT-03 | Phase 7 | Pending |
| LANG-01 | Phase 6 | Pending |
| LANG-02 | Phase 6 | Pending |
| LANG-03 | Phase 6 | Pending |
| EN-01 | Phase 6 | Pending |
| EN-02 | Phase 6 | Pending |

**Coverage:**
- v1.1 requirements: 21 total
- Mapped to phases: 21/21 ✓
- Unmapped: 0

---
*Requirements defined: 2026-01-24*
*Last updated: 2026-01-24 after roadmap creation*
