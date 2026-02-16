package com.tramite.online.workspace.domain.repository;

import com.tramite.online.workspace.domain.model.WorkSpace;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

/**
 * Puerto interfaz que define el contrato para acceder a WorkSpace
 * la implemetacion esta en infraestructura layer
 *
 * @author dgarcia
 * @version 1.0
 * @since 22/11/2025
 */
public interface WorkSpaceRepository {
    Optional<WorkSpace> findById(Long id);
    WorkSpace save(WorkSpace workSpace);
    List<WorkSpace> findAll();
    List<WorkSpace> findByOwnerId(Long ownerId);
    Optional<WorkSpace> findByName(String name);
    void delete(Long id);
    boolean exists(Long id);
}
