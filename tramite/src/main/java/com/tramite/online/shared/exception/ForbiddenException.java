package com.tramite.online.shared.exception;

import com.tramite.online.shared.domain.constants.ErrorCode;

import java.util.Map;

/**
 * Excepción que se lanza cuando un usuario no tiene los permisos necesarios para acceder a un recurso o realizar una acción.
 * Esta excepción extiende de BaseException y se utiliza para indicar que el acceso a un recurso o la realización de una acción está prohibida debido a la falta de permisos adecuados.
 * Contiene información sobre el recurso o la acción que se intentó acceder o realizar, así
 * como el código de error asociado para facilitar la depuración y el manejo de errores.
 * @author dgarcia
 * @version 1.0
 */
public final class ForbiddenException extends BaseException{

    public ForbiddenException(String message, ErrorCode errorCode) {
        super(message, errorCode);
    }

    public ForbiddenException(String message, ErrorCode errorCode, Map<String, Object> details) {
        super(message, errorCode, details);
    }
}
