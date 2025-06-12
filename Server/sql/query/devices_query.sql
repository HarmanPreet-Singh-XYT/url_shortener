-- name: RetrieveDevicesByClickId :many
SELECT * FROM devices
WHERE click_id = $1;
-- name: RetrieveDevicesById :one
SELECT * FROM devices
WHERE id = $1;
-- name: CreateDevice :exec
INSERT INTO devices(id,click_id,user_agent,device_type,language,platform,resolution,timezone,created_at)
VALUES(
    gen_random_uuid(),
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    NOW()
);