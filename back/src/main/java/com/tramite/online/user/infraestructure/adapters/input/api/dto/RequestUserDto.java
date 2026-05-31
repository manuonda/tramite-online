package com.tramite.online.user.infraestructure.adapters.input.api.dto;

public record RequestUserDto(
    String userName,
    String lastName,
    String password
) {

}
