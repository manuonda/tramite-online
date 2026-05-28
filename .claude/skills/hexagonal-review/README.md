# Hexagonal Architecture Review

**Load**: `view .claude/skills/hexagonal-review/SKILL.md`

---

## Description

Systematic code review checklist for Java/Spring Boot projects implementing Hexagonal Architecture (Ports & Adapters). Checks layer purity, port definitions, adapter compliance, domain event patterns, Value Objects, CQRS separation, meta-annotations, and ArchUnit test coverage.

---

## Use Cases

- "Review hexagonal architecture of the workspace module"
- "Check if this module follows hexagonal patterns"
- "Hexagonal review before merging"
- "Is the domain layer pure?"
- "Check my ports and adapters"
- "Does this follow the README_HEXAGONAL patterns?"

---

## What It Checks

1. Layer structure (domain / application / infrastructure)
2. Domain purity — no Spring/JPA/framework imports
3. Primary ports — use case interfaces in `application/usecase/`
4. Secondary ports — repository and external service interfaces
5. AggregateRoot pattern and domain event registration
6. Value Objects for domain primitives
7. Meta-annotations (@ApplicationService, @DriverAdapter, @PersistenceAdapter)
8. CQRS command/query separation
9. Exception location and hierarchy
10. ArchUnit test coverage
