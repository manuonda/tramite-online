package com.tramite.online.user.domain.model.vo;

/**
 * Value Object que representa el ID de un usuario.
 * Es un número positivo que identifica de manera única a cada usuario en el sistema.
 * @param value
 */
public record IdUser(Long value){

    public IdUser {
        if (value == null || value <= 0) {
            throw new IllegalArgumentException("El ID del usuario debe ser un número positivo.");
        }
    }
}
