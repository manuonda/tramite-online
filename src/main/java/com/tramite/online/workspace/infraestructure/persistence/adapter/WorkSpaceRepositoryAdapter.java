package com.tramite.online.workspace.infraestructure.persistence.adapter;

import com.tramite.online.workspace.domain.model.WorkSpace;
import com.tramite.online.workspace.domain.repository.WorkSpaceRepository;
import com.tramite.online.workspace.infraestructure.persistence.entity.WorkSpaceEntity;
import com.tramite.online.workspace.infraestructure.persistence.mapper.WorkSpaceMapper;
import com.tramite.online.workspace.infraestructure.persistence.repository.WorkSpaceJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


/**
 * Adapter WorkSpace Repository
 */
@Component
public class WorkSpaceRepositoryAdapter implements WorkSpaceRepository {

    private final WorkSpaceJpaRepository jpaRepository;
    private final WorkSpaceMapper mapper;
    private static final Logger logger = LoggerFactory.getLogger(WorkSpaceRepositoryAdapter.class);


    public WorkSpaceRepositoryAdapter(WorkSpaceJpaRepository jpaRepository,
                                      WorkSpaceMapper workSpaceMapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = workSpaceMapper;
    }

    @Override
    public Optional<WorkSpace> findById(Long id) {
        logger.info("Finding workspace by id {}", id);
        return jpaRepository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public WorkSpace save(WorkSpace workSpace) {
        logger.info("Saving workspace {}", workSpace);
        WorkSpaceEntity entity = this.mapper.toPersistence(workSpace);
        WorkSpaceEntity entitySaved = this.jpaRepository.save(entity);
        return mapper.toDomain(entitySaved);
    }

    @Override
    public List<WorkSpace> findAll() {
        logger.info("Finding all workspaces");
        return jpaRepository.findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<WorkSpace> findByOwnerId(Long ownerId) {
        logger.info("Finding workspaces by owner id {}", ownerId);
        return jpaRepository.findByOwnerId(ownerId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Optional<WorkSpace> findByName(String name) {
        logger.info("Finding workspace by name {}", name);
        return jpaRepository.findByName(name)
                .map(mapper::toDomain);
    }

    @Override
    public void delete(Long id) {
      logger.info("Deleting workspace by id {}", id);
      this.jpaRepository.deleteById(id);
    }

    @Override
    public boolean exists(Long id) {
        logger.info("Finding workspace by Id : {}",id);
        return jpaRepository.existsById(id);
    }
}
