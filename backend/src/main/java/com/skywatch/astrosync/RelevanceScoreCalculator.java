package com.skywatch.astrosync;

import com.skywatch.event.EventType;
import org.springframework.stereotype.Component;

@Component
public class RelevanceScoreCalculator {

    public int calculate(EventType type, String classType, Double kpIndex, Double cmeSpeed) {
        int base = baseScore(type);
        int modifier = intensityModifier(type, classType, kpIndex, cmeSpeed);
        return Math.min(100, Math.max(1, base + modifier));
    }

    private int baseScore(EventType type) {
        return switch (type) {
            case ECLIPSE_SOLAR -> 90;
            case ECLIPSE_LUNAR -> 85;
            case CONJUNCTION -> 80;
            case METEOR_SHOWER -> 75;
            case OPPOSITION -> 75;
            case SUPERMOON -> 70;
            case GEOMAGNETIC_STORM -> 60;
            case CME -> 55;
            case SOLAR_FLARE -> 50;
            case AURORA -> 65;
            case OCCULTATION -> 60;
            case TRANSIT -> 70;
            case COMET -> 70;
            case OTHER -> 40;
        };
    }

    private int intensityModifier(EventType type, String classType, Double kpIndex, Double cmeSpeed) {
        return switch (type) {
            case SOLAR_FLARE -> solarFlareModifier(classType);
            case GEOMAGNETIC_STORM -> geomagneticModifier(kpIndex);
            case CME -> cmeModifier(cmeSpeed);
            default -> 0;
        };
    }

    private int solarFlareModifier(String classType) {
        if (classType == null || classType.isBlank()) return 0;
        char cls = Character.toUpperCase(classType.charAt(0));
        return switch (cls) {
            case 'X' -> 40;
            case 'M' -> 20;
            case 'C' -> 5;
            default -> 0;
        };
    }

    private int geomagneticModifier(Double kpIndex) {
        if (kpIndex == null) return 0;
        int modifier = (int) (kpIndex * 5);
        return Math.min(35, modifier);
    }

    private int cmeModifier(Double speed) {
        if (speed == null) return 0;
        int modifier = (int) (speed / 100);
        return Math.min(20, modifier);
    }
}
