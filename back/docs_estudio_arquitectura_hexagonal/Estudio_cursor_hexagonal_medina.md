# Estudio: Arquitectura Hexagonal de Enrique Medina

> Notas de estudio basadas en el repositorio de referencia
> `hexagonal-spring-ref-app` (paquete raíz `com.emedina.hexagonal.ref.app`) y el libro
> *Decoupling by Design — A Pragmatic Approach to Hexagonal Architecture* /
> *Desacoplamiento por Diseño* de **Enrique Medina Montenegro**.
>
> Objetivo de este documento: servir como **contexto portable** (para otra máquina
> o para asistirse con IA) que resume el modelo, sus patrones y cómo aplicarlo al
> proyecto `tramite-online`.

---

## 1. Resumen ejecutivo

Implementación "pura" de **Hexagonal (Ports & Adapters)** + **DDD** + **CQRS**, donde
el núcleo de negocio es **Java puro sin Spring, JPA ni Jackson**. La meta es un
desarrollo **"aburrido por diseño"**: el flujo siempre sigue los mismos pasos
deterministas y la tecnología no dicta la estructura de la aplicación.

- **Autor**: Enrique Medina Montenegro (Solution Architect, basado en Holanda).
- **Repo**: `github.com/emedina/hexagonal-spring-ref-app`
- **Stack**: Java 25, Spring Boot 4.0.1, Vavr 0.11 (Either/Validation), MapStruct, ArchUnit, Lombok.

### Problemas que ataca (vs. arquitectura de 3 capas tradicional)

- **Spring Bias**: el framework acaba dictando la arquitectura (`@Service`, `@Entity` por todos lados).
- **Modelos anémicos**: objetos con solo getters/setters y sin comportamiento.
- **Complejidad accidental**: la lógica se dispersa y se rompen los contratos entre capas.
- **Tests pesados**: levantar `@SpringBootTest` para probar lógica simple.

---

## 2. Los patrones clave

| Patrón | Para qué sirve | Dónde verlo en el repo |
|--------|----------------|------------------------|
| **Ports & Adapters** | Aislar el núcleo de la tecnología | módulos `application-core/*` vs `*-adapter` |
| **Always Valid Model** | Un objeto inválido no puede existir | `domain/entities/ArticleId.java`, `Title.java` |
| **Value Objects** | Tipado fuerte y semántica de negocio | `ArticleId`, `Title`, `Content`, `AuthorId`, `PersonName` |
| **CQRS / CQS** | Separar escritura (Command) de lectura (Query) | `application/command/` vs `application/query/` |
| **Command / Query Bus** | Desacoplar el controlador del Handler | `assembly/CommandQueryBusAssembler.java` |
| **Either (Vavr)** | Errores como valor de retorno, sin excepciones | todos los Handlers y repositorios |
| **Sealed errors** | Jerarquía cerrada y exhaustiva de errores | `shared/error/Error.java` |
| **Anotaciones propias** | Ensamblar con Spring sin contaminar el dominio | `@ApplicationService`, `@UseCase`, `@OutputPort`, `@Adapter` |
| **MapStruct** | Mapear entre Command/DTO/Entidad de dominio | `application/ArticleMapper.java` |
| **ArchUnit** | Tests que protegen las reglas de dependencia | `spring-boot-assembly/src/test/.../*ArchitectureTest.java` |

---

## 3. Estructura multi-módulo Maven

Cada adaptador es un **módulo Maven independiente**. Esto fuerza el desacoplamiento:
un módulo no puede importar lo que no declara como dependencia, así que el núcleo
físicamente no puede ver la tecnología.

```
application-core/
├── domain/          → entidades + Value Objects (Java puro, sin frameworks)
├── application/     → Handlers (implementan los casos de uso) + Mappers
├── input-ports/     → interfaces UseCase + Commands + Queries
└── output-ports/    → interfaces hacia el exterior (repos, APIs)
api-adapter/             → controlador REST (input/driving adapter)
in-memory-repositories/  → persistencia en memoria (output/driven adapter)
author-external-adapter/ → integración con API externa (output adapter)
shared-kernel/           → Error, ValidationError, Validations, DTOs
spring-boot-assembly/    → ensamblado Spring (DI) + tests de ArchUnit
```

### Nomenclatura de paquetes sugerida

```
com.empresa.core.domain.model              → entidades, records, Value Objects
com.empresa.core.domain.service            → domain services
com.empresa.core.application.ports.in       → Input Ports (UseCase)
com.empresa.core.application.ports.out      → Output Ports
com.empresa.core.application.handlers       → Handlers
com.empresa.infrastructure.adapters.input.api         → controllers REST
com.empresa.infrastructure.adapters.output.persistence → JPA
com.empresa.infrastructure.adapters.output.external    → APIs terceros
com.empresa.shared.kernel                   → DTOs, errores, validaciones sintácticas
```

> **Convención de trazabilidad**: el Command, el UseCase y el Handler comparten prefijo:
> `CreateArticleCommand` → `CreateArticleUseCase` → `CreateArticleHandler`.

---

## 4. El circuito "aburrido por diseño"

El flujo de una solicitud siempre es el mismo, independientemente del caso de uso:

1. **Input Adapter** (controlador REST) recibe la petición (JSON por HTTP).
2. Se mapea a un **Command** (si muta estado) o **Query** (si solo lee) mediante
   `validateThenCreate` → **validación sintáctica** (Always Valid Model). Datos
   inválidos no cruzan la frontera del hexágono.
3. Se envía al **Command Bus** o **Query Bus**, que enruta automáticamente al
   Handler correspondiente según el tipo del objeto.
4. El **Handler** orquesta el caso de uso: interactúa con el dominio y llama a
   **Output Ports** si necesita persistencia o datos externos.
5. Los **Output Adapters** ejecutan la acción técnica real (DB, API externa, SMTP).
6. Todo devuelve una **mónada `Either<Error, Result>`** (lado izquierdo = error
   tipado, lado derecho = resultado). No se lanzan excepciones de negocio.
7. El controlador hace `fold` sobre el `Either`: si es error → lo traduce a
   `ProblemDetail` (HTTP); si es éxito → mapea a DTO de respuesta y devuelve el
   status (200/201).

Apoyado en **CQRS**: los Commands devuelven `void`/error (sin resultado de negocio),
las Queries devuelven proyecciones (DTOs) sin efectos colaterales.

---

## 5. Snippets clave (código real del repo)

### 5.1. Value Object con Always Valid Model

Constructor **privado** + **static factory** que devuelve `Validation` (no lanza excepción):

```java
@Getter
@Accessors(fluent = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)   // constructor privado
public class ArticleId {

    @EqualsAndHashCode.Include
    private final String value;

    public static Validation<Error, ArticleId> validateThenCreate(final String id) {
        return Validations.validateText(id)
                .map(ArticleId::new)
                .mapError(e -> new Error.ValidationErrors(List.of(e)));
    }
}
```

### 5.2. Entidad agregada con comportamiento (no anémica)

`Validation.combine(...)` acumula errores de todos los campos a la vez:

```java
public static Validation<Error, Article> validateThenCreate(final ArticleId id, final Title title,
                                                            final Content content, final Author author) {
    return Validation.combine(validateMandatory(id), validateMandatory(title),
                              validateMandatory(content), validateMandatory(author))
            .ap((vid, vt, vc, va) -> new Article((ArticleId) vid, (Title) vt, (Content) vc, (Author) va))
            .mapError(e -> new Error.ValidationErrors(e.toJavaList()));
}

public Boolean enforceEligibilityForPublication() {
    this.verifyForPlagiarism();
    this.validateTitleLength();
    // ... lógica de negocio encapsulada en la entidad ...
    return true;
}
```

### 5.3. Errores tipados con `sealed interface` (cero excepciones)

```java
public sealed interface Error extends Serializable {
    record ValidationErrors(List<ValidationError> errors) implements Error {}
    record MultipleErrors(List<Error> errors) implements Error {}

    sealed interface BusinessError extends Error {
        record UnknownArticle(String id) implements BusinessError {}
        record InvalidId(String id) implements BusinessError {}
    }
    sealed interface TechnicalError extends Error {
        record SomethingWentWrong(String message) implements TechnicalError {}
    }
}
```

### 5.4. Command con validación sintáctica en la frontera

```java
public class CreateArticleCommand implements Command {
    private final String id, authorId, title, content;

    public static Validation<Error, CreateArticleCommand> validateThenCreate(
            final String id, final String authorId, final String title, final String content) {
        return Validation.combine(validateText(id), validateText(authorId),
                                  validateText(title), validateText(content))
                .ap(CreateArticleCommand::new)
                .mapError(e -> new Error.ValidationErrors(e.toJavaList()));
    }
}
```

### 5.5. Input Port (UseCase) y Handler

El puerto de entrada es una interface que extiende `CommandHandler`:

```java
@UseCase
public interface CreateArticleUseCase extends CommandHandler<Error, CreateArticleCommand> {}
```

El Handler usa la anotación propia `@ApplicationService` (no `@Service` de Spring) y
compone con `flatMap`:

```java
@ApplicationService
@RequiredArgsConstructor
class CreateArticleHandler implements CreateArticleUseCase {

    private final AuthorOutputPort authorOutputPort;
    private final ArticleRepository articleRepository;

    @Override
    @Transactional
    public Either<Error, Void> handle(final CreateArticleCommand command) {
        return this.authorOutputPort.lookupAuthor(command.authorId())
            .flatMap(author -> ArticleMapper.INSTANCE.toArticle(command, author).toEither())
            .flatMap(this.articleRepository::save);
    }
}
```

### 5.6. Output Port (interface) y su Adapter

Puerto (en el núcleo):

```java
@OutputPort
public interface AuthorOutputPort {
    Either<Error, AuthorDTO> lookupAuthor(final String id);
}
```

Adapter (en infraestructura), anotado con `@Adapter`, mapea fallos técnicos a `TechnicalError`:

```java
@Adapter
@RequiredArgsConstructor
class InMemoryArticleRepository implements ArticleRepository {
    final Map<ArticleId, Article> articles = new ConcurrentHashMap<>();

    @Override
    public Either<Error, Article> findById(final ArticleId id) {
        return Try.of(() -> this.articles.containsKey(id))
                .toEither()
                .<Error>mapLeft(t -> new Error.TechnicalError.SomethingWentWrong(t.getMessage()))
                .flatMap(exists -> exists
                        ? Try.of(() -> this.articles.get(id)).toEither()
                              .mapLeft(t -> new Error.TechnicalError.SomethingWentWrong(t.getMessage()))
                        : Either.left(new Error.BusinessError.UnknownArticle(id.value())));
    }
}
```

### 5.7. Controlador "aburrido por diseño"

Todos los endpoints siguen el mismo esquema: validar → bus → mapear error → `fold`:

```java
return CreateArticleCommand.validateThenCreate(req.id(), req.authorId(), req.title(), req.content())
        .toEither()
        .flatMap(cmd -> this.commandBus.<Error, CreateArticleCommand>execute(cmd))
        .mapLeft(e -> this.apiErrorHandler.mapErrorToProblemDetail(e, request))
        .fold(failure -> ApiResultUtils.createFailureResponse(failure, ...),
              success -> ApiResultUtils.createSuccessResponse(HttpStatus.CREATED, null));
```

### 5.8. Mapeo entre capas con MapStruct

`Command` → entidades de dominio (validando), y `Article` → `ArticleDTO`:

```java
@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE)
interface ArticleMapper {
    ArticleMapper INSTANCE = Mappers.getMapper(ArticleMapper.class);

    @Mapping(target = "id", expression = "java(article.id().value())")
    @Mapping(target = "title", expression = "java(article.title().value())")
    ArticleDTO toArticleDto(final Article article);

    default Validation<Error, Article> toArticle(final CreateArticleCommand command, final AuthorDTO author) {
        return toAuthor(author)
            .flatMap(a -> toArticle(command.id(), command.title(), command.content(), a));
    }
}
```

### 5.9. Ensamblado del Bus con Spring

El Bus se crea en la capa de infraestructura; el núcleo solo conoce la interface:

```java
@Configuration(proxyBeanMethods = false)
class CommandQueryBusAssembler {
    @Bean
    public CommandBus commandBus(final ApplicationContext ctx) {
        return new SpringCommandBus(new com.emedina.command.spring.Registry(ctx));
    }
    @Bean
    public QueryBus queryBus(final ApplicationContext ctx) {
        return new SpringQueryBus(new com.emedina.query.spring.Registry(ctx));
    }
}
```

### 5.10. Tests de arquitectura con ArchUnit

Hay un test por capa que falla el build si se viola una regla de dependencia:
`DomainArchitectureTest`, `InputPortsArchitectureTest`, `OutputPortsArchitectureTest`,
`HandlerArchitectureTest`, `CommandArchitectureTest`, `QueryArchitectureTest`,
`AdaptersArchitectureTest`, `SharedKernelArchitectureTest`.

```java
@AnalyzeClasses(packages = { "com.emedina.hexagonal.ref.app.domain" })
@SpringBootTest(classes = { HexagonalArchitectureConfig.class, DomainArchitectureTest.TestConfig.class })
class DomainArchitectureTest {
    @ArchTest
    public static final ArchTests domainRules = ArchTests.in(DomainChecker.class);
}
```

---

## 6. Cómo se mapea a `tramite-online`

| Concepto del modelo Medina | ¿Lo tiene `tramite-online`? | Evidencia / Nota |
|----------------------------|-----------------------------|------------------|
| Capas domain/application/infraestructure | Sí | estructura por módulo (`user`, `workspace`, ...) |
| Input Ports (UseCase) | Sí | `user/application/in/CreateUserUseCase.java` |
| Output Ports (repositorios) | Sí | `workspace/domain/repository/WorkSpaceRepository.java` |
| Output Adapters (JPA) | Sí | `workspace/infraestructure/persistence/adapter/...` |
| Value Objects | Empezando | `user/domain/model/vo/Email.java` |
| Always Valid Model | Parcial | se valida en constructor; falta constructor privado + static factory |
| Commands / Queries explícitos | Parcial | hay `workspace/application/dto/command/`; faltan Queries formales |
| Command / Query Bus | No | los controllers llaman use cases directamente |
| Either (Vavr) | No | se usan excepciones |
| Sealed errors | No | jerarquía clásica con `BaseException` |
| Anotaciones propias | No | se usa `@Service` de Spring |
| ArchUnit | Equivalente | se usa `ModularityTest` de Spring Modulith |

---

## 7. Plan de adopción incremental (recomendado)

No conviene adoptar todo de golpe. Orden sugerido, de menor a mayor impacto:

1. **Always Valid Model** en los Value Objects: constructor privado + static factory
   (`validateThenCreate`). Es el siguiente paso natural para `Email`.
2. **Either (Vavr)** para errores de negocio: añadir la dependencia y empezar por un
   caso de uso piloto.
3. **Commands / Queries** explícitos con validación sintáctica + separación **CQRS**.
4. **Command / Query Bus**: es el cambio más grande; dejarlo para el final.
5. **ArchUnit** para blindar las reglas (o seguir apoyándose en `ModularityTest`).

> **Advertencia del propio autor**: `Either` + Bus pueden ser **sobreingeniería**
> según el contexto. La hexagonal "clásica" que ya usa `tramite-online`
> (Spring Modulith + domain events + excepciones) es perfectamente válida y
> pragmática. Adoptar estas piezas solo si aportan valor real al proyecto.

---

## 8. Referencias

- Repo: `github.com/emedina/hexagonal-spring-ref-app`
- Libro (EN): *Decoupling by Design: A Practitioner's Guide to Hexagonal Architecture* — Leanpub / Amazon.
- Libro (ES): *Desacoplamiento por Diseño: Una Guía Práctica para la Arquitectura Hexagonal* — Leanpub / Amazon.
- Librerías propias del autor: `shared-kernel` (Command/Query/CommandBus/QueryBus), anotaciones (`@ApplicationService`, `@UseCase`, `@OutputPort`, `@Adapter`), y la librería de ArchUnit hexagonal.
- Documento complementario en este repo: `Resumen_Arquitecture.md`.
