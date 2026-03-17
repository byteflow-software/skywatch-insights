CREATE TABLE daily_highlights (
    id UUID PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    explanation TEXT NOT NULL,
    image_url VARCHAR(1000) NOT NULL,
    hd_image_url VARCHAR(1000),
    media_type VARCHAR(20) NOT NULL,
    copyright VARCHAR(300),
    source VARCHAR(50) NOT NULL DEFAULT 'nasa_apod',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_daily_highlights_date ON daily_highlights (date DESC);
