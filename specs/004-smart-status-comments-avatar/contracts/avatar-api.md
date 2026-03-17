# API Contract: Avatar Upload

Base path: `/api/v1`

---

## POST /me/avatar

Upload or replace profile avatar.

**Auth**: Required (Bearer JWT)

**Content-Type**: `multipart/form-data`

**Form fields**:
- `file` (binary, required): Image file

**Validation**:
- Max file size: 5MB
- Accepted content types: `image/jpeg`, `image/png`, `image/webp`

**Response 200**:
```json
{
  "avatarUrl": "https://blob.vercel-storage.com/avatars/abc123-randomsuffix.jpg"
}
```

**Errors**:
- 401 Unauthorized
- 413 Payload too large (> 5MB)
- 415 Unsupported media type (not jpeg/png/webp)
- 500 Upload failed (Vercel Blob error)

---

## DELETE /me/avatar

Remove profile avatar.

**Auth**: Required (Bearer JWT)

**Response 204**: No content

Sets `avatar_url` to NULL on the user record.

---

## GET /me (existing — modified response)

**Modified field in UserResponse**:
```json
{
  "...existing fields...",
  "avatarUrl": "https://blob.vercel-storage.com/avatars/..."
}
```

`avatarUrl` is nullable. When null, frontend renders initials fallback.
