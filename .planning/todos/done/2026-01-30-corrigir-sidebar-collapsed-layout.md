---
created: 2026-01-30T12:00
title: Corrigir sidebar - layout contraído e transições
area: ui
files:
  - components/Sidebar.tsx
  - components/SidebarContext.tsx
---

## Problem

A sidebar apresenta dois problemas:

1. **Layout desconfigurado quando contraída** — Os ícones não estão alinhados corretamente, elementos que deveriam estar ocultos (como ThemeToggle) ainda aparecem ou ocupam espaço, e o espaçamento está inconsistente.

2. **Transição não fluida ao expandir/contrair** — A animação de largura não está sincronizada com o fade dos elementos internos, causando uma transição "saltada" ao invés de suave.

Uma tentativa de correção foi feita alterando:
- ThemeToggle para usar `h-0 py-0` quando contraído
- Transições `duration-300` em todos os elementos
- `max-w` para animação de largura do texto
- `gap-sm` ao invés de `ml-sm` para espaçamento

Mas o resultado ainda não ficou satisfatório. É necessária uma análise mais profunda do comportamento atual para identificar a causa raiz.

## Solution

TBD — Requer análise visual detalhada:

1. Identificar exatamente quais elementos estão desalinhados/visíveis indevidamente
2. Verificar se o problema é de espaçamento, overflow, ou timing de transições
3. Possivelmente usar Chrome DevTools para inspecionar o estado contraído
4. Considerar se a estrutura do componente precisa ser refatorada
