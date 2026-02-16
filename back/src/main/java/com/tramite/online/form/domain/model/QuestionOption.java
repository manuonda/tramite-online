package com.tramite.online.form.domain.model;


/**
 * Class  Correspondientte al model pojo
 * de QuestionOption
 * @author  dgarcia
 * @version 1.0
 * @date    2/2/2026
 */
public class QuestionOption {
    private Long id;
    private Long questionId;
    private String label;              // "Muy satisfecho"
    private String value;              // "5"
    private Integer weight;            // Para cálculos (promedio, fórmulas)
    private Integer displayOrder;      // Orden visual
    private String metadata;           // JSON: color, icono, etc.

    // Constructor vacío
    public QuestionOption() {
    }

    // Constructor principal
    public QuestionOption(String label, String value, Integer weight, Integer displayOrder) {
        if (label == null || label.isBlank()) {
            throw new IllegalArgumentException("Label no puede estar vacío");
        }
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Value no puede estar vacío");
        }

        this.label = label;
        this.value = value;
        this.weight = weight != null ? weight : 0;
        this.displayOrder = displayOrder;
    }

    // Constructor completo
    public QuestionOption(Long id, Long questionId, String label, String value,
                          Integer weight, Integer displayOrder, String metadata) {
        this.id = id;
        this.questionId = questionId;
        this.label = label;
        this.value = value;
        this.weight = weight;
        this.displayOrder = displayOrder;
        this.metadata = metadata;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public Integer getWeight() {
        return weight;
    }

    public void setWeight(Integer weight) {
        this.weight = weight;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

}
