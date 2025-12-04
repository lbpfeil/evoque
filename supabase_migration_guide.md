# Guia de Migração para Supabase

Este guia detalha o passo a passo para migrar o backend do Evoque (atualmente Local Storage) para o Supabase, garantindo persistência de dados na nuvem, autenticação e sincronização entre dispositivos.

---

## 1. Configuração do Projeto no Supabase

1.  Acesse [supabase.com](https://supabase.com) e faça login.
2.  Clique em **"New Project"**.
3.  Escolha sua organização, dê um nome (ex: `evoque-app`) e defina uma senha forte para o banco de dados.
4.  Escolha a região mais próxima (ex: `South America (São Paulo)`).
5.  Clique em **"Create new project"** e aguarde a inicialização.

---

## 2. Modelagem do Banco de Dados (Schema)

Vá até o **Table Editor** (ícone de tabela na barra lateral) e crie as seguintes tabelas.

> **Dica:** Você pode rodar tudo de uma vez no **SQL Editor**.

### Tabela `profiles` (Extensão da tabela users)
Armazena dados públicos do usuário.
```sql
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);
```

### Tabela `books`
```sql
create table books (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  author text,
  cover_url text,
  last_imported timestamp with time zone default now(),
  highlight_count int default 0,
  created_at timestamp with time zone default now()
);
```

### Tabela `highlights`
```sql
create table highlights (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  book_id uuid references books on delete cascade not null,
  text text not null,
  note text,
  location text,
  page text,
  is_favorite boolean default false,
  in_study boolean default false,
  date_added timestamp with time zone, -- Data original do Kindle
  imported_at timestamp with time zone default now()
);
```

### Tabela `study_cards`
```sql
create table study_cards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  highlight_id uuid references highlights on delete cascade not null unique,
  ease_factor float default 2.5,
  interval int default 0,
  repetitions int default 0,
  next_review_date timestamp with time zone default now(),
  last_reviewed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);
```

### Tabela `review_logs` (Histórico de revisões)
```sql
create table review_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  card_id uuid references study_cards on delete cascade not null,
  quality int not null,
  reviewed_at timestamp with time zone default now(),
  interval_days int,
  ease_factor float
);
```

### Tabela `user_settings`
```sql
create table user_settings (
  user_id uuid references auth.users on delete cascade not null primary key,
  max_reviews_per_day int default 20,
  new_cards_per_day int default 10,
  updated_at timestamp with time zone default now()
);
```

---

## 3. Segurança (Row Level Security - RLS)

Para garantir que cada usuário só veja seus próprios dados, ative o RLS em **todas** as tabelas e crie as políticas.

Execute no **SQL Editor**:

```sql
-- Habilitar RLS
alter table profiles enable row level security;
alter table books enable row level security;
alter table highlights enable row level security;
alter table study_cards enable row level security;
alter table review_logs enable row level security;
alter table user_settings enable row level security;

-- Políticas de Acesso (Exemplo genérico para todas as tabelas)
-- Repita ou adapte para cada tabela (books, highlights, etc.)

-- BOOKS
create policy "Users can view own books" on books for select using (auth.uid() = user_id);
create policy "Users can insert own books" on books for insert with check (auth.uid() = user_id);
create policy "Users can update own books" on books for update using (auth.uid() = user_id);
create policy "Users can delete own books" on books for delete using (auth.uid() = user_id);

-- HIGHLIGHTS
create policy "Users can view own highlights" on highlights for select using (auth.uid() = user_id);
create policy "Users can insert own highlights" on highlights for insert with check (auth.uid() = user_id);
create policy "Users can update own highlights" on highlights for update using (auth.uid() = user_id);
create policy "Users can delete own highlights" on highlights for delete using (auth.uid() = user_id);

-- STUDY_CARDS
create policy "Users can view own cards" on study_cards for select using (auth.uid() = user_id);
create policy "Users can insert own cards" on study_cards for insert with check (auth.uid() = user_id);
create policy "Users can update own cards" on study_cards for update using (auth.uid() = user_id);
create policy "Users can delete own cards" on study_cards for delete using (auth.uid() = user_id);

-- REVIEW_LOGS
create policy "Users can view own logs" on review_logs for select using (auth.uid() = user_id);
create policy "Users can insert own logs" on review_logs for insert with check (auth.uid() = user_id);

-- USER_SETTINGS
create policy "Users can view own settings" on user_settings for select using (auth.uid() = user_id);
create policy "Users can insert own settings" on user_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings" on user_settings for update using (auth.uid() = user_id);

-- PROFILES (Leitura pública opcional, mas escrita restrita)
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
```

---

## 4. Configuração de Autenticação

1.  No menu lateral, vá em **Authentication** > **Providers**.
2.  **Email:** Já vem habilitado por padrão. Desabilite "Confirm email" se quiser facilitar o teste inicial (não recomendado para produção).
3.  **Google (Opcional):**
    *   Siga o tutorial do Supabase para criar um projeto no Google Cloud Console.
    *   Obtenha o `Client ID` e `Client Secret`.
    *   Adicione a URL de callback do Supabase no Google Cloud.

---

## 5. Integração com o Frontend (React/Vite)

### 5.1 Instalação
No terminal do projeto:
```bash
npm install @supabase/supabase-js
```

### 5.2 Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
VITE_SUPABASE_URL=sua_url_do_projeto_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_publica
```
*(Pegue esses dados em Project Settings > API)*

### 5.3 Cliente Supabase (`src/lib/supabase.ts`)
Crie este arquivo para inicializar a conexão:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 6. Refatoração do Código (`StoreContext.tsx`)

Esta é a parte mais trabalhosa. Você precisará substituir a lógica de `localStorage` por chamadas assíncronas ao Supabase.

**Exemplo de como ficará o carregamento de dados:**

```typescript
// Antes (Local Storage)
// const savedBooks = localStorage.getItem('khm_books');
// if (savedBooks) setBooks(JSON.parse(savedBooks));

// Depois (Supabase)
useEffect(() => {
  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: booksData } = await supabase.from('books').select('*');
    if (booksData) setBooks(booksData);

    const { data: highlightsData } = await supabase.from('highlights').select('*');
    if (highlightsData) setHighlights(highlightsData);
    
    // ... carregar study_cards, settings, etc.
    setIsLoaded(true);
  };
  
  loadData();
}, []);
```

**Exemplo de Salvamento (Criar Highlight):**
```typescript
const addHighlight = async (highlight) => {
  // Otimistic update (atualiza UI imediatamente)
  setHighlights(prev => [...prev, highlight]);

  // Persiste no banco
  const { error } = await supabase
    .from('highlights')
    .insert([{ ...highlight, user_id: user.id }]);
    
  if (error) {
    console.error('Erro ao salvar', error);
    // Reverter estado se der erro (opcional)
  }
}
```

---

## 7. Estratégia de Migração de Dados (Local -> Nuvem)

Para não perder os dados atuais do Local Storage:

1.  Crie uma função `migrateLocalDataToSupabase()` que roda **uma única vez** após o usuário fazer login pela primeira vez.
2.  Essa função deve:
    *   Ler tudo do `localStorage`.
    *   Fazer um `insert` em massa nas tabelas do Supabase.
    *   Marcar uma flag (ex: `localStorage.setItem('migrated', 'true')`) para não rodar novamente.

---

## Próximos Passos Imediatos

1.  [ ] Criar conta e projeto no Supabase.
2.  [ ] Rodar o script SQL de criação de tabelas.
3.  [ ] Instalar a biblioteca `@supabase/supabase-js`.
4.  [ ] Criar a tela de Login (`/pages/Login.tsx`).
