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
            min-height: 100vh;
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
            max-width: 1100px;
            margin: 0 auto;
            padding: 2rem 1.5rem 3rem;
        }

        /* ── Workspace block ── */
        .ws-block {
            margin-bottom: 2rem;
        }
        .ws-header {
            display: flex;
            align-items: center;
            gap: 0.625rem;
            margin-bottom: 1rem;
            padding-bottom: 0.625rem;
            border-bottom: 1px solid #e0e0e0;
        }
        .ws-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            flex-shrink: 0;
        }
        .ws-name {
            font-size: 0.9375rem;
            font-weight: 700;
            color: #1a3a6b;
            letter-spacing: 0.01em;
            text-transform: uppercase;
        }
        .ws-desc {
            font-size: 0.8rem;
            color: #9e9e9e;
            margin-left: 0.25rem;
        }
        .ws-badge {
            margin-left: auto;
            font-size: 0.75rem;
            font-weight: 600;
            color: #616161;
            background: #eeeeee;
            border-radius: 999px;
            padding: 0.15rem 0.6rem;
            white-space: nowrap;
            flex-shrink: 0;
        }

        /* ── Card ── */
        .form-card {
            background: #ffffff;
            border-radius: 10px;
            border: 1px solid #e8e8e8;
            box-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transition: box-shadow 0.2s ease, border-color 0.2s ease;
            min-height: 220px;
        }
        .form-card:hover {
            box-shadow: 0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06);
            border-color: #bdbdbd;
        }
        .card-accent {
            height: 4px;
            width: 100%;
        }
        .card-body {
            padding: 1.25rem 1.25rem 1rem;
            display: flex;
            flex-direction: column;
            flex: 1;
            gap: 0.5rem;
        }
        .card-title {
            font-size: 1rem;
            font-weight: 700;
            color: #212121;
            line-height: 1.35;
            margin: 0;
        }
        .card-desc {
            font-size: 0.8125rem;
            color: #757575;
            line-height: 1.55;
            flex: 1;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .card-spacer { flex: 1; }

        /* ── Botón institucional ── */
        .btn-tramite {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
            width: 100%;
            padding: 0.7rem 1.25rem;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 600;
            color: #ffffff;
            border: none;
            cursor: pointer;
            letter-spacing: 0.02em;
            transition: filter 0.18s ease, box-shadow 0.18s ease;
            margin-top: 0.75rem;
        }
        .btn-tramite:hover {
            filter: brightness(0.85);
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        }
        .btn-tramite:focus-visible {
            outline: 2px solid currentColor;
            outline-offset: 2px;
        }
        .btn-tramite .btn-icon {
            font-size: 0.7rem;
            transition: transform 0.18s ease;
        }
        .btn-tramite:hover .btn-icon {
            transform: translateX(3px);
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
            width: 60px;
            height: 60px;
            background: #eeeeee;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
        }

        /* ── Skeleton ── */
        .skeleton-card {
            background: #ffffff;
            border-radius: 10px;
            border: 1px solid #e8e8e8;
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
                            <span class="ws-dot" [style.background-color]="entry.workspace.color"></span>
                            <span class="ws-name">{{ entry.workspace.name }}</span>
                            @if (entry.workspace.description) {
                                <span class="ws-desc">— {{ entry.workspace.description }}</span>
                            }
                            <span class="ws-badge">
                                {{ entry.publishedForms.length }} {{ entry.publishedForms.length === 1 ? 'trámite' : 'trámites' }}
                            </span>
                        </div>

                        <!-- Grid de cards -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            @for (form of entry.publishedForms; track form.id) {
                                <article class="form-card">
                                    <div class="card-accent" [style.background-color]="entry.workspace.color"></div>
                                    <div class="card-body">
                                        <h2 class="card-title">{{ form.name }}</h2>
                                        @if (form.description) {
                                            <p class="card-desc">{{ form.description }}</p>
                                        } @else {
                                            <div class="card-spacer"></div>
                                        }
                                        <button type="button" class="btn-tramite"
                                            [style.background-color]="entry.workspace.color"
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
