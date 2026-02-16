package com.tramite.online.workspace.exception;

import com.tramite.online.shared.domain.constants.Constants;
import com.tramite.online.shared.exception.BusinessException;

public class DuplicatedWorkSpaceException extends BusinessException {

     public DuplicatedWorkSpaceException(String message) {
         super(String.format("Espacio de Trabajo duplicado %s: ",message), Constants.DUPLICATE_WORKSPACE);
     }
}
