package com.tramite.online.user.application.ports.out.in;

import com.tramite.online.user.domain.model.User;

public interface CreateUserUseCase {
    void createUserCase(User user);
}
