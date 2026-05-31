package com.tramite.online.user.domain.model;

import com.tramite.online.user.domain.model.vo.Email;
import com.tramite.online.user.domain.model.vo.Password;
import com.tramite.online.user.domain.model.vo.UserName;
import com.tramite.online.user.domain.model.vo.IdUser;


/**
 * User entity representing a user in the system
 * @param IdUser
 * @param userName
 * @param password
 * @param email
 */
public record User (
         IdUser idUser,
         UserName userName,
         Password password,
         Email email

){

   

    /**
     * Factory method to create a new User instance with validation
     * @param UserName
     * @param Password
     * @param Email
     * @return
     */
      public static User create(String userName, String password, String email) {
          return new User(null, new UserName(userName), new Password(password), new Email(email));
      }

    /**
     * Factory method to reconstitute a User instance from existing data (e.g., from a database)
     * @param IdUser
     * @param UserName
     * @param Password
     * @param Email
     * @return
     */
      public static User reconstitute(Long idUser, String userName, String password, String email) {
          return new User(new IdUser(idUser), new UserName(userName), new Password(password), new Email(email));
      }

}
