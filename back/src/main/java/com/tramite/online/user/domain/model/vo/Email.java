package com.tramite.online.user.domain.model.vo;

import java.util.regex.Pattern;

/**
 * Value Object for Email
 * @param value
 */
public record Email(String value) {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
 
    public Email {
        if (value == null || value.isBlank()) {
             throw new IllegalArgumentException("Email is required");
        }

        value  = value.trim().toLowerCase();
        if (!EMAIL_PATTERN.matcher(value).matches()){
           throw new IllegalArgumentException("Invalid email format : "+ value);
        }
    }

}


