# Implementation Plan: Smart Status, Comments & Avatar

**Branch**: `004-smart-status-comments-avatar` | **Date**: 2026-03-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-smart-status-comments-avatar/spec.md`

## Summary

Replace redundant date display in EventFeedCard with contextual smart status (Agora, Hoje, Amanhã, countdown timer, etc.), add a comment system per event/observation with preview in the home feed, and implement profile avatar upload using the existing Vercel Blob integration. Backend changes include a new Comment entity, CRUD endpoints, avatar upload endpoint, and a new `avatar_url` column on users. Frontend changes include a smart status component with real-time countdown, comment display/creation UI, and avatar upload in settings.

## Technical Context

**Language/Version**: Java 21 (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: Spring Boot 3.x, Spring Security, Spring Data JPA, Hibernate, Bean Validation, MapStruct (backend); React 18, Vite 5, Tailwind CSS, React Router 6, TanStack Query (frontend)
**Storage**: PostgreSQL 16 (primary), Redis 7 (cache), Vercel Blob (avatars — already integrated)
**Testing**: JUnit 5 + TestContainers (backend), Vitest (frontend)
**Target Platform**: Web (Docker Compose local, Vercel/cloud deploy)
**Project Type**: Web application (fullstack)
**Performance Goals**: < 500ms reads, real-time countdown timer at 1s intervals without jank
**Constraints**: Comments max 500 chars, avatar max 5MB, JWT auth required for mutations
**Scale/Scope**: Single-user to small community (~100 concurrent users)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Produto Real | PASS | Smart status, comments, avatars all improve production quality and UX |
| II. Modularidade por Domínio | PASS | New `comment` module follows existing domain pattern; avatar extends `user` module |
| III. Social Publishing como Core | PASS | Comments add social engagement layer |
| IV. Entregas Incrementais | PASS | 3 user stories can be delivered independently |
| V. Qualidade e Observabilidade | PASS | DTOs + MapStruct for comments, Bean Validation for input, Zod on frontend |
| VI. Simplicidade e Foco | PASS | All three features directly improve product utility and social engagement |

No violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/004-smart-status-comments-avatar/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── comments-api.md
│   └── avatar-api.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/main/java/com/skywatch/
│   ├── comment/                    # NEW — Comment domain module
│   │   ├── Comment.java            # Entity
│   │   ├── CommentRepository.java  # JPA repository
│   │   ├── CommentService.java     # Business logic
│   │   ├── CommentController.java  # REST endpoints
│   │   ├── CommentMapper.java      # MapStruct mapper
│   │   └── dto/
│   │       ├── CommentResponse.java
│   │       ├── CreateCommentRequest.java
│   │       └── CommentPreviewResponse.java
│   ├── user/
│   │   ├── User.java               # ADD avatar_url field
│   │   ├── UserController.java     # ADD avatar upload endpoint
│   │   └── dto/
│   │       └── UserResponse.java   # ADD avatarUrl field
│   └── config/
│       └── VercelBlobConfig.java   # EXISTING — reuse for avatar uploads
├── src/main/resources/
│   └── db/migration/
│       ├── V22__add_user_avatar_url.sql
│       └── V23__create_comments.sql

frontend/
├── src/
│   ├── features/
│   │   ├── events/
│   │   │   ├── SmartEventStatus.tsx         # NEW — Smart status component
│   │   │   ├── EventDetailPage.tsx          # ADD comments section
│   │   │   └── CommentSection.tsx           # NEW — Full comment list + input
│   │   ├── home/
│   │   │   ├── EventFeedCard.tsx            # MODIFY — use SmartEventStatus, add comment preview
│   │   │   └── CommentPreview.tsx           # NEW — 3-comment preview for feed
│   │   ├── auth/
│   │   │   └── SettingsPage.tsx             # ADD avatar upload section
│   │   └── observations/
│   │       └── ObservationTimeline.tsx      # ADD comment preview/section
│   ├── components/
│   │   └── shared/
│   │       └── UserAvatar.tsx               # NEW — Avatar with initials fallback
│   ├── hooks/
│   │   └── useComments.tsx                  # NEW — Comment CRUD hooks
│   └── lib/
│       └── smartStatus.ts                   # NEW — Status calculation logic
```

**Structure Decision**: Follows existing domain-module pattern. New `comment` backend package mirrors `observation`/`favorite` modules. Frontend follows existing feature-based organization with shared components.
