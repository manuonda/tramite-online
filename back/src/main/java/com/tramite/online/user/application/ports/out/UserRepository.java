package com.tramite.online.user.application.ports.out;

import java.util.List;
import java.util.Optional;

import com.tramite.online.user.domain.model.User;

/**
 * Puerto(interfaz) que define el contrato para acceder a User
 * la implemetacion esta en infraestructura layer
 *
 * @author dgarcia
 * @version 1.0
 * @since 29/05/2026
 */
public interface UserRepository {

    User save(User user);
    Optional<User> findById(Long id);
    List<User> findAll();
    boolean exists(Long id);
    void delete(Long id);
}
