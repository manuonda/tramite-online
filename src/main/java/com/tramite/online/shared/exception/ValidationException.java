package com.tramite.online.shared.exception;

import com.tramite.online.shared.domain.constants.Constants;

public class ValidationException extends BaseException{
   public ValidationException(String message){
       super(message, Constants.VALIDATION_ERROR);
   }

   public ValidationException(String field , String message){
       super(String.format("Validacion en campo '%s': %s", field, message), Constants.VALIDATION_ERROR);
   }
}
