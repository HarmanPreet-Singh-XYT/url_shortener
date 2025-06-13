-- name: RetrieveShortLinkById :one
SELECT * FROM short_links
WHERE id = $1;
-- name: RetrieveShortLinkByUserId :many
SELECT * FROM short_links
WHERE user_id = $1;
-- name: RetrieveShortLinkByUserIdANDId :one
SELECT * FROM short_links
WHERE user_id = $1 AND id = $2;
-- name: RetrieveShortLinkBySlug :one
SELECT * FROM short_links
WHERE slug = $1;
-- name: RetrieveShortLinkBySlugNUserId :one
SELECT * FROM short_links
WHERE slug = $1 AND user_id = $2;
-- name: CreateShortLink :exec
INSERT INTO short_links(id, user_id, slug, original_url, utm_source, utm_medium, utm_campaign,is_active,created_at)
VALUES(
    gen_random_uuid(),
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    TRUE,
    NOW()
) RETURNING *;
-- name: ToggleShortLink :exec
UPDATE short_links
SET
  is_active = NOT is_active, -- Toggles the boolean value
  updated_at = NOW()         -- Updates the timestamp to the current time
WHERE
  slug = $1 AND user_id = $2; 
-- name: UpdateShortLinkSlug :exec
UPDATE short_links
SET slug = $3,updated_at = NOW()
WHERE slug = $1 AND user_id = $2;
-- name: UpdateShortLinkUTM :exec
UPDATE short_links
SET utm_source = $2, utm_medium = $3, utm_campaign = $4,updated_at = NOW()
WHERE slug = $1 AND user_id = $5;
-- name: DeleteShortLinkBySlugNUserId :exec
DELETE FROM short_links
WHERE slug = $1 AND user_id = $2;