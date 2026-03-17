package com.skywatch.forecast;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherData {
    private int cloudCoverage;    // 0-100%
    private int humidity;         // 0-100%
    private int visibility;       // meters (max 10000)
    private double temperature;   // Celsius
    private String description;   // e.g., "clear sky", "few clouds"
    private String icon;          // OpenWeatherMap icon code
}
