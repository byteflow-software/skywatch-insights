# API Contract: Comments

Base path: `/api/v1`

---

## POST /events/{eventId}/comments

Create a comment on an event.

**Auth**: Required (Bearer JWT)

**Path params**: `eventId` (UUID)

**Request body**:
```json
{
  "content": "Que evento incrível! Mal posso esperar."
}
```

**Validation**:
- `content`: required, 1–500 characters

**Response 201**:
```json
{
  "id": "uuid",
  "content": "Que evento incrível! Mal posso esperar.",
  "authorName": "Ryan Moura",
  "authorAvatarUrl": "https://blob.vercel-storage.com/avatars/...",
  "createdAt": "2026-03-13T20:00:00Z",
  "isOwn": true
}
```

**Errors**: 401 Unauthorized, 404 Event not found, 422 Validation error

---

## GET /events/{eventId}/comments?page=0&size=20

List comments for an event (paginated, newest first).

**Auth**: Optional (used to set `isOwn` flag)

**Path params**: `eventId` (UUID)

**Query params**:
- `page` (int, default 0)
- `size` (int, default 20, max 50)

**Response 200**:
```json
{
  "content": [
    {
      "id": "uuid",
      "content": "Comentário aqui...",
      "authorName": "Ana Silva",
      "authorAvatarUrl": null,
      "createdAt": "2026-03-13T19:30:00Z",
      "isOwn": false
    }
  ],
  "totalElements": 42,
  "totalPages": 3,
  "number": 0,
  "size": 20
}
```

---

## GET /events/{eventId}/comments/preview

Get top 3 most recent comments + total count (for feed card preview).

**Auth**: Optional

**Path params**: `eventId` (UUID)

**Response 200**:
```json
{
  "comments": [
    {
      "id": "uuid",
      "content": "Texto truncado...",
      "authorName": "Ryan Moura",
      "authorAvatarUrl": "https://...",
      "createdAt": "2026-03-13T20:00:00Z",
      "isOwn": false
    }
  ],
  "totalCount": 15
}
```

---

## DELETE /events/{eventId}/comments/{commentId}

Delete own comment.

**Auth**: Required (Bearer JWT)

**Path params**: `eventId` (UUID), `commentId` (UUID)

**Response 204**: No content

**Errors**: 401 Unauthorized, 403 Forbidden (not own comment), 404 Not found

---

## POST /observations/{observationId}/comments

Create a comment on an observation. Same request/response as event comments.

**Auth**: Required

---

## GET /observations/{observationId}/comments?page=0&size=20

List comments for an observation. Same response format as event comments.

**Auth**: Optional

---

## GET /observations/{observationId}/comments/preview

Preview for observation comments. Same response format as event comment preview.

**Auth**: Optional

---

## DELETE /observations/{observationId}/comments/{commentId}

Delete own comment on an observation. Same as event comment delete.

**Auth**: Required
