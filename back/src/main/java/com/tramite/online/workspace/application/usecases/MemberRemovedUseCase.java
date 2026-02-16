package com.tramite.online.workspace.application.usecases;

import com.tramite.online.shared.domain.event.DomainEvent;
import com.tramite.online.workspace.domain.model.WorkSpaceMember;

/**
 * Event que removio un miembor del Espacio de Trabajo
 * */
public class MemberRemovedUseCase extends DomainEvent {

    private final Long memberId;
    private final Long workspaceId;
    private final Long userId;
    private final String role;

    public MemberRemovedUseCase(WorkSpaceMember workSpaceMember) {
        super("Add WorkSpace Member", workSpaceMember.getId());
        this.memberId = workSpaceMember.getId();
        this.workspaceId = workSpaceMember.getWorkSpaceId();
        this.userId = workSpaceMember.getUserId();
        this.role = workSpaceMember.getRole().toString();
    }

    public String getRole() {
        return role;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getWorkspaceId() {
        return workspaceId;
    }

    public Long getMemberId() {
        return memberId;
    }
}

