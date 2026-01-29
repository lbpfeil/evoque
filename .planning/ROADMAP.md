# Roadmap: Evoque v3.0

**Created:** 2026-01-29
**Milestone:** v3.0 Features & Polish
**Phases:** 11-16 (6 phases)

## Overview

| Phase | Name | Requirements | Goal |
|-------|------|--------------|------|
| 11 | Quick Fixes | FIX-01 → FIX-08 | Limpar terreno com fixes rápidos |
| 12 | StudySession UX | STUDY-01 → STUDY-04 | UX refinada na sessão de estudo |
| 13 | Dashboard & Analytics | DASH-01 → DASH-04, ANLYT-01 → ANLYT-03 | Nova home com KPIs inteligentes |
| 14 | Settings Audit | SETT-01 → SETT-03 | Validar e testar configurações |
| 15 | Auth Infrastructure | AUTH-01 → AUTH-03 | Auth production-ready |
| 16 | Landing Page | LAND-01 → LAND-03 | Marketing para aquisição |

## Phase 11: Quick Fixes

**Goal:** Resolver todos os quick fixes e bugs pendentes para limpar o terreno antes das features maiores.

**Requirements:**
- FIX-01: Badge "Aprendendo" tem contraste adequado
- FIX-02: Título/autor na tabela Study maiores
- FIX-03: Heatmap mais largo + círculos maiores
- FIX-04: Heatmap conta datas corretamente (timezone fix)
- FIX-05: Ícones sidebar centralizados quando retraída
- FIX-06: Favicon atualizado (favicon-evq)
- FIX-07: Settings com largura mais estreita
- FIX-08: hooks/useTheme.ts removido

**Success Criteria:**
1. Badge amarelo legível em ambos os temas (light/dark)
2. Títulos de livros na tabela Study são facilmente legíveis
3. Heatmap ocupa largura generosa e círculos são visualmente distintos
4. Revisões de hoje aparecem na data correta no heatmap
5. Sidebar retraída tem ícones perfeitamente centralizados

**Depends on:** None
**Plans:** 3 plans

Plans:
- [x] 11-01-PLAN.md — Badge contrast, deck table text, Settings width (FIX-01, FIX-02, FIX-07)
- [x] 11-02-PLAN.md — Heatmap size increase and timezone fix (FIX-03, FIX-04)
- [x] 11-03-PLAN.md — Sidebar centering, favicon update, dead code removal (FIX-05, FIX-06, FIX-08)

---

## Phase 12: StudySession UX

**Goal:** Refinar a experiência de estudo com edição inline clean e navegação melhorada.

**Requirements:**
- STUDY-01: Capa do livro maior
- STUDY-02: Botão voltar como seta primária
- STUDY-03: Botões editar padronizados
- STUDY-04: Edição inline clean (mesma fonte, tamanho, posição)

**Success Criteria:**
1. Capa do livro é visualmente proeminente na sessão
2. Navegação de volta é intuitiva (seta) sem texto redundante
3. Botões de editar destaque e nota têm aparência consistente
4. Ao editar, texto permanece no mesmo lugar com mesma fonte — experiência seamless

**Depends on:** Phase 11 (clean slate)
**Plans:** 2 plans

Plans:
- [x] 12-01-PLAN.md — Book cover, back button, edit button styling (STUDY-01, STUDY-02, STUDY-03)
- [x] 12-02-PLAN.md — Seamless inline editing for highlight and note (STUDY-04)

---

## Phase 13: Dashboard & Analytics

**Goal:** Criar Dashboard como página inicial com KPIs inteligentes e time tracking.

**Requirements:**
- DASH-01: Dashboard como home
- DASH-02: Atalho para estudar
- DASH-03: KPIs inteligentes
- DASH-04: Heatmap melhorado
- ANLYT-01: Time tracking (duration_ms em review_logs)
- ANLYT-02: Tempo médio por livro
- ANLYT-03: Livros mais revisados

**Success Criteria:**
1. Após login, usuário vê Dashboard (não Study)
2. Botão proeminente permite iniciar estudo com 1 clique
3. KPIs mostram insights acionáveis (não apenas números)
4. Time tracking funciona: cada review registra duração
5. Métricas de tempo e ranking de livros são calculadas corretamente

**Depends on:** Phase 12 (Study UX finalized)
**Plans:** 4 plans

Plans:
- [ ] 13-01-PLAN.md — Database schema + types for duration_ms (ANLYT-01 foundation)
- [ ] 13-02-PLAN.md — Dashboard page with KPIs, heatmap, top books (DASH-02, DASH-03, DASH-04, ANLYT-02, ANLYT-03)
- [ ] 13-03-PLAN.md — Time tracking in StudySession (ANLYT-01)
- [ ] 13-04-PLAN.md — Routing and navigation update (DASH-01)

---

## Phase 14: Settings Audit

**Goal:** Validar e testar todas as funcionalidades de configurações.

**Requirements:**
- SETT-01: Lógica de Opções de Estudo validada
- SETT-02: Limites diários por livro funcionam
- SETT-03: Testes automatizados

**Success Criteria:**
1. Opções de Estudo aplicam corretamente às sessões
2. Limites diários por livro respeitados (não revisa mais que o limite)
3. Testes cobrem casos críticos e passam consistentemente
4. Nenhuma regressão nas funcionalidades existentes

**Depends on:** Phase 13 (Dashboard done, app stable)
**Estimated plans:** 2-3

---

## Phase 15: Auth Infrastructure

**Goal:** Implementar auth production-ready com Google OAuth e password flows.

**Requirements:**
- AUTH-01: Reset password via email
- AUTH-02: Login com Google
- AUTH-03: Alterar senha nas configurações

**Success Criteria:**
1. "Esqueci senha" envia email funcional com link de reset
2. Botão "Entrar com Google" funciona end-to-end
3. Usuário logado consegue alterar senha nas Settings
4. Todos os flows funcionam em produção (não só local)

**Depends on:** Phase 14 (Settings stable)
**Estimated plans:** 3-4

---

## Phase 16: Landing Page

**Goal:** Criar landing page de marketing para aquisição de novos usuários.

**Requirements:**
- LAND-01: Hero section com CTA
- LAND-02: Features showcase
- LAND-03: Footer com links

**Success Criteria:**
1. Visitante não logado vê landing page atraente
2. CTA leva para cadastro/login
3. Features do app são apresentadas de forma clara
4. Footer tem links funcionais (mesmo que placeholder para termos/privacidade)

**Depends on:** Phase 15 (Auth complete for signup flow)
**Estimated plans:** 2-3

---

## Milestone Completion Criteria

v3.0 is complete when:
1. All 28 requirements marked complete in REQUIREMENTS.md
2. All 6 phases verified
3. App functions as: Landing → Login/Signup → Dashboard → Study
4. Auth flows work in production
5. No critical bugs or regressions

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Supabase Auth complexity | Use official docs, test each flow individually |
| Time tracking accuracy | Start timer on card show, stop on rating submit |
| Heatmap timezone bug | Use UTC consistently, convert only for display |
| Inline edit complexity | Prototype in isolation before integrating |

---
*Roadmap created: 2026-01-29*
*Last updated: 2026-01-29*
