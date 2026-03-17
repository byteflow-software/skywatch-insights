package com.skywatch.astrosync;

import com.skywatch.event.AstronomicalEvent;
import com.skywatch.event.EventRepository;
import com.skywatch.event.EventStatus;
import com.skywatch.event.EventType;
import com.skywatch.event.NasaApiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.MonthDay;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AstroEventSyncService {

    private static final String SOURCE = "nasa_donki";
    private static final String NEO_SOURCE = "nasa_neows";
    private static final String ORBITAL_SOURCE = "astronomyapi";
    private static final String COMET_SOURCE = "jpl_sbdb";
    private static final String SUPERMOON_SOURCE = "astronomyapi";
    private static final String ECLIPSE_SOURCE = "usno_eclipse";
    private static final String METEOR_SOURCE = "static_catalog";
    private static final String AURORA_SOURCE = "noaa_swpc";
    private static final String TRANSIT_SOURCE = "static_catalog";
    private static final String OCCULTATION_SOURCE = "static_catalog";
    private static final double AURORA_KP_THRESHOLD = 5.0;
    private static final Set<String> CONJUNCTION_BODIES = Set.of(
            "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune");
    private static final Set<String> OPPOSITION_BODIES = Set.of(
            "mars", "jupiter", "saturn", "uranus", "neptune");
    private static final double CONJUNCTION_THRESHOLD_DEGREES = 5.0;
    private static final double OPPOSITION_THRESHOLD_DEGREES = 6.0;
    private static final double FULL_MOON_ELONGATION_THRESHOLD_DEGREES = 14.0;
    private static final double SUPERMOON_DISTANCE_THRESHOLD_KM = 363_300.0;
    private static final DateTimeFormatter DONKI_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm'Z'", Locale.US);
    private static final DateTimeFormatter NEO_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MMM-dd HH:mm", Locale.US);

    private final DonkiClient donkiClient;
    private final AstronomyApiClient astronomyApiClient;
    private final JplSbdbClient jplSbdbClient;
    private final NasaApiClient nasaApiClient;
    private final UsnoEclipseClient usnoEclipseClient;
    private final NoaaKpClient noaaKpClient;
    private final MeteorShowerCatalog meteorShowerCatalog;
    private final TransitOccultationCatalog transitOccultationCatalog;
    private final EventRepository eventRepository;
    private final RelevanceScoreCalculator scoreCalculator;
    private final SyncLogService syncLogService;

    @Transactional
    public void syncSpaceWeather() {
        DataSyncLog syncLog = syncLogService.startSync(SOURCE, "SPACE_WEATHER");

        LocalDate to = LocalDate.now(ZoneOffset.UTC);
        LocalDate from = to.minusDays(30);

        int totalFetched = 0;
        int totalCreated = 0;
        List<String> errors = new ArrayList<>();

        try {
            // Solar flares
            var flares = donkiClient.fetchSolarFlares(from, to);
            totalFetched += flares.size();
            totalCreated += processEvents(flares, errors);

            // CMEs
            var cmes = donkiClient.fetchCMEs(from, to);
            totalFetched += cmes.size();
            totalCreated += processEvents(cmes, errors);

            // Geomagnetic storms
            var storms = donkiClient.fetchGeomagneticStorms(from, to);
            totalFetched += storms.size();
            totalCreated += processEvents(storms, errors);

            // Near Earth Objects (API-based additional event catalog)
            LocalDate neoTo = LocalDate.now(ZoneOffset.UTC);
            LocalDate neoFrom = neoTo.minusDays(7);
            var neos = nasaApiClient.getNearEarthObjects(neoFrom, neoTo);
            totalFetched += neos.size();
            totalCreated += processNeoEvents(neos, errors);

            if (errors.isEmpty()) {
                syncLogService.completeSync(syncLog, totalFetched, totalCreated, 0);
            } else {
                syncLogService.partialSync(syncLog, totalFetched, totalCreated, 0,
                        String.join("; ", errors));
            }

            log.info("Space weather sync complete: fetched={}, created={}, errors={}",
                    totalFetched, totalCreated, errors.size());

        } catch (Exception e) {
            log.error("Space weather sync failed: {}", e.getMessage(), e);
            syncLogService.failSync(syncLog, e.getMessage());
        }
    }

    @Transactional
    public void syncOrbitalEvents() {
        DataSyncLog syncLog = syncLogService.startSync(ORBITAL_SOURCE, "ORBITAL_EVENTS");

        LocalDate from = LocalDate.now(ZoneOffset.UTC);
        LocalDate to = from.plusDays(21);

        List<String> errors = new ArrayList<>();
        int fetched = 0;
        int created = 0;

        try {
            List<AstronomyApiClient.BodyPosition> allPositions = astronomyApiClient.fetchAllBodyPositions(from, to);
            fetched = allPositions.size();
            created = processOrbitalEvents(allPositions, errors);

            if (errors.isEmpty()) {
                syncLogService.completeSync(syncLog, fetched, created, 0);
            } else {
                syncLogService.partialSync(syncLog, fetched, created, 0, String.join("; ", errors));
            }

            log.info("Orbital sync complete: fetched={}, created={}, errors={}", fetched, created, errors.size());
        } catch (Exception e) {
            log.error("Orbital sync failed: {}", e.getMessage(), e);
            syncLogService.failSync(syncLog, e.getMessage());
        }
    }

    @Transactional
    public void syncCometEvents() {
        DataSyncLog syncLog = syncLogService.startSync(COMET_SOURCE, "COMET_EVENTS");

        int fetched = 0;
        int created = 0;
        List<String> errors = new ArrayList<>();
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        try {
            List<JplSbdbClient.CometData> comets = jplSbdbClient.fetchComets(1000);
            fetched = comets.size();
            for (var comet : comets) {
                try {
                    created += createCometEvent(comet, today);
                } catch (Exception e) {
                    String name = comet.fullName() != null ? comet.fullName() : "unknown";
                    errors.add(name + ": " + e.getMessage());
                }
            }

            if (errors.isEmpty()) {
                syncLogService.completeSync(syncLog, fetched, created, 0);
            } else {
                syncLogService.partialSync(syncLog, fetched, created, 0, String.join("; ", errors));
            }
            log.info("Comet sync complete: fetched={}, created={}, errors={}", fetched, created, errors.size());
        } catch (Exception e) {
            log.error("Comet sync failed: {}", e.getMessage(), e);
            syncLogService.failSync(syncLog, e.getMessage());
        }
    }

    @Transactional
    public void syncSupermoonEvents() {
        DataSyncLog syncLog = syncLogService.startSync(SUPERMOON_SOURCE, "SUPERMOON_EVENTS");

        // AstronomyAPI accepts a maximum range of 366 days for one request.
        LocalDate from = LocalDate.now(ZoneOffset.UTC);
        LocalDate to = from.plusDays(365);

        int fetched = 0;
        int created = 0;
        List<String> errors = new ArrayList<>();

        try {
            List<AstronomyApiClient.BodyPosition> positions = astronomyApiClient.fetchAllBodyPositions(from, to);
            fetched = positions.size();
            created = processSupermoonEvents(positions, errors);

            if (errors.isEmpty()) {
                syncLogService.completeSync(syncLog, fetched, created, 0);
            } else {
                syncLogService.partialSync(syncLog, fetched, created, 0, String.join("; ", errors));
            }
            log.info("Supermoon sync complete: fetched={}, created={}, errors={}", fetched, created, errors.size());
        } catch (Exception e) {
            log.error("Supermoon sync failed: {}", e.getMessage(), e);
            syncLogService.failSync(syncLog, e.getMessage());
        }
    }

    @Transactional
    public void syncEclipseEvents() {
        DataSyncLog syncLog = syncLogService.startSync(ECLIPSE_SOURCE, "ECLIPSE_EVENTS");

        int fetched = 0;
        int created = 0;
        List<String> errors = new ArrayList<>();

        try {
            int currentYear = LocalDate.now(ZoneOffset.UTC).getYear();

            for (int year = currentYear; year <= currentYear + 1; year++) {
                var solarEclipses = usnoEclipseClient.fetchSolarEclipses(year);
                fetched += solarEclipses.size();
                for (var eclipse : solarEclipses) {
                    created += createEclipseEvent(eclipse, EventType.ECLIPSE_SOLAR, errors);
                }

                var lunarEclipses = usnoEclipseClient.fetchLunarEclipses(year);
                fetched += lunarEclipses.size();
                for (var eclipse : lunarEclipses) {
                    created += createEclipseEvent(eclipse, EventType.ECLIPSE_LUNAR, errors);
                }
            }

            if (errors.isEmpty()) {
                syncLogService.completeSync(syncLog, fetched, created, 0);
            } else {
                syncLogService.partialSync(syncLog, fetched, created, 0, String.join("; ", errors));
            }
            log.info("Eclipse sync complete: fetched={}, created={}, errors={}", fetched, created, errors.size());
        } catch (Exception e) {
            log.error("Eclipse sync failed: {}", e.getMessage(), e);
            syncLogService.failSync(syncLog, e.getMessage());
        }
    }

    private int createEclipseEvent(UsnoEclipseClient.EclipseData eclipse, EventType type, List<String> errors) {
        try {
            String externalId = "eclipse-" + type.name().toLowerCase(Locale.ROOT) + "-" + eclipse.date();
            if (eventRepository.findByExternalIdAndSource(externalId, ECLIPSE_SOURCE).isPresent()) {
                return 0;
            }

            String kindLabel = eclipse.kind() != null && !eclipse.kind().isBlank() ? eclipse.kind() : "desconhecido";
            boolean isSolar = type == EventType.ECLIPSE_SOLAR;
            String title = isSolar
                    ? "Eclipse Solar (" + capitalize(kindLabel) + ")"
                    : "Eclipse Lunar (" + capitalize(kindLabel) + ")";

            String slug = (type.name().toLowerCase(Locale.ROOT).replace('_', '-') + "-" + eclipse.date())
                    .replaceAll("[^a-z0-9-]", "-");

            StringBuilder desc = new StringBuilder();
            desc.append(isSolar ? "Eclipse solar " : "Eclipse lunar ");
            desc.append(kindLabel);
            desc.append(" previsto para ").append(eclipse.date()).append(".");
            if (eclipse.magnitude() > 0) {
                desc.append(String.format(Locale.US, " Magnitude: %.3f.", eclipse.magnitude()));
            }
            if (eclipse.duration() != null && !eclipse.duration().isBlank()) {
                desc.append(" Duração: ").append(eclipse.duration()).append(".");
            }
            desc.append(" Fonte: US Naval Observatory.");

            int score = scoreCalculator.calculate(type, null, null, null);
            // Total eclipses score higher
            if (kindLabel.toLowerCase(Locale.ROOT).contains("total")) {
                score = Math.min(100, score + 10);
            }

            Instant startAt = eclipse.date().atStartOfDay().toInstant(ZoneOffset.UTC);
            AstronomicalEvent event = AstronomicalEvent.builder()
                    .slug(slug)
                    .title(title)
                    .type(type)
                    .description(desc.toString())
                    .startAt(startAt)
                    .endAt(startAt.plusSeconds(6 * 3600L))
                    .relevanceScore(score)
                    .status(EventStatus.PUBLISHED)
                    .source(ECLIPSE_SOURCE)
                    .externalId(externalId)
                    .build();
            eventRepository.save(event);
            return 1;
        } catch (Exception e) {
            errors.add("eclipse " + eclipse.date() + ": " + e.getMessage());
            return 0;
        }
    }

    @Transactional
    public void syncMeteorShowerEvents() {
        DataSyncLog syncLog = syncLogService.startSync(METEOR_SOURCE, "METEOR_SHOWER_EVENTS");

        int fetched = 0;
        int created = 0;
        List<String> errors = new ArrayList<>();

        try {
            List<MeteorShowerCatalog.MeteorShowerData> showers = meteorShowerCatalog.getShowers();
            fetched = showers.size();

            LocalDate today = LocalDate.now(ZoneOffset.UTC);
            int currentYear = today.getYear();

            for (var shower : showers) {
                try {
                    LocalDate peakDate = LocalDate.of(currentYear, shower.peakMonth(), shower.peakDay());

                    // If peak is more than 30 days in the past, try next year
                    if (peakDate.isBefore(today.minusDays(30))) {
                        peakDate = LocalDate.of(currentYear + 1, shower.peakMonth(), shower.peakDay());
                    }

                    // Only create events for showers peaking within the next 90 days
                    if (peakDate.isAfter(today.plusDays(90))) {
                        continue;
                    }

                    String externalId = "meteor-" + shower.iauCode() + "-" + peakDate.getYear();
                    if (eventRepository.findByExternalIdAndSource(externalId, METEOR_SOURCE).isPresent()) {
                        continue;
                    }

                    String slug = "chuva-de-meteoros-" + shower.name().toLowerCase(Locale.ROOT)
                            .replaceAll("[^a-z0-9]+", "-") + "-" + peakDate.getYear();
                    if (slug.length() > 180) slug = slug.substring(0, 180);

                    String title = "Chuva de Meteoros: " + shower.name();
                    String description = String.format(Locale.US,
                            "Chuva de meteoros %s (IAU: %s). Pico em %s. ZHR esperado: ~%d meteoros/hora. "
                                    + "Radiante: RA %.1f, Dec %.1f. Velocidade: %d km/s. "
                                    + "Corpo parental: %s. Período ativo: %s a %s.",
                            shower.name(), shower.iauCode(), peakDate, shower.zhr(),
                            shower.radiantRa(), shower.radiantDec(), shower.velocity(),
                            shower.parentBody(), shower.activeStart(), shower.activeEnd());

                    int score = scoreCalculator.calculate(EventType.METEOR_SHOWER, null, null, null);
                    // Higher ZHR = higher score
                    if (shower.zhr() >= 100) score = Math.min(100, score + 15);
                    else if (shower.zhr() >= 50) score = Math.min(100, score + 8);
                    else if (shower.zhr() >= 20) score = Math.min(100, score + 3);

                    // Parse active period for startAt/endAt
                    LocalDate activeStart = parseMonthDay(shower.activeStart(), peakDate);
                    LocalDate activeEnd = parseMonthDay(shower.activeEnd(), peakDate);

                    Instant startAt = activeStart.atStartOfDay().toInstant(ZoneOffset.UTC);
                    Instant endAt = activeEnd.atTime(23, 59).toInstant(ZoneOffset.UTC);

                    AstronomicalEvent event = AstronomicalEvent.builder()
                            .slug(slug)
                            .title(title)
                            .type(EventType.METEOR_SHOWER)
                            .description(description)
                            .startAt(startAt)
                            .endAt(endAt)
                            .relevanceScore(score)
                            .status(EventStatus.PUBLISHED)
                            .source(METEOR_SOURCE)
                            .externalId(externalId)
                            .build();
                    eventRepository.save(event);
                    created++;
                } catch (Exception e) {
                    errors.add(shower.name() + ": " + e.getMessage());
                }
            }

            if (errors.isEmpty()) {
                syncLogService.completeSync(syncLog, fetched, created, 0);
            } else {
                syncLogService.partialSync(syncLog, fetched, created, 0, String.join("; ", errors));
            }
            log.info("Meteor shower sync complete: fetched={}, created={}, errors={}", fetched, created, errors.size());
        } catch (Exception e) {
            log.error("Meteor shower sync failed: {}", e.getMessage(), e);
            syncLogService.failSync(syncLog, e.getMessage());
        }
    }

    private LocalDate parseMonthDay(String mmdd, LocalDate reference) {
        try {
            String[] parts = mmdd.split("-");
            int month = Integer.parseInt(parts[0]);
            int day = Integer.parseInt(parts[1]);
            LocalDate date = LocalDate.of(reference.getYear(), month, day);
            // If active start is after active end, it crosses a year boundary
            return date;
        } catch (Exception e) {
            return reference;
        }
    }

    @Transactional
    public void syncAuroraEvents() {
        DataSyncLog syncLog = syncLogService.startSync(AURORA_SOURCE, "AURORA_EVENTS");

        int fetched = 0;
        int created = 0;
        List<String> errors = new ArrayList<>();

        try {
            List<NoaaKpClient.KpForecastEntry> forecast = noaaKpClient.fetchKpForecast();
            fetched = forecast.size();

            for (var entry : forecast) {
                // Only create aurora events for forecast (not observed) with Kp >= threshold
                if (entry.observed() || entry.kpValue() < AURORA_KP_THRESHOLD) {
                    continue;
                }

                try {
                    String datePart = LocalDateTime.ofInstant(entry.timestamp(), ZoneOffset.UTC)
                            .format(DateTimeFormatter.ofPattern("yyyy-MM-dd-HH"));
                    String externalId = "aurora-kp" + (int) entry.kpValue() + "-" + datePart;

                    if (eventRepository.findByExternalIdAndSource(externalId, AURORA_SOURCE).isPresent()) {
                        continue;
                    }

                    String slug = "aurora-boreal-" + datePart;
                    int kpInt = (int) entry.kpValue();
                    String intensity = kpInt >= 8 ? "Extrema" : kpInt >= 7 ? "Severa" : kpInt >= 6 ? "Forte" : "Moderada";
                    String title = "Aurora Boreal/Austral (" + intensity + ", Kp " + kpInt + ")";

                    String visibilityLatitude = kpInt >= 8 ? "30" : kpInt >= 7 ? "40" : kpInt >= 6 ? "48" : "55";
                    String description = String.format(Locale.US,
                            "Previsão de aurora %s com índice Kp %d. "
                                    + "Visível em latitudes acima de %s graus. "
                                    + "Escala NOAA: %s. "
                                    + "Horário previsto: %s UTC. "
                                    + "Fonte: NOAA Space Weather Prediction Center.",
                            intensity.toLowerCase(Locale.ROOT), kpInt,
                            visibilityLatitude,
                            entry.noaaScale() != null && !entry.noaaScale().isBlank() ? entry.noaaScale() : "G" + (kpInt - 4),
                            LocalDateTime.ofInstant(entry.timestamp(), ZoneOffset.UTC)
                                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));

                    int score = scoreCalculator.calculate(EventType.AURORA, null, (double) kpInt, null);
                    // Additional Kp-based scoring for aurora
                    if (kpInt >= 8) score = Math.min(100, score + 25);
                    else if (kpInt >= 7) score = Math.min(100, score + 15);
                    else if (kpInt >= 6) score = Math.min(100, score + 8);

                    AstronomicalEvent event = AstronomicalEvent.builder()
                            .slug(slug)
                            .title(title)
                            .type(EventType.AURORA)
                            .description(description)
                            .startAt(entry.timestamp())
                            .endAt(entry.timestamp().plusSeconds(3 * 3600L))
                            .relevanceScore(score)
                            .status(EventStatus.PUBLISHED)
                            .source(AURORA_SOURCE)
                            .externalId(externalId)
                            .build();
                    eventRepository.save(event);
                    created++;
                } catch (Exception e) {
                    errors.add("aurora " + entry.timestamp() + ": " + e.getMessage());
                }
            }

            if (errors.isEmpty()) {
                syncLogService.completeSync(syncLog, fetched, created, 0);
            } else {
                syncLogService.partialSync(syncLog, fetched, created, 0, String.join("; ", errors));
            }
            log.info("Aurora sync complete: fetched={}, created={}, errors={}", fetched, created, errors.size());
        } catch (Exception e) {
            log.error("Aurora sync failed: {}", e.getMessage(), e);
            syncLogService.failSync(syncLog, e.getMessage());
        }
    }

    @Transactional
    public void syncTransitOccultationEvents() {
        DataSyncLog syncLog = syncLogService.startSync(TRANSIT_SOURCE, "TRANSIT_OCCULTATION_EVENTS");

        int fetched = 0;
        int created = 0;
        List<String> errors = new ArrayList<>();

        try {
            // Sync transits
            var transits = transitOccultationCatalog.getTransits();
            fetched += transits.size();
            for (var transit : transits) {
                try {
                    LocalDate date = LocalDate.parse(transit.date());
                    String externalId = "transit-" + transit.planet().toLowerCase(Locale.ROOT) + "-" + transit.date();

                    if (eventRepository.findByExternalIdAndSource(externalId, TRANSIT_SOURCE).isPresent()) {
                        continue;
                    }

                    String slug = "transito-" + transit.planet().toLowerCase(Locale.ROOT) + "-" + transit.date();
                    String title = "Trânsito de " + transit.planet() + " pelo disco solar";
                    String description = String.format(Locale.US,
                            "%s Previsto para %s. Duração estimada: %d minutos. "
                                    + "Evento extremamente raro — próximo trânsito de %s. Fonte: catálogo USNO/NASA.",
                            transit.type(), transit.date(), transit.durationMinutes(), transit.planet());

                    int score = scoreCalculator.calculate(EventType.TRANSIT, null, null, null);

                    Instant startAt = date.atStartOfDay().toInstant(ZoneOffset.UTC);
                    AstronomicalEvent event = AstronomicalEvent.builder()
                            .slug(slug)
                            .title(title)
                            .type(EventType.TRANSIT)
                            .description(description)
                            .startAt(startAt)
                            .endAt(startAt.plusSeconds(transit.durationMinutes() * 60L))
                            .relevanceScore(score)
                            .status(EventStatus.PUBLISHED)
                            .source(TRANSIT_SOURCE)
                            .externalId(externalId)
                            .build();
                    eventRepository.save(event);
                    created++;
                } catch (Exception e) {
                    errors.add("transit " + transit.planet() + ": " + e.getMessage());
                }
            }

            // Sync occultations
            var occultations = transitOccultationCatalog.getOccultations();
            fetched += occultations.size();
            for (var occ : occultations) {
                try {
                    LocalDate date = LocalDate.parse(occ.date());
                    // Only create for dates not too far in the past
                    if (date.isBefore(LocalDate.now(ZoneOffset.UTC).minusDays(7))) {
                        continue;
                    }

                    String externalId = "occultation-" + occ.target().toLowerCase(Locale.ROOT)
                            .replaceAll("[^a-z0-9]", "") + "-" + occ.date();

                    if (eventRepository.findByExternalIdAndSource(externalId, OCCULTATION_SOURCE).isPresent()) {
                        continue;
                    }

                    String slug = "ocultacao-" + occ.target().toLowerCase(Locale.ROOT)
                            .replaceAll("[^a-z0-9]+", "-") + "-" + occ.date();
                    String title = "Ocultação de " + occ.target() + " pela " + occ.occultedBy();
                    String description = String.format(
                            "%s Região de visibilidade: %s. Data: %s.",
                            occ.notes() != null ? occ.notes() + ". " : "",
                            occ.visibilityRegion(), occ.date());

                    int score = scoreCalculator.calculate(EventType.OCCULTATION, null, null, null);

                    Instant startAt = date.atStartOfDay().toInstant(ZoneOffset.UTC);
                    AstronomicalEvent event = AstronomicalEvent.builder()
                            .slug(slug)
                            .title(title)
                            .type(EventType.OCCULTATION)
                            .description(description)
                            .startAt(startAt)
                            .endAt(startAt.plusSeconds(3 * 3600L))
                            .relevanceScore(score)
                            .status(EventStatus.PUBLISHED)
                            .source(OCCULTATION_SOURCE)
                            .externalId(externalId)
                            .build();
                    eventRepository.save(event);
                    created++;
                } catch (Exception e) {
                    errors.add("occultation " + occ.target() + ": " + e.getMessage());
                }
            }

            if (errors.isEmpty()) {
                syncLogService.completeSync(syncLog, fetched, created, 0);
            } else {
                syncLogService.partialSync(syncLog, fetched, created, 0, String.join("; ", errors));
            }
            log.info("Transit/occultation sync complete: fetched={}, created={}, errors={}", fetched, created, errors.size());
        } catch (Exception e) {
            log.error("Transit/occultation sync failed: {}", e.getMessage(), e);
            syncLogService.failSync(syncLog, e.getMessage());
        }
    }

    private String capitalize(String s) {
        if (s == null || s.isBlank()) return s;
        return s.substring(0, 1).toUpperCase(Locale.ROOT) + s.substring(1).toLowerCase(Locale.ROOT);
    }

    private int processSupermoonEvents(List<AstronomyApiClient.BodyPosition> positions, List<String> errors) {
        List<AstronomyApiClient.BodyPosition> moonSamples = positions.stream()
                .filter(p -> "moon".equalsIgnoreCase(p.bodyId()))
                .filter(p -> p.elongation() != null && p.distanceKm() != null)
                .sorted(Comparator.comparing(AstronomyApiClient.BodyPosition::instant))
                .toList();

        Map<YearMonth, AstronomyApiClient.BodyPosition> bestPerMonth = new HashMap<>();
        for (var sample : moonSamples) {
            double fullMoonDelta = Math.abs(180.0 - sample.elongation());
            if (fullMoonDelta > FULL_MOON_ELONGATION_THRESHOLD_DEGREES
                    || sample.distanceKm() > SUPERMOON_DISTANCE_THRESHOLD_KM) {
                continue;
            }

            YearMonth month = YearMonth.from(LocalDateTime.ofInstant(sample.instant(), ZoneOffset.UTC));
            var currentBest = bestPerMonth.get(month);
            if (currentBest == null) {
                bestPerMonth.put(month, sample);
                continue;
            }

            double bestFullMoonDelta = Math.abs(180.0 - currentBest.elongation());
            if (sample.distanceKm() < currentBest.distanceKm()
                    || (Double.compare(sample.distanceKm(), currentBest.distanceKm()) == 0
                    && fullMoonDelta < bestFullMoonDelta)) {
                bestPerMonth.put(month, sample);
            }
        }

        List<AstronomyApiClient.BodyPosition> selectedSamples = bestPerMonth.values().stream()
                .sorted(Comparator.comparing(AstronomyApiClient.BodyPosition::instant))
                .toList();

        int created = 0;
        for (var current : selectedSamples) {

            try {
                LocalDate date = LocalDateTime.ofInstant(current.instant(), ZoneOffset.UTC).toLocalDate();
                String externalId = "supermoon-" + date;
                if (eventRepository.findByExternalIdAndSource(externalId, SUPERMOON_SOURCE).isPresent()) {
                    continue;
                }

                String slug = "supermoon-" + date;
                String title = "Superlua";
                String description = String.format(Locale.US,
                        "Lua cheia proxima ao perigeu detectada via AstronomyAPI. Distancia da Terra: %.0f km. Elongacao: %.2f graus.%s",
                        current.distanceKm(),
                        current.elongation(),
                        current.phaseName() != null && !current.phaseName().isBlank()
                                ? " Fase: " + current.phaseName() + "."
                                : "");

                int score = scoreCalculator.calculate(EventType.SUPERMOON, null, null, null);
                AstronomicalEvent event = AstronomicalEvent.builder()
                        .slug(slug)
                        .title(title)
                        .type(EventType.SUPERMOON)
                        .description(description)
                        .startAt(current.instant())
                        .endAt(current.instant().plusSeconds(6 * 3600L))
                        .relevanceScore(score)
                        .status(EventStatus.PUBLISHED)
                        .source(SUPERMOON_SOURCE)
                        .externalId(externalId)
                        .build();
                eventRepository.save(event);
                created++;
            } catch (Exception e) {
                errors.add("supermoon " + current.instant() + ": " + e.getMessage());
            }
        }

        return created;
    }

    private int createCometEvent(JplSbdbClient.CometData comet, LocalDate today) {
        if (comet.spkid() == null || comet.spkid().isBlank() || comet.fullName() == null || comet.fullName().isBlank()) {
            return 0;
        }

        LocalDate perihelionDate = parseTpCalDate(comet.tpCal());
        if (perihelionDate == null) {
            return 0;
        }

        if (perihelionDate.isBefore(today.minusDays(30)) || perihelionDate.isAfter(today.plusDays(365))) {
            return 0;
        }

        String cometName = comet.fullName().trim();
        String externalId = "comet-" + comet.spkid() + "-" + perihelionDate;
        if (eventRepository.findByExternalIdAndSource(externalId, COMET_SOURCE).isPresent()) {
            return 0;
        }

        String slug = ("comet-" + cometName + "-" + perihelionDate)
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9-]+", "-")
                .replaceAll("-+", "-");
        if (slug.length() > 180) {
            slug = slug.substring(0, 180);
        }

        String title = "Cometa: " + cometName + " (Perielio)";
        String description = String.format(Locale.US,
                "Cometa catalogado no JPL SBDB. Data de perielio estimada: %s. q=%.3f AU, e=%.3f, i=%.2f deg, MOID=%.3f AU.",
                perihelionDate,
                parseDouble(comet.perihelionDistanceAu(), 0.0),
                parseDouble(comet.eccentricity(), 0.0),
                parseDouble(comet.inclinationDeg(), 0.0),
                parseDouble(comet.moidAu(), 99.0));

        int score = scoreFromComet(comet);
        Instant startAt = perihelionDate.atStartOfDay().toInstant(ZoneOffset.UTC);
        AstronomicalEvent event = AstronomicalEvent.builder()
                .slug(slug)
                .title(title)
                .type(EventType.COMET)
                .description(description)
                .startAt(startAt)
                .endAt(startAt.plusSeconds(6 * 3600L))
                .relevanceScore(score)
                .status(EventStatus.PUBLISHED)
                .source(COMET_SOURCE)
                .externalId(externalId)
                .build();
        eventRepository.save(event);
        return 1;
    }

    private LocalDate parseTpCalDate(String tpCal) {
        if (tpCal == null || tpCal.isBlank()) {
            return null;
        }
        String normalized = tpCal.trim();
        int dot = normalized.indexOf('.');
        if (dot > 0) {
            normalized = normalized.substring(0, dot);
        }
        try {
            return LocalDate.parse(normalized, DateTimeFormatter.ISO_DATE);
        } catch (DateTimeParseException ignored) {
            return null;
        }
    }

    private double parseDouble(String value, double fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException ignored) {
            return fallback;
        }
    }

    private int scoreFromComet(JplSbdbClient.CometData comet) {
        double moid = parseDouble(comet.moidAu(), 99.0);
        double q = parseDouble(comet.perihelionDistanceAu(), 10.0);

        int score = 55;
        if (moid <= 0.5) score += 15;
        else if (moid <= 1.0) score += 8;

        if (q <= 1.0) score += 12;
        else if (q <= 2.0) score += 6;

        return Math.max(1, Math.min(100, score));
    }

    private int processOrbitalEvents(List<AstronomyApiClient.BodyPosition> positions, List<String> errors) {
        Map<String, List<AstronomyApiClient.BodyPosition>> byBody = new HashMap<>();
        for (var position : positions) {
            if (position.elongation() == null) {
                continue;
            }
            byBody.computeIfAbsent(position.bodyId(), ignored -> new ArrayList<>()).add(position);
        }

        int created = 0;
        Set<String> localDedup = new HashSet<>();
        for (var entry : byBody.entrySet()) {
            String body = entry.getKey();
            List<AstronomyApiClient.BodyPosition> samples = entry.getValue().stream()
                    .sorted(Comparator.comparing(AstronomyApiClient.BodyPosition::instant))
                    .toList();

            for (int i = 0; i < samples.size(); i++) {
                var current = samples.get(i);

                if (CONJUNCTION_BODIES.contains(body)
                        && isLocalMinimum(samples, i, p -> Math.abs(p.elongation()))
                        && Math.abs(current.elongation()) <= CONJUNCTION_THRESHOLD_DEGREES) {
                    created += createOrbitalEvent(current, body, EventType.CONJUNCTION, localDedup, errors);
                }

                if (OPPOSITION_BODIES.contains(body)
                        && isLocalMinimum(samples, i, p -> Math.abs(180.0 - p.elongation()))
                        && Math.abs(180.0 - current.elongation()) <= OPPOSITION_THRESHOLD_DEGREES) {
                    created += createOrbitalEvent(current, body, EventType.OPPOSITION, localDedup, errors);
                }
            }
        }

        return created;
    }

    private int createOrbitalEvent(
            AstronomyApiClient.BodyPosition current,
            String bodyId,
            EventType type,
            Set<String> localDedup,
            List<String> errors) {
        try {
            String datePart = LocalDateTime.ofInstant(current.instant(), ZoneOffset.UTC)
                    .toLocalDate()
                    .toString();
            String externalId = "orbital-" + type.name().toLowerCase(Locale.ROOT) + "-" + bodyId + "-" + datePart;
            if (localDedup.contains(externalId)) {
                return 0;
            }
            localDedup.add(externalId);

            if (eventRepository.findByExternalIdAndSource(externalId, ORBITAL_SOURCE).isPresent()) {
                return 0;
            }

            String bodyName = toDisplayBodyName(bodyId);
            String slug = (type.name().toLowerCase(Locale.ROOT) + "-" + bodyId + "-" + datePart)
                    .replace('_', '-');
            String title = type == EventType.CONJUNCTION
                    ? "Conjunção de " + bodyName + " com o Sol"
                    : "Oposição de " + bodyName;

            String description = type == EventType.CONJUNCTION
                    ? String.format(Locale.US,
                    "Separação angular mínima de %.2f graus observada para %s em relação ao Sol.%s",
                    Math.abs(current.elongation()),
                    bodyName,
                    current.constellation() == null || current.constellation().isBlank()
                            ? ""
                            : " Constelação: " + current.constellation() + ".")
                    : String.format(Locale.US,
                    "Separação angular de %.2f graus indica oposição aproximada para %s.%s",
                    current.elongation(),
                    bodyName,
                    current.constellation() == null || current.constellation().isBlank()
                            ? ""
                            : " Constelação: " + current.constellation() + ".");

            int score = scoreCalculator.calculate(type, null, null, null);
            AstronomicalEvent event = AstronomicalEvent.builder()
                    .slug(slug)
                    .title(title)
                    .type(type)
                    .description(description)
                    .startAt(current.instant())
                    .endAt(current.instant().plusSeconds(7200))
                    .relevanceScore(score)
                    .status(EventStatus.PUBLISHED)
                    .source(ORBITAL_SOURCE)
                    .externalId(externalId)
                    .build();

            eventRepository.save(event);
            return 1;
        } catch (Exception e) {
            errors.add(bodyId + " " + type.name() + ": " + e.getMessage());
            return 0;
        }
    }

    private boolean isLocalMinimum(
            List<AstronomyApiClient.BodyPosition> samples,
            int index,
            java.util.function.Function<AstronomyApiClient.BodyPosition, Double> metric) {
        double current = metric.apply(samples.get(index));
        double prev = index > 0 ? metric.apply(samples.get(index - 1)) : Double.MAX_VALUE;
        double next = index + 1 < samples.size() ? metric.apply(samples.get(index + 1)) : Double.MAX_VALUE;
        return current <= prev && current <= next;
    }

    private String toDisplayBodyName(String bodyId) {
        return switch (bodyId) {
            case "mercury" -> "Mercurio";
            case "venus" -> "Venus";
            case "mars" -> "Marte";
            case "jupiter" -> "Jupiter";
            case "saturn" -> "Saturno";
            case "uranus" -> "Urano";
            case "neptune" -> "Netuno";
            default -> bodyId;
        };
    }

    private int processNeoEvents(List<NasaApiClient.NeoData> neos, List<String> errors) {
        int created = 0;
        for (var neo : neos) {
            try {
                if (neo.getNasaId() == null || neo.getNasaId().isBlank()) {
                    continue;
                }

                Instant startAt = parseNeoTime(neo.getCloseApproachDate());
                if (startAt == null) {
                    continue;
                }

                String externalId = "neo-" + neo.getNasaId() + "-" + startAt.toEpochMilli();
                if (eventRepository.findByExternalIdAndSource(externalId, NEO_SOURCE).isPresent()) {
                    continue;
                }

                String slug = ("neo-approach-" + neo.getNasaId() + "-" + startAt.toString())
                        .toLowerCase(Locale.ROOT)
                        .replace(':', '-')
                        .replace('.', '-')
                        .replace("--", "-");

                String title = "Asteroide em aproximação: " + neo.getName();
                String description = "Objeto próximo da Terra registrado pela NASA NeoWs. "
                        + "Distância mínima (km): " + (neo.getMissDistanceKm() != null ? neo.getMissDistanceKm() : "N/A")
                        + ". Velocidade relativa (km/h): " + (neo.getRelativeVelocityKmH() != null ? neo.getRelativeVelocityKmH() : "N/A")
                        + ". Potencialmente perigoso: " + (neo.isPotentiallyHazardous() ? "sim" : "não") + ".";

                int score = neo.isPotentiallyHazardous() ? 75 : 58;

                AstronomicalEvent event = AstronomicalEvent.builder()
                        .slug(slug)
                        .title(title)
                        .type(EventType.OTHER)
                        .description(description)
                        .startAt(startAt)
                        .endAt(startAt.plusSeconds(3600))
                        .relevanceScore(score)
                        .status(EventStatus.PUBLISHED)
                        .source(NEO_SOURCE)
                        .externalId(externalId)
                        .build();

                eventRepository.save(event);
                created++;
            } catch (Exception ex) {
                String identifier = neo.getNasaId() != null ? neo.getNasaId() : "unknown";
                log.warn("Failed to process NEO event {}: {}", identifier, ex.getMessage());
                errors.add("NEO " + identifier + ": " + ex.getMessage());
            }
        }
        return created;
    }

    private int processEvents(List<DonkiClient.DonkiEventData> events, List<String> errors) {
        int created = 0;
        for (var data : events) {
            try {
                if (data.externalId() == null || data.externalId().isBlank()) continue;

                // Deduplication check
                if (eventRepository.findByExternalIdAndSource(data.externalId(), SOURCE).isPresent()) {
                    continue;
                }

                int score = scoreCalculator.calculate(
                        data.eventType(), data.classType(), data.kpIndex(), data.cmeSpeed());

                Instant startAt = parseDonkiTime(data.startTime());
                Instant endAt = parseDonkiTime(data.endTime());
                if (startAt == null) continue;
                if (endAt == null || endAt.isBefore(startAt)) {
                    endAt = startAt.plusSeconds(3600); // default 1 hour duration
                }

                String title = buildTitle(data);
                String slug = buildSlug(data);
                String description = buildDescription(data);

                AstronomicalEvent event = AstronomicalEvent.builder()
                        .slug(slug)
                        .title(title)
                        .type(data.eventType())
                        .description(description)
                        .startAt(startAt)
                        .endAt(endAt)
                        .relevanceScore(score)
                        .status(EventStatus.PUBLISHED)
                        .source(SOURCE)
                        .externalId(data.externalId())
                        .build();

                eventRepository.save(event);
                created++;

            } catch (Exception e) {
                log.warn("Failed to process DONKI event {}: {}", data.externalId(), e.getMessage());
                errors.add("Event " + data.externalId() + ": " + e.getMessage());
            }
        }
        return created;
    }

    private Instant parseDonkiTime(String time) {
        if (time == null || time.isBlank()) return null;
        try {
            return DONKI_FORMAT.parse(time, Instant::from);
        } catch (DateTimeParseException e) {
            try {
                return DateTimeFormatter.ISO_INSTANT.parse(time, Instant::from);
            } catch (DateTimeParseException e2) {
                try {
                    return DateTimeFormatter.ISO_DATE_TIME.parse(time, Instant::from);
                } catch (DateTimeParseException e3) {
                    log.warn("Cannot parse DONKI time: {}", time);
                    return null;
                }
            }
        }
    }

    private Instant parseNeoTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return Instant.parse(value);
        } catch (DateTimeParseException ignored) {
        }

        try {
            return LocalDateTime.parse(value, NEO_DATE_FORMAT).toInstant(ZoneOffset.UTC);
        } catch (DateTimeParseException ignored) {
        }

        try {
            return LocalDate.parse(value, DateTimeFormatter.ISO_DATE).atStartOfDay().toInstant(ZoneOffset.UTC);
        } catch (DateTimeParseException ignored) {
        }

        log.warn("Cannot parse NeoWs time: {}", value);
        return null;
    }

    private String buildTitle(DonkiClient.DonkiEventData data) {
        return switch (data.eventType()) {
            case SOLAR_FLARE -> {
                String cls = data.classType() != null ? data.classType() : "";
                yield "Explosão Solar" + (cls.isEmpty() ? "" : " Classe " + cls);
            }
            case CME -> {
                String speed = data.cmeSpeed() != null ? String.format(" (%.0f km/s)", data.cmeSpeed()) : "";
                yield "Ejeção de Massa Coronal" + speed;
            }
            case GEOMAGNETIC_STORM -> {
                String kp = data.kpIndex() != null ? String.format(" (Kp %.0f)", data.kpIndex()) : "";
                yield "Tempestade Geomagnética" + kp;
            }
            default -> data.eventType().name();
        };
    }

    private String buildSlug(DonkiClient.DonkiEventData data) {
        String base = switch (data.eventType()) {
            case SOLAR_FLARE -> "solar-flare";
            case CME -> "cme";
            case GEOMAGNETIC_STORM -> "geomagnetic-storm";
            default -> data.eventType().name().toLowerCase().replace('_', '-');
        };
        // Use externalId hash for uniqueness
        String idPart = data.externalId().replaceAll("[^a-zA-Z0-9-]", "-").toLowerCase();
        if (idPart.length() > 60) idPart = idPart.substring(0, 60);
        return base + "-" + idPart;
    }

    private String buildDescription(DonkiClient.DonkiEventData data) {
        StringBuilder sb = new StringBuilder();
        switch (data.eventType()) {
            case SOLAR_FLARE -> {
                if (data.classType() != null) sb.append("Classe: ").append(data.classType()).append(". ");
                if (data.note() != null && !data.note().isBlank()) sb.append(data.note());
            }
            case CME -> {
                if (data.cmeSpeed() != null) sb.append("Velocidade: ").append(String.format("%.0f", data.cmeSpeed())).append(" km/s. ");
                if (data.note() != null && !data.note().isBlank()) sb.append(data.note());
            }
            case GEOMAGNETIC_STORM -> {
                if (data.kpIndex() != null) sb.append("Índice Kp máximo: ").append(String.format("%.0f", data.kpIndex())).append(". ");
                if (data.note() != null && !data.note().isBlank()) sb.append(data.note());
            }
            default -> {
                if (data.note() != null && !data.note().isBlank()) sb.append(data.note());
            }
        }
        return sb.length() > 0 ? sb.toString() : "Evento de clima espacial detectado por NASA DONKI.";
    }
}
