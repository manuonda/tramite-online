# Arquitectura de Capas - Tramite Online Platform

## Índice
1. [Introducción](#introducción)
2. [Las Tres Capas](#las-tres-capas)
3. [Flujo Completo: Crear un Workspace](#flujo-completo-crear-un-workspace)
4. [Detalles por Capa](#detalles-por-capa)
5. [Ejemplos de Código](#ejemplos-de-código)
6. [Ventajas de esta Arquitectura](#ventajas-de-esta-arquitectura)

---

## Introducción

La aplicación está organizada en **3 capas** independientes que trabajan juntas para procesar una petición HTTP:

```
┌─────────────────────────────────────────────────┐
│           CLIENTE (Navegador / API)             │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│         INFRASTRUCTURE (Controllers, BD)         │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│       APPLICATION (Use Cases, Orquestación)     │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│      DOMAIN (Lógica Pura de Negocio)            │
└─────────────────────────────────────────────────┘
```

---

## Las Tres Capas

### 1. DOMAIN - Lógica Pura de Negocio

**¿Qué es?**
- Los **POJOs** (Plain Old Java Objects) que representan el negocio
- Lógica de dominio **sin dependencias** de frameworks
- Solo **Java puro**

**Ubicación:**
```
src/main/java/com/tramite/online/workspace/domain/
├── model/              # WorkSpace.java, WorkSpaceMember.java
├── service/            # Lógica de negocio
├── repository/         # Interfaces (contratos)
├── event/              # Eventos de dominio
├── exception/          # Excepciones de negocio
└── validator/          # Validaciones
```

**Responsabilidades:**
- Definir las entidades del negocio
- Validar reglas de negocio
- Publicar eventos cuando ocurren cambios importantes
- Lanzar excepciones cuando se violan reglas

**Tecnología:**
- ❌ Sin Spring
- ❌ Sin JPA
- ❌ Sin HTTP
- ✅ Solo Java

**Ejemplo:**
```java
public class WorkSpace {
    private Long id;
    private String name;
    private Long ownerId;
    private LocalDateTime createdAt;

    // Constructor con lógica de negocio
    public WorkSpace(String name, Long ownerId) {
        this.name = name;
        this.ownerId = ownerId;
        this.createdAt = LocalDateTime.now(); // Lógica de negocio
    }
}
```

---

### 2. APPLICATION - Orquestación de Casos de Uso

**¿Qué es?**
- La capa que **coordina** el dominio
- **Ejecuta los casos de uso** de la aplicación
- Recibe solicitudes y retorna respuestas

**Ubicación:**
```
src/main/java/com/tramite/online/workspace/application/
├── usecase/            # CreateWorkSpaceUseCase, UpdateWorkSpaceUseCase
├── dto/                # CreateWorkSpaceCommand, WorkSpaceResponse
└── listener/           # Event listeners (opcional)
```

**Responsabilidades:**
- Recibir comandos/consultas del cliente
- Validar datos de entrada
- Orquestar llamadas a dominio
- Persistir datos (via repositorio)
- Publicar eventos
- Retornar respuestas

**Tecnología:**
- ✅ @Service
- ✅ @Transactional
- ❌ Sin @Entity
- ❌ Sin @RestController

**Ejemplo:**
```java
@Service
public class CreateWorkSpaceUseCase {

    @Transactional
    public WorkSpaceResponse execute(CreateWorkSpaceCommand command) {
        // 1. Validar
        WorkSpaceValidator.validateName(command.getName());

        // 2. Crear entidad de dominio
        WorkSpace workspace = new WorkSpace(
            command.getName(),
            command.getOwnerId()
        );

        // 3. Persistir
        WorkSpace saved = workspaceRepository.save(workspace);

        // 4. Publicar evento
        eventPublisher.publishEvent(new WorkSpaceCreated(saved));

        // 5. Retornar respuesta
        return toResponse(saved);
    }
}
```

---

### 3. INFRASTRUCTURE - Implementaciones Técnicas

**¿Qué es?**
- La capa que **interactúa con tecnología**
- **Guarda datos** en base de datos
- **Expone APIs REST** HTTP
- **Convierte** entre formatos (Entity ↔ Domain)

**Ubicación:**
```
src/main/java/com/tramite/online/workspace/infrastructure/
├── web/                # Controllers y DTOs REST
│   ├── controller/      # WorkSpaceController
│   └── dto/             # WorkSpaceRequest, WorkSpaceResponse
├── persistence/        # Base de datos
│   ├── entity/          # WorkSpaceEntity (@Entity)
│   ├── repository/      # WorkSpaceJpaRepository (Spring Data)
│   ├── adapter/         # WorkSpaceRepositoryAdapter
│   └── mapper/          # WorkSpaceMapper
└── config/             # Configuración Spring
```

**Responsabilidades:**
- Recibir peticiones HTTP
- Mapear objetos (Entity ↔ Domain ↔ DTO)
- Acceder a base de datos
- Retornar respuestas HTTP

**Tecnología:**
- ✅ @Entity (JPA)
- ✅ @Repository (Spring Data)
- ✅ @RestController (Spring MVC)
- ✅ Mappers

**Ejemplo:**
```java
// Entity JPA
@Entity
@Table(name = "workspace")
public class WorkSpaceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;
}

// JPA Repository
@Repository
public interface WorkSpaceJpaRepository extends JpaRepository<WorkSpaceEntity, Long> {
    Optional<WorkSpaceEntity> findByName(String name);
}

// Adaptador (implementa el puerto del dominio)
@Component
public class WorkSpaceRepositoryAdapter implements WorkSpaceRepository {
    public WorkSpace save(WorkSpace workspace) {
        // Convertir Domain → Entity
        WorkSpaceEntity entity = mapper.toPersistence(workspace);
        // Guardar en BD
        WorkSpaceEntity saved = jpaRepository.save(entity);
        // Convertir Entity → Domain
        return mapper.toDomain(saved);
    }
}

// REST Controller
@RestController
@RequestMapping("/api/v1/workspaces")
public class WorkSpaceController {
    @PostMapping
    public ResponseEntity<WorkSpaceResponse> createWorkSpace(
        @RequestBody CreateWorkSpaceCommand command) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(useCase.execute(command));
    }
}
```

---


### Resumen 

```
  1. Cliente HTTP
     ↓
  2. REST Controller (INFRASTRUCTURE)
     POST /api/v1/workspaces
     └─ Recibe: CreateWorkSpaceCommand

  3. Use Case (APPLICATION)
     CreateWorkSpaceUseCase.execute()
     ├─ Valida datos
     ├─ Crea modelo: WorkSpace (DOMAIN)
     └─ Llama a repositorio

  4. Repository Adapter (INFRASTRUCTURE)
     WorkSpaceRepositoryAdapter.save()
     ├─ Convierte Domain → Entity (mapper)
     ├─ Guarda en BD via JpaRepository
     └─ Retorna Domain

  5. Event (DOMAIN)
     Publica: WorkSpaceCreated

  6. Response (APPLICATION)
     Retorna: WorkSpaceResponse (DTO)
     ↓
  7. Cliente recibe JSON

  ---
  COMPARACIÓN SIMPLE

  | Capa           | ¿Qué es?                     | ¿Qué toca?             | ¿Con qué?                             |
  |----------------|------------------------------|------------------------|---------------------------------------|
  | DOMAIN         | POJOs + Lógica pura          | Nada de tecnología     | Java puro                             |
  | APPLICATION    | Orquestación de casos de uso | Dominio + Repositorios | @Service, @Transactional              |
  | INFRASTRUCTURE | Implementación técnica       | BD, HTTP, Spring       | @Entity, @Repository, @RestController |

  ---
  RESUMEN FINAL

  DOMAIN
    └─ Pregunta: "¿Cuál es la regla de negocio?"
    └─ Respuesta: Validar, crear WorkSpace, publicar evento

  APPLICATION
    └─ Pregunta: "¿Cómo coordinamos todo para crear un workspace?"
    └─ Respuesta: Validar → Crear → Persistir → Publicar → Responder

  INFRASTRUCTURE
    └─ Pregunta: "¿Cómo guardamos en BD? ¿Cómo exponemos REST?"
    └─ Respuesta: JPA Entity, Mapper, JpaRepository, Controller
  Readme.capas.md 


```

## Flujo Completo: Crear un Workspace

Este es el flujo de una petición HTTP para crear un workspace:

### Paso 1: Cliente HTTP envía petición

```http
POST /api/v1/workspaces HTTP/1.1
Content-Type: application/json

{
  "name": "Mi Workspace",
  "description": "Descripción",
  "ownerId": 1
}
```

### Paso 2: REST Controller recibe la petición (INFRASTRUCTURE)

```java
@RestController
@RequestMapping("/api/v1/workspaces")
public class WorkSpaceController {

    private final CreateWorkSpaceUseCase createWorkSpaceUseCase;

    @PostMapping
    public ResponseEntity<WorkSpaceResponse> createWorkSpace(
        @RequestBody CreateWorkSpaceCommand command) {

        // 1. Recibe el JSON y lo convierte a CreateWorkSpaceCommand
        // command.name = "Mi Workspace"
        // command.ownerId = 1

        // 2. Llama al Use Case
        WorkSpaceResponse response = createWorkSpaceUseCase.execute(command);

        // 3. Retorna respuesta HTTP
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
```

**¿Qué ocurre aquí?**
- ✅ Recibe petición HTTP
- ✅ Convierte JSON a objeto Java (CreateWorkSpaceCommand)
- ✅ Delega lógica al Use Case
- ✅ Retorna respuesta HTTP

---

### Paso 3: Use Case orquesta todo (APPLICATION)

```java
@Service
public class CreateWorkSpaceUseCase {

    private final WorkSpaceRepository workspaceRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public WorkSpaceResponse execute(CreateWorkSpaceCommand command) {

        // PASO 3.1: Validar datos
        WorkSpaceValidator.validateName(command.getName());

        // PASO 3.2: Verificar que no existe
        if (workspaceRepository.findByName(command.getName()).isPresent()) {
            throw new DuplicateWorkSpaceException(command.getName());
        }

        // PASO 3.3: Crear modelo de DOMINIO
        WorkSpace workspace = new WorkSpace(
            command.getName(),          // Lógica de dominio
            command.getDescription(),
            command.getOwnerId()
        );
        // En este punto:
        // - workspace.createdAt = LocalDateTime.now() (automático)
        // - workspace.active = true (automático)

        // PASO 3.4: Persistir en BD
        WorkSpace saved = workspaceRepository.save(workspace);
        // saved.id = 123 (asignado por BD)

        // PASO 3.5: Publicar evento
        eventPublisher.publishEvent(new WorkSpaceCreated(saved));
        // Otros módulos escuchan: notification, analytics, user

        // PASO 3.6: Convertir respuesta
        return toResponse(saved);
    }

    private WorkSpaceResponse toResponse(WorkSpace workspace) {
        return new WorkSpaceResponse(
            workspace.getId(),
            workspace.getName(),
            workspace.getDescription(),
            workspace.isActive(),
            workspace.isArchived(),
            workspace.getOwnerId(),
            workspace.getCreatedAt(),
            workspace.getUpdatedAt()
        );
    }
}
```

**¿Qué ocurre aquí?**
- ✅ Valida reglas de negocio
- ✅ Crea modelo de dominio (WorkSpace POJO)
- ✅ Persiste en BD
- ✅ Publica eventos
- ✅ Retorna respuesta

---

### Paso 4: Repository Adapter guarda en BD (INFRASTRUCTURE)

```java
@Component
public class WorkSpaceRepositoryAdapter implements WorkSpaceRepository {

    private final WorkSpaceJpaRepository jpaRepository;
    private final WorkSpaceMapper mapper;

    @Override
    public WorkSpace save(WorkSpace workspace) {

        // PASO 4.1: Convertir Domain → Entity (Mapper)
        WorkSpaceEntity entity = mapper.toPersistence(workspace);
        // entity.name = "Mi Workspace"
        // entity.ownerId = 1

        // PASO 4.2: Guardar en BD via Spring Data
        WorkSpaceEntity saved = jpaRepository.save(entity);
        // saved.id = 123 (generado por BD)
        // saved.createdAt = 2024-01-15 10:30:45

        // PASO 4.3: Convertir Entity → Domain
        WorkSpace result = mapper.toDomain(saved);
        // result.id = 123
        // result.name = "Mi Workspace"

        return result;
    }
}
```

**¿Qué ocurre aquí?**
- ✅ Convierte modelo de dominio a entidad JPA
- ✅ Guarda en base de datos
- ✅ Recupera ID generado
- ✅ Convierte de vuelta a modelo de dominio

**Detalles del Mapper:**

```java
@Component
public class WorkSpaceMapper {

    // Domain → Entity (para guardar)
    public WorkSpaceEntity toPersistence(WorkSpace domain) {
        return new WorkSpaceEntity(
            domain.getName(),           // "Mi Workspace"
            domain.getDescription(),
            domain.isActive(),          // true
            domain.isArchived(),        // false
            domain.getOwnerId(),
            domain.getCreatedAt(),
            domain.getUpdatedAt()
        );
    }

    // Entity → Domain (después de guardar)
    public WorkSpace toDomain(WorkSpaceEntity entity) {
        WorkSpace domain = new WorkSpace(
            entity.getName(),
            entity.getDescription(),
            entity.getOwnerId()
        );
        domain.setId(entity.getId());           // ← ID de BD
        domain.setCreatedAt(entity.getCreatedAt());
        domain.setUpdatedAt(entity.getUpdatedAt());
        return domain;
    }
}
```

---

### Paso 5: Se publica evento de dominio (DOMAIN)

```java
// En CreateWorkSpaceUseCase:
eventPublisher.publishEvent(new WorkSpaceCreated(saved));

// El evento:
public class WorkSpaceCreated extends DomainEvent {
    private final Long workspaceId;
    private final String workspaceName;
    private final Long ownerId;

    public WorkSpaceCreated(WorkSpace workspace) {
        super("WorkSpaceCreated", workspace.getId());
        this.workspaceId = workspace.getId();
        this.workspaceName = workspace.getName();
        this.ownerId = workspace.getOwnerId();
    }
}
```

**¿Qué ocurre aquí?**
- ✅ Se publica evento de dominio
- ✅ Otros módulos escuchan:
  - 📧 **notification**: Envía email de bienvenida
  - 📊 **analytics**: Crea analytics inicial
  - 👤 **user**: Asigna permisos al owner

---

### Paso 6: Response se retorna a Application

```java
// En CreateWorkSpaceUseCase:
return toResponse(saved);

// toResponse crea:
public WorkSpaceResponse {
    id: 123,
    name: "Mi Workspace",
    description: "Descripción",
    active: true,
    archived: false,
    ownerId: 1,
    createdAt: "2024-01-15T10:30:45",
    updatedAt: "2024-01-15T10:30:45"
}
```

---

### Paso 7: Response HTTP es enviado al cliente

```java
// En WorkSpaceController:
return ResponseEntity.status(HttpStatus.CREATED).body(response);

// Response HTTP:
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 123,
  "name": "Mi Workspace",
  "description": "Descripción",
  "active": true,
  "archived": false,
  "ownerId": 1,
  "createdAt": "2024-01-15T10:30:45",
  "updatedAt": "2024-01-15T10:30:45"
}
```

---

## Diagrama del Flujo Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. CLIENTE (Navegador / Postman / API)                              │
│    POST /api/v1/workspaces                                          │
│    { name: "Mi Workspace", ownerId: 1 }                             │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 2. INFRASTRUCTURE LAYER - REST Controller                           │
│    @RestController @PostMapping                                     │
│    - Recibe JSON                                                    │
│    - Convierte a CreateWorkSpaceCommand                             │
│    - Llama a UseCase.execute(command)                               │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 3. APPLICATION LAYER - Use Case                                     │
│    CreateWorkSpaceUseCase.execute()                                 │
│    - Valida datos                                                   │
│    - Verifica que no existe                                         │
│    - Crea WorkSpace (DOMAIN POJO)                                   │
│    - Llama a repositorio.save()                                     │
│    - Publica evento WorkSpaceCreated                                │
│    - Retorna WorkSpaceResponse                                      │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 4. DOMAIN LAYER - Crear entidad                                     │
│    WorkSpace workspace = new WorkSpace(name, ownerId)               │
│    - Lógica pura de negocio                                         │
│    - Sin Spring, sin JPA                                            │
│    - Solo Java                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 5. INFRASTRUCTURE LAYER - Repository Adapter                        │
│    WorkSpaceRepositoryAdapter.save(workspace)                       │
│    - Mapper.toPersistence() → WorkSpaceEntity                       │
│    - JpaRepository.save() → Guarda en BD                            │
│    - Obtiene ID de BD                                               │
│    - Mapper.toDomain() → Convierte a WorkSpace                      │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ DATABASE - PostgreSQL                                               │
│ INSERT INTO workspace (name, owner_id, created_at, updated_at)      │
│ VALUES ('Mi Workspace', 1, NOW(), NOW())                            │
│ → ID = 123                                                          │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 6. DOMAIN LAYER - Evento                                            │
│    eventPublisher.publishEvent(new WorkSpaceCreated(workspace))     │
│    → notification module escucha                                    │
│    → analytics module escucha                                       │
│    → user module escucha                                            │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 7. APPLICATION LAYER - Respuesta                                    │
│    WorkSpaceResponse {id, name, active, ...}                        │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 8. INFRASTRUCTURE LAYER - Controller retorna HTTP                   │
│    ResponseEntity.status(201).body(response)                        │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 9. CLIENTE recibe respuesta JSON                                    │
│    HTTP 201 Created                                                 │
│    { id: 123, name: "Mi Workspace", ... }                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Detalles por Capa

### DOMAIN - Detalles

**Archivos:**
- `WorkSpace.java` - Entidad de dominio (POJO)
- `WorkSpaceMember.java` - Entidad de dominio
- `WorkSpaceRole.java` - Enum
- `WorkSpaceRepository.java` - **Interfaz** (sin implementación)
- `WorkSpaceMemberRepository.java` - **Interfaz**
- `WorkSpaceValidator.java` - Validaciones
- `WorkSpaceCreated.java` - Evento
- `WorkSpaceNotFoundException.java` - Excepción

**Características:**
- ✅ Sin anotaciones Spring (@Entity, @Repository, etc.)
- ✅ Sin JPA
- ✅ Solo lógica de negocio
- ✅ Reutilizable en diferentes contextos

**Flujo:**
```
Comando → Validación (Validator) → Crear WorkSpace → Validar → Retornar
```

---

### APPLICATION - Detalles

**Archivos:**
- `CreateWorkSpaceCommand.java` - DTO de entrada
- `WorkSpaceResponse.java` - DTO de salida
- `CreateWorkSpaceUseCase.java` - Caso de uso
- `UpdateWorkSpaceUseCase.java` - Caso de uso
- `GetWorkSpaceByIdUseCase.java` - Caso de uso
- `ListWorkSpacesUseCase.java` - Caso de uso
- `AddMemberUseCase.java` - Caso de uso

**Características:**
- ✅ @Service (bean de Spring)
- ✅ @Transactional (transacciones)
- ✅ Cada Use Case = 1 caso de uso
- ✅ Orquesta dominio + repositorio

**Flujo:**
```
Command → Validate → Create Domain → Persist → Publish Event → Response
```

---

### INFRASTRUCTURE - Detalles

**Archivos:**

**Web:**
- `WorkSpaceController.java` - REST endpoints
- `WorkSpaceRequest.java` - DTO REST entrada
- `WorkSpaceResponse.java` - DTO REST salida

**Persistence:**
- `WorkSpaceEntity.java` - Entidad JPA (@Entity)
- `WorkSpaceMemberEntity.java` - Entidad JPA
- `WorkSpaceJpaRepository.java` - Spring Data JPA
- `WorkSpaceMemberJpaRepository.java` - Spring Data JPA
- `WorkSpaceRepositoryAdapter.java` - **Implementa** WorkSpaceRepository (puerto)
- `WorkSpaceMemberRepositoryAdapter.java` - **Implementa** WorkSpaceMemberRepository
- `WorkSpaceMapper.java` - Convierte Entity ↔ Domain
- `WorkSpaceMemberMapper.java` - Convierte Entity ↔ Domain

**Config:**
- `WorkSpaceConfig.java` - Configuración Spring

**Características:**
- ✅ @RestController (endpoints HTTP)
- ✅ @Entity (JPA)
- ✅ @Repository (Spring Data)
- ✅ @Component (beans)
- ✅ Mappers para conversión

**Flujo:**
```
HTTP Request → Controller → Adapter (Mapper) → JPA Repository → BD
BD → JPA Repository → Adapter (Mapper) → Controller → HTTP Response
```

---

## Ejemplos de Código

### Ejemplo 1: Flujo completo de crear workspace

**Cliente:**
```bash
curl -X POST http://localhost:8080/api/v1/workspaces \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Desarrollo",
    "description": "Workspace para desarrollo",
    "ownerId": 1
  }'
```

**Controller (INFRASTRUCTURE):**
```java
@RestController
@RequestMapping("/api/v1/workspaces")
public class WorkSpaceController {

    @PostMapping
    public ResponseEntity<WorkSpaceResponse> createWorkSpace(
        @RequestBody CreateWorkSpaceCommand command) {

        WorkSpaceResponse response = createWorkSpaceUseCase.execute(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
```

**UseCase (APPLICATION):**
```java
@Service
public class CreateWorkSpaceUseCase {

    @Transactional
    public WorkSpaceResponse execute(CreateWorkSpaceCommand command) {
        // 1. Validar
        WorkSpaceValidator.validateName(command.getName());

        // 2. Crear dominio
        WorkSpace workspace = new WorkSpace(
            command.getName(),
            command.getDescription(),
            command.getOwnerId()
        );

        // 3. Persistir
        WorkSpace saved = workspaceRepository.save(workspace);

        // 4. Evento
        eventPublisher.publishEvent(new WorkSpaceCreated(saved));

        // 5. Respuesta
        return toResponse(saved);
    }
}
```

**Domain (DOMAIN):**
```java
public class WorkSpace {
    private Long id;
    private String name;
    private String description;
    private boolean active;
    private Long ownerId;
    private LocalDateTime createdAt;

    public WorkSpace(String name, String description, Long ownerId) {
        this.name = name;
        this.description = description;
        this.ownerId = ownerId;
        this.active = true;
        this.createdAt = LocalDateTime.now(); // Lógica
    }
}
```

**Adapter (INFRASTRUCTURE):**
```java
@Component
public class WorkSpaceRepositoryAdapter implements WorkSpaceRepository {

    @Override
    public WorkSpace save(WorkSpace workspace) {
        // Mapear
        WorkSpaceEntity entity = mapper.toPersistence(workspace);

        // Guardar
        WorkSpaceEntity saved = jpaRepository.save(entity);

        // Mapear de vuelta
        return mapper.toDomain(saved);
    }
}
```

**Entity (INFRASTRUCTURE):**
```java
@Entity
@Table(name = "workspace")
public class WorkSpaceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Long ownerId;
}
```

---

## Ventajas de esta Arquitectura

### ✅ Separación de Responsabilidades
- Cada capa tiene una responsabilidad clara
- Fácil de entender qué hace cada parte
- Cambios en una capa no afectan a las otras

### ✅ Testeable
```java
// Puedo testear Domain sin Spring
@Test
public void testCreateWorkSpace() {
    WorkSpace ws = new WorkSpace("Test", 1L);
    assertEquals("Test", ws.getName());
}

// Puedo testear UseCase con mocks
@Test
public void testCreateWorkSpaceUseCase() {
    when(repository.save(any())).thenReturn(workspace);
    WorkSpaceResponse response = useCase.execute(command);
    assertEquals("Test", response.getName());
}

// Puedo testear Controller con MockMvc
@Test
public void testCreateWorkSpaceController() {
    mvc.perform(post("/api/v1/workspaces")
        .content(...))
        .andExpect(status().isCreated());
}
```

### ✅ Reutilizable
- Puedo cambiar JPA por MongoDB sin tocar Domain o Application
- Puedo agregar GraphQL sin tocar Domain o Application
- Domain es independiente de la tecnología

### ✅ Mantenible
- Código organizado y estructurado
- Fácil encontrar dónde está cada cosa
- Fácil agregar nuevas funcionalidades

### ✅ Escalable
- Puedo agregar nuevos Use Cases fácilmente
- Puedo agregar nuevas entidades
- La arquitectura crece sin problemas

### ✅ Event-Driven
- Los módulos se comunican vía eventos
- Bajo acoplamiento entre módulos
- Fácil agregar nuevos listeners

---

## Resumen Final

| Aspecto | Domain | Application | Infrastructure |
|---------|--------|-------------|-----------------|
| **¿Qué hace?** | Define lógica de negocio | Coordina casos de uso | Implementa técnica |
| **¿Dónde vive?** | `domain/` | `application/` | `infrastructure/` |
| **¿Qué contiene?** | POJOs, Servicios, Eventos | UseCases, DTOs | Controllers, JPA, Mappers |
| **¿Con qué anotaciones?** | Ninguna (Java puro) | @Service, @Transactional | @Entity, @Repository, @RestController |
| **¿Qué toca?** | Nada de tecnología | Dominio + Repositorio | BD, HTTP, Spring |
| **¿Cómo testeo?** | JUnit puro | Mockito | MockMvc |
| **¿Puedo cambiar?** | Nunca | Rara vez | Frecuentemente |

---

## Próximos Pasos

1. **Implementar otras capas del workspace:**
   - UpdateWorkSpaceUseCase
   - DeleteWorkSpaceUseCase
   - ArchiveWorkSpaceUseCase

2. **Implementar listener de eventos:**
   - Escuchar WorkSpaceCreated
   - Enviar email de bienvenida (notification module)
   - Crear analytics inicial (analytics module)

3. **Migrations SQL:**
   - Crear tabla workspace
   - Crear tabla workspace_member

4. **Tests:**
   - Test de domain
   - Test de use case
   - Test de controller

5. **Próximos módulos:**
   - form
   - submission
   - analytics
   - user
   - notification
