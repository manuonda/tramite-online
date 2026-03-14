package com.tramite.online.shared.exception;

import com.tramite.online.shared.domain.constants.ErrorCode;


/**
 * Excepción que se lanza cuando ocurre un error de validación en la aplicación.
 * Esta excepción extiende de BaseException y se utiliza para indicar que los datos proporcionados no
 * cumplen con los requisitos de validación establecidos. Contiene información sobre el error de validación
 * y el código de error asociado para facilitar la depuración y el manejo de errores.
 * @author dgarcia
 * @version 1.0
 *
 */
public final class ValidationException extends BaseException{

    public ValidationException(String message, ErrorCode errorCode) {
        super(message, errorCode);
    }
}
