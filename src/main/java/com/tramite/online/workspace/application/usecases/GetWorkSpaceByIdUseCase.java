package com.tramite.online.workspace.application.usecases;


import com.tramite.online.workspace.application.dto.command.GetWorkSpaceByIdCommand;
import com.tramite.online.workspace.application.dto.response.WorkSpaceResponse;
import com.tramite.online.workspace.domain.model.WorkSpace;
import com.tramite.online.workspace.domain.repository.WorkSpaceRepository;
import com.tramite.online.workspace.exception.WorkSpaceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Caso de uso para obtener un WorkSpace por ID
 *
 * @author dgarcia
 * @version 1.0
 * @since   22/11/2025
 */
@Service
public class GetWorkSpaceByIdUseCase {

    private final WorkSpaceRepository workSpaceRepository;
    private final Logger logger = LoggerFactory.getLogger(GetWorkSpaceByIdUseCase.class);

    public GetWorkSpaceByIdUseCase(WorkSpaceRepository workSpaceRepository) {
        this.workSpaceRepository = workSpaceRepository;
    }

    @Transactional(readOnly = true)
    public WorkSpaceResponse execute(GetWorkSpaceByIdCommand command) {
        logger.info("Getting workspace with id {}", command.workSpaceId());

        WorkSpace workSpace = workSpaceRepository.findById(command.workSpaceId())
                .orElseThrow(() -> new WorkSpaceNotFoundException(
                        "Workspace with id " + command.workSpaceId() + " not found"));

        logger.info("Workspace found with id {}", command.workSpaceId());
        return toResponse(workSpace);
    }

    private WorkSpaceResponse toResponse(WorkSpace workSpace) {
        return new WorkSpaceResponse(
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
