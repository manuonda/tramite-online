package com.tramite.online.user.domain.model.vo;

public record UserName(String value) {

    public UserName {
        if(value == null || value.isBlank()) {
            throw new IllegalArgumentException("UserName is required");
        }
    }
    
}
