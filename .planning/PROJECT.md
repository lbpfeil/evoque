# Evoque UI Overhaul

## What This Is

Uma modernização completa da interface do Evoque, um app de flashcards para revisão de highlights de leitura. O foco é padronizar todos os componentes usando shadcn/ui, implementar um sistema de temas claro/escuro funcional, e criar uma estética warm/friendly consistente em toda a aplicação.

## Core Value

**Sistema de temas funcionando perfeitamente** — o toggle deve funcionar, persistir, e todos os componentes devem responder corretamente em ambos os modos.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Sistema de temas com toggle, persistência localStorage, e detecção de preferência do sistema
- [ ] Todos os componentes usando tokens semânticos (não cores hardcoded)
- [ ] Componentes shadcn instalados: card, tabs, badge, select, checkbox, switch, tooltip, scroll-area, dropdown-menu
- [ ] Dashboard modernizado com shadcn components
- [ ] Highlights page modernizada
- [ ] BookDetails page modernizada
- [ ] Settings page modernizada (cuidado: não tocar nos parsers)
- [ ] Login page modernizada
- [ ] Sidebar modernizada com theme toggle
- [ ] Modals e popovers padronizados
- [ ] Study page modernizada (participação do usuário em cada decisão)
- [ ] StudySession page modernizada (participação do usuário em cada decisão, preservar fonte serif dos cards)

### Out of Scope

- Parsers de importação (My Clippings, PDF, Anki) — já funcionam, não mexer
- Lógica do SM-2 (algoritmo de repetição espaçada) — já funciona
- Backend/Supabase — não é escopo deste projeto
- Novas features — foco é visual/UX, não funcionalidades

## Context

**Stack atual:**
- React 19 + TypeScript
- Tailwind CSS com CSS variables (OKLCH)
- shadcn/ui parcialmente instalado (button, dialog, input, popover, command, sheet)
- Supabase para backend/auth
- Recharts para gráficos
- Lucide React para ícones

**Estado do tema:**
- `darkMode: ["class"]` configurado no Tailwind
- CSS variables definidas para light/dark em index.css
- Sem toggle na UI
- Sem persistência localStorage
- Sem detecção de preferência do sistema
- Componentes usam zinc-50, zinc-100, etc. hardcoded

**Páginas:**
- Dashboard.tsx — stats, gráficos, livros recentes
- Highlights.tsx — browse, search, filter, tag highlights
- Study.tsx — seleção de deck (CRÍTICO)
- StudySession.tsx — sessão de estudo (CRÍTICO, preservar fonte serif)
- BookDetails.tsx — highlights de um livro específico
- Settings.tsx — importação, preferências
- Login.tsx — autenticação

**Componentes principais:**
- Sidebar.tsx — navegação (adicionar theme toggle)
- DeckTable.tsx — tabela de livros com contagem de cards
- TagSelector.tsx, TagManagerSidebar.tsx — gestão de tags
- Diversos modals e popovers

## Constraints

- **Preservar:** Fonte serif nos cards de StudySession
- **Participação:** Usuário quer aprovar cada mudança em Study.tsx e StudySession.tsx
- **Não tocar:** Parsers de importação, lógica SM-2, backend
- **Estética:** Warm/friendly, não dark/techy

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Usar shadcn/ui como base | Já parcialmente instalado, consistente, acessível | — Pending |
| Priorizar tema antes de componentes | Tema funcional é o core value | — Pending |
| Study/StudySession por último | São críticos, usuário quer participar | — Pending |

---
*Last updated: 2026-01-19 after initialization*
