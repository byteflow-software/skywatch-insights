# UI Contract: Navigation Restructuring + Dark Theme

**Date**: 2026-03-12
**Branch**: `001-mvp-complete`
**Spec FRs**: FR-040 a FR-045

---

## C1: BottomNav Component

**Location**: `frontend/src/components/layout/BottomNav.tsx`
**Visibility**: Only when `getAccessToken()` returns a token. Hidden on `/login`, `/register`, `/onboarding`.

### Structure

```text
┌──────────────────────────────────────────────────────┐
│  🏠 Home   📅 Eventos   ❤️ Favoritos   🔭 Obs   👤 Perfil  │
│   /           /events      /favorites   /observations /settings │
└──────────────────────────────────────────────────────┘
```

### Visual Specs

- Position: `fixed bottom-0 left-0 right-0 z-50`
- Background: `bg-[#050A18]/90 backdrop-blur-xl border-t border-white/10`
- Height: ~64px (`h-16`)
- Icons: Heroicons outline (24x24), active state fills or uses accent color `#0EA5E9`
- Labels: `text-[10px]` under icons, `text-gray-500` default, `text-[#0EA5E9]` active
- Active indicator: icon + label turn `text-[#0EA5E9]`, optional dot indicator above icon

### Props

```typescript
interface BottomNavProps {
  // No props — reads current route via useLocation()
}
```

---

## C2: AuthLayout Component

**Location**: `frontend/src/components/layout/AuthLayout.tsx`
**Purpose**: Wrapper for authenticated pages (events, favorites, observations, settings) that applies dark theme + bottom nav.

### Structure

```text
┌─────────────────────────────────┐
│         Page Content            │
│    bg-[#050A18] min-h-screen    │
│    pb-20 (bottom nav clearance) │
│                                 │
├─────────────────────────────────┤
│         <BottomNav />           │
└─────────────────────────────────┘
```

### Visual Specs

- Background: `bg-[#050A18] min-h-screen`
- Content padding: `pb-20` (clears bottom nav)
- No header bar — pages manage their own top section
- No sidebar

### Props

```typescript
interface AuthLayoutProps {
  children: React.ReactNode;
}
```

---

## C3: Route Structure

### Before (current)

```text
/              → PublicLayout > HomePage
/login         → LoginPage → redirects to /dashboard
/register      → RegisterPage → redirects to /dashboard
/dashboard     → MainLayout > DashboardPage (any authenticated user)
/events        → MainLayout > EventListPage
/favorites     → MainLayout > FavoritesListPage
/observations  → MainLayout > ObservationTimeline
/settings      → MainLayout > SettingsPage
```

### After (target)

```text
/              → PublicLayout > HomePage (public + auth unified)
/login         → LoginPage → redirects to /
/register      → RegisterPage → redirects to /
/events        → AuthLayout > EventListPage (dark theme)
/events/:slug  → AuthLayout > EventDetailPage (dark theme)
/favorites     → AuthLayout > FavoritesListPage (dark theme)
/observations  → AuthLayout > ObservationTimeline (dark theme)
/settings      → AuthLayout > SettingsPage (dark theme + admin link)
/dashboard     → AdminRoute > MainLayout > DashboardPage (admin only)
```

---

## C4: Dark Theme Design Tokens (Auth Pages)

All authenticated pages share these tokens:

| Token | Value | Usage |
|-------|-------|-------|
| Page background | `bg-[#050A18]` | All auth pages |
| Card background | `bg-white/[0.03]` | Cards, containers |
| Card border | `border-white/5` | Card borders |
| Card hover border | `border-white/10` | Hover state |
| Card hover bg | `bg-white/[0.06]` | Hover state |
| Primary text | `text-white` | Headings, values |
| Secondary text | `text-gray-400` | Descriptions, labels |
| Muted text | `text-gray-500` | Timestamps, hints |
| Input background | `bg-white/5` | Form inputs |
| Input border | `border-white/10` | Form borders |
| Input text | `text-white` | Input values |
| Accent primary | `text-[#0EA5E9]` / `bg-[#0EA5E9]` | Links, CTAs |
| Accent secondary | `text-[#6366F1]` / `bg-[#6366F1]` | Secondary actions |
| Divider | `border-white/5` or `bg-white/10` | Section separators |

---

## C5: SettingsPage Additions

- **Admin link**: Visible only when user has `ADMIN` role. Links to `/dashboard`.
  ```text
  [Shield icon] Painel Administrativo →
  ```
- **Export history**: Section showing recent exports with timestamp, event name, and re-download link.

---

## C6: PublicLayout Bottom Nav Integration

When user is authenticated (`getAccessToken()` truthy), PublicLayout renders `<BottomNav />` and applies `pb-20` to main content area. The glassmorphism top nav adjusts: replaces "Entrar"/"Criar conta" buttons with user avatar/icon.
