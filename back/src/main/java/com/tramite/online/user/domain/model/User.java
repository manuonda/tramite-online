package com.tramite.online.user.domain.model;

import com.tramite.online.user.domain.model.vo.Email;
import com.tramite.online.user.domain.model.vo.Password;
import com.tramite.online.user.domain.model.vo.UserName;


/**
 * User entity representing a user in the system
 * @param IdUser
 * @param userName
 * @param password
 * @param email
 */
public record User (
         Long IdUser,
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
      public static User create(String UserName, String Password, String Email) {
          return new User(null, new UserName(UserName), new Password(Password), new Email(Email));
      }

    /**
     * Factory method to reconstitute a User instance from existing data (e.g., from a database)
     * @param IdUser
     * @param UserName
     * @param Password
     * @param Email
     * @return
     */
      public static User reconstitute(Long IdUser, String UserName, String Password, String Email) {
          return new User(IdUser, new UserName(UserName), new Password(Password), new Email(Email));
      }

}
