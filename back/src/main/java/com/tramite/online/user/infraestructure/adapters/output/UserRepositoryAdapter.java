package com.tramite.online.user.infraestructure.adapters.output;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.tramite.online.shared.exception.ResourceNotFoundException;
import com.tramite.online.user.application.ports.out.UserRepository;
import com.tramite.online.user.domain.model.User;
import com.tramite.online.user.infraestructure.adapters.output.persistence.entity.UserEntity;
import com.tramite.online.user.infraestructure.adapters.output.persistence.mapper.UserMapper;
import com.tramite.online.user.infraestructure.adapters.output.persistence.repository.UserJpaRepository;


/*
 * Adapter User Repository
 * Implements the domain repository interface using Spring Data JPA
 *
 * @author dgarcia
 * @version 1.0
 * @since 29/05/2026
 */
@Component
public class UserRepositoryAdapter implements UserRepository{

    private final UserJpaRepository userJpaRepository;
    private final UserMapper userMapper;

    public UserRepositoryAdapter(UserJpaRepository userJpaRepository, UserMapper userMapper) {
        this.userJpaRepository = userJpaRepository;
        this.userMapper = userMapper;
    }

    @Override
    public User save(User user) {
        UserEntity entity = userMapper.toEntity(user);
        UserEntity saved = this.userJpaRepository.save(entity);
        return userMapper.toDomain(saved);
    }

    @Override
    public Optional<User> findById(Long id) {
        UserEntity entity = this.userJpaRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id) );
        
        return userMapper.toDomain(entity);
    }

    @Override
    public List<User> findAll(User user) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'findAll'");
    }

    @Override
    public boolean exists(Long id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'exists'");
    }

    @Override
    public void delete(Long id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'delete'");
    }
}
