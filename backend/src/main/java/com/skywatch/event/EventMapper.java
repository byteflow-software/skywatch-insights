package com.skywatch.event;

import com.skywatch.event.dto.EventDetailResponse;
import com.skywatch.event.dto.EventListResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EventMapper {

    @Mapping(target = "type", expression = "java(event.getType().name())")
    @Mapping(target = "status", expression = "java(event.getStatus().name())")
    @Mapping(target = "isFavorited", source = "favorited")
    EventListResponse toListResponse(AstronomicalEvent event, boolean favorited);

    @Mapping(target = "type", expression = "java(event.getType().name())")
    @Mapping(target = "status", expression = "java(event.getStatus().name())")
    @Mapping(target = "isFavorited", source = "favorited")
    @Mapping(target = "forecast", ignore = true)
    EventDetailResponse toDetailResponse(AstronomicalEvent event, boolean favorited);

    default EventListResponse toListResponseTruncated(AstronomicalEvent event, boolean favorited) {
        String truncated = event.getDescription();
        if (truncated != null && truncated.length() > 200) {
            truncated = truncated.substring(0, 200) + "...";
        }
        return EventListResponse.builder()
            .id(event.getId())
            .slug(event.getSlug())
            .title(event.getTitle())
            .type(event.getType().name())
            .description(truncated)
            .startAt(event.getStartAt())
            .endAt(event.getEndAt())
            .relevanceScore(event.getRelevanceScore())
            .status(event.getStatus().name())
            .imageUrl(event.getImageUrl())
            .isFavorited(favorited)
            .build();
    }
}
