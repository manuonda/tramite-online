import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal, computed } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import {
    Form, Section, Question, QuestionType, FormLayoutMode, FormStatus,
    QUESTION_TYPE_CONFIG, getDefaultConfig, QuestionConfig
} from '../../models/form-builder.models';
import { FormBuilderService } from '../../services/form-builder.service';

interface TypeColors { icon: string; bg: string; }

@Component({
    selector: 'app-form-editor',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService, ConfirmationService],
    imports: [
        RouterModule, FormsModule, ReactiveFormsModule,
        ButtonModule, DialogModule, ConfirmDialogModule, ToastModule, TooltipModule,
        InputTextModule, TextareaModule
    ],
    styles: [`
        .section-card {
            border-radius: 0.75rem;
            border: 1.5px solid var(--surface-border);
            background: var(--surface-card);
        }
        .question-row {
            border-radius: 0.5rem;
            border: 1.5px solid var(--surface-border);
            background: var(--surface-card);
        }
        .question-row.config-open {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary-color) 20%, transparent);
        }
        .type-badge {
            display: inline-flex; align-items: center;
            padding: 0.175rem 0.6rem;
            border-radius: 9999px;
            font-size: 0.7rem; font-weight: 500;
            background: var(--surface-100); color: var(--text-color-secondary);
            white-space: nowrap;
        }
        .required-badge {
            display: inline-flex; align-items: center;
            padding: 0.175rem 0.6rem;
            border-radius: 9999px;
            font-size: 0.7rem; font-weight: 500;
            background: #fef2f2; color: #dc2626;
        }
        :host-context(.app-dark) .required-badge { background: rgba(220,38,38,0.15); color: #fca5a5; }
        .add-question-btn {
            width: 100%; padding: 0.5rem 1rem;
            border: 1.5px solid var(--surface-border); border-radius: 8px;
            color: var(--text-color-secondary); font-size: 0.8125rem; font-weight: 500;
            background: var(--surface-50); cursor: pointer;
            transition: all 0.14s;
            display: flex; align-items: center; justify-content: center; gap: 0.5rem;
        }
        .add-question-btn:hover {
            border-color: var(--primary-300);
            color: var(--primary-color);
            background: color-mix(in srgb, var(--primary-color) 8%, transparent);
            box-shadow: 0 1px 4px color-mix(in srgb, var(--primary-color) 15%, transparent);
        }
        .add-question-btn .btn-icon {
            width: 20px; height: 20px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 50%; background: var(--surface-200); color: var(--text-color-secondary);
            transition: all 0.14s; font-size: 0.65rem;
        }
        .add-question-btn:hover .btn-icon {
            background: color-mix(in srgb, var(--primary-color) 20%, transparent); color: var(--primary-color);
        }
        .add-section-btn {
            width: 100%; padding: 0.625rem 1rem;
            border: 1.5px dashed var(--surface-border); border-radius: 0.75rem;
            color: var(--text-color-secondary); font-size: 0.8125rem; font-weight: 500;
            background: var(--surface-50); cursor: pointer;
            transition: all 0.14s;
            display: flex; align-items: center; justify-content: center; gap: 0.5rem;
        }
        .add-section-btn:hover {
            border-color: var(--primary-color); border-style: solid;
            color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 8%, transparent);
        }
        .add-section-btn .btn-icon {
            width: 22px; height: 22px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 50%; background: var(--surface-200); color: var(--text-color-secondary);
            transition: all 0.14s; font-size: 0.7rem;
        }
        .add-section-btn:hover .btn-icon {
            background: color-mix(in srgb, var(--primary-color) 20%, transparent); color: var(--primary-color);
        }
        .inline-input {
            background: transparent; border: none; outline: none;
            padding: 0.25rem 0.5rem; margin: -0.25rem -0.5rem;
            font-family: inherit; width: 100%; border-radius: 6px;
            transition: background 0.15s, box-shadow 0.15s;
        }
        .inline-input:hover {
            background: color-mix(in srgb, var(--primary-color) 6%, transparent);
        }
        .inline-input:focus {
            background: color-mix(in srgb, var(--primary-color) 8%, transparent);
            box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color) 20%, transparent);
        }
        .inline-input::placeholder { color: var(--text-color-secondary); }
        .form-stats-badge {
            display: inline-flex; align-items: center; gap: 0.375rem;
            padding: 0.25rem 0.625rem; border-radius: 9999px;
            font-size: 0.75rem; font-weight: 500;
            background: var(--surface-100); color: var(--text-color-secondary);
        }
        .back-to-list-btn {
            display: inline-flex;
        }
        .editando-badge {
            box-shadow: 0 1px 3px rgba(37,99,235,0.2);
        }
        .type-option-item {
            display: flex; align-items: flex-start; gap: 0.625rem;
            padding: 0.5rem 0.75rem; cursor: pointer; transition: background 0.1s;
        }
        .type-option-item:hover { background: var(--surface-hover); }
        .type-dropdown-menu {
            position: absolute; z-index: 9999;
            background: var(--surface-card); border: 1.5px solid var(--surface-border);
            border-radius: 0.625rem;
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            min-width: 220px; max-height: 300px; overflow-y: auto; padding: 4px 0;
        }
        .add-question-dropdown {
            min-width: 260px;
            max-height: 320px;
        }
        .action-btn {
            width: 32px; height: 32px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 8px; transition: all 0.15s; border: none;
            background: transparent; cursor: pointer; color: var(--text-color-secondary);
        }
        .action-btn:hover:not(:disabled) { background: var(--surface-hover); color: var(--text-color); }
        .action-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .action-btn.settings-active { background: color-mix(in srgb, var(--primary-color) 12%, transparent); color: var(--primary-color); }
        .action-btn.danger { color: #dc2626; }
        .action-btn.danger:hover:not(:disabled) { background: #fef2f2; color: #b91c1c; }
        .action-btn-group { display: flex; align-items: center; gap: 2px; }
        .action-btn-sep {
            width: 1px; height: 18px; background: var(--surface-border);
            margin: 0 4px; flex-shrink: 0; border-radius: 1px;
        }
        :host-context(.app-dark) .action-btn.danger { color: #f87171; }
        :host-context(.app-dark) .action-btn.danger:hover:not(:disabled) { background: rgba(220,38,38,0.15); color: #fca5a5; }
        /* Config modal */
        .config-modal-content { padding: 0.5rem 0; }
        .config-section { margin-bottom: 1.25rem; }
        .config-section:last-child { margin-bottom: 0; }
        .config-section-label {
            display: block; font-size: 0.75rem; font-weight: 600;
            color: var(--text-color-secondary); text-transform: uppercase; letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
        }
        .config-toggle {
            display: inline-flex; align-items: center; gap: 0.75rem;
            cursor: pointer; user-select: none;
        }
        .config-toggle-track {
            position: relative; width: 2.5rem; height: 1.25rem;
            background: #e5e7eb; border-radius: 9999px; transition: background 0.2s;
        }
        .config-toggle-track.config-toggle-on { background: var(--primary-color); }
        .config-toggle-track { position: relative; display: inline-block; }
        .config-toggle-thumb {
            position: absolute; left: 0.125rem; top: 0.125rem;
            width: 1rem; height: 1rem; background: white; border-radius: 50%;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: transform 0.2s;
        }
        .config-toggle-thumb.config-toggle-on { transform: translateX(1.25rem); }
        .config-toggle-label { font-size: 0.875rem; font-weight: 500; color: var(--text-color); }
        .config-row { display: flex; align-items: center; }
        .config-check { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.875rem; }
        .config-input {
            width: 100%; padding: 0.5rem 0.75rem; border-radius: 8px;
            border: 1.5px solid var(--surface-border); font-size: 0.875rem; background: var(--surface-card);
            color: var(--text-color); transition: border-color 0.15s; outline: none;
        }
        .config-input:focus { border-color: var(--primary-color); }
        .config-input-readonly { background: var(--surface-50); color: var(--text-color-secondary); }
        .config-hint { font-size: 0.75rem; color: var(--text-color-secondary); display: block; margin-top: 0.25rem; }
        .config-link-row { display: flex; gap: 0.5rem; }
        .config-link-row .config-input { flex: 1; }
        .config-copy-btn {
            padding: 0.5rem 0.75rem; border-radius: 8px;
            border: 1.5px solid var(--surface-border); background: var(--surface-card); color: var(--text-color-secondary);
            cursor: pointer; transition: all 0.15s;
        }
        .config-copy-btn:hover { border-color: var(--primary-color); color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 8%, transparent); }
        .config-footer {
            display: flex; justify-content: space-between; align-items: center;
            width: 100%; gap: 1rem;
        }
        .config-footer-right { display: flex; gap: 0.5rem; }
        .config-btn {
            display: inline-flex; align-items: center; gap: 0.5rem;
            padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600;
            cursor: pointer; transition: all 0.15s; border: none;
        }
        .config-btn-secondary {
            background: var(--surface-100); color: var(--text-color); border: 1px solid var(--surface-border);
        }
        .config-btn-secondary:hover { background: var(--surface-hover); }
        .config-btn-primary { background: var(--primary-color); color: var(--primary-contrast); }
        .config-btn-primary:hover { background: var(--primary-600); }
        .config-btn-danger { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .config-btn-danger:hover { background: #fee2e2; }
        :host-context(.app-dark) .config-btn-danger { background: rgba(220,38,38,0.15); color: #f87171; border-color: rgba(220,38,38,0.3); }
        .config-panel-input {
            width: 100%; height: 36px; padding: 0 10px;
            border: 1.5px solid var(--surface-border); border-radius: 8px;
            font-size: 0.875rem; background: var(--surface-card); color: var(--text-color);
            transition: border-color 0.15s; outline: none;
        }
        .config-panel-input:focus { border-color: var(--primary-color); }
        .config-label { font-size: 0.72rem; font-weight: 600; color: var(--text-color-secondary); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; display: block; }
    `],
    template: `
        @if (!form()) {
            <div class="animate-pulse space-y-4">
                <div class="h-8 bg-gray-200 rounded w-1/3"></div>
                <div class="h-4 bg-gray-100 rounded w-2/3"></div>
            </div>
        } @else {

        <!-- ── Volver a formularios (principal) ───────────────────── -->
        <a [routerLink]="['/admin/workspaces', workspaceId(), 'forms']"
            class="back-to-list-btn inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-surface-600 bg-white dark:bg-surface-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-surface-800 hover:border-gray-300 dark:hover:border-surface-500 transition-all no-underline text-sm font-semibold shadow-sm mb-6"
            title="Volver a la lista de formularios">
            <i class="pi pi-arrow-left"></i>
            Volver a formularios
        </a>

        <!-- ── Form Header Card ───────────────────────────────────── -->
        <div class="form-header-card bg-white dark:bg-surface-900 rounded-xl border border-gray-200 dark:border-surface-700 p-6 mb-6 shadow-sm">
            <div class="flex items-start justify-between gap-4 flex-wrap">
                <div class="flex-1 min-w-0">
                    <!-- Editando + nombre editable -->
                    <div class="flex items-center gap-3 mb-2">
                        <span class="editando-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-600 text-white">
                            <i class="pi pi-pencil" style="font-size:0.65rem;"></i>
                            Editando
                        </span>
                    </div>
                    <input
                        class="inline-input text-xl font-bold text-gray-900 dark:text-white block w-full"
                        [value]="form()!.name"
                        (blur)="updateFormName($any($event.target).value)"
                        (keydown.enter)="$any($event.target).blur()"
                        placeholder="Nombre del formulario" />
                    <input
                        class="inline-input text-sm text-gray-500 dark:text-gray-400 block mt-1 w-full"
                        [value]="form()!.description || ''"
                        (blur)="updateFormDesc($any($event.target).value)"
                        (keydown.enter)="$any($event.target).blur()"
                        placeholder="Descripción opcional..." />
                    <!-- Stats con iconos mejorados -->
                    <div class="flex items-center gap-2 mt-3 flex-wrap">
                        <span class="form-stats-badge">
                            <i class="pi pi-folder text-blue-500"></i>
                            {{ sortedSections().length }} {{ sortedSections().length === 1 ? 'sección' : 'secciones' }}
                        </span>
                        <span class="form-stats-badge">
                            <i class="pi pi-question-circle text-emerald-500"></i>
                            {{ totalQuestions() }} preguntas
                        </span>
                        <span class="form-stats-badge">
                            <i class="pi pi-calendar text-amber-500"></i>
                            Actualizado {{ formatDate(form()!.updatedAt) }}
                        </span>
                    </div>
                </div>
                <div class="flex items-center gap-3 shrink-0">
                    <a [routerLink]="['/admin/workspaces', workspaceId(), 'forms', formId(), 'preview']"
                        class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-surface-600 rounded-lg hover:bg-gray-50 dark:hover:bg-surface-800 transition-colors no-underline">
                        <i class="pi pi-eye text-sm"></i>
                        Vista previa
                    </a>
                    <button type="button"
                        class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-surface-600 rounded-lg hover:bg-gray-50 dark:hover:bg-surface-800 transition-colors bg-white dark:bg-surface-900"
                        (click)="configDialogVisible = true">
                        <i class="pi pi-cog text-sm"></i>
                        Configuración
                    </button>
                </div>
            </div>
        </div>

        <!-- ── Sections ───────────────────────────────────────────── -->
        <div class="space-y-3">
            @for (section of sortedSections(); track section.id; let sIdx = $index) {
                <div class="section-card overflow-visible">

                    <!-- Section header — title + desc always visible -->
                    <div class="flex items-start gap-2 px-4 py-3">
                        <!-- Collapse toggle -->
                        <button class="action-btn shrink-0 mt-0.5"
                            (click)="toggleSection(section.id)"
                            [title]="sectionOpen(section.id) ? 'Colapsar' : 'Expandir'">
                            <i class="pi text-sm transition-transform duration-200"
                                [class]="sectionOpen(section.id) ? 'pi-chevron-down text-blue-500' : 'pi-chevron-right'"></i>
                        </button>

                        <!-- Title + Description -->
                        <div class="flex-1 min-w-0">
                            <input
                                class="inline-input text-sm font-bold text-gray-800 dark:text-white leading-snug"
                                [value]="section.title"
                                (blur)="updateSectionTitle(section.id, $any($event.target).value)"
                                (keydown.enter)="$any($event.target).blur()"
                                placeholder="Nombre de la sección" />
                            <input
                                class="inline-input text-xs text-gray-400 dark:text-gray-500 italic block mt-0.5"
                                [value]="section.description || ''"
                                (blur)="updateSectionDesc(section.id, $any($event.target).value)"
                                (keydown.enter)="$any($event.target).blur()"
                                placeholder="Descripción de la sección..." />
                        </div>

                        <!-- Question count + actions -->
                        <div class="flex items-center gap-2 shrink-0 mt-0.5">
                            <span class="type-badge mr-1">
                                {{ section.questions.length }}
                                {{ section.questions.length === 1 ? 'pregunta' : 'preguntas' }}
                            </span>
                            <div class="action-btn-group">
                                <button class="action-btn" [disabled]="sIdx === 0"
                                    (click)="moveSection(section.id, 'up')"
                                    pTooltip="Subir sección" tooltipPosition="top">
                                    <i class="pi pi-angle-up text-xs"></i>
                                </button>
                                <button class="action-btn" [disabled]="sIdx === sortedSections().length - 1"
                                    (click)="moveSection(section.id, 'down')"
                                    pTooltip="Bajar sección" tooltipPosition="top">
                                    <i class="pi pi-angle-down text-xs"></i>
                                </button>
                                <span class="action-btn-sep"></span>
                                <button class="action-btn danger"
                                    (click)="deleteSection(section.id)"
                                    pTooltip="Eliminar sección" tooltipPosition="top">
                                    <i class="pi pi-trash text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Section body (collapsible) — only questions list -->
                    @if (sectionOpen(section.id)) {
                        <div class="border-t border-gray-100 dark:border-surface-700 px-4 py-3 space-y-2">

                            <!-- Questions -->
                            @for (question of sortedQuestions(section); track question.id; let qIdx = $index) {
                                <div class="question-row" [class.config-open]="questionOpen(question.id)">

                                    <!-- ── Question row header — always visible ── -->
                                    <div class="flex items-center gap-2 px-3 py-2.5">
                                        <!-- Grip handle -->
                                        <i class="pi pi-bars shrink-0 cursor-grab"
                                            style="font-size:0.7rem; color:#c4cdd6;"></i>

                                        <!-- Colored type icon -->
                                        <div class="flex w-7 h-7 items-center justify-center rounded-md shrink-0"
                                            [style.background-color]="getTypeColors(question.type).bg"
                                            [style.color]="getTypeColors(question.type).icon">
                                            <i [class]="getTypeIcon(question.type) + ' text-xs'"></i>
                                        </div>

                                        <!-- Label (read-only in collapsed row) -->
                                        <span class="flex-1 text-sm font-medium text-gray-800 dark:text-white truncate min-w-0">
                                            {{ question.label || 'Sin título' }}
                                        </span>

                                        <!-- Type badge -->
                                        <span class="type-badge hidden sm:inline-flex shrink-0">{{ getTypeLabel(question.type) }}</span>

                                        <!-- Required badge -->
                                        @if (question.required) {
                                            <span class="required-badge shrink-0">Requerido</span>
                                        }

                                        <!-- Action buttons -->
                                        <div class="action-btn-group shrink-0">
                                            <button class="action-btn" [disabled]="qIdx === 0"
                                                (click)="moveQuestion(section.id, question.id, 'up')"
                                                pTooltip="Mover arriba" tooltipPosition="top">
                                                <i class="pi pi-angle-up text-xs"></i>
                                            </button>
                                            <button class="action-btn" [disabled]="qIdx === section.questions.length - 1"
                                                (click)="moveQuestion(section.id, question.id, 'down')"
                                                pTooltip="Mover abajo" tooltipPosition="top">
                                                <i class="pi pi-angle-down text-xs"></i>
                                            </button>
                                            <span class="action-btn-sep"></span>
                                            <button class="action-btn"
                                                [class.settings-active]="questionOpen(question.id)"
                                                (click)="toggleQuestion(question.id)"
                                                pTooltip="Configurar pregunta" tooltipPosition="top">
                                                <i class="pi pi-cog text-xs"></i>
                                            </button>
                                            <span class="action-btn-sep"></span>
                                            <button class="action-btn danger"
                                                (click)="deleteQuestion(section.id, question.id)"
                                                pTooltip="Eliminar pregunta" tooltipPosition="top">
                                                <i class="pi pi-trash text-xs"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <!-- ── Config panel — only when settings clicked ── -->
                                    @if (questionOpen(question.id)) {
                                        <div class="border-t border-blue-100 dark:border-surface-700 px-3 py-3 space-y-3 bg-blue-50/30 dark:bg-surface-800/40">

                                            <!-- Row 1: Pregunta + Requerido -->
                                            <div class="flex gap-3 items-end">
                                                <div class="flex-1">
                                                    <span class="config-label">Pregunta</span>
                                                    <input class="config-panel-input"
                                                        [value]="question.label"
                                                        (blur)="updateQuestion(section.id, question.id, { label: $any($event.target).value })"
                                                        (keydown.enter)="$any($event.target).blur()"
                                                        placeholder="Escribe la pregunta..." />
                                                </div>
                                                <div class="shrink-0 pb-1">
                                                    <label class="flex items-center gap-2 cursor-pointer select-none">
                                                        <div class="relative">
                                                            <input type="checkbox" class="sr-only"
                                                                [checked]="question.required"
                                                                (change)="updateQuestion(section.id, question.id, { required: !question.required })" />
                                                            <div class="w-9 h-4.5 rounded-full transition-colors"
                                                                [class]="question.required ? 'bg-blue-600' : 'bg-gray-300'"
                                                                style="width:36px;height:18px;border-radius:9999px;"></div>
                                                            <div class="absolute bg-white rounded-full shadow transition-transform"
                                                                style="width:14px;height:14px;top:2px;left:2px;"
                                                                [style.transform]="question.required ? 'translateX(18px)' : 'translateX(0)'"></div>
                                                        </div>
                                                        <span class="text-xs font-medium text-gray-600 dark:text-gray-300">Requerido</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <!-- Row 2: Descripción -->
                                            <div>
                                                <span class="config-label">Descripción (opcional)</span>
                                                <input class="config-panel-input"
                                                    [value]="question.description || ''"
                                                    (blur)="updateQuestion(section.id, question.id, { description: $any($event.target).value || undefined })"
                                                    placeholder="Instrucciones adicionales..." />
                                            </div>

                                            <!-- Row 3: Tipo de pregunta -->
                                            <div class="relative">
                                                <span class="config-label">Tipo de pregunta</span>
                                                <button class="config-panel-input flex items-center gap-2 text-left cursor-pointer h-9"
                                                    style="height:36px;"
                                                    (click)="toggleTypeDropdown(question.id); $event.stopPropagation()">
                                                    <i [class]="getTypeIcon(question.type) + ' text-xs'"
                                                        [style.color]="getTypeColors(question.type).icon"></i>
                                                    <span class="flex-1 text-sm">{{ getTypeLabel(question.type) }}</span>
                                                    <i class="pi pi-chevron-down text-xs text-gray-400"></i>
                                                </button>
                                                @if (typeDropdownFor() === question.id) {
                                                    <div class="type-dropdown-menu left-0 top-11">
                                                        @for (entry of questionTypes; track entry.type) {
                                                            <div class="type-option-item"
                                                                (click)="changeType(section.id, question.id, entry.type)">
                                                                <i [class]="entry.cfg.icon + ' text-sm mt-0.5 shrink-0'"
                                                                    [style.color]="getTypeColors(entry.type).icon"></i>
                                                                <div class="flex-1">
                                                                    <div class="text-sm text-gray-800 dark:text-white font-medium">{{ entry.cfg.label }}</div>
                                                                    <div class="text-xs text-gray-400">{{ entry.cfg.description }}</div>
                                                                </div>
                                                                @if (entry.type === question.type) {
                                                                    <i class="pi pi-check text-xs text-blue-600 mt-1"></i>
                                                                }
                                                            </div>
                                                        }
                                                    </div>
                                                }
                                            </div>

                                            <!-- Type-specific config ─────────────────── -->
                                            @if (question.type === 'text') {
                                                <div>
                                                    <span class="config-label">Placeholder</span>
                                                    <input class="config-panel-input"
                                                        [value]="question.config.placeholder || ''"
                                                        (blur)="patchConfig(section.id, question.id, question.config, 'placeholder', $any($event.target).value)"
                                                        placeholder="Texto de ayuda..." />
                                                </div>
                                            }
                                            @if (question.type === 'number') {
                                                <div class="flex gap-3">
                                                    <div class="flex-1">
                                                        <span class="config-label">Mínimo</span>
                                                        <input class="config-panel-input" type="number"
                                                            [value]="question.config.min ?? ''"
                                                            (blur)="patchConfig(section.id, question.id, question.config, 'min', +$any($event.target).value || undefined)" />
                                                    </div>
                                                    <div class="flex-1">
                                                        <span class="config-label">Máximo</span>
                                                        <input class="config-panel-input" type="number"
                                                            [value]="question.config.max ?? ''"
                                                            (blur)="patchConfig(section.id, question.id, question.config, 'max', +$any($event.target).value || undefined)" />
                                                    </div>
                                                    <div class="flex-1">
                                                        <span class="config-label">Paso</span>
                                                        <input class="config-panel-input" type="number"
                                                            [value]="question.config.step ?? 1"
                                                            (blur)="patchConfig(section.id, question.id, question.config, 'step', +$any($event.target).value || 1)" />
                                                    </div>
                                                </div>
                                            }
                                            @if (question.type === 'rating') {
                                                <div>
                                                    <span class="config-label">Número de estrellas</span>
                                                    <input class="config-panel-input" type="number" min="1" max="10"
                                                        style="width:80px;"
                                                        [value]="question.config.stars ?? 5"
                                                        (blur)="patchConfig(section.id, question.id, question.config, 'stars', +$any($event.target).value || 5)" />
                                                </div>
                                            }
                                            @if (question.type === 'scale') {
                                                <div class="space-y-2">
                                                    <div class="flex gap-3">
                                                        <div class="flex-1">
                                                            <span class="config-label">Valor mínimo</span>
                                                            <input class="config-panel-input" type="number"
                                                                [value]="question.config.scaleMin ?? 1"
                                                                (blur)="patchConfig(section.id, question.id, question.config, 'scaleMin', +$any($event.target).value)" />
                                                        </div>
                                                        <div class="flex-1">
                                                            <span class="config-label">Valor máximo</span>
                                                            <input class="config-panel-input" type="number"
                                                                [value]="question.config.scaleMax ?? 10"
                                                                (blur)="patchConfig(section.id, question.id, question.config, 'scaleMax', +$any($event.target).value)" />
                                                        </div>
                                                    </div>
                                                    <div class="flex gap-3">
                                                        <div class="flex-1">
                                                            <span class="config-label">Etiqueta mínima</span>
                                                            <input class="config-panel-input"
                                                                [value]="question.config.scaleMinLabel || ''"
                                                                (blur)="patchConfig(section.id, question.id, question.config, 'scaleMinLabel', $any($event.target).value)"
                                                                placeholder="Ej: Muy malo" />
                                                        </div>
                                                        <div class="flex-1">
                                                            <span class="config-label">Etiqueta máxima</span>
                                                            <input class="config-panel-input"
                                                                [value]="question.config.scaleMaxLabel || ''"
                                                                (blur)="patchConfig(section.id, question.id, question.config, 'scaleMaxLabel', $any($event.target).value)"
                                                                placeholder="Ej: Excelente" />
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                            @if (question.type === 'select' || question.type === 'multi-select') {
                                                <div>
                                                    <span class="config-label">Dominio de valores</span>
                                                    <select class="config-panel-input"
                                                        style="height:36px;cursor:pointer;"
                                                        [value]="question.config.domainId || ''"
                                                        (change)="patchConfig(section.id, question.id, question.config, 'domainId', $any($event.target).value || undefined)">
                                                        <option value="">Sin dominio</option>
                                                        @for (d of domains(); track d.id) {
                                                            <option [value]="d.id">{{ d.name }} ({{ d.values.length }} valores)</option>
                                                        }
                                                    </select>
                                                </div>
                                            }
                                            @if (question.type === 'file') {
                                                <div>
                                                    <span class="config-label">Tipos de archivo permitidos</span>
                                                    <input class="config-panel-input"
                                                        [value]="question.config.accept || ''"
                                                        (blur)="patchConfig(section.id, question.id, question.config, 'accept', $any($event.target).value)"
                                                        placeholder="Ej: image/*, .pdf" />
                                                </div>
                                            }

                                            <!-- Duplicate action -->
                                            <div class="flex justify-end pt-1 border-t border-blue-100 dark:border-surface-700">
                                                <button
                                                    class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                                                    (click)="duplicateQuestion(section.id, question.id)">
                                                    <i class="pi pi-copy text-xs"></i>
                                                    Duplicar pregunta
                                                </button>
                                            </div>
                                        </div>
                                    }
                                </div>
                            }

                            <!-- Add Question button -->
                            <div class="mt-2 relative">
                                <button class="add-question-btn"
                                    (click)="toggleAddQuestion(section.id); $event.stopPropagation()">
                                    <span class="btn-icon">
                                        <i class="pi pi-plus"></i>
                                    </span>
                                    Agregar pregunta
                                </button>
                                @if (addQuestionFor() === section.id) {
                                    <div class="type-dropdown-menu add-question-dropdown left-0 bottom-full mb-2">
                                        @for (entry of questionTypes; track entry.type) {
                                            <div class="type-option-item"
                                                (click)="addQuestion(section.id, entry.type)">
                                                <i [class]="entry.cfg.icon + ' text-sm mt-0.5 shrink-0'"
                                                    [style.color]="getTypeColors(entry.type).icon"></i>
                                                <div>
                                                    <div class="text-sm text-gray-800 dark:text-white font-medium">{{ entry.cfg.label }}</div>
                                                    <div class="text-xs text-gray-400">{{ entry.cfg.description }}</div>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                }
                            </div>
                        </div>
                    }
                </div>
            }

            <!-- Add Section button -->
            <button class="add-section-btn" (click)="addSection()">
                <span class="btn-icon">
                    <i class="pi pi-plus"></i>
                </span>
                Agregar sección
            </button>
        </div>

        } <!-- end @if form -->

        <!-- Close dropdowns on outside click -->
        @if (typeDropdownFor() || addQuestionFor()) {
            <div class="fixed inset-0 z-30" (click)="closeAllDropdowns()"></div>
        }

        <!-- ── Config Modal ───────────────────────────────────────────────────── -->
        <p-dialog
            [(visible)]="configDialogVisible"
            header="Configuración del formulario"
            [modal]="true"
            [draggable]="false"
            [resizable]="false"
            styleClass="config-modal w-full max-w-lg"
            (onShow)="initConfigForm()"
            (onHide)="configDialogVisible = false">
            @if (form()) {
                <div class="config-modal-content">
                    <!-- Estado -->
                    <div class="config-section">
                        <label class="config-section-label">Estado</label>
                        <label class="config-toggle">
                            <input type="checkbox" class="sr-only"
                                [checked]="configStatus() === 'published'"
                                (change)="configStatus.set(configStatus() === 'published' ? 'draft' : 'published')" />
                            <span class="config-toggle-track"
                                [class.config-toggle-on]="configStatus() === 'published'">
                                <span class="config-toggle-thumb"
                                    [class.config-toggle-on]="configStatus() === 'published'"></span>
                            </span>
                            <span class="config-toggle-label">{{ configStatus() === 'published' ? 'Publicado' : 'Borrador' }}</span>
                        </label>
                    </div>

                    <!-- Requiere pago + Precio -->
                    <div class="config-section">
                        <label class="config-section-label">Pago</label>
                        <div class="config-row">
                            <label class="config-check">
                                <input type="checkbox" class="rounded"
                                    [checked]="configRequiresPayment()"
                                    (change)="configRequiresPayment.set($any($event.target).checked)" />
                                <span>Requiere pago</span>
                            </label>
                        </div>
                        @if (configRequiresPayment()) {
                            <div class="config-field mt-3">
                                <input type="number" min="0" step="1"
                                    class="config-input"
                                    [ngModel]="configPaymentAmount()"
                                    (ngModelChange)="configPaymentAmount.set($event !== '' && $event != null ? +$event : undefined)"
                                    placeholder="Precio (ej: 1000)" />
                            </div>
                        }
                    </div>

                    <!-- Vista -->
                    <div class="config-section">
                        <label class="config-section-label">Vista</label>
                        <select class="config-input"
                            [ngModel]="configLayoutMode()"
                            (ngModelChange)="configLayoutMode.set($event)">
                            <option value="wizard">Wizard (horizontal)</option>
                            <option value="vertical">Vertical (menú lateral)</option>
                        </select>
                    </div>

                    <!-- Vigencia -->
                    <div class="config-section">
                        <label class="config-section-label">Vigencia hasta</label>
                        <input type="date" class="config-input"
                            [ngModel]="configValidUntil()"
                            (ngModelChange)="configValidUntil.set($event || undefined)"
                            placeholder="Sin límite" />
                        <span class="config-hint">Dejar vacío si no tiene fecha de vencimiento</span>
                    </div>

                    <!-- Enlace -->
                    <div class="config-section config-section-link">
                        <label class="config-section-label">Enlace del formulario</label>
                        <div class="config-link-row">
                            <input type="text" readonly class="config-input config-input-readonly"
                                [value]="getPublicFormUrl()" />
                            <button type="button" class="config-copy-btn"
                                (click)="copyFormUrl()"
                                pTooltip="Copiar enlace" tooltipPosition="top">
                                <i class="pi pi-copy"></i>
                            </button>
                        </div>
                    </div>
                </div>
            }
            <ng-template pTemplate="footer">
                <div class="config-footer">
                    <button type="button" class="config-btn config-btn-danger"
                        (click)="confirmDeleteForm()">
                        <i class="pi pi-trash"></i> Eliminar
                    </button>
                    <div class="config-footer-right">
                        <button type="button" class="config-btn config-btn-secondary"
                            (click)="configDialogVisible = false">
                            Cerrar
                        </button>
                        <button type="button" class="config-btn config-btn-primary"
                            (click)="saveConfigForm()">
                            <i class="pi pi-check"></i> Guardar
                        </button>
                    </div>
                </div>
            </ng-template>
        </p-dialog>

        <p-confirmDialog />
        <p-toast />
    `
})
export class FormEditorComponent implements OnInit {
    readonly workspaceId = input<string>('');
    readonly formId = input<string>('');

    private readonly fbService = inject(FormBuilderService);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly router = inject(Router);

    readonly form = signal<Form | null>(null);
    readonly domains = this.fbService.domains;

    readonly openSections = signal<Set<string>>(new Set());
    readonly openQuestions = signal<Set<string>>(new Set());
    readonly typeDropdownFor = signal<string | null>(null);
    readonly addQuestionFor = signal<string | null>(null);
    configDialogVisible = false;

    readonly configStatus = signal<FormStatus>('draft');
    readonly configRequiresPayment = signal(false);
    readonly configPaymentAmount = signal<number | undefined>(undefined);
    readonly configLayoutMode = signal<FormLayoutMode>('wizard');
    readonly configValidUntil = signal<string | undefined>(undefined);

    readonly sortedSections = computed(() =>
        [...(this.form()?.sections ?? [])].sort((a, b) => a.order - b.order)
    );

    readonly totalQuestions = computed(() =>
        this.form()?.sections.reduce((acc, s) => acc + s.questions.length, 0) ?? 0
    );

    readonly questionTypes = Object.entries(QUESTION_TYPE_CONFIG).map(([type, cfg]) => ({
        type: type as QuestionType, cfg
    }));

    /** Color palette per question type */
    private readonly TYPE_COLORS: Record<QuestionType, TypeColors> = {
        'text':         { icon: '#3b82f6', bg: '#eff6ff' },
        'number':       { icon: '#10b981', bg: '#ecfdf5' },
        'date':         { icon: '#8b5cf6', bg: '#f5f3ff' },
        'boolean':      { icon: '#f59e0b', bg: '#fffbeb' },
        'select':       { icon: '#6366f1', bg: '#eef2ff' },
        'multi-select': { icon: '#6366f1', bg: '#eef2ff' },
        'file':         { icon: '#6b7280', bg: '#f9fafb' },
        'rating':       { icon: '#eab308', bg: '#fefce8' },
        'scale':        { icon: '#14b8a6', bg: '#f0fdfa' },
        'matrix':       { icon: '#ec4899', bg: '#fdf2f8' },
    };

    ngOnInit(): void {
        this._loadForm();
    }

    private _loadForm(): void {
        const f = this.fbService.getForm(this.workspaceId(), this.formId());
        this.form.set(f ?? null);
        if (!f) {
            this.messageService.add({ severity: 'warn', summary: 'No encontrado', detail: 'El formulario no existe.' });
            this.router.navigate(['/admin/workspaces', this.workspaceId()]);
        } else if (f.sections.length > 0) {
            this.openSections.update(s => { s.add(f.sections[0].id); return new Set(s); });
        }
    }

    private _refresh(): void {
        this.form.set(this.fbService.getForm(this.workspaceId(), this.formId()) ?? null);
    }

    // ── Type helpers ──────────────────────────────────────────────────────────

    getTypeLabel(type: QuestionType): string { return QUESTION_TYPE_CONFIG[type]?.label ?? type; }
    getTypeIcon(type: QuestionType): string { return QUESTION_TYPE_CONFIG[type]?.icon ?? 'pi pi-question'; }
    getTypeColors(type: QuestionType): TypeColors { return this.TYPE_COLORS[type] ?? { icon: '#6b7280', bg: '#f9fafb' }; }

    // ── Section open/close ─────────────────────────────────────────────────────

    sectionOpen(id: string): boolean { return this.openSections().has(id); }
    questionOpen(id: string): boolean { return this.openQuestions().has(id); }

    toggleSection(id: string): void {
        this.openSections.update(s => {
            const next = new Set(s);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    toggleQuestion(id: string): void {
        this.openQuestions.update(s => {
            const next = new Set(s);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
        this.typeDropdownFor.set(null);
    }

    sortedQuestions(section: Section): Question[] {
        return [...section.questions].sort((a, b) => a.order - b.order);
    }

    // ── Dropdown helpers ───────────────────────────────────────────────────────

    toggleTypeDropdown(questionId: string): void {
        this.typeDropdownFor.set(this.typeDropdownFor() === questionId ? null : questionId);
        this.addQuestionFor.set(null);
    }

    toggleAddQuestion(sectionId: string): void {
        this.addQuestionFor.set(this.addQuestionFor() === sectionId ? null : sectionId);
        this.typeDropdownFor.set(null);
    }

    closeAllDropdowns(): void {
        this.typeDropdownFor.set(null);
        this.addQuestionFor.set(null);
    }

    formatDate(iso: string): string {
        return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    }

    // ── Form actions ──────────────────────────────────────────────────────────

    updateFormName(name: string): void {
        if (!name.trim()) return;
        this.fbService.updateForm(this.workspaceId(), this.formId(), { name: name.trim() });
        this._refresh();
    }

    updateFormDesc(description: string): void {
        this.fbService.updateForm(this.workspaceId(), this.formId(), { description: description || undefined });
        this._refresh();
    }

    toggleStatus(): void {
        this.fbService.toggleFormStatus(this.workspaceId(), this.formId());
        this._refresh();
        const status = this.form()?.status === 'published' ? 'Publicado' : 'Borrador';
        this.messageService.add({ severity: 'success', summary: status, detail: `Formulario cambiado a ${status}.` });
    }

    updateLayoutMode(mode: FormLayoutMode): void {
        this.fbService.updateForm(this.workspaceId(), this.formId(), { layoutMode: mode });
        this._refresh();
    }

    updateRequiresPayment(value: boolean): void {
        this.fbService.updateForm(this.workspaceId(), this.formId(), { requiresPayment: value });
        this._refresh();
        if (value) {
            this.messageService.add({
                severity: 'info',
                summary: 'Requiere pago',
                detail: 'Configure el precio arriba. Vincule MercadoPago en el menú Pagos.',
                life: 5000
            });
        }
    }

    updateFormConfig(payload: Partial<Pick<Form, 'paymentAmount' | 'validUntil'>>): void {
        this.fbService.updateForm(this.workspaceId(), this.formId(), payload);
        this._refresh();
    }

    getPublicFormUrl(): string {
        const f = this.form();
        if (!f || typeof window === 'undefined') return '';
        return `${window.location.origin}/forms/${f.id}`;
    }

    copyFormUrl(): void {
        navigator.clipboard.writeText(this.getPublicFormUrl()).then(() => {
            this.messageService.add({ severity: 'success', summary: 'Copiado', detail: 'Enlace copiado al portapapeles.' });
        });
    }

    initConfigForm(): void {
        const f = this.form();
        if (!f) return;
        this.configStatus.set(f.status);
        this.configRequiresPayment.set(f.requiresPayment ?? false);
        this.configPaymentAmount.set(f.paymentAmount);
        this.configLayoutMode.set((f.layoutMode ?? 'wizard') as FormLayoutMode);
        this.configValidUntil.set(f.validUntil ? f.validUntil.slice(0, 10) : undefined);
    }

    saveConfigForm(): void {
        const f = this.form();
        if (!f) return;
        this.fbService.updateForm(this.workspaceId(), this.formId(), {
            status: this.configStatus(),
            requiresPayment: this.configRequiresPayment(),
            paymentAmount: this.configRequiresPayment() ? (this.configPaymentAmount() ?? 0) : undefined,
            layoutMode: this.configLayoutMode(),
            validUntil: this.configValidUntil() || undefined
        });
        this._refresh();
        this.configDialogVisible = false;
        this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Configuración actualizada.' });
    }

    duplicateForm(): void {
        const newId = this.fbService.duplicateForm(this.workspaceId(), this.formId());
        if (newId) {
            this.messageService.add({ severity: 'success', summary: 'Duplicado', detail: 'Formulario duplicado.' });
            this.router.navigate(['/admin/workspaces', this.workspaceId(), 'forms', newId]);
        }
    }

    confirmDeleteForm(): void {
        const f = this.form();
        if (!f) return;
        this.confirmationService.confirm({
            message: `¿Está seguro de eliminar el formulario "${f.name}"? Esta acción no se puede deshacer.`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.configDialogVisible = false;
                this.fbService.deleteForm(this.workspaceId(), this.formId());
                this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Formulario eliminado.' });
                this.router.navigate(['/admin/workspaces', this.workspaceId(), 'forms']);
            }
        });
    }

    // ── Section actions ───────────────────────────────────────────────────────

    addSection(): void {
        const id = this.fbService.addSection(this.workspaceId(), this.formId());
        this._refresh();
        this.openSections.update(s => { s.add(id); return new Set(s); });
        this.messageService.add({ severity: 'success', summary: 'Sección', detail: 'Nueva sección agregada.' });
    }

    updateSectionTitle(sectionId: string, title: string): void {
        if (!title.trim()) return;
        this.fbService.updateSection(this.workspaceId(), this.formId(), sectionId, { title: title.trim() });
        this._refresh();
    }

    updateSectionDesc(sectionId: string, description: string): void {
        this.fbService.updateSection(this.workspaceId(), this.formId(), sectionId, { description: description || undefined });
        this._refresh();
    }

    deleteSection(sectionId: string): void {
        this.fbService.deleteSection(this.workspaceId(), this.formId(), sectionId);
        this._refresh();
        this.messageService.add({ severity: 'success', summary: 'Eliminada', detail: 'Sección eliminada.' });
    }

    moveSection(sectionId: string, dir: 'up' | 'down'): void {
        this.fbService.moveSection(this.workspaceId(), this.formId(), sectionId, dir);
        this._refresh();
    }

    // ── Question actions ──────────────────────────────────────────────────────

    addQuestion(sectionId: string, type: QuestionType): void {
        const id = this.fbService.addQuestion(this.workspaceId(), this.formId(), sectionId, type);
        this._refresh();
        this.openQuestions.update(s => { s.add(id); return new Set(s); });
        this.addQuestionFor.set(null);
    }

    updateQuestion(sectionId: string, questionId: string, updates: Partial<Question>): void {
        this.fbService.updateQuestion(this.workspaceId(), this.formId(), sectionId, questionId, updates);
        this._refresh();
    }

    deleteQuestion(sectionId: string, questionId: string): void {
        this.fbService.deleteQuestion(this.workspaceId(), this.formId(), sectionId, questionId);
        this._refresh();
        this.openQuestions.update(s => { const n = new Set(s); n.delete(questionId); return n; });
        this.messageService.add({ severity: 'success', summary: 'Eliminada', detail: 'Pregunta eliminada.' });
    }

    moveQuestion(sectionId: string, questionId: string, dir: 'up' | 'down'): void {
        this.fbService.moveQuestion(this.workspaceId(), this.formId(), sectionId, questionId, dir);
        this._refresh();
    }

    duplicateQuestion(sectionId: string, questionId: string): void {
        this.fbService.duplicateQuestion(this.workspaceId(), this.formId(), sectionId, questionId);
        this._refresh();
        this.messageService.add({ severity: 'success', summary: 'Duplicada', detail: 'Pregunta duplicada.' });
    }

    changeType(sectionId: string, questionId: string, type: QuestionType): void {
        this.updateQuestion(sectionId, questionId, { type, config: getDefaultConfig(type) });
        this.typeDropdownFor.set(null);
    }

    /** Merges a single key into the question config — avoids spread syntax in templates */
    patchConfig(sectionId: string, questionId: string, currentConfig: QuestionConfig,
        key: keyof QuestionConfig, value: unknown): void {
        this.updateQuestion(sectionId, questionId, { config: { ...currentConfig, [key]: value } });
    }
}
