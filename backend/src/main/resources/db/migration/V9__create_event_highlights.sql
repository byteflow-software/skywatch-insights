CREATE TABLE event_highlights (
    id UUID PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES astronomical_events(id),
    type VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    editorial_note TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_highlights_type_dates ON event_highlights (type, start_date, end_date);
