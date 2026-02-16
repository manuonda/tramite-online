package com.tramite.online.workspace.application.usecases;


import com.tramite.online.workspace.application.dto.command.ListWorkSpacesByOwnerCommand;
import com.tramite.online.workspace.application.dto.response.ListWorkSpaceResponse;
import com.tramite.online.workspace.domain.model.WorkSpace;
import com.tramite.online.workspace.domain.repository.WorkSpaceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * Caso de uso para listar WorkSpaces por propietario
 *
 * @author dgarcia
 * @version 1.0
 * @since   22/11/2025
 */
@Service
public class ListWorkSpacesByOwnerUseCase {

    private final WorkSpaceRepository workSpaceRepository;
    private final Logger logger = LoggerFactory.getLogger(ListWorkSpacesByOwnerUseCase.class);

    public ListWorkSpacesByOwnerUseCase(WorkSpaceRepository workSpaceRepository) {
        this.workSpaceRepository = workSpaceRepository;
    }

    @Transactional(readOnly = true)
    public ListWorkSpaceResponse execute(ListWorkSpacesByOwnerCommand command) {
        logger.info("Listing workspaces for owner {}", command.ownerId());

        List<WorkSpace> workSpaces = workSpaceRepository.findByOwnerId(command.ownerId());

        List<com.tramite.online.workspace.application.dto.response.WorkSpaceResponse> responses = workSpaces.stream()
                .map(this::toResponse)
                .toList();

        logger.info("Found {} workspaces for owner {}", responses.size(), command.ownerId());
        return new ListWorkSpaceResponse(responses);
    }

    private com.tramite.online.workspace.application.dto.response.WorkSpaceResponse toResponse(WorkSpace workSpace) {
        return new com.tramite.online.workspace.application.dto.response.WorkSpaceResponse(
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
