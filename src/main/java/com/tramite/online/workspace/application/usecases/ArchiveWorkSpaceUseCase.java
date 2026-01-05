package com.tramite.online.workspace.application.usecases;

import com.tramite.online.workspace.application.dto.command.ArchiveWorkSpaceCommand;
import com.tramite.online.workspace.application.dto.response.WorkSpaceResponse;
import com.tramite.online.workspace.domain.event.WorkSpaceArchived;
import com.tramite.online.workspace.domain.model.WorkSpace;
import com.tramite.online.workspace.domain.repository.WorkSpaceRepository;
import com.tramite.online.workspace.exception.WorkSpaceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


/**
 * Caso de Uso para Archivar Espacio de Trabajo
 * @author  dgarcia
 * @version 1.0
 * @since   22/11/2025
 *
 */
@Service
public class ArchiveWorkSpaceUseCase {
    private final WorkSpaceRepository workSpaceRepository;
    private final ApplicationEventPublisher publisher;
    private final Logger logger = LoggerFactory.getLogger(ArchiveWorkSpaceUseCase.class);


    public ArchiveWorkSpaceUseCase(WorkSpaceRepository workSpaceRepository, ApplicationEventPublisher publisher) {
        this.workSpaceRepository = workSpaceRepository;
        this.publisher = publisher;
    }

    @Transactional
    public WorkSpaceResponse execute(ArchiveWorkSpaceCommand command){
        logger.info("Executing command {}", command);
        WorkSpace workSpace = this.workSpaceRepository.findById(command.workSpaceId())
                .orElseThrow(() -> new WorkSpaceNotFoundException(command.workSpaceId()));

        try{
            workSpace.archive();
        }catch(IllegalAccessException ex) {
            logger.error("IllegalAccessException {}", ex.toString());
            throw new RuntimeException(ex);
        }

        WorkSpace archive = this.workSpaceRepository.save(workSpace);
        publisher.publishEvent(new WorkSpaceArchived(archive));

        return this.toResponse(archive);
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
