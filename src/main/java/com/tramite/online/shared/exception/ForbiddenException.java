package com.tramite.online.shared.exception;

import com.tramite.online.shared.domain.constants.Constants;

public class ForbiddenException extends BaseException{
    public ForbiddenException(String message){
        super(message, Constants.FORBIDDEN);
    }


}
