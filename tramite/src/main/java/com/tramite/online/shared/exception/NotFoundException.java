package com.tramite.online.shared.exception;

import com.tramite.online.shared.domain.constants.ErrorCode;

import java.util.Map;

/**
 * Excepción que se lanza cuando un recurso no se encuentra en el sistema.
 * Esta excepción extiende de BaseException y se utiliza para indicar que un recurso específico no pudo ser encontrado.
 * Contiene información sobre el recurso y su identificador para facilitar la depuración y el manejo de errores.
 * @author dgarcia
 * @version 1.0
 */
public final class NotFoundException extends BaseException{

    public NotFoundException(String resource, Object id){
      super(resource + " not found with id " + id ,
              ErrorCode.NOT_FOUND,
              Map.of("resource", resource, "id", id));
    }
}
