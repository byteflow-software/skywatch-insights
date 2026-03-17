CREATE TABLE social_export_templates (
    id UUID PRIMARY KEY,
    network VARCHAR(30) NOT NULL,
    format VARCHAR(50) NOT NULL,
    objective VARCHAR(20) NOT NULL,
    layout_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    text_template TEXT NOT NULL,
    character_limit INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (network, format, objective, layout_version)
);
