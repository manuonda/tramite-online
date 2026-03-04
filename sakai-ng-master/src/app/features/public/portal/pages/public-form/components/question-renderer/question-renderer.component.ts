import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Question } from '@features/admin/workspace/features/form-builder/models/form-builder.models';
import { FormBuilderService } from '@features/admin/workspace/features/form-builder/services/form-builder.service';
import { AnswerValue } from '../../../../models/portal.model';

@Component({
    selector: 'app-question-renderer',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        :host { display: block; }
        .q-input {
            width: 100%; padding: 10px 14px;
            border: 1.5px solid #e5e7eb; border-radius: 8px;
            font-size: 0.9375rem; color: #111827;
            background: white; outline: none; transition: border-color 0.15s;
            font-family: inherit;
        }
        .q-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .q-input.err { border-color: #ef4444; }
        .q-select {
            width: 100%; padding: 10px 14px;
            border: 1.5px solid #e5e7eb; border-radius: 8px;
            font-size: 0.9375rem; color: #111827; background: white;
            outline: none; cursor: pointer; appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
            background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px;
        }
        .q-select:focus { border-color: #3b82f6; outline: none; }
        .q-select.err { border-color: #ef4444; }
        .bool-btn {
            flex: 1; padding: 10px 16px; border-radius: 8px;
            border: 1.5px solid #e5e7eb; background: white; cursor: pointer;
            font-size: 0.9375rem; font-weight: 500; color: #374151;
            transition: all 0.12s; display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .bool-btn:hover { border-color: #93c5fd; }
        .bool-btn.yes { border-color: #10b981; background: #ecfdf5; color: #059669; }
        .bool-btn.no  { border-color: #ef4444; background: #fef2f2; color: #dc2626; }
        .star-btn { background: none; border: none; cursor: pointer; padding: 2px; font-size: 1.625rem; line-height: 1; transition: transform 0.1s; }
        .star-btn:hover { transform: scale(1.15); }
        .scale-btn {
            min-width: 38px; height: 38px; border-radius: 8px;
            border: 1.5px solid #e5e7eb; background: white; cursor: pointer;
            font-size: 0.875rem; font-weight: 600; color: #374151; transition: all 0.12s;
        }
        .scale-btn:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
        .scale-btn.on { border-color: #3b82f6; background: #3b82f6; color: white; }
        .file-zone {
            border: 2px dashed #d1d5db; border-radius: 10px; padding: 2rem 1rem;
            text-align: center; cursor: pointer; transition: all 0.15s;
        }
        .file-zone:hover { border-color: #3b82f6; background: #eff6ff; }
        .cb-wrap { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 6px 0; }
        .cb-wrap input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; accent-color: #3b82f6; }
    `],
    template: `
        <label class="block text-sm font-semibold text-gray-800 mb-1 leading-snug">
            {{ question().label }}
            @if (question().required) { <span class="text-red-500 ml-0.5">*</span> }
        </label>

        @if (question().description) {
            <p class="text-xs text-gray-500 mb-2 leading-relaxed">{{ question().description }}</p>
        }

        @switch (question().type) {

            @case ('text') {
                <input [class]="showError() ? 'q-input err' : 'q-input'"
                    type="text"
                    [value]="strVal()"
                    [placeholder]="question().config.placeholder || 'Escribe tu respuesta...'"
                    (input)="onText($event)" />
            }

            @case ('number') {
                <input [class]="showError() ? 'q-input err' : 'q-input'"
                    type="number"
                    [value]="value() ?? ''"
                    [attr.min]="question().config.min"
                    [attr.max]="question().config.max"
                    [attr.step]="question().config.step ?? 1"
                    placeholder="Ingresa un número..."
                    (change)="onNumber($event)" />
            }

            @case ('date') {
                <input [class]="showError() ? 'q-input err' : 'q-input'"
                    type="date"
                    [value]="strVal()"
                    (change)="onDate($event)" />
            }

            @case ('boolean') {
                <div class="flex gap-3 mt-1">
                    <button type="button"
                        [class]="value() === true ? 'bool-btn yes' : 'bool-btn'"
                        (click)="valueChange.emit(true)">
                        <i class="pi pi-check text-sm"></i> Sí
                    </button>
                    <button type="button"
                        [class]="value() === false ? 'bool-btn no' : 'bool-btn'"
                        (click)="valueChange.emit(false)">
                        <i class="pi pi-times text-sm"></i> No
                    </button>
                </div>
            }

            @case ('select') {
                <select [class]="showError() ? 'q-select err' : 'q-select'" (change)="onSelect($event)">
                    <option value="">Selecciona una opción...</option>
                    @for (opt of domainOpts(); track opt.id) {
                        <option [value]="opt.value" [selected]="strVal() === opt.value">{{ opt.label }}</option>
                    }
                </select>
                @if (domainOpts().length === 0) {
                    <p class="text-xs text-amber-600 mt-1 italic">Sin opciones configuradas</p>
                }
            }

            @case ('multi-select') {
                <div class="space-y-1 mt-1">
                    @for (opt of domainOpts(); track opt.id) {
                        <label class="cb-wrap">
                            <input type="checkbox"
                                [checked]="isChecked(opt.value)"
                                (change)="toggleMulti(opt.value)" />
                            <span class="text-sm text-gray-700">{{ opt.label }}</span>
                        </label>
                    }
                    @if (domainOpts().length === 0) {
                        <p class="text-xs text-amber-600 italic">Sin opciones configuradas</p>
                    }
                </div>
            }

            @case ('file') {
                <div class="file-zone">
                    <i class="pi pi-upload text-2xl text-gray-300 mb-2 block"></i>
                    <p class="text-sm text-gray-500 font-medium">Haz clic o arrastra un archivo aquí</p>
                    @if (question().config.accept) {
                        <p class="text-xs text-gray-400 mt-1">Tipos permitidos: {{ question().config.accept }}</p>
                    }
                </div>
            }

            @case ('rating') {
                <div class="flex items-center gap-1 mt-1">
                    @for (star of stars(); track star) {
                        <button class="star-btn" type="button"
                            [style.color]="numVal() >= star ? '#f59e0b' : '#d1d5db'"
                            (click)="valueChange.emit(star)">★</button>
                    }
                    @if (numVal() > 0) {
                        <span class="ml-2 text-sm text-gray-500">{{ numVal() }} / {{ question().config.stars ?? 5 }}</span>
                    }
                </div>
            }

            @case ('scale') {
                <div class="mt-1">
                    <div class="flex flex-wrap gap-2">
                        @for (n of scaleNums(); track n) {
                            <button type="button"
                                [class]="numVal() === n ? 'scale-btn on' : 'scale-btn'"
                                (click)="valueChange.emit(n)">{{ n }}</button>
                        }
                    </div>
                    @if (question().config.scaleMinLabel || question().config.scaleMaxLabel) {
                        <div class="flex justify-between mt-1.5">
                            <span class="text-xs text-gray-400">{{ question().config.scaleMinLabel }}</span>
                            <span class="text-xs text-gray-400">{{ question().config.scaleMaxLabel }}</span>
                        </div>
                    }
                </div>
            }

            @case ('matrix') {
                @if ((question().config.matrixRows?.length ?? 0) > 0) {
                    <div class="overflow-x-auto mt-1">
                        <table class="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 w-1/3"></th>
                                    @for (col of question().config.matrixColumns; track col) {
                                        <th class="px-3 py-2 text-center text-xs font-medium text-gray-600">{{ col }}</th>
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                @for (row of question().config.matrixRows; track row) {
                                    <tr class="border-t border-gray-100">
                                        <td class="px-3 py-2.5 text-sm text-gray-700 font-medium">{{ row }}</td>
                                        @for (col of question().config.matrixColumns; track col) {
                                            <td class="px-3 py-2.5 text-center">
                                                <input type="radio" [name]="question().id + '_' + row" class="cursor-pointer" style="accent-color:#3b82f6" />
                                            </td>
                                        }
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                } @else {
                    <p class="text-xs text-gray-400 italic px-3 py-2 border border-dashed border-gray-200 rounded-lg">
                        Matriz no configurada
                    </p>
                }
            }

            @default {
                <input class="q-input" type="text" [value]="strVal()" (input)="onText($event)" placeholder="Respuesta..." />
            }
        }

        @if (showError() && errorMsg()) {
            <p class="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <i class="pi pi-exclamation-circle" style="font-size:0.7rem"></i>
                {{ errorMsg() }}
            </p>
        }
    `
})
export class QuestionRendererComponent {
    readonly question    = input.required<Question>();
    readonly value       = input<AnswerValue>(null);
    readonly showError   = input(false);
    readonly errorMsg    = input<string>('Este campo es requerido');
    readonly valueChange = output<AnswerValue>();

    private readonly fbSvc = inject(FormBuilderService);

    readonly domainOpts = computed(() => {
        const domainId = this.question().config.domainId;
        if (!domainId) return [];
        return this.fbSvc.domains().find(d => d.id === domainId)?.values ?? [];
    });

    readonly stars     = computed(() => Array.from({ length: this.question().config.stars ?? 5 }, (_, i) => i + 1));
    readonly scaleNums = computed(() => {
        const min = this.question().config.scaleMin ?? 1;
        const max = this.question().config.scaleMax ?? 10;
        const arr: number[] = [];
        for (let i = min; i <= max; i++) arr.push(i);
        return arr;
    });

    readonly strVal = computed(() => (this.value() as string) ?? '');
    readonly numVal = computed(() => (this.value() as number) ?? 0);

    onText(e: Event): void   { this.valueChange.emit((e.target as HTMLInputElement).value || null); }
    onDate(e: Event): void   { this.valueChange.emit((e.target as HTMLInputElement).value || null); }
    onSelect(e: Event): void { this.valueChange.emit((e.target as HTMLSelectElement).value || null); }

    onNumber(e: Event): void {
        const v = (e.target as HTMLInputElement).value;
        this.valueChange.emit(v !== '' ? Number(v) : null);
    }

    toggleMulti(opt: string): void {
        const arr = [...((this.value() as string[]) ?? [])];
        const idx = arr.indexOf(opt);
        if (idx === -1) arr.push(opt); else arr.splice(idx, 1);
        this.valueChange.emit(arr.length ? arr : null);
    }

    isChecked(opt: string): boolean {
        return ((this.value() as string[]) ?? []).includes(opt);
    }
}
