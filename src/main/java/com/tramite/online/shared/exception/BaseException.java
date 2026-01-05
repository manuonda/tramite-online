package com.tramite.online.shared.exception;

import com.tramite.online.shared.domain.constants.Constants;

/**
 * Exception base para todas las exceptions del sistema
 * @author dgarcia
 * @since 17/11/2025
 */
public abstract  class BaseException extends RuntimeException{

    private final String errorCode;

    public BaseException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public BaseException(String message){
        super(message);
        this.errorCode =Constants.INTERNAL_ERROR;
    }

    public BaseException(String message, Throwable cause){
        super(message,cause);
        this.errorCode =Constants.INTERNAL_ERROR;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
