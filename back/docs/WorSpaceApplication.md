```java
      @Positive(message = "El ID del propietario debe ser un número positivo")
      Long ownerId
  ) {}

  ---
  2. UpdateWorkSpaceCommand.java

  package com.tramite.online.workspace.application.dto;

  import jakarta.validation.constraints.*;

  /**
   * Record para actualizar un workspace existente
   */
  public record UpdateWorkSpaceCommand(
      @NotNull(message = "El ID del workspace es obligatorio")
      @Positive(message = "El ID debe ser un número positivo")
      Long id,

      @NotBlank(message = "El nombre del workspace es obligatorio")
      @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
      @Pattern(regexp = "^[a-zA-Z0-9\\s\\-_.]+$", message = "El nombre solo puede contener letras, números, espacios, guiones, puntos y guiones bajos")
      String name,

      @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
      String description
  ) {}

  ---
  3. AddMemberCommand.java

  package com.tramite.online.workspace.application.dto;

  import com.tramite.online.workspace.domain.model.WorkSpaceRole;
  import jakarta.validation.constraints.*;

  /**
   * Record para agregar un miembro a un workspace
   */
  public record AddMemberCommand(
      @NotNull(message = "El ID del workspace es obligatorio")
      @Positive(message = "El ID del workspace debe ser un número positivo")
      Long workspaceId,

      @NotNull(message = "El ID del usuario es obligatorio")
      @Positive(message = "El ID del usuario debe ser un número positivo")
      Long userId,

      @NotNull(message = "El rol es obligatorio")
      WorkSpaceRole role
  ) {}

  ---
  4. UpdateMemberRoleCommand.java

  package com.tramite.online.workspace.application.dto;

  import com.tramite.online.workspace.domain.model.WorkSpaceRole;
  import jakarta.validation.constraints.*;

  /**
   * Record para actualizar el rol de un miembro en un workspace
   */
  public record UpdateMemberRoleCommand(
      @NotNull(message = "El ID del miembro es obligatorio")
      @Positive(message = "El ID del miembro debe ser un número positivo")
      Long memberId,

      @NotNull(message = "El nuevo rol es obligatorio")
      WorkSpaceRole newRole
  ) {}

  ---
  5. RemoveMemberCommand.java

  package com.tramite.online.workspace.application.dto;

  import jakarta.validation.constraints.*;

  /**
   * Record para remover un miembro de un workspace
   */
  public record RemoveMemberCommand(
      @NotNull(message = "El ID del miembro es obligatorio")
      @Positive(message = "El ID del miembro debe ser un número positivo")
      Long memberId
  ) {}

  ---
  6. ArchiveWorkSpaceCommand.java

  package com.tramite.online.workspace.application.dto;

  import jakarta.validation.constraints.*;

  /**
   * Record para archivar un workspace
   */
  public record ArchiveWorkSpaceCommand(
      @NotNull(message = "El ID del workspace es obligatorio")
      @Positive(message = "El ID del workspace debe ser un número positivo")
      Long id
  ) {}

  ---
  7. DeleteWorkSpaceCommand.java

  package com.tramite.online.workspace.application.dto;

  import jakarta.validation.constraints.*;

  /**
   * Record para eliminar un workspace
   */
  public record DeleteWorkSpaceCommand(
      @NotNull(message = "El ID del workspace es obligatorio")
      @Positive(message = "El ID del workspace debe ser un número positivo")
      Long id
  ) {}

  ---
  8. GetWorkSpaceByIdCommand.java

  package com.tramite.online.workspace.application.dto;

  import jakarta.validation.constraints.*;

  /**
   * Record para obtener un workspace por ID
   */
  public record GetWorkSpaceByIdCommand(
      @NotNull(message = "El ID del workspace es obligatorio")
      @Positive(message = "El ID del workspace debe ser un número positivo")
      Long id
  ) {}

  ---
  9. ListWorkSpacesByOwnerCommand.java

  package com.tramite.online.workspace.application.dto;

  import jakarta.validation.constraints.*;

  /**
   * Record para listar workspaces de un propietario
   */
  public record ListWorkSpacesByOwnerCommand(
      @NotNull(message = "El ID del propietario es obligatorio")
      @Positive(message = "El ID del propietario debe ser un número positivo")
      Long ownerId
  ) {}

  ---
  RESPONSES (También como Records)

  10. WorkSpaceResponse.java

  package com.tramite.online.workspace.application.dto;

  import java.time.LocalDateTime;

  /**
   * Record para la respuesta de un workspace
   * Datos que se retornan al cliente
   */
  public record WorkSpaceResponse(
      Long id,
      String name,
      String description,
      boolean active,
      boolean archived,
      Long ownerId,
      LocalDateTime createdAt,
      LocalDateTime updatedAt
  ) {}

  ---
  11. MemberResponse.java

  package com.tramite.online.workspace.application.dto;

  import java.time.LocalDateTime;

  /**
   * Record para la respuesta de un miembro del workspace
   */
  public record MemberResponse(
      Long id,
      Long workspaceId,
      Long userId,
      String role,
      LocalDateTime joinedAt,
      LocalDateTime updatedAt
  ) {}

  ---
  Resumen: Todos los Commands

  workspace/application/dto/
  ├── COMMANDS (Entrada - Con validaciones)
  │   ├── CreateWorkSpaceCommand.java
  │   ├── UpdateWorkSpaceCommand.java
  │   ├── AddMemberCommand.java
  │   ├── UpdateMemberRoleCommand.java
  │   ├── RemoveMemberCommand.java
  │   ├── ArchiveWorkSpaceCommand.java
  │   ├── DeleteWorkSpaceCommand.java
  │   ├── GetWorkSpaceByIdCommand.java
  │   └── ListWorkSpacesByOwnerCommand.java
  │
  └── RESPONSES (Salida)
      ├── WorkSpaceResponse.java
      └── MemberResponse.java

  ---
  Validaciones por comando:

  | Command                      | Validaciones                                                 |
  |------------------------------|--------------------------------------------------------------|
  | CreateWorkSpaceCommand       | name (@NotBlank, @Size, @Pattern), ownerId (@Positive)       |
  | UpdateWorkSpaceCommand       | id (@Positive), name (@NotBlank, @Size, @Pattern)            |
  | AddMemberCommand             | workspaceId (@Positive), userId (@Positive), role (@NotNull) |
  | UpdateMemberRoleCommand      | memberId (@Positive), newRole (@NotNull)                     |
  | RemoveMemberCommand          | memberId (@Positive)                                         |
  | ArchiveWorkSpaceCommand      | id (@Positive)                                               |
  | DeleteWorkSpaceCommand       | id (@Positive)                                               |
  | GetWorkSpaceByIdCommand      | id (@Positive)                                               |
  | ListWorkSpacesByOwnerCommand | ownerId (@Positive)                                          |

  ---
  Características de los Records:

  ✅ Inmutables - No se pueden cambiar después de crearlos
  ✅ Conciso - Sin boilerplate
  ✅ equals/hashCode/toString - Generados automáticamente
  ✅ Validaciones - Con anotaciones de Jakarta Validation
  ✅ Type-safe - Compilador verifica tipos
  ✅ Moderno - Java 14+


```