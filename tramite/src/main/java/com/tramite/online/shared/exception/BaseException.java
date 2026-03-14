package com.tramite.online.shared.exception;

import com.tramite.online.shared.domain.constants.ErrorCode;

import java.util.Map;

/**
 * Excepción base para todas las excepciones personalizadas en la aplicación.
 * Esta clase es abstracta y se utiliza como base para crear excepciones específicas
 * que representen diferentes tipos de errores en la aplicación. Contiene información
 * sobre el código de error y detalles adicionales para facilitar la depuración y el manejo de errores.
 * @author dgarcia
 * @version 1.0
 */
public sealed abstract class BaseException extends RuntimeException permits ForbiddenException, UnauthorizedException, BusinessException, ConflictException, NotFoundException, ValidationException {

    private final ErrorCode errorCode;
    private final Map<String, Object> details;

    protected BaseException(String message, ErrorCode errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.details = Map.of();
    }

    protected BaseException(String message, ErrorCode errorCode, Map<String, Object> details) {
        super(message);
        this.errorCode = errorCode;
        this.details = Map.copyOf(details);
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public Map<String, Object> getDetails() {
        return details;
    }
}
