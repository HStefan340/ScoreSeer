CREATE TABLE predictions(
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT NOT NULL REFERENCES users(id),
    match_id                INT NOT NULL REFERENCES matches(id),
    predicted_home_score    INT NOT NULL,
    predicted_away_score    INT NOT NULL,
    points_awarded          INT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, match_id),
    CHECK(predicted_home_score >= 0 AND predicted_away_score >= 0)
);