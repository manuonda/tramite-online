package com.tramite.online.workspace.application.usecases;


import com.tramite.online.workspace.application.dto.response.MemberResponse;
import com.tramite.online.workspace.domain.event.MemberUpdated;
import com.tramite.online.workspace.domain.model.WorkSpaceMember;
import com.tramite.online.workspace.domain.repository.WorkSpaceMemberRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Caso de Uso que permite acutalizar el role
 * en el Espacio de Trabajo
 * @author  dgarcia
 * @version 1.0
 * @since  24/11/2025
 */
@Service
public class UpdateMemberRoleUseCase {
    private final WorkSpaceMemberRepository workSpaceMemberRepository;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final Logger logger = LoggerFactory.getLogger(UpdateMemberRoleUseCase.class);


    public UpdateMemberRoleUseCase(WorkSpaceMemberRepository workSpaceMemberRepository, ApplicationEventPublisher applicationEventPublisher) {
        this.workSpaceMemberRepository = workSpaceMemberRepository;
        this.applicationEventPublisher = applicationEventPublisher;
    }

    @Transactional
    public MemberResponse execute(WorkSpaceMember command) {
        logger.info("Actualiza role para el usuario {} del Espacio de Trabajo con Role {}",
                command.getUserId(), command.getWorkSpaceId(),command.getRole());

        WorkSpaceMember member = this.workSpaceMemberRepository.findByWorkspaceIdAndUserId(
                command.getWorkSpaceId(), command.getUserId()
        ).orElseThrow(() -> new RuntimeException("No se encontro el usuario dentro del Espacio de Trabajo"));

        member.setRole(command.getRole());

        WorkSpaceMember memberSaved = this.workSpaceMemberRepository.save(member);

        this.applicationEventPublisher.publishEvent(new MemberUpdated(memberSaved));

        logger.info("Role updated for user {} in workspace {}", command.getUserId(),
                command.getWorkSpaceId());
        return toResponse(memberSaved);
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

