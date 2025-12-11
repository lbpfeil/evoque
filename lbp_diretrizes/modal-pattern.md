# Padrão de Modal - Evoque

## Visão Geral

Este documento define o padrão para criação de modais no projeto Evoque, baseado no `HighlightEditModal` como referência.

---

## Estrutura Base

### 1. Imports Essenciais

```typescript
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react'; // Ícone de fechar
import { Portal } from './Portal'; // OBRIGATÓRIO para modais
```

### 2. Interface de Props

```typescript
interface YourModalProps {
    // ID do item sendo editado (ou null quando fechado)
    itemId: string | null;
    // Callback para fechar o modal
    onClose: () => void;
}
```

### 3. Estrutura do Componente

```typescript
const YourModal: React.FC<YourModalProps> = ({ itemId, onClose }) => {
    // 1. State local
    const [formData, setFormData] = useState({ /* ... */ });
    
    // 2. Dados do store
    const { items, updateItem } = useStore();
    
    // 3. Buscar item específico
    const item = itemId ? items.find(i => i.id === itemId) : null;
    
    // 4. Inicializar form quando modal abre
    useEffect(() => {
        if (item) {
            setFormData({ /* dados do item */ });
        }
    }, [itemId, item]);
    
    // 5. Handler ESC key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && itemId) {
                handleClose();
            }
        };
        
        if (itemId) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [itemId, formData, item]);
    
    // 6. Early return se modal não deve renderizar
    if (!itemId || !item) return null;
    
    // 7. Handler de fechamento com auto-save
    const handleClose = () => {
        // Auto-save lógica aqui
        onClose();
    };
    
    // 8. Render com Portal
    return (
        <Portal>
            {/* Estrutura do modal */}
        </Portal>
    );
};

export default YourModal;
```

---

## Estrutura HTML/JSX Padrão

### Layout Completo

```tsx
<Portal>
    {/* Overlay - SEMPRE usar estas classes exatas */}
    <div 
        className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
    >
        {/* Container do Modal */}
        <div 
            className="bg-white rounded-md shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
        >
            {/* HEADER */}
            <div className="p-3 border-b border-zinc-200 flex items-start gap-3">
                {/* Conteúdo do header (imagem, título, etc) */}
                <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-zinc-900 mb-0.5 line-clamp-1">
                        Título do Modal
                    </h2>
                    <p className="text-xs text-zinc-600">Subtítulo</p>
                </div>
                
                {/* Botão Fechar - SEMPRE no canto superior direito */}
                <button 
                    onClick={handleClose} 
                    className="p-1 hover:bg-zinc-100 rounded transition-colors flex-shrink-0"
                    title="Close"
                >
                    <X className="w-4 h-4 text-zinc-600" />
                </button>
            </div>

            {/* BODY - Área de scroll */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {/* Conteúdo do modal aqui */}
            </div>

            {/* FOOTER - Opcional, removido se usar auto-save */}
            {/* Se não usar auto-save, adicionar footer com botões */}
        </div>
    </div>
</Portal>
```

---

## Classes CSS Padronizadas

### Overlay
```
fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50 p-4
```
- **NUNCA** usar `inset-0` (causa problemas de stacking context)
- **SEMPRE** usar `top-0 left-0 right-0 bottom-0`
- **z-index:** 50 (padrão para modais)

### Container do Modal
```
bg-white rounded-md shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col
```
- **max-h:** 95vh (deixa espaço para padding)
- **flex flex-col:** permite header fixo e body com scroll

### Header
```
p-3 border-b border-zinc-200 flex items-start gap-3
```
- Padding compacto: `p-3`
- Borda inferior sutil

### Body
```
flex-1 overflow-y-auto p-3 space-y-2
```
- `flex-1`: ocupa espaço disponível
- `overflow-y-auto`: scroll quando necessário
- `space-y-2`: espaçamento entre elementos

---

## Padrões de Comportamento

### 1. Auto-Save (Recomendado)

```typescript
const handleClose = () => {
    // Verificar se houve mudanças
    if (formData.field1 !== item.field1 || formData.field2 !== item.field2) {
        // Salvar automaticamente
        updateItem(itemId, formData);
    }
    onClose();
};
```

**Quando usar:**
- ✅ Modais de edição simples
- ✅ Formulários pequenos
- ✅ Quando não há risco de perda de dados

**Vantagens:**
- Menos cliques para o usuário
- Interface mais limpa (sem footer)
- UX mais moderna

### 2. Botões de Confirmação (Alternativa)

```tsx
<div className="p-2 border-t border-zinc-200 bg-zinc-50 flex justify-end gap-2">
    <button 
        onClick={onClose}
        className="px-3 py-1 text-xs border border-zinc-300 text-zinc-700 rounded hover:bg-zinc-100 transition-colors font-medium"
    >
        Cancel
    </button>
    <button 
        onClick={handleSave}
        className="px-3 py-1 text-xs bg-black text-white rounded hover:bg-zinc-800 transition-colors font-medium"
    >
        Save Changes
    </button>
</div>
```

**Quando usar:**
- ✅ Formulários complexos
- ✅ Ações destrutivas
- ✅ Quando usuário precisa confirmar explicitamente

### 3. ESC Key Handler (SEMPRE incluir)

```typescript
useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && itemId) {
            handleClose();
        }
    };
    
    if (itemId) {
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }
}, [itemId, formData, item]);
```

**Importante:**
- Incluir `formData` e `item` nas dependências para capturar estado atual
- Sempre fazer cleanup do event listener

### 4. Prevenir Fechamento ao Arrastar Seleção de Texto (CRÍTICO)

**Problema:** Quando o usuário seleciona texto dentro de um textarea e solta o mouse fora do modal, o modal fecha indevidamente.

**Solução:** Rastrear onde o `mousedown` começou e só fechar se tanto `mousedown` quanto `click` ocorreram no overlay.

```typescript
// Track if mousedown started on overlay (to prevent closing when selecting text)
const handleOverlayMouseDown = (e: React.MouseEvent) => {
    // Only set flag if click is directly on overlay, not on modal content
    if (e.target === e.currentTarget) {
        (e.currentTarget as HTMLElement).dataset.mousedownOnOverlay = 'true';
    }
};

const handleOverlayClick = (e: React.MouseEvent) => {
    // Only close if both mousedown and click happened on overlay
    if (e.target === e.currentTarget && (e.currentTarget as HTMLElement).dataset.mousedownOnOverlay === 'true') {
        handleClose();
    }
    // Reset flag
    delete (e.currentTarget as HTMLElement).dataset.mousedownOnOverlay;
};
```

**Uso no JSX:**
```tsx
<div
    className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50 p-4"
    onMouseDown={handleOverlayMouseDown}  // Marca quando pressiona
    onClick={handleOverlayClick}          // Valida quando solta
>
```

**Como funciona:**
1. `onMouseDown`: Marca com data attribute quando mouse é pressionado no overlay
2. `onClick`: Só fecha se a flag existir (mousedown também foi no overlay)
3. Se arrastar de dentro do modal para fora, flag não existe → modal não fecha

**Por que usar data attributes:**
- Não causa re-render (não usa `useState`)
- Armazenamento temporário direto no DOM
- Cleanup automático após cada click
- Performance otimizada

---

## Componentes de Formulário

### Input Container Padrão

```tsx
<div className="bg-zinc-50 border border-zinc-200 rounded p-2">
    <label className="text-[9px] uppercase text-zinc-400 font-semibold mb-1 block">
        Label
    </label>
    <input
        type="text"
        value={formData.field}
        onChange={(e) => setFormData(prev => ({ ...prev, field: e.target.value }))}
        className="w-full bg-transparent border-0 px-0 py-0 text-xs text-zinc-800 focus:outline-none placeholder:text-zinc-300"
        placeholder="Placeholder..."
    />
</div>
```

### Textarea Padrão

```tsx
<div className="bg-zinc-50 border border-zinc-200 rounded p-2">
    <label className="text-[9px] uppercase text-zinc-400 font-semibold mb-1 block">
        Label
    </label>
    <textarea
        value={formData.field}
        onChange={(e) => setFormData(prev => ({ ...prev, field: e.target.value }))}
        className="w-full bg-transparent border-0 px-0 py-0 text-xs font-serif text-zinc-800 resize-none focus:outline-none placeholder:text-zinc-300"
        rows={6}
        placeholder="Placeholder..."
    />
</div>
```

**Características:**
- Container cinza: `bg-zinc-50`
- Input/textarea transparente: `bg-transparent`
- Label pequena e uppercase: `text-[9px] uppercase`
- Texto do conteúdo: `text-xs` ou `text-sm`

---

## Seções Colapsáveis (Opcional)

```tsx
const [showSection, setShowSection] = useState(false);

// No render:
<div className="border-t border-zinc-200 pt-2">
    <button 
        onClick={() => setShowSection(!showSection)}
        className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 transition-colors w-full"
    >
        <IconComponent className="w-3 h-3" />
        <span className="font-medium">Section Title</span>
        {showSection ? 
            <ChevronUp className="w-3 h-3 ml-auto" /> : 
            <ChevronDown className="w-3 h-3 ml-auto" />
        }
    </button>
    
    {showSection && (
        <div className="mt-2 bg-zinc-50 rounded p-2 space-y-2">
            {/* Conteúdo da seção */}
        </div>
    )}
</div>
```

---

## Tipografia e Espaçamento

### Tamanhos de Texto
- **Título do modal:** `text-base` (16px)
- **Subtítulo:** `text-xs` (12px)
- **Labels:** `text-[9px]` (9px)
- **Conteúdo de input:** `text-xs` (12px)
- **Texto secundário:** `text-[10px]` (10px)

### Padding e Spacing
- **Header/Body:** `p-3` (12px)
- **Footer:** `p-2` (8px)
- **Input containers:** `p-2` (8px)
- **Espaçamento entre elementos:** `space-y-2` (8px)

### Cores
- **Texto principal:** `text-zinc-800`
- **Texto secundário:** `text-zinc-600`
- **Texto terciário:** `text-zinc-400`
- **Background containers:** `bg-zinc-50`
- **Bordas:** `border-zinc-200`

---

## Checklist de Implementação

Ao criar um novo modal, verificar:

- [ ] Importou `Portal` de `./Portal`
- [ ] Envolveu todo o modal com `<Portal>`
- [ ] Usou classes exatas do overlay: `fixed top-0 left-0 right-0 bottom-0 bg-black/50 ...`
- [ ] Implementou `handleOverlayMouseDown` e `handleOverlayClick` para prevenir fechamento ao arrastar texto
- [ ] Adicionou `onMouseDown={handleOverlayMouseDown}` e `onClick={handleOverlayClick}` no overlay
- [ ] Adicionou `onClick={(e) => e.stopPropagation()}` no container
- [ ] Incluiu botão X com ícone `lucide-react`
- [ ] Implementou handler ESC key
- [ ] Implementou auto-save OU botões de confirmação
- [ ] Usou `max-h-[95vh]` no container
- [ ] Usou `flex-1 overflow-y-auto` no body
- [ ] Seguiu padrão de cores e tipografia
- [ ] Testou fechamento via: X, ESC, click fora
- [ ] Testou seleção de texto arrastando para fora do modal (não deve fechar)

---

## Exemplo Completo Mínimo

```typescript
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Portal } from './Portal';
import { useStore } from './StoreContext';

interface ExampleModalProps {
    itemId: string | null;
    onClose: () => void;
}

const ExampleModal: React.FC<ExampleModalProps> = ({ itemId, onClose }) => {
    const { items, updateItem } = useStore();
    const [formData, setFormData] = useState({ title: '', description: '' });
    
    const item = itemId ? items.find(i => i.id === itemId) : null;
    
    useEffect(() => {
        if (item) {
            setFormData({ title: item.title, description: item.description });
        }
    }, [itemId, item]);
    
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && itemId) {
                handleClose();
            }
        };
        
        if (itemId) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [itemId, formData, item]);
    
    if (!itemId || !item) return null;
    
    const handleClose = () => {
        if (formData.title !== item.title || formData.description !== item.description) {
            updateItem(itemId, formData);
        }
        onClose();
    };
    
    // Prevent closing when dragging text selection outside modal
    const handleOverlayMouseDown = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            (e.currentTarget as HTMLElement).dataset.mousedownOnOverlay = 'true';
        }
    };
    
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && (e.currentTarget as HTMLElement).dataset.mousedownOnOverlay === 'true') {
            handleClose();
        }
        delete (e.currentTarget as HTMLElement).dataset.mousedownOnOverlay;
    };
    
    return (
        <Portal>
            <div 
                className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onMouseDown={handleOverlayMouseDown}
                onClick={handleOverlayClick}
            >
                <div 
                    className="bg-white rounded-md shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-3 border-b border-zinc-200 flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-base font-bold text-zinc-900 mb-0.5 line-clamp-1">
                                Edit Item
                            </h2>
                        </div>
                        <button onClick={handleClose} className="p-1 hover:bg-zinc-100 rounded transition-colors flex-shrink-0" title="Close">
                            <X className="w-4 h-4 text-zinc-600" />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        <div className="bg-zinc-50 border border-zinc-200 rounded p-2">
                            <label className="text-[9px] uppercase text-zinc-400 font-semibold mb-1 block">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full bg-transparent border-0 px-0 py-0 text-xs text-zinc-800 focus:outline-none"
                            />
                        </div>
                        
                        <div className="bg-zinc-50 border border-zinc-200 rounded p-2">
                            <label className="text-[9px] uppercase text-zinc-400 font-semibold mb-1 block">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full bg-transparent border-0 px-0 py-0 text-xs text-zinc-800 resize-none focus:outline-none"
                                rows={4}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default ExampleModal;
```

---

## Notas Importantes

### Por que usar Portal?
- Garante que `position: fixed` funcione corretamente
- Evita problemas de stacking context
- Overlay cobre toda a viewport sem gaps

### Por que `top-0 left-0 right-0 bottom-0` em vez de `inset-0`?
- `inset-0` pode ter problemas em alguns contextos de stacking
- Forma explícita é mais confiável
- Garante cobertura completa da viewport

### Auto-save vs Botões
- **Auto-save:** Melhor UX, menos cliques, mais moderno
- **Botões:** Mais controle, melhor para ações críticas

---

## Referência Visual

Ver `HighlightEditModal.tsx` para implementação completa de referência.
