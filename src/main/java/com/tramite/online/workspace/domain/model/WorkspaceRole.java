package com.tramite.online.workspace.domain.model;

public enum WorkspaceRole {

    OWNER("Propietario - Acceso total"),
    ADMIN("Administrador - Getion Completa"),
    EDITOR(" Editor - Crear y editar"),
    VIEWER(" Visualizador  -  Solo lectura");

    private final String description;

    WorkspaceRole(String description) {
        this.description = description;
    }
    public String getDescription() {
        return this.description;
    }
}
