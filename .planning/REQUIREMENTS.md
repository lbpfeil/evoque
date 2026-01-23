# Requirements: Evoque UI Overhaul

**Defined:** 2026-01-19
**Core Value:** Sistema de temas funcionando perfeitamente em light/dark mode

## v1 Requirements

Requirements para o redesign. Cada um mapeia para fases do roadmap.

### Foundation

- [ ] **FOUND-01**: Corrigir mismatch HSL/OKLCH no tailwind.config.js
- [ ] **FOUND-02**: Criar ThemeProvider com state management centralizado
- [ ] **FOUND-03**: Implementar toggle de tema funcional
- [ ] **FOUND-04**: Persistir preferencia de tema no localStorage
- [ ] **FOUND-05**: Detectar preferencia do sistema (prefers-color-scheme)
- [ ] **FOUND-06**: Adicionar script anti-FOUC no index.html
- [ ] **FOUND-07**: Consolidar blocos `@layer base` duplicados no CSS

### Color System

- [ ] **COLOR-01**: Aplicar paleta warm (stone com tint ambar) nas CSS variables light
- [ ] **COLOR-02**: Aplicar paleta warm nas CSS variables dark (menos saturada)
- [ ] **COLOR-03**: Substituir cores hardcoded em App.tsx por tokens semanticos
- [x] **COLOR-04**: Auditar e substituir cores hardcoded em todos os componentes
- [ ] **COLOR-05**: Aumentar border-radius global de 0.45rem para 0.75rem

### Components

- [ ] **COMP-01**: Instalar shadcn components (card, tabs, badge, select, checkbox, switch, tooltip, scroll-area, dropdown-menu)
- [ ] **COMP-02**: Criar ModeToggle component na Sidebar
- [x] **COMP-03**: Aplicar transicoes basicas (150-300ms) em elementos interativos
- [x] **COMP-04**: Refinar hover states com feedback visual consistente

### Pages - General

- [x] **PAGE-01**: Modernizar Dashboard.tsx com shadcn components
- [x] **PAGE-02**: Modernizar Highlights.tsx com shadcn components
- [x] **PAGE-03**: ~~Modernizar BookDetails.tsx com shadcn components~~ **OBSOLETE** - BookDetails.tsx was removed from codebase (see TECHNICAL_CONTEXT.md)
- [x] **PAGE-04**: Modernizar Settings.tsx com shadcn components (nao tocar parsers)
- [x] **PAGE-05**: Modernizar Login.tsx com shadcn components
- [x] **PAGE-06**: Modernizar Sidebar.tsx com theme toggle

### Pages - Critical (participacao do usuario)

- [x] **CRIT-01**: Modernizar Study.tsx (cada decisao aprovada pelo usuario)
- [x] **CRIT-02**: Modernizar StudySession.tsx (cada decisao aprovada, preservar fonte serif)

### Modals & Popovers

- [x] **MODAL-01**: Padronizar DeleteCardPopover com shadcn patterns
- [x] **MODAL-02**: Padronizar DeleteBookModal com shadcn Dialog
- [x] **MODAL-03**: Padronizar EmptyDeckPopover com shadcn patterns
- [x] **MODAL-04**: Padronizar HighlightEditModal com shadcn Dialog
- [x] **MODAL-05**: Padronizar HighlightHistoryModal com shadcn Dialog
- [x] **MODAL-06**: Padronizar BookContextModal com shadcn Dialog

## v2 Requirements

Deferred para release futura. Nao no roadmap atual.

### Enhanced Polish

- **POLISH-01**: Sombras com tint quente (nao cinza puro)
- **POLISH-02**: Animacoes de sucesso (confetti, checkmarks animados)
- **POLISH-03**: Empty states com ilustracoes friendly
- **POLISH-04**: Chart colors refinados para paleta warm
- **POLISH-05**: Skeleton loaders com animacao suave

## Out of Scope

| Feature | Reason |
|---------|--------|
| Parsers de importacao | Ja funcionam, nao mexer |
| Logica SM-2 | Ja funciona, nao e escopo visual |
| Backend/Supabase | Nao e escopo deste projeto |
| Novas features | Foco e visual/UX, nao funcionalidades |
| Framer Motion | Overkill para polish essencial |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| FOUND-05 | Phase 1 | Complete |
| FOUND-06 | Phase 1 | Complete |
| FOUND-07 | Phase 1 | Complete |
| COLOR-01 | Phase 1 | Complete |
| COLOR-02 | Phase 1 | Complete |
| COLOR-03 | Phase 1 | **Pre-completed** (App.tsx already uses semantic tokens) |
| COLOR-04 | Phase 2 | Complete |
| COLOR-05 | Phase 1 | Complete |
| COMP-01 | Phase 1 | Complete |
| COMP-02 | Phase 1 | Complete |
| COMP-03 | Phase 2 | Complete |
| COMP-04 | Phase 2 | Complete |
| PAGE-01 | Phase 2 | Complete |
| PAGE-02 | Phase 2 | Complete |
| PAGE-03 | N/A | **OBSOLETE** (file removed) |
| PAGE-04 | Phase 2 | Complete |
| PAGE-05 | Phase 2 | Complete |
| PAGE-06 | Phase 1 | Complete |
| CRIT-01 | Phase 3 | Complete |
| CRIT-02 | Phase 3 | Complete |
| MODAL-01 | Phase 2 | Complete |
| MODAL-02 | Phase 2 | Complete |
| MODAL-03 | Phase 2 | Complete |
| MODAL-04 | Phase 2 | Complete |
| MODAL-05 | Phase 2 | Complete |
| MODAL-06 | Phase 2 | Complete |

**Coverage:**
- v1 requirements: 28 total (1 obsolete)
- All 27 active requirements: Complete
- Obsolete: 1 (PAGE-03)

---
*Requirements defined: 2026-01-19*
*Last updated: 2026-01-23 - All v1 requirements complete*
