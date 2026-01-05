package com.tramite.online.workspace.infraestructure.persistence.mapper;

import com.tramite.online.workspace.domain.model.WorkSpaceMember;
import com.tramite.online.workspace.domain.model.WorkspaceRole;
import com.tramite.online.workspace.infraestructure.persistence.entity.WorkSpaceMemberEntity;
import org.springframework.stereotype.Component;

/**
 * Mapper que convierte entre WorkSpaceMember(dominio) y WorkSpaceMemberEntity(Dominio)
 *
 * @author dgarcia
 * @version 1.0
 * @since 22/11/2025
 */
@Component
public class WorkSpaceMemberMapper {

    public WorkSpaceMemberEntity toEntity(WorkSpaceMember member){
        if(member == null) return null;

        return new WorkSpaceMemberEntity(
                member.getWorkSpaceId(),
                member.getUserId(),
                WorkspaceRole.valueOf(member.getRole().toString()),
                member.getJoinedAt(),
                member.getUpdatedAt()
        );
    }

    public WorkSpaceMember toDomain(WorkSpaceMemberEntity entity){
        if(entity == null) return null;

        WorkSpaceMember workSpaceMember = new WorkSpaceMember();
        workSpaceMember.setId(entity.getId());
        workSpaceMember.setUserId(entity.getUserId());
        workSpaceMember.setWorkSpaceId(entity.getWorkSpaceId());
        workSpaceMember.setRole(WorkspaceRole.valueOf(entity.getRole().toString()));
        workSpaceMember.setJoinedAt(entity.getJoinedAt());
        workSpaceMember.setUpdatedAt(entity.getUpdatedAt());

         return workSpaceMember;
    }

}
