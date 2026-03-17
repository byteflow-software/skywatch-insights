CREATE TABLE locations (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_locations_name ON locations (LOWER(name));
CREATE INDEX idx_locations_country ON locations (country_code);
