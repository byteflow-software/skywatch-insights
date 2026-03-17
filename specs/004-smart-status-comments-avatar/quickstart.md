# Quickstart: Smart Status, Comments & Avatar

## Prerequisites

- Docker Compose running (`infra/docker-compose.yml`)
- Backend and frontend containers healthy
- Valid JWT token (register/login via the app)

---

## User Story 1: Smart Status

### Test Scenario: Verify status display

1. Open the home page at `http://localhost:3000`
2. Observe the event feed cards
3. Each card should show:
   - Date absolute (left, next to type badge)
   - Smart status (right): "Agora", "Hoje", "Amanhã", "Faltam N dias", "Faltam N horas", or "Encerrado"
4. If an event's bestWindow starts within 10 minutes, verify the countdown timer updates every second

### Verify: No redundant dates
- The old relative date ("Em 5 dias") that duplicated the absolute date should be gone
- Only one date display (absolute) + one status display (smart)

---

## User Story 2: Comments

### Test Scenario: Create and view comments

1. Login at `http://localhost:3000/login`
2. Navigate to an event detail page (`/events/{slug}`)
3. Scroll to the comments section
4. Type a comment (max 500 chars) and submit
5. Verify the comment appears with your name and avatar/initials
6. Go back to the home feed
7. Verify the event card shows up to 3 comment previews with avatars
8. If more than 3 comments exist, verify "Ver todos os N comentários" link appears

### Test Scenario: Delete own comment

1. On the event detail page, find your comment
2. Click the delete button
3. Verify the comment is removed

### Test Scenario: Unauthenticated user

1. Logout
2. Navigate to an event detail page
3. Verify the comment input shows a "Faça login para comentar" message with login link
4. Verify existing comments are still visible (read-only)

---

## User Story 3: Profile Avatar

### Test Scenario: Upload avatar

1. Login and navigate to Settings (`/settings`)
2. Find the avatar upload section
3. Click to select an image (JPEG, PNG, or WebP, max 5MB)
4. Verify the image uploads and the preview updates
5. Check the header — your avatar should replace the generic user icon
6. Create a comment on an event — verify your avatar appears next to it

### Test Scenario: Initials fallback

1. If no avatar is uploaded, verify your initials (e.g., "RM") appear in a colored circle
2. The color should be consistent (same name = same color)

### Test Scenario: Remove avatar

1. In Settings, click remove avatar
2. Verify the header reverts to initials
3. Verify comments show initials instead of photo

---

## API Quick Tests (curl)

```bash
# Create comment on event
curl -X POST http://localhost:8080/api/v1/events/{eventId}/comments \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"content": "Teste de comentário!"}'

# Get comment preview for feed
curl http://localhost:8080/api/v1/events/{eventId}/comments/preview

# List comments (paginated)
curl http://localhost:8080/api/v1/events/{eventId}/comments?page=0&size=20

# Upload avatar
curl -X POST http://localhost:8080/api/v1/me/avatar \
  -H "Authorization: Bearer {token}" \
  -F "file=@photo.jpg"

# Delete avatar
curl -X DELETE http://localhost:8080/api/v1/me/avatar \
  -H "Authorization: Bearer {token}"
```
