package com.tramite.online.form.domain.event;

import com.tramite.online.form.domain.model.Form;
import com.tramite.online.shared.domain.event.DomainEvent;

public class FormCreated extends DomainEvent {

    private final Long formId;
    private final String formName;
    private final String description;


    public FormCreated(Form form) {
        super();
        this.formId = form.getId();
        this.
    }
    public FormCreated(String eventType, Long aggregateId) {
        super(eventType, aggregateId);
    }
}
