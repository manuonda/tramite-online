package com.tramite.online.user.domain.model.vo;

public record Password(String value) {

    public Password {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("La contraseña no puede ser nula o vacía.");
        }
        if (value.length() < 8) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 8 caracteres.");
        }
    }
}
