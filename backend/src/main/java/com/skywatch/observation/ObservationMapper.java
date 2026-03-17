package com.skywatch.observation;

import com.skywatch.event.AstronomicalEvent;
import com.skywatch.observation.dto.ObservationResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ObservationMapper {

    @Mapping(target = "outcome", expression = "java(log.getOutcome() != null ? log.getOutcome().name() : null)")
    @Mapping(target = "event", source = "event")
    ObservationResponse toResponse(ObservationLog log);

    ObservationResponse.EventSummary toEventSummary(AstronomicalEvent event);
}
