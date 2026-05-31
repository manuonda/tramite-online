package com.tramite.online.user.infraestructure.adapters.input.api;

import org.springframework.web.bind.annotation.RestController;

import com.tramite.online.user.infraestructure.adapters.input.api.dto.RequestUserDto;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import jakarta.validation.Valid;

@RestController
public class UserController {



    @PostMapping
    public ResponseEntity<ResponseUserDto> createUser(@Valid @RequestBody RequestUserDto requestUserDto) {
        
    }
}
