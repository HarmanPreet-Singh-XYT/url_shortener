-- name: RetrieveUserById :one
SELECT * FROM users
WHERE id = $1;
-- name: RetrieveUserByEmail :one
SELECT * FROM users
WHERE email = $1;
-- name: CreateUser :one
INSERT INTO users(id, name, email, password, created_at)
VALUES(
    gen_random_uuid(),
    $1,
    $2,
    $3,
    NOW()
) RETURNING *;
-- name: UpdateUser :exec
UPDATE users
SET name = $2, email = $3, password = $4, updated_at = NOW()
WHERE id = $1;
-- name: UpdateUserName :exec
UPDATE users
SET name = $2
WHERE id = $1 AND updated_at = NOW();
-- name: UpdateUserEmail :exec
UPDATE users
SET email = $2
WHERE id = $1 AND updated_at = NOW();
-- name: UpdateUserPassword :exec
UPDATE users
SET password = $2
WHERE id = $1 AND updated_at = NOW();