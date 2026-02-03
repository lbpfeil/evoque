# EVOQUE - Product Context

> **Last Updated:** 2025-12-19  
> **Purpose:** Product vision, market context, and business goals (NOT technical specifications)

---

## 📝 CHANGELOG

### 2025-12-17: Supabase Migration
- Migrated from localStorage to Supabase (PostgreSQL)
- Added authentication and user accounts
- Enabled multi-device sync
- Implemented cloud backup

### 2025-12-16: Study Session UX Enhancements
- Added animated progress bar
- Implemented tag system in study interface
- Improved typography and note editing area
- Fixed critical bugs (undo, daily progress tracking)

### 2025-12-15: Study Page Refinements
- Prominent "Study All Books" button
- Delete card during session
- Highlight creation date display
- Keyboard shortcuts (Space, Enter, 1-4, E, Ctrl+Z)

### 2025-12-05: Tag System & Compact UI
- Hierarchical tags (global + book-specific)
- TagSelector component
- Compact UI design guidelines established

---

## 1. VISÃO GERAL

### 1.1 Contexto

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
- Utilização de features (analytics, study sessions, etc.)

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

## 4. FUNCIONALIDADES PRINCIPAIS

### 4.1 Core Features (Implementadas)

**Importação e Organização:**
- Upload de MyClippings.txt com parse automático
- Detecção inteligente de novos highlights
- Biblioteca visual de livros com capas
- Sistema hierárquico de tags (global + book-specific)

**Sistema de Estudo:**
- Repetição espaçada com algoritmo SM-2
- Sessões de estudo por livro ou "All Books"
- Keyboard shortcuts para revisão rápida
- Inline note editing durante estudo
- Daily progress tracking (10 cards/book/day)
- Undo last review (Ctrl+Z)

**Gestão de Conhecimento:**
- CRUD completo de highlights
- Bulk operations (delete, add to study)
- Tag assignment e filtering
- Search e ordenação avançada
- Highlight history e statistics

### 4.2 Experiência do Usuário

**Design Principles:**
- Compact UI (maximize content, minimize chrome)
- Clean, professional aesthetic
- Keyboard-first navigation
- Optimistic UI updates (instant feedback)
- Mobile-responsive

**Key UX Patterns:**
- Drag & drop file upload
- Inline editing (ESC to save)
- Modal contexts for deep focus
- Fixed headers/footers for ergonomics
- Animated progress indicators

---

## 5. ROADMAP

### ✅ MVP (Implemented)

**Core:**
- [x] Authentication (Supabase Auth)
- [x] Import MyClippings.txt
- [x] Book library
- [x] Highlight management
- [x] Study system (SM-2)
- [x] Tag system
- [x] Daily progress tracking
- [x] Keyboard shortcuts

### 🔄 Phase 2 (Planned)

**Analytics:**
- [ ] Dashboard com gráficos de leitura
- [ ] Heatmap de consistência
- [ ] Trending concepts (word cloud)
- [ ] Reading velocity metrics

**Enhancements:**
- [ ] Cover upload/automatic fetch
- [ ] Export features (CSV, JSON, Markdown)
- [ ] Advanced filters (date ranges, custom fields)
- [ ] Settings page (customize SM-2, preferences)

### 🚀 Phase 3 (Future)

**Collaboration:**
- [ ] Share highlights com friends
- [ ] Public highlight collections
- [ ] Community tags

**Integrations:**
- [ ] Notion export
- [ ] Obsidian sync
- [ ] Readwise compatibility
- [ ] Google Books API (covers, metadata)

**AI Features:**
- [ ] Highlight summarization
- [ ] Concept connections (graph view)
- [ ] Smart tag suggestions
- [ ] Reading recommendations

---

## 6. POSICIONAMENTO NO MERCADO

### 6.1 Competidores

**Diretos:**
- **Readwise:** $8/mês, foco em sync multi-plataforma, interface dated
- **Notion/Obsidian:** Genéricos, requerem setup manual complexo
- **Anki:** Poderoso mas intimidante, não especializado em highlights

**Indiretos:**
- Amazon Kindle App (highlights básicos, sem spaced repetition)
- Goodreads (social, não foca em aprendizado)
- Evernote/OneNote (note-taking genérico)

### 6.2 Diferenciais

1. **Especialização:** 100% focado em highlights do Kindle + spaced repetition
2. **Simplicidade:** Zero configuração, import e study imediato
3. **Modernidade:** UI clean, keyboard shortcuts, optimistic updates
4. **Gratuito (por ora):** Sem paywall para features core
5. **Open Source (potencial):** Transparência e community-driven

### 6.3 Positioning Statement

> "Para leitores Kindle que valorizam aprendizado ativo,  
> EVOQUE é a ferramenta de gestão de highlights  
> que transforma leitura passiva em conhecimento retido,  
> ao contrário de Readwise ou Anki,  
> oferecemos uma experiência especializada, moderna e sem fricção."

---

## 7. MODELO DE NEGÓCIO

### 7.1 Monetização (Future)

**Opções consideradas:**

**Freemium:**
- Free: Até 1000 highlights, funcionalidades core
- Pro ($5/mês): Highlights ilimitados, analytics avançados, export
- Team ($15/mês): Shared collections, admin dashboard

**One-time Purchase:**
- $29 lifetime access
- Simplicidade de pricing
- No recurring overhead para usuário

**Open Source + Donations:**
- 100% gratuito
- Patreon/GitHub Sponsors para sustentação
- Self-hosted option para power users

**Decisão atual:** Free durante MVP/validação de mercado

### 7.2 Custos Operacionais

**Infraestrutura (Supabase Free Tier):**
- Database: 500MB (suficiente para ~5000 usuários)
- Auth: Unlimited
- Storage: 1GB (book covers)
- Bandwidth: 2GB/mês

**Break-even:** ~10.000 usuários → migrar para Supabase Pro ($25/mês)

---

## 8. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Amazon muda formato do MyClippings.txt | Baixa | Alto | Monitorar community, ter parser flexível |
| Competidores copiam features | Média | Médio | Velocidade de execução, community building |
| Baixa adoção inicial | Alta | Alto | Marketing em communities (Reddit, Twitter, ProductHunt) |
| Custo de infra escala rápido | Média | Médio | Otimizar queries, comprimir images, freemium |
| Usuários esperam integração com Anki | Média | Baixo | Comunicar claramente que é sistema independente |

---

## 9. SUCESSO METRICS (6 meses)

**Growth:**
- ✅ 1.000 usuários registrados
- ✅ 200 DAU (20% engagement)
- ✅ 15% conversão signup

**Engagement:**
- ✅ 3+ study sessions/user/week
- ✅ 60% retention D1
- ✅ 40% retention D7
- ✅ 25% retention D30

**Quality:**
- ✅ NPS > 40
- ✅ < 5% churn mensal
- ✅ Avg session: 8-12 min

---

## 10. OPEN QUESTIONS

1. **Monetização:** Quando introduzir plano pago? Quais features como premium?
2. **Limites Free Tier:** Quantos highlights/livros por usuário gratuito?
3. **Internacionalização:** Lançar apenas PT-BR ou incluir EN desde início?
4. **Mobile App:** PWA é suficiente ou precisamos native app?
5. **Marca:** "EVOQUE" é definitivo ou provisório?
6. **Open Source:** Liberar código? Quando? Qual licença?

---

## 11. APÊNDICES

### A. Referências

**Inspirações de Design:**
- Linear (clean, keyboard-first)
- Stripe Dashboard (professional, data-dense)
- Notion (flexible, powerful)
- Readwise (highlight-focused)

**Estudos sobre Spaced Repetition:**
- SuperMemo research (Piotr Wozniak)
- Anki effectiveness studies
- "Make It Stick" (Brown, Roediger, McDaniel)

**Market Research:**
- r/Kindle community feedback
- Kindle Highlights subreddit
- ProductHunt reviews de competidores

### B. Recursos Técnicos

**Para especificações técnicas, consulte:**
- `TECHNICAL_CONTEXT.md` - Arquitetura, stack, padrões
- `spaced-repetition-system.md` - Deep dive no SM-2
- `HighlightTab-context.md` - Features da aba Highlights
- `lbp_diretrizes/design-system-guide.md` - UI/UX standards

---

**END OF PRODUCT CONTEXT**

---

_Last updated: 2025-12-19_  
_Version: 2.0 (Cleaned - Product context only)_
