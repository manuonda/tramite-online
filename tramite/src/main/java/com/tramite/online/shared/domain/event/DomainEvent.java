package com.tramite.online.shared.domain.event;

import java.time.Instant;

/**
 * Interfaz que representa un evento de dominio en el sistema.
 * Un evento de dominio es una representación de algo que ha ocurrido en el dominio del negocio y
 * que es relevante para el sistema. Esta interfaz define los métodos que deben ser implementados por cualquier clase que represente un evento de dominio.
 * Contiene información sobre el evento, como su identificador único, la fecha y hora en
 * que ocurrió, el identificador del agregado al que está asociado y el tipo de evento. Esta información es esencial para el manejo de eventos en el sistema y para garantizar la trazabilidad de las acciones realizadas.
 * @author dgarcia
 * @version 1.0
 */
public  interface DomainEvent {



    String eventId();
    Instant occurredAt();
    Long aggregateId();
    String eventType();
}
