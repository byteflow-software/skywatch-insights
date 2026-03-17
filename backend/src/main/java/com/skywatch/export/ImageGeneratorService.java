package com.skywatch.export;

import com.skywatch.event.AstronomicalEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageGeneratorService {

    private final VercelBlobStorageService blobStorageService;

    public String generateImage(AstronomicalEvent event, SocialExportTemplate template) {
        String label = event.getType() != null ? event.getType().name().replace('_', ' ') : "ASTRO EVENT";
        String title = event.getTitle() != null ? event.getTitle() : "SkyWatch Insights";
        String[] colors = colorsForType(event.getType() != null ? event.getType().name() : "");

        String svg = buildSvg(title, label, colors[0], colors[1]);
        byte[] bytes = svg.getBytes(StandardCharsets.UTF_8);

        String path = "exports/"
                + (event.getId() != null ? event.getId() : "event")
                + "-"
                + Instant.now().toEpochMilli()
                + ".svg";

        return blobStorageService.upload(path, bytes, "image/svg+xml")
                .orElseGet(() -> "data:image/svg+xml;base64," + Base64.getEncoder().encodeToString(bytes));
    }

    private String buildSvg(String title, String label, String primary, String secondary) {
        String safeTitle = escapeXml(title);
        String safeLabel = escapeXml(label);
        return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1200 630\" role=\"img\" aria-label=\""
                + safeTitle
                + "\">"
                + "<defs><linearGradient id=\"bg\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">"
                + "<stop offset=\"0%\" stop-color=\""
                + primary
                + "\"/><stop offset=\"100%\" stop-color=\""
                + secondary
                + "\"/></linearGradient></defs>"
                + "<rect width=\"1200\" height=\"630\" fill=\"url(#bg)\"/>"
                + "<circle cx=\"980\" cy=\"130\" r=\"3\" fill=\"#ffffff\" opacity=\"0.7\"/>"
                + "<circle cx=\"900\" cy=\"190\" r=\"2\" fill=\"#ffffff\" opacity=\"0.55\"/>"
                + "<text x=\"80\" y=\"500\" fill=\"#ffffff\" font-family=\"Segoe UI,Arial,sans-serif\" font-size=\"64\" font-weight=\"700\">"
                + safeTitle
                + "</text>"
                + "<text x=\"80\" y=\"560\" fill=\"#E2E8F0\" font-family=\"Segoe UI,Arial,sans-serif\" font-size=\"30\" font-weight=\"600\">"
                + safeLabel
                + "</text>"
                + "</svg>";
    }

    private String[] colorsForType(String type) {
        return switch (type) {
            case "SOLAR_FLARE" -> new String[]{"#7C2D12", "#F97316"};
            case "CME" -> new String[]{"#450A0A", "#EF4444"};
            case "GEOMAGNETIC_STORM" -> new String[]{"#1E1B4B", "#6366F1"};
            case "AURORA" -> new String[]{"#052E16", "#06B6D4"};
            default -> new String[]{"#0F172A", "#334155"};
        };
    }

    private String escapeXml(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
