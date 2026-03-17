# Feature Specification: Real Astronomical Data Sources Integration

**Feature Branch**: `002-real-astro-apis`
**Created**: 2026-03-13
**Status**: Draft
**Input**: User description: "Phase 16: Real Astronomical Data Sources Integration — Remove all hardcoded/seed data and integrate real astronomical APIs for live data."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Real Astronomical Events (Priority: P1)

As a visitor or authenticated user, I want to see real upcoming astronomical events on the home page and events list — sourced from live scientific databases — so that I can plan observations based on accurate, current data rather than static placeholder content.

**Why this priority**: Without real event data, the application has no core content. This is the foundational data layer that everything else depends on.

**Independent Test**: Can be tested by opening the home page and events list and verifying that events are real, current, sourced from external APIs, and update over time without manual intervention.

**Acceptance Scenarios**:

1. **Given** the system is running with no seed data, **When** a user visits the home page, **Then** they see real astronomical events fetched from external scientific APIs.
2. **Given** the scheduled data sync has run, **When** a user views the events list, **Then** events display with accurate dates, descriptions, and source attribution.
3. **Given** an external API is temporarily unavailable, **When** the sync job runs, **Then** the system continues serving previously fetched data and retries on the next cycle without crashing or showing errors to users.
4. **Given** a new astronomical event is published by an external source, **When** the next sync cycle completes, **Then** the event appears in the application within the sync interval.

---

### User Story 2 - View Live Moon Phase and Sky Conditions (Priority: P2)

As an authenticated user, I want to see the current moon phase, illumination, and sky conditions for my preferred city on the home page, so I can quickly assess whether tonight is good for stargazing.

**Why this priority**: Moon phase and sky conditions are the most frequently checked data points for amateur astronomers and directly enhance the home page experience.

**Independent Test**: Can be tested by checking the AstroConditions banner on the home page and verifying it shows real-time lunar data (current phase name, illumination percentage) alongside weather-based visibility for the user's preferred city.

**Acceptance Scenarios**:

1. **Given** an authenticated user with Fortaleza as preferred city, **When** they visit the home page, **Then** the AstroConditions banner shows moon phase, illumination, and sky conditions specific to Fortaleza.
2. **Given** a non-authenticated visitor, **When** they visit the home page, **Then** they see moon phase and conditions for the default city (Sao Paulo).
3. **Given** the moon phase API is unavailable, **When** a user visits the home page, **Then** the banner shows available weather data and gracefully hides the moon section.

---

### User Story 3 - Discover Daily Astronomy Highlights (Priority: P3)

As a user, I want to see an inspiring astronomy-related image or highlight on the home page each day, so that I stay engaged and learn something new about the cosmos regularly.

**Why this priority**: Daily highlights (e.g., NASA's Astronomy Picture of the Day) add editorial richness and engagement. When no manual editorial highlight exists, the system should automatically provide content.

**Independent Test**: Can be tested by visiting the home page when no manual weekly highlight exists and verifying that an automatically sourced daily astronomy image/highlight is displayed.

**Acceptance Scenarios**:

1. **Given** no manual weekly highlight is configured, **When** a user visits the home page, **Then** they see the current day's astronomy picture with its title and description.
2. **Given** a manual weekly highlight exists, **When** a user visits the home page, **Then** the manual highlight takes precedence over the automatic daily content.
3. **Given** the daily highlight API is unavailable, **When** a user visits the home page, **Then** the hero section shows a graceful fallback (e.g., the most recent cached highlight or a generic astronomy banner).

---

### User Story 4 - View Space Weather Alerts (Priority: P3)

As an astronomy enthusiast, I want to see active space weather events (solar flares, geomagnetic storms, coronal mass ejections) so I can know about aurora possibilities and understand current solar activity.

**Why this priority**: Space weather data adds a unique, real-time dimension that differentiates the platform. Solar activity data helps users understand sky conditions beyond local weather.

**Independent Test**: Can be tested by checking events list for space weather events when solar activity is occurring, and verifying that event types like solar flares and geomagnetic storms are displayed with proper categorization.

**Acceptance Scenarios**:

1. **Given** a solar flare has been reported by NASA DONKI, **When** the sync job runs, **Then** the event appears in the events list with type SOLAR_FLARE and relevant details.
2. **Given** a geomagnetic storm is active, **When** a user views events, **Then** they see the storm event with intensity classification and estimated duration.
3. **Given** no active space weather events exist, **When** a user views the events list, **Then** no space weather events are shown (no placeholder or fake data).

---

### Edge Cases

- What happens when all external APIs are simultaneously unavailable? The system serves cached data and shows a subtle indicator that data may not be current.
- What happens when an external API returns malformed data? The sync job logs the error, skips the malformed entry, and continues processing remaining data.
- What happens when duplicate events are returned across multiple APIs? The system deduplicates based on event type and date range, preferring the most detailed source.
- What happens when an API rate limit is exceeded? The system backs off and retries on the next scheduled cycle.
- What happens when a previously synced event is removed from the source API? The event remains in the system but is not re-created if manually deleted by an admin.

## Requirements *(mandatory)*

### Functional Requirements

**Data Ingestion & Sync**

- **FR-001**: System MUST periodically fetch astronomical event data from multiple external scientific APIs.
- **FR-002**: System MUST map external event data to internal event categories including: ECLIPSE_LUNAR, ECLIPSE_SOLAR, METEOR_SHOWER, CONJUNCTION, SUPERMOON, OPPOSITION, SOLAR_FLARE, CME, GEOMAGNETIC_STORM, AURORA, and OTHER.
- **FR-003**: System MUST store fetched events with a source identifier tracking which API provided the data.
- **FR-003a**: System MUST automatically assign relevance scores to API-sourced events based on event type combined with magnitude/intensity data from the source API (e.g., X-class solar flare=95, C-class=50; total eclipse=95, partial=75; major meteor shower peak=85). When no intensity data is available, a default score per event type is used.
- **FR-004**: System MUST deduplicate events when the same phenomenon is reported by multiple sources, based on event type and overlapping date ranges.
- **FR-005**: System MUST sync data at configurable intervals (default: every 6 hours for astronomical events, every 1 hour for space weather).
- **FR-005a**: System MUST auto-publish all API-sourced events immediately (status = PUBLISHED) without requiring admin review, since data originates from trusted scientific sources.
- **FR-006**: System MUST handle API failures gracefully — logging errors without disrupting user-facing functionality, and retrying on subsequent sync cycles.

**Moon Phase & Sky Conditions**

- **FR-007**: System MUST provide real-time moon phase data (phase name, illumination percentage, moonrise/moonset times) for any given location.
- **FR-008**: System MUST display moon phase data in the AstroConditions banner on the home page, personalized to the user's preferred city.

**Daily Highlights**

- **FR-009**: System MUST fetch a daily astronomy highlight (image, title, description) from an external source.
- **FR-010**: System MUST use the daily external highlight as the hero content when no manual weekly highlight is configured.
- **FR-011**: Manual editorial highlights MUST take precedence over automatically sourced highlights.

**Location Data**

- **FR-012**: System MUST NOT rely on pre-loaded seed data for cities or locations. City search MUST use external geocoding services.
- **FR-013**: System MUST cache location data from external geocoding lookups to minimize redundant API calls.

**Configuration & Resilience**

- **FR-014**: All external API credentials and keys MUST be configurable via environment variables.
- **FR-015**: System MUST continue operating with cached/previously fetched data when external APIs are unavailable.
- **FR-016**: System MUST log all sync activities including successes, failures, and data counts for observability.

**Event Types**

- **FR-017**: System MUST support the following event type categories: ECLIPSE_LUNAR, ECLIPSE_SOLAR, METEOR_SHOWER, CONJUNCTION, SUPERMOON, OPPOSITION, SOLAR_FLARE, CME, GEOMAGNETIC_STORM, AURORA, OCCULTATION, TRANSIT, and OTHER.
- **FR-018**: System MUST automatically archive events (status = ARCHIVED) when they are more than 7 days past their end date. Archived events MUST be retained in the database and accessible via a past events view, but excluded from active event listings.

### Key Entities

- **AstronomicalEvent**: Represents a sky event with type, date range, description, relevance score (auto-calculated from type + magnitude/intensity), source API identifier, and publication status. Extended with new space weather types.
- **MoonPhaseData**: Current lunar data including phase name, illumination percentage, moonrise/moonset times, and location reference. Transient data refreshed per-request or short-cached.
- **DailyHighlight**: An astronomy image/content of the day with title, description, image URL, and date. One entry per day, sourced from external API.
- **DataSyncLog**: Record of each sync job execution including source API, timestamp, items fetched, items created/updated, and any errors encountered.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Home page displays real astronomical events within 5 minutes of the system starting for the first time (initial sync completes quickly).
- **SC-002**: 100% of displayed astronomical events originate from external scientific sources — zero hardcoded or seed data.
- **SC-003**: The AstroConditions banner shows accurate moon phase data (phase name and illumination) matching real-time lunar conditions for the user's location.
- **SC-004**: When no manual weekly highlight exists, the home page hero section displays a current daily astronomy highlight sourced automatically.
- **SC-005**: System continues serving the home page and events list without errors when any single external API is completely offline for 24+ hours.
- **SC-006**: Space weather events (solar flares, geomagnetic storms) appear in the events list within 2 hours of being reported by their source.
- **SC-007**: Event data stays current — no event older than 7 days past its end date appears in the active events list (automatically archived). Archived events remain accessible in a past events view.

## Clarifications

### Session 2026-03-13

- Q: How should relevance scores be assigned to API-sourced events? → A: Based on event type + magnitude/intensity data from the API when available (e.g., X-class solar flare=95, C-class=50; total eclipse=95, partial=75).
- Q: Should API-sourced events be auto-published or require admin review? → A: Auto-publish all API-sourced events immediately (status = PUBLISHED). Trusted scientific sources do not need manual approval.
- Q: What happens to events older than 7 days past their end date? → A: Change status to ARCHIVED; keep in DB but exclude from active listings. Users can browse past/archived events separately.

## Assumptions

- NASA API keys (DEMO_KEY for development, production key for deployment) are available and will be configured via environment variables.
- AstronomyAPI free tier provides sufficient quota for the application's needs (moon phase and planet position queries).
- External APIs maintain their current response formats; breaking changes are handled as maintenance tasks.
- The application's sync schedule is sufficient to keep data reasonably current without exceeding API rate limits.
- Moon Phase API or equivalent provides free access for real-time lunar data queries.
- OPALE/IMCCE API is publicly accessible without authentication for astronomical phenomena queries.

## Scope Boundaries

**In Scope**:
- Backend scheduled jobs for periodic data fetching from 5 external APIs
- Event type expansion to include space weather categories
- Moon phase data in AstroConditions banner
- NASA APOD as automatic daily highlight fallback
- Removal of all seed event and location data
- Deduplication logic for multi-source events

**Out of Scope**:
- Real-time push notifications for astronomical events
- User-customizable sync schedules
- Integration with paid/premium API tiers
- Telescope or camera equipment integration
- Social media auto-posting of events
- Mobile push notifications for space weather alerts
