-- +goose Up
CREATE TABLE clicks(
    id UUID PRIMARY KEY UNIQUE NOT NULL,
    short_link_id UUID NOT NULL,
    ip_address TEXT NOT NULL,
    country TEXT NOT NULL,
    referrer TEXT NOT NULL,
    is_unique BOOLEAN NOT NULL,
    utm_source TEXT NOT NULL,
    utm_medium TEXT NOT NULL,
    utm_campaign TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (short_link_id) REFERENCES short_links(id) ON DELETE CASCADE
);
-- +goose down
DROP TABLE clicks;