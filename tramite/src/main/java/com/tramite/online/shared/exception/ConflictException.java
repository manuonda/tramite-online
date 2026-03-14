package com.tramite.online.shared.exception;

import com.tramite.online.shared.domain.constants.ErrorCode;

import java.util.Map;


/**
 * Excepción que se lanza cuando ocurre un conflicto en el sistema, como por ejemplo, al intentar crear un recurso que ya existe.
 * Esta excepción extiende de BaseException y se utiliza para indicar que ha ocurrido un conflicto en
 * la aplicación. Contiene información sobre el conflicto y el código de error asociado para facilitar la depuración y el manejo de errores.
 * @author dgarcia
 * @version 1.0
 */
public final class ConflictException extends BaseException{

    public ConflictException(String message) {
        super(message, ErrorCode.CONFLICT);
    }

    public ConflictException(String message, Map<String, Object> details) {
        super(message, ErrorCode.CONFLICT, details);
    }
}
