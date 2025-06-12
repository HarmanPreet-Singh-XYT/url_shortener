-- name: RetrieveToken :one
SELECT * FROM tokens
WHERE user_id = $1;
-- name: RetrieveTokenById :one
SELECT * FROM tokens
WHERE id = $1;
-- name: DeleteTokenById :exec
DELETE FROM tokens
WHERE id = $1;
-- name: DeleteToken :exec
DELETE FROM tokens
WHERE user_id = $1;
-- name: CreateToken :exec
INSERT INTO tokens(id, user_id, refresh_token, created_at,last_used_at)
VALUES(
    gen_random_uuid(),
    $1,
    $2,
    NOW(),
    NOW()
);
-- name: UpdateTokenByUserId :exec
UPDATE tokens
SET refresh_token = $2, updated_at = NOW(), last_used_at = NOW()
WHERE user_id = $1;
-- name: RetrieveTokenByToken :one
SELECT * FROM tokens
WHERE refresh_token = $1;