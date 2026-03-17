# Research: Real Astronomical Data Sources Integration

**Branch**: `002-real-astro-apis` | **Date**: 2026-03-13

## R1: NASA DONKI API — Space Weather Events

**Decision**: Use NASA DONKI for solar flares (FLR), coronal mass ejections (CME), and geomagnetic storms (GST).

**Rationale**: Free, well-documented, JSON REST API. Returns structured data with intensity classifications (classType for flares, kpIndex for storms). Already have NASA_API_KEY configured in docker-compose.

**Endpoints**:
- `GET https://api.nasa.gov/DONKI/FLR?startDate={}&endDate={}&api_key={key}` — Solar flares. Fields: `flrID`, `beginTime`, `peakTime`, `endTime`, `classType` (X/M/C/B), `sourceLocation`, `note`, `linkedEvents`
- `GET https://api.nasa.gov/DONKI/CME?startDate={}&endDate={}&api_key={key}` — CMEs. Fields: `activityID`, `startTime`, `note`, `cmeAnalyses[].speed`, `cmeAnalyses[].type`, `linkedEvents`
- `GET https://api.nasa.gov/DONKI/GST?startDate={}&endDate={}&api_key={key}` — Geomagnetic storms. Fields: `gstID`, `startTime`, `allKpIndex[].kpIndex` (0-9 scale), `linkedEvents`

**Rate limits**: DEMO_KEY = 30 req/hour, 50 req/day. Registered key = 1000 req/hour. We use registered key from env.

**Alternatives considered**: NOAA Space Weather API — less structured, harder to parse.

## R2: NASA APOD — Daily Highlight

**Decision**: Use NASA APOD for automatic daily astronomy highlight when no manual weekly highlight exists.

**Rationale**: Iconic, reliable, returns high-quality content daily. Simple single-object JSON response.

**Endpoint**: `GET https://api.nasa.gov/planetary/apod?api_key={key}`

**Response fields**: `date`, `title`, `explanation`, `url`, `hdurl`, `media_type` (image|video), `copyright`, `thumbnail_url`

**Rate limits**: Same as DONKI (shared NASA API key).

**Alternatives considered**: ESA Picture of the Week — less frequent (weekly), smaller catalog.

## R3: US Naval Observatory API — Moon Phase & Lunar Data

**Decision**: Use USNO API instead of Moon Phase API and AstronomyAPI for all lunar data.

**Rationale**: Completely free, NO authentication required, provides moon phase name, illumination percentage, moonrise/moonset, sun data — all in one call. Government-maintained, highly reliable.

**Endpoints**:
- `GET https://aa.usno.navy.mil/api/rstt/oneday?date={YYYY-MM-DD}&coords={lat},{lon}&tz={offset}` — Complete sun/moon data for a location. Returns: `closestphase.phase`, `fracillum` (illumination %), `moondata[]` (rise/set times), `sundata[]` (rise/set times), `curphase` (current phase name)
- `GET https://aa.usno.navy.mil/api/moon/phases/year?year={YYYY}` — All moon phases for a year. Returns: `phasedata[].phase`, `.day`, `.month`, `.year`, `.time`

**Rate limits**: No documented limits. Optional `id` param for tracking.

**Alternatives considered**:
- AstronomyAPI — requires paid Basic Auth, limited free tier
- Moon Phase API (moon-api.com) — connection refused during testing, unreliable
- Open-Meteo — no moon data, only sunrise/sunset
- IMCCE/SSP — too complex for simple moon data, better suited for ephemeris

## R4: IMCCE/OPALE — Eclipses and Phenomena (Deferred)

**Decision**: Defer OPALE/IMCCE integration to a future iteration. Use NASA DONKI + manual/curated events for eclipses initially.

**Rationale**: OPALE API documentation is sparse, endpoint formats are not well-documented for programmatic use. The IMCCE SSP ephemeris API works but returns complex positional data, not simple event data. Eclipse events are rare (2-4/year) and can be sourced from static calendars or NASA data.

**Alternatives considered**: Hard-code known eclipse dates for 2026-2027 — rejected per spec requirement of no seed data.

## R5: Relevance Score Calculation Strategy

**Decision**: Use event type base score + intensity modifier from API data.

**Score matrix**:
| Event Type | Base Score | Intensity Modifier |
|---|---|---|
| ECLIPSE_SOLAR | 90 | +5 if total |
| ECLIPSE_LUNAR | 85 | +10 if total |
| METEOR_SHOWER | 75 | +ZHR/10 (capped at +15) |
| CONJUNCTION | 80 | +5 if involves Venus/Jupiter |
| SUPERMOON | 70 | — |
| OPPOSITION | 75 | +5 for Saturn/Jupiter |
| SOLAR_FLARE | 50 | X-class: +40, M-class: +20, C-class: +5 |
| CME | 55 | +speed/100 (capped at +20) |
| GEOMAGNETIC_STORM | 60 | +kpIndex*5 (Kp7+=95) |
| OTHER | 40 | — |

## R6: Event Archival Strategy

**Decision**: Add ARCHIVED to EventStatus enum. Scheduled job runs daily, sets status=ARCHIVED for events with endAt < now() - 7 days.

**Rationale**: Clean separation between active and archived events. Frontend can filter by status. No data deletion.

## R7: Sync Schedule Design

**Decision**: Two separate scheduled jobs with different intervals.

- **AstroEventSyncJob** — every 6 hours — fetches DONKI (FLR, CME, GST) and syncs to astronomical_events table
- **ApodSyncJob** — every 24 hours (at 08:00 UTC) — fetches NASA APOD and stores as daily_highlight
- **EventArchivalJob** — every 24 hours (at 00:00 UTC) — archives expired events
- **Moon data** — fetched on-demand per request (cached 30 min in Redis) — no sync job needed

## R8: Data Model Changes

**Decision**: Extend existing AstronomicalEvent entity + add new DailyHighlight entity + add new DataSyncLog entity.

- `EventType` enum: add SOLAR_FLARE, CME, GEOMAGNETIC_STORM, AURORA, OCCULTATION
- `EventStatus` enum: add ARCHIVED
- `AstronomicalEvent`: add `externalId` field for deduplication (maps to DONKI activityID/flrID/gstID)
- New table: `daily_highlights` (id, date, title, explanation, image_url, hd_image_url, media_type, copyright, source, created_at)
- New table: `data_sync_logs` (id, source, started_at, completed_at, items_fetched, items_created, items_updated, error_message, status)
