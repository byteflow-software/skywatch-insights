CREATE TABLE astronomical_events (
    id UUID PRIMARY KEY,
    slug VARCHAR(200) NOT NULL UNIQUE,
    title VARCHAR(300) NOT NULL,
    type VARCHAR(30) NOT NULL,
    description TEXT NOT NULL,
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE NOT NULL,
    relevance_score INTEGER NOT NULL CHECK (relevance_score BETWEEN 1 AND 100),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    source VARCHAR(100),
    image_url VARCHAR(500),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_slug ON astronomical_events (slug);
CREATE INDEX idx_events_status_start ON astronomical_events (status, start_at);
CREATE INDEX idx_events_type ON astronomical_events (type);
