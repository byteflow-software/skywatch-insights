# Implementation Plan: Real Astronomical Data Sources

**Branch**: `002-real-astro-apis` | **Date**: 2026-03-13 | **Spec**: `specs/002-real-astro-apis/spec.md`
**Input**: Feature specification from `/specs/002-real-astro-apis/spec.md`

## Summary

Integrate real astronomical data from NASA DONKI (solar flares, CMEs, geomagnetic storms), NASA APOD (daily highlights), and US Naval Observatory (moon phase/illumination) into SkyWatch Insights. Scheduled sync jobs fetch and deduplicate space weather events every 6 hours, APOD daily, and moon data on-demand with Redis caching. New entities (DailyHighlight, DataSyncLog) provide content and observability. Expired events are auto-archived after 7 days. Frontend displays real-time moon data in astro conditions, API-sourced events in listings, and APOD as hero fallback.

## Technical Context

**Language/Version**: Java 21 (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: Spring Boot 3.x, Spring Data JPA, Hibernate, MapStruct, Spring Scheduler, RestTemplate/WebClient (backend); React 18, TanStack Query, Tailwind CSS, shadcn/ui (frontend)
**Storage**: PostgreSQL 16 (primary), Redis 7 (cache for moon data — 30 min TTL)
**Testing**: JUnit 5 + Testcontainers (backend integration), Vitest (frontend)
**Target Platform**: Docker Compose (dev/staging), Linux server (production)
**Project Type**: Web application (API + SPA)
**Performance Goals**: < 500ms for read endpoints; moon data cached 30 min; sync jobs < 30s per run
**Constraints**: NASA API rate limit 1000 req/hour (registered key); USNO has no documented limits; no seed data allowed
**Scale/Scope**: Single-instance deployment, ~3 new backend modules, 4 DB migrations, 3 external API clients, 5 new/modified endpoints, frontend updates to 3 pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Produto Real | PASS | All data comes from real APIs (NASA, USNO). No mocked/seed data. Loading, error, and empty states required for all new UI sections. |
| II. Modularidade por Domínio | PASS | New modules: `astrosync` (sync jobs + DONKI client), `highlight` (extended with DailyHighlight + APOD client), `forecast` (extended with USNO moon client). DTOs + MapStruct for all API responses. |
| III. Social Publishing como Core | N/A | No social export changes in this feature. |
| IV. Entregas Incrementais | PASS | Feature delivers demonstrable real data in UI — events from NASA, moon phases from USNO, APOD hero image. |
| V. Qualidade e Observabilidade | PASS | DataSyncLog entity provides full sync observability. Admin endpoint for monitoring. Health checks for external APIs. Tests for sync logic and deduplication. |
| VI. Simplicidade e Foco | PASS | Only integrates proven, free APIs. IMCCE/OPALE deferred (sparse docs). No over-engineering — on-demand moon data with simple Redis cache instead of a sync job. |

## Project Structure

### Documentation (this feature)

```text
specs/002-real-astro-apis/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: API research and decisions
├── data-model.md        # Phase 1: Entity definitions and migrations
├── quickstart.md        # Phase 1: Setup and verification guide
├── contracts/
│   └── api-endpoints.md # Phase 1: API contracts (internal + external)
├── checklists/
│   └── requirements.md  # Quality checklist
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/main/java/com/skywatch/
│   ├── event/
│   │   ├── EventType.java              # MODIFIED — add SOLAR_FLARE, CME, GEOMAGNETIC_STORM, AURORA, OCCULTATION
│   │   ├── EventStatus.java            # MODIFIED — add ARCHIVED
│   │   ├── AstronomicalEvent.java      # MODIFIED — add externalId field
│   │   ├── EventRepository.java        # MODIFIED — add queries for status filter, externalId lookup
│   │   ├── EventService.java           # MODIFIED — add status filter, archived listing
│   │   └── EventController.java        # MODIFIED — add /archived endpoint, status param
│   ├── astrosync/                      # NEW MODULE
│   │   ├── DonkiClient.java           # NASA DONKI API client (FLR, CME, GST)
│   │   ├── AstroEventSyncService.java # Sync logic with deduplication
│   │   ├── AstroEventSyncJob.java     # @Scheduled every 6 hours
│   │   ├── EventArchivalJob.java      # @Scheduled daily — archive expired events
│   │   ├── DataSyncLog.java           # Entity
│   │   ├── DataSyncLogRepository.java # Repository
│   │   ├── SyncLogService.java        # Service for logging sync results
│   │   └── RelevanceScoreCalculator.java # Score matrix from research R5
│   ├── highlight/
│   │   ├── DailyHighlight.java        # NEW entity (NASA APOD)
│   │   ├── DailyHighlightRepository.java # NEW repository
│   │   ├── ApodClient.java            # NEW — NASA APOD API client
│   │   ├── ApodSyncJob.java           # NEW — @Scheduled daily at 08:00 UTC
│   │   ├── HighlightService.java      # MODIFIED — add today's highlight from APOD
│   │   └── HighlightController.java   # MODIFIED — add GET /highlights/today
│   ├── forecast/
│   │   ├── UsnoMoonClient.java        # NEW — USNO API client (moon phase, illumination)
│   │   └── AstroConditionsController.java # MODIFIED — add moon section to response
│   ├── admin/
│   │   └── AdminSyncLogController.java # NEW — GET /admin/sync-logs
│   └── config/
│       └── SecurityConfig.java         # MODIFIED — permit new public endpoints
├── src/main/resources/db/migration/
│   ├── V16__add_event_external_id.sql  # NEW
│   ├── V18__create_daily_highlights.sql # NEW
│   └── V19__create_data_sync_logs.sql  # NEW
└── src/test/java/com/skywatch/
    ├── astrosync/
    │   ├── AstroEventSyncServiceTest.java
    │   └── RelevanceScoreCalculatorTest.java
    └── highlight/
        └── ApodSyncJobTest.java

frontend/
├── src/
│   ├── features/
│   │   ├── home/
│   │   │   └── HomePage.tsx            # MODIFIED — APOD hero fallback, moon data display
│   │   └── events/
│   │       ├── EventsPage.tsx          # MODIFIED — new event type icons/labels
│   │       └── ArchivedEventsPage.tsx  # NEW — past events view
│   ├── hooks/
│   │   └── useEvents.tsx               # MODIFIED — add archived events query, type filter
│   └── services/
│       └── api.ts                      # No changes needed (endpoints follow existing patterns)
```

**Structure Decision**: Web application structure (Option 2). Backend organized by domain modules following existing convention. New `astrosync` module encapsulates all sync-related logic. Frontend extends existing feature pages with minimal new pages (only ArchivedEventsPage is fully new).

## Complexity Tracking

No constitution violations. All design decisions favor simplicity:
- Moon data fetched on-demand + Redis cache (no sync job or persistence needed)
- USNO API requires no authentication (zero config overhead)
- IMCCE/OPALE deferred to avoid complexity from sparse documentation
- Relevance scores computed at sync time, not dynamically
