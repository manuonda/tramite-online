package com.tramite.online.form.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad de dominio FormSection
 * Representa una sección dentro de un formulario
 * 
 * @author dgarcia
 * @version 1.0
 * @date 2/1/2026
 */
public class FormSection {

    private Long id;
    private Long formId;
    private String title;
    private String description;
    private Integer displayOrder;
    private List<Question> questions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor vacío
    public FormSection() {
        this.questions = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor con parámetros principales
    public FormSection(Long formId, String title, Integer displayOrder) {
        this();
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("El título de la sección no puede estar vacío");
        }

        this.formId = formId;
        this.title = title;
        this.displayOrder = displayOrder;
    }

    // Constructor completo
    public FormSection(Long id, Long formId, String title, String description,
                      Integer displayOrder, List<Question> questions,
                      LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.formId = formId;
        this.title = title;
        this.description = description;
        this.displayOrder = displayOrder;
        this.questions = questions != null ? questions : new ArrayList<>();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Métodos de negocio
    public void addQuestion(Question question) {
        if (question == null) {
            throw new IllegalArgumentException("La pregunta no puede ser nula");
        }
        this.questions.add(question);
        this.updatedAt = LocalDateTime.now();
    }

    public void removeQuestion(Question question) {
        if (question != null) {
            this.questions.remove(question);
            this.updatedAt = LocalDateTime.now();
        }
    }

    public int getQuestionCount() {
        return questions != null ? questions.size() : 0;
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

    public Long getFormId() {
        return formId;
    }

    public void setFormId(Long formId) {
        this.formId = formId;
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

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public List<Question> getQuestions() {
        return questions;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
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
