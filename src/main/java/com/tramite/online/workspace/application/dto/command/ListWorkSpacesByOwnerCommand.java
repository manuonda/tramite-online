package com.tramite.online.workspace.application.dto.command;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;


/**
 * Listar WorkSpaces de un propietario
 * @param ownerId
 */
public record ListWorkSpacesByOwnerCommand(
        @NotNull(message = "El ID del propietario es obligatorio")
        @Positive(message = "El ID del propietario debe ser un número positivo")
        Long ownerId
) {}
