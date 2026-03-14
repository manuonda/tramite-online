package com.tramite.online.common.models;

import com.tramite.online.shared.exception.BaseException;

import java.time.Instant;
import java.util.Map;

/**
 * Modelo de respuesta de error para la API.
 * Este modelo se utiliza para representar la estructura de una respuesta de error que se devuelve al cliente
 * cuando ocurre un error en la aplicación. Contiene información sobre el código de error, el mensaje de error,
 * la marca de tiempo del error y cualquier detalle adicional que pueda ser útil para el cliente o
 * para la depuración del error. Este modelo se utiliza para estandarizar la forma en que se manejan y se devuelven los errores en la API.
 * @author dgarcia
 * @version 1.0
 * @param code
 * @param message
 * @param timestamp
 * @param details
 */
public record ErrorResponse(
        String code,
        String message,
        Instant timestamp,
        Map<String, Object> details
) {

    public static ErrorResponse of(BaseException ex) {
        return new ErrorResponse(
                ex.getErrorCode().getCode(),
                ex.getMessage(),
                Instant.now(),
                ex.getDetails()
        );
    }

    /**
     * Crea un {@code ErrorResponse} para errores genéricos no mapeados (ej: 500).
     *
     * @param code    código de error como String
     * @param message mensaje descriptivo
     * @return instancia de ErrorResponse con detalles vacíos
     */
    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(code, message, Instant.now(), Map.of());
    }
}
