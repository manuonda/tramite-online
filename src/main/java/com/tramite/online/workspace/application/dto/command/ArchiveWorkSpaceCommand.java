package com.tramite.online.workspace.application.dto.command;

import jakarta.validation.constraints.*;

/**
 * Record para archivar un workspace
 */
public record ArchiveWorkSpaceCommand(
        @NotNull(message = "El ID del Espacio de Trabajo es obligatorio")
        @Positive(message = "El ID del Espacio de Trabajo debe ser un número positivo")
        Long workSpaceId
) {}

