package com.tramite.online.shared.annotation;

import java.lang.annotation.*;


// Indica que la clase es un caso de uso en la arquitectura de software.
@Target(ElementType.TYPE)
// La anotación estará disponible en tiempo de ejecución.
@Retention(RetentionPolicy.RUNTIME)
// Indica que esta anotación debe ser documentada por herramientas de documentación.
@Documented
public @interface UseCase {
}
