# Quickstart: Real Astronomical Data Sources

**Branch**: `002-real-astro-apis` | **Date**: 2026-03-13

## Prerequisites

- Docker Desktop running (for PostgreSQL, Redis, MinIO)
- NASA API key (registered at https://api.nasa.gov — set `NASA_API_KEY` in `infra/docker-compose.yml`)
- Java 21 + Maven (backend)
- Node.js 20+ (frontend)

## Environment Setup

### 1. NASA API Key

Replace `DEMO_KEY` with a registered key in `infra/docker-compose.yml`:

```yaml
NASA_API_KEY: your-registered-nasa-api-key
```

The same key is used for both DONKI and APOD endpoints. DEMO_KEY has severe rate limits (30 req/hour, 50 req/day). Registered keys allow 1000 req/hour.

### 2. Start Infrastructure

```bash
cd infra
docker compose up -d postgres redis minio
```

### 3. Run Backend

```bash
cd backend
./mvnw spring-boot:run
```

Flyway runs migrations V16–V19 automatically on startup:
- V16: Add `external_id` column to `astronomical_events`
- V17: (enum expansion handled by Hibernate)
- V18: Create `daily_highlights` table
- V19: Create `data_sync_logs` table

### 4. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## Verify Integration

### NASA DONKI (Space Weather Events)

Events sync automatically every 6 hours. To trigger manually:

```bash
# Check if events were synced (after first scheduled run or manual trigger)
curl http://localhost:8080/api/v1/events | jq '.content[] | {title, type, source}'
```

Expected: Events with `type` in `SOLAR_FLARE`, `CME`, `GEOMAGNETIC_STORM` and `source` = `nasa_donki`.

### NASA APOD (Daily Highlight)

Syncs daily at 08:00 UTC. Verify:

```bash
curl http://localhost:8080/api/v1/highlights/today | jq '{title, date, mediaType}'
```

### USNO Moon Data

Fetched on-demand per location request (cached 30 min in Redis):

```bash
# Replace {locationId} with a valid location UUID
curl http://localhost:8080/api/v1/astro-conditions/location/{locationId} | jq '.moon'
```

Expected: `phase`, `illumination`, `rise`, `set`, `closestPhase` fields populated.

### Admin Sync Logs

```bash
# Requires admin JWT token
curl -H "Authorization: Bearer {admin-token}" \
  http://localhost:8080/api/v1/admin/sync-logs | jq '.content[0]'
```

### Archived Events

```bash
curl http://localhost:8080/api/v1/events/archived | jq '.content | length'
```

## External API Dependencies

| API | Auth | Rate Limits | Fallback |
|-----|------|-------------|----------|
| NASA DONKI | API key (query param) | 1000 req/hour (registered) | Graceful degradation — no events shown |
| NASA APOD | API key (query param) | Shared with DONKI | 204 No Content — hero section uses fallback |
| USNO | None required | No documented limits | Moon section hidden if unavailable |

## Key Configuration

All in `backend/src/main/resources/application.yml` under `app:`:

```yaml
app:
  nasa:
    api-key: ${NASA_API_KEY:}
    base-url: https://api.nasa.gov
```

USNO base URL (`https://aa.usno.navy.mil/api`) is configured in the USNO client class directly (no auth needed).

## Troubleshooting

- **No events appearing**: Check sync logs at `/api/v1/admin/sync-logs`. First sync runs 6h after startup or on next scheduled interval.
- **429 from NASA**: Rate limited. Wait or use a registered API key instead of DEMO_KEY.
- **Moon data missing**: USNO API may be temporarily unavailable. Check backend logs for connection errors. Data is transient (not persisted), so it will recover on next request.
- **Redis cache stale**: Moon data cached for 30 min. Clear with `redis-cli FLUSHDB` if needed during development.
