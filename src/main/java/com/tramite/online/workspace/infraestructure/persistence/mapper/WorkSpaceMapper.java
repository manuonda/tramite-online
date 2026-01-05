package com.tramite.online.workspace.infraestructure.persistence.mapper;

import com.tramite.online.workspace.domain.model.WorkSpace;
import com.tramite.online.workspace.infraestructure.persistence.entity.WorkSpaceEntity;
import org.springframework.stereotype.Component;

/**
 * Mapper que convierte entre WorkSpace (dominio) y WorkSpaceEntity (persistencia)
 *
 * @author dgarcia
 * @version 1.0
 * @since   22/11/2025
 */
@Component
public class WorkSpaceMapper {

    /**
     * Convierte WorkSpaceEntity (JPA) → WorkSpace (Dominio)
     */
    public WorkSpace toDomain(WorkSpaceEntity entity) {
        if (entity == null) {
            return null;
        }

        WorkSpace workSpace = new WorkSpace();
        workSpace.setId(entity.getId());
        workSpace.setName(entity.getName());
        workSpace.setDescription(entity.getDescription());
        workSpace.setActive(entity.isActive());
        workSpace.setArchived(entity.isArchived());
        workSpace.setOwnerId(entity.getOwnerId());
        workSpace.setCreatedAt(entity.getCreatedAt());
        workSpace.setUpdatedAt(entity.getUpdatedAt());

        return workSpace;
    }

    /**
     * Convierte WorkSpace (Dominio) → WorkSpaceEntity (JPA)
     */
    public WorkSpaceEntity toPersistence(WorkSpace workSpace) {
        if (workSpace == null) {
            return null;
        }

        return new WorkSpaceEntity(
                workSpace.getId(),
                workSpace.getName(),
                workSpace.getDescription(),
                workSpace.isActive(),
                workSpace.isArchived(),
                workSpace.getOwnerId(),
                workSpace.getCreatedAt(),
                workSpace.getUpdatedAt()
        );
    }
}
