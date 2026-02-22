import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-form-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonModule],
    template: `
        <div class="mb-6">
            <div class="flex items-center gap-4">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-full text-white shadow-lg">
                    <i class="pi pi-file text-lg"></i>
                </div>
                <div>
                    <span class="text-xl font-bold text-gray-800 dark:text-white">Formularios</span>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Administrá los formularios de este workspace</p>
                </div>
            </div>
        </div>

        <div class="card border-l-4 border-blue-500 shadow-lg">
            <div class="p-8 text-center">
                <div class="bg-blue-50 dark:bg-blue-950 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <i class="pi pi-file text-blue-600 text-2xl"></i>
                </div>
                <h4 class="font-semibold text-lg text-gray-800 dark:text-white mb-2">Sin formularios</h4>
                <p class="text-gray-500 dark:text-gray-400 mb-6">Este workspace aún no tiene formularios configurados.</p>
                <p-button label="Nuevo Formulario" icon="pi pi-plus" severity="success" size="small" />
            </div>
        </div>
    `
})
export class FormListComponent {}
