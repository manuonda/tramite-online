package com.tramite.online.workspace.application.usecases;


import com.tramite.online.workspace.application.dto.command.RemoveMemberCommand;
import com.tramite.online.workspace.domain.model.WorkSpaceMember;
import com.tramite.online.workspace.domain.repository.WorkSpaceMemberRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Caso de uso que permite remover un Miembro
 * del Espacio de Trabajo
 */
@Service
public class RemoveMemberUseCase {
    private final WorkSpaceMemberRepository workSpaceMemberRepository;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final Logger logger = LoggerFactory.getLogger(RemoveMemberUseCase.class);


    public RemoveMemberUseCase(
            ApplicationEventPublisher applicationEventPublisher,
            WorkSpaceMemberRepository workSpaceMemberRepository) {
        this.workSpaceMemberRepository = workSpaceMemberRepository;
        this.applicationEventPublisher = applicationEventPublisher;
    }

    @Transactional
    public void execute(RemoveMemberCommand command) {
        logger.info("Remover miembro {} del Espacio de Trabajo {}", command.userId(), command.workSpaceId());
        WorkSpaceMember workSpaceMember = this.workSpaceMemberRepository.findByWorkspaceIdAndUserId(command.workSpaceId(),command.userId())
                .orElseThrow(() -> new RuntimeException("El Miembro no se encuentra en el Espacio de Trabajo"));

        workSpaceMemberRepository.delete(workSpaceMember.getId());

        this.applicationEventPublisher.publishEvent( new MemberRemovedUseCase(workSpaceMember));

        logger.info("Miembro Removido {} del Espacio de Trabajo {}", command.userId(), command.workSpaceId());

    }
}
