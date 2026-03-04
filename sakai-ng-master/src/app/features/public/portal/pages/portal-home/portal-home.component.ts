import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { WorkspaceService } from '@features/admin/workspace/services/workspace.service';
import { PublicFormService, WorkspaceCatalogEntry } from '../../services/public-form.service';
import { Form } from '@features/admin/workspace/features/form-builder/models/form-builder.models';

@Component({
    selector: 'app-portal-home',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule],
    styles: [`
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .anim-entry { animation: fadeUp 0.4s ease both; }
        .form-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .form-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px -4px rgba(0,0,0,0.12); }
    `],
    template: `
        <!-- ── Hero ──────────────────────────────────────────────────────── -->
        <div class="bg-white border-b border-gray-100">
            <div class="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center gap-6">
                <div class="flex-1">
                    <p class="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-2">Portal de Trámites</p>
                    <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3">
                        Realizá tus trámites<br class="hidden sm:block" /> sin filas ni esperas
                    </h1>
                    <p class="text-gray-500 text-base leading-relaxed max-w-md">
                        Accedé a todos los servicios municipales de forma digital, simple y segura.
                    </p>
                </div>
                <div class="shrink-0">
                    <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center shadow-xl">
                        <i class="pi pi-building text-white" style="font-size:2.75rem"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── Catálogo ───────────────────────────────────────────────────── -->
        <div class="max-w-5xl mx-auto px-6 py-10">

            @if (isLoading()) {
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    @for (i of skeletons; track i) {
                        <div class="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                            <div class="w-14 h-14 bg-gray-200 rounded-2xl mx-auto mb-4"></div>
                            <div class="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                            <div class="h-3 bg-gray-100 rounded w-1/2 mx-auto"></div>
                        </div>
                    }
                </div>

            } @else if (catalog().length === 0) {
                <div class="flex flex-col items-center justify-center py-24 text-center">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                        <i class="pi pi-inbox text-gray-400 text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-700 mb-1">Sin trámites disponibles</h3>
                    <p class="text-sm text-gray-400">No hay formularios publicados por el momento.</p>
                </div>

            } @else {
                @for (entry of catalog(); track entry.workspace.id; let idx = $index) {
                    <section class="mb-10 anim-entry" [style.animation-delay]="(idx * 80) + 'ms'">

                        <!-- Workspace header -->
                        <div class="flex items-center gap-3 mb-5">
                            <div class="flex w-9 h-9 items-center justify-center rounded-xl shrink-0"
                                [style.background-color]="entry.workspace.color + '22'"
                                [style.color]="entry.workspace.color">
                                <i [class]="entry.workspace.icon + ' text-base'"></i>
                            </div>
                            <div>
                                <h2 class="text-base font-bold text-gray-800 leading-tight">{{ entry.workspace.name }}</h2>
                                @if (entry.workspace.description) {
                                    <p class="text-xs text-gray-400 mt-0.5">{{ entry.workspace.description }}</p>
                                }
                            </div>
                            <div class="ml-auto h-px flex-1 bg-gray-100 hidden sm:block"></div>
                            <span class="text-xs text-gray-400 shrink-0">
                                {{ entry.publishedForms.length }}
                                {{ entry.publishedForms.length === 1 ? 'trámite' : 'trámites' }}
                            </span>
                        </div>

                        <!-- Single form → centered -->
                        @if (entry.publishedForms.length === 1) {
                            <div class="flex justify-center">
                                <div class="w-full max-w-xs">
                                    <button type="button"
                                        class="form-card w-full bg-white rounded-2xl border border-gray-100 overflow-hidden text-left cursor-pointer shadow-sm"
                                        (click)="openForm(entry.publishedForms[0])">
                                        <div class="h-1.5" [style.background-color]="entry.workspace.color"></div>
                                        <div class="p-6 flex flex-col items-center text-center gap-3">
                                            <div class="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm"
                                                [style.background-color]="entry.workspace.color + '18'"
                                                [style.color]="entry.workspace.color">
                                                <i [class]="entry.workspace.icon + ' text-2xl'"></i>
                                            </div>
                                            <h3 class="text-sm font-bold text-gray-800 leading-snug">{{ entry.publishedForms[0].name }}</h3>
                                            @if (entry.publishedForms[0].description) {
                                                <p class="text-xs text-gray-400 leading-relaxed line-clamp-2">{{ entry.publishedForms[0].description }}</p>
                                            }
                                            <span class="inline-flex items-center gap-1.5 text-xs font-semibold mt-1 px-4 py-2 rounded-full"
                                                [style.background-color]="entry.workspace.color + '15'"
                                                [style.color]="entry.workspace.color">
                                                <i class="pi pi-arrow-right text-xs"></i>
                                                Iniciar trámite
                                            </span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        } @else {
                            <!-- Multiple forms → grid -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                @for (form of entry.publishedForms; track form.id) {
                                    <button type="button"
                                        class="form-card w-full bg-white rounded-2xl border border-gray-100 overflow-hidden text-left cursor-pointer shadow-sm"
                                        (click)="openForm(form)">
                                        <div class="h-1.5" [style.background-color]="entry.workspace.color"></div>
                                        <div class="p-6 flex flex-col items-center text-center gap-3">
                                            <div class="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm"
                                                [style.background-color]="entry.workspace.color + '18'"
                                                [style.color]="entry.workspace.color">
                                                <i [class]="entry.workspace.icon + ' text-2xl'"></i>
                                            </div>
                                            <h3 class="text-sm font-bold text-gray-800 leading-snug">{{ form.name }}</h3>
                                            @if (form.description) {
                                                <p class="text-xs text-gray-400 leading-relaxed line-clamp-2">{{ form.description }}</p>
                                            }
                                            <span class="inline-flex items-center gap-1.5 text-xs font-semibold mt-1 px-4 py-2 rounded-full"
                                                [style.background-color]="entry.workspace.color + '15'"
                                                [style.color]="entry.workspace.color">
                                                <i class="pi pi-arrow-right text-xs"></i>
                                                Iniciar trámite
                                            </span>
                                        </div>
                                    </button>
                                }
                            </div>
                        }
                    </section>
                }
            }
        </div>
    `
})
export class PortalHomeComponent implements OnInit {
    private readonly workspaceSvc  = inject(WorkspaceService);
    private readonly publicFormSvc = inject(PublicFormService);
    private readonly router        = inject(Router);

    private readonly _loading = signal(true);
    readonly isLoading = this._loading.asReadonly();
    readonly catalog = computed<WorkspaceCatalogEntry[]>(() => this.publicFormSvc.getPublicCatalog());
    readonly skeletons = [1, 2, 3, 4, 5, 6];

    ngOnInit(): void {
        this.workspaceSvc.getAll().subscribe(() => this._loading.set(false));
    }

    openForm(form: Form): void {
        this.router.navigate(['/forms', form.id]);
    }
}
