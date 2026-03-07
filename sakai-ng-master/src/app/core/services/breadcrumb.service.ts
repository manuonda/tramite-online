import { Injectable, signal, computed } from '@angular/core';
import { MenuItem } from 'primeng/api';

/**
 * Permite a los componentes establecer etiquetas personalizadas para el breadcrumb
 * (ej: nombre del workspace, título de la respuesta).
 */
@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
    /** Etiqueta personalizada para el último segmento del breadcrumb */
    private readonly _customLabel = signal<string | null>(null);

    /** Ruta personalizada para el último segmento (opcional) */
    private readonly _customRoute = signal<string[] | null>(null);

    readonly customLabel = this._customLabel.asReadonly();
    readonly customRoute = this._customRoute.asReadonly();

    setCustomLabel(label: string | null, route?: string[] | null): void {
        this._customLabel.set(label ?? null);
        this._customRoute.set(route ?? null);
    }

    clear(): void {
        this._customLabel.set(null);
        this._customRoute.set(null);
    }
}
