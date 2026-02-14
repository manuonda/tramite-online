# Diseño Arquitectónico Completo
## Sistema de Configuración de Formularios - Tramite Online

**Fecha:** 2026-02-14
**Versión:** 1.0
**Autor:** Claude Code
**Estado:** Aprobado

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura General](#arquitectura-general)
4. [Estructura de Carpetas](#estructura-de-carpetas)
5. [Rutas y Navegación](#rutas-y-navegación)
6. [Modelos de Datos](#modelos-de-datos)
7. [Sistema de Permisos](#sistema-de-permisos)
8. [Services con Signals](#services-con-signals)
9. [Componentes Clave](#componentes-clave)
10. [Domain Values](#domain-values)
11. [Form Submissions](#form-submissions)
12. [Best Practices Angular 20+](#best-practices-angular-20)
13. [Plan de Implementación](#plan-de-implementación)
14. [Convenciones](#convenciones)

---

## 📋 Resumen Ejecutivo

### ¿Qué vamos a construir?

Un sistema de configuración de formularios con dos áreas principales:

#### 🔒 Área Privada/Admin (`/admin/*`)
- Gestión de workspaces (espacios de trabajo)
- Configuración de formularios con dos modos:
  - **CRUD Mode**: Formularios tradicionales por tabs
  - **Preview Mode**: Editor con preview en tiempo real
- Gestión de secciones y preguntas con tipos configurables
- Gestión de domain values (valores de dominio) con creación inline
- Gestión de miembros con permisos granulares (RBAC)
- Visualización de submissions (respuestas)

#### 🌐 Área Pública (`/forms/*`)
- Listado de formularios públicos
- Wizard horizontal/vertical con PrimeNG Stepper
- Envío de respuestas (anónimo o autenticado)

### Características Clave

✅ **Angular 21** con Signals y standalone components
✅ **PrimeNG 21** para UI components
✅ **TailwindCSS 4** para estilos
✅ **Arquitectura Feature-Based** (Core/Shared/Features)
✅ **RBAC** (Role-Based Access Control)
✅ **Lazy Loading** de features
✅ **Separación clara** público vs privado
✅ **Domain Values dinámicos** con cache
✅ **Creación inline** de domain values
✅ **Permisos granulares** por recurso
✅ **100% TypeScript** con strict mode
✅ **OnPush Change Detection** en todos los componentes

---

## 🛠️ Stack Tecnológico

### Frontend Core
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Angular** | 21 | Framework principal |
| **TypeScript** | 5.9.3 | Lenguaje tipado |
| **RxJS** | 7.8.0 | Programación reactiva |
| **Signals** | Built-in | State management reactivo |

### UI & Styling
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **PrimeNG** | 21.0.2 | Componentes UI |
| **PrimeIcons** | 7.0.0 | Iconos |
| **TailwindCSS** | 4.1.11 | Utility-first CSS |
| **Tailwind PrimeUI** | 0.6.1 | Integración Tailwind + PrimeNG |

### Build & Development
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Angular CLI** | 21 | Tooling |
| **Vite** | Built-in | Build tool |
| **ESLint** | 9.14.0 | Linting |
| **Prettier** | 3.0.0 | Code formatting |

### Testing
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Jasmine** | 5.4.0 | Testing framework |
| **Karma** | 6.4.0 | Test runner |

---

## 🏗️ Arquitectura General

### Patrón: Feature-Based con Core/Shared

```
┌─────────────────────────────────────────────────────┐
│                   APPLICATION                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │     CORE     │  │    SHARED    │  │  FEATURES │ │
│  │              │  │              │  │           │ │
│  │ • Auth       │  │ • Components │  │ • Admin   │ │
│  │ • Guards     │  │ • Pipes      │  │ • Public  │ │
│  │ • Intercept. │  │ • Directives │  │           │ │
│  │ • Layout     │  │ • Utils      │  │           │ │
│  │ • Services   │  │              │  │           │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Principios Arquitectónicos

1. **Separation of Concerns**: Core, Shared, Features claramente separados
2. **Lazy Loading**: Features cargadas bajo demanda
3. **Standalone Components**: Todos los componentes son standalone (default en v21)
4. **Signals First**: State management con signals nativos de Angular
5. **OnPush Always**: ChangeDetectionStrategy.OnPush en todos los componentes
6. **RBAC**: Control de acceso basado en roles y permisos
7. **DRY**: Reutilización a través de Shared
8. **Feature Isolation**: Cada feature es independiente
9. **Type Safety**: TypeScript strict mode activado

---

## 📁 Estructura de Carpetas

```
src/
├── app/
│   ├── core/                                    # Singleton, app-wide
│   │   ├── auth/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── permission.service.ts
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── role.guard.ts
│   │   │   │   └── permission.guard.ts
│   │   │   └── models/
│   │   │       ├── auth.model.ts
│   │   │       ├── user.model.ts
│   │   │       ├── permission.model.ts
│   │   │       └── role.model.ts
│   │   │
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts
│   │   │   ├── error.interceptor.ts
│   │   │   └── loading.interceptor.ts
│   │   │
│   │   ├── services/
│   │   │   ├── api.service.ts
│   │   │   └── cache.service.ts
│   │   │
│   │   └── layout/
│   │       ├── admin-layout/
│   │       │   ├── admin-layout.component.ts
│   │       │   ├── admin-layout.component.html
│   │       │   ├── admin-layout.component.scss
│   │       │   └── components/
│   │       │       ├── admin-topbar/
│   │       │       ├── admin-sidebar/
│   │       │       └── admin-footer/
│   │       │
│   │       └── public-layout/
│   │           ├── public-layout.component.ts
│   │           ├── public-layout.component.html
│   │           ├── public-layout.component.scss
│   │           └── components/
│   │               ├── public-header/
│   │               └── public-footer/
│   │
│   ├── shared/                                  # Reusables
│   │   ├── components/
│   │   │   ├── data-table/
│   │   │   ├── confirm-dialog/
│   │   │   ├── loading-spinner/
│   │   │   ├── permission-badge/
│   │   │   └── dynamic-form/
│   │   │       ├── dynamic-form.component.ts
│   │   │       └── question-types/
│   │   │           ├── input-question/
│   │   │           ├── select-question/
│   │   │           ├── textarea-question/
│   │   │           ├── checkbox-question/
│   │   │           ├── radio-question/
│   │   │           ├── date-question/
│   │   │           └── file-question/
│   │   │
│   │   ├── pipes/
│   │   │   ├── safe-html.pipe.ts
│   │   │   └── has-permission.pipe.ts
│   │   │
│   │   ├── directives/
│   │   │   └── has-permission.directive.ts
│   │   │
│   │   ├── models/
│   │   │   └── common.model.ts
│   │   │
│   │   └── utils/
│   │       ├── validators.ts
│   │       └── helpers.ts
│   │
│   ├── features/                                # FEATURES MODULES
│   │   │
│   │   ├── admin/                               # ÁREA ADMIN
│   │   │   ├── dashboard/
│   │   │   │
│   │   │   ├── workspace/                       # Workspaces
│   │   │   │   ├── pages/
│   │   │   │   │   ├── workspace-list/
│   │   │   │   │   ├── workspace-detail/
│   │   │   │   │   ├── workspace-create/
│   │   │   │   │   └── workspace-settings/
│   │   │   │   │
│   │   │   │   ├── features/                    # Sub-features
│   │   │   │   │   │
│   │   │   │   │   ├── form-builder/           # Constructor de formularios
│   │   │   │   │   │   ├── pages/
│   │   │   │   │   │   │   ├── form-list/
│   │   │   │   │   │   │   ├── form-builder/
│   │   │   │   │   │   │   └── form-preview/
│   │   │   │   │   │   │
│   │   │   │   │   │   ├── components/
│   │   │   │   │   │   │   ├── builder-mode-toggle/
│   │   │   │   │   │   │   ├── crud-mode/
│   │   │   │   │   │   │   │   ├── form-basic-info/
│   │   │   │   │   │   │   │   ├── sections-tab/
│   │   │   │   │   │   │   │   └── questions-tab/
│   │   │   │   │   │   │   │
│   │   │   │   │   │   │   ├── preview-mode/
│   │   │   │   │   │   │   │   ├── editor-panel/
│   │   │   │   │   │   │   │   └── preview-panel/
│   │   │   │   │   │   │   │
│   │   │   │   │   │   │   ├── section-editor/
│   │   │   │   │   │   │   └── question-configurator/
│   │   │   │   │   │   │
│   │   │   │   │   │   ├── services/
│   │   │   │   │   │   │   ├── form.service.ts
│   │   │   │   │   │   │   ├── section.service.ts
│   │   │   │   │   │   │   └── question.service.ts
│   │   │   │   │   │   │
│   │   │   │   │   │   ├── models/
│   │   │   │   │   │   │   ├── form.model.ts
│   │   │   │   │   │   │   ├── section.model.ts
│   │   │   │   │   │   │   ├── question.model.ts
│   │   │   │   │   │   │   └── question-config.model.ts
│   │   │   │   │   │   │
│   │   │   │   │   │   └── form-builder.routes.ts
│   │   │   │   │   │
│   │   │   │   │   ├── domain-values/          # Valores de dominio
│   │   │   │   │   │   ├── pages/
│   │   │   │   │   │   ├── components/
│   │   │   │   │   │   │   ├── domain-value-editor/
│   │   │   │   │   │   │   ├── domain-item-list/
│   │   │   │   │   │   │   └── create-domain-dialog/
│   │   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── models/
│   │   │   │   │   │   └── domain-values.routes.ts
│   │   │   │   │   │
│   │   │   │   │   ├── members/                # Miembros del workspace
│   │   │   │   │   │   ├── pages/
│   │   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── models/
│   │   │   │   │   │   └── members.routes.ts
│   │   │   │   │   │
│   │   │   │   │   └── submissions/            # Respuestas
│   │   │   │   │       ├── pages/
│   │   │   │   │       ├── components/
│   │   │   │   │       ├── services/
│   │   │   │   │       ├── models/
│   │   │   │   │       └── submissions.routes.ts
│   │   │   │   │
│   │   │   │   ├── components/
│   │   │   │   ├── services/
│   │   │   │   │   └── workspace.service.ts
│   │   │   │   ├── models/
│   │   │   │   │   └── workspace.model.ts
│   │   │   │   └── workspace.routes.ts
│   │   │   │
│   │   │   ├── users/                           # Gestión de usuarios
│   │   │   │   ├── pages/
│   │   │   │   ├── components/
│   │   │   │   ├── services/
│   │   │   │   ├── models/
│   │   │   │   └── users.routes.ts
│   │   │   │
│   │   │   └── roles/                           # Gestión de roles
│   │   │       ├── pages/
│   │   │       ├── components/
│   │   │       ├── services/
│   │   │       ├── models/
│   │   │       └── roles.routes.ts
│   │   │
│   │   ├── public/                              # ÁREA PÚBLICA
│   │   │   ├── home/
│   │   │   └── form-wizard/
│   │   │       ├── pages/
│   │   │       │   ├── form-list/
│   │   │       │   └── form-wizard/
│   │   │       ├── components/
│   │   │       │   ├── wizard-stepper/
│   │   │       │   ├── wizard-step/
│   │   │       │   └── question-renderer/
│   │   │       ├── services/
│   │   │       ├── models/
│   │   │       └── form-wizard.routes.ts
│   │   │
│   │   └── auth/                                # AUTENTICACIÓN
│   │       ├── pages/
│   │       │   ├── login/
│   │       │   ├── register/
│   │       │   └── forgot-password/
│   │       └── auth.routes.ts
│   │
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
│
├── assets/
├── environments/
├── index.html
└── main.ts
```

---

## 🛣️ Rutas y Navegación

### Archivo Principal de Rutas

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { permissionGuard } from './core/auth/guards/permission.guard';
import { roleGuard } from './core/auth/guards/role.guard';

export const routes: Routes = [
  // ÁREA PÚBLICA
  {
    path: '',
    loadComponent: () => import('./core/layout/public-layout/public-layout.component')
      .then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./features/public/home/home.component')
          .then(m => m.HomeComponent)
      },
      {
        path: 'forms',
        loadChildren: () => import('./features/public/form-wizard/form-wizard.routes')
          .then(m => m.FORM_WIZARD_ROUTES)
      }
    ]
  },

  // ÁREA ADMIN
  {
    path: 'admin',
    loadComponent: () => import('./core/layout/admin-layout/admin-layout.component')
      .then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'workspaces',
        loadChildren: () => import('./features/admin/workspace/workspace.routes')
          .then(m => m.WORKSPACE_ROUTES),
        canActivate: [permissionGuard],
        data: { permission: 'workspace:view' }
      },
      {
        path: 'users',
        loadChildren: () => import('./features/admin/users/users.routes')
          .then(m => m.USER_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'SUPER_ADMIN'] }
      },
      {
        path: 'roles',
        loadChildren: () => import('./features/admin/roles/roles.routes')
          .then(m => m.ROLE_ROUTES),
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] }
      }
    ]
  },

  // AUTENTICACIÓN
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
      .then(m => m.AUTH_ROUTES)
  },

  // ERROR PAGES
  {
    path: 'access-denied',
    loadComponent: () => import('./features/public/access-denied/access-denied.component')
      .then(m => m.AccessDeniedComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./features/public/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  }
];
```

### Rutas de Workspace (anidadas)

```typescript
// features/admin/workspace/workspace.routes.ts
import { Routes } from '@angular/router';
import { permissionGuard } from '@core/auth/guards/permission.guard';

export const WORKSPACE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/workspace-list/workspace-list.component')
      .then(m => m.WorkspaceListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/workspace-create/workspace-create.component')
      .then(m => m.WorkspaceCreateComponent),
    canActivate: [permissionGuard],
    data: { permission: 'workspace:create' }
  },
  {
    path: ':workspaceId',
    loadComponent: () => import('./pages/workspace-detail/workspace-detail.component')
      .then(m => m.WorkspaceDetailComponent),
    children: [
      {
        path: 'forms',
        loadChildren: () => import('./features/form-builder/form-builder.routes')
          .then(m => m.FORM_BUILDER_ROUTES),
        canActivate: [permissionGuard],
        data: { permission: 'form:view' }
      },
      {
        path: 'domain-values',
        loadChildren: () => import('./features/domain-values/domain-values.routes')
          .then(m => m.DOMAIN_VALUES_ROUTES),
        canActivate: [permissionGuard],
        data: { permission: 'domain-value:view' }
      },
      {
        path: 'members',
        loadChildren: () => import('./features/members/members.routes')
          .then(m => m.MEMBERS_ROUTES),
        canActivate: [permissionGuard],
        data: { permission: 'member:view' }
      },
      {
        path: 'submissions',
        loadChildren: () => import('./features/submissions/submissions.routes')
          .then(m => m.SUBMISSIONS_ROUTES),
        canActivate: [permissionGuard],
        data: { permission: 'submission:view' }
      }
    ]
  }
];
```

---

## 📊 Modelos de Datos

### Workspace

```typescript
// features/admin/workspace/models/workspace.model.ts
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  status: WorkspaceStatus;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
}

export enum WorkspaceStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED'
}
```

### Form

```typescript
// features/admin/workspace/features/form-builder/models/form.model.ts
export interface Form {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  status: FormStatus;
  sections: Section[];
  settings: FormSettings;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  publishedAt?: Date;
}

export enum FormStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export interface FormSettings {
  allowAnonymous: boolean;
  requireLogin: boolean;
  multipleSubmissions: boolean;
  wizardOrientation: 'horizontal' | 'vertical';
  showProgressBar: boolean;
  thankYouMessage?: string;
}
```

### Section

```typescript
// features/admin/workspace/features/form-builder/models/section.model.ts
export interface Section {
  id: string;
  formId: string;
  title: string;
  description?: string;
  order: number;
  questions: Question[];
}
```

### Question

```typescript
// features/admin/workspace/features/form-builder/models/question.model.ts
export interface Question {
  id: string;
  sectionId: string;
  label: string;
  type: QuestionType;
  required: boolean;
  order: number;
  config: QuestionConfig;
  validation?: QuestionValidation;
}

export enum QuestionType {
  INPUT = 'INPUT',
  TEXTAREA = 'TEXTAREA',
  SELECT = 'SELECT',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
  DATE = 'DATE',
  FILE = 'FILE'
}

export interface QuestionConfig {
  // Para INPUT
  inputType?: 'text' | 'number' | 'email' | 'tel' | 'url';
  placeholder?: string;

  // Para SELECT, CHECKBOX, RADIO
  domainValueId?: string;
  customOptions?: OptionItem[];
  multiple?: boolean;

  // Para TEXTAREA
  rows?: number;
  maxLength?: number;

  // Para FILE
  acceptedFormats?: string[];
  maxFileSize?: number;

  // Para DATE
  minDate?: Date;
  maxDate?: Date;
}

export interface OptionItem {
  label: string;
  value: string;
  order?: number;
}

export interface QuestionValidation {
  min?: number;
  max?: number;
  pattern?: string;
  customErrorMessage?: string;
}
```

### Domain Value

```typescript
// features/admin/workspace/features/domain-values/models/domain-value.model.ts
export interface DomainValue {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  scope: DomainValueScope;
  workspaceId?: string;
  items: DomainValueItem[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export enum DomainValueScope {
  GLOBAL = 'GLOBAL',
  WORKSPACE = 'WORKSPACE'
}

export interface DomainValueItem {
  id?: string;
  label: string;
  value: string;
  order?: number;
  enabled?: boolean;
  metadata?: Record<string, any>;
}
```

### Member

```typescript
// features/admin/workspace/features/members/models/member.model.ts
export interface WorkspaceMember {
  id: string;
  userId: string;
  user: User;
  workspaceId: string;
  role: WorkspaceRole;
  customPermissions?: Permission[];
  invitedBy: string;
  joinedAt: Date;
}

export enum WorkspaceRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER'
}
```

### Submission

```typescript
// features/admin/workspace/features/submissions/models/submission.model.ts
export interface FormSubmission {
  id: string;
  formId: string;
  workspaceId: string;
  submittedBy?: string;
  submittedByEmail?: string;
  answers: SubmissionAnswer[];
  status: SubmissionStatus;
  submittedAt: Date;
  updatedAt: Date;
  metadata?: SubmissionMetadata;
}

export interface SubmissionAnswer {
  questionId: string;
  sectionId: string;
  questionType: QuestionType;
  value: SubmissionValue;
  metadata?: {
    answeredAt?: Date;
    timeSpent?: number;
  };
}

export type SubmissionValue =
  | string
  | string[]
  | number
  | boolean
  | Date
  | FileUpload
  | null;

export interface FileUpload {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

export enum SubmissionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface SubmissionMetadata {
  ipAddress?: string;
  userAgent?: string;
  totalTimeSpent?: number;
}
```

---

## 🔐 Sistema de Permisos

### Permission Model

```typescript
// core/auth/models/permission.model.ts
export interface Permission {
  id: string;
  resource: ResourceType;
  action: ActionType;
  scope: PermissionScope;
}

export enum ResourceType {
  WORKSPACE = 'workspace',
  FORM = 'form',
  SECTION = 'section',
  QUESTION = 'question',
  DOMAIN_VALUE = 'domain-value',
  MEMBER = 'member',
  USER = 'user',
  ROLE = 'role',
  SUBMISSION = 'submission'
}

export enum ActionType {
  VIEW = 'view',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
  PUBLISH = 'publish',
  ARCHIVE = 'archive',
  MANAGE = 'manage'
}

export enum PermissionScope {
  GLOBAL = 'GLOBAL',
  WORKSPACE = 'WORKSPACE'
}

export type PermissionString = `${ResourceType}:${ActionType}`;
```

### Matriz de Permisos (Workspace Roles)

| Recurso | OWNER | ADMIN | EDITOR | VIEWER |
|---------|-------|-------|--------|--------|
| workspace | ✅ manage | ✅ edit | ❌ | ❌ |
| form | ✅ todas | ✅ todas | ✅ create/edit/publish | ✅ view |
| member | ✅ todas | ✅ todas | ❌ | ✅ view |
| domain-value | ✅ todas | ✅ todas | ✅ create/edit | ✅ view |
| submission | ✅ todas | ✅ todas | ✅ view/export | ✅ view |

### Permission Service

```typescript
// core/auth/services/permission.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private currentUser = signal<User | null>(null);
  private currentWorkspace = signal<string | null>(null);
  private workspacePermissions = signal<Permission[]>([]);

  constructor() {
    this.initPermissions();
  }

  private initPermissions() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });
  }

  setCurrentWorkspace(workspaceId: string) {
    this.currentWorkspace.set(workspaceId);
    this.loadWorkspacePermissions(workspaceId);
  }

  private loadWorkspacePermissions(workspaceId: string) {
    this.http.get<Permission[]>(
      `/api/workspaces/${workspaceId}/my-permissions`
    ).subscribe(permissions => {
      this.workspacePermissions.set(permissions);
    });
  }

  hasPermission(permission: PermissionString): boolean {
    const user = this.currentUser();
    if (!user) return false;

    if (user.globalRole === GlobalRole.SUPER_ADMIN) {
      return true;
    }

    const [resource, action] = permission.split(':') as [ResourceType, ActionType];

    if (this.hasGlobalPermission(resource, action)) {
      return true;
    }

    return this.hasWorkspacePermission(resource, action);
  }

  private hasGlobalPermission(resource: ResourceType, action: ActionType): boolean {
    const user = this.currentUser();
    if (!user) return false;

    if (user.globalRole === GlobalRole.ADMIN) {
      if (resource === 'user' && ['view', 'create', 'edit'].includes(action)) {
        return true;
      }
    }

    return false;
  }

  private hasWorkspacePermission(resource: ResourceType, action: ActionType): boolean {
    const permissions = this.workspacePermissions();
    return permissions.some(p => p.resource === resource && p.action === action);
  }

  canCreateForm = computed(() => this.hasPermission('form:create'));
  canEditForm = computed(() => this.hasPermission('form:edit'));
  canDeleteForm = computed(() => this.hasPermission('form:delete'));
}
```

### Permission Guard

```typescript
// core/auth/guards/permission.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../services/permission.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  const requiredPermission = route.data['permission'] as PermissionString;

  if (!requiredPermission) {
    console.warn('No permission specified in route data');
    return true;
  }

  if (permissionService.hasPermission(requiredPermission)) {
    return true;
  }

  router.navigate(['/access-denied']);
  return false;
};
```

### Permission Directive

```typescript
// shared/directives/has-permission.directive.ts
import { Directive, input, effect, inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionService } from '@core/auth/services/permission.service';

@Directive({
  selector: '[hasPermission]'
})
export class HasPermissionDirective {
  hasPermission = input.required<PermissionString>();

  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);
  private permissionService = inject(PermissionService);

  constructor() {
    effect(() => {
      const permission = this.hasPermission();
      const hasPermission = this.permissionService.hasPermission(permission);

      if (hasPermission) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}
```

**Uso en templates:**

```html
<!-- Botón solo visible si tiene permiso -->
<button
  *hasPermission="'form:create'"
  pButton
  label="Crear Formulario"
  (click)="createForm()">
</button>
```

---

## ⚙️ Services con Signals

### Workspace Service

```typescript
// features/admin/workspace/services/workspace.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private http = inject(HttpClient);

  private workspaces = signal<Workspace[]>([]);
  private currentWorkspace = signal<Workspace | null>(null);
  private loading = signal(false);

  // Computed signals
  activeWorkspaces = computed(() =>
    this.workspaces().filter(w => w.status === WorkspaceStatus.ACTIVE)
  );

  archivedWorkspaces = computed(() =>
    this.workspaces().filter(w => w.status === WorkspaceStatus.ARCHIVED)
  );

  // Readonly signals para consumidores
  workspaces$ = this.workspaces.asReadonly();
  currentWorkspace$ = this.currentWorkspace.asReadonly();
  loading$ = this.loading.asReadonly();

  loadMyWorkspaces() {
    this.loading.set(true);
    this.http.get<Workspace[]>('/api/workspaces/my').subscribe({
      next: (workspaces) => {
        this.workspaces.set(workspaces);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading workspaces', err);
        this.loading.set(false);
      }
    });
  }

  getWorkspace(id: string) {
    return this.http.get<Workspace>(`/api/workspaces/${id}`);
  }

  setCurrentWorkspace(workspace: Workspace) {
    this.currentWorkspace.set(workspace);
  }

  create(data: CreateWorkspaceDto) {
    return this.http.post<Workspace>('/api/workspaces', data);
  }

  update(id: string, data: UpdateWorkspaceDto) {
    return this.http.put<Workspace>(`/api/workspaces/${id}`, data);
  }

  archive(id: string) {
    return this.http.post<Workspace>(`/api/workspaces/${id}/archive`, {});
  }
}
```

### Domain Value Service (con Cache)

```typescript
// features/admin/workspace/features/domain-values/services/domain-value.service.ts
import { Injectable, signal, inject, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DomainValueService {
  private http = inject(HttpClient);
  private cache = new Map<string, Signal<DomainValueItem[]>>();

  getByWorkspace(workspaceId: string) {
    return this.http.get<DomainValue[]>(`/api/workspaces/${workspaceId}/domain-values`);
  }

  getGlobal() {
    return this.http.get<DomainValue[]>('/api/domain-values/global');
  }

  getItems(domainValueId: string): Signal<DomainValueItem[]> {
    if (this.cache.has(domainValueId)) {
      return this.cache.get(domainValueId)!;
    }

    const items = toSignal(
      this.http.get<DomainValueItem[]>(
        `/api/domain-values/${domainValueId}/items`
      ).pipe(shareReplay(1)),
      { initialValue: [] }
    );

    this.cache.set(domainValueId, items);
    return items;
  }

  create(workspaceId: string, data: CreateDomainValueDto) {
    return this.http.post<DomainValue>(
      `/api/workspaces/${workspaceId}/domain-values`,
      data
    );
  }

  update(domainValueId: string, data: UpdateDomainValueDto) {
    this.invalidateCache(domainValueId);
    return this.http.put<DomainValue>(
      `/api/domain-values/${domainValueId}`,
      data
    );
  }

  invalidateCache(domainValueId: string) {
    this.cache.delete(domainValueId);
  }
}
```

---

## 🎯 Componentes Clave (Angular 20+ Best Practices)

### Workspace List Component

```typescript
// features/admin/workspace/pages/workspace-list/workspace-list.component.ts
import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { WorkspaceService } from '../../services/workspace.service';
import { PermissionService } from '@core/auth/services/permission.service';

@Component({
  selector: 'app-workspace-list',
  templateUrl: './workspace-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkspaceListComponent {
  private workspaceService = inject(WorkspaceService);
  private permissionService = inject(PermissionService);
  private router = inject(Router);

  workspaces = this.workspaceService.workspaces$;
  loading = this.workspaceService.loading$;

  canCreate = computed(() => this.permissionService.hasPermission('workspace:create'));

  ngOnInit() {
    this.workspaceService.loadMyWorkspaces();
  }

  createWorkspace() {
    if (this.canCreate()) {
      this.router.navigate(['/admin/workspaces/create']);
    }
  }

  openWorkspace(workspace: Workspace) {
    this.router.navigate(['/admin/workspaces', workspace.id]);
  }
}
```

```html
<!-- workspace-list.component.html -->
<div class="workspace-list">
  <div class="header">
    <h2>Mis Espacios de Trabajo</h2>

    @if (canCreate()) {
      <button
        pButton
        label="Crear Workspace"
        icon="pi pi-plus"
        (click)="createWorkspace()">
      </button>
    }
  </div>

  @if (loading()) {
    <app-loading-spinner></app-loading-spinner>
  }

  @if (!loading()) {
    <div class="workspace-grid">
      @for (workspace of workspaces(); track workspace.id) {
        <app-workspace-card
          [workspace]="workspace"
          (click)="openWorkspace(workspace)">
        </app-workspace-card>
      }
    </div>
  }
</div>
```

### Form Builder Component

```typescript
// features/admin/workspace/features/form-builder/pages/form-builder/form-builder.component.ts
import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormBuilderComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formService = inject(FormService);

  form = signal<Form | null>(null);
  mode = signal<'crud' | 'preview'>('crud');

  isEditMode = computed(() => !!this.form()?.id);
  formTitle = computed(() =>
    this.isEditMode() ? 'Editar Formulario' : 'Crear Formulario'
  );

  constructor() {
    this.loadForm();
  }

  private loadForm() {
    const formId = this.route.snapshot.paramMap.get('formId');
    const workspaceId = this.route.snapshot.paramMap.get('workspaceId');

    if (formId && workspaceId) {
      this.formService.getForm(workspaceId, formId).subscribe(form => {
        this.form.set(form);
      });
    }
  }

  switchMode(mode: 'crud' | 'preview') {
    this.mode.set(mode);
  }

  saveForm() {
    const formData = this.form();
    if (!formData) return;

    const workspaceId = this.route.snapshot.paramMap.get('workspaceId')!;

    if (this.isEditMode()) {
      this.formService.update(workspaceId, formData.id, formData).subscribe(
        updatedForm => this.form.set(updatedForm)
      );
    } else {
      this.formService.create(workspaceId, formData).subscribe(
        createdForm => {
          this.form.set(createdForm);
          this.router.navigate(['../', createdForm.id, 'edit'], { relativeTo: this.route });
        }
      );
    }
  }
}
```

```html
<!-- form-builder.component.html -->
<div class="form-builder">
  <div class="builder-header">
    <h2>{{ formTitle() }}</h2>

    <app-builder-mode-toggle
      [currentMode]="mode()"
      (modeChange)="switchMode($event)">
    </app-builder-mode-toggle>

    <button
      pButton
      [label]="isEditMode() ? 'Actualizar' : 'Crear'"
      icon="pi pi-save"
      (click)="saveForm()">
    </button>
  </div>

  <div class="builder-content">
    @if (mode() === 'crud') {
      <app-crud-mode
        [form]="form()"
        (formChange)="form.set($event)">
      </app-crud-mode>
    }

    @if (mode() === 'preview') {
      <app-preview-mode
        [form]="form()"
        (formChange)="form.set($event)">
      </app-preview-mode>
    }
  </div>
</div>
```

### Question Configurator (con Domain Value inline)

```typescript
// form-builder/components/question-configurator/question-configurator.component.ts
import { Component, signal, input, output, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { DomainValueService } from '../../../domain-values/services/domain-value.service';

@Component({
  selector: 'app-question-configurator',
  templateUrl: './question-configurator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionConfiguratorComponent {
  // Inputs con signal API
  question = input.required<Question>();
  workspaceId = input.required<string>();

  // Outputs con signal API
  questionChange = output<Question>();

  // Inject dependencies
  private domainValueService = inject(DomainValueService);
  private dialogService = inject(DialogService);

  // Local state
  availableDomainValues = signal<DomainValue[]>([]);
  selectedDomainValue = signal<DomainValue | null>(null);
  dataSource = signal<'existing' | 'new' | 'custom'>('existing');

  // Computed
  hasSelectedDomain = computed(() => !!this.selectedDomainValue());
  showDomainConfig = computed(() =>
    this.question().type === 'SELECT' ||
    this.question().type === 'CHECKBOX' ||
    this.question().type === 'RADIO'
  );

  ngOnInit() {
    this.loadAvailableDomainValues();
  }

  loadAvailableDomainValues() {
    this.domainValueService.getByWorkspace(this.workspaceId()).subscribe(
      values => this.availableDomainValues.set(values)
    );
  }

  openCreateDomainValueDialog() {
    const ref = this.dialogService.open(CreateDomainDialogComponent, {
      header: '✨ Crear Domain Value',
      width: '600px',
      data: { workspaceId: this.workspaceId() }
    });

    ref.onClose.subscribe((newDomainValue: DomainValue | null) => {
      if (newDomainValue) {
        this.availableDomainValues.update(values => [...values, newDomainValue]);
        this.selectedDomainValue.set(newDomainValue);

        this.questionChange.emit({
          ...this.question(),
          config: {
            ...this.question().config,
            domainValueId: newDomainValue.id
          }
        });
      }
    });
  }
}
```

```html
<!-- question-configurator.component.html -->
<div class="question-configurator">
  <div class="field">
    <label>Label</label>
    <input
      type="text"
      pInputText
      [value]="question().label" />
  </div>

  <div class="field">
    <label>Tipo</label>
    <p-dropdown
      [options]="questionTypes"
      optionLabel="label"
      optionValue="value">
    </p-dropdown>
  </div>

  @if (showDomainConfig()) {
    <div class="field">
      <label>Fuente de datos</label>

      <p-selectButton
        [options]="dataSourceOptions"
        [(ngModel)]="dataSource">
      </p-selectButton>

      @if (dataSource() === 'existing') {
        <div class="mt-3">
          <p-dropdown
            [options]="availableDomainValues()"
            optionLabel="displayName"
            placeholder="Seleccionar domain value"
            [(ngModel)]="selectedDomainValue">
          </p-dropdown>

          <button
            pButton
            label="+ Crear nuevo"
            class="mt-2"
            (click)="openCreateDomainValueDialog()">
          </button>
        </div>
      }

      @if (dataSource() === 'custom') {
        <div class="mt-3">
          <app-custom-options-editor
            [options]="question().config.customOptions || []"
            (optionsChange)="updateCustomOptions($event)">
          </app-custom-options-editor>
        </div>
      }
    </div>
  }

  <div class="field">
    <label class="flex items-center">
      <p-checkbox
        [binary]="true"
        [(ngModel)]="required">
      </p-checkbox>
      <span class="ml-2">Requerida</span>
    </label>
  </div>
</div>
```

### Form Wizard (Público)

```typescript
// features/public/form-wizard/pages/form-wizard/form-wizard.component.ts
import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormSubmissionService } from '../../services/form-submission.service';

@Component({
  selector: 'app-form-wizard',
  templateUrl: './form-wizard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormWizardComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private submissionService = inject(FormSubmissionService);

  form = signal<Form | null>(null);
  currentStep = signal(0);
  answers = signal<Map<string, any>>(new Map());

  sections = computed(() => this.form()?.sections || []);
  isLastStep = computed(() => this.currentStep() === this.sections().length - 1);
  canProceed = computed(() => this.validateCurrentSection());

  constructor() {
    this.loadForm();
  }

  private loadForm() {
    const formId = this.route.snapshot.paramMap.get('formId');
    if (formId) {
      this.submissionService.getPublicForm(formId).subscribe(form => {
        this.form.set(form);
      });
    }
  }

  private validateCurrentSection(): boolean {
    const currentSection = this.sections()[this.currentStep()];
    if (!currentSection) return false;

    return currentSection.questions
      .filter(q => q.required)
      .every(q => this.answers().has(q.id));
  }

  nextStep() {
    if (this.canProceed()) {
      this.currentStep.update(step => step + 1);
    }
  }

  previousStep() {
    this.currentStep.update(step => Math.max(0, step - 1));
  }

  updateAnswer(questionId: string, value: any) {
    this.answers.update(map => {
      const newMap = new Map(map);
      newMap.set(questionId, value);
      return newMap;
    });
  }

  submit() {
    const submission: FormSubmission = {
      formId: this.form()!.id,
      answers: Array.from(this.answers().entries()).map(([questionId, value]) => ({
        questionId,
        value
      }))
    };

    this.submissionService.submit(submission).subscribe({
      next: () => {
        this.router.navigate(['/forms/success']);
      },
      error: (err) => {
        console.error('Error submitting form', err);
      }
    });
  }
}
```

```html
<!-- form-wizard.component.html -->
<div class="form-wizard">
  <h1>{{ form()?.name }}</h1>
  <p>{{ form()?.description }}</p>

  <p-stepper
    [linear]="true"
    [activeStep]="currentStep()"
    [orientation]="form()?.settings.wizardOrientation || 'horizontal'">

    @for (section of sections(); track section.id; let i = $index) {
      <p-step [label]="section.title">
        <div class="section-content">
          <h2>{{ section.title }}</h2>
          <p>{{ section.description }}</p>

          @for (question of section.questions; track question.id) {
            <app-question-renderer
              [question]="question"
              [value]="answers().get(question.id)"
              (valueChange)="updateAnswer(question.id, $event)">
            </app-question-renderer>
          }
        </div>

        <div class="wizard-navigation">
          @if (i > 0) {
            <button
              pButton
              label="Anterior"
              icon="pi pi-arrow-left"
              (click)="previousStep()">
            </button>
          }

          @if (!isLastStep()) {
            <button
              pButton
              label="Siguiente"
              icon="pi pi-arrow-right"
              [disabled]="!canProceed()"
              (click)="nextStep()">
            </button>
          }

          @if (isLastStep()) {
            <button
              pButton
              label="Enviar"
              icon="pi pi-check"
              [disabled]="!canProceed()"
              (click)="submit()">
            </button>
          }
        </div>
      </p-step>
    }
  </p-stepper>
</div>
```

---

## 📚 Best Practices Angular 20+

### ✅ DO (Hacer)

```typescript
// ✅ Usar input() y output() functions
export class MyComponent {
  data = input.required<Data>();
  itemSelected = output<Item>();
}

// ✅ Usar inject() en lugar de constructor injection
export class MyService {
  private http = inject(HttpClient);
}

// ✅ Usar ChangeDetectionStrategy.OnPush siempre
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})

// ✅ Usar @if, @for en templates
@if (condition) {
  <div>Content</div>
}

@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}

// ✅ Usar class/style bindings
<div [class.active]="isActive()"></div>
<div [style.color]="color()"></div>

// ✅ Usar signals con update() o set()
count.set(5);
count.update(c => c + 1);

// ✅ Usar computed() para estado derivado
filteredItems = computed(() =>
  this.items().filter(i => i.active)
);
```

### ❌ DON'T (No hacer)

```typescript
// ❌ NO usar @Input() y @Output()
@Input() data: Data;
@Output() itemSelected = new EventEmitter();

// ❌ NO usar constructor injection
constructor(private http: HttpClient) {}

// ❌ NO poner standalone: true (es default en v20+)
@Component({
  standalone: true  // ❌ Innecesario
})

// ❌ NO usar *ngIf, *ngFor
<div *ngIf="condition">Content</div>
<div *ngFor="let item of items">{{ item }}</div>

// ❌ NO usar ngClass, ngStyle
<div [ngClass]="{'active': isActive}"></div>
<div [ngStyle]="{'color': color}"></div>

// ❌ NO usar mutate() en signals
items.mutate(arr => arr.push(newItem));  // ❌

// ❌ NO usar @HostBinding/@HostListener
@HostBinding('class.active') isActive = true;  // ❌
```

---

## 🚀 Plan de Implementación

### Fase 1: Fundamentos (Sprint 1-2)
1. Setup proyecto Angular 21
2. Configurar TailwindCSS + PrimeNG
3. Estructura de carpetas (Core/Shared/Features)
4. Layout admin + public
5. Auth service + guards básicos
6. Rutas principales

### Fase 2: Core Features (Sprint 3-5)
7. Workspace management (CRUD)
8. Permission service + RBAC
9. Member management
10. Domain values management

### Fase 3: Form Builder (Sprint 6-9)
11. Form CRUD básico
12. Section management
13. Question configurator
14. CRUD mode completo
15. Preview mode con split panel
16. Domain value inline creation

### Fase 4: Public Area (Sprint 10-11)
17. Public form listing
18. Form wizard con stepper
19. Question renderer (dynamic form)
20. Submission service

### Fase 5: Submissions & Reporting (Sprint 12-13)
21. Submission list
22. Submission detail view
23. Export to CSV/Excel
24. Analytics básico

### Fase 6: Polish & Testing (Sprint 14-15)
25. Tests unitarios
26. Tests E2E
27. Performance optimization
28. UI/UX improvements

---

## 📝 Convenciones

### Naming Conventions

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Component | PascalCase + Component | `WorkspaceListComponent` |
| Service | PascalCase + Service | `WorkspaceService` |
| Model/Interface | PascalCase | `Workspace`, `Form` |
| Enum | PascalCase | `WorkspaceRole` |
| Signal | camelCase | `currentWorkspace` |
| Method | camelCase | `loadWorkspaces()` |
| Constant | UPPER_SNAKE_CASE | `API_BASE_URL` |

### File Structure

```
feature/
├── pages/              # Smart components (containers)
├── components/         # Presentational components
├── services/           # Business logic
├── models/             # TypeScript interfaces/types
└── feature.routes.ts   # Feature routes
```

### Component Template

```typescript
import { Component, signal, computed, input, output, inject, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyComponent {
  // 1. Inputs
  data = input.required<Data>();

  // 2. Outputs
  itemSelected = output<Item>();

  // 3. Inject dependencies
  private myService = inject(MyService);

  // 4. Signals
  items = signal<Item[]>([]);
  loading = signal(false);

  // 5. Computed
  filteredItems = computed(() =>
    this.items().filter(i => i.active)
  );

  // 6. Lifecycle hooks
  ngOnInit() {
    this.loadData();
  }

  // 7. Public methods
  loadData() {
    // ...
  }

  // 8. Private methods
  private handleError(error: any) {
    // ...
  }
}
```

---

## ✅ Checklist de Completitud

- ✅ Stack tecnológico definido
- ✅ Arquitectura Feature-Based con Core/Shared
- ✅ Estructura de carpetas completa
- ✅ Rutas y navegación definidas
- ✅ Modelos de datos completos
- ✅ Sistema de permisos RBAC
- ✅ Services con Signals
- ✅ Componentes clave con Angular 20+ best practices
- ✅ Domain values con creación inline
- ✅ Form builder unificado (CRUD + Preview)
- ✅ Form wizard público con stepper
- ✅ Submission model y exportación
- ✅ Guards y directivas de permisos
- ✅ Plan de implementación por fases
- ✅ Convenciones y best practices Angular 20+

---

## 🎯 Próximos Pasos

1. ✅ Diseño completo aprobado
2. ✅ Documento generado
3. ⏭️ Crear plan de implementación detallado
4. ⏭️ Comenzar Fase 1: Fundamentos

---

**Documento generado:** 2026-02-14
**Versión:** 1.0
**Estado:** Aprobado para implementación
