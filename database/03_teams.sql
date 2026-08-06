CREATE TABLE teams(
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    short_name      VARCHAR(10),
    logo_url        VARCHAR(255),
    league_id       INT NOT NULL REFERENCES leagues(id),
    external_id     VARCHAR(50) UNIQUE
);