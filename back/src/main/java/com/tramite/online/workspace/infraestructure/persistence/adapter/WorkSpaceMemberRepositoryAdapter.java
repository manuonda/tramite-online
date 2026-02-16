package com.tramite.online.workspace.infraestructure.persistence.adapter;

import com.tramite.online.workspace.domain.model.WorkSpaceMember;
import com.tramite.online.workspace.domain.repository.WorkSpaceMemberRepository;
import com.tramite.online.workspace.infraestructure.persistence.entity.WorkSpaceMemberEntity;
import com.tramite.online.workspace.infraestructure.persistence.mapper.WorkSpaceMemberMapper;
import com.tramite.online.workspace.infraestructure.persistence.repository.WorkSpaceMemberJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Adapter WorkSpaceMember Repository
 * Implements the domain repository interface using Spring Data JPA
 */
@Component
public class WorkSpaceMemberRepositoryAdapter implements WorkSpaceMemberRepository {

    private final WorkSpaceMemberJpaRepository jpaRepository;
    private final WorkSpaceMemberMapper mapper;
    private static final Logger logger = LoggerFactory.getLogger(WorkSpaceMemberRepositoryAdapter.class);

    public WorkSpaceMemberRepositoryAdapter(WorkSpaceMemberJpaRepository jpaRepository,
                                            WorkSpaceMemberMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public WorkSpaceMember save(WorkSpaceMember workSpaceMember) {
        logger.info("Saving workspace member {}", workSpaceMember);
        WorkSpaceMemberEntity entity = mapper.toEntity(workSpaceMember);
        WorkSpaceMemberEntity entitySaved = jpaRepository.save(entity);
        return mapper.toDomain(entitySaved);
    }

    @Override
    public Optional<WorkSpaceMember> findById(Long id) {
        logger.info("Finding workspace member by id {}", id);
        return jpaRepository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public List<WorkSpaceMember> findByWorkspaceId(Long workspaceId) {
        logger.info("Finding workspace members by workspace id {}", workspaceId);
        return jpaRepository.findByWorkSpaceId(workspaceId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Optional<WorkSpaceMember> findByWorkspaceIdAndUserId(Long workspaceId, Long userId) {
        logger.info("Finding workspace member by workspace id {} and user id {}", workspaceId, userId);
        return jpaRepository.findByWorkSpaceIdAndUserId(workspaceId, userId)
                .map(mapper::toDomain);
    }

    @Override
    public int countByWorkspaceId(Long workspaceId) {
        logger.info("Counting workspace members by workspace id {}", workspaceId);
        return jpaRepository.countByWorkSpaceId(workspaceId);
    }

    @Override
    public void delete(Long id) {
        logger.info("Deleting workspace member by id {}", id);
        jpaRepository.deleteById(id);
    }
}
