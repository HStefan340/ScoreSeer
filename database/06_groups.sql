CREATE TABLE groups(
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL,
    owner_id        BIGINT NOT NULL REFERENCES users(id),
    invite_code     VARCHAR(20) NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);