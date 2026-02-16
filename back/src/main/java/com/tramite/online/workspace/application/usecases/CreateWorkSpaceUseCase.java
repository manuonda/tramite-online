package com.tramite.online.workspace.application.usecases;


import com.tramite.online.workspace.application.dto.command.CreateWorkSpaceCommand;
import com.tramite.online.workspace.application.dto.response.WorkSpaceResponse;
import com.tramite.online.workspace.domain.event.WorkSpaceCreated;
import com.tramite.online.workspace.domain.model.WorkSpace;
import com.tramite.online.workspace.domain.repository.WorkSpaceRepository;
import com.tramite.online.workspace.domain.validator.WorkSpaceValidator;
import com.tramite.online.workspace.exception.DuplicatedWorkSpaceException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


/**
 * Caso de uso para crear un nuevo WorkSpace
 *
 * @author dgarcia
 * @version 1.0
 * @since   22/11/2025
 */
@Service
public class CreateWorkSpaceUseCase {

    private final WorkSpaceRepository workSpaceRepository;
    private final ApplicationEventPublisher eventPublisher;


    public CreateWorkSpaceUseCase(WorkSpaceRepository workSpaceRepository, ApplicationEventPublisher eventPublisher) {
        this.workSpaceRepository = workSpaceRepository;
        this.eventPublisher = eventPublisher;
    }
    @Transactional
    public WorkSpaceResponse createWorkSpace(CreateWorkSpaceCommand command) {
        WorkSpaceValidator.validateName(command.name());

        if(workSpaceRepository.findByName(command.name()).isPresent()){
            throw new DuplicatedWorkSpaceException(command.name());
        }

        //Crear entidad de dominio
        WorkSpace workSpace = new WorkSpace(
                command.name(),
                command.description(),
                command.ownerId()
        );

        // Validar WorkSpace
        WorkSpaceValidator.validateWorkSpace(workSpace);
        // Persistir en BD
        WorkSpace workSpaceSaved = workSpaceRepository.save(workSpace);

        // Publicar el evento(other modulos escuchan)
        eventPublisher.publishEvent(new WorkSpaceCreated(workSpaceSaved));

        return toResponse(workSpaceSaved);
    }

    public WorkSpaceResponse toResponse(WorkSpace workSpace) {
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
