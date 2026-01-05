package com.tramite.online.workspace.application.dto.command;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Listado de Miembros por el id del WorkSpace
 * @param workSpaceId
 */
public record ListMembersByWorkSpaceCommand(
        @NotNull(message = "El id del Espacio de Trabajo no puede ser nulo")
        @Positive(message = "El ID del Espacio de Trabajo debe ser positivo")
        Long workSpaceId
) {
}
