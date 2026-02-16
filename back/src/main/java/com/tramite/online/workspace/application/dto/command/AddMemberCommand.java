package com.tramite.online.workspace.application.dto.command;

import com.tramite.online.workspace.domain.model.WorkspaceRole;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Record para agregar un miembro a un workSpace
 * @param workSpaceId
 * @param userId
 * @param role
 *
 * @author dgarcia
 * @version 1.0
 * @since  21/11/2025
 */
public record AddMemberCommand(
        @NotNull(message = "El ID del Espacio de Trabajo es obligatorio")
        @Positive(message="El del Espacio de Trabajo debe ser numero positivo")
        Long workSpaceId,
        @NotNull(message = "El ID del usuario es obligatorio")
        @Positive(message = "El ID del Usuario debe ser numero positivo")
        Long userId,

        @NotNull(message = "El rol es obligatorio")
        WorkspaceRole role
) {
}
