# Data Model: Real Astronomical Data Sources

**Branch**: `002-real-astro-apis` | **Date**: 2026-03-13

## Modified Entities

### AstronomicalEvent (modified)

Existing entity — extended with new fields and enum values.

**New fields**:
- `external_id` VARCHAR(200) NULLABLE — External API identifier for deduplication (DONKI activityID/flrID/gstID). Unique constraint with source.

**EventType enum additions**:
- `SOLAR_FLARE` — Solar flare events (from NASA DONKI FLR)
- `CME` — Coronal mass ejection events (from NASA DONKI CME)
- `GEOMAGNETIC_STORM` — Geomagnetic storms (from NASA DONKI GST)
- `AURORA` — Aurora events (derived from high Kp index storms)
- `OCCULTATION` — Occultation events (future API support)

**EventStatus enum additions**:
- `ARCHIVED` — Event past end date + 7 days. Retained in DB, excluded from active listings.

**Deduplication**: Unique constraint on (external_id, source) prevents duplicate imports.

### Location (unchanged)

No changes. City search already uses external geocoding (CitySearchController with Nominatim/ViaCEP fallback).

## New Entities

### DailyHighlight

Stores NASA APOD data for the hero section fallback.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| date | DATE | UNIQUE, NOT NULL | The highlight date (one per day) |
| title | VARCHAR(500) | NOT NULL | Image/content title |
| explanation | TEXT | NOT NULL | Description text |
| image_url | VARCHAR(1000) | NOT NULL | Standard resolution URL |
| hd_image_url | VARCHAR(1000) | NULLABLE | High-resolution URL |
| media_type | VARCHAR(20) | NOT NULL | "image" or "video" |
| copyright | VARCHAR(300) | NULLABLE | Attribution (null = NASA public domain) |
| source | VARCHAR(50) | NOT NULL DEFAULT 'nasa_apod' | Source API identifier |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

### DataSyncLog

Tracks each sync job execution for observability.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| source | VARCHAR(50) | NOT NULL | API source (nasa_donki, nasa_apod) |
| sync_type | VARCHAR(50) | NOT NULL | Job type (SPACE_WEATHER, APOD, ARCHIVAL) |
| started_at | TIMESTAMP | NOT NULL | Job start time |
| completed_at | TIMESTAMP | NULLABLE | Job completion time |
| items_fetched | INT | NOT NULL DEFAULT 0 | Items received from API |
| items_created | INT | NOT NULL DEFAULT 0 | New events created |
| items_updated | INT | NOT NULL DEFAULT 0 | Existing events updated |
| error_message | TEXT | NULLABLE | Error details if failed |
| status | VARCHAR(20) | NOT NULL | SUCCESS, FAILED, PARTIAL |
| created_at | TIMESTAMP | NOT NULL | Record creation time |

## State Transitions

### AstronomicalEvent Status Flow

```
API Sync → PUBLISHED (auto-published from trusted sources)
                ↓
         [7 days past endAt]
                ↓
           ARCHIVED (retained, browsable in past events)

Admin can also: PUBLISHED → HIDDEN (manually hide an event)
                HIDDEN → PUBLISHED (restore)
```

### DataSyncLog Status Flow

```
Job starts → status = (pending, logged at started_at)
     ↓
Success → status = SUCCESS (completed_at set, counts populated)
Error   → status = FAILED (error_message set)
Partial → status = PARTIAL (some items succeeded, error_message has details)
```

## Migrations Required

- `V16__add_event_external_id.sql` — Add external_id column to astronomical_events, unique constraint on (external_id, source)
- `V17__add_event_types_and_status.sql` — Handled via Java enum expansion (Hibernate auto-validates)
- `V18__create_daily_highlights.sql` — Create daily_highlights table
- `V19__create_data_sync_logs.sql` — Create data_sync_logs table
