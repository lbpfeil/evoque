# Guia Completo: Migração do Evoque para Supabase

> **Documentação criada em:** 16/12/2025  
> **Status:** Pronto para implementação  
> **Tempo estimado:** 4-6 horas

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Fase 1: Setup Inicial](#fase-1-setup-inicial)
4. [Fase 2: Helpers e Tipos](#fase-2-helpers-e-tipos)
5. [Fase 3: Carregamento de Dados](#fase-3-carregamento-de-dados)
6. [Fase 4: Importação de Dados](#fase-4-importação-de-dados)
7. [Fase 5: CRUD de Highlights](#fase-5-crud-de-highlights)
8. [Fase 6: CRUD de Study Cards](#fase-6-crud-de-study-cards)
9. [Fase 7: CRUD de Tags](#fase-7-crud-de-tags)
10. [Fase 8: Study Sessions](#fase-8-study-sessions)
11. [Fase 9: Settings](#fase-9-settings)
12. [Problemas Comuns](#problemas-comuns)
13. [Testes](#testes)

---

## 🎯 Visão Geral

### O que vamos fazer

Migrar o Evoque de **localStorage** para **Supabase**, mantendo toda a funcionalidade existente e adicionando:
- ✅ Persistência real de dados
- ✅ Sincronização entre dispositivos
- ✅ Autenticação de usuários
- ✅ Segurança com RLS (Row Level Security)

### Arquitetura

```
┌─────────────────┐
│   React App     │
│  (StoreContext) │
└────────┬────────┘
         │
         ├─ Optimistic Updates (UI instantânea)
         │
         ├─ Supabase Client
         │
         ▼
┌─────────────────┐
│   Supabase DB   │
│  (PostgreSQL)   │
└─────────────────┘
```

### Estratégia de Migração

**Optimistic UI Updates:**
1. Atualizar estado local imediatamente (UI responde rápido)
2. Sincronizar com Supabase em background
3. Reverter em caso de erro

---

## ✅ Pré-requisitos

### 1. Projeto Supabase Criado

- ✅ Projeto: `evoque-app`
- ✅ Project ID: `wjqvjfpirgyqycmlakgl`
- ✅ Schema criado com todas as tabelas
- ✅ RLS habilitado em todas as tabelas

### 2. Dependências Instaladas

```bash
npm install @supabase/supabase-js
```

### 3. Variáveis de Ambiente

Arquivo `.env`:
```env
VITE_SUPABASE_URL=https://wjqvjfpirgyqycmlakgl.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

**⚠️ IMPORTANTE:** Adicionar `.env` ao `.gitignore`!

### 4. Autenticação Implementada

- ✅ `AuthContext.tsx` criado
- ✅ `Login.tsx` criado
- ✅ `App.tsx` com proteção de rotas
- ✅ `Sidebar.tsx` com logout

---

## 🔐 Fase 0: Implementação de Autenticação

> **IMPORTANTE:** Esta fase deve ser implementada ANTES de migrar o StoreContext para Supabase.

### 0.1 AuthContext - Gerenciamento de Autenticação

**Arquivo:** `components/AuthContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 0.2 Login Page

**Arquivo:** `pages/Login.tsx`

```typescript
import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { BookOpen, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        setError('Verifique seu email para confirmar o cadastro!');
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-2 bg-black text-white rounded-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">EVOQUE</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 p-8">
          <h2 className="text-xl font-semibold text-zinc-900 mb-6">
            {isSignUp ? 'Criar Conta' : 'Entrar'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSignUp ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem conta? Criar agora'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Seus dados são protegidos e criptografados
        </p>
      </div>
    </div>
  );
};

export default Login;
```

### 0.3 Modificações na Sidebar

**Arquivo:** `components/Sidebar.tsx`

**ADICIONAR** imports:
```typescript
import { useState } from 'react';
import { LogOut, ChevronUp } from 'lucide-react';
import { useAuth } from './AuthContext';
```

**ADICIONAR** no início do componente:
```typescript
const Sidebar = () => {
  const { user, signOut } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  // ... resto do código
```

**SUBSTITUIR** o rodapé da sidebar (após o `</nav>`):
```typescript
      {/* User Menu */}
      <div className="border-t border-zinc-100">
        {/* Logout Menu (appears above user button) */}
        {showLogout && (
          <div className="p-2 border-b border-zinc-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Sair
            </button>
          </div>
        )}

        {/* User Info Button */}
        <button
          onClick={() => setShowLogout(!showLogout)}
          className="w-full p-4 hover:bg-zinc-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
              {user?.email ? getUserInitials(user.email) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-900 truncate">
                {user?.email || 'User'}
              </p>
              <p className="text-[10px] text-zinc-500">Free Plan</p>
            </div>
            <ChevronUp
              className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${showLogout ? '' : 'rotate-180'}`}
            />
          </div>
        </button>
      </div>
    </aside>
```

### 0.4 Proteção de Rotas no App.tsx

**Arquivo:** `App.tsx`

**ADICIONAR** imports:
```typescript
import Login from './pages/Login';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Loader2 } from 'lucide-react';
```

**CRIAR** componente `ProtectedApp`:
```typescript
const ProtectedApp = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-zinc-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <StoreProvider>
      <HashRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/library" element={<Library />} />
            <Route path="/library/:bookId" element={<BookDetails />} />
            <Route path="/highlights" element={<Highlights />} />
            <Route path="/import" element={<Import />} />
            <Route path="/study" element={<Study />} />
            <Route path="/study/session" element={<StudySession />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </HashRouter>
    </StoreProvider>
  );
};
```

**MODIFICAR** componente `App`:
```typescript
const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProtectedApp />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
```

### 0.5 Configurar Supabase Authentication

**No Supabase Dashboard:**

1. Vá em **Authentication > Providers**
2. Habilite **Email** provider
3. Configure:
   - ✅ Enable email provider
   - ✅ Confirm email (recomendado para produção)
   - ❌ Secure email change (opcional)

4. Vá em **Authentication > URL Configuration**
   - Site URL: `http://localhost:5173` (desenvolvimento)
   - Redirect URLs: `http://localhost:5173/**`

5. Vá em **Authentication > Email Templates**
   - Personalize templates de confirmação (opcional)

### 0.6 Testar Autenticação

**Checklist:**
- [ ] Criar nova conta
- [ ] Fazer login
- [ ] Verificar se dados carregam após login
- [ ] Fazer logout
- [ ] Verificar se é redirecionado para login
- [ ] Tentar acessar rotas sem autenticação (deve redirecionar)

---

## 🔧 Fase 1: Setup Inicial

### 1.1 Cliente Supabase

**Arquivo:** `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 1.2 Tipos Vite

**Arquivo:** `vite-env.d.ts`

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## 🔄 Fase 2: Helpers e Tipos

### 2.1 Conversores de Tipos

**Arquivo:** `lib/supabaseHelpers.ts`

```typescript
import { Book, Highlight, StudyCard, Tag } from '../types';

// ============================================
// BOOKS
// ============================================

export const toSupabaseBook = (book: Book, userId: string) => ({
  id: book.id,
  user_id: userId,
  title: book.title,
  author: book.author,
  cover_url: book.coverUrl || null,
  last_imported: book.lastImported,
  highlight_count: book.highlightCount
});

export const fromSupabaseBook = (row: any): Book => ({
  id: row.id,
  title: row.title,
  author: row.author,
  coverUrl: row.cover_url,
  lastImported: row.last_imported,
  highlightCount: row.highlight_count
});

// ============================================
// HIGHLIGHTS
// ============================================

export const toSupabaseHighlight = (highlight: Highlight, userId: string) => ({
  id: highlight.id,
  user_id: userId,
  book_id: highlight.bookId,
  text: highlight.text,
  note: highlight.note || null,
  location: highlight.location,
  page: highlight.page || null,
  is_favorite: highlight.isFavorite || false,
  in_study: highlight.inStudy || false,
  date_added: highlight.dateAdded,
  imported_at: highlight.importedAt || new Date().toISOString(),
  tags: highlight.tags || []
});

export const fromSupabaseHighlight = (row: any): Highlight => ({
  id: row.id,
  bookId: row.book_id,
  text: row.text,
  note: row.note,
  location: row.location,
  page: row.page,
  isFavorite: row.is_favorite,
  inStudy: row.in_study,
  dateAdded: row.date_added,
  importedAt: row.imported_at,
  tags: row.tags || []
});

// ============================================
// STUDY CARDS
// ============================================

export const toSupabaseStudyCard = (card: StudyCard, userId: string) => ({
  id: card.id,
  user_id: userId,
  highlight_id: card.highlightId,
  ease_factor: card.easeFactor,
  interval: card.interval,
  repetitions: card.repetitions,
  next_review_date: card.nextReviewDate,
  last_reviewed_at: card.lastReviewedAt || null
});

export const fromSupabaseStudyCard = (row: any): StudyCard => ({
  id: row.id,
  highlightId: row.highlight_id,
  easeFactor: row.ease_factor,
  interval: row.interval,
  repetitions: row.repetitions,
  nextReviewDate: row.next_review_date,
  lastReviewedAt: row.last_reviewed_at
});

// ============================================
// TAGS
// ============================================

export const toSupabaseTag = (tag: Tag, userId: string) => ({
  id: tag.id,
  user_id: userId,
  name: tag.name,
  parent_id: tag.parentId || null,
  book_id: tag.bookId || null,
  color: tag.color || null
});

export const fromSupabaseTag = (row: any): Tag => ({
  id: row.id,
  name: row.name,
  parentId: row.parent_id,
  bookId: row.book_id,
  color: row.color
});
```

### 2.2 Parser - Gerar UUIDs Válidos

**⚠️ PROBLEMA CRÍTICO:** O parser estava gerando IDs em base64, mas Supabase exige UUIDs.

**Arquivo:** `services/parser.ts`

```typescript
// Adicionar função para gerar UUIDs determinísticos
const generateDeterministicUUID = (input: string): string => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex.substring(0, 8)}-${hex.substring(0, 4)}-4${hex.substring(1, 4)}-${hex.substring(0, 4)}-${hex}${hex}`.substring(0, 36);
};

// SUBSTITUIR linha 129 e 170:
// ANTES: const bookId = btoa(unescape(encodeURIComponent(`${title}-${author}`)));
// DEPOIS:
const bookId = generateDeterministicUUID(`${title}-${author}`);
```

---

## 📥 Fase 3: Carregamento de Dados

### 3.1 Atualizar StoreContext - Imports

```typescript
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  fromSupabaseBook,
  fromSupabaseHighlight,
  fromSupabaseStudyCard,
  fromSupabaseTag
} from '../lib/supabaseHelpers';
```

### 3.2 Atualizar StoreContext - Estado Inicial

```typescript
export const StoreProvider = ({ children }: React.PropsWithChildren) => {
  const { user } = useAuth(); // ← ADICIONAR
  
  // Mudar de MOCK_DATA para arrays vazios
  const [books, setBooks] = useState<Book[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [studyCards, setStudyCards] = useState<StudyCard[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  // ... resto do estado
```

### 3.3 useEffect - Carregar do Supabase

**SUBSTITUIR** o useEffect de localStorage por:

```typescript
// Load data from Supabase on mount
useEffect(() => {
  if (!user) {
    setIsLoaded(true);
    return;
  }

  const loadData = async () => {
    try {
      // Load books
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id);
      
      if (booksError) throw booksError;
      if (booksData) setBooks(booksData.map(fromSupabaseBook));

      // Load highlights
      const { data: highlightsData, error: highlightsError } = await supabase
        .from('highlights')
        .select('*')
        .eq('user_id', user.id);
      
      if (highlightsError) throw highlightsError;
      if (highlightsData) setHighlights(highlightsData.map(fromSupabaseHighlight));

      // Load study cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('study_cards')
        .select('*')
        .eq('user_id', user.id);
      
      if (cardsError) throw cardsError;
      if (cardsData) setStudyCards(cardsData.map(fromSupabaseStudyCard));

      // Load tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id);
      
      if (tagsError) throw tagsError;
      if (tagsData) setTags(tagsData.map(fromSupabaseTag));

      // Load settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }
      if (settingsData) {
        setSettings({
          maxReviewsPerDay: settingsData.max_reviews_per_day,
          newCardsPerDay: settingsData.new_cards_per_day
        });
      }

      // Session e progress ainda do localStorage (dados temporários)
      const savedSession = localStorage.getItem('khm_session');
      const savedProgress = localStorage.getItem('khm_daily_progress');

      if (savedSession) {
        const session = JSON.parse(savedSession);
        if (!session.history) session.history = [];
        const sessionDate = new Date(session.date).toDateString();
        const today = new Date().toDateString();
        if (sessionDate === today) {
          setCurrentSession(session);
        }
      }

      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        const today = new Date().toISOString().split('T')[0];
        if (progress.date === today) {
          setDailyProgress(progress);
        }
      }

    } catch (error) {
      console.error('Failed to load data from Supabase:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  loadData();
}, [user]);
```

### 3.4 useEffect - Salvar apenas dados temporários

**SUBSTITUIR** o segundo useEffect por:

```typescript
// Save session and daily progress to localStorage (temporary data only)
useEffect(() => {
  if (!isLoaded) return;
  
  if (currentSession) {
    localStorage.setItem('khm_session', JSON.stringify(currentSession));
  } else {
    localStorage.removeItem('khm_session');
  }
  
  localStorage.setItem('khm_daily_progress', JSON.stringify(dailyProgress));
}, [currentSession, dailyProgress, isLoaded]);
```

---

## 📤 Fase 4: Importação de Dados

### 4.1 Atualizar Interface

```typescript
interface StoreContextType {
  // ...
  importData: (text: string) => Promise<{ newBooks: number; newHighlights: number }>; // ← async
  // ...
}
```

### 4.2 Implementar importData

**SUBSTITUIR** a função `importData` por:

```typescript
const importData = async (text: string) => {
  if (!user) throw new Error('Not authenticated');

  try {
    const { books: parsedBooks, highlights: parsedHighlights } = parseMyClippings(text);

    // 1. Upsert books to Supabase
    const booksToUpsert = parsedBooks.map(b => ({
      id: b.id,
      user_id: user.id,
      title: b.title,
      author: b.author,
      cover_url: b.coverUrl || null,
      last_imported: b.lastImported,
      highlight_count: b.highlightCount
    }));

    const { error: booksError } = await supabase
      .from('books')
      .upsert(booksToUpsert, { onConflict: 'id' });
    
    if (booksError) throw booksError;

    // 2. Upsert highlights to Supabase
    const highlightsToUpsert = parsedHighlights.map(h => ({
      id: h.id,
      user_id: user.id,
      book_id: h.bookId,
      text: h.text,
      note: h.note || null,
      location: h.location,
      page: h.page || null,
      is_favorite: h.isFavorite || false,
      in_study: h.inStudy || false,
      date_added: h.dateAdded,
      imported_at: new Date().toISOString(),
      tags: h.tags || []
    }));

    const { error: highlightsError } = await supabase
      .from('highlights')
      .upsert(highlightsToUpsert, { onConflict: 'id' });
    
    if (highlightsError) throw highlightsError;

    // 3. Create study cards for new highlights
    const cardsToUpsert = parsedHighlights.map(h => ({
      id: crypto.randomUUID(),
      user_id: user.id,
      highlight_id: h.id,
      ease_factor: 2.5,
      interval: 0,
      repetitions: 0,
      next_review_date: new Date().toISOString()
    }));

    const { error: cardsError } = await supabase
      .from('study_cards')
      .upsert(cardsToUpsert, { onConflict: 'highlight_id', ignoreDuplicates: true });
    
    if (cardsError) throw cardsError;

    // 4. Reload all data from Supabase
    const { data: booksData } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', user.id);
    if (booksData) setBooks(booksData.map(fromSupabaseBook));

    const { data: highlightsData } = await supabase
      .from('highlights')
      .select('*')
      .eq('user_id', user.id);
    if (highlightsData) setHighlights(highlightsData.map(fromSupabaseHighlight));

    const { data: cardsData } = await supabase
      .from('study_cards')
      .select('*')
      .eq('user_id', user.id);
    if (cardsData) setStudyCards(cardsData.map(fromSupabaseStudyCard));

    return { newBooks: parsedBooks.length, newHighlights: parsedHighlights.length };
  } catch (error: any) {
    console.error('Failed to import data:', error);
    throw new Error(error.message || 'Failed to import data');
  }
};
```

### 4.3 Atualizar Import.tsx

**IMPORTANTE:** A função agora é async!

```typescript
// Linha 37 - adicionar await
const res = await importData(text);
```

---

## ✏️ Fase 5: CRUD de Highlights

### 5.1 Atualizar Interfaces

```typescript
interface StoreContextType {
  // ...
  deleteHighlight: (id: string) => Promise<void>;
  updateHighlight: (id: string, updates: Partial<Highlight>) => Promise<void>;
  bulkDeleteHighlights: (ids: string[]) => Promise<void>;
  // ...
}
```

### 5.2 updateHighlight

**SUBSTITUIR** a função por:

```typescript
const updateHighlight = async (id: string, updates: Partial<Highlight>) => {
  if (!user) return;

  // Optimistic update
  setHighlights(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));

  try {
    // Convert to snake_case for Supabase
    const dbUpdates: any = {};
    if (updates.text !== undefined) dbUpdates.text = updates.text;
    if (updates.note !== undefined) dbUpdates.note = updates.note;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.page !== undefined) dbUpdates.page = updates.page;
    if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;
    if (updates.inStudy !== undefined) dbUpdates.in_study = updates.inStudy;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

    const { error } = await supabase
      .from('highlights')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update highlight:', error);
    // Reload data on error
    const { data } = await supabase
      .from('highlights')
      .select('*')
      .eq('user_id', user.id);
    if (data) setHighlights(data.map(fromSupabaseHighlight));
  }
};
```

### 5.3 deleteHighlight

**SUBSTITUIR** a função por:

```typescript
const deleteHighlight = async (id: string) => {
  if (!user) return;

  const highlight = highlights.find(h => h.id === id);
  if (!highlight) return;

  // Optimistic update
  setHighlights(prev => prev.filter(h => h.id !== id));
  setStudyCards(prev => prev.filter(c => c.highlightId !== id));

  // Remove from current session if present
  if (currentSession) {
    setCurrentSession(prev => {
      if (!prev) return null;
      const cardToRemove = studyCards.find(c => c.highlightId === id);
      if (!cardToRemove) return prev;
      return {
        ...prev,
        cardIds: prev.cardIds.filter(cid => cid !== cardToRemove.id),
        completedIds: prev.completedIds.filter(cid => cid !== cardToRemove.id)
      };
    });
  }

  // Update book count
  setBooks(prev => prev.map(b => {
    if (b.id === highlight.bookId) {
      return { ...b, highlightCount: Math.max(0, b.highlightCount - 1) };
    }
    return b;
  }));

  try {
    // Delete from Supabase (cascade will delete study_card)
    const { error } = await supabase
      .from('highlights')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to delete highlight:', error);
    // Reload data on error
    const { data: highlightsData } = await supabase
      .from('highlights')
      .select('*')
      .eq('user_id', user.id);
    if (highlightsData) setHighlights(highlightsData.map(fromSupabaseHighlight));

    const { data: cardsData } = await supabase
      .from('study_cards')
      .select('*')
      .eq('user_id', user.id);
    if (cardsData) setStudyCards(cardsData.map(fromSupabaseStudyCard));
  }
};
```

### 5.4 bulkDeleteHighlights

**SUBSTITUIR** a função por:

```typescript
const bulkDeleteHighlights = async (ids: string[]) => {
  if (!user) return;

  const idsSet = new Set(ids);
  const affectedBookIds = new Set<string>();

  highlights.forEach(h => {
    if (idsSet.has(h.id)) affectedBookIds.add(h.bookId);
  });

  // Optimistic update
  setHighlights(prev => prev.filter(h => !idsSet.has(h.id)));
  setStudyCards(prev => prev.filter(c => !idsSet.has(c.highlightId)));

  // Remove from current session
  if (currentSession) {
    setCurrentSession(prev => {
      if (!prev) return null;
      const cardsToRemove = studyCards.filter(c => idsSet.has(c.highlightId)).map(c => c.id);
      const cardsToRemoveSet = new Set(cardsToRemove);
      return {
        ...prev,
        cardIds: prev.cardIds.filter(cid => !cardsToRemoveSet.has(cid)),
        completedIds: prev.completedIds.filter(cid => !cardsToRemoveSet.has(cid))
      };
    });
  }

  // Update book counts
  setBooks(prev => prev.map(b => {
    if (affectedBookIds.has(b.id)) {
      const remainingCount = highlights.filter(h => h.bookId === b.id && !idsSet.has(h.id)).length;
      return { ...b, highlightCount: remainingCount };
    }
    return b;
  }));

  try {
    // Delete from Supabase
    const { error } = await supabase
      .from('highlights')
      .delete()
      .in('id', ids)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to bulk delete highlights:', error);
    // Reload data on error
    const { data: highlightsData } = await supabase
      .from('highlights')
      .select('*')
      .eq('user_id', user.id);
    if (highlightsData) setHighlights(highlightsData.map(fromSupabaseHighlight));

    const { data: cardsData } = await supabase
      .from('study_cards')
      .select('*')
      .eq('user_id', user.id);
    if (cardsData) setStudyCards(cardsData.map(fromSupabaseStudyCard));
  }
};
```

---

## 🎴 Fase 6: CRUD de Study Cards

### 6.1 Atualizar Interfaces

```typescript
interface StoreContextType {
  // ...
  addToStudy: (highlightId: string) => Promise<void>;
  removeFromStudy: (highlightId: string) => Promise<void>;
  bulkAddToStudy: (highlightIds: string[]) => Promise<void>;
  updateCard: (card: StudyCard) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  // ...
}
```

### 6.2 addToStudy

```typescript
const addToStudy = async (highlightId: string) => {
  if (!user) return;

  const existingCard = studyCards.find(c => c.highlightId === highlightId);
  if (existingCard) return;

  const newCard: StudyCard = {
    id: crypto.randomUUID(),
    highlightId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: new Date().toISOString()
  };

  // Optimistic update
  setStudyCards(prev => [...prev, newCard]);
  setHighlights(prev => prev.map(h => h.id === highlightId ? { ...h, inStudy: true } : h));

  try {
    const { error: cardError } = await supabase
      .from('study_cards')
      .insert({
        id: newCard.id,
        user_id: user.id,
        highlight_id: highlightId,
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        next_review_date: new Date().toISOString()
      });

    if (cardError) throw cardError;

    const { error: highlightError } = await supabase
      .from('highlights')
      .update({ in_study: true })
      .eq('id', highlightId)
      .eq('user_id', user.id);

    if (highlightError) throw highlightError;
  } catch (error) {
    console.error('Failed to add to study:', error);
    // Reload on error
    const { data: cardsData } = await supabase
      .from('study_cards')
      .select('*')
      .eq('user_id', user.id);
    if (cardsData) setStudyCards(cardsData.map(fromSupabaseStudyCard));

    const { data: highlightsData } = await supabase
      .from('highlights')
      .select('*')
      .eq('user_id', user.id);
    if (highlightsData) setHighlights(highlightsData.map(fromSupabaseHighlight));
  }
};
```

### 6.3 removeFromStudy

```typescript
const removeFromStudy = async (highlightId: string) => {
  if (!user) return;

  const card = studyCards.find(c => c.highlightId === highlightId);
  if (!card) return;

  // Optimistic update
  setStudyCards(prev => prev.filter(c => c.highlightId !== highlightId));
  setHighlights(prev => prev.map(h => h.id === highlightId ? { ...h, inStudy: false } : h));

  if (currentSession) {
    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        cardIds: prev.cardIds.filter(cid => cid !== card.id),
        completedIds: prev.completedIds.filter(cid => cid !== card.id)
      };
    });
  }

  try {
    const { error: cardError } = await supabase
      .from('study_cards')
      .delete()
      .eq('id', card.id)
      .eq('user_id', user.id);

    if (cardError) throw cardError;

    const { error: highlightError } = await supabase
      .from('highlights')
      .update({ in_study: false })
      .eq('id', highlightId)
      .eq('user_id', user.id);

    if (highlightError) throw highlightError;
  } catch (error) {
    console.error('Failed to remove from study:', error);
    // Reload
    const { data: cardsData } = await supabase
      .from('study_cards')
      .select('*')
      .eq('user_id', user.id);
    if (cardsData) setStudyCards(cardsData.map(fromSupabaseStudyCard));

    const { data: highlightsData } = await supabase
      .from('highlights')
      .select('*')
      .eq('user_id', user.id);
    if (highlightsData) setHighlights(highlightsData.map(fromSupabaseHighlight));
  }
};
```

### 6.4 updateCard

```typescript
const updateCard = async (updatedCard: StudyCard) => {
  if (!user) return;

  // Optimistic update
  setStudyCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));

  try {
    const { error } = await supabase
      .from('study_cards')
      .update({
        ease_factor: updatedCard.easeFactor,
        interval: updatedCard.interval,
        repetitions: updatedCard.repetitions,
        next_review_date: updatedCard.nextReviewDate,
        last_reviewed_at: updatedCard.lastReviewedAt || null
      })
      .eq('id', updatedCard.id)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update card:', error);
    // Reload
    const { data } = await supabase
      .from('study_cards')
      .select('*')
      .eq('user_id', user.id);
    if (data) setStudyCards(data.map(fromSupabaseStudyCard));
  }
};
```

### 6.5 deleteCard

```typescript
const deleteCard = async (cardId: string) => {
  if (!user) return;

  const card = studyCards.find(c => c.id === cardId);
  if (!card) return;

  const highlight = highlights.find(h => h.id === card.highlightId);
  
  // Update daily progress if needed
  const today = new Date().toISOString().split('T')[0];
  let shouldDecrementProgress = false;

  if (highlight) {
    if (card.lastReviewedAt) {
      const lastReviewDate = new Date(card.lastReviewedAt).toISOString().split('T')[0];
      if (lastReviewDate === today && dailyProgress.date === today) {
        shouldDecrementProgress = true;
      }
    }

    if (!shouldDecrementProgress && currentSession && currentSession.completedIds.includes(cardId)) {
      shouldDecrementProgress = true;
    }

    if (shouldDecrementProgress) {
      const bookId = highlight.bookId;
      setDailyProgress(prev => ({
        ...prev,
        bookReviews: {
          ...prev.bookReviews,
          [bookId]: Math.max(0, (prev.bookReviews[bookId] || 0) - 1)
        }
      }));
    }
  }

  // Optimistic update
  setStudyCards(prev => prev.filter(c => c.id !== cardId));
  setHighlights(prev => prev.map(h => 
    h.id === card.highlightId ? { ...h, inStudy: false } : h
  ));

  if (currentSession) {
    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        cardIds: prev.cardIds.filter(id => id !== cardId),
        completedIds: prev.completedIds.filter(id => id !== cardId)
      };
    });
  }

  try {
    const { error } = await supabase
      .from('study_cards')
      .delete()
      .eq('id', cardId)
      .eq('user_id', user.id);

    if (error) throw error;

    // Update highlight
    await supabase
      .from('highlights')
      .update({ in_study: false })
      .eq('id', card.highlightId)
      .eq('user_id', user.id);
  } catch (error) {
    console.error('Failed to delete card:', error);
    // Reload
    const { data: cardsData } = await supabase
      .from('study_cards')
      .select('*')
      .eq('user_id', user.id);
    if (cardsData) setStudyCards(cardsData.map(fromSupabaseStudyCard));

    const { data: highlightsData } = await supabase
      .from('highlights')
      .select('*')
      .eq('user_id', user.id);
    if (highlightsData) setHighlights(highlightsData.map(fromSupabaseHighlight));
  }
};
```

---

## 🏷️ Fase 7: CRUD de Tags

### 7.1 Atualizar Interfaces

```typescript
interface StoreContextType {
  // ...
  addTag: (name: string, parentId?: string, bookId?: string) => Promise<string>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  assignTagToHighlight: (highlightId: string, tagId: string) => Promise<void>;
  removeTagFromHighlight: (highlightId: string, tagId: string) => Promise<void>;
  // ...
}
```

### 7.2 addTag

```typescript
const addTag = async (name: string, parentId?: string, bookId?: string) => {
  if (!user) return '';

  const newTag: Tag = {
    id: crypto.randomUUID(),
    name,
    parentId,
    bookId
  };

  // Optimistic update
  setTags(prev => [...prev, newTag]);

  try {
    const { error } = await supabase
      .from('tags')
      .insert({
        id: newTag.id,
        user_id: user.id,
        name,
        parent_id: parentId || null,
        book_id: bookId || null
      });

    if (error) throw error;
    return newTag.id;
  } catch (error) {
    console.error('Failed to add tag:', error);
    // Reload
    const { data } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', user.id);
    if (data) setTags(data.map(fromSupabaseTag));
    return '';
  }
};
```

### 7.3 updateTag

```typescript
const updateTag = async (id: string, updates: Partial<Tag>) => {
  if (!user) return;

  // Optimistic update
  setTags(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

  try {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.parentId !== undefined) dbUpdates.parent_id = updates.parentId;
    if (updates.bookId !== undefined) dbUpdates.book_id = updates.bookId;
    if (updates.color !== undefined) dbUpdates.color = updates.color;

    const { error } = await supabase
      .from('tags')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update tag:', error);
    // Reload
    const { data } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', user.id);
    if (data) setTags(data.map(fromSupabaseTag));
  }
};
```

### 7.4 deleteTag

```typescript
const deleteTag = async (id: string) => {
  if (!user) return;

  // Collect all tag IDs to delete (tag + descendants)
  const tagsToDelete = new Set<string>();
  tagsToDelete.add(id);

  let addedCount = 1;
  while (addedCount > 0) {
    addedCount = 0;
    tags.forEach(t => {
      if (!tagsToDelete.has(t.id) && t.parentId && tagsToDelete.has(t.parentId)) {
        tagsToDelete.add(t.id);
        addedCount++;
      }
    });
  }

  // Optimistic update
  setTags(prev => prev.filter(t => !tagsToDelete.has(t.id)));
  setHighlights(prev => prev.map(h => ({
    ...h,
    tags: h.tags?.filter(tId => !tagsToDelete.has(tId))
  })));

  try {
    // Delete from Supabase (cascade will handle children)
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    // Remove tags from highlights
    const idsArray = Array.from(tagsToDelete);
    const highlightsToUpdate = highlights.filter(h => 
      h.tags?.some(tId => idsArray.includes(tId))
    );

    for (const highlight of highlightsToUpdate) {
      const newTags = highlight.tags?.filter(tId => !tagsToDelete.has(tId)) || [];
      await supabase
        .from('highlights')
        .update({ tags: newTags })
        .eq('id', highlight.id)
        .eq('user_id', user.id);
    }
  } catch (error) {
    console.error('Failed to delete tag:', error);
    // Reload
    const { data: tagsData } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', user.id);
    if (tagsData) setTags(tagsData.map(fromSupabaseTag));

    const { data: highlightsData } = await supabase
      .from('highlights')
      .select('*')
      .eq('user_id', user.id);
    if (highlightsData) setHighlights(highlightsData.map(fromSupabaseHighlight));
  }
};
```

### 7.5 assignTagToHighlight

```typescript
const assignTagToHighlight = async (highlightId: string, tagId: string) => {
  if (!user) return;

  const highlight = highlights.find(h => h.id === highlightId);
  if (!highlight) return;

  const currentTags = highlight.tags || [];
  if (currentTags.includes(tagId)) return;

  const newTags = [...currentTags, tagId];

  // Optimistic update
  setHighlights(prev => prev.map(h =>
    h.id === highlightId ? { ...h, tags: newTags } : h
  ));

  try {
    const { error } = await supabase
      .from('highlights')
      .update({ tags: newTags })
      .eq('id', highlightId)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to assign tag:', error);
    // Reload
    const { data } = await supabase
      .from('highlights')
      .select('*')
      .eq('user_id', user.id);
    if (data) setHighlights(data.map(fromSupabaseHighlight));
  }
};
```

### 7.6 removeTagFromHighlight

```typescript
const removeTagFromHighlight = async (highlightId: string, tagId: string) => {
  if (!user) return;

  const highlight = highlights.find(h => h.id === highlightId);
  if (!highlight) return;

  const newTags = highlight.tags?.filter(t => t !== tagId) || [];

  // Optimistic update
  setHighlights(prev => prev.map(h =>
    h.id === highlightId ? { ...h, tags: newTags } : h
  ));

  try {
    const { error } = await supabase
      .from('highlights')
      .update({ tags: newTags })
      .eq('id', highlightId)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to remove tag:', error);
    // Reload
    const { data } = await supabase
      .from('highlights')
      .select('*')
      .eq('user_id', user.id);
    if (data) setHighlights(data.map(fromSupabaseHighlight));
  }
};
```

---

## 📚 Fase 8: Study Sessions

### 8.1 submitReview

**ADICIONAR** ao final da função `submitReview`:

```typescript
const submitReview = (cardId: string, quality: number) => {
  // ... código existente ...

  // ADICIONAR no final:
  if (user) {
    // Save review log to Supabase
    supabase
      .from('review_logs')
      .insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        card_id: cardId,
        quality,
        reviewed_at: new Date().toISOString(),
        interval_days: card.interval,
        ease_factor: card.easeFactor
      })
      .then(({ error }) => {
        if (error) console.error('Failed to save review log:', error);
      });
  }
};
```

---

## ⚙️ Fase 9: Settings

### 9.1 Atualizar Interface

```typescript
interface StoreContextType {
  // ...
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  // ...
}
```

### 9.2 updateSettings

```typescript
const updateSettings = async (newSettings: Partial<UserSettings>) => {
  if (!user) return;

  // Optimistic update
  setSettings(prev => ({ ...prev, ...newSettings }));

  try {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        max_reviews_per_day: newSettings.maxReviewsPerDay ?? settings.maxReviewsPerDay,
        new_cards_per_day: newSettings.newCardsPerDay ?? settings.newCardsPerDay,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update settings:', error);
    // Reload
    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setSettings({
        maxReviewsPerDay: data.max_reviews_per_day,
        newCardsPerDay: data.new_cards_per_day
      });
    }
  }
};
```

---

## 🐛 Problemas Comuns

### 1. Erro: "invalid input syntax for type uuid"

**Causa:** Parser gerando IDs em base64 ao invés de UUIDs

**Solução:** Implementar `generateDeterministicUUID` no parser (ver Fase 2.2)

### 2. Tabelas não aparecem no Supabase Dashboard

**Causa:** Visualizando schema errado

**Solução:** Mudar de `storage` para `public` no dropdown de schemas

### 3. Dados não persistem após reload

**Causa:** Função não está sendo chamada com `await`

**Solução:** Verificar se todos os componentes que chamam funções async usam `await`

### 4. Erro: "Cannot find name 'user'"

**Causa:** Esqueceu de adicionar `const { user } = useAuth();`

**Solução:** Adicionar no início do StoreProvider

### 5. RLS bloqueando acesso

**Causa:** Políticas RLS muito restritivas

**Solução:** Verificar políticas no Supabase Dashboard > Authentication > Policies

---

## ✅ Testes

### Checklist de Testes

#### Importação
- [ ] Importar `MyClippings.txt`
- [ ] Verificar dados no Supabase Dashboard
- [ ] Recarregar página - dados devem persistir

#### Highlights
- [ ] Editar highlight
- [ ] Deletar highlight
- [ ] Deletar múltiplos highlights
- [ ] Favoritar/desfavoritar
- [ ] Adicionar nota

#### Study Cards
- [ ] Adicionar highlight ao estudo
- [ ] Remover do estudo
- [ ] Adicionar múltiplos ao estudo
- [ ] Deletar card
- [ ] Revisar card

#### Tags
- [ ] Criar tag
- [ ] Editar tag
- [ ] Deletar tag
- [ ] Atribuir tag a highlight
- [ ] Remover tag de highlight

#### Study Session
- [ ] Iniciar sessão
- [ ] Revisar cards
- [ ] Desfazer review (Ctrl+Z)
- [ ] Verificar daily progress
- [ ] Resetar sessão

#### Settings
- [ ] Alterar max reviews per day
- [ ] Alterar new cards per day
- [ ] Verificar persistência

---

## 📊 Verificação Final

### SQL para verificar dados

```sql
-- Contar registros
SELECT 
  (SELECT COUNT(*) FROM books) as books_count,
  (SELECT COUNT(*) FROM highlights) as highlights_count,
  (SELECT COUNT(*) FROM study_cards) as cards_count,
  (SELECT COUNT(*) FROM tags) as tags_count,
  (SELECT COUNT(*) FROM review_logs) as logs_count;

-- Ver últimas importações
SELECT title, author, last_imported, highlight_count 
FROM books 
ORDER BY last_imported DESC 
LIMIT 5;

-- Ver highlights recentes
SELECT h.text, b.title 
FROM highlights h
JOIN books b ON h.book_id = b.id
ORDER BY h.imported_at DESC
LIMIT 5;
```

---

## 🎯 Próximos Passos (Opcional)

1. **Forgot Password** - Implementar recuperação de senha
2. **Google Login** - OAuth com Google
3. **Profile Page** - Página de perfil do usuário
4. **Sync Indicator** - Mostrar quando está sincronizando
5. **Offline Mode** - Funcionar sem internet (Service Worker)
6. **Export Data** - Exportar dados em JSON/CSV

---

## 📝 Notas Finais

- **Session e DailyProgress** permanecem no localStorage (são dados temporários)
- **ReviewLogs** podem ser migrados para Supabase se quiser histórico completo
- **Optimistic Updates** garantem UI responsiva
- **Error Handling** sempre recarrega dados do servidor em caso de falha
- **RLS** garante que cada usuário só vê seus próprios dados

---

**Criado por:** Antigravity AI  
**Data:** 16/12/2025  
**Versão:** 1.0
