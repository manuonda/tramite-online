# ROADMAP de Implementación — Backend Tramite Online

> Documento de planificación del backend Spring Modulith. Actualizar al cerrar cada etapa.
> Fecha de elaboración: 2026-03-12

---

## Visión General de Etapas

| Etapa | Nombre | Módulos | Dependencia previa |
|---|---|---|---|
| **0** | Fundación Compartida | `shared`, `common` | — |
| **1** | Workspace Core | `workspace` | Etapa 0 |
| **2** | Configuración de Formularios | `form` | Etapa 1 |
| **3** | Ejecución de Formularios (Instancias + Submissions) | `submission` | Etapa 2 |
| **4** | Analytics | `analytics` | Etapa 3 |
| **5** | Notificaciones | `notification` | Etapas 1, 2, 3 |
| **6** | Autenticación y Seguridad | `user` | Etapas 1–5 |

---

## Orden de Implementación

```
Etapa 0 (shared + common)
    │
    ▼
Etapa 1 (workspace)
    │
    ▼
Etapa 2 (form config)
    │
    ▼
Etapa 3 (form instances + submissions)
    │
    ├──► Etapa 4 (analytics)    ── paralelas ──
    └──► Etapa 5 (notification) ──────────────┘
              │
              ▼
         Etapa 6 (user + security)
```

---

## Decisión Arquitectónica: Instancia Normalizada (no JSONB Snapshot)

### El Problema

Cuando un formulario tiene submissions activas (DRAFT, SUBMITTED, UNDER_REVIEW) y el admin modifica la configuración (agrega/elimina preguntas), ¿qué pasa con los formularios en curso?

### Solución Elegida: Dos Mundos Separados

```
CONFIGURACIÓN (template del admin)              INSTANCIA (copia para el usuario)
──────────────────────────────                   ──────────────────────────────────
form_config                                      form_instance
  └── config_section                               └── instance_section
        └── config_question ◄──── FK ────────            └── instance_question
              └── config_option                                ├── config_question_id (FK)
                                                               ├── text, type, required (copiados)
                                                               └── instance_answer
                                                                     └── value
```

**Principio:** Cuando el ciudadano inicia un formulario, el sistema genera una **instancia materializada** copiando la configuración actual a tablas propias. Las modificaciones posteriores a la configuración no afectan instancias existentes.

### Reglas Fundamentales

| Regla | Descripción |
|---|---|
| **R1 — Instancia inmutable** | Una vez generada, la instancia no cambia por modificaciones en la config |
| **R2 — FK a config original** | Cada `instance_question` mantiene referencia a su `config_question_id` |
| **R3 — No eliminar config activa** | No se puede eliminar una `config_question` si hay instancias activas que la referencian. Se debe notificar cuáles formularios están activos |
| **R4 — Modificar sí, eliminar no** | Se puede cambiar texto, tipo, opciones en la config. Solo afecta nuevas instancias |
| **R5 — Agregar es libre** | Agregar secciones o preguntas nuevas siempre es permitido. Solo aparecen en nuevas instancias |
| **R6 — Revisor ve la instancia** | El revisor interno trabaja con `instance_questions` + `instance_answers`, nunca con la config actual |

### Validación de Eliminación

```
Admin intenta eliminar config_question "q-005"
    │
    ├── ¿Existe instance_question con config_question_id = "q-005"
    │    donde form_instance.status IN (DRAFT, SUBMITTED, UNDER_REVIEW)?
    │
    ├── SÍ → BLOQUEAR + mostrar instancias activas al admin
    └── NO → Permitir eliminación
```

### ¿Qué se puede modificar con instancias activas?

| Acción en config | ¿Permitido? | Efecto en instancias existentes |
|---|---|---|
| Cambiar texto de pregunta | Sí | Ninguno (tienen su copia) |
| Cambiar tipo de pregunta | Sí | Ninguno |
| Cambiar opciones | Sí | Ninguno |
| Cambiar required | Sí | Ninguno |
| Agregar pregunta nueva | Sí | No aparece en instancias existentes |
| Agregar sección nueva | Sí | No aparece en instancias existentes |
| **Eliminar pregunta** | **NO si hay activas** | Bloquear + notificar |
| **Eliminar sección** | **NO si hay activas** | Bloquear (contiene preguntas referenciadas) |

---

## Diagrama de Estado de Submission

```
                    ┌───────────┐
      Ciudadano     │   DRAFT   │ ← ciudadano inicia o guarda borrador
                    └─────┬─────┘
                          │ submit()
                          ▼
                    ┌───────────┐
                    │ SUBMITTED │
                    └─────┬─────┘
                          │ revisor toma el caso
                          ▼
                    ┌──────────────┐
                    │ UNDER_REVIEW │
                    └──┬───┬───┬──┘
                       │   │   │
          approve()    │   │   │ requestCorrection()
                       ▼   │   ▼
               ┌──────────┐│ ┌─────────────────────┐
               │ APPROVED ││ │ CORRECTION_REQUESTED │
               └──────────┘│ └──────────┬───────────┘
                           │            │ ciudadano corrige y re-envía
                  reject() │            ▼
                           ▼      ┌───────────┐
                    ┌──────────┐  │ CORRECTED │──► vuelve a UNDER_REVIEW
                    │ REJECTED │  └───────────┘
                    └──────────┘
```

**Transiciones válidas:**
- `DRAFT` → `SUBMITTED` (ciudadano envía)
- `SUBMITTED` → `UNDER_REVIEW` (revisor toma el caso)
- `UNDER_REVIEW` → `APPROVED` (revisor aprueba)
- `UNDER_REVIEW` → `REJECTED` (revisor rechaza)
- `UNDER_REVIEW` → `CORRECTION_REQUESTED` (revisor pide corrección)
- `CORRECTION_REQUESTED` → `CORRECTED` (ciudadano corrige)
- `CORRECTED` → `UNDER_REVIEW` (automático o manual)

---

## Etapa 0 — Fundación Compartida

### Objetivo

Establecer las bases transversales que todos los módulos necesitan.

### Módulos

- `shared` — excepciones base, contrato de domain events, constantes
- `common` — configuración global de Spring (CORS, ObjectMapper, beans globales)

### Capas a implementar

**shared:**

| Paquete | Clase | Descripción |
|---|---|---|
| `shared/domain/event/` | `DomainEvent.java` | Record base para todos los domain events |
| `shared/domain/constants/` | `Constants.java` | Constantes globales (paginación, formatos de fecha) |
| `shared/exception/` | `BaseException.java` | Excepción base del sistema |
| `shared/exception/` | `BusinessException.java` | Error de regla de negocio (422) |
| `shared/exception/` | `ResourceNotFoundException.java` | Recurso no encontrado (404) |
| `shared/exception/` | `ValidationException.java` | Error de validación (400) |
| `shared/exception/` | `UnauthorizedException.java` | No autenticado (401) |
| `shared/exception/` | `ForbiddenException.java` | Sin permisos (403) |
| `shared/exception/` | `DeletionBlockedException.java` | Eliminación bloqueada por referencias activas (409) |
| `shared/infrastructure/web/advice/` | `GlobalExceptionHandler.java` | `@RestControllerAdvice` — mapea excepciones a JSON |
| `shared/` | `package-info.java` | `@ApplicationModule` sin restricciones |

**common:**

| Paquete | Clase | Descripción |
|---|---|---|
| `common/config/` | `WebConfig.java` | CORS para Angular `localhost:4200` |
| `common/models/` | `PagedResult.java` | Wrapper genérico de paginación |

**Formato de error estándar:**

```json
{
  "code": "RESOURCE_NOT_FOUND",
  "message": "WorkSpace con id 123 no encontrado",
  "timestamp": "2026-03-12T14:30:00Z"
}
```

### Criterio de Done

- [ ] `./mvnw test -Dtest=ModularityTest` → PASS
- [ ] `GlobalExceptionHandler` responde JSON para cada tipo de excepción
- [ ] `DeletionBlockedException` devuelve 409 con lista de referencias activas
- [ ] `PagedResult<T>` serializa correctamente
- [ ] `./mvnw spring-boot:run` arranca sin errores con PostgreSQL vacío

---

## Etapa 1 — Workspace Core

### Objetivo

Implementar la unidad organizacional principal. Todo el negocio vive dentro de un workspace.

### Módulo: `workspace`

### Domain

| Paquete | Clase | Descripción |
|---|---|---|
| `domain/model/` | `WorkSpace` | POJO: id, name, description, ownerId, status, createdAt, updatedAt |
| `domain/model/` | `WorkSpaceMember` | POJO: id, workspaceId, userId, email, role, joinedAt |
| `domain/model/` | `WorkspaceRole` | Enum: OWNER, ADMIN, EDITOR, VIEWER |
| `domain/event/` | `WorkSpaceCreated` | Record: workspaceId, ownerId |
| `domain/event/` | `WorkSpaceArchived` | Record: workspaceId |
| `domain/event/` | `WorkSpaceDeleted` | Record: workspaceId |
| `domain/event/` | `MemberAdded` | Record: workspaceId, userId, email, role |
| `domain/event/` | `MemberRemoved` | Record: workspaceId, userId |
| `domain/event/` | `MemberUpdated` | Record: workspaceId, userId, newRole |
| `domain/repository/` | `WorkSpaceRepository` | Interfaz — puerto de salida |
| `domain/repository/` | `WorkSpaceMemberRepository` | Interfaz — puerto de salida |
| `domain/exception/` | `WorkSpaceNotFoundException` | Extends ResourceNotFoundException |
| `domain/exception/` | `DuplicatedWorkSpaceException` | Extends BusinessException |

### Application

| Paquete | Clase |
|---|---|
| `application/dto/command/` | `CreateWorkSpaceCommand`, `UpdateWorkSpaceCommand`, `ArchiveWorkSpaceCommand` |
| `application/dto/command/` | `AddMemberCommand`, `RemoveMemberCommand`, `UpdateMemberRoleCommand` |
| `application/dto/response/` | `WorkSpaceResponse`, `MemberResponse` |
| `application/usecases/` | `CreateWorkSpaceUseCase`, `UpdateWorkSpaceUseCase`, `DeleteWorkSpaceUseCase` |
| `application/usecases/` | `ArchiveWorkSpaceUseCase`, `ListWorkSpacesByOwnerUseCase`, `GetWorkSpaceByIdUseCase` |
| `application/usecases/` | `AddMemberUseCase`, `RemoveMemberUseCase`, `UpdateMemberRoleUseCase`, `ListMembersUseCase` |

### Infrastructure

| Paquete | Clase |
|---|---|
| `infrastructure/persistence/entity/` | `WorkSpaceEntity`, `WorkSpaceMemberEntity` |
| `infrastructure/persistence/repository/` | `WorkSpaceJpaRepository`, `WorkSpaceMemberJpaRepository` |
| `infrastructure/persistence/adapter/` | `WorkSpaceRepositoryAdapter`, `WorkSpaceMemberRepositoryAdapter` |
| `infrastructure/persistence/mapper/` | `WorkSpaceMapper`, `WorkSpaceMemberMapper` (MapStruct) |
| `infrastructure/web/controller/` | `WorkSpaceController` |
| | `package-info.java` — `@ApplicationModule(allowedDependencies = "shared")` |

### Endpoints REST

| Método | Ruta | Use Case |
|---|---|---|
| POST | `/api/v1/workspaces` | CreateWorkSpaceUseCase |
| GET | `/api/v1/workspaces` | ListWorkSpacesByOwnerUseCase |
| GET | `/api/v1/workspaces/{id}` | GetWorkSpaceByIdUseCase |
| PUT | `/api/v1/workspaces/{id}` | UpdateWorkSpaceUseCase |
| DELETE | `/api/v1/workspaces/{id}` | DeleteWorkSpaceUseCase |
| POST | `/api/v1/workspaces/{id}/archive` | ArchiveWorkSpaceUseCase |
| POST | `/api/v1/workspaces/{id}/members` | AddMemberUseCase |
| DELETE | `/api/v1/workspaces/{id}/members/{mid}` | RemoveMemberUseCase |
| PUT | `/api/v1/workspaces/{id}/members/{mid}/role` | UpdateMemberRoleUseCase |
| GET | `/api/v1/workspaces/{id}/members` | ListMembersUseCase |

### Flyway

- `db/migration/workspace/V1.0__create_table_workspace.sql`
- `db/migration/workspace/V1.1__create_table_workspace_member.sql`

### Criterio de Done

- [ ] `ModularityTest` pasa
- [ ] 10 endpoints responden correctamente (curl / Postman)
- [ ] Events `WorkSpaceCreated`, `MemberAdded` se publican (verificable en log)
- [ ] Paginación funciona en `GET /api/v1/workspaces?page=0&size=20`
- [ ] Excepciones devuelven JSON estándar via `GlobalExceptionHandler`
- [ ] Migraciones Flyway aplicadas sin error

---

## Etapa 2 — Configuración de Formularios

### Objetivo

Permitir al admin crear y configurar formularios dinámicos: secciones, preguntas de distintos tipos, opciones. Estas son las **tablas de configuración** (template). La ejecución por usuarios se hace en Etapa 3.

### Módulo: `form`

### Modelo de Datos — Configuración

```
form_config
  ├── id, workspace_id, title, slug (único), description
  ├── status: DRAFT | PUBLISHED | ARCHIVED
  └── 1:N → config_section
                ├── id, form_config_id, title, description, displayOrder
                └── 1:N → config_question
                              ├── id, config_section_id, text, type, required
                              ├── displayOrder, config (JSON validaciones)
                              └── 1:N → config_option
                                          ├── id, config_question_id
                                          └── label, value, displayOrder
```

### QuestionType (enum)

| Tipo | Config fields |
|---|---|
| `TEXT` | placeholder, maxLength, validationPattern, validationMessage |
| `TEXTAREA` | placeholder, maxLength, rows |
| `NUMBER` | min, max, decimalPlaces |
| `DATE` | minDate, maxDate |
| `SELECT` | placeholder |
| `MULTISELECT` | minSelections, maxSelections |
| `FILE` | allowedExtensions, maxFileSizeMB, maxFiles |
| `CHECKBOX` | checkedValue, uncheckedValue |

### Domain

| Paquete | Clase |
|---|---|
| `domain/model/` | `FormConfig`, `ConfigSection`, `ConfigQuestion`, `ConfigOption` |
| `domain/model/` | `QuestionType` (enum), `QuestionConfig` (POJO validaciones), `FormStatus` (enum) |
| `domain/event/` | `FormCreated`, `FormPublished`, `FormArchived` |
| `domain/repository/` | `FormConfigRepository`, `ConfigSectionRepository`, `ConfigQuestionRepository` |
| `domain/exception/` | `FormNotFoundException`, `FormAlreadyPublishedException`, `QuestionDeletionBlockedException` |

### Application

| Paquete | Clase |
|---|---|
| `application/dto/command/` | `CreateFormCommand`, `UpdateFormCommand`, `PublishFormCommand`, `ArchiveFormCommand`, `DeleteFormCommand` |
| `application/dto/command/` | `AddSectionCommand`, `UpdateSectionCommand`, `DeleteSectionCommand` |
| `application/dto/command/` | `AddQuestionCommand`, `UpdateQuestionCommand`, `DeleteQuestionCommand` |
| `application/dto/command/` | `AddOptionCommand`, `UpdateOptionCommand`, `DeleteOptionCommand` |
| `application/dto/response/` | `FormConfigResponse`, `SectionResponse`, `QuestionResponse`, `OptionResponse` |
| `application/usecases/` | `CreateFormUseCase`, `UpdateFormUseCase`, `PublishFormUseCase`, `ArchiveFormUseCase`, `DeleteFormUseCase` |
| `application/usecases/` | `GetFormUseCase`, `ListFormsUseCase`, `GetPublicFormUseCase` |
| `application/usecases/` | `AddSectionUseCase`, `UpdateSectionUseCase`, `DeleteSectionUseCase` |
| `application/usecases/` | `AddQuestionUseCase`, `UpdateQuestionUseCase`, `DeleteQuestionUseCase` |
| `application/usecases/` | `AddOptionUseCase`, `UpdateOptionUseCase`, `DeleteOptionUseCase` |

**Use case especial — `DeleteQuestionUseCase`:**

```
1. Buscar instance_questions con config_question_id = questionId
   donde form_instance.status IN (DRAFT, SUBMITTED, UNDER_REVIEW)
2. Si existen → lanzar QuestionDeletionBlockedException
   con lista de {instanceId, userId, status}
3. Si no existen → eliminar
```

### Infrastructure

| Paquete | Clase |
|---|---|
| `infrastructure/persistence/entity/` | `FormConfigEntity`, `ConfigSectionEntity`, `ConfigQuestionEntity`, `ConfigOptionEntity` |
| `infrastructure/persistence/repository/` | `FormConfigJpaRepository`, `ConfigSectionJpaRepository`, `ConfigQuestionJpaRepository`, `ConfigOptionJpaRepository` |
| `infrastructure/persistence/adapter/` | `FormConfigRepositoryAdapter`, `ConfigSectionRepositoryAdapter`, `ConfigQuestionRepositoryAdapter` |
| `infrastructure/persistence/mapper/` | `FormConfigMapper`, `ConfigSectionMapper`, `ConfigQuestionMapper`, `ConfigOptionMapper` (MapStruct) |
| `infrastructure/web/controller/` | `FormConfigController` |
| | `package-info.java` — `@ApplicationModule(allowedDependencies = {"shared", "workspace"})` |

### Endpoints REST

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/workspaces/{wid}/forms` | Crear formulario |
| GET | `/api/v1/workspaces/{wid}/forms` | Listar formularios del workspace |
| GET | `/api/v1/forms/{id}` | Obtener formulario completo |
| PUT | `/api/v1/forms/{id}` | Actualizar datos del formulario |
| POST | `/api/v1/forms/{id}/publish` | Publicar formulario |
| POST | `/api/v1/forms/{id}/archive` | Archivar formulario |
| DELETE | `/api/v1/forms/{id}` | Eliminar formulario |
| GET | `/api/v1/public/forms/{slug}` | Formulario público (sin auth) |
| | | |
| POST | `/api/v1/forms/{id}/sections` | Agregar sección |
| PUT | `/api/v1/forms/{id}/sections/{sid}` | Actualizar sección |
| DELETE | `/api/v1/forms/{id}/sections/{sid}` | Eliminar sección |
| | | |
| POST | `/api/v1/forms/{fid}/sections/{sid}/questions` | Agregar pregunta |
| PUT | `/api/v1/questions/{qid}` | Actualizar pregunta |
| DELETE | `/api/v1/questions/{qid}` | Eliminar pregunta (valida referencias activas) |
| | | |
| POST | `/api/v1/questions/{qid}/options` | Agregar opción |
| PUT | `/api/v1/options/{oid}` | Actualizar opción |
| DELETE | `/api/v1/options/{oid}` | Eliminar opción |

### Reglas de Negocio

- El `slug` se genera automáticamente desde el título (slugify) y es único
- Solo se puede publicar un form que tenga al menos una sección con al menos una pregunta
- Un form PUBLISHED se puede seguir configurando (las modificaciones solo afectan nuevas instancias)
- Un form ARCHIVED no acepta nuevas instancias pero los drafts existentes pueden completarse
- Eliminar una pregunta o sección valida que no haya instancias activas referenciándola

### Flyway

- `db/migration/form/V2.0__create_table_form_config.sql`
- `db/migration/form/V2.1__create_table_config_section.sql`
- `db/migration/form/V2.2__create_table_config_question.sql`
- `db/migration/form/V2.3__create_table_config_option.sql`

### Criterio de Done

- [ ] `ModularityTest` pasa
- [ ] CRUD completo de formularios, secciones, preguntas y opciones funciona
- [ ] Publicación valida reglas (mínimo 1 sección con 1 pregunta)
- [ ] Endpoint público `/public/forms/{slug}` devuelve formulario completo
- [ ] Event `FormPublished` se publica
- [ ] `DeleteQuestionUseCase` bloquea eliminación si hay instancias activas (Etapa 3 requerida para test completo)
- [ ] Slug se genera automáticamente y es único

---

## Etapa 3 — Ejecución de Formularios (Instancias + Submissions)

### Objetivo

Implementar la generación de instancias de formulario (copia materializada de la config) y el flujo completo de submission con revisión interna.

### Módulo: `submission`

### Modelo de Datos — Instancias y Respuestas

```
form_instance
  ├── id, form_config_id (FK), user_id, status, created_at, updated_at
  └── 1:N → instance_section
                ├── id, form_instance_id, config_section_id (FK)
                ├── title, description, displayOrder (copiados)
                └── 1:N → instance_question
                              ├── id, instance_section_id, config_question_id (FK)
                              ├── text, type, required, config, displayOrder (copiados)
                              ├── 1:N → instance_option
                              │           ├── id, instance_question_id, config_option_id (FK)
                              │           └── label, value, displayOrder (copiados)
                              └── 1:1 → instance_answer
                                          ├── id, instance_question_id
                                          └── value (TEXT), updated_at

submission_revision (auditoría de revisión)
  ├── id, form_instance_id (FK), revised_by
  ├── action: REVIEWED | CORRECTED | APPROVED | REJECTED | CORRECTION_REQUESTED
  ├── previous_answers (JSON), new_answers (JSON)
  ├── comment, created_at
```

### Flujo de Generación de Instancia

```
Ciudadano abre formulario publicado
    │
    ▼
GenerateFormInstanceUseCase
    ├── 1. Verificar form_config.status = PUBLISHED
    ├── 2. Crear form_instance (status = DRAFT)
    ├── 3. Copiar config_sections → instance_sections
    ├── 4. Copiar config_questions → instance_questions (guardar config_question_id como FK)
    ├── 5. Copiar config_options → instance_options (guardar config_option_id como FK)
    └── 6. Retornar la instancia completa para que el frontend renderice
```

### Domain

| Paquete | Clase |
|---|---|
| `domain/model/` | `FormInstance`, `InstanceSection`, `InstanceQuestion`, `InstanceOption`, `InstanceAnswer` |
| `domain/model/` | `SubmissionStatus` (enum: DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, CORRECTION_REQUESTED, CORRECTED) |
| `domain/model/` | `SubmissionRevision`, `RevisionAction` (enum) |
| `domain/event/` | `SubmissionCreated`, `SubmissionSubmitted`, `SubmissionApproved`, `SubmissionRejected`, `CorrectionRequested` |
| `domain/repository/` | `FormInstanceRepository`, `InstanceAnswerRepository`, `SubmissionRevisionRepository` |
| `domain/exception/` | `FormInstanceNotFoundException`, `SubmissionAlreadySubmittedException`, `InvalidStatusTransitionException` |

### Application

| Paquete | Clase | Descripción |
|---|---|---|
| `application/usecases/` | `GenerateFormInstanceUseCase` | Crea la instancia materializada copiando la config |
| `application/usecases/` | `SaveDraftUseCase` | Guarda respuestas parciales (DRAFT) |
| `application/usecases/` | `SubmitFormInstanceUseCase` | Valida respuestas required y cambia a SUBMITTED |
| `application/usecases/` | `GetFormInstanceUseCase` | Carga instancia completa con preguntas y respuestas |
| `application/usecases/` | `ListFormInstancesUseCase` | Lista instancias de un form (admin) |
| `application/usecases/` | `TakeForReviewUseCase` | Revisor toma una instancia → UNDER_REVIEW |
| `application/usecases/` | `ApproveSubmissionUseCase` | Revisor aprueba → APPROVED |
| `application/usecases/` | `RejectSubmissionUseCase` | Revisor rechaza → REJECTED |
| `application/usecases/` | `RequestCorrectionUseCase` | Revisor pide corrección → CORRECTION_REQUESTED |
| `application/usecases/` | `CorrectSubmissionUseCase` | Ciudadano corrige → CORRECTED → UNDER_REVIEW |
| `application/usecases/` | `ReviseAnswersUseCase` | Revisor corrige valores (crea SubmissionRevision) |
| | | |
| `application/dto/command/` | `GenerateFormInstanceCommand`, `SaveDraftCommand`, `SubmitCommand` |
| `application/dto/command/` | `ReviewCommand`, `ApproveCommand`, `RejectCommand`, `RequestCorrectionCommand`, `CorrectCommand` |
| `application/dto/response/` | `FormInstanceResponse`, `InstanceSectionResponse`, `InstanceQuestionResponse`, `InstanceAnswerResponse` |
| `application/dto/response/` | `FormInstanceSummaryResponse` (para listados), `RevisionHistoryResponse` |

### Infrastructure

| Paquete | Clase |
|---|---|
| `infrastructure/persistence/entity/` | `FormInstanceEntity`, `InstanceSectionEntity`, `InstanceQuestionEntity`, `InstanceOptionEntity`, `InstanceAnswerEntity`, `SubmissionRevisionEntity` |
| `infrastructure/persistence/repository/` | `FormInstanceJpaRepository`, `InstanceAnswerJpaRepository`, `SubmissionRevisionJpaRepository` |
| `infrastructure/persistence/adapter/` | `FormInstanceRepositoryAdapter`, `InstanceAnswerRepositoryAdapter`, `SubmissionRevisionRepositoryAdapter` |
| `infrastructure/persistence/mapper/` | `FormInstanceMapper`, `InstanceSectionMapper`, `InstanceQuestionMapper`, `InstanceAnswerMapper`, `SubmissionRevisionMapper` (MapStruct) |
| `infrastructure/web/controller/` | `SubmissionController` (endpoints públicos del ciudadano) |
| `infrastructure/web/controller/` | `ReviewController` (endpoints del revisor/admin) |
| | `package-info.java` — `@ApplicationModule(allowedDependencies = {"shared", "form"})` |

### Endpoints REST — Ciudadano (público)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/public/forms/{slug}/start` | Genera instancia (copia la config actual) |
| GET | `/api/v1/public/instances/{instanceId}` | Carga instancia con preguntas y respuestas |
| PUT | `/api/v1/public/instances/{instanceId}/draft` | Guarda borrador parcial |
| POST | `/api/v1/public/instances/{instanceId}/submit` | Envía formulario completado |
| PUT | `/api/v1/public/instances/{instanceId}/correct` | Ciudadano corrige tras solicitud del revisor |

### Endpoints REST — Revisor/Admin (protegidos)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/forms/{formId}/instances` | Listar instancias de un formulario |
| GET | `/api/v1/instances/{instanceId}` | Ver detalle de instancia con respuestas |
| POST | `/api/v1/instances/{instanceId}/review` | Tomar para revisión → UNDER_REVIEW |
| POST | `/api/v1/instances/{instanceId}/approve` | Aprobar → APPROVED |
| POST | `/api/v1/instances/{instanceId}/reject` | Rechazar → REJECTED |
| POST | `/api/v1/instances/{instanceId}/request-correction` | Pedir corrección → CORRECTION_REQUESTED |
| PUT | `/api/v1/instances/{instanceId}/revise-answers` | Revisor corrige valores (crea revision) |
| GET | `/api/v1/instances/{instanceId}/revisions` | Historial de revisiones |

### Reglas de Negocio

- Solo se puede generar instancia de un form con status PUBLISHED
- Un form ARCHIVED permite completar instancias existentes pero no generar nuevas
- `submit()` valida que todas las preguntas `required` tengan respuesta
- Transiciones de estado son unidireccionales (no se puede retroceder excepto CORRECTION_REQUESTED → CORRECTED → UNDER_REVIEW)
- `ReviseAnswersUseCase` registra delta (previous/new) en `submission_revision` para auditoría
- La validación de respuestas se hace contra `instance_question.config` (no contra la config actual)

### Flyway

- `db/migration/submission/V3.0__create_table_form_instance.sql`
- `db/migration/submission/V3.1__create_table_instance_section.sql`
- `db/migration/submission/V3.2__create_table_instance_question.sql`
- `db/migration/submission/V3.3__create_table_instance_option.sql`
- `db/migration/submission/V3.4__create_table_instance_answer.sql`
- `db/migration/submission/V3.5__create_table_submission_revision.sql`

### Criterio de Done

- [ ] `ModularityTest` pasa
- [ ] Generar instancia copia correctamente toda la estructura del form
- [ ] Flujo DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED funciona end-to-end
- [ ] Flujo de corrección UNDER_REVIEW → CORRECTION_REQUESTED → CORRECTED → UNDER_REVIEW funciona
- [ ] Revisor puede corregir valores y se registra en `submission_revision`
- [ ] Modificar config de pregunta NO afecta instancias existentes
- [ ] Eliminar pregunta con instancias activas es BLOQUEADO (valida contra Etapa 2)
- [ ] Events `SubmissionSubmitted`, `SubmissionApproved`, `SubmissionRejected` se publican
- [ ] Validación de required contra `instance_question.config`
- [ ] Migraciones Flyway aplicadas sin error

---

## Etapa 4 — Analytics

### Objetivo

Dashboard de estadísticas y exportación de datos de instancias/submissions.

### Módulo: `analytics`

### Capas a implementar

**domain/model/:**
- `WorkSpaceStats` — total forms, total instances, instances por status
- `FormStats` — total instances, por status, tasa de completitud
- `SubmissionTimeSeries` — instancias por día/semana/mes

**application/:**
- `GetDashboardStatsUseCase` — stats agregadas del workspace
- `GetFormStatsUseCase` — stats de un formulario
- `ExportSubmissionsUseCase` — exportar instancias + respuestas (CSV / JSON)
- `SubmissionCompletedListener` — escucha `SubmissionSubmitted` para contadores

**infrastructure/:**
- `AnalyticsRepositoryAdapter` — queries de agregación (JPA projections o native queries)
- `AnalyticsController`
- `package-info.java` — `@ApplicationModule(allowedDependencies = {"shared"})`

**Estrategia MVP:** queries de agregación directas sobre tablas de `form_instance` e `instance_answer`. Sin tabla de contadores propia.

### Endpoints REST

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/workspaces/{id}/analytics` | Stats del workspace |
| GET | `/api/v1/forms/{id}/analytics` | Stats del formulario |
| GET | `/api/v1/forms/{id}/instances/export?format=csv` | Exportar (CSV / JSON) |

### Reportes por pregunta (gracias a las FK normalizadas)

```sql
-- Ejemplo: distribución de respuestas por pregunta
SELECT iq.config_question_id, iq.text, ia.value, COUNT(*)
FROM instance_question iq
JOIN instance_answer ia ON ia.instance_question_id = iq.id
JOIN form_instance fi ON fi.id = iq.instance_section_id
WHERE fi.form_config_id = :formId
  AND fi.status = 'APPROVED'
GROUP BY iq.config_question_id, iq.text, ia.value
```

### Criterio de Done

- [ ] `ModularityTest` pasa
- [ ] Stats de workspace y formulario devuelven datos correctos
- [ ] Export CSV descargable
- [ ] Reportes agrupan por `config_question_id` correctamente

---

## Etapa 5 — Notificaciones

### Objetivo

Emails transaccionales en respuesta a domain events. No expone REST. Completamente reactivo.

### Módulo: `notification`

### Listeners

| Listener | Evento escuchado | Acción |
|---|---|---|
| `WorkSpaceCreatedListener` | `WorkSpaceCreated` | Email de bienvenida al owner |
| `MemberAddedListener` | `MemberAdded` | Email de invitación al nuevo miembro |
| `SubmissionSubmittedListener` | `SubmissionSubmitted` | Notifica al admin del form |
| `SubmissionApprovedListener` | `SubmissionApproved` | Notifica al ciudadano |
| `SubmissionRejectedListener` | `SubmissionRejected` | Notifica al ciudadano |
| `CorrectionRequestedListener` | `CorrectionRequested` | Notifica al ciudadano que debe corregir |

### Infrastructure

- `MailConfig.java` — Spring Mail (SMTP)
- Plantillas de email en `resources/templates/email/`
- `package-info.java` — `@ApplicationModule(allowedDependencies = {"shared"})`
- Usar Mailhog via Docker Compose para desarrollo

### Consideraciones técnicas

- `@EventListener` síncronos para MVP. Capturar excepciones internamente — un fallo de email nunca debe bloquear el flujo de negocio
- En fase Modulith Maduro → migrar a `@Async` o outbox pattern

### Criterio de Done

- [ ] `ModularityTest` pasa
- [ ] Cada evento genera log de intento de email
- [ ] Los listeners NO propagan excepciones al flujo de negocio
- [ ] Plantillas de email creadas para cada evento

---

## Etapa 6 — Autenticación y Seguridad (JWT)

### Objetivo

Proteger todos los endpoints con Spring Security + JWT. Se deja al final para no bloquear el desarrollo del núcleo de negocio. Durante las etapas 1–5 el `ownerId`/`userId` va en el body del request.

### Módulo: `user`

### Domain

| Paquete | Clase |
|---|---|
| `domain/model/` | `User` — email, passwordHash, displayName, roles, active |
| `domain/repository/` | `UserRepository` |
| `domain/exception/` | `UserNotFoundException`, `UserAlreadyExistsException`, `InvalidCredentialsException` |

### Application

| Paquete | Clase |
|---|---|
| `application/dto/command/` | `RegisterCommand`, `LoginCommand`, `UpdateProfileCommand`, `ChangePasswordCommand` |
| `application/dto/response/` | `AuthResponse` (JWT + refreshToken), `UserProfileResponse` |
| `application/usecases/` | `RegisterUseCase`, `LoginUseCase`, `RefreshTokenUseCase`, `GetProfileUseCase`, `UpdateProfileUseCase`, `ChangePasswordUseCase` |

### Infrastructure

| Paquete | Clase |
|---|---|
| `infrastructure/persistence/entity/` | `UserEntity` |
| `infrastructure/persistence/repository/` | `UserJpaRepository` |
| `infrastructure/persistence/adapter/` | `UserRepositoryAdapter` |
| `infrastructure/persistence/mapper/` | `UserMapper` (MapStruct) |
| `infrastructure/config/` | `SecurityConfig` (SecurityFilterChain), `JwtConfig` |
| `infrastructure/web/filter/` | `JwtAuthenticationFilter` (OncePerRequestFilter) |
| `infrastructure/web/controller/` | `AuthController`, `UserController` |
| | `package-info.java` — `@ApplicationModule(allowedDependencies = {"shared"})` |

### Endpoints REST

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/auth/register` | Registro |
| POST | `/api/v1/auth/login` | Login → JWT |
| POST | `/api/v1/auth/refresh` | Renovar token |
| GET | `/api/v1/users/me` | Perfil autenticado |
| PUT | `/api/v1/users/me` | Actualizar perfil |

### Rutas públicas (sin auth)

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/public/forms/{slug}`
- `POST /api/v1/public/forms/{slug}/start`
- `GET /api/v1/public/instances/{instanceId}`
- `PUT /api/v1/public/instances/{instanceId}/draft`
- `POST /api/v1/public/instances/{instanceId}/submit`
- `PUT /api/v1/public/instances/{instanceId}/correct`

### Retrofit en módulos existentes

Al integrar JWT, se deben actualizar los módulos anteriores:

| Módulo | Cambio |
|---|---|
| `workspace` | `ownerId` se extrae del JWT, no del body |
| `submission` | `userId` del ciudadano puede ser anónimo o extraído de JWT |
| `submission` | `revisedBy` en revisiones se extrae del JWT |

### Flyway

- `db/migration/user/V5.0__create_table_user.sql`

### Criterio de Done

- [ ] `ModularityTest` pasa
- [ ] Register → Login → JWT → llamada autenticada funciona end-to-end
- [ ] Endpoints sin JWT devuelven 401
- [ ] Rutas públicas accesibles sin token
- [ ] `GET /api/v1/workspaces` filtra por usuario del token
- [ ] Revisiones registran `revisedBy` desde el JWT

---

## Checklist de Verificación por Etapa

Ejecutar antes de marcar una etapa como completada:

```
[ ] ./mvnw test -Dtest=ModularityTest       → PASS
[ ] ./mvnw clean package -DskipTests        → BUILD SUCCESS
[ ] ./mvnw spring-boot:run                  → arranca sin errores
[ ] Endpoints verificados con Postman/curl
[ ] Migraciones Flyway aplicadas limpiamente
[ ] Domain events publicados y verificables en log
[ ] GlobalExceptionHandler responde correctamente a errores
[ ] package-info.java con dependencias correctas
```

---

## Decisiones Técnicas Registradas

| Decisión | Justificación |
|---|---|
| **Instancia normalizada** (no JSONB snapshot) | FK a config original permite bloquear eliminación de preguntas activas. Reportes por pregunta con SQL estándar. Integridad referencial en PostgreSQL |
| **Auth al final** (Etapa 6) | No bloquea el desarrollo del núcleo. `ownerId` va en body durante dev |
| **Sin interfaces de use case** en MVP | Velocidad. Se agregan si el proyecto escala |
| **Events síncronos** en MVP | Simplicidad. Migrar a asíncronos en fase Modulith Maduro |
| **Analytics sin tabla propia** en MVP | Queries directas sobre tablas existentes son suficientes |
| **Slug autogenerado** en Form | Endpoint público sin UUID expuesto |
| **No eliminar config con instancias activas** | Protege integridad de formularios en curso. Admin recibe feedback de qué instancias están activas |
| **Dos controllers en submission** | `SubmissionController` (ciudadano, público) y `ReviewController` (revisor, protegido) separan responsabilidades |
