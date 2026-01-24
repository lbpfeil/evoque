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
| INFRA-01 | TBD | Pending |
| INFRA-02 | TBD | Pending |
| INFRA-03 | TBD | Pending |
| INFRA-04 | TBD | Pending |
| TRANS-01 | TBD | Pending |
| TRANS-02 | TBD | Pending |
| TRANS-03 | TBD | Pending |
| TRANS-04 | TBD | Pending |
| TRANS-05 | TBD | Pending |
| TRANS-06 | TBD | Pending |
| TRANS-07 | TBD | Pending |
| TRANS-08 | TBD | Pending |
| TRANS-09 | TBD | Pending |
| FMT-01 | TBD | Pending |
| FMT-02 | TBD | Pending |
| FMT-03 | TBD | Pending |
| LANG-01 | TBD | Pending |
| LANG-02 | TBD | Pending |
| LANG-03 | TBD | Pending |
| EN-01 | TBD | Pending |
| EN-02 | TBD | Pending |

**Coverage:**
- v1.1 requirements: 21 total
- Mapped to phases: 0 (pending roadmap)
- Unmapped: 21

---
*Requirements defined: 2026-01-24*
*Last updated: 2026-01-24 after initial definition*
