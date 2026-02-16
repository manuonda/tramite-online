package com.tramite.online.workspace.domain.event;

import com.tramite.online.shared.domain.event.DomainEvent;
import com.tramite.online.workspace.domain.model.WorkSpace;

/**
 * Event Archivar del Espacio de Trabajo
 */
public class WorkSpaceArchived extends DomainEvent {
   private final Long workSpaceId;
   private final String workSpaceName;


    public WorkSpaceArchived(WorkSpace workSpace) {
        super("WorkSpaceArchived", workSpace.getId());
        this.workSpaceId = workSpace.getId();
        this.workSpaceName = workSpace.getName();
    }

    public Long getWorkSpaceId() {
        return workSpaceId;
    }

    public String getWorkSpaceName() {
        return workSpaceName;
    }


}
