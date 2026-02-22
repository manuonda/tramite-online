import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-submission-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="mb-6">
            <div class="flex items-center gap-4">
                <div class="bg-gradient-to-br from-teal-500 to-teal-600 p-3 rounded-full text-white shadow-lg">
                    <i class="pi pi-inbox text-lg"></i>
                </div>
                <div>
                    <span class="text-xl font-bold text-gray-800 dark:text-white">Respuestas</span>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Envíos recibidos de los formularios</p>
                </div>
            </div>
        </div>

        <div class="card border-l-4 border-teal-500 shadow-lg">
            <div class="p-8 text-center">
                <div class="bg-teal-50 dark:bg-teal-950 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <i class="pi pi-inbox text-teal-600 text-2xl"></i>
                </div>
                <h4 class="font-semibold text-lg text-gray-800 dark:text-white mb-2">Sin respuestas</h4>
                <p class="text-gray-500 dark:text-gray-400">Aún no hay envíos recibidos en este workspace.</p>
            </div>
        </div>
    `
})
export class SubmissionListComponent {}
