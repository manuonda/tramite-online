package com.tramite.online.workspace.application.dto.response;

import java.util.List;

public record ListWorkSpaceResponse(
        List<WorkSpaceResponse> workSpaces,
        int totalElements,
        int pageNumber,
        int pageSize,
        int totalPages
) {
    /**
     * Constructor simplificado sin pagination
     * @param workSpaces
     */
    public ListWorkSpaceResponse(List<WorkSpaceResponse> workSpaces) {
        this(workSpaces,workSpaces.size(),workSpaces.size(),0,0);
    }
}
