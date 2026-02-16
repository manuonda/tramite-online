package com.tramite.online.workspace.domain.repository;

import com.tramite.online.workspace.domain.model.WorkSpaceMember;

import java.util.List;
import java.util.Optional;

/**
 * Puerto(interfaz) que define el contrato para acceder a  WorkSpaceMembers
 */
public interface WorkSpaceMemberRepository {
   WorkSpaceMember save(WorkSpaceMember workSpaceMember);
   Optional<WorkSpaceMember> findById(Long id);
   List<WorkSpaceMember> findByWorkspaceId(Long workspaceId);
   Optional<WorkSpaceMember> findByWorkspaceIdAndUserId(Long workspaceId, Long userId);
   int countByWorkspaceId(Long workspaceId);
   void delete(Long id);

}
