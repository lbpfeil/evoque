# Requirements: Evoque v2.0 Design System Overhaul

**Defined:** 2026-01-27
**Core Value:** Consistência obsessiva — cada elemento visual idêntico ao equivalente em qualquer página. Zero surpresas visuais.
**Design Language:** Generous (Dashboard/Highlights style — títulos grandes, espaçamento generoso, containers arredondados)

## v1 Requirements

### Design Tokens (TOKENS)

- [ ] **TOKENS-01**: Escala tipográfica com 6 tamanhos nomeados e regras estritas por contexto (display, title, heading, body, caption, overline)
- [ ] **TOKENS-02**: Escala de espaçamento com 8 tokens semânticos em grid de 4px
- [ ] **TOKENS-03**: Escala de border-radius com exatamente 3 valores (sm, md, lg)
- [ ] **TOKENS-04**: Escala de shadows com exatamente 3 elevações
- [ ] **TOKENS-05**: Motion tokens — 3 durações + 3 easings como CSS custom properties
- [ ] **TOKENS-06**: Escala de ícones com exatamente 3 tamanhos (14px, 16px, 20px)
- [ ] **TOKENS-07**: Sistema de z-index com 7 camadas semânticas
- [ ] **TOKENS-08**: Regras de uso de cor — banir classes raw (text-zinc-*), forçar uso semântico (text-foreground, text-muted-foreground)

### Components (COMP)

- [ ] **COMP-01**: Auditar todos os componentes shadcn e corrigir defaults para match com design system (altura de botões, inputs, etc.)
- [ ] **COMP-02**: Criar componente PageHeader — template canônico de layout de página
- [ ] **COMP-03**: Criar padrão de data table padronizado — estrutura de tabela reutilizável única
- [ ] **COMP-04**: Ajustar variantes CVA dos componentes (Button, Input, Badge, Card) para refletir tokens

### Page Migration (PAGE)

- [ ] **PAGE-01**: Migrar Dashboard para padrões canônicos (tokens, PageHeader, estilo Generous)
- [ ] **PAGE-02**: Migrar Highlights para padrões canônicos
- [ ] **PAGE-03**: Migrar Study para padrões canônicos
- [ ] **PAGE-04**: Migrar StudySession para padrões canônicos (preservar fonte serif e desvios intencionais)
- [ ] **PAGE-05**: Migrar BookDetails para padrões canônicos
- [ ] **PAGE-06**: Migrar Settings para padrões canônicos
- [ ] **PAGE-07**: Migrar Login para padrões canônicos
- [ ] **PAGE-08**: Padronizar todos os modais e popovers para padrões consistentes

### Documentation (DOC)

- [ ] **DOC-01**: Criar guia de design system enxuto (documento único: tokens + uso de componentes + padrões de página)
- [ ] **DOC-02**: Substituir/atualizar compact-ui-design-guidelines.md existente com guia atualizado

## v2 Requirements

### Enforcement (ENFORCE)

- **ENFORCE-01**: ESLint com eslint-plugin-tailwindcss e regra no-arbitrary-value para banir valores arbitrários
- **ENFORCE-02**: Restrição do tailwind.config.js (theme.fontSize override) para expor apenas tokens permitidos
- **ENFORCE-03**: Extensão do tailwind-merge para reconhecer classes de font-size customizadas

### Advanced Patterns (ADV)

- **ADV-01**: Interactive state matrix — todos os estados definidos para cada elemento interativo
- **ADV-02**: Empty state pattern — template canônico para estados vazios
- **ADV-03**: Density context system para exceções (Study compacto vs Dashboard generoso)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Storybook | Desnecessário para developer solo — guia markdown é suficiente |
| W3C Design Tokens | Over-engineering para 7 páginas |
| Tailwind v4 migration | Risco desnecessário — v3 atende perfeitamente |
| @tailwindcss/typography | App é data-dense, não content-heavy |
| Responsive typography com clamp() | Tamanhos fixos são apropriados para app data-dense |
| Token pipeline automation | Manual é suficiente para este tamanho de projeto |
| Redesign da estética | Warm/friendly já definido no v1.0 — foco é consistência |
| Novas features funcionais | Escopo é visual/padrões, não funcionalidades |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TOKENS-01 | TBD | Pending |
| TOKENS-02 | TBD | Pending |
| TOKENS-03 | TBD | Pending |
| TOKENS-04 | TBD | Pending |
| TOKENS-05 | TBD | Pending |
| TOKENS-06 | TBD | Pending |
| TOKENS-07 | TBD | Pending |
| TOKENS-08 | TBD | Pending |
| COMP-01 | TBD | Pending |
| COMP-02 | TBD | Pending |
| COMP-03 | TBD | Pending |
| COMP-04 | TBD | Pending |
| PAGE-01 | TBD | Pending |
| PAGE-02 | TBD | Pending |
| PAGE-03 | TBD | Pending |
| PAGE-04 | TBD | Pending |
| PAGE-05 | TBD | Pending |
| PAGE-06 | TBD | Pending |
| PAGE-07 | TBD | Pending |
| PAGE-08 | TBD | Pending |
| DOC-01 | TBD | Pending |
| DOC-02 | TBD | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 0 (awaiting roadmap)
- Unmapped: 22

---
*Requirements defined: 2026-01-27*
*Last updated: 2026-01-27 after initial definition*
