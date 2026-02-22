import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-member-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonModule],
    template: `
        <div class="mb-6">
            <div class="flex items-center gap-4">
                <div class="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-full text-white shadow-lg">
                    <i class="pi pi-users text-lg"></i>
                </div>
                <div>
                    <span class="text-xl font-bold text-gray-800 dark:text-white">Miembros</span>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Usuarios con acceso a este workspace</p>
                </div>
            </div>
        </div>

        <div class="card border-l-4 border-orange-500 shadow-lg">
            <div class="p-8 text-center">
                <div class="bg-orange-50 dark:bg-orange-950 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <i class="pi pi-users text-orange-600 text-2xl"></i>
                </div>
                <h4 class="font-semibold text-lg text-gray-800 dark:text-white mb-2">Sin miembros adicionales</h4>
                <p class="text-gray-500 dark:text-gray-400 mb-6">Invitá usuarios para colaborar en este workspace.</p>
                <p-button label="Invitar Miembro" icon="pi pi-user-plus" severity="warn" size="small" />
            </div>
        </div>
    `
})
export class MemberListComponent {}
