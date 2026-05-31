package com.tramite.online.user.application.handlers;


import com.tramite.online.shared.annotation.ApplicationService;
import com.tramite.online.user.application.ports.in.ListUserUseCase;
import com.tramite.online.user.application.ports.out.UserRepository;
import com.tramite.online.user.domain.model.User;

import java.util.List;


/**
 *
 */
@ApplicationService
public class ListUserHandler implements ListUserUseCase {

    private final UserRepository userRepository;

    public ListUserHandler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<User> listUsers() {
        return List.of();
    }
}
