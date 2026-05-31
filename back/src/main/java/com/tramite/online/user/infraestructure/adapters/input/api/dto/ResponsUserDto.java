package com.tramite.online.user.infraestructure.adapters.input.api.dto;

public record ResponsUserDto(
    Long id,
    String userName,
    String lastName,
    String password
) {

}
