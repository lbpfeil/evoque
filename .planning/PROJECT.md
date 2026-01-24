# Evoque

## What This Is

Evoque é um app de flashcards para revisão de highlights de leitura usando repetição espaçada (SM-2). Importa highlights do Kindle e permite estudo organizado por livro ou deck geral.

## Core Value

**Experiência de estudo fluida e sem fricção** — o usuário deve conseguir revisar seus highlights de forma rápida e agradável.

## Current Milestone: v1.1 Internationalization

**Goal:** Sistema multi-idioma com PT-BR como padrão e inglês disponível.

**Target features:**
- Sistema i18n completo (react-i18next ou similar)
- Tradução de toda a UI para PT-BR
- Formatação localizada (datas, números, pluralização)
- Toggle de idioma nas configurações
- Inglês mantido como opção

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

- [ ] Sistema i18n configurado e funcionando
- [ ] Todas as strings da UI extraídas para arquivos de tradução
- [ ] Tradução completa para PT-BR
- [ ] Formatação localizada de datas e números
- [ ] Toggle de idioma nas configurações
- [ ] Persistência da preferência de idioma

### Out of Scope

- Parsers de importação (My Clippings, PDF, Anki) — já funcionam, não mexer
- Lógica do SM-2 (algoritmo de repetição espaçada) — já funciona
- Backend/Supabase — não é escopo deste milestone
- Tradução de conteúdo do usuário (highlights, notas) — apenas UI

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

- **Preservar:** Fonte serif nos cards de StudySession, estética warm/friendly
- **Não tocar:** Parsers de importação, lógica SM-2, backend
- **i18n:** PT-BR como idioma padrão, EN disponível
- **Performance:** Bundle size deve permanecer razoável (lazy load translations)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Usar shadcn/ui como base | Já parcialmente instalado, consistente, acessível | — Pending |
| Priorizar tema antes de componentes | Tema funcional é o core value | — Pending |
| Study/StudySession por último | São críticos, usuário quer participar | — Pending |

---
*Last updated: 2026-01-24 after v1.1 milestone start*
