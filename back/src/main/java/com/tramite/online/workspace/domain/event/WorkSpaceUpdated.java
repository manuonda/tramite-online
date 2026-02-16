package com.tramite.online.workspace.domain.event;

import com.tramite.online.shared.domain.event.DomainEvent;
import com.tramite.online.workspace.domain.model.WorkSpace;


/**
 * WorkSpaceUpdated
 */
public class WorkSpaceUpdated extends DomainEvent {

    private final Long workSpaceId;
    private final String workSpaceName;
    private final Long ownerId;

    public WorkSpaceUpdated(WorkSpace workSpace) {
        super("WorkSpaceUpdated", workSpace.getId());
        this.workSpaceId = workSpace.getId();
        this.workSpaceName = workSpace.getName();
        this.ownerId = workSpace.getOwnerId();
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public String getWorkSpaceName() {
        return workSpaceName;
    }

    public Long getWorkSpaceId() {
        return workSpaceId;
    }
}
