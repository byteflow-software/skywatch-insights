# skywatch-insights Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-10

## Active Technologies
- TypeScript 5.x (frontend only — zero backend changes) + React 18, Vite 5, Tailwind CSS, React Router 6, TanStack Query (001-mvp-complete)
- PostgreSQL via backend API (endpoints existentes) (001-mvp-complete)
- Java 21 (backend), TypeScript 5.x (frontend) + Spring Boot 3.x, Spring Data JPA, Hibernate, MapStruct, Spring Scheduler, RestTemplate/WebClient (backend); React 18, TanStack Query, Tailwind CSS, shadcn/ui (frontend) (002-real-astro-apis)
- PostgreSQL 16 (primary), Redis 7 (cache for moon data — 30 min TTL) (002-real-astro-apis)
- Java 21 (backend), TypeScript 5.x (frontend) + Spring Boot 3.x, Spring Security, Spring Data JPA, Hibernate, Bean Validation, MapStruct (backend); React 18, Vite 5, Tailwind CSS, React Router 6, TanStack Query (frontend) (004-smart-status-comments-avatar)
- PostgreSQL 16 (primary), Redis 7 (cache), Vercel Blob (avatars — already integrated) (004-smart-status-comments-avatar)

- Java 21 (backend), TypeScript 5.x (frontend) + Spring Boot 3.x, Spring Security, Spring Data JPA, Hibernate, Bean Validation, MapStruct (backend); React 18, Vite 5, Tailwind CSS, shadcn/ui, React Router 6, TanStack Query, Zod (frontend) (001-mvp-complete)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

Java 21 (backend), TypeScript 5.x (frontend): Follow standard conventions

## Recent Changes
- 004-smart-status-comments-avatar: Added Java 21 (backend), TypeScript 5.x (frontend) + Spring Boot 3.x, Spring Security, Spring Data JPA, Hibernate, Bean Validation, MapStruct (backend); React 18, Vite 5, Tailwind CSS, React Router 6, TanStack Query (frontend)
- 003-remaining-apis-card-redesign: Added USNO eclipse sync, Stellarium meteor shower static catalog, NOAA SWPC Kp aurora events, static transit/occultation catalogs. Home page cards redesigned to Twitter/X text-first style (no images). New clients: UsnoEclipseClient, NoaaKpClient, MeteorShowerCatalog, TransitOccultationCatalog.
- 002-real-astro-apis: Added Java 21 (backend), TypeScript 5.x (frontend) + Spring Boot 3.x, Spring Data JPA, Hibernate, MapStruct, Spring Scheduler, RestTemplate/WebClient (backend); React 18, TanStack Query, Tailwind CSS, shadcn/ui (frontend)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
