ALTER TABLE astronomical_events ADD COLUMN external_id VARCHAR(200);

CREATE UNIQUE INDEX idx_events_external_id_source ON astronomical_events (external_id, source)
    WHERE external_id IS NOT NULL;
