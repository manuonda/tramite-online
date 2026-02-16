package com.tramite.online.workspace.application.usecases;


import com.tramite.online.workspace.exception.WorkSpaceNotFoundException;
import org.springframework.stereotype.Service;
import com.tramite.online.workspace.application.dto.command.ListMembersByWorkSpaceCommand;
import com.tramite.online.workspace.application.dto.response.ListMembersResponse;
import com.tramite.online.workspace.application.dto.response.MemberResponse;
import com.tramite.online.workspace.domain.model.WorkSpaceMember;
import com.tramite.online.workspace.domain.repository.WorkSpaceRepository;
import com.tramite.online.workspace.domain.repository.WorkSpaceMemberRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;



/**
 * Caso de Uso que permite listar los miembros
 * de un Espacio de Trabajo
 */
@Service
public class ListMembersUseCase {
    private final WorkSpaceRepository workSpaceRepository;
    private final WorkSpaceMemberRepository memberRepository;
    private final Logger logger = LoggerFactory.getLogger(ListMembersUseCase.class);

    public ListMembersUseCase(WorkSpaceRepository workSpaceRepository,
                              WorkSpaceMemberRepository memberRepository) {
        this.workSpaceRepository = workSpaceRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional(readOnly = true)
    public ListMembersResponse execute(ListMembersByWorkSpaceCommand command) {
        logger.info("Listing members for workspace {}", command.workSpaceId());

        // 1. Verificar que el workspace existe
        workSpaceRepository.findById(command.workSpaceId())
                .orElseThrow(() -> new WorkSpaceNotFoundException(
                        "Workspace with id " + command.workSpaceId() + " not found"));

        // 2. Obtener miembros
        List<WorkSpaceMember> members = memberRepository.findByWorkspaceId(command.workSpaceId());

        // 3. Mapear a respuestas
        List<MemberResponse> responses = members.stream()
                .map(this::toResponse)
                .toList();

        logger.info("Found {} members in workspace {}", responses.size(), command.workSpaceId());
        return new ListMembersResponse(command.workSpaceId(), responses);

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

