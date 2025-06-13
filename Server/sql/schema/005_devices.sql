-- +goose Up
CREATE TABLE devices(
    id UUID PRIMARY KEY UNIQUE NOT NULL,
    click_id UUID NOT NULL,
    user_agent TEXT NOT NULL,
	device_type TEXT NOT NULL,
	language TEXT NOT NULL,
    platform TEXT NOT NULL,
    resolution TEXT NOT NULL,
    timezone TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (click_id) REFERENCES clicks(id) ON DELETE CASCADE
);
-- +goose down
DROP TABLE devices;