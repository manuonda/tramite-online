package com.tramite.online.workspace.domain.event;


import com.tramite.online.shared.domain.event.DomainEvent;
import com.tramite.online.workspace.domain.model.WorkSpaceMember;

/**
 * Event que actualiza los datos del Miembro
 * del Espacio de Trabajo
 */
public class MemberUpdated extends DomainEvent {

    private final Long memberId;
    private final Long workspaceId;
    private final Long userId;
    private final String role;

    public MemberUpdated(WorkSpaceMember workSpaceMember) {
        super("Add Member al WorkSpace", workSpaceMember.getId());
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
