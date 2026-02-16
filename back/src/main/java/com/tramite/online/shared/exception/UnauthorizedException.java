package com.tramite.online.shared.exception;

import com.tramite.online.shared.domain.constants.Constants;

public class UnauthorizedException extends BaseException{
    public UnauthorizedException(String message){
        super(message, Constants.UNAUTHORIZED);
    }

    public UnauthorizedException(){
        super("Usuario no autenticado", Constants.UNAUTHORIZED);
    }
}
