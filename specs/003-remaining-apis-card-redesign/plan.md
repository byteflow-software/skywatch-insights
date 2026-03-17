# Implementation Plan: Remaining API Integrations + Home Card Redesign

**Branch**: `003-remaining-apis-card-redesign` | **Date**: 2026-03-13 | **Spec**: specs/003-remaining-apis-card-redesign/spec.md
**Input**: Feature specification from `/specs/003-remaining-apis-card-redesign/spec.md`

## Summary

Integrate real data sources for 6 remaining astronomical event types (eclipses, meteor showers, aurora, transits, occultations) and redesign home page event feed cards to a Twitter/X-style text-first layout. Backend adds 3 new API clients (USNO eclipses, NOAA SWPC Kp, static catalogs) and extends the sync job. Frontend replaces image-heavy cards with compact text cards.

## Technical Context

**Language/Version**: Java 21 (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: Spring Boot 3.x, Spring Scheduler, RestClient (backend); React 18, Tailwind CSS, TanStack Query (frontend)
**Storage**: PostgreSQL 16 (events), Redis 7 (cache)
**Testing**: Manual verification via API endpoints
**Target Platform**: Web (desktop + mobile)
**Project Type**: Web application (fullstack)
**Constraints**: All APIs must be free and require no paid keys. USNO and NOAA SWPC are government APIs with no auth.

## Constitution Check

- No new external dependencies added to build files
- No new database tables needed — reuses existing `astronomical_events` and `data_sync_logs`
- No new authentication mechanisms
- All APIs are free and public

## Project Structure

### Source Code (repository root)

```text
backend/
├── src/main/java/com/skywatch/
│   ├── astrosync/
│   │   ├── UsnoEclipseClient.java          # NEW - USNO eclipse API client
│   │   ├── NoaaKpClient.java               # NEW - NOAA SWPC Kp forecast client
│   │   ├── MeteorShowerCatalog.java         # NEW - Static meteor shower catalog
│   │   ├── TransitOccultationCatalog.java   # NEW - Static transit/occultation catalog
│   │   ├── AstroEventSyncService.java       # MODIFIED - add sync methods
│   │   ├── AstroEventSyncJob.java           # MODIFIED - add sync calls
│   │   └── RelevanceScoreCalculator.java    # MODIFIED - add new type scores
│   └── ...
├── src/main/resources/
│   └── catalogs/
│       ├── meteor-showers.json              # NEW - Stellarium-derived catalog
│       ├── transits.json                    # NEW - Mercury/Venus transit dates
│       └── occultations-2026.json           # NEW - Notable occultations for current year

frontend/
├── src/
│   ├── features/home/
│   │   ├── EventFeedCard.tsx                # MODIFIED - Twitter/X style redesign
│   │   └── HomePage.tsx                     # MODIFIED - remove image skeleton
│   └── lib/
│       └── eventTypes.ts                    # MODIFIED - add type icons
```

**Structure Decision**: Extends existing backend/frontend structure. New clients follow the established pattern (DonkiClient, AstronomyApiClient). Static catalogs stored as classpath resources in `src/main/resources/catalogs/`.
