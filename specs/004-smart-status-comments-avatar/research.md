# Research: Smart Status, Comments & Avatar

## R-001: Smart Status Calculation Strategy

**Decision**: Pure frontend calculation using event dates and bestWindow data already returned by the forecast API.

**Rationale**: The status depends on the current time relative to event dates, making it inherently client-side. The forecast endpoint already returns `bestWindowStart`/`bestWindowEnd` which is needed for the "Agora" status. No backend changes needed for this feature.

**Alternatives considered**:
- Server-calculated status field: Rejected — would require constant recalculation and adds latency
- WebSocket real-time updates: Rejected — overkill for a countdown that only updates locally

**Implementation approach**:
- Extract status logic into `lib/smartStatus.ts` as a pure function
- Use `useEffect` with `setInterval(1000)` for the 10-minute countdown timer
- Timer only activates when event is within 10 minutes of bestWindow start
- Clean up interval on unmount

---

## R-002: Comment System Architecture

**Decision**: New `comment` domain module in backend following the existing `observation`/`favorite` pattern. Polymorphic `targetType` + `targetId` to support both events and observations.

**Rationale**: Using a single Comment entity with targetType (EVENT/OBSERVATION) avoids duplicate tables and follows the project's domain-module architecture. The existing patterns (Controller → Service → Repository → Mapper → DTO) are well-established.

**Alternatives considered**:
- Separate EventComment and ObservationComment entities: Rejected — unnecessary duplication, same schema
- Generic discussion/thread model: Rejected — YAGNI, flat comments are sufficient for MVP
- Nested/threaded comments: Rejected — adds significant complexity, flat list is simpler

**Key decisions**:
- Flat comments (no threading/nesting)
- Soft-reference to target via UUID targetId + enum targetType (EVENT, OBSERVATION)
- Ordered by createdAt DESC (newest first)
- Paginated at 20 per page in detail view
- Top 3 preview in feed cards via dedicated endpoint
- Cascade: comments are NOT deleted when user is deleted (show "Usuário removido")

---

## R-003: Avatar Upload with Vercel Blob

**Decision**: Reuse existing `VercelBlobStorageService` from the export module. Add a new endpoint `POST /api/v1/me/avatar` that accepts multipart/form-data.

**Rationale**: The Vercel Blob integration is already implemented and tested in the export module. Reusing it avoids duplicate code and configuration. The service is already a Spring `@Service` bean.

**Alternatives considered**:
- Store avatars in PostgreSQL as bytea: Rejected — bloats DB, poor for serving images
- Local filesystem storage: Rejected — not portable, doesn't work in containerized/serverless deployments
- Separate S3/MinIO: Rejected — Vercel Blob already configured and working

**Key decisions**:
- Max file size: 5MB (validated server-side via Spring's `@RequestParam` with multipart config)
- Accepted types: image/jpeg, image/png, image/webp (validated server-side)
- Upload path pattern: `avatars/{userId}.{ext}` with random suffix via Vercel Blob
- Old avatar is NOT deleted (Vercel Blob handles this with random suffixes, minimal storage cost)
- Avatar URL stored directly on User entity (`avatar_url` column)

---

## R-004: Comment Preview in Feed

**Decision**: Dedicated endpoint `GET /api/v1/events/{eventId}/comments/preview` returning top 3 comments with author info (name + avatarUrl). The home feed makes parallel requests for comment previews.

**Rationale**: Embedding comments directly in the event list response would make the event query heavier and more complex. A separate lightweight endpoint allows the frontend to fetch previews only when needed and cache them independently.

**Alternatives considered**:
- Embed in event list response: Rejected — would require JOIN + subquery for every event in the list, significantly slower
- GraphQL: Rejected — project uses REST, introducing GraphQL for one use case is overkill
- Client-side aggregation: The chosen approach IS client-side aggregation via parallel fetch

**Key decisions**:
- Preview endpoint is public (no auth required) — comments are visible to all
- Returns max 3 items + `totalCount` for the "Ver todos os N comentários" link
- Response includes author name and avatarUrl for avatar rendering
- Frontend uses `useQueries` or parallel `useQuery` calls per visible card

---

## R-005: UserAvatar Component Design

**Decision**: Shared `UserAvatar` component with img + onError fallback to initials.

**Rationale**: Used in multiple places (header, comments in feed, comments in detail, settings). A single shared component ensures consistency.

**Implementation approach**:
- Props: `name`, `avatarUrl`, `size` (sm=24px, md=32px, lg=48px)
- Renders `<img>` with `onError` handler that switches to initials
- Initials: first letter of first name + first letter of last name, uppercase
- Background color derived from name hash (deterministic, one of 6 preset colors)
- Round shape (`rounded-full`)
