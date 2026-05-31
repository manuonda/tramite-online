package com.tramite.online.user.infraestructure.adapters.output.persistence.mapper;

import com.tramite.online.user.domain.model.User;
import com.tramite.online.user.infraestructure.adapters.output.persistence.entity.UserEntity;
import org.springframework.stereotype.Component;

/**
 * Mapper que convierte entre User (dominio) y UserEntity (persistencia).
 */
@Component
public class UserMapper {

    public User toDomain(UserEntity entity) {
        if (entity == null) {
            return null;
        }

        return User.reconstitute(
                entity.getId(),
                entity.getUsername(),
                entity.getPassword(),
                entity.getEmail());
    }

    public UserEntity toEntity(User user) {
        if (user == null) {
            return null;
        }

        return new UserEntity(
                user.idUser().value(),
                user.userName().value(),
                user.password().value(),
                user.email().value());
    }
}
