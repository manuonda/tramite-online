package com.tramite.online.shared.exception;


import com.tramite.online.shared.domain.constants.Constants;

/**
 * Excepion cuando un recurso no es encontrado
 */
public class ResourceNotFoundException extends BaseException {
    public ResourceNotFoundException(String message) {
        super(message, Constants.RESOURCE_NOT_FOUND);
    }

    public ResourceNotFoundException(String resourceName, Long id){
        super(String.format("%s no encontrado con ID: %d", resourceName, id),
                Constants.RESOURCE_NOT_FOUND);
    }

    public ResourceNotFoundException(String resourceName, String identifier){
        super(String.format("%s no encontrado : %s", resourceName, identifier),
                Constants.RESOURCE_NOT_FOUND);
    }


}
