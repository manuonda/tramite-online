package com.tramite.online.user.infraestructure.adapters.output.persistence.entity;

import jakarta.persistence.Entity;

@Entity
@Table(name="users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;
    
    

}
