# Compact UI Design Guidelines

> **Propósito:** Diretrizes de design para criar interfaces compactas, limpas e profissionais no app Evoque, baseadas na implementação do TagManagerSidebar e Study page.

**Última atualização:** 2025-12-05

---

## 📐 Princípios de Design

### 1. Densidade Visual Otimizada
- **Objetivo:** Maximizar conteúdo visível sem comprometer usabilidade
- **Abordagem:** Reduzir padding, margins e gaps mantendo touch targets mínimos
- **Inspiração:** Dashboards profissionais, ferramentas de produtividade (Linear, Notion)

### 2. Hierarquia Clara com Espaçamento Mínimo
- **Objetivo:** Comunicar estrutura visual sem desperdício de espaço
- **Abordagem:** Usar tamanhos de fonte, cores e ícones para hierarquia ao invés de espaçamento excessivo

### 3. Consistência de Escala
- **Objetivo:** Manter proporções harmoniosas em toda a aplicação
- **Abordagem:** Usar sistema de escala baseado em 4px (Tailwind: 0.5, 1, 1.5, 2, etc.)

---

## 🎨 Sistema de Espaçamento Compacto

### Escala Base (Tailwind)
```
0.5 = 2px   (gaps mínimos)
1   = 4px   (gaps padrão entre elementos relacionados)
1.5 = 6px   (gaps entre grupos de elementos)
2   = 8px   (separação de seções pequenas)
3   = 12px  (separação de seções médias)
4   = 16px  (separação de seções grandes - usar raramente)
```

### Aplicação por Contexto

#### Headers/Títulos
```tsx
// ❌ Evitar (muito espaço)
<SheetHeader className="mb-6">
  <SheetTitle>Título</SheetTitle>
  <SheetDescription>Descrição</SheetDescription>
</SheetHeader>

// ✅ Recomendado (compacto)
<SheetHeader className="mb-2">
  <SheetTitle className="text-base">Título</SheetTitle>
  <SheetDescription className="text-sm">Descrição</SheetDescription>
</SheetHeader>
```

**Diretrizes:**
- Margem inferior do header: `mb-2` (8px) ou `mb-3` (12px) máximo
- Título: `text-lg` (18px) ou `text-xl` (20px)
- Descrição: `text-sm` (14px)

#### Footers/Seções de Ação
```tsx
// ❌ Evitar (muito espaço)
<div className="pt-4 mt-4 border-t">
  <div className="flex flex-col gap-2">
    <Input className="h-10" />
    <Button className="h-10">Action</Button>
  </div>
</div>

// ✅ Recomendado (compacto)
<div className="pt-1 mt-1 border-t">
  <div className="flex flex-col gap-1">
    <Input className="h-7 text-sm" />
    <Button className="h-7 text-sm px-3">Action</Button>
  </div>
</div>
```

**Diretrizes:**
- Padding/margem de separação: `pt-1 mt-1` (4px) ou `pt-1.5 mt-1.5` (6px)
- Gap entre elementos: `gap-1` (4px)
- Altura de inputs/botões: `h-7` (28px) ou `h-8` (32px)

#### Listas e Itens
```tsx
// ❌ Evitar (muito espaço)
<div className="flex flex-col gap-2">
  <div className="py-2 px-3">Item</div>
</div>

// ✅ Recomendado (compacto)
<div className="flex flex-col gap-0.5">
  <div className="py-0.5 px-1.5">Item</div>
</div>
```

**Diretrizes:**
- Gap entre itens: `gap-0.5` (2px) ou `gap-1` (4px)
- Padding vertical de itens: `py-0.5` (2px) ou `py-1` (4px)
- Padding horizontal de itens: `px-1.5` (6px) ou `px-2` (8px)

---

## 🔤 Tipografia Compacta

### Escala de Tamanhos

| Uso | Classe Tailwind | Tamanho | Line Height |
|-----|----------------|---------|-------------|
| Título principal (H1) | `text-lg font-semibold` | 18px | 1.3 |
| Subtítulo/Descrição | `text-sm text-zinc-500` | 14px | 1.5 |
| Seção secundária | `text-sm font-semibold text-zinc-600` | 14px | 1.5 |
| Texto de item | `text-sm` | 14px | 1.5 |
| Texto secundário/Metadados | `text-xs text-zinc-400` | 12px | 1.4 |
| Labels de input | `text-sm` | 14px | 1.5 |

**Nota:** Esta escala foi atualizada em 2025-12-30 para melhor legibilidade (+12.5% a +20% vs. versão anterior).

### Hierarquia Visual

**Prioridade 1 (Títulos de Página):**
```tsx
<h1 className="text-lg font-semibold text-zinc-900">Título Principal</h1>
```

**Prioridade 2 (Subtítulos de Página):**
```tsx
<p className="text-sm text-zinc-500 mt-1">Descrição da página</p>
```

**Prioridade 3 (Seções Secundárias):**
```tsx
<h2 className="text-sm font-semibold text-zinc-600">Seção</h2>
```

**Prioridade 4 (Texto normal):**
```tsx
<span className="text-sm text-zinc-700">Texto normal</span>
```

**Prioridade 5 (Texto secundário/metadados):**
```tsx
<span className="text-xs text-zinc-400">Informação adicional</span>
```

---

## 🎯 Componentes Interativos

### Botões

#### Tamanhos
```tsx
// Botão padrão compacto
<Button className="h-7 text-sm px-3">Action</Button>

// Botão icon compacto
<Button size="icon" className="h-5 w-5">
  <Icon className="w-2.5 h-2.5" />
</Button>

// Botão secundário
<Button variant="ghost" className="h-5 w-5 text-zinc-400 hover:text-zinc-900">
  <Icon className="w-2.5 h-2.5" />
</Button>
```

**Diretrizes:**
- Altura padrão: `h-7` (28px) - mínimo para touch targets
- Altura de icon buttons: `h-5 w-5` (20px) - aceitável para mouse/desktop
- Padding horizontal: `px-3` (12px) para botões com texto
- Ícones dentro de botões: `w-2.5 h-2.5` (10px) ou `w-3 h-3` (12px)

#### Botão Proeminente (Call-to-Action)

Para ações principais que merecem destaque visual:

```tsx
<button className="w-full px-4 py-3 bg-black hover:bg-zinc-800 text-white rounded-md transition-colors flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="flex items-center justify-center w-8 h-8 bg-white/10 rounded">
      <Icon className="w-4 h-4" />
    </div>
    <div className="text-left">
      <div className="text-sm font-semibold">Primary Action</div>
      <div className="text-sm text-white/70">Supporting description</div>
    </div>
  </div>
  <div className="text-right">
    <div className="text-lg font-bold">42</div>
    <div className="text-white/50 text-[10px]">Label</div>
  </div>
</button>
```

**Diretrizes:**
- Background: `bg-black` com hover `bg-zinc-800`
- Altura: `py-3` (12px vertical padding)
- Padding horizontal: `px-4` (16px)
- Texto principal: `text-sm font-semibold`
- Texto secundário: `text-sm text-white/70`
- Ícone container: `w-8 h-8 bg-white/10 rounded`
- Ícone: `w-4 h-4`
- Stats/números: `text-lg font-bold`
- Labels de stats: `text-[10px] text-white/50`
- Transição: `transition-colors` para suavidade
- Use para ações primárias únicas por tela

### Inputs

```tsx
// Input compacto
<Input
  className="h-7 text-sm py-0 px-1.5"
  placeholder="Placeholder..."
/>

// Input inline (edição)
<Input
  className="h-5 text-sm py-0 px-1"
  autoFocus
/>
```

**Diretrizes:**
- Altura padrão: `h-7` (28px)
- Altura inline (edição rápida): `h-5` (20px)
- Tamanho de texto: `text-sm` (14px)
- Padding: `px-1.5` (6px) ou `px-1` (4px) para inline

### Ícones

```tsx
// Ícone de tipo/categoria
<Folder className="w-3 h-3 text-zinc-400" />

// Ícone em botão de ação
<Edit2 className="w-2.5 h-2.5" />

// Ícone de seção/header
<Book className="w-3.5 h-3.5 text-amber-600" />
```

**Diretrizes:**
- Ícones principais: `w-3 h-3` (12px)
- Ícones em botões: `w-2.5 h-2.5` (10px)
- Ícones de header/seção: `w-3.5 h-3.5` (14px)
- Sempre usar `shrink-0` para evitar distorção

---

## 📦 Padrões de Layout

### Hierarquia com Indentação

```tsx
// Árvore hierárquica compacta
<div className={cn(
  "flex flex-col gap-0.5",
  depth > 0 && "ml-3 border-l border-zinc-200 pl-1.5"
)}>
  {/* Itens */}
</div>
```

**Diretrizes:**
- Gap entre níveis: `gap-0.5` (2px)
- Indentação por nível: `ml-3` (12px)
- Borda de hierarquia: `border-l border-zinc-200`
- Padding após borda: `pl-1.5` (6px)

### Seções Colapsáveis

```tsx
// Header de seção colapsável
<button className="flex items-center justify-between w-full px-1.5 py-1 hover:bg-zinc-50 rounded transition-colors">
  <div className="flex items-center gap-1.5">
    <Icon className="w-3.5 h-3.5 text-blue-600" />
    <span className="text-sm font-semibold text-zinc-700">Seção</span>
    <span className="text-xs text-zinc-400">(12 items)</span>
  </div>
  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
</button>
```

**Diretrizes:**
- Padding: `px-1.5 py-1` (6px/4px)
- Gap entre elementos: `gap-1.5` (6px)
- Ícone de chevron: `w-3.5 h-3.5` (14px)
- Contador: `text-[9px]` (9px)

### Cards/Containers

```tsx
// Card compacto
<div className="rounded hover:bg-zinc-50 transition-colors">
  <div className="py-0.5 px-1.5">
    {/* Conteúdo */}
  </div>
</div>
```

**Diretrizes:**
- Border radius: `rounded` (4px) ao invés de `rounded-md` (6px)
- Padding: `py-0.5 px-1.5` (2px/6px)
- Hover: `hover:bg-zinc-50` (sutil)

### Modals Centralizados

Padrão para modais que abrem sobre o conteúdo principal, como seletores e formulários rápidos.

```tsx
// Modal centrado com backdrop
{showModal && (
    <>
        {/* Backdrop semi-transparente (click to close) */}
        <div
            className="fixed inset-0 bg-black/10 z-40"
            onClick={() => setShowModal(false)}
        />

        {/* Modal posicionado centralmente */}
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-2 w-full max-w-md sm:px-4">
            <div className="bg-white rounded-md shadow-xl border border-zinc-300">
                {/* Conteúdo do modal */}
                <ModalContent />
            </div>
        </div>
    </>
)}
```

**Diretrizes:**
- **Backdrop:**
  - `bg-black/10` - Opacidade sutil (10%) para não ofuscar conteúdo
  - `z-40` - Layer abaixo do modal
  - Click handler para fechar modal
  - `fixed inset-0` - Cobre toda a tela

- **Container do Modal:**
  - `top-16` - Espaçamento do topo (64px), abaixo do header
  - `left-1/2 -translate-x-1/2` - Centralização horizontal perfeita
  - `z-50` - Layer acima do backdrop
  - `px-2` mobile, `sm:px-4` desktop - Padding lateral responsivo
  - `w-full max-w-md` - Largura total em mobile, máximo 448px em desktop

- **Card do Modal:**
  - `bg-white` - Fundo branco sólido
  - `rounded-md` - Bordas arredondadas (6px)
  - `shadow-xl` - Sombra pronunciada para elevação visual
  - `border border-zinc-300` - Borda sutil para definição

**Estrutura Interna (Search + Lista):**

```tsx
// Padrão de modal com search e lista
<div className="w-full sm:w-[360px] p-0">
    <div className="flex flex-col">
        {/* Search Input */}
        <div className="flex items-center border-b px-2 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
        </div>

        {/* Lista scrollável */}
        <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
            <div className="p-1">
                {/* Itens da lista */}
            </div>
        </div>
    </div>
</div>
```

**Diretrizes de Conteúdo:**
- **Largura responsiva:**
  - Mobile: `w-full` (ocupa todo o espaço disponível com padding do container)
  - Desktop: `sm:w-[360px]` (largura fixa de 360px)

- **Search Input:**
  - `border-b` - Apenas borda inferior como divisor
  - `px-2 py-2` - Padding de 8px (alinhado com lista abaixo)
  - Ícone: `w-4 h-4 opacity-50` - Sutil e pequeno
  - Input height: `h-8` (32px)
  - **CRÍTICO:** `onKeyDown={(e) => e.stopPropagation()}` - Previne conflitos com atalhos de teclado da página pai

- **Lista:**
  - `max-h-[300px]` - Altura máxima de 300px
  - `overflow-y-auto` - Scroll vertical quando necessário
  - `overflow-x-hidden` - Previne scroll horizontal
  - Padding interno: `p-1` (4px) - Alinha com search input

**Comportamento de Teclado:**

```tsx
// No componente pai, adicionar verificação para prevenir atalhos conflitantes
useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
        // Ignorar atalhos quando modal está aberto
        if (showModal) {
            // Apenas ESC fecha o modal
            if (e.key === 'Escape') {
                e.preventDefault();
                setShowModal(false);
            }
            return;
        }

        // Atalhos normais da página...
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
}, [showModal /* outras dependências */]);
```

**Diretrizes de Keyboard:**
- Input do modal deve usar `stopPropagation()` para prevenir conflitos
- ESC fecha o modal (implementado no componente pai)
- Atalhos da página (Space, Enter, E, etc.) são desabilitados quando modal está aberto
- Adicionar `showModal` nas dependências do useEffect de atalhos

**Exemplo Completo (Tag Selector em Study Session):**

```tsx
// Estado
const [showTagSelector, setShowTagSelector] = useState(false);

// Render
{showTagSelector && currentHighlight && (
    <>
        <div
            className="fixed inset-0 bg-black/10 z-40"
            onClick={() => setShowTagSelector(false)}
        />
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-2 w-full max-w-md sm:px-4">
            <div className="bg-white rounded-md shadow-xl border border-zinc-300">
                <TagSelector
                    highlightId={currentHighlight.id}
                    bookId={currentHighlight.bookId}
                    open={true}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) setShowTagSelector(false);
                    }}
                />
            </div>
        </div>
    </>
)}
```

**Z-index Layers (Sistema de Elevação):**
```
z-0    - Conteúdo base da página
z-10   - Headers fixos
z-20   - Sidebars/Navigation
z-30   - Dropdowns/Tooltips
z-40   - Modal backdrop
z-50   - Modal content
z-60   - Toast notifications (se existir)
```

---

## 🎨 Cores e Estados

### Paleta de Cinzas (Zinc)

```tsx
// Texto primário
text-zinc-900  // Títulos importantes
text-zinc-700  // Texto normal
text-zinc-600  // Texto secundário
text-zinc-400  // Texto terciário/desabilitado

// Backgrounds
bg-zinc-50     // Hover states
bg-zinc-100    // Active/selected states
bg-zinc-200    // Bordas/separadores

// Bordas
border-zinc-200  // Bordas padrão
border-zinc-100  // Bordas sutis (evitar)
```

### Cores de Destaque

```tsx
// Azul (Global/Primário)
text-blue-600   // Ícones de seção global
hover:text-blue-700

// Âmbar (Book-specific)
text-amber-500  // Ícones de livro
text-amber-600  // Ícones de seção de livro
text-amber-700  // Texto de chapter tags

// Vermelho (Destrutivo)
hover:text-red-600  // Ações de delete

// Verde (Sucesso)
text-green-600  // Estados positivos
```

### Estados de Interação

```tsx
// Hover
hover:bg-zinc-50
hover:text-zinc-900

// Active/Selected
bg-zinc-100
text-zinc-900

// Disabled
opacity-50
cursor-not-allowed

// Focus
focus:ring-2
focus:ring-blue-500
focus:ring-offset-1
```

---

## 🔄 Transições e Animações

### Princípios
- **Duração:** 150ms para a maioria das interações
- **Easing:** `ease-out` ou `cubic-bezier(0.4, 0.0, 0.2, 1)`
- **Sutileza:** Animações devem ser perceptíveis mas não distrativas

### Padrões Comuns

```tsx
// Hover states
className="transition-colors hover:bg-zinc-50"

// Opacity changes
className="opacity-0 group-hover:opacity-100 transition-opacity"

// Transform (expand/collapse)
className="transition-transform duration-200"

// All properties (usar com moderação)
className="transition-all duration-150"
```

---

## 📱 Responsividade

### Breakpoints Tailwind
```
sm: 640px   (tablet)
md: 768px   (tablet landscape)
lg: 1024px  (desktop)
xl: 1280px  (desktop large)
```

### Adaptações Mobile

```tsx
// Width responsivo
className="w-[400px] sm:w-[540px]"

// Grid responsivo
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"

// Padding responsivo
className="px-4 sm:px-6"

// Text size responsivo
className="text-xs sm:text-sm"
```

**Diretrizes:**
- Mobile: Manter espaçamento compacto, aumentar touch targets se necessário
- Tablet: Pode usar espaçamento ligeiramente maior
- Desktop: Priorizar densidade, usuários têm mouse

---

## ✅ Checklist de Implementação

Ao criar um novo componente compacto, verificar:

### Espaçamento
- [ ] Headers usam `mb-2` ou `mb-3` (não `mb-6`)
- [ ] Footers usam `pt-1` ou `pt-1.5` (não `pt-4`)
- [ ] Gaps entre itens são `gap-0.5` ou `gap-1` (não `gap-2`)
- [ ] Padding de itens é `py-0.5 px-1.5` (não `py-2 px-3`)

### Tipografia
- [ ] Títulos usam `text-lg` ou `text-xl` (não `text-2xl`)
- [ ] Descrições usam `text-sm` (não `text-base`)
- [ ] Texto secundário usa `text-xs`

### Componentes
- [ ] Inputs têm altura `h-7` (não `h-10`)
- [ ] Botões têm altura `h-7` (não `h-10`)
- [ ] Icon buttons são `h-5 w-5` (não `h-6 w-6`)
- [ ] Ícones são `w-3 h-3` ou `w-2.5 h-2.5` (não `w-4 h-4`)

### Visual
- [ ] Border radius é `rounded` (não `rounded-md` ou `rounded-lg`)
- [ ] Bordas usam `border-zinc-200` (não `border-zinc-100`)
- [ ] Hover states são sutis (`hover:bg-zinc-50`)
- [ ] Transições são rápidas (150ms)

### Acessibilidade
- [ ] Touch targets mínimos de 20px (h-5 w-5) para botões
- [ ] Contraste de cores adequado (WCAG AA)
- [ ] Focus states visíveis
- [ ] ARIA labels quando necessário

---

## 🎯 Exemplos de Referência

### TagManagerSidebar
- **Arquivo:** `components/TagManagerSidebar.tsx`
- **Características:**
  - Header compacto: `mb-2`, título `text-lg`, descrição `text-sm`
  - Itens com `py-0.5 px-1.5`
  - Ícones `w-3 h-3` e `w-2.5 h-2.5`
  - Footer com `pt-1 mt-1`, input/button `h-7`
  - Indentação hierárquica `ml-3 pl-1.5`

### Study Page
- **Arquivo:** `pages/Study.tsx`
- **Características:**
  - Header compacto com estatísticas inline
  - Ícones pequenos `w-3 h-3`
  - Texto `text-sm`
  - Botões `py-3` (reduzido de `py-5`)
  - Progress bar de 1px

---

## 🚫 Anti-Padrões (Evitar)

### Espaçamento Excessivo
```tsx
// ❌ NÃO FAZER
<div className="mb-6 mt-6 py-4 px-4 gap-3">
  <h1 className="text-2xl mb-4">Título</h1>
  <p className="text-base mb-3">Descrição</p>
  <Button className="h-10 px-6">Action</Button>
</div>

// ✅ FAZER
<div className="mb-2 mt-2 py-1 px-1.5 gap-1">
  <h1 className="text-lg mb-1">Título</h1>
  <p className="text-sm mb-1">Descrição</p>
  <Button className="h-7 px-3 text-sm">Action</Button>
</div>
```

### Ícones Grandes Demais
```tsx
// ❌ NÃO FAZER
<Icon className="w-5 h-5" />  // 20px é muito grande

// ✅ FAZER
<Icon className="w-3 h-3" />  // 12px é adequado
```

### Bordas Muito Arredondadas
```tsx
// ❌ NÃO FAZER
<div className="rounded-lg">  // 8px é muito

// ✅ FAZER
<div className="rounded">  // 4px é suficiente
```

---

## 📊 Métricas de Sucesso

Um componente bem implementado deve:
- **Densidade:** Exibir 30-40% mais conteúdo que versão "padrão"
- **Usabilidade:** Manter touch targets mínimos de 20px
- **Legibilidade:** Texto mínimo de 12px (text-xs) para metadados, 14px (text-sm) para texto normal
- **Performance:** Sem impacto perceptível (transições leves)
- **Consistência:** Seguir 100% das diretrizes acima

---

## 🔄 Versionamento

**v1.1** - 2025-12-30
- **Atualização da escala tipográfica** para melhor legibilidade
- Aumento proporcional de tamanhos: H1 16px→18px, Normal 12px→14px, Secundário 10px→12px
- Mudança de classes: `text-base`→`text-lg`, `text-xs`→`text-sm` (texto normal), `text-[10px]`→`text-xs` (metadados)
- Mantém densidade compacta mas melhora acessibilidade (+12.5% a +20%)

**v1.0** - 2025-12-05
- Versão inicial baseada em TagManagerSidebar e Study page
- Estabelecimento de escala de espaçamento 4px
- Definição de tipografia compacta original
- Padrões de cores e estados

---

## 📚 Recursos Adicionais

- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **Radix UI (componentes base):** https://www.radix-ui.com
- **Lucide Icons:** https://lucide.dev
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

---

**Nota:** Estas diretrizes são vivas e devem ser atualizadas conforme novos padrões são estabelecidos no app.
