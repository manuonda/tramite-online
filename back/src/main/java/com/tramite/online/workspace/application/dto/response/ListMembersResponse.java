package com.tramite.online.workspace.application.dto.response;

import java.util.List;

public record ListMembersResponse(
        Long workSpaceId,
        List<MemberResponse> members,
        int totalElements
) {
   public ListMembersResponse(Long workSpaceId, List<MemberResponse> members) {
       this(workSpaceId,members,members.size());
   }
}
