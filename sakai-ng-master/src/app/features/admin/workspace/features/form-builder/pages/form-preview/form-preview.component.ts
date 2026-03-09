import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Form, Section, Question } from '../../models/form-builder.models';
import { FormBuilderService } from '../../services/form-builder.service';
import { AnswerChangeEvent, AnswerMap } from '@features/public/portal/models/portal.model';
import { StepperHorizontalComponent } from '@features/public/portal/pages/public-form/components/stepper-horizontal/stepper-horizontal.component';
import { StepperVerticalComponent } from '@features/public/portal/pages/public-form/components/stepper-vertical/stepper-vertical.component';

const PAYMENT_SECTION_ID = '__payment__';
const DEFAULT_ACCENT = '#3b82f6';

@Component({
    selector: 'app-form-preview',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService],
    imports: [
        RouterModule,
        ToastModule,
        StepperHorizontalComponent,
        StepperVerticalComponent
    ],
    styles: [`
        :host { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease both; }
    `],
    template: `
        @if (!form()) {
            <div class="flex flex-col items-center justify-center py-20 text-center">
                <i class="pi pi-file-excel text-4xl text-gray-300 mb-3"></i>
                <p class="text-gray-400">Formulario no encontrado</p>
                <a [routerLink]="['/admin/workspaces', workspaceId()]"
                    class="mt-3 text-sm text-blue-600 hover:underline no-underline">
                    Volver al workspace
                </a>
            </div>
        } @else {

        <div class="fade-in max-w-4xl mx-auto">

            <!-- Preview banner -->
            <div class="bg-gray-100 dark:bg-surface-800 border border-gray-200 dark:border-surface-600 rounded-xl px-4 py-2.5 mb-5 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2.5 text-gray-600 dark:text-gray-300 text-xs font-medium">
                    <span class="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full text-xs font-semibold">
                        <i class="pi pi-eye" style="font-size:0.65rem;"></i>
                        VISTA PREVIA
                    </span>
                    <span class="text-gray-500 dark:text-gray-400">Los datos ingresados no se guardarán</span>
                </div>
                <a [routerLink]="['/admin/workspaces', workspaceId(), 'forms', formId()]"
                    class="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium no-underline transition-colors shrink-0 bg-gray-200 dark:bg-surface-700 hover:bg-gray-300 dark:hover:bg-surface-600 px-3 py-1.5 rounded-lg">
                    <i class="pi pi-pencil" style="font-size:0.65rem;"></i>
                    Volver al editor
                </a>
            </div>

            <!-- Form header -->
            <div class="border-b border-gray-100 bg-white rounded-t-2xl">
                <div class="px-6 py-3.5">
                    <div class="flex items-start gap-3">
                        <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            [style.background-color]="accentColor() + '20'"
                            [style.color]="accentColor()">
                            <i class="pi pi-file-edit text-base"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h1 class="text-lg font-semibold text-gray-900 leading-snug mt-1 mb-0">{{ form()!.name }}</h1>
                            @if (form()!.description) {
                                <p class="text-sm text-gray-500 mt-0.5">{{ form()!.description }}</p>
                            }
                        </div>
                    </div>
                    <div class="mt-3 h-1 rounded-full" [style.background-color]="accentColor() + '30'">
                        <div class="h-1 rounded-full transition-all duration-500"
                            [style.background-color]="accentColor()"
                            [style.width]="progressPct() + '%'"></div>
                    </div>
                </div>
            </div>

            <!-- Stepper body -->
            <div class="bg-white rounded-b-2xl border border-t-0 border-gray-200 shadow-sm overflow-hidden">
                <div class="p-8">
                    @if (layoutMode() === 'horizontal') {
                        <app-stepper-horizontal
                            [sections]="sectionsWithPayment()"
                            [currentIndex]="currentIndex()"
                            [answers]="answers()"
                            [errors]="errors()"
                            [accentColor]="accentColor()"
                            [isSubmitting]="false"
                            [cancelLink]="cancelLink()"
                            [cancelLabel]="'Volver al editor'"
                            [firstStepLabel]="'Volver al editor'"
                            [firstStepIcon]="'pi pi-pencil'"
                            (answerChange)="onAnswerChange($event)"
                            (next)="onNext()"
                            (prev)="onPrev()"
                            (submit)="onSubmitPreview()" />
                    } @else {
                        <app-stepper-vertical
                            [sections]="sectionsWithPayment()"
                            [currentIndex]="currentIndex()"
                            [answers]="answers()"
                            [errors]="errors()"
                            [accentColor]="accentColor()"
                            [isSubmitting]="false"
                            [firstStepLink]="cancelLink()"
                            [firstStepLabel]="'Volver al editor'"
                            [firstStepIcon]="'pi pi-pencil'"
                            (answerChange)="onAnswerChange($event)"
                            (next)="onNext()"
                            (prev)="onPrev()"
                            (submit)="onSubmitPreview()"
                            (goTo)="currentIndex.set($event)" />
                    }
                </div>
            </div>
        </div>

        }
        <p-toast />
    `
})
export class FormPreviewComponent implements OnInit {
    readonly workspaceId = input<string>('');
    readonly formId = input<string>('');

    private readonly fbService = inject(FormBuilderService);
    private readonly messageService = inject(MessageService);

    readonly form = signal<Form | null>(null);
    readonly currentIndex = signal(0);
    readonly answers = signal<AnswerMap>({});
    readonly errors = signal<Partial<Record<string, string>>>({});

    readonly sortedSections = computed(() =>
        [...(this.form()?.sections ?? [])].sort((a, b) => a.order - b.order)
    );

    readonly sectionsWithPayment = computed(() => {
        const sections = this.sortedSections();
        const f = this.form();
        if (!f?.requiresPayment) return sections;
        const paymentSection: Section = {
            id: PAYMENT_SECTION_ID,
            formId: f.id,
            title: 'Pago',
            description: 'Paso de pago (integración pendiente)',
            questions: [],
            order: sections.length
        };
        return [...sections, paymentSection];
    });

    readonly layoutMode = computed<'horizontal' | 'vertical'>(() => {
        const mode = this.form()?.layoutMode;
        if (mode === 'vertical') return 'vertical';
        return 'horizontal';
    });

    readonly accentColor = computed(() => DEFAULT_ACCENT);

    readonly cancelLink = computed(() =>
        `/admin/workspaces/${this.workspaceId()}/forms/${this.formId()}`
    );

    readonly progressPct = computed(() => {
        const total = this.sectionsWithPayment().length;
        return total === 0 ? 0 : Math.round(((this.currentIndex() + 1) / total) * 100);
    });

    ngOnInit(): void {
        const f = this.fbService.getForm(this.workspaceId(), this.formId());
        this.form.set(f ?? null);
    }

    sortedQuestions(section: Section): Question[] {
        return [...section.questions].sort((a, b) => a.order - b.order);
    }

    onAnswerChange(evt: AnswerChangeEvent): void {
        this.answers.update(map => ({ ...map, [evt.questionId]: evt.value }));
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

    onSubmitPreview(): void {
        if (!this.validateCurrentSection()) return;
        this.messageService.add({
            severity: 'info',
            summary: 'Vista previa',
            detail: 'Los datos no se guardan. En la vista pública el formulario se enviará correctamente.'
        });
    }

    private validateCurrentSection(): boolean {
        const sections = this.sectionsWithPayment();
        const section = sections[this.currentIndex()];
        if (!section || section.id === PAYMENT_SECTION_ID) return true;

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
