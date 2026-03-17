# Tasks: SkyWatch Insights — MVP Completo

**Input**: Design documents from `/specs/001-mvp-complete/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/main/java/com/skywatch/`
- **Frontend**: `frontend/src/`
- **Infra**: `infra/`
- **Migrations**: `backend/src/main/resources/db/migration/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, build tooling, and dev environment

- [ ] T001 Initialize backend project with Spring Boot 3.3, Java 21, Gradle in `backend/build.gradle`
- [ ] T002 [P] Initialize frontend project with Vite 5 + React 18 + TypeScript in `frontend/package.json` and `frontend/vite.config.ts`
- [ ] T003 [P] Create `infra/docker-compose.yml` with PostgreSQL 16, Redis 7, and MinIO services
- [ ] T004 [P] Create `infra/docker-compose.dev.yml` with dev overrides and `infra/.env.example`
- [ ] T005 [P] Configure Tailwind CSS 3 + shadcn/ui + design tokens (Midnight, Sky Blue, Ice, Slate) in `frontend/tailwind.config.ts` and `frontend/src/styles/globals.css`
- [ ] T006 [P] Configure ESLint + Prettier for frontend in `frontend/.eslintrc.cjs` and `frontend/.prettierrc`
- [ ] T007 [P] Configure Checkstyle/Spotless for backend in `backend/build.gradle`
- [ ] T008 Create `backend/src/main/resources/application.yml` with profiles (dev, test, seed), DB, Redis, JWT, and S3 config
- [ ] T009 [P] Configure Flyway migrations in `backend/build.gradle` and `backend/src/main/resources/application.yml`
- [ ] T010 [P] Create shared base entity with UUID, timestamps, and audit fields in `backend/src/main/java/com/skywatch/shared/BaseEntity.java`
- [ ] T011 [P] Create global exception handler and error response DTO in `backend/src/main/java/com/skywatch/shared/GlobalExceptionHandler.java` and `backend/src/main/java/com/skywatch/shared/ErrorResponse.java`
- [ ] T012 [P] Create pagination helper DTOs in `backend/src/main/java/com/skywatch/shared/PageResponse.java`
- [ ] T013 [P] Create frontend API client with axios + interceptors for JWT in `frontend/src/services/api.ts`
- [ ] T014 [P] Create frontend shared components: EmptyState, LoadingState, ErrorState in `frontend/src/components/shared/`
- [ ] T015 [P] Create frontend layout components: Header, Sidebar, Footer in `frontend/src/components/layout/`
- [ ] T016 Configure React Router 6 with route definitions in `frontend/src/routes/index.tsx` and `frontend/src/App.tsx`
- [ ] T017 [P] Configure TanStack Query provider in `frontend/src/main.tsx`

**Checkpoint**: Project compiles, dev environment runs with `docker compose up`, frontend shows empty shell with layout.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T018 Create Location entity and JPA repository in `backend/src/main/java/com/skywatch/user/Location.java` and `backend/src/main/java/com/skywatch/user/LocationRepository.java`
- [ ] T019 Create Flyway migration `V1__create_locations.sql` in `backend/src/main/resources/db/migration/`
- [ ] T020 [P] Create User entity with roles, preferences, and FK to Location in `backend/src/main/java/com/skywatch/user/User.java` and `backend/src/main/java/com/skywatch/user/UserRepository.java`
- [ ] T021 [P] Create Flyway migration `V2__create_users.sql` in `backend/src/main/resources/db/migration/`
- [ ] T022 Configure Spring Security 6 with JWT filter chain, BCrypt password encoder, and CORS in `backend/src/main/java/com/skywatch/config/SecurityConfig.java`
- [ ] T023 [P] Create JWT utility (generate, validate, extract claims) in `backend/src/main/java/com/skywatch/config/JwtUtil.java`
- [ ] T024 [P] Create JwtAuthenticationFilter in `backend/src/main/java/com/skywatch/config/JwtAuthenticationFilter.java`
- [ ] T025 Create Flyway seed migration `V12__seed_sample_locations.sql` with major Brazilian cities in `backend/src/main/resources/db/migration/`

**Checkpoint**: Foundation ready — database schema for users/locations exists, Spring Security with JWT configured, user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 — Cadastro, Login e Configuração de Cidade (Priority: P1) MVP

**Goal**: Users can register, login, set their city, and manage preferences.

**Independent Test**: Create account, login, configure city, verify dashboard receives contextualized data.

### Implementation for User Story 1

- [ ] T026 [P] [US1] Create auth DTOs (RegisterRequest, LoginRequest, LoginResponse, RefreshRequest) in `backend/src/main/java/com/skywatch/auth/dto/`
- [ ] T027 [P] [US1] Create user DTOs (UserResponse, PreferencesUpdateRequest) with MapStruct mapper in `backend/src/main/java/com/skywatch/user/dto/` and `backend/src/main/java/com/skywatch/user/UserMapper.java`
- [ ] T028 [US1] Implement AuthService (register, login, refresh, logout) in `backend/src/main/java/com/skywatch/auth/AuthService.java`
- [ ] T029 [US1] Implement AuthController (POST /auth/register, /auth/login, /auth/refresh, /auth/logout) in `backend/src/main/java/com/skywatch/auth/AuthController.java`
- [ ] T030 [US1] Implement UserService (getProfile, updatePreferences) in `backend/src/main/java/com/skywatch/user/UserService.java`
- [ ] T031 [US1] Implement UserController (GET /me, PATCH /me/preferences) in `backend/src/main/java/com/skywatch/user/UserController.java`
- [ ] T032 [US1] Implement LocationController (GET /locations?q=) for city search in `backend/src/main/java/com/skywatch/user/LocationController.java`
- [ ] T033 [P] [US1] Create Zod schemas for auth and user forms in `frontend/src/lib/schemas/auth.ts` and `frontend/src/lib/schemas/user.ts`
- [ ] T034 [P] [US1] Create useAuth hook (login, register, logout, token management) in `frontend/src/hooks/useAuth.tsx`
- [ ] T035 [P] [US1] Create auth context/provider with protected route wrapper in `frontend/src/features/auth/AuthProvider.tsx` and `frontend/src/features/auth/ProtectedRoute.tsx`
- [ ] T036 [US1] Create Register page with form validation in `frontend/src/features/auth/RegisterPage.tsx`
- [ ] T037 [US1] Create Login page with form validation in `frontend/src/features/auth/LoginPage.tsx`
- [ ] T038 [US1] Create Onboarding page (city selector, timezone, interests) in `frontend/src/features/auth/OnboardingPage.tsx`
- [ ] T039 [US1] Create Settings/Preferences page (language, theme, interests) in `frontend/src/features/auth/SettingsPage.tsx`
- [ ] T040 [US1] Add auth routes to React Router config in `frontend/src/routes/index.tsx`

**Checkpoint**: User can register, login, configure city, edit preferences. JWT auth works end-to-end.

---

## Phase 4: User Story 2 — Exploração de Eventos Astronômicos (Priority: P1)

**Goal**: Users can browse, filter, and view detailed astronomical events.

**Independent Test**: Navigate to events list, apply filters, open event detail with full description and temporal window.

### Implementation for User Story 2

- [ ] T041 [P] [US2] Create AstronomicalEvent entity with enums (EventType, EventStatus) in `backend/src/main/java/com/skywatch/event/AstronomicalEvent.java` and `backend/src/main/java/com/skywatch/event/EventType.java` and `backend/src/main/java/com/skywatch/event/EventStatus.java`
- [ ] T042 [P] [US2] Create AstronomicalEvent JPA repository with filter queries in `backend/src/main/java/com/skywatch/event/EventRepository.java`
- [ ] T043 [P] [US2] Create Flyway migration `V3__create_astronomical_events.sql` in `backend/src/main/resources/db/migration/`
- [ ] T044 [P] [US2] Create event DTOs (EventListResponse, EventDetailResponse, EventFilterParams) with MapStruct mapper in `backend/src/main/java/com/skywatch/event/dto/` and `backend/src/main/java/com/skywatch/event/EventMapper.java`
- [ ] T045 [US2] Implement EventService (list with filters, getBySlug, pagination) in `backend/src/main/java/com/skywatch/event/EventService.java`
- [ ] T046 [US2] Implement EventController (GET /events, GET /events/:slug) in `backend/src/main/java/com/skywatch/event/EventController.java`
- [ ] T047 [P] [US2] Create useEvents hook (list, detail, filters) with TanStack Query in `frontend/src/hooks/useEvents.ts`
- [ ] T048 [US2] Create EventList page with cards view and filter sidebar in `frontend/src/features/events/EventListPage.tsx`
- [ ] T049 [US2] Create EventCard component in `frontend/src/features/events/EventCard.tsx`
- [ ] T050 [US2] Create EventDetail page with full description, temporal window, and assets in `frontend/src/features/events/EventDetailPage.tsx`
- [ ] T051 [US2] Create EventCalendar view (month view) in `frontend/src/features/events/EventCalendarView.tsx`
- [ ] T052 [US2] Add event routes to React Router config in `frontend/src/routes/index.tsx`
- [ ] T053 [US2] Create seed migration `V13__seed_sample_events.sql` with sample events for next 3 months in `backend/src/main/resources/db/migration/`

**Checkpoint**: Events are browsable with filters, detail page shows full information. Calendar view works.

---

## Phase 5: User Story 3 — Score de Observabilidade e Melhores Horários (Priority: P1)

**Goal**: Calculate and display observability score per event/location with best viewing times.

**Independent Test**: Open event detail, see observability score for user's city with best window start/end and weather summary.

### Implementation for User Story 3

- [ ] T054 [P] [US3] Create VisibilityForecast entity and repository in `backend/src/main/java/com/skywatch/forecast/VisibilityForecast.java` and `backend/src/main/java/com/skywatch/forecast/ForecastRepository.java`
- [ ] T055 [P] [US3] Create Flyway migration `V4__create_visibility_forecasts.sql` in `backend/src/main/resources/db/migration/`
- [ ] T056 [P] [US3] Create weather API client adapter (OpenWeatherMap) with cache and fallback in `backend/src/main/java/com/skywatch/forecast/WeatherApiClient.java`
- [ ] T057 [P] [US3] Configure Redis cache for weather data (TTL 3h) in `backend/src/main/java/com/skywatch/config/RedisConfig.java`
- [ ] T058 [US3] Implement ForecastService (calculateScore, getBestWindow, recalculate) in `backend/src/main/java/com/skywatch/forecast/ForecastService.java`
- [ ] T059 [P] [US3] Create forecast DTOs (ForecastResponse) with mapper in `backend/src/main/java/com/skywatch/forecast/dto/ForecastResponse.java` and `backend/src/main/java/com/skywatch/forecast/ForecastMapper.java`
- [ ] T060 [US3] Implement ForecastController (GET /events/:id/forecast) in `backend/src/main/java/com/skywatch/forecast/ForecastController.java`
- [ ] T061 [US3] Create Spring Scheduler job for periodic score recalculation in `backend/src/main/java/com/skywatch/forecast/ForecastScheduler.java`
- [ ] T062 [US3] Embed forecast data in EventDetail page (score badge, best window, weather) in `frontend/src/features/events/EventDetailPage.tsx`
- [ ] T063 [P] [US3] Create ObservabilityScore visual component (gauge/badge with color) in `frontend/src/features/events/ObservabilityScore.tsx`
- [ ] T064 [P] [US3] Create BestWindowDisplay component (time range with icons) in `frontend/src/features/events/BestWindowDisplay.tsx`

**Checkpoint**: Event detail shows observability score, best viewing window, and weather summary. Score recalculates on schedule.

---

## Phase 6: User Story 4 — Dashboard com Destaque Semanal (Priority: P1)

**Goal**: Dashboard with upcoming events, weekly highlight, favorites summary, and empty states.

**Independent Test**: Login and verify dashboard shows upcoming events, weekly event highlight, and favorites section (or empty states).

### Implementation for User Story 4

- [ ] T065 [P] [US4] Create EventHighlight entity and repository in `backend/src/main/java/com/skywatch/highlight/EventHighlight.java` and `backend/src/main/java/com/skywatch/highlight/HighlightRepository.java`
- [ ] T066 [P] [US4] Create Flyway migration `V9__create_event_highlights.sql` in `backend/src/main/resources/db/migration/`
- [ ] T067 [P] [US4] Create highlight DTOs (HighlightResponse, WeeklyHighlightResponse) with mapper in `backend/src/main/java/com/skywatch/highlight/dto/` and `backend/src/main/java/com/skywatch/highlight/HighlightMapper.java`
- [ ] T068 [US4] Implement HighlightService (getWeeklyHighlight, auto-select logic) in `backend/src/main/java/com/skywatch/highlight/HighlightService.java`
- [ ] T069 [US4] Implement HighlightController (GET /highlights/week) in `backend/src/main/java/com/skywatch/highlight/HighlightController.java`
- [ ] T070 [US4] Implement DashboardController (GET /dashboard) aggregating events, highlight, favorites, stats in `backend/src/main/java/com/skywatch/dashboard/DashboardController.java` and `backend/src/main/java/com/skywatch/dashboard/DashboardService.java`
- [ ] T071 [P] [US4] Create useDashboard hook with TanStack Query in `frontend/src/hooks/useDashboard.ts`
- [ ] T072 [US4] Create Dashboard page layout with sections in `frontend/src/features/dashboard/DashboardPage.tsx`
- [ ] T073 [P] [US4] Create WeeklyHighlightCard component (hero card with image, score, CTA) in `frontend/src/features/dashboard/WeeklyHighlightCard.tsx`
- [ ] T074 [P] [US4] Create UpcomingEventsWidget (next 5 events as compact cards) in `frontend/src/features/dashboard/UpcomingEventsWidget.tsx`
- [ ] T075 [P] [US4] Create FavoritesSummaryWidget (last 3 favorites) in `frontend/src/features/dashboard/FavoritesSummaryWidget.tsx`
- [ ] T076 [P] [US4] Create StatsWidget (total favorites, observations, exports) in `frontend/src/features/dashboard/StatsWidget.tsx`
- [ ] T077 [US4] Handle empty states for all dashboard sections with actionable suggestions in `frontend/src/features/dashboard/DashboardPage.tsx`
- [ ] T078 [US4] Set dashboard as default authenticated route in `frontend/src/routes/index.tsx`

**Checkpoint**: Dashboard loads with all sections populated or showing empty states. Weekly highlight displays correctly.

---

## Phase 7: User Story 5 — Favoritar Eventos (Priority: P2)

**Goal**: Users can favorite/unfavorite events with immediate feedback and view a dedicated favorites list.

**Independent Test**: Favorite an event, see immediate UI feedback, navigate to favorites page, unfavorite and confirm removal.

### Implementation for User Story 5

- [ ] T079 [P] [US5] Create Favorite entity and repository with unique constraint in `backend/src/main/java/com/skywatch/favorite/Favorite.java` and `backend/src/main/java/com/skywatch/favorite/FavoriteRepository.java`
- [ ] T080 [P] [US5] Create Flyway migration `V5__create_favorites.sql` in `backend/src/main/resources/db/migration/`
- [ ] T081 [US5] Implement FavoriteService (add, remove, list, isFavorited) in `backend/src/main/java/com/skywatch/favorite/FavoriteService.java`
- [ ] T082 [US5] Implement FavoriteController (POST /events/:id/favorite, DELETE /events/:id/favorite, GET /favorites) in `backend/src/main/java/com/skywatch/favorite/FavoriteController.java`
- [ ] T083 [US5] Add isFavorited flag to event list and detail responses via FavoriteService lookup in `backend/src/main/java/com/skywatch/event/EventService.java`
- [ ] T084 [P] [US5] Create useFavorites hook (toggle, list, optimistic updates) in `frontend/src/hooks/useFavorites.ts`
- [ ] T085 [US5] Create FavoriteButton component with optimistic toggle and animation in `frontend/src/features/favorites/FavoriteButton.tsx`
- [ ] T086 [US5] Integrate FavoriteButton into EventCard and EventDetailPage in `frontend/src/features/events/EventCard.tsx` and `frontend/src/features/events/EventDetailPage.tsx`
- [ ] T087 [US5] Create FavoritesList page with grouped events in `frontend/src/features/favorites/FavoritesListPage.tsx`
- [ ] T088 [US5] Add favorites route to React Router config in `frontend/src/routes/index.tsx`

**Checkpoint**: Favorite/unfavorite works with instant feedback. Favorites page shows grouped list.

---

## Phase 8: User Story 6 — Exportação Social do Evento da Semana (Priority: P1) CORE

**Goal**: Generate complete social export packages (art + text) for Instagram, Threads, X, and LinkedIn.

**Independent Test**: Select weekly event, choose network and format, generate package, verify it contains both image and text. Repeat for all 6 network formats.

### Implementation for User Story 6

- [ ] T089 [P] [US6] Create SocialExportTemplate entity with enums (SocialNetwork, ExportObjective) in `backend/src/main/java/com/skywatch/export/SocialExportTemplate.java`, `backend/src/main/java/com/skywatch/export/SocialNetwork.java`, `backend/src/main/java/com/skywatch/export/ExportObjective.java`
- [ ] T090 [P] [US6] Create SocialExportJob entity with status enum in `backend/src/main/java/com/skywatch/export/SocialExportJob.java` and `backend/src/main/java/com/skywatch/export/ExportStatus.java`
- [ ] T091 [P] [US6] Create repositories for SocialExportTemplate and SocialExportJob in `backend/src/main/java/com/skywatch/export/ExportTemplateRepository.java` and `backend/src/main/java/com/skywatch/export/ExportJobRepository.java`
- [ ] T092 [P] [US6] Create Flyway migrations `V7__create_social_export_templates.sql` and `V8__create_social_export_jobs.sql` in `backend/src/main/resources/db/migration/`
- [ ] T093 [US6] Create Flyway seed `V11__seed_default_templates.sql` with all network+format+objective template combinations in `backend/src/main/resources/db/migration/`
- [ ] T094 [P] [US6] Configure S3/MinIO client for asset storage in `backend/src/main/java/com/skywatch/config/S3Config.java` and `backend/src/main/java/com/skywatch/export/AssetStorageService.java`
- [ ] T095 [US6] Implement text template engine with placeholder substitution ({eventTitle}, {bestTime}, etc.) in `backend/src/main/java/com/skywatch/export/TextTemplateEngine.java`
- [ ] T096 [US6] Implement image generation service (Java2D) with design tokens, safe zones, and typography in `backend/src/main/java/com/skywatch/export/ImageGeneratorService.java`
- [ ] T097 [US6] Implement ExportService orchestrating text generation + image generation + S3 upload in `backend/src/main/java/com/skywatch/export/ExportService.java`
- [ ] T098 [US6] Implement Instagram Story template (9:16, safe zones, high contrast title, CTA) in `backend/src/main/java/com/skywatch/export/templates/InstagramStoryTemplate.java`
- [ ] T099 [US6] Implement Instagram Reels template (cover 9:16, script 3-5 blocks, caption) in `backend/src/main/java/com/skywatch/export/templates/InstagramReelsTemplate.java`
- [ ] T100 [US6] Implement Instagram Feed template (portrait card, informative caption) in `backend/src/main/java/com/skywatch/export/templates/InstagramFeedTemplate.java`
- [ ] T101 [US6] Implement Threads template (short text + extended version) in `backend/src/main/java/com/skywatch/export/templates/ThreadsTemplate.java`
- [ ] T102 [US6] Implement X/Twitter template (short post + thread 3-5 parts with character limit enforcement) in `backend/src/main/java/com/skywatch/export/templates/XTemplate.java`
- [ ] T103 [US6] Implement LinkedIn template (short copy + deep-dive copy + carousel outline) in `backend/src/main/java/com/skywatch/export/templates/LinkedInTemplate.java`
- [ ] T104 [P] [US6] Create export DTOs (ExportRequest, ExportResponse, ExportListResponse, TemplateListResponse) with mapper in `backend/src/main/java/com/skywatch/export/dto/` and `backend/src/main/java/com/skywatch/export/ExportMapper.java`
- [ ] T105 [US6] Implement ExportController (POST /exports, GET /exports/:id, GET /exports, GET /exports/templates) in `backend/src/main/java/com/skywatch/export/ExportController.java`
- [ ] T106 [P] [US6] Create useExports hook (create, poll status, list history, templates) in `frontend/src/hooks/useExports.ts`
- [ ] T107 [US6] Create ExportPanel component (network selector, format selector, objective selector) in `frontend/src/features/export/ExportPanel.tsx`
- [ ] T108 [US6] Create NetworkSelector component with icons for each social network in `frontend/src/features/export/NetworkSelector.tsx`
- [ ] T109 [US6] Create ExportPreview component showing generated image + text in `frontend/src/features/export/ExportPreview.tsx`
- [ ] T110 [US6] Create ExportHistory component listing past exports for an event in `frontend/src/features/export/ExportHistory.tsx`
- [ ] T111 [US6] Integrate ExportPanel into EventDetailPage with "Export to social media" CTA in `frontend/src/features/events/EventDetailPage.tsx`
- [ ] T112 [US6] Add "Export Kit" quick action on WeeklyHighlightCard in `frontend/src/features/dashboard/WeeklyHighlightCard.tsx`

**Checkpoint**: Full export pipeline works for all 6 networks. Each export produces art + text. History is persisted.

---

## Phase 9: User Story 7 — Personalização e Objetivos de Exportação (Priority: P2)

**Goal**: Users can choose copy objective (engagement/education/authority) and customize branding (palette, logo, CTA, signature).

**Independent Test**: Change objective to "authority", set custom CTA, generate export, verify tone and branding reflect choices.

### Implementation for User Story 7

- [ ] T113 [US7] Add branding fields (customPalette, logoUrl, ctaText, signature) to User entity in `backend/src/main/java/com/skywatch/user/User.java`
- [ ] T114 [US7] Create Flyway migration `V14__add_user_branding_fields.sql` in `backend/src/main/resources/db/migration/`
- [ ] T115 [US7] Update PreferencesUpdateRequest to include branding fields in `backend/src/main/java/com/skywatch/user/dto/PreferencesUpdateRequest.java`
- [ ] T116 [US7] Update ExportService to apply user branding overrides to templates in `backend/src/main/java/com/skywatch/export/ExportService.java`
- [ ] T117 [US7] Update ImageGeneratorService to accept custom palette and logo in `backend/src/main/java/com/skywatch/export/ImageGeneratorService.java`
- [ ] T118 [US7] Create BrandingSettings component (palette picker, logo upload, CTA, signature) in `frontend/src/features/export/BrandingSettings.tsx`
- [ ] T119 [US7] Integrate BrandingSettings into ExportPanel with objective toggle in `frontend/src/features/export/ExportPanel.tsx`
- [ ] T120 [US7] Add branding section to SettingsPage in `frontend/src/features/auth/SettingsPage.tsx`

**Checkpoint**: Exports reflect chosen objective and custom branding. Settings persist across sessions.

---

## Phase 10: User Story 8 — Diário de Observações (Priority: P3)

**Goal**: Users can log astronomical observations with notes, photos, and view a personal timeline.

**Independent Test**: Create observation entry with date, location, notes, photo. View timeline with entries in chronological order.

### Implementation for User Story 8

- [ ] T121 [P] [US8] Create ObservationLog entity with outcome enum in `backend/src/main/java/com/skywatch/observation/ObservationLog.java` and `backend/src/main/java/com/skywatch/observation/ObservationOutcome.java`
- [ ] T122 [P] [US8] Create ObservationLog repository in `backend/src/main/java/com/skywatch/observation/ObservationRepository.java`
- [ ] T123 [P] [US8] Create Flyway migration `V6__create_observation_logs.sql` in `backend/src/main/resources/db/migration/`
- [ ] T124 [P] [US8] Create observation DTOs (CreateObservationRequest, ObservationResponse) with mapper in `backend/src/main/java/com/skywatch/observation/dto/` and `backend/src/main/java/com/skywatch/observation/ObservationMapper.java`
- [ ] T125 [US8] Implement ObservationService (create with media upload, list timeline) in `backend/src/main/java/com/skywatch/observation/ObservationService.java`
- [ ] T126 [US8] Implement ObservationController (POST /observations multipart, GET /observations) in `backend/src/main/java/com/skywatch/observation/ObservationController.java`
- [ ] T127 [P] [US8] Create useObservations hook (create, list) in `frontend/src/hooks/useObservations.ts`
- [ ] T128 [US8] Create ObservationForm component (date, location, notes, outcome, photo upload) in `frontend/src/features/observations/ObservationForm.tsx`
- [ ] T129 [US8] Create ObservationTimeline page with chronological entries in `frontend/src/features/observations/ObservationTimeline.tsx`
- [ ] T130 [US8] Create ObservationCard component (date, event link, notes preview, photo thumbnail) in `frontend/src/features/observations/ObservationCard.tsx`
- [ ] T131 [US8] Add observations routes to React Router config in `frontend/src/routes/index.tsx`

**Checkpoint**: Users can create observations with photos and view personal timeline.

---

## Phase 11: User Story 9 — Administração e Curadoria Editorial (Priority: P2)

**Goal**: Admins can manage weekly highlights, edit events, and hide inappropriate content.

**Independent Test**: Access admin panel, highlight event as "event of the week", edit event description, hide event. Verify changes reflect on public-facing pages.

### Implementation for User Story 9

- [ ] T132 [US9] Implement AdminEventService (update, hide with soft-delete preserving history) in `backend/src/main/java/com/skywatch/event/AdminEventService.java`
- [ ] T133 [US9] Implement AdminEventController (PATCH /admin/events/:id) with admin-only authorization in `backend/src/main/java/com/skywatch/event/AdminEventController.java`
- [ ] T134 [US9] Implement AdminHighlightController (POST /admin/highlights) with overlap validation in `backend/src/main/java/com/skywatch/highlight/AdminHighlightController.java`
- [ ] T135 [US9] Create admin route guard (role-based) in `frontend/src/features/admin/AdminRoute.tsx`
- [ ] T136 [US9] Create AdminPanel page layout with navigation in `frontend/src/features/admin/AdminPanelPage.tsx`
- [ ] T137 [US9] Create EventEditor component (inline edit title, description, status, relevance) in `frontend/src/features/admin/EventEditor.tsx`
- [ ] T138 [US9] Create HighlightManager component (select event, set date range, editorial note) in `frontend/src/features/admin/HighlightManager.tsx`
- [ ] T139 [US9] Create EventList admin view with hide/publish actions in `frontend/src/features/admin/AdminEventList.tsx`
- [ ] T140 [US9] Add admin routes to React Router config in `frontend/src/routes/index.tsx`

**Checkpoint**: Admin can manage highlights and events. Hidden events preserve linked data.

---

## Phase 12: User Story 10 — Analytics Básico (Priority: P3)

**Goal**: Simple analytics dashboard for admins showing usage metrics.

**Independent Test**: Access analytics panel, verify counters for event views, export clicks, and bundle downloads.

### Implementation for User Story 10

- [ ] T141 [P] [US10] Create AnalyticsEvent entity in `backend/src/main/java/com/skywatch/analytics/AnalyticsEvent.java` and `backend/src/main/java/com/skywatch/analytics/AnalyticsRepository.java`
- [ ] T142 [P] [US10] Create Flyway migration `V10__create_analytics_events.sql` in `backend/src/main/resources/db/migration/`
- [ ] T143 [US10] Implement AnalyticsService (track event, aggregate metrics) in `backend/src/main/java/com/skywatch/analytics/AnalyticsService.java`
- [ ] T144 [US10] Add analytics tracking calls to EventController (view), ExportController (create, download) in `backend/src/main/java/com/skywatch/event/EventController.java` and `backend/src/main/java/com/skywatch/export/ExportController.java`
- [ ] T145 [US10] Implement AnalyticsController (GET /admin/analytics) in `backend/src/main/java/com/skywatch/analytics/AnalyticsController.java`
- [ ] T146 [US10] Create AnalyticsDashboard page with summary cards and charts in `frontend/src/features/analytics/AnalyticsDashboard.tsx`
- [ ] T147 [US10] Integrate analytics dashboard into admin panel in `frontend/src/features/admin/AdminPanelPage.tsx`

**Checkpoint**: Admin analytics panel shows usage metrics. Tracking is non-blocking.

---

## Phase 13: User Story 11 — Home Page Pública (Priority: P1) 🎯 NEW

**Goal**: Create a public (no auth) home page at route `/` with minimalist blog/social-media style. Displays weekly event hero, astronomical conditions summary (São Paulo default for visitors), and vertical event feed with infinite scroll. CTAs redirect to login when not authenticated.

**Independent Test**: Open `http://localhost:5173/` without logging in. Verify: hero shows weekly highlight event, astro conditions banner shows São Paulo data with "Personalize" CTA, event feed loads in single-column layout, scrolling loads more events. Click favorite/export CTA → redirects to login.

**Requirements**: FR-036, FR-037, FR-038, FR-039

### Implementation for User Story 11

- [x] T161 [P] [US11] Create PublicLayout component (minimal header with logo + Login/Cadastrar CTAs + Footer, no sidebar) in `frontend/src/components/layout/PublicLayout.tsx`
- [x] T162 [P] [US11] Create useHome hook with `useWeeklyHighlight()` (GET /highlights/week), `useHomeEvents()` (useInfiniteQuery on GET /events), and `useDefaultCity()` (GET /cities/search?q=São Paulo) in `frontend/src/hooks/useHome.tsx`
- [x] T163 [P] [US11] Create HeroHighlight component (full-width hero with event image background, dark gradient overlay, type badge, title, date, "Ver detalhes" CTA linking to /events/{slug}) in `frontend/src/features/home/HeroHighlight.tsx`
- [x] T164 [P] [US11] Create AstroConditionsBanner component (horizontal bar with seeing quality, cloud %, temperature, humidity; banner "Condições em São Paulo"; CTA "Personalize para sua cidade →" linking to /register or /settings) in `frontend/src/features/home/AstroConditionsBanner.tsx`
- [x] T165 [P] [US11] Create EventFeedCard component (landscape image 16:9 with placeholder from getEventImage, type badge + date, title, description line-clamp-2, action row with favorite heart + "Exportar" + "Ver mais →"; CTAs redirect to /login if not authenticated) in `frontend/src/features/home/EventFeedCard.tsx`
- [x] T166 [US11] Create HomePage component composing HeroHighlight + AstroConditionsBanner + vertical EventFeedCard feed in max-w-2xl centered column with IntersectionObserver for infinite scroll sentinel. Handle loading/error/empty states per section in `frontend/src/features/home/HomePage.tsx`
- [x] T167 [US11] Update router: change root `/` from `<Navigate to="/dashboard">` to public `<HomePage />` wrapped in `<PublicLayout>`. Keep `/dashboard` as authenticated route in `frontend/src/routes/index.tsx`

**Checkpoint**: Public home page loads at `/` without auth. Hero shows weekly event, conditions banner shows São Paulo data, feed scrolls infinitely. All CTAs redirect to login for unauthenticated visitors.

---

## Phase 14: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T148 [P] Add structured logging with request correlation across all controllers in `backend/src/main/java/com/skywatch/config/LoggingConfig.java`
- [ ] T149 [P] Add health checks for PostgreSQL, Redis, and S3 in `backend/src/main/java/com/skywatch/config/HealthCheckConfig.java`
- [ ] T150 [P] Create Dockerfile for backend with multi-stage build in `backend/Dockerfile`
- [ ] T151 [P] Create Dockerfile for frontend with nginx serving in `frontend/Dockerfile`
- [ ] T152 [P] Create nginx.conf for reverse proxy in `infra/nginx.conf`
- [ ] T153 Update `infra/docker-compose.yml` with full production stack (backend, frontend, nginx, postgres, redis, minio)
- [ ] T154 [P] Add input validation annotations (@Valid, @NotBlank, etc.) audit across all controllers
- [ ] T155 [P] Add rate limiting for auth endpoints in `backend/src/main/java/com/skywatch/config/RateLimitConfig.java`
- [ ] T156 [P] Ensure all frontend pages handle loading, error, and empty states consistently
- [ ] T157 [P] Add responsive design audit for all pages (mobile, tablet, desktop)
- [ ] T158 [P] Create `frontend/src/styles/design-tokens.ts` exporting Midnight, Sky Blue, Ice, Slate as constants
- [ ] T159 Run quickstart.md validation end-to-end
- [ ] T160 Create seed profile for demo deployment with curated events and export samples

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 Auth (Phase 3)**: Depends on Foundational — RECOMMENDED first (other stories need auth)
- **US2 Events (Phase 4)**: Depends on Foundational + US1 (needs auth context)
- **US3 Forecast (Phase 5)**: Depends on US2 (needs events)
- **US4 Dashboard (Phase 6)**: Depends on US2 + US3 (needs events, forecasts, highlights)
- **US5 Favorites (Phase 7)**: Depends on US2 (needs events) — can parallel with US3/US4
- **US6 Export (Phase 8)**: Depends on US2 + US4 (needs events + weekly highlight)
- **US7 Personalization (Phase 9)**: Depends on US6 (needs export pipeline)
- **US8 Observations (Phase 10)**: Depends on US1 only — can parallel with US2+
- **US9 Admin (Phase 11)**: Depends on US2 + US4 (needs events + highlights)
- **US10 Analytics (Phase 12)**: Depends on US2 + US6 (needs events + exports to track)
- **US11 Home Page (Phase 13)**: Depends on US2 (events), US3 (forecast/conditions), US4 (highlights) — frontend-only, no backend changes
- **Polish (Phase 14)**: Depends on all desired user stories being complete

### Recommended Execution Order

```text
Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3)
                                                    ↘ Phase 7 (US5)
                                   Phase 6 (US4) → Phase 8 (US6) → Phase 9 (US7)
                     Phase 3 (US1) → Phase 10 (US8)
                     Phase 4+6 → Phase 11 (US9)
                     Phase 4+8 → Phase 12 (US10)
                     Phase 4+5+6 → Phase 13 (US11 Home Page)
                     All → Phase 14 (Polish)
```

### Within Each User Story

- Models/entities before services
- Services before controllers
- DTOs/mappers can parallel with models
- Backend before frontend (API must exist)
- Core implementation before integration with other stories
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel
- Within each story: models, DTOs, and migrations can run in parallel
- Frontend hooks can parallel with backend DTOs (using contract as guide)
- US5 (Favorites) can parallel with US3 (Forecast) after US2 completes
- US8 (Observations) can start after US1 completes (independent of other stories)

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 + 3 + 4 + 6)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 Auth
4. Complete Phase 4: US2 Events
5. Complete Phase 5: US3 Forecast
6. Complete Phase 6: US4 Dashboard
7. Complete Phase 8: US6 Export (CORE)
8. Complete Phase 13: US11 Home Page (public landing page)
9. **STOP and VALIDATE**: Test all P1 stories independently
10. Deploy/demo MVP

### Incremental Delivery (add P2 + P3)

11. Add Phase 7: US5 Favorites
12. Add Phase 9: US7 Personalization
13. Add Phase 11: US9 Admin
14. Add Phase 10: US8 Observations
15. Add Phase 12: US10 Analytics
16. Complete Phase 14: Polish
17. Final deploy with full feature set

---

## Phase 15: User Story 12 — Reestruturação de Navegação + Dark Theme (Priority: P1) 🎯 NEW

**Goal**: Remove dashboard from regular users (admin-only), create bottom nav for authenticated users, migrate all auth pages to dark theme (#050A18), unify public/auth experience on route `/`. Frontend-only — zero backend changes.

**Independent Test**: Login as regular user → redirected to `/` (home) with bottom nav visible. Navigate via bottom nav to Events, Favorites, Observations, Settings — all dark themed. Access `/dashboard` as non-admin → redirected to `/`. Access `/dashboard` as admin → admin panel loads. SettingsPage shows admin link only for admins + export history section.

**Requirements**: FR-040, FR-041, FR-042, FR-043, FR-044, FR-045

### Implementation for User Story 12

- [x] T168 [P] [US12] Create BottomNav component with 5 icons (Home /, Eventos /events, Favoritos /favorites, Observações /observations, Perfil /settings) — fixed bottom, glassmorphism dark style, active route highlight via useLocation(), visible only when getAccessToken() returns token in `frontend/src/components/layout/BottomNav.tsx`
- [x] T169 [P] [US12] Create AuthLayout wrapper component — bg-[#050A18] min-h-screen, pb-20 for bottom nav clearance, renders BottomNav, no header/sidebar in `frontend/src/components/layout/AuthLayout.tsx`
- [x] T170 [US12] Update PublicLayout to show BottomNav + pb-20 when authenticated, replace "Entrar"/"Criar conta" with user icon/avatar when logged in, keep glassmorphism top nav in `frontend/src/components/layout/PublicLayout.tsx`
- [x] T171 [US12] Update useHome hook to use user's city (from profile/preferences) when authenticated instead of defaulting to São Paulo in `frontend/src/hooks/useHome.tsx`
- [x] T172 [US12] Enhance HomePage to detect auth state — when authenticated: show user's city in conditions banner, enable favorite/export CTAs (no redirect), show personalized greeting or context in `frontend/src/features/home/HomePage.tsx`
- [x] T173 [P] [US12] Migrate EventListPage to dark theme — bg-[#050A18], cards bg-white/[0.03] border-white/5, text-white headings, text-gray-400 descriptions, inputs bg-white/5 border-white/10 in `frontend/src/features/events/EventListPage.tsx`
- [x] T174 [P] [US12] Migrate EventDetailPage to dark theme — same dark tokens, ensure export panel and forecast sections follow dark theme in `frontend/src/features/events/EventDetailPage.tsx`
- [x] T175 [P] [US12] Migrate FavoritesListPage to dark theme — dark background, cards with white/5 borders, empty state with dark styling in `frontend/src/features/favorites/FavoritesListPage.tsx`
- [x] T176 [P] [US12] Migrate ObservationTimeline to dark theme — timeline entries with dark cards, text-white titles, text-gray-400 notes in `frontend/src/features/observations/ObservationTimeline.tsx`
- [x] T177 [P] [US12] Migrate ObservationForm to dark theme — inputs bg-white/5 border-white/10 text-white, labels text-gray-400, buttons with accent colors in `frontend/src/features/observations/ObservationForm.tsx`
- [x] T178 [US12] Migrate SettingsPage to dark theme + add admin link section (visible only for ADMIN role, links to /dashboard with shield icon) + add export history section (list recent exports with timestamp, event name, re-download link) in `frontend/src/features/auth/SettingsPage.tsx`
- [x] T179 [P] [US12] Update LoginPage to redirect to `/` instead of `/dashboard` after successful login in `frontend/src/features/auth/LoginPage.tsx`
- [x] T180 [P] [US12] Update RegisterPage to redirect to `/` instead of `/dashboard` after successful registration in `frontend/src/features/auth/RegisterPage.tsx`
- [x] T181 [US12] Restructure routes in router config — wrap EventListPage, EventDetailPage, FavoritesListPage, ObservationTimeline, SettingsPage with AuthLayout instead of MainLayout; wrap /dashboard with AdminRoute guard (redirect non-admin to /); keep PublicLayout on / in `frontend/src/routes/index.tsx`

**Checkpoint**: Regular users never see dashboard. All auth pages use dark theme. Bottom nav visible on all authenticated pages. Admin link only in settings for admins. Login/register redirect to `/`.

---

## Dependencies & Execution Order (Updated)

### Phase Dependencies (Updated)

- **US12 Nav Restructuring (Phase 15)**: Depends on US11 (home page), US2 (events), US5 (favorites), US8 (observations), US9 (admin). Frontend-only — no backend changes needed. Can be implemented after all referenced pages exist.

### Parallel Opportunities (Phase 15)

- T168 (BottomNav) and T169 (AuthLayout) can run in parallel — different files
- T173-T177 (dark theme migrations) can ALL run in parallel — different files, same pattern
- T179-T180 (login/register redirect) can run in parallel — different files
- T170 (PublicLayout update) depends on T168 (BottomNav must exist)
- T181 (route restructure) depends on T169 (AuthLayout must exist)
- T171-T172 (useHome + HomePage auth enhancements) are sequential

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Total tasks: 181
