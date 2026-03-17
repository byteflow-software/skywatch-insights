CREATE TABLE comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type VARCHAR(20)  NOT NULL,
    target_id   UUID         NOT NULL,
    user_id     UUID         NOT NULL REFERENCES users(id),
    content     VARCHAR(500) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_target ON comments (target_type, target_id, created_at DESC);
CREATE INDEX idx_comments_user ON comments (user_id);
