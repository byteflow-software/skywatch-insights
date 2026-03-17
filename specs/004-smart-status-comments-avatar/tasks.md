# Tasks: Smart Status, Comments & Avatar

**Input**: Design documents from `/specs/004-smart-status-comments-avatar/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested. Test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migrations and shared components used across multiple user stories

- [X] T001 Create Flyway migration to add avatar_url column to users table in backend/src/main/resources/db/migration/V22__add_user_avatar_url.sql
- [X] T002 Create Flyway migration to create comments table in backend/src/main/resources/db/migration/V23__create_comments.sql
- [X] T003 Create shared UserAvatar component with img + initials fallback in frontend/src/components/shared/UserAvatar.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend entity, mapper, and User entity changes that all user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Add avatarUrl field to User entity in backend/src/main/java/com/skywatch/user/User.java
- [X] T005 Add avatarUrl to UserResponse DTO in backend/src/main/java/com/skywatch/user/dto/UserResponse.java
- [X] T006 Update UserMapper to map avatarUrl in backend/src/main/java/com/skywatch/user/UserMapper.java
- [X] T007 [P] Create Comment entity with targetType, targetId, userId, content fields in backend/src/main/java/com/skywatch/comment/Comment.java
- [X] T008 [P] Create CommentTargetType enum (EVENT, OBSERVATION) in backend/src/main/java/com/skywatch/comment/CommentTargetType.java
- [X] T009 Create CommentRepository with findByTarget and countByTarget queries in backend/src/main/java/com/skywatch/comment/CommentRepository.java
- [X] T010 [P] Create CommentResponse DTO (id, content, authorName, authorAvatarUrl, createdAt, isOwn) in backend/src/main/java/com/skywatch/comment/dto/CommentResponse.java
- [X] T011 [P] Create CommentPreviewResponse DTO (comments list, totalCount) in backend/src/main/java/com/skywatch/comment/dto/CommentPreviewResponse.java
- [X] T012 [P] Create CreateCommentRequest DTO with @NotBlank @Size(max=500) validation in backend/src/main/java/com/skywatch/comment/dto/CreateCommentRequest.java
- [X] T013 Create CommentMapper (MapStruct) mapping entity to response with authorName, authorAvatarUrl, isOwn in backend/src/main/java/com/skywatch/comment/CommentMapper.java

**Checkpoint**: Foundation ready — migrations, entities, DTOs, mappers all in place

---

## Phase 3: User Story 1 — Smart Status in Event Card (Priority: P1)

**Goal**: Replace redundant date display with contextual smart status (Agora, Hoje, Amanhã, countdown, etc.)

**Independent Test**: View home feed and verify each event card shows smart status instead of duplicate dates

### Implementation for User Story 1

- [X] T014 [US1] Create smartStatus utility with calculateEventStatus function (returns status label + style) in frontend/src/lib/smartStatus.ts
- [X] T015 [US1] Create SmartEventStatus component with real-time countdown timer (useEffect + setInterval for ≤10min) in frontend/src/features/events/SmartEventStatus.tsx
- [X] T016 [US1] Update EventFeedCard to replace formatRelativeDate with SmartEventStatus component, pass bestWindow data in frontend/src/features/home/EventFeedCard.tsx
- [X] T017 [US1] Update useHomeEvents or EventFeedCard props to include bestWindow start/end from forecast data in frontend/src/hooks/useHome.tsx
- [X] T018 [US1] Update EventDetailPage header to show SmartEventStatus badge next to date in frontend/src/features/events/EventDetailPage.tsx

**Checkpoint**: Smart status visible in feed and detail pages. No backend changes needed.

---

## Phase 4: User Story 2 — Comments System (Priority: P2)

**Goal**: Full comment CRUD for events and observations with preview in home feed

**Independent Test**: Create a comment on an event, see it in detail page and preview in feed card

### Backend Implementation

- [X] T019 [US2] Create CommentService with create, listByTarget (paginated), getPreview (top 3 + count), and delete methods in backend/src/main/java/com/skywatch/comment/CommentService.java
- [X] T020 [US2] Create CommentController with endpoints: POST /events/{id}/comments, GET /events/{id}/comments, GET /events/{id}/comments/preview, DELETE /events/{id}/comments/{commentId} in backend/src/main/java/com/skywatch/comment/CommentController.java
- [X] T021 [US2] Add observation comment endpoints to CommentController: POST/GET/DELETE /observations/{id}/comments and GET /observations/{id}/comments/preview in backend/src/main/java/com/skywatch/comment/CommentController.java
- [X] T022 [US2] Configure Spring Security to allow public GET on comment endpoints and require auth for POST/DELETE in backend/src/main/java/com/skywatch/config/SecurityConfig.java (or equivalent)

### Frontend Implementation

- [X] T023 [P] [US2] Create useComments hook with useCommentsByTarget, useCommentPreview, useCreateComment, useDeleteComment in frontend/src/hooks/useComments.tsx
- [X] T024 [US2] Create CommentSection component for event detail page with paginated list, new comment input (500 char limit), delete button for own comments in frontend/src/features/events/CommentSection.tsx
- [X] T025 [US2] Create CommentPreview component showing up to 3 comments with UserAvatar, author name, truncated text, and "Ver todos os N comentários" link in frontend/src/features/home/CommentPreview.tsx
- [X] T026 [US2] Integrate CommentSection into EventDetailPage below description section in frontend/src/features/events/EventDetailPage.tsx
- [X] T027 [US2] Integrate CommentPreview into EventFeedCard below description, fetching preview data per event in frontend/src/features/home/EventFeedCard.tsx
- [X] T028 [US2] Integrate CommentSection into ObservationTimeline or ObservationCard for observation comments in frontend/src/features/observations/ObservationCard.tsx
- [X] T029 [US2] Add login redirect for unauthenticated users who try to comment (show "Faça login para comentar" with link) in frontend/src/features/events/CommentSection.tsx

**Checkpoint**: Comments fully functional on events and observations. Preview visible in home feed.

---

## Phase 5: User Story 3 — Profile Avatar with Vercel Blob (Priority: P3)

**Goal**: Avatar upload in settings, display in header and comments, initials fallback

**Independent Test**: Upload avatar in settings, verify it appears in header and in comments

### Backend Implementation

- [X] T030 [US3] Create avatar upload endpoint POST /api/v1/me/avatar using existing VercelBlobStorageService, validate file type and size, save URL to User.avatarUrl in backend/src/main/java/com/skywatch/user/UserController.java
- [X] T031 [US3] Create avatar delete endpoint DELETE /api/v1/me/avatar that sets User.avatarUrl to null in backend/src/main/java/com/skywatch/user/UserController.java
- [X] T032 [US3] Configure multipart max file size to 5MB in backend/src/main/resources/application.yml

### Frontend Implementation

- [X] T033 [P] [US3] Create useAvatar hook with useUploadAvatar and useDeleteAvatar mutations in frontend/src/hooks/useAvatar.tsx
- [X] T034 [US3] Add avatar upload section to SettingsPage with preview, upload button, and remove button in frontend/src/features/auth/SettingsPage.tsx
- [X] T035 [US3] Update Header component to show UserAvatar instead of generic User icon when user has avatar in frontend/src/components/layout/Header.tsx
- [X] T036 [US3] Update AuthProvider or user context to include avatarUrl from /me response in frontend/src/lib/schemas/user.ts

**Checkpoint**: Avatar upload, display in header and comments all working end-to-end.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final integration touches, rebuild, and validation

- [X] T037 Rebuild Docker containers and run Flyway migrations to verify V22 and V23 apply cleanly via docker compose up --build
- [ ] T038 Verify all comment endpoints work via curl commands from quickstart.md
- [ ] T039 Verify smart status displays correctly for events in different temporal states (past, today, future, within bestWindow)
- [X] T040 Fix any remaining Portuguese accent issues in new components (CommentSection, SmartEventStatus, UserAvatar, SettingsPage)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational — frontend-only, no backend deps beyond existing APIs
- **User Story 2 (Phase 4)**: Depends on Foundational — needs Comment entity, DTOs, mapper from Phase 2
- **User Story 3 (Phase 5)**: Depends on Foundational — needs User.avatarUrl from Phase 2
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Smart Status)**: Independent — no dependency on US2 or US3
- **US2 (Comments)**: Independent — uses UserAvatar from T003 (Setup) for comment display
- **US3 (Avatar)**: Independent — enhances UserAvatar but UserAvatar works with initials fallback without it

### Within Each User Story

- Backend tasks before frontend tasks (within US2, US3)
- Models/DTOs before services before controllers
- Hooks before components
- Components before integration into existing pages

### Parallel Opportunities

**Phase 2 parallel group**:
```
T007 (Comment entity) || T008 (enum) || T010 (CommentResponse) || T011 (PreviewResponse) || T012 (CreateRequest)
```

**After Phase 2, all three user stories can run in parallel**:
```
US1: T014→T015→T016→T017→T018
US2: T019→T020→T021→T022 then T023→T024→T025→T026→T027→T028→T029
US3: T030→T031→T032 then T033→T034→T035→T036
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (migrations)
2. Complete Phase 2: Foundational (entities, DTOs, mappers)
3. Complete Phase 3: User Story 1 (smart status)
4. **STOP and VALIDATE**: Smart status visible in feed
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Smart Status) → Test → Deploy (MVP!)
3. Add US2 (Comments) → Test → Deploy
4. Add US3 (Avatar) → Test → Deploy
5. Polish → Final validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1 is entirely frontend — fastest to deliver
- US2 is the largest story (11 tasks) — backend + frontend
- US3 reuses existing VercelBlobStorageService — minimal new backend code
- Commit after each task or logical group
