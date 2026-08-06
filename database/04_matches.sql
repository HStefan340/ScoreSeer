CREATE TABLE matches(
    id              SERIAL PRIMARY KEY,
    league_id       INT NOT NULL REFERENCES leagues(id),
    home_team_id    INT NOT NULL REFERENCES teams(id),
    away_team_id    INT NOT NULL REFERENCES teams(id),
    kickoff_at      TIMESTAMPTZ NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    home_score      INT,
    away_score      INT,
    external_id     VARCHAR(50) UNIQUE,
    CHECK(home_team_id <> away_team_id)
);