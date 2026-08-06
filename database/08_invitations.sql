CREATE TABLE invitations(
    id BIGSERIAL PRIMARY KEY,
    group_id INT NOT NULL REFERENCES groups(id),
    sender_id BIGINT NOT NULL REFERENCES users(id),
    receiver_id BIGINT NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK(sender_id <> receiver_id)
);