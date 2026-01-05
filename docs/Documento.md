Problemas:
- 4+ llamadas HTTP
- Si falla la 3ra, quedaron datos basura
- Usuario no puede cancelar sin dejar datos inconsistentes

✅ Flujo BUENO (Estado en memoria + 1 llamada):

Angular                          Backend
│                                │
│ (Usuario trabaja en memoria)  │
│  - Crea form                   │
│  - Agrega sections             │
│  - Agrega questions            │
│  - Agrega options              │
│                                │
│ Usuario hace clic "Guardar"    │
│                                │
├─ POST /api/forms (TODO) ───────┤
│                                ├─ @Transactional
│                                ├─ Guarda Form
│                                ├─ Guarda Sections
│                                ├─ Guarda Questions
│                                ├─ Guarda Options
│                                ├─ Publica eventos
│                                └─ Commit
│                                │
└──────── Response ──────────────┘

Ventajas:
✅ 1 sola llamada HTTP
✅ Todo en una transacción (atomicidad)
✅ Usuario puede cancelar sin afectar BD
✅ Mejor UX (trabaja offline)
✅ Si falla, no queda nada guardado

  ---
📝 5. DTOs necesarios en el backend

// CreateFormCommand.java
public class CreateFormCommand {
private Long workspaceId;
private String title;
private String description;
private List<SectionDTO> sections;  // ← Anidado

      // getters/setters
}

// SectionDTO.java
public class SectionDTO {
private String title;
private String description;
private Integer displayOrder;
private List<QuestionDTO> questions;  // ← Anidado

      // getters/setters
}

// QuestionDTO.java
public class QuestionDTO {
private String text;
private String description;
private QuestionType type;
private Integer displayOrder;
private Boolean required;
private String placeholder;
private Integer minLength;
private Integer maxLength;
private List<OptionDTO> options;  // ← Anidado

      // getters/setters
}

// OptionDTO.java
public class OptionDTO {
private String label;
private String value;
private Integer weight;
private Integer displayOrder;

      // getters/setters
}

  ---
✅ Resumen:

| Aspecto       | Estado en memoria       | Llamadas por operación    |
  |---------------|-------------------------|---------------------------|
| Llamadas HTTP | 1                       | 10+                       |
| Si cancela    | No afecta BD            | Datos basura en BD        |
| Transaccional | Sí (todo o nada)        | No (parcial)              |
| UX            | Rápido, fluido          | Lento, esperas            |
| Offline       | Posible                 | Imposible                 |
| Eventos       | Al final (consistentes) | Múltiples (pueden fallar) |

Conclusión: ✅ Siempre trabaja con estado en memoria y guarda TODO de una vez.

¿Quieres el código completo del Use Case y DTOs para este flujo?
