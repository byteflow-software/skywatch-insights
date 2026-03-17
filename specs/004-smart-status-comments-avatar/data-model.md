# Data Model: Smart Status, Comments & Avatar

## New Entity: Comment

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| target_type | VARCHAR(20) | NOT NULL | "EVENT" or "OBSERVATION" |
| target_id | UUID | NOT NULL, indexed | ID of the event or observation |
| user_id | UUID | NOT NULL, FK → users(id) | Author of the comment |
| content | VARCHAR(500) | NOT NULL | Comment text, max 500 chars |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | Last update timestamp |

**Indexes**:
- `idx_comments_target` on (target_type, target_id, created_at DESC) — for listing comments by target
- `idx_comments_user` on (user_id) — for finding user's comments

**Relationships**:
- Comment → User (ManyToOne, LAZY, NOT NULL)
- Comment → AstronomicalEvent/ObservationLog (logical reference via target_id, no FK constraint for polymorphism)

---

## Modified Entity: User

| New Field | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| avatar_url | VARCHAR(500) | NULLABLE | URL to avatar image in Vercel Blob |

**Migration**: Add column to existing `users` table, nullable, no default.

---

## Migration Plan

### V22__add_user_avatar_url.sql

```sql
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
```

### V23__create_comments.sql

```sql
CREATE TABLE comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type VARCHAR(20)  NOT NULL,
    target_id   UUID         NOT NULL,
    user_id     UUID         NOT NULL REFERENCES users(id),
    content     VARCHAR(500) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_target ON comments (target_type, target_id, created_at DESC);
CREATE INDEX idx_comments_user ON comments (user_id);
```

---

## DTO Structures

### CommentResponse

```
id: UUID
content: String
authorName: String
authorAvatarUrl: String (nullable)
createdAt: Instant
isOwn: boolean (true if current user is the author)
```

### CommentPreviewResponse

```
comments: List<CommentResponse> (max 3)
totalCount: int
```

### CreateCommentRequest

```
content: String (1-500 chars, @NotBlank, @Size)
```

### UserResponse (modified)

```
... existing fields ...
avatarUrl: String (nullable) — NEW
```
