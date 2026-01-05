package com.tramite.online.workspace.infraestructure.persistence.repository;

import com.tramite.online.workspace.infraestructure.persistence.entity.WorkSpaceMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio Spring Data JPA para WorkSpaceMemberEntity
 * Define queries para acceder a la tabla workspace_members
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
public interface WorkSpaceMemberJpaRepository extends JpaRepository<WorkSpaceMemberEntity, Long> {

  /**
   * Lista todos los miembros de un workspace específico
   * Genera SQL: SELECT * FROM workspace_members WHERE workspace_id = ?
   *
   * @param workSpaceId el ID del workspace
   * @return List de miembros del workspace
   */
  List<WorkSpaceMemberEntity> findByWorkSpaceId(Long workSpaceId);

  /**
   * Busca un miembro específico en un workspace por ID del usuario
   * Genera SQL: SELECT * FROM workspace_members WHERE workspace_id = ? AND user_id = ?
   *
   * @param workSpaceId el ID del workspace
   * @param userId el ID del usuario
   * @return Optional con el miembro si existe, empty si no
   */
  Optional<WorkSpaceMemberEntity> findByWorkSpaceIdAndUserId(Long workSpaceId, Long userId);

  /**
   * Lista todos los workspaces donde está un usuario específico
   * Genera SQL: SELECT * FROM workspace_members WHERE user_id = ?
   *
   * @param userId el ID del usuario
   * @return List de workspaces donde participa el usuario
   */
  List<WorkSpaceMemberEntity> findByUserId(Long userId);

  /**
   * Cuenta el número de miembros en un workspace
   * Genera SQL: SELECT COUNT(*) FROM workspace_members WHERE workspace_id = ?
   *
   * @param workSpaceId el ID del workspace
   * @return número de miembros en el workspace
   */
  int countByWorkSpaceId(Long workSpaceId);

  /**
   * Elimina un miembro específico de un workspace
   * Genera SQL: DELETE FROM workspace_members WHERE workspace_id = ? AND user_id = ?
   *
   * @param workSpaceId el ID del workspace
   * @param userId el ID del usuario a remover
   */
  void deleteByWorkSpaceIdAndUserId(Long workSpaceId, Long userId);
}
