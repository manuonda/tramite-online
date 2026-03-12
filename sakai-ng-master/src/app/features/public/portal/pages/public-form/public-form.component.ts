import {
    ChangeDetectionStrategy, Component, computed, inject,
    input, OnInit, signal
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { WorkspaceService } from '@features/admin/workspace/services/workspace.service';
import { PublicFormService } from '../../services/public-form.service';
import { AnswerChangeEvent, AnswerMap, FormLayoutMode } from '../../models/portal.model';
import { Section } from '@features/admin/workspace/features/form-builder/models/form-builder.models';

const PAYMENT_SECTION_ID = '__payment__';
import { StepperHorizontalComponent } from './components/stepper-horizontal/stepper-horizontal.component';
import { StepperVerticalComponent } from './components/stepper-vertical/stepper-vertical.component';

@Component({
    selector: 'app-public-form',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule, StepperHorizontalComponent, StepperVerticalComponent],
    styles: [`
        :host { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease both; }
    `],
    template: `
        <!-- Loading -->
        @if (isLoading()) {
            <div class="flex items-center justify-center py-32">
                <div class="flex flex-col items-center gap-3 text-gray-400">
                    <i class="pi pi-spin pi-spinner text-3xl"></i>
                    <p class="text-sm">Cargando formulario...</p>
                </div>
            </div>

        <!-- Not found -->
        } @else if (!formData()) {
            <div class="max-w-md mx-auto text-center py-24 px-6">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="pi pi-file-excel text-2xl text-gray-400"></i>
                </div>
                <h2 class="text-xl font-bold text-gray-800 mb-2">Formulario no encontrado</h2>
                <p class="text-gray-500 text-sm mb-6">
                    El trámite que buscás no existe o ya no está disponible.
                </p>
                <a routerLink="/home"
                    class="inline-flex items-center gap-2 text-sm font-semibold no-underline px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                    <i class="pi pi-arrow-left text-xs"></i>
                    Volver al inicio
                </a>
            </div>

        <!-- Form wizard -->
        } @else {
            <div class="fade-in">

                <!-- ── Form header (breadcrumb) ─────────────────────────────────── -->
                <div class="border-b border-gray-100 bg-white">
                    <div class="max-w-4xl mx-auto px-6 py-2.5">
                        <div class="flex items-center gap-2.5">
                            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                [style.background-color]="workspace()!.color + '20'"
                                [style.color]="workspace()!.color">
                                <i [class]="workspace()!.icon + ' text-sm'"></i>
                            </div>
                            <nav class="flex items-center gap-1.5 text-sm min-w-0 flex-1">
                                <span class="text-gray-500 truncate">{{ workspace()!.name }}</span>
                                <i class="pi pi-chevron-right text-[10px] text-gray-400 shrink-0"></i>
                                <span class="font-semibold text-gray-900 truncate">{{ form()!.name }}</span>
                            </nav>
                        </div>
                    </div>
                </div>

                <!-- ── Card: nombre + barra de progreso ──────────────────────────── -->
                <div class="max-w-4xl mx-auto px-6 pt-4 pb-4">
                    <div class="rounded-xl border border-gray-200 shadow-sm px-5 py-4" style="background-color: #c8d0da !important;">
                        <h1 class="text-base font-semibold text-gray-900 mb-3">{{ form()!.name }}</h1>
                        <div class="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div class="h-full rounded-full transition-all duration-500"
                                [style.background-color]="workspace()!.color"
                                [style.width]="progressPct() + '%'"></div>
                        </div>
                    </div>
                </div>

                <!-- ── Wizard body ─────────────────────────────────────────────── -->
                <div class="max-w-4xl mx-auto px-6 py-4">
                    <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                        @if (layoutMode() === 'horizontal') {
                            <div class="p-8">
                                <app-stepper-horizontal
                                    [sections]="sectionsWithPayment()"
                                    [currentIndex]="currentIndex()"
                                    [answers]="answers()"
                                    [errors]="errors()"
                                    [accentColor]="workspace()!.color"
                                    [isSubmitting]="isSubmitting()"
                                    (answerChange)="onAnswerChange($event)"
                                    (next)="onNext()"
                                    (prev)="onPrev()"
                                    (submit)="onSubmit()" />
                            </div>
                        } @else {
                            <app-stepper-vertical
                                [sections]="sectionsWithPayment()"
                                [currentIndex]="currentIndex()"
                                [answers]="answers()"
                                [errors]="errors()"
                                [accentColor]="workspace()!.color"
                                [isSubmitting]="isSubmitting()"
                                (answerChange)="onAnswerChange($event)"
                                (next)="onNext()"
                                (prev)="onPrev()"
                                (submit)="onSubmit()"
                                (goTo)="currentIndex.set($event)" />
                        }
                    </div>
                </div>
            </div>
        }
    `
})
export class PublicFormComponent implements OnInit {
    /** Bound via withComponentInputBinding() from route param :formId */
    readonly formId = input<string>('');

    private readonly workspaceSvc  = inject(WorkspaceService);
    private readonly publicFormSvc = inject(PublicFormService);
    private readonly router        = inject(Router);

    private readonly _loading = signal(true);
    readonly isLoading = this._loading.asReadonly();

    readonly formData  = computed(() => this.publicFormSvc.findFormById(this.formId()));
    readonly form      = computed(() => this.formData()?.form ?? null);
    readonly workspace = computed(() => this.formData()?.workspace ?? null);

    readonly sections = computed(() =>
        [...(this.form()?.sections ?? [])].sort((a, b) => a.order - b.order)
    );

    readonly sectionsWithPayment = computed(() => {
        const sections = this.sections();
        const f = this.form();
        if (!f?.requiresPayment) return sections;
        const paymentSection: Section = {
            id: PAYMENT_SECTION_ID,
            formId: f.id,
            title: 'Pago',
            description: 'Integración de pago pendiente',
            questions: [],
            order: sections.length
        };
        return [...sections, paymentSection];
    });

    readonly layoutMode = computed<FormLayoutMode>(() => {
        const mode = this.form()?.layoutMode;
        if (mode === 'vertical') return 'vertical';
        if (mode === 'wizard') return 'horizontal';
        return this.sectionsWithPayment().length <= 3 ? 'horizontal' : 'vertical';
    });

    readonly currentIndex = signal(0);
    readonly answers      = signal<AnswerMap>({});
    readonly errors       = signal<Partial<Record<string, string>>>({});
    readonly isSubmitting = signal(false);

    readonly progressPct = computed(() => {
        const total = this.sectionsWithPayment().length;
        return total === 0 ? 0 : Math.round(((this.currentIndex() + 1) / total) * 100);
    });

    ngOnInit(): void {
        const stored = sessionStorage.getItem(`portal_answers_${this.formId()}`);
        if (stored) {
            try { this.answers.set(JSON.parse(stored)); } catch { /* ignore corrupt data */ }
        }
        this.workspaceSvc.getAll().subscribe(() => this._loading.set(false));
    }

    onAnswerChange(evt: AnswerChangeEvent): void {
        this.answers.update(map => ({ ...map, [evt.questionId]: evt.value }));
        sessionStorage.setItem(`portal_answers_${this.formId()}`, JSON.stringify(this.answers()));
        // Clear error for this field
        const currentErrors = this.errors();
        if (currentErrors[evt.questionId]) {
            this.errors.update(e => {
                const copy = { ...e };
                delete copy[evt.questionId];
                return copy;
            });
        }
    }

    onNext(): void {
        if (!this.validateCurrentSection()) return;
        this.errors.set({});
        this.currentIndex.update(i => i + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    onPrev(): void {
        this.errors.set({});
        this.currentIndex.update(i => Math.max(0, i - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    onSubmit(): void {
        if (!this.validateCurrentSection()) return;

        const workspace = this.workspace();
        const form      = this.form();
        if (!workspace || !form) return;

        this.isSubmitting.set(true);

        this.publicFormSvc.submitForm(workspace, form, this.answers()).subscribe({
            next: sub => {
                sessionStorage.removeItem(`portal_answers_${this.formId()}`);
                this.router.navigate(['/forms', this.formId(), 'success'], {
                    queryParams: { ref: sub.id }
                });
            },
            error: () => this.isSubmitting.set(false)
        });
    }

    private validateCurrentSection(): boolean {
        const section = this.sectionsWithPayment()[this.currentIndex()];
        if (!section) return true;

        const errs: Partial<Record<string, string>> = {};
        for (const q of section.questions) {
            if (!q.required) continue;
            const v = this.answers()[q.id];
            const isEmpty =
                v === null || v === undefined || v === '' ||
                (Array.isArray(v) && v.length === 0);
            if (isEmpty) errs[q.id] = 'Este campo es requerido';
        }

        this.errors.set(errs);
        return Object.keys(errs).length === 0;
    }
}
