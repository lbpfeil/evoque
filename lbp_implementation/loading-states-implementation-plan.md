# Loading States - Plano de Implementação

> **Criado em:** 2025-12-22
> **Status:** Pendente
> **Prioridade:** Média
> **Estimativa:** 2-3 horas de implementação

---

## 📝 CONTEXTO

**O que são Loading States?**

Estados de carregamento (loading states) são indicadores visuais que informam ao usuário que uma operação assíncrona está em andamento. São críticos para UX porque:

- ✅ Confirmam que a ação foi registrada
- ✅ Previnem cliques duplicados
- ✅ Gerenciam expectativas do usuário
- ✅ Comunicam progresso e status

**Problema Atual:**

Atualmente, operações assíncronas no EVOQUE (delete, import, upload) não têm feedback visual durante processamento, causando:
- ❌ Usuário não sabe se ação funcionou
- ❌ Possibilidade de cliques duplicados
- ❌ Confusão quando nada acontece visualmente
- ❌ Experiência parece "travada"

---

## 🎯 OBJETIVOS

1. Implementar loading states em todas operações assíncronas críticas
2. Melhorar feedback visual durante processamento
3. Prevenir ações duplicadas via disabled states
4. Manter consistência de design (compact UI)

---

## 📋 OPERAÇÕES PRIORITÁRIAS

### **Alta Prioridade** (Implementar primeiro)

#### 1. Bulk Delete Highlights
**Arquivo:** `pages/Highlights.tsx`
**Função:** `handleBulkDelete` (linha 148-153)

**Implementação:**
```typescript
// Estado
const [isDeleting, setIsDeleting] = useState(false);

// Handler
const handleBulkDelete = async () => {
  if (window.confirm(`Are you sure you want to delete ${selectedIds.size} highlights?`)) {
    setIsDeleting(true);

    try {
      await bulkDeleteHighlights(Array.from(selectedIds));
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Delete failed:', error);
      // Opcional: toast notification
    } finally {
      setIsDeleting(false);
    }
  }
};

// UI (linha 339-348)
<button
  onClick={handleBulkDelete}
  disabled={isDeleting}
  className={`flex items-center gap-1 text-[9px] hover:text-zinc-300 transition-colors uppercase tracking-wide font-semibold ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
>
  {isDeleting ? (
    <>
      <Loader2 className="w-2.5 h-2.5 animate-spin" />
      Deleting...
    </>
  ) : (
    <>
      <Trash2 className="w-2.5 h-2.5" />
      Delete
    </>
  )}
</button>
```

**Import necessário:**
```typescript
import { Loader2 } from 'lucide-react';
```

---

#### 2. Import MyClippings.txt
**Arquivo:** `pages/Settings.tsx` (Import tab)
**Componente:** Provavelmente existe um componente de upload

**Implementação:**
```typescript
// Estado
const [isImporting, setIsImporting] = useState(false);
const [importProgress, setImportProgress] = useState<{
  processed: number;
  total: number;
} | null>(null);

// Handler
const handleFileUpload = async (file: File) => {
  setIsImporting(true);
  setImportProgress({ processed: 0, total: 0 });

  try {
    const text = await file.text();

    // Opcional: se parser.ts retornar progresso
    const result = await importData(text, (progress) => {
      setImportProgress(progress);
    });

    // Success feedback
    console.log(`Imported ${result.newHighlights} highlights`);
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    setIsImporting(false);
    setImportProgress(null);
  }
};

// UI
{isImporting ? (
  <div className="p-8 text-center">
    <Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-400" />
    <p className="mt-2 text-xs text-zinc-600">
      Importing highlights...
      {importProgress && ` (${importProgress.processed}/${importProgress.total})`}
    </p>
  </div>
) : (
  // Drop zone normal
)}
```

---

#### 3. Study Session Submit Review
**Arquivo:** `pages/StudySession.tsx`
**Função:** `handleResponse` ou similar

**Implementação:**
```typescript
// Estado
const [isSubmitting, setIsSubmitting] = useState(false);

// Handler
const handleResponse = async (quality: number) => {
  setIsSubmitting(true);

  try {
    await submitReview(currentCard.id, quality, previousState);
    // Avança para próximo card
  } catch (error) {
    console.error('Submit failed:', error);
  } finally {
    setIsSubmitting(false);
  }
};

// UI - Desabilitar botões durante submit
<button
  onClick={() => handleResponse(1)}
  disabled={isSubmitting}
  className={isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
>
  Again
</button>
```

---

### **Média Prioridade** (Implementar depois)

#### 4. Avatar Upload
**Arquivo:** `pages/Settings.tsx` (Account tab)

**Implementação:**
```typescript
const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);

const handleAvatarUpload = async (file: File) => {
  setIsUploadingAvatar(true);
  setUploadProgress(0);

  try {
    // Validação
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('File too large (max 2MB)');
    }

    setUploadProgress(25);

    // Upload para Supabase Storage
    const ext = file.name.split('.').pop();
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(`${user.id}/avatar.${ext}`, file, {
        upsert: true,
        cacheControl: '0'
      });

    setUploadProgress(75);

    if (error) throw error;

    // Atualiza user_settings
    const publicUrl = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path).data.publicUrl;

    await updateSettings({ avatarUrl: publicUrl + '?t=' + Date.now() });

    setUploadProgress(100);

  } catch (error) {
    console.error('Upload failed:', error);
  } finally {
    setIsUploadingAvatar(false);
    setUploadProgress(0);
  }
};

// UI
<div className="relative">
  <img
    src={avatarUrl}
    className={`w-16 h-16 rounded-full ${isUploadingAvatar ? 'opacity-50' : ''}`}
  />

  {isUploadingAvatar && (
    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
      <div className="text-white text-[10px] font-semibold">
        {uploadProgress}%
      </div>
    </div>
  )}

  <button
    onClick={() => fileInput.current?.click()}
    disabled={isUploadingAvatar}
    className={`mt-2 ${isUploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {isUploadingAvatar ? 'Uploading...' : 'Change Photo'}
  </button>
</div>
```

---

#### 5. Highlight Edit Modal - Save
**Arquivo:** `components/HighlightEditModal.tsx`

**Implementação:**
```typescript
const [isSaving, setIsSaving] = useState(false);

const handleSave = async () => {
  setIsSaving(true);

  try {
    await updateHighlight(highlightId, {
      text: editedText,
      note: editedNote
    });
    onClose();
  } catch (error) {
    console.error('Save failed:', error);
  } finally {
    setIsSaving(false);
  }
};

// Footer button
<button
  onClick={handleSave}
  disabled={isSaving}
  className={`px-3 py-1.5 bg-black text-white rounded ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
>
  {isSaving ? (
    <>
      <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
      Saving...
    </>
  ) : (
    'Save Changes'
  )}
</button>
```

---

#### 6. Tag Assignment
**Arquivo:** `components/TagSelector.tsx`

**Implementação:**
```typescript
const [isUpdatingTag, setIsUpdatingTag] = useState(false);

const handleTagToggle = async (tagId: string) => {
  setIsUpdatingTag(true);

  try {
    if (currentTags.includes(tagId)) {
      await removeTagFromHighlight(highlightId, tagId);
    } else {
      await assignTagToHighlight(highlightId, tagId);
    }
  } catch (error) {
    console.error('Tag update failed:', error);
  } finally {
    setIsUpdatingTag(false);
  }
};

// Mini-spinner durante update
{isUpdatingTag && (
  <Loader2 className="w-3 h-3 animate-spin text-zinc-400 ml-1" />
)}
```

---

## 🎨 DESIGN PATTERNS

### **Pattern 1: Button with Spinner**
```typescript
<button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="w-3 h-3 animate-spin" />
      Loading...
    </>
  ) : (
    'Action'
  )}
</button>
```

### **Pattern 2: Overlay with Progress**
```typescript
{isLoading && (
  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
    <Loader2 className="w-6 h-6 animate-spin text-white" />
  </div>
)}
```

### **Pattern 3: Inline Spinner**
```typescript
<div className="flex items-center gap-2">
  <span>Processing</span>
  {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
</div>
```

### **Pattern 4: Progress Percentage**
```typescript
<div className="text-xs text-zinc-600">
  Uploading... {progress}%
</div>
```

---

## 🛠️ UTILITIES & HELPERS

### **Hook Customizado (Opcional)**
```typescript
// hooks/useAsyncAction.ts
export const useAsyncAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async <T,>(
    action: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await action();
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading, error };
};

// Uso:
const { execute, isLoading } = useAsyncAction();

const handleDelete = () => {
  execute(
    () => bulkDeleteHighlights(ids),
    () => console.log('Success!'),
    (err) => console.error('Failed:', err)
  );
};
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Alta Prioridade
- [ ] Bulk Delete Highlights (Highlights.tsx)
- [ ] Import MyClippings (Settings.tsx)
- [ ] Study Session Submit (StudySession.tsx)
- [ ] Testar em desenvolvimento
- [ ] Verificar comportamento de erro

### Fase 2: Média Prioridade
- [ ] Avatar Upload (Settings.tsx)
- [ ] Highlight Edit Save (HighlightEditModal.tsx)
- [ ] Tag Assignment (TagSelector.tsx)
- [ ] Revisar consistência visual
- [ ] Testar edge cases (network slow, timeout)

### Fase 3: Polish
- [ ] Adicionar toast notifications (opcional)
- [ ] Timeout handling (>10s = erro)
- [ ] Skeleton screens para initial load (opcional)
- [ ] Loading states em fetch inicial de dados

---

## 🚨 CONSIDERAÇÕES IMPORTANTES

### **1. Optimistic UI + Loading State**
O EVOQUE já usa Optimistic UI (atualiza imediatamente, depois sincroniza). Loading states devem **coexistir** com isso:

```typescript
// ✅ CORRETO: Optimistic update + loading feedback
const handleDelete = async (id: string) => {
  setIsDeleting(true);

  // 1. Update local state (optimistic)
  setState(prev => prev.filter(item => item.id !== id));

  // 2. Sync with Supabase (show loading)
  try {
    await supabase.from('table').delete().eq('id', id);
  } catch (error) {
    // 3. Rollback on error
    await reloadData();
  } finally {
    setIsDeleting(false);
  }
};
```

### **2. StoreContext Integration**
Loading states podem ser gerenciados no StoreContext para operações globais:

```typescript
// StoreContext.tsx
const [loadingStates, setLoadingStates] = useState({
  importing: false,
  deletingHighlights: false,
  uploadingAvatar: false
});

// Expor no context
return (
  <StoreContext.Provider value={{
    ...data,
    ...methods,
    loadingStates,  // 👈 Expor loading states
  }}>
```

### **3. Compact UI Compliance**
Todos os loading states devem seguir compact design guidelines:
- Spinners: `w-3 h-3` ou `w-2.5 h-2.5`
- Text: `text-xs` ou `text-[10px]`
- Spacing: `gap-1` ou `gap-1.5`
- Colors: `text-zinc-400` para spinners

---

## 📊 MÉTRICAS DE SUCESSO

Após implementação, validar:
- ✅ Usuário vê feedback visual imediato (<100ms)
- ✅ Botões ficam disabled durante operação
- ✅ Sem cliques duplicados possíveis
- ✅ Rollback correto em caso de erro
- ✅ Loading states terminam sempre (finally block)

---

## 🔗 REFERÊNCIAS

- **Design System:** `lbp_diretrizes/compact-ui-design-guidelines.md`
- **Optimistic UI Pattern:** `lbp_context/TECHNICAL_CONTEXT.md` (linhas 167-195)
- **Lucide Icons:** https://lucide.dev/icons/loader-2

---

**Última Atualização:** 2025-12-22
**Próxima Revisão:** Após implementação da Fase 1
