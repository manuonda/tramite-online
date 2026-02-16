# Guía de Arquitectura: Modular Monolith con DDD y Hexagonal Architecture

## Tabla de Contenidos

- [Introducción](#introducción)
- [Patrones Arquitectónicos](#patrones-arquitectónicos)
- [Estructura por Capas](#estructura-por-capas)
- [Módulos del Sistema](#módulos-del-sistema)
- [Conceptos Clave DDD](#conceptos-clave-ddd)
- [Flujos de Ejemplo](#flujos-de-ejemplo)
- [Árbol Completo de Archivos](#árbol-completo-de-archivos)

---

## Introducción

Este módulo (`meetup4j-modulith-ddd-ha`) implementa un sistema de gestión de eventos aplicando **Domain-Driven Design (DDD)** y **Arquitectura Hexagonal** en un **Monolito Modular** con Spring Boot.

### Características Principales

- ✅ Separación clara entre Domain, Application, Infrastructure e Interfaces
- ✅ Domain Model rico con Aggregates y Value Objects
- ✅ CQRS: Separación de Commands y Queries
- ✅ Event-Driven Architecture para comunicación entre módulos
- ✅ Repository Pattern con adaptadores
- ✅ Spring Modulith para verificación de boundaries
- ✅ Validación mediante ArchUnit tests

---

## Patrones Arquitectónicos

### 1. Arquitectura Hexagonal (Ports & Adapters)

La arquitectura hexagonal organiza el código en capas concéntricas donde las dependencias fluyen hacia el centro (Domain):

```
┌─────────────────────────────────────────────────────┐
│         INTERFACES (REST Controllers)               │
│              Adaptadores de Entrada                 │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│         APPLICATION (Use Cases)                     │
│      Orquesta Domain y coordina flujos              │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│         DOMAIN (Lógica de Negocio)                  │
│   Aggregates, Value Objects, Domain Events          │
│   Repository Interfaces (Ports)                     │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│     INFRASTRUCTURE (Persistencia)                   │
│   JPA Entities, Repository Adapters                 │
│              Adaptadores de Salida                  │
└─────────────────────────────────────────────────────┘
                        ↓
                    Database
```

**Principios:**
- El **Domain** no depende de nada (frameworks, persistencia, UI)
- Las capas externas dependen de las internas
- La comunicación se hace mediante **interfaces** (ports)
- Los **adaptadores** implementan las interfaces

### 2. Domain-Driven Design (DDD)

#### Building Blocks Aplicados:

| Patrón | Implementación | Ejemplos |
|--------|----------------|----------|
| **Aggregate Root** | Entidad raíz que controla el ciclo de vida | `Event`, `EventRegistration` |
| **Value Object** | Objetos inmutables que representan conceptos | `EventCode`, `Email`, `Schedule`, `Capacity` |
| **Domain Event** | Eventos que representan hechos del negocio | `EventCreated`, `RegistrationAdded` |
| **Repository** | Abstracción para persistencia | `EventRepository`, `RegistrationRepository` |
| **Domain Exception** | Excepciones que representan violaciones de reglas | `EventCancellationException` |

#### Agregados en el Sistema:

**Event Aggregate:**
```
Event (Root)
├── EventId (VO)
├── EventCode (VO)
├── EventDetails (VO)
│   ├── title
│   ├── description
│   └── imageUrl
├── Schedule (VO)
│   ├── startDateTime
│   └── endDateTime
├── Capacity (VO)
├── TicketPrice (VO)
├── EventLocation (VO)
├── EventType (Enum)
└── EventStatus (Enum)
```

### 3. CQRS (Command Query Responsibility Segregation)

Separación de operaciones de escritura (Commands) y lectura (Queries):

**Commands (Escritura):**
- `CreateEventCmd` → `CreateEventUseCase` → Modifica estado
- `RegisterAttendeeCmd` → `RegisterAttendeeUseCase` → Modifica estado
- Publican Domain Events

**Queries (Lectura):**
- `EventQueryService` → `EventQueryRepository` → Solo lectura
- Retornan View Models (`EventVM`, `RegistrationVM`)
- Optimizados para presentación

### 4. Modular Monolith (Spring Modulith)

Módulos independientes que se comunican mediante:

**Comunicación Síncrona:**
```java
// Registrations module llama a Events module
@NamedInterface
public interface EventsAPI {
    void reserveSlotForEvent(EventCode eventCode);
}
```

**Comunicación Asíncrona:**
```java
// Events module publica evento
domainEventPublisher.publish(new EventCreated(...));

// Notifications module escucha
@ApplicationModuleListener
void onEventCreated(EventCreated event) {
    // Enviar notificación
}
```

---

## Estructura por Capas

Cada módulo funcional (events, registrations) sigue esta estructura:

```
module/
├── domain/                    # CAPA DE DOMINIO
│   ├── model/                # Aggregate Roots + Entities
│   ├── vo/                   # Value Objects
│   ├── repository/           # Repository Interfaces (Ports)
│   ├── event/                # Domain Events
│   └── exception/            # Domain Exceptions
│
├── application/               # CAPA DE APLICACIÓN
│   ├── command/              # Use Cases de Escritura
│   │   ├── XxxUseCase.java
│   │   └── dto/              # Command DTOs
│   ├── query/                # Use Cases de Lectura
│   │   ├── XxxQueryService.java
│   │   ├── XxxQueryRepository.java (Interface)
│   │   └── dto/              # View Models (Read Models)
│   └── XxxAPI.java           # Public API del módulo (@NamedInterface)
│
├── infra/                    # CAPA DE INFRAESTRUCTURA
│   └── persistence/
│       ├── XxxEntity.java          # JPA Entity
│       ├── XxxEntityMapper.java    # Entity → Domain
│       ├── XxxViewMapper.java      # Entity → ViewModel
│       ├── XxxRepositoryAdapter.java # Implementa Repository Interfaces
│       └── JpaXxxRepository.java   # Spring Data JPA
│
└── interfaces/               # CAPA DE INTERFACES (Adaptadores de Entrada)
    └── rest/
        ├── XxxController.java      # REST Controller
        ├── XxxRequest.java         # Request DTOs
        ├── XxxResponse.java        # Response DTOs
        └── converters/
            └── StringToXxxConverter.java  # Type Converters
```

### Flujo de Dependencias

```
REST Controller  →  Use Case  →  Domain Model  ←  Repository Adapter
                                      ↑
                                Repository Interface (Port)
```

**Reglas:**
1. ❌ Domain NO puede depender de Infrastructure
2. ❌ Domain NO puede depender de Application
3. ✅ Infrastructure implementa interfaces definidas en Domain
4. ✅ Application orquesta Domain usando los Ports

---

## Módulos del Sistema

### 📦 1. EVENTS Module

**Responsabilidad:** Gestión del ciclo de vida de eventos (crear, publicar, cancelar)

#### Domain Layer (`/events/domain/`)

**Aggregate Root:**
```java
// events/domain/model/Event.java
public class Event extends AggregateRoot {
    private EventId id;
    private EventCode code;
    private EventDetails details;
    private Schedule schedule;
    private EventType type;
    private Capacity capacity;
    private TicketPrice ticketPrice;
    private EventLocation location;
    private EventStatus status;
    private int bookedSeats;

    // Factory method
    public static Event createDraft(...) { }

    // Business methods
    public void publish() {
        // Validations
        this.status = PUBLISHED;
        register(new EventPublished(this.code));
    }

    public void cancel() {
        // Business rules: cannot cancel if started
        this.status = CANCELLED;
        register(new EventCancelled(this.code));
    }

    public void reserveSlot() {
        // Business rules: check capacity
        this.bookedSeats++;
    }
}
```

**Value Objects principales:**
- `EventCode`: Código único legible (TSID String)
- `EventDetails`: title, description, imageUrl (inmutable)
- `Schedule`: startDateTime, endDateTime (validación: end >= start)
- `Capacity`: Integer o UNLIMITED (validación: 1-10000)
- `EventLocation`: Venue (offline) O VirtualLink (online) - validación XOR

**Repository Interface:**
```java
// events/domain/repository/EventRepository.java
public interface EventRepository {
    Event create(Event event);
    Event update(Event event);
    Optional<Event> findById(EventId id);
    Optional<Event> findByCode(EventCode code);
}
```

**Domain Events:**
- `EventCreated(EventCode, title, description)`
- `EventPublished(EventCode)`
- `EventCancelled(EventCode)`

#### Application Layer (`/events/application/`)

**Command Use Cases:**
```java
// CreateEventUseCase.java
@Service
@Transactional
public class CreateEventUseCase {
    public EventCode createEvent(CreateEventCmd cmd) {
        Event event = Event.createDraft(...);
        Event savedEvent = eventRepository.create(event);
        domainEventPublisher.publish(savedEvent.pullDomainEvents());
        return savedEvent.getCode();
    }
}
```

**Query Service:**
```java
// EventQueryService.java
@Service
@Transactional(readOnly = true)
public class EventQueryService {
    public List<EventVM> getUpcomingEvents() {
        return eventQueryRepository.findUpcomingEvents();
    }
}
```

**Module Public API:**
```java
// EventsAPI.java
@NamedInterface("api")
public interface EventsAPI {
    List<EventVM> getEventsByIds(Set<EventId> eventIds);
    EventVM getEventByCode(EventCode eventCode);
    void reserveSlotForEvent(EventCode eventCode);
    void freeSlotForEvent(EventCode eventCode);
}
```

#### Infrastructure Layer (`/events/infra/persistence/`)

**JPA Entity:**
```java
// EventEntity.java
@Entity
@Table(name = "events")
public class EventEntity extends BaseEntity {
    @EmbeddedId
    private EventId id;

    @Embedded
    private EventCode code;

    @Embedded
    private EventDetails details;

    // ... otros campos
}
```

**Repository Adapter:**
```java
// EventRepositoryAdapter.java
@Repository
@Transactional
public class EventRepositoryAdapter implements EventRepository, EventQueryRepository {
    private final JpaEventRepository jpaRepository;

    @Override
    public Event create(Event event) {
        EventEntity entity = EventEntity.from(event);
        EventEntity saved = jpaRepository.save(entity);
        return EventEntityMapper.toEvent(saved);
    }
}
```

**Mappers:**
```java
// EventEntityMapper.java
public class EventEntityMapper {
    public static Event toEvent(EventEntity entity) {
        // Reconstruye el aggregate desde persistencia
    }
}

// EventViewMapper.java
public class EventViewMapper {
    public static EventVM toEventVM(EventEntity entity) {
        // Optimizado para lectura
    }
}
```

#### Interfaces Layer (`/events/interfaces/rest/`)

**REST Controller:**
```java
// EventsController.java
@RestController
@RequestMapping("/api/events")
public class EventsController {

    @PostMapping
    @ResponseStatus(CREATED)
    public CreateEventResponse createEvent(@RequestBody CreateEventRequest request) {
        CreateEventCmd cmd = new CreateEventCmd(...);
        EventCode code = createEventUseCase.createEvent(cmd);
        return new CreateEventResponse(code);
    }

    @GetMapping("/{eventCode}")
    public EventVM getEvent(@PathVariable EventCode eventCode) {
        return eventQueryService.getByCode(eventCode);
    }
}
```

---

### 📦 2. REGISTRATIONS Module

**Responsabilidad:** Gestión de inscripciones de usuarios a eventos

#### Domain Layer

**Aggregate Root:**
```java
// EventRegistration.java
public class EventRegistration extends AggregateRoot {
    private RegistrationId id;
    private RegistrationCode code;
    private EventId eventId;  // Referencia al evento
    private String attendeeName;
    private Email attendeeEmail;

    public static EventRegistration create(...) {
        var registration = new EventRegistration(...);
        registration.register(new RegistrationAdded(eventId, attendeeEmail));
        return registration;
    }

    public void cancel() {
        register(new RegistrationCancelled(this.code, this.eventId));
    }
}
```

**Value Objects:**
- `RegistrationCode`: Código único (TSID String)
- `Email`: Email con validación regex
  ```java
  public record Email(String value) {
      private static final Pattern EMAIL_PATTERN =
          Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

      public Email {
          if (!EMAIL_PATTERN.matcher(value).matches()) {
              throw new IllegalArgumentException("Invalid email");
          }
      }
  }
  ```

#### Application Layer

**RegisterAttendeeUseCase - Ejemplo de Integración entre Módulos:**
```java
@Service
@Transactional
public class RegisterAttendeeUseCase {
    private final RegistrationRepository registrationRepository;
    private final EventsAPI eventsAPI;  // ← Llamada síncrona a otro módulo
    private final DomainEventPublisher domainEventPublisher;

    public RegistrationCode registerAttendee(RegisterAttendeeCmd cmd) {
        // 1. Verificar duplicados
        var existing = registrationRepository.findRegistration(
            cmd.eventCode(), cmd.attendeeEmail()
        );
        if (existing.isPresent()) {
            throw new DuplicateRegistrationException();
        }

        // 2. Obtener datos del evento (cross-module call)
        EventVM event = eventsAPI.getEventByCode(cmd.eventCode());

        // 3. Crear registro
        EventRegistration registration = EventRegistration.create(
            event.id(), cmd.attendeeName(), cmd.attendeeEmail()
        );

        // 4. Persistir
        registration = registrationRepository.create(registration);

        // 5. Reservar slot en evento (cross-module call)
        eventsAPI.reserveSlotForEvent(cmd.eventCode());

        // 6. Publicar eventos de dominio
        domainEventPublisher.publish(registration.pullDomainEvents());

        return registration.getCode();
    }
}
```

#### Query Service - Ejemplo de Navegación entre Bounded Contexts:

```java
// RegistrationQueryService.java
@Service
@Transactional(readOnly = true)
public class RegistrationQueryService {

    public UserEventsVM findEvents(Email email) {
        // 1. Obtener IDs de eventos del usuario
        Set<EventId> eventIds = registrationQueryRepository.findEvents(email);

        // 2. Obtener detalles completos vía EventsAPI
        List<EventVM> events = eventsAPI.getEventsByIds(eventIds);

        // 3. Separar en upcoming y past
        LocalDateTime now = LocalDateTime.now();
        List<EventVM> upcoming = events.stream()
            .filter(e -> e.schedule().startDateTime().isAfter(now))
            .toList();
        List<EventVM> past = events.stream()
            .filter(e -> e.schedule().endDateTime().isBefore(now))
            .toList();

        return new UserEventsVM(upcoming, past);
    }
}
```

---

### 📦 3. NOTIFICATIONS Module

**Responsabilidad:** Escuchar eventos del sistema y enviar notificaciones

#### Interfaces Layer - Event Listeners

```java
// EventActivityListener.java
@Component
public class EventActivityListener {
    private static final Logger log = LoggerFactory.getLogger(...);

    @ApplicationModuleListener  // Spring Modulith annotation
    void onEventCreated(EventCreated event) {
        log.info("Event created: {}", event.eventCode());
        // TODO: Send notification email
    }

    @ApplicationModuleListener
    void onEventPublished(EventPublished event) {
        log.info("Event published: {}", event.eventCode());
        // TODO: Notify interested users
    }
}
```

**Características:**
- Desacoplamiento total: no conoce Events ni Registrations
- Comunicación asíncrona mediante eventos
- Puede escalar independientemente
- Preparado para integrar servicios externos (email, push, SMS)

---

### 📦 4. SHARED Module

**Responsabilidad:** Infraestructura común DDD y utilidades

#### Core DDD Building Blocks

```java
// DomainEvent.java - Marker interface
public interface DomainEvent { }

// AggregateRoot.java
public abstract class AggregateRoot {
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    protected void register(DomainEvent event) {
        domainEvents.add(event);
    }

    public List<DomainEvent> pullDomainEvents() {
        List<DomainEvent> events = List.copyOf(domainEvents);
        domainEvents.clear();
        return events;
    }
}

// BaseEntity.java - JPA Auditing
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
```

#### Domain Event Publisher

```java
// DomainEventPublisher.java
public interface DomainEventPublisher {
    void publish(DomainEvent event);
    void publish(List<DomainEvent> events);
}

// SpringEventPublisher.java
@Component
public class SpringEventPublisher implements DomainEventPublisher {
    private final ApplicationEventPublisher publisher;

    @Override
    public void publish(DomainEvent event) {
        publisher.publishEvent(event);
    }
}
```

#### Utilities

```java
// TSIDUtil.java - Time-Sorted ID Generation
public class TSIDUtil {
    public static Long generateTsidLong() {
        return TsidCreator.getTsid().toLong();
    }

    public static String generateTsidString() {
        return TsidCreator.getTsid().toString();
    }
}

// AssertUtil.java
public class AssertUtil {
    public static void requireNotNull(Object obj, String message) {
        if (obj == null) {
            throw new IllegalArgumentException(message);
        }
    }
}
```

---

### 📦 5. CONFIG Module

**Configuración Global de la Aplicación**

```java
// JpaConfig.java
@Configuration
@EnableJpaAuditing
@EnableJpaRepositories
public class JpaConfig { }

// GlobalExceptionHandler.java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handle(ResourceNotFoundException ex) {
        return ResponseEntity
            .status(NOT_FOUND)
            .body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(DomainException.class)
    public ResponseEntity<ErrorResponse> handle(DomainException ex) {
        return ResponseEntity
            .status(BAD_REQUEST)
            .body(new ErrorResponse(ex.getMessage()));
    }
}
```

---

## Conceptos Clave DDD

### 1. Value Objects - Inmutabilidad y Validación

**Ejemplo: Schedule Value Object**
```java
public record Schedule(LocalDateTime startDateTime, LocalDateTime endDateTime) {

    public Schedule {
        AssertUtil.requireNotNull(startDateTime, "Start date time is required");
        AssertUtil.requireNotNull(endDateTime, "End date time is required");

        if (endDateTime.isBefore(startDateTime)) {
            throw new IllegalArgumentException(
                "End date time must be after start date time"
            );
        }
    }
}
```

**Beneficios:**
- ✅ Validación en construcción → inputs inválidos no pueden existir
- ✅ Inmutabilidad → seguridad en threading
- ✅ Encapsulación → reglas de negocio en un solo lugar
- ✅ Type safety → `Schedule` vs `LocalDateTime` (evita errores)

### 2. Aggregate Root - Consistencia Transaccional

**Reglas:**
1. Todo cambio al aggregate pasa por el root
2. Un aggregate = una transacción
3. Referencias externas solo por ID
4. El root publica domain events

**Ejemplo:**
```java
// ❌ INCORRECTO: Modificar directamente
event.getDetails().setTitle("New Title");  // Violación

// ✅ CORRECTO: A través del aggregate root
event.updateDetails(new EventDetails("New Title", ...));
```

### 3. Domain Events - Comunicación entre Bounded Contexts

**Patrón:**
```java
// 1. Domain model registra evento
public void publish() {
    this.status = PUBLISHED;
    register(new EventPublished(this.code));  // ← Internal
}

// 2. Application layer extrae y publica
Event savedEvent = eventRepository.update(event);
List<DomainEvent> events = savedEvent.pullDomainEvents();  // ← Pull
domainEventPublisher.publish(events);  // ← Publish

// 3. Otro módulo reacciona
@ApplicationModuleListener
void onEventPublished(EventPublished event) {
    // Handle asynchronously
}
```

**Beneficios:**
- ✅ Desacoplamiento temporal
- ✅ Eventual consistency
- ✅ Audit trail automático
- ✅ Facilita event sourcing futuro

### 4. Repository Pattern - Abstracción de Persistencia

**Domain Layer (Port):**
```java
public interface EventRepository {
    Event create(Event event);
    Optional<Event> findByCode(EventCode code);
}
```

**Infrastructure Layer (Adapter):**
```java
@Repository
public class EventRepositoryAdapter implements EventRepository {
    private final JpaEventRepository jpaRepository;

    @Override
    public Event create(Event event) {
        EventEntity entity = EventEntity.from(event);
        EventEntity saved = jpaRepository.save(entity);
        return EventEntityMapper.toEvent(saved);  // Entity → Domain
    }
}
```

**Beneficios:**
- ✅ Domain desacoplado de JPA
- ✅ Fácil cambio de tecnología (JPA → MongoDB → etc.)
- ✅ Testeable con in-memory implementations

### 5. TSID (Time-Sorted ID)

**¿Qué es TSID?**
- ID único cronológicamente ordenable
- Basado en timestamp + random bits
- Más eficiente que UUID para índices de BD

**Uso en el proyecto:**
```java
// Generación
EventId id = new EventId(TSIDUtil.generateTsidLong());
EventCode code = new EventCode(TSIDUtil.generateTsidString());

// Formato Long: 1234567890123456789
// Formato String: "0A1B2C3D4E5F6G7H8I"
```

**Ventajas:**
- ✅ Sortable por creación
- ✅ Unique across distributed systems
- ✅ Performance en índices de BD

---

## Flujos de Ejemplo

### Flujo 1: Crear y Publicar un Evento

```
┌────────────┐     POST /api/events          ┌──────────────────┐
│   Client   │─────────────────────────────▶│ EventsController │
└────────────┘                               └──────────────────┘
                                                      │
                                                      ▼
                                            ┌────────────────────┐
                                            │CreateEventUseCase  │
                                            └────────────────────┘
                                                      │
                                                      ▼
                                            ┌────────────────────┐
                                            │ Event.createDraft()│
                                            │  (Aggregate Root)  │
                                            │ register(Event     │
                                            │   Created)         │
                                            └────────────────────┘
                                                      │
                                                      ▼
                                            ┌────────────────────┐
                                            │ EventRepository    │
                                            │    .create()       │
                                            └────────────────────┘
                                                      │
                                                      ▼
                                       ┌──────────────────────────┐
                                       │EventRepositoryAdapter    │
                                       │  Entity.from(event)      │
                                       │  jpaRepo.save(entity)    │
                                       │  Mapper.toEvent(saved)   │
                                       └──────────────────────────┘
                                                      │
                                                      ▼
                                            ┌────────────────────┐
                                            │ PostgreSQL         │
                                            │ events table       │
                                            └────────────────────┘
                                                      │
                                    Return Event      │
                                        ◀─────────────┘
                                        │
                                        ▼
                              ┌───────────────────────┐
                              │event.pullDomainEvents()│
                              └───────────────────────┘
                                        │
                                        ▼
                              ┌───────────────────────┐
                              │DomainEventPublisher   │
                              │  .publish(EventCreated)│
                              └───────────────────────┘
                                        │
                                        ▼
                              ┌───────────────────────────┐
                              │Spring ApplicationEvent    │
                              │      Publisher            │
                              └───────────────────────────┘
                                        │
                ┌───────────────────────┴────────────────────┐
                ▼                                            ▼
    ┌────────────────────────┐              ┌────────────────────────┐
    │EventActivityListener   │              │Other Listeners...      │
    │  @ApplicationModule    │              │                        │
    │  Listener              │              │                        │
    │  onEventCreated()      │              │                        │
    │  log.info("Created")   │              │                        │
    └────────────────────────┘              └────────────────────────┘
```

**Código paso a paso:**

```java
// 1. REST Controller recibe request
@PostMapping
public CreateEventResponse createEvent(@RequestBody CreateEventRequest request) {
    CreateEventCmd cmd = new CreateEventCmd(
        new EventDetails(request.title(), request.description(), ...),
        new Schedule(request.startDateTime(), request.endDateTime()),
        ...
    );
    EventCode code = createEventUseCase.createEvent(cmd);
    return new CreateEventResponse(code);
}

// 2. Use Case orquesta
@Transactional
public EventCode createEvent(CreateEventCmd cmd) {
    // Domain logic
    Event event = Event.createDraft(
        new EventId(TSIDUtil.generateTsidLong()),
        new EventCode(TSIDUtil.generateTsidString()),
        cmd.details(),
        cmd.schedule(),
        ...
    );

    // Persistence
    Event savedEvent = eventRepository.create(event);

    // Event publishing
    domainEventPublisher.publish(savedEvent.pullDomainEvents());

    return savedEvent.getCode();
}

// 3. Aggregate Root encapsula lógica
public static Event createDraft(...) {
    Event event = new Event();
    // ... set fields
    event.status = EventStatus.DRAFT;
    event.register(new EventCreated(event.code, event.details.title(), ...));
    return event;
}

// 4. Repository Adapter traduce
@Override
public Event create(Event event) {
    EventEntity entity = EventEntity.from(event);  // Domain → Entity
    EventEntity saved = jpaRepository.save(entity);
    return EventEntityMapper.toEvent(saved);  // Entity → Domain
}

// 5. Event Listener reacciona (async)
@ApplicationModuleListener
void onEventCreated(EventCreated event) {
    log.info("Event created: {} - {}", event.eventCode(), event.title());
    // TODO: Send email notification
}
```

---

### Flujo 2: Registrarse a un Evento (Cross-Module)

```
┌────────────┐   POST /api/registrations   ┌──────────────────────────┐
│   Client   │────────────────────────────▶│EventRegistrationController│
└────────────┘                              └──────────────────────────┘
                                                        │
                                                        ▼
                                            ┌────────────────────────┐
                                            │RegisterAttendeeUseCase │
                                            └────────────────────────┘
                                                        │
                        ┌───────────────────────────────┼──────────────────────┐
                        │                               │                      │
                        ▼                               ▼                      ▼
            ┌─────────────────────┐      ┌───────────────────────┐  ┌──────────────────┐
            │RegistrationRepository│      │    EventsAPI          │  │DomainEvent       │
            │  .findRegistration() │      │  .getEventByCode()    │  │  Publisher       │
            │  (check duplicate)   │      │  .reserveSlotForEvent()│  │                  │
            └─────────────────────┘      └───────────────────────┘  └──────────────────┘
                        │                               │                      │
                        │                   Cross-Module Call                  │
                        │                     (Synchronous)                    │
                        │                               │                      │
                        │                               ▼                      │
                        │                    ┌────────────────────┐            │
                        │                    │EventSlotReservation│            │
                        │                    │     UseCase        │            │
                        │                    │ event.reserveSlot()│            │
                        │                    └────────────────────┘            │
                        │                                                      │
                        └──────────────────────┬───────────────────────────────┘
                                               ▼
                                    ┌────────────────────┐
                                    │ Registration saved │
                                    │ Event slot reserved│
                                    │ Events published   │
                                    └────────────────────┘
                                               │
                                               ▼
                                    ┌────────────────────────────┐
                                    │RegistrationEventListener   │
                                    │   onRegistrationAdded()    │
                                    │   log.info("Registered")   │
                                    └────────────────────────────┘
```

**Código:**

```java
// RegisterAttendeeUseCase.java
@Service
@Transactional
public class RegisterAttendeeUseCase {

    public RegistrationCode registerAttendee(RegisterAttendeeCmd cmd) {
        // 1. Validar duplicados
        Optional<EventRegistration> existing = registrationRepository
            .findRegistration(cmd.eventCode(), cmd.attendeeEmail());

        if (existing.isPresent()) {
            throw new DuplicateRegistrationException(
                "Already registered for event: " + cmd.eventCode()
            );
        }

        // 2. Obtener evento (cross-module sync call)
        EventVM event = eventsAPI.getEventByCode(cmd.eventCode());

        // 3. Crear registro
        EventRegistration registration = EventRegistration.create(
            new RegistrationId(TSIDUtil.generateTsidLong()),
            new RegistrationCode(TSIDUtil.generateTsidString()),
            event.id(),
            cmd.attendeeName(),
            cmd.attendeeEmail()
        );

        // 4. Guardar
        registration = registrationRepository.create(registration);

        // 5. Reservar slot en evento (cross-module sync call)
        eventsAPI.reserveSlotForEvent(cmd.eventCode());

        // 6. Publicar eventos
        domainEventPublisher.publish(registration.pullDomainEvents());

        return registration.getCode();
    }
}
```

**EventsAPI Implementation:**
```java
// EventsAPIImpl.java
@Service
public class EventsAPIImpl implements EventsAPI {

    @Override
    @Transactional
    public void reserveSlotForEvent(EventCode eventCode) {
        eventSlotReservationUseCase.reserveSlot(
            new ReserveSlotCmd(eventCode)
        );
    }
}

// EventSlotReservationUseCase.java
@Service
@Transactional
public class EventSlotReservationUseCase {

    public void reserveSlot(ReserveSlotCmd cmd) {
        Event event = eventRepository.getByCode(cmd.eventCode());

        // Business logic in aggregate
        event.reserveSlot();

        eventRepository.update(event);
    }
}

// Event.java (Aggregate Root)
public void reserveSlot() {
    if (!hasFreeSeats()) {
        throw new EventSlotReservationException(
            "No free seats available"
        );
    }
    this.bookedSeats++;
}

public boolean hasFreeSeats() {
    if (capacity.isUnlimited()) {
        return true;
    }
    return bookedSeats < capacity.value();
}
```

---

### Flujo 3: Query - Obtener Eventos de un Usuario

```
GET /api/users/{email}/events

┌────────────┐                           ┌──────────────────┐
│   Client   │──────────────────────────▶│UserEventsController
└────────────┘                           └──────────────────┘
                                                  │
                                                  ▼
                                      ┌─────────────────────────┐
                                      │RegistrationQueryService │
                                      │    .findEvents(email)   │
                                      └─────────────────────────┘
                                                  │
                                                  ▼
                                      ┌─────────────────────────┐
                                      │RegistrationQueryRepo    │
                                      │  .findEvents(email)     │
                                      │  → Set<EventId>         │
                                      └─────────────────────────┘
                                                  │
                                                  ▼
                                            ┌──────────┐
                                            │PostgreSQL│
                                            └──────────┘
                                                  │
                                                  │ eventIds
                                                  ▼
                                      ┌─────────────────────────┐
                                      │     EventsAPI           │
                                      │  .getEventsByIds(ids)   │
                                      │  → List<EventVM>        │
                                      └─────────────────────────┘
                                                  │
                                                  ▼
                                      ┌─────────────────────────┐
                                      │ EventQueryRepository    │
                                      │  .findAllById(ids)      │
                                      └─────────────────────────┘
                                                  │
                                                  ▼
                                      ┌─────────────────────────┐
                                      │Filter by datetime       │
                                      │  - upcoming events      │
                                      │  - past events          │
                                      └─────────────────────────┘
                                                  │
                                                  ▼
                                      ┌─────────────────────────┐
                                      │    UserEventsVM         │
                                      │  - upcoming: [...]      │
                                      │  - past: [...]          │
                                      └─────────────────────────┘
```

**Código:**

```java
// UserEventsController.java
@GetMapping("/api/users/{email}/events")
public UserEventsVM getUserEvents(@PathVariable Email email) {
    return registrationQueryService.findEvents(email);
}

// RegistrationQueryService.java
@Service
@Transactional(readOnly = true)
public class RegistrationQueryService {

    public UserEventsVM findEvents(Email email) {
        // 1. Get event IDs from registrations table
        Set<EventId> eventIds = registrationQueryRepository.findEvents(email);

        if (eventIds.isEmpty()) {
            return new UserEventsVM(List.of(), List.of());
        }

        // 2. Get full event details via EventsAPI (cross-module)
        List<EventVM> events = eventsAPI.getEventsByIds(eventIds);

        // 3. Separate upcoming vs past
        LocalDateTime now = LocalDateTime.now();

        List<EventVM> upcomingEvents = events.stream()
            .filter(e -> e.schedule().startDateTime().isAfter(now))
            .sorted(Comparator.comparing(e -> e.schedule().startDateTime()))
            .toList();

        List<EventVM> pastEvents = events.stream()
            .filter(e -> e.schedule().endDateTime().isBefore(now))
            .sorted(Comparator.comparing(
                e -> e.schedule().startDateTime(),
                Comparator.reverseOrder()
            ))
            .toList();

        return new UserEventsVM(upcomingEvents, pastEvents);
    }
}

// RegistrationQueryRepository.java (Interface)
Set<EventId> findEvents(Email email);

// RegistrationRepositoryAdapter.java (Implementation)
@Override
public Set<EventId> findEvents(Email email) {
    return jpaRegistrationRepository.findEventIdsByAttendeeEmail(
        email.value()
    );
}

// JpaRegistrationRepository.java (Spring Data)
@Query("""
    SELECT DISTINCT r.eventId
    FROM EventRegistrationEntity r
    WHERE r.attendeeEmail = :email
""")
Set<EventId> findEventIdsByAttendeeEmail(String email);
```

---

## Árbol Completo de Archivos

```
meetup4j-modulith-ddd-ha/
└── src/main/java/dev/sivalabs/meetup4j/
    │
    ├── Meetup4jApplication.java                    # Spring Boot Entry Point
    ├── ApplicationProperties.java                   # @ConfigurationProperties
    │
    ├── config/                                      # CONFIGURACIÓN GLOBAL
    │   ├── JpaConfig.java                          # JPA + Auditing
    │   └── GlobalExceptionHandler.java             # @ControllerAdvice
    │
    ├── shared/                                      # INFRAESTRUCTURA COMPARTIDA
    │   ├── DomainEvent.java                        # Marker Interface
    │   ├── AggregateRoot.java                      # Base class for aggregates
    │   ├── BaseEntity.java                         # JPA @MappedSuperclass
    │   ├── DomainEventPublisher.java               # Interface
    │   ├── SpringEventPublisher.java               # Implementation
    │   ├── AssertUtil.java                         # Validation utilities
    │   ├── TSIDUtil.java                           # TSID generation
    │   ├── package-info.java
    │   └── exception/
    │       ├── DomainException.java                # Base domain exception
    │       └── ResourceNotFoundException.java
    │
    ├── events/                                      # MÓDULO: GESTIÓN DE EVENTOS
    │   │
    │   ├── domain/                                 # ═══ DOMAIN LAYER ═══
    │   │   ├── model/                              # Aggregates & Entities
    │   │   │   ├── Event.java                     # ⭐ Aggregate Root
    │   │   │   ├── EventStatus.java               # Enum: DRAFT, PUBLISHED, CANCELLED
    │   │   │   └── EventType.java                 # Enum: ONLINE, OFFLINE, HYBRID
    │   │   ├── vo/                                 # Value Objects
    │   │   │   ├── EventId.java                   # TSID Long
    │   │   │   ├── EventCode.java                 # TSID String
    │   │   │   ├── EventDetails.java              # title, description, imageUrl
    │   │   │   ├── Schedule.java                  # startDateTime, endDateTime
    │   │   │   ├── Capacity.java                  # integer or UNLIMITED
    │   │   │   ├── TicketPrice.java               # pricing
    │   │   │   ├── EventLocation.java             # venue OR virtualLink
    │   │   │   └── package-info.java
    │   │   ├── repository/                         # Repository Interfaces (Ports)
    │   │   │   └── EventRepository.java           # create, update, findByCode
    │   │   ├── event/                              # Domain Events
    │   │   │   ├── EventCreated.java              # Published on create
    │   │   │   ├── EventPublished.java            # Published on publish
    │   │   │   ├── EventCancelled.java            # Published on cancel
    │   │   │   └── package-info.java
    │   │   └── exception/                          # Domain Exceptions
    │   │       ├── InvalidEventCreationException.java
    │   │       ├── EventSlotReservationException.java
    │   │       └── EventCancellationException.java
    │   │
    │   ├── application/                            # ═══ APPLICATION LAYER ═══
    │   │   ├── command/                            # Write Use Cases
    │   │   │   ├── CreateEventUseCase.java
    │   │   │   ├── PublishEventUseCase.java
    │   │   │   ├── CancelEventUseCase.java
    │   │   │   ├── EventSlotReservationUseCase.java
    │   │   │   └── dto/                            # Command DTOs
    │   │   │       ├── CreateEventCmd.java
    │   │   │       ├── PublishEventCmd.java
    │   │   │       └── CancelEventCmd.java
    │   │   ├── query/                              # Read Use Cases
    │   │   │   ├── EventQueryService.java         # Query service
    │   │   │   ├── EventQueryRepository.java      # Query repository interface
    │   │   │   └── dto/                            # View Models
    │   │   │       ├── EventVM.java               # Read model
    │   │   │       └── package-info.java
    │   │   └── EventsAPI.java                      # 🔌 Public API (@NamedInterface)
    │   │
    │   ├── infra/                                  # ═══ INFRASTRUCTURE LAYER ═══
    │   │   └── persistence/
    │   │       ├── EventEntity.java               # JPA Entity
    │   │       ├── EventEntityMapper.java         # Entity ↔ Domain
    │   │       ├── EventViewMapper.java           # Entity → ViewModel
    │   │       ├── EventRepositoryAdapter.java    # 🔌 Repository Adapter
    │   │       └── JpaEventRepository.java        # Spring Data JPA
    │   │
    │   └── interfaces/                             # ═══ INTERFACES LAYER ═══
    │       └── rest/                               # REST Adapters
    │           ├── EventsController.java          # REST Controller
    │           ├── CreateEventRequest.java        # Request DTO
    │           ├── CreateEventResponse.java       # Response DTO
    │           ├── EventsResponse.java            # Response wrapper
    │           └── converters/
    │               └── StringToEventCodeConverter.java  # Type converter
    │
    ├── registrations/                               # MÓDULO: GESTIÓN DE INSCRIPCIONES
    │   │
    │   ├── domain/                                 # ═══ DOMAIN LAYER ═══
    │   │   ├── model/
    │   │   │   └── EventRegistration.java         # ⭐ Aggregate Root
    │   │   ├── vo/
    │   │   │   ├── RegistrationId.java            # TSID Long
    │   │   │   ├── RegistrationCode.java          # TSID String
    │   │   │   └── Email.java                     # Email with validation
    │   │   ├── repository/
    │   │   │   └── RegistrationRepository.java    # Repository interface
    │   │   ├── event/
    │   │   │   ├── RegistrationAdded.java         # Domain event
    │   │   │   ├── RegistrationCancelled.java     # Domain event
    │   │   │   └── package-info.java
    │   │   └── exception/
    │   │       └── RegistrationCancellationException.java
    │   │
    │   ├── application/                            # ═══ APPLICATION LAYER ═══
    │   │   ├── command/
    │   │   │   ├── RegisterAttendeeUseCase.java
    │   │   │   ├── CancelRegistrationUseCase.java
    │   │   │   └── dto/
    │   │   │       ├── RegisterAttendeeCmd.java
    │   │   │       └── CancelRegistrationCmd.java
    │   │   └── query/
    │   │       ├── RegistrationQueryService.java
    │   │       ├── RegistrationQueryRepository.java
    │   │       └── dto/
    │   │           ├── RegistrationVM.java
    │   │           ├── EventRegistrations.java
    │   │           ├── AttendeesVM.java
    │   │           ├── UserEventsVM.java
    │   │           └── UserRegistrationStatus.java
    │   │
    │   ├── infra/                                  # ═══ INFRASTRUCTURE LAYER ═══
    │   │   └── persistence/
    │   │       ├── EventRegistrationEntity.java   # JPA Entity
    │   │       ├── RegistrationEntityMapper.java  # Entity ↔ Domain
    │   │       ├── RegistrationViewMapper.java    # Entity → ViewModel
    │   │       ├── RegistrationRepositoryAdapter.java  # Repository adapter
    │   │       └── JpaRegistrationRepository.java # Spring Data JPA
    │   │
    │   └── interfaces/                             # ═══ INTERFACES LAYER ═══
    │       └── rest/
    │           ├── EventRegistrationController.java
    │           ├── UserEventsController.java
    │           ├── EventRegistrationRequest.java
    │           ├── EventRegistrationResponse.java
    │           └── converters/
    │               ├── StringToEmailConverter.java
    │               └── StringToRegistrationCodeConverter.java
    │
    └── notifications/                               # MÓDULO: NOTIFICACIONES
        └── interfaces/                             # ═══ INTERFACES LAYER ═══
            └── eventhandler/                       # Event Listeners
                ├── EventActivityListener.java      # Escucha eventos de Events
                └── RegistrationEventListener.java  # Escucha eventos de Registrations
```

---

## Principios Arquitectónicos Aplicados

### 1. Dependency Inversion Principle (DIP)

```
High-level modules (Domain) should not depend on low-level modules (Infrastructure).
Both should depend on abstractions (Interfaces).
```

**Aplicación:**
- `EventRepository` (interface en Domain) ← implementada por → `EventRepositoryAdapter` (Infrastructure)
- Domain no conoce JPA, PostgreSQL, o Spring Data

### 2. Single Responsibility Principle (SRP)

Cada clase tiene una única responsabilidad:
- `Event`: Lógica de negocio de eventos
- `EventEntity`: Mapeo de persistencia
- `EventVM`: Representación para lectura
- `CreateEventUseCase`: Orquestación de creación

### 3. Open/Closed Principle (OCP)

El sistema está abierto a extensión pero cerrado a modificación:
- Nuevos event listeners → agregar clase con `@ApplicationModuleListener`
- Nuevas validaciones → agregar métodos en aggregate
- Nueva persistencia → nueva implementación de `EventRepository`

### 4. Separation of Concerns

**4 capas claramente separadas:**
1. **Domain**: ¿Qué? (Business rules)
2. **Application**: ¿Cómo? (Use cases orchestration)
3. **Infrastructure**: ¿Dónde? (Technical implementation)
4. **Interfaces**: ¿Quién? (External communication)

---

## Testing Strategy

### Unit Tests

**Domain Layer:**
```java
class EventTest {
    @Test
    void shouldPublishEvent() {
        Event event = Event.createDraft(...);

        event.publish();

        assertThat(event.getStatus()).isEqualTo(PUBLISHED);
        assertThat(event.pullDomainEvents())
            .hasSize(2)  // EventCreated + EventPublished
            .anyMatch(e -> e instanceof EventPublished);
    }

    @Test
    void shouldNotCancelStartedEvent() {
        Event event = createPublishedEvent();
        setStartDateTime(LocalDateTime.now().minusHours(1));  // Started

        assertThatThrownBy(() -> event.cancel())
            .isInstanceOf(EventCancellationException.class)
            .hasMessageContaining("Cannot cancel started event");
    }
}
```

**Value Objects:**
```java
class ScheduleTest {
    @Test
    void shouldRejectInvalidSchedule() {
        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.minusHours(1);  // Before start

        assertThatThrownBy(() -> new Schedule(start, end))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("End date time must be after start");
    }
}
```

### Integration Tests

**Use Cases:**
```java
@SpringBootTest
@Transactional
class CreateEventUseCaseTest {

    @Autowired
    private CreateEventUseCase createEventUseCase;

    @Autowired
    private EventRepository eventRepository;

    @Test
    void shouldCreateEventAndPublishDomainEvent() {
        CreateEventCmd cmd = new CreateEventCmd(...);

        EventCode code = createEventUseCase.createEvent(cmd);

        Event savedEvent = eventRepository.getByCode(code);
        assertThat(savedEvent.getStatus()).isEqualTo(DRAFT);
        // Verify event was published via mock listener
    }
}
```

### Architecture Tests (ArchUnit)

```java
class HexagonalArchitectureTest {

    @Test
    void domainShouldNotDependOnInfrastructure() {
        classes()
            .that().resideInPackage("..domain..")
            .should().onlyDependOnClassesIn(
                "..domain..",
                "..shared..",
                "java.."
            )
            .check(importedClasses);
    }

    @Test
    void repositoriesShouldBeInterfaces() {
        classes()
            .that().resideInPackage("..domain.repository..")
            .should().beInterfaces()
            .check(importedClasses);
    }
}
```

### Module Boundary Tests (Spring Modulith)

```java
@SpringBootTest
class ModularityTest {

    ApplicationModules modules = ApplicationModules.of(Meetup4jApplication.class);

    @Test
    void shouldRespectModuleBoundaries() {
        modules.verify();  // Fails if modules violate boundaries
    }

    @Test
    void shouldDocumentModules() {
        new Documenter(modules)
            .writeModulesAsPlantUml()
            .writeIndividualModulesAsPlantUml();
    }
}
```

---

## Patrones de Validación

### 1. Constructor Validation (Value Objects)

```java
public record Email(String value) {
    public Email {
        if (!isValid(value)) {
            throw new IllegalArgumentException("Invalid email: " + value);
        }
    }
}
```

### 2. Domain Logic Validation (Aggregates)

```java
public void cancel() {
    if (isStarted()) {
        throw new EventCancellationException(
            "Cannot cancel event that has already started"
        );
    }
    if (isCancelled()) {
        throw new EventCancellationException(
            "Event is already cancelled"
        );
    }
    this.status = CANCELLED;
    register(new EventCancelled(this.code));
}
```

### 3. Bean Validation (DTOs)

```java
public record CreateEventCmd(
    @NotNull @Valid EventDetails details,
    @NotNull @Valid Schedule schedule,
    @NotNull EventType type,
    @EventLocationConstraint  // Custom constraint
    EventLocation location
) { }
```

### 4. Custom Validators

```java
@Constraint(validatedBy = EventLocationValidator.class)
public @interface EventLocationConstraint {
    String message() default "Invalid event location";
}

public class EventLocationValidator
    implements ConstraintValidator<EventLocationConstraint, CreateEventCmd> {

    @Override
    public boolean isValid(CreateEventCmd cmd, ConstraintValidatorContext ctx) {
        if (cmd.type() == OFFLINE && cmd.location().venue() == null) {
            return false;  // Offline requires venue
        }
        if (cmd.type() == ONLINE && cmd.location().virtualLink() == null) {
            return false;  // Online requires virtual link
        }
        return true;
    }
}
```

---

## Mejoras Futuras Posibles

### 1. Event Sourcing
- Almacenar todos los domain events en event store
- Reconstruir estado del aggregate desde eventos
- Audit trail completo automático

### 2. CQRS Completo
- Base de datos separada para queries (read model)
- Proyecciones optimizadas para cada vista
- Eventual consistency

### 3. Outbox Pattern
- Garantizar publicación de eventos transaccional
- Tabla `outbox` en misma transacción que aggregate
- Polling/CDC para publicar eventos

### 4. Saga Pattern
- Orquestación de procesos long-running
- Compensating transactions para rollback
- Ejemplo: Proceso completo de registro con pago

### 5. Microservicios
- Extraer módulos como servicios independientes
- Comunicación vía message broker (RabbitMQ, Kafka)
- Service mesh para observability

---

## Recursos Adicionales

### Libros Recomendados
- **Domain-Driven Design** - Eric Evans
- **Implementing Domain-Driven Design** - Vaughn Vernon
- **Clean Architecture** - Robert C. Martin
- **Building Microservices** - Sam Newman

### Artículos
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [DDD Reference](https://www.domainlanguage.com/ddd/reference/)
- [Spring Modulith](https://spring.io/projects/spring-modulith)

### Proyectos Similares
- [Event Sourcing with Axon](https://axoniq.io/)
- [Eventuate Tram](https://eventuate.io/docs/manual/eventuate-tram/latest/)

---

## Conclusión

Este proyecto demuestra la implementación práctica de:

✅ **Arquitectura Hexagonal** - Separación clara de capas, domain independiente
✅ **DDD Tactical Patterns** - Aggregates, Value Objects, Domain Events, Repositories
✅ **CQRS** - Separación de commands y queries
✅ **Event-Driven Architecture** - Comunicación asíncrona entre módulos
✅ **Modular Monolith** - Módulos independientes con boundaries verificables
✅ **Clean Code** - SRP, DIP, OCP, separation of concerns

**Beneficios obtenidos:**
- 🎯 Dominio rico y expresivo
- 🛡️ Validación temprana mediante Value Objects
- 🔄 Desacoplamiento mediante eventos
- 🧪 Alta testabilidad (unit, integration, architecture tests)
- 📦 Modularidad preparada para microservicios
- 🔧 Fácil mantenimiento y evolución

Esta arquitectura es apropiada para sistemas de mediana a alta complejidad donde la inversión inicial en diseño se compensa con facilidad de evolución y mantenimiento a largo plazo.

---

**Autor del análisis:** Claude Sonnet 4.5
**Fecha:** 2026-01-03
**Proyecto:** meetup4j-modulith-ddd-ha
