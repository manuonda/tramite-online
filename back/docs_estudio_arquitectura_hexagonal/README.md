# Estudio: Arquitectura Hexagonal (Enrique Medina)

Material de referencia para entender e implementar **Arquitectura Hexagonal (Ports & Adapters)** en Java/Spring, basado en el enfoque de **Enrique Medina Montenegro** y su aplicación al proyecto **tramite-online**.

---

## Documento principal

### [Resumen_Arquitecture.md](./Resumen_Arquitecture.md)

**Guía de Implementación de Arquitectura Hexagonal en Código Java** — resumen ejecutivo que sintetiza principios, patrones y estrategias de implementación.

| Sección | Contenido |
|---------|-----------|
| **Resumen ejecutivo** | Desacoplamiento del núcleo de negocio respecto a frameworks; desarrollo *"aburrido por diseño"* |
| **1. Problema de la arquitectura de 3 capas** | Spring Bias, complejidad accidental, modelos anémicos, dificultad en testeo |
| **2. Fundamentos hexagonales** | Application Core, Input/Output Ports, Input/Output Adapters, Infraestructura |
| **3. Patrones clave** | Always Valid Model, Either (Vavr), segregación de modelos, CQRS + Command/Query Bus |
| **4. Implementación en Java** | Anotaciones propias (`@ApplicationService`, `@Adapter`), ArchUnit, records/sealed/pattern matching |
| **5. Conclusión** | Valor del desarrollo estandarizado y resiliencia ante cambios tecnológicos |

**Autor del enfoque:** Enrique Medina Montenegro  
**Repo de referencia:** [hexagonal-spring-ref-app](https://github.com/emedina/hexagonal-spring-ref-app)  
**Libro:** *Decoupling by Design* / *Desacoplamiento por Diseño*

---

## Otros documentos en esta carpeta

| Documento | Propósito | Cuándo usarlo |
|-----------|-----------|---------------|
| [Estudio_cursor_hexagonal_medina.md](./Estudio_cursor_hexagonal_medina.md) | Notas ampliadas con snippets del repo de referencia y comparativa con `tramite-online` | Contexto portable para otra máquina o asistencia con IA |
| [HEXAGONAL_STUDY_GUIDE.md](./HEXAGONAL_STUDY_GUIDE.md) | Guía práctica: hexagonal + Spring Modulith, hoja de ruta por fases y checklist | Implementar patrones paso a paso en este proyecto |

**Orden sugerido de lectura:**

1. **Resumen_Arquitecture.md** — visión general y conceptos (15 min)
2. **Estudio_cursor_hexagonal_medina.md** — profundización con código real del repo de Medina
3. **HEXAGONAL_STUDY_GUIDE.md** — aplicación concreta en `tramite-online`

---

## Conceptos clave (del resumen)

### Puertos vs. adaptadores

| Componente | Rol | Ubicación |
|------------|-----|-----------|
| **Input Port** | Contrato de casos de uso (qué puede hacer la app) | Borde del núcleo |
| **Input Adapter** | REST, Kafka, CLI (cómo entra la petición) | Infraestructura |
| **Output Port** | Contrato de dependencias externas (qué necesita el núcleo) | Borde del núcleo |
| **Output Adapter** | JPA, APIs externas, SMTP (cómo se implementa) | Infraestructura |

### Patrones del resumen

- **Always Valid Model** — constructor privado + static factory; objeto inválido no existe
- **Either (Vavr)** — errores como valor, no excepciones
- **CQRS / CQS** — Commands mutan; Queries solo leen
- **Command/Query Bus** — enrutador que desacopla controlador del Handler
- **Segregación de modelos** — Request/Response, Command/Query, dominio, entidades JPA (MapStruct)
- **ArchUnit** — tests que protegen reglas de dependencia entre capas

### Flujo típico de una solicitud

```
REST Controller → Command/Query (validateThenCreate)
    → Command/Query Bus → Handler
    → Dominio + Output Ports → Adapters (DB, API)
    → Either<Error, Result> → fold → HTTP Response
```

---

## Relación con tramite-online

Este proyecto ya usa **Spring Modulith** (módulos: `user`, `workspace`, `form`, etc.) con capas **domain / application / infrastructure** por módulo.

| Enfoque Medina (resumen) | Estado en tramite-online |
|--------------------------|---------------------------|
| Puertos y adaptadores | Parcial — use cases y repositorios como ports |
| Value Objects | En progreso — p. ej. `user/domain/model/vo/` |
| Always Valid Model | Parcial — validación en constructores de records |
| Command/Query Bus + Either | No adoptado aún |
| ArchUnit | Equivalente: `ModularityTest` (Spring Modulith) |

Para adoptar patrones de forma incremental, ver la **hoja de ruta por fases** en [HEXAGONAL_STUDY_GUIDE.md](./HEXAGONAL_STUDY_GUIDE.md).

---

## Referencias externas

- Repositorio: [github.com/emedina/hexagonal-spring-ref-app](https://github.com/emedina/hexagonal-spring-ref-app)
- Arquitectura del backend de este repo: [../ARCHITECTURE_GUIDE.md](../ARCHITECTURE_GUIDE.md)
- Comandos y módulos: [../../CLAUDE.md](../../CLAUDE.md)

---

*Material de estudio — no sustituye la documentación oficial del proyecto ni el libro de Enrique Medina.*



● El UserRepositoryAdapter implementa UserRepository de application. Es el puente:

  UserRepository (port.out / application)
          ↑ implements
  UserRepositoryAdapter (infraestructure/adapters/output/persistence)
          usa → UserJpaRepository
          usa → UserMapper

  ---
  Las clases a crear en orden

  infraestructure/adapters/output/persistence/
  │
  ├── entity/
  │   └── UserEntity.java          ← mover el que ya tienes aquí
  │
  ├── repository/
  │   └── UserJpaRepository.java   ← extends JpaRepository<UserEntity, Long>
  │
  ├── mapper/
  │   └── UserMapper.java          ← User (dominio) ↔ UserEntity (JPA)
  │
  └── UserRepositoryAdapter.java   ← implements UserRepository ✓

  ---
  Flujo completo cuando el Handler llama al port.out

  CreateUserHandler
    │
    │  userRepository.save(user)   ← llama al port.out (interfaz)
    ▼
  UserRepository (interfaz)
    │
    │  Spring inyecta la implementación automáticamente
    ▼
  UserRepositoryAdapter            ← infraestructura, nadie más lo conoce
    │
    ├── mapper.toEntity(user)      ← User → UserEntity
    ├── jpaRepository.save(entity) ← persiste en BD
    └── mapper.toDomain(saved)     ← UserEntity → User

  ¿Empezamos por UserEntity → UserJpaRepository → UserMapper → UserRepositoryAdapter en ese orden?

