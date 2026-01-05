package com.tramite.online.form.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad de dominio Question
 * Representa una pregunta dentro de una sección de formulario
 */
public class Question {

    private Long id;
    private Long sectionId;
    private String text;
    private String description;
    private QuestionType type;
    private Integer displayOrder;
    private Boolean required;
    private List<QuestionOption> options;
    private String placeholder;
    private String helpText;
    private String validationPattern;
    private String validationMessage;
    private Integer minLength;
    private Integer maxLength;
    private Integer minValue;
    private Integer maxValue;
    private String defaultValue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor vacío
    public Question() {
        this.required = false;
        this.options = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor con parámetros principales
    public Question(Long sectionId, String text, QuestionType type, Integer displayOrder) {
        this();
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("El texto de la pregunta no puede estar vacío");
        }

        if (type == null) {
            throw new IllegalArgumentException("El tipo de pregunta es requerido");
        }

        this.sectionId = sectionId;
        this.text = text;
        this.type = type;
        this.displayOrder = displayOrder;
    }

    // Constructor completo
    public Question(Long id, Long sectionId, String text, String description,
                   QuestionType type, Integer displayOrder, Boolean required,
                   List<QuestionOption> options, String placeholder, String helpText,
                   String validationPattern, String validationMessage, Integer minLength,
                   Integer maxLength, Integer minValue, Integer maxValue,
                   String defaultValue, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.sectionId = sectionId;
        this.text = text;
        this.description = description;
        this.type = type;
        this.displayOrder = displayOrder;
        this.required = required;
        this.options = options != null ? options : new ArrayList<>();
        this.placeholder = placeholder;
        this.helpText = helpText;
        this.validationPattern = validationPattern;
        this.validationMessage = validationMessage;
        this.minLength = minLength;
        this.maxLength = maxLength;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.defaultValue = defaultValue;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Métodos de negocio
    public void addOption(QuestionOption option) {
        if (option == null) {
            throw new IllegalArgumentException("La opción no puede ser nula");
        }

        if (this.type != QuestionType.SELECT &&
            this.type != QuestionType.CHECKBOX &&
            this.type != QuestionType.RADIO) {
            throw new IllegalStateException("El tipo de pregunta " + this.type +
                                          " no soporta opciones");
        }

        this.options.add(option);
        this.updatedAt = LocalDateTime.now();
    }

    public void removeOption(QuestionOption option) {
        if (option != null) {
            this.options.remove(option);
            this.updatedAt = LocalDateTime.now();
        }
    }

    public void markAsRequired() {
        this.required = true;
        this.updatedAt = LocalDateTime.now();
    }

    public int getOptionCount() {
        return options != null ? options.size() : 0;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSectionId() {
        return sectionId;
    }

    public void setSectionId(Long sectionId) {
        this.sectionId = sectionId;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public QuestionType getType() {
        return type;
    }

    public void setType(QuestionType type) {
        this.type = type;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Boolean getRequired() {
        return required;
    }

    public void setRequired(Boolean required) {
        this.required = required;
    }

    public List<QuestionOption> getOptions() {
        return options;
    }

    public void setOptions(List<QuestionOption> options) {
        this.options = options != null ? options : new ArrayList<>();
    }

    public String getPlaceholder() {
        return placeholder;
    }

    public void setPlaceholder(String placeholder) {
        this.placeholder = placeholder;
    }

    public String getHelpText() {
        return helpText;
    }

    public void setHelpText(String helpText) {
        this.helpText = helpText;
    }

    public String getValidationPattern() {
        return validationPattern;
    }

    public void setValidationPattern(String validationPattern) {
        this.validationPattern = validationPattern;
    }

    public String getValidationMessage() {
        return validationMessage;
    }

    public void setValidationMessage(String validationMessage) {
        this.validationMessage = validationMessage;
    }

    public Integer getMinLength() {
        return minLength;
    }

    public void setMinLength(Integer minLength) {
        this.minLength = minLength;
    }

    public Integer getMaxLength() {
        return maxLength;
    }

    public void setMaxLength(Integer maxLength) {
        this.maxLength = maxLength;
    }

    public Integer getMinValue() {
        return minValue;
    }

    public void setMinValue(Integer minValue) {
        this.minValue = minValue;
    }

    public Integer getMaxValue() {
        return maxValue;
    }

    public void setMaxValue(Integer maxValue) {
        this.maxValue = maxValue;
    }

    public String getDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(String defaultValue) {
        this.defaultValue = defaultValue;
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
