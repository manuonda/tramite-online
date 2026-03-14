package com.tramite.online.shared.exception;


import com.tramite.online.shared.domain.constants.ErrorCode;
import org.springframework.http.HttpStatus;

import java.util.Map;

/**
 * Excepción personalizada para errores de negocio en la aplicación.
 * Esta excepción extiende de BaseException y se utiliza para indicar que ha ocurrido un error relacionado
 * con la lógica de negocio de la aplicación. Puede ser lanzada cuando se detecta una situación que no cumple con las reglas de negocio establecidas.
 * Contiene información sobre el error de negocio y el código de error asociado para facilitar la dep
 * uración y el manejo de errores.
 * @author dgarcia
 * @version 1.0
 */
public final class BusinessException extends BaseException{

    public BusinessException(String message, ErrorCode errorCode) {
        super(message, errorCode);
    }

     public BusinessException(String message, ErrorCode errorCode, Map<String, Object> details) {
        super(message, errorCode, details);
    }

}
