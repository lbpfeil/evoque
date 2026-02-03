# Evoque

## What This Is

Um app de flashcards para revisão de highlights de leitura (React 19 + TypeScript + Tailwind + shadcn/ui + Supabase). App funcional com design system completo (v2.0). Próximo foco: Dashboard inteligente, auth robusto, e landing page de marketing.

## Current Milestone: v4.0 Quality of Life & Physical Books

**Goal:** Melhorar performance geral da aplicação, adicionar sistema de notificações push para engajamento, e implementar OCR para importação de highlights de livros físicos.

**Target features:**
- Performance optimization: profiling extenso, lazy loading, code splitting
- Skeletons para loading states em todas as páginas
- Push notifications (PWA): lembrete diário se não estudou, resumo semanal
- OCR de livros físicos: tirar fotos de páginas com marca-texto → extrair highlights
- Detecção automática de texto marcado por cor de marca-texto
- Fluxo batch de captura de fotos com revisão opcional

## Core Value

**Revisão eficiente de highlights** — ajudar usuários a reter conhecimento dos livros que leem através de repetição espaçada (SM-2).

## Requirements

### Validated

- ✓ Sistema de temas com toggle, persistência localStorage, e detecção de preferência do sistema — v1.0
- ✓ Todos os componentes usando tokens semânticos (não cores hardcoded) — v1.0
- ✓ Componentes shadcn instalados e configurados — v1.0
- ✓ Highlights page modernizada — v1.0
- ✓ Settings page modernizada (parsers não tocados) — v1.0
- ✓ Login page modernizada — v1.0
- ✓ Sidebar modernizada com theme toggle — v1.0
- ✓ Modals e popovers padronizados — v1.0
- ✓ Study page modernizada (aprovada pelo usuário) — v1.0
- ✓ StudySession page modernizada (fonte serif preservada) — v1.0
- ✓ Design tokens rígidos: escala tipográfica, escala de espaçamento, regras de cor — v2.0
- ✓ Auditoria de componentes: identificar duplicatas, desnecessários, e ausentes — v2.0
- ✓ Padronização de componentes shadcn: cada componente com UM jeito de ser usado — v2.0
- ✓ Auditoria completa de todas as páginas: corrigir toda inconsistência visual — v2.0
- ✓ Guia de design vivo: documento que dita exatamente como construir uma página nova — v2.0
- ✓ Consistência tipográfica: mesmos tamanhos/pesos para mesmos contextos em todas as páginas — v2.0
- ✓ Consistência de espaçamento: mesmos paddings/gaps/margins para contextos equivalentes — v2.0
- ✓ Consistência de componentes: mesma tabela, mesmo card, mesmo modal em todo lugar — v2.0

### Active

- [ ] Performance optimization: profiling, lazy loading, code splitting, memoization
- [ ] Skeleton components para loading states fluidos
- [ ] Push notifications (PWA): lembrete diário, resumo semanal
- [ ] OCR de livros físicos: captura de fotos, detecção de marca-texto, extração de texto
- [ ] Fluxo de importação para livros físicos (novo ou existente)
- [ ] Tela de revisão de highlights extraídos por OCR

### Out of Scope

- Parsers de importação existentes (My Clippings, PDF, Anki) — já funcionam, não mexer
- Lógica do SM-2 (algoritmo de repetição espaçada) — já funciona
- Redesign da estética — warm/friendly já está definido pelo v1.0
- OAuth além de Google (Apple, GitHub) — Google cobre 90% dos usuários
- Mobile app nativo — web-first, PWA já funciona
- Notificações por email — push notifications são suficientes para v4.0
- Seleção manual de texto em fotos — detecção por cor é o foco

## Context

**Stack atual:**
- React 19 + TypeScript
- Tailwind CSS com CSS variables (OKLCH)
- shadcn/ui (button, dialog, input, popover, command, sheet, card, tabs, dropdown-menu, badge, tooltip, scroll-area, select, checkbox, switch)
- Supabase para backend/auth
- Recharts para gráficos
- Lucide React para ícones
- Fonte: Outfit Variable (sans), serif stack para study cards

**Estado pós-v2.0:**
- Design system completo com 47 CSS tokens
- Todas as páginas usando tokens semânticos (typography, spacing, color)
- PageHeader component para layout consistente
- Button/Input components adotados em toda a aplicação
- Design guide de 605 linhas (`lbp_diretrizes/design-system-guide.md`)
- ~10,500 LOC TypeScript/CSS

**Páginas atuais:**
- Study.tsx — seleção de deck (será substituída por Dashboard)
- StudySession.tsx — sessão de estudo (fonte serif preservada)
- Highlights.tsx — browse, search, filter, tag highlights
- Settings.tsx — importação, preferências
- Login.tsx — autenticação

**v3.0 additions (shipped):**
- Dashboard.tsx — nova home com KPIs e atalho para estudar
- Nova coluna `duration_ms` em `review_logs` para time tracking
- Vitest testing infrastructure

**v4.0 additions (planned):**
- OCR service integration para extração de texto de fotos
- Push notification service worker
- Skeleton components para loading states
- PhysicalBookImport.tsx — fluxo de importação de livros físicos

## Constraints

- **Preservar:** Fonte serif nos cards de StudySession
- **Preservar:** Estética warm/friendly do v1.0
- **Não tocar:** Parsers de importação, lógica SM-2
- **Base:** shadcn/ui como base de componentes
- **Padrão:** Consistência obsessiva — Apple-level visual uniformity
- **Auth:** Supabase Auth built-in (não implementar auth custom)
- **Landing:** Estática, sem backend — pode ser servida por qualquer CDN

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Usar shadcn/ui como base | Já parcialmente instalado, consistente, acessível | ✓ Good |
| Priorizar tema antes de componentes | Tema funcional é o core value do v1.0 | ✓ Good |
| Study/StudySession por último no v1.0 | São críticos, usuário quer participar | ✓ Good |
| Auditar e padronizar shadcn (não criar camada) | Manter simplicidade, evitar abstração desnecessária | ✓ Good |
| Consistência obsessiva como core value v2.0 | Padrão Apple — zero surpresas visuais | ✓ Good |
| "Generous" design language wins | Dashboard/Highlights style (big titles, generous spacing) | ✓ Good |
| Button 'compact' (h-8) como default | Todos os usages existentes especificam size explícito | ✓ Good |
| DataTable removido (YAGNI) | 0 imports após 3+ semanas | ✓ Good |
| Dashboard como home | Usuário vê KPIs primeiro, atalho rápido para estudar | ✓ Good |
| Time tracking persistido | Analytics de longo prazo, métricas inteligentes | ✓ Good |
| Edição inline clean | Mesma fonte/posição, UX seamless durante revisão | ✓ Good |
| Performance primeiro | Base sólida antes de features novas | — Pending |
| Push notifications (não email) | PWA-native, funciona offline | — Pending |
| OCR por cor de marca-texto | Detecção automática, sem seleção manual | — Pending |
| Batch photo capture | Tira várias fotos, processa no final | — Pending |

---
*Last updated: 2026-02-03 after v4.0 milestone initialization*
