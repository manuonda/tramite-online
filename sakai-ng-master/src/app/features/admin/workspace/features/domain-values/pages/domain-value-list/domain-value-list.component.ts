import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { Domain, DomainValue } from '../../../../features/form-builder/models/form-builder.models';
import { FormBuilderService } from '../../../../features/form-builder/services/form-builder.service';

@Component({
    selector: 'app-domain-value-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService, ConfirmationService],
    imports: [
        FormsModule, ReactiveFormsModule,
        ButtonModule, DialogModule, InputTextModule, TextareaModule,
        ToastModule, ConfirmDialogModule, TooltipModule
    ],
    styles: [`
        .domain-item {
            cursor: pointer;
            border-radius: 0.625rem;
            border: 1.5px solid #e5e7eb;
            padding: 0.75rem;
            background: white;
            transition: all 0.15s;
            display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
        }
        :host-context(.dark) .domain-item {
            background: var(--surface-900);
            border-color: var(--surface-700);
        }
        .domain-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
        .domain-item.selected {
            border-color: #3b82f6;
            background: #eff6ff;
            box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        :host-context(.dark) .domain-item.selected {
            background: rgba(59,130,246,0.1);
        }
        .value-table th {
            padding: 0.625rem 1rem;
            text-align: left;
            font-size: 0.75rem;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1.5px solid #e5e7eb;
        }
        :host-context(.dark) .value-table th { color: #9ca3af; border-bottom-color: var(--surface-700); }
        .value-table td {
            padding: 0.625rem 1rem;
            font-size: 0.875rem;
            color: #374151;
            border-bottom: 1px solid #f3f4f6;
            vertical-align: middle;
        }
        :host-context(.dark) .value-table td { color: #e5e7eb; border-bottom-color: var(--surface-800); }
        .value-table tr:last-child td { border-bottom: none; }
        .value-table tr:hover td { background: #fafafa; }
        :host-context(.dark) .value-table tr:hover td { background: var(--surface-800); }
        .inline-input-cell {
            border: 1.5px solid #3b82f6;
            border-radius: 0.375rem;
            padding: 0.25rem 0.5rem;
            width: 100%;
            font-size: 0.875rem;
            outline: none;
            background: white;
        }
        :host-context(.dark) .inline-input-cell { background: var(--surface-900); color: white; }
        .new-row-input {
            border: 1.5px solid #e5e7eb;
            border-radius: 0.375rem;
            padding: 0.375rem 0.625rem;
            width: 100%;
            font-size: 0.8125rem;
            outline: none;
            background: white;
            transition: border-color 0.15s;
        }
        :host-context(.dark) .new-row-input { background: var(--surface-900); color: white; border-color: var(--surface-600); }
        .new-row-input:focus { border-color: #3b82f6; }
        code.val { background: #f1f5f9; color: #475569; border-radius: 4px; padding: 0.125rem 0.5rem; font-size: 0.75rem; font-family: monospace; }
        :host-context(.dark) code.val { background: var(--surface-800); color: #94a3b8; }
    `],
    template: `
        <!-- Page Header -->
        <div class="flex items-start justify-between mb-6">
            <div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Valores de Dominio</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Gestiona los conjuntos de valores reutilizables para tus formularios
                </p>
            </div>
            <button
                class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                (click)="openCreate()">
                <i class="pi pi-plus text-xs"></i>
                Nuevo Dominio
            </button>
        </div>

        <!-- Master-Detail Layout -->
        <div class="grid gap-5 lg:grid-cols-[300px_1fr]">

            <!-- ── Left: Domain List ──────────────────────────────── -->
            <div class="space-y-2">
                @for (domain of domains(); track domain.id) {
                    <div class="domain-item"
                        [class.selected]="selectedDomainId() === domain.id"
                        (click)="selectDomain(domain.id)">
                        <div class="flex items-center gap-3 min-w-0">
                            <div class="flex w-9 h-9 items-center justify-center rounded-lg shrink-0"
                                [class]="selectedDomainId() === domain.id
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-gray-100 dark:bg-surface-800 text-gray-400'">
                                <i class="pi pi-database text-sm"></i>
                            </div>
                            <div class="min-w-0">
                                <p class="text-sm font-semibold text-gray-800 dark:text-white truncate">{{ domain.name }}</p>
                                <p class="text-xs text-gray-400">{{ domain.values.length }} valores</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-0.5 shrink-0"
                            (click)="$event.stopPropagation()">
                            <button class="w-7 h-7 flex items-center justify-center rounded-md text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 transition-colors"
                                pTooltip="Editar" tooltipPosition="top"
                                (click)="openEdit(domain)">
                                <i class="pi pi-pencil text-xs"></i>
                            </button>
                            <button class="w-7 h-7 flex items-center justify-center rounded-md text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 transition-colors"
                                pTooltip="Eliminar" tooltipPosition="top"
                                (click)="confirmDelete(domain)">
                                <i class="pi pi-trash text-xs"></i>
                            </button>
                        </div>
                    </div>
                }
                @if (domains().length === 0) {
                    <div class="rounded-xl border-2 border-dashed border-gray-200 dark:border-surface-700 py-10 text-center">
                        <i class="pi pi-database text-gray-300 text-2xl mb-2 block"></i>
                        <p class="text-sm text-gray-400">No hay dominios creados</p>
                    </div>
                }
            </div>

            <!-- ── Right: Domain Values ───────────────────────────── -->
            <div class="bg-white dark:bg-surface-900 rounded-xl border border-gray-200 dark:border-surface-700 overflow-hidden">
                @if (!selectedDomain()) {
                    <div class="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8">
                        <div class="w-12 h-12 bg-gray-100 dark:bg-surface-800 rounded-full flex items-center justify-center mb-3">
                            <i class="pi pi-database text-gray-400 text-xl"></i>
                        </div>
                        <p class="text-sm text-gray-400">Selecciona un dominio para ver y editar sus valores</p>
                    </div>
                } @else {
                    <!-- Domain detail header -->
                    <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-surface-700">
                        <div>
                            <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ selectedDomain()!.name }}</h3>
                            @if (selectedDomain()!.description) {
                                <p class="text-xs text-gray-400 mt-0.5">{{ selectedDomain()!.description }}</p>
                            }
                        </div>
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-surface-800 text-gray-500 dark:text-gray-400">
                            {{ selectedDomain()!.values.length }} valores
                        </span>
                    </div>

                    <!-- Values table -->
                    <div class="overflow-x-auto">
                        <table class="value-table w-full">
                            <thead>
                                <tr>
                                    <th>Etiqueta</th>
                                    <th>Valor</th>
                                    <th class="w-24">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                @for (val of selectedDomain()!.values; track val.id) {
                                    <tr>
                                        @if (editingValueId() === val.id) {
                                            <td>
                                                <input class="inline-input-cell"
                                                    [ngModel]="editLabel()"
                                                    (ngModelChange)="editLabel.set($event)"
                                                    (keydown.enter)="saveValueEdit(val.id)"
                                                    (keydown.escape)="cancelEdit()"
                                                    autofocus />
                                            </td>
                                            <td>
                                                <input class="inline-input-cell"
                                                    [ngModel]="editValue()"
                                                    (ngModelChange)="editValue.set($event)"
                                                    (keydown.enter)="saveValueEdit(val.id)"
                                                    (keydown.escape)="cancelEdit()" />
                                            </td>
                                            <td>
                                                <div class="flex items-center gap-1">
                                                    <button class="w-7 h-7 flex items-center justify-center rounded-md hover:bg-green-50 dark:hover:bg-green-950 text-green-600"
                                                        pTooltip="Guardar" (click)="saveValueEdit(val.id)">
                                                        <i class="pi pi-check text-xs"></i>
                                                    </button>
                                                    <button class="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-surface-700 text-gray-400"
                                                        pTooltip="Cancelar" (click)="cancelEdit()">
                                                        <i class="pi pi-times text-xs"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        } @else {
                                            <td class="text-gray-800 dark:text-gray-200">{{ val.label }}</td>
                                            <td><code class="val">{{ val.value }}</code></td>
                                            <td>
                                                <div class="flex items-center gap-1">
                                                    <button class="w-7 h-7 flex items-center justify-center rounded-md text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 transition-colors"
                                                        pTooltip="Editar" (click)="startEdit(val)">
                                                        <i class="pi pi-pencil text-xs"></i>
                                                    </button>
                                                    <button class="w-7 h-7 flex items-center justify-center rounded-md text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 transition-colors"
                                                        pTooltip="Eliminar" (click)="deleteValue(val)">
                                                        <i class="pi pi-trash text-xs"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        }
                                    </tr>
                                }

                                <!-- Add new value row -->
                                <tr class="bg-gray-50 dark:bg-surface-800/50">
                                    <td>
                                        <input class="new-row-input"
                                            [ngModel]="newLabel()"
                                            (ngModelChange)="newLabel.set($event)"
                                            placeholder="Nueva etiqueta..."
                                            (keydown.enter)="addValue()" />
                                    </td>
                                    <td>
                                        <input class="new-row-input"
                                            [ngModel]="newValue()"
                                            (ngModelChange)="newValue.set($event)"
                                            placeholder="Nuevo valor..."
                                            (keydown.enter)="addValue()" />
                                    </td>
                                    <td>
                                        <button
                                            class="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
                                            [class]="canAddValue() ? 'hover:bg-blue-50 text-blue-600' : 'text-gray-300 cursor-not-allowed'"
                                            [disabled]="!canAddValue()"
                                            pTooltip="Agregar valor"
                                            (click)="addValue()">
                                            <i class="pi pi-plus text-xs"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                }
            </div>
        </div>

        <!-- ── Create / Edit Domain Dialog ───────────────────────── -->
        <p-dialog
            [(visible)]="dialogVisible"
            [header]="editingDomain() ? 'Editar Dominio' : 'Nuevo Dominio'"
            [modal]="true"
            [draggable]="false"
            [resizable]="false"
            styleClass="w-full max-w-md"
            (onHide)="resetDialog()">

            <form [formGroup]="dlgForm" class="space-y-4 mt-2">
                <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nombre <span class="text-red-500">*</span>
                    </label>
                    <input pInputText formControlName="name"
                        placeholder="Ej: Nivel de Satisfacción"
                        class="w-full" />
                    @if (dlgForm.controls.name.invalid && dlgForm.controls.name.touched) {
                        <small class="text-red-500 text-xs">El nombre es requerido</small>
                    }
                </div>
                <div class="flex flex-col gap-1.5">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Descripción <span class="text-gray-400 text-xs">(opcional)</span>
                    </label>
                    <textarea pTextarea formControlName="description"
                        placeholder="Describe el uso del dominio..."
                        rows="2" class="w-full text-sm"></textarea>
                </div>
            </form>

            <ng-template pTemplate="footer">
                <div class="flex gap-2 justify-end">
                    <button type="button"
                        class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-surface-600 rounded-lg hover:bg-gray-50 dark:hover:bg-surface-800 transition-colors"
                        (click)="dialogVisible = false">
                        Cancelar
                    </button>
                    <button type="button"
                        class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                        [disabled]="dlgForm.invalid"
                        (click)="saveDomain()">
                        {{ editingDomain() ? 'Guardar' : 'Crear' }}
                    </button>
                </div>
            </ng-template>
        </p-dialog>

        <p-toast />
        <p-confirmDialog />
    `
})
export class DomainValueListComponent {
    private readonly fbService = inject(FormBuilderService);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly fb = inject(FormBuilder);

    readonly domains = this.fbService.domains;
    readonly selectedDomainId = signal<string | null>(
        this.fbService.domains().length > 0 ? this.fbService.domains()[0].id : null
    );
    readonly selectedDomain = computed(() =>
        this.domains().find(d => d.id === this.selectedDomainId()) ?? null
    );

    // Editing state
    readonly editingDomain = signal<Domain | null>(null);
    dialogVisible = false;

    readonly editingValueId = signal<string | null>(null);
    readonly editLabel = signal('');
    readonly editValue = signal('');
    readonly newLabel = signal('');
    readonly newValue = signal('');

    readonly canAddValue = computed(() =>
        !!this.newLabel().trim() && !!this.newValue().trim() && !!this.selectedDomainId()
    );

    readonly dlgForm = this.fb.nonNullable.group({
        name:        ['', Validators.required],
        description: ['']
    });

    selectDomain(id: string): void {
        this.selectedDomainId.set(id);
        this.cancelEdit();
    }

    // ── Domain CRUD ────────────────────────────────────────────────────────────

    openCreate(): void {
        this.editingDomain.set(null);
        this.dlgForm.reset({ name: '', description: '' });
        this.dialogVisible = true;
    }

    openEdit(domain: Domain): void {
        this.editingDomain.set(domain);
        this.dlgForm.reset({ name: domain.name, description: domain.description ?? '' });
        this.dialogVisible = true;
    }

    resetDialog(): void {
        this.editingDomain.set(null);
    }

    saveDomain(): void {
        if (this.dlgForm.invalid) { this.dlgForm.markAllAsTouched(); return; }
        const { name, description } = this.dlgForm.getRawValue();
        const editing = this.editingDomain();
        if (editing) {
            this.fbService.updateDomain(editing.id, { name, description: description || undefined });
            this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: `Dominio "${name}" actualizado.` });
        } else {
            const id = this.fbService.addDomain(name, description || undefined);
            this.selectedDomainId.set(id);
            this.messageService.add({ severity: 'success', summary: 'Creado', detail: `Dominio "${name}" creado.` });
        }
        this.dialogVisible = false;
    }

    confirmDelete(domain: Domain): void {
        this.confirmationService.confirm({
            message: `¿Eliminar el dominio <strong>${domain.name}</strong> y todos sus valores?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.fbService.deleteDomain(domain.id);
                if (this.selectedDomainId() === domain.id) {
                    const remaining = this.domains();
                    this.selectedDomainId.set(remaining.length > 0 ? remaining[0].id : null);
                }
                this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: `"${domain.name}" eliminado.` });
            }
        });
    }

    // ── Value CRUD ─────────────────────────────────────────────────────────────

    addValue(): void {
        if (!this.canAddValue()) return;
        this.fbService.addDomainValue(this.selectedDomainId()!, this.newLabel().trim(), this.newValue().trim());
        this.messageService.add({ severity: 'success', summary: 'Valor agregado', detail: `"${this.newLabel()}" agregado.` });
        this.newLabel.set('');
        this.newValue.set('');
    }

    startEdit(val: DomainValue): void {
        this.editingValueId.set(val.id);
        this.editLabel.set(val.label);
        this.editValue.set(val.value);
    }

    saveValueEdit(valueId: string): void {
        if (!this.editLabel().trim() || !this.editValue().trim()) return;
        this.fbService.updateDomainValue(this.selectedDomainId()!, valueId, {
            label: this.editLabel().trim(),
            value: this.editValue().trim()
        });
        this.editingValueId.set(null);
        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Valor actualizado.' });
    }

    cancelEdit(): void {
        this.editingValueId.set(null);
    }

    deleteValue(val: DomainValue): void {
        this.fbService.deleteDomainValue(this.selectedDomainId()!, val.id);
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: `"${val.label}" eliminado.` });
    }
}
