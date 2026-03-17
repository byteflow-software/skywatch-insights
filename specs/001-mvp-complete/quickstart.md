# Quickstart: SkyWatch Insights

**Date**: 2026-03-09
**Branch**: `001-mvp-complete`

## Prerequisites

- Java 21 (JDK)
- Node.js 20+ (LTS)
- Docker & Docker Compose
- Git

## Setup

### 1. Clone and enter the project

```bash
git clone <repo-url>
cd skywatch-insights
```

### 2. Start infrastructure (PostgreSQL + Redis)

```bash
docker compose up -d postgres redis
```

### 3. Start backend

```bash
cd backend
cp .env.example .env          # Configure DB, Redis, JWT secret, S3
./gradlew bootRun             # or: mvn spring-boot:run
```

Backend runs on `http://localhost:8080`.

### 4. Start frontend

```bash
cd frontend
npm install
cp .env.example .env          # Configure API base URL
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 5. Full stack with Docker Compose

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api/v1`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Verify Installation

1. Open `http://localhost:5173` (or 3000 in Docker)
2. Home page should load publicly with weekly highlight hero, astro conditions (São Paulo default), and event feed
3. Register a new account
4. Complete onboarding (select city)
5. After login, home page shows user's city conditions + bottom nav appears
6. Navigate via bottom nav to Events, Favorites, Observations, Settings (all dark theme)
7. Dashboard (`/dashboard`) is admin-only — regular users are redirected to `/`

## Seed Sample Data

```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=seed'
```

This seeds:
- Sample locations (major Brazilian cities)
- Sample astronomical events (next 3 months)
- Default social export templates for all network+format+objective combinations

## Key Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/skywatch` |
| `DB_USERNAME` | Database username | `skywatch` |
| `DB_PASSWORD` | Database password | `skywatch` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | Secret key for JWT signing | (generate a secure random string) |
| `JWT_EXPIRATION` | Access token TTL in seconds | `900` |
| `S3_ENDPOINT` | S3/MinIO endpoint | `http://localhost:9000` |
| `S3_BUCKET` | Bucket name for exports | `skywatch-assets` |
| `S3_ACCESS_KEY` | S3 access key | `minioadmin` |
| `S3_SECRET_KEY` | S3 secret key | `minioadmin` |
| `WEATHER_API_KEY` | OpenWeatherMap API key | (optional for MVP) |

### Frontend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api/v1` |

## Running Tests

### Backend

```bash
cd backend
./gradlew test                    # Unit tests
./gradlew integrationTest         # Integration tests (requires Docker for Testcontainers)
```

### Frontend

```bash
cd frontend
npm run test                      # Vitest unit tests
npm run test:coverage             # With coverage report
```

## Project Structure Reference

See [plan.md](./plan.md) for full project structure details.
