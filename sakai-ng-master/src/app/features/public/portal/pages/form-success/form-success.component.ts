import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-form-success',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule],
    styles: [`
        :host { display: block; }
        @keyframes popIn {
            0%   { transform: scale(0.7) rotate(-6deg); opacity: 0; }
            70%  { transform: scale(1.08) rotate(2deg); opacity: 1; }
            100% { transform: scale(1)   rotate(0deg);  opacity: 1; }
        }
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .icon-anim  { animation: popIn  0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; }
        .text-anim  { animation: fadeUp 0.4s ease 0.45s both; }
        .ref-anim   { animation: fadeUp 0.4s ease 0.6s both; }
        .btn-anim   { animation: fadeUp 0.4s ease 0.75s both; }
        .ref-box {
            display: inline-flex; align-items: center; gap: 10px;
            background: #f0fdf4; border: 1.5px solid #86efac;
            border-radius: 12px; padding: 12px 20px;
            font-family: ui-monospace, monospace;
        }
    `],
    template: `
        <div class="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-6 py-16">
            <div class="max-w-md w-full text-center">

                <!-- Big check icon -->
                <div class="icon-anim inline-flex w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-6 shadow-lg">
                    <i class="pi pi-check-circle text-green-500" style="font-size:3rem"></i>
                </div>

                <!-- Heading -->
                <div class="text-anim">
                    <h1 class="text-3xl font-bold text-gray-900 mb-3">
                        ¡Trámite enviado con éxito!
                    </h1>
                    <p class="text-gray-500 text-base leading-relaxed">
                        Tu solicitud fue recibida y será procesada por el área correspondiente.
                        Te notificaremos cuando haya novedades.
                    </p>
                </div>

                <!-- Reference number -->
                @if (ref()) {
                    <div class="ref-anim mt-8">
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Número de referencia
                        </p>
                        <div class="ref-box mx-auto">
                            <i class="pi pi-hashtag text-green-600 text-sm"></i>
                            <span class="text-green-800 font-bold text-lg tracking-wide">{{ ref() }}</span>
                        </div>
                        <p class="text-xs text-gray-400 mt-2">
                            Guardá este número para hacer seguimiento de tu trámite
                        </p>
                    </div>
                }

                <!-- What's next -->
                <div class="text-anim mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-5 text-left">
                    <h3 class="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                        <i class="pi pi-info-circle text-blue-500 text-sm"></i>
                        ¿Qué sigue?
                    </h3>
                    <ul class="space-y-2 text-sm text-blue-700">
                        <li class="flex items-start gap-2">
                            <i class="pi pi-check text-blue-400 text-xs mt-0.5 shrink-0"></i>
                            El área responsable revisará tu solicitud.
                        </li>
                        <li class="flex items-start gap-2">
                            <i class="pi pi-check text-blue-400 text-xs mt-0.5 shrink-0"></i>
                            Podés consultar el estado usando tu número de referencia.
                        </li>
                        <li class="flex items-start gap-2">
                            <i class="pi pi-check text-blue-400 text-xs mt-0.5 shrink-0"></i>
                            El tiempo de respuesta varía según el tipo de trámite.
                        </li>
                    </ul>
                </div>

                <!-- Actions -->
                <div class="btn-anim mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                    <a routerLink="/home"
                        class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm no-underline hover:bg-blue-700 transition-colors">
                        <i class="pi pi-home text-sm"></i>
                        Volver al inicio
                    </a>
                    <a routerLink="/home"
                        class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm no-underline hover:bg-gray-50 transition-colors">
                        <i class="pi pi-plus text-sm"></i>
                        Nuevo trámite
                    </a>
                </div>
            </div>
        </div>
    `
})
export class FormSuccessComponent {
    /** Bound via withComponentInputBinding() from query param ?ref=... */
    readonly ref = input<string>('');
}
