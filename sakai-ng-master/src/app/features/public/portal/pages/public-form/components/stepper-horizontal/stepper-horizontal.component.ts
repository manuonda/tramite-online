import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Section } from '@features/admin/workspace/features/form-builder/models/form-builder.models';
import { AnswerChangeEvent, AnswerMap } from '../../../../models/portal.model';
import { QuestionRendererComponent } from '../question-renderer/question-renderer.component';

@Component({
    selector: 'app-stepper-horizontal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [QuestionRendererComponent],
    styles: [`
        :host { display: block; }
        .step-line { flex: 1; height: 2px; }
        .nav-btn {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 10px 24px; border-radius: 10px; font-size: 0.9375rem;
            font-weight: 600; cursor: pointer; transition: all 0.15s; border: none;
        }
        .nav-prev { background: white; border: 1.5px solid #e5e7eb; color: #374151; }
        .nav-prev:hover { border-color: #9ca3af; background: #f9fafb; }
        .nav-next { color: white; }
        .nav-next:hover { filter: brightness(0.9); }
        .nav-next:disabled { opacity: 0.6; cursor: not-allowed; }
    `],
    template: `
        <!-- ── Step indicators ──────────────────────────────────────────────── -->
        <div class="flex items-center mb-8 px-2">
            @for (section of sections(); track section.id; let i = $index) {
                <!-- Step circle -->
                <div class="flex flex-col items-center gap-1 shrink-0">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all"
                        [style.border-color]="i <= currentIndex() ? accentColor() : '#e5e7eb'"
                        [style.background-color]="i < currentIndex() ? accentColor() : i === currentIndex() ? 'white' : 'white'"
                        [style.color]="i < currentIndex() ? 'white' : i === currentIndex() ? accentColor() : '#9ca3af'">
                        @if (i < currentIndex()) {
                            <i class="pi pi-check text-xs"></i>
                        } @else {
                            {{ i + 1 }}
                        }
                    </div>
                    <span class="text-xs text-center leading-tight max-w-20 hidden sm:block"
                        [style.color]="i === currentIndex() ? accentColor() : i < currentIndex() ? '#6b7280' : '#9ca3af'"
                        [style.font-weight]="i === currentIndex() ? '600' : '400'">
                        {{ section.title }}
                    </span>
                </div>

                <!-- Connector line (not after last) -->
                @if (i < sections().length - 1) {
                    <div class="step-line mx-2 mt-[-18px] sm:mt-[-18px]"
                        [style.background-color]="i < currentIndex() ? accentColor() : '#e5e7eb'"></div>
                }
            }
        </div>

        <!-- ── Section header ────────────────────────────────────────────────── -->
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

        <!-- ── Questions ─────────────────────────────────────────────────────── -->
        <div class="space-y-7">
            @for (q of sortedQuestions(); track q.id) {
                <app-question-renderer
                    [question]="q"
                    [value]="answers()[q.id] ?? null"
                    [showError]="!!errors()[q.id]"
                    [errorMsg]="errors()[q.id] ?? ''"
                    (valueChange)="answerChange.emit({ questionId: q.id, value: $event })" />
            }
        </div>

        <!-- ── Navigation ────────────────────────────────────────────────────── -->
        <div class="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
            <button type="button" class="nav-btn nav-prev"
                [style.visibility]="isFirst() ? 'hidden' : 'visible'"
                (click)="prev.emit()">
                <i class="pi pi-chevron-left text-sm"></i>
                Anterior
            </button>

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
    `
})
export class StepperHorizontalComponent {
    readonly sections     = input.required<Section[]>();
    readonly currentIndex = input.required<number>();
    readonly answers      = input.required<AnswerMap>();
    readonly errors       = input<Partial<Record<string, string>>>({});
    readonly accentColor  = input<string>('#3b82f6');
    readonly isSubmitting = input(false);

    readonly answerChange = output<AnswerChangeEvent>();
    readonly next         = output<void>();
    readonly prev         = output<void>();
    readonly submit       = output<void>();

    readonly currentSection = computed(() => this.sections()[this.currentIndex()]);

    readonly sortedQuestions = computed(() =>
        [...(this.currentSection()?.questions ?? [])].sort((a, b) => a.order - b.order)
    );

    readonly isFirst = computed(() => this.currentIndex() === 0);
    readonly isLast  = computed(() => this.currentIndex() === this.sections().length - 1);
}
