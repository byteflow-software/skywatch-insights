# Tasks: Real Astronomical Data Sources Integration

**Input**: Design documents from `/specs/002-real-astro-apis/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-endpoints.md, quickstart.md

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migrations and configuration for all new entities and fields

- [x] T001 [P] Create Flyway migration V16 to add external_id column and unique constraint (external_id, source) to astronomical_events table in `backend/src/main/resources/db/migration/V16__add_event_external_id.sql`
- [x] T002 [P] Create Flyway migration V18 to create daily_highlights table (id, date, title, explanation, image_url, hd_image_url, media_type, copyright, source, created_at, updated_at) in `backend/src/main/resources/db/migration/V18__create_daily_highlights.sql`
- [x] T003 [P] Create Flyway migration V19 to create data_sync_logs table (id, source, sync_type, started_at, completed_at, items_fetched, items_created, items_updated, error_message, status, created_at) in `backend/src/main/resources/db/migration/V19__create_data_sync_logs.sql`
- [x] T004 Add USNO base URL config property under `app:` in `backend/src/main/resources/application.yml` and update NASA_API_KEY in `infra/docker-compose.yml` with comment about registering a key

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core entity changes and shared services that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Add SOLAR_FLARE, CME, GEOMAGNETIC_STORM, AURORA, OCCULTATION values to EventType enum in `backend/src/main/java/com/skywatch/event/EventType.java`
- [x] T006 [P] Add ARCHIVED value to EventStatus enum in `backend/src/main/java/com/skywatch/event/EventStatus.java`
- [x] T007 Add externalId field (nullable, mapped to external_id column) to AstronomicalEvent entity in `backend/src/main/java/com/skywatch/event/AstronomicalEvent.java`
- [x] T008 [P] Create DataSyncLog entity with all fields per data-model.md in `backend/src/main/java/com/skywatch/astrosync/DataSyncLog.java`
- [x] T009 [P] Create DataSyncLogRepository with findBySource query in `backend/src/main/java/com/skywatch/astrosync/DataSyncLogRepository.java`
- [x] T010 Create SyncLogService with startSync(), completeSync(), failSync() methods that create and update DataSyncLog entries in `backend/src/main/java/com/skywatch/astrosync/SyncLogService.java`
- [x] T011 [P] Create RelevanceScoreCalculator implementing the score matrix from research.md (base score per EventType + intensity modifiers for classType, kpIndex, speed) in `backend/src/main/java/com/skywatch/astrosync/RelevanceScoreCalculator.java`
- [x] T012 Update SecurityConfig to permit public access to `/api/v1/highlights/**`, `/api/v1/events/archived`, and restrict `/api/v1/admin/sync-logs` to ADMIN role in `backend/src/main/java/com/skywatch/config/SecurityConfig.java`

**Checkpoint**: Foundation ready — all entity extensions, migrations, and shared services in place

---

## Phase 3: User Story 1 — Browse Real Astronomical Events (Priority: P1) MVP

**Goal**: Periodically fetch real astronomical events from NASA DONKI, deduplicate, auto-publish, archive expired events, and display them on the events page.

**Independent Test**: Visit the events list after a sync cycle runs and verify events with types SOLAR_FLARE, CME, GEOMAGNETIC_STORM are present with source=nasa_donki, accurate dates, and relevance scores.

### Implementation for User Story 1

- [x] T013 [US1] Create DonkiClient with fetchSolarFlares(from, to), fetchCMEs(from, to), fetchGeomagneticStorms(from, to) methods using RestTemplate, mapping NASA DONKI JSON responses per contracts in `backend/src/main/java/com/skywatch/astrosync/DonkiClient.java`
- [x] T014 [US1] Create AstroEventSyncService with syncSpaceWeather() method that: calls DonkiClient for FLR/CME/GST, maps to AstronomicalEvent entities, deduplicates by externalId+source, calculates relevance scores via RelevanceScoreCalculator, auto-publishes, and logs via SyncLogService in `backend/src/main/java/com/skywatch/astrosync/AstroEventSyncService.java`
- [x] T015 [US1] Create AstroEventSyncJob with @Scheduled(fixedRate) every 6 hours calling AstroEventSyncService.syncSpaceWeather(), wrapped in try/catch with error logging in `backend/src/main/java/com/skywatch/astrosync/AstroEventSyncJob.java`
- [x] T016 [US1] Create EventArchivalJob with @Scheduled(cron) daily at 00:00 UTC that sets status=ARCHIVED for events where endAt < now() - 7 days in `backend/src/main/java/com/skywatch/astrosync/EventArchivalJob.java`
- [x] T017 [US1] Add findByExternalIdAndSource(), findByStatusIn(), findByStatusOrderByStartAtDesc(Pageable) queries to EventRepository in `backend/src/main/java/com/skywatch/event/EventRepository.java`
- [x] T018 [US1] Update EventService to support status filter on event listings and add getArchivedEvents(page, size, type) method in `backend/src/main/java/com/skywatch/event/EventService.java`
- [x] T019 [US1] Add GET /api/v1/events/archived endpoint with page, size, type query params to EventController in `backend/src/main/java/com/skywatch/event/EventController.java`
- [x] T020 [US1] Add optional status query param to existing GET /api/v1/events endpoint to filter by PUBLISHED (default) or other statuses in `backend/src/main/java/com/skywatch/event/EventController.java`
- [x] T021 [US1] Create AdminSyncLogController with GET /api/v1/admin/sync-logs endpoint (page, size, source params) requiring ADMIN role in `backend/src/main/java/com/skywatch/admin/AdminSyncLogController.java`
- [x] T022 [P] [US1] Add new event type labels and icons/badges (SOLAR_FLARE, CME, GEOMAGNETIC_STORM, AURORA) to the events list rendering in `frontend/src/features/events/EventsPage.tsx`
- [x] T023 [P] [US1] Create ArchivedEventsPage with paginated list of past events, type filter, and link from main events page in `frontend/src/features/events/ArchivedEventsPage.tsx`
- [x] T024 [US1] Add useArchivedEvents() hook with TanStack Query fetching GET /api/v1/events/archived and add route for /events/archived in `frontend/src/hooks/useEvents.tsx` and `frontend/src/routes/index.tsx`

**Checkpoint**: Real astronomical events are synced from NASA DONKI, deduplicated, auto-published, archived after 7 days, and displayed on the events page with proper types and an archived events view.

---

## Phase 4: User Story 2 — View Live Moon Phase and Sky Conditions (Priority: P2)

**Goal**: Display real-time moon phase, illumination percentage, moonrise/moonset times in the AstroConditions banner for the user's preferred city.

**Independent Test**: Open the home page as an authenticated user with a preferred city set, verify the AstroConditions banner includes a moon section showing current phase name, illumination %, and rise/set times matching real lunar data.

### Implementation for User Story 2

- [x] T025 [US2] Create UsnoMoonClient with getMoonData(lat, lon, tz) calling USNO rstt/oneday endpoint and getYearPhases(year) calling moon/phases/year endpoint, parsing JSON response into a MoonPhaseDTO record in `backend/src/main/java/com/skywatch/forecast/UsnoMoonClient.java`
- [x] T026 [US2] Create MoonPhaseDTO record (phase, illumination, rise, set, closestPhaseName, closestPhaseDate) in `backend/src/main/java/com/skywatch/forecast/dto/MoonPhaseDTO.java`
- [x] T027 [US2] Update AstroConditionsController to call UsnoMoonClient with the location's lat/lon, add moon section to JSON response, cache result in Redis with 30-minute TTL, and gracefully handle USNO unavailability by omitting moon section in `backend/src/main/java/com/skywatch/forecast/AstroConditionsController.java`
- [x] T028 [US2] Update HomePage AstroConditionsBanner to render moon phase data (phase name, illumination %, rise/set times) when present in the API response, and hide the moon section gracefully when absent in `frontend/src/features/home/HomePage.tsx`

**Checkpoint**: The home page AstroConditions banner shows real-time moon data from USNO for the user's preferred city, cached for 30 minutes.

---

## Phase 5: User Story 3 — Discover Daily Astronomy Highlights (Priority: P3)

**Goal**: Automatically fetch NASA APOD daily and display it as the hero section content when no manual weekly highlight exists.

**Independent Test**: Visit the home page when no manual weekly highlight is configured and verify a NASA APOD image with title and description is displayed in the hero section.

### Implementation for User Story 3

- [x] T029 [P] [US3] Create DailyHighlight entity mapped to daily_highlights table with all fields per data-model.md in `backend/src/main/java/com/skywatch/highlight/DailyHighlight.java`
- [x] T030 [P] [US3] Create DailyHighlightRepository with findByDate(LocalDate) and Optional<DailyHighlight> findTopByOrderByDateDesc() queries in `backend/src/main/java/com/skywatch/highlight/DailyHighlightRepository.java`
- [x] T031 [US3] Create ApodClient with fetchToday() method calling NASA APOD endpoint, parsing response (date, title, explanation, url, hdurl, media_type, copyright) in `backend/src/main/java/com/skywatch/highlight/ApodClient.java`
- [x] T032 [US3] Create ApodSyncJob with @Scheduled(cron) daily at 08:00 UTC that calls ApodClient.fetchToday(), upserts into DailyHighlight by date, and logs via SyncLogService in `backend/src/main/java/com/skywatch/highlight/ApodSyncJob.java`
- [x] T033 [US3] Update HighlightService to add getTodayHighlight() method that returns manual weekly highlight if exists, otherwise returns today's DailyHighlight (or most recent cached one) in `backend/src/main/java/com/skywatch/highlight/HighlightService.java`
- [x] T034 [US3] Add GET /api/v1/highlights/today public endpoint to HighlightController returning DailyHighlight DTO (200) or 204 No Content in `backend/src/main/java/com/skywatch/highlight/HighlightController.java`
- [x] T035 [US3] Create DailyHighlightDTO and mapper for the /highlights/today response in `backend/src/main/java/com/skywatch/highlight/dto/DailyHighlightDTO.java`
- [x] T036 [US3] Update HomePage hero section to fetch GET /api/v1/highlights/today via TanStack Query, display APOD image with title/description when no weekly highlight exists, and show graceful fallback if neither is available in `frontend/src/features/home/HomePage.tsx`

**Checkpoint**: The home page hero section shows NASA APOD daily when no manual highlight is configured, with automatic daily sync.

---

## Phase 6: User Story 4 — View Space Weather Alerts (Priority: P3)

**Goal**: Display space weather events (solar flares, CMEs, geomagnetic storms) with proper categorization, intensity badges, and filtering in the events list.

**Independent Test**: View events list when solar activity events exist and verify solar flares show class type (X/M/C), geomagnetic storms show Kp index, and type filter works for space weather categories.

**Note**: Data sync for space weather is handled by US1 (Phase 3). This phase focuses on frontend display and filtering.

### Implementation for User Story 4

- [x] T037 [US4] Add event type filter dropdown (including SOLAR_FLARE, CME, GEOMAGNETIC_STORM, AURORA) to EventsPage with query param support in `frontend/src/features/events/EventsPage.tsx`
- [x] T038 [US4] Create space weather event detail components showing intensity data (flare class, Kp index, CME speed) parsed from event description/metadata in `frontend/src/features/events/SpaceWeatherBadge.tsx`
- [x] T039 [US4] Add useEvents type filter parameter support to the existing events hook in `frontend/src/hooks/useEvents.tsx`

**Checkpoint**: Space weather events display with proper categorization and intensity indicators, and users can filter events by type.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T040 Add error handling for malformed external API responses in DonkiClient, ApodClient, and UsnoMoonClient — log error, skip malformed entry, continue processing
- [x] T041 Add health check indicators for NASA DONKI, NASA APOD, and USNO API availability to the actuator health endpoint in `backend/src/main/resources/application.yml`
- [x] T042 [P] Update frontend empty states for events list when no events exist (no seed data scenario) in `frontend/src/features/events/EventsPage.tsx`
- [x] T043 [P] Add loading and error states for moon data and daily highlight sections on HomePage in `frontend/src/features/home/HomePage.tsx`
- [x] T044 Run quickstart.md verification — validate all endpoints return expected data after full Docker Compose rebuild

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (migrations must exist before entities reference them)
- **US1 (Phase 3)**: Depends on Phase 2 — core event sync
- **US2 (Phase 4)**: Depends on Phase 2 only — independent of US1
- **US3 (Phase 5)**: Depends on Phase 2 only — independent of US1 and US2
- **US4 (Phase 6)**: Depends on Phase 3 (US1 must sync space weather data before frontend can display it)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — no other story dependencies. **This is the MVP.**
- **US2 (P2)**: After Foundational — fully independent. Can run in parallel with US1.
- **US3 (P3)**: After Foundational — fully independent. Can run in parallel with US1 and US2.
- **US4 (P3)**: After US1 — needs space weather events to exist in DB before frontend display.

### Within Each User Story

- Backend entities/clients before services
- Services before controllers/endpoints
- Backend endpoints before frontend pages
- Core logic before error handling

### Parallel Opportunities

- **Phase 1**: T001, T002, T003 can all run in parallel (separate migration files)
- **Phase 2**: T005, T006, T008, T009, T011 can run in parallel (separate files)
- **Phase 3**: T022, T023 can run in parallel (separate frontend files)
- **Phase 4–5**: US2 and US3 can run entirely in parallel with each other
- **Phase 5**: T029, T030 can run in parallel (entity + repository)

---

## Parallel Example: User Story 1

```bash
# After Phase 2 is complete, launch backend work sequentially:
Task T013: "Create DonkiClient in backend/.../astrosync/DonkiClient.java"
Task T014: "Create AstroEventSyncService in backend/.../astrosync/AstroEventSyncService.java"
Task T015: "Create AstroEventSyncJob in backend/.../astrosync/AstroEventSyncJob.java"
Task T016: "Create EventArchivalJob in backend/.../astrosync/EventArchivalJob.java"

# Frontend tasks can run in parallel with each other (after backend endpoints exist):
Task T022: "Update EventsPage with new type labels"
Task T023: "Create ArchivedEventsPage"
```

## Parallel Example: User Story 2 + 3 (in parallel)

```bash
# US2 and US3 have no dependencies on each other:
# Developer A: US2 (Moon Phase)
Task T025: "Create UsnoMoonClient"
Task T026: "Create MoonPhaseDTO"
Task T027: "Update AstroConditionsController with moon section"
Task T028: "Update HomePage with moon data display"

# Developer B: US3 (Daily Highlights) — simultaneously
Task T029: "Create DailyHighlight entity"
Task T030: "Create DailyHighlightRepository"
Task T031: "Create ApodClient"
Task T032: "Create ApodSyncJob"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (migrations)
2. Complete Phase 2: Foundational (enums, entity changes, shared services)
3. Complete Phase 3: User Story 1 (NASA DONKI sync + events display)
4. **STOP and VALIDATE**: Trigger sync, verify real events appear in the list
5. Deploy/demo — the app now shows real astronomical events with zero seed data

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. User Story 1 → Real events from NASA DONKI (MVP!)
3. User Story 2 → Moon phase in AstroConditions banner
4. User Story 3 → APOD daily highlights in hero section
5. User Story 4 → Space weather type filtering and badges
6. Polish → Error handling, health checks, empty states

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- NASA API key must be a registered key (not DEMO_KEY) for reliable sync
- USNO API requires no authentication
- Moon data is transient (not persisted) — cached in Redis for 30 min
