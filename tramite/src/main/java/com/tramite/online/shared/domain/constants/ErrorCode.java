package com.tramite.online.shared.domain.constants;

import org.springframework.http.HttpStatus;

/**
 * Enumera los codigos de ErrorCode que se pueden presentar en la aplicacion
 * @author dgarcia
 * @version 1.0
 *
 */
public enum ErrorCode {

    INTERNAL_ERROR("INTERNAL_ERROR", HttpStatus.INTERNAL_SERVER_ERROR),
    NOT_FOUND("NOT_FOUND", HttpStatus.NOT_FOUND),
    BAD_REQUEST("BAD_REQUEST", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("UNAUTHORIZED", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("FORBIDDEN", HttpStatus.FORBIDDEN),
    CONFLICT("CONFLICT", HttpStatus.CONFLICT),
    VALIDATION_ERROR("VALIDATION_ERROR", HttpStatus.BAD_REQUEST);

    private final String code;

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public String getCode() {
        return code;
    }

    private final HttpStatus httpStatus;

    ErrorCode(String code, HttpStatus httpStatus) {
        this.code = code;
        this.httpStatus = httpStatus;
    }

}
