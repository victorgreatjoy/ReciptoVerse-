-- Migration: Add HTS (Hedera Token Service) support for points system - PostgreSQL
-- Phase 2: On-chain points tokens
-- Created: 2025-10-28

-- Add HTS token ID to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS hts_token_associated INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hts_account_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hts_balance INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hts_last_sync TIMESTAMP;

-- Add HTS transaction log table
CREATE TABLE IF NOT EXISTS hts_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL, -- 'mint', 'burn', 'transfer_in', 'transfer_out'
  amount INTEGER NOT NULL,
  token_id TEXT NOT NULL,
  hedera_tx_id TEXT,
  hedera_consensus_timestamp TEXT,
  related_receipt_id TEXT,
  related_redemption_id TEXT,
  memo TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_hts_transactions_user_id ON hts_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_hts_transactions_type ON hts_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_hts_transactions_status ON hts_transactions(status);
CREATE INDEX IF NOT EXISTS idx_hts_transactions_hedera_tx ON hts_transactions(hedera_tx_id);

-- Add HTS fields to points_transactions table
ALTER TABLE points_transactions ADD COLUMN IF NOT EXISTS hts_tx_id TEXT;
ALTER TABLE points_transactions ADD COLUMN IF NOT EXISTS hts_synced INTEGER DEFAULT 0;

-- System config table for HTS settings
CREATE TABLE IF NOT EXISTS hts_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default config
INSERT INTO hts_config (key, value) VALUES ('token_id', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO hts_config (key, value) VALUES ('token_name', 'ReceiptoVerse Points') ON CONFLICT (key) DO NOTHING;
INSERT INTO hts_config (key, value) VALUES ('token_symbol', 'RVP') ON CONFLICT (key) DO NOTHING;
INSERT INTO hts_config (key, value) VALUES ('sync_enabled', '0') ON CONFLICT (key) DO NOTHING;
