package com.tramite.online.user.application.handlers;

import com.tramite.online.shared.annotation.ApplicationService;
import com.tramite.online.user.application.ports.in.CreateUserUseCase;
import com.tramite.online.user.application.ports.out.UserRepository;
import com.tramite.online.user.domain.model.User;

@ApplicationService
public class CreateUserHandler implements CreateUserUseCase {

    private final UserRepository userRepository;

    public CreateUserHandler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void createUserCase(User user) {

    }
}
