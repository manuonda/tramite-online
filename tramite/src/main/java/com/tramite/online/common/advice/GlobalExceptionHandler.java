package com.tramite.online.common.advice;

import com.tramite.online.common.models.ErrorResponse;
import com.tramite.online.shared.exception.BaseException;
import com.tramite.online.shared.exception.BusinessException;
import com.tramite.online.shared.exception.ConflictException;
import com.tramite.online.shared.exception.ForbiddenException;
import com.tramite.online.shared.exception.NotFoundException;
import com.tramite.online.shared.exception.UnauthorizedException;
import com.tramite.online.shared.exception.ValidationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Manejador global de excepciones para la API REST.
 * <p>
 * Intercepta todas las excepciones del sistema y las convierte en respuestas JSON
 * estandarizadas usando {@link ErrorResponse}. Utiliza {@code switch} expression con
 * pattern matching (Java 21+) para resolver el HTTP status desde la jerarquía sellada
 * de {@link BaseException}.
 * </p>
 *
 * <p>Mapeo de excepciones a HTTP status:</p>
 * <ul>
 *   <li>{@link NotFoundException}              → 404 Not Found</li>
 *   <li>{@link ValidationException}            → 400 Bad Request</li>
 *   <li>{@link UnauthorizedException}          → 401 Unauthorized</li>
 *   <li>{@link ForbiddenException}             → 403 Forbidden</li>
 *   <li>{@link ConflictException}              → 409 Conflict</li>
 *   <li>{@link BusinessException}              → 422 Unprocessable Entity</li>
 *   <li>{@link MethodArgumentNotValidException}→ 400 con detalle de campos inválidos</li>
 *   <li>{@link Exception}                      → 500 fallback (sin exponer stacktrace)</li>
 * </ul>
 *
 * @author dgarcia
 * @version 1.0
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Maneja todas las excepciones de la jerarquía sellada {@link BaseException}.
     * <p>
     * El {@code switch} expression con pattern matching (Java 21+) es exhaustivo:
     * si se agrega una nueva excepción al {@code permits} de {@link BaseException}
     * y no se incluye aquí, el compilador falla — garantizando que ningún tipo
     * de error quede sin mapear.
     * </p>
     *
     * @param ex excepción del dominio capturada
     * @return {@link ResponseEntity} con {@link ErrorResponse} y el HTTP status correspondiente
     */
    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ErrorResponse> handleBaseException(BaseException ex) {
        HttpStatus status = switch (ex) {
            case NotFoundException _     -> HttpStatus.NOT_FOUND;
            case ValidationException _   -> HttpStatus.BAD_REQUEST;
            case UnauthorizedException _ -> HttpStatus.UNAUTHORIZED;
            case ForbiddenException _    -> HttpStatus.FORBIDDEN;
            case ConflictException _     -> HttpStatus.CONFLICT;
            case BusinessException _     -> HttpStatus.UNPROCESSABLE_CONTENT;
        };

        return ResponseEntity.status(status).body(ErrorResponse.of(ex));
    }

    /**
     * Maneja errores de validación de Bean Validation disparados por {@code @Valid}.
     * <p>
     * Extrae los mensajes de error por campo y los incluye en el campo {@code details}
     * de la respuesta, permitiendo al cliente identificar exactamente qué campos fallaron.
     * </p>
     *
     * @param ex excepción lanzada por Spring cuando falla la validación de un {@code @RequestBody}
     * @return 400 Bad Request con el detalle de cada campo inválido en {@code details}
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        Map<String, Object> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "valor inválido",
                        (existing, replacement) -> existing
                ));

        ErrorResponse response = new ErrorResponse(
                "VALIDATION_ERROR",
                "Error de validación en los datos enviados",
                Instant.now(),
                fieldErrors
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Fallback para cualquier excepción no esperada.
     * <p>
     * No expone el stacktrace ni mensajes internos al cliente para evitar
     * filtrar información sensible sobre la implementación.
     * </p>
     *
     * @param ignored excepción no manejada por los handlers anteriores
     * @return 500 Internal Server Error con mensaje genérico
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ignored) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of("INTERNAL_ERROR", "Ha ocurrido un error inesperado"));
    }
}