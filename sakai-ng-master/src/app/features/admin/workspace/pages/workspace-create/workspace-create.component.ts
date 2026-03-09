import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
    selector: 'app-workspace-create',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService],
    imports: [
        RouterModule, ReactiveFormsModule,
        BreadcrumbModule, ButtonModule, InputTextModule, TextareaModule, ToastModule
    ],
    template: `
        <!-- Breadcrumb -->
        <div class="mb-6">
            <div class="bg-gray-50 dark:bg-surface-800 rounded-lg p-3 border border-gray-200 dark:border-surface-700 shadow-sm">
                <p-breadcrumb [model]="breadcrumbItems" [home]="home"
                    [style]="{'background': 'transparent', 'border': 'none', 'padding': '0'}" />
            </div>
        </div>

        <div class="max-w-2xl mx-auto">
            <div class="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-surface-700 overflow-hidden">

                <!-- Header azul -->
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-8">
                    <div class="flex items-center gap-4">
                        <div class="bg-white/10 backdrop-blur-sm rounded-full p-3">
                            <i class="pi pi-plus-circle text-3xl text-white"></i>
                        </div>
                        <div>
                            <h1 class="text-2xl font-bold text-white mb-1">Nuevo Workspace</h1>
                            <p class="text-blue-100 text-sm">Creá un nuevo espacio de trabajo</p>
                        </div>
                    </div>
                </div>

                <!-- Formulario -->
                <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-8">

                    <!-- Nombre -->
                    <div class="flex flex-col mb-5 gap-2">
                        <label for="name" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nombre <span class="text-red-500">*</span>
                        </label>
                        <input id="name" pInputText formControlName="name" class="w-full"
                            placeholder="Ej: Secretaría de Obras"
                            (input)="autoSlug()"
                            [class.ng-invalid]="form.controls.name.invalid && form.controls.name.touched"
                            [class.ng-dirty]="form.controls.name.touched" />
                        @if (form.controls.name.invalid && form.controls.name.touched) {
                            <small class="text-red-500 flex items-center gap-1">
                                <i class="pi pi-exclamation-triangle text-xs"></i>
                                El nombre es requerido
                            </small>
                        }
                    </div>

                    <!-- Slug -->
                    <div class="flex flex-col mb-5 gap-2">
                        <label for="slug" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Slug <span class="text-red-500">*</span>
                            <span class="text-xs text-gray-400 ml-2">(generado automáticamente, editable)</span>
                        </label>
                        <input id="slug" pInputText formControlName="slug" class="w-full font-mono"
                            placeholder="ej: secretaria-obras"
                            [class.ng-invalid]="form.controls.slug.invalid && form.controls.slug.touched"
                            [class.ng-dirty]="form.controls.slug.touched" />
                        @if (form.controls.slug.invalid && form.controls.slug.touched) {
                            <small class="text-red-500 flex items-center gap-1">
                                <i class="pi pi-exclamation-triangle text-xs"></i>
                                El slug es requerido
                            </small>
                        }
                    </div>

                    <!-- Descripción -->
                    <div class="flex flex-col mb-6 gap-2">
                        <label for="description" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Descripción <span class="text-gray-400 text-xs">(opcional)</span>
                        </label>
                        <textarea id="description" pTextarea formControlName="description" class="w-full"
                            placeholder="Descripción del workspace..." rows="3"></textarea>
                    </div>

                    <!-- Error general -->
                    @if (errorMessage()) {
                        <div class="mb-5">
                            <div class="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 p-4 rounded-lg">
                                <p class="text-red-800 dark:text-red-300 text-sm font-medium flex items-center gap-2">
                                    <i class="pi pi-times-circle"></i>{{ errorMessage() }}
                                </p>
                            </div>
                        </div>
                    }

                    <!-- Botones -->
                    <div class="flex gap-3">
                        <p-button type="submit" label="Crear Workspace" icon="pi pi-check"
                            [loading]="isSaving()" [disabled]="form.invalid"
                            styleClass="flex-1 justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 font-semibold shadow-lg" />
                        <p-button type="button" label="Cancelar" icon="pi pi-times"
                            severity="secondary" [outlined]="true"
                            routerLink="/admin/workspaces"
                            styleClass="flex-1 justify-center" />
                    </div>
                </form>
            </div>
        </div>

        <p-toast />
    `
})
export class WorkspaceCreateComponent {
    private readonly fb = inject(FormBuilder);
    private readonly workspaceService = inject(WorkspaceService);
    private readonly router = inject(Router);
    private readonly messageService = inject(MessageService);

    readonly isSaving = signal(false);
    readonly errorMessage = signal<string | null>(null);

    readonly home: MenuItem = { icon: 'pi pi-home', routerLink: '/admin/dashboard' };
    readonly breadcrumbItems: MenuItem[] = [
        { label: 'Admin', routerLink: '/admin/dashboard' },
        { label: 'Espacios de Trabajo', routerLink: '/admin/workspaces' },
        { label: 'Nuevo Workspace' }
    ];

    readonly form = this.fb.nonNullable.group({
        name: ['', Validators.required],
        slug: ['', Validators.required],
        description: ['']
    });

    autoSlug(): void {
        const name = this.form.controls.name.value;
        const slug = name
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
        this.form.controls.slug.setValue(slug, { emitEvent: false });
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.isSaving.set(true);
        this.errorMessage.set(null);
        const { name, slug, description } = this.form.getRawValue();

        this.workspaceService.create({ name, slug, description, color: '#0ea5e9', icon: 'pi pi-folder-open' }).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success', summary: 'Creado', detail: `Workspace "${name}" creado exitosamente.`
                });
                setTimeout(() => this.router.navigate(['/admin/workspaces']), 800);
            },
            error: () => {
                this.isSaving.set(false);
                this.errorMessage.set('No se pudo crear el workspace. Intentá de nuevo.');
            }
        });
    }
}
