package com.tramite.online.user.application.service;

import org.springframework.stereotype.Service;

import com.tramite.online.user.application.ports.out.in.CreateUserUseCase;
import com.tramite.online.user.domain.model.User;

@Service
public class UserService implements CreateUserUseCase{

    @Override
    public void createUserCase(User user) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'createUserCase'");
    }

}
