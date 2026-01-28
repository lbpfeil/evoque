# Requirements: Evoque v2.0 Design System Overhaul

**Defined:** 2026-01-27
**Core Value:** Consistencia obsessiva -- cada elemento visual identico ao equivalente em qualquer pagina. Zero surpresas visuais.
**Design Language:** Generous (Dashboard/Highlights style -- titulos grandes, espacamento generoso, containers arredondados)

## v1 Requirements

### Design Tokens (TOKENS)

- [ ] **TOKENS-01**: Escala tipografica com 6 tamanhos nomeados e regras estritas por contexto (display, title, heading, body, caption, overline)
- [ ] **TOKENS-02**: Escala de espacamento com 8 tokens semanticos em grid de 4px
- [ ] **TOKENS-03**: Escala de border-radius com exatamente 3 valores (sm, md, lg)
- [ ] **TOKENS-04**: Escala de shadows com exatamente 3 elevacoes
- [ ] **TOKENS-05**: Motion tokens -- 3 duracoes + 3 easings como CSS custom properties
- [ ] **TOKENS-06**: Escala de icones com exatamente 3 tamanhos (14px, 16px, 20px)
- [ ] **TOKENS-07**: Sistema de z-index com 7 camadas semanticas
- [ ] **TOKENS-08**: Regras de uso de cor -- banir classes raw (text-zinc-*), forcar uso semantico (text-foreground, text-muted-foreground)

### Components (COMP)

- [ ] **COMP-01**: Auditar todos os componentes shadcn e corrigir defaults para match com design system (altura de botoes, inputs, etc.)
- [ ] **COMP-02**: Criar componente PageHeader -- template canonico de layout de pagina
- [ ] **COMP-03**: Criar padrao de data table padronizado -- estrutura de tabela reutilizavel unica
- [ ] **COMP-04**: Ajustar variantes CVA dos componentes (Button, Input, Badge, Card) para refletir tokens

### Page Migration (PAGE)

- [x] **PAGE-01**: Migrar Dashboard para padroes canonicos (tokens, PageHeader, estilo Generous)
- [x] **PAGE-02**: Migrar Highlights para padroes canonicos
- [x] **PAGE-03**: Migrar Study para padroes canonicos
- [x] **PAGE-04**: Migrar StudySession para padroes canonicos (preservar fonte serif e desvios intencionais)
- [x] **PAGE-05**: Migrar BookDetails para padroes canonicos
- [x] **PAGE-06**: Migrar Settings para padroes canonicos
- [x] **PAGE-07**: Migrar Login para padroes canonicos
- [x] **PAGE-08**: Padronizar todos os modais e popovers para padroes consistentes

### Documentation (DOC)

- [x] **DOC-01**: Criar guia de design system enxuto (documento unico: tokens + uso de componentes + padroes de pagina)
- [x] **DOC-02**: Substituir/atualizar compact-ui-design-guidelines.md existente com guia atualizado

## v2 Requirements

### Enforcement (ENFORCE)

- **ENFORCE-01**: ESLint com eslint-plugin-tailwindcss e regra no-arbitrary-value para banir valores arbitrarios
- **ENFORCE-02**: Restricao do tailwind.config.js (theme.fontSize override) para expor apenas tokens permitidos
- **ENFORCE-03**: Extensao do tailwind-merge para reconhecer classes de font-size customizadas

### Advanced Patterns (ADV)

- **ADV-01**: Interactive state matrix -- todos os estados definidos para cada elemento interativo
- **ADV-02**: Empty state pattern -- template canonico para estados vazios
- **ADV-03**: Density context system para excecoes (Study compacto vs Dashboard generoso)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Storybook | Desnecessario para developer solo -- guia markdown e suficiente |
| W3C Design Tokens | Over-engineering para 7 paginas |
| Tailwind v4 migration | Risco desnecessario -- v3 atende perfeitamente |
| @tailwindcss/typography | App e data-dense, nao content-heavy |
| Responsive typography com clamp() | Tamanhos fixos sao apropriados para app data-dense |
| Token pipeline automation | Manual e suficiente para este tamanho de projeto |
| Redesign da estetica | Warm/friendly ja definido no v1.0 -- foco e consistencia |
| Novas features funcionais | Escopo e visual/padroes, nao funcionalidades |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TOKENS-01 | Phase 4 | Complete |
| TOKENS-02 | Phase 4 | Complete |
| TOKENS-03 | Phase 4 | Complete |
| TOKENS-04 | Phase 4 | Complete |
| TOKENS-05 | Phase 4 | Complete |
| TOKENS-06 | Phase 4 | Complete |
| TOKENS-07 | Phase 4 | Complete |
| TOKENS-08 | Phase 4 | Complete |
| COMP-01 | Phase 5 | Complete |
| COMP-02 | Phase 5 | Complete |
| COMP-03 | Phase 5 | Complete |
| COMP-04 | Phase 5 | Complete |
| PAGE-01 | Phase 6 | Complete |
| PAGE-02 | Phase 6 | Complete |
| PAGE-03 | Phase 6 | Complete |
| PAGE-04 | Phase 6 | Complete |
| PAGE-05 | Phase 6 | Complete |
| PAGE-06 | Phase 6 | Complete |
| PAGE-07 | Phase 6 | Complete |
| PAGE-08 | Phase 6 | Complete |
| DOC-01 | Phase 7 | Complete |
| DOC-02 | Phase 7 | Complete |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0

---
*Requirements defined: 2026-01-27*
*Last updated: 2026-01-27 -- traceability mapped to phases 4-7*
