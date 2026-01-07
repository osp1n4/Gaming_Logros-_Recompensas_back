-- Achievement Service Database Initialization
-- Create tables for achievements and player progress

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(100) NOT NULL,
    rule_config JSONB NOT NULL,
    reward_type VARCHAR(50) NOT NULL,
    reward_value INTEGER NOT NULL,
    icon_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player achievements table
CREATE TABLE IF NOT EXISTS player_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP,
    UNIQUE(player_id, achievement_id)
);

-- Indexes
CREATE INDEX idx_achievements_rule_type ON achievements(rule_type);
CREATE INDEX idx_player_achievements_player_id ON player_achievements(player_id);
CREATE INDEX idx_player_achievements_unlocked ON player_achievements(unlocked);

-- Sample achievements
INSERT INTO achievements (name, description, rule_type, rule_config, reward_type, reward_value) VALUES
    ('First Steps', 'Juega tu primer partida', 'PLAYTIME', '{"target": 1}', 'COINS', 100),
    ('Monster Hunter', 'Mata 10 monstruos', 'MONSTER_KILL_COUNT', '{"target": 10}', 'COINS', 500),
    ('Dragon Slayer', 'Mata 10 dragones', 'MONSTER_KILL_COUNT', '{"target": 10, "monsterType": "dragon"}', 'COINS', 1000),
    ('Level Master', 'Alcanza el nivel 10', 'LEVEL_REACHED', '{"target": 10}', 'XP', 500)
ON CONFLICT DO NOTHING;
