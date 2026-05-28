package com.tramite.online.user.domain.model;


/**
 * Record Pojo User
 * @param idUser
 */
public record User (
         Long idUser,
         String userName,
         String password,
         String email

){

    public User{
        if(userName == null || userName.isBlank()) {
            throw new IllegalStateException("Username is null or empty");
        }
    }
}
