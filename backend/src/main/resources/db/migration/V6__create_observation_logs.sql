CREATE TABLE observation_logs (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    event_id UUID REFERENCES astronomical_events(id),
    observed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    location_name VARCHAR(200),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    notes TEXT,
    outcome VARCHAR(20),
    media_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_observations_user ON observation_logs (user_id);
