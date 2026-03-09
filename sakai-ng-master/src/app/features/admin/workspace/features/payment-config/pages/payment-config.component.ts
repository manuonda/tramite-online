import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-payment-config',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService],
    imports: [RouterModule, ButtonModule, InputTextModule, ToastModule, CardModule],
    template: `
        <div class="space-y-6">
            <div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Pagos</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Vincule su cuenta de MercadoPago. El precio de cada trámite se configura en cada formulario al habilitar "Requiere pago".
                </p>
            </div>

            <p-card>
                <ng-template pTemplate="header">
                    <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-surface-700">
                        <div class="w-12 h-12 rounded-xl bg-[#00b1ea]/10 flex items-center justify-center">
                            <i class="pi pi-credit-card text-2xl text-[#00b1ea]"></i>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900 dark:text-white">MercadoPago</h3>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Integración con split de pagos</p>
                        </div>
                    </div>
                </ng-template>
                <div class="space-y-4">
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                        Para habilitar cobros en sus formularios, debe vincular su cuenta de MercadoPago.
                        Los pagos se realizarán al finalizar el trámite y el cobro se acreditará según la configuración de su cuenta (incluyendo split si está configurado).
                    </p>
                    <div class="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
                        <p class="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                            <i class="pi pi-info-circle mr-2"></i>Próximos pasos para la integración
                        </p>
                        <ul class="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
                            <li>Crear una aplicación en <a href="https://www.mercadopago.com.ar/developers" target="_blank" rel="noopener" class="underline">MercadoPago Developers</a></li>
                            <li>Obtener las credenciales (Access Token) de producción</li>
                            <li>Configurar el Access Token en esta sección (próximamente)</li>
                            <li>Los formularios con "Requiere pago" redirigirán al usuario a MercadoPago al finalizar</li>
                        </ul>
                    </div>
                    <div class="pt-4 border-t border-gray-100 dark:border-surface-700">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Access Token (producción)</label>
                        <input pInputText type="password" placeholder="Pegue su Access Token de MercadoPago..."
                            class="w-full max-w-md" readonly
                            (click)="showComingSoon()" />
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            El token se almacenará de forma segura. No comparta sus credenciales.
                        </p>
                    </div>
                    <button pButton label="Vincular cuenta (próximamente)" icon="pi pi-link"
                        class="mt-2" [disabled]="true"
                        (click)="showComingSoon()">
                    </button>
                </div>
            </p-card>

            <p-card>
                <ng-template pTemplate="header">
                    <div class="px-6 py-3 border-b border-gray-100 dark:border-surface-700">
                        <h3 class="font-semibold text-gray-900 dark:text-white">¿Cómo funciona?</h3>
                    </div>
                </ng-template>
                <div class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    <p><strong>1. Configuración por workspace:</strong> Cada espacio de trabajo puede tener su propia cuenta de MercadoPago vinculada.</p>
                    <p><strong>2. Precio por formulario:</strong> En cada formulario, al marcar "Requiere pago" se habilita el campo para indicar el precio de ese trámite.</p>
                    <p><strong>3. Formularios con pago:</strong> Al finalizar el trámite y pagar, el usuario será redirigido a MercadoPago para realizar el pago.</p>
                    <p><strong>4. Split:</strong> Si su cuenta tiene split configurado, los fondos se distribuirán según su configuración en MercadoPago.</p>
                </div>
            </p-card>
        </div>
        <p-toast />
    `
})
export class PaymentConfigComponent {
    readonly workspaceId = input<string>('');

    private readonly messageService = inject(MessageService);

    showComingSoon(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Próximamente',
            detail: 'La integración con MercadoPago estará disponible en una próxima versión. Por ahora configure sus credenciales en MercadoPago Developers.',
            life: 5000
        });
    }
}
