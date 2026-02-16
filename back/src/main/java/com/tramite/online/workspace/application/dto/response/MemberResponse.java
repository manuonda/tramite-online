package com.tramite.online.workspace.application.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response de un miembro del WorkSpace
 * @param memberId
 * @param workSpaceId
 * @param userId
 * @param role
 * @param joinedAt
 * @param updateAt
 */
public record MemberResponse(
        Long memberId,
        Long workSpaceId,
        Long userId,
        String role,
        LocalDateTime joinedAt,
        LocalDateTime updateAt
) {
}
