# Evoque Design System

## What This Is

Um app de flashcards para revisão de highlights de leitura (React 19 + TypeScript + Tailwind + shadcn/ui + Supabase). Após v2.0 (design system completo), o app tem consistência visual obsessiva em todas as páginas. Próximo foco: novas features funcionais.

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

(Nenhum — aguardando definição do próximo milestone)

### Out of Scope

- Parsers de importação (My Clippings, PDF, Anki) — já funcionam, não mexer
- Lógica do SM-2 (algoritmo de repetição espaçada) — já funciona
- Backend/Supabase — não é escopo deste projeto
- Redesign da estética — warm/friendly já está definido pelo v1.0

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
- Dashboard removido (será recriado)
- ~10,500 LOC TypeScript/CSS

**Páginas atuais:**
- Study.tsx — seleção de deck (página inicial)
- StudySession.tsx — sessão de estudo (fonte serif preservada)
- Highlights.tsx — browse, search, filter, tag highlights
- Settings.tsx — importação, preferências
- Login.tsx — autenticação

## Constraints

- **Preservar:** Fonte serif nos cards de StudySession
- **Preservar:** Estética warm/friendly do v1.0
- **Não tocar:** Parsers de importação, lógica SM-2, backend
- **Base:** shadcn/ui como base de componentes
- **Padrão:** Consistência obsessiva — Apple-level visual uniformity

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
| Dashboard removido | Será recriado com novas features no próximo milestone | — Pending |

---
*Last updated: 2026-01-29 after v2.0 milestone complete*
