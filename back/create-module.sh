#!/usr/bin/env bash
# =============================================================================
# create-module.sh
# Genera la estructura de carpetas y package-info.java para un nuevo módulo
# siguiendo la Arquitectura Hexagonal del proyecto tramite-online.
#
# Uso:
#   ./create-module.sh <nombre-modulo>
#
# Ejemplo:
#   ./create-module.sh submission
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Validaciones
# ---------------------------------------------------------------------------
if [[ $# -ne 1 ]]; then
  echo "ERROR: Se requiere exactamente un argumento."
  echo "Uso: $0 <nombre-modulo>"
  exit 1
fi

MODULE="$1"

# Sólo letras minúsculas, números y guiones bajos
if [[ ! "$MODULE" =~ ^[a-z][a-z0-9_]*$ ]]; then
  echo "ERROR: El nombre del módulo sólo puede contener letras minúsculas, números y '_'."
  echo "       Debe empezar con una letra (p.ej. submission, form_builder)."
  exit 1
fi

# ---------------------------------------------------------------------------
# Rutas base
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_JAVA="$SCRIPT_DIR/src/main/java/com/tramite/online"
BASE_TEST="$SCRIPT_DIR/src/test/java/com/tramite/online"
BASE_RESOURCES="$SCRIPT_DIR/src/main/resources"
BASE_PKG="com.tramite.online"

MODULE_DIR="$BASE_JAVA/$MODULE"
TEST_DIR="$BASE_TEST/$MODULE"
MIGRATION_DIR="$BASE_RESOURCES/db/migration/$MODULE"

# ---------------------------------------------------------------------------
# Comprobación: el módulo no debe existir ya
# ---------------------------------------------------------------------------
if [[ -d "$MODULE_DIR" ]]; then
  echo "ERROR: El módulo '$MODULE' ya existe en '$MODULE_DIR'."
  exit 1
fi

# ---------------------------------------------------------------------------
# Helper: crea directorio y un .gitkeep si no habrá archivos Java en él
# ---------------------------------------------------------------------------
make_dir() {
  mkdir -p "$1"
}

# Helper: escribe un package-info.java
write_package_info() {
  local pkg="$1"
  local file="$2"
  cat > "$file" <<JAVA
package ${pkg};
JAVA
}

# Helper: escribe el package-info.java raíz del módulo con la anotación
# @ApplicationModule (sin dependencias declaradas por defecto)
write_root_package_info() {
  local pkg="${BASE_PKG}.${MODULE}"
  local file="$MODULE_DIR/package-info.java"
  cat > "$file" <<JAVA
@org.springframework.modulith.ApplicationModule
package ${pkg};
JAVA
}

# ---------------------------------------------------------------------------
# Crear estructura
# ---------------------------------------------------------------------------
echo ""
echo "Creando módulo: $MODULE"
echo "Directorio   : $MODULE_DIR"
echo ""

# ── domain ──────────────────────────────────────────────────────────────────
DOMAIN="$MODULE_DIR/domain"
make_dir "$DOMAIN/model"
make_dir "$DOMAIN/service"
make_dir "$DOMAIN/repository"
make_dir "$DOMAIN/event"
make_dir "$DOMAIN/exception"
make_dir "$DOMAIN/validator"

write_package_info "${BASE_PKG}.${MODULE}.domain.model"      "$DOMAIN/model/.gitkeep"      2>/dev/null || true
# Se crean directorios vacíos; git los ignora → usamos .gitkeep simbólico sólo
# donde no habrá package-info para que git los rastree.
touch "$DOMAIN/model/.gitkeep"
touch "$DOMAIN/service/.gitkeep"
touch "$DOMAIN/repository/.gitkeep"
touch "$DOMAIN/event/.gitkeep"
touch "$DOMAIN/exception/.gitkeep"
touch "$DOMAIN/validator/.gitkeep"

# ── application ─────────────────────────────────────────────────────────────
APP="$MODULE_DIR/application"
make_dir "$APP/usecases"
make_dir "$APP/dto/command"
make_dir "$APP/dto/response"
make_dir "$APP/listener"

touch "$APP/usecases/.gitkeep"
touch "$APP/dto/command/.gitkeep"
touch "$APP/dto/response/.gitkeep"
touch "$APP/listener/.gitkeep"

# ── infraestructure (ortografía del proyecto) ────────────────────────────────
INFRA="$MODULE_DIR/infraestructure"
make_dir "$INFRA/web/controller"
make_dir "$INFRA/persistence/entity"
make_dir "$INFRA/persistence/repository"
make_dir "$INFRA/persistence/adapter"
make_dir "$INFRA/persistence/mapper"
make_dir "$INFRA/config"

write_package_info "${BASE_PKG}.${MODULE}.infraestructure" "$INFRA/package-info.java"

touch "$INFRA/web/controller/.gitkeep"
touch "$INFRA/persistence/entity/.gitkeep"
touch "$INFRA/persistence/repository/.gitkeep"
touch "$INFRA/persistence/adapter/.gitkeep"
touch "$INFRA/persistence/mapper/.gitkeep"
touch "$INFRA/config/.gitkeep"

# ── exception (raíz del módulo, mismo nivel que workspace/exception) ─────────
make_dir "$MODULE_DIR/exception"
touch "$MODULE_DIR/exception/.gitkeep"

# ── package-info.java raíz ───────────────────────────────────────────────────
write_root_package_info

# ── tests ────────────────────────────────────────────────────────────────────
make_dir "$TEST_DIR/domain"
make_dir "$TEST_DIR/application"
make_dir "$TEST_DIR/infraestructure"

touch "$TEST_DIR/domain/.gitkeep"
touch "$TEST_DIR/application/.gitkeep"
touch "$TEST_DIR/infraestructure/.gitkeep"

# ── Flyway migrations ─────────────────────────────────────────────────────────
make_dir "$MIGRATION_DIR"
touch "$MIGRATION_DIR/.gitkeep"

# ---------------------------------------------------------------------------
# Resumen
# ---------------------------------------------------------------------------
echo "Estructura creada exitosamente:"
echo ""
find "$MODULE_DIR" -not -name ".gitkeep" | sort | sed "s|$SCRIPT_DIR/||"
echo ""
echo "Tests  : $(find "$TEST_DIR" -not -name ".gitkeep" | sort | sed "s|$SCRIPT_DIR/||" | tr '\n' '  ')"
echo "Flyway : src/main/resources/db/migration/$MODULE/"
echo ""
echo "Próximos pasos:"
echo "  1. Definir modelos en   $MODULE/domain/model/"
echo "  2. Crear repositorios   $MODULE/domain/repository/"
echo "  3. Implementar usecases $MODULE/application/usecases/"
echo "  4. Adapters JPA en      $MODULE/infraestructure/persistence/adapter/"
echo "  5. Controlador REST en  $MODULE/infraestructure/web/controller/"
echo "  6. Migración Flyway en  db/migration/$MODULE/V1.0__create_${MODULE}_table.sql"
echo "  7. Ejecutar: ./mvnw test -Dtest=ModularityTest"
