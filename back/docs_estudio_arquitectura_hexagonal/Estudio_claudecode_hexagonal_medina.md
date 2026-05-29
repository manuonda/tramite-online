# Guía de Estudio: Arquitectura Hexagonal en Spring Modulith

> **Referencia base:** [hexagonal-spring-ref-app](../../../projects_arquitectura_hexagonal/hexagonal-spring-ref-app)  
> **Proyecto destino:** tramite-online-platform (este repositorio)  
> **Stack:** Java 25 · Spring Boot 4 · Spring Modulith 2 · JPA/Flyway

---

## Índice

1. [Por qué hexagonal + Modulith](#1-por-qué-hexagonal--modulith)
2. [Estado actual del proyecto](#2-estado-actual-del-proyecto)
3. [Conceptos clave del proyecto de referencia](#3-conceptos-clave-del-proyecto-de-referencia)
4. [Hoja de ruta por fases](#4-hoja-de-ruta-por-fases)
   - [Fase 1 — Value Objects y validación en el dominio](#fase-1--value-objects-y-validación-en-el-dominio)
   - [Fase 2 — Separación clara de puertos](#fase-2--separación-clara-de-puertos)
   - [Fase 3 — CQRS con Command/Query Bus](#fase-3--cqrs-con-commandquery-bus)
   - [Fase 4 — Manejo funcional de errores con Vavr](#fase-4--manejo-funcional-de-errores-con-vavr)
   - [Fase 5 — Tests de arquitectura con ArchUnit](#fase-5--tests-de-arquitectura-con-archunit)
5. [Mapa de equivalencias ref-app → tramite-online](#5-mapa-de-equivalencias-ref-app--tramite-online)
6. [Estructura de paquetes objetivo](#6-estructura-de-paquetes-objetivo)
7. [Flujo de datos completo](#7-flujo-de-datos-completo)
8. [Decisiones de diseño importantes](#8-decisiones-de-diseño-importantes)
9. [Checklist de implementación](#9-checklist-de-implementación)

---

## 1. Por qué hexagonal + Modulith

Spring Modulith organiza el código en **módulos lógicos** dentro de un único artefato desplegable.
Cada módulo tiene su propio contexto y boundaries bien definidos.
La Arquitectura Hexagonal (Ports & Adapters) define **cómo se estructura internamente cada módulo**.

```
Spring Modulith  →  decide QUÉ módulos existen y cómo se comunican entre sí
Arquitectura Hexagonal  →  decide CÓMO se estructura el interior de cada módulo
```

El resultado es un sistema que puede escalar: los módulos se convierten en microservicios sin cambiar
la lógica de dominio, solo reemplazando adaptadores.

---

## 2. Estado actual del proyecto

### Lo que ya existe y está bien
- Separación en paquetes `domain/`, `application/`, `infraestructure/`
- Value Objects incipientes: `Email`, `UserName` en el módulo `user`
- Repositorios como interfaces en el dominio: `WorkSpaceRepository`, `WorkSpaceMemberRepository`
- Adaptadores de persistencia: `WorkSpaceRepositoryAdapter`, `WorkSpaceMemberRepositoryAdapter`
- Domain Events: `WorkSpaceCreated`, `WorkSpaceUpdated`, `WorkSpaceDeleted`, etc.
- Use Cases como clases: `CreateWorkSpaceUseCase`, `DeleteWorkSpaceUseCase`, etc.

### Lo que se puede mejorar (objetivo de esta guía)
| Área | Situación actual | Objetivo |
|------|-----------------|----------|
| `WorkSpace` domain model | POJO con getters/setters | Value objects + `validateThenCreate` |
| Use Cases | Clases `@Service` concretas | Interfaces anotadas con `@UseCase` |
| Errores | Excepciones (`throw`) | `Either<Error, T>` (sin excepciones) |
| Commands | Records con datos mixtos | Commands validados con `Validation<Error, T>` |
| Controller | Llama directamente al UseCase | Llama a CommandBus/QueryBus |
| Tests de arquitectura | `ModularityTest` (Modulith) | + ArchUnit por módulo |

---

## 3. Conceptos clave del proyecto de referencia

### 3.1 Ports & Adapters

```
┌─────────────────────────────────────────────┐
│                  MÓDULO                     │
│                                             │
│  [Input Adapter]  →  [Input Port]           │
│  (Controller)         (UseCase interface)   │
│                           │                 │
│                    [Application Handler]    │
│                           │                 │
│                    [Output Port]            │
│                    (Repository interface)   │
│                           │                 │
│  [Output Adapter]  ←──────┘                 │
│  (JPA/REST/etc)                             │
└─────────────────────────────────────────────┘
```

- **Input Port**: interfaz que define lo que el módulo puede hacer (`CreateWorkSpaceUseCase`)
- **Output Port**: interfaz que define lo que el módulo necesita del exterior (`WorkSpaceRepository`)
- **Handler**: implementa el Input Port, orquesta la lógica sin conocer detalles de infraestructura

### 3.2 Value Objects

Un Value Object es un objeto inmutable que encapsula un concepto del dominio con su validación.

```java
// ❌ Antes — string suelto
public class WorkSpace {
    private String name; // ¿qué reglas tiene name?
}

// ✅ Después — Value Object
public record WorkSpaceName(String value) {
    public WorkSpaceName {
        if (value == null || value.isBlank())
            throw new IllegalArgumentException("name cannot be blank");
        if (value.length() > 100)
            throw new IllegalArgumentException("name too long");
    }
}
```

En el proyecto de referencia esto se lleva más lejos con `Validation<Error, T>` de Vavr (Fase 4).

### 3.3 CQRS (Command Query Responsibility Segregation)

Separa las operaciones que **modifican estado** (Commands) de las que **leen estado** (Queries).

```
Command → modifica → no devuelve datos (o solo el ID creado)
Query   → lee     → devuelve datos, no modifica estado
```

### 3.4 Command/Query Bus

Un Bus es un despachador que recibe un Command o Query y lo enruta al Handler correcto
sin que el Controller conozca al Handler directamente.

```java
// Sin Bus (acoplamiento directo)
class WorkSpaceController {
    private CreateWorkSpaceUseCase createUseCase; // depende del handler concreto
}

// Con Bus (desacoplado)
class WorkSpaceController {
    private CommandBus commandBus; // solo conoce el bus
    // commandBus.execute(new CreateWorkSpaceCommand(...)) → enruta solo
}
```

### 3.5 Sealed Interfaces para errores

Reemplaza las excepciones por un tipo algebraico que fuerza al compilador a tratar todos los casos:

```java
public sealed interface WorkSpaceError {
    record NotFound(Long id)          implements WorkSpaceError {}
    record NameAlreadyExists(String n) implements WorkSpaceError {}
    record InvalidName(String reason)  implements WorkSpaceError {}
}
```

---

## 4. Hoja de ruta por fases

---

### Fase 1 — Value Objects y validación en el dominio

**Duración estimada:** 1-2 días  
**Módulo piloto:** `workspace`  
**Objetivo:** el dominio expresa sus invariantes sin depender de nada externo.

#### Qué hacer

**1.1 — Convertir campos primitivos de `WorkSpace` a Value Objects**

```java
// Crear: workspace/domain/model/vo/WorkSpaceName.java
public record WorkSpaceName(String value) {
    public WorkSpaceName {
        Objects.requireNonNull(value);
        if (value.isBlank()) throw new IllegalArgumentException("name required");
        if (value.length() > 100) throw new IllegalArgumentException("name max 100 chars");
    }
}

// Crear: workspace/domain/model/vo/WorkSpaceDescription.java
public record WorkSpaceDescription(String value) {
    public WorkSpaceDescription {
        if (value != null && value.length() > 500)
            throw new IllegalArgumentException("description max 500 chars");
    }
}
```

**1.2 — Aplicar factory method `validateThenCreate` en la entidad**

Inspirado en `Article.validateThenCreate(...)` del proyecto de referencia:

```java
// workspace/domain/model/WorkSpace.java
public class WorkSpace {
    private final WorkSpaceName name;
    private final WorkSpaceDescription description;
    // ...

    private WorkSpace(WorkSpaceName name, WorkSpaceDescription description, Long ownerId) { ... }

    public static WorkSpace create(String name, String description, Long ownerId) {
        return new WorkSpace(
            new WorkSpaceName(name),
            new WorkSpaceDescription(description),
            ownerId
        );
    }
}
```

**1.3 — Eliminar `WorkSpaceValidator` como clase separada**

La validación vive en los Value Objects, no en un servicio de validación externo.

#### Qué NO tocar aún
- No cambies los adaptadores JPA (`WorkSpaceEntity` sigue siendo un POJO con getters/setters)
- No cambies los controladores
- Solo trabaja dentro de `domain/model/`

#### Referencia en ref-app
- `application-core/domain/src/main/java/.../entities/Title.java`
- `application-core/domain/src/main/java/.../entities/Article.java`

---

### Fase 2 — Separación clara de puertos

**Duración estimada:** 2-3 días  
**Objetivo:** los Use Cases son interfaces, los Handlers son implementaciones package-private.

#### Estado actual
```java
// ❌ Actual: UseCase ES el Handler (clase concreta con @Service)
@Service
public class CreateWorkSpaceUseCase {
    public WorkSpaceResponse createWorkSpace(CreateWorkSpaceCommand command) { ... }
}
```

#### Objetivo
```java
// ✅ Input Port — interfaz pública
// workspace/application/ports/in/CreateWorkSpaceInputPort.java
@UseCase
public interface CreateWorkSpaceInputPort {
    WorkSpaceResponse handle(CreateWorkSpaceCommand command);
}

// ✅ Handler — implementación package-private
// workspace/application/CreateWorkSpaceHandler.java
@ApplicationService
@RequiredArgsConstructor
class CreateWorkSpaceHandler implements CreateWorkSpaceInputPort {
    private final WorkSpaceRepository workSpaceRepository;

    @Override
    @Transactional
    public WorkSpaceResponse handle(CreateWorkSpaceCommand command) { ... }
}
```

#### Qué hacer

**2.1 — Crear interfaces Input Port para cada Use Case existente**

```
workspace/application/ports/in/
    CreateWorkSpaceInputPort.java
    UpdateWorkSpaceInputPort.java
    DeleteWorkSpaceInputPort.java
    ArchiveWorkSpaceInputPort.java
    GetWorkSpaceByIdInputPort.java
    ListWorkSpacesByOwnerInputPort.java
    AddMemberInputPort.java
    RemoveMemberInputPort.java
    UpdateMemberRoleInputPort.java
    ListMembersInputPort.java
```

**2.2 — Renombrar clases UseCase a Handler e implementar la interfaz**

**2.3 — Verificar que Output Ports (repositorios) ya son interfaces**

`WorkSpaceRepository` ya está como interfaz en `domain/repository/` ✓  
Los adaptadores JPA la implementan ✓

#### Anotaciones a crear (o usar del shared-kernel)

```java
// shared/annotation/UseCase.java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface UseCase {}

// shared/annotation/ApplicationService.java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Service  // Spring sigue encontrando el bean
public @interface ApplicationService {}
```

#### Referencia en ref-app
- `application-core/input-ports/src/main/java/.../ports/in/GetAllArticlesUseCase.java`
- `application-core/application/src/main/java/.../CreateArticleHandler.java`

---

### Fase 3 — CQRS con Command/Query Bus

**Duración estimada:** 2-3 días  
**Objetivo:** el Controller no conoce al Handler, solo conoce el Bus.

#### Qué hacer

**3.1 — Clasificar operaciones existentes**

| Operación | Tipo |
|-----------|------|
| `createWorkSpace` | Command |
| `updateWorkSpace` | Command |
| `deleteWorkSpace` | Command |
| `archiveWorkSpace` | Command |
| `addMember` | Command |
| `removeMember` | Command |
| `updateMemberRole` | Command |
| `getWorkSpaceById` | Query |
| `listWorkSpacesByOwner` | Query |
| `listMembers` | Query |

**3.2 — Convertir Commands a records inmutables con validación**

```java
// workspace/application/command/CreateWorkSpaceCommand.java
public record CreateWorkSpaceCommand(String name, String description, Long ownerId) {

    public static CreateWorkSpaceCommand of(String name, String description, Long ownerId) {
        if (name == null || name.isBlank())
            throw new IllegalArgumentException("name required");
        return new CreateWorkSpaceCommand(name, description, ownerId);
    }
}
```

**3.3 — Crear interfaces Command/Query para el Handler**

```java
// Interfaz funcional del handler de comando
public interface CommandHandler<C extends Command, R> {
    R handle(C command);
}

// Interfaz funcional del handler de query
public interface QueryHandler<Q extends Query, R> {
    R handle(Q query);
}
```

**3.4 — Implementar Bus simple con Spring**

```java
// shared/bus/CommandBus.java
@Component
public class CommandBus {
    private final ApplicationContext context;

    @SuppressWarnings("unchecked")
    public <R> R execute(Command command) {
        // Resuelve el handler por tipo de command via Spring context
        var handlerType = resolveHandlerType(command.getClass());
        var handler = (CommandHandler<Command, R>) context.getBean(handlerType);
        return handler.handle(command);
    }
}
```

> **Alternativa más rápida:** usar directamente las dependencias de `emedina/sharedkernel`
> que ya usa el proyecto de referencia. Son librerías open source en Maven Central.

**3.5 — Actualizar el Controller para usar el Bus**

```java
// ❌ Antes
@PostMapping
public ResponseEntity<?> create(@RequestBody CreateWorkSpaceRequest req) {
    return ResponseEntity.ok(createWorkSpaceUseCase.createWorkSpace(...));
}

// ✅ Después
@PostMapping
public ResponseEntity<?> create(@RequestBody CreateWorkSpaceRequest req) {
    var command = CreateWorkSpaceCommand.of(req.name(), req.description(), req.ownerId());
    var result = commandBus.execute(command);
    return ResponseEntity.status(HttpStatus.CREATED).body(result);
}
```

#### Referencia en ref-app
- `api-adapter/src/main/java/.../ArticleController.java`
- `spring-boot-assembly/src/main/java/.../CommandQueryBusAssembler.java`

---

### Fase 4 — Manejo funcional de errores con Vavr

**Duración estimada:** 3-4 días  
**Objetivo:** eliminar `throw` del dominio y application, usar `Either<Error, T>`.

> Esta es la fase más disruptiva. Aplicar después de las Fases 1-3.

#### Añadir dependencia

```xml
<!-- pom.xml -->
<dependency>
    <groupId>io.vavr</groupId>
    <artifactId>vavr</artifactId>
    <version>0.10.4</version>
</dependency>
```

**4.1 — Crear jerarquía de errores por módulo**

```java
// workspace/domain/error/WorkSpaceError.java
public sealed interface WorkSpaceError {
    record NotFound(Long id)              implements WorkSpaceError {}
    record NameAlreadyExists(String name) implements WorkSpaceError {}
    record AlreadyArchived(Long id)       implements WorkSpaceError {}
    record InvalidData(String reason)     implements WorkSpaceError {}
}
```

**4.2 — Cambiar firma de Use Cases**

```java
// ❌ Antes — lanza excepción
WorkSpaceResponse createWorkSpace(CreateWorkSpaceCommand command);

// ✅ Después — devuelve Either
Either<WorkSpaceError, WorkSpaceResponse> handle(CreateWorkSpaceCommand command);
```

**4.3 — Cambiar el Handler**

```java
@Override
@Transactional
public Either<WorkSpaceError, WorkSpaceResponse> handle(CreateWorkSpaceCommand command) {
    return workSpaceRepository.findByName(command.name())
        .map(existing -> Either.<WorkSpaceError, WorkSpaceResponse>left(
            new WorkSpaceError.NameAlreadyExists(command.name())))
        .orElseGet(() -> {
            var ws = WorkSpace.create(command.name(), command.description(), command.ownerId());
            return workSpaceRepository.save(ws)
                .map(WorkSpaceMapper::toResponse);
        });
}
```

**4.4 — Traducir el Either en el Controller**

```java
return commandBus.<WorkSpaceError, WorkSpaceResponse, CreateWorkSpaceCommand>execute(command)
    .fold(
        error -> mapErrorToResponse(error),      // Left → HTTP error
        response -> ResponseEntity.status(201).body(response)  // Right → HTTP 201
    );
```

#### Referencia en ref-app
- `shared-kernel/src/main/java/.../error/Error.java` (sealed interface)
- `application-core/application/src/main/java/.../CreateArticleHandler.java` (uso de flatMap)
- `api-adapter/src/main/java/.../ArticleController.java` (fold al final)

---

### Fase 5 — Tests de arquitectura con ArchUnit

**Duración estimada:** 1-2 días  
**Objetivo:** que el compilador (en tests) garantice que las reglas hexagonales se cumplen.

#### Añadir dependencia

```xml
<dependency>
    <groupId>com.tngtech.archunit</groupId>
    <artifactId>archunit-junit5</artifactId>
    <version>1.3.0</version>
    <scope>test</scope>
</dependency>
```

**5.1 — Test: el dominio no depende de infraestructura**

```java
@AnalyzeClasses(packages = "com.tramite.online.workspace")
class WorkSpaceArchitectureTest {

    @ArchTest
    static final ArchRule domain_no_depende_de_infraestructura =
        noClasses().that().resideInAPackage("..domain..")
            .should().dependOnClassesThat()
            .resideInAPackage("..infraestructure..");

    @ArchTest
    static final ArchRule domain_no_depende_de_spring =
        noClasses().that().resideInAPackage("..domain..")
            .should().dependOnClassesThat()
            .resideInAPackage("org.springframework..");

    @ArchTest
    static final ArchRule handlers_son_package_private =
        classes().that().haveNameMatching(".*Handler")
            .should().notBePublic()
            .because("los handlers son detalles de implementación");
}
```

#### Referencia en ref-app
- `spring-boot-assembly/src/test/java/.../DomainArchitectureTest.java`
- `spring-boot-assembly/src/test/java/.../AdaptersArchitectureTest.java`
- `spring-boot-assembly/src/test/java/.../HandlerArchitectureTest.java`

---

## 5. Mapa de equivalencias ref-app → tramite-online

| ref-app | tramite-online (workspace) |
|---------|---------------------------|
| `Article` | `WorkSpace` |
| `ArticleId` | `WorkSpaceId` (a crear) |
| `Title` | `WorkSpaceName` |
| `Content` | `WorkSpaceDescription` |
| `Author` | (no aplica directo; `ownerId` referencia al módulo `user`) |
| `CreateArticleCommand` | `CreateWorkSpaceCommand` |
| `CreateArticleHandler` | `CreateWorkSpaceHandler` |
| `CreateArticleUseCase` | `CreateWorkSpaceInputPort` |
| `ArticleRepository` (output port) | `WorkSpaceRepository` ✓ (ya existe) |
| `InMemoryArticleRepository` | `WorkSpaceRepositoryAdapter` ✓ (ya existe, es JPA) |
| `AuthorOutputPort` | Port para llamar al módulo `user` |
| `ArticleController` | `WorkSpaceController` |
| `CommandBus` + `QueryBus` | A implementar en `shared/bus/` |
| `Error` sealed interface | `WorkSpaceError` sealed interface |

---

## 6. Estructura de paquetes objetivo

```
com.tramite.online.workspace/
│
├── domain/
│   ├── model/
│   │   ├── WorkSpace.java              ← entidad con validateThenCreate
│   │   ├── WorkSpaceMember.java
│   │   ├── WorkspaceRole.java
│   │   └── vo/
│   │       ├── WorkSpaceName.java      ← Value Object
│   │       └── WorkSpaceDescription.java
│   ├── repository/
│   │   ├── WorkSpaceRepository.java    ← Output Port (interfaz) ✓
│   │   └── WorkSpaceMemberRepository.java ✓
│   ├── event/
│   │   ├── WorkSpaceCreated.java ✓
│   │   └── ...
│   └── error/
│       └── WorkSpaceError.java         ← sealed interface (nuevo)
│
├── application/
│   ├── ports/
│   │   └── in/
│   │       ├── CreateWorkSpaceInputPort.java
│   │       ├── UpdateWorkSpaceInputPort.java
│   │       └── ...
│   ├── command/
│   │   ├── CreateWorkSpaceCommand.java ✓ (mover aquí)
│   │   └── ...
│   ├── query/
│   │   ├── GetWorkSpaceByIdQuery.java  ← nuevo
│   │   └── ListWorkSpacesByOwnerQuery.java
│   ├── dto/
│   │   └── response/
│   │       └── WorkSpaceResponse.java ✓
│   ├── CreateWorkSpaceHandler.java     ← package-private
│   ├── UpdateWorkSpaceHandler.java
│   └── ...
│
└── infraestructure/
    ├── persistence/
    │   ├── entity/
    │   │   └── WorkSpaceEntity.java ✓
    │   ├── repository/
    │   │   └── WorkSpaceJpaRepository.java ✓
    │   ├── adapter/
    │   │   └── WorkSpaceRepositoryAdapter.java ✓
    │   └── mapper/
    │       └── WorkSpaceMapper.java ✓
    └── web/
        └── controller/
            └── WorkSpaceController.java ✓
```

---

## 7. Flujo de datos completo

### Crear un WorkSpace (objetivo final)

```
POST /api/workspaces
{name, description, ownerId}
         │
         ▼
WorkSpaceController
  └─ CreateWorkSpaceCommand.of(name, description, ownerId)
         │ valida inputs (Fase 1-3)
         ▼
  commandBus.execute(command)
         │
         ▼
CreateWorkSpaceHandler          ← package-private
  ├─ workSpaceRepository.findByName(...)  ← Output Port
  │       └─ WorkSpaceRepositoryAdapter   ← adaptador JPA
  │
  ├─ WorkSpace.create(name, description, ownerId)  ← dominio puro
  │       └─ new WorkSpaceName(name)               ← valida VO
  │
  ├─ workSpaceRepository.save(workspace)
  │
  └─ eventPublisher.publishEvent(new WorkSpaceCreated(...))
         │
         ▼
Either<WorkSpaceError, WorkSpaceResponse>
         │
         ▼
WorkSpaceController
  └─ .fold(error → HTTP 4xx, response → HTTP 201)
```

---

## 8. Decisiones de diseño importantes

### ¿Por qué los Handlers deben ser package-private?

Porque son un **detalle de implementación** del módulo. Nadie fuera del módulo
debe llamar al Handler directamente — solo a través del Bus o del Input Port.
Esto lo fuerzan los tests de arquitectura (Fase 5).

### ¿Por qué `Either` en lugar de excepciones?

Las excepciones son invisibles en la firma del método. `Either<Error, T>` hace que
el compilador obligue al llamador a manejar el caso de error.
Además, es composable con `flatMap` — puedes encadenar operaciones sin `try/catch`.

### ¿Cómo se comunican módulos en Spring Modulith?

No llames directamente a clases de otro módulo. Usa:
1. **Domain Events** (ya tienes `WorkSpaceCreated`) → el módulo `form` puede reaccionar
2. **Input Ports** expuestos en la API pública del módulo (package `api/`)
3. Nunca inyectes un repositorio de otro módulo

### ¿Value Objects con `record` o con clase?

`record` es ideal para Value Objects simples (inmutables, sin herencia).
Usa clase cuando necesites herencia o lógica más compleja.

---

## 9. Checklist de implementación

### Fase 1 — Value Objects
- [ ] Crear `WorkSpaceName` con validación
- [ ] Crear `WorkSpaceDescription` con validación
- [ ] Aplicar VOs en `WorkSpace.create(...)`
- [ ] Eliminar `WorkSpaceValidator` (la validación vive en los VOs)
- [ ] Tests unitarios de los VOs

### Fase 2 — Separación de puertos
- [ ] Crear `@UseCase` y `@ApplicationService` en shared
- [ ] Crear interfaces Input Port para cada operación
- [ ] Renombrar clases UseCase → Handler
- [ ] Hacer Handlers package-private
- [ ] Tests unitarios de Handlers (mockeando Output Ports)

### Fase 3 — CQRS con Bus
- [ ] Clasificar operaciones en Command/Query
- [ ] Commands como records inmutables con factory method
- [ ] Queries como records inmutables
- [ ] Implementar `CommandBus` y `QueryBus` en shared
- [ ] Actualizar Controller para usar los Bus

### Fase 4 — Errores funcionales (Vavr)
- [ ] Añadir dependencia Vavr
- [ ] Crear `WorkSpaceError` sealed interface
- [ ] Cambiar firmas de Input Ports a `Either<WorkSpaceError, T>`
- [ ] Actualizar Handlers (eliminar throws, usar flatMap)
- [ ] Actualizar Controller (usar fold)
- [ ] Eliminar excepciones de dominio (`WorkSpaceNotFoundException`, etc.)

### Fase 5 — Tests de arquitectura
- [ ] Añadir dependencia ArchUnit
- [ ] Test: dominio no depende de infraestructura
- [ ] Test: dominio no depende de Spring
- [ ] Test: Handlers son package-private
- [ ] Test: Controllers no acceden a repositorios directamente
- [ ] Integrar en CI

---

> **Proyecto de referencia completo:**  
> `/home/manuonda/projects/projects_arquitectura_hexagonal/hexagonal-spring-ref-app`  
>
> Cada vez que tengas dudas sobre cómo implementar algo, busca el equivalente
> en ese proyecto. La correspondencia está en la sección 5 de esta guía.
