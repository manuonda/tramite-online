import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
    Form, Section, Question,
} from '../../models/form-builder.models';
import { FormBuilderService } from '../../services/form-builder.service';

type AnswerValue = number | boolean | string | null;
type AnswerMap = Record<string, AnswerValue>;

@Component({
    selector: 'app-form-preview',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule, FormsModule],
    styles: [`
        :host { display: block; }
        .preview-input {
            width: 100%; padding: 10px 14px;
            border: 1.5px solid #e5e7eb; border-radius: 8px;
            font-size: 0.9375rem; color: #111827;
            background: white; outline: none; transition: border-color 0.15s;
            font-family: inherit;
        }
        .preview-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        :host-context(.dark) .preview-input {
            background: var(--surface-800); border-color: var(--surface-600); color: #f1f5f9;
        }
        .preview-select {
            width: 100%; padding: 10px 14px;
            border: 1.5px solid #e5e7eb; border-radius: 8px;
            font-size: 0.9375rem; color: #111827; background: white;
            outline: none; cursor: pointer; appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
            background-repeat: no-repeat; background-position: right 12px center;
            padding-right: 36px;
        }
        .preview-select:focus { border-color: #3b82f6; outline: none; }
        .star-btn { background: none; border: none; cursor: pointer; padding: 2px; font-size: 1.5rem; line-height: 1; transition: transform 0.1s; }
        .star-btn:hover { transform: scale(1.15); }
        .scale-btn {
            min-width: 36px; height: 36px; border-radius: 8px;
            border: 1.5px solid #e5e7eb; background: white; cursor: pointer;
            font-size: 0.875rem; font-weight: 600; color: #374151;
            transition: all 0.12s;
        }
        .scale-btn:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
        .scale-btn.active { border-color: #3b82f6; background: #3b82f6; color: white; }
        .bool-btn {
            flex: 1; padding: 10px; border-radius: 8px;
            border: 1.5px solid #e5e7eb; background: white; cursor: pointer;
            font-size: 0.9375rem; font-weight: 500; color: #374151;
            transition: all 0.12s; display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .bool-btn:hover { border-color: #3b82f6; }
        .bool-btn.active-yes { border-color: #10b981; background: #ecfdf5; color: #059669; }
        .bool-btn.active-no { border-color: #ef4444; background: #fef2f2; color: #dc2626; }
        .file-zone {
            border: 2px dashed #d1d5db; border-radius: 10px; padding: 2rem 1rem;
            text-align: center; cursor: pointer; transition: all 0.15s;
        }
        .file-zone:hover { border-color: #3b82f6; background: #eff6ff; }
        .submit-btn {
            padding: 12px 40px; background: #3b82f6; color: white; border: none;
            border-radius: 10px; font-size: 1rem; font-weight: 600;
            cursor: pointer; transition: background 0.15s; width: 100%;
        }
        .submit-btn:hover { background: #2563eb; }
        .section-divider {
            display: flex; align-items: center; gap: 12px; margin: 2rem 0;
        }
        .section-divider::before, .section-divider::after {
            content: ''; flex: 1; height: 1px; background: #e5e7eb;
        }
    `],
    template: `
        @if (!form()) {
            <!-- Not found -->
            <div class="flex flex-col items-center justify-center py-20 text-center">
                <i class="pi pi-file-excel text-4xl text-gray-300 mb-3"></i>
                <p class="text-gray-400">Formulario no encontrado</p>
                <a [routerLink]="['/admin/workspaces', workspaceId()]"
                    class="mt-3 text-sm text-blue-600 hover:underline no-underline">
                    Volver al workspace
                </a>
            </div>
        } @else {

        <div class="max-w-2xl mx-auto">

            <!-- ── Preview banner ─────────────────────────────────────── -->
            <div class="bg-slate-800 rounded-xl px-4 py-2.5 mb-5 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2.5 text-slate-200 text-xs font-medium">
                    <span class="flex items-center gap-1.5 bg-amber-400/20 text-amber-300 px-2.5 py-1 rounded-full text-xs font-semibold">
                        <i class="pi pi-eye" style="font-size:0.65rem;"></i>
                        VISTA PREVIA
                    </span>
                    <span class="text-slate-400">Los datos ingresados no se guardarán</span>
                </div>
                <a [routerLink]="['/admin/workspaces', workspaceId(), 'forms', formId()]"
                    class="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-medium no-underline transition-colors shrink-0 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg">
                    <i class="pi pi-pencil" style="font-size:0.65rem;"></i>
                    Volver al editor
                </a>
            </div>

            <!-- ── Form card ──────────────────────────────────────────── -->
            <div class="bg-white dark:bg-surface-900 rounded-2xl border border-gray-200 dark:border-surface-700 shadow-md overflow-hidden">

                <!-- Form header with gradient -->
                <div class="relative overflow-hidden"
                    [style.background]="form()!.status === 'published'
                        ? 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)'
                        : 'linear-gradient(135deg, #374151 0%, #4b5563 100%)'">
                    <!-- Decorative circles -->
                    <div class="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 bg-white"></div>
                    <div class="absolute -right-4 top-8 w-16 h-16 rounded-full opacity-10 bg-white"></div>
                    <div class="px-8 py-7 relative">
                        <div class="flex items-start gap-4">
                            <div class="flex w-11 h-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm shrink-0">
                                <i class="pi pi-file-edit text-white text-lg"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h1 class="text-xl font-bold text-white mb-0.5 leading-tight">{{ form()!.name }}</h1>
                                @if (form()!.description) {
                                    <p class="text-blue-100/80 text-sm leading-relaxed mt-1">{{ form()!.description }}</p>
                                }
                                <div class="flex items-center gap-3 mt-3">
                                    <span class="text-xs text-white/60 flex items-center gap-1">
                                        <i class="pi pi-list" style="font-size:0.65rem;"></i>
                                        {{ sortedSections().length }} {{ sortedSections().length === 1 ? 'sección' : 'secciones' }}
                                    </span>
                                    <span class="text-white/30">·</span>
                                    <span class="text-xs text-white/60 flex items-center gap-1">
                                        <i class="pi pi-question-circle" style="font-size:0.65rem;"></i>
                                        {{ totalQuestions() }} preguntas
                                    </span>
                                    @if (hasRequired()) {
                                        <span class="text-white/30">·</span>
                                        <span class="text-xs text-red-300 flex items-center gap-1">
                                            <i class="pi pi-asterisk" style="font-size:0.55rem;"></i>
                                            Campos requeridos
                                        </span>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sections -->
                <div class="px-7 py-6 space-y-8">
                    @for (section of sortedSections(); track section.id; let sIdx = $index) {

                        <!-- Section block -->
                        <div [class]="sIdx > 0 ? 'pt-6 border-t border-gray-100 dark:border-surface-700' : ''">

                        <!-- Section header with numbered badge -->
                        <div class="flex items-start gap-3 mb-5">
                            <div class="flex w-7 h-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0 mt-0.5">
                                {{ sIdx + 1 }}
                            </div>
                            <div>
                                <h2 class="text-base font-bold text-gray-800 dark:text-white leading-tight">{{ section.title }}</h2>
                                @if (section.description) {
                                    <p class="text-sm text-gray-500 dark:text-gray-400 italic mt-0.5">{{ section.description }}</p>
                                }
                            </div>
                        </div>

                        <!-- Questions -->
                        <div class="space-y-6">
                            @for (question of sortedQuestions(section); track question.id) {
                                <div>
                                    <!-- Label -->
                                    <label class="block text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">
                                        {{ question.label || 'Sin título' }}
                                        @if (question.required) {
                                            <span class="text-red-500 ml-0.5">*</span>
                                        }
                                    </label>
                                    <!-- Description -->
                                    @if (question.description) {
                                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">{{ question.description }}</p>
                                    }

                                    <!-- Input based on type -->
                                    @switch (question.type) {

                                        @case ('text') {
                                            <input class="preview-input"
                                                type="text"
                                                [placeholder]="question.config.placeholder || 'Escribe tu respuesta...'"
                                                [id]="'q_' + question.id" />
                                        }

                                        @case ('number') {
                                            <input class="preview-input"
                                                type="number"
                                                [attr.min]="question.config.min"
                                                [attr.max]="question.config.max"
                                                [attr.step]="question.config.step ?? 1"
                                                placeholder="Ingresa un número..."
                                                [id]="'q_' + question.id" />
                                        }

                                        @case ('date') {
                                            <input class="preview-input"
                                                type="date"
                                                [id]="'q_' + question.id" />
                                        }

                                        @case ('boolean') {
                                            <div class="flex gap-3 mt-1">
                                                <button class="bool-btn"
                                                    [class]="getAnswer(question.id) === true ? 'bool-btn active-yes' : 'bool-btn'"
                                                    (click)="setAnswer(question.id, true)">
                                                    <i class="pi pi-check text-sm"></i> Sí
                                                </button>
                                                <button class="bool-btn"
                                                    [class]="getAnswer(question.id) === false ? 'bool-btn active-no' : 'bool-btn'"
                                                    (click)="setAnswer(question.id, false)">
                                                    <i class="pi pi-times text-sm"></i> No
                                                </button>
                                            </div>
                                        }

                                        @case ('select') {
                                            @if (getDomainValues(question.config.domainId); as opts) {
                                                @if (opts.length > 0) {
                                                    <select class="preview-select" [id]="'q_' + question.id">
                                                        <option value="">Selecciona una opción...</option>
                                                        @for (opt of opts; track opt.id) {
                                                            <option [value]="opt.value">{{ opt.label }}</option>
                                                        }
                                                    </select>
                                                } @else {
                                                    <div class="text-xs text-gray-400 italic px-3 py-2 border border-dashed border-gray-200 rounded-lg">
                                                        Sin opciones configuradas (asigna un dominio de valores)
                                                    </div>
                                                }
                                            }
                                        }

                                        @case ('multi-select') {
                                            @if (getDomainValues(question.config.domainId); as opts) {
                                                @if (opts.length > 0) {
                                                    <div class="space-y-2 mt-1">
                                                        @for (opt of opts; track opt.id) {
                                                            <label class="flex items-center gap-3 cursor-pointer group">
                                                                <div class="w-4 h-4 rounded border-2 border-gray-300 group-hover:border-blue-400 shrink-0 transition-colors
                                                                    flex items-center justify-center bg-white">
                                                                </div>
                                                                <span class="text-sm text-gray-700 dark:text-gray-300">{{ opt.label }}</span>
                                                            </label>
                                                        }
                                                    </div>
                                                } @else {
                                                    <div class="text-xs text-gray-400 italic px-3 py-2 border border-dashed border-gray-200 rounded-lg">
                                                        Sin opciones configuradas (asigna un dominio de valores)
                                                    </div>
                                                }
                                            }
                                        }

                                        @case ('file') {
                                            <div class="file-zone">
                                                <i class="pi pi-upload text-2xl text-gray-300 mb-2 block"></i>
                                                <p class="text-sm text-gray-400 font-medium">Haz clic o arrastra un archivo aquí</p>
                                                @if (question.config.accept) {
                                                    <p class="text-xs text-gray-300 mt-1">Tipos permitidos: {{ question.config.accept }}</p>
                                                }
                                            </div>
                                        }

                                        @case ('rating') {
                                            <div class="flex items-center gap-1 mt-1">
                                                @for (star of getStars(question.config.stars ?? 5); track star) {
                                                    <button class="star-btn"
                                                        (click)="setAnswer(question.id, star)"
                                                        [style.color]="getAnswerAsNumber(question.id) >= star ? '#f59e0b' : '#d1d5db'">
                                                        ★
                                                    </button>
                                                }
                                                @if (getAnswerAsNumber(question.id) > 0) {
                                                    <span class="ml-2 text-sm text-gray-500">{{ getAnswerAsNumber(question.id) }} / {{ question.config.stars ?? 5 }}</span>
                                                }
                                            </div>
                                        }

                                        @case ('scale') {
                                            <div class="mt-1">
                                                <div class="flex flex-wrap gap-2">
                                                    @for (n of getScaleNumbers(question.config.scaleMin ?? 1, question.config.scaleMax ?? 10); track n) {
                                                        <button class="scale-btn"
                                                            [class.active]="getAnswerAsNumber(question.id) === n"
                                                            (click)="setAnswer(question.id, n)">
                                                            {{ n }}
                                                        </button>
                                                    }
                                                </div>
                                                @if (question.config.scaleMinLabel || question.config.scaleMaxLabel) {
                                                    <div class="flex justify-between mt-1.5">
                                                        <span class="text-xs text-gray-400">{{ question.config.scaleMinLabel }}</span>
                                                        <span class="text-xs text-gray-400">{{ question.config.scaleMaxLabel }}</span>
                                                    </div>
                                                }
                                            </div>
                                        }

                                        @case ('matrix') {
                                            <div class="overflow-x-auto mt-1">
                                                <div class="text-xs text-gray-400 italic px-3 py-2 border border-dashed border-gray-200 rounded-lg">
                                                    Matriz (configura filas y columnas en el editor)
                                                </div>
                                            </div>
                                        }

                                        @default {
                                            <input class="preview-input" type="text" placeholder="Respuesta..." />
                                        }
                                    }
                                </div>
                            }
                        </div>
                        </div> <!-- end section block -->
                    }
                </div>

                <!-- Submit section -->
                <div class="px-7 py-5 border-t border-gray-100 dark:border-surface-700 bg-gray-50/70 dark:bg-surface-800/50">
                    @if (hasRequired()) {
                        <p class="text-xs text-gray-400 mb-3 flex items-center gap-1">
                            <span class="text-red-400 font-bold">*</span>
                            Indica un campo obligatorio
                        </p>
                    }
                    <button class="submit-btn" type="button">
                        <i class="pi pi-send text-sm mr-2"></i>
                        Enviar formulario
                    </button>
                    <p class="text-xs text-gray-400 mt-2.5 text-center">
                        Vista previa — los datos no se guardarán
                    </p>
                </div>
            </div>
        </div>

        } <!-- end @if form -->
    `
})
export class FormPreviewComponent implements OnInit {
    readonly workspaceId = input<string>('');
    readonly formId = input<string>('');

    private readonly fbService = inject(FormBuilderService);

    readonly form = signal<Form | null>(null);

    /** Answer map: questionId → value */
    readonly answers = signal<AnswerMap>({} as AnswerMap);

    readonly sortedSections = computed(() =>
        [...(this.form()?.sections ?? [])].sort((a, b) => a.order - b.order)
    );

    readonly totalQuestions = computed(() =>
        this.form()?.sections.reduce((acc, s) => acc + s.questions.length, 0) ?? 0
    );

    readonly hasRequired = computed(() =>
        this.form()?.sections.some(s => s.questions.some(q => q.required)) ?? false
    );

    ngOnInit(): void {
        const f = this.fbService.getForm(this.workspaceId(), this.formId());
        this.form.set(f ?? null);
    }

    sortedQuestions(section: Section): Question[] {
        return [...section.questions].sort((a, b) => a.order - b.order);
    }

    // ── Answer tracking ───────────────────────────────────────────────────────

    getAnswer(questionId: string): AnswerValue {
        return this.answers()[questionId] ?? null;
    }

    getAnswerAsNumber(questionId: string): number {
        return (this.answers()[questionId] as number) ?? 0;
    }

    setAnswer(questionId: string, value: AnswerValue): void {
        this.answers.update(map => ({ ...map, [questionId]: value }));
    }

    // ── Domain values ─────────────────────────────────────────────────────────

    getDomainValues(domainId: string | undefined): { id: string; label: string; value: string }[] {
        if (!domainId) return [];
        const domain = this.fbService.domains().find(d => d.id === domainId);
        return domain?.values ?? [];
    }

    // ── Scale & star helpers ──────────────────────────────────────────────────

    getStars(count: number): number[] {
        return Array.from({ length: count }, (_, i) => i + 1);
    }

    getScaleNumbers(min: number, max: number): number[] {
        const arr: number[] = [];
        for (let i = min; i <= max; i++) arr.push(i);
        return arr;
    }
}
