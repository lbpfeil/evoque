# Guia de Migração: Biblioteca UI Customizada

Este documento detalha o processo completo de migração dos componentes shadcn/ui atuais do evoque para uma biblioteca UI customizada instalada via npm.

## Índice

1. [Análise Pré-Migração](#1-análise-pré-migração)
2. [Preparação do Ambiente](#2-preparação-do-ambiente)
3. [Instalação da Biblioteca](#3-instalação-da-biblioteca)
4. [Mapeamento de Componentes](#4-mapeamento-de-componentes)
5. [Processo de Migração](#5-processo-de-migração)
6. [Customizações Específicas](#6-customizações-específicas)
7. [Testes e Validação](#7-testes-e-validação)
8. [Rollback e Contingência](#8-rollback-e-contingência)
9. [Checklist Final](#9-checklist-final)

---

## 1. Análise Pré-Migração

### 1.1 Componentes UI Atuais

Inventário completo dos componentes em `components/ui/`:

```bash
components/ui/
├── button.tsx      # Button com variants (default, outline, ghost, etc)
├── command.tsx     # Command palette (usado em TagSelector)
├── dialog.tsx      # Modal dialogs (usado em vários *Modal.tsx)
├── input.tsx       # Input fields
├── popover.tsx     # Popovers (usado em DeleteCardPopover, EmptyDeckPopover)
└── sheet.tsx       # Side sheets (usado em TagManagerSidebar)
```

### 1.2 Arquivos que Importam Componentes UI

Execute para mapear todos os imports:

```bash
# Encontrar todos os imports de componentes UI
grep -r "from ['\"].*\/ui\/" --include="*.tsx" --include="*.ts" components/ pages/ | grep -v "components/ui/"
```

**Arquivos principais identificados:**
- `components/TagManagerSidebar.tsx` - usa Command, Dialog, Sheet
- `components/TagSelector.tsx` - usa Command, Popover
- `pages/Highlights.tsx` - usa Command
- Vários outros arquivos usam Button, Dialog, Input via imports

### 1.3 Dependências Atuais

Verificar no `package.json`:

```json
{
  "@radix-ui/react-dialog": "^x.x.x",
  "@radix-ui/react-popover": "^x.x.x",
  "@radix-ui/react-slot": "^x.x.x",
  // ... outros pacotes Radix UI
  "class-variance-authority": "^x.x.x"
}
```

**⚠️ IMPORTANTE:** Se sua biblioteca já inclui essas dependências, você poderá removê-las após a migração.

### 1.4 Design System do evoque

O evoque usa um design system **muito compacto** (v1.2):

```css
/* TAMANHOS COMPACTOS - 4px base unit */
Buttons: h-7 px-3 text-xs       /* 28px altura vs 40px padrão shadcn */
Inputs: h-7 px-1.5 text-xs      /* 28px altura */
Icons: w-3 h-3                  /* 12px vs 16px padrão */
Gaps: gap-1 (4px), gap-2 (8px)
Padding: py-0.5 px-1.5 (itens)

/* DARK MODE - Obrigatório */
Backgrounds:
  - Light: white (cards), zinc-50 (page)
  - Dark: zinc-900 (cards), zinc-950 (page)

Borders:
  - Light: zinc-200
  - Dark: zinc-800

Text:
  - Light: zinc-900 (primary), zinc-500 (secondary)
  - Dark: zinc-100 (primary), zinc-400 (secondary)
```

**Questões críticas para sua biblioteca:**
- ✅ Suporta dark mode com estratégia `dark:*` do Tailwind?
- ✅ Permite override de tamanhos padrão facilmente?
- ✅ Usa CVA (class-variance-authority) ou similar?
- ✅ É compatível com Tailwind CSS?

---

## 2. Preparação do Ambiente

### 2.1 Criar Branch de Migração

```bash
# Criar branch isolada para a migração
git checkout -b feature/migrate-to-custom-ui-library

# Confirmar que está na branch correta
git branch --show-current
```

### 2.2 Backup dos Componentes Atuais

```bash
# Criar backup da pasta ui/ atual
cp -r components/ui components/ui.backup

# Criar arquivo de inventário
cat > UI_MIGRATION_INVENTORY.md << 'EOF'
# Inventário de Componentes UI - Backup

Data: $(date)
Branch: feature/migrate-to-custom-ui-library

## Componentes Originais (shadcn/ui)
- components/ui/button.tsx
- components/ui/command.tsx
- components/ui/dialog.tsx
- components/ui/input.tsx
- components/ui/popover.tsx
- components/ui/sheet.tsx

## Dependências Radix UI Atuais
$(npm list | grep @radix-ui)
EOF
```

### 2.3 Documentar Estado Atual

```bash
# Tirar screenshots de todas as páginas (manualmente no navegador)
# Páginas para documentar:
# - /login
# - /dashboard
# - /highlights (com filtros abertos)
# - /study (heatmap visível)
# - /study/:bookId (sessão ativa)
# - /settings (todas as 4 tabs)

# Criar pasta para screenshots
mkdir -p docs/migration-screenshots/before
```

---

## 3. Instalação da Biblioteca

### 3.1 Instalar a Biblioteca Customizada

```bash
# Instalar a biblioteca via npm
npm install sua-biblioteca-ui@latest

# OU se for um pacote privado/local
npm install @sua-org/ui-library@latest

# OU se for via Git
npm install git+https://github.com/seu-usuario/sua-biblioteca.git#branch-ou-tag

# Verificar instalação
npm list | grep sua-biblioteca
```

### 3.2 Configurar Path Aliases (se necessário)

Se sua biblioteca requer aliases específicos, adicionar ao `vite.config.ts`:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@ui': path.resolve(__dirname, './node_modules/sua-biblioteca-ui'),
      // ... outros aliases
    }
  }
})
```

E ao `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@ui/*": ["./node_modules/sua-biblioteca-ui/*"]
    }
  }
}
```

### 3.3 Verificar Peer Dependencies

```bash
# Checar se há conflitos de dependências
npm ls

# Se houver warnings de peer dependencies, resolver:
npm install <pacote-faltante>@<versão>
```

---

## 4. Mapeamento de Componentes

### 4.1 Criar Tabela de Mapeamento

Crie um arquivo `UI_COMPONENT_MAPPING.md`:

```markdown
# Mapeamento: shadcn/ui → Sua Biblioteca

| Componente Atual | Import Atual | Componente Novo | Import Novo | Status |
|------------------|--------------|-----------------|-------------|---------|
| Button | `components/ui/button` | Button | `sua-biblioteca-ui/button` | 🔴 Pendente |
| Dialog | `components/ui/dialog` | Dialog | `sua-biblioteca-ui/dialog` | 🔴 Pendente |
| Input | `components/ui/input` | Input | `sua-biblioteca-ui/input` | 🔴 Pendente |
| Command | `components/ui/command` | Command | `sua-biblioteca-ui/command` | 🔴 Pendente |
| Popover | `components/ui/popover` | Popover | `sua-biblioteca-ui/popover` | 🔴 Pendente |
| Sheet | `components/ui/sheet` | Sheet | `sua-biblioteca-ui/sheet` | 🔴 Pendente |

## Props e API

### Button
- ✅ `variant`: default, outline, ghost, destructive, secondary, link
- ✅ `size`: default, sm, lg, icon
- ✅ `asChild`: boolean
- ⚠️ **Verificar**: Sua lib tem os mesmos variants?

### Dialog
- ✅ `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`
- ⚠️ **Verificar**: max-h-[85vh] overflow-y-auto está aplicado?

### Input
- ✅ Aceita todos os props nativos de input
- ⚠️ **Verificar**: Altura h-7 pode ser overrideada?

### Command
- ✅ `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`
- ⚠️ **Verificar**: Usado extensivamente em TagSelector

### Popover
- ✅ `Popover`, `PopoverTrigger`, `PopoverContent`
- ⚠️ **Verificar**: Posicionamento e alinhamento

### Sheet
- ✅ `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle`
- ⚠️ **Verificar**: Animações de slide
```

### 4.2 Testar Componentes Individualmente

Criar arquivo de teste `TEST_NEW_COMPONENTS.tsx` temporário:

```tsx
// TEST_NEW_COMPONENTS.tsx
import React from 'react'
import { Button } from 'sua-biblioteca-ui/button'
import { Dialog, DialogContent, DialogTrigger } from 'sua-biblioteca-ui/dialog'
import { Input } from 'sua-biblioteca-ui/input'
// ... outros imports

export default function TestNewComponents() {
  return (
    <div className="p-8 space-y-4">
      <h1>Teste de Componentes da Nova Biblioteca</h1>

      {/* Testar Button */}
      <div className="space-x-2">
        <Button variant="default">Default</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>

      {/* Testar tamanhos compactos */}
      <div className="space-x-2">
        <Button className="h-7 px-3 text-xs">Compact (h-7)</Button>
        <Input className="h-7 w-48 text-xs" placeholder="Compact input" />
      </div>

      {/* Testar Dark Mode */}
      <div className="p-4 bg-zinc-950 dark">
        <Button className="dark:bg-zinc-900 dark:text-zinc-100">Dark Mode</Button>
        <Input className="dark:bg-zinc-900 dark:border-zinc-800" />
      </div>

      {/* Testar Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <h2>Test Dialog</h2>
          <p>Verificar overflow e scroll</p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

Adicionar rota temporária ao `App.tsx`:

```tsx
// App.tsx
import TestNewComponents from './TEST_NEW_COMPONENTS'

// ... dentro do Router
<Route path="/test-ui" element={<TestNewComponents />} />
```

Acessar `http://localhost:3000/#/test-ui` e validar:
- ✅ Componentes renderizam corretamente
- ✅ Dark mode funciona
- ✅ Tamanhos compactos podem ser aplicados
- ✅ Variants existem
- ✅ Sem erros no console

---

## 5. Processo de Migração

### 5.1 Estratégia: Migração Incremental

**Ordem recomendada** (do mais simples ao mais complexo):

1. ✅ **Input** (mais simples, menos uso)
2. ✅ **Button** (usado em todo lugar, mas simples)
3. ✅ **Popover** (usado em 2-3 lugares)
4. ✅ **Dialog** (usado em vários modais)
5. ✅ **Command** (complexo, usado em TagSelector)
6. ✅ **Sheet** (usado em TagManagerSidebar)

### 5.2 Migração Passo-a-Passo

#### Fase 1: Input

```bash
# 1. Encontrar todos os imports de Input
grep -r "from ['\"].*\/ui\/input" --include="*.tsx" components/ pages/

# Exemplo de resultado:
# pages/Settings.tsx:import { Input } from '../components/ui/input'
# components/HighlightEditModal.tsx:import { Input } from './ui/input'
```

**Para cada arquivo encontrado:**

```typescript
// ANTES
import { Input } from '../components/ui/input'
import { Input } from './ui/input'

// DEPOIS (ajustar path conforme sua biblioteca)
import { Input } from 'sua-biblioteca-ui/input'
```

**Script de substituição automatizada:**

```bash
# Substituir todos os imports de Input
find components pages -name "*.tsx" -type f -exec sed -i \
  's|from ['"'"'"].*\/ui\/input['"'"'"]|from "sua-biblioteca-ui/input"|g' {} +

# Verificar mudanças
git diff components/ pages/
```

**Testar:**
```bash
npm run dev
# Abrir /settings e testar todos os inputs
# Verificar dark mode
# Verificar validação de formulários
```

#### Fase 2: Button

```bash
# 1. Encontrar todos os imports de Button
grep -r "from ['\"].*\/ui\/button" --include="*.tsx" components/ pages/

# 2. Substituir imports
find components pages -name "*.tsx" -type f -exec sed -i \
  's|from ['"'"'"].*\/ui\/button['"'"'"]|from "sua-biblioteca-ui/button"|g' {} +

# 3. Verificar se buttonVariants também é exportado (usado em alguns lugares)
grep -r "buttonVariants" --include="*.tsx" components/ pages/
```

**⚠️ ATENÇÃO:** O evoque usa tamanhos customizados de botão:

```typescript
// Comum no código:
<Button className="h-7 px-3 text-xs">Salvar</Button>

// Verificar se sua biblioteca permite esses overrides
```

**Testar:**
- ✅ Todas as páginas (botões em todos os lugares)
- ✅ Modais (botões de ação)
- ✅ Sidebar (navegação)
- ✅ Hover states
- ✅ Focus states (acessibilidade)
- ✅ Dark mode

#### Fase 3: Popover

```bash
# Arquivos que usam Popover:
# - components/DeleteCardPopover.tsx
# - components/EmptyDeckPopover.tsx
# - components/TagSelector.tsx (se usar)

# Substituir
find components -name "*.tsx" -type f -exec sed -i \
  's|from ['"'"'"].*\/ui\/popover['"'"'"]|from "sua-biblioteca-ui/popover"|g' {} +
```

**Testar:**
- DeleteCardPopover - ao clicar em deletar card durante estudo
- EmptyDeckPopover - ao tentar estudar deck vazio
- Posicionamento correto
- Click outside para fechar

#### Fase 4: Dialog

```bash
# Arquivos com Dialog (muitos *Modal.tsx):
grep -r "from ['\"].*\/ui\/dialog" --include="*.tsx" components/ pages/

# Substituir
find components pages -name "*.tsx" -type f -exec sed -i \
  's|from ['"'"'"].*\/ui\/dialog['"'"'"]|from "sua-biblioteca-ui/dialog"|g' {} +
```

**⚠️ CRÍTICO:** Todos os modais devem ter:

```typescript
<DialogContent className="max-h-[85vh] overflow-y-auto">
  {/* Conteúdo */}
</DialogContent>
```

**Modais para testar:**
- HighlightEditModal
- HighlightHistoryModal
- BookContextModal
- DeleteBookModal
- Qualquer outro modal

**Validações:**
- ✅ Abre e fecha corretamente
- ✅ Scroll interno funciona se conteúdo > 85vh
- ✅ Overlay escurece fundo
- ✅ ESC fecha modal
- ✅ Click fora fecha modal
- ✅ Dark mode

#### Fase 5: Command

```bash
# Usado principalmente em:
# - components/TagSelector.tsx (CRÍTICO - 14k linhas de código)
# - pages/Highlights.tsx

# Substituir
find components pages -name "*.tsx" -type f -exec sed -i \
  's|from ['"'"'"].*\/ui\/command['"'"'"]|from "sua-biblioteca-ui/command"|g' {} +
```

**⚠️ MUITO CRÍTICO:** TagSelector é um componente complexo (400+ linhas) que usa:
- `Command`
- `CommandInput` (busca)
- `CommandList` (lista de resultados)
- `CommandEmpty` (estado vazio)
- `CommandGroup` (agrupamento)
- `CommandItem` (itens individuais)

**Testar extensivamente:**
- Abrir página Highlights
- Abrir selector de tags
- Buscar tags
- Criar novas tags
- Tags hierárquicas (parent/child)
- Keyboard navigation (↑↓ Enter)
- Dark mode

#### Fase 6: Sheet

```bash
# Usado em:
# - components/TagManagerSidebar.tsx

# Substituir
find components -name "*.tsx" -type f -exec sed -i \
  's|from ['"'"'"].*\/ui\/sheet['"'"'"]|from "sua-biblioteca-ui/sheet"|g' {} +
```

**Testar:**
- Abrir TagManager (ícone de tags no Highlights)
- Sheet abre da direita
- Animação suave
- Overlay funciona
- Pode editar/criar/deletar tags
- Dark mode

### 5.3 Remover Componentes Antigos

**SOMENTE APÓS TODOS OS TESTES:**

```bash
# Renomear pasta antiga (não deletar ainda)
mv components/ui components/ui.OLD

# Tentar build
npm run build

# Se houver erros, ainda há imports antigos
# Procurar e corrigir:
grep -r "from ['\"].*\/ui\/" --include="*.tsx" components/ pages/ | grep -v node_modules
```

### 5.4 Remover Dependências Antigas (Opcional)

**Se sua biblioteca já inclui Radix UI:**

```bash
# Listar Radix UI atual
npm list | grep @radix-ui

# Remover pacotes não mais necessários
npm uninstall @radix-ui/react-dialog
npm uninstall @radix-ui/react-popover
npm uninstall @radix-ui/react-slot
# ... outros que sua lib já inclui

# Remover CVA se não mais necessário
npm uninstall class-variance-authority

# Verificar que tudo ainda funciona
npm run dev
npm run build
```

---

## 6. Customizações Específicas

### 6.1 Dark Mode

**Verificar se sua biblioteca:**
1. Usa a estratégia `dark:` do Tailwind
2. Tem as cores certas do evoque

**Se precisar ajustar cores globalmente**, adicionar ao `tailwind.config.js`:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Confirmar que está usando 'class'
  theme: {
    extend: {
      colors: {
        // Se sua biblioteca usa nomes diferentes, mapear aqui
        'ui-bg-card': {
          DEFAULT: 'white',
          dark: '#18181b' // zinc-900
        },
        'ui-bg-page': {
          DEFAULT: '#fafafa', // zinc-50
          dark: '#09090b' // zinc-950
        }
      }
    }
  }
}
```

**Componente ThemeToggle:**

O evoque tem `components/ThemeToggle.tsx` que gerencia o tema. Verificar se continua funcionando:

```tsx
// Deve aplicar/remover classe 'dark' no <html>
// Verificar que seus componentes respondem corretamente
```

### 6.2 Tamanhos Compactos

**Se sua biblioteca tem tamanhos maiores por padrão**, criar wrapper layer:

```typescript
// components/ui-adapters/CompactButton.tsx
import { Button as LibButton, ButtonProps } from 'sua-biblioteca-ui/button'
import { cn } from '../../lib/utils'

export const Button = ({ className, size, ...props }: ButtonProps) => {
  // Aplicar tamanhos compactos por padrão
  const compactClasses = size === 'default' ? 'h-7 px-3 text-xs' : ''

  return (
    <LibButton
      className={cn(compactClasses, className)}
      size={size}
      {...props}
    />
  )
}

// Exportar outros componentes também
export * from 'sua-biblioteca-ui/button'
```

Então usar este adapter:

```typescript
// Ao invés de importar direto da lib
import { Button } from 'sua-biblioteca-ui/button'

// Importar do adapter
import { Button } from './ui-adapters/CompactButton'
```

### 6.3 Customizações de Dialog

Todos os Dialogs do evoque precisam de `max-h-[85vh]`:

```typescript
// components/ui-adapters/CompactDialog.tsx
import {
  Dialog as LibDialog,
  DialogContent as LibDialogContent,
  DialogContentProps
} from 'sua-biblioteca-ui/dialog'
import { cn } from '../../lib/utils'

export const Dialog = LibDialog

export const DialogContent = ({ className, ...props }: DialogContentProps) => {
  return (
    <LibDialogContent
      className={cn('max-h-[85vh] overflow-y-auto', className)}
      {...props}
    />
  )
}

// Re-exportar outros subcomponents
export * from 'sua-biblioteca-ui/dialog'
```

### 6.4 Ícones

O evoque usa ícones de `lucide-react`. Verificar se sua biblioteca:
- Também usa lucide-react (ideal)
- Usa outro pack de ícones (requer adaptação)

```typescript
// Comum no código:
import { Search, Plus, X, Check } from 'lucide-react'

// Se sua lib usa outros ícones, criar adapter:
import { SearchIcon as Search } from 'sua-biblioteca-ui/icons'
```

---

## 7. Testes e Validação

### 7.1 Checklist de Teste Manual

**Páginas:**

- [ ] `/login` - Login page
  - [ ] Inputs funcionam
  - [ ] Botão de login funciona
  - [ ] Dark mode

- [ ] `/dashboard` - Dashboard
  - [ ] Cards renderizam
  - [ ] Dark mode

- [ ] `/highlights` - Highlights page
  - [ ] Tabela de highlights
  - [ ] Filtros funcionam
  - [ ] TagSelector abre e funciona
  - [ ] Busca funciona
  - [ ] Edit modal abre (Dialog)
  - [ ] History modal abre (Dialog)
  - [ ] Delete funciona
  - [ ] Dark mode

- [ ] `/study` - Study page
  - [ ] DeckTable renderiza
  - [ ] Heatmap renderiza (componente próprio)
  - [ ] Botões de "Study" funcionam
  - [ ] EmptyDeckPopover funciona
  - [ ] Dark mode

- [ ] `/study/:bookId` - Study session
  - [ ] Card renderiza
  - [ ] Botões de rating (1-4)
  - [ ] Keyboard shortcuts (1,2,3,4, Space, Enter, E)
  - [ ] Undo (Ctrl+Z)
  - [ ] DeleteCardPopover funciona
  - [ ] Edit modal funciona
  - [ ] Progress bar funciona
  - [ ] Dark mode

- [ ] `/settings` - Settings
  - [ ] Tab navigation funciona
  - [ ] **Import tab:**
    - [ ] File upload funciona
    - [ ] Botões funcionam
  - [ ] **Library tab:**
    - [ ] Lista de livros
    - [ ] Book settings modal (Dialog)
    - [ ] Delete book modal (Dialog)
  - [ ] **Account tab:**
    - [ ] Avatar upload
    - [ ] Inputs funcionam
    - [ ] Save funciona
  - [ ] **Preferences tab:**
    - [ ] ThemeToggle funciona
    - [ ] Inputs funcionam
  - [ ] Dark mode

**Componentes Específicos:**

- [ ] Sidebar (desktop)
  - [ ] Navegação funciona
  - [ ] Collapse/expand
  - [ ] Dark mode

- [ ] BottomNav (mobile)
  - [ ] Ícones corretos
  - [ ] Navegação funciona
  - [ ] Dark mode

- [ ] TagManagerSidebar
  - [ ] Sheet abre
  - [ ] Criar tag funciona
  - [ ] Editar tag funciona
  - [ ] Deletar tag funciona
  - [ ] Tags hierárquicas funcionam
  - [ ] Dark mode

- [ ] StudyHeatmap
  - [ ] Renderiza corretamente
  - [ ] Cores corretas
  - [ ] Tooltips funcionam
  - [ ] Responsive
  - [ ] Dark mode

- [ ] StudyStatusBadge
  - [ ] Cores corretas (new/learning/review)
  - [ ] Ícones corretos
  - [ ] Dark mode

### 7.2 Teste de Build

```bash
# Build de produção
npm run build

# Verificar erros
# Verificar avisos
# Verificar tamanho do bundle

# Preview do build
npm run preview

# Testar novamente todas as páginas
```

### 7.3 Testes Automatizados (se houver)

```bash
# Se o projeto tiver testes
npm test

# Atualizar snapshots se necessário
npm test -- -u
```

### 7.4 Teste de Acessibilidade

- [ ] Navegação por teclado funciona (Tab, Shift+Tab)
- [ ] Focus visível em todos os elementos interativos
- [ ] Screen reader (testar com NVDA ou VoiceOver)
- [ ] Contraste de cores adequado (usar DevTools)

### 7.5 Teste de Performance

```bash
# DevTools → Lighthouse
# - Performance: > 90
# - Accessibility: > 95
# - Best Practices: > 90

# Verificar que não houve regressão após migração
```

---

## 8. Rollback e Contingência

### 8.1 Se Algo Der Errado

**Opção 1: Rollback completo**

```bash
# Descartar todas as mudanças
git checkout main
git branch -D feature/migrate-to-custom-ui-library

# Ou se já comitou
git revert <commit-hash>
```

**Opção 2: Restaurar componentes antigos**

```bash
# Se moveu ui/ para ui.OLD
mv components/ui.OLD components/ui

# Reinstalar dependências antigas se removeu
npm install @radix-ui/react-dialog @radix-ui/react-popover # etc

# Reverter imports
# (Usar git diff para ver o que mudou e reverter)
```

**Opção 3: Rollback parcial (manter alguns componentes novos)**

```bash
# Se Button funcionou mas Dialog não
# Reverter apenas Dialog:

# 1. Restaurar arquivo antigo
git checkout main -- components/ui/dialog.tsx

# 2. Reverter imports de Dialog
find components pages -name "*.tsx" -type f -exec sed -i \
  's|from "sua-biblioteca-ui/dialog"|from "./ui/dialog"|g' {} +

# 3. Testar
npm run dev
```

### 8.2 Plano B: Camada de Abstração

Se houver incompatibilidades grandes, criar camada intermediária:

```typescript
// components/ui/index.ts - API unificada
export { Button } from './adapters/Button'
export { Dialog } from './adapters/Dialog'
// ...

// components/ui/adapters/Button.tsx
import { Button as NewButton } from 'sua-biblioteca-ui/button'
// Aplicar todas as customizações necessárias aqui

// Importar em todo código como:
import { Button, Dialog } from '@/components/ui'
```

---

## 9. Checklist Final

### Antes de Merge para Main

- [ ] ✅ Todos os componentes migrados
- [ ] ✅ Todos os testes manuais passaram
- [ ] ✅ Build de produção sem erros
- [ ] ✅ Dark mode funciona 100%
- [ ] ✅ Tamanhos compactos preservados
- [ ] ✅ Performance não regrediu
- [ ] ✅ Acessibilidade mantida
- [ ] ✅ Screenshots "depois" tiradas
- [ ] ✅ Documentação atualizada
- [ ] ✅ `components/ui.OLD` e `components/ui.backup` removidos
- [ ] ✅ Dependências antigas removidas (se aplicável)
- [ ] ✅ `package.json` e `package-lock.json` commitados
- [ ] ✅ Code review feito (se trabalhar em equipe)

### Atualizar Documentação

```bash
# Atualizar CLAUDE.md
```

```markdown
## Core Architecture

### UI Component Library

**Migrated to Custom Library** (Data: YYYY-MM-DD)
- Using: `sua-biblioteca-ui` (versão X.X.X)
- Previous: shadcn/ui with Radix UI
- Components: Button, Dialog, Input, Command, Popover, Sheet
- Customizations: Dark mode + compact design system (see Design System v1.2)
```

### Commit Final

```bash
# Commitar tudo
git add .
git commit -m "feat: migrate UI components to custom library

BREAKING CHANGE: Replaced shadcn/ui components with sua-biblioteca-ui

- Migrated all 6 UI components (Button, Dialog, Input, Command, Popover, Sheet)
- Preserved dark mode functionality
- Maintained compact design system (h-7 buttons, text-xs)
- All manual tests passed
- Build successful
- No performance regression

Migration details in MIGRATION_CUSTOM_UI_LIBRARY.md"

# Push
git push -u origin feature/migrate-to-custom-ui-library
```

### Criar Pull Request

```bash
# Usar gh CLI se disponível
gh pr create \
  --title "feat: migrate UI components to custom library" \
  --body "$(cat <<'EOF'
## Migração: shadcn/ui → sua-biblioteca-ui

### Resumo
Migração completa dos componentes UI para biblioteca customizada mantendo toda funcionalidade existente.

### Componentes Migrados
- ✅ Button
- ✅ Dialog
- ✅ Input
- ✅ Command
- ✅ Popover
- ✅ Sheet

### Testes Realizados
- ✅ Todas as páginas testadas manualmente
- ✅ Dark mode verificado
- ✅ Design compacto preservado
- ✅ Build de produção: sucesso
- ✅ Performance mantida

### Screenshots
Before/After disponíveis em `docs/migration-screenshots/`

### Documentação
Processo completo documentado em `MIGRATION_CUSTOM_UI_LIBRARY.md`

### Breaking Changes
Nenhum para usuários finais. Apenas mudança de dependências internas.

### Checklist
- [x] Todos os testes passaram
- [x] Documentação atualizada
- [x] Build sem erros
- [x] Code review requested
EOF
)" \
  --base main \
  --head feature/migrate-to-custom-ui-library
```

---

## Apêndice A: Troubleshooting

### Problema: Import errors após migração

```bash
# Erro: Cannot find module 'sua-biblioteca-ui/button'

# Solução 1: Verificar nome correto do pacote
npm list | grep sua-biblioteca

# Solução 2: Verificar exports no package.json da lib
cat node_modules/sua-biblioteca-ui/package.json | grep exports

# Solução 3: Ajustar imports conforme exports da lib
# Se a lib exporta como:
import { Button } from 'sua-biblioteca-ui'
# Ao invés de:
import { Button } from 'sua-biblioteca-ui/button'
```

### Problema: Estilos não aplicam

```bash
# Verificar que Tailwind está processando node_modules
# tailwind.config.js:
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
  "./components/**/*.{js,ts,jsx,tsx}",
  "./pages/**/*.{js,ts,jsx,tsx}",
  "./node_modules/sua-biblioteca-ui/**/*.{js,ts,jsx,tsx}", // ← Adicionar
],
```

### Problema: Dark mode não funciona

```typescript
// Verificar que sua lib usa mesma estratégia

// evoque usa:
<div className="dark:bg-zinc-900">

// Sua lib deve responder à classe 'dark' no <html>:
// <html class="dark">

// Verificar ThemeToggle:
document.documentElement.classList.toggle('dark')
```

### Problema: TypeScript errors

```bash
# Instalar types se necessário
npm install -D @types/sua-biblioteca-ui

# Ou se tipos não existem, criar declarações:
// types/sua-biblioteca-ui.d.ts
declare module 'sua-biblioteca-ui/button' {
  export * from 'sua-biblioteca-ui'
}
```

### Problema: Build muito grande

```bash
# Verificar se há duplicação de dependências
npm ls @radix-ui/react-dialog
# Se aparecer 2x, há duplicação

# Resolver com resolutions (npm 8.3+)
# package.json:
{
  "overrides": {
    "@radix-ui/react-dialog": "1.0.5"
  }
}
```

---

## Apêndice B: Scripts Úteis

### Script para encontrar todos os imports

```bash
#!/bin/bash
# find-ui-imports.sh

echo "=== Componentes UI Importados ==="
echo ""

for component in button dialog input command popover sheet; do
  echo "📦 $component:"
  grep -r "from ['\"].*\/ui\/$component" --include="*.tsx" components/ pages/ 2>/dev/null | \
    cut -d: -f1 | sort -u | sed 's/^/  - /'
  echo ""
done
```

### Script para substituir imports em massa

```bash
#!/bin/bash
# replace-imports.sh

LIBRARY_NAME="sua-biblioteca-ui"

components=("button" "dialog" "input" "command" "popover" "sheet")

for component in "${components[@]}"; do
  echo "Substituindo imports de $component..."

  find components pages -name "*.tsx" -type f -exec sed -i \
    "s|from ['\"].*\/ui\/$component['\"]|from \"$LIBRARY_NAME/$component\"|g" {} +
done

echo "✅ Substituição completa!"
echo "⚠️  Executar: git diff para revisar mudanças"
```

### Script para validar migração

```bash
#!/bin/bash
# validate-migration.sh

echo "🔍 Validando migração..."
echo ""

# Verificar se ainda há imports antigos
OLD_IMPORTS=$(grep -r "from ['\"].*\/ui\/" --include="*.tsx" components/ pages/ 2>/dev/null | grep -v "node_modules" | wc -l)

if [ $OLD_IMPORTS -gt 0 ]; then
  echo "❌ Ainda há $OLD_IMPORTS imports antigos:"
  grep -r "from ['\"].*\/ui\/" --include="*.tsx" components/ pages/ 2>/dev/null | grep -v "node_modules"
else
  echo "✅ Todos os imports foram migrados!"
fi

echo ""

# Tentar build
echo "🏗️  Testando build..."
npm run build 2>&1 | tail -n 20

if [ $? -eq 0 ]; then
  echo "✅ Build bem sucedido!"
else
  echo "❌ Build falhou!"
  exit 1
fi
```

---

## Apêndice C: Comparação Antes/Depois

### Estrutura de Arquivos

**ANTES:**
```
components/
├── ui/
│   ├── button.tsx          # 57 linhas - mantido localmente
│   ├── dialog.tsx          # 142 linhas - mantido localmente
│   ├── input.tsx           # 34 linhas - mantido localmente
│   ├── command.tsx         # 190 linhas - mantido localmente
│   ├── popover.tsx         # 44 linhas - mantido localmente
│   └── sheet.tsx           # 158 linhas - mantido localmente
└── [outros componentes]

node_modules/
├── @radix-ui/react-dialog/
├── @radix-ui/react-popover/
├── @radix-ui/react-slot/
└── class-variance-authority/
```

**DEPOIS:**
```
components/
├── ui/ (REMOVIDO ou vazio)
│   └── [pode manter adapters se necessário]
└── [outros componentes]

node_modules/
└── sua-biblioteca-ui/
    ├── button/
    ├── dialog/
    ├── input/
    ├── command/
    ├── popover/
    └── sheet/
```

### Exemplo de Import

**ANTES:**
```typescript
// components/TagSelector.tsx
import { Command, CommandInput, CommandList } from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
```

**DEPOIS:**
```typescript
// components/TagSelector.tsx
import { Command, CommandInput, CommandList } from 'sua-biblioteca-ui/command'
import { Popover, PopoverContent, PopoverTrigger } from 'sua-biblioteca-ui/popover'
import { Button } from 'sua-biblioteca-ui/button'
```

### Benefícios

✅ **Consistência:** Mesmos componentes em todos os seus projetos
✅ **Manutenção:** Correções/melhorias em um lugar só
✅ **Novos componentes:** Automaticamente disponíveis no evoque
✅ **Versionamento:** Controle centralizado de versões
✅ **Testing:** Componentes já testados em outro projeto

---

## Conclusão

Este guia fornece um processo completo e incremental para migrar o evoque para sua biblioteca customizada.

**Tempo estimado:** 6-10 horas de trabalho

**Recomendações finais:**
1. ⏰ Reserve tempo dedicado (não fazer "entre outras tarefas")
2. 🧪 Teste MUITO (evoque é complexo, bugs podem ser sutis)
3. 📸 Documente com screenshots (antes/depois)
4. 🔄 Faça commits pequenos e frequentes
5. 🎯 Siga a ordem recomendada (Input → Button → etc)
6. ⚠️ Mantenha backup até ter 100% de certeza

**Questões? Problemas não cobertos?**
- Consultar documentação da sua biblioteca
- Testar componente isoladamente primeiro
- Criar issue no repositório da biblioteca se bug encontrado

Boa sorte com a migração! 🚀
