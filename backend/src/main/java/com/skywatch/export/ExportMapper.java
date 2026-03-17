package com.skywatch.export;

import com.skywatch.export.dto.ExportListResponse;
import com.skywatch.export.dto.ExportResponse;
import com.skywatch.export.dto.TemplateListResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ExportMapper {

    @Mapping(target = "eventId", source = "job.eventId")
    @Mapping(target = "network", expression = "java(job.getNetwork().name())")
    @Mapping(target = "objective", expression = "java(job.getObjective().name())")
    @Mapping(target = "status", expression = "java(job.getStatus().name())")
    ExportResponse toResponse(SocialExportJob job);

    @Mapping(target = "eventId", source = "job.eventId")
    @Mapping(target = "eventTitle", expression = "java(job.getEvent().getTitle())")
    @Mapping(target = "network", expression = "java(job.getNetwork().name())")
    @Mapping(target = "objective", expression = "java(job.getObjective().name())")
    @Mapping(target = "status", expression = "java(job.getStatus().name())")
    ExportListResponse toListResponse(SocialExportJob job);

    @Mapping(target = "network", expression = "java(template.getNetwork().name())")
    @Mapping(target = "objective", expression = "java(template.getObjective().name())")
    TemplateListResponse toTemplateResponse(SocialExportTemplate template);
}
