# 📚 EVOQUE Documentation Index

> **Guia de documentação do projeto - O que ler e quando**

---

## 🗺️ VISÃO GERAL

Esta pasta (`lbp_context/`) contém toda a documentação técnica e de produto do EVOQUE. Os documentos estão organizados em **2 categorias principais**:

1. **Documentação para Agentes de IA** (formato otimizado, denso, código-first)
2. **Documentação para Humanos** (formato tradicional, narrativo, contexto de produto)

---

## 📂 ESTRUTURA DE ARQUIVOS

```
lbp_context/
├── README.md                        ← VOCÊ ESTÁ AQUI
│
├── 🤖 PARA AGENTES DE IA:
├── TECHNICAL_CONTEXT.md             ⚠️ PRINCIPAL - Sempre use com IA
├── spaced-repetition-system.md      🧠 Deep dive: SM-2 algorithm (753 linhas)
├── HighlightTab-context.md          📑 Deep dive: Highlights features (483 linhas)
│
├── 📋 CONTEXTO DE PRODUTO:
└── prd.md                           📋 Product context (visão, mercado, objetivos)

../lbp_diretrizes/
├── design-system-guide.md           🎨 UI/UX Guidelines (~600 lines) - v2.0 (2026-01-28)
└── modal-pattern.md                 📦 Padrão de implementação de modais
```

---

## 📖 GUIA DE LEITURA

### **Para Agentes de IA:**

**Sempre incluir:**
1. ⚠️ **TECHNICAL_CONTEXT.md** - Referência técnica completa (OBRIGATÓRIO)

**Incluir quando relevante:**
- `spaced-repetition-system.md` - Se trabalhar em study system/SM-2
- `HighlightTab-context.md` - Se trabalhar em Highlights page
- `design-system-guide.md` - Se trabalhar em UI/styling
- `prd.md` - **Raramente** (apenas para contexto de produto/mercado)

**Exemplo de prompt:**
```markdown
@TECHNICAL_CONTEXT.md
@spaced-repetition-system.md  # se relevante

Task: [descrição]
Requirements: [lista]
Constraints: [padrões a seguir]
```

---

### **Para Desenvolvedores:**

**Onboarding:**
1. `README.md` (este arquivo) - 5 min
2. `TECHNICAL_CONTEXT.md` - 15 min  
3. `prd.md` - 10 min (visão de produto)
4. Deep dives conforme necessário

**Desenvolvimento diário:**
- `TECHNICAL_CONTEXT.md` - Referência de padrões/tipos
- Deep dives específicos quando necessário

---

## 📋 DESCRIÇÃO DETALHADA DOS ARQUIVOS

### **🤖 TECHNICAL_CONTEXT.md**

**O QUE É:**
Referência técnica completa e concisa (500 linhas) otimizada para agentes de IA.

**CONTÉM:**
- Stack técnico REAL (não planejado)
- Estrutura de arquivos com anotações
- Tipos/interfaces do TypeScript (types.ts)
- Padrões arquiteturais com código de exemplo
- Workflows críticos (step-by-step)
- Edge cases conhecidos
- Status de implementação (feito vs planejado)
- Quick reference de operações comuns

**QUANDO USAR:**
- ✅ **SEMPRE** incluir em prompts para IA
- ✅ Referência rápida durante desenvolvimento
- ✅ Onboarding de novos devs

**QUANDO ATUALIZAR:**
- Mudança de stack técnico
- Nova feature grande (>500 linhas)
- Novos padrões arquiteturais
- Edge cases descobertos
- Refactorings importantes

**AUDIÊNCIA:** Agentes de IA (primário), Desenvolvedores (secundário)

---

### **📋 prd.md**

**O QUE É:**
Contexto de produto, mercado e visão do app. NÃO contém especificações técnicas.

**CONTÉM:**
- Visão geral do produto
- CHANGELOG (últimas mudanças)
- Contexto de mercado
- Objetivos e métricas de negócio
- Público-alvo e personas
- Princípios do produto

**QUANDO USAR:**
- ⚠️ Com IA: **Raramente** - apenas para entender contexto de produto/mercado
- ✅ Onboarding de desenvolvedores (entender visão)
- ✅ Apresentações para stakeholders
- ✅ Planejamento de roadmap

**QUANDO ATUALIZAR:**
- Sprint review (adicionar em CHANGELOG)
- Mudanças de visão/objetivos
- Pivots de produto

**AUDIÊNCIA:** Product Managers, Stakeholders, Desenvolvedores (contexto)

**⚠️ IMPORTANTE:** 
- Para especificações técnicas, use `TECHNICAL_CONTEXT.md`
- Para algoritmos/features, use deep dives específicos

---

### **🧠 spaced-repetition-system.md**

**O QUE É:**
Deep dive técnico no sistema de repetição espaçada (algoritmo SM-2).

**CONTÉM:**
- Explicação matemática do SM-2
- Implementação em TypeScript
- Tabelas de progressão de intervalos
- Edge cases e decisões de design
- Referências acadêmicas

**QUANDO USAR:**
- ✅ Ao trabalhar em features de estudo
- ✅ Ao debugar algoritmo SM-2
- ✅ Ao explicar sistema para stakeholders
- ✅ Incluir em prompt de IA se modificar sm2.ts

**QUANDO ATUALIZAR:**
- Mudanças no algoritmo (intervals, ease factor)
- Novos edge cases descobertos
- Otimizações de performance

**AUDIÊNCIA:** Desenvolvedores (primário), Agentes de IA (quando relevante)

---

### **📑 HighlightTab-context.md**

**O QUE É:**
Documentação específica das features da aba Highlights.

**CONTÉM:**
- Features implementadas (stats, ordenação, modal de contexto)
- Integração com sistema de estudo
- Filtros e busca
- Sistema de tags
- Componentes específicos

**QUANDO USAR:**
- ✅ Ao trabalhar em Highlights.tsx
- ✅ Ao modificar filtros/ordenação
- ✅ Ao trabalhar com tags
- ✅ Incluir em prompt de IA se modificar features de highlights

**QUANDO ATUALIZAR:**
- Novas features na aba Highlights
- Mudanças em filtros/ordenação
- Alterações no sistema de tags

**AUDIÊNCIA:** Desenvolvedores, Agentes de IA (quando relevante)

---

### **🎨 ../lbp_diretrizes/design-system-guide.md**

**O QUE É:**
Guia completo de UI/UX para criar interfaces consistentes (~600 lines, v2.0).

**CONTÉM:**
- Sistema de espaçamento (4px base scale)
- Tipografia compacta (text-xs, text-base, etc.)
- Componentes interativos (botões, inputs, ícones)
- Padrões de layout (hierarquia, cards, seções)
- Cores e estados (zinc palette, hover, focus)
- Transições e animações (150ms, ease-out)
- Responsividade (mobile, tablet, desktop)
- Checklist de implementação
- Anti-padrões a evitar

**QUANDO USAR:**
- ✅ **SEMPRE** ao criar novos componentes UI
- ✅ Ao modificar styling existente
- ✅ Ao revisar PRs de UI
- ✅ Incluir em prompt de IA quando trabalhar em UI/styling

**QUANDO ATUALIZAR:**
- Novos padrões de UI estabelecidos
- Mudanças no design system
- Descoberta de anti-padrões
- Feedback de inconsistências visuais

**AUDIÊNCIA:** Desenvolvedores (primário), Designers, Agentes de IA (quando trabalhar em UI)

**⚠️ IMPORTANTE:** 
- TECHNICAL_CONTEXT.md tem apenas **quick reference** de UI
- Para especificações completas, sempre consulte este arquivo
- Não duplicar informações entre os dois

---

## 🎯 QUICK REFERENCE

**Implementar feature:** `@TECHNICAL_CONTEXT.md` + deep dive se relevante  
**Bugfix:** `@TECHNICAL_CONTEXT.md` (ver Known Issues)  
**UI/Styling:** `@TECHNICAL_CONTEXT.md` + `@design-system-guide.md`  
**Onboarding:** Leia TECHNICAL_CONTEXT.md + prd.md (visão geral)

---

## ✅ MANUTENÇÃO

**Ao fazer commit grande:**
- Atualizar `TECHNICAL_CONTEXT.md` (Last Updated, Implementation Status, Edge Cases)

**Sprint review:**
- Atualizar `prd.md` CHANGELOG
- Revisar Implementation Status

**Documentação está boa se:**
- IA faz <3 perguntas por tarefa
- IA segue padrões sem guidance explícito
- Onboarding leva <1 dia

---

**🎯 Comece por `TECHNICAL_CONTEXT.md` e bom desenvolvimento!**

---

_Última atualização: 2025-12-19_

