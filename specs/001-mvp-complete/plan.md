# Implementation Plan: Reestruturação de Navegação + Dark Theme

**Branch**: `001-mvp-complete` | **Date**: 2026-03-12 | **Spec**: `specs/001-mvp-complete/spec.md`
**Input**: FR-040 a FR-045 — Remover dashboard do usuário comum, bottom nav, dark theme em todas as telas autenticadas

## Summary

Reestruturar a navegação do frontend: eliminar o dashboard como tela do usuário comum (vira admin-only), unificar experiência pública/autenticada na rota `/`, criar bottom nav fixo para usuários logados, e migrar todas as telas autenticadas (eventos, favoritos, observações, perfil) para o dark theme futurista. Backend sem alterações.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend only — zero backend changes)
**Primary Dependencies**: React 18, Vite 5, Tailwind CSS, React Router 6, TanStack Query
**Storage**: PostgreSQL via backend API (endpoints existentes)
**Testing**: Vitest + React Testing Library
**Target Platform**: Web (desktop + mobile responsive)
**Project Type**: Web application — frontend-only restructuring
**Performance Goals**: Telas carregam em < 2s, transições suaves
**Constraints**: Reutilizar endpoints existentes; manter compatibilidade com backend atual; dark theme #050A18 em todas as telas auth
**Scale/Scope**: ~10 arquivos modificados, ~3 novos componentes, reestruturação de rotas

## Constitution Check

| Princípio | Status | Justificativa |
|-----------|--------|---------------|
| I. Produto Real | ✅ PASS | Dark theme coeso, estados loading/error/empty, design tokens consistentes |
| II. Modularidade por Domínio | ✅ PASS | Componentes organizados por feature, layout compartilhado |
| III. Social Publishing como Core | ✅ PASS | Exportação acessível via detalhe do evento + histórico no perfil |
| IV. Entregas Incrementais | ✅ PASS | Feature autocontida, entregável em 1-2 dias |
| V. Qualidade e Observabilidade | ✅ PASS | Usa endpoints existentes, estados de erro tratados |
| VI. Simplicidade e Foco | ✅ PASS | Reutiliza componentes existentes, sem novas abstrações |

**Gate result**: PASS

## Project Structure

### Source Code (changes for this feature)

```text
frontend/src/
├── components/layout/
│   ├── PublicLayout.tsx              # MODIFY — add bottom nav for auth users
│   ├── BottomNav.tsx                 # NEW — bottom nav component
│   └── AuthLayout.tsx                # NEW — dark theme layout wrapper for auth pages
├── features/
│   ├── home/HomePage.tsx             # MODIFY — enhance for auth (city, favorites working)
│   ├── events/EventListPage.tsx      # MODIFY — dark theme
│   ├── events/EventDetailPage.tsx    # MODIFY — dark theme
│   ├── favorites/FavoritesListPage.tsx # MODIFY — dark theme
│   ├── observations/ObservationTimeline.tsx # MODIFY — dark theme
│   ├── observations/ObservationForm.tsx    # MODIFY — dark theme
│   ├── auth/SettingsPage.tsx         # MODIFY — dark theme + export history + admin link
│   └── auth/LoginPage.tsx            # MODIFY — redirect to / instead of /dashboard
├── routes/index.tsx                  # MODIFY — restructure routes (dashboard → admin only)
└── hooks/useHome.tsx                 # MODIFY — use user city when authenticated
```

## Design Decisions

### D1: Experiência unificada em `/`
A rota `/` serve tanto público quanto autenticado. `HomePage` detecta auth e:
- Público: CTAs redirecionam para login, condições de São Paulo
- Auth: favoritar/exportar funcionam, condições da cidade do usuário, bottom nav visível

### D2: Bottom nav fixo (auth only)
5 ícones: Home (`/`), Eventos (`/events`), Favoritos (`/favorites`), Observações (`/observations`), Perfil (`/settings`).
Visível apenas quando `getAccessToken()` retorna token. Não aparece em `/login`, `/register`, `/onboarding`.

### D3: AuthLayout — wrapper dark theme
Novo layout wrapper para telas autenticadas que não são a home (events list, favorites, observations, settings). Aplica:
- Background `#050A18`
- Bottom nav
- Padding para bottom nav (pb-20)
- Sem sidebar, sem header fixo do MainLayout antigo

### D4: Dashboard → Admin only
Rota `/dashboard` fica dentro de `AdminRoute` guard. Usuários comuns que acessam `/dashboard` são redirecionados para `/`. Admin acessa via link na tela de perfil.

### D5: Dark theme migration
Todas as telas existentes (EventListPage, EventDetailPage, FavoritesListPage, etc.) migram para dark theme:
- `bg-[#050A18]` como fundo
- Cards: `bg-white/[0.03] border-white/5`
- Texto primário: `text-white`, secundário: `text-gray-400`
- Inputs: `bg-white/5 border-white/10 text-white`
- Badges mantêm cores existentes (já funcionam em dark)

### D6: Login redirect
`LoginPage` e `RegisterPage` redirecionam para `/` ao invés de `/dashboard` após sucesso.
