# FormFlow - Guía de Migración a Angular 21

Este documento extrae y estructura toda la información del README principal para facilitar la implementación en Angular 21. Sirve como especificación técnica para el desarrollador Angular.

---

## Equivalencias React/Next.js → Angular

| React/Next.js | Angular 21 |
|---------------|------------|
| `React Context` + `useReducer` | `FormBuilderService` con `BehaviorSubject` (RxJS) o NgRx Store |
| Rutas por carpetas (`app/workspaces/[id]/page.tsx`) | `Angular Router` con rutas lazy-loaded |
| Componentes shadcn/ui | PrimeNG o Angular Material |
| Tailwind CSS v4 | Tailwind CSS (compatible con Angular) |
| `"use client"` | Todos los componentes Angular son interactivos por defecto |
| `useParams()` | `ActivatedRoute.params` (Observable) |
| `useRouter().push()` | `Router.navigate()` |
| `toast()` de Sonner | `MessageService` de PrimeNG o `MatSnackBar` |
| `InlineEdit` con `useState` | Componente con `@Input()/@Output()` o Two-way binding |
| Lucide React | `lucide-angular` o `@angular/material/icon` |

---

## Estructura de Carpetas Angular

```
src/
├── app/
│   ├── core/                    # Singleton services, guards
│   │   ├── services/
│   │   │   └── form-builder.service.ts
│   │   └── guards/
│   │       └── workspace-exists.guard.ts
│   │
│   ├── shared/                  # Componentes reutilizables
│   │   ├── inline-edit/
│   │   ├── question-type-icon/
│   │   ├── question-type-selector/
│   │   │   └── question-type-selector.component.ts
│   │   └── question-config-panel/
│   │
│   ├── features/                # Módulos por feature
│   │   ├── dashboard/
│   │   │   ├── dashboard.component.ts
│   │   │   ├── dashboard.routes.ts
│   │   │   ├── dashboard-header/
│   │   │   ├── workspace-card/
│   │   │   └── workspace-dialog/
│   │   │
│   │   ├── workspace/
│   │   │   ├── workspace-forms.component.ts
│   │   │   ├── workspace.routes.ts
│   │   │   ├── form-card/
│   │   │   └── form-dialog/
│   │   │
│   │   ├── form-editor/
│   │   │   ├── form-editor.component.ts
│   │   │   ├── form-editor.routes.ts
│   │   │   ├── section-editor/
│   │   │   └── question-editor/
│   │   │
│   │   ├── form-preview/
│   │   │   ├── form-preview.component.ts
│   │   │   ├── form-preview.routes.ts
│   │   │   └── preview-renderer/
│   │   │
│   │   └── domains/
│   │       ├── domains.component.ts
│   │       └── domains.routes.ts
│   │
│   ├── models/                  # Interfaces (equivalente a lib/types.ts)
│   │   └── form-builder.models.ts
│   │
│   ├── data/                    # Mock data (equivalente a lib/mock-data.ts)
│   │   └── mock-data.ts
│   │
│   ├── app.config.ts
│   ├── app.routes.ts
│   └── app.component.ts
│
├── assets/
└── styles/
    └── globals.css
```

---

## Rutas Angular (app.routes.ts)

```typescript
// Rutas principales con lazy loading
export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'domains', loadComponent: () => import('./features/domains/domains.component').then(m => m.DomainsComponent) },
  {
    path: 'workspaces/:workspaceId',
    loadComponent: () => import('./features/workspace/workspace-forms.component').then(m => m.WorkspaceFormsComponent),
    canActivate: [WorkspaceExistsGuard],
    children: [
      {
        path: 'forms/:formId',
        loadComponent: () => import('./features/form-editor/form-editor.component').then(m => m.FormEditorComponent),
        children: [
          {
            path: 'preview',
            loadComponent: () => import('./features/form-preview/form-preview.component').then(m => m.FormPreviewComponent)
          }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
```

**Alternativa con rutas planas** (sin children anidados):

```typescript
// Rutas planas
{ path: '', component: DashboardComponent },
{ path: 'domains', component: DomainsComponent },
{ path: 'workspaces/:workspaceId', component: WorkspaceFormsComponent },
{ path: 'workspaces/:workspaceId/forms/:formId', component: FormEditorComponent },
{ path: 'workspaces/:workspaceId/forms/:formId/preview', component: FormPreviewComponent },
```

---

## API del FormBuilderService

El servicio reemplaza el Context + Reducer. Expone un `BehaviorSubject<FormBuilderState>` y métodos que emiten el nuevo estado.

### Estado

```typescript
interface FormBuilderState {
  workspaces: Workspace[];
  domains: Domain[];
}
```

### Métodos públicos (equivalente a las 21 acciones)

```typescript
@Injectable({ providedIn: 'root' })
export class FormBuilderService {
  private readonly state = new BehaviorSubject<FormBuilderState>(initialState);
  readonly state$ = this.state.asObservable();

  // Workspaces (3)
  addWorkspace(): string;
  updateWorkspace(id: string, payload: Partial<Pick<Workspace, 'name' | 'description' | 'color' | 'icon'>>): void;
  deleteWorkspace(id: string): void;

  // Forms (5)
  addForm(workspaceId: string): string;
  updateForm(workspaceId: string, formId: string, payload: Partial<Pick<Form, 'name' | 'description'>>): void;
  toggleFormStatus(workspaceId: string, formId: string): void;
  deleteForm(workspaceId: string, formId: string): void;
  duplicateForm(workspaceId: string, formId: string): string;

  // Sections (4)
  addSection(workspaceId: string, formId: string): string;
  updateSection(workspaceId: string, formId: string, sectionId: string, payload: Partial<Pick<Section, 'title' | 'description'>>): void;
  deleteSection(workspaceId: string, formId: string, sectionId: string): void;
  moveSection(workspaceId: string, formId: string, sectionId: string, direction: 'up' | 'down'): void;

  // Questions (5)
  addQuestion(workspaceId: string, formId: string, sectionId: string, type: QuestionType): string;
  updateQuestion(workspaceId: string, formId: string, sectionId: string, questionId: string, payload: Partial<Question>): void;
  deleteQuestion(workspaceId: string, formId: string, sectionId: string, questionId: string): void;
  moveQuestion(workspaceId: string, formId: string, sectionId: string, questionId: string, direction: 'up' | 'down'): void;
  duplicateQuestion(workspaceId: string, formId: string, sectionId: string, questionId: string): string;

  // Domains (4)
  addDomain(): string;
  updateDomain(id: string, payload: Partial<Pick<Domain, 'name' | 'description'>>): void;
  deleteDomain(id: string): void;
  addDomainValue(domainId: string, label: string, value: string): string;
  updateDomainValue(domainId: string, valueId: string, payload: Partial<Pick<DomainValue, 'label' | 'value'>>): void;
  deleteDomainValue(domainId: string, valueId: string): void;

  // Helpers
  getWorkspace(id: string): Workspace | undefined;
  getForm(workspaceId: string, formId: string): Form | undefined;
  getDomain(id: string): Domain | undefined;
}
```

---

## Interfaces de Componentes (@Input / @Output)

### DashboardHeader
- `@Input() breadcrumbs: { label: string; url?: string }[]`
- Sin outputs (navegación vía routerLink)

### WorkspaceCard
- `@Input() workspace: Workspace`
- `@Output() edit = new EventEmitter<Workspace>()`
- `@Output() delete = new EventEmitter<Workspace>()`
- Navegación: `routerLink="/workspaces/{{ workspace.id }}"`

### WorkspaceDialog
- `@Input() open = false`
- `@Input() workspace: Workspace | null` (null = crear)

- `@Output() openChange = new EventEmitter<boolean>()`
- `@Output() save = new EventEmitter<{ name: string; description?: string; color: string; icon: string }>()`

### FormCard
- `@Input() form: Form`
- `@Input() workspaceId: string`
- `@Output() edit = new EventEmitter<Form>()`
- `@Output() delete = new EventEmitter<Form>()`
- `@Output() duplicate = new EventEmitter<Form>()`

### FormDialog
- `@Input() open = false`
- `@Input() form: Form | null`
- `@Input() workspaceId: string`
- `@Output() openChange = new EventEmitter<boolean>()`
- `@Output() save = new EventEmitter<{ name: string; description?: string }>()`

### InlineEdit
- `@Input() value: string`
- `@Input() placeholder = ''`
- `@Input() as: 'h1' | 'h2' | 'h3' | 'p' | 'span' = 'span'`
- `@Output() valueChange = new EventEmitter<string>()`

### SectionEditor
- `@Input() section: Section`
- `@Input() workspaceId: string`
- `@Input() formId: string`
- `@Input() formSections: Section[]` (para orden)
- `@Input() domains: Domain[]`
- `@Output() addQuestion = new EventEmitter<QuestionType>()`
- `@Output() moveSection = new EventEmitter<'up' | 'down'>()`
- `@Output() deleteSection = new EventEmitter<void>()`
- `@Output() sectionChange = new EventEmitter<Partial<Section>>()`

### QuestionEditor
- `@Input() question: Question`
- `@Input() sectionQuestions: Question[]`
- `@Input() domains: Domain[]`
- `@Output() questionChange = new EventEmitter<Partial<Question>>()`
- `@Output() moveQuestion = new EventEmitter<'up' | 'down'>()`
- `@Output() deleteQuestion = new EventEmitter<void>()`
- `@Output() duplicateQuestion = new EventEmitter<void>()`

### QuestionTypeIcon
- `@Input() type: QuestionType`
- `@Input() showLabel = false`
- Sin outputs (componente de presentación)

### QuestionConfigPanel
- `@Input() question: Question`
- `@Input() domains: Domain[]`
- `@Output() configChange = new EventEmitter<QuestionConfig>()`

### PreviewRenderer
- `@Input() form: Form`
- `@Output() submit = new EventEmitter<Record<string, unknown>>()`

---

## Mapa de Iconos (QuestionTypeIcon)

| Tipo | Icono Lucide | Label ES |
|------|--------------|----------|
| text | Type | Texto |
| number | Hash | Número |
| date | CalendarDays | Fecha |
| boolean | ToggleLeft | Sí/No |
| select | List | Selección única |
| multi-select | ListChecks | Selección múltiple |
| file | Upload | Archivo |
| rating | Star | Valoración |
| scale | SlidersHorizontal | Escala |
| matrix | Grid3X3 | Matriz |

---

## Config Default por Tipo (QuestionConfigPanel)

| Tipo | Config por defecto |
|------|-------------------|
| text | `{ placeholder: '' }` |
| number | `{ min: undefined, max: undefined, step: 1 }` |
| rating | `{ stars: 5 }` |
| scale | `{ scaleMin: 1, scaleMax: 10, scaleMinLabel: '', scaleMaxLabel: '' }` |
| file | `{ accept: 'image/*' }` |
| select | `{ domainId: undefined }` |
| multi-select | `{ domainId: undefined }` |
| matrix | `{ matrixRows: [], matrixColumns: [] }` |
| date, boolean | `{}` |

---

## Design Tokens (CSS para Angular)

Copiar en `styles/globals.css` o `styles.css`:

```css
:root {
  --background: oklch(0.975 0.002 250);
  --foreground: oklch(0.17 0.02 260);
  --card: oklch(1 0 0);
  --primary: oklch(0.55 0.17 250);
  --primary-foreground: oklch(0.99 0 0);
  --secondary: oklch(0.955 0.01 250);
  --muted: oklch(0.955 0.005 250);
  --muted-foreground: oklch(0.50 0.02 260);
  --accent: oklch(0.935 0.02 250);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.91 0.01 250);
  --radius: 0.625rem;
}

/* Colores de workspace */
:root {
  --ws-sky: #0ea5e9;
  --ws-green: #10b981;
  --ws-amber: #f59e0b;
  --ws-red: #ef4444;
  --ws-violet: #8b5cf6;
  --ws-pink: #ec4899;
  --ws-cyan: #06b6d4;
  --ws-lime: #84cc16;
}
```

---

## Orden de Implementación Sugerido

1. **Models** – `form-builder.models.ts` con todas las interfaces
2. **Mock data** – `mock-data.ts` con workspaces y dominios iniciales
3. **FormBuilderService** – Implementar las 21 acciones con BehaviorSubject
4. **Shared components** – InlineEdit, QuestionTypeIcon, QuestionTypeSelector, QuestionConfigPanel
5. **Dashboard** – DashboardHeader, WorkspaceCard, WorkspaceDialog
6. **Workspace** – FormCard, FormDialog
7. **Form Editor** – SectionEditor, QuestionEditor
8. **Domains** – Vista master-detail
9. **Form Preview** – PreviewRenderer con QuestionInput por tipo

---

## Dependencias Angular Recomendadas

```json
{
  "dependencies": {
    "@angular/core": "^21",
    "primeng": "^21",
    "primeicons": "^7",
    "tailwindcss": "^4",
    "lucide-angular": "^0.460",
    "date-fns": "^2.30"
  }
}
```

---

## Resumen de Información Extraída

| Aspecto | Fuente README | En esta guía |
|---------|---------------|--------------|
| Modelo de datos | § Modelo de Datos | Interfaces (copiar de types.ts) |
| 21 acciones | § Estado Global | API FormBuilderService |
| Rutas | § Estructura de Archivos | app.routes.ts |
| Componentes | § Pantallas 1-5 | @Input/@Output por componente |
| Layout/UX | § Pantallas 1-5 | Clases Tailwind, estructura |
| Colores | § Paleta | Design tokens CSS |
| Iconos | § QuestionTypeIcon | Tabla de mapeo |
| Config por tipo | § QuestionConfigPanel | Tabla default |

**Conclusión:** El README original + esta guía Angular proporcionan suficiente información para reconstruir FormFlow fielmente en Angular 21 sin necesidad de consultar el código fuente de Next.js.

---

## Apéndice: Interfaces TypeScript (copiar a `app/models/form-builder.models.ts`)

```typescript
export type QuestionType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'select'
  | 'multi-select'
  | 'file'
  | 'rating'
  | 'scale'
  | 'matrix';

export interface QuestionConfig {
  min?: number;
  max?: number;
  step?: number;
  stars?: number;
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  matrixRows?: string[];
  matrixColumns?: string[];
  accept?: string;
  placeholder?: string;
}

export interface DomainValue {
  id: string;
  domainId: string;
  label: string;
  value: string;
}

export interface Domain {
  id: string;
  name: string;
  description?: string;
  values: DomainValue[];
}

export interface Question {
  id: string;
  sectionId: string;
  type: QuestionType;
  label: string;
  description?: string;
  required: boolean;
  order: number;
  domainId?: string;
  config: QuestionConfig;
}

export interface Section {
  id: string;
  formId: string;
  title: string;
  description?: string;
  order: number;
  questions: Question[];
}

export type FormStatus = 'draft' | 'published';

export interface Form {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  status: FormStatus;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  forms: Form[];
}
```
