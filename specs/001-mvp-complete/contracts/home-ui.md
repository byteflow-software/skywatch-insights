# UI Contract: Home Page Pública

**Date**: 2026-03-10
**Feature**: FR-036 to FR-039

## Route

| Path | Component | Layout | Auth |
|------|-----------|--------|------|
| `/` | `HomePage` | `PublicLayout` | None (public) |

## Components

### PublicLayout

**Props**: `{ children: React.ReactNode }`

Header elements:
- Logo/brand (links to `/`)
- "Entrar" button (links to `/login`)
- "Cadastrar" CTA button (links to `/register`)
- If authenticated: show user avatar + name instead of login/register buttons

Footer: reuse existing `Footer` component.

No sidebar.

### HomePage

**Data sources** (all public, no auth token):
- `GET /api/v1/highlights/week` → weekly highlight event
- `GET /api/v1/events?sort=date&size=10&page={n}` → paginated events for infinite scroll
- `GET /api/v1/astro-conditions/location/{locationId}` → astronomical conditions
- `GET /api/v1/cities/search?q=São Paulo&limit=1` → default city locationId (cached)

**Layout** (top to bottom):
1. `HeroHighlight` — full-width hero with weekly event
2. `AstroConditionsBanner` — compact conditions bar
3. Event feed — vertical list of `EventFeedCard` in `max-w-2xl` centered column
4. Infinite scroll sentinel (IntersectionObserver)

**States**:
- Loading: skeleton/spinner for each section
- Error: inline error with retry
- Empty (no events): friendly empty state with message
- No weekly highlight: section hidden

### HeroHighlight

**Props**: `{ event: WeeklyHighlightEvent | null }`

**Visual**:
- Full-width container with event image as background
- Dark gradient overlay (bottom to top)
- Badge: event type (colored, using `getTypeBadgeColor`)
- Title: white, bold, large
- Date: white, smaller
- CTA: "Ver detalhes" → links to `/events/{slug}`
- If `event` is null: don't render

### AstroConditionsBanner

**Props**: `{ locationId: string }`

**Visual**:
- Horizontal bar, light background (`#E0F2FE`)
- Compact row of: seeing quality, cloud coverage %, temperature, humidity %
- Banner text: "Condições em São Paulo" (or user city if logged in)
- CTA: "Personalize para sua cidade →" links to `/register` (if not logged in) or `/settings` (if logged in)

### EventFeedCard

**Props**:
```typescript
{
  id: string;
  slug: string;
  title: string;
  type: string;
  dateStart: string;
  description: string;
  imageUrl?: string;
  relevanceScore?: number;
}
```

**Visual**:
- Card with landscape image (16:9 ratio, or placeholder from `getEventImage`)
- Below image: type badge + date
- Title (font-bold, text-lg)
- Description truncated to 2 lines (`line-clamp-2`)
- Action row: favorite heart icon + "Exportar" link + "Ver mais →" link
- Favorite/Export CTAs redirect to `/login` if not authenticated

**Interactions**:
- Click card → navigate to `/events/{slug}`
- Click favorite (not auth) → navigate to `/login?from=/`
- Click export (not auth) → navigate to `/login?from=/`

## Hook: useHome

```typescript
// Infinite scroll events
function useHomeEvents(): UseInfiniteQueryResult<EventPage>
// Weekly highlight
function useWeeklyHighlight(): UseQueryResult<{ highlight, event }>
// Default city locationId
function useDefaultCity(): UseQueryResult<{ id: string, name: string }>
```

## Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| < 640px (mobile) | Full-width cards, stacked layout, hero height 200px |
| 640-1024px (tablet) | max-w-2xl centered, hero height 300px |
| > 1024px (desktop) | max-w-2xl centered, hero height 400px |
