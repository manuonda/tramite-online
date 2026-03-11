# Tramite Online — Arquitectura Backend

> Documento vivo. Actualizar con cada decisión arquitectónica relevante.

---

## 1. Contexto — Stack tecnológico y propósito

**Tramite Online** es una plataforma SaaS para gestionar trámites administrativos en línea.
Los usuarios crean workspaces, diseñan formularios dinámicos, recolectan respuestas y consultan analíticas.

| Capa | Tecnología |
|---|---|
| Lenguaje | Java 25 |
| Framework | Spring Boot 4.0.1 |
| Modularidad | Spring Modulith 2.0 |
| Persistencia | Spring Data JPA + Flyway |
| Base de datos | PostgreSQL (Docker Compose) |
| Seguridad | Spring Security + JWT |
| Build | Maven Wrapper |
| Frontend | Angular 21 (repo: `sakai-ng-master/`) |

---

## 2. Decisión Arquitectónica — MVP-First

### Qué se eligió: Layered Architecture + Spring Modulith

Para un MVP se elige **Arquitectura en Capas** dentro de cada módulo, con **Spring Modulith**
para enforcer las fronteras entre módulos.

**No se usa Hexagonal completa porque:**
- Hexagonal requiere puertos de entrada (interfaces de use cases) + puertos de salida (interfaces de repositorios) → mucho boilerplate para un MVP
- Los use cases son clases concretas, no hay interfaz para cada uno
- Si el proyecto crece, agregar los puertos de entrada es un refactor menor y controlado

**Lo que SÍ se toma de Hexagonal:**
- Los repositorios son interfaces en `domain/` (puerto de salida)
- Las implementaciones JPA viven en `infrastructure/` (adaptador)
- El dominio no depende de Spring ni JPA

```
Controller → UseCase (clase concreta) → Repository (interfaz) → JPA Adapter → PostgreSQL
```

### Comparación

| Factor | Hexagonal completa | Layered + Modulith (MVP) |
|---|---|---|
| Interfaces de use case | Si | No |
| Interfaces de repositorio | Si | Si |
| Velocidad de desarrollo | Lenta | Alta |
| Testabilidad | Buena | Buena |
| Fronteras entre módulos | Manual | Spring Modulith |

---

## 3. Estructura de Paquetes

### Raíz

```
com.tramite.online/
├── TramiteOnlinePlatformApplication.java
├── ApplicationProperties.java
├── common/          ← configuración global (CORS, beans globales)
├── shared/          ← módulo transversal (excepciones, eventos base)
├── workspace/
├── form/
├── submission/
├── analytics/
├── user/
└── notification/
```

### Layout uniforme por módulo

```
{modulo}/
├── package-info.java                    ← @ApplicationModule + dependencias permitidas
├── domain/
│   ├── model/                           ← POJOs de negocio, sin Spring
│   ├── service/                         ← lógica de negocio pura
│   ├── repository/                      ← interfaces (puertos de salida)
│   ├── event/                           ← domain events
│   └── exception/                       ← excepciones de negocio del módulo
├── application/
│   ├── usecases/                        ← un use case por operación
│   ├── dto/
│   │   ├── command/                     ← DTOs de entrada
│   │   └── response/                    ← DTOs de salida
│   └── listener/                        ← escucha eventos de otros módulos
└── infrastructure/
    ├── web/
    │   └── controller/                  ← REST controllers
    ├── persistence/
    │   ├── entity/                      ← JPA @Entity
    │   ├── repository/                  ← Spring Data JPA interfaces
    │   ├── adapter/                     ← implementan domain/repository/
    │   └── mapper/                      ← Entity ↔ Domain model
    └── config/                          ← beans Spring del módulo
```

---

## 4. Módulos

### 4.1 workspace

**Responsabilidad:** Unidades organizacionales donde los usuarios colaboran.

| Capa | Clases clave |
|---|---|
| domain/model | `WorkSpace`, `WorkSpaceMember`, `WorkspaceRole` |
| domain/event | `WorkSpaceCreated`, `WorkSpaceArchived`, `WorkSpaceDeleted`, `MemberAdded`, `MemberRemoved`, `MemberUpdated` |
| domain/repository | `WorkSpaceRepository`, `WorkSpaceMemberRepository` |
| application/usecases | `CreateWorkSpaceUseCase`, `UpdateWorkSpaceUseCase`, `DeleteWorkSpaceUseCase`, `ArchiveWorkSpaceUseCase`, `ListWorkSpacesByOwnerUseCase`, `GetWorkSpaceByIdUseCase`, `AddMemberUseCase`, `RemoveMemberUseCase`, `UpdateMemberRoleUseCase`, `ListMembersUseCase`, `GetMemberByIdUseCase` |

| Método | Ruta | Use Case |
|---|---|---|
| POST | `/api/workspaces` | CreateWorkSpaceUseCase |
| GET | `/api/workspaces` | ListWorkSpacesByOwnerUseCase |
| GET | `/api/workspaces/{id}` | GetWorkSpaceByIdUseCase |
| PUT | `/api/workspaces/{id}` | UpdateWorkSpaceUseCase |
| DELETE | `/api/workspaces/{id}` | DeleteWorkSpaceUseCase |
| POST | `/api/workspaces/{id}/archive` | ArchiveWorkSpaceUseCase |
| POST | `/api/workspaces/{id}/members` | AddMemberUseCase |
| DELETE | `/api/workspaces/{id}/members/{mid}` | RemoveMemberUseCase |
| PUT | `/api/workspaces/{id}/members/{mid}/role` | UpdateMemberRoleUseCase |
| GET | `/api/workspaces/{id}/members` | ListMembersUseCase |

---

### 4.2 form

**Responsabilidad:** Constructor de formularios dinámicos con secciones, preguntas y lógica condicional.

| Capa | Clases clave |
|---|---|
| domain/model | `Form`, `FormSection`, `Question`, `QuestionOption`, `QuestionConfig`, `QuestionType`, `FormStatus` |
| domain/event | `FormCreated`, `FormPublished` |
| domain/repository | `FormRepository`, `FormSectionRepository` |
| application/usecases | `CreateFormUseCase`, `UpdateFormUseCase`, `PublishFormUseCase`, `GetFormUseCase`, `ListFormsUseCase`, `DeleteFormUseCase` |

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/workspaces/{wid}/forms` | Crear formulario |
| GET | `/api/workspaces/{wid}/forms` | Listar formularios del workspace |
| GET | `/api/forms/{id}` | Obtener formulario |
| PUT | `/api/forms/{id}` | Actualizar formulario |
| POST | `/api/forms/{id}/publish` | Publicar formulario |
| DELETE | `/api/forms/{id}` | Eliminar formulario |
| GET | `/api/public/forms/{slug}` | Formulario público (sin auth) |

---

### 4.3 submission

**Responsabilidad:** Respuestas de usuarios a formularios. Flujo: `DRAFT → SUBMITTED → REVIEWED`.

| Capa | Clases clave |
|---|---|
| domain/model | `Submission`, `SubmissionAnswer`, `SubmissionStatus` |
| domain/event | `SubmissionCreated`, `SubmissionCompleted` |
| domain/repository | `SubmissionRepository` |
| application/usecases | `CreateSubmissionUseCase`, `SaveDraftUseCase`, `SubmitUseCase`, `GetSubmissionUseCase`, `ListSubmissionsUseCase` |

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/public/forms/{formId}/submissions` | Iniciar envío (público, sin auth) |
| PUT | `/api/submissions/{id}/draft` | Guardar borrador |
| POST | `/api/submissions/{id}/submit` | Enviar formulario |
| GET | `/api/forms/{formId}/submissions` | Listar respuestas (admin) |
| GET | `/api/submissions/{id}` | Ver detalle de respuesta |

---

### 4.4 analytics

**Responsabilidad:** Dashboard y reportes de submisiones.

| Capa | Clases clave |
|---|---|
| domain/model | `WorkSpaceStats`, `FormStats`, `SubmissionTimeSeries` |
| application/usecases | `GetDashboardStatsUseCase`, `ExportSubmissionsUseCase` |
| application/listener | `SubmissionCompletedListener` → actualiza estadísticas |

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/workspaces/{id}/analytics` | Stats del workspace |
| GET | `/api/forms/{id}/analytics` | Stats del formulario |
| GET | `/api/forms/{id}/submissions/export` | Exportar (CSV / Excel / JSON) |

---

### 4.5 user

**Responsabilidad:** Autenticación, autorización y perfiles de usuario.

| Capa | Clases clave |
|---|---|
| domain/model | `User` |
| application/usecases | `RegisterUseCase`, `LoginUseCase`, `GetProfileUseCase`, `UpdateProfileUseCase`, `ChangePasswordUseCase` |
| infrastructure/config | Spring Security + JWT filter |

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registro |
| POST | `/api/auth/login` | Login → devuelve JWT |
| POST | `/api/auth/refresh` | Renovar token |
| GET | `/api/users/me` | Perfil del usuario autenticado |
| PUT | `/api/users/me` | Actualizar perfil |

---

### 4.6 notification

**Responsabilidad:** Envío de emails. Solo consume Domain Events, no expone REST.

| Listener | Evento escuchado | Acción |
|---|---|---|
| `WorkSpaceCreatedListener` | `WorkSpaceCreated` | Email de bienvenida al owner |
| `MemberAddedListener` | `MemberAdded` | Email de invitación al nuevo miembro |
| `SubmissionCompletedListener` | `SubmissionCompleted` | Email de notificación al admin del form |

---

## 5. Shared — Módulo Transversal

```
shared/
├── domain/
│   ├── event/DomainEvent.java       ← record base para todos los domain events
│   └── constants/Constants.java
└── exception/
    ├── BaseException.java
    ├── BusinessException.java
    ├── ResourceNotFoundException.java
    ├── ValidationException.java
    ├── UnauthorizedException.java
    └── ForbiddenException.java
```

`shared` puede ser importado por todos los módulos.
Ningún módulo de negocio puede importar directamente a otro módulo — solo a `shared`.

**GlobalExceptionHandler** en `shared.infrastructure.web.advice`:

| Excepción | HTTP Status |
|---|---|
| ResourceNotFoundException | 404 |
| BusinessException | 422 |
| ValidationException | 400 |
| UnauthorizedException | 401 |
| ForbiddenException | 403 |

---

## 6. Comunicación entre módulos — Domain Events

Los módulos **nunca se llaman directamente**. Se comunican a través de Domain Events de Spring.

```
[workspace] publica WorkSpaceCreated
        ├──► [notification] → email de bienvenida
        └──► [analytics]    → inicializa stats del workspace

[submission] publica SubmissionCompleted
        └──► [notification] → notifica al admin del formulario
```

**Patrón de publicación:**

```java
// En el UseCase — publica evento
eventPublisher.publishEvent(new WorkSpaceCreated(ws.getId(), ws.getOwner()));

// En otro módulo — escucha evento
@EventListener
public void on(WorkSpaceCreated event) {
    notificationService.sendWelcomeEmail(event.ownerId());
}
```

**Regla:** si necesitas datos de otro módulo, publicas un evento y el otro módulo reacciona.
Nunca inyectar un Service de otro módulo directamente.

---

## 7. Integración Frontend ↔ Backend

### Mapeo Angular feature → módulo backend

| Feature Angular (`features/`) | Módulo Backend | Ruta base |
|---|---|---|
| `admin/workspace` | workspace | `/api/workspaces` |
| `admin/form-builder` | form | `/api/forms` |
| `admin/submissions` | submission | `/api/submissions` |
| `admin/dashboard` | analytics | `/api/workspaces/{id}/analytics` |
| `admin/members` | workspace | `/api/workspaces/{id}/members` |
| `auth/login` | user | `/api/auth` |
| `public/portal` | submission + form | `/api/public/forms/{slug}` |

### Convenciones REST

| Convención | Regla |
|---|---|
| Base URL | `http://localhost:8080/api` |
| Auth | `Authorization: Bearer <JWT>` en todos los endpoints protegidos |
| Fechas | ISO 8601 (`2025-03-10T14:30:00Z`) |
| Paginación | `?page=0&size=20` → respuesta `PagedResult<T>` |
| Errores | `{ "code": "RESOURCE_NOT_FOUND", "message": "...", "timestamp": "..." }` |
| Content-Type | `application/json` |

---

## 8. Convenciones de Nomenclatura

| Elemento | Patrón | Ejemplo |
|---|---|---|
| UseCase | `{Verbo}{Entidad}UseCase` | `CreateWorkSpaceUseCase` |
| Command DTO | `{Verbo}{Entidad}Command` | `CreateWorkSpaceCommand` |
| Response DTO | `{Entidad}Response` | `WorkSpaceResponse` |
| Domain Event | `{Entidad}{Participio}` | `WorkSpaceCreated` |
| JPA Entity | `{Entidad}Entity` | `WorkSpaceEntity` |
| Repository (dominio) | `{Entidad}Repository` | `WorkSpaceRepository` |
| JPA Repository | `{Entidad}JpaRepository` | `WorkSpaceJpaRepository` |
| Adapter | `{Entidad}RepositoryAdapter` | `WorkSpaceRepositoryAdapter` |
| Mapper | `{Entidad}Mapper` | `WorkSpaceMapper` |
| Controller | `{Entidad}Controller` | `WorkSpaceController` |

### Reglas Spring Modulith

1. Cada módulo tiene `package-info.java` con `@ApplicationModule`
2. Dependencias entre módulos se declaran con `allowedDependencies`
3. Solo los tipos del paquete raíz del módulo son visibles hacia otros módulos
4. Subpaquetes internos son implícitamente privados
5. **Ejecutar antes de cada commit:**
   ```bash
   ./mvnw test -Dtest=ModularityTests
   ```

### Migraciones Flyway

```
src/main/resources/db/migration/
├── workspace/  V1.0__create_workspace.sql
│               V1.1__create_workspace_member.sql
├── form/       V2.0__create_form.sql
├── submission/ V3.0__create_submission.sql
├── analytics/  V4.0__create_analytics.sql
└── user/       V5.0__create_user.sql
```

Convención de nombre: `V{modulo-numero}.{sub}__descripcion_en_snake_case.sql`

---

## 9. Instrucciones para el Agente (Claude Code)

### Rol

Eres un senior Java engineer especializado en Spring Boot + Spring Modulith.
Tu objetivo es implementar funcionalidades en el backend de Tramite Online siguiendo
estrictamente la arquitectura **Layered + Modulith** descrita en este documento.

### Qué producir para cada módulo nuevo

1. `package-info.java` con `@ApplicationModule` y dependencias declaradas
2. Domain model — POJOs en `domain/model/`, sin anotaciones Spring ni JPA
3. Domain events — records que extienden `DomainEvent` en `domain/event/`
4. Repository interfaces — en `domain/repository/`
5. Commands y Responses — en `application/dto/command/` y `application/dto/response/`
6. Use Cases — una clase por operación en `application/usecases/`
7. JPA Entity — en `infrastructure/persistence/entity/` con `@Entity`
8. JPA Repository — interface en `infrastructure/persistence/repository/`
9. Repository Adapter — en `infrastructure/persistence/adapter/` implementando la interfaz de dominio
10. Mapper — en `infrastructure/persistence/mapper/`
11. Controller REST — en `infrastructure/web/controller/`
12. Migración Flyway — SQL en `src/main/resources/db/migration/{modulo}/`

### Prompt base para un módulo nuevo

```
Implementa el módulo `{nombre}` en el backend de Tramite Online.
Sigue la arquitectura documentada en back/ARCHITECTURE.md (Layered + Spring Modulith).

- Domain model: {lista de entidades}
- Operaciones: {lista de operaciones}
- Eventos publicados: {lista de eventos}
- Eventos escuchados de otros módulos: {lista}
- Endpoints REST: {tabla}

Al finalizar ejecutar: ./mvnw test -Dtest=ModularityTests
```

---

## 10. Roadmap Arquitectónico

| Fase | Estado | Qué se hace |
|---|---|---|
| **MVP** | Actual | Layered + Modulith, use cases concretos, domain events síncronos |
| **Modulith Maduro** | Siguiente | Eventos asíncronos (outbox pattern), proyecciones JPA, OpenAPI completo |
| **Hexagonal Parcial** | Si escala | Agregar interfaces de use cases (inbound ports), tests de dominio puro sin Spring |
| **Microservicios** | Si escala mucho | Extraer módulos de alta carga, Kafka, API Gateway |
