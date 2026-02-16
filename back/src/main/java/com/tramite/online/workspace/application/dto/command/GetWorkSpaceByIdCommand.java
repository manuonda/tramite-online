package com.tramite.online.workspace.application.dto.command;

import jakarta.validation.constraints.*;

/**
 * Record para obtener un workspace por ID
 */
public record GetWorkSpaceByIdCommand(
        @NotNull(message = "El ID del Espacio de Trabajo es obligatorio")
        @Positive(message = "El ID del Espacio de Trabajo debe ser un número positivo")
        Long workSpaceId
) {}
