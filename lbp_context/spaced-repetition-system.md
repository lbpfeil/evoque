# Sistema de Repetição Espaçada - Evoque

## 📋 Visão Geral

O Evoque implementa o algoritmo **SM-2 (SuperMemo 2)** adaptado para gerenciar revisões de highlights do Kindle. Este documento explica a lógica completa do sistema, estruturas de dados, fluxos de revisão e casos especiais.

---

## 🎯 Algoritmo SM-2: Conceitos Fundamentais

### Princípio Base

O SM-2 calcula intervalos progressivamente maiores entre revisões com base na **facilidade** com que você lembra do conteúdo. Quanto melhor você responde, maior o intervalo até a próxima revisão.

### Parâmetros Principais

```typescript
interface StudyCard {
  id: string;
  highlightId: string;
  easeFactor: number;      // Fator de facilidade (1.3 - 2.5)
  interval: number;         // Intervalo em DIAS até próxima revisão
  repetitions: number;      // Número de vezes respondido corretamente
  nextReviewDate: string;   // Data/hora da próxima revisão (ISO 8601)
  lastReviewedAt?: string;  // Data/hora da última revisão
}
```

**Valores Iniciais:**
- `easeFactor`: 2.5 (padrão)
- `interval`: 0 (ainda não revisado)
- `repetitions`: 0 (card novo)
- `nextReviewDate`: data de criação (disponível imediatamente)

---

## 🔢 Qualidades de Resposta

O usuário marca a facilidade de lembrar:

| Quality | Nome | Significado | Efeito no Card |
|---------|------|-------------|----------------|
| **1** | Again | Não lembrou / Errou | Reseta card (repetitions = 0) |
| **2** | Hard | Lembrou com dificuldade | Passa com intervalo reduzido |
| **3** | Good | Lembrou normalmente | Passa com intervalo padrão |
| **4** | Easy | Lembrou facilmente | Passa com intervalo aumentado |

---

## 🧮 Cálculo do Próximo Intervalo

### Implementação (services/sm2.ts)

```typescript
export const calculateNextReview = (card: StudyCard, quality: number): StudyCard => {
  let { interval, repetitions, easeFactor } = card;

  if (quality >= 2) {
    // Resposta correta (Hard, Good, Easy)
    if (repetitions === 0) {
      interval = 1;  // 1ª revisão: 1 dia
    } else if (repetitions === 1) {
      interval = quality === 2 ? 3 : 6;  // 2ª revisão: 3 dias (Hard) ou 6 dias (Good/Easy)
    } else {
      // 3ª+ revisão: multiplica pelo ease factor
      interval = Math.round(interval * easeFactor);
      
      if (quality === 2) {
        // Hard: reduz intervalo (multiplica por 1.2 ao invés de easeFactor)
        interval = Math.max(1, Math.round(interval * 1.2 / easeFactor));
      }
    }
    
    repetitions += 1;

    // Ajusta ease factor
    if (quality === 4) {
      easeFactor += 0.15;  // Easy: aumenta facilidade
    } else if (quality === 2) {
      easeFactor -= 0.15;  // Hard: diminui facilidade
    }
    // Quality 3 (Good): mantém ease factor
    
  } else {
    // Resposta incorreta (Again)
    repetitions = 0;
    interval = 1;
    // easeFactor mantido (não penaliza permanentemente)
  }

  // Limita ease factor entre 1.3 e 2.5
  if (easeFactor < 1.3) easeFactor = 1.3;
  if (easeFactor > 2.5) easeFactor = 2.5;

  // Calcula próxima data
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    ...card,
    interval,
    repetitions,
    easeFactor,
    nextReviewDate: nextDate.toISOString(),
    lastReviewedAt: new Date().toISOString(),
  };
};
```

### Exemplos de Progressão

**Cenário 1: Sempre marca "Good" (quality=3)**
```
Revisão 1: interval = 1 dia   → próxima: d+1
Revisão 2: interval = 6 dias  → próxima: d+6
Revisão 3: interval = 15 dias → próxima: d+15  (6 * 2.5)
Revisão 4: interval = 37 dias → próxima: d+37  (15 * 2.5)
```

**Cenário 2: Marca "Hard" na 2ª revisão**
```
Revisão 1 (Good): interval = 1 dia
Revisão 2 (Hard): interval = 3 dias (não 6)
Revisão 3 (Good): interval = 7 dias  (3 * 2.35, ease factor reduzido)
```

**Cenário 3: Marca "Again" (reseta)**
```
Revisão 1 (Good): interval = 1, repetitions = 1
Revisão 2 (Good): interval = 6, repetitions = 2
Revisão 3 (Again): interval = 1, repetitions = 0  ← RESETOU
Revisão 4 (Good): interval = 1, repetitions = 1  ← Recomeça
```

---

## 🗂️ Estrutura de Dados no Supabase

### Tabela: `study_cards`

```sql
CREATE TABLE study_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  highlight_id UUID REFERENCES highlights UNIQUE NOT NULL,
  ease_factor FLOAT DEFAULT 2.5,
  interval INTEGER DEFAULT 0,  -- dias
  repetitions INTEGER DEFAULT 0,
  next_review_date TIMESTAMPTZ DEFAULT now(),
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Tabela: `review_logs`

Guarda histórico de todas as revisões (analytics):

```sql
CREATE TABLE review_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  card_id UUID REFERENCES study_cards NOT NULL,
  quality INTEGER NOT NULL,  -- 1-4
  reviewed_at TIMESTAMPTZ DEFAULT now(),
  interval_days INTEGER,
  ease_factor FLOAT
);
```

**Importante:** `interval_days` e `ease_factor` guardam os valores **ANTES** da revisão (estado anterior do card).

### Tabela: `user_settings`

```sql
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  max_reviews_per_day INTEGER DEFAULT 20,
  new_cards_per_day INTEGER DEFAULT 10,
  daily_progress JSONB,  -- { date: string, bookReviews: Record<bookId, count> }
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🔄 Fluxo de Revisão Completo

### 1. Início da Sessão

```typescript
// components/StoreContext.tsx - startSession()

const startSession = (bookId?: string) => {
  // 1. Busca cards devidos HOJE (comparação apenas de data, não hora)
  const due = bookId ? getBookCardsDue(bookId) : getCardsDue();
  
  // 2. Filtra cards já revisados hoje
  const cardsNotReviewedToday = due.filter(card => {
    if (!card.lastReviewedAt) return true;
    const lastReviewDate = new Date(card.lastReviewedAt).toISOString().split('T')[0];
    return lastReviewDate !== today;
  });
  
  // 3. ORDENA por next_review_date (mais antigos/atrasados primeiro)
  const sortedDue = [...cardsNotReviewedToday].sort((a, b) =>
    new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime()
  );
  
  // 4. Aplica limite diário (10 cards/livro)
  const remaining = 10 - reviewsToday;
  const sessionCards = sortedDue.slice(0, remaining);
  
  // 5. Cria sessão
  setCurrentSession({
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    cardIds: sessionCards.map(c => c.id),
    completedIds: [],
    results: [],
    history: [],  // Usado para undo
    bookId: bookId
  });
};
```

### 2. Revisão do Card

```typescript
// pages/StudySession.tsx - handleResponse()

const handleResponse = async (quality: number) => {
  // 1. SALVA estado ANTES de atualizar (crucial para undo)
  const previousCard = { ...currentCard };
  
  // 2. Calcula novo estado com SM-2
  const updatedCard = calculateNextReview(currentCard, quality);
  
  // 3. Atualiza card no banco (Supabase)
  await updateCard(updatedCard);
  
  // 4. Salva histórico da revisão (review log + session history)
  await submitReview(currentCard.id, quality, previousCard);
};
```

### 3. Salvamento da Revisão

```typescript
// components/StoreContext.tsx - submitReview()

const submitReview = async (cardId: string, quality: number, previousCard: StudyCard) => {
  // 1. Atualiza daily progress (contador por livro)
  const highlight = highlights.find(h => h.id === previousCard.highlightId);
  const bookId = highlight.bookId;
  setDailyProgress(prev => ({
    ...prev,
    bookReviews: {
      ...prev.bookReviews,
      [bookId]: (prev.bookReviews[bookId] || 0) + 1
    }
  }));
  
  // 2. Adiciona ao histórico da sessão (para undo)
  setCurrentSession(prev => ({
    ...prev,
    completedIds: [...prev.completedIds, cardId],
    results: [...prev.results, { cardId, quality, timestamp: Date.now() }],
    history: [...prev.history, {
      cardId,
      previousCard: { ...previousCard },  // Estado ANTERIOR
      quality,
      timestamp: Date.now()
    }]
  }));
  
  // 3. Cria review log
  const newLog = {
    id: crypto.randomUUID(),
    cardId,
    quality,
    reviewedAt: new Date().toISOString(),
    interval: previousCard.interval,      // Estado ANTERIOR
    easeFactor: previousCard.easeFactor   // Estado ANTERIOR
  };
  
  // 4. Salva review log no Supabase
  await supabase
    .from('review_logs')
    .insert(toSupabaseReviewLog(newLog, user.id));
};
```

---

## ⏪ Sistema de Undo (CTRL+Z)

### Lógica de Undo

```typescript
// components/StoreContext.tsx - undoLastReview()

const undoLastReview = async () => {
  if (!currentSession || currentSession.history.length === 0) return;
  
  const lastReview = currentSession.history[currentSession.history.length - 1];
  
  // 1. RESTAURA card para estado ANTERIOR
  await updateCard(lastReview.previousCard);
  
  // 2. Decrementa daily progress
  const card = lastReview.previousCard;
  const highlight = highlights.find(h => h.id === card.highlightId);
  const bookId = highlight.bookId;
  setDailyProgress(prev => ({
    ...prev,
    bookReviews: {
      ...prev.bookReviews,
      [bookId]: Math.max(0, (prev.bookReviews[bookId] || 0) - 1)
    }
  }));
  
  // 3. Remove da sessão
  setCurrentSession(prev => ({
    ...prev,
    completedIds: prev.completedIds.slice(0, -1),
    results: prev.results.slice(0, -1),
    history: prev.history.slice(0, -1)
  }));
  
  // 4. Remove review log LOCAL
  const lastLog = reviewLogs[reviewLogs.length - 1];
  setReviewLogs(prev => prev.slice(0, -1));
  
  // 5. DELETE review log do SUPABASE
  if (lastLog) {
    await supabase
      .from('review_logs')
      .delete()
      .eq('id', lastLog.id)
      .eq('user_id', user.id);
  }
};
```

### Importância do `previousCard`

❌ **ANTES (BUG):**
```typescript
// submitReview buscava o card JÁ ATUALIZADO
const card = studyCards.find(c => c.id === cardId);  // Card NOVO
history: [...prev.history, { previousCard: { ...card } }]  // Salvava estado NOVO!
```

✅ **DEPOIS (CORRETO):**
```typescript
// handleResponse salva o card ANTES de atualizar
const previousCard = { ...currentCard };  // Card ANTIGO
await updateCard(updatedCard);
await submitReview(cardId, quality, previousCard);  // Passa estado ANTIGO
```

**Resultado:** Undo agora restaura o card exatamente como estava antes da revisão, incluindo `next_review_date` e `last_reviewed_at`.

---

## 📅 Comparação de Datas (Fix Crítico)

### Problema Original

```typescript
// ERRADO: Compara data E hora
const getCardsDue = () => {
  const now = new Date();  // 2025-12-19T15:00:00
  return studyCards.filter(card => 
    new Date(card.nextReviewDate) <= now  // 2025-12-19T20:00:00 > now ❌
  );
};
```

**Resultado:** Card revisado às 20h ontem só aparece depois das 20h hoje!

### Correção

```typescript
// CORRETO: Compara apenas DATAS (sem hora)
const getCardsDue = () => {
  const today = new Date().toISOString().split('T')[0];  // "2025-12-19"
  return studyCards.filter(card => {
    const cardDueDate = card.nextReviewDate.split('T')[0];  // "2025-12-19"
    return cardDueDate <= today;  // Compara strings de data
  });
};
```

**Resultado:** Card com `next_review_date = 2025-12-19` aparece **a qualquer hora** do dia 19/12!

---

## 🎯 Ordenação Inteligente da Fila

### Estratégia Anki

Cards são apresentados por **prioridade de atraso**:

```
Ordem de apresentação:
1. Card de 15/12 (4 dias atrasado)  ← MAIS URGENTE
2. Card de 17/12 (2 dias atrasado)
3. Card de 18/12 (1 dia atrasado)
4. Card de 19/12 (devido hoje)      ← MENOS URGENTE
```

### Implementação

```typescript
const sortedDue = [...cardsNotReviewedToday].sort((a, b) =>
  new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime()
);
```

**Benefício:** Reforça primeiro o conhecimento que está **mais próximo de ser esquecido**.

---

## 📊 Limites Diários

### Regras

- **10 cards novos/revisões por livro por dia**
- Contador resetado automaticamente à meia-noite
- Sessão "All Books" soma limites de todos os livros

### Estrutura Daily Progress

```typescript
interface DailyProgress {
  date: string;  // "2025-12-19"
  bookReviews: Record<string, number>;  // { "bookId": 5, "bookId2": 3 }
}
```

### Reset Automático

```typescript
const startSession = (bookId?: string) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Reset se mudou de dia
  if (dailyProgress.date !== today) {
    setDailyProgress({ date: today, bookReviews: {} });
  }
  
  // Verifica limite
  const reviewsToday = dailyProgress.bookReviews[bookId] || 0;
  if (reviewsToday >= 10) {
    // Deck esgotado para hoje
    return;
  }
};
```

---

## 🔍 Estados dos Cards

### Classificação por Repetitions

```typescript
export type StudyStatus = 'new' | 'learning' | 'review';

const getHighlightStudyStatus = (highlightId: string): StudyStatus => {
  const card = studyCards.find(c => c.highlightId === highlightId);
  
  if (!card) return 'not-started';
  
  if (card.repetitions === 0) return 'new';       // Amarelo
  if (card.repetitions < 5) return 'learning';    // Azul
  return 'review';                                 // Verde (consolidado)
};
```

### Significado

| Status | Repetitions | Intervalo Típico | Cor Badge |
|--------|-------------|------------------|-----------|
| **New** | 0 | 0 dias (nunca revisado) | 🟡 Amarelo |
| **Learning** | 1-4 | 1-37 dias | 🔵 Azul |
| **Review** | 5+ | 37+ dias | 🟢 Verde |

---

## 📈 Estatísticas de Deck

```typescript
interface DeckStats {
  new: number;       // repetitions = 0
  learning: number;  // repetitions 1-4
  review: number;    // repetitions >= 5
  total: number;     // soma de todos
}

const getDeckStats = (bookId?: string): DeckStats => {
  const cards = bookId ? getBookCardsDue(bookId) : getCardsDue();
  
  // Filtra apenas cards disponíveis hoje (respeitando limite diário)
  const today = new Date().toISOString().split('T')[0];
  const reviewsToday = dailyProgress.bookReviews[bookId] || 0;
  const remaining = Math.max(0, 10 - reviewsToday);
  
  const cardsNotReviewedToday = cards.filter(card => {
    if (!card.lastReviewedAt) return true;
    const lastReviewDate = new Date(card.lastReviewedAt).toISOString().split('T')[0];
    return lastReviewDate !== today;
  });
  
  const limitedCards = cardsNotReviewedToday.slice(0, remaining);
  
  return {
    new: limitedCards.filter(c => c.repetitions === 0).length,
    learning: limitedCards.filter(c => c.repetitions >= 1 && c.repetitions < 5).length,
    review: limitedCards.filter(c => c.repetitions >= 5).length,
    total: limitedCards.length
  };
};
```

---

## 🔐 Row Level Security (RLS)

### Políticas no Supabase

```sql
-- STUDY_CARDS
CREATE POLICY "Users can manage their own study cards"
ON study_cards FOR ALL
USING (auth.uid() = user_id);

-- REVIEW_LOGS
CREATE POLICY "Users can view own logs"
ON review_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
ON review_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- USER_SETTINGS
CREATE POLICY "Users can view own settings"
ON user_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
ON user_settings FOR UPDATE
USING (auth.uid() = user_id);
```

**Garantia:** Cada usuário só acessa seus próprios dados.

---

## 🚀 Padrão Optimistic UI

### Todas as operações seguem:

```typescript
const updateCard = async (updatedCard: StudyCard) => {
  // 1. Update OPTIMISTA (UI imediata)
  setStudyCards(prev => prev.map(c => 
    c.id === updatedCard.id ? updatedCard : c
  ));
  
  // 2. Sync com Supabase
  try {
    const { error } = await supabase
      .from('study_cards')
      .update(toSupabaseStudyCard(updatedCard, user.id))
      .eq('id', updatedCard.id);
      
    if (error) throw error;
  } catch (error) {
    console.error('Failed to update card:', error);
    
    // 3. ROLLBACK: recarrega do banco em caso de erro
    const { data } = await supabase
      .from('study_cards')
      .select('*')
      .eq('user_id', user.id);
    if (data) setStudyCards(data.map(fromSupabaseStudyCard));
  }
};
```

**Benefício:** UI instantânea + confiabilidade do banco.

---

## 📝 Mapeamento camelCase ↔ snake_case

### Conversores (lib/supabaseHelpers.ts)

```typescript
// TypeScript → SQL
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

// SQL → TypeScript
export const fromSupabaseStudyCard = (row: any): StudyCard => ({
  id: row.id,
  highlightId: row.highlight_id,
  easeFactor: row.ease_factor,
  interval: row.interval,
  repetitions: row.repetitions,
  nextReviewDate: row.next_review_date,
  lastReviewedAt: row.last_reviewed_at
});
```

**Review Logs (fix crítico):**

```typescript
// CORRIGIDO: interval → interval_days
export const toSupabaseReviewLog = (log: any, userId: string) => ({
  id: log.id,
  user_id: userId,
  card_id: log.cardId,
  quality: log.quality,
  reviewed_at: log.reviewedAt,
  interval_days: log.interval,  // ← Coluna correta!
  ease_factor: log.easeFactor
});
```

---

## 🧪 Casos de Teste

### Teste 1: Primeira Revisão (Good)

**Estado Inicial:**
```json
{ "repetitions": 0, "interval": 0, "nextReviewDate": "2025-12-19" }
```

**Ação:** Marca Good (quality=3)

**Estado Final:**
```json
{ "repetitions": 1, "interval": 1, "nextReviewDate": "2025-12-20" }
```

### Teste 2: Segunda Revisão (Hard)

**Estado Inicial:**
```json
{ "repetitions": 1, "interval": 1, "easeFactor": 2.5 }
```

**Ação:** Marca Hard (quality=2)

**Estado Final:**
```json
{ 
  "repetitions": 2, 
  "interval": 3,        // 3 dias (não 6)
  "easeFactor": 2.35    // Reduzido
}
```

### Teste 3: Reset com Again

**Estado Inicial:**
```json
{ "repetitions": 5, "interval": 93, "nextReviewDate": "2025-03-15" }
```

**Ação:** Marca Again (quality=1)

**Estado Final:**
```json
{ 
  "repetitions": 0,     // Resetou!
  "interval": 1,        // Recomeça
  "easeFactor": 2.35,   // Manteve
  "nextReviewDate": "2025-12-20"
}
```

### Teste 4: Undo Completo

**Card Antes da Revisão:**
```json
{ "repetitions": 1, "interval": 1, "nextReviewDate": "2025-12-18" }
```

**Após Revisão (Good):**
```json
{ "repetitions": 2, "interval": 6, "nextReviewDate": "2025-12-25" }
```

**Após CTRL+Z:**
```json
{ "repetitions": 1, "interval": 1, "nextReviewDate": "2025-12-18" }
```
✅ Voltou exatamente ao estado anterior!

---

## 📚 Referências

- **Algoritmo Original:** SuperMemo SM-2 (Piotr Wozniak, 1988)
- **Implementação de Referência:** Anki (código aberto)
- **Arquivos Chave:**
  - `services/sm2.ts` - Lógica do algoritmo
  - `components/StoreContext.tsx` - Gerenciamento de estado e sincronização
  - `pages/StudySession.tsx` - Interface de revisão
  - `lib/supabaseHelpers.ts` - Conversão de dados

---

## 🔄 Últimas Correções Críticas

### 1. Comparação de Datas (2025-12-19)
**Problema:** Cards só apareciam após o mesmo horário da última revisão  
**Solução:** Comparar apenas datas (YYYY-MM-DD), não timestamps completos

### 2. Persistência de Review Logs (2025-12-19)
**Problema:** `interval` vs `interval_days` no banco  
**Solução:** Correção do mapeamento em `toSupabaseReviewLog`

### 3. CTRL+Z com Estado Incorreto (2025-12-19)
**Problema:** `history` guardava card DEPOIS da atualização  
**Solução:** Passar `previousCard` como parâmetro para `submitReview`

### 4. Deleção de Review Logs no Undo (2025-12-19)
**Problema:** Logs ficavam órfãos no Supabase após undo  
**Solução:** Adicionar `DELETE` no Supabase dentro de `undoLastReview`

---

**Última Atualização:** 19 de Dezembro de 2025  
**Status:** ✅ Sistema 100% funcional e testado

