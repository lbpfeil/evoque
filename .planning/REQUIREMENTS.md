# Requirements: Revision v4.0

**Defined:** 2026-02-03
**Core Value:** Revisão eficiente de highlights — ajudar usuários a reter conhecimento dos livros que leem através de repetição espaçada (SM-2).

## v1 Requirements

Requirements for v4.0 release. Each maps to roadmap phases.

### Performance

- [x] **PERF-01**: Páginas são carregadas via lazy loading (code splitting por rota)
- [x] **PERF-02**: Dashboard exibe skeleton loader enquanto dados carregam
- [x] **PERF-03**: Highlights exibe skeleton loader enquanto dados carregam
- [x] **PERF-04**: Modais pesados (OCR, TagManager) são carregados via lazy loading
- [x] **PERF-05**: Rotas adjacentes são pré-carregadas no hover de links de navegação

### Service Worker

- [x] **SW-01**: PWA migrada para estratégia injectManifest (custom service worker)
- [x] **SW-02**: Funcionalidade offline existente preservada após migração

### Push Notifications

- [ ] **PUSH-01**: Usuário pode habilitar notificações com fluxo de permissão suave (soft ask)
- [ ] **PUSH-02**: Usuário recebe lembrete diário em horário configurável (default 18:00)
- [ ] **PUSH-03**: Notificação diária mostra contagem de cards pendentes
- [ ] **PUSH-04**: Usuário recebe alerta de streak quando está prestes a quebrar sequência
- [ ] **PUSH-05**: Usuário recebe resumo semanal com estatísticas
- [ ] **PUSH-06**: Configurações de notificação disponíveis na página Settings
- [ ] **PUSH-07**: Badge count atualizado no ícone PWA com cards pendentes

### OCR Infrastructure

- [ ] **OCR-01**: Usuário pode acessar importação de livro físico via Settings
- [ ] **OCR-02**: Usuário pode selecionar livro existente ou criar novo para importação
- [ ] **OCR-03**: Câmera abre para captura de fotos (com fallback para file picker)
- [ ] **OCR-04**: Usuário pode capturar múltiplas fotos em batch
- [ ] **OCR-05**: Texto é extraído das fotos via Tesseract.js
- [ ] **OCR-06**: Usuário pode revisar e editar texto extraído antes de salvar

### OCR Enhancement

- [ ] **OCR-07**: Sistema detecta automaticamente texto marcado com marca-texto amarelo
- [ ] **OCR-08**: Sistema detecta automaticamente texto marcado com marca-texto verde
- [ ] **OCR-09**: Sistema detecta automaticamente texto marcado com marca-texto rosa
- [ ] **OCR-10**: Preview dos highlights detectados antes de confirmar importação

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### OCR Advanced

- **OCR-11**: Detecção de número de página das fotos
- **OCR-12**: Reconhecimento de capa/código de barras para metadata automático
- **OCR-13**: Reconhecimento de escrita à mão (além de texto impresso)
- **OCR-14**: Auto-detecção de idioma do texto

### Notifications Advanced

- **PUSH-08**: Timing inteligente baseado em padrões de estudo do usuário
- **PUSH-09**: Notificação por email como fallback para iOS/EU
- **PUSH-10**: Centro de notificações in-app

### Performance Advanced

- **PERF-06**: Virtualização de lista de highlights (para bibliotecas muito grandes)
- **PERF-07**: Service worker com cache inteligente de dados

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Firebase Cloud Messaging | Conflita com service worker existente; usar Web Push nativo |
| Google Vision API | Custo por uso; client-side OCR é suficiente para texto impresso |
| Seleção manual de texto em fotos | Detecção por cor é mais intuitiva |
| Notificação por email | Push nativo é suficiente para v4.0 |
| StoreContext refactoring | Complexo demais; criar contextos isolados para novas features |
| Handwriting recognition | Significativamente mais difícil que texto impresso |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PERF-01 | Phase 17 | Complete |
| PERF-02 | Phase 17 | Complete |
| PERF-03 | Phase 17 | Complete |
| PERF-04 | Phase 17 | Complete |
| PERF-05 | Phase 17 | Complete |
| SW-01 | Phase 17 | Complete |
| SW-02 | Phase 17 | Complete |
| PUSH-01 | Phase 18 | Pending |
| PUSH-02 | Phase 18 | Pending |
| PUSH-03 | Phase 18 | Pending |
| PUSH-04 | Phase 18 | Pending |
| PUSH-05 | Phase 18 | Pending |
| PUSH-06 | Phase 18 | Pending |
| PUSH-07 | Phase 18 | Pending |
| OCR-01 | Phase 19 | Pending |
| OCR-02 | Phase 19 | Pending |
| OCR-03 | Phase 19 | Pending |
| OCR-04 | Phase 19 | Pending |
| OCR-05 | Phase 19 | Pending |
| OCR-06 | Phase 19 | Pending |
| OCR-07 | Phase 20 | Pending |
| OCR-08 | Phase 20 | Pending |
| OCR-09 | Phase 20 | Pending |
| OCR-10 | Phase 20 | Pending |

**Coverage:**
- v1 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-03*
*Last updated: 2026-02-03 after initial definition*
