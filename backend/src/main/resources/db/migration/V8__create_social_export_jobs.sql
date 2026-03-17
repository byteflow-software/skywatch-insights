CREATE TABLE social_export_jobs (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    event_id UUID NOT NULL REFERENCES astronomical_events(id),
    template_id UUID NOT NULL REFERENCES social_export_templates(id),
    network VARCHAR(30) NOT NULL,
    format VARCHAR(50) NOT NULL,
    objective VARCHAR(20) NOT NULL DEFAULT 'ENGAGEMENT',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    output_image_url VARCHAR(500),
    output_text_content TEXT,
    output_bundle_path VARCHAR(500),
    error_message VARCHAR(500),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_export_jobs_user ON social_export_jobs (user_id);
CREATE INDEX idx_export_jobs_event ON social_export_jobs (event_id);
