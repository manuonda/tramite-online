import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-workspace-settings',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="card border-l-4 border-gray-400 shadow-lg">
            <div class="p-8 text-center">
                <div class="bg-gray-100 dark:bg-surface-700 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <i class="pi pi-cog text-gray-400 text-2xl"></i>
                </div>
                <h4 class="font-semibold text-lg text-gray-800 dark:text-white mb-2">Configuración</h4>
                <p class="text-gray-500 dark:text-gray-400">Módulo de configuración — Próximamente.</p>
            </div>
        </div>
    `
})
export class WorkspaceSettingsComponent {}
