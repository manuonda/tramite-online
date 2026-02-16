package com.tramite.online.workspace.infraestructure.persistence.repository;

import com.tramite.online.workspace.domain.model.WorkSpace;
import com.tramite.online.workspace.infraestructure.persistence.entity.WorkSpaceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


/**
 * Repositorio Spring Data JPA para WorkSpaceEntity
 * Define queries para acceder a la tabla workspaces
 * Spring implementa automáticamente estos métodos basándose en sus nombres
 *
 * Patrón de nombrado:
 * - findBy{FieldName}() → SELECT * WHERE field = ?
 * - findBy{Field1}And{Field2}() → SELECT * WHERE field1 = ? AND field2 = ?
 * - deleteBy{FieldName}() → DELETE WHERE field = ?
 *
 * @author dgarcia
 * @version 1.0
 * @since 27/11/2025
 */
@Repository
public interface WorkSpaceJpaRepository extends JpaRepository<WorkSpaceEntity, Long> {

  /**
   * Busca un workspace por ID
   * Genera SQL: SELECT * FROM workspaces WHERE id = ?
   *
   * @param id el ID del workspace
   * @return Optional con el workspace si existe, empty si no
   */
  Optional<WorkSpaceEntity> findById(Long id);

  /**
   * Busca un workspace por nombre
   * Genera SQL: SELECT * FROM workspaces WHERE name = ?
   *
   * @param name el nombre del workspace
   * @return Optional con el workspace si existe, empty si no
   */
  Optional<WorkSpaceEntity> findByName(String name);

  /**
   * Lista todos los workspaces de un propietario
   * Genera SQL: SELECT * FROM workspaces WHERE owner_id = ?
   *
   * @param ownerId el ID del propietario
   * @return List de workspaces del propietario
   */
  List<WorkSpaceEntity> findByOwnerId(Long ownerId);

  /**
   * Lista todos los workspaces no archivados
   * Genera SQL: SELECT * FROM workspaces WHERE archived = false
   *
   * @return List de workspaces activos (no archivados)
   */
  List<WorkSpaceEntity> findByArchivedFalse();

  /**
   * Lista todos los workspaces archivados
   * Genera SQL: SELECT * FROM workspaces WHERE archived = true
   *
   * @return List de workspaces archivados
   */
  List<WorkSpaceEntity> findByArchivedTrue();

  /**
   * Lista workspaces activos y no archivados
   * Genera SQL: SELECT * FROM workspaces WHERE active = true AND archived = false
   *
   * @return List de workspaces disponibles para usar
   */
  List<WorkSpaceEntity> findByActiveTrueAndArchivedFalse();
}
