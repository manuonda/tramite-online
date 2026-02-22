# FormFlow - Configurador de Formularios Dinamicos

## Descripcion General

**FormFlow** es un sistema SaaS de configuracion y ejecucion de formularios dinamicos. Permite a los usuarios crear Espacios de Trabajo, dentro de cada espacio crear Formularios compuestos por Secciones, y dentro de cada seccion agregar Preguntas de 10 tipos distintos. Incluye un sistema de Dominios (catalogos de valores reutilizables) y una Vista Previa que renderiza el formulario tal como lo veria el usuario final.

---

## Stack Tecnologico

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4 (sin tailwind.config, todo en globals.css)
- **Componentes UI:** shadcn/ui (Button, Card, Badge, Dialog, Input, Select, Tabs, Table, Switch, Slider, Calendar, Popover, Collapsible, DropdownMenu, RadioGroup, Checkbox, Separator, ScrollArea, Textarea, Label, Sonner/Toaster)
- **Iconos:** Lucide React
- **Fuentes:** Inter (sans), JetBrains Mono (mono) via next/font/google
- **Estado:** React Context + useReducer (patron Redux-like sin dependencias externas)
- **Notificaciones:** Sonner (toast)
- **Formato de fechas:** date-fns con locale `es`

---

## Paleta de Colores (Design Tokens)

Todos los colores se definen como CSS custom properties en `globals.css` usando notacion oklch. El tema es azul profesional (hue ~250).

### Light Mode
| Token | Uso | Valor |
|-------|-----|-------|
| `--background` | Fondo general de pagina | `oklch(0.975 0.002 250)` - gris muy claro con tinte azul |
| `--foreground` | Texto principal | `oklch(0.17 0.02 260)` - casi negro azulado |
| `--card` | Fondo de cards | `oklch(1 0 0)` - blanco puro |
| `--primary` | Color de acento principal, botones, links activos | `oklch(0.55 0.17 250)` - azul medio |
| `--primary-foreground` | Texto sobre primary | `oklch(0.99 0 0)` - blanco |
| `--secondary` | Fondos secundarios, badges neutros | `oklch(0.955 0.01 250)` - gris muy claro |
| `--muted` | Fondos apagados | `oklch(0.955 0.005 250)` |
| `--muted-foreground` | Texto secundario/apagado | `oklch(0.50 0.02 260)` |
| `--accent` | Fondos hover, resaltados suaves | `oklch(0.935 0.02 250)` |
| `--destructive` | Acciones de eliminar | `oklch(0.577 0.245 27.325)` - rojo |
| `--border` | Bordes generales | `oklch(0.91 0.01 250)` |
| `--radius` | Radio de borde base | `0.625rem` (10px) |

### Colores Especificos de la App
- **Workspace colors:** Cada workspace tiene un color propio para su franja superior y su icono. Los colores disponibles son: `#0ea5e9` (azul cielo), `#10b981` (verde), `#f59e0b` (ambar), `#ef4444` (rojo), `#8b5cf6` (violeta), `#ec4899` (rosa), `#06b6d4` (cyan), `#84cc16` (lima).
- **Badge "Publicado":** `bg-emerald-600 text-emerald-50` (verde esmeralda)
- **Badge "publicados" en workspace card:** `border-emerald-200 bg-emerald-50 text-emerald-700`
- **Estrellas rating:** `fill-amber-400 text-amber-400` cuando activas, `text-muted-foreground/30` cuando inactivas.

---

## Tipografia

- **font-sans:** `'Inter', 'Inter Fallback', sans-serif` - Usada para todo el cuerpo y encabezados
- **font-mono:** `'JetBrains Mono', 'JetBrains Mono Fallback', monospace` - Usada para valores de codigo en la tabla de dominios (`<code>`)
- Las fuentes se cargan via `next/font/google` en `layout.tsx` y se mapean en `globals.css` dentro de `@theme inline`

---

## Modelo de Datos (Types)

Ubicacion: `lib/types.ts`

### QuestionType (union de strings)
Los 10 tipos de pregunta soportados:
```
"text" | "number" | "date" | "boolean" | "select" | "multi-select" | "file" | "rating" | "scale" | "matrix"
```

### QuestionConfig
Objeto flexible con propiedades opcionales segun el tipo de pregunta:
| Propiedad | Tipo | Usado por |
|-----------|------|-----------|
| `min`, `max` | `number` | number |
| `step` | `number` | number |
| `stars` | `number` | rating (default 5) |
| `scaleMin`, `scaleMax` | `number` | scale (default 1-10) |
| `scaleMinLabel`, `scaleMaxLabel` | `string` | scale |
| `matrixRows` | `string[]` | matrix |
| `matrixColumns` | `string[]` | matrix |
| `accept` | `string` | file (ej: "image/*") |
| `placeholder` | `string` | text |

### DomainValue
```ts
{ id: string, domainId: string, label: string, value: string }
```

### Domain
```ts
{ id: string, name: string, description?: string, values: DomainValue[] }
```

### Question
```ts
{
  id: string, sectionId: string, type: QuestionType, label: string,
  description?: string, required: boolean, order: number,
  domainId?: string, config: QuestionConfig
}
```

### Section
```ts
{ id: string, formId: string, title: string, description?: string, order: number, questions: Question[] }
```

### Form
```ts
{
  id: string, workspaceId: string, name: string, description?: string,
  status: "draft" | "published", sections: Section[],
  createdAt: string, updatedAt: string
}
```

### Workspace
```ts
{ id: string, name: string, description?: string, color: string, icon: string, forms: Form[] }
```

---

## Datos Iniciales (Mock Data)

Ubicacion: `lib/mock-data.ts`

### Dominios pre-cargados (4)
1. **Nivel de Satisfaccion** (dom-1): Muy Insatisfecho (1), Insatisfecho (2), Neutral (3), Satisfecho (4), Muy Satisfecho (5)
2. **Prioridad** (dom-2): Baja (low), Media (medium), Alta (high), Critica (critical)
3. **Departamento** (dom-3): Recursos Humanos (hr), Tecnologia (tech), Ventas (sales), Marketing (marketing), Finanzas (finance)
4. **Frecuencia** (dom-4): Diario (daily), Semanal (weekly), Mensual (monthly), Anual (yearly)

### Espacios de Trabajo pre-cargados (3)
1. **Recursos Humanos** (ws-1) - Color: `#0ea5e9` (azul), Icono: "Users"
   - Formulario 1: "Evaluacion de Desempeno" (publicado) - 2 secciones, 6 preguntas
   - Formulario 2: "Encuesta de Clima Laboral" (borrador) - 1 seccion, 3 preguntas
2. **Control de Calidad** (ws-2) - Color: `#10b981` (verde), Icono: "ClipboardCheck"
   - Formulario 3: "Inspeccion de Producto" (publicado) - 2 secciones, 5 preguntas
3. **Atencion al Cliente** (ws-3) - Color: `#f59e0b` (ambar), Icono: "Headphones"
   - Formulario 4: "Feedback Post-Servicio" (publicado) - 1 seccion, 3 preguntas
   - Formulario 5: "Registro de Incidencias" (borrador) - 1 seccion, 3 preguntas

---

## Estado Global (Context)

Ubicacion: `lib/form-builder-context.tsx`

### Patron
- `React.createContext` + `useReducer` envuelto en `FormBuilderProvider`
- Hook de acceso: `useFormBuilder()` que retorna `{ state, dispatch, getWorkspace, getForm, getDomain }`
- El state es `{ workspaces: Workspace[], domains: Domain[] }`

### Acciones del Reducer (21 acciones totales)

**Workspaces (3):**
- `ADD_WORKSPACE` - Crea workspace con `crypto.randomUUID()` como ID
- `UPDATE_WORKSPACE` - Actualiza name, description, color, icon
- `DELETE_WORKSPACE` - Elimina por ID

**Forms (5):**
- `ADD_FORM` - Crea form en draft con timestamps, sin secciones
- `UPDATE_FORM` - Actualiza name y description, toca updatedAt
- `TOGGLE_FORM_STATUS` - Alterna entre "draft" y "published"
- `DELETE_FORM` - Elimina del workspace
- `DUPLICATE_FORM` - Copia profunda con "(copia)" en el nombre, regenera todos los IDs, fuerza status "draft"

**Sections (4):**
- `ADD_SECTION` - Agrega seccion al final (order = sections.length)
- `UPDATE_SECTION` - Actualiza title y description
- `DELETE_SECTION` - Elimina y reordena las restantes
- `MOVE_SECTION` - Mueve up/down intercambiando posiciones

**Questions (5):**
- `ADD_QUESTION` - Agrega pregunta al final de la seccion con config por defecto segun tipo (rating: stars=5, scale: scaleMin=1, scaleMax=10)
- `UPDATE_QUESTION` - Actualiza cualquier campo parcial (label, type, required, description, config, domainId)
- `DELETE_QUESTION` - Elimina y reordena las restantes
- `MOVE_QUESTION` - Mueve up/down dentro de la seccion
- `DUPLICATE_QUESTION` - Copia profunda con "(copia)" en el label

**Domains (4):**
- `ADD_DOMAIN` - Crea dominio con values vacio
- `UPDATE_DOMAIN` - Actualiza name y description
- `DELETE_DOMAIN` - Elimina por ID
- `ADD_DOMAIN_VALUE`, `UPDATE_DOMAIN_VALUE`, `DELETE_DOMAIN_VALUE` - CRUD de valores

### Helpers
- `getWorkspace(id)` - Busca workspace por ID
- `getForm(workspaceId, formId)` - Busca form dentro de workspace
- `getDomain(id)` - Busca dominio por ID
- `generateId()` - Usa `crypto.randomUUID()`
- `updateFormTimestamp(form)` - Actualiza `updatedAt` a `new Date().toISOString()`

---

## Estructura de Archivos

```
app/
  layout.tsx                                    # Layout raiz con FormBuilderProvider, Toaster, fuentes
  globals.css                                   # Tokens de color (oklch), fuentes, Tailwind v4
  page.tsx                                      # Pantalla 1: Dashboard de Workspaces
  domains/
    page.tsx                                    # Pantalla 4: Gestion de Dominios
  workspaces/
    [workspaceId]/
      page.tsx                                  # Pantalla 2: Formularios de un Workspace
      forms/
        [formId]/
          page.tsx                              # Pantalla 3: Editor de Formulario
          preview/
            page.tsx                            # Pantalla 5: Vista Previa del Formulario

components/
  dashboard-header.tsx                          # Header global con logo, breadcrumbs, link a Dominios
  workspace-card.tsx                            # Card de workspace para el dashboard
  workspace-dialog.tsx                          # Dialog para crear/editar workspace
  form-card.tsx                                 # Card de formulario para la vista de workspace
  form-dialog.tsx                               # Dialog para crear/editar formulario
  inline-edit.tsx                               # Componente de edicion inline (click para editar)
  section-editor.tsx                            # Editor colapsable de seccion
  question-editor.tsx                           # Editor colapsable de pregunta
  question-type-icon.tsx                        # Mapa de iconos y labels por tipo de pregunta
  question-type-selector.tsx                    # Select de tipo de pregunta
  question-config-panel.tsx                     # Panel de configuracion especifica por tipo
  form-preview/
    preview-renderer.tsx                        # Renderizador de preguntas para vista previa

lib/
  types.ts                                      # Todas las interfaces y tipos TypeScript
  mock-data.ts                                  # Datos iniciales (workspaces, domains)
  form-builder-context.tsx                      # Context + Reducer + Provider + Hook
  utils.ts                                      # Utilidades (cn para clases)
```

---

## Pantalla 1: Dashboard de Espacios de Trabajo

**Ruta:** `/`
**Archivo:** `app/page.tsx`
**Componentes:** `DashboardHeader`, `WorkspaceCard`, `WorkspaceDialog`

### Layout
- Fondo: `bg-background` (gris muy claro)
- Container: `max-w-7xl mx-auto px-4 py-8`
- Header sticky en la parte superior
- Grilla de cards: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`

### Encabezado de Pagina
- Titulo: "Espacios de Trabajo" (`text-2xl font-semibold tracking-tight`)
- Subtitulo: "Selecciona un espacio de trabajo para gestionar sus formularios" (`text-sm text-muted-foreground`)
- Boton "Nuevo Espacio" con icono `Plus` a la derecha

### WorkspaceCard (componente)
- Es un `<Link>` que envuelve un `<Card>` completo (toda la card es clickeable)
- **Franja de color:** `div` de `h-1` con `border-top-radius` en la parte superior de la card, coloreada con el `workspace.color`
- **Icono:** Circulo de `h-10 w-10` con fondo `${color}15` (15% opacity) y el icono del workspace dentro
- **Mapa de iconos:** `Users`, `ClipboardCheck`, `Headphones`, `FileText`, `FolderOpen` (este ultimo es fallback)
- **Titulo:** `text-base leading-tight`
- **Descripcion:** `line-clamp-2 text-sm` (maximo 2 lineas)
- **Menu contextual:** DropdownMenu con `MoreHorizontal` que aparece solo en hover (`opacity-0 group-hover:opacity-100`). Opciones: Editar, Eliminar
- **Badges en footer:** Badge con conteo de formularios, badge verde con conteo de publicados (solo si hay)
- **Hover:** `hover:shadow-md hover:border-border/80`

### WorkspaceDialog (componente)
- Dialog de shadcn, `max-w-md`
- Se usa tanto para Crear como Editar (titulo dinamico, boton Crear/Guardar)
- Campos:
  - **Nombre** (Input, required)
  - **Descripcion** (Textarea, rows=2, opcional)
  - **Color** (fila de 8 circulos de color clickeables, `h-8 w-8 rounded-full`, borde de 2px cuando seleccionado)
  - **Icono** (fila de 5 botones con labels: Carpeta, Usuarios, Checklist, Soporte, Documento)
- `useEffect` para resetear campos al abrir/cerrar y al cambiar entre crear/editar

### Estado Vacio
- Container con `border-dashed` centrado, titulo "Sin espacios de trabajo", subtitulo, y boton para crear

---

## Pantalla 2: Formularios de un Workspace

**Ruta:** `/workspaces/[workspaceId]`
**Archivo:** `app/workspaces/[workspaceId]/page.tsx`
**Componentes:** `DashboardHeader`, `FormCard`, `FormDialog`

### Layout
- Mismo layout base que el dashboard
- Breadcrumbs: Espacios (link a /) > Nombre del workspace
- Circulo pequeno (`h-3 w-3`) con el color del workspace al lado del titulo

### Filtros (Tabs)
- Componente `Tabs` de shadcn con `TabsList` y `TabsTrigger`
- 3 tabs: "Todos (N)", "Borradores (N)", "Publicados (N)" donde N es el conteo real
- El filtro controla `filter` state: `"all" | "draft" | "published"`

### FormCard (componente)
- **Card** con hover igual a WorkspaceCard
- **Icono:** `FileText` en circulo `h-9 w-9` con `bg-primary/10 text-primary`
- **Titulo:** Link clickeable al editor del formulario (`hover:underline`)
- **Badge de estado:** "Publicado" en verde (`bg-emerald-600 text-emerald-50`) o "Borrador" en secondary
- **Descripcion:** `line-clamp-2`
- **Menu contextual:** Editar (link al editor), Vista Previa (link), Duplicar, separador, Eliminar (destructive)
- **Footer:** Conteo de secciones | Conteo de preguntas | Fecha de ultima actualizacion (formateada con `date-fns` en espanol "d MMM yyyy")

### FormDialog (componente)
- Dialog `max-w-md`, crear/editar
- Campos: Nombre (Input, required), Descripcion (Textarea, rows=3, opcional)
- Mas simple que WorkspaceDialog (sin color ni icono)

### Acciones
- Crear formulario -> `ADD_FORM`
- Editar nombre/descripcion -> `UPDATE_FORM`
- Eliminar -> `DELETE_FORM`
- Duplicar -> `DUPLICATE_FORM` (crea copia en draft con "(copia)" en el nombre)

---

## Pantalla 3: Editor de Formulario

**Ruta:** `/workspaces/[workspaceId]/forms/[formId]`
**Archivo:** `app/workspaces/[workspaceId]/forms/[formId]/page.tsx`
**Componentes:** `DashboardHeader`, `InlineEdit`, `SectionEditor`, `QuestionEditor`, `QuestionTypeIcon`, `QuestionTypeSelector`, `QuestionConfigPanel`

### Layout
- Container mas angosto: `max-w-4xl`
- Breadcrumbs: Espacios > Nombre workspace > Nombre form

### Cabecera del Formulario
- Card con borde (`rounded-xl border bg-card shadow-sm`)
- **Titulo:** Editable inline con `InlineEdit` (`text-xl font-semibold`)
- **Descripcion:** Editable inline, placeholder "Agregar descripcion..."
- **Badge de estado:** Clickeable para alternar entre Publicado/Borrador
- **Boton "Vista Previa"** con icono `Eye`
- **Contadores:** "N secciones | N preguntas" en `text-xs text-muted-foreground`

### InlineEdit (componente reutilizable)
- Muestra texto normal, al hacer click cambia a Input
- `onBlur` o `Enter` guarda, `Escape` cancela
- Auto-focus y auto-select al entrar en modo edicion
- Prop `as` para renderizar como h1/h2/h3/p/span
- Estilo hover: `hover:bg-accent` con rounded

### SectionEditor (componente)
- `Collapsible` de shadcn, abierto por defecto
- **Header de seccion:**
  - Boton de colapsar con icono `ChevronRight` que rota 90deg cuando abierto (transicion CSS)
  - Icono `Layers` en color primary
  - Titulo editable inline (`text-sm font-semibold`)
  - Badge con conteo de preguntas
  - Botones de mover arriba/abajo (disabled en extremos) y eliminar (color destructive)
- **Contenido colapsable:**
  - Descripcion editable inline (opcional)
  - Lista de QuestionEditors
  - Boton "Agregar Pregunta" al final (border-dashed, abre DropdownMenu con los 10 tipos)

### QuestionEditor (componente)
- `Collapsible`, cerrado por defecto
- **Header colapsado:**
  - Icono `GripVertical` (visual, no funcional de drag)
  - Icono del tipo de pregunta en circulo `bg-secondary`
  - Label de la pregunta truncado
  - Tipo de pregunta en texto (hidden en mobile)
  - "Requerido" en azul si aplica
  - `ChevronRight` que rota
- **Contenido expandido:**
  - **Etiqueta:** Input de texto
  - **Tipo:** `QuestionTypeSelector` (Select con icono por tipo)
  - **Descripcion:** Input opcional
  - **Requerido:** Switch con Label
  - **QuestionConfigPanel:** Panel dinamico segun el tipo (ver abajo)
  - **Acciones:** Mover arriba/abajo, Duplicar, Eliminar

### QuestionTypeIcon (componente)
- Mapa de 10 tipos a iconos de Lucide:
  - text -> `Type`, number -> `Hash`, date -> `CalendarDays`, boolean -> `ToggleLeft`
  - select -> `List`, multi-select -> `ListChecks`, file -> `Upload`, rating -> `Star`
  - scale -> `SlidersHorizontal`, matrix -> `Grid3X3`
- Tambien exporta labels y descripciones en espanol para cada tipo

### QuestionTypeSelector (componente)
- `Select` de shadcn, width 160px
- Muestra icono + label de cada tipo
- Al cambiar tipo, resetea el config con valores por defecto

### QuestionConfigPanel (componente)
- Renderiza diferente segun `question.type`:
  - **text:** Input para placeholder
  - **number:** Inputs para min y max
  - **rating:** Select para numero de estrellas (3, 4, 5, 7, 10)
  - **scale:** Inputs para valor min/max + inputs para etiquetas min/max
  - **file:** Input para tipos aceptados (ej: "image/*, .pdf")
  - **select / multi-select:** Select de dominio (lista todos los dominios con conteo de valores)
  - **matrix:** Lista editable de filas + lista editable de columnas (cada una con botones agregar/eliminar)
  - **date / boolean:** Sin configuracion adicional (retorna null)

### Boton "Agregar Seccion"
- Al final de toda la lista de secciones
- `w-full border-dashed py-6 text-muted-foreground`
- Crea seccion con titulo "Nueva Seccion"

---

## Pantalla 4: Gestion de Dominios

**Ruta:** `/domains`
**Archivo:** `app/domains/page.tsx`
**Componentes:** `DashboardHeader`, Dialog inline

### Layout
- `max-w-7xl`
- Breadcrumbs: Espacios > Dominios
- Layout master-detail: `grid gap-6 lg:grid-cols-[320px_1fr]`

### Panel Izquierdo (Lista de Dominios)
- Lista vertical de Cards clickeables
- Card seleccionada: `border-primary ring-1 ring-primary/20`
- Cada card muestra:
  - Icono `Database` en circulo `bg-primary/10 text-primary`
  - Nombre del dominio
  - "N valores" debajo
  - Botones edit (lapiz) y delete (basura)

### Panel Derecho (Valores del Dominio)
- Card con titulo "Valores de [nombre]" y badge con conteo
- Tabla (`Table` de shadcn) con columnas: Etiqueta, Valor, Acciones
- **Modo lectura:** Muestra etiqueta como texto, valor como `<code>` con fondo muted y font-mono
- **Modo edicion inline:** Al hacer click en editar, la fila cambia a dos Inputs + botones Save/Cancel
- **Fila de agregar:** Ultima fila siempre es para agregar nuevo valor (dos inputs + boton Plus)
- Soporta `Enter` para agregar rapido

### Dialog de Dominio
- Crear/Editar dominio
- Campos: Nombre (Input), Descripcion (Textarea, rows=2)

---

## Pantalla 5: Vista Previa del Formulario

**Ruta:** `/workspaces/[workspaceId]/forms/[formId]/preview`
**Archivo:** `app/workspaces/[workspaceId]/forms/[formId]/preview/page.tsx`
**Componente principal:** `QuestionRenderer` (de `components/form-preview/preview-renderer.tsx`)

### Layout
- Container angosto: `max-w-2xl` centrado
- Breadcrumbs: Espacios > Workspace > Form > Vista Previa

### Cabecera
- Titulo del formulario centrado (`text-2xl font-semibold text-center`)
- Descripcion centrada
- Badge de estado + link "Volver al Editor"

### Barra de Progreso por Secciones
- Solo visible si hay mas de 1 seccion
- Texto: "Seccion X de N" a la izquierda, "XX%" a la derecha
- Barra segmentada: `flex gap-1.5` con divs de `h-1.5 flex-1 rounded-full`
- Secciones completadas/actual en `bg-primary`, futuras en `bg-muted`
- Cada segmento es clickeable para navegar directamente

### Seccion Actual
- Card con titulo de seccion, descripcion, y lista de preguntas renderizadas
- Si no hay preguntas: "Esta seccion no tiene preguntas"

### QuestionRenderer (componente con sub-componente QuestionInput)
- Cada pregunta muestra:
  - Label con asterisco rojo si es requerida
  - Descripcion en `text-xs text-muted-foreground`
  - Input interactivo segun tipo:

| Tipo | Componente UI | Detalles |
|------|---------------|----------|
| **text** | `Input` | Usa placeholder del config |
| **number** | `Input type="number"` | min/max del config, placeholder descriptivo |
| **date** | `Popover` + `Calendar` | Boton muestra fecha formateada en espanol o "Selecciona una fecha" |
| **boolean** | `Switch` + `Label` | Contenedor con borde y fondo `bg-muted/30` |
| **select** | `Select` de shadcn | Opciones del dominio vinculado. Si no hay dominio: "Sin dominio configurado" (disabled) |
| **multi-select** | Lista de `Checkbox` | Contenedor con borde y fondo. Checkboxes con labels del dominio |
| **file** | Zona drag-and-drop + `Input type="file"` | Icono `Upload`, texto "Arrastra un archivo...", tipos aceptados |
| **rating** | Botones de estrellas (`Star` de Lucide) | Hover individual, click para seleccionar. Activas: `fill-amber-400 text-amber-400`. Muestra "X/N" al lado |
| **scale** | `Slider` de shadcn | Muestra etiquetas min/max debajo y valor actual centrado |
| **matrix** | Tabla HTML con `RadioGroup` | Filas son criterios, columnas son opciones. Una seleccion por fila |

### Navegacion
- Botones "Anterior" / "Siguiente" o "Enviar"
- Anterior deshabilitado en primera seccion
- Ultima seccion muestra "Enviar" (con icono `Send`) que dispara un toast simulado
- Navegacion con state `currentSectionIdx`

---

## Header Global (DashboardHeader)

**Archivo:** `components/dashboard-header.tsx`

- `<header>` sticky (`sticky top-0 z-50`)
- Fondo: `bg-card/80 backdrop-blur-sm` con `border-b`
- Altura fija: `h-14`
- Container: `max-w-7xl`
- **Logo:** Icono `LayoutGrid` dentro de cuadrado `h-8 w-8 rounded-lg bg-primary`, texto "FormFlow" (hidden en mobile)
- **Breadcrumbs:** Separador vertical, luego items con `ChevronRight` entre ellos. Ultimo item sin link y en `font-medium`
- **Derecha:** Boton "Dominios" con icono `Database`. Estilo `secondary` si pathname === "/domains", sino `ghost`

---

## Flujo de Navegacion

```
/ (Dashboard)
  |
  +-- Click card workspace --> /workspaces/[id] (Formularios)
  |     |
  |     +-- Click titulo form --> /workspaces/[id]/forms/[formId] (Editor)
  |     |     |
  |     |     +-- Click "Vista Previa" --> /workspaces/[id]/forms/[formId]/preview
  |     |
  |     +-- Menu > Vista Previa --> /workspaces/[id]/forms/[formId]/preview
  |
  +-- Header > Dominios --> /domains (Gestion de Dominios)
```

---

## Patrones de Diseno Clave

### 1. Edicion Inline
Se usa `InlineEdit` para titulo/descripcion del formulario y secciones. Click para editar, Escape para cancelar, Enter o blur para guardar.

### 2. Collapsibles Anidados
Secciones son `Collapsible` (abiertos por defecto), preguntas son `Collapsible` dentro (cerrados por defecto). Esto crea una jerarquia visual clara.

### 3. Master-Detail en Dominios
Layout de 2 columnas: lista seleccionable a la izquierda, detalle editable a la derecha. La card seleccionada tiene ring de primary.

### 4. Cards Navegables
Las workspace cards son `<Link>` que envuelven `<Card>`. Los menus contextuales usan `e.preventDefault()` para evitar la navegacion al interactuar.

### 5. Menus Contextuales Hover
Los DropdownMenu triggers tienen `opacity-0 group-hover:opacity-100` para aparecer solo en hover sobre la card.

### 6. Toast Notifications
Todas las acciones de CRUD disparan `toast.success()` de Sonner con mensajes en espanol.

### 7. Filtros con Tabs
En la vista de formularios, se usan Tabs de shadcn como filtros. El conteo se muestra entre parentesis en cada tab.

### 8. Manejo de params con use()
Los parametros de ruta en Next.js 16 son `Promise`. Se usan con `use(params)` para obtener `workspaceId` y `formId`.

### 9. Vista Previa como Paginacion
El preview muestra una seccion a la vez con navegacion anterior/siguiente, no scroll largo. Tiene barra de progreso segmentada.
