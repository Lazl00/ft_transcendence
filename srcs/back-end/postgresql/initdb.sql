-- Create the players TABLE
CREATE TABLE players (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(32) UNIQUE NOT NULL,
    level SMALLINT NOT NULL DEFAULT 1,
    xp INT NOT NULL DEFAULT 0,
    money INT NOT NULL DEFAULT 0
);

-- Create the friendlist TABLE
-- player1 = the player who sent the invite, player2 = the one who received it
CREATE TABLE friendlist (
    player1 INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    player2 INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    invite_status VARCHAR(16) NOT NULL DEFAULT 'pending'
        CHECK (invite_status IN ('pending', 'accepted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (player1, player2),
    CHECK (player1 <> player2)
);

-- In the case where p1 invite p2, and p2 invite p1, this would lead to having two rows, as the ids are swapped
-- This fixes it by creating a list sorted by the smallest id, so no duplicate invites can happen
CREATE UNIQUE INDEX friendlist_pair_unique
    ON friendlist (LEAST(player1, player2), GREATEST(player1, player2));

-- PRIMARY KEY in the table sorts by the player1 id, so if trying to search for who invited a player (player2),
-- Postgres would have to read the whole table. This creates a list sorted by player2 to make it fast
-- (e.g. showing a player's received friend requests)
CREATE INDEX friendlist_player2_idx ON friendlist (player2);