# Etapa 0 — Fundación Compartida

> Carpeta de trabajo: `tramite/src/main/java/com/tramite/online/`
> Java 25 | Spring Boot 4.0.3 | Spring Modulith 2.0.3 | MapStruct 1.6.3

---

## Objetivo

Crear los módulos `shared` y `common` que sirven de base para todos los módulos de negocio.
Sin esta etapa, ningún módulo posterior puede compilar ni pasar `ModularityTest`.

---

## Estructura de Packages a Crear

```
com.tramite.online/
├── TramiteApplication.java                          ← ya existe
│
├── shared/
│   ├── package-info.java                            ← @ApplicationModule(type = OPEN)
│   ├── domain/
│   │   ├── event/
│   │   │   └── DomainEvent.java                     ← sealed interface (Java 21+)
│   │   └── constants/
│   │       └── ErrorCode.java                       ← enum con códigos de error
│   └── exception/
│       ├── BaseException.java                       ← sealed class (Java 21+)
│       ├── ResourceNotFoundException.java           ← extends BaseException
│       ├── BusinessException.java                   ← extends BaseException
│       ├── ValidationException.java                 ← extends BaseException
│       ├── UnauthorizedException.java               ← extends BaseException
│       ├── ForbiddenException.java                  ← extends BaseException
│       └── DeletionBlockedException.java            ← extends BaseException (nueva)
│
└── common/
    ├── package-info.java                            ← @ApplicationModule(type = OPEN)
    ├── config/
    │   └── WebConfig.java                           ← CORS config para Angular
    ├── models/
    │   ├── PagedResult.java                         ← record genérico de paginación
    │   └── ErrorResponse.java                       ← record para respuestas de error
    └── advice/
        └── GlobalExceptionHandler.java              ← @RestControllerAdvice
```

---

## Detalle de Cada Clase

### 1. `shared/package-info.java`

```
@ApplicationModule(type = ApplicationModule.Type.OPEN)
package com.tramite.online.shared;
```

- `OPEN` permite que cualquier módulo importe clases de `shared`

---

### 2. `shared/domain/event/DomainEvent.java` — sealed interface

**Features Java 21+ utilizados:** `sealed interface`, `record` implementations

```
DomainEvent (sealed interface)
│
├── Campos comunes (via métodos del interface):
│   ├── String eventId()       → UUID generado automáticamente
│   ├── Instant occurredAt()   → momento del evento
│   └── Long aggregateId()     → ID de la entidad raíz
│
└── Cada módulo creará sus implementaciones como records:
    ├── WorkSpaceCreated implements DomainEvent
    ├── FormPublished implements DomainEvent
    └── SubmissionSubmitted implements DomainEvent
```

**¿Por qué `sealed interface` en lugar de `class`?**
- Permite listar exhaustivamente los tipos de eventos en pattern matching (`switch` expressions)
- Los `record` que lo implementen son inmutables por defecto
- El compilador valida que solo los tipos permitidos lo extiendan

**¿Por qué `Instant` en lugar de `LocalDateTime`?**
- `Instant` es timezone-agnostic, ideal para eventos distribuidos
- Se convierte a `LocalDateTime` solo en la capa de presentación si es necesario

---

### 3. `shared/domain/constants/ErrorCode.java` — enum

**Feature Java 21+ utilizado:** enum con pattern matching compatible

```
ErrorCode (enum)
│
├── INTERNAL_ERROR          → "INTERNAL_ERROR"
├── RESOURCE_NOT_FOUND      → "RESOURCE_NOT_FOUND"
├── BUSINESS_RULE_VIOLATION → "BUSINESS_RULE_VIOLATION"
├── VALIDATION_ERROR        → "VALIDATION_ERROR"
├── UNAUTHORIZED            → "UNAUTHORIZED"
├── FORBIDDEN               → "FORBIDDEN"
├── DUPLICATE_RESOURCE      → "DUPLICATE_RESOURCE"
├── DELETION_BLOCKED        → "DELETION_BLOCKED"         ← nuevo
│
├── Campos:
│   ├── String code          → código para el JSON de respuesta
│   └── int httpStatus       → status HTTP correspondiente
│
└── Método: toHttpStatus() → convierte a HttpStatus de Spring
```

**¿Por qué `enum` en lugar de `String` constants?**
- Type-safe: el compilador valida usos incorrectos
- Asocia código + HTTP status en un solo lugar
- Compatible con `switch` expressions exhaustivas (Java 21+)

---

### 4. `shared/exception/BaseException.java` — sealed class

**Features Java 21+ utilizados:** `sealed class`, `permits`

```
BaseException (sealed abstract class extends RuntimeException)
│
├── Campos:
│   ├── ErrorCode errorCode     ← enum en lugar de String
│   └── Map<String, Object> details   ← metadata adicional (opcional)
│
├── Constructores:
│   ├── BaseException(String message, ErrorCode errorCode)
│   ├── BaseException(String message, ErrorCode errorCode, Map<String, Object> details)
│   └── BaseException(String message, ErrorCode errorCode, Throwable cause)
│
├── permits:
│   ├── ResourceNotFoundException
│   ├── BusinessException
│   ├── ValidationException
│   ├── UnauthorizedException
│   ├── ForbiddenException
│   └── DeletionBlockedException
│
└── Métodos:
    ├── ErrorCode getErrorCode()
    └── Map<String, Object> getDetails()    ← retorna Map.of() si vacío
```

**¿Por qué `sealed`?**
- Controla qué excepciones existen en el sistema
- El `GlobalExceptionHandler` puede usar `switch` expressions con verificación exhaustiva del compilador
- Evita excepciones "huérfanas" que no se manejan correctamente

---

### 5. `shared/exception/ResourceNotFoundException.java`

```
ResourceNotFoundException (final class extends BaseException)
│
├── errorCode: ErrorCode.RESOURCE_NOT_FOUND (fijo)
│
├── Constructores:
│   ├── ResourceNotFoundException(String message)
│   ├── ResourceNotFoundException(String resourceName, Long id)
│   │   → "WorkSpace no encontrado con ID: 123"
│   └── ResourceNotFoundException(String resourceName, String identifier)
│       → "Form no encontrado: mi-formulario"
```

---

### 6. `shared/exception/BusinessException.java`

```
BusinessException (non-sealed class extends BaseException)
│
├── errorCode: ErrorCode.BUSINESS_RULE_VIOLATION (por defecto)
│
├── Constructores:
│   ├── BusinessException(String message)
│   └── BusinessException(String message, ErrorCode errorCode)
│
└── non-sealed porque los módulos pueden crear sub-excepciones:
    ├── DuplicatedWorkSpaceException extends BusinessException
    ├── FormAlreadyPublishedException extends BusinessException
    └── InvalidStatusTransitionException extends BusinessException
```

**¿Por qué `non-sealed`?**
- Permite que cada módulo de negocio extienda `BusinessException` con excepciones específicas
- Las excepciones de módulo viven en `{modulo}/domain/exception/`

---

### 7. `shared/exception/ValidationException.java`

```
ValidationException (final class extends BaseException)
│
├── errorCode: ErrorCode.VALIDATION_ERROR (fijo)
│
├── Constructores:
│   ├── ValidationException(String message)
│   └── ValidationException(String field, String message)
│       → "Validación en campo 'name': no puede estar vacío"
```

---

### 8. `shared/exception/UnauthorizedException.java`

```
UnauthorizedException (final class extends BaseException)
│
├── errorCode: ErrorCode.UNAUTHORIZED (fijo)
│
├── Constructores:
│   ├── UnauthorizedException(String message)
│   └── UnauthorizedException()
│       → "Usuario no autenticado"
```

---

### 9. `shared/exception/ForbiddenException.java`

```
ForbiddenException (final class extends BaseException)
│
├── errorCode: ErrorCode.FORBIDDEN (fijo)
│
├── Constructores:
│   └── ForbiddenException(String message)
```

---

### 10. `shared/exception/DeletionBlockedException.java` — NUEVA

**Feature Java 21+ utilizado:** `record` para `ActiveReference`

```
DeletionBlockedException (final class extends BaseException)
│
├── errorCode: ErrorCode.DELETION_BLOCKED (fijo)
│
├── Campos adicionales:
│   └── List<ActiveReference> activeReferences
│
├── Constructores:
│   └── DeletionBlockedException(String resource, String identifier,
│                                 List<ActiveReference> activeReferences)
│       → "No se puede eliminar config_question 'q-005'.
│          Hay 3 formularios activos que la referencian"
│
├── ActiveReference (record interno):
│   ├── Long instanceId
│   ├── String userName
│   └── String status
│
└── Respuesta JSON que produce:
    {
      "code": "DELETION_BLOCKED",
      "message": "No se puede eliminar...",
      "timestamp": "2026-03-12T...",
      "details": {
        "activeReferences": [
          { "instanceId": 12, "userName": "Juan Pérez", "status": "DRAFT" },
          { "instanceId": 15, "userName": "María López", "status": "SUBMITTED" }
        ]
      }
    }
```

---

### 11. `common/package-info.java`

```
@ApplicationModule(type = ApplicationModule.Type.OPEN)
package com.tramite.online.common;
```

---

### 12. `common/models/ErrorResponse.java` — record

**Feature Java 21+ utilizado:** `record`

```
ErrorResponse (record)
│
├── Campos:
│   ├── String code                    ← código del error (de ErrorCode.code)
│   ├── String message                 ← mensaje descriptivo
│   ├── Instant timestamp              ← momento del error
│   └── Map<String, Object> details    ← metadata adicional (puede ser vacío)
│
├── Factory methods (static):
│   ├── of(BaseException ex)
│   │   → construye desde cualquier excepción del sistema
│   └── of(String code, String message)
│       → construye para errores genéricos (ej: 500)
```

**¿Por qué `record`?**
- Inmutable por defecto
- `toString()`, `equals()`, `hashCode()` generados automáticamente
- Serialización a JSON directa sin configuración adicional

---

### 13. `common/models/PagedResult.java` — record (ya existe en back/)

```
PagedResult<T> (record)
│
├── Campos:
│   ├── List<T> data
│   ├── long totalElements
│   ├── int pageNumber
│   ├── int totalPages
│   ├── boolean isFirst
│   ├── boolean isLast
│   ├── boolean hasNext
│   └── boolean hasPrevious
│
├── Constructores:
│   └── PagedResult(Page<T> page)     ← convierte desde Spring Data Page
│
└── Métodos:
    └── static <S,T> PagedResult<T> of(PagedResult<S> source, Function<S,T> mapper)
        → transforma el contenido con un mapper (útil para Entity → Response)
```

---

### 14. `common/config/WebConfig.java`

```
WebConfig (@Configuration implements WebMvcConfigurer)
│
├── Override: addCorsMappings(CorsRegistry registry)
│   ├── pattern: "/api/**"
│   ├── allowedOrigins: "http://localhost:4200" (Angular dev)
│   ├── allowedMethods: GET, POST, PUT, DELETE, PATCH, OPTIONS
│   ├── allowedHeaders: "*"
│   └── allowCredentials: true
```

---

### 15. `common/advice/GlobalExceptionHandler.java`

**Feature Java 21+ utilizado:** `switch` expression con pattern matching

```
GlobalExceptionHandler (@RestControllerAdvice)
│
├── Mapeo de excepciones:
│   │
│   │  switch (exception) {
│   │      case ResourceNotFoundException e → 404
│   │      case ValidationException e       → 400
│   │      case BusinessException e         → 422
│   │      case UnauthorizedException e     → 401
│   │      case ForbiddenException e        → 403
│   │      case DeletionBlockedException e  → 409
│   │  }
│   │
│   ├── @ExceptionHandler(BaseException.class)
│   │   → usa switch expression para resolver HTTP status desde ErrorCode
│   │   → retorna ResponseEntity<ErrorResponse>
│   │
│   ├── @ExceptionHandler(MethodArgumentNotValidException.class)
│   │   → errores de @Valid de Bean Validation
│   │   → retorna 400 con detalle de campos inválidos
│   │
│   └── @ExceptionHandler(Exception.class)
│       → fallback para errores no esperados
│       → retorna 500 con mensaje genérico (no expone stacktrace)
│
└── Formato de respuesta siempre:
    {
      "code": "RESOURCE_NOT_FOUND",
      "message": "WorkSpace no encontrado con ID: 123",
      "timestamp": "2026-03-12T14:30:00Z",
      "details": {}
    }
```

---

## Features de Java 21+ Utilizados en Etapa 0

| Feature | Dónde se usa | Beneficio |
|---|---|---|
| `sealed interface` | `DomainEvent` | Controla qué tipos de eventos existen. Pattern matching exhaustivo |
| `sealed class` | `BaseException` | Controla jerarquía de excepciones. `switch` exhaustivo en handler |
| `record` | `ErrorResponse`, `PagedResult`, `ActiveReference`, implementaciones de `DomainEvent` | Inmutabilidad, menos boilerplate, serialización directa |
| `switch` expression + pattern matching | `GlobalExceptionHandler` | Manejo de excepciones type-safe sin cadenas de `instanceof` |
| `Map.of()` / `List.of()` | Details en excepciones | Colecciones inmutables por defecto |
| `Instant` | `DomainEvent.occurredAt()`, `ErrorResponse.timestamp` | Timestamps timezone-agnostic |
| text blocks (`"""`) | Mensajes de error multilínea si se necesitan | Legibilidad |

---

## Test a Crear

```
tramite/src/test/java/com/tramite/online/
└── ModularityTest.java
    │
    └── Verifica:
        ├── Módulos shared y common son de tipo OPEN
        ├── No hay dependencias circulares
        └── La estructura de paquetes es válida para Spring Modulith
```

---

## Dependencias Maven (ya configuradas en pom.xml)

| Dependencia | Uso en Etapa 0 |
|---|---|
| `spring-boot-starter-webmvc` | `WebConfig`, `GlobalExceptionHandler`, `@RestControllerAdvice` |
| `spring-boot-starter-validation` | Bean Validation en `GlobalExceptionHandler` |
| `spring-modulith-starter-core` | `@ApplicationModule`, `package-info.java` |
| `spring-modulith-starter-test` | `ModularityTest` |
| `spring-boot-starter-data-jpa` | `PagedResult` usa `Page<T>` de Spring Data |

No se necesitan dependencias nuevas para esta etapa.

---

## Checklist de Completitud

```
[ ] shared/package-info.java creado
[ ] DomainEvent como sealed interface con métodos: eventId(), occurredAt(), aggregateId()
[ ] ErrorCode como enum con code + httpStatus
[ ] BaseException como sealed class con permits para las 6 excepciones
[ ] ResourceNotFoundException (final)
[ ] BusinessException (non-sealed — permite sub-excepciones en módulos)
[ ] ValidationException (final)
[ ] UnauthorizedException (final)
[ ] ForbiddenException (final)
[ ] DeletionBlockedException (final) con ActiveReference record y List<ActiveReference>
[ ] common/package-info.java creado
[ ] ErrorResponse record con factory method of(BaseException)
[ ] PagedResult record con constructor desde Page<T> y método of() con mapper
[ ] WebConfig con CORS para localhost:4200
[ ] GlobalExceptionHandler con switch expression y pattern matching
[ ] ModularityTest pasa
[ ] ./mvnw clean package -DskipTests → BUILD SUCCESS
```

---

## Notas para el Desarrollo

1. **No usar Lombok** — los `record` de Java 21+ ya proveen lo que Lombok daba (getters, equals, hashCode, toString). Para las clases no-record como `BaseException`, escribir los métodos manualmente o usar `record` donde sea posible.

2. **No importar Spring en `shared/domain/`** — `DomainEvent` y `ErrorCode` son Java puro. Solo `shared/exception/` puede importar de Spring si fuera necesario (no debería).

3. **`GlobalExceptionHandler` vive en `common/advice/`** y no en `shared/` porque usa Spring MVC (`@RestControllerAdvice`). El módulo `shared` se mantiene lo más puro posible.

4. **Java 25 del pom.xml** soporta todos los features de Java 21+ mencionados (sealed, records, pattern matching, switch expressions). Estos features son estables desde Java 21.
