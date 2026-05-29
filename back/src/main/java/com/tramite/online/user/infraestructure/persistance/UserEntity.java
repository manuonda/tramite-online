package com.tramite.online.user.infraestructure.persistance;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Table(name="users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="user_name", nullable = false, unique = true, length = 100)
    private String userName;

    @Column(name="password", nullable = false, length = 100)
    private String password;

    @Column(name="email", nullable = false, unique = true, length = 100)
    private String email;



}
