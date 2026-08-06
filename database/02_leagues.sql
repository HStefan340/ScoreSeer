CREATE TABLE leagues(
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    country         VARCHAR(100) NOT NULL,
    external_id     VARCHAR(50) UNIQUE
);