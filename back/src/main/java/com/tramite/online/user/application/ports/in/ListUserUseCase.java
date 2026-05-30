package com.tramite.online.user.application.ports.in;

import java.util.List;

import com.tramite.online.shared.annotation.UseCase;
import com.tramite.online.user.domain.model.User;

@UseCase
public interface ListUserUseCase {
    List<User> listUsers();
}
