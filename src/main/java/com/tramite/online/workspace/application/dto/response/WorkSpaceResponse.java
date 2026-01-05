package com.tramite.online.workspace.application.dto.response;

import java.time.LocalDateTime;

/**
 * Record para la respuesta de un WorkSpace
 * Datos que retorna
 *
 * @author dgarcia
 * @version 1.0
 * @since   21/11/2025
 *
 * @param workSpaceId
 * @param name
 * @param description
 * @param active
 * @param archived
 * @param ownerId
 * @param createdAt
 * @param updatedAt
 */
public record WorkSpaceResponse(
        Long workSpaceId,
        String name,
        String description,
        boolean active,
        boolean archived,
        Long ownerId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
