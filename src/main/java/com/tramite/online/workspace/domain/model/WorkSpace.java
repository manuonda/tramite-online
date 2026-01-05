package com.tramite.online.workspace.domain.model;


import java.time.LocalDateTime;

/**
 * Class Pojo
 */
public class WorkSpace {
    private Long id;
    private String name;
    private String description;
    private boolean active;
    private boolean archived;

    private Long ownerId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public WorkSpace() {
        this.active = true;
        this.archived = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public WorkSpace(String name, String description, Long ownerId) {
        this();
        this.name = name;
        this.description = description;
        this.ownerId = ownerId;
    }

    public void archive() throws IllegalAccessException {
        if(this.archived){
            throw new IllegalAccessException("Worspace is already archived");
        }
        this.archived = true;
        this.active = false;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isArchived() {
        return archived;
    }

    public void setArchived(boolean archived) {
        this.archived = archived;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
