package com.skywatch.forecast;

import com.skywatch.forecast.dto.ForecastResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ForecastMapper {
    @Mapping(target = "eventId", source = "event.id")
    @Mapping(target = "location.id", source = "location.id")
    @Mapping(target = "location.name", source = "location.name")
    ForecastResponse toResponse(VisibilityForecast forecast);
}
