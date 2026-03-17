# Data Model: SkyWatch Insights — MVP Completo

**Date**: 2026-03-09
**Branch**: `001-mvp-complete`

## Entity Relationship Overview

```text
User 1──N Favorite N──1 AstronomicalEvent
User 1──N ObservationLog N──1 AstronomicalEvent
User 1──N SocialExportJob N──1 AstronomicalEvent
AstronomicalEvent 1──N VisibilityForecast N──1 Location
AstronomicalEvent 0──1 EventHighlight (ativo por janela)
SocialExportJob N──1 SocialExportTemplate
User N──1 Location (preferredCity)
```

## Entities

### User

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| name | String(100) | NOT NULL | |
| email | String(255) | NOT NULL, UNIQUE | |
| passwordHash | String(255) | NOT NULL | bcrypt |
| role | Enum(USER, ADMIN) | NOT NULL, DEFAULT USER | |
| timezone | String(50) | NOT NULL | IANA timezone ID |
| preferredCityId | UUID | FK → Location.id, NULLABLE | Set during onboarding |
| astronomicalInterests | String[] | NULLABLE | Array of interest tags |
| language | String(5) | DEFAULT 'pt-BR' | |
| theme | Enum(LIGHT, DARK, SYSTEM) | DEFAULT SYSTEM | |
| createdAt | Timestamp | NOT NULL | |
| updatedAt | Timestamp | NOT NULL | |

**Validation**: email must be valid format; password min 8 chars before hashing; name min 2 chars.

### Location

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| name | String(200) | NOT NULL | City/region display name |
| latitude | Decimal(9,6) | NOT NULL | |
| longitude | Decimal(9,6) | NOT NULL | |
| countryCode | String(2) | NOT NULL | ISO 3166-1 alpha-2 |
| timezone | String(50) | NOT NULL | IANA timezone ID |
| createdAt | Timestamp | NOT NULL | |

**Validation**: latitude -90 to 90; longitude -180 to 180; countryCode 2 uppercase letters.

### AstronomicalEvent

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| slug | String(200) | NOT NULL, UNIQUE | URL-friendly identifier |
| title | String(300) | NOT NULL | |
| type | Enum(ECLIPSE_SOLAR, ECLIPSE_LUNAR, METEOR_SHOWER, CONJUNCTION, OPPOSITION, TRANSIT, SUPERMOON, COMET, OTHER) | NOT NULL | |
| description | Text | NOT NULL | Rich description |
| startAt | Timestamp | NOT NULL | Event window start |
| endAt | Timestamp | NOT NULL | Event window end |
| relevanceScore | Integer(1-100) | NOT NULL | Editorial/calculated importance |
| status | Enum(DRAFT, PUBLISHED, HIDDEN, EXPIRED) | NOT NULL, DEFAULT DRAFT | BR-01: period + visible status |
| source | String(100) | NULLABLE | Origin: 'manual', 'nasa-api', etc. |
| imageUrl | String(500) | NULLABLE | Cover/hero image URL |
| createdAt | Timestamp | NOT NULL | |
| updatedAt | Timestamp | NOT NULL | |
| updatedBy | UUID | FK → User.id, NULLABLE | Audit: BR-07 traceability |

**Validation**: endAt must be after startAt; slug must match `[a-z0-9-]+`; relevanceScore 1-100.
**State transitions**: DRAFT → PUBLISHED → HIDDEN | EXPIRED. HIDDEN preserves linked data (BR-07).

### VisibilityForecast

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| eventId | UUID | FK → AstronomicalEvent.id, NOT NULL | |
| locationId | UUID | FK → Location.id, NOT NULL | |
| bestWindowStart | Timestamp | NOT NULL | Optimal viewing start |
| bestWindowEnd | Timestamp | NOT NULL | Optimal viewing end |
| observabilityScore | Integer(0-100) | NOT NULL | Composite score |
| cloudCoverage | Integer(0-100) | NULLABLE | % cloud cover |
| humidity | Integer(0-100) | NULLABLE | % humidity |
| visibility | Integer | NULLABLE | Meters visibility |
| weatherSummary | String(500) | NULLABLE | Human-readable weather summary |
| calculatedAt | Timestamp | NOT NULL | When score was last calculated |
| createdAt | Timestamp | NOT NULL | |

**Validation**: bestWindowEnd after bestWindowStart; scores 0-100.
**Unique constraint**: (eventId, locationId) — one forecast per event per location.
**Recalculation**: BR-02 — must recalculate when weather, event, or location data changes.

### Favorite

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| userId | UUID | FK → User.id, NOT NULL | |
| eventId | UUID | FK → AstronomicalEvent.id, NOT NULL | |
| createdAt | Timestamp | NOT NULL | |

**Unique constraint**: (userId, eventId) — one favorite per user per event.

### ObservationLog

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| userId | UUID | FK → User.id, NOT NULL | |
| eventId | UUID | FK → AstronomicalEvent.id, NULLABLE | Optional link to event |
| observedAt | Timestamp | NOT NULL | When observation occurred |
| locationName | String(200) | NULLABLE | Free-text location |
| latitude | Decimal(9,6) | NULLABLE | |
| longitude | Decimal(9,6) | NULLABLE | |
| notes | Text | NULLABLE | User notes |
| outcome | Enum(EXCELLENT, GOOD, FAIR, POOR, CLOUDED_OUT) | NULLABLE | Observation quality |
| mediaUrl | String(500) | NULLABLE | Photo/media URL in bucket |
| createdAt | Timestamp | NOT NULL | |

### SocialExportTemplate

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| network | Enum(INSTAGRAM_STORY, INSTAGRAM_REELS, INSTAGRAM_FEED, THREADS, X, LINKEDIN) | NOT NULL | |
| format | String(50) | NOT NULL | e.g., 'story-9x16', 'thread-short', 'linkedin-deep-dive' |
| objective | Enum(ENGAGEMENT, EDUCATION, AUTHORITY) | NOT NULL | Copy tone |
| layoutVersion | String(20) | NOT NULL | Template version for parametrization |
| textTemplate | Text | NOT NULL | Template with {placeholders} |
| characterLimit | Integer | NULLABLE | Platform character limit |
| isActive | Boolean | NOT NULL, DEFAULT true | |
| createdAt | Timestamp | NOT NULL | |
| updatedAt | Timestamp | NOT NULL | |

**Unique constraint**: (network, format, objective, layoutVersion) — one template per combination.
**Parametrization**: FR-034 — limits and templates must be updatable without redeploy.

### SocialExportJob

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| userId | UUID | FK → User.id, NOT NULL | |
| eventId | UUID | FK → AstronomicalEvent.id, NOT NULL | |
| templateId | UUID | FK → SocialExportTemplate.id, NOT NULL | |
| network | Enum(...) | NOT NULL | Denormalized for query performance |
| format | String(50) | NOT NULL | Denormalized |
| objective | Enum(ENGAGEMENT, EDUCATION, AUTHORITY) | NOT NULL | |
| status | Enum(PENDING, PROCESSING, COMPLETED, FAILED) | NOT NULL, DEFAULT PENDING | |
| outputImageUrl | String(500) | NULLABLE | Generated art URL in bucket |
| outputTextContent | Text | NULLABLE | Generated text content |
| outputBundlePath | String(500) | NULLABLE | Bundle directory in bucket |
| errorMessage | String(500) | NULLABLE | Error details if FAILED |
| createdAt | Timestamp | NOT NULL | BR-04: audit trail |
| completedAt | Timestamp | NULLABLE | |

**Audit**: BR-04 — every export records date, user, event, network, and template.

### EventHighlight

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| eventId | UUID | FK → AstronomicalEvent.id, NOT NULL | |
| type | Enum(WEEKLY, FEATURED, SPECIAL) | NOT NULL | |
| startDate | Date | NOT NULL | Highlight window start |
| endDate | Date | NOT NULL | Highlight window end |
| editorialNote | Text | NULLABLE | Admin note |
| createdBy | UUID | FK → User.id, NOT NULL | Admin who created highlight |
| createdAt | Timestamp | NOT NULL | |

**Business rule**: BR-03 — only one active WEEKLY highlight per time window. Can be auto-generated or manually overridden.

### AnalyticsEvent (for tracking)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| userId | UUID | FK → User.id, NULLABLE | Anonymous tracking allowed |
| action | Enum(VIEW_EVENT, CLICK_EXPORT, DOWNLOAD_BUNDLE, VIEW_DASHBOARD) | NOT NULL | |
| targetType | String(50) | NOT NULL | e.g., 'event', 'export' |
| targetId | UUID | NULLABLE | |
| metadata | JSONB | NULLABLE | Additional context |
| createdAt | Timestamp | NOT NULL | |

## Migration Order

1. `V1__create_locations.sql`
2. `V2__create_users.sql`
3. `V3__create_astronomical_events.sql`
4. `V4__create_visibility_forecasts.sql`
5. `V5__create_favorites.sql`
6. `V6__create_observation_logs.sql`
7. `V7__create_social_export_templates.sql`
8. `V8__create_social_export_jobs.sql`
9. `V9__create_event_highlights.sql`
10. `V10__create_analytics_events.sql`
11. `V11__seed_default_templates.sql` — Insert default export templates for all network+format+objective combinations
12. `V12__seed_sample_locations.sql` — Insert major Brazilian cities for onboarding
