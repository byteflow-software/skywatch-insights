# API Contracts: SkyWatch Insights — MVP

**Date**: 2026-03-09
**Base URL**: `/api/v1`
**Auth**: JWT Bearer token (except public endpoints)
**Content-Type**: `application/json`

## Authentication

### POST /auth/register

Register a new user account.

**Request**:
```json
{
  "name": "string (2-100 chars, required)",
  "email": "string (valid email, required)",
  "password": "string (min 8 chars, required)"
}
```

**Response 201**:
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "role": "USER",
  "createdAt": "ISO8601"
}
```

**Errors**: 400 (validation), 409 (email already exists)

### POST /auth/login

Authenticate and receive tokens.

**Request**:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response 200**:
```json
{
  "accessToken": "string (JWT, 15min TTL)",
  "refreshToken": "string (7d TTL)",
  "expiresIn": 900
}
```

**Errors**: 401 (invalid credentials)

### POST /auth/refresh

Renew access token using refresh token.

**Request**:
```json
{
  "refreshToken": "string (required)"
}
```

**Response 200**: Same as login response.

**Errors**: 401 (invalid/expired refresh token)

### POST /auth/logout

Invalidate current session.

**Headers**: `Authorization: Bearer <accessToken>`

**Response 204**: No content.

---

## User Profile

### GET /me

Get authenticated user profile.

**Headers**: `Authorization: Bearer <accessToken>`

**Response 200**:
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "role": "USER | ADMIN",
  "timezone": "string | null",
  "preferredCity": {
    "id": "uuid",
    "name": "string",
    "countryCode": "string"
  } | null,
  "astronomicalInterests": ["string"],
  "language": "string",
  "theme": "LIGHT | DARK | SYSTEM",
  "createdAt": "ISO8601"
}
```

### PATCH /me/preferences

Update user preferences (onboarding + settings).

**Headers**: `Authorization: Bearer <accessToken>`

**Request** (all fields optional):
```json
{
  "preferredCityId": "uuid",
  "timezone": "string (IANA)",
  "astronomicalInterests": ["string"],
  "language": "string",
  "theme": "LIGHT | DARK | SYSTEM"
}
```

**Response 200**: Updated user profile (same as GET /me).

**Errors**: 400 (validation), 404 (city not found)

---

## Locations

### GET /locations

Search locations for onboarding city selector.

**Query params**: `?q=string&limit=10`

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "countryCode": "string",
      "timezone": "string"
    }
  ]
}
```

---

## Events

### GET /events

List astronomical events with filters.

**Query params**:
- `type`: Event type enum (optional, comma-separated for multiple)
- `from`: ISO8601 date (optional)
- `to`: ISO8601 date (optional)
- `cityId`: UUID (optional, filter by visibility for city)
- `status`: PUBLISHED (default for non-admin)
- `sort`: `startAt` (default) | `relevanceScore`
- `page`: integer (default 0)
- `size`: integer (default 20, max 100)

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "string",
      "title": "string",
      "type": "string",
      "description": "string (truncated to 200 chars)",
      "startAt": "ISO8601",
      "endAt": "ISO8601",
      "relevanceScore": 85,
      "status": "PUBLISHED",
      "imageUrl": "string | null",
      "isFavorited": true | false
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 42,
  "totalPages": 3
}
```

### GET /events/:slug

Get event detail by slug.

**Response 200**:
```json
{
  "id": "uuid",
  "slug": "string",
  "title": "string",
  "type": "string",
  "description": "string (full)",
  "startAt": "ISO8601",
  "endAt": "ISO8601",
  "relevanceScore": 85,
  "status": "PUBLISHED",
  "source": "string | null",
  "imageUrl": "string | null",
  "isFavorited": true | false,
  "forecast": {
    "observabilityScore": 78,
    "bestWindowStart": "ISO8601",
    "bestWindowEnd": "ISO8601",
    "weatherSummary": "string",
    "calculatedAt": "ISO8601"
  } | null
}
```

**Errors**: 404 (event not found)

### GET /events/:id/forecast

Get detailed forecast for event + user's preferred city.

**Response 200**:
```json
{
  "eventId": "uuid",
  "location": {
    "id": "uuid",
    "name": "string"
  },
  "observabilityScore": 78,
  "bestWindowStart": "ISO8601",
  "bestWindowEnd": "ISO8601",
  "cloudCoverage": 25,
  "humidity": 60,
  "visibility": 10000,
  "weatherSummary": "string",
  "calculatedAt": "ISO8601"
}
```

**Errors**: 404 (event or location not found), 503 (weather data unavailable — returns partial with flag)

---

## Favorites

### POST /events/:id/favorite

Add event to favorites.

**Response 201**:
```json
{
  "id": "uuid",
  "eventId": "uuid",
  "createdAt": "ISO8601"
}
```

**Errors**: 404 (event not found), 409 (already favorited)

### DELETE /events/:id/favorite

Remove event from favorites.

**Response 204**: No content.

**Errors**: 404 (not favorited)

### GET /favorites

List user's favorited events.

**Query params**: `page`, `size`

**Response 200**: Same structure as GET /events, filtered to user's favorites.

---

## Highlights

### GET /highlights/week

Get current week's highlighted event.

**Response 200**:
```json
{
  "highlight": {
    "id": "uuid",
    "type": "WEEKLY",
    "editorialNote": "string | null",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD"
  },
  "event": { ... }  // Full event detail (same as GET /events/:slug)
}
```

**Response 204**: No highlight for current week.

---

## Social Export

### POST /exports

Request generation of a social export package.

**Request**:
```json
{
  "eventId": "uuid (required)",
  "network": "INSTAGRAM_STORY | INSTAGRAM_REELS | INSTAGRAM_FEED | THREADS | X | LINKEDIN (required)",
  "format": "string (required, e.g., 'story-9x16', 'thread-short')",
  "objective": "ENGAGEMENT | EDUCATION | AUTHORITY (default ENGAGEMENT)"
}
```

**Response 202**:
```json
{
  "id": "uuid",
  "status": "PENDING",
  "createdAt": "ISO8601"
}
```

**Errors**: 400 (validation), 404 (event/template not found)

### GET /exports/:id

Get export job status and results.

**Response 200**:
```json
{
  "id": "uuid",
  "eventId": "uuid",
  "network": "string",
  "format": "string",
  "objective": "string",
  "status": "PENDING | PROCESSING | COMPLETED | FAILED",
  "outputImageUrl": "string | null",
  "outputTextContent": "string | null",
  "outputBundlePath": "string | null",
  "errorMessage": "string | null",
  "createdAt": "ISO8601",
  "completedAt": "ISO8601 | null"
}
```

### GET /exports

List user's export history.

**Query params**: `eventId` (optional), `network` (optional), `page`, `size`

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "eventId": "uuid",
      "eventTitle": "string",
      "network": "string",
      "format": "string",
      "objective": "string",
      "status": "string",
      "outputImageUrl": "string | null",
      "createdAt": "ISO8601"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 15,
  "totalPages": 1
}
```

### GET /exports/templates

List available export templates (for UI selection).

**Query params**: `network` (optional)

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "network": "string",
      "format": "string",
      "objective": "string",
      "characterLimit": 280 | null
    }
  ]
}
```

---

## Observations

### POST /observations

Create an observation log entry.

**Request** (multipart/form-data for media upload):
```json
{
  "eventId": "uuid (optional)",
  "observedAt": "ISO8601 (required)",
  "locationName": "string (optional)",
  "latitude": "decimal (optional)",
  "longitude": "decimal (optional)",
  "notes": "string (optional)",
  "outcome": "EXCELLENT | GOOD | FAIR | POOR | CLOUDED_OUT (optional)",
  "media": "file (optional, max 10MB, jpg/png/webp)"
}
```

**Response 201**:
```json
{
  "id": "uuid",
  "eventId": "uuid | null",
  "observedAt": "ISO8601",
  "locationName": "string | null",
  "notes": "string | null",
  "outcome": "string | null",
  "mediaUrl": "string | null",
  "createdAt": "ISO8601"
}
```

### GET /observations

List user's observation history (timeline).

**Query params**: `page`, `size`, `sort=observedAt,desc`

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "event": {
        "id": "uuid",
        "title": "string",
        "slug": "string"
      } | null,
      "observedAt": "ISO8601",
      "locationName": "string | null",
      "notes": "string | null",
      "outcome": "string | null",
      "mediaUrl": "string | null",
      "createdAt": "ISO8601"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 8,
  "totalPages": 1
}
```

---

## Admin

### PATCH /admin/events/:id

Edit event (admin only).

**Request** (all fields optional):
```json
{
  "title": "string",
  "description": "string",
  "type": "string",
  "startAt": "ISO8601",
  "endAt": "ISO8601",
  "relevanceScore": 85,
  "status": "DRAFT | PUBLISHED | HIDDEN",
  "imageUrl": "string"
}
```

**Response 200**: Updated event detail.

**Errors**: 403 (not admin), 404 (event not found)

### POST /admin/highlights

Create/override weekly highlight.

**Request**:
```json
{
  "eventId": "uuid (required)",
  "type": "WEEKLY (required)",
  "startDate": "YYYY-MM-DD (required)",
  "endDate": "YYYY-MM-DD (required)",
  "editorialNote": "string (optional)"
}
```

**Response 201**: Created highlight.

**Errors**: 403 (not admin), 404 (event not found), 409 (overlapping highlight)

---

## Dashboard

### GET /dashboard

Aggregated dashboard data for authenticated user.

**Response 200**:
```json
{
  "upcomingEvents": [ ... ],       // Next 5 events (same as event list item)
  "weeklyHighlight": { ... } | null, // Same as GET /highlights/week
  "favorites": [ ... ],             // Last 3 favorited events
  "recentObservations": [ ... ],    // Last 3 observations
  "stats": {
    "totalFavorites": 12,
    "totalObservations": 5,
    "totalExports": 8
  }
}
```

---

## Error Response Format

All errors follow:
```json
{
  "error": "string (machine-readable code)",
  "message": "string (human-readable)",
  "details": [ ... ] | null,
  "timestamp": "ISO8601"
}
```

HTTP status codes: 400 (validation), 401 (unauthorized), 403 (forbidden), 404 (not found), 409 (conflict), 500 (internal), 503 (service unavailable).
