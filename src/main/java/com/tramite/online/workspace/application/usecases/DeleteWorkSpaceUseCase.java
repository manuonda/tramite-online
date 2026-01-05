package com.tramite.online.workspace.application.usecases;

import com.tramite.online.workspace.application.dto.command.DeleteWorkSpaceCommand;
import com.tramite.online.workspace.application.dto.response.WorkSpaceResponse;
import com.tramite.online.workspace.domain.event.WorkSpaceDeleted;
import com.tramite.online.workspace.domain.event.WorkSpaceUpdated;
import com.tramite.online.workspace.domain.model.WorkSpace;
import com.tramite.online.workspace.domain.repository.WorkSpaceRepository;
import com.tramite.online.workspace.exception.WorkSpaceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class DeleteWorkSpaceUseCase {

    private final WorkSpaceRepository workSpaceRepository;
    private final ApplicationEventPublisher publisher;
    private final Logger logger = LoggerFactory.getLogger(DeleteWorkSpaceUseCase.class);

    public DeleteWorkSpaceUseCase(WorkSpaceRepository workSpaceRepository, ApplicationEventPublisher publisher) {
        this.workSpaceRepository = workSpaceRepository;
        this.publisher = publisher;
    }

    @Transactional
    public void execute(DeleteWorkSpaceCommand command){
        logger.info("Deleting WorkSpace with id {}", command.workSpaceId());
        var workSpace = this.workSpaceRepository.findById(command.workSpaceId())
                .orElseThrow(() -> new WorkSpaceNotFoundException(command.workSpaceId()));

        workSpace.setActive(Boolean.FALSE);
        WorkSpace workSpaceToDelete = this.workSpaceRepository.save(workSpace);


        this.publisher.publishEvent(new WorkSpaceDeleted(workSpaceToDelete));
        logger.info("Deleted WorkSpace with id {}", workSpaceToDelete.getId());
    }
}
