-- Phase 1: HCS Receipt Anchoring - Database Schema Updates
-- Add HCS-related fields to receipts table

-- PostgreSQL version
DO $$ 
BEGIN
  -- Add HCS topic ID
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'receipts' AND column_name = 'hcs_topic_id'
  ) THEN
    ALTER TABLE receipts ADD COLUMN hcs_topic_id VARCHAR(50);
  END IF;

  -- Add HCS sequence number
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'receipts' AND column_name = 'hcs_sequence'
  ) THEN
    ALTER TABLE receipts ADD COLUMN hcs_sequence BIGINT;
  END IF;

  -- Add HCS consensus timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'receipts' AND column_name = 'hcs_timestamp'
  ) THEN
    ALTER TABLE receipts ADD COLUMN hcs_timestamp VARCHAR(50);
  END IF;

  -- Add receipt hash
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'receipts' AND column_name = 'receipt_hash'
  ) THEN
    ALTER TABLE receipts ADD COLUMN receipt_hash VARCHAR(64);
  END IF;

  -- Add HCS transaction ID
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'receipts' AND column_name = 'hcs_transaction_id'
  ) THEN
    ALTER TABLE receipts ADD COLUMN hcs_transaction_id VARCHAR(100);
  END IF;

  -- Add anchored timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'receipts' AND column_name = 'hcs_anchored_at'
  ) THEN
    ALTER TABLE receipts ADD COLUMN hcs_anchored_at TIMESTAMP;
  END IF;
END $$;

-- Create index for HCS lookups
CREATE INDEX IF NOT EXISTS idx_receipts_hcs ON receipts(hcs_topic_id, hcs_sequence);
CREATE INDEX IF NOT EXISTS idx_receipts_hash ON receipts(receipt_hash);
CREATE INDEX IF NOT EXISTS idx_receipts_anchored ON receipts(hcs_anchored_at);

-- Create HCS events table for event logging
CREATE TABLE IF NOT EXISTS hcs_events (
  id UUID PRIMARY KEY,
  topic_id VARCHAR(50) NOT NULL,
  sequence_number BIGINT NOT NULL,
  consensus_timestamp VARCHAR(50) NOT NULL,
  message_type VARCHAR(50),
  message_data JSONB,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(topic_id, sequence_number)
);

CREATE INDEX IF NOT EXISTS idx_hcs_events_topic ON hcs_events(topic_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_hcs_events_processed ON hcs_events(processed, created_at);
CREATE INDEX IF NOT EXISTS idx_hcs_events_type ON hcs_events(message_type);

-- Create table for tracking HCS topics
CREATE TABLE IF NOT EXISTS hcs_topics (
  id UUID PRIMARY KEY,
  topic_id VARCHAR(50) UNIQUE NOT NULL,
  topic_memo TEXT,
  purpose VARCHAR(100),
  created_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_hcs_topics_purpose ON hcs_topics(purpose);

-- Add comments for documentation
COMMENT ON COLUMN receipts.hcs_topic_id IS 'Hedera Consensus Service topic ID where receipt is anchored';
COMMENT ON COLUMN receipts.hcs_sequence IS 'Message sequence number in HCS topic';
COMMENT ON COLUMN receipts.hcs_timestamp IS 'Consensus timestamp from HCS';
COMMENT ON COLUMN receipts.receipt_hash IS 'SHA-256 hash of receipt data for verification';
COMMENT ON COLUMN receipts.hcs_transaction_id IS 'Hedera transaction ID for HCS message submission';
COMMENT ON COLUMN receipts.hcs_anchored_at IS 'When receipt was anchored to HCS';

COMMENT ON TABLE hcs_events IS 'Log of all HCS messages received for processing';
COMMENT ON TABLE hcs_topics IS 'Registry of HCS topics used by the system';
