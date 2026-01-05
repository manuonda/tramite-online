package com.tramite.online.workspace.application.dto.command;

import com.tramite.online.workspace.domain.model.WorkspaceRole;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Record para actualizar el rol de un miembre del Espacio
 * de Trabajo
 */
public record UpdateMemberRoleCommand(
        @NotNull(message = "El ID del miembre el Obligatorio")
        @Positive(message = "El ID del miembro debe ser un numero positivo")
        Long userId,

        @NotNull(message = "El nuevo Rol es Obligatorio")
        WorkspaceRole role,

        @NotNull(message = "El ID del Espacio de Trabajo es Obligatorio")
        @Positive(message = "El ID del Espacio de Trabajo debe ser un numero positivo")
        Long workSpaceId
) {
}
