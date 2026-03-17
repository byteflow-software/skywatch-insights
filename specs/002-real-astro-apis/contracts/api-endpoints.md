# API Contracts: Real Astronomical Data Sources

**Branch**: `002-real-astro-apis` | **Date**: 2026-03-13

## Modified Endpoints

### GET /api/v1/astro-conditions/location/{locationId}

**Change**: Add `moon` section to the existing response with real-time lunar data from USNO API.

**Response** (additions only):
```json
{
  "location": { "..." },
  "conditions": { "..." },
  "sun": { "..." },
  "weather": { "..." },
  "moon": {
    "phase": "Waning Crescent",
    "illumination": 29,
    "rise": "00:57",
    "set": "13:38",
    "closestPhase": {
      "name": "Last Quarter",
      "date": "2026-03-11"
    }
  }
}
```

### GET /api/v1/events

**Change**: Now returns API-sourced events with new event types. Add `type` filter support for new types.

**New query params**:
- `status` — Filter by PUBLISHED (default), ARCHIVED, etc.

**Response**: Unchanged structure, but `type` field now includes: SOLAR_FLARE, CME, GEOMAGNETIC_STORM, AURORA, OCCULTATION in addition to existing types.

## New Endpoints

### GET /api/v1/highlights/today

Returns today's daily highlight (NASA APOD) for the hero section fallback.

**Auth**: Public (no authentication required)

**Response** (200):
```json
{
  "date": "2026-03-13",
  "title": "NGC 1055 Close Up",
  "explanation": "Big, beautiful spiral galaxy NGC 1055...",
  "imageUrl": "https://apod.nasa.gov/apod/image/2603/...",
  "hdImageUrl": "https://apod.nasa.gov/apod/image/2603/...full.jpg",
  "mediaType": "image",
  "copyright": "Processing: Mark Hanson"
}
```

**Response** (204): No highlight available for today.

### GET /api/v1/events/archived

Returns past/archived events for the past events view.

**Auth**: Public

**Query params**: `page` (default 0), `size` (default 20), `type` (optional filter)

**Response** (200):
```json
{
  "content": [
    {
      "id": "uuid",
      "slug": "eclipse-lunar-total-2026-03",
      "title": "Eclipse Lunar Total",
      "type": "ECLIPSE_LUNAR",
      "description": "...",
      "startAt": "2026-03-28T02:00:00Z",
      "endAt": "2026-03-28T06:30:00Z",
      "relevanceScore": 95,
      "status": "ARCHIVED",
      "source": "nasa_donki",
      "imageUrl": null
    }
  ],
  "totalPages": 1,
  "totalElements": 5,
  "number": 0,
  "size": 20
}
```

### GET /api/v1/admin/sync-logs

Returns recent data sync logs for admin observability.

**Auth**: ADMIN role required

**Query params**: `page` (default 0), `size` (default 20), `source` (optional filter)

**Response** (200):
```json
{
  "content": [
    {
      "id": "uuid",
      "source": "nasa_donki",
      "syncType": "SPACE_WEATHER",
      "startedAt": "2026-03-13T06:00:00Z",
      "completedAt": "2026-03-13T06:00:03Z",
      "itemsFetched": 12,
      "itemsCreated": 3,
      "itemsUpdated": 0,
      "errorMessage": null,
      "status": "SUCCESS"
    }
  ],
  "totalPages": 1,
  "totalElements": 10,
  "number": 0,
  "size": 20
}
```

## External API Integration Contracts

### NASA DONKI Client

**Base URL**: `https://api.nasa.gov/DONKI`

| Internal Method | External Endpoint | Params | Maps To |
|---|---|---|---|
| fetchSolarFlares(from, to) | GET /FLR | startDate, endDate, api_key | SOLAR_FLARE events |
| fetchCMEs(from, to) | GET /CME | startDate, endDate, api_key | CME events |
| fetchGeomagneticStorms(from, to) | GET /GST | startDate, endDate, api_key | GEOMAGNETIC_STORM events |

### NASA APOD Client

**Base URL**: `https://api.nasa.gov/planetary`

| Internal Method | External Endpoint | Params | Maps To |
|---|---|---|---|
| fetchToday() | GET /apod | api_key | DailyHighlight entity |

### USNO Moon Client

**Base URL**: `https://aa.usno.navy.mil/api`

| Internal Method | External Endpoint | Params | Maps To |
|---|---|---|---|
| getMoonData(lat, lon, tz) | GET /rstt/oneday | date, coords, tz | MoonPhaseDTO (transient) |
| getYearPhases(year) | GET /moon/phases/year | year | List of phase dates |
