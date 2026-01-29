# Requirements: Evoque v3.0

**Defined:** 2026-01-29
**Core Value:** Revisão eficiente de highlights — ajudar usuários a reter conhecimento dos livros que leem através de repetição espaçada (SM-2).

## v1 Requirements

Requirements for v3.0 release. Each maps to roadmap phases.

### Quick Fixes

- [ ] **FIX-01**: Badge "Aprendendo" tem contraste adequado contra o fundo do botão
- [ ] **FIX-02**: Título e autor dos livros na tabela Study têm tamanho legível
- [ ] **FIX-03**: Heatmap é mais largo e círculos são maiores
- [ ] **FIX-04**: Heatmap conta datas corretamente (fix timezone bug)
- [ ] **FIX-05**: Ícones da sidebar ficam centralizados quando retraída
- [ ] **FIX-06**: Favicon atualizado para novo design (favicon-evq)
- [ ] **FIX-07**: Páginas de Settings têm largura mais estreita
- [ ] **FIX-08**: Arquivo hooks/useTheme.ts removido (não usado)

### StudySession UX

- [ ] **STUDY-01**: Capa do livro é exibida em tamanho maior
- [ ] **STUDY-02**: Botão "Voltar aos decks" é uma seta com cor primária
- [ ] **STUDY-03**: Botões de editar destaque e nota são padronizados (mesmo estilo)
- [ ] **STUDY-04**: Edição de destaque/nota é inline clean (mesma fonte, tamanho, posição)

### Dashboard

- [ ] **DASH-01**: Dashboard é a página inicial após login
- [ ] **DASH-02**: Dashboard tem atalho proeminente para iniciar estudo
- [ ] **DASH-03**: Dashboard exibe KPIs inteligentes (livro mais revisado, tempo médio, etc)
- [ ] **DASH-04**: Heatmap de atividade é exibido no Dashboard com design melhorado

### Analytics

- [ ] **ANLYT-01**: Tempo gasto em cada card é registrado em review_logs (duration_ms)
- [ ] **ANLYT-02**: Dashboard mostra métrica de tempo médio de revisão por livro
- [ ] **ANLYT-03**: Dashboard mostra ranking de livros mais revisados

### Auth

- [ ] **AUTH-01**: Usuário pode resetar senha via link enviado por email
- [ ] **AUTH-02**: Usuário pode fazer login com conta Google
- [ ] **AUTH-03**: Usuário logado pode alterar senha nas configurações

### Settings Audit

- [ ] **SETT-01**: Lógica de Opções de Estudo está validada e funcionando corretamente
- [ ] **SETT-02**: Limites diários de revisão por livro funcionam conforme esperado
- [ ] **SETT-03**: Testes automatizados cobrem funcionalidades críticas de Settings

### Landing Page

- [ ] **LAND-01**: Landing page tem hero section com título chamativo e CTA de cadastro
- [ ] **LAND-02**: Landing page mostra principais funcionalidades do app
- [ ] **LAND-03**: Landing page tem footer com links (contato, termos, privacidade)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Social

- **SOCL-01**: Landing page tem seção de testimonials/social proof
- **SOCL-02**: Usuário pode compartilhar estatísticas de estudo

### Auth Extended

- **AUTH-04**: Login com Apple
- **AUTH-05**: Login com GitHub

### Export

- **EXPRT-01**: Usuário pode exportar highlights como JSON
- **EXPRT-02**: Usuário pode exportar highlights como CSV

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Parsers de importação | Já funcionam, não mexer |
| Lógica SM-2 | Já funciona, algoritmo estável |
| OAuth além de Google | Google cobre 90% dos usuários |
| Mobile app nativo | Web-first, PWA já funciona |
| Redesign estético | warm/friendly definido no v1.0 |
| Real-time sync | Complexidade desnecessária para app single-user |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FIX-01 | Phase 1 | Pending |
| FIX-02 | Phase 1 | Pending |
| FIX-03 | Phase 1 | Pending |
| FIX-04 | Phase 1 | Pending |
| FIX-05 | Phase 1 | Pending |
| FIX-06 | Phase 1 | Pending |
| FIX-07 | Phase 1 | Pending |
| FIX-08 | Phase 1 | Pending |
| STUDY-01 | Phase 2 | Pending |
| STUDY-02 | Phase 2 | Pending |
| STUDY-03 | Phase 2 | Pending |
| STUDY-04 | Phase 2 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 3 | Pending |
| DASH-03 | Phase 3 | Pending |
| DASH-04 | Phase 3 | Pending |
| ANLYT-01 | Phase 3 | Pending |
| ANLYT-02 | Phase 3 | Pending |
| ANLYT-03 | Phase 3 | Pending |
| SETT-01 | Phase 4 | Pending |
| SETT-02 | Phase 4 | Pending |
| SETT-03 | Phase 4 | Pending |
| AUTH-01 | Phase 5 | Pending |
| AUTH-02 | Phase 5 | Pending |
| AUTH-03 | Phase 5 | Pending |
| LAND-01 | Phase 6 | Pending |
| LAND-02 | Phase 6 | Pending |
| LAND-03 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-29*
*Last updated: 2026-01-29 after initial definition*
