package com.tramite.online.workspace.infraestructure.persistence.entity;


import com.tramite.online.workspace.domain.model.WorkspaceRole;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name="workspaces_members", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"worskpace_id","user_id"})
})
public class WorkSpaceMemberEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, name="workspace_id")
    private Long workSpaceId;

    @Column(nullable = false, name="user_id")
    private Long userId;

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private WorkspaceRole role;

    @Column(nullable = false, name = "joined_at", updatable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();

    @Column(nullable = false, name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();




    // Constructores
    public WorkSpaceMemberEntity() {
    }

    public WorkSpaceMemberEntity(Long workSpaceId, Long userId, WorkspaceRole role) {
        this.workSpaceId = workSpaceId;
        this.userId = userId;
        this.role = role;
        this.joinedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public WorkSpaceMemberEntity(Long workSpaceId, Long userId, WorkspaceRole role,
                                 LocalDateTime joinedAt, LocalDateTime updatedAt) {

        this.workSpaceId = workSpaceId;
        this.userId = userId;
        this.role = role;
        this.joinedAt = joinedAt;
        this.updatedAt = updatedAt;
    }

    // Getters y Setters
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

    @Override
    public String toString() {
        return "WorkSpaceMemberEntity{" +
                "id=" + id +
                ", workSpaceId=" + workSpaceId +
                ", userId=" + userId +
                ", role=" + role +
                ", joinedAt=" + joinedAt +
                ", updatedAt=" + updatedAt +
                '}';
    }


}
