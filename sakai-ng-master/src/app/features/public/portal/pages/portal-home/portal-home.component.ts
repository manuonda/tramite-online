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
        :host {
            display: block;
            background-color: #F5F5F5;
            font-family: 'Inter', system-ui, sans-serif;
        }

        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .anim-entry { animation: fadeUp 0.45s ease both; }

        /* ── Hero institucional ── */
        .hero {
            background: linear-gradient(135deg, #1a3a6b 0%, #1e4d8c 60%, #1565C0 100%);
            border-bottom: 4px solid #0d47a1;
            padding: 3rem 1.5rem 2.5rem;
        }
        .hero__escudo {
            width: 52px;
            height: 52px;
            background: rgba(255,255,255,0.15);
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
        }
        .hero__title {
            font-size: 2rem;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.02em;
            margin: 0 0 0.375rem;
            font-family: 'Montserrat', 'Inter', sans-serif;
        }
        .hero__subtitle {
            font-size: 0.9rem;
            color: rgba(255,255,255,0.78);
            font-weight: 400;
            margin: 0 0 0.25rem;
            letter-spacing: 0.01em;
        }

        /* ── Catálogo ── */
        .catalog {
            max-width: 1140px;
            margin: 0 auto;
            padding: 2.5rem 1.5rem 3.5rem;
        }

        /* ── Workspace block ── */
        .ws-block {
            margin-bottom: 2.5rem;
        }
        .ws-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.25rem;
            padding: 1rem 1.25rem;
            background: #ffffff;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .ws-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            flex-shrink: 0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .ws-info { flex: 1; min-width: 0; }
        .ws-name {
            font-size: 1rem;
            font-weight: 700;
            color: #1e293b;
            letter-spacing: -0.01em;
        }
        .ws-desc {
            font-size: 0.8125rem;
            color: #64748b;
            margin-top: 0.125rem;
        }
        .ws-badge {
            font-size: 0.8125rem;
            font-weight: 600;
            color: #475569;
            background: #f1f5f9;
            border-radius: 999px;
            padding: 0.35rem 0.85rem;
            white-space: nowrap;
            flex-shrink: 0;
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
        }

        /* ── Card ── */
        .form-card {
            background: #ffffff;
            border-radius: 14px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transition: box-shadow 0.25s ease, border-color 0.25s ease, transform 0.2s ease;
            min-height: 240px;
        }
        .form-card:hover {
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            border-color: #cbd5e1;
            transform: translateY(-2px);
        }
        .card-accent {
            height: 5px;
            width: 100%;
        }
        .card-body {
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            flex: 1;
            gap: 0.75rem;
        }
        .card-icon-wrap {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .card-title {
            font-size: 1.0625rem;
            font-weight: 700;
            color: #1e293b;
            line-height: 1.4;
            margin: 0;
        }
        .card-desc {
            font-size: 0.875rem;
            color: #64748b;
            line-height: 1.55;
            flex: 1;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .card-spacer { flex: 1; }

        /* ── Botón ── */
        .btn-tramite {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            width: 100%;
            padding: 0.75rem 1.25rem;
            border-radius: 10px;
            font-size: 0.9375rem;
            font-weight: 600;
            color: #ffffff;
            border: none;
            cursor: pointer;
            letter-spacing: 0.01em;
            transition: filter 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
            margin-top: auto;
        }
        .btn-tramite:hover {
            filter: brightness(1.05);
            box-shadow: 0 4px 14px rgba(0,0,0,0.25);
            transform: translateY(-1px);
        }
        .btn-tramite:focus-visible {
            outline: 2px solid currentColor;
            outline-offset: 2px;
        }
        .btn-tramite .btn-icon {
            font-size: 0.8rem;
            transition: transform 0.2s ease;
        }
        .btn-tramite:hover .btn-icon {
            transform: translateX(4px);
        }

        /* ── Empty state ── */
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 5rem 1rem;
            text-align: center;
        }
        .empty-icon {
            width: 72px;
            height: 72px;
            background: #f1f5f9;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.25rem;
        }

        /* ── Skeleton ── */
        .skeleton-card {
            background: #ffffff;
            border-radius: 14px;
            border: 1px solid #e5e7eb;
            overflow: hidden;
            animation: pulse 1.4s ease-in-out infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.55; }
        }
        .sk { background: #eeeeee; border-radius: 4px; }
    `],
    template: `
        <!-- ── Hero Institucional ─────────────────────────────────────────── -->
        <header class="hero">
            <div style="max-width:800px;margin:0 auto;text-align:center;">
                <div class="hero__escudo">
                    <i class="pi pi-building" style="color:#fff;font-size:1.3rem;"></i>
                </div>
                <h1 class="hero__title">Portal de Trámites Digitales</h1>
                <p class="hero__subtitle">Realizá tus trámites de forma virtual, simple y segura</p>
            </div>
        </header>

        <!-- ── Catálogo ───────────────────────────────────────────────────── -->
        <main id="tramites-disponibles" class="catalog">

            @if (isLoading()) {
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    @for (i of skeletons; track i) {
                        <div class="skeleton-card">
                            <div class="sk" style="height:4px;border-radius:0;"></div>
                            <div style="padding:1.25rem;display:flex;flex-direction:column;gap:0.625rem;">
                                <div class="sk" style="height:13px;width:75%;"></div>
                                <div class="sk" style="height:10px;width:100%;"></div>
                                <div class="sk" style="height:10px;width:85%;"></div>
                                <div class="sk" style="height:10px;width:60%;margin-bottom:0.5rem;"></div>
                                <div class="sk" style="height:36px;width:100%;border-radius:6px;"></div>
                            </div>
                        </div>
                    }
                </div>

            } @else if (catalog().length === 0) {
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="pi pi-inbox" style="color:#9e9e9e;font-size:1.5rem;"></i>
                    </div>
                    <h3 style="font-size:1rem;font-weight:600;color:#424242;margin:0 0 0.25rem;">Sin trámites disponibles</h3>
                    <p style="font-size:0.8rem;color:#9e9e9e;margin:0;">No hay formularios publicados por el momento.</p>
                </div>

            } @else {
                @for (entry of catalog(); track entry.workspace.id; let idx = $index) {
                    <section class="ws-block anim-entry" [style.animation-delay]="(idx * 70) + 'ms'">

                        <!-- Encabezado del organismo -->
                        <div class="ws-header">
                            <div class="ws-icon" [style.background]="'linear-gradient(135deg, ' + (entry.workspace.color || '#1e3a5f') + ' 0%, ' + (entry.workspace.color || '#1e3a5f') + 'cc 100%)'">
                                <i [class]="(entry.workspace.icon || 'pi pi-building') + ' text-lg'"></i>
                            </div>
                            <div class="ws-info">
                                <div class="ws-name">{{ entry.workspace.name }}</div>
                                @if (entry.workspace.description) {
                                    <div class="ws-desc">{{ entry.workspace.description }}</div>
                                }
                            </div>
                            <span class="ws-badge">
                                <i class="pi pi-file-edit text-sm"></i>
                                {{ entry.publishedForms.length }} {{ entry.publishedForms.length === 1 ? 'trámite' : 'trámites' }}
                            </span>
                        </div>

                        <!-- Grid de cards -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            @for (form of entry.publishedForms; track form.id) {
                                <article class="form-card">
                                    <div class="card-accent" [style.background]="'linear-gradient(90deg, ' + (entry.workspace.color || '#1e3a5f') + ', ' + (entry.workspace.color || '#1e3a5f') + 'cc)'"></div>
                                    <div class="card-body">
                                        <div class="flex items-start gap-3">
                                            <div class="card-icon-wrap" [style.background-color]="(entry.workspace.color || '#1e3a5f') + '20'" [style.color]="entry.workspace.color || '#1e3a5f'">
                                                <i class="pi pi-file-edit text-lg"></i>
                                            </div>
                                            <div class="flex-1 min-w-0">
                                                <h2 class="card-title">{{ form.name }}</h2>
                                                @if (form.description) {
                                                    <p class="card-desc">{{ form.description }}</p>
                                                } @else {
                                                    <div class="card-spacer"></div>
                                                }
                                            </div>
                                        </div>
                                        <button type="button" class="btn-tramite"
                                            [style.background]="'linear-gradient(135deg, ' + (entry.workspace.color || '#1e3a5f') + ' 0%, ' + (entry.workspace.color || '#1e3a5f') + 'cc 100%)'"
                                            [style.box-shadow]="'0 4px 12px ' + (entry.workspace.color || '#1e3a5f') + '40'"
                                            (click)="openForm(form)">
                                            <i class="pi pi-arrow-right btn-icon"></i>
                                            Iniciar trámite
                                        </button>
                                    </div>
                                </article>
                            }
                        </div>
                    </section>
                }
            }
        </main>
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
