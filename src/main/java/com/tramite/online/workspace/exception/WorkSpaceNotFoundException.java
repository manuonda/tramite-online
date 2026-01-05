package com.tramite.online.workspace.exception;

import com.tramite.online.shared.domain.constants.Constants;
import com.tramite.online.shared.exception.BaseException;
import com.tramite.online.shared.exception.ResourceNotFoundException;

public class WorkSpaceNotFoundException extends ResourceNotFoundException {

    public WorkSpaceNotFoundException(Long id) {
        super(String.format("Workspace with id %s not found", id), Constants.RESOURCE_NOT_FOUND);
    }
    public WorkSpaceNotFoundException(String name) {
        super(String.format("Workspace with name %s not found", name), Constants.RESOURCE_NOT_FOUND);
    }

}
