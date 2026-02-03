# Project Milestones: Evoque

## v2.0 Design System Overhaul (Shipped: 2026-01-29)

**Delivered:** Design system completo com tokens rígidos, componentes padronizados, e guia de design system vivo.

**Phases completed:** 4-10 (24 plans total)

**Key accomplishments:**

- 47 CSS tokens definidos (typography, spacing, radius, shadows, motion, icons, z-index)
- PageHeader component criado para layout consistente de páginas
- Todas as 6 páginas migradas para tokens semânticos e padrões canônicos
- Design guide de 605 linhas documentando todo o sistema
- 200+ usages de semantic tokens em pages e components
- Button/Input components adotados em toda a aplicação
- Dashboard removido (será recriado no próximo milestone)

**Stats:**

- 94 commits
- 24 plans across 7 phases
- 3 days (2026-01-27 → 2026-01-29)
- ~10,500 lines of TypeScript/CSS

**Git range:** `feat(04-01)` → `docs(10)`

**What's next:** Dashboard redesign, novas features funcionais

---

## v1.0 UI Overhaul (Shipped: 2026-01-23)

**Delivered:** Sistema de temas light/dark funcional com paleta warm e todos os componentes usando tokens semânticos.

**Phases completed:** 1-3 (20 plans total)

**Key accomplishments:**

- Sistema de cores OKLCH funcional com paleta warm (cream light, charcoal dark)
- ThemeProvider com toggle, localStorage persistence, anti-FOUC, system preference detection
- Componentes shadcn migrados para tokens semânticos (button, input, dialog, popover, command, sheet)
- Todas as páginas modernizadas (Dashboard, Highlights, Settings, Login, Sidebar)
- Study pages migradas com aprovação do usuário, fonte serif preservada nos cards
- Sistema de modais padronizado com shadcn Dialog/AlertDialog

**Stats:**

- 70 commits
- 20 plans across 3 phases
- 5 days (2026-01-19 → 2026-01-23)
- 27 requirements completed

**Git range:** `01aa8dd` → `08a7ed7`

**What's next:** v2.0 Design System Overhaul (complete)

---
