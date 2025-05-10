-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update users table to handle Clerk IDs
ALTER TABLE users
ADD COLUMN IF NOT EXISTS clerk_id TEXT,
ADD CONSTRAINT unique_clerk_id UNIQUE (clerk_id);

-- Update preferences JSON schema
ALTER TABLE users
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{
  "notifications_enabled": true,
  "prompt_time": "09:00",
  "timezone": "UTC",
  "prompt_categories": ["gratitude", "reflection", "learning"]
}'::jsonb;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Add RLS policies for better security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own journal entries"
  ON journal_entries
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries"
  ON journal_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
  ON journal_entries
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
  ON journal_entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger for journal entries
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 