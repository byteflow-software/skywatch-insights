CREATE TABLE data_sync_logs (
    id UUID PRIMARY KEY,
    source VARCHAR(50) NOT NULL,
    sync_type VARCHAR(50) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    items_fetched INTEGER NOT NULL DEFAULT 0,
    items_created INTEGER NOT NULL DEFAULT 0,
    items_updated INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sync_logs_source ON data_sync_logs (source);
CREATE INDEX idx_sync_logs_started ON data_sync_logs (started_at DESC);
