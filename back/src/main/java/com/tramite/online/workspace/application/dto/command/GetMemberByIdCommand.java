package com.tramite.online.workspace.application.dto.command;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Command para obtneer un miembro especifico
 * @param memberId
 */
public record GetMemberByIdCommand(
        @NotNull(message = "El ID del miembro es obligatorio")
        @Positive(message = "El ID del miembro debe ser un número positivo")
        Long memberId

) {
}
