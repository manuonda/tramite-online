# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a full-stack monorepo with two main sub-projects:

- **`back/`** — Spring Boot backend (Java 25, Spring Boot 4.0.1, Spring Modulith)
- **`sakai-ng-master/`** — Angular 21 frontend (PrimeNG 21, Tailwind CSS 4)

## Backend (`back/`)

See `back/CLAUDE.md` for full backend documentation.

### Commands (run from `back/`)

```bash
# Build
./mvnw clean package -DskipTests

# Run (auto-starts PostgreSQL via Docker Compose)
./mvnw spring-boot:run

# Run all tests
./mvnw test

# Run modularity tests (run before every commit)
./mvnw test -Dtest=ModularityTest

# Run a single test
./mvnw test -Dtest=ClassName#methodName
```

### Architecture

Modular monolith using Spring Modulith. Modules: `workspace`, `form`, `submission`, `analytics`, `user`, `notification`, `shared`.

Each module follows Hexagonal Architecture:
- `domain/` — pure business logic, no Spring framework dependencies
- `application/` — use cases, event listeners, DTOs
- `infrastructure/` — REST controllers, JPA entities/repositories/mappers, Spring config

Cross-module communication uses Spring domain events (`ApplicationEventPublisher` + `@EventListener`).

Module boundaries are enforced at test time by `ModularityTest` — always run before committing.

Database migrations use Flyway: `src/main/resources/db/migration/{module}/V{n}.{m}__{description}.sql`

## Frontend (`sakai-ng-master/`)

### Commands (run from `sakai-ng-master/`)

```bash
# Install dependencies
npm install

# Dev server (http://localhost:4200)
npm start

# Build production
npm run build

# Run tests
npm test

# Format code
npm run format
```

### Architecture

Angular 21 standalone components with lazy-loaded feature modules organized by role:

- `src/app/core/` — auth services, guards, interceptors (auth/loading/error), API service
- `src/app/features/admin/` — admin area: workspace management, form builder, submissions, members, dashboard
- `src/app/features/auth/` — login page
- `src/app/features/public/` — public portal for form submission by end users
- `src/app/layout/` — Sakai admin shell layout components
- `src/app/shared/` — shared models and utilities

Key architectural points:
- HTTP interceptors handle JWT auth, loading state, and error handling globally
- `core/services/api.service.ts` wraps all HTTP calls
- Feature routes use lazy loading via `loadComponent`/`loadChildren`
- UI: PrimeNG 21 components + Tailwind CSS 4 + PrimeUI themes
- The public portal (`features/public/portal/`) renders dynamic forms to end users via a stepper (horizontal/vertical) with a `question-renderer` component
