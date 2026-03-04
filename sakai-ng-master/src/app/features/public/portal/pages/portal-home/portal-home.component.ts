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
        .workspace-block {
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 1rem;
            padding: 1rem;
        }
    `],
    template: `
        <!-- ── Hero ──────────────────────────────────────────────────────── -->
        <div class="bg-gray-50 border-b border-gray-200">
            <div class="max-w-6xl mx-auto px-6 py-10">
                <div class="text-center mb-6">
                    <h1 class="text-4xl sm:text-5xl font-bold text-[#333333] tracking-tight mb-2">
                        TramiteOnline
                    </h1>
                    <p class="text-lg font-semibold text-[#333333] mb-1">
                        Portal de Tramites Digitales
                    </p>
                    <p class="text-sm text-gray-500">
                        Realiza tus tramites de forma virtual, simple y segura.
                    </p>
                </div>
            </div>
        </div>

        <!-- ── Catálogo ───────────────────────────────────────────────────── -->
        <div id="tramites-disponibles" class="max-w-5xl mx-auto px-6 py-10">
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
                    <section class="workspace-block mb-6 anim-entry" [style.animation-delay]="(idx * 80) + 'ms'">

                        <!-- Workspace header -->
                        <div class="flex items-start gap-3 mb-4 pb-3 border-b border-gray-100">
                            <div class="w-1.5 h-10 rounded-full shrink-0 mt-0.5"
                                [style.background-color]="entry.workspace.color"></div>
                            <div class="pt-0.5">
                                <h2 class="text-base font-bold text-gray-800 leading-tight">{{ entry.workspace.name }}</h2>
                                @if (entry.workspace.description) {
                                    <p class="text-xs text-gray-400 mt-0.5">{{ entry.workspace.description }}</p>
                                }
                            </div>
                            <div class="ml-auto"></div>
                            <span class="inline-flex items-center text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full shrink-0">
                                {{ entry.publishedForms.length }}
                                {{ entry.publishedForms.length === 1 ? 'trámite' : 'trámites' }}
                            </span>
                        </div>

                        <!-- Cards de trámites -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            @for (form of entry.publishedForms; track form.id) {
                                <button type="button"
                                    class="form-card w-full h-full bg-white rounded-2xl border border-gray-100 overflow-hidden text-left cursor-pointer shadow-sm"
                                    (click)="openForm(form)">
                                    <div class="h-1.5" [style.background-color]="entry.workspace.color"></div>
                                    <div class="p-5 flex flex-col items-start text-left gap-2 h-full min-h-[250px]">
                                        <h3 class="text-sm font-bold text-gray-800 leading-snug">{{ form.name }}</h3>
                                        @if (form.description) {
                                            <p class="text-xs text-gray-400 leading-relaxed line-clamp-3 flex-1">{{ form.description }}</p>
                                        } @else {
                                            <div class="flex-1"></div>
                                        }
                                        <span class="inline-flex w-full items-center justify-center gap-2 text-sm font-semibold mt-1 px-3 py-2.5 rounded-xl border"
                                            [style.color]="entry.workspace.color"
                                            [style.border-color]="entry.workspace.color + '55'"
                                            [style.background-color]="entry.workspace.color + '10'">
                                            <i class="pi pi-play text-xs"></i>
                                            Iniciar trámite
                                        </span>
                                    </div>
                                </button>
                            }
                        </div>
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
    readonly totalPublishedForms = computed(() =>
        this.catalog().reduce((acc, entry) => acc + entry.publishedForms.length, 0)
    );
    readonly skeletons = [1, 2, 3, 4, 5, 6];

    ngOnInit(): void {
        this.workspaceSvc.getAll().subscribe(() => this._loading.set(false));
    }

    openForm(form: Form): void {
        this.router.navigate(['/forms', form.id]);
    }
}
