# Diseño Arquitectónico Completo V2
## Sistema de Configuración de Formularios - Tramite Online

**Fecha:** 2026-02-14
**Versión:** 2.0
**Autor:** Claude Code
**Estado:** Aprobado
**Basado en:** V1.0 (2026-02-14)

---

## 📋 Changelog V1 → V2

| # | Cambio | Descripción |
|---|--------|-------------|
| 1 | Rutas workspace | Agregado `redirectTo: 'forms'` como primer child en `:workspaceId` |
| 2 | Question Configurator | `dataSource` usa `model()` para binding correcto con signals |
| 3 | Question Configurator | `required` definido como `model()` y vinculado correctamente |
| 4 | Form model | Agregado campo `slug` para URLs públicas SEO-friendly |
| 5 | Form wizard | Rutas públicas usan `:slug` en lugar de `:formId` |
| 6 | Estructura carpetas | Incluidos `access-denied` y `not-found` explícitamente |
| 7 | Workspace detail | Documentado uso de `router-outlet` y sub-navegación |
| 8 | Domain Value Service | Invalidación de cache en `create` y al agregar/editar items |
| 9 | Rutas | Documentado contrato de exports para `loadChildren` |
| 10 | PrimeNG Stepper | Nota sobre verificación del componente (Steps/Stepper) |

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
- Acceso por **slug** (ej: `/forms/solicitud-licencia`) para URLs SEO-friendly
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
✅ **Domain Values dinámicos** con cache e invalidación correcta
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
│   │   │   │   │   ├── workspace-detail/        # Incluye router-outlet + sub-nav
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
│   │   │   ├── access-denied/                  # Página 403
│   │   │   │   └── access-denied.component.ts
│   │   │   ├── not-found/                      # Página 404
│   │   │   │   └── not-found.component.ts
│   │   │   └── form-wizard/
│   │   │       ├── pages/
│   │   │       │   ├── form-list/
│   │   │       │   ├── form-wizard/
│   │   │       │   └── form-success/           # Confirmación de envío
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

### Workspace Detail: router-outlet y sub-navegación

El componente `WorkspaceDetailComponent` actúa como **layout padre** para las sub-rutas (forms, domain-values, members, submissions). Debe incluir:

1. **`<router-outlet>`**: Para renderizar el contenido del child route activo
2. **Sub-navegación**: Tabs o menú lateral con links a:
   - `/admin/workspaces/:id/forms`
   - `/admin/workspaces/:id/domain-values`
   - `/admin/workspaces/:id/members`
   - `/admin/workspaces/:id/submissions`

Ejemplo de estructura del template:

```html
<!-- workspace-detail.component.html -->
<div class="workspace-detail">
  <header>
    <h1>{{ workspaceName }}</h1>
  </header>
  <nav class="workspace-sub-nav">
    <a routerLink="forms" routerLinkActive="active">Formularios</a>
    <a routerLink="domain-values" routerLinkActive="active">Valores Dominio</a>
    <a routerLink="members" routerLinkActive="active">Miembros</a>
    <a routerLink="submissions" routerLinkActive="active">Respuestas</a>
  </nav>
  <main>
    <router-outlet></router-outlet>
  </main>
</div>
```

---

## 🛣️ Rutas y Navegación

### Contrato de exports para loadChildren

Cada archivo de rutas debe exportar un objeto con el nombre esperado:

| Archivo | Export requerido | Ejemplo |
|---------|------------------|---------|
| `form-wizard.routes.ts` | `FORM_WIZARD_ROUTES` o `default` | `export const FORM_WIZARD_ROUTES: Routes = [...]` |
| `workspace.routes.ts` | `WORKSPACE_ROUTES` | `export const WORKSPACE_ROUTES: Routes = [...]` |
| `auth.routes.ts` | `AUTH_ROUTES` | `export const AUTH_ROUTES: Routes = [...]` |

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

> **V2:** Agregado `redirectTo: 'forms'` como primer child para que al navegar a `/admin/workspaces/:id` se redirija automáticamente a la pestaña de formularios.

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
        path: '',
        redirectTo: 'forms',
        pathMatch: 'full'
      },
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

### Rutas de Form Wizard (público)

> **V2:** Las rutas públicas usan `:slug` para URLs SEO-friendly. El backend debe soportar búsqueda por slug o por id.

```typescript
// features/public/form-wizard/form-wizard.routes.ts
import { Routes } from '@angular/router';

export const FORM_WIZARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/form-list/form-list.component')
      .then(m => m.FormListComponent)
  },
  {
    path: ':slug',
    loadComponent: () => import('./pages/form-wizard/form-wizard.component')
      .then(m => m.FormWizardComponent)
  },
  {
    path: ':slug/complete',
    loadComponent: () => import('./pages/form-success/form-success.component')
      .then(m => m.FormSuccessComponent)
  }
];
```

---

## 📊 Modelos de Datos

### Form (V2: agregado slug)

```typescript
// features/admin/workspace/features/form-builder/models/form.model.ts
export interface Form {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;                    // V2: Para URLs públicas SEO-friendly
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

*(Workspace, Section, Question, Domain Value, Member, Submission - sin cambios respecto a V1)*

---

## ⚙️ Services con Signals

### Domain Value Service (V2: invalidación de cache completa)

> **V2:** Se invalida el cache en `create` (al retornar el nuevo dominio) y al agregar/editar items. El backend puede devolver el id del dominio creado para invalidar correctamente.

```typescript
// features/admin/workspace/features/domain-values/services/domain-value.service.ts
import { Injectable, signal, inject, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { shareReplay, tap } from 'rxjs/operators';

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
    ).pipe(
      tap((created) => {
        // V2: Invalidar cache si el backend devuelve items
        if (created?.id) {
          this.invalidateCache(created.id);
        }
      })
    );
  }

  update(domainValueId: string, data: UpdateDomainValueDto) {
    this.invalidateCache(domainValueId);
    return this.http.put<DomainValue>(
      `/api/domain-values/${domainValueId}`,
      data
    );
  }

  addItem(domainValueId: string, item: CreateDomainValueItemDto) {
    return this.http.post<DomainValueItem>(
      `/api/domain-values/${domainValueId}/items`,
      item
    ).pipe(
      tap(() => this.invalidateCache(domainValueId))
    );
  }

  updateItem(domainValueId: string, itemId: string, item: UpdateDomainValueItemDto) {
    return this.http.put<DomainValueItem>(
      `/api/domain-values/${domainValueId}/items/${itemId}`,
      item
    ).pipe(
      tap(() => this.invalidateCache(domainValueId))
    );
  }

  invalidateCache(domainValueId: string) {
    this.cache.delete(domainValueId);
  }
}
```

---

## 🎯 Componentes Clave

### Question Configurator (V2: signals + model correctos)

> **V2:** `dataSource` usa `model()` para binding bidireccional. `required` definido como `model()` y vinculado al question.

```typescript
// form-builder/components/question-configurator/question-configurator.component.ts
import { Component, model, input, output, computed, inject, ChangeDetectionStrategy } from '@angular/core';
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

  // V2: model() para binding bidireccional con ngModel
  dataSource = model<'existing' | 'new' | 'custom'>('existing');
  required = model<boolean>(false);

  // Inject dependencies
  private domainValueService = inject(DomainValueService);
  private dialogService = inject(DialogService);

  // Local state
  availableDomainValues = signal<DomainValue[]>([]);
  selectedDomainValue = signal<DomainValue | null>(null);

  dataSourceOptions = [
    { label: 'Existente', value: 'existing' },
    { label: 'Nuevo', value: 'new' },
    { label: 'Personalizado', value: 'custom' }
  ];

  // Computed
  hasSelectedDomain = computed(() => !!this.selectedDomainValue());
  showDomainConfig = computed(() =>
    this.question().type === 'SELECT' ||
    this.question().type === 'CHECKBOX' ||
    this.question().type === 'RADIO'
  );

  ngOnInit() {
    this.loadAvailableDomainValues();
    // Sincronizar required desde question si existe
    const q = this.question();
    if (q?.required !== undefined) {
      this.required.set(q.required);
    }
  }

  loadAvailableDomainValues() {
    this.domainValueService.getByWorkspace(this.workspaceId()).subscribe(
      values => this.availableDomainValues.set(values)
    );
  }

  onRequiredChange(value: boolean) {
    this.required.set(value);
    this.emitQuestionChange({ required: value });
  }

  onDataSourceChange(value: 'existing' | 'new' | 'custom') {
    this.dataSource.set(value);
  }

  onSelectedDomainChange(value: DomainValue | null) {
    this.selectedDomainValue.set(value);
    if (value) {
      this.emitQuestionChange({
        config: { ...this.question().config, domainValueId: value.id }
      });
    }
  }

  emitQuestionChange(partial: Partial<Question>) {
    this.questionChange.emit({ ...this.question(), ...partial });
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
        this.emitQuestionChange({
          config: { ...this.question().config, domainValueId: newDomainValue.id }
        });
      }
    });
  }

  updateCustomOptions(options: OptionItem[]) {
    this.emitQuestionChange({
      config: { ...this.question().config, customOptions: options }
    });
  }
}
```

```html
<!-- question-configurator.component.html (V2) -->
<div class="question-configurator">
  <div class="field">
    <label>Label</label>
    <input
      type="text"
      pInputText
      [value]="question().label"
      (input)="emitQuestionChange({ label: $any($event.target).value })" />
  </div>

  <div class="field">
    <label>Tipo</label>
    <p-dropdown
      [options]="questionTypes"
      optionLabel="label"
      optionValue="value"
      (onChange)="emitQuestionChange({ type: $event.value })">
    </p-dropdown>
  </div>

  @if (showDomainConfig()) {
    <div class="field">
      <label>Fuente de datos</label>

      <p-selectButton
        [options]="dataSourceOptions"
        [ngModel]="dataSource()"
        (ngModelChange)="onDataSourceChange($event)">
      </p-selectButton>

      @if (dataSource() === 'existing') {
        <div class="mt-3">
          <p-dropdown
            [options]="availableDomainValues()"
            optionLabel="displayName"
            placeholder="Seleccionar domain value"
            [ngModel]="selectedDomainValue()"
            (ngModelChange)="onSelectedDomainChange($event)">
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
        [ngModel]="required()"
        (ngModelChange)="onRequiredChange($event)">
      </p-checkbox>
      <span class="ml-2">Requerida</span>
    </label>
  </div>
</div>
```

### Form Wizard (V2: slug en lugar de formId)

> **V2:** Usa `slug` del route param. El servicio `getPublicForm` acepta slug (el backend puede resolver por slug o por id).

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
  stepItems = computed(() =>
    this.sections().map((s, i) => ({ label: s.title, value: i }))
  );
  currentSection = computed(() => this.sections()[this.currentStep()] ?? null);
  isLastStep = computed(() => this.currentStep() === this.sections().length - 1);
  canProceed = computed(() => this.validateCurrentSection());

  constructor() {
    this.loadForm();
  }

  private loadForm() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.submissionService.getPublicFormBySlug(slug).subscribe({
        next: (form) => this.form.set(form),
        error: (err) => {
          console.error('Error loading form', err);
          this.router.navigate(['/forms']);
        }
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
    const form = this.form();
    if (!form) return;

    const submission: FormSubmission = {
      formId: form.id,
      answers: Array.from(this.answers().entries()).map(([questionId, value]) => ({
        questionId,
        value
      }))
    };

    this.submissionService.submit(submission).subscribe({
      next: () => {
        this.router.navigate(['/forms', form.slug, 'complete']);
      },
      error: (err) => {
        console.error('Error submitting form', err);
      }
    });
  }
}
```

### Form Wizard Template - Nota sobre PrimeNG Stepper

> **V2:** Verificar en la documentación de PrimeNG 21 el nombre exacto del componente de wizard/stepper. Puede ser `p-steps`, `p-stepper`, o `Steps`. Ajustar el selector según corresponda.

```html
<!-- form-wizard.component.html -->
<div class="form-wizard">
  <h1>{{ form()?.name }}</h1>
  <p>{{ form()?.description }}</p>

  <!-- PrimeNG: verificar componente Steps/Stepper en docs -->
  <p-steps
    [model]="stepItems()"
    [activeIndex]="currentStep()"
    [readonly]="false"
    (activeIndexChange)="currentStep.set($event)">
  </p-steps>

  <div class="section-content">
    @if (currentSection(); as section) {
      <h2>{{ section.title }}</h2>
      <p>{{ section.description }}</p>

      @for (question of section.questions; track question.id) {
        <app-question-renderer
          [question]="question"
          [value]="answers().get(question.id)"
          (valueChange)="updateAnswer(question.id, $event)">
        </app-question-renderer>
      }
    }
  </div>

  <div class="wizard-navigation">
    @if (currentStep() > 0) {
      <button pButton label="Anterior" icon="pi pi-arrow-left" (click)="previousStep()"></button>
    }
    @if (!isLastStep()) {
      <button pButton label="Siguiente" icon="pi pi-arrow-right" [disabled]="!canProceed()" (click)="nextStep()"></button>
    }
    @if (isLastStep()) {
      <button pButton label="Enviar" icon="pi pi-check" [disabled]="!canProceed()" (click)="submit()"></button>
    }
  </div>
</div>
```

---

## 📚 Best Practices Angular 20+

*(Sin cambios respecto a V1)*

---

## 🚀 Plan de Implementación

*(Sin cambios respecto a V1)*

---

## 📝 Convenciones

*(Sin cambios respecto a V1)*

---

## ✅ Checklist de Completitud V2

- ✅ Stack tecnológico definido
- ✅ Arquitectura Feature-Based con Core/Shared
- ✅ Estructura de carpetas completa (incl. access-denied, not-found)
- ✅ Rutas y navegación definidas (redirect workspace, slug público)
- ✅ Modelos de datos completos (Form con slug)
- ✅ Sistema de permisos RBAC
- ✅ Services con Signals (DomainValue cache invalidation)
- ✅ Componentes clave con Angular 20+ (model(), binding correcto)
- ✅ Domain values con creación inline
- ✅ Form builder unificado (CRUD + Preview)
- ✅ Form wizard público con slug y stepper
- ✅ Workspace detail con router-outlet documentado
- ✅ Contrato de exports para loadChildren
- ✅ Plan de implementación por fases
- ✅ Convenciones y best practices Angular 20+

---

## 🎯 Próximos Pasos

1. ✅ Diseño V2 completo con mejoras aplicadas
2. ⏭️ Verificar componentes PrimeNG (Steps/Stepper) en documentación oficial
3. ⏭️ Crear plan de implementación detallado
4. ⏭️ Comenzar Fase 1: Fundamentos

---

---

## 📖 Nota sobre contenido completo

Las secciones **Sistema de Permisos** (Permission Service, Guard, Directive), **Workspace Service**, **Workspace List Component**, **Form Builder Component** y **Best Practices** no presentan cambios respecto a V1. Para el código completo de estas secciones, consultar el documento [2026-02-14-form-config-architecture-design.md](./2026-02-14-form-config-architecture-design.md) (V1).

---

**Documento generado:** 2026-02-14
**Versión:** 2.0
**Estado:** Aprobado para implementación
