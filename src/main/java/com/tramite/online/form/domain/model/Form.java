package com.tramite.online.form.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad de dominio Form
 * Representa un formulario dentro de un workspace
 */
public class Form {

    private Long id;
    private Long workspaceId;
    private String title;
    private String description;
    private FormStatus status;
    private List<FormSection> sections;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor vacío
    public Form() {
        this.status = FormStatus.DRAFT;
        this.sections = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor con parámetros principales
    public Form(Long workspaceId, String title, String description) {
        this();
        if (workspaceId == null) {
            throw new IllegalArgumentException("El workspace es requerido");
        }
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("El título del formulario no puede estar vacío");
        }

        this.workspaceId = workspaceId;
        this.title = title;
        this.description = description != null ? description : "";
    }

    // Constructor completo
    public Form(Long id, Long workspaceId, String title, String description,
               FormStatus status, List<FormSection> sections, LocalDateTime publishedAt,
               LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.workspaceId = workspaceId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.sections = sections != null ? sections : new ArrayList<>();
        this.publishedAt = publishedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Métodos de negocio
    public void addSection(FormSection section) {
        if (section == null) {
            throw new IllegalArgumentException("La sección no puede ser nula");
        }
        if (this.status == FormStatus.PUBLISHED) {
            throw new IllegalStateException("No se pueden agregar secciones a un formulario publicado");
        }
        this.sections.add(section);
        this.updatedAt = LocalDateTime.now();
    }

    public void publish() {
        if (this.status == FormStatus.ARCHIVED) {
            throw new IllegalStateException("No se puede publicar un formulario archivado");
        }

        if (sections == null || sections.isEmpty()) {
            throw new IllegalStateException("El formulario debe tener al menos una sección");
        }

        boolean hasSomeQuestion = sections.stream()
                .anyMatch(section -> section.getQuestionCount() > 0);

        if (!hasSomeQuestion) {
            throw new IllegalStateException("El formulario debe tener al menos una pregunta");
        }

        this.status = FormStatus.PUBLISHED;
        this.publishedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void archive() {
        this.status = FormStatus.ARCHIVED;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isDraft() {
        return this.status == FormStatus.DRAFT;
    }

    public boolean isPublished() {
        return this.status == FormStatus.PUBLISHED;
    }

    public int getTotalQuestions() {
        return sections != null ?
                sections.stream()
                        .mapToInt(FormSection::getQuestionCount)
                        .sum()
                : 0;
    }

    public int getSectionCount() {
        return sections != null ? sections.size() : 0;
    }

    public void updateInfo(String newTitle, String newDescription) {
        if (newTitle != null && !newTitle.isBlank()) {
            this.title = newTitle;
        }
        if (newDescription != null) {
            this.description = newDescription;
        }
        this.updatedAt = LocalDateTime.now();
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(Long workspaceId) {
        this.workspaceId = workspaceId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public FormStatus getStatus() {
        return status;
    }

    public void setStatus(FormStatus status) {
        this.status = status;
    }

    public List<FormSection> getSections() {
        return sections;
    }

    public void setSections(List<FormSection> sections) {
        this.sections = sections;
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
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
