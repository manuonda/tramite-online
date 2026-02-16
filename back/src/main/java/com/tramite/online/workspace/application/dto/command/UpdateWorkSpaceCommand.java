package com.tramite.online.workspace.application.dto.command;

import jakarta.validation.constraints.*;


/**
 * Record para actualizar un workspace existente
 * @param name
 * @param description
 * @param ownerId
 *
 * @author dgarcia
 * @version 1.0
 * @since  20/11/2025
 */
public record UpdateWorkSpaceCommand(
        @NotNull(message = "El ID del Espacio de Trabajo es obligatorio")
        @Positive(message = "El ID es un numero positivo")
        Long workSpaceId,

        @NotBlank(message = "El nombre del Espacio de Trabajo es Obligatorio")
        @Size(min = 3 , max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
        @Pattern(regexp = "^[a-zA-Z0-9\\s\\-_.]+$", message = "El nombre solo puede contener letras, números, espacios, guiones, puntos y guiones bajos")
        String name,
        @Size(max = 500, message = "La descripcion no puede exceder los 500 caracteres")
        String description,

        @NotNull(message = "El propietario del espacio de trabajo es obligatorio")
        @Positive(message = "El ID del propietario debe ser un numero positivo")
        Long ownerId
) {
}
