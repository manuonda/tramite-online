package com.tramite.online.workspace.application.dto.command;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Remover miembro del Espacio de Trabajo
 * @param userId
 * @param workSpaceId
 */
public record RemoveMemberCommand(
        @NotNull(message = "El ID del miembro es obligatorio")
        @Positive(message = "El ID del miembro debe ser positivo")
        Long userId,

        @NotNull(message="El ID del Espacio de Trabajo es obligatorio")
        @Positive(message = "El ID del Espacio de Trabajo debe ser positivo")
        Long workSpaceId
) {
}
