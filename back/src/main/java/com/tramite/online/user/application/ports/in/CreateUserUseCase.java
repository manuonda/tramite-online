package com.tramite.online.user.application.ports.in;

import com.tramite.online.shared.annotation.UseCase;
import com.tramite.online.user.domain.model.User;


@UseCase
public interface CreateUserUseCase {
    void createUserCase(User user);
}
