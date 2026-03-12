# Avance por Etapa — Tramite Online Backend

> Documento de seguimiento de progreso. Actualizar al completar cada item.
> Carpeta de trabajo: `tramite/src/`

---

## Resumen General

| Etapa | Nombre | Progreso | Estado |
|---|---|---|---|
| **0** | Fundación Compartida | 0% | **En curso** |
| **1** | Workspace Core | 0% | Pendiente |
| **2** | Configuración de Formularios | 0% | Pendiente |
| **3** | Ejecución de Formularios (Instancias + Submissions) | 0% | Pendiente |
| **4** | Analytics | 0% | Pendiente |
| **5** | Notificaciones | 0% | Pendiente |
| **6** | Autenticación y Seguridad (JWT) | 0% | Pendiente |

---

## Etapa 0 — Fundación Compartida (0%)

### Módulo `shared`

| # | Item | Estado | Notas |
|---|---|---|---|
| 0.1 | `shared/package-info.java` | [ ] | `@ApplicationModule(type = OPEN)` |
| 0.2 | `DomainEvent` (sealed interface) | [ ] | `eventId()`, `occurredAt()`, `aggregateId()` |
| 0.3 | `ErrorCode` (enum) | [ ] | Códigos + HTTP status |
| 0.4 | `BaseException` (sealed class) | [ ] | Con `permits` para las 6 sub-excepciones |
| 0.5 | `ResourceNotFoundException` | [ ] | final, extends BaseException |
| 0.6 | `BusinessException` | [ ] | non-sealed, extensible por módulos |
| 0.7 | `ValidationException` | [ ] | final |
| 0.8 | `UnauthorizedException` | [ ] | final |
| 0.9 | `ForbiddenException` | [ ] | final |
| 0.10 | `DeletionBlockedException` | [ ] | final, con `ActiveReference` record |

### Módulo `common`

| # | Item | Estado | Notas |
|---|---|---|---|
| 0.11 | `common/package-info.java` | [ ] | `@ApplicationModule(type = OPEN)` |
| 0.12 | `ErrorResponse` (record) | [ ] | Factory method `of(BaseException)` |
| 0.13 | `PagedResult<T>` (record) | [ ] | Constructor desde `Page<T>` + método `of()` |
| 0.14 | `WebConfig` | [ ] | CORS para `localhost:4200` |
| 0.15 | `GlobalExceptionHandler` | [ ] | switch expression + pattern matching |

### Test

| # | Item | Estado | Notas |
|---|---|---|---|
| 0.16 | `ModularityTest` | [ ] | Verifica módulos shared y common |

### Verificación Final

| # | Check | Estado |
|---|---|---|
| 0.17 | `./mvnw test -Dtest=ModularityTest` → PASS | [ ] |
| 0.18 | `./mvnw clean package -DskipTests` → BUILD SUCCESS | [ ] |
| 0.19 | `./mvnw spring-boot:run` → arranca sin errores | [ ] |

**Progreso Etapa 0: 0 / 19 items completados = 0%**

---

## Etapa 1 — Workspace Core (0%)

### Domain

| # | Item | Estado | Notas |
|---|---|---|---|
| 1.1 | `workspace/package-info.java` | [ ] | `allowedDependencies = "shared"` |
| 1.2 | `WorkSpace` (domain model) | [ ] | POJO sin Spring |
| 1.3 | `WorkSpaceMember` (domain model) | [ ] | |
| 1.4 | `WorkspaceRole` (enum) | [ ] | OWNER, ADMIN, EDITOR, VIEWER |
| 1.5 | Domain events (7 records) | [ ] | Created, Updated, Archived, Deleted, MemberAdded/Removed/Updated |
| 1.6 | Repository interfaces (2) | [ ] | WorkSpaceRepository, WorkSpaceMemberRepository |
| 1.7 | Domain exceptions | [ ] | WorkSpaceNotFoundException, DuplicatedWorkSpaceException |

### Application

| # | Item | Estado | Notas |
|---|---|---|---|
| 1.8 | Command DTOs | [ ] | Create, Update, Archive, AddMember, RemoveMember, UpdateMemberRole |
| 1.9 | Response DTOs | [ ] | WorkSpaceResponse, MemberResponse |
| 1.10 | Use Cases (11) | [ ] | CRUD workspace + members |

### Infrastructure

| # | Item | Estado | Notas |
|---|---|---|---|
| 1.11 | JPA Entities (2) | [ ] | WorkSpaceEntity, WorkSpaceMemberEntity |
| 1.12 | JPA Repositories (2) | [ ] | Spring Data interfaces |
| 1.13 | Repository Adapters (2) | [ ] | Implementan interfaces de dominio |
| 1.14 | MapStruct Mappers (2) | [ ] | Entity ↔ Domain |
| 1.15 | WorkSpaceController | [ ] | 10 endpoints REST |
| 1.16 | Migraciones Flyway (2) | [ ] | V1.0 workspace, V1.1 members |

### Verificación

| # | Check | Estado |
|---|---|---|
| 1.17 | ModularityTest pasa | [ ] |
| 1.18 | 10 endpoints verificados (curl/Postman) | [ ] |
| 1.19 | Events se publican (log) | [ ] |
| 1.20 | Paginación funciona | [ ] |
| 1.21 | Excepciones devuelven JSON estándar | [ ] |

**Progreso Etapa 1: 0 / 21 items completados = 0%**

---

## Etapa 2 — Configuración de Formularios (0%)

### Domain

| # | Item | Estado | Notas |
|---|---|---|---|
| 2.1 | `form/package-info.java` | [ ] | `allowedDependencies = {"shared", "workspace"}` |
| 2.2 | `FormConfig` (domain model) | [ ] | title, slug, description, status |
| 2.3 | `ConfigSection` (domain model) | [ ] | title, displayOrder |
| 2.4 | `ConfigQuestion` (domain model) | [ ] | text, type, required, config, displayOrder |
| 2.5 | `ConfigOption` (domain model) | [ ] | label, value, displayOrder |
| 2.6 | `QuestionType` (enum) | [ ] | TEXT, TEXTAREA, NUMBER, DATE, SELECT, MULTISELECT, FILE, CHECKBOX |
| 2.7 | `FormStatus` (enum) | [ ] | DRAFT, PUBLISHED, ARCHIVED |
| 2.8 | Domain events | [ ] | FormCreated, FormPublished, FormArchived |
| 2.9 | Repository interfaces (3) | [ ] | FormConfig, ConfigSection, ConfigQuestion |
| 2.10 | Domain exceptions | [ ] | FormNotFound, FormAlreadyPublished, QuestionDeletionBlocked |

### Application

| # | Item | Estado | Notas |
|---|---|---|---|
| 2.11 | Command DTOs (form) | [ ] | Create, Update, Publish, Archive, Delete |
| 2.12 | Command DTOs (section) | [ ] | Add, Update, Delete |
| 2.13 | Command DTOs (question/option) | [ ] | Add, Update, Delete |
| 2.14 | Response DTOs | [ ] | FormConfig, Section, Question, Option |
| 2.15 | Use Cases (form: 7) | [ ] | CRUD + Publish + Archive + GetPublic |
| 2.16 | Use Cases (section: 3) | [ ] | Add, Update, Delete |
| 2.17 | Use Cases (question: 3) | [ ] | Add, Update, Delete (con validación de instancias activas) |
| 2.18 | Use Cases (option: 3) | [ ] | Add, Update, Delete |

### Infrastructure

| # | Item | Estado | Notas |
|---|---|---|---|
| 2.19 | JPA Entities (4) | [ ] | FormConfig, ConfigSection, ConfigQuestion, ConfigOption |
| 2.20 | JPA Repositories (4) | [ ] | |
| 2.21 | Repository Adapters (3) | [ ] | |
| 2.22 | MapStruct Mappers (4) | [ ] | |
| 2.23 | FormConfigController | [ ] | ~18 endpoints |
| 2.24 | Migraciones Flyway (4) | [ ] | V2.0–V2.3 |

### Verificación

| # | Check | Estado |
|---|---|---|
| 2.25 | ModularityTest pasa | [ ] |
| 2.26 | CRUD forms, sections, questions, options funciona | [ ] |
| 2.27 | Publicación valida reglas | [ ] |
| 2.28 | Slug se genera automáticamente y es único | [ ] |
| 2.29 | Endpoint público `/public/forms/{slug}` funciona | [ ] |
| 2.30 | Events se publican | [ ] |

**Progreso Etapa 2: 0 / 30 items completados = 0%**

---

## Etapa 3 — Ejecución de Formularios (0%)

### Domain

| # | Item | Estado | Notas |
|---|---|---|---|
| 3.1 | `submission/package-info.java` | [ ] | `allowedDependencies = {"shared", "form"}` |
| 3.2 | `FormInstance` (domain model) | [ ] | |
| 3.3 | `InstanceSection` (domain model) | [ ] | Copia de ConfigSection |
| 3.4 | `InstanceQuestion` (domain model) | [ ] | FK a config_question_id |
| 3.5 | `InstanceOption` (domain model) | [ ] | FK a config_option_id |
| 3.6 | `InstanceAnswer` (domain model) | [ ] | |
| 3.7 | `SubmissionStatus` (enum) | [ ] | DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, CORRECTION_REQUESTED, CORRECTED |
| 3.8 | `SubmissionRevision` (domain model) | [ ] | Auditoría de revisiones |
| 3.9 | `RevisionAction` (enum) | [ ] | |
| 3.10 | Domain events (5) | [ ] | Created, Submitted, Approved, Rejected, CorrectionRequested |
| 3.11 | Repository interfaces (3) | [ ] | FormInstance, InstanceAnswer, SubmissionRevision |
| 3.12 | Domain exceptions | [ ] | FormInstanceNotFound, AlreadySubmitted, InvalidStatusTransition |

### Application

| # | Item | Estado | Notas |
|---|---|---|---|
| 3.13 | Command DTOs (ciudadano) | [ ] | Generate, SaveDraft, Submit, Correct |
| 3.14 | Command DTOs (revisor) | [ ] | Review, Approve, Reject, RequestCorrection, ReviseAnswers |
| 3.15 | Response DTOs | [ ] | FormInstance, InstanceSection, InstanceQuestion, InstanceAnswer, RevisionHistory |
| 3.16 | Use Cases ciudadano (4) | [ ] | Generate, SaveDraft, Submit, Correct |
| 3.17 | Use Cases revisor (5) | [ ] | TakeForReview, Approve, Reject, RequestCorrection, ReviseAnswers |
| 3.18 | Use Cases consulta (2) | [ ] | GetFormInstance, ListFormInstances |

### Infrastructure

| # | Item | Estado | Notas |
|---|---|---|---|
| 3.19 | JPA Entities (6) | [ ] | FormInstance, InstanceSection, InstanceQuestion, InstanceOption, InstanceAnswer, SubmissionRevision |
| 3.20 | JPA Repositories (3) | [ ] | |
| 3.21 | Repository Adapters (3) | [ ] | |
| 3.22 | MapStruct Mappers (5+) | [ ] | |
| 3.23 | SubmissionController (ciudadano) | [ ] | 5 endpoints públicos |
| 3.24 | ReviewController (revisor) | [ ] | 8 endpoints protegidos |
| 3.25 | Migraciones Flyway (6) | [ ] | V3.0–V3.5 |

### Verificación

| # | Check | Estado |
|---|---|---|
| 3.26 | ModularityTest pasa | [ ] |
| 3.27 | Generar instancia copia correctamente toda la estructura | [ ] |
| 3.28 | Flujo DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED funciona | [ ] |
| 3.29 | Flujo de corrección funciona | [ ] |
| 3.30 | Revisor puede corregir valores con auditoría | [ ] |
| 3.31 | Modificar config NO afecta instancias existentes | [ ] |
| 3.32 | Eliminar pregunta con instancias activas es BLOQUEADO | [ ] |
| 3.33 | Events se publican | [ ] |

**Progreso Etapa 3: 0 / 33 items completados = 0%**

---

## Etapa 4 — Analytics (0%)

| # | Item | Estado | Notas |
|---|---|---|---|
| 4.1 | `analytics/package-info.java` | [ ] | |
| 4.2 | Domain models (Stats) | [ ] | WorkSpaceStats, FormStats, SubmissionTimeSeries |
| 4.3 | Use Cases (3) | [ ] | DashboardStats, FormStats, ExportSubmissions |
| 4.4 | SubmissionCompletedListener | [ ] | |
| 4.5 | Response DTOs | [ ] | |
| 4.6 | AnalyticsRepositoryAdapter | [ ] | Queries de agregación |
| 4.7 | AnalyticsController | [ ] | 3 endpoints |
| 4.8 | ModularityTest pasa | [ ] |
| 4.9 | Stats devuelven datos correctos | [ ] |
| 4.10 | Export CSV funciona | [ ] |

**Progreso Etapa 4: 0 / 10 items completados = 0%**

---

## Etapa 5 — Notificaciones (0%)

| # | Item | Estado | Notas |
|---|---|---|---|
| 5.1 | `notification/package-info.java` | [ ] | |
| 5.2 | WorkSpaceCreatedListener | [ ] | |
| 5.3 | MemberAddedListener | [ ] | |
| 5.4 | SubmissionSubmittedListener | [ ] | |
| 5.5 | SubmissionApprovedListener | [ ] | |
| 5.6 | SubmissionRejectedListener | [ ] | |
| 5.7 | CorrectionRequestedListener | [ ] | |
| 5.8 | MailConfig + plantillas email | [ ] | |
| 5.9 | ModularityTest pasa | [ ] |
| 5.10 | Listeners no propagan excepciones | [ ] |

**Progreso Etapa 5: 0 / 10 items completados = 0%**

---

## Etapa 6 — Autenticación y Seguridad (0%)

| # | Item | Estado | Notas |
|---|---|---|---|
| 6.1 | `user/package-info.java` | [ ] | |
| 6.2 | `User` (domain model) | [ ] | |
| 6.3 | Repository interface | [ ] | |
| 6.4 | Domain exceptions | [ ] | |
| 6.5 | Command DTOs | [ ] | Register, Login, UpdateProfile, ChangePassword |
| 6.6 | Response DTOs | [ ] | AuthResponse, UserProfileResponse |
| 6.7 | Use Cases (6) | [ ] | Register, Login, Refresh, GetProfile, UpdateProfile, ChangePassword |
| 6.8 | JPA Entity + Repository + Adapter + Mapper | [ ] | |
| 6.9 | SecurityConfig (SecurityFilterChain) | [ ] | |
| 6.10 | JwtConfig + JwtAuthenticationFilter | [ ] | |
| 6.11 | AuthController | [ ] | 3 endpoints |
| 6.12 | UserController | [ ] | 2 endpoints |
| 6.13 | Migración Flyway | [ ] | V5.0 create_user |
| 6.14 | Retrofit: workspace extrae ownerId del JWT | [ ] | |
| 6.15 | Retrofit: submission extrae userId/revisedBy del JWT | [ ] | |
| 6.16 | ModularityTest pasa | [ ] |
| 6.17 | Register → Login → JWT → llamada autenticada funciona | [ ] |
| 6.18 | Rutas públicas accesibles sin token | [ ] |

**Progreso Etapa 6: 0 / 18 items completados = 0%**

---

## Log de Cambios

| Fecha | Etapa | Cambio | Autor |
|---|---|---|---|
| 2026-03-12 | — | Documento creado | — |
