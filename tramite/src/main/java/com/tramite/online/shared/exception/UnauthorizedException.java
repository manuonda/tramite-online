package com.tramite.online.shared.exception;

import com.tramite.online.shared.domain.constants.ErrorCode;

import java.util.Map;

/**
 * Excepción que se lanza cuando un usuario no está autorizado para realizar una acción específica.
 * Esta excepción extiende de BaseException y se utiliza para indicar que el usuario no tiene los permisos necesarios
 * para acceder a un recurso o realizar una operación. Contiene información sobre la acción y el recurso para facilitar
 * la depuración y el manejo de errores.
 * @author dgarcia
 * @version 1.0
 */
public final class UnauthorizedException extends BaseException{

    public UnauthorizedException(String message, ErrorCode errorCode) {
        super(message, errorCode);
    }

    public UnauthorizedException(String message, ErrorCode errorCode, Map<String, Object> details) {
        super(message, errorCode, details);
    }

}
