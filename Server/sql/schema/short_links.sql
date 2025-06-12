-- +goose Up
CREATE TABLE short_links(
    id UUID PRIMARY KEY UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    utm_source TEXT NOT NULL,
    utm_medium TEXT NOT NULL,
    utm_campaign TEXT NOT NULL,
    is_active BOOLEAN,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
-- +goose down
DROP TABLE short_links;