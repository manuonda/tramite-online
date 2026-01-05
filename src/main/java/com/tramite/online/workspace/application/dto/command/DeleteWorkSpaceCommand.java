package com.tramite.online.workspace.application.dto.command;


import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;


/**
 * Record para eliminar el espacio de Trabajo
 * @param workSpaceId
 */
public record DeleteWorkSpaceCommand(
        @NotNull(message = "El ID del Espacio de Trabajo es obligatorio")
        @Positive(message = "El ID del Espacio de Trabajo debe ser un número positivo")
        Long workSpaceId
) {}

