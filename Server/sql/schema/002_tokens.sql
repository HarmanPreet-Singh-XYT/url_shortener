-- +goose Up
CREATE TABLE tokens(
    id UUID PRIMARY KEY UNIQUE NOT NULL,
    user_id UUID UNIQUE NOT NULL,
    refresh_token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    last_used_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- +goose down
DROP TABLE tokens;