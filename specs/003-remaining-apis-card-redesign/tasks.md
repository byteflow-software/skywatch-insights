# Tasks: Remaining API Integrations + Home Card Redesign

**Input**: Design documents from `/specs/003-remaining-apis-card-redesign/`
**Prerequisites**: plan.md, spec.md, research.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Static catalog files and base score configuration

- [x] T001 Create meteor shower static catalog JSON at `backend/src/main/resources/catalogs/meteor-showers.json` with top 25 showers from Stellarium data (IAU code, name, peak month/day, ZHR, radiant RA/Dec, velocity km/s, parent body, active period start/end)
- [x] T002 [P] Create planetary transit static catalog JSON at `backend/src/main/resources/catalogs/transits.json` with Mercury (2032, 2039, 2049) and Venus (2117, 2125) transit dates
- [x] T003 [P] Create occultation static catalog JSON at `backend/src/main/resources/catalogs/occultations.json` with notable lunar occultations of bright planets for 2026-2027
- [x] T004 Add relevance score entries for ECLIPSE_SOLAR, ECLIPSE_LUNAR, METEOR_SHOWER, AURORA, TRANSIT, OCCULTATION in `backend/src/main/java/com/skywatch/astrosync/RelevanceScoreCalculator.java`

**Checkpoint**: Static data and scoring ready

---

## Phase 2: User Story 1 - Eclipse Sync via USNO (Priority: P1)

**Goal**: Automatically sync solar and lunar eclipse data from the USNO API

**Independent Test**: Run sync, verify ECLIPSE_SOLAR/ECLIPSE_LUNAR events appear in GET /events

- [x] T005 [US1] Create USNO eclipse API client at `backend/src/main/java/com/skywatch/astrosync/UsnoEclipseClient.java` — fetch `/api/eclipses/solar/year?year=YYYY` and `/api/eclipses/lunar/year?year=YYYY`, parse JSON response into EclipseData records (type, date, magnitude, duration, eclipseKind)
- [x] T006 [US1] Add `syncEclipseEvents()` method to `backend/src/main/java/com/skywatch/astrosync/AstroEventSyncService.java` — call UsnoEclipseClient for current year and next year, create events with deduplication by externalId+source, set type ECLIPSE_SOLAR/ECLIPSE_LUNAR, include eclipse kind and magnitude in description
- [x] T007 [US1] Add `syncEclipseEvents()` call to `backend/src/main/java/com/skywatch/astrosync/AstroEventSyncJob.java` scheduled method
- [x] T008 [US1] Add USNO eclipse base-url config to `backend/src/main/resources/application.yml` under `app.usno` (reuse existing usno base-url)

**Checkpoint**: Eclipse events synced from USNO

---

## Phase 3: User Story 2 - Meteor Shower Sync from Static Catalog (Priority: P1)

**Goal**: Create meteor shower events from embedded static catalog

**Independent Test**: Run sync, verify METEOR_SHOWER events appear with correct peak dates and ZHR

- [x] T009 [US2] Create meteor shower catalog loader at `backend/src/main/java/com/skywatch/astrosync/MeteorShowerCatalog.java` — load `catalogs/meteor-showers.json` from classpath, parse into MeteorShowerData records (iauCode, name, peakMonth, peakDay, zhr, radiantRa, radiantDec, velocity, parentBody, activeStart, activeEnd)
- [x] T010 [US2] Add `syncMeteorShowerEvents()` method to `backend/src/main/java/com/skywatch/astrosync/AstroEventSyncService.java` — iterate catalog, create events for showers with peaks within next 90 days of current year, deduplication by externalId+source, include ZHR/radiant/velocity/parent body in description
- [x] T011 [US2] Add `syncMeteorShowerEvents()` call to `backend/src/main/java/com/skywatch/astrosync/AstroEventSyncJob.java` scheduled method

**Checkpoint**: Meteor shower events synced from static catalog

---

## Phase 4: User Story 3 - Aurora Events via NOAA SWPC Kp (Priority: P2)

**Goal**: Create aurora events when NOAA Kp forecast predicts geomagnetic storm (Kp >= 5)

**Independent Test**: When Kp forecast >= 5, verify AURORA event created with Kp value and forecast time

- [x] T012 [US3] Create NOAA Kp forecast client at `backend/src/main/java/com/skywatch/astrosync/NoaaKpClient.java` — fetch `https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json`, parse JSON array into KpForecastEntry records (timestamp, kpValue)
- [x] T013 [US3] Add `syncAuroraEvents()` method to `backend/src/main/java/com/skywatch/astrosync/AstroEventSyncService.java` — call NoaaKpClient, filter entries with Kp >= 5, create AURORA events with deduplication, include Kp value and visibility latitude estimate in description, higher relevance for higher Kp
- [x] T014 [US3] Add `syncAuroraEvents()` call to `backend/src/main/java/com/skywatch/astrosync/AstroEventSyncJob.java` scheduled method
- [x] T015 [US3] Add NOAA SWPC base-url config to `backend/src/main/resources/application.yml` under `app.noaa`

**Checkpoint**: Aurora events created from Kp forecast data

---

## Phase 5: User Story 4 - Transit & Occultation Static Sync (Priority: P3)

**Goal**: Create transit and occultation events from static catalogs

**Independent Test**: Verify TRANSIT and OCCULTATION events exist with correct dates

- [x] T016 [US4] Create transit/occultation catalog loader at `backend/src/main/java/com/skywatch/astrosync/TransitOccultationCatalog.java` — load `catalogs/transits.json` and `catalogs/occultations.json` from classpath, parse into records
- [x] T017 [US4] Add `syncTransitOccultationEvents()` method to `backend/src/main/java/com/skywatch/astrosync/AstroEventSyncService.java` — create TRANSIT and OCCULTATION events with deduplication, include planet name and duration/visibility in description
- [x] T018 [US4] Add `syncTransitOccultationEvents()` call to `backend/src/main/java/com/skywatch/astrosync/AstroEventSyncJob.java` scheduled method

**Checkpoint**: Transit and occultation events synced from static catalogs

---

## Phase 6: User Story 5 - Home Page Card Redesign (Priority: P1)

**Goal**: Redesign event feed cards to Twitter/X style — text-first, no images

**Independent Test**: Load home page, verify cards render without images in compact text layout

- [x] T019 [P] [US5] Add type-specific SVG icon map to `frontend/src/lib/eventTypes.ts` — small inline icons for each event type (moon for eclipses, star-shooting for meteors, sun for solar flares, aurora-wave for aurora, etc.)
- [x] T020 [US5] Redesign `frontend/src/features/home/EventFeedCard.tsx` — remove image section, add type icon + colored left border or badge accent, make title prominent, show 2-line description, relative date as primary, compact action bar with favorite/share/ver-mais
- [x] T021 [US5] Update `frontend/src/features/home/HomePage.tsx` — remove image-based skeleton loaders, update to text-based skeleton, adjust spacing for compact cards
- [x] T022 [P] [US5] Update event type badge colors in `frontend/src/lib/eventTypes.ts` for new types if missing (PLANETARY_CONJUNCTION already has blue, verify all 6 new-data types have proper badge colors)
- [x] T023 [US5] Ensure `frontend/src/features/events/SpaceWeatherBadge.tsx` works correctly inline within the new compact card layout

**Checkpoint**: Home page renders with Twitter/X style compact cards

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final adjustments and validation

- [x] T024 [P] Add frontend labels for any missing event types in `frontend/src/lib/eventTypes.ts` TYPE_LABELS map (verify ECLIPSE_SOLAR, ECLIPSE_LUNAR, METEOR_SHOWER, TRANSIT, AURORA, OCCULTATION all have pt-BR labels)
- [x] T025 [P] Add event type filter options for new types in `frontend/src/features/events/EventListPage.tsx` filter dropdown
- [x] T026 Verify all sync methods log properly to data_sync_logs via SyncLogService in `backend/src/main/java/com/skywatch/astrosync/AstroEventSyncService.java`
- [x] T027 Test full sync cycle: restart backend, verify all event types appear in GET /events endpoint with correct data

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Eclipses)**: Depends on T004 (scores)
- **Phase 3 (Meteor Showers)**: Depends on T001 (catalog) and T004 (scores)
- **Phase 4 (Aurora)**: Depends on T004 (scores)
- **Phase 5 (Transit/Occultation)**: Depends on T002, T003 (catalogs) and T004 (scores)
- **Phase 6 (Card Redesign)**: Independent of backend — can run in parallel with Phases 2-5
- **Phase 7 (Polish)**: Depends on all previous phases

### Parallel Opportunities

- T001, T002, T003 can all run in parallel (different files)
- Phase 2 and Phase 3 can run in parallel after Phase 1
- Phase 6 (frontend) can run in parallel with Phases 2-5 (backend)
- T019, T022, T024, T025 can run in parallel (different files/sections)

---

## Implementation Strategy

### MVP First (Phases 1 + 2 + 3 + 6)

1. Phase 1: Setup catalogs and scores
2. Phase 2: Eclipse sync (highest user value)
3. Phase 3: Meteor shower sync (frequent events)
4. Phase 6: Card redesign (visual improvement)
5. **VALIDATE**: Verify eclipses and meteor showers appear in redesigned feed

### Incremental Delivery

1. Setup → Eclipse sync → Meteor showers → Card redesign (MVP)
2. Add Aurora sync → More dynamic events
3. Add Transit/Occultation → Complete coverage
4. Polish → All types in filters, labels verified

---

## Notes

- USNO API is already used for moon data — extend UsnoMoonClient pattern
- NOAA SWPC endpoints are completely open (no auth, no rate limit documented)
- Meteor shower catalog is ~25 entries — small enough to embed in JAR
- Transit catalog is ~5 entries — trivially small
- Occultation catalog is ~10-20 entries per year — update annually
- Card redesign is purely frontend — zero backend changes needed
