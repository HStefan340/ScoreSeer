CREATE TABLE group_members(
    group_id        INT NOT NULL REFERENCES groups(id),
    user_id         BIGINT NOT NULL REFERENCES users(id),
    role            VARCHAR(20) NOT NULL DEFAULT 'Member',
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);docker