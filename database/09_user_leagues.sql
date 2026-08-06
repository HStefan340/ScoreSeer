CREATE TABLE user_leagues(
    user_id BIGINT NOT NULL REFERENCES users(id),
    league_id INT NOT NULL REFERENCES leagues(id),
    PRIMARY KEY (user_id, league_id)
);