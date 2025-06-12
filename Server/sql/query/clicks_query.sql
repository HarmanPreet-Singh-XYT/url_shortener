-- name: RetrieveClicksByShortLinkId :many
SELECT * FROM clicks
WHERE short_link_id = $1;
-- name: RetrieveClicksById :one
SELECT * FROM clicks
WHERE id = $1;
-- name: CreateClick :one
INSERT INTO clicks(id,short_link_id,ip_address,country,referrer,is_unique,utm_source,utm_medium,utm_campaign,created_at)
VALUES (
    gen_random_uuid(),
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    NOW()
)RETURNING id;
-- name: CountTotalClickByShortLinkId :one
SELECT COUNT(id) FROM clicks
WHERE short_link_id = $1;
-- name: CountUniqueClickByShortLinkId :one
SELECT COUNT(id) FROM clicks
WHERE short_link_id = $1 AND is_unique = TRUE;

-- name: AnalyticsRetrieval :many
SELECT
  clicks.*, 
  devices.device_type, devices.platform, devices.language,
  devices.resolution, devices.timezone, devices.user_agent
FROM clicks
JOIN devices ON clicks.id = devices.click_id
WHERE clicks.short_link_id = $1;