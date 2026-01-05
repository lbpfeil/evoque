# Diretrizes: Sidebar Retrátil com Ícones Fixos

> **Guia completo para implementar uma sidebar colapsável profissional onde os ícones permanecem na mesma posição durante toda a transição, sem "saltos" ou deslocamentos visuais.**

---

## 🎯 Princípio Fundamental

**"Ícones têm posição absoluta fixa. Apenas a largura do container e opacity dos labels mudam."**

### Por que isso importa?

Sidebars colapsáveis mal implementadas causam **deslocamento visual dos ícones** durante a transição, criando uma experiência de usuário desagradável e pouco profissional. O padrão correto mantém os ícones **estáticos** enquanto apenas o conteúdo à direita aparece/desaparece.

---

## 📐 Geometria e Matemática

### 1. Definir Dimensões

**Escolha as larguras da sidebar:**
- **Colapsada:** `w-14` (56px) - ideal para mostrar apenas ícones
- **Expandida:** `w-56` (224px) - espaço suficiente para labels

> **Nota:** A sidebar recolhe **imediatamente** ao tirar o mouse (sem delay)

**Escolha o tamanho dos ícones:**
- **Recomendado:** `w-4 h-4` (16x16px)
- **Alternativa:** `w-5 h-5` (20x20px) para ícones maiores

### 2. Calcular Centralização dos Ícones

**Fórmula para centralizar ícones quando colapsado:**

```
Padding necessário = (Espaço disponível - Largura do ícone) ÷ 2
```

**Exemplo prático:**

```
Sidebar colapsada: 56px (w-14)
Container nav: padding lateral de 12px cada lado (px-3)
Espaço interno disponível: 56 - (12 × 2) = 32px

Ícone: 16px (w-4)
Padding para centralizar: (32 - 16) ÷ 2 = 8px

Solução: pl-2 (8px)
```

**Posição absoluta do ícone:**
```
12px (nav padding) + 8px (item padding-left) = 20px da borda esquerda
```

**Esta posição permanece fixa tanto colapsada quanto expandida!**

---

## 🏗️ Arquitetura de Código

### 1. State Management

```typescript
// Hook customizado para gerenciar estado da sidebar
interface UseSidebarCollapseReturn {
  collapsed: boolean;           // Estado manual (persiste em localStorage)
  isHovered: boolean;            // Estado temporário de hover
  isExpanded: boolean;           // Computed: isHovered || !collapsed
  toggleCollapsed: () => void;   // Toggle manual
  handleMouseEnter: () => void;  // Expande ao hover
  handleMouseLeave: () => void;  // Recolhe imediatamente
}

export const useSidebarCollapse = (): UseSidebarCollapseReturn => {
  // 1. Estado collapsed com localStorage (default: true)
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved ? JSON.parse(saved) : true;
  });

  // 2. Persist to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  // 3. Estado hover temporário
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 4. Cleanup timeout
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // 5. Computed expansion state
  const isExpanded = isHovered || !collapsed;

  // 6. Handlers
  const toggleCollapsed = () => setCollapsed(prev => !prev);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false); // Recolhe imediatamente
  };

  return {
    collapsed,
    isHovered,
    isExpanded,
    toggleCollapsed,
    handleMouseEnter,
    handleMouseLeave,
  };
};
```

### 2. Container Sidebar

```typescript
<aside
  className={`fixed inset-y-0 left-0 ${isExpanded ? 'w-56' : 'w-14'} bg-white border-r transition-[width] duration-300 ease-in-out overflow-hidden`}
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
>
  {/* conteúdo */}
</aside>
```

**Pontos críticos:**
- `transition-[width]` - transita **apenas** a largura (mais performático)
- `duration-300` - tempo de transição (ajuste conforme necessário)
- `overflow-hidden` - **essencial** para esconder conteúdo que extrapola

---

## 🎨 Padrões de Implementação

### Pattern 1: Header com Logo Fixo

**❌ ERRADO (logo se move):**
```typescript
<div className={`... ${!isExpanded ? 'absolute left-1/2 -translate-x-1/2' : ''}`}>
  <BookOpen className="w-4 h-4" />
</div>
```

**✅ CORRETO (logo fixo):**
```typescript
<div className="flex items-center h-14 border-b relative">
  {/* Logo - SEMPRE na mesma posição */}
  <div className="p-1.5 bg-black text-white rounded-md ml-3 shrink-0">
    <BookOpen className="w-4 h-4" />
  </div>

  {/* Texto - w-0 quando invisível */}
  <span
    className={`font-bold text-base ml-2 whitespace-nowrap transition-opacity duration-200 ${
      isExpanded
        ? 'opacity-100 delay-75'
        : 'opacity-0 w-0 overflow-hidden pointer-events-none'
    }`}
  >
    App Name
  </span>

  <div className="flex-1" /> {/* Spacer */}

  {/* Toggle button */}
  <button
    onClick={toggleCollapsed}
    className={`p-1.5 mr-3 rounded transition-opacity duration-200 ${
      isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}
  >
    <ChevronLeft className="w-3.5 h-3.5" />
  </button>
</div>
```

### Pattern 2: Navigation com Ícones Fixos

**❌ ERRADO (ícones se movem):**
```typescript
<NavLink
  className={`flex items-center ${isExpanded ? 'px-3 gap-3' : 'px-0 justify-center'} ...`}
>
  <item.icon className="w-4 h-4" />
  {isExpanded && <span>{item.name}</span>}
</NavLink>
```

**✅ CORRETO (ícones fixos):**
```typescript
<nav className="flex-1 py-6 px-3 space-y-0.5">
  {navItems.map((item) => (
    <NavLink
      key={item.name}
      to={item.path}
      className="flex items-center pl-2 pr-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
    >
      {/* Ícone - SEMPRE na mesma posição */}
      <item.icon className="w-4 h-4 shrink-0" />

      {/* Label - w-0 quando invisível */}
      <span
        className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${
          isExpanded
            ? 'opacity-100 delay-75'
            : 'opacity-0 w-0 overflow-hidden pointer-events-none'
        }`}
      >
        {item.name}
      </span>
    </NavLink>
  ))}
</nav>
```

**Por que funciona:**
- `pl-2 pr-3` - **padding fixo** (8px left, 12px right)
- `pl-2` (8px) - centraliza ícone de 16px em 32px disponíveis
- `shrink-0` - ícone nunca encolhe
- Labels usam `w-0 overflow-hidden` quando invisíveis (não ocupam espaço)

### Pattern 3: User Menu com Avatar Fixo

**✅ CORRETO:**
```typescript
<button className="w-full px-3 py-4 hover:bg-zinc-50 transition-colors">
  <div className="flex items-center">
    {/* Avatar - SEMPRE na mesma posição */}
    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
      <img src={avatarUrl} alt="Avatar" />
    </div>

    {/* User info - w-0 quando invisível */}
    <div
      className={`flex-1 min-w-0 ml-3 transition-opacity duration-200 ${
        isExpanded
          ? 'opacity-100 delay-75'
          : 'opacity-0 w-0 overflow-hidden pointer-events-none'
      }`}
    >
      <p className="text-xs font-medium truncate whitespace-nowrap">User Name</p>
      <p className="text-[10px] text-gray-500 whitespace-nowrap">Free Plan</p>
    </div>

    {/* ChevronUp - w-0 quando invisível */}
    <ChevronUp
      className={`w-3.5 h-3.5 transition-all duration-200 ${
        isExpanded
          ? 'opacity-100 ml-2'
          : 'opacity-0 w-0 overflow-hidden pointer-events-none'
      }`}
    />
  </div>
</button>
```

---

## 🎭 Técnicas de Transição

### Técnica 1: `w-0 overflow-hidden` (RECOMENDADA)

**Uso:** Esconder elementos sem afetar layout

```typescript
<span
  className={`... ${
    isVisible
      ? 'opacity-100'
      : 'opacity-0 w-0 overflow-hidden pointer-events-none'
  }`}
>
  Content
</span>
```

**Vantagens:**
- ✅ Elemento permanece no DOM
- ✅ Não ocupa espaço (`w-0`)
- ✅ Conteúdo escondido (`overflow-hidden`)
- ✅ Não interfere com flexbox
- ✅ Não captura cliques (`pointer-events-none`)
- ✅ Transição suave de opacity

**Desvantagens:**
- ❌ Elemento ainda existe no DOM (mínimo impacto)

### Técnica 2: Conditional Rendering (NÃO RECOMENDADA para ícones)

```typescript
{isExpanded && <span>Content</span>}
```

**Vantagens:**
- ✅ Remove completamente do DOM

**Desvantagens:**
- ❌ Causa "saltos" em layouts flexbox
- ❌ Não permite transições suaves
- ❌ Pode causar reflow/repaint

**Quando usar:** Apenas para elementos que NÃO afetam posicionamento de ícones (ex: modais, overlays)

### Técnica 3: Delays Coordenados

**Problema:** Labels aparecem antes da sidebar terminar de expandir

**Solução:** Adicionar delay na opacity dos labels

```typescript
// Expandir: width começa (0ms) → opacity começa (75ms)
className={`... ${isExpanded ? 'opacity-100 delay-75' : 'opacity-0'}`}

// Colapsar: opacity desaparece imediatamente (0ms)
```

**Resultado:** Transição coordenada e profissional!

---

## ⚡ Timings Recomendados

```typescript
// Container sidebar
transition-[width] duration-300 ease-in-out

// Labels/textos
transition-opacity duration-200

// Com delay coordenado
${isExpanded ? 'opacity-100 delay-75' : 'opacity-0'}

// Sequência ao expandir:
// 0ms: width inicia
// 75ms: opacity inicia (delay-75)
// 300ms: width completa
// 275ms: opacity completa (200ms + 75ms = 275ms)

// Resultado: transição fluida e coordenada!
```

---

## 🚫 Erros Comuns e Como Evitar

### Erro 1: Padding Dinâmico

**❌ ERRADO:**
```typescript
className={`... ${isExpanded ? 'px-3' : 'px-0 justify-center'}`}
```

**Por que é ruim:**
- Padding muda dinamicamente
- Ícones se movem durante transição
- Causa "salto" visual

**✅ CORRETO:**
```typescript
className="... pl-2 pr-3" // Padding fixo sempre
```

### Erro 2: Usar `absolute` para Centralizar

**❌ ERRADO:**
```typescript
className={`... ${!isExpanded ? 'absolute left-1/2 -translate-x-1/2' : ''}`}
```

**Por que é ruim:**
- Elemento sai do flow normal
- Pode sobrepor outros elementos
- Dificulta flexbox

**✅ CORRETO:**
```typescript
className="... ml-3" // Margin fixo sempre
```

### Erro 3: `gap` Dinâmico

**❌ ERRADO:**
```typescript
className={`flex items-center ${isExpanded ? 'gap-3' : ''}`}
```

**Por que é ruim:**
- Gap muda dinamicamente
- Afeta espaçamento entre elementos
- Causa movimento visual

**✅ CORRETO:**
```typescript
// Sem gap dinâmico, usar ml-3 fixo nos labels
<Icon />
<span className="ml-3">Label</span>
```

### Erro 4: `justify-center` Dinâmico

**❌ ERRADO:**
```typescript
className={`... ${!isExpanded ? 'justify-center' : ''}`}
```

**Por que é ruim:**
- Alinhamento muda dinamicamente
- Ícones se movem para centralizar/descentralizar
- Causa "salto" visual

**✅ CORRETO:**
```typescript
// Usar padding calculado para centralizar naturalmente
className="... pl-2 pr-3" // 8px centraliza ícone de 16px em 32px
```

---

## 📊 Tabela de Referência Rápida

| Largura Sidebar | Container Padding | Espaço Disponível | Tamanho Ícone | Padding Item |
|-----------------|-------------------|-------------------|---------------|--------------|
| 56px (w-14)     | 12px (px-3)       | 32px              | 16px (w-4)    | 8px (pl-2)   |
| 64px (w-16)     | 12px (px-3)       | 40px              | 16px (w-4)    | 12px (pl-3)  |
| 48px (w-12)     | 8px (px-2)        | 32px              | 16px (w-4)    | 8px (pl-2)   |
| 56px (w-14)     | 12px (px-3)       | 32px              | 20px (w-5)    | 6px (pl-1.5) |

**Fórmula:**
```
Padding Item = (Espaço Disponível - Tamanho Ícone) ÷ 2
```

---

## 🎯 Checklist de Implementação

### Fase 1: Setup Básico
- [ ] Criar hook `useSidebarCollapse` com state management
- [ ] Criar context provider (opcional, mas recomendado)
- [ ] Definir larguras (collapsed e expanded)
- [ ] Calcular padding para centralização

### Fase 2: Container
- [ ] Adicionar `transition-[width]` no aside
- [ ] Adicionar `overflow-hidden` no aside
- [ ] Configurar `onMouseEnter` e `onMouseLeave`
- [ ] Adicionar largura dinâmica (`w-14` ↔ `w-56`)

### Fase 3: Elementos Internos
- [ ] Header: logo com margin fixo (`ml-3`)
- [ ] Header: texto com `w-0 overflow-hidden` quando invisível
- [ ] Nav items: padding fixo (`pl-2 pr-3`)
- [ ] Nav items: labels com `w-0 overflow-hidden` quando invisíveis
- [ ] User menu: avatar sem margin adicional
- [ ] User menu: info com `w-0 overflow-hidden` quando invisível

### Fase 4: Transições
- [ ] Adicionar `transition-opacity duration-200` em textos
- [ ] Adicionar `delay-75` quando expandido
- [ ] Remover delays quando colapsado (transição imediata)
- [ ] Adicionar `pointer-events-none` em elementos invisíveis

### Fase 5: Testes Visuais
- [ ] **Teste da régua:** Alinhar régua com ícone, verificar se não se move
- [ ] Hover múltiplas vezes rapidamente
- [ ] Toggle manual funciona suavemente
- [ ] Estado persiste após refresh (localStorage)
- [ ] Ícones centralizados quando colapsado
- [ ] Labels aparecem suavemente quando expandido

---

## 🧪 Teste da Régua (Visual Test)

**Método definitivo para verificar se os ícones estão fixos:**

1. Abra a aplicação com sidebar colapsada
2. Coloque uma **régua vertical** (ou dedo na tela) alinhada com um ícone
3. Passe o mouse sobre a sidebar (deve expandir)
4. **Verificar:** O ícone **NÃO DEVE SE MOVER** em relação à régua
5. Apenas o conteúdo à direita do ícone deve aparecer
6. Sidebar expande para a direita

**Se o ícone se move em relação à régua = implementação incorreta ❌**
**Se o ícone permanece fixo = implementação correta ✅**

---

## 📱 Responsividade

### Desktop (≥768px)
- Sidebar colapsável funcional
- Hover e toggle funcionam
- Estado persiste em localStorage

### Mobile (<768px)
- Esconder sidebar completamente (`hidden md:flex`)
- Mostrar navegação alternativa (ex: BottomNav)
- Não aplicar lógica de colapso em mobile

```typescript
<aside className="... hidden md:flex ...">
  {/* sidebar */}
</aside>

{/* Mobile navigation */}
<nav className="md:hidden fixed bottom-0 ...">
  {/* bottom nav items */}
</nav>
```

---

## 🎨 Variações e Customizações

### Variação 1: Sidebar Mais Fina

**Largura colapsada:** `w-12` (48px) em vez de `w-14` (56px)

```typescript
// Recalcular padding:
// Sidebar: 48px
// Nav padding: 8px cada lado (px-2)
// Espaço disponível: 48 - 16 = 32px
// Padding para centralizar ícone de 16px: (32 - 16) ÷ 2 = 8px
// Usar: pl-2 (8px)

// Container nav: px-2 (em vez de px-3)
// Nav items: pl-2 pr-2
```

### Variação 2: Ícones Maiores

**Ícones:** `w-5 h-5` (20px) em vez de `w-4 h-4` (16px)

```typescript
// Recalcular padding:
// Sidebar: 56px
// Nav padding: 12px cada lado (px-3)
// Espaço disponível: 32px
// Padding para centralizar ícone de 20px: (32 - 20) ÷ 2 = 6px
// Usar: pl-1.5 (6px)

// Nav items: pl-1.5 pr-3
```

### Variação 3: Transição Mais Rápida

```typescript
// Container: duration-200 (em vez de 300)
// Labels: duration-150 (em vez de 200)
// Delay: delay-50 (em vez de 75)

// Resultado: transição mais snappy, menos suave
```

### Variação 4: Sempre Expandida (Sem Hover)

```typescript
// No hook, desabilitar hover
const handleMouseEnter = () => {
  // Não fazer nada
};

const handleMouseLeave = () => {
  // Não fazer nada - sidebar só muda com toggle manual
};

// Ou remover completamente onMouseEnter/onMouseLeave do aside
```

### Variação 5: Adicionar Delay ao Recolher (300ms)

Se preferir um recolhimento mais "calmo" com delay:

```typescript
const handleMouseLeave = () => {
  hoverTimeoutRef.current = setTimeout(() => {
    setIsHovered(false);
  }, 300); // Delay de 300ms antes de recolher
};
```

**Vantagem:** Mais tolerante a movimentos acidentais do mouse
**Desvantagem:** Menos responsivo

---

## 🔍 Debugging Tips

### Problema: Ícones se movem durante transição

**Causas possíveis:**
1. Padding dinâmico (`px-3` ↔ `px-0`)
2. `justify-center` dinâmico
3. `gap` dinâmico
4. `absolute` positioning dinâmico

**Solução:** Usar padding/margin **fixo** sempre

### Problema: Ícones não centralizados quando colapsado

**Causa:** Padding calculado incorretamente

**Solução:** Recalcular usando fórmula:
```
Padding = (Espaço Disponível - Tamanho Ícone) ÷ 2
```

### Problema: Labels aparecem antes da sidebar expandir

**Causa:** Falta de delay coordenado

**Solução:** Adicionar `delay-75` na classe opacity quando expandido:
```typescript
${isExpanded ? 'opacity-100 delay-75' : 'opacity-0'}
```

### Problema: Transição "trava" ou não é suave

**Causas possíveis:**
1. Faltando `overflow-hidden` no container
2. Transição aplicada em muitas propriedades (`transition-all`)
3. Labels não usam `w-0 overflow-hidden`

**Solução:**
- Usar `transition-[width]` (mais performático)
- Adicionar `overflow-hidden` no aside
- Garantir que labels usam `w-0` quando invisíveis

---

## 🌐 Referências de Inspiração

**Exemplos de sidebars colapsáveis bem implementadas:**
- Supabase Dashboard (referência principal)
- Vercel Dashboard
- Linear App
- GitHub (navegação lateral)

**Características comuns:**
- ✅ Ícones permanecem fixos
- ✅ Transições suaves (300ms)
- ✅ Hover temporário + toggle manual
- ✅ Estado persiste entre sessões

---

## 📄 Exemplo Completo (Template)

```typescript
// useSidebarCollapse.ts
import { useState, useEffect, useRef } from 'react';

export const useSidebarCollapse = () => {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved ? JSON.parse(saved) === true : true;
  });

  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const isExpanded = isHovered || !collapsed;

  const toggleCollapsed = () => setCollapsed(prev => !prev);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
  };

  return {
    collapsed,
    isHovered,
    isExpanded,
    toggleCollapsed,
    handleMouseEnter,
    handleMouseLeave,
  };
};

// Sidebar.tsx
import { useSidebarCollapse } from './hooks/useSidebarCollapse';
import { BookOpen, Home, Settings, ChevronLeft } from 'lucide-react';

const Sidebar = () => {
  const { isExpanded, toggleCollapsed, handleMouseEnter, handleMouseLeave } = useSidebarCollapse();

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 ${isExpanded ? 'w-56' : 'w-14'} bg-white border-r transition-[width] duration-300 ease-in-out overflow-hidden hidden md:flex flex-col`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="flex items-center h-14 border-b">
        <div className="p-1.5 bg-black text-white rounded-md ml-3 shrink-0">
          <BookOpen className="w-4 h-4" />
        </div>
        <span
          className={`font-bold text-base ml-2 whitespace-nowrap transition-opacity duration-200 ${
            isExpanded ? 'opacity-100 delay-75' : 'opacity-0 w-0 overflow-hidden pointer-events-none'
          }`}
        >
          App Name
        </span>
        <div className="flex-1" />
        <button
          onClick={toggleCollapsed}
          className={`p-1.5 mr-3 rounded transition-opacity duration-200 ${
            isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-0.5">
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.path}
            className="flex items-center pl-2 pr-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-gray-100"
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span
              className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${
                isExpanded ? 'opacity-100 delay-75' : 'opacity-0 w-0 overflow-hidden pointer-events-none'
              }`}
            >
              {item.name}
            </span>
          </a>
        ))}
      </nav>

      {/* User Menu */}
      <button className="w-full px-3 py-4 border-t hover:bg-gray-50">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
            U
          </div>
          <div
            className={`flex-1 min-w-0 ml-3 transition-opacity duration-200 ${
              isExpanded ? 'opacity-100 delay-75' : 'opacity-0 w-0 overflow-hidden pointer-events-none'
            }`}
          >
            <p className="text-xs font-medium truncate whitespace-nowrap">User Name</p>
            <p className="text-[10px] text-gray-500 whitespace-nowrap">Free Plan</p>
          </div>
        </div>
      </button>
    </aside>
  );
};

export default Sidebar;
```

---

## 🎓 Conclusão

Implementar uma sidebar colapsável com ícones fixos requer atenção a detalhes matemáticos e técnicas específicas de CSS/React. Os princípios fundamentais são:

1. **Ícones têm posição fixa** (padding/margin constante)
2. **Labels usam `w-0 overflow-hidden`** quando invisíveis
3. **Transições coordenadas** com delays apropriados
4. **Sem mudanças dinâmicas** em padding, gap, ou justify-content
5. **Teste visual** com régua para validar

Seguindo estas diretrizes, você conseguirá replicar sidebars colapsáveis profissionais em qualquer projeto, com a mesma qualidade visual de aplicações como Supabase, Vercel e Linear.

---

**Criado:** 2026-01-05
**Versão:** 1.0
**Projeto:** EVOQUE - Sidebar Retrátil com Ícones Fixos
