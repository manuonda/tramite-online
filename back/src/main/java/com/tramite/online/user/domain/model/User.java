package com.tramite.online.user.domain.model;

import com.tramite.online.user.domain.model.vo.Email;
import com.tramite.online.user.domain.model.vo.UserName;

/**
 * Record Pojo User
 * @param idUser
 */
public record User (
         Long idUser,
         UserName userName,
         String password,
         Email email

){

}
