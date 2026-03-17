-- Add branding customization fields to users table
ALTER TABLE users
    ADD COLUMN brand_palette VARCHAR(100),
    ADD COLUMN brand_logo_url VARCHAR(500),
    ADD COLUMN brand_cta_text VARCHAR(200),
    ADD COLUMN brand_signature VARCHAR(200);
