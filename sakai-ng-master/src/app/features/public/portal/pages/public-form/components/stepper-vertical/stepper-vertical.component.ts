import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Section } from '@features/admin/workspace/features/form-builder/models/form-builder.models';
import { AnswerChangeEvent, AnswerMap } from '../../../../models/portal.model';
import { QuestionRendererComponent } from '../question-renderer/question-renderer.component';

@Component({
    selector: 'app-stepper-vertical',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [QuestionRendererComponent, RouterModule],
    styles: [`
        :host { display: block; }
        .sidebar { width: 220px; min-width: 220px; }
        .step-item {
            display: flex; align-items: flex-start; gap: 10px;
            padding: 10px 14px; border-radius: 10px; cursor: pointer;
            transition: background 0.12s; border: none; text-align: left; width: 100%; background: none;
        }
        .step-item:hover { background: rgba(0,0,0,0.04); }
        .step-item.active { background: var(--accent-bg, #eff6ff); }
        .step-dot {
            width: 28px; height: 28px; min-width: 28px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 0.75rem; font-weight: 700; border: 2px solid;
            transition: all 0.15s;
        }
        .connector { width: 2px; height: 16px; margin: 2px 0 2px 13px; }
        .nav-btn {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 10px 22px; border-radius: 10px; font-size: 0.9375rem;
            font-weight: 600; cursor: pointer; transition: all 0.15s; border: none;
        }
        .nav-prev { background: white; border: 1.5px solid #e5e7eb; color: #374151; }
        .nav-prev:hover { border-color: #9ca3af; background: #f9fafb; }
        .nav-next { color: white; }
        .nav-next:hover { filter: brightness(0.9); }
        .nav-next:disabled { opacity: 0.6; cursor: not-allowed; }
        .nav-home {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 10px 22px; border-radius: 10px; font-size: 0.9375rem;
            font-weight: 600; text-decoration: none; transition: all 0.15s;
            background: white; border: 1.5px solid #e5e7eb; color: #374151;
        }
        .nav-home:hover { border-color: #9ca3af; background: #f9fafb; }
        @media (max-width: 640px) {
            .sidebar { width: 100%; min-width: 0; }
            .layout { flex-direction: column; }
        }
    `],
    template: `
        <div class="layout flex gap-0">

            <!-- ── Sidebar ─────────────────────────────────────────────────────── -->
            <aside class="sidebar bg-gray-50 border-r border-gray-200 pt-6 pb-6 px-2 shrink-0">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Secciones</p>

                @for (section of sections(); track section.id; let i = $index) {
                    <div>
                        <button type="button"
                            class="step-item"
                            [class.active]="i === currentIndex()"
                            (click)="i < currentIndex() && goTo.emit(i)">
                            <!-- Dot -->
                            <span class="step-dot"
                                [style.border-color]="i < currentIndex() ? accentColor() : i === currentIndex() ? accentColor() : '#d1d5db'"
                                [style.background-color]="i < currentIndex() ? accentColor() : 'white'"
                                [style.color]="i < currentIndex() ? 'white' : i === currentIndex() ? accentColor() : '#9ca3af'">
                                @if (i < currentIndex()) {
                                    <i class="pi pi-check" style="font-size:0.65rem"></i>
                                } @else {
                                    {{ i + 1 }}
                                }
                            </span>
                            <!-- Title -->
                            <span class="text-sm leading-snug pt-0.5"
                                [style.color]="i === currentIndex() ? accentColor() : i < currentIndex() ? '#374151' : '#9ca3af'"
                                [style.font-weight]="i === currentIndex() ? '600' : '400'">
                                {{ section.title }}
                            </span>
                        </button>

                        @if (i < sections().length - 1) {
                            <div class="connector"
                                [style.background-color]="i < currentIndex() ? accentColor() : '#e5e7eb'"></div>
                        }
                    </div>
                }
            </aside>

            <!-- ── Content ────────────────────────────────────────────────────── -->
            <div class="flex-1 min-w-0 px-8 py-6">

                <!-- Section header -->
                <div class="mb-6">
                    <p class="text-xs font-semibold tracking-wider uppercase mb-1"
                        [style.color]="accentColor()">
                        Sección {{ currentIndex() + 1 }} de {{ sections().length }}
                    </p>
                    <h2 class="text-xl font-bold text-gray-900">{{ currentSection().title }}</h2>
                    @if (currentSection().description) {
                        <p class="text-sm text-gray-500 mt-1">{{ currentSection().description }}</p>
                    }
                </div>

                <!-- Questions / Payment placeholder -->
                <div class="space-y-7">
                    @if (currentSection().id === '__payment__') {
                        <div class="rounded-xl border-2 border-dashed border-amber-200 bg-amber-50 p-8 text-center">
                            <i class="pi pi-credit-card text-3xl text-amber-500 mb-3 block"></i>
                            <p class="text-sm font-semibold text-amber-800">Pago</p>
                            <p class="text-xs text-amber-600 mt-1">Integración de pago pendiente (MercadoPago, Stripe, etc.)</p>
                        </div>
                    } @else {
                    @for (q of sortedQuestions(); track q.id) {
                        <app-question-renderer
                            [question]="q"
                            [value]="answers()[q.id] ?? null"
                            [showError]="!!errors()[q.id]"
                            [errorMsg]="errors()[q.id] ?? ''"
                            (valueChange)="answerChange.emit({ questionId: q.id, value: $event })" />
                    }
                    }
                </div>

                <!-- Navigation -->
                <div class="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
                    <div class="flex items-center gap-2">
                        @if (isFirst()) {
                            <a [routerLink]="firstStepLink()" class="nav-home">
                                <i [class]="firstStepIcon() + ' text-sm'"></i>
                                {{ firstStepLabel() }}
                            </a>
                        } @else {
                            <button type="button" class="nav-btn nav-prev"
                                (click)="prev.emit()">
                                <i class="pi pi-chevron-left text-sm"></i>
                                Anterior
                            </button>
                        }
                    </div>

                    @if (isLast()) {
                        <button type="button" class="nav-btn nav-next"
                            [style.background-color]="accentColor()"
                            [disabled]="isSubmitting()"
                            (click)="submit.emit()">
                            @if (isSubmitting()) {
                                <i class="pi pi-spin pi-spinner text-sm"></i>
                                Enviando...
                            } @else {
                                <i class="pi pi-send text-sm"></i>
                                Enviar trámite
                            }
                        </button>
                    } @else {
                        <button type="button" class="nav-btn nav-next"
                            [style.background-color]="accentColor()"
                            (click)="next.emit()">
                            Siguiente
                            <i class="pi pi-chevron-right text-sm"></i>
                        </button>
                    }
                </div>
            </div>
        </div>
    `
})
export class StepperVerticalComponent {
    readonly sections     = input.required<Section[]>();
    readonly currentIndex = input.required<number>();
    readonly answers      = input.required<AnswerMap>();
    readonly errors       = input<Partial<Record<string, string>>>({});
    readonly accentColor  = input<string>('#3b82f6');
    readonly isSubmitting = input(false);
    /** Enlace cuando es el primer paso (ej. /home o editor en vista previa) */
    readonly firstStepLink = input<string>('/home');
    readonly firstStepLabel = input<string>('Inicio');
    readonly firstStepIcon  = input<string>('pi pi-home');

    readonly answerChange = output<AnswerChangeEvent>();
    readonly next         = output<void>();
    readonly prev         = output<void>();
    readonly submit       = output<void>();
    readonly goTo         = output<number>();

    readonly currentSection = computed(() => this.sections()[this.currentIndex()]);

    readonly sortedQuestions = computed(() =>
        [...(this.currentSection()?.questions ?? [])].sort((a, b) => a.order - b.order)
    );

    readonly isFirst = computed(() => this.currentIndex() === 0);
    readonly isLast  = computed(() => this.currentIndex() === this.sections().length - 1);
}
