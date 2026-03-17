# Feature Specification: Remaining API Integrations + Home Card Redesign

**Feature Branch**: `003-remaining-apis-card-redesign`
**Created**: 2026-03-13
**Status**: Draft
**Input**: Integrate real APIs for ECLIPSE_SOLAR, ECLIPSE_LUNAR, METEOR_SHOWER, TRANSIT, AURORA, OCCULTATION; redesign home event cards to Twitter/X style without hero images

## User Scenarios & Testing

### User Story 1 - Eclipse Events via USNO API (Priority: P1)

The system automatically syncs solar and lunar eclipse data from the US Naval Observatory API. Users see upcoming eclipses in the event feed with type, date, visibility info, and magnitude.

**Why this priority**: Eclipses are the most anticipated astronomical events and currently have zero real data in the system.

**Independent Test**: After sync runs, verify eclipse events appear in GET /events with type ECLIPSE_SOLAR or ECLIPSE_LUNAR, correct dates matching USNO data, and relevant descriptions.

**Acceptance Scenarios**:

1. **Given** the scheduled sync job runs, **When** USNO returns eclipse data for the current and next year, **Then** events are created with correct type (ECLIPSE_SOLAR/ECLIPSE_LUNAR), dates, and descriptions including eclipse type (total/partial/annular) and magnitude.
2. **Given** an eclipse already exists in the database (by externalId+source), **When** the sync runs again, **Then** no duplicate is created.
3. **Given** USNO API is unreachable, **When** the sync runs, **Then** the failure is logged in data_sync_logs and no data is lost.

---

### User Story 2 - Meteor Shower Events via Static Catalog (Priority: P1)

The system maintains a built-in catalog of major meteor showers (from Stellarium showers.json) and creates events for upcoming showers each year with peak dates, ZHR, radiant info, and parent body.

**Why this priority**: Meteor showers are frequent, popular events that drive user engagement. No external API call needed at runtime — purely static catalog synced to events.

**Independent Test**: After sync, verify meteor shower events appear with correct peak dates, ZHR in description, and proper METEOR_SHOWER type.

**Acceptance Scenarios**:

1. **Given** the sync job runs, **When** there are meteor showers with peaks within the next 90 days, **Then** METEOR_SHOWER events are created with name, peak date, expected ZHR, radiant coordinates, and velocity in the description.
2. **Given** a meteor shower event already exists (by externalId+source), **When** the sync runs again, **Then** no duplicate is created.
3. **Given** it's January, **When** the sync runs, **Then** the Quadrantids (peak ~Jan 3-4) event exists with ZHR ~110.

---

### User Story 3 - Aurora Events via NOAA SWPC Kp Forecast (Priority: P2)

The system periodically checks the NOAA Space Weather Prediction Center Kp forecast. When the predicted Kp index reaches >= 5 (geomagnetic storm level), the system creates an AURORA event alerting users of potential aurora visibility.

**Why this priority**: Aurora events are dynamic and time-sensitive. The NOAA SWPC Kp forecast API is free, no auth, and provides 3-day forecasts.

**Independent Test**: Mock a Kp forecast >= 5, verify an AURORA event is created with expected visibility latitudes and Kp value in description.

**Acceptance Scenarios**:

1. **Given** the NOAA Kp forecast contains a 3-hour window with Kp >= 5, **When** the sync runs, **Then** an AURORA event is created with the forecast time as startAt, Kp value in description, and appropriate relevance score.
2. **Given** an aurora event already exists for the same forecast window, **When** the sync runs, **Then** no duplicate is created.
3. **Given** all Kp forecast values are below 5, **When** the sync runs, **Then** no AURORA events are created.
4. **Given** Kp >= 7, **When** the event is created, **Then** the relevance score is higher than for Kp 5-6 (strong storm = more visible aurora).

---

### User Story 4 - Transit & Occultation Static Catalog (Priority: P3)

The system maintains a static catalog of planetary transits (Mercury/Venus across the Sun) and notable lunar occultations. Since these events are extremely rare (next Mercury transit: 2032, next Venus transit: 2117), the catalog is embedded and synced as needed.

**Why this priority**: These are rare events but important for completeness. Static data requires minimal maintenance.

**Independent Test**: Verify transit events exist with correct future dates and TRANSIT type; verify occultation events exist with OCCULTATION type.

**Acceptance Scenarios**:

1. **Given** the sync job runs, **When** there are upcoming transits within the next 10 years, **Then** TRANSIT events are created with planet name, date, and duration in description.
2. **Given** notable lunar occultations of bright planets exist for the current year, **When** the sync runs, **Then** OCCULTATION events are created with target body, date, and visibility region.
3. **Given** no upcoming transits or occultations match the time window, **When** the sync runs, **Then** no events are created.

---

### User Story 5 - Home Page Card Redesign (Twitter/X Style) (Priority: P1)

The home page event feed cards are redesigned to follow a Twitter/X or Threads-like layout: compact text-first cards without hero images. Each card shows event type badge, title, description preview, date, countdown, and action buttons in a clean, vertical feed format.

**Why this priority**: The current card design relies on images which are often missing or low-quality SVG placeholders. A text-first design is cleaner, loads faster, and better suits the data-driven nature of astronomical events.

**Independent Test**: Load the home page, verify event cards render without images, show type badge with color, title, description, date, and countdown in a compact layout.

**Acceptance Scenarios**:

1. **Given** the home page loads with events, **When** the user views the feed, **Then** each card shows: colored type icon/badge, event title, truncated description (2 lines), relative date ("Em 3 dias"), and action buttons — all without any image.
2. **Given** a space weather event (solar flare, CME), **When** the card renders, **Then** the SpaceWeatherBadge shows intensity info inline.
3. **Given** the user is on mobile, **When** viewing the feed, **Then** cards stack vertically with appropriate padding and readable text.
4. **Given** the user scrolls, **When** reaching the bottom, **Then** infinite scroll loads more cards seamlessly.

---

### Edge Cases

- USNO API rate limiting or downtime — graceful fallback, log errors
- Stellarium showers.json format changes — validate structure before parsing
- NOAA SWPC returns empty or malformed Kp forecast — skip sync, log warning
- Duplicate events across sources (e.g., geomagnetic storm from DONKI + aurora from SWPC) — separate event types, no conflict
- Card rendering with very long event titles — truncate with ellipsis
- Card rendering with no description — show only title and metadata

## Requirements

### Functional Requirements

- **FR-001**: System MUST sync solar eclipse data from USNO API (`/api/eclipses/solar/year`) every 24h
- **FR-002**: System MUST sync lunar eclipse data from USNO API (`/api/eclipses/lunar/year`) every 24h
- **FR-003**: System MUST maintain a static meteor shower catalog with at least the 20 major showers (Quadrantids, Lyrids, Eta Aquariids, Perseids, Orionids, Leonids, Geminids, etc.)
- **FR-004**: System MUST create METEOR_SHOWER events for showers with peaks within the next 90 days
- **FR-005**: System MUST check NOAA SWPC Kp forecast every 3 hours
- **FR-006**: System MUST create AURORA events when forecast Kp >= 5
- **FR-007**: System MUST maintain a static catalog of planetary transits (Mercury 2032, 2039, 2049; Venus 2117, 2125)
- **FR-008**: System MUST maintain a static catalog of notable lunar occultations for the current year
- **FR-009**: Home page event feed cards MUST NOT require images
- **FR-010**: Home page cards MUST show type badge with color, title, description, date, and countdown
- **FR-011**: All new sync jobs MUST log to data_sync_logs table
- **FR-012**: All new events MUST use externalId+source deduplication
- **FR-013**: Relevance scores MUST be calculated for all new event types

### Key Entities

- **AstronomicalEvent**: Extended with new event types being populated by real data
- **DataSyncLog**: Existing entity, reused for new sync sources
- **MeteorShowerCatalog**: Static JSON data embedded in backend resources
- **TransitOccultationCatalog**: Static JSON data embedded in backend resources

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 6 event types (ECLIPSE_SOLAR, ECLIPSE_LUNAR, METEOR_SHOWER, AURORA, TRANSIT, OCCULTATION) have real data in the events table after sync
- **SC-002**: Home page loads without any image requests for event cards
- **SC-003**: Event feed renders in < 200ms on 3G connection (no image payloads)
- **SC-004**: Zero duplicate events after multiple sync runs (deduplication working)
- **SC-005**: Sync failures are logged with source, error message, and timestamp
