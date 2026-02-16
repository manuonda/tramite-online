package com.tramite.online.shared.domain.event;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Clase base para todos los eventos de dominio
 * Los eventos permiten comunicacion desacoplada entre modulos
 * @author dgarcia
 * @since 17/11/2025
 */
public class DomainEvent implements Serializable {
   private final String eventType;
   private final Long aggregateId;
   private final LocalDateTime timestamp;
   private final String eventId;

    public DomainEvent(String eventType, Long aggregateId) {
        this.eventType = eventType;
        this.aggregateId = aggregateId;
        this.timestamp = LocalDateTime.now();
        this.eventId = UUID.randomUUID().toString();
    }

    public Long getAggregateId() {
        return aggregateId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getEventType() {
        return eventType;
    }

    public String getEventId() {
        return eventId;
    }
}
