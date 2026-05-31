package com.tramite.online.user.infraestructure.adapters.output.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tramite.online.user.infraestructure.adapters.output.persistence.entity.UserEntity;

/*
 * Repositorio Spring Data JPA para UserEntity
 * Define queries para acceder a la tabla users
 * Spring implementa automáticamente estos métodos basándose en sus nombres
 *
 * @author dgarcia
 * @version 1.0
 * @since 29/05/2026
 */
@Repository
public interface UserJpaRepository extends JpaRepository<UserEntity, Long> {

}
