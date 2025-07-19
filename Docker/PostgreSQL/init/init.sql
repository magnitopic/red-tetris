CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) DEFAULT NULL,
    profile_picture VARCHAR(255) DEFAULT NULL,
    active_account BOOLEAN DEFAULT FALSE,
    oauth BOOLEAN DEFAULT FALSE,
    refresh_token VARCHAR(2048) DEFAULT NULL,
    reset_pass_token VARCHAR(2048) DEFAULT NULL
);

CREATE TABLE games (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    game_seed INTEGER UNIQUE NOT NULL,
    finished BOOLEAN DEFAULT FALSE
);

CREATE TABLE game_players (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    position INTEGER NOT NULL,
    UNIQUE(game_id, user_id)
);


CREATE INDEX idx_game_players_user_id ON game_players(user_id);
CREATE INDEX idx_game_players_game_id ON game_players(game_id);
