# Dashboard Operativo: Submissions y Pagos

## Contexto

Actualmente, la operación diaria se centra en la gestión de `submissions` (respuestas de formularios).  
En una siguiente etapa se incorporará el módulo de `pagos`, que también será crítico para el seguimiento operativo.

Se requiere definir un dashboard orientado a operación diaria, priorizando acciones y no solo métricas.

---

## Objetivo del Feature

Construir un **Dashboard Operativo** que permita, en pocos segundos:

1. Ver el estado actual de trabajo (pendientes, vencidos, procesados).
2. Priorizar qué gestionar primero.
3. Ejecutar acciones rápidas sobre submissions.
4. Escalar la misma lógica para pagos cuando el módulo esté disponible.

---

## Alcance (MVP)

### Incluye

- Filtros globales:
  - Rango de fechas
  - Workspace
  - Formulario
  - Estado
- Tarjetas KPI operativas:
  - Pendientes
  - Revisadas
  - Procesadas
  - Rechazadas
  - (Opcional MVP) Vencidas / en riesgo de SLA
- Tabla principal de “Trabajo pendiente” con acciones rápidas:
  - Ver
  - Editar
  - Finalizar
- Sección de actividad reciente:
  - Cambios de estado recientes
- Navegación clara a:
  - `/admin/submissions`
  - `/admin/workspaces`

### No incluye (fuera de MVP)

- Motor avanzado de analytics
- Reportería exportable
- Automatizaciones de negocio complejas
- Tableros separados por perfil/rol (si aún no está definido el modelo de permisos)

---

## Principios de Diseño

1. **Operación primero**: priorizar listas accionables sobre gráficos grandes.
2. **Tiempo de decisión corto**: responder “qué hacer ahora” en < 10 segundos.
3. **Consistencia visual**: estados y colores iguales a submissions.
4. **Escalabilidad funcional**: mismo patrón para pagos.

---

## Estructura Propuesta del Dashboard

## 1) Barra de filtros globales

- Fecha (hoy / 7 días / 30 días / personalizado)
- Workspace
- Formulario
- Estado
- Botón “Limpiar filtros”

## 2) KPIs de cabecera (cards)

- Submissions pendientes
- Submissions revisadas
- Submissions procesadas
- Submissions rechazadas
- (Próximo) Pagos pendientes
- (Próximo) Pagos observados/rechazados

## 3) Cola operativa principal (tabla)

- Lista priorizada por:
  1. Vencidas / SLA en riesgo
  2. Más antiguas
- Columnas sugeridas:
  - ID
  - Ciudadano
  - Formulario
  - Workspace
  - Estado
  - Fecha envío / antigüedad
  - Acciones
- Acciones:
  - Ver detalle
  - Editar
  - Finalizar

## 4) Actividad reciente

- Timeline/lista corta:
  - “Submission X pasó de pendiente a revisada”
  - Usuario
  - Fecha/hora

## 5) Tendencia mínima (opcional MVP+1)

- Entradas por día
- Finalizadas por día
- Backlog diario

---

## Navegación e IA (Información Arquitectónica)

- `Dashboard`: centro operativo diario.
- `Workspaces`: configuración y administración (formularios, dominios, miembros, etc.).
- `Submissions`: vista completa y exploración detallada.

Regla:
- Operación recurrente -> Dashboard
- Configuración/estructura -> Workspace

---

## Evolución para módulo de Pagos

Cuando se habilite pagos:

1. Agregar KPIs de pagos en cabecera.
2. Agregar vista con switch:
   - `Todo | Submissions | Pagos`
3. Agregar tabla operativa de pagos:
   - pendiente, observado, rechazado, conciliado
4. Mantener un único dashboard operativo (evitar fragmentación temprana).

---

## Métricas clave (definición inicial)

- Backlog actual (pendientes)
- Entradas del día
- Resueltas del día
- Antigüedad promedio de pendientes
- Tasa de resolución diaria
- % rechazadas
- (Pagos) % pendientes vs acreditadas

---

## Requisitos funcionales

1. El dashboard debe refrescar datos según filtros activos.
2. Toda card KPI debe permitir navegación contextual (drill-down).
3. La tabla principal debe permitir acción directa sin cambiar de pantalla innecesariamente.
4. Debe existir acceso directo al detalle de submission.
5. Los estados deben seguir la taxonomía existente:
   - `pending`
   - `reviewed`
   - `processed`
   - `rejected`

---

## Requisitos no funcionales

- Tiempo de carga inicial objetivo: < 2.5s con datos de entorno de prueba.
- Diseño responsive (desktop-first, usable en tablet).
- Consistencia con componentes PrimeNG y estilos actuales del proyecto.
- Compatibilidad con modo oscuro existente.

---

## Criterios de aceptación (MVP)

- [ ] Se visualizan KPIs de submissions en dashboard.
- [ ] Los filtros afectan KPIs y tabla principal.
- [ ] La tabla principal lista pendientes con acciones rápidas.
- [ ] Existe acceso directo a detalle/edición de submission.
- [ ] Se muestra actividad reciente.
- [ ] Navegación a workspaces y submissions funciona correctamente.
- [ ] UI consistente con diseño actual.

---

## Plan de implementación (fases)

### Fase 1 - Base operativa
- Estructura de dashboard
- Filtros + KPIs de submissions
- Tabla de pendientes + acciones rápidas

### Fase 2 - Seguimiento
- Actividad reciente
- Priorización por antigüedad/SLA

### Fase 3 - Preparación pagos
- Estructura extensible
- Placeholders para KPIs/tabla de pagos

### Fase 4 - Pagos productivo
- Integración real de métricas y cola operativa de pagos

---

## Riesgos

- Mezclar exceso de métricas con operación y perder foco.
- Duplicación de funcionalidades entre Dashboard y Submissions.
- Falta de definición de SLA/antigüedad para priorización real.

---

## Decisiones pendientes

1. ¿Habrá SLA formal por tipo de formulario?
2. ¿Se requiere asignación por analista/responsable?
3. ¿Se incluirá permisos por rol en dashboard (vista parcial)?
4. ¿Pagos usará los mismos estados o un set propio?

---

## Resultado esperado

Un dashboard útil para operación diaria, centrado en submissions,  
listo para escalar a pagos sin rediseño completo.