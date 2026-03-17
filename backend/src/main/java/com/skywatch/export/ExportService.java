package com.skywatch.export;

import com.skywatch.event.AstronomicalEvent;
import com.skywatch.event.EventRepository;
import com.skywatch.event.EventStatus;
import com.skywatch.export.dto.ExportListResponse;
import com.skywatch.export.dto.ExportRequest;
import com.skywatch.export.dto.ExportResponse;
import com.skywatch.export.dto.TemplateListResponse;
import com.skywatch.shared.PageResponse;
import com.skywatch.user.User;
import com.skywatch.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExportService {

    private final ExportJobRepository exportJobRepository;
    private final ExportTemplateRepository exportTemplateRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final TextTemplateEngine textTemplateEngine;
    private final ImageGeneratorService imageGeneratorService;
    private final ExportMapper exportMapper;

    @Transactional
    public ExportResponse createExport(UUID userId, ExportRequest request) {
        // Validate event exists and is PUBLISHED
        AstronomicalEvent event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new EntityNotFoundException("Event not found: " + request.eventId()));

        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new IllegalStateException("Event is not published and cannot be exported");
        }

        // Resolve objective (default to ENGAGEMENT)
        ExportObjective objective = request.objective() != null ? request.objective() : ExportObjective.ENGAGEMENT;

        // Find matching active template
        SocialExportTemplate template = exportTemplateRepository
                .findByNetworkAndFormatAndObjective(request.network(), request.format(), objective)
                .filter(SocialExportTemplate::getIsActive)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No active template found for network=" + request.network()
                        + ", format=" + request.format()
                        + ", objective=" + objective));

        // Load user reference
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Create job with PENDING status
        SocialExportJob job = SocialExportJob.builder()
                .user(user)
                .event(event)
                .template(template)
                .network(request.network())
                .format(request.format())
                .objective(objective)
                .status(ExportStatus.PENDING)
                .build();

        job = exportJobRepository.save(job);

        // Process synchronously for MVP
        try {
            job.setStatus(ExportStatus.PROCESSING);

            // Build template variables from event
            Map<String, String> variables = buildVariables(event);

            // Render text content
            String renderedText = textTemplateEngine.render(template.getTextTemplate(), variables);

            // Respect character limit if defined
            if (template.getCharacterLimit() != null && renderedText.length() > template.getCharacterLimit()) {
                renderedText = renderedText.substring(0, template.getCharacterLimit() - 3) + "...";
            }

            // Attempt image generation (MVP placeholder)
            String imageUrl = imageGeneratorService.generateImage(event, template);

            // Update job to COMPLETED
            job.setOutputTextContent(renderedText);
            job.setOutputImageUrl(imageUrl);
            job.setStatus(ExportStatus.COMPLETED);
            job.setCompletedAt(Instant.now());

            log.info("Export job {} completed successfully for event '{}' on {}",
                     job.getId(), event.getTitle(), request.network());

        } catch (Exception e) {
            log.error("Export job {} failed: {}", job.getId(), e.getMessage(), e);
            job.setStatus(ExportStatus.FAILED);
            job.setErrorMessage(e.getMessage() != null
                    ? e.getMessage().substring(0, Math.min(e.getMessage().length(), 500))
                    : "Unknown error");
            job.setCompletedAt(Instant.now());
        }

        job = exportJobRepository.save(job);
        return exportMapper.toResponse(job);
    }

    @Transactional(readOnly = true)
    public ExportResponse getExportById(UUID userId, UUID exportId) {
        SocialExportJob job = exportJobRepository.findById(exportId)
                .orElseThrow(() -> new EntityNotFoundException("Export job not found: " + exportId));

        if (!job.getUserId().equals(userId)) {
            throw new EntityNotFoundException("Export job not found: " + exportId);
        }

        return exportMapper.toResponse(job);
    }

    @Transactional(readOnly = true)
    public PageResponse<ExportListResponse> listExports(UUID userId, UUID eventId,
                                                         SocialNetwork network, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<SocialExportJob> jobs;
        if (eventId != null) {
            jobs = exportJobRepository.findByUserIdAndEventId(userId, eventId, pageable);
        } else if (network != null) {
            jobs = exportJobRepository.findByUserIdAndNetwork(userId, network, pageable);
        } else {
            jobs = exportJobRepository.findByUserId(userId, pageable);
        }

        var content = jobs.getContent().stream()
                .map(exportMapper::toListResponse)
                .toList();

        return PageResponse.from(jobs, content);
    }

    @Transactional(readOnly = true)
    public List<TemplateListResponse> listTemplates(SocialNetwork network) {
        List<SocialExportTemplate> templates = network != null
                ? exportTemplateRepository.findByNetworkAndIsActiveTrue(network)
                : exportTemplateRepository.findByIsActiveTrue();

        return templates.stream()
                .map(exportMapper::toTemplateResponse)
                .toList();
    }

    private Map<String, String> buildVariables(AstronomicalEvent event) {
        Map<String, String> variables = new LinkedHashMap<>();
        variables.put("eventTitle", event.getTitle() != null ? event.getTitle() : "");
        variables.put("eventDescription", event.getDescription() != null ? event.getDescription() : "");
        variables.put("eventType", event.getType() != null ? event.getType().name() : "");
        variables.put("bestWindow", formatWindow(event.getStartAt(), event.getEndAt()));
        variables.put("observabilityScore", String.valueOf(event.getRelevanceScore()));
        variables.put("startAt", event.getStartAt() != null ? event.getStartAt().toString() : "");
        variables.put("endAt", event.getEndAt() != null ? event.getEndAt().toString() : "");
        variables.put("source", event.getSource() != null ? event.getSource() : "");
        return variables;
    }

    private String formatWindow(Instant start, Instant end) {
        if (start == null || end == null) {
            return "Check schedule for details";
        }
        return start.toString() + " - " + end.toString();
    }
}
