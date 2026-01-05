package com.tramite.online.shared.exception;

import com.tramite.online.shared.domain.constants.Constants;

public class BusinessException extends BaseException {
    public BusinessException(String message) {
        super(message, Constants.BUSINESS_RULE_VIOLATION);
    }

    public BusinessException(String message, String errorCode){
        super(message, errorCode);
    }
}
