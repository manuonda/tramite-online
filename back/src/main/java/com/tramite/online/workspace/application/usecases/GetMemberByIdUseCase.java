package com.tramite.online.workspace.application.usecases;


import org.springframework.stereotype.Service;

import com.tramite.online.workspace.application.dto.command.GetMemberByIdCommand;
import com.tramite.online.workspace.application.dto.response.MemberResponse;
import com.tramite.online.workspace.domain.model.WorkSpaceMember;
import com.tramite.online.workspace.domain.repository.WorkSpaceMemberRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Caso de Uso de que permite obttener el miembro
 * de un Espacio de Trabajo
 *
 * @author  dgarcia
 * @version 1.0
 * @since   24/11/2025
 */

@Service
public class GetMemberByIdUseCase {

    private final WorkSpaceMemberRepository memberRepository;
    private final Logger logger = LoggerFactory.getLogger(GetMemberByIdUseCase.class);

    public GetMemberByIdUseCase(WorkSpaceMemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @Transactional(readOnly = true)
    public MemberResponse execute(GetMemberByIdCommand command) {
        logger.info("Getting member with id {}", command.memberId());

        WorkSpaceMember member = memberRepository.findById(command.memberId())
                .orElseThrow(() -> new RuntimeException(
                        "Miembro con con id " + command.memberId() + " no encontrado"));

        logger.info("Miembro encontrado con id {}", command.memberId());
        return toResponse(member);
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
