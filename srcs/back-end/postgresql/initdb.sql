-- Create the players TABLE
CREATE TABLE players (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(32) UNIQUE NOT NULL,
    level SMALLINT NOT NULL DEFAULT 1,
    xp INT NOT NULL DEFAULT 0,
    money INT NOT NULL DEFAULT 0 CHECK (MONEY >= 0),
    avatar_path VARCHAR(255) NOT NULL DEFAULT '/avatars/defaults/default1.png'
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
CREATE INDEX friendlist_player2_id ON friendlist (player2);

-- Create the shop_items table
CREATE TABLE shop_items (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,
    type VARCHAR(16) NOT NULL
        CHECK (type IN ('SKIN', 'ANIMATION', 'EMOTE', 'BANNER')),
    price INT NOT NULL CHECK (price >= 0),
    asset_path VARCHAR(255) NOT NULL
);

-- Ownership: which player owns which item (many-to-many)
-- The PK (player_id, item_id) prevents buying the same item twice
-- and makes "everything player X owns" fast
CREATE TABLE players_items (
    player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    item_id   INT NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
    acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (player_id, item_id)
);

-- PK is sorted by player_id; this index makes "who owns item Y" fast
CREATE INDEX player_items_item_id ON players_items (item_id);

-- Create the achievements table
CREATE TABLE achievements (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,
    unlock_condition VARCHAR(255) NOT NULL
);

-- Create the players_achievements table
CREATE TABLE players_achievements (
    player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    achievement_id INT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (player_id, achievement_id)
);

CREATE TABLE match_history (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    gamemode VARCHAR(16) NOT NULL DEFAULT 'default'
        CHECK (gamemode IN ('default')),
    status VARCHAR(16) NOT NULL DEFAULT 'finished'
        CHECK (status IN ('finished', 'abandoned')),
    started_at TIMESTAMPTZ NOT NULL,
    finished_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (finished_at >= started_at)
);

-- Who played in which match, and their result (many-to-many)
-- The PK prevents adding the same player twice to a match
CREATE TABLE player_history (
    player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    match_id  INT NOT NULL REFERENCES match_history(id) ON DELETE CASCADE,
    is_winner BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (player_id, match_id)
);

-- PK is sorted by player_id; this index makes "who played in match Y" fast
CREATE INDEX player_history_match_id ON player_history (match_id);