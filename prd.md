
Atualmente, os highlights do Kindle ficam dispersos no arquivo MyClippings.txt, sem uma estrutura eficiente para revisão e aprendizado. Este produto oferece uma solução completa que vai além da simples organização, integrando um sistema de repetição espaçada que transforma highlights passivos em conhecimento ativo e duradouro.

### 1.2 Problema

**Problema principal:** Leitores que utilizam Kindle acumulam centenas ou milhares de highlights ao longo do tempo, mas não possuem uma ferramenta adequada para:
- Organizar e categorizar esses highlights de forma eficiente
- Revisar periodicamente o conteúdo destacado
- Transformar highlights em conhecimento retido a longo prazo
- Acompanhar seu progresso de leitura e aprendizado
- Acessar seus highlights de qualquer dispositivo

**Problemas secundários:**
- O arquivo MyClippings.txt é apenas texto puro, sem estrutura visual
- Identificar novos highlights entre importações é manual e trabalhoso
- Não há contexto visual (capas, autores) associado aos highlights
- A sincronização com aplicativos de repetição espaçada (como Anki) é manual e fragmentada

### 1.3 Solução

Uma aplicação web que oferece:
- **Importação inteligente** do MyClippings.txt com detecção automática de novos conteúdos
- **Biblioteca visual** organizando highlights por livros com capas e metadados
- **Sistema de estudo integrado** baseado em repetição espaçada (algoritmo SM-2)
- **Interface moderna e limpa** inspirada em dashboards de analytics contemporâneos
- **Analytics e insights** sobre padrões de leitura e progresso de aprendizado
- **Experiência responsiva** acessível de qualquer dispositivo

### 1.4 Princípios do Produto

1. **Robustez:** O sistema deve ser confiável, nunca perder dados do usuário e lidar graciosamente com arquivos MyClippings.txt de diferentes tamanhos e formatos
2. **Simplicidade Estética:** Design minimalista, clean, com uso estratégico de white space e tipografia hierárquica
3. **Modernidade Visual:** Interfaces inspiradas em produtos SaaS contemporâneos, com gráficos elegantes e microinterações sutis
4. **Fluidez de UX:** Transições suaves, feedback visual imediato, estados de carregamento informativos
5. **Funcionalidade Focada:** Cada feature deve servir diretamente ao objetivo de transformar highlights em conhecimento retido

---

## 2. OBJETIVOS E MÉTRICAS

### 2.1 Objetivos de Negócio

**Objetivo Primário:**  
Criar uma ferramenta indispensável para leitores Kindle que valorizam aprendizado contínuo, estabelecendo o produto como a solução definitiva para gestão de highlights.

**Objetivos Secundários:**
- Alcançar 1.000 usuários ativos nos primeiros 6 meses
- Taxa de retenção de 40% após 30 dias
- Média de 3+ sessões de estudo por usuário por semana

### 2.2 Métricas de Sucesso

**Métricas de Engajamento:**
- Daily Active Users (DAU) / Monthly Active Users (MAU)
- Frequência de importações de MyClippings.txt
- Número médio de sessões de estudo por semana
- Taxa de conclusão de sessões de estudo
- Tempo médio por sessão de estudo

**Métricas de Crescimento:**
- Novos registros por semana
- Taxa de conversão de visitante → registro
- Taxa de retenção D1, D7, D30
- Churn rate mensal

**Métricas de Qualidade:**
- Net Promoter Score (NPS)
- Taxa de highlights editados/personalizados
- Número de tags criadas por usuário
- Utilização de features (heatmap, analytics, etc.)

---

## 3. PÚBLICO-ALVO

### 3.1 Persona Primária: "O Leitor Produtivo"

**Demográfico:**
- Idade: 25-45 anos
- Profissão: Profissionais de conhecimento (desenvolvedores, designers, consultores, pesquisadores, empreendedores)
- Educação: Superior completo ou em andamento
- Tech-savvy: Confortável com aplicações web e conceitos de produtividade

**Comportamento:**
- Lê 15-50 livros por ano, majoritariamente não-ficção
- Faz highlights ativamente durante leitura
- Valoriza aprendizado contínuo e desenvolvimento pessoal
- Já utilizou ou utiliza sistemas de repetição espaçada (Anki, RemNote)
- Busca ferramentas que otimizem seu workflow de aprendizado

**Objetivos:**
- Reter informações importantes de livros lidos
- Ter acesso rápido a insights de múltiplos livros
- Estabelecer hábito de revisão consistente
- Visualizar seu progresso de leitura e aprendizado

**Dores:**
- Esquece 80% do que lê em poucas semanas
- Highlights ficam "perdidos" no dispositivo Kindle
- Processo manual de exportar para Anki é tedioso
- Falta visibilidade sobre quais livros já revisou

### 3.2 Persona Secundária: "O Acadêmico"

**Demográfico:**
- Idade: 22-35 anos
- Profissão: Estudantes de pós-graduação, pesquisadores, professores
- Lê artigos acadêmicos e livros técnicos no Kindle

**Necessidades Específicas:**
- Organização por temas de pesquisa (via tags)
- Exportação de highlights para citações
- Busca avançada por termos técnicos

---

## 4. FUNCIONALIDADES DETALHADAS

### 4.1 AUTENTICAÇÃO E ONBOARDING

#### 4.1.1 Tela de Login/Cadastro

**Requisitos Funcionais:**
- Login via email/senha com validação
- Opção de "Login com Google" (via Supabase Auth)
- Recuperação de senha via email
- Formulário de cadastro minimalista (nome, email, senha)
- Validações em tempo real com feedback visual

**Design:**
- Layout split-screen: lado esquerdo com formulário, lado direito com ilustração/value proposition
- Campos de input com estados hover, focus e error bem definidos
- Botão CTA destacado com micro-animação no hover
- Link "Esqueci minha senha" discreto mas acessível

**Fluxo de Onboarding:**
1. Após primeiro login, modal de boas-vindas explicando o conceito
2. Tour guiado (opcional, pulável) destacando:
   - Como importar MyClippings.txt
   - Como funciona o sistema de estudo
   - Como personalizar livros (capa, nome)
3. CTA para fazer primeira importação

#### 4.1.2 Estados de Sessão

- Sessão mantida por 30 dias (remember me)
- Auto-logout após 7 dias de inatividade
- Sincronização automática entre abas abertas

---

### 4.2 IMPORTAÇÃO DE HIGHLIGHTS

#### 4.2.1 Interface de Upload

**Requisitos Funcionais:**
- Drag & drop zone para arquivo MyClippings.txt
- Botão alternativo "Escolher arquivo" para upload tradicional
- Validação do formato do arquivo (deve ser .txt)
- Preview dos primeiros highlights detectados antes de confirmar importação
- Sistema de detecção de novos highlights baseado em timestamp

**Lógica de Detecção de Novos Highlights:**
```
SE (data_highlight > última_data_importação_usuário):
    ENTÃO: highlight é NOVO
SENÃO:
    highlight é DUPLICADO (não importar)
```

**Feedback Visual:**
- Durante upload: barra de progresso animada
- Após parsing: card resumo mostrando:
  - X novos highlights detectados
  - Y livros novos
  - Z livros atualizados
- Lista expansível dos novos highlights por livro

**Tratamento de Erros:**
- Arquivo vazio: "O arquivo está vazio. Verifique se é o MyClippings.txt correto."
- Formato inválido: "Não foi possível processar o arquivo. Certifique-se de que é o MyClippings.txt do seu Kindle."
- Nenhum highlight novo: "Nenhum highlight novo detectado. Todos os highlights já foram importados anteriormente."

#### 4.2.2 Parser do MyClippings.txt

**Estrutura do Arquivo Kindle:**
```
Título do Livro (Autor)
- Your Highlight on page X | location Y-Z | Added on Data
Texto do highlight

Nota (se existir)
```

**Dados Extraídos:**
- `book_title`: String (título do livro)
- `book_author`: String (autor)
- `highlight_text`: String (pergunta no sistema de estudo)
- `note_text`: String | null (resposta no sistema de estudo)
- `location`: String (página/localização)
- `kindle_date`: DateTime (quando foi destacado no Kindle)
- `imported_at`: DateTime (quando foi importado no app)

**Tratamento de Edge Cases:**
- Livros sem autor identificado: autor = "Desconhecido"
- Highlights sem nota: note_text = null
- Caracteres especiais e encoding UTF-8

---

### 4.3 DASHBOARD PRINCIPAL

#### 4.3.1 Layout Geral

**Estrutura Visual:**
```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR (250px)     │     MAIN CONTENT AREA           │
│                      │                                   │
│  Logo                │  Header: [Título da Página]      │
│  [Avatar]            │          [Actions]                │
│                      │                                   │
│  📊 Dashboard        │  ┌─────────────────────────────┐ │
│  📚 Biblioteca       │  │                             │ │
│  🎯 Estudo           │  │     Conteúdo Dinâmico      │ │
│  📈 Estatísticas     │  │                             │ │
│  🏷️  Tags            │  │                             │ │
│  ⚙️  Configurações   │  │                             │ │
│                      │  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Inspiração de Design (baseado na imagem fornecida):**
- Sidebar escura com ícones e labels clean
- Área principal com background claro (#FAFBFC)
- Cards com sombras sutis e bordas suaves
- Uso estratégico de azul primário (#4169E1) para CTAs
- Gráficos com cores suaves e gradientes

#### 4.3.2 Página Dashboard (Home)

**Widgets Principais:**

**1. Card "Resumo Geral"** (topo)
- Total de livros importados
- Total de highlights
- Highlights em estudo (% do total)
- Streak de dias estudando consecutivamente

**2. Gráfico "Timeline de Highlights"** (estilo área chart)
- Eixo X: últimos 6 meses
- Eixo Y: número de highlights importados
- Visualização suave e colorida (gradiente azul)
- Tooltip ao hover mostrando número exato e data

**3. Gráfico "Heatmap de Leitura"**
- Inspirado no GitHub contributions
- Grid de dias do ano (últimos 365 dias)
- Intensidade de cor baseada em highlights do dia
- Tooltip: "X highlights em DD/MM/YYYY"

**4. Card "Atividade de Estudo"** (gráfico de linha)
- Cards revisados por semana (últimas 8 semanas)
- Duas linhas: "Cards Novos" vs "Revisões"
- Cores distintas para cada métrica

**5. Widget "Livros Recentes"**
- Grid horizontal com últimos 5 livros importados
- Cada card mostra: capa (thumb), título, autor, nº highlights
- Click leva para página do livro específico

**Ações Rápidas (Header):**
- Botão "Importar Highlights" (CTA primário)
- Botão "Iniciar Estudo" (CTA secundário)
- Data/hora atual
- Avatar do usuário (dropdown com logout)

---

### 4.4 BIBLIOTECA DE LIVROS

#### 4.4.1 Visualização e Navegação

**Modos de Visualização:**
- **Grid View** (padrão): Cards 3-4 colunas com capas grandes
- **List View**: Lista compacta com capa pequena, título, autor, stats inline

**Card de Livro (Grid):**
```
┌─────────────────────┐
│                     │
│   [Capa do Livro]   │
│      300x400        │
│                     │
├─────────────────────┤
│ Título do Livro     │
│ por Autor           │
│                     │
│ 🔖 45 highlights    │
│ 📚 12 em estudo     │
│ ✅ 8 dominados      │
└─────────────────────┘
```

**Funcionalidades:**
- Hover: elevação do card + opacidade reduzida
- Click no card: abre página detalhada do livro
- Menu "..." (3 dots) no canto superior direito:
  - Editar informações
  - Ver todos os highlights
  - Iniciar sessão de estudo
  - Excluir livro (com confirmação)

#### 4.4.2 Filtros e Busca

**Barra de Busca:**
- Input com ícone de lupa
- Busca em tempo real (debounced 300ms)
- Busca por: título, autor, highlight text, tags

**Filtros Laterais:**
- **Por Status de Estudo:**
  - Todos
  - Não iniciados
  - Em andamento
  - Dominados (100% revisado)
  
- **Por Período de Importação:**
  - Última semana
  - Último mês
  - Último ano
  - Personalizado (date picker)

- **Por Tags:**
  - Lista de checkboxes das tags criadas
  - Contador de livros por tag

- **Ordenação:**
  - Mais recentes
  - Mais antigos
  - Título (A-Z)
  - Maior nº de highlights

#### 4.4.3 Página Detalhada do Livro

**Header do Livro:**
```
┌──────────────────────────────────────────────────────┐
│  [Capa]  │  Título do Livro                          │
│  200x300 │  Autor                                     │
│          │  📅 Importado em: DD/MM/YYYY              │
│          │  🔖 X highlights | 📝 Y com notas         │
│          │                                            │
│          │  [Iniciar Estudo] [Editar Livro]         │
└──────────────────────────────────────────────────────┘
```

**Lista de Highlights:**
- Visualização tipo "caderno virtual"
- Cada highlight em um card expansível:
  - Highlight text (destaque visual)
  - Nota pessoal (se existir) em estilo italic/diferenciado
  - Data do highlight
  - Localização no livro
  - Tags associadas
  - Botões: Editar | Adicionar/Remover do estudo

**Modo de Edição Rápida:**
- Click duplo em qualquer highlight para editar inline
- ESC para cancelar, Enter para salvar
- Feedback visual de salvamento automático

---

### 4.5 SISTEMA DE TAGS

#### 4.5.1 Criação e Gestão de Tags

**Interface de Tags:**
- Página dedicada listando todas as tags criadas
- Cada tag mostra:
  - Nome da tag
  - Cor (selecionável de paleta pré-definida)
  - Número de highlights associados
  - Número de livros que contém a tag

**Criação de Nova Tag:**
- Modal ou inline form
- Input para nome (máx 30 caracteres)
- Color picker com paleta de 12 cores pré-definidas
- Validação: não permitir tags duplicadas (case insensitive)

**Aplicação de Tags:**
- Na página do livro: selecionar múltiplos highlights e aplicar tag em lote
- Na edição individual: campo com autocomplete das tags existentes
- Criar nova tag on-the-fly durante edição

#### 4.5.2 Filtros por Tags

- Biblioteca: filtrar livros que contém X tag
- Busca global: encontrar todos os highlights com tag Y
- Estudo: opção de estudar apenas highlights de uma tag específica

---

### 4.6 SISTEMA DE ESTUDO INTEGRADO

#### 4.6.1 Algoritmo de Repetição Espaçada (SM-2)

**Implementação do SM-2:**

O algoritmo SM-2 (SuperMemo 2) calcula o próximo intervalo de revisão baseado na facilidade (ease factor) e no número de repetições.

**Parâmetros Iniciais:**
- `ease_factor`: 2.5 (inicial)
- `interval`: 0 (dias até próxima revisão)
- `repetitions`: 0 (número de vezes que o card foi respondido corretamente)

**Lógica de Atualização:**

Quando usuário clica **"Próximo"** (resposta correta):
```
SE repetitions == 0:
    interval = 1 dia
SE repetitions == 1:
    interval = 6 dias
SE repetitions >= 2:
    interval = interval_anterior * ease_factor

repetitions += 1
ease_factor = ease_factor (sem alteração neste caso simplificado)
```

Quando usuário clica **"Repetir"** (resposta incorreta):
```
repetitions = 0
interval = 0
ease_factor = ease_factor (mantido)
next_review_date = hoje (card volta para fila de hoje)
```

**Armazenamento no Banco (tabela `study_cards`):**
```sql
- id
- highlight_id (FK)
- ease_factor (float)
- interval (int - dias)
- repetitions (int)
- next_review_date (date)
- last_reviewed_at (timestamp)
- created_at
```

#### 4.6.2 Interface de Estudo

**Seleção de Deck/Livro:**
- Modal ou página de seleção antes de iniciar estudo
- Opções:
  - Estudar todos os cards pendentes (de todos os livros)
  - Estudar apenas livro X
  - Estudar apenas tag Y
  - Estudo rápido (10 cards aleatórios)

**Layout da Sessão de Estudo:**
```
┌──────────────────────────────────────────────────┐
│  [Capa do Livro] Título do Livro                 │
│                                                   │
│  Progresso da sessão: [████████░░] 8/10          │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│                                                   │
│                                                   │
│              [Texto do Highlight]                │
│                  (PERGUNTA)                       │
│                                                   │
│                                                   │
└──────────────────────────────────────────────────┘

                  [Mostrar Resposta]


            (após revelar resposta)

┌──────────────────────────────────────────────────┐
│                                                   │
│              [Texto da Nota/Resposta]            │
│                                                   │
└──────────────────────────────────────────────────┘

          [Repetir]            [Próximo]
```

**Comportamento:**
1. Card aparece mostrando apenas o Highlight (pergunta)
2. Usuário tenta lembrar a resposta mentalmente
3. Click em "Mostrar Resposta" revela a nota
4. Usuário escolhe:
   - **"Repetir"**: não lembrou ou lembrou incorretamente → card reseta
   - **"Próximo"**: lembrou corretamente → card avança no algoritmo

**Detalhes Visuais:**
- Capa do livro sempre visível no topo (thumb 80x120)
- Transição suave entre cards (fade in/out)
- Barra de progresso animada
- Feedback visual ao clicar botões (ripple effect)
- Possibilidade de pular card (botão discreto no topo)
- Botão "Sair" com confirmação se sessão não finalizada

#### 4.6.3 Lógica de Fila de Estudo

**Critérios para Card Aparecer na Fila:**
- `next_review_date <= hoje`

**Ordem de Apresentação:**
1. Cards com `repetitions = 0` (nunca revisados) - ordem aleatória
2. Cards atrasados (next_review_date < hoje) - ordem de atraso (mais antigo primeiro)
3. Cards do dia (next_review_date = hoje) - ordem aleatória

**Tipos de Cards:**
- **Novos**: nunca foram estudados (badge "Novo")
- **Revisão**: já foram estudados e estão no intervalo (badge "Revisão")
- **Atrasados**: deveriam ter sido revisados dias atrás (badge vermelho "Atrasado")

#### 4.6.4 Pós-Sessão

**Tela de Conclusão:**
```
┌──────────────────────────────────────────────┐
│          🎉 Sessão Concluída! 🎉             │
│                                               │
│  Você revisou 10 cards em 8 minutos         │
│                                               │
│  ✅ Corretos: 7                              │
│  🔁 Repetidos: 3                             │
│                                               │
│  Próxima revisão: X cards amanhã            │
│                                               │
│  [Ver Estatísticas] [Estudar Mais]  [Voltar]│
└──────────────────────────────────────────────┘
```

**Gamificação Sutil:**
- Mensagens motivacionais variadas
- Confetti animation ao completar sessão longa (20+ cards)
- Celebração de streaks (3, 7, 30, 100 dias)

---

### 4.7 ESTATÍSTICAS E ANALYTICS

#### 4.7.1 Página de Estatísticas

**Layout de Dashboard** (inspirado na imagem Basepoint):
- Grid de 2x2 ou 3x2 com gráficos interativos
- Design limpo com cards brancos e sombras sutis
- Uso de cores consistente com brand (azul primário)

**Gráfico 1: Timeline de Highlights** (área chart)
- Eixo X: últimos 12 meses
- Eixo Y: número de highlights importados
- Gradiente azul suave
- Tooltip ao hover: "X highlights em Mês/Ano"

**Gráfico 2: Progresso de Estudo** (linha chart dupla)
- Linhas: "Cards Revisados" e "Taxa de Acerto"
- Eixo X: últimas 12 semanas
- Eixo Y esquerdo: número de cards
- Eixo Y direito: percentual
- Cores: azul para cards, verde para taxa de acerto

**Gráfico 3: Distribuição por Livro** (bar chart horizontal)
- Top 10 livros com mais highlights
- Barras coloridas em gradiente
- Ordenado por quantidade (descendente)

**Gráfico 4: Heatmap de Consistência**
- Grid de calendário (365 dias)
- Intensidade de cor baseada em cards revisados
- Tooltip: "X cards revisados em DD/MM"

**Cards de Métricas Rápidas** (topo da página):
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Total de    │ │  Highlights  │ │  Em Estudo   │ │  Streak      │
│  Livros      │ │              │ │              │ │              │
│     42       │ │    1,284     │ │     847      │ │   12 dias    │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

#### 4.7.2 Insights Avançados

**Nuvem de Palavras:**
- Gerada a partir de todos os highlights
- Palavras mais frequentes em tamanho maior
- Filtro: gerar nuvem de livro específico ou tag
- Opção de excluir stopwords (artigos, preposições)

**Temas Recorrentes:**
- Análise simples de frequência de termos
- Lista dos 20 termos/conceitos mais mencionados nos highlights
- Formato: tabela ordenável ou lista visual

**Autores Favoritos:**
- Ranking de autores por número de highlights
- Visual: lista com avatars/iniciais + barra de progresso

**Metas e Conquistas:**
- Definir meta anual de livros/highlights
- Visualização de progresso (circular progress bar)
- Badges desbloqueados (100 highlights, 30 dias de streak, etc.)

---

### 4.8 CONFIGURAÇÕES

#### 4.8.1 Perfil do Usuário

- Nome completo (editável)
- Email (não editável, requer verificação para mudar)
- Avatar (upload de imagem ou escolha de avatar padrão)
- Fuso horário
- Idioma (futuro: suporte a PT-BR e EN)

#### 4.8.2 Configurações do Sistema de Estudo

**Personalização do Algoritmo:**
- Número de cards novos por dia (padrão: 20)
- Número máximo de revisões por dia (padrão: ilimitado)
- Ease factor inicial (padrão: 2.5, range: 1.3 - 3.0)
- Intervalo inicial para cards novos (padrão: 1, 6 dias)

**Preferências de Estudo:**
- Embaralhar ordem dos cards (sim/não)
- Mostrar progresso durante sessão (sim/não)
- Sons de feedback (sim/não)
- Modo escuro durante estudo (sim/não)

#### 4.8.3 Gerenciamento de Livros

**Lista de Todos os Livros:**
- Tabela editável com colunas:
  - Capa (thumb)
  - Título (editável inline)
  - Autor (editável inline)
  - Nº Highlights
  - Ação: [Editar] [Excluir]

**Modal de Edição de Livro:**
- Campo Título (text input)
- Campo Autor (text input)
- Upload de Capa:
  - Drag & drop
  - Crop/resize automático para 300x400
  - Preview em tempo real
  - Formatos aceitos: JPG, PNG, WEBP
  - Tamanho máx: 2MB
- Botão "Buscar Capa Online" (futuro: integração com APIs de livros)

#### 4.8.4 Gerenciamento de Dados

- **Exportar Dados:**
  - Exportar todos os highlights em JSON
  - Exportar biblioteca completa em CSV
  - Exportar estatísticas em PDF (futuro)

- **Importar Dados:**
  - Importar de backup JSON (futuro)

- **Excluir Conta:**
  - Botão vermelho "Excluir Conta Permanentemente"
  - Confirmação com digitação de "EXCLUIR"
  - Aviso de que dados não podem ser recuperados
- avatar_url (text, nullable)
- timezone (text)
- created_at (timestamp)
- updated_at (timestamp)
```

**Tabela: `books`**
```sql
- id (uuid, PK)
- user_id (uuid, FK → users.id)
- title (text)
- author (text)
- cover_url (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)

UNIQUE (user_id, title, author) -- evita duplicação
```

**Tabela: `highlights`**
```sql
- id (uuid, PK)
- book_id (uuid, FK → books.id ON DELETE CASCADE)
- user_id (uuid, FK → users.id)
- highlight_text (text) -- a "pergunta"
- note_text (text, nullable) -- a "resposta"
- location (text, nullable) -- página/localização
- kindle_date (timestamp) -- quando destacou no Kindle
- imported_at (timestamp) -- quando importou no app
- created_at (timestamp)
- updated_at (timestamp)

INDEX (user_id, imported_at)
INDEX (book_id)
```

**Tabela: `tags`**
```sql
- id (uuid, PK)
- user_id (uuid, FK → users.id)
- name (text)
- color (text) -- hex color
- created_at (timestamp)

UNIQUE (user_id, name)
```

**Tabela: `highlight_tags`** (many-to-many)
```sql
- highlight_id (uuid, FK → highlights.id ON DELETE CASCADE)
- tag_id (uuid, FK → tags.id ON DELETE CASCADE)

PRIMARY KEY (highlight_id, tag_id)
```

**Tabela: `study_cards`**
```sql
- id (uuid, PK)
- highlight_id (uuid, FK → highlights.id ON DELETE CASCADE, UNIQUE)
- user_id (uuid, FK → users.id)
- ease_factor (float, default 2.5)
- interval (int, default 0) -- dias
- repetitions (int, default 0)
- next_review_date (date)
- last_reviewed_at (timestamp, nullable)
- created_at (timestamp)

INDEX (user_id, next_review_date)
```

**Tabela: `study_sessions`** (para analytics)
```sql
- id (uuid, PK)
- user_id (uuid, FK → users.id)
- started_at (timestamp)
- ended_at (timestamp, nullable)
- cards_reviewed (int)
- cards_correct (int)
- cards_repeated (int)
```

**Tabela: `user_settings`**
```sql
- user_id (uuid, PK, FK → users.id)
- new_cards_per_day (int, default 20)
- max_reviews_per_day (int, nullable)
- initial_ease_factor (float, default 2.5)
- shuffle_cards (boolean, default true)
- show_progress (boolean, default true)
- sound_effects (boolean, default false)
- dark_mode_study (boolean, default false)
- updated_at (timestamp)
```

### 5.3 Row Level Security (RLS) Policies

Todas as tabelas devem ter RLS habilitado para garantir que usuários só acessem seus próprios dados:

```sql
-- Exemplo para tabela highlights
CREATE POLICY "Users can view own highlights"
ON highlights FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own highlights"
ON highlights FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own highlights"
ON highlights FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own highlights"
ON highlights FOR DELETE
USING (auth.uid() = user_id);
```

### 5.4 Estrutura de Pastas (Next.js App Router)

```
/kindle-highlights-manager
├── /app
│   ├── /auth
│   │   ├── /login
│   │   └── /signup
│   ├── /dashboard
│   │   └── page.tsx
│   ├── /biblioteca
│   │   ├── page.tsx
│   │   └── /[bookId]
│   │       └── page.tsx
│   ├── /estudo
│   │   ├── page.tsx (seleção de deck)
│   │   └── /sessao
│   │       └── page.tsx (interface de estudo)
│   ├── /estatisticas
│   │   └── page.tsx
│   ├── /tags
│   │   └── page.tsx
│   ├── /configuracoes
│   │   └── page.tsx
│   └── layout.tsx (layout principal com sidebar)
├── /components
│   ├── /ui (shadcn components)
│   ├── /charts
│   │   ├── TimelineChart.tsx
│   │   ├── HeatmapChart.tsx
│   │   └── BarChart.tsx
│   ├── /study
│   │   ├── StudyCard.tsx
│   │   └── ProgressBar.tsx
│   ├── /library
│   │   ├── BookCard.tsx
│   │   ├── BookGrid.tsx
│   │   └── HighlightList.tsx
│   ├── Sidebar.tsx
│   ├── UploadZone.tsx
│   └── TagBadge.tsx
├── /lib
│   ├── /supabase
│   │   ├── client.ts
│   │   └── server.ts
│   ├── /parsers
│   │   └── myClippingsParser.ts
│   ├── /study
│   │   └── sm2Algorithm.ts
│   └── /utils
│       ├── dateHelpers.ts
│       └── textHelpers.ts
├── /public
│   ├── /images
│   └── /icons
└── /styles
    └── globals.css
```

### 5.5 Fluxos de Dados Críticos

**Fluxo de Importação:**
```
1. User faz upload do MyClippings.txt
2. Frontend lê o arquivo com FileReader API
3. Parser processa o texto e gera JSON estruturado
4. Frontend consulta Supabase: última data de importação do usuário
5. Frontend filtra apenas highlights com kindle_date > última importação
6. Frontend envia novos highlights para Supabase (batch insert)
7. Backend cria registros em `books` (se não existir) e `highlights`
8. Frontend mostra resumo de importação
9. Frontend redireciona para página da Biblioteca
```

**Fluxo de Estudo:**
```
1. User seleciona deck/livro para estudar
2. Frontend query Supabase:
   SELECT * FROM study_cards 
   WHERE user_id = X AND next_review_date <= TODAY()
   ORDER BY [lógica de ordenação]
3. Frontend carrega primeiro card e exibe
4. User revela resposta e clica "Próximo" ou "Repetir"
5. Frontend calcula novo ease_factor, interval, next_review_date (SM-2)
6. Frontend atualiza registro em `study_cards`
7. Frontend registra estatística em `study_sessions`
8. Frontend carrega próximo card (repete 3-7)
9. Ao finalizar: exibe tela de conclusão com estatísticas
```

---

## 6. DESIGN SYSTEM

### 6.1 Paleta de Cores

**Cores Primárias:**
- **Azul Primário:** `#4169E1` (Royal Blue) - CTAs, links, elementos interativos
- **Azul Escuro:** `#2C3E50` - Sidebar, textos importantes
- **Azul Claro:** `#E8F4FF` - Backgrounds de destaque

**Cores Secundárias:**
- **Verde Sucesso:** `#10B981` - Feedbacks positivos, badges de "dominado"
- **Laranja Alerta:** `#F59E0B` - Avisos, cards atrasados
- **Vermelho Erro:** `#EF4444` - Erros, ações destrutivas
- **Cinza Neutro:** `#6B7280` - Textos secundários, bordas

**Backgrounds:**
- **Fundo Principal:** `#FAFBFC`
- **Card Background:** `#FFFFFF`
- **Sidebar:** `#1F2937` (dark mode)

### 6.2 Tipografia

**Font Stack:**
- **Primary:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Monospace:** `'Fira Code', 'Courier New', monospace` (para highlights de código)

**Escala Tipográfica:**
- **Display:** 48px / 3rem (títulos de página principais)
- **H1:** 36px / 2.25rem
- **H2:** 30px / 1.875rem
- **H3:** 24px / 1.5rem
- **Body Large:** 18px / 1.125rem
- **Body:** 16px / 1rem (padrão)
- **Body Small:** 14px / 0.875rem
- **Caption:** 12px / 0.75rem

**Line Height:**
- Títulos: 1.2
- Body text: 1.6
- Highlights: 1.8 (melhor legibilidade)

### 6.3 Espaçamento

**Sistema de 8px:**
- Base unit: 8px
- Escala: 4px, 8px, 16px, 24px, 32px, 48px, 64px, 96px

**Aplicação:**
- Padding interno de cards: 24px
- Gap entre elementos: 16px
- Margin entre sections: 48px
- Sidebar padding: 16px

### 6.4 Componentes Base

**Botões:**
- **Primary Button:**
  - Background: #4169E1
  - Hover: #3457C0
  - Height: 40px
  - Border-radius: 8px
  - Font-weight: 600
  - Padding: 12px 24px

- **Secondary Button:**
  - Background: transparent
  - Border: 2px solid #E5E7EB
  - Hover: background #F9FAFB

- **Ghost Button:**
  - Background: transparent
  - Hover: background #F3F4F6

**Cards:**
- Background: #FFFFFF
- Border-radius: 12px
- Box-shadow: `0 1px 3px rgba(0,0,0,0.1)`
- Hover: `0 4px 12px rgba(0,0,0,0.15)` (elevação)
- Padding: 24px

**Inputs:**
- Height: 40px
- Border: 1px solid #D1D5DB
- Border-radius: 8px
- Focus: border #4169E1, box-shadow 0 0 0 3px rgba(65,105,225,0.1)
- Padding: 0 12px

**Tags/Badges:**
- Border-radius: 16px (pill shape)
- Padding: 4px 12px
- Font-size: 12px
- Font-weight: 600

### 6.5 Animações e Transições

**Princípios:**
- Sutileza: animações devem ser perceptíveis mas não distrativas
- Duração: 150-300ms para a maioria das interações
- Easing: `cubic-bezier(0.4, 0.0, 0.2, 1)` (ease-out)

**Aplicações:**
- Hover states: `transition: all 150ms ease-out`
- Modal open/close: fade + scale
- Card flip (estudo): rotate3d
- Page transitions: fade
- Skeleton loading: shimmer effect

### 6.6 Iconografia

**Biblioteca de Ícones:** Lucide Icons (consistência e leveza)

**Ícones Principais:**
- Dashboard: 📊 BarChart3
- Biblioteca: 📚 Library
- Estudo: 🎯 Target
- Estatísticas: 📈 TrendingUp
- Tags: 🏷️ Tag
- Configurações: ⚙️ Settings
- Upload: ⬆️ Upload
- Editar: ✏️ Edit
- Excluir: 🗑️ Trash2
- Busca: 🔍 Search

---

## 7. EXPERIÊNCIA DO USUÁRIO

### 7.1 Estados de Carregamento

**Skeleton Screens:**
- Utilizar em vez de spinners para melhor percepção de performance
- Aplicar em: lista de livros, lista de highlights, gráficos
- Animação shimmer sutil

**Progress Indicators:**
- Upload de arquivo: barra de progresso linear
- Processamento: spinner + texto informativo ("Analisando highlights...")
- Operações longas (>3s): indicador de porcentagem

### 7.2 Feedbacks Visuais

**Toasts (Notificações):**
- Posição: top-right
- Duração: 3-5 segundos
- Tipos:
  - Sucesso: ícone ✓, fundo verde claro
  - Erro: ícone ✕, fundo vermelho claro
  - Aviso: ícone ⚠, fundo laranja claro
  - Info: ícone ℹ, fundo azul claro

**Confirmações:**
- Ações destrutivas (excluir livro, conta): modal de confirmação
- Texto claro: "Tem certeza que deseja excluir [Item]? Esta ação não pode ser desfeita."
- Botões: "Cancelar" (secundário) + "Excluir" (vermelho, destaque)

### 7.3 Estados Vazios (Empty States)

**Biblioteca Vazia:**
```
┌────────────────────────────────────┐
│        📚                          │
│                                     │
│   Nenhum livro importado ainda    │
│                                     │
│   Importe seu primeiro arquivo     │
│   MyClippings.txt para começar     │
│                                     │
│      [Importar Highlights]         │
└────────────────────────────────────┘
```

**Nenhum Card para Estudar:**
```
┌────────────────────────────────────┐
│        🎉                          │
│                                     │
│   Você está em dia!                │
│                                     │
│   Não há cards para revisar hoje.  │
│   Próxima revisão: amanhã          │
│                                     │
│      [Voltar ao Dashboard]         │
└────────────────────────────────────┘
```

### 7.4 Responsividade

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Adaptações Mobile:**
- Sidebar se transforma em bottom navigation bar
- Grid de livros: 1 coluna
- Gráficos: stack vertical
- Interface de estudo: full-screen
- Touch-friendly: botões maiores (min 44x44px)

### 7.5 Acessibilidade

**Requisitos Mínimos:**
- Contraste de cores: WCAG AA (4.5:1 para texto normal)
- Navegação por teclado: Tab, Enter, Esc funcionais
- ARIA labels em botões/ícones
- Focus states visíveis
- Alt text em todas as imagens
- Semântica HTML correta (h1, h2, nav, main, etc.)

---

## 8. ROADMAP E PRIORIZAÇÃO

### 8.1 MVP (Versão 1.0) - 8 semanas

**Semanas 1-2: Fundação**
- Setup do projeto (Next.js + Supabase)
- Autenticação (login/signup)
- Design system base (Tailwind config, componentes UI)

**Semanas 3-4: Core Features**
- Upload e parser de MyClippings.txt
- Modelo de dados completo
- Biblioteca de livros (grid view, busca básica)
- Página detalhada do livro

**Semanas 5-6: Sistema de Estudo**
- Implementação do algoritmo SM-2
- Interface de estudo (pergunta/resposta)
- Criação automática de study_cards
- Estatísticas básicas

**Semanas 7-8: Polish & Launch**
- Dashboard com gráficos principais
- Configurações (editar livro, upload de capa)
- Testes de usabilidade
- Deploy para produção

### 8.2 Pós-MVP (Versão 1.1-1.3)

**v1.1 - Organização Avançada (2 semanas)**
- Sistema de tags completo
- Filtros avançados
- Edição em massa de highlights

**v1.2 - Analytics Completo (2 semanas)**
- Heatmap de leitura
- Nuvem de palavras
- Insights de temas recorrentes
- Metas e gamificação

**v1.3 - Refinamentos UX (2 semanas)**
- Modo escuro global
- Atalhos de teclado
- Tour interativo para novos usuários
- Melhorias de performance

### 8.3 Futuro (Versão 2.0+)

- Aplicativo mobile (React Native ou PWA)
- Sincronização automática via Dropbox/Drive
- Colaboração: compartilhar highlights com amigos
- Integração com APIs de livros (capas automáticas, metadados)
- Exportação para Notion, Obsidian, Readwise
- IA: sugestões de conexões entre highlights
- Estudo com voz (text-to-speech para highlights)

---

## 9. MÉTRICAS DE SUCESSO E KPIs

### 9.1 Métricas de Produto (Primeiros 6 Meses)

**Aquisição:**
- 1.000 usuários registrados
- 200 DAU (Daily Active Users)
- Taxa de conversão visita → registro: 15%

**Engajamento:**
- 3+ sessões de estudo por usuário/semana
- 60% dos usuários fazem 2+ importações
- Tempo médio de sessão de estudo: 8-12 minutos

**Retenção:**
- D1 (Day 1): 60%
- D7 (Day 7): 40%
- D30 (Day 30): 25%

**Qualidade:**
- NPS (Net Promoter Score): >40
- <5% de churn mensal (após 3º mês)
- <1% de erro rate nas importações

### 9.2 Métricas Técnicas

**Performance:**
- Lighthouse Score: >90 (Performance, Accessibility, Best Practices, SEO)
- Time to Interactive (TTI): <3s
- First Contentful Paint (FCP): <1.5s
- Core Web Vitals: todos "Good"

**Confiabilidade:**
- Uptime: >99.5%
- Error rate: <0.1%
- P95 response time: <500ms

---

## 10. CONSIDERAÇÕES DE SEGURANÇA E PRIVACIDADE

### 10.1 Segurança

**Autenticação:**
- Senhas hasheadas (bcrypt via Supabase)
- JWT tokens para sessões
- Rate limiting em endpoints de login (10 tentativas/hora)

**Autorização:**
- Row Level Security (RLS) em todas as tabelas
- Nenhum dado compartilhado entre usuários sem consentimento explícito

**Upload de Arquivos:**
- Validação de tipo MIME (apenas .txt para MyClippings)
- Validação de tamanho (max 10MB)
- Sanitização de input para prevenir XSS

**Capas de Livros:**
- Storage isolado por usuário (user_id no path)
- Validação de formato (PNG, JPG, WEBP apenas)
- Resize automático para prevenir uploads gigantes
- URLs assinadas para acesso

### 10.2 Privacidade

**LGPD/GDPR Compliance:**
- Termos de uso e política de privacidade claros
- Opt-in explícito para coleta de analytics
- Direito de exportação de dados (formato JSON)
- Direito de exclusão completa (hard delete)

**Dados Coletados:**
- Essenciais: email, nome, highlights importados
- Analytics: eventos de uso (anonimizados)
- Não coletado: localização, histórico de navegação fora do app

---

## 11. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Parser falha em formatos inesperados de MyClippings.txt | Alta | Médio | Testar com dezenas de arquivos reais; permitir report de erros; fallback manual |
| Usuários não entendem sistema de repetição espaçada | Média | Alto | Tutorial interativo; tooltips explicativos; FAQ dedicada |
| Performance ruim com >10k highlights | Baixa | Alto | Paginação; lazy loading; índices de banco otimizados |
| Custo de storage de capas escala rápido | Baixa | Médio | Comprimir imagens no upload; limitar tamanho por usuário |
| Usuários esperam integração com Anki | Média | Baixo | Comunicar claramente no marketing que é sistema independente |

---

## 12. OPEN QUESTIONS

1. **Monetização:** Será gratuito eternamente ou haverá plano pago? Se sim, quais features premium?
2. **Limites Free Tier:** Quantos highlights/livros por usuário gratuito?
3. **Internacionalização:** Lançar apenas em PT-BR ou incluir EN desde MVP?
4. **Mobile App:** PWA ou native app nativo no futuro?
5. **Marca e Nome:** "Kindle Highlights Manager" é provisório. Nome definitivo?

---

## 13. CONCLUSÃO

Este PRD define um produto robusto, esteticamente moderno e funcionalmente completo para gerenciamento e estudo de highlights do Kindle. A proposta combina simplicidade de uso com poder de funcionalidades, oferecendo uma alternativa integrada e superior ao workflow fragmentado atual (Kindle → MyClippings.txt → Anki).

Com uma tech stack acessível (Next.js + Supabase) e um roadmap pragmático, o MVP pode ser desenvolvido em 8 semanas, entregando valor imediato aos usuários e estabelecendo uma base sólida para evolução futura.

**Próximos Passos:**
1. Validar PRD com stakeholders
2. Definir priorização final de features do MVP
3. Iniciar design de alta fidelidade (Figma)
4. Setup do ambiente de desenvolvimento
5. Sprint 1: Autenticação + Setup do banco

---

**Aprovação:**

[ ] Product Owner  
[ ] Tech Lead  
[ ] Design Lead  

Data: ___/___/______