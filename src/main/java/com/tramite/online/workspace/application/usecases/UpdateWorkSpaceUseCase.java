package com.tramite.online.workspace.application.usecases;

import com.tramite.online.workspace.application.dto.command.UpdateWorkSpaceCommand;
import com.tramite.online.workspace.application.dto.response.WorkSpaceResponse;
import com.tramite.online.workspace.domain.event.WorkSpaceUpdated;
import com.tramite.online.workspace.domain.model.WorkSpace;
import com.tramite.online.workspace.domain.repository.WorkSpaceRepository;
import com.tramite.online.workspace.exception.DuplicatedWorkSpaceException;
import com.tramite.online.workspace.exception.WorkSpaceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UpdateWorkSpaceUseCase {

    private final WorkSpaceRepository workSpaceRepository;
    private final ApplicationEventPublisher publisher;
    private final Logger logger = LoggerFactory.getLogger(UpdateWorkSpaceUseCase.class);

    public UpdateWorkSpaceUseCase(WorkSpaceRepository workSpaceRepository, ApplicationEventPublisher publisher) {
        this.workSpaceRepository = workSpaceRepository;
        this.publisher = publisher;
    }

    @Transactional
    public WorkSpaceResponse update(Long id, UpdateWorkSpaceCommand command) {
        logger.info("Update workspace using command {}", command);
        WorkSpace workSpace = this.workSpaceRepository.findById(id)
                .orElseThrow(() -> new WorkSpaceNotFoundException("Workspace not found"));

        Optional<WorkSpace> workSpaceFindName = this.workSpaceRepository.findByName(command.name());
        if(workSpaceFindName.isPresent() && !
                workSpaceFindName.get().getId().equals(workSpace.getId())) {
            throw new DuplicatedWorkSpaceException("Workspace with name " + workSpace.getName() + " already exists");
        }


        workSpace.setName(command.name());
        workSpace.setDescription(command.description());
        workSpace.setOwnerId(command.ownerId());
        workSpace.setUpdatedAt(LocalDateTime.now());

        WorkSpace updatedWorkSpace = this.workSpaceRepository.save(workSpace);

        this.publisher.publishEvent(new WorkSpaceUpdated(workSpace));
        logger.info("Updated workspace with name {}", workSpace.getName());
        return this.toResponse(updatedWorkSpace);

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
