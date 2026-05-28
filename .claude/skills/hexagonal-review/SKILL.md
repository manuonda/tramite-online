---
name: hexagonal-review
description: Systematic code review for Hexagonal Architecture (Ports & Adapters) in Java/Spring Boot. Checks layer purity, port definitions, adapter compliance, domain event patterns, Value Objects, CQRS separation, and ArchUnit test coverage. Use when user says "review hexagonal", "check architecture", "hexagonal review", or after implementing a new module or feature.
---

# Hexagonal Architecture Review Skill

Systematic review checklist for Java/Spring Boot projects implementing Hexagonal Architecture (Ports & Adapters) with Spring Modulith.

## When to Use
- User says "review hexagonal" / "check architecture" / "hexagonal review"
- After implementing a new module or use case
- Before committing a feature that touches domain or application layers
- When adding a new adapter (REST controller, JPA repository, event listener)

## Review Strategy

1. **Map the structure** — identify all layers present in the module
2. **Dependency direction check** — domain ← application ← adapter (never reversed)
3. **Port audit** — primary ports (input interfaces) and secondary ports (output interfaces)
4. **Domain purity scan** — grep imports in domain/ for framework leaks
5. **Pattern compliance** — aggregates, value objects, domain events, mappers
6. **Test coverage** — ArchUnit rules, modularity tests

## Output Format

```markdown
## Hexagonal Review: [module/feature name]

### Layer Violations (Critical)
- [File:line — what layer rule was broken + fix]

### Missing Ports / Adapters (High)
- [What port/adapter is absent + impact]

### Domain Purity Issues (High)
- [Framework import found in domain + how to remove]

### Pattern Gaps (Medium)
- [Missing Value Object / AggregateRoot / meta-annotation + suggestion]

### Good Architecture Observed
- [What is correctly implemented]

### Architecture Scorecard
| Check | Status |
|-------|--------|
| Domain free of Spring | ✅/❌ |
| Primary ports as interfaces | ✅/❌ |
| Secondary ports as interfaces | ✅/❌ |
| Adapters implement ports | ✅/❌ |
| AggregateRoot with domain events | ✅/❌ |
| Value Objects for primitives | ✅/❌ |
| @ApplicationService meta-annotation | ✅/❌ |
| Marker annotations (@DriverAdapter etc.) | ✅/❌ |
| ArchUnit tests present | ✅/❌ |
| CQRS Command/Query separation | ✅/❌ |
```

---

## Review Checklist

### 1. Layer Structure & Naming

**Expected structure per module:**
```
{module}/
├── domain/
│   ├── model/          ← Aggregates, Value Objects, Enums
│   ├── event/          ← Domain Events (pure Java, no Spring)
│   ├── repository/     ← Output port interfaces (secondary ports)
│   ├── exception/      ← Domain-specific exceptions
│   └── validator/      ← Business rule validators
├── application/
│   ├── usecase/        ← Primary port INTERFACES (input ports)
│   ├── service/        ← Use case implementations (@ApplicationService)
│   ├── port/           ← Secondary port interfaces (non-repo: email, payment...)
│   ├── dto/            ← Commands, Queries, Responses
│   │   ├── command/
│   │   ├── query/
│   │   └── response/
│   └── listener/       ← @EventListener handlers
└── infrastructure/     ← (or adapter/)
    ├── web/            ← @DriverAdapter REST controllers
    ├── persistence/    ← @PersistenceAdapter JPA entities/repos/mappers
    └── config/         ← Module-specific Spring @Configuration
```

**Flags:**
- Use cases defined as `@Service` concrete classes instead of interfaces
- Controllers in `domain/` or `application/`
- JPA entities in `domain/`
- Spring `@Repository` in `domain/`
- Exceptions at module root instead of `domain/exception/`

### 2. Domain Purity — The Most Critical Rule

**The domain layer MUST NOT import:**
```
org.springframework.*
jakarta.persistence.*
javax.swing.*
com.fasterxml.jackson.*
```

**How to check:**
```bash
grep -rn "import org.spring\|import jakarta.persistence\|import javax" src/main/java/{pkg}/*/domain/
```

**What IS allowed in domain:**
```java
import java.time.*;
import java.util.*;
import java.util.Optional;
// Own module's domain classes only
```

**Flags:**
- Any Spring annotation in domain model: `@Entity`, `@Component`, `@Service`, `@Data`
- `javax.swing`, `javax.sql` accidents from IDE autocomplete
- `org.springframework.data.domain.*` in domain events
- `org.springframework.cglib.*` in domain models

**Fix pattern:**
```java
// ❌ Domain model contaminated
import org.springframework.cglib.core.Local; // remove — unused IDE import
import org.springframework.data.domain.DomainEvents; // remove — annotation not needed here

// ✅ Domain model pure
import java.time.LocalDateTime;
import java.util.List;
```

### 3. Primary Ports (Input Ports) — Use Case Interfaces

**The controller must depend on an interface, not a concrete class:**

```java
// ❌ Wrong — controller depends on implementation
@RestController
public class WorkSpaceController {
    private final CreateWorkSpaceUseCase createWorkSpaceUseCase; // concrete @Service
}

// ✅ Correct — controller depends on port (interface)
@RestController
public class WorkSpaceController {
    private final WorkSpaceCreation workSpaceCreation; // interface in application/usecase/
}

// Interface (primary port)
public interface WorkSpaceCreation {
    WorkSpaceResponse create(CreateWorkSpaceCommand command);
}

// Implementation (application service)
@ApplicationService
public class WorkSpaceCommandService implements WorkSpaceCreation {
    @Override
    public WorkSpaceResponse create(CreateWorkSpaceCommand command) { ... }
}
```

**Flags:**
- `@Service` classes injected directly into controllers
- No interfaces defined for use cases
- Controllers importing from `application/service/` or `application/usecases/` concrete classes

### 4. Secondary Ports (Output Ports) — Repository & External Interfaces

**Repository interfaces must be in domain, implementations in infrastructure:**

```java
// ✅ domain/repository/WorkSpaceRepository.java (pure Java interface)
public interface WorkSpaceRepository {
    Optional<WorkSpace> findById(WorkSpaceId id);
    WorkSpace save(WorkSpace workSpace);
    Optional<WorkSpace> findByName(String name);
}

// ✅ infrastructure/persistence/adapter/WorkSpaceRepositoryAdapter.java
@PersistenceAdapter
public class WorkSpaceRepositoryAdapter implements WorkSpaceRepository {
    // Spring Data JPA implementation
}
```

**Non-repo secondary ports (email, payment, notifications):**
```java
// application/port/notification/WorkSpaceNotifier.java
public interface WorkSpaceNotifier {
    void notifyWorkSpaceCreated(WorkSpaceCreatedEvent event);
}
```

**Flags:**
- `@Repository` annotation on domain interface
- Spring Data `JpaRepository` extended directly in domain layer
- Infrastructure classes called directly from domain
- No interface defined for external services (email, payment)

### 5. AggregateRoot & Domain Events

**Domain events should be registered in the aggregate, not created in use cases:**

```java
// ❌ Wrong — use case creates and publishes event
@ApplicationService
public class WorkSpaceCommandService implements WorkSpaceCreation {
    public WorkSpaceResponse create(CreateWorkSpaceCommand cmd) {
        WorkSpace ws = new WorkSpace(cmd.name(), cmd.ownerId());
        WorkSpace saved = repository.save(ws);
        publisher.publishEvent(new WorkSpaceCreated(saved)); // ← use case creates event
        return toResponse(saved);
    }
}

// ✅ Correct — aggregate registers event, use case publishes after save
public class WorkSpace extends AggregateRoot<WorkSpace> {
    public static WorkSpace create(String name, Long ownerId) {
        WorkSpace ws = new WorkSpace(name, ownerId);
        ws.registerEvent(new WorkSpaceCreated(ws)); // ← domain decides which event
        return ws;
    }
}

@ApplicationService
public class WorkSpaceCommandService implements WorkSpaceCreation {
    public WorkSpaceResponse create(CreateWorkSpaceCommand cmd) {
        WorkSpace ws = WorkSpace.create(cmd.name(), cmd.ownerId());
        WorkSpace saved = repository.save(ws);
        publisher.publishAll(ws.getDomainEvents()); // ← use case just publishes
        ws.clearEvents();
        return toResponse(saved);
    }
}
```

**AggregateRoot base class:**
```java
// infrastructure/aggregate/AggregateRoot.java
public abstract class AggregateRoot<T> {
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    protected void registerEvent(DomainEvent event) {
        domainEvents.add(event);
    }

    public List<DomainEvent> getDomainEvents() {
        return Collections.unmodifiableList(domainEvents);
    }

    public void clearEvents() {
        domainEvents.clear();
    }
}
```

**Flags:**
- `publisher.publishEvent(new SomeEvent(...))` inside use case methods
- No `AggregateRoot` base class
- Domain events created with `new` in the application layer

### 6. Value Objects for Domain Primitives

**Raw primitives allow type confusion errors the compiler can't catch:**

```java
// ❌ Primitive — compiler can't tell workspaceId from userId
void addMember(Long workspaceId, Long userId, WorkspaceRole role)

// ✅ Value Objects — compiler enforces correct usage
void addMember(WorkSpaceId workspaceId, UserId userId, WorkspaceRole role)

// Value Object pattern (Java record — immutable by default)
public record WorkSpaceId(Long value) {
    public WorkSpaceId {
        if (value == null || value <= 0)
            throw new IllegalArgumentException("WorkSpaceId must be positive");
    }
}
```

**When to apply:**
- Any ID field used in multiple method signatures
- Domain concepts that carry business rules (Email, Money, Percentage)
- Fields that are passed between layers (avoids primitive obsession)

**Flags:**
- More than 2 `Long` or `String` parameters in a domain method signature
- No value object records/classes in `domain/model/`
- `ownerId`, `userId`, `workspaceId` all as `Long`

### 7. Meta-Annotations & Marker Annotations

**Self-documenting annotations that enforce layer roles:**

```java
// infrastructure/annotation/ApplicationService.java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Service
@Transactional(propagation = Propagation.REQUIRES_NEW, isolation = Isolation.REPEATABLE_READ)
public @interface ApplicationService {}

// infrastructure/annotation/DriverAdapter.java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@RestController
public @interface DriverAdapter {}

// infrastructure/annotation/PersistenceAdapter.java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Component
public @interface PersistenceAdapter {}
```

**Usage:**
```java
@ApplicationService          // instead of @Service + @Transactional
public class WorkSpaceCommandService implements WorkSpaceCreation { }

@DriverAdapter               // instead of @RestController
public class WorkSpaceController { }

@PersistenceAdapter          // instead of @Component
public class WorkSpaceRepositoryAdapter implements WorkSpaceRepository { }
```

**Flags:**
- `@Service` on application service implementations (use `@ApplicationService`)
- `@Component` on persistence adapters (use `@PersistenceAdapter`)
- `@Transactional` repeated on every use case method instead of centralized
- No custom annotations defined in `infrastructure/annotation/`

### 8. CQRS — Command vs Query Separation

**Application services should be split by intent:**

```java
// application/service/WorkSpaceCommandService.java — mutations
@ApplicationService
public class WorkSpaceCommandService implements WorkSpaceCreation, WorkSpaceUpdate, WorkSpaceArchival {
    // @Transactional REQUIRED
}

// application/service/WorkSpaceQueryService.java — reads
@ApplicationService
public class WorkSpaceQueryService implements WorkSpaceQuerying {
    // @Transactional(readOnly = true)
}
```

**Command DTOs** — represent intent to change state:
```java
// application/dto/command/ — inputs to mutations
public record CreateWorkSpaceCommand(String name, String description, Long ownerId) {}
```

**Query DTOs** — represent a read request:
```java
// application/dto/query/ — inputs to queries
public record GetWorkSpaceByIdQuery(Long id) {}
public record ListWorkSpacesByOwnerQuery(Long ownerId, int page, int size) {}
```

**Flags:**
- All use cases in a flat `usecases/` directory with no command/query distinction
- Query use cases with `@Transactional` (not readOnly)
- Commands and queries in the same `dto/command/` folder
- A single `WorkSpaceService` doing both reads and writes

### 9. Exception Hierarchy & Location

**Exceptions must live in `domain/exception/` for domain errors:**

```java
// ✅ domain/exception/WorkSpaceNotFoundException.java
public class WorkSpaceNotFoundException extends ResourceNotFoundException {
    public WorkSpaceNotFoundException(WorkSpaceId id) {
        super("Workspace not found: " + id.value(), "WS_NOT_FOUND");
    }
}

// ✅ domain/exception/WorkSpaceAlreadyArchivedException.java
public class WorkSpaceAlreadyArchivedException extends BusinessException {
    public WorkSpaceAlreadyArchivedException(WorkSpaceId id) {
        super("Workspace " + id.value() + " is already archived", "WS_ALREADY_ARCHIVED");
    }
}
```

**Flags:**
- Exceptions in `{module}/exception/` (module root) instead of `domain/exception/`
- `throw new RuntimeException(...)` in application or domain layer — always use typed exceptions
- `throw new IllegalAccessException(...)` in domain methods — use domain-specific exceptions
- `IllegalArgumentException` thrown from domain for business rule violations — use `BusinessException`

### 10. ArchUnit Tests

**Architecture rules must be verified automatically:**

```java
@AnalyzeClasses(packages = "com.tramite.online")
public class HexagonalArchitectureTest {

    @ArchTest
    static final ArchRule domainMustNotDependOnSpring =
        noClasses().that().resideInAPackage("..domain..")
            .should().dependOnClassesThat()
            .resideInAPackage("org.springframework..");

    @ArchTest
    static final ArchRule applicationMustNotDependOnAdapters =
        noClasses().that().resideInAPackage("..application..")
            .should().dependOnClassesThat()
            .resideInAPackage("..infrastructure..");

    @ArchTest
    static final ArchRule adaptersMustNotAccessDomainDirectly =
        noClasses().that().resideInAPackage("..infrastructure.web..")
            .should().dependOnClassesThat()
            .resideInAPackage("..domain..");

    @ArchTest
    static final ArchRule applicationServicesShouldBeAnnotated =
        classes().that().resideInAPackage("..application.service..")
            .should().beAnnotatedWith(ApplicationService.class);
}
```

**Flags:**
- No `ArchUnit` dependency in `pom.xml`
- No `HexagonalArchitectureTest` or equivalent test class
- Only `ModularityTest` (Spring Modulith) — not sufficient for intra-module layer checks

---

## Architecture Scorecard — Quick Reference

| Check | Command to verify |
|-------|-------------------|
| Domain free of Spring | `grep -rn "import org.spring" src/**/domain/` |
| Primary ports as interfaces | `ls src/**/application/usecase/*.java` → verify `interface` keyword |
| Use cases implement ports | `grep -n "implements" src/**/application/service/*.java` |
| @ApplicationService present | `grep -rn "@ApplicationService" src/` |
| AggregateRoot exists | `find src -name "AggregateRoot.java"` |
| ArchUnit tests | `find src/test -name "*ArchTest*" -o -name "*Architecture*"` |
| Exceptions in domain | `find src -path "*/domain/exception/*.java"` |
| Value Objects | `find src -path "*/domain/model/*.java" -name "*.java" \| xargs grep -l "record"` |

---

## Token Optimization

- Run the grep commands above first to scope the review
- Focus on `domain/` imports first — highest severity
- Check one module fully before moving to another
- Reference file paths and line numbers, never quote full classes
