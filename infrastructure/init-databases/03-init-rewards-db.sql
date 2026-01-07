-- Reward Service Database Initialization
-- Create tables for rewards and player inventory

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL,
    achievement_id UUID NOT NULL,
    reward_type VARCHAR(50) NOT NULL,
    reward_value INTEGER NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL
);

-- Player inventory table
CREATE TABLE IF NOT EXISTS player_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID UNIQUE NOT NULL,
    coins INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    items JSONB DEFAULT '[]',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_rewards_player_id ON rewards(player_id);
CREATE INDEX idx_rewards_idempotency_key ON rewards(idempotency_key);
CREATE INDEX idx_player_inventory_player_id ON player_inventory(player_id);

-- Sample inventories (optional)
INSERT INTO player_inventory (player_id, coins, xp) VALUES
    ('11111111-1111-1111-1111-111111111111', 0, 0),
    ('22222222-2222-2222-2222-222222222222', 0, 0)
ON CONFLICT (player_id) DO NOTHING;
