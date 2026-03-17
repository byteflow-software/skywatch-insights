package com.skywatch.user;

import com.skywatch.user.dto.UserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", expression = "java(user.getRole().name())")
    @Mapping(target = "theme", expression = "java(user.getTheme().name())")
    @Mapping(target = "preferredCity", source = "preferredCity")
    UserResponse toResponse(User user);

    @Mapping(target = "countryCode", source = "countryCode")
    UserResponse.LocationSummary toLocationSummary(Location location);
}
