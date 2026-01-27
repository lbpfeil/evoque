# Evoque Design System

## What This Is

Um app de flashcards para revisão de highlights de leitura (React 19 + TypeScript + Tailwind + shadcn/ui + Supabase). Após o v1.0 (tema light/dark funcional), o foco agora é padronização obsessiva — um design system rígido que garanta consistência visual absoluta em todas as páginas e componentes.

## Core Value

**Consistência obsessiva** — cada elemento visual deve ser idêntico ao seu equivalente em qualquer página. Zero surpresas visuais. Vocabulário visual enxuto usado com rigor.

## Requirements

### Validated

- ✓ Sistema de temas com toggle, persistência localStorage, e detecção de preferência do sistema — v1.0
- ✓ Todos os componentes usando tokens semânticos (não cores hardcoded) — v1.0
- ✓ Componentes shadcn instalados e configurados — v1.0
- ✓ Dashboard modernizado com shadcn components — v1.0
- ✓ Highlights page modernizada — v1.0
- ✓ Settings page modernizada (parsers não tocados) — v1.0
- ✓ Login page modernizada — v1.0
- ✓ Sidebar modernizada com theme toggle — v1.0
- ✓ Modals e popovers padronizados — v1.0
- ✓ Study page modernizada (aprovada pelo usuário) — v1.0
- ✓ StudySession page modernizada (fonte serif preservada) — v1.0

### Active

- [ ] Design tokens rígidos: escala tipográfica, escala de espaçamento, regras de cor
- [ ] Auditoria de componentes: identificar duplicatas, desnecessários, e ausentes
- [ ] Padronização de componentes shadcn: cada componente com UM jeito de ser usado
- [ ] Auditoria completa de todas as páginas: corrigir toda inconsistência visual
- [ ] Guia de design vivo: documento que dita exatamente como construir uma página nova
- [ ] Consistência tipográfica: mesmos tamanhos/pesos para mesmos contextos em todas as páginas
- [ ] Consistência de espaçamento: mesmos paddings/gaps/margins para contextos equivalentes
- [ ] Consistência de componentes: mesma tabela, mesmo card, mesmo modal em todo lugar

### Out of Scope

- Parsers de importação (My Clippings, PDF, Anki) — já funcionam, não mexer
- Lógica do SM-2 (algoritmo de repetição espaçada) — já funciona
- Backend/Supabase — não é escopo deste projeto
- Novas features funcionais — foco é padronização visual, não funcionalidades
- Redesign da estética — warm/friendly já está definido pelo v1.0, agora é consistência

## Context

**Stack atual:**
- React 19 + TypeScript
- Tailwind CSS com CSS variables (OKLCH)
- shadcn/ui instalado (button, dialog, input, popover, command, sheet, card, tabs, dropdown-menu, badge, tooltip, scroll-area, select, checkbox, switch)
- Supabase para backend/auth
- Recharts para gráficos
- Lucide React para ícones
- Fonte: Outfit Variable (sans), serif stack para study cards

**Estado pós-v1.0:**
- Tema light/dark funcional com paleta warm (OKLCH)
- ThemeProvider com toggle, localStorage, anti-FOUC
- Tokens semânticos em uso (bg-background, text-foreground, etc.)
- Componentes shadcn migrados
- MAS: sem design system rígido governando tipografia, espaçamento, e uso de componentes
- MAS: inconsistências visuais entre páginas (tamanhos de título, estilos de tabela, espaçamentos)

**Páginas:**
- Dashboard.tsx — stats, gráficos, livros recentes
- Highlights.tsx — browse, search, filter, tag highlights
- Study.tsx — seleção de deck
- StudySession.tsx — sessão de estudo (fonte serif preservada)
- BookDetails.tsx — highlights de um livro específico
- Settings.tsx — importação, preferências
- Login.tsx — autenticação

**Documento existente:**
- `lbp_diretrizes/compact-ui-design-guidelines.md` (550 linhas) — status desconhecido, pode estar desatualizado

## Constraints

- **Preservar:** Fonte serif nos cards de StudySession
- **Preservar:** Estética warm/friendly do v1.0
- **Não tocar:** Parsers de importação, lógica SM-2, backend
- **Base:** shadcn/ui como base de componentes (auditar e padronizar, não substituir)
- **Padrão:** Consistência obsessiva — Apple-level visual uniformity

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Usar shadcn/ui como base | Já parcialmente instalado, consistente, acessível | ✓ Good |
| Priorizar tema antes de componentes | Tema funcional é o core value do v1.0 | ✓ Good |
| Study/StudySession por último no v1.0 | São críticos, usuário quer participar | ✓ Good |
| Auditar e padronizar shadcn (não criar camada) | Manter simplicidade, evitar abstração desnecessária | — Pending |
| Consistência obsessiva como core value v2.0 | Padrão Apple — zero surpresas visuais | — Pending |

---
*Last updated: 2026-01-27 after v2.0 milestone start*
