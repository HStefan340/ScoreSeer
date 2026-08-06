CREATE TABLE users(
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255),
    google_id       VARCHAR(255) UNIQUE,
    username        VARCHAR(30) NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);