CREATE TABLE visibility_forecasts (
    id UUID PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES astronomical_events(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    best_window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    best_window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    observability_score INTEGER NOT NULL CHECK (observability_score BETWEEN 0 AND 100),
    cloud_coverage INTEGER,
    humidity INTEGER,
    visibility INTEGER,
    weather_summary VARCHAR(500),
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (event_id, location_id)
);
CREATE INDEX idx_forecast_event ON visibility_forecasts (event_id);
CREATE INDEX idx_forecast_location ON visibility_forecasts (location_id);
