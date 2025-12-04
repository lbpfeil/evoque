# Implementação do Sistema de Tags Hierárquicas

## 1. Contexto e Objetivos
O objetivo é implementar um sistema de organização de highlights robusto e flexível, inspirado na experiência de uso do Notion. O sistema deve permitir:
- **Hierarquia Infinita**: Tags podem ter subtags indefinidamente (ex: `Cristianismo > Espiritismo > Allan Kardec`).
- **Edição Inline (Estilo Notion)**: Adicionar e remover tags diretamente na tabela de highlights com uma interface ágil (clique na célula -> popover -> seleção/criação).
- **Gestão Centralizada**: Uma sidebar dedicada para gerenciar a árvore de tags (criar, renomear, mover, excluir).
- **Filtragem Avançada**: Filtrar highlights por tags, incluindo lógica recursiva (selecionar uma tag pai mostra highlights das tags filhas).

## 2. Estrutura de Dados

### 2.1. Interfaces (`types.ts`)

```typescript
export interface Tag {
  id: string;
  name: string;
  parentId?: string; // ID da tag pai (opcional). Se undefined, é uma tag raiz.
  color?: string;    // Opcional: para futuro suporte a cores
}

// Atualização na interface Highlight
export interface Highlight {
  // ... campos existentes
  tags: string[]; // Array de IDs das tags associadas
}
```

### 2.2. Persistência
As tags serão salvas no `localStorage` sob a chave `khm_tags`.

## 3. Gerenciamento de Estado (`StoreContext.tsx`)

O `StoreContext` será a fonte da verdade. Precisamos adicionar:

### 3.1. State
- `tags`: `Tag[]`

### 3.2. Actions (Métodos)
- `addTag(name: string, parentId?: string): string` (Retorna o ID da nova tag)
- `updateTag(id: string, updates: Partial<Tag>): void`
- `deleteTag(id: string): void`
  - **Importante**: Ao deletar uma tag pai, decidir se deleta as filhas ou se elas sobem um nível. *Decisão inicial: Deletar em cascata ou impedir deleção se houver filhas.*
- `assignTagToHighlight(highlightId: string, tagId: string): void`
- `removeTagFromHighlight(highlightId: string, tagId: string): void`
- `getTagsForHighlight(highlightId: string): Tag[]`

## 4. Componentes UI

### 4.1. `components/TagSelector.tsx` (Inline Editor)
Este é o componente "estilo Notion".
- **Trigger**: Um botão ou área clicável que mostra as tags atuais.
- **Popover**: Ao clicar, abre um popover (`shadcn/ui` Popover ou Dialog leve).
- **Conteúdo do Popover**:
  - Input de busca (focado automaticamente).
  - Lista de tags existentes (filtrada pela busca).
  - Opção "Criar 'Termo Buscado'" se não existir.
  - Checkboxes ou estado visual de seleção.
- **Comportamento**: Clicar fora salva/fecha.

### 4.2. `components/TagManagerSidebar.tsx` (Gestão)
Sidebar para organizar a taxonomia.
- **Visualização**: Árvore recursiva (Tree View).
  - Componente `TagTreeNode`: Renderiza uma tag e, recursivamente, seus filhos.
- **Ações por Nó**:
  - Botão `+`: Adicionar filha.
  - Botão `Edit`: Renomear.
  - Botão `Trash`: Excluir.
- **Drag & Drop (Opcional MVP)**: Permitir arrastar tags para mudar de pai.

### 4.3. `pages/Highlights.tsx` (Integração)
- Adicionar coluna "Tags" na tabela.
- Renderizar o `TagSelector` em cada célula.
- Adicionar filtro de tags na sidebar de filtros existente.

## 5. Passo a Passo de Implementação

### Fase 1: Fundação (Types & Store)
1.  **Atualizar `types.ts`**: Adicionar interface `Tag` e atualizar `Highlight`.
2.  **Atualizar `mockData.ts`**: Adicionar algumas tags de exemplo para teste.
3.  **Atualizar `StoreContext.tsx`**:
    - Adicionar state `tags`.
    - Implementar persistência (`useEffect` para carregar/salvar `khm_tags`).
    - Implementar métodos CRUD (`addTag`, `deleteTag`, etc.).
    - Atualizar `importData` para preservar tags existentes (já deve funcionar se a lógica de merge estiver correta, mas vale verificar).

### Fase 2: Componente Inline (TagSelector)
4.  **Criar `components/TagSelector.tsx`**:
    - Implementar a lógica de busca e seleção.
    - Garantir que ele receba `highlightId` e use o contexto para salvar as alterações.
    - Estilizar para parecer nativo e leve.

### Fase 3: Integração na Tabela
5.  **Atualizar `pages/Highlights.tsx`**:
    - Adicionar a coluna na definição da tabela.
    - Instanciar `<TagSelector highlightId={h.id} />` na célula.

### Fase 4: Gerenciador de Tags (Sidebar)
6.  **Criar `components/TagManagerSidebar.tsx`**:
    - Implementar a renderização recursiva da árvore de tags.
    - Adicionar formulários simples (inline ou modal) para criar/editar tags.
7.  **Integrar na `Highlights.tsx`**:
    - Adicionar um botão "Manage Tags" na sidebar de filtros ou no header que abre esse componente (pode ser um `Sheet` do shadcn/ui).

### Fase 5: Filtragem
8.  **Atualizar Lógica de Filtro em `Highlights.tsx`**:
    - Adicionar seletor de tags na sidebar de filtros.
    - Implementar lógica: Se selecionar "Cristianismo", mostrar highlights de "Cristianismo" E "Espiritismo" E "Allan Kardec" (filhos).

## 6. Considerações Técnicas
- **Performance**: Com muitas tags e highlights, a filtragem recursiva pode ser pesada. Usar `useMemo` para calcular a árvore de tags e os IDs de tags inclusos no filtro.
- **UX**: O `TagSelector` deve ser muito rápido. Evitar re-renders desnecessários da tabela inteira ao editar uma tag de uma linha.
