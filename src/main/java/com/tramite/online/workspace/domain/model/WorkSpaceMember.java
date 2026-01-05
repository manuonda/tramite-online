package com.tramite.online.workspace.domain.model;

import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;

/**
 * Representa un miembro de un workspace con su
 * rol asignado, clase Pojo
 */
public class WorkSpaceMember {

    private Long id;
    private Long workSpaceId;
    private Long userId;
    private WorkspaceRole role;
    private LocalDateTime joinedAt;
    private LocalDateTime updatedAt;


    public WorkSpaceMember() {
        this.joinedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public WorkSpaceMember(Long workSpaceId, Long userId, WorkspaceRole role) {
      this();
      this.workSpaceId = workSpaceId;
      this.userId = userId;
      this.role = role;
    }

    public void updateRole(WorkspaceRole newRole){
        this.role = newRole;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getWorkSpaceId() {
        return workSpaceId;
    }

    public void setWorkSpaceId(Long workSpaceId) {
        this.workSpaceId = workSpaceId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public WorkspaceRole getRole() {
        return role;
    }

    public void setRole(WorkspaceRole role) {
        this.role = role;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
