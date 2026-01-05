package com.tramite.online.workspace.domain.event;

import com.tramite.online.shared.domain.event.DomainEvent;
import com.tramite.online.workspace.domain.model.WorkSpace;

/**
 * Evento Correspondiente a borrar un WorkSpace
 * de manera logica
 */
public class WorkSpaceDeleted extends DomainEvent {

    private final Long workSpaceId;
    private final String workSpaceName;


    public WorkSpaceDeleted(WorkSpace workSpace){
        super("WorkSpaceUpdated", workSpace.getId());
        this.workSpaceId = workSpace.getId();
        this.workSpaceName = workSpace.getName();
    }

}
