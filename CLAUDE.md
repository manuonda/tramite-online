# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tramite Online Platform** is a comprehensive Spring Boot 4.0.0-RC2 application implementing a modular monolith architecture for managing online administrative processes (trámites). The system allows users to create workspaces, design dynamic forms, collect user submissions, and generate analytics. The project uses Java 25, PostgreSQL, and Spring Modulith to enforce clean module boundaries and domain-driven design principles.

**Core Features:**
- **Workspaces**: Organizational units where users collaborate
- **Forms**: Dynamic form builder with conditional logic
- **Submissions**: User responses to forms with draft/submission workflow
- **Analytics**: Dashboard with statistics and reporting
- **Users**: Authentication, authorization, and user management
- **Notifications**: Email notifications on key events

## Technology Stack

- **Language**: Java 25
- **Framework**: Spring Boot 4.0.0-RC2 with Spring Modulith 2.0.0-RC1
- **Build Tool**: Maven (with maven-wrapper)
- **Database**: PostgreSQL (managed via Docker Compose)
- **Persistence**: Spring Data JPA with Flyway for schema migrations
- **Development Tools**: Lombok, Spring DevTools, Spring Boot Docker Compose support
- **Testing**: JUnit Jupiter with Spring Boot Test fixtures and Spring Modulith Test
- **Security**: Spring Security with JWT and OAuth2 support

## Common Development Commands

### Build & Compile
```bash
# Build the project
./mvnw clean package

# Build without running tests
./mvnw clean package -DskipTests

# Compile only (skip packaging and tests)
./mvnw compile
```

### Running the Application
```bash
# Run the application (starts PostgreSQL via Docker Compose automatically)
./mvnw spring-boot:run

# Build and run in one command
./mvnw clean spring-boot:run

# Run on a specific port
./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.port=9090"
```

### Testing
```bash
# Run all tests
./mvnw test

# Run a specific test class
./mvnw test -Dtest=ModularityTests

# Run tests matching a pattern
./mvnw test -Dtest=*Tests

# Run a single test method
./mvnw test -Dtest=ModularityTests#modularityTest

# Run tests without building
./mvnw test -DskipBuild
```

### Database & Migrations
```bash
# Flyway migrations run automatically on startup
# To validate migrations without running the app:
./mvnw flyway:validate

# To check migration status:
./mvnw flyway:info

# View current schema version:
./mvnw flyway:info -DoutputFile=migration-status.txt
```

## Architecture Overview

### Modular Monolith with Spring Modulith

The application is structured as a **modular monolith** using Spring Modulith to enforce module boundaries. Each module is a self-contained feature with clear responsibilities and explicit dependencies.

**Modules:**

1. **workspace** - Workspace/team management (where users collaborate)
2. **form** - Dynamic form builder and configuration
3. **submission** - Form submission handling and storage
4. **analytics** - Analytics, reports, and data export
5. **user** - User authentication, authorization, and profiles
6. **notification** - Email notifications and event listeners
7. **shared** - Common utilities, exceptions, value objects, and global configurations

### Layered Architecture Within Each Module

Each module follows **Hexagonal Architecture** (Ports & Adapters) with three layers:

```
Module Structure:
├── domain/                 (Core business logic - Framework independent)
│   ├── model/             (Domain entities, enums, value objects)
│   ├── service/           (Domain business logic)
│   ├── repository/        (Interfaces/Ports - data access contracts)
│   ├── event/             (Domain events - for cross-module communication)
│   ├── exception/         (Module-specific exceptions)
│   └── validator/         (Business rule validation)
├── application/           (Use cases & orchestration - Application layer)
│   ├── usecase/          (Use case implementations)
│   ├── dto/              (Data Transfer Objects for use cases)
│   └── listener/         (Event listeners - subscribes to domain events)
└── infrastructure/        (Technical implementations - Adapters)
    ├── web/              (REST controllers, REST DTOs)
    ├── persistence/      (JPA entities, repository adapters, mappers)
    ├── config/           (Module-specific Spring configuration)
    └── [other adapters]  (Email, file storage, OAuth, etc.)
```

**Key Design Principles:**

1. **Domain Layer** contains pure business logic with no framework dependencies
2. **Domain Events** enable loose coupling between modules (pub/sub pattern)
3. **Repository Interfaces** in domain layer; implementations in infrastructure
4. **Mappers** convert between Domain Models ↔ JPA Entities ↔ DTOs
5. **Use Cases** orchestrate domain logic and publish events

### Workspace Module Architecture (Starting Point)

Since you're starting with workspace, here's its complete structure:

**workspace.domain.model:**
- `WorkSpace` - Domain entity (id, name, description, active, archived, owner, timestamps)
- `WorkSpaceMember` - Member with role (user, workspace, role)
- `WorkSpaceRole` - Enum: OWNER, ADMIN, EDITOR, VIEWER

**workspace.domain.service:**
- `WorkSpaceService` - Business logic (create, update, archive, list)
- `WorkSpaceMemberService` - Member management logic (add, remove, update role)

**workspace.domain.event** (Published on business state changes):
- `WorkSpaceCreated` - Triggers: notification email, analytics initialization
- `WorkSpaceDeleted` - Cleanup trigger
- `WorkSpaceArchived` - State change
- `MemberAdded` - Triggers: welcome notification
- `MemberRemoved` - Cleanup trigger

**workspace.application.usecase:**
- `CreateWorkSpaceUseCase` - Execute business logic, publish events
- `UpdateWorkSpaceUseCase`
- `DeleteWorkSpaceUseCase`
- `AddMemberUseCase`
- `RemoveMemberUseCase`
- `UpdateMemberRoleUseCase`
- `ListWorkSpacesUseCase`
- `GetWorkSpaceByIdUseCase`

**workspace.infrastructure.web:**
- `WorkSpaceController` - REST endpoints: POST/GET/PUT/DELETE /api/workspaces
- `WorkSpaceMemberController` - REST endpoints: POST/DELETE /api/workspaces/{id}/members

**workspace.infrastructure.persistence:**
- `WorkSpaceEntity` / `WorkSpaceMemberEntity` - JPA entities with @Entity annotations
- `WorkSpaceJpaRepository` / `WorkSpaceMemberJpaRepository` - Spring Data JPA interfaces
- `WorkSpaceRepositoryAdapter` - Implements domain.repository.WorkSpaceRepository
- `WorkSpaceMapper` / `WorkSpaceMemberMapper` - Convert Entity ↔ Domain models

### Inter-Module Communication Pattern

Modules communicate through **Domain Events** (asynchronous, decoupled):

```
Workspace publishes WorkSpaceCreated event
    ↓
Notification module listens and sends welcome email
Analytics module listens and creates initial analytics
User module listens and initializes user permissions
```

**Event Flow:**
1. Domain service publishes `DomainEvent` via Spring's `ApplicationEventPublisher`
2. Other modules have `@EventListener` methods that subscribe
3. Event listeners execute use cases or domain logic in response

## Configuration & Setup

### Application Properties

**Location:** `src/main/resources/application.yaml`

Configuration is managed via Spring Boot's externalized configuration:

```yaml
spring:
  application:
    name: tramite-online
  jpa:
    hibernate:
      ddl-auto: validate  # Flyway manages schema
  datasource:
    url: jdbc:postgresql://localhost:5432/mydatabase
    username: myuser
    password: secret
  flyway:
    locations: classpath:db/migration

app:
  # Your application-specific properties here
```

### Docker Compose Setup

PostgreSQL is auto-started when the application runs (Spring Boot Docker Compose support):
- **Service**: PostgreSQL latest
- **Credentials**: username=`myuser`, password=`secret`
- **Database**: `mydatabase`
- **Port**: 5432

No manual setup needed—just run `./mvnw spring-boot:run`.

### Database Migrations

**Location:** `src/main/resources/db/migration/`

**Naming Convention:** `V{version}__{description}.sql` (e.g., `V1__create_workspace_table.sql`)

**Process:**
1. Create new migration file with Flyway naming
2. Write SQL DDL
3. Run application—Flyway applies migrations automatically
4. Validate with: `./mvnw flyway:info`

**Example Migration:**
```sql
-- V1__create_workspace_table.sql
CREATE TABLE workspace (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

## Testing Strategy

### Modularity Testing

Spring Modulith enforces architecture at test time. The `ModularityTests` class verifies:
- Module boundaries are respected
- Modules only depend on declared modules
- No circular dependencies exist

**Always run before committing:**
```bash
./mvnw test -Dtest=ModularityTests
```

### Unit & Integration Tests

**Test Location:** `src/test/java/com/tramite/online/[module]/`

**Patterns:**
- Use `@DataJpaTest` for repository tests (JPA + H2)
- Use `@WebMvcTest` for controller tests (MockMvc)
- Use `@SpringBootTest` for full integration tests
- Use Spring Modulith Test support for testing module interactions

**Naming:** `*Tests` or `*Test` (e.g., `WorkSpaceServiceTests.java`)

### Event-Driven Testing

For testing event publishers/listeners:
```java
@SpringBootTest
class WorkSpaceEventTests {
    @Test
    void testWorkSpaceCreatedEventIsPublished() {
        // Create workspace
        // Verify event was published
        // Verify listeners were notified
    }
}
```

## Development Workflow

### Adding a New Feature to a Module

1. **Define Domain Model** (`domain/model/`)
   - Create entity POJOs with business logic in constructors
   - Create value objects and enums if needed

2. **Implement Domain Logic** (`domain/service/`)
   - Write business logic independent of frameworks
   - Publish domain events when state changes

3. **Create Use Cases** (`application/usecase/`)
   - Each use case is a single operation
   - Use cases call domain services and publish events
   - Name: `{Action}{Entity}UseCase` (e.g., `CreateWorkSpaceUseCase`)

4. **Define Data Access Ports** (`domain/repository/`)
   - Create interfaces for data access (Java interfaces)
   - No Spring annotations in domain layer

5. **Implement Persistence Adapters** (`infrastructure/persistence/`)
   - Create JPA entities
   - Implement repository interfaces from domain layer
   - Create mappers between entities and domain models

6. **Expose REST API** (`infrastructure/web/`)
   - Create controller classes
   - Define request/response DTOs for API contracts
   - Map between REST DTOs and use case DTOs

7. **Add Configuration** (`infrastructure/config/`)
   - Define Spring beans specific to this module

8. **Test**
   - Write tests for domain logic (@DataJpaTest, @WebMvcTest)
   - Verify event publishing
   - Run modularity tests

### Adding Cross-Module Dependencies

1. Edit module's `package-info.java` and add dependency:
   ```java
   @org.springframework.modulith.ApplicationModule(
       allowedDependencies = "other-module"
   )
   package com.tramite.online.workspace;
   ```

2. Run `./mvnw test -Dtest=ModularityTests` to verify

## Key Patterns & Best Practices

### Domain-Driven Design
- **Domain entities** contain business logic
- **Value Objects** for immutable domain concepts (Email, PhoneNumber)
- **Aggregates** group related entities (WorkSpace is root, WorkSpaceMembers are children)
- **Repository pattern** abstracts data storage

### Hexagonal Architecture
- **Ports** (interfaces in domain layer) define contracts
- **Adapters** (infrastructure layer) implement ports
- Easy to swap implementations (swap JPA adapter for MongoDB, etc.)

### Event-Driven Architecture
- Modules publish domain events on state changes
- Other modules listen and react asynchronously
- Enables loose coupling and scalability

### Lombok Usage
```java
@Data              // @Getter, @Setter, @ToString, @EqualsAndHashCode
@Builder          // Builder pattern
@NoArgsConstructor
@AllArgsConstructor
public class WorkSpace {
    private UUID id;
    private String name;
}
```

### Error Handling
- Create module-specific exceptions in `domain/exception/`
- Inherit from shared base exception (`shared.exception.BaseException`)
- Global exception handler in `shared.infrastructure.web.advice.GlobalExceptionHandler`

## Project Module Details

### workspace
Workspace/team management. Users organize work in workspaces and collaborate.

### form
Dynamic form builder. Design forms with sections, questions (text, select, file, date, etc.), and conditional logic.

### submission
Form responses. Users submit answers, save drafts, and admins review/approve submissions.

### analytics
Dashboard and reporting. View submission statistics, export data (CSV, Excel, PDF, JSON), time-series analysis.

### user
Authentication and user management. Register, login, profiles, password reset, OAuth2 (Google, GitHub), JWT tokens.

### notification
Email notifications. Listens to domain events from other modules and sends templated emails.

### shared
Global utilities, exceptions, value objects, base configurations, and cross-cutting concerns.

## Important Notes

- **Architectural Enforcement**: Spring Modulith validates module boundaries at test time. The ModularityTests must pass.
- **Framework Independence**: Domain layer should never import Spring classes (except for annotations in some cases).
- **Event Publishing**: Use `ApplicationEventPublisher` in domain services to publish events.
- **Data Consistency**: Consider transactional boundaries when multiple aggregates are involved.
- **Performance**: Use JPA projections in analytics module for complex queries.
- **Security**: Spring Security configured in `user` module; other modules use standard @PreAuthorize annotations.

## Useful References

- **Spring Modulith**: https://spring.io/projects/spring-modulith
- **Spring Boot Documentation**: https://spring.io/projects/spring-boot
- **Domain-Driven Design**: "Domain-Driven Design" by Eric Evans
- **Hexagonal Architecture**: https://alistair.cockburn.us/hexagonal-architecture/