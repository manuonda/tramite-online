package com.tramite.online.workspace.application.usecases;

import com.tramite.online.workspace.application.dto.command.AddMemberCommand;
import com.tramite.online.workspace.application.dto.response.MemberResponse;
import com.tramite.online.workspace.domain.event.MemberAdded;
import com.tramite.online.workspace.domain.model.WorkSpace;
import com.tramite.online.workspace.domain.model.WorkSpaceMember;
import com.tramite.online.workspace.domain.repository.WorkSpaceMemberRepository;
import com.tramite.online.workspace.domain.repository.WorkSpaceRepository;
import com.tramite.online.workspace.exception.WorkSpaceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


/**
 * Caso de uso que permite agregar un miembro al espacio de trabajo
 * @author dgarcia
 * @version 1.0
 * @since 24/11/2025
 */

@Service
public class AddMemberUseCase {

    private final WorkSpaceRepository workSpaceRepository;
    private final WorkSpaceMemberRepository workSpaceMemberRepository;
    private final ApplicationEventPublisher publisher;
    private final Logger logger = LoggerFactory.getLogger(AddMemberUseCase.class);


    public AddMemberUseCase(WorkSpaceRepository workSpaceRepository, WorkSpaceMemberRepository workSpaceMemberRepository, ApplicationEventPublisher publisher) {
        this.workSpaceRepository = workSpaceRepository;
        this.workSpaceMemberRepository = workSpaceMemberRepository;
        this.publisher = publisher;
    }

    @Transactional
    public MemberResponse execute(AddMemberCommand command){
        logger.info("Adding member {}", command);
        WorkSpace workSpace = this.workSpaceRepository.findById(command.workSpaceId())
                .orElseThrow(() -> new WorkSpaceNotFoundException(command.workSpaceId()));

        if (workSpaceMemberRepository.findByWorkspaceIdAndUserId(command.workSpaceId(), command.userId()).isPresent()) {
           throw new RuntimeException("Member already exists");
        }

        //Create event
        WorkSpaceMember workSpaceMember = new WorkSpaceMember(
                command.workSpaceId(),
                command.userId(),
                command.role()
        );

        WorkSpaceMember workSpaceMemberSaved = this.workSpaceMemberRepository.save(workSpaceMember);

        //publicar el evento
        this.publisher.publishEvent(new MemberAdded(workSpaceMemberSaved));

        logger.info("Miembro {} agregado al espacio de trabajo {} con el role {}",
                workSpaceMemberSaved.getUserId(),
                workSpaceMemberSaved.getWorkSpaceId(),
                workSpaceMemberSaved.getRole());
        return toResponse(workSpaceMemberSaved);
    }
    private MemberResponse toResponse(WorkSpaceMember member) {
        return new MemberResponse(
                member.getId(),
                member.getWorkSpaceId(),
                member.getUserId(),
                member.getRole().toString(),
                member.getJoinedAt(),
                member.getUpdatedAt()
        );
    }

}
