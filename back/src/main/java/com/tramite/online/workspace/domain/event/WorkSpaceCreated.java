package com.tramite.online.workspace.domain.event;

import com.tramite.online.shared.domain.event.DomainEvent;
import com.tramite.online.workspace.domain.model.WorkSpace;
import org.springframework.data.domain.DomainEvents;

/**
 * Evento publicado cuando se crea un workspace
 */
public class WorkSpaceCreated extends DomainEvent {
    private final Long workSpaceId;
    private final String workSpaceName;
    private final Long  ownerId;

    public WorkSpaceCreated(WorkSpace workSpace) {
        super("WorkSpaceCreated", workSpace.getId());
        this.workSpaceId = workSpace.getId();
        this.workSpaceName = workSpace.getName();
        this.ownerId = workSpace.getOwnerId();
    }

    public Long getWorkSpaceId() {
        return workSpaceId;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public String getWorkSpaceName() {
        return workSpaceName;
    }
}
