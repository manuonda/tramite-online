package com.tramite.online.workspace.domain.validator;

import com.tramite.online.workspace.domain.model.WorkSpace;

/**
 * Class Validator del WorkSpace
 */
public class WorkSpaceValidator {

     public static void validateName(String name){
         if(name == null || name.isBlank()){
             throw new IllegalArgumentException("El nombre del Espacio de Trabajo es obligatorior");
         }

         String trimmedName = name.trim();
         if(trimmedName.length() < 3){
             throw new IllegalArgumentException("El nombre debe tener al menos 3 caracteres. Actual :" + trimmedName);
         }


         // Regla : Máximo 100 caracteres
         if (trimmedName.length() > 100) {
             throw new IllegalArgumentException(
                     "El nombre no puede exceder 100 caracteres. Actual: " + trimmedName.length()
             );
         }


         if (!isValidNameFormat(trimmedName)) {
             throw new IllegalArgumentException(
                     "El nombre solo puede contener letras, números, espacios, guiones y puntos"
             );
         }
     }

    /**
     * Valida el formato del nombre
     * Caracteres permitidos: a-z, A-Z, 0-9, espacios, guiones (-), puntos (.)
     *
     * @param name Nombre a validar
     * @return true si el formato es válido
     */
    private static boolean isValidNameFormat(String name) {
        // Regex que permite: letras, números, espacios, guiones, puntos
        String validPattern = "^[a-zA-Z0-9\\s\\-_.]+$";
        return name.matches(validPattern);
    }

   /**
     * @param description Descripción a validar
     * @throws IllegalArgumentException si no cumple las reglas
     */
    public static void validateDescription(String description) {
        // Es opcional, pero si existe, valida tamaño
        if (description != null && !description.isBlank()) {
            if (description.length() > 500) {
                throw new IllegalArgumentException(
                        "La descripción no puede exceder 500 caracteres. Actual: " + description.length()
                );
            }
        }
    }


    /**
     * Valida el ID del propietario
     *
     * Reglas:
     * 1. No puede ser nulo
     * 2. Debe ser positivo
     * 3. Debe ser un número válido
     *
     * @param ownerId ID del propietario
     * @throws IllegalArgumentException si no cumple las reglas
     */
    public static void validateOwnerId(Long ownerId) {
        if (ownerId == null) {
            throw new IllegalArgumentException(
                    "El propietario (ownerId) es obligatorio"
            );
        }

        if (ownerId <= 0) {
            throw new IllegalArgumentException(
                    "El ID del propietario debe ser un número positivo. Actual: " + ownerId
            );
        }
    }


    /**
     * Valida una entidad WorkSpace completa
     * Ejecuta todas las validaciones del dominio
     *
     * @param workspace WorkSpace a validar
     * @throws IllegalArgumentException si no cumple alguna regla
     */
    public static void validateWorkSpace(WorkSpace workspace) {
        // Validar que el workspace no sea nulo
        if (workspace == null) {
            throw new IllegalArgumentException(
                    "El workspace no puede ser nulo"
            );
        }

        // Validar nombre
        validateName(workspace.getName());

        // Validar descripción (opcional)
        validateDescription(workspace.getDescription());

        // Validar owner ID
        validateOwnerId(workspace.getOwnerId());

        // Validar que las fechas existan
        if (workspace.getCreatedAt() == null) {
            throw new IllegalArgumentException(
                    "La fecha de creación es obligatoria"
            );
        }

        if (workspace.getUpdatedAt() == null) {
            throw new IllegalArgumentException(
                    "La fecha de actualización es obligatoria"
            );
        }
    }


    /**
     * Valida un cambio de nombre
     * Útil para actualizaciones
     *
     * @param oldName Nombre anterior
     * @param newName Nuevo nombre
     * @throws IllegalArgumentException si no cumple las reglas
     */
    public static void validateNameChange(String oldName, String newName) {
        // Validar nuevo nombre
        validateName(newName);

        // Validar que el nombre realmente cambió
        if (oldName != null && oldName.equals(newName.trim())) {
            throw new IllegalArgumentException(
                    "El nuevo nombre es igual al anterior. No hay cambios que guardar."
            );
        }
    }


    /**
     * Normaliza un nombre (limpia espacios)
     *
     * @param name Nombre a normalizar
     * @return Nombre normalizado
     */
    public static String normalizeName(String name) {
        if (name == null) return null;
        // Elimina espacios múltiples y los reemplaza por uno
        return name.trim().replaceAll("\\s+", " ");
    }

    /**
     * Verifica si un nombre es válido sin lanzar excepción
     * Útil para validaciones silenciosas
     *
     * @param name Nombre a verificar
     * @return true si es válido, false si no
     */
    public static boolean isValidName(String name) {
        try {
            validateName(name);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }




}
