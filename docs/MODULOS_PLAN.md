# 📋 Plan de Desarrollo de Módulos - Spring Modulith

## Módulos del Sistema

```
7 MÓDULOS PRINCIPALES
├── 1. workspace       ✅ INICIADO    (Espacios de trabajo)
├── 2. form           ⏳ SIGUIENTE    (Diseño de formularios)
├── 3. submission     ⏳ DESPUÉS      (Respuestas de usuarios)
├── 4. user          ⏳ PARALELO     (Autenticación)
├── 5. notification  ⏳ FINAL        (Notificaciones)
├── 6. analytics     ⏳ FINAL        (Reportes)
└── 7. shared        ✅ COMPARTIDO   (Utilidades globales)
```

---

## 🔗 Dependencias entre Módulos

```
USER MODULE (autenticación)
    ↓
WORKSPACE MODULE ✅
    ├─→ FORM MODULE
    │       ├─→ SUBMISSION MODULE
    │       └─→ ANALYTICS MODULE
    │
    └─→ NOTIFICATION MODULE (escucha eventos de todos)

ANALYTICS MODULE (consume datos de SUBMISSION)

NOTIFICATION MODULE (escucha eventos de todos)
    ├─ WorkSpaceCreated (workspace)
    ├─ FormPublished (form)
    ├─ FormSubmitted (submission)
    └─ UserRegistered (user)
```

---

## 📅 Orden Recomendado de Desarrollo (MVP)

### Fase 1: Infraestructura Base (ACTUAL)
```
1. ✅ workspace
   └─ Espacios de trabajo + Miembros
   └─ Eventos: WorkSpaceCreated, MemberAdded
```

### Fase 2: Módulo Form (SIGUIENTE - 1-2 semanas)
```
2. ⏳ form
   ├─ Modelo: Form → Section → Question → QuestionConfig
   ├─ Use Cases: CreateForm, AddSection, AddQuestion, PublishForm
   ├─ Eventos: FormCreated, FormPublished
   └─ Relación: Form belongs_to WorkSpace
```

**Por qué primero?**
- El usuario necesita crear formularios ANTES de permitir respuestas
- No depende de submission
- Necesario para submission

### Fase 3: Módulo Submission (DESPUÉS - 1-2 semanas)
```
3. ⏳ submission
   ├─ Modelo: FormSubmission → Answer
   ├─ Use Cases: SubmitForm, SaveDraft, GetSubmissionDetail
   ├─ Eventos: FormSubmitted, SubmissionApproved
   ├─ Validación: Respuestas vs Form structure
   └─ Relación: Submission has Form (FK)
```

**Depende de:**
- `form` (debe existir Form para poder responder)

### Fase 4: Módulo User (PARALELO - 1 semana)
```
4. ⏳ user
   ├─ Modelo: User, UserProfile
   ├─ Autenticación: JWT + OAuth2 (Google/GitHub)
   ├─ Use Cases: Register, Login, UpdateProfile
   ├─ Eventos: UserRegistered, PasswordChanged
   └─ Relación: WorkSpaceMember.userId → User.id
```

**Por qué paralelo?**
- No depende de otros módulos
- Los controllers de workspace ya necesitan @PreAuthorize
- Recomendado: Implementar DESPUÉS de form pero ANTES de submission

### Fase 5: Módulo Notification (FINAL - 1 semana)
```
5. ⏳ notification
   ├─ Escucha eventos:
   │  ├─ WorkSpaceCreated → Email bienvenida
   │  ├─ FormPublished → Notificar miembros
   │  ├─ FormSubmitted → Notificar admins
   │  └─ UserRegistered → Email confirmación
   └─ Use Cases: SendEmail, SendBulkEmail
```

**Depende de:**
- `workspace`, `form`, `submission`, `user` (escucha sus eventos)

### Fase 6: Módulo Analytics (FINAL - 1-2 semanas)
```
6. ⏳ analytics
   ├─ Escucha: FormSubmitted (submission)
   ├─ Queries: Stats por Form, Response Rate, Trends
   ├─ Use Cases: GetFormAnalytics, ExportSubmissions, GenerateReport
   ├─ Exportes: CSV, Excel, PDF, JSON
   └─ Dashboards: Estadísticas visuales
```

**Depende de:**
- `form`, `submission` (necesita datos de ambos)

---

## 🎯 MVP Mínimo (Semanas 1-2)

```
SEMANA 1-2:
✅ workspace   (ya existe)
⏳ form        (generar con script)
⏳ user        (generar con script)

RESULTADO:
- Usuarios pueden crear workspaces
- Usuarios pueden crear formularios en workspaces
- Autenticación JWT funciona
```

---

## 🚀 MVP Completo (Semanas 3-5)

```
SEMANA 3-4:
⏳ submission  (generar con script)
⏳ notification (generar con script)

SEMANA 5:
⏳ analytics   (generar con script)

RESULTADO:
- Sistema completo funcional
- Usuarios pueden responder formularios
- Estadísticas y reportes
- Notificaciones por email
```

---

## 📊 Dependencias por Módulo

| Módulo | Depende de | Usado por |
|--------|-----------|-----------|
| **workspace** | (ninguno) | form, submission, user, notification |
| **form** | workspace | submission, analytics, notification |
| **submission** | form, user | analytics, notification |
| **user** | (ninguno) | workspace, submission, notification |
| **notification** | workspace, form, submission, user | (ninguno) |
| **analytics** | form, submission | (ninguno) |
| **shared** | (ninguno) | TODOS |

---

## 🔧 Cómo Declarar Dependencias en Spring Modulith

En `package-info.java` de cada módulo:

```java
// form/package-info.java
@org.springframework.modulith.ApplicationModule(
    displayName = "Form",
    allowedDependencies = "workspace"  // form depende de workspace
)
package com.tramite.online.form;
```

```java
// submission/package-info.java
@org.springframework.modulith.ApplicationModule(
    displayName = "Submission",
    allowedDependencies = {"form", "user"}  // submission depende de form y user
)
package com.tramite.online.submission;
```

---

## ⚡ Velocidad de Desarrollo con Script

Con el script `generate-module.sh` que proporcioné:

```bash
# Cada módulo se genera en 2 minutos
./scripts/generate-module.sh form       # ≈ 2 min
./scripts/generate-module.sh submission # ≈ 2 min
./scripts/generate-module.sh user       # ≈ 2 min

# Luego adaptás los models y use cases (el grueso del trabajo)
```

**Tiempo estimado por módulo:**
- `form` → 3-4 días (modelos complejos: Form, Section, Question, Config)
- `submission` → 2-3 días (más simple)
- `user` → 1-2 días (auth está disponible en librerías)
- `notification` → 1 día (es solo event listeners + SMTP)
- `analytics` → 2-3 días (queries complejas)

**Total MVP:** 2-3 semanas trabajando full-time

---

## 🎬 Próximo Paso

```bash
# Generar módulo form
cd /home/manuonda/projects/tramite-online-platform
./scripts/generate-module.sh form

# Compilar para verificar
./mvnw compile

# Luego:
# 1. Editar form/domain/model/Form.java con propiedades reales
# 2. Editar form/domain/model/Question.java con tipos de preguntas
# 3. Crear Use Cases en form/application/usecases/
# 4. Crear Controllers endpoints en form/infrastructure/web/controller/
```

---

## 📝 Verificar Modularidad

```bash
# Ejecutar tests de modularidad
./mvnw test -Dtest=ModularityTests

# Esto verifica:
# ✅ No hay dependencias circulares
# ✅ Los módulos respetan allowedDependencies
# ✅ No hay imports entre módulos no permitidos
```

