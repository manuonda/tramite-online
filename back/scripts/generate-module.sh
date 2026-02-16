#!/bin/bash

# Script para generar la estructura de un nuevo módulo con Spring Modulith
# Uso: ./generate-module.sh form
# Genera toda la estructura: domain, application, infrastructure

set -e

MODULE_NAME=$1
MODULE_LOWER=$(echo $MODULE_NAME | tr '[:upper:]' '[:lower:]')
MODULE_UPPER=$(echo $MODULE_NAME | tr '[:lower:]' '[:upper:]')
MODULE_CAMEL=$(echo $MODULE_NAME | sed 's/\b\(.\)/\U\1/g')  # PascalCase

if [ -z "$MODULE_NAME" ]; then
    echo "❌ Error: Debes especificar el nombre del módulo"
    echo "Uso: $0 <module-name>"
    echo "Ejemplo: $0 form"
    exit 1
fi

BASE_PATH="src/main/java/com/tramite/online"
MODULE_PATH="$BASE_PATH/$MODULE_LOWER"

if [ -d "$MODULE_PATH" ]; then
    echo "❌ El módulo '$MODULE_NAME' ya existe en $MODULE_PATH"
    exit 1
fi

echo "📦 Generando módulo: $MODULE_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Crear directorios domain
mkdir -p "$MODULE_PATH/domain/model"
mkdir -p "$MODULE_PATH/domain/service"
mkdir -p "$MODULE_PATH/domain/repository"
mkdir -p "$MODULE_PATH/domain/event"
mkdir -p "$MODULE_PATH/domain/exception"
mkdir -p "$MODULE_PATH/domain/validator"

# Crear directorios application
mkdir -p "$MODULE_PATH/application/usecases"
mkdir -p "$MODULE_PATH/application/dto/command"
mkdir -p "$MODULE_PATH/application/dto/response"
mkdir -p "$MODULE_PATH/application/listener"

# Crear directorios infrastructure
mkdir -p "$MODULE_PATH/infraestructure/web/controller"
mkdir -p "$MODULE_PATH/infraestructure/web/dto"
mkdir -p "$MODULE_PATH/infraestructure/persistence/entity"
mkdir -p "$MODULE_PATH/infraestructure/persistence/repository"
mkdir -p "$MODULE_PATH/infraestructure/persistence/adapter"
mkdir -p "$MODULE_PATH/infraestructure/persistence/mapper"
mkdir -p "$MODULE_PATH/infraestructure/config"

echo "✅ Directorios creados"

# Crear package-info.java para marcar como módulo Spring Modulith
cat > "$MODULE_PATH/package-info.java" << 'EOF'
/**
 * MODULE: $MODULE_CAMEL
 *
 * Descripción del módulo
 */
@org.springframework.modulith.ApplicationModule(displayName = "$MODULE_CAMEL")
package com.tramite.online.$MODULE_LOWER;
EOF

sed -i "s/\$MODULE_CAMEL/$MODULE_CAMEL/g" "$MODULE_PATH/package-info.java"
sed -i "s/\$MODULE_LOWER/$MODULE_LOWER/g" "$MODULE_PATH/package-info.java"

echo "✅ package-info.java creado"

# Crear entidad base del dominio
cat > "$MODULE_PATH/domain/model/${MODULE_CAMEL}.java" << 'EOF'
package com.tramite.online.$MODULE_LOWER.domain.model;

import java.time.LocalDateTime;

/**
 * Entidad de dominio para $MODULE_CAMEL
 *
 * @author
 * @version 1.0
 * @since $(date +%d/%m/%Y)
 */
public class $MODULE_CAMEL {

    private Long id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public $MODULE_CAMEL() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
EOF

sed -i "s/\$MODULE_CAMEL/$MODULE_CAMEL/g" "$MODULE_PATH/domain/model/${MODULE_CAMEL}.java"
sed -i "s/\$MODULE_LOWER/$MODULE_LOWER/g" "$MODULE_PATH/domain/model/${MODULE_CAMEL}.java"

echo "✅ Entidad de dominio creada"

# Crear Repository Interface
cat > "$MODULE_PATH/domain/repository/${MODULE_CAMEL}Repository.java" << 'EOF'
package com.tramite.online.$MODULE_LOWER.domain.repository;

import com.tramite.online.$MODULE_LOWER.domain.model.$MODULE_CAMEL;
import java.util.List;
import java.util.Optional;

/**
 * Puerto (interfaz) que define el contrato para acceder a $MODULE_CAMEL
 */
public interface ${MODULE_CAMEL}Repository {
    ${MODULE_CAMEL} save(${MODULE_CAMEL} $MODULE_LOWER);
    Optional<${MODULE_CAMEL}> findById(Long id);
    List<${MODULE_CAMEL}> findAll();
    void delete(Long id);
}
EOF

sed -i "s/\$MODULE_CAMEL/$MODULE_CAMEL/g" "$MODULE_PATH/domain/repository/${MODULE_CAMEL}Repository.java"
sed -i "s/\$MODULE_LOWER/$MODULE_LOWER/g" "$MODULE_PATH/domain/repository/${MODULE_CAMEL}Repository.java"

echo "✅ Repository interface creada"

# Crear JPA Repository
cat > "$MODULE_PATH/infraestructure/persistence/repository/${MODULE_CAMEL}JpaRepository.java" << 'EOF'
package com.tramite.online.$MODULE_LOWER.infraestructure.persistence.repository;

import com.tramite.online.$MODULE_LOWER.infraestructure.persistence.entity.${MODULE_CAMEL}Entity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio Spring Data JPA para ${MODULE_CAMEL}Entity
 */
@Repository
public interface ${MODULE_CAMEL}JpaRepository extends JpaRepository<${MODULE_CAMEL}Entity, Long> {
}
EOF

sed -i "s/\$MODULE_CAMEL/$MODULE_CAMEL/g" "$MODULE_PATH/infraestructure/persistence/repository/${MODULE_CAMEL}JpaRepository.java"

echo "✅ JPA Repository creada"

# Crear Entity JPA
cat > "$MODULE_PATH/infraestructure/persistence/entity/${MODULE_CAMEL}Entity.java" << 'EOF'
package com.tramite.online.$MODULE_LOWER.infraestructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entidad JPA para $MODULE_CAMEL
 */
@Entity
@Table(name = "${MODULE_LOWER}s")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ${MODULE_CAMEL}Entity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
EOF

sed -i "s/\$MODULE_CAMEL/$MODULE_CAMEL/g" "$MODULE_PATH/infraestructure/persistence/entity/${MODULE_CAMEL}Entity.java"
sed -i "s/\$MODULE_LOWER/$MODULE_LOWER/g" "$MODULE_PATH/infraestructure/persistence/entity/${MODULE_CAMEL}Entity.java"

echo "✅ Entity JPA creada"

# Crear Mapper
cat > "$MODULE_PATH/infraestructure/persistence/mapper/${MODULE_CAMEL}Mapper.java" << 'EOF'
package com.tramite.online.$MODULE_LOWER.infraestructure.persistence.mapper;

import com.tramite.online.$MODULE_LOWER.domain.model.$MODULE_CAMEL;
import com.tramite.online.$MODULE_LOWER.infraestructure.persistence.entity.${MODULE_CAMEL}Entity;
import org.springframework.stereotype.Component;

/**
 * Mapper que convierte entre $MODULE_CAMEL (dominio) y ${MODULE_CAMEL}Entity (JPA)
 */
@Component
public class ${MODULE_CAMEL}Mapper {

    public ${MODULE_CAMEL}Entity toEntity(${MODULE_CAMEL} $MODULE_LOWER) {
        if ($MODULE_LOWER == null) return null;

        ${MODULE_CAMEL}Entity entity = new ${MODULE_CAMEL}Entity();
        entity.setId($MODULE_LOWER.getId());
        entity.setCreatedAt($MODULE_LOWER.getCreatedAt());
        entity.setUpdatedAt($MODULE_LOWER.getUpdatedAt());
        return entity;
    }

    public ${MODULE_CAMEL} toDomain(${MODULE_CAMEL}Entity entity) {
        if (entity == null) return null;

        ${MODULE_CAMEL} $MODULE_LOWER = new ${MODULE_CAMEL}();
        $MODULE_LOWER.setId(entity.getId());
        $MODULE_LOWER.setCreatedAt(entity.getCreatedAt());
        $MODULE_LOWER.setUpdatedAt(entity.getUpdatedAt());
        return $MODULE_LOWER;
    }
}
EOF

sed -i "s/\$MODULE_CAMEL/$MODULE_CAMEL/g" "$MODULE_PATH/infraestructure/persistence/mapper/${MODULE_CAMEL}Mapper.java"
sed -i "s/\$MODULE_LOWER/$MODULE_LOWER/g" "$MODULE_PATH/infraestructure/persistence/mapper/${MODULE_CAMEL}Mapper.java"

echo "✅ Mapper creada"

# Crear Repository Adapter
cat > "$MODULE_PATH/infraestructure/persistence/adapter/${MODULE_CAMEL}RepositoryAdapter.java" << 'EOF'
package com.tramite.online.$MODULE_LOWER.infraestructure.persistence.adapter;

import com.tramite.online.$MODULE_LOWER.domain.model.$MODULE_CAMEL;
import com.tramite.online.$MODULE_LOWER.domain.repository.${MODULE_CAMEL}Repository;
import com.tramite.online.$MODULE_LOWER.infraestructure.persistence.entity.${MODULE_CAMEL}Entity;
import com.tramite.online.$MODULE_LOWER.infraestructure.persistence.mapper.${MODULE_CAMEL}Mapper;
import com.tramite.online.$MODULE_LOWER.infraestructure.persistence.repository.${MODULE_CAMEL}JpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Adapter $MODULE_CAMEL Repository
 * Implementa el puerto de dominio usando Spring Data JPA
 */
@Component
public class ${MODULE_CAMEL}RepositoryAdapter implements ${MODULE_CAMEL}Repository {

    private final ${MODULE_CAMEL}JpaRepository jpaRepository;
    private final ${MODULE_CAMEL}Mapper mapper;
    private static final Logger logger = LoggerFactory.getLogger(${MODULE_CAMEL}RepositoryAdapter.class);

    public ${MODULE_CAMEL}RepositoryAdapter(${MODULE_CAMEL}JpaRepository jpaRepository, ${MODULE_CAMEL}Mapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public ${MODULE_CAMEL} save(${MODULE_CAMEL} $MODULE_LOWER) {
        logger.info("Saving $MODULE_LOWER {}", $MODULE_LOWER);
        ${MODULE_CAMEL}Entity entity = mapper.toEntity($MODULE_LOWER);
        ${MODULE_CAMEL}Entity entitySaved = jpaRepository.save(entity);
        return mapper.toDomain(entitySaved);
    }

    @Override
    public Optional<${MODULE_CAMEL}> findById(Long id) {
        logger.info("Finding $MODULE_LOWER by id {}", id);
        return jpaRepository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public List<${MODULE_CAMEL}> findAll() {
        logger.info("Finding all ${MODULE_LOWER}s");
        return jpaRepository.findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public void delete(Long id) {
        logger.info("Deleting $MODULE_LOWER by id {}", id);
        jpaRepository.deleteById(id);
    }
}
EOF

sed -i "s/\$MODULE_CAMEL/$MODULE_CAMEL/g" "$MODULE_PATH/infraestructure/persistence/adapter/${MODULE_CAMEL}RepositoryAdapter.java"
sed -i "s/\$MODULE_LOWER/$MODULE_LOWER/g" "$MODULE_PATH/infraestructure/persistence/adapter/${MODULE_CAMEL}RepositoryAdapter.java"

echo "✅ Repository Adapter creada"

# Crear Controller
cat > "$MODULE_PATH/infraestructure/web/controller/${MODULE_CAMEL}Controller.java" << 'EOF'
package com.tramite.online.$MODULE_LOWER.infraestructure.web.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller para $MODULE_CAMEL
 */
@RestController
@RequestMapping("/api/${MODULE_LOWER}s")
public class ${MODULE_CAMEL}Controller {

    // TODO: Implementar endpoints
}
EOF

sed -i "s/\$MODULE_CAMEL/$MODULE_CAMEL/g" "$MODULE_PATH/infraestructure/web/controller/${MODULE_CAMEL}Controller.java"
sed -i "s/\$MODULE_LOWER/$MODULE_LOWER/g" "$MODULE_PATH/infraestructure/web/controller/${MODULE_CAMEL}Controller.java"

echo "✅ REST Controller creada"

# Crear Exception
cat > "$MODULE_PATH/domain/exception/${MODULE_CAMEL}NotFoundException.java" << 'EOF'
package com.tramite.online.$MODULE_LOWER.domain.exception;

/**
 * Excepción cuando no se encuentra un $MODULE_CAMEL
 */
public class ${MODULE_CAMEL}NotFoundException extends RuntimeException {

    public ${MODULE_CAMEL}NotFoundException(String message) {
        super(message);
    }

    public ${MODULE_CAMEL}NotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
EOF

sed -i "s/\$MODULE_CAMEL/$MODULE_CAMEL/g" "$MODULE_PATH/domain/exception/${MODULE_CAMEL}NotFoundException.java"

echo "✅ Exception creada"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ¡Módulo '$MODULE_NAME' generado exitosamente!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Ubicación: $MODULE_PATH"
echo ""
echo "📝 Próximos pasos:"
echo "  1. Agregar Domain Model properties"
echo "  2. Crear UseCases en application/usecases/"
echo "  3. Crear Domain Events en domain/event/"
echo "  4. Implementar Controller endpoints"
echo "  5. Ejecutar: mvn compile"
echo ""
echo "🔗 Documentación: https://spring.io/projects/spring-modulith"
echo ""
